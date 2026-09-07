"use client";
import {useEffect,useSyncExternalStore} from 'react';
import {api,durablePost,API_EVENT,invalidateApi,showApiError} from './apiClient';
import {currentIdentity,refreshIdentity} from './authClient';
import {PROFILE_EVENT} from './profile';
import type {ChatMessage,Thread,OfferStatus} from './messages';
import type {Listing} from './types';
interface Conversation {id:string;listingId:string;listingTitle:string;listingPriceCents:number;sellerId:string;buyerId:string;sellerName:string;sellerEmoji:string;buyerName:string;buyerEmoji:string;archived:boolean;muted:boolean;readSequence:string;unreadCount:number;updatedAt:string;}
interface Message {id:string;sequence:string;senderId:string;kind:ChatMessage['kind'];text:string;priceCents:number|null;createdAt:string;}
interface Offer {id:string;senderId:string;priceCents:number;status:OfferStatus;resolvedAt:string|null;}
let state:{threads:Thread[];blocks:{id:string;name:string;emoji:string}[];ready:boolean;error:string|null}={threads:[],blocks:[],ready:false,error:null};
const empty=state,listeners=new Set<()=>void>();
let loading:Promise<void>|null=null,identity:string|null=null,generation=0;
function emit(){listeners.forEach(fn=>fn());}
async function messagePages(id:string) {
  let after:string|null=null;const items:Message[]=[];
  do{const result:{items:Message[];nextCursor:string|null}=await api('/conversations/'+id+'/messages'+(after?'?after='+after:''));items.push(...result.items);after=result.nextCursor;}while(after);
  return items;
}
async function conversationPages(){const items:Conversation[]=[];let cursor:string|null=null;do{const result:{items:Conversation[];nextCursor:string|null}=await api('/conversations'+(cursor?'?cursor='+encodeURIComponent(cursor):''));items.push(...result.items);cursor=result.nextCursor;}while(cursor);return {items};}
async function load() {
  const user=await refreshIdentity(),currentGeneration=generation;
  if(!user){state={...empty,ready:true};emit();return;}
  const [conversations,blocks]=await Promise.all([conversationPages(),api<{items:typeof state.blocks}>('/blocks')]);
  const threads:Thread[]=[];
  // Limit fan-out to avoid exhausting the server pool on large inboxes.
  for(let start=0;start<conversations.items.length;start+=4) {
    const chunk=await Promise.all(conversations.items.slice(start,start+4).map(async c=> {
      const previous=state.threads.find(thread=>thread.id===c.id);
      if(previous?.updatedAt===c.updatedAt) return {...previous,sellerName:c.sellerName,buyerName:c.buyerName,sellerEmoji:c.sellerEmoji,buyerEmoji:c.buyerEmoji,archived:c.archived,muted:c.muted,readSequence:c.readSequence,unreadCount:c.unreadCount};
      const [messages,offers]=await Promise.all([messagePages(c.id),api<{items:Offer[]}>('/conversations/'+c.id+'/offers')]);
      const offer=offers.items.find(x=>x.status==='accepted')??offers.items.at(-1);
      return {id:c.id,listingId:c.listingId,listingTitle:c.listingTitle,listingPrice:c.listingPriceCents/100,sellerId:c.sellerId,buyerId:c.buyerId,sellerName:c.sellerName,sellerEmoji:c.sellerEmoji,buyerName:c.buyerName,buyerEmoji:c.buyerEmoji,updatedAt:c.updatedAt,archived:c.archived,muted:c.muted,readSequence:c.readSequence,unreadCount:c.unreadCount,offer:offer?{id:offer.id,senderId:offer.senderId,price:offer.priceCents/100,status:offer.status,resolvedAt:offer.resolvedAt??undefined}:undefined,messages:messages.map(m=>({id:m.id,sequence:m.sequence,at:m.createdAt,author:m.senderId===c.sellerId?'seller' as const:'buyer' as const,kind:m.kind,text:m.text,price:m.priceCents===null?undefined:m.priceCents/100}))};
    }));threads.push(...chunk);
  }
  if(currentGeneration===generation&&currentIdentity()?.id===user.id){state={threads,blocks:blocks.items,ready:true,error:null};emit();}
}
function refresh(){if(!loading)loading=load().catch(error=>{state={...state,ready:true,error:error instanceof Error?error.message:'Nachrichten konnten nicht geladen werden.'};emit();}).finally(()=>{loading=null;});return loading;}
function accountChanged(){const next=currentIdentity()?.id??null;if(identity===next)return;identity=next;generation++;state={...empty};emit();void(loading??Promise.resolve()).finally(()=>refresh());}
function changed(){void refresh();}
function visible(){if(document.visibilityState==='visible')void refresh();}
let subscribers=0,timer:ReturnType<typeof setInterval>|undefined;
const counterpart=(thread:Thread)=>thread.sellerId===currentIdentity()?.id?thread.buyerId:thread.sellerId;
async function mutate(path:string,method:string,body?:unknown){try{await api(path,{method,body});await refresh();invalidateApi();return true;}catch(error){showApiError(error);return false;}}
const actions={
  openThread:async(input:{listing:Listing;sellerEmoji:string;buyerName:string;buyerEmoji:string})=>{const result=await api<{id:string}>('/conversations',{method:'POST',body:{listingId:input.listing.id}});await refresh();return result;},
  send:async(threadId:string,message:Omit<ChatMessage,'id'|'at'>,offer?:Thread['offer'])=> {
    await durablePost('/conversations/'+threadId+(message.kind==='offer'?'/offers':'/messages'),message.kind==='offer'?{priceCents:Math.round((offer?.price??message.price??0)*100)}:{text:message.text},currentIdentity()?.id??'guest');
    await refresh();invalidateApi();
  },
  resolveOffer:async(threadId:string,status:OfferStatus,_author?:'buyer'|'seller')=>{void _author;const offer=state.threads.find(x=>x.id===threadId)?.offer;if(!offer?.id)return false;return mutate('/offers/'+offer.id,'PATCH',{status});},
  archiveThread:(id:string,archived:boolean)=>mutate('/conversations/'+id,'PATCH',{archived}),
  removeThread:(id:string)=>mutate('/conversations/'+id,'PATCH',{archived:true}),
  block:(id:string)=>mutate('/blocks/'+id,'PUT'),unblock:(id:string)=>mutate('/blocks/'+id,'DELETE'),
  mute:(id:string)=>mutate('/conversations/'+id,'PATCH',{muted:true}),unmute:(id:string)=>mutate('/conversations/'+id,'PATCH',{muted:false}),
  isBlocked:(id:string)=>state.blocks.some(x=>x.id===id),
  isMuted:(id:string)=>state.threads.some(x=>(x.id===id||counterpart(x)===id)&&x.muted),
  blockedName:(id:string)=>state.blocks.find(x=>x.id===id)?.name??'Profil',
};
export function useRemoteMessages(){
  const snapshot=useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn);},()=>state,()=>empty);
  useEffect(()=> {
    if(subscribers++===0){window.addEventListener(API_EVENT,changed);window.addEventListener(PROFILE_EVENT,accountChanged);window.addEventListener('focus',visible);document.addEventListener('visibilitychange',visible);timer=setInterval(visible,5000);}
    void refresh();
    return()=>{if(--subscribers===0){clearInterval(timer);window.removeEventListener(API_EVENT,changed);window.removeEventListener(PROFILE_EVENT,accountChanged);window.removeEventListener('focus',visible);document.removeEventListener('visibilitychange',visible);}};
  },[]);
  return {...actions,threads:snapshot.threads,blocked:snapshot.blocks.map(x=>x.id),muted:snapshot.threads.filter(x=>x.muted).map(x=>x.id),ready:snapshot.ready,error:snapshot.error};
}
