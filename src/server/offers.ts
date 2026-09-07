import { transaction, database } from "./db";
import { conversationAccess, idempotent } from "./access";
import { appendMessage } from "./marketplace";
import { ApiError, requireValue, uuid } from "./http";

export async function listOffers(userId: string, conversationId: string) {
  return transaction(async client => {
    await conversationAccess(client, uuid(conversationId), userId, true);
    return { items: (await client.query(`SELECT id,sender_id AS "senderId",price_cents AS "priceCents",status,created_at AS "createdAt",resolved_at AS "resolvedAt" FROM offers WHERE conversation_id=$1 ORDER BY created_at`, [conversationId])).rows };
  });
}
export async function createOffer(userId: string, conversationId: string, input: Record<string, unknown>, key: string | null) {
  requireValue(Number.isInteger(input.priceCents) && Number(input.priceCents)>0 && Number(input.priceCents)<=100000000, "Ungültiger Kaufpreis.");
  return transaction(async client => {
    const conversation = await conversationAccess(client, uuid(conversationId), userId);
    return idempotent(client,userId,"offer:"+conversationId,key,input,async () => {
      const listing=(await client.query("SELECT status,price_cents,seller_id FROM listings WHERE id=$1 FOR UPDATE",[conversation.listing_id])).rows[0];
      if (!listing || !['public','reserved'].includes(listing.status)) throw new ApiError(409,"unavailable","Das Gerät ist nicht mehr verfügbar.");
      if (listing.seller_id === userId) throw new ApiError(403,"forbidden","Du kannst dein eigenes Inserat nicht kaufen.");
      if (Number(input.priceCents) !== Number(listing.price_cents)) throw new ApiError(409,"price_changed","Es gilt ausschließlich der aktuelle Inseratspreis. Bitte lade das Inserat erneut.");
      const offer=(await client.query(`INSERT INTO offers(conversation_id,listing_id,sender_id,price_cents) VALUES($1,$2,$3,$4) RETURNING id,status,price_cents AS "priceCents"`,[conversationId,conversation.listing_id,userId,input.priceCents])).rows[0];
      await appendMessage(client,conversation,userId,"Kaufen","offer",Number(listing.price_cents));
      return offer;
    });
  });
}
export async function resolveOffer(userId: string,id: string,input: Record<string,unknown>) {
  requireValue(input.status==='accepted' || input.status==='declined',"Ungültige Entscheidung.");
  // Discover the conversation without returning any data before participant authorization.
  const lookup=(await database().query("SELECT conversation_id FROM offers WHERE id=$1",[uuid(id)])).rows[0];
  if (!lookup) throw new ApiError(404,"not_found","Angebot nicht gefunden.");
  return transaction(async client => {
    const conversation=await conversationAccess(client,lookup.conversation_id,userId);
    // All offer operations lock people, then the listing, then the offer in that order.
    const listing=(await client.query("SELECT * FROM listings WHERE id=$1 FOR UPDATE",[conversation.listing_id])).rows[0];
    const offer=(await client.query("SELECT * FROM offers WHERE id=$1 FOR UPDATE",[id])).rows[0];
    if (offer.sender_id===userId) throw new ApiError(403,"forbidden","Du kannst dein eigenes Angebot nicht annehmen.");
    if (offer.status===input.status) return {id,status:offer.status};
    if (offer.status!=='pending' || !['public','reserved'].includes(listing.status)) throw new ApiError(409,"offer_resolved","Das Angebot ist nicht mehr verfügbar.");
    await client.query("UPDATE offers SET status=$2,resolved_at=now() WHERE id=$1",[id,input.status]);
    if (input.status==='accepted') {
      await client.query("UPDATE listings SET status='sold',sold_at=now(),updated_at=now(),version=version+1 WHERE id=$1",[listing.id]);
      await client.query("UPDATE offers SET status='declined',resolved_at=now() WHERE listing_id=$1 AND id<>$2 AND status='pending'",[listing.id,id]);
    }
    await appendMessage(client,conversation,userId,input.status==='accepted'?'Angebot angenommen':'Angebot abgelehnt',input.status==='accepted'?'accept':'decline',offer.price_cents);
    return {id,status:input.status};
  });
}
