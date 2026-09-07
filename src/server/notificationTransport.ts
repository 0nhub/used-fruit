import nodemailer from 'nodemailer';
import { connect } from 'node:http2';
import { createPrivateKey, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';

export class DeliveryError extends Error {
  constructor(public code: string,public retryable=false,public uncertain=false,public invalidDevice=false) { super(code); }
}
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
export function notificationEmail(data:{sender:string;title:string;text:string;conversationId:string}) {
  const origin=process.env.USED_FRUIT_ORIGIN||'https://usedfruit.de';
  const next='/nachrichten?conversation='+encodeURIComponent(data.conversationId);
  const url=origin+'/anmelden?next='+encodeURIComponent(next);
  const preview=data.text.slice(0,500),sender=data.sender.slice(0,40),title=data.title.slice(0,200);
  return {subject:`Neue Nachricht von ${sender.replace(/[\r\n]/g,' ')}`,
    text:`${sender} hat dir zu „${title}“ geschrieben:\n\n${preview}\n\nNachricht öffnen und antworten: ${url}\n\nBitte antworte direkt bei Used Fruit. E-Mail-Benachrichtigungen kannst du in deinem Konto deaktivieren.`,
    html:`<!doctype html><html lang="de"><body style="font-family:Arial,sans-serif;color:#222;line-height:1.5"><main style="max-width:560px;margin:auto;padding:24px"><h1 style="font-size:24px">Used Fruit</h1><p><strong>${escapeHtml(sender)}</strong> hat dir zu „${escapeHtml(title)}“ geschrieben:</p><p style="white-space:pre-wrap">${escapeHtml(preview)}</p><p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;background:#222;color:#fff;text-decoration:none;border-radius:24px">Nachricht öffnen</a></p><p>Bitte antworte direkt bei Used Fruit.</p><p style="font-size:12px">E-Mail-Benachrichtigungen kannst du in deinem Konto deaktivieren.</p></main></body></html>`};
}
export async function sendEmail(recipient:string,id:string,data:Parameters<typeof notificationEmail>[0]) {
  const host=process.env.SES_SMTP_HOST,user=process.env.SES_SMTP_USERNAME,pass=process.env.SES_SMTP_PASSWORD;
  if (!host||!user||!pass) throw new DeliveryError('ses_configuration');
  if (!/^email-smtp\.[a-z0-9-]+\.amazonaws\.com$/.test(host)) throw new DeliveryError('ses_host');
  const smtp=nodemailer.createTransport({host,port:587,secure:false,requireTLS:true,auth:{user,pass},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:10000,tls:{minVersion:'TLSv1.2',rejectUnauthorized:true}});
  try {
    const sent=await smtp.sendMail({from:'Used Fruit <noreply@usedfruit.de>',to:recipient,messageId:`<${id}@usedfruit.de>`,...notificationEmail(data)});
    if (!sent.accepted?.length) throw new DeliveryError('ses_rejected');
    return String(sent.response?.match(/\bOk\s+([^\s]+)/i)?.[1] ?? sent.messageId);
  } catch (error) {
    if (error instanceof DeliveryError) throw error;
    const e=error as {code?:string;responseCode?:number;command?:string};
    if (e.responseCode) throw new DeliveryError('smtp_'+e.responseCode,e.responseCode>=400&&e.responseCode<500);
    // A dropped connection during DATA may already have delivered; do not blindly retry.
    const safe=e.command==='CONN'||e.command==='AUTH'||e.code==='EDNS';
    throw new DeliveryError('smtp_'+(e.code??'unknown'),safe,!safe);
  } finally { smtp.close(); }
}
let providerToken:{value:string;expires:number}|undefined;
function apnsAuthorization() {
  if (providerToken&&providerToken.expires>Date.now()) return providerToken.value;
  const kid=process.env.APNS_KEY_ID,team=process.env.APPLE_TEAM_ID,keyPath=process.env.APNS_PRIVATE_KEY_PATH;
  if (!kid||!team||!keyPath) throw new DeliveryError('apns_configuration');
  const header=Buffer.from(JSON.stringify({alg:'ES256',kid})).toString('base64url');
  const payload=Buffer.from(JSON.stringify({iss:team,iat:Math.floor(Date.now()/1000)})).toString('base64url');
  const unsigned=header+'.'+payload;
  const value=unsigned+'.'+sign('sha256',Buffer.from(unsigned),{key:createPrivateKey(readFileSync(keyPath)),dsaEncoding:'ieee-p1363'}).toString('base64url');
  providerToken={value,expires:Date.now()+45*60*1000}; return value;
}
export async function sendPush(device:{token:string;environment:string},id:string,data:Parameters<typeof notificationEmail>[0]) {
  const authorization=apnsAuthorization(),topic=process.env.APPLE_NATIVE_CLIENT_ID;
  if (!topic) throw new DeliveryError('apns_configuration');
  const endpoint=device.environment==='sandbox'?'https://api.sandbox.push.apple.com':'https://api.push.apple.com';
  return new Promise<string>((resolve,reject)=> {
    let settled=false,submitted=false;
    const session=connect(endpoint);
    const finish=(error?:Error)=> { if (settled)return; settled=true; clearTimeout(timer);session.close();if(error)reject(error);else resolve(id); };
    const timer=setTimeout(()=> { finish(new DeliveryError('apns_timeout',!submitted,submitted));session.destroy(); },10000);
    session.on('error',()=>finish(new DeliveryError('apns_connection',!submitted,submitted)));
    session.on('connect',()=> {
      const request=session.request({':method':'POST',':path':'/3/device/'+device.token,authorization:'bearer '+authorization,'apns-topic':topic,'apns-push-type':'alert','apns-priority':'10','apns-id':id,'apns-expiration':String(Math.floor(Date.now()/1000)+3600)});
      let status=0,response='';
      request.on('response',headers=>{status=Number(headers[':status']);});
      request.on('data',chunk=>{if(response.length<4096)response+=chunk.toString();});
      request.on('error',()=>finish(new DeliveryError('apns_stream',false,true)));
      request.on('end',()=> {
        if(status===200)return finish();
        let reason='unknown';try{reason=JSON.parse(response).reason;}catch{}
        finish(new DeliveryError('apns_'+String(reason).slice(0,80),status===429||status>=500,false,status===410||reason==='BadDeviceToken'||reason==='DeviceTokenNotForTopic'));
      });
      submitted=true;
      request.end(JSON.stringify({aps:{alert:{title:data.sender,body:data.text.slice(0,160)},sound:'default','thread-id':data.conversationId},conversationId:data.conversationId}));
    });
  });
}
