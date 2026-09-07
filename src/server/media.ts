import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { transaction } from './db';
import { assertContact, lockPeople } from './access';
import { ApiError, requireValue, uuid } from './http';

function mediaDirectory() {
  const directory=process.env.USED_FRUIT_MEDIA_DIR;
  if (!directory || !path.isAbsolute(directory)) throw new Error('Media directory unavailable');
  return directory;
}
export async function uploadMedia(userId: string,request: Request) {
  const supported=['image/jpeg','image/png','image/webp'];
  if (!supported.includes(request.headers.get('content-type')?.split(';')[0]??'')) throw new ApiError(415,'unsupported_image','Bitte wähle JPEG, PNG oder WebP.');
  const reader=request.body?.getReader();
  requireValue(reader,'Bild fehlt.');
  const chunks: Uint8Array[]=[]; let size=0;
  while (true) { const part=await reader.read(); if (part.done) break; size+=part.value.byteLength; if (size>8*1024*1024) { await reader.cancel(); throw new ApiError(413,'too_large','Das Bild darf höchstens 8 MB groß sein.'); } chunks.push(part.value); }
  let encoded: Buffer;
  try {
    const pipeline=sharp(Buffer.concat(chunks),{limitInputPixels:24000000,animated:false});
    const metadata=await pipeline.metadata();
    requireValue(['jpeg','png','webp'].includes(metadata.format??'') && (metadata.pages??1)===1,'Nicht unterstütztes Bild.');
    encoded=await pipeline.rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
  } catch { throw new ApiError(400,'invalid_image','Dieses Bild konnte nicht verarbeitet werden.'); }
  const id=randomUUID(),filename=id+'.webp',directory=mediaDirectory();
  await mkdir(directory,{recursive:true,mode:0o750});
  await writeFile(path.join(directory,filename),encoded,{flag:'wx',mode:0o640});
  try {
    await transaction(async client=> {
      await lockPeople(client,[userId]);
      const user=(await client.query('SELECT id FROM users WHERE id=$1 AND deleted_at IS NULL AND banned_at IS NULL',[userId])).rowCount;
      if (!user) throw new ApiError(401,'unauthorized','Bitte melde dich erneut an.');
      const count=(await client.query('SELECT count(*)::int AS count FROM media WHERE user_id=$1 AND deleted_at IS NULL',[userId])).rows[0].count;
      if (count>=20) throw new ApiError(409,'media_limit','Bitte entferne zuerst ein nicht mehr benötigtes Bild.');
      await client.query("INSERT INTO media(id,user_id,filename,mime_type,size_bytes) VALUES($1,$2,$3,'image/webp',$4)",[id,userId,filename,encoded.length]);
    });
  } catch (error) { await unlink(path.join(directory,filename)); throw error; }
  return {id,url:'/api/v1/media/'+id};
}
export async function readMedia(id: string,userId: string|null) {
  const row=await transaction(async client=> {
    const media=(await client.query('SELECT m.* FROM media m JOIN users u ON u.id=m.user_id WHERE m.id=$1 AND m.deleted_at IS NULL AND u.deleted_at IS NULL AND u.banned_at IS NULL AND (u.cover_media_id=m.id OR u.id=$2)',[uuid(id),userId])).rows[0];
    if (!media) throw new ApiError(404,'not_found','Bild nicht gefunden.');
    if (userId) await assertContact(client,userId,media.user_id);
    return media;
  });
  const bytes=await readFile(path.join(mediaDirectory(),row.filename));
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/webp','Content-Length':String(bytes.length),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
export async function deleteMedia(id: string,userId: string) {
  await transaction(async client=> {
    await lockPeople(client,[userId]);
    const result=await client.query('UPDATE media SET deleted_at=now() WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL RETURNING id',[uuid(id),userId]);
    if (!result.rowCount) throw new ApiError(404,'not_found','Bild nicht gefunden.');
    await client.query('UPDATE users SET cover_media_id=NULL WHERE id=$1 AND cover_media_id=$2',[userId,id]);
  });
  return {ok:true};
}
