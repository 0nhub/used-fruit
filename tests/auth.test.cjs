const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const ts = require('typescript');
const Module = require('module');
const path = require('path');
const filename = path.resolve('src/lib/auth.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m = new Module(filename, module); m.filename=filename; m.paths=module.paths; m._compile(compiled, filename);
const {seal,unseal,safeAuthNext,newFlow} = m.exports;
process.env.USED_FRUIT_SESSION_SECRET = 'test-session-secret-only-'.repeat(3);
test('signed session roundtrip, tampering and expiry',()=>{
 const value={kind:'session',sub:'AB1234',name:'Test',exp:Math.floor(Date.now()/1000)+60};
 const cookie=seal(value); assert.deepEqual(unseal(cookie),value);
 assert.equal(unseal(cookie.slice(0,-5)+'xxxxx'),null);
 assert.equal(unseal(seal({...value,exp:1})),null);
 assert.equal(unseal(undefined),null); assert.equal(unseal('invalid'),null);
 assert.equal(unseal(cookie+'.extra'),null);
});
test('external redirects and auth loops are rejected',()=>{
 for(const s of ['https://evil.example','//evil.example','/\\evil.example','/api/auth/login','/anmelden']) assert.equal(safeAuthNext(s),'/');
 assert.equal(safeAuthNext('/listing/test?x=1'),'/listing/test?x=1');
});
test('OAuth flows have unique state and a short lifetime',()=>{
 const a=newFlow('/profil'); const b=newFlow('/profil');
 assert.notEqual(a.state,b.state); assert.equal(a.next,'/profil');
 assert.ok(a.exp > Date.now()/1000 && a.exp <= Date.now()/1000+600);
 assert.equal(unseal(seal(a)).state,a.state);
});
