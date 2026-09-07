import { PLACES } from "@/data/locations";
import { database, transaction, type Transaction } from "./db";
import { ApiError, requireValue, string, uuid } from "./http";
import { assertContact, conversationAccess, idempotent, lockPeople } from "./access";
import { validateListing } from "./listingValidation";
import { getLocalSeedListing, listLocalSeedListings, localSeedAvailable } from "./localSeedListings";

const listingColumns = `l.id,l.number::text,l.seller_id AS "sellerId",l.title,l.category_id AS "categoryId",l.model_id AS "modelId",l.price_cents AS "priceCents",l.currency,l.specs,l.city,l.postal_code AS "postalCode",l.status,l.version,l.created_at AS "createdAt",l.updated_at AS "updatedAt",l.sold_at AS "soldAt",u.name AS "sellerName",u.emoji AS "sellerEmoji",u.created_at AS "sellerJoinedAt"`;
const publicSeller = `u.deleted_at IS NULL AND u.banned_at IS NULL`;
const notBlocked = `NOT EXISTS(SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=l.seller_id) OR (b.blocked_id=$1 AND b.blocker_id=l.seller_id))`;

export async function listListings(userId: string | null, query: URLSearchParams, own = false) {
  if (localSeedAvailable()) return listLocalSeedListings(query, own);
  const values: unknown[] = [userId];
  const where = [publicSeller, notBlocked, own ? "l.seller_id=$1 AND l.status<>'deleted'" : "l.status='public'"];
  const bind=(value:unknown)=>{values.push(value);return '$'+values.length;};
  function add(expression: string, value: unknown) { where.push(expression.replace('?',bind(value))); }
  if (query.get('categoryId')) add('l.category_id=?', string(query.get('categoryId'),20));
  if (query.get('modelId')) add('l.model_id=?', string(query.get('modelId'),100));
  if (query.get('q')) add('l.title ILIKE ?', '%'+string(query.get('q'),100).replace(/[%_\\]/g,'\\$&')+'%');
  for (const name of ['minPriceCents','maxPriceCents','minBatteryCapacity','maxBatteryCycles']) if(query.has(name)) {
    const value=Number(query.get(name));requireValue(Number.isInteger(value)&&value>=0&&value<=100000000,'Ungültiger Zahlenfilter.');
    const expressions:Record<string,string>={minPriceCents:'l.price_cents>=?',maxPriceCents:'l.price_cents<=?',minBatteryCapacity:"(l.specs->>'batteryMaxCapacityPercent')::int>=?",maxBatteryCycles:"(l.specs->>'batteryCycleCount')::int<=?"};
    add(expressions[name],value);
  }
  for(const name of ['chip','year','colorId','size','memory','storage','condition','shippingScope','connectivity','simLock','keyboardLayout']) {
    const selected=query.getAll(name);
    if(selected.length){requireValue(selected.length<=30&&selected.every(x=>x.length<=200),'Zu viele Filterwerte.');add(`l.specs->>'${name}'=ANY(?::text[])`,selected);}
  }
  for(const name of ['shipping','originalBox'])if(query.has(name)){
    requireValue(['yes','no'].includes(query.get(name)!),'Ungültiger Filter.');
    if(name==='shipping')add("l.specs->>'shippingScope'=?",query.get(name)==='yes'?'deutschland':'local');
    else add("l.specs->>'originalBox'=?",query.get(name)==='yes'?'true':'false');
  }
  if(query.has('warrantyOnly')){requireValue(['true','false'].includes(query.get('warrantyOnly')!),'Ungültiger Garantiefilter.');if(query.get('warrantyOnly')==='true')where.push("l.specs->>'appleWarrantyUntil'>=to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD')");}
  let distance='NULL::double precision',locationJoin='';
  const sort=query.get('sort')??'newest';requireValue(['newest','price-asc','price-desc','nearest'].includes(sort),'Ungültige Sortierung.');
  if(query.has('lat')||query.has('lng')||query.has('radiusKm')||sort==='nearest'){
    requireValue(query.has('lat')&&query.has('lng'),'Standort für Entfernung erforderlich.');
    const lat=Number(query.get('lat')),lng=Number(query.get('lng'));
    requireValue(Number.isFinite(lat)&&lat>=-90&&lat<=90&&Number.isFinite(lng)&&lng>=-180&&lng<=180,'Ungültiger Standort.');
    const points=Array.from(new Map(PLACES.map(p=>[p.postalCode,{postal:p.postalCode,lat:p.lat,lng:p.lng}])).values());
    locationJoin=` LEFT JOIN jsonb_to_recordset(${bind(JSON.stringify(points))}::jsonb) AS place(postal text,lat double precision,lng double precision) ON place.postal=l.postal_code`;
    const latitude=bind(lat),longitude=bind(lng);
    distance=`6371*2*asin(sqrt(LEAST(1.0,power(sin(radians(place.lat-${latitude})/2),2)+cos(radians(${latitude}))*cos(radians(place.lat))*power(sin(radians(place.lng-${longitude})/2),2))))`;
    if(query.has('radiusKm')){const radius=Number(query.get('radiusKm'));requireValue(Number.isFinite(radius)&&radius>0&&radius<=2000,'Ungültiger Umkreis.');where.push(`(${distance})<=${bind(radius)}`);}
    if(sort==='nearest')where.push('place.lat IS NOT NULL');
  }
  const sortColumn=sort==='newest'?'l.created_at':sort==='nearest'?`(${distance})`:'l.price_cents';
  const direction=sort==='newest'||sort==='price-desc'?'DESC':'ASC',operator=direction==='DESC'?'<':'>';
  if(query.has('cursor')){
    let parts:unknown;try{parts=JSON.parse(Buffer.from(query.get('cursor')!,'base64url').toString());}catch{throw new ApiError(400,'invalid_cursor','Ungültige Seite.');}
    requireValue(Array.isArray(parts)&&parts.length===3&&parts[0]===sort,'Ungültige Seite.');
    if(sort==='newest')requireValue(typeof parts[1]==='string'&&Number.isFinite(Date.parse(parts[1])),'Ungültige Seite.');
    else requireValue(typeof parts[1]==='number'&&Number.isFinite(parts[1]),'Ungültige Seite.');
    where.push(`(${sortColumn},l.id)${operator}(${bind(parts[1])}${sort==='newest'?'::timestamptz':''},${bind(uuid(parts[2]))}::uuid)`);
  }
  const limit=Number(query.get('limit')??50);requireValue(Number.isInteger(limit)&&limit>=1&&limit<=100,'Ungültige Seitengröße.');
  const result=await database().query(`SELECT ${listingColumns},${distance} AS "distanceKm" FROM listings l JOIN users u ON u.id=l.seller_id ${locationJoin} WHERE ${where.join(' AND ')} ORDER BY ${sortColumn} ${direction},l.id ${direction} LIMIT ${bind(limit+1)}`,values);
  const items=result.rows.slice(0,limit),last=items.at(-1);
  return {items,nextCursor:result.rows.length>limit&&last?Buffer.from(JSON.stringify([sort,sort==='newest'?last.createdAt:sort==='nearest'?last.distanceKm:last.priceCents,last.id])).toString('base64url'):null};
}
export async function getListing(id: string, userId: string | null) {
  if (localSeedAvailable()) return getLocalSeedListing(id);
  const result = await database().query(`SELECT ${listingColumns},CASE WHEN l.seller_id=$1 THEN l.private_specs END AS "privateSpecs" FROM listings l JOIN users u ON u.id=l.seller_id
    WHERE l.id=$2 AND ${publicSeller} AND ${notBlocked} AND (l.status='public' OR (l.seller_id=$1 AND l.status<>'deleted'))`,[userId,uuid(id)]);
  if (!result.rows[0]) throw new ApiError(404,"not_found","Inserat nicht gefunden.");
  return result.rows[0];
}
export async function createListing(userId: string, input: Record<string,unknown>, key: string | null) {
  const listing=validateListing(input);
  const result = await transaction(client=>idempotent(client,userId,"listing:create",key,input,async()=> {
    const account=(await client.query("SELECT onboarding_completed FROM users WHERE id=$1 AND banned_at IS NULL AND deleted_at IS NULL FOR UPDATE",[userId])).rows[0];
    if (!account?.onboarding_completed) throw new ApiError(409,"onboarding_required","Bitte vervollständige zuerst dein Konto.");
    return (await client.query(`INSERT INTO listings(seller_id,title,category_id,model_id,price_cents,specs,private_specs,city,postal_code)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,[userId,listing.title,listing.categoryId,listing.modelId,listing.priceCents,listing.specs,listing.privateSpecs,listing.city,listing.postalCode])).rows[0];
  }));
  return getListing(result.id,userId);
}
export async function updateListing(id: string, userId: string, input: Record<string,unknown>, remove=false) {
  await transaction(async client=> {
    const existing=(await client.query("SELECT * FROM listings WHERE id=$1 AND seller_id=$2 AND status<>'deleted' FOR UPDATE",[uuid(id),userId])).rows[0];
    if (!existing) throw new ApiError(404,"not_found","Inserat nicht gefunden.");
    if (remove) { await client.query("UPDATE listings SET status='deleted',version=version+1,updated_at=now() WHERE id=$1",[id]); return; }
    requireValue(Number.isInteger(input.version),"Versionsnummer erforderlich.");
    if (input.version!==existing.version) throw new ApiError(409,"version_conflict","Das Inserat wurde inzwischen geändert. Bitte lade es neu.");
    if (existing.status==='sold') throw new ApiError(409,"sold","Das Gerät wurde bereits verkauft.");
    const status=input.status ?? existing.status;
    requireValue(["public","reserved","inactive"].includes(String(status)),"Ungültiger Status.");
    const next=validateListing({categoryId:existing.category_id,modelId:existing.model_id,priceCents:existing.price_cents,city:existing.city,postalCode:existing.postal_code,specs:{...existing.specs,...existing.private_specs},...input});
    await client.query(`UPDATE listings SET title=$2,category_id=$3,model_id=$4,price_cents=$5,specs=$6,private_specs=$7,city=$8,postal_code=$9,status=$10,version=version+1,updated_at=now() WHERE id=$1`,[id,next.title,next.categoryId,next.modelId,next.priceCents,next.specs,next.privateSpecs,next.city,next.postalCode,status]);
  });
  return remove ? {ok:true} : getListing(id,userId);
}
export async function openConversation(userId: string, listingId: string) {
  return transaction(async client=> {
    const listing=(await client.query("SELECT * FROM listings WHERE id=$1 AND status='public'",[uuid(listingId)])).rows[0];
    if (!listing) throw new ApiError(404,"not_found","Inserat nicht gefunden.");
    requireValue(listing.seller_id!==userId,"Du kannst dein eigenes Inserat nicht kontaktieren.");
    await lockPeople(client,[listing.seller_id,userId]); await assertContact(client,listing.seller_id,userId);
    const conversation=(await client.query(`INSERT INTO conversations(listing_id,buyer_id,seller_id) VALUES($1,$2,$3)
      ON CONFLICT(listing_id,buyer_id) DO UPDATE SET listing_id=EXCLUDED.listing_id RETURNING *`,[listingId,userId,listing.seller_id])).rows[0];
    await client.query("INSERT INTO conversation_participants(conversation_id,user_id) VALUES($1,$2),($1,$3) ON CONFLICT DO NOTHING",[conversation.id,userId,listing.seller_id]);
    await client.query("UPDATE conversation_participants SET archived=false WHERE conversation_id=$1 AND user_id=$2",[conversation.id,userId]);
    return {id:conversation.id};
  });
}
export async function listConversations(userId: string, cursor: string | null = null) {
  let at: string | null = null, lastId: string | null = null;
  if(cursor){let parts:unknown;try{parts=JSON.parse(Buffer.from(cursor,'base64url').toString());}catch{throw new ApiError(400,'invalid_cursor','Ungültige Seite.');}requireValue(Array.isArray(parts)&&parts.length===2&&typeof parts[0]==='string'&&Number.isFinite(Date.parse(parts[0])),'Ungültige Seite.');at=parts[0];lastId=uuid(parts[1]);}
  const result=await database().query(`SELECT c.id,c.listing_id AS "listingId",c.buyer_id AS "buyerId",c.seller_id AS "sellerId",l.title AS "listingTitle",l.price_cents AS "listingPriceCents",b.name AS "buyerName",b.emoji AS "buyerEmoji",s.name AS "sellerName",s.emoji AS "sellerEmoji",p.archived,p.muted,p.read_sequence::text AS "readSequence",c.updated_at AS "updatedAt",
    (SELECT count(*)::int FROM messages m WHERE m.conversation_id=c.id AND m.sender_id<>$1 AND NOT EXISTS(SELECT 1 FROM message_reads mr WHERE mr.message_id=m.id AND mr.user_id=$1)) AS "unreadCount",
    (SELECT row_to_json(last_message) FROM (SELECT id,text,kind,created_at AS "createdAt" FROM messages WHERE conversation_id=c.id ORDER BY sequence DESC LIMIT 1) last_message) AS "lastMessage"
    FROM conversation_participants p JOIN conversations c ON c.id=p.conversation_id JOIN listings l ON l.id=c.listing_id JOIN users b ON b.id=c.buyer_id JOIN users s ON s.id=c.seller_id
    WHERE p.user_id=$1 AND b.banned_at IS NULL AND s.banned_at IS NULL
    AND NOT EXISTS(SELECT 1 FROM user_blocks ub WHERE (ub.blocker_id=c.buyer_id AND ub.blocked_id=c.seller_id) OR (ub.blocker_id=c.seller_id AND ub.blocked_id=c.buyer_id))
    AND ($2::timestamptz IS NULL OR (c.updated_at,c.id)<($2::timestamptz,$3::uuid))
    ORDER BY c.updated_at DESC,c.id DESC LIMIT 51`,[userId,at,lastId]);
  const items=result.rows.slice(0,50),last=items.at(-1);
  return {items,nextCursor:result.rows.length>50&&last?Buffer.from(JSON.stringify([last.updatedAt,last.id])).toString('base64url'):null};
}
export async function listMessages(userId: string,id: string, after: string | null) {
  if (after) requireValue(/^\d{1,19}$/.test(after),"Ungültiger Lesestand.");
  return transaction(async client=> {
    await conversationAccess(client,uuid(id),userId,true);
    const result=await client.query(`SELECT id,sequence::text,conversation_id AS "conversationId",sender_id AS "senderId",kind,text,price_cents AS "priceCents",created_at AS "createdAt"
      FROM messages WHERE conversation_id=$1 AND sequence>$2 ORDER BY sequence LIMIT 100`,[id,after||'0']);
    return {items:result.rows,nextCursor:result.rows.length===100?result.rows.at(-1).sequence:null};
  });
}
export async function appendMessage(client: Transaction, conversation: {id:string;buyer_id:string;seller_id:string}, userId: string, text: string, kind: string, price: number | null=null) {
  const result=(await client.query(`INSERT INTO messages(conversation_id,sender_id,kind,text,price_cents) VALUES($1,$2,$3,$4,$5)
    RETURNING id,sequence::text,conversation_id AS "conversationId",sender_id AS "senderId",kind,text,price_cents AS "priceCents",created_at AS "createdAt"`,[conversation.id,userId,kind,text,price])).rows[0];
  const recipient=conversation.buyer_id===userId?conversation.seller_id:conversation.buyer_id;
  await client.query("UPDATE conversations SET updated_at=now() WHERE id=$1",[conversation.id]);
  await client.query("UPDATE conversation_participants SET archived=false WHERE conversation_id=$1",[conversation.id]);
  await client.query(`INSERT INTO notification_outbox(message_id,recipient_id,channel,due_at) VALUES($1,$2,'push',now()),($1,$2,'email',now()+interval '120 seconds')`,[result.id,recipient]);
  return result;
}
export async function sendMessage(userId: string,id: string,input: Record<string,unknown>,key: string|null) {
  const text=string(input.text,4000);
  return transaction(async client=> {
    const conversation=await conversationAccess(client,uuid(id),userId);
    return idempotent(client,userId,'message:'+id,key,input,()=>appendMessage(client,conversation,userId,text,'text'));
  });
}
export async function updateConversation(userId: string,id: string,input: Record<string,unknown>) {
  return transaction(async client=> {
    await conversationAccess(client,uuid(id),userId,true);
    for (const key of ['archived','muted','active']) if (key in input) requireValue(typeof input[key]==='boolean','Ungültige Einstellung.');
    const sequences=Array.from(new Set([...(input.readSequence!==undefined?[input.readSequence]:[]),...(Array.isArray(input.readSequences)?input.readSequences:[])]));
    if(input.readSequences!==undefined)requireValue(Array.isArray(input.readSequences)&&input.readSequences.length<=100,'Ungültige Lesestände.');
    requireValue(sequences.every(value=>typeof value==='string'&&/^\d{1,19}$/.test(value)),'Ungültiger Lesestand.');
    const displayed=sequences.filter(value=>value!=='0');
    if(displayed.length){
      const found=await client.query('SELECT id FROM messages WHERE conversation_id=$1 AND sequence=ANY($2::bigint[])',[id,displayed]);
      requireValue(found.rowCount===displayed.length,'Nachricht nicht gefunden.');
      await client.query('INSERT INTO message_reads(message_id,user_id) SELECT id,$2 FROM messages WHERE conversation_id=$1 AND sequence=ANY($3::bigint[]) ON CONFLICT DO NOTHING',[id,userId,displayed]);
    }
    const highest=sequences.reduce<string>((max,value)=>BigInt(String(value))>BigInt(max)?String(value):max,'0');
    await client.query(`UPDATE conversation_participants SET archived=COALESCE($3,archived),muted=COALESCE($4,muted),read_sequence=GREATEST(read_sequence,COALESCE($5::bigint,read_sequence)),active_until=CASE WHEN $6::boolean IS NULL THEN active_until WHEN $6 THEN now()+interval '15 seconds' ELSE NULL END WHERE conversation_id=$1 AND user_id=$2`,[id,userId,input.archived??null,input.muted??null,highest,input.active??null]);
    return {ok:true};
  });
}
export async function setBlock(userId: string,target: string,blocked: boolean) {
  uuid(target); requireValue(userId!==target,"Du kannst dich nicht selbst blockieren.");
  return transaction(async client=> {
    await lockPeople(client,[userId,target]);
    if (blocked) {
      const found=(await client.query("SELECT 1 FROM users WHERE id=$1 AND deleted_at IS NULL",[target])).rowCount;
      if (!found) throw new ApiError(404,"not_found","Profil nicht gefunden.");
      await client.query("INSERT INTO user_blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[userId,target]);
      await client.query(`UPDATE notification_outbox o SET state='cancelled' FROM messages m JOIN conversations c ON c.id=m.conversation_id
        WHERE o.message_id=m.id AND o.state='pending' AND ((c.buyer_id=$1 AND c.seller_id=$2) OR (c.buyer_id=$2 AND c.seller_id=$1))`,[userId,target]);
    } else await client.query("DELETE FROM user_blocks WHERE blocker_id=$1 AND blocked_id=$2",[userId,target]);
    return {ok:true};
  });
}
