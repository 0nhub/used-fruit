"use client";
export class ClientApiError extends Error {
  constructor(message:string,public status:number,public code:string){super(message);}
}
export async function api<T>(path:string,options:{method?:string;body?:unknown;key?:string;signal?:AbortSignal}={}):Promise<T> {
  const response=await fetch('/api/v1'+path,{method:options.method??'GET',credentials:'same-origin',cache:'no-store',signal:options.signal,headers:{...(options.body!==undefined?{'Content-Type':'application/json'}:{}),...(options.key?{'Idempotency-Key':options.key}:{})},body:options.body!==undefined?JSON.stringify(options.body):undefined});
  const data=await response.json();
  if(!response.ok)throw new ClientApiError(data.error?.message??'Das hat nicht geklappt. Bitte versuche es erneut.',response.status,data.error?.code??'request_failed');
  return data as T;
}
export function showApiError(error:unknown){window.alert(error instanceof Error?error.message:'Die Änderung konnte nicht gespeichert werden.');}
export const API_EVENT='used-fruit-api-change';
export function invalidateApi(){window.dispatchEvent(new Event(API_EVENT));}

/** Retain an uncertain send's key for a manual retry; a successful send permits a new identical message. */
export async function durablePost<T>(path:string,body:unknown,accountId:string):Promise<T> {
  const signature=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(body))))).map(byte=>byte.toString(16).padStart(2,'0')).join('');
  const storageKey='used-fruit-request:'+accountId+':'+path+':'+signature;
  const key=sessionStorage.getItem(storageKey)??crypto.randomUUID();sessionStorage.setItem(storageKey,key);
  const result=await api<T>(path,{method:'POST',body,key});sessionStorage.removeItem(storageKey);return result;
}
