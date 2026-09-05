const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
function load(file, deps={}) {
 const m={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(id=>deps[id],m,m.exports);return m.exports;
}
const cover=load('src/lib/profileCover.ts');
test('profile cover rejects external URLs, SVG and oversized storage payloads',()=>{
 for(const value of ['https://example.com/image.jpg','data:image/svg+xml;base64,PHN2Zz4=', 'data:image/jpeg;base64,'+'A'.repeat(450000),null]) assert.equal(cover.safeProfileCover(value),undefined);
 assert.equal(cover.safeProfileCover('data:image/jpeg;base64,YQ=='),'data:image/jpeg;base64,YQ==');
});
test('profile keeps cover across saves and respects explicit notification opt-out',()=>{
 const values=new Map();global.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 global.window={dispatchEvent:()=>{}};
 const p=load('src/lib/profile.ts',{'@/lib/profileCover':cover,'@/data/catalog':{parseRadiusKm:v=>v}});
 assert.equal(p.DEFAULT_PROFILE.notifyOnMessage,true);
 p.writeProfile({...p.DEFAULT_PROFILE,name:'Anna',coverImage:'data:image/jpeg;base64,YQ==',notifyOnMessage:false});
 assert.equal(p.readProfile().coverImage,'data:image/jpeg;base64,YQ==');
 assert.equal(p.readProfile().notifyOnMessage,false);
 p.writeProfile({...p.readProfile(),coverImage:undefined});
 assert.equal(p.readProfile().coverImage,undefined);
});
