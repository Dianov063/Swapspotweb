import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {nationalMarkets,visibleNationalMarkets,nationalPagesForLocale} from '../lib/nationalMarkets.ts';
import {parseLanguagesPayload,siteLanguages} from '../lib/languagesCore.ts';
import {locales,localeNames} from '../lib/locales.ts';
import {isLocalePackBundled,ensureLocaleTables} from '../lib/localePacks.ts';
import {getDictionary} from '../lib/i18n.ts';

function pageGate(state){
 const exports={};
 const source=readFileSync(new URL('../components/directory/NationalMarketPage.tsx',import.meta.url),'utf8');
 const modules={
  'react/jsx-runtime':{},'next/navigation':{notFound:()=>{throw new Error('NOT_FOUND');}},
  '@/components/Footer':{},'@/components/Header':{},'@/components/ui':{},'@/lib/appLinks':{},'@/lib/i18n':{},
  '@/lib/nationalMarkets':{nationalMarkets},
  '@/lib/markets':{getMarket:async code=>({code,status:state.market}),isActive:row=>row?.status==='active'},
  '@/lib/languages':{pageLocale:async locale=>state.publicLocales.includes(locale)?locale:null},
 };
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>{assert(name in modules,name);return modules[name];}});
 return exports.activeNationalMarket;
}

test('country routes stay404 until both market and locale are public, including direct URLs',async()=>{
 const state={market:'active',publicLocales:['en','fr']};const resolve=pageGate(state);
 await assert.rejects(resolve('poland','pl'),/NOT_FOUND/);
 state.publicLocales.push('pl');state.market='preparing';await assert.rejects(resolve('poland','pl'),/NOT_FOUND/);
 state.market='active';assert.equal((await resolve('poland','pl')).path,'/pl/markets/poland');
 assert.equal((await resolve('belgium','fr')).path,'/fr/markets/belgium');
 await assert.rejects(resolve('unknown','pl'),/NOT_FOUND/);
});

test('sitemap and directory omit hidden languages, with one preferred link per country',()=>{
 const visible=visibleNationalMarkets(new Set(['PL','BE','NL']),new Set(['en','fr','de']));
 assert(visible.every(p=>p.code==='BE'));assert.equal(visible.length,3);
 assert.equal(nationalPagesForLocale(visible,'fr')[0].path,'/fr/markets/belgium');
 assert.equal(nationalPagesForLocale(visible,'es')[0].path,'/markets/belgium');
 assert.equal(new Set(nationalMarkets.map(p=>p.path)).size,nationalMarkets.length);
});

test('complete Polish website pack can render while its draft registry remains hidden',()=>{
 const snapshot=JSON.parse(readFileSync(new URL('../lib/languagesSnapshot.json',import.meta.url),'utf8'));
 const registry=parseLanguagesPayload(snapshot).languages;
 const options={registry,shipped:locales,shippedNames:localeNames,isBundled:isLocalePackBundled};
 assert(!siteLanguages(options).some(l=>l.code==='pl'));
 const activated=registry.map(l=>l.code==='pl'?{...l,status:'machine',public:true}:l);
 const pl=siteLanguages({...options,registry:activated}).find(l=>l.code==='pl');assert(pl);
 ensureLocaleTables(pl);const dictionary=getDictionary('pl');assert.equal(dictionary.nav.getApp,'Pobierz aplikację');
 assert(dictionary.hero.rating.includes('Przykładowy'));assert(!dictionary.hero.rating.includes('2,300'));
});
