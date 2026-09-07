"use client";
import {useSyncExternalStore,useEffect} from 'react';
import {api,API_EVENT,invalidateApi} from './apiClient';
import {type ApiListing,listingFromApi,listingToApi} from './apiTypes';
import {currentIdentity,refreshIdentity} from './authClient';
import {PROFILE_EVENT} from './profile';
import type {Listing} from './types';
let state:{all:Listing[];own:Listing[];ready:boolean;error:string|null}={all:[],own:[],ready:false,error:null};
const empty=state,listeners=new Set<()=>void>();
let loading:Promise<void>|null=null,generation=0;
const emit=()=>listeners.forEach(listener=>listener());
async function pages(path:string) {
  const rows:ApiListing[]=[];let cursor:string|null=null;
  do { const result: {items:ApiListing[];nextCursor:string|null}=await api(path+(cursor?'?cursor='+encodeURIComponent(cursor):''));rows.push(...result.items);cursor=result.nextCursor; }while(cursor);
  return rows.map(listingFromApi);
}
function refresh() {
  if(loading)return loading;
  const currentGeneration=generation;
  loading=(async()=> {
    try {
      const user=await refreshIdentity();
      const [all,own]=await Promise.all([pages('/listings'),user?pages('/me/listings'):Promise.resolve([])]);
      if(currentGeneration!==generation)return;
      state={all:[...own,...all.filter(item=>!own.some(mine=>mine.id===item.id))],own,ready:true,error:null};emit();
    }catch(error){if(currentGeneration===generation){state={...state,ready:true,error:error instanceof Error?error.message:'Inserate konnten nicht geladen werden.'};emit();}}
  })().finally(()=>{loading=null;});
  return loading;
}
let subscribers=0;
function subscribe(listener:()=>void) {listeners.add(listener);return()=>listeners.delete(listener);}
let identity:string|null=null;
function accountChanged() {
  const next=currentIdentity()?.id??null;
  if(next===identity)return;
  identity=next;generation++;state={...empty};emit();
  void (loading??Promise.resolve()).finally(()=>refresh());
}
function changed(){void refresh();}
const actions={
    addListing:async(listing:Listing,key?:string)=>{const saved=listingFromApi(await api<ApiListing>('/listings',{method:'POST',body:listingToApi(listing),key:key??crypto.randomUUID()}));await refresh();invalidateApi();return saved;},
    updateListing:async(id:string,patch:Partial<Listing>)=>{const existing=state.own.find(x=>x.id===id);if(!existing)throw new Error('Eigenes Inserat nicht gefunden.');const next={...existing,...patch};const saved=listingFromApi(await api<ApiListing>('/listings/'+id,{method:'PATCH',body:{...listingToApi(next),version:existing.version,status:next.visibility??'public'}}));await refresh();invalidateApi();return saved;},
    removeListing:async(id:string)=>{await api('/listings/'+id,{method:'DELETE'});await refresh();invalidateApi();},
    renameSeller:()=>{void refresh();},clearUserListings:()=>{void refresh();}};

export function useRemoteListings() {
  const snapshot=useSyncExternalStore(subscribe,()=>state,()=>empty);
  useEffect(()=> {
    if(subscribers++===0){window.addEventListener(API_EVENT,changed);window.addEventListener(PROFILE_EVENT,accountChanged);window.addEventListener('focus',changed);}
    void refresh();
    return()=>{if(--subscribers===0){window.removeEventListener(API_EVENT,changed);window.removeEventListener(PROFILE_EVENT,accountChanged);window.removeEventListener('focus',changed);}};
  },[]);
  return {listings:snapshot.all.filter(x=>!x.soldAt&&(!x.visibility||x.visibility==='public')),allListings:snapshot.all,userListings:snapshot.own,ready:snapshot.ready,error:snapshot.error,
    getListing:(id:string)=>snapshot.all.find(x=>x.id===id),
    ...actions};
}
