import {verify,X509Certificate} from 'node:crypto';
import {transaction} from './db';
import {ApiError,requireValue} from './http';

const certificates=new Map<string,{pem:string;expires:number}>();
export async function sesFeedback(input:Record<string,unknown>) {
  const topic=process.env.SES_FEEDBACK_TOPIC_ARN;
  if(!topic)throw new ApiError(503,'configuration','Rückmeldungen sind noch nicht eingerichtet.');
  requireValue(input.TopicArn===topic,'Unbekanntes Thema.');
  const region=topic.split(':')[3],host=`sns.${region}.amazonaws.com`;
  requireValue(typeof input.SigningCertURL==='string'&&typeof input.Signature==='string','Signatur fehlt.');
  const certificateUrl=new URL(input.SigningCertURL);
  requireValue(certificateUrl.protocol==='https:'&&certificateUrl.hostname===host&&!certificateUrl.port&&!certificateUrl.username&&!certificateUrl.password&&!certificateUrl.search&&/^\/SimpleNotificationService-[a-f0-9]+\.pem$/.test(certificateUrl.pathname),'Ungültiges Zertifikat.');
  requireValue(input.SignatureVersion==='1'||input.SignatureVersion==='2','Ungültige Signaturversion.');
  const fields=input.Type==='Notification'?['Message','MessageId',...('Subject' in input?['Subject']:[]),'Timestamp','TopicArn','Type']:['Message','MessageId','SubscribeURL','Timestamp','Token','TopicArn','Type'];
  requireValue(['Notification','SubscriptionConfirmation','UnsubscribeConfirmation'].includes(String(input.Type))&&fields.every(key=>typeof input[key]==='string'),'Ungültige Rückmeldung.');
  const stamp=Date.parse(String(input.Timestamp));requireValue(Number.isFinite(stamp)&&stamp<Date.now()+300000&&stamp>Date.now()-7*86400000,'Rückmeldung abgelaufen.');
  let cached=certificates.get(certificateUrl.href);
  if(!cached||cached.expires<Date.now()) {
    const response=await fetch(certificateUrl,{redirect:'error',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new ApiError(503,'certificate_unavailable','Zertifikat nicht verfügbar.');
    const pem=await response.text();requireValue(pem.length<16384,'Ungültiges Zertifikat.');
    const certificate=new X509Certificate(pem);requireValue(Date.parse(certificate.validFrom)<=Date.now()&&Date.parse(certificate.validTo)>Date.now(),'Zertifikat abgelaufen.');
    cached={pem,expires:Math.min(Date.now()+3600000,Date.parse(certificate.validTo))};if(certificates.size>10)certificates.clear();certificates.set(certificateUrl.href,cached);
  }
  const canonical=fields.map(key=>key+'\n'+input[key]).join('\n'),signature=Buffer.from(input.Signature,'base64'),algorithm=input.SignatureVersion==='2'?'RSA-SHA256':'RSA-SHA1';
  // AWS SDK serializations include a final newline; HTTP query examples omit it.
  requireValue(verify(algorithm,Buffer.from(canonical+'\n'),cached.pem,signature)||verify(algorithm,Buffer.from(canonical),cached.pem,signature),'Ungültige Signatur.');
  if(input.Type==='SubscriptionConfirmation') {
    const url=new URL(String(input.SubscribeURL));requireValue(url.protocol==='https:'&&url.hostname===host&&!url.port&&!url.username&&!url.password&&url.searchParams.get('Action')==='ConfirmSubscription'&&url.searchParams.get('TopicArn')===topic,'Ungültige Bestätigung.');
    const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(10000)});if(!response.ok)throw new ApiError(503,'confirmation_failed','Bestätigung fehlgeschlagen.');return {ok:true};
  }
  if(input.Type!=='Notification')return {ok:true};
  let event:Record<string,unknown>;try{event=JSON.parse(String(input.Message));}catch{throw new ApiError(400,'invalid_event','Ungültige Rückmeldung.');}
  const mail=event.mail as {source?:string;messageId?:string}|undefined;
  requireValue(mail?.source?.toLowerCase()==='noreply@usedfruit.de','Unbekannter Absender.');
  const type=event.notificationType??event.eventType;
  if(type!=='Bounce'&&type!=='Complaint')return {ok:true};
  const detail=(type==='Bounce'?event.bounce:event.complaint) as {bounceType?:string;bouncedRecipients?:{emailAddress:string}[];complainedRecipients?:{emailAddress:string}[]};
  if(type==='Bounce'&&detail.bounceType!=='Permanent')return {ok:true};
  const recipients=(detail.bouncedRecipients??detail.complainedRecipients??[]).map(row=>row.emailAddress.toLowerCase());
  await transaction(async client=> {
    const fresh=await client.query("INSERT INTO provider_events(provider,event_id) VALUES('ses',$1) ON CONFLICT DO NOTHING RETURNING event_id",[input.MessageId]);if(!fresh.rowCount)return;
    await client.query('UPDATE users SET email_suppressed=true WHERE lower(email)=ANY($1::text[])',[recipients]);
    await client.query("UPDATE notification_outbox SET state='cancelled',last_error_code=$2 WHERE channel='email' AND state='pending' AND recipient_id IN (SELECT id FROM users WHERE lower(email)=ANY($1::text[]))",[recipients,String(type).toLowerCase()]);
  });
  return {ok:true};
}
