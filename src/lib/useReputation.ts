"use client";

import { pendingRatingsFor, type Rating, type PersonReputation, type RatingSentiment } from "./reputation";
import { api, API_EVENT, invalidateApi, showApiError } from "./apiClient";
import { currentIdentity, refreshIdentity } from "./authClient";
import { PROFILE_EVENT } from "./profile";
import { useMessages } from "./useMessages";
import type { Thread } from "./messages";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useReputation(userId?: string) {
  const {threads,ready:messagesReady}=useMessages();
  const [ratings,setRatings]=useState<Rating[]>([]);
  const [snapshot,setSnapshot]=useState<PersonReputation>();
  const [ready,setReady]=useState(false);
  useEffect(()=> {
    let active=true,generation=0,account=currentIdentity()?.id??null;
    const refresh=async()=> {
      const request=++generation;
      try {
        const user=await refreshIdentity();
        const [profile,own]=await Promise.all([userId?api<{reputation:PersonReputation}>("/users/"+userId):Promise.resolve(undefined),user?api<{items:Rating[]}>("/me/ratings"):Promise.resolve({items:[]})]);
        if(active&&request===generation&&currentIdentity()?.id===user?.id){setSnapshot(profile?.reputation);setRatings(own.items);}
      }catch{if(active&&request===generation){setSnapshot(undefined);setRatings([]);}}
      finally{if(active&&request===generation)setReady(true);}
    };
    const changed=()=>{const next=currentIdentity()?.id??null;if(next===account)return;account=next;generation++;setRatings([]);setSnapshot(undefined);setReady(false);queueMicrotask(()=>void refresh());};
    void refresh();window.addEventListener(API_EVENT,refresh);window.addEventListener(PROFILE_EVENT,changed);
    return()=>{active=false;window.removeEventListener(API_EVENT,refresh);window.removeEventListener(PROFILE_EVENT,changed);};
  },[userId]);
  const pending=useMemo(()=>pendingRatingsFor(currentIdentity()?.id??"",threads,ratings),[threads,ratings]);
  const rate=useCallback(async(thread:Thread,_from:string,sentiment:RatingSentiment)=> {
    try{if(!thread.offer?.id)throw new Error("Bestätigter Abschluss fehlt.");await api("/ratings",{method:"POST",body:{offerId:thread.offer.id,score:sentiment==='positive'?5:1}});invalidateApi();return true;}
    catch(error){showApiError(error);return false;}
  },[]);
  return {snapshot,pending,ratings,rate,ready:ready&&messagesReady};
}
