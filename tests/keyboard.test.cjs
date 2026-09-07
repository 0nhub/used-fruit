const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = { exports: {} }; cache.set(filename, mod);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)((id) => id.startsWith('@/') ? load('src/' + id.slice(2) + '.ts') : require(id), mod, mod.exports);
  return mod.exports;
}
const keyboard = load('src/lib/keyboard.ts');
const { buildWizardSteps } = load('src/lib/listingWizard.ts');
const { filterListings, formatListingMeta, formatListingHeadline } = load('src/lib/format.ts');
const base = { id:'test', modelId:'macbook-air', categoryId:'mac', condition:'gut', price:500, title:'MacBook Air', colorId:'silver', city:'Berlin', postalCode:'10115', createdAt:'2026-09-05' };
const filters = { sizes:[], years:[], colors:[], memory:[], storage:[], conditions:[] };
test('only built-in MacBook keyboards get a required wizard step', () => {
  for (const id of ['macbook-air','macbook-pro','macbook-neo']) assert.ok(buildWizardSteps(id).includes('keyboard'));
  for (const id of ['imac','mac-mini','ipad-pro','iphone-16', undefined]) assert.equal(buildWizardSteps(id).includes('keyboard'), false);
});
test('desktop Macs ask for accessories; keyboard layout only if a keyboard is included', () => {
  for (const id of ['imac','mac-mini','mac-studio','mac-pro']) assert.ok(buildWizardSteps(id).includes('accessories'));
  for (const id of ['macbook-air','ipad-pro','iphone-16', undefined]) assert.equal(buildWizardSteps(id).includes('accessories'), false);
  assert.ok(buildWizardSteps('imac', undefined, undefined, undefined, ['keyboard']).includes('keyboard'));
  assert.equal(buildWizardSteps('imac', undefined, undefined, undefined, []).includes('keyboard'), false);
});
test('accessory filters apply only to desktop Macs', () => {
  const accessories = load('src/lib/accessories.ts');
  const listings = [
    {...base,id:'air'},
    {...base,id:'mini-none',modelId:'mac-mini',title:'Mac mini',includedAccessories:[]},
    {...base,id:'mini-kb',modelId:'mac-mini',title:'Mac mini',includedAccessories:['keyboard'],keyboardLayout:'de-at'},
    {...base,id:'mini-mouse',modelId:'mac-mini',title:'Mac mini',includedAccessories:['magic-mouse']},
  ];
  assert.deepEqual(filterListings(listings,{...filters,accessories:['none']}).map(x=>x.id), ['mini-none']);
  assert.deepEqual(filterListings(listings,{...filters,accessories:['keyboard']}).map(x=>x.id), ['mini-kb']);
  assert.deepEqual(filterListings(listings,{...filters,keyboardLayouts:['de-at']}).map(x=>x.id), ['mini-kb']);
  assert.equal(accessories.formatIncludedAccessories({includedAccessories:[]}), 'Kein Zubehör');
});
test('unknown or partial imported layouts never become German', () => {
  for (const keyboardLayout of [undefined, 'DE', 'QWERTZ', 'QWERTY', 'unknown', null]) {
    assert.equal(keyboard.hasValidKeyboard({keyboardLayout}), false);
    assert.equal(keyboard.formatKeyboardLayout({keyboardLayout}), 'Nicht angegeben');
  }
  assert.doesNotMatch(formatListingMeta(base), /Tastatur|Nicht angegeben/);
  assert.doesNotMatch(formatListingHeadline({...base, keyboardLayout:'ch'}), /Tastatur|CH|QWERTZ/);
  assert.doesNotMatch(formatListingMeta({...base, modelId:'iphone-16'}), /Tastatur/);
});
test('other layouts require a meaningful bounded description', () => {
  for (const keyboardLayoutDetails of [undefined, '', '  ', 'x'.repeat(101), 23]) assert.equal(keyboard.hasValidKeyboard({keyboardLayout:'other', keyboardLayoutDetails}), false);
  assert.equal(keyboard.hasValidKeyboard({keyboardLayout:'other', keyboardLayoutDetails:'Italienisch (IT), QWERTY'}), true);
});
test('country-specific filters exclude unknown and different QWERTZ variants', () => {
  const listings = [base, {...base,id:'de',keyboardLayout:'de-at'}, {...base,id:'ch',keyboardLayout:'ch'}, {...base,id:'us',keyboardLayout:'us'}];
  assert.deepEqual(filterListings(listings,{...filters,keyboardLayouts:['de-at']}).map(x=>x.id), ['de']);
  assert.deepEqual(filterListings(listings,{...filters,keyboardLayouts:['ch','us']}).map(x=>x.id), ['ch','us']);
  assert.equal(filterListings(listings,filters).length,4);
});
test('login draft roundtrip keeps the exact keyboard variant', () => {
  const values=new Map(); global.window={}; global.sessionStorage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k),removeItem:k=>values.delete(k)};
  const draft=load('src/lib/listingDraft.ts');
  draft.writeListingDraft({...base,keyboardLayout:'ch'});
  assert.equal(draft.readListingDraft().keyboardLayout,'ch');
  draft.clearListingDraft(); assert.equal(draft.readListingDraft(),null);
});

test('SIM lock applies only to phones and cellular iPads', () => {
  const sim = load('src/lib/simLock.ts');
  assert.ok(buildWizardSteps('iphone-16').includes('simLock'));
  assert.ok(buildWizardSteps('ipad-pro', undefined, undefined, 'cellular').includes('simLock'));
  assert.equal(buildWizardSteps('ipad-pro', undefined, undefined, 'wifi').includes('simLock'), false);
  assert.equal(buildWizardSteps('macbook-air').includes('simLock'), false);
  assert.equal(sim.formatSimLock(undefined), 'Nicht angegeben');
  assert.equal(sim.isSimLockStatus('no'), false);
  assert.equal(sim.isSimLockStatus('unknown'), false);
  assert.equal(sim.formatSimLock('unknown'), 'Nicht angegeben');
});
test('SIM lock survives the login draft roundtrip', () => {
  const values = new Map(); global.window = {}; global.sessionStorage = {setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k),removeItem:k=>values.delete(k)};
  const draft = load('src/lib/listingDraft.ts');
  for (const simLock of ['locked', 'unlocked']) {
    draft.writeListingDraft({...base, simLock});
    assert.equal(draft.readListingDraft().simLock, simLock);
  }
});

test('numeric listing numbers are stable and preserve ID distinctions', () => {
  const { listingNumber } = load('src/lib/listingNumber.ts');
  assert.equal(listingNumber('uf-s-21'), '3503968021');
  const ids = ['uf-s-01', 'uf-s-21', 'uf-0000001', 'uf-0000002', 'uf-abc1234', 'uf-abc', 'uf-0abc'];
  const numbers = ids.map(listingNumber);
  assert.equal(new Set(numbers).size, ids.length);
  for (const number of numbers) assert.match(number, /^\d+$/);
});
