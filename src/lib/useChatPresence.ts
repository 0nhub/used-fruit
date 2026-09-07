"use client";
import {useEffect} from 'react';
import {api} from './apiClient';
export function useChatPresence(conversationId:string|undefined,messageVersion:string|undefined) {
  useEffect(()=> {
    if(!conversationId)return;
    const visible=new Set<Element>();let disposed=false;
    const update=()=> {
      if(disposed)return;
      const active=document.visibilityState==='visible'&&document.hasFocus();
      const readSequences=active?Array.from(visible).map(node=>(node as HTMLElement).dataset.messageSequence).filter((value):value is string=>Boolean(value)).slice(0,100):[];
      void api('/conversations/'+conversationId,{method:'PATCH',body:{active,readSequences}}).catch(()=>{});
    };
    const observer=new IntersectionObserver(entries=> {
      for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=0.6)visible.add(entry.target);else visible.delete(entry.target);}
      update();
    },{threshold:0.6});
    document.querySelectorAll('[data-message-sequence]').forEach(node=>observer.observe(node));
    update();const timer=setInterval(update,5000);
    document.addEventListener('visibilitychange',update);window.addEventListener('focus',update);window.addEventListener('blur',update);
    return()=>{disposed=true;clearInterval(timer);observer.disconnect();document.removeEventListener('visibilitychange',update);window.removeEventListener('focus',update);window.removeEventListener('blur',update);void api('/conversations/'+conversationId,{method:'PATCH',body:{active:false}}).catch(()=>{});};
  },[conversationId,messageVersion]);
}
