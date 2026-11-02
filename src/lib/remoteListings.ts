"use client";
import {useSyncExternalStore,useEffect} from 'react';
import {api,API_EVENT,invalidateApi} from './apiClient';
import {type ApiListing,listingFromApi,listingToApi} from './apiTypes';
import {currentIdentity,refreshIdentity} from './authClient';
import {LISTINGS_STORAGE_KEY,PROFILE_EVENT} from './profile';
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
function isLegacyListing(value: unknown): value is Listing {
  if (!value || typeof value !== "object") return false;
  const listing = value as Listing;
  return typeof listing.id === "string" && /^uf-[a-z0-9]{4,12}$/.test(listing.id) && typeof listing.modelId === "string" && typeof listing.categoryId === "string" && typeof listing.price === "number";
}
function parseListingList(raw: string | null) {
  if (!raw) return [] as Listing[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isLegacyListing) : [];
  } catch { return [] as Listing[]; }
}
function readLegacyListings() {
  if (typeof window === "undefined") return [] as Listing[];
  const rows = parseListingList(localStorage.getItem(LISTINGS_STORAGE_KEY));
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("used-fruit-account:")) continue;
    try {
      const bag = JSON.parse(localStorage.getItem(key) ?? "") as Record<string, unknown>;
      if (typeof bag[LISTINGS_STORAGE_KEY] === "string") rows.push(...parseListingList(bag[LISTINGS_STORAGE_KEY]));
    } catch { /* Ignore a broken account archive. */ }
  }
  const seen = new Set<string>();
  return rows.filter((listing) => seen.has(listing.id) ? false : (seen.add(listing.id), true));
}
const syncedLegacy = new Set<string>();
function syncLegacy(listings: Listing[]) {
  for (const listing of listings) {
    if (syncedLegacy.has(listing.id)) continue;
    syncedLegacy.add(listing.id);
    void api<ApiListing>("/listings", { method: "POST", body: { ...listingToApi(listing), id: listing.id }, key: "legacy-" + listing.id })
      .then(() => refresh())
      .catch(() => undefined);
  }
}
function refresh() {
  if(loading)return loading;
  const currentGeneration=generation;
  loading=(async()=> {
    try {
      const user=await refreshIdentity();
      const [all,own]=await Promise.all([pages('/listings'),user?pages('/me/listings'):Promise.resolve([])]);
      if(currentGeneration!==generation)return;
      const legacy=user?readLegacyListings().filter(item=>!own.some(mine=>mine.id===item.id)):[];
      const merged=[...own,...legacy];
      state={all:[...merged,...all.filter(item=>!merged.some(mine=>mine.id===item.id))],own:merged,ready:true,error:null};emit();
      if(legacy.length) syncLegacy(legacy);
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
