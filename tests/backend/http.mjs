import assert from 'node:assert/strict';
const origin='https://staging.usedfruit.de';
const cases=[
 ['/listings',{},200],['/listings?sort=nearest&lat=49.14&lng=9.22&radiusKm=20',{},200],
 ['/me',{},401],['/admin/reports',{},401],['/listings/not-a-uuid',{},400],
 ['/listings',{headers:{authorization:'Bearer invalid'}},401],
 ['/listings',{method:'POST',headers:{origin:'https://attacker.invalid','content-type':'application/json'},body:'{}'},403],
 ['/listings',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{}'},401],
 ['/auth/refresh',{method:'POST',headers:{'content-type':'application/json'},body:'{"refreshToken":"invalid"}'},400],
];
for(const [path,options,status] of cases){const response=await fetch(origin+'/api/v1'+path,options);assert.equal(response.status,status,path);assert.match(response.headers.get('cache-control')??'',/no-store/);const body=await response.json();if(status>=400)assert.ok(body.error?.code&&body.error?.requestId);}
const catalog=await(await fetch(origin+'/api/v1/catalog')).json();assert.equal(catalog.nativeCache.listings.length,0);assert.deepEqual(catalog.nativeCache.sellers,{});assert.ok(catalog.models.length>0);
const challenge=await(await fetch(origin+'/api/v1/auth/apple/challenge',{method:'POST'})).json();assert.match(challenge.challengeId,/^[a-f0-9-]{36}$/);assert.match(challenge.nonceHash,/^[a-f0-9]{64}$/);assert.equal(challenge.expiresIn,300);
const webhook=await fetch(origin+'/api/webhooks/ses',{method:'POST',headers:{'content-type':'text/plain'},body:'{"Type":"Notification","TopicArn":"attacker"}'});assert.equal(webhook.status,400);
console.log('PASS 12 HTTPS checks: public catalog, search, authentication, CSRF, error contract, challenge and unsigned webhook rejection');
