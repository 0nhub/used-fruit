const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const Module=require('node:module');
const path=require('node:path');
const {generateKeyPairSync,sign}=require('node:crypto');
function load(file){const filename=path.resolve(file);const m=new Module(filename,module);m.filename=filename;m.paths=module.paths;const req=m.require.bind(m);m.require=id=>id==='./auth'?load('src/lib/auth.ts'):req(id);m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);return m.exports;}
const {verifyAppleToken}=load('src/lib/appleAuth.ts');
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const keys=[{...publicKey.export({format:'jwk'}),kid:'test',alg:'RS256',use:'sig'}];
const claims={iss:'https://appleid.apple.com',aud:'de.usedfruit.web',sub:'apple-user',nonce:'test-nonce',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300};
function token(changes={},header={alg:'RS256',kid:'test'}){const input=[header,{...claims,...changes}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');return input+'.'+sign('RSA-SHA256',Buffer.from(input),privateKey).toString('base64url');}
test('Apple identity requires valid signature, audience, issuer, nonce and lifetime',()=>{
 assert.deepEqual(verifyAppleToken(token(),keys,claims.aud,claims.nonce),{sub:'apple-user'});
 for(const changes of [{iss:'https://evil.example'},{aud:'another-app'},{nonce:'other'},{exp:1},{iat:claims.iat+1000},{sub:''}]) assert.throws(()=>verifyAppleToken(token(changes),keys,claims.aud,claims.nonce));
 assert.throws(()=>verifyAppleToken(token({}, {alg:'none',kid:'test'}),keys,claims.aud,claims.nonce));
 assert.throws(()=>verifyAppleToken(token({}, {alg:'RS256',kid:'unknown'}),keys,claims.aud,claims.nonce));
 const parts=token().split('.');parts[1]=Buffer.from(JSON.stringify({...claims,sub:'attacker'})).toString('base64url');assert.throws(()=>verifyAppleToken(parts.join('.'),keys,claims.aud,claims.nonce));
});
