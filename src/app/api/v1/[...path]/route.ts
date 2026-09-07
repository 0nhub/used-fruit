import { NextRequest, NextResponse } from 'next/server';
import { authenticate, accountView, refreshSession } from '@/server/accounts';
import { ApiError, body, failure, requireValue, string, uuid } from '@/server/http';
import { database, transaction } from '@/server/db';
import { rateLimit, lockPeople } from '@/server/access';
import { appleChallenge, nativeAppleLogin } from '@/server/nativeAuth';
import { revokeSession, deleteAccount } from '@/server/accountDeletion';
import * as marketplace from '@/server/marketplace';
import * as community from '@/server/community';
import * as offers from '@/server/offers';
import * as media from '@/server/media';
import { CATEGORIES, MODELS, CONDITIONS } from '@/data/catalog';
import { buildCatalogModelRows } from '@/data/catalogBackendRows';
import nativeCatalog from '@/data/nativeCatalog.json';

export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handle(request: NextRequest,context: {params:Promise<{path:string[]}>}) {
  try {
    const path=(await context.params).path;
    const route=path.join('/'),method=request.method;
    const reply=(value:unknown)=>NextResponse.json(value,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    // The reverse proxy must overwrite X-Real-IP; direct application access is internal only.
    const ip=request.headers.get('x-real-ip')??'internal';
    if (route.startsWith('auth/') && method==='POST') {
      await rateLimit('auth:'+ip,30);
      if (route==='auth/apple/challenge') return reply(await appleChallenge());
      if (route==='auth/apple') return reply(await nativeAppleLogin(await body(request)));
      if (route==='auth/refresh') return reply(await refreshSession((await body(request)).refreshToken));
    }
    const publicRead=method==='GET' && (route==='catalog'||path[0]==='listings'||path[0]==='users'||path[0]==='media');
    const user=await authenticate(request,!publicRead);
    await rateLimit(user?'user:'+user.id:'public:'+ip,method==='GET'?240:60);
    const userId=user?.id??null;
    const input=async()=>body(request);
    if (route==='catalog'&&method==='GET') return reply({version:1,categories:CATEGORIES,models:MODELS,conditions:CONDITIONS,variants:buildCatalogModelRows(),nativeCache:nativeCatalog});
    if (route==='listings'&&method==='GET') return reply(await marketplace.listListings(userId,request.nextUrl.searchParams));
    if (path[0]==='listings'&&path.length===2&&method==='GET') return reply(await marketplace.getListing(path[1],userId));
    if (path[0]==='users'&&path.length===2&&method==='GET') return reply(await community.publicProfile(userId,path[1]));
    if (path[0]==='media'&&path.length===2&&method==='GET') return await media.readMedia(path[1],userId);
    if (!user) throw new ApiError(401,'unauthorized','Bitte melde dich an.');
    const id=user.id,key=request.headers.get('idempotency-key');
    if (route==='auth/logout'&&method==='POST') return reply(await revokeSession(user.session_id));
    if (route==='me') {
      if (method==='GET') return reply(accountView(user));
      if (method==='PATCH') return reply(accountView(await community.updateProfile(id,await input())));
      if (method==='DELETE') return reply(await deleteAccount(id));
    }
    if (route==='me/listings'&&method==='GET') return reply(await marketplace.listListings(id,request.nextUrl.searchParams,true));
    if (route==='listings'&&method==='POST') return reply(await marketplace.createListing(id,await input(),key));
    if (path[0]==='listings'&&path.length===2) {
      if (method==='PATCH') return reply(await marketplace.updateListing(path[1],id,await input()));
      if (method==='DELETE') return reply(await marketplace.updateListing(path[1],id,{},true));
    }
    if (route==='favorites'&&method==='GET') return reply(await community.favorites(id));
    if (path[0]==='favorites'&&path.length===2&&['PUT','DELETE'].includes(method)) return reply(await community.setFavorite(id,path[1],method==='PUT'));
    if (route==='notes'&&method==='GET') return reply(await community.notes(id));
    if (path[0]==='notes'&&path.length===2&&['PUT','DELETE'].includes(method)) return reply(await community.setNote(id,path[1],method==='PUT'?await input():{},method==='DELETE'));
    if (route==='conversations') {
      if (method==='GET') return reply(await marketplace.listConversations(id,request.nextUrl.searchParams.get("cursor")));
      if (method==='POST') return reply(await marketplace.openConversation(id,uuid((await input()).listingId)));
    }
    if (path[0]==='conversations'&&path.length===2&&method==='PATCH') return reply(await marketplace.updateConversation(id,path[1],await input()));
    if (path[0]==='conversations'&&path.length===3&&path[2]==='messages') {
      if (method==='GET') return reply(await marketplace.listMessages(id,path[1],request.nextUrl.searchParams.get('after')));
      if (method==='POST') return reply(await marketplace.sendMessage(id,path[1],await input(),key));
    }
    if (path[0]==='conversations'&&path.length===3&&path[2]==='offers') {
      if (method==='GET') return reply(await offers.listOffers(id,path[1]));
      if (method==='POST') return reply(await offers.createOffer(id,path[1],await input(),key));
    }
    if (path[0]==='offers'&&path.length===2&&method==='PATCH') return reply(await offers.resolveOffer(id,path[1],await input()));
    if (route==='blocks'&&method==='GET') return reply(await community.listBlocks(id));
    if (path[0]==='blocks'&&path.length===2&&['PUT','DELETE'].includes(method)) return reply(await marketplace.setBlock(id,path[1],method==='PUT'));
    if (route==='notifications') {
      if (method==='GET') return reply({emailNotifications:user.email_notifications,pushNotifications:user.push_notifications});
      if (method==='PATCH') { const data=await input(); return reply(accountView(await community.updateProfile(id,{...('emailNotifications' in data?{emailNotifications:data.emailNotifications}:{}),...('pushNotifications' in data?{pushNotifications:data.pushNotifications}:{})}))); }
    }
    if (route==='devices'&&method==='POST') {
      requireValue(user.session_kind==='ios','Geräteregistrierung nur aus der App.');
      const data=await input(),token=string(data.token,512);
      requireValue(/^[a-f0-9]{64,512}$/i.test(token)&&['sandbox','production'].includes(String(data.environment)),'Ungültiges Gerätetoken.');
      return reply(await transaction(async client=>{
        await lockPeople(client,[id]);
        const existing=(await client.query('SELECT id FROM device_tokens WHERE token=$1 AND environment=$2 AND user_id=$3',[token.toLowerCase(),data.environment,id])).rowCount;
        const count=(await client.query("SELECT count(*)::int AS count FROM device_tokens d JOIN sessions s ON s.id=d.session_id WHERE d.user_id=$1 AND d.enabled AND s.revoked_at IS NULL AND s.refresh_expires_at>now()",[id])).rows[0].count;
        if(!existing&&count>=5)throw new ApiError(409,'device_limit','Bitte melde dich zuerst auf einem anderen Gerät ab. Maximal fünf Geräte können Push empfangen.');
        return (await client.query(`INSERT INTO device_tokens(user_id,session_id,token,environment) VALUES($1,$2,$3,$4) ON CONFLICT(token,environment) DO UPDATE SET user_id=EXCLUDED.user_id,session_id=EXCLUDED.session_id,enabled=true,updated_at=now() RETURNING id`,[id,user.session_id,token.toLowerCase(),data.environment])).rows[0];
      }));
    }
    if (path[0]==='devices'&&path.length===2&&method==='DELETE') { await database().query('DELETE FROM device_tokens WHERE id=$1 AND user_id=$2',[uuid(path[1]),id]); return reply({ok:true}); }
    if (route==='media'&&method==='POST') return reply(await media.uploadMedia(id,request));
    if (path[0]==='media'&&path.length===2&&method==='DELETE') return reply(await media.deleteMedia(path[1],id));
    if (route==='reports'&&method==='POST') return reply(await community.report(id,await input()));
    if (route==='me/ratings'&&method==='GET') return reply(await community.ownRatings(id));
    if (route==='ratings'&&method==='POST') return reply(await community.rateUser(id,await input()));
    if (route==='admin/reports'&&method==='GET') return reply(await community.adminReports(id));
    if (route==='admin/actions'&&method==='POST') return reply(await community.moderate(id,await input()));
    throw new ApiError(404,'not_found','Schnittstelle nicht gefunden.');
  } catch (error) { return failure(error); }
}
export {handle as GET,handle as POST,handle as PATCH,handle as PUT,handle as DELETE};
