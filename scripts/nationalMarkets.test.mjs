import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {nationalMarkets,visibleNationalMarkets,nationalPagesForLocale,isPreviouslyPublishedNationalPage} from '../lib/nationalMarkets.ts';
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
  '@/lib/languages':{nationalPageLocale:async page=>state.publicLocales.includes(page.locale)||isPreviouslyPublishedNationalPage(page)?page.locale:null},
 };
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>{assert(name in modules,name);return modules[name];}});
 return exports.activeNationalMarket;
}

test('new country routes require market and locale gates; two previously published URLs remain available',async()=>{
 const state={market:'active',publicLocales:['en','fr']};const resolve=pageGate(state);
 await assert.rejects(resolve('poland','pl'),/NOT_FOUND/);
 state.publicLocales.push('pl');state.market='preparing';await assert.rejects(resolve('poland','pl'),/NOT_FOUND/);
 state.market='active';assert.equal((await resolve('poland','pl')).path,'/pl/markets/poland');
 assert.equal((await resolve('belgium','fr')).path,'/fr/markets/belgium');
 assert.equal((await resolve('netherlands','nl')).path,'/nl/markets/netherlands');
 assert.equal((await resolve('italy','it')).path,'/it/markets/italy');
 await assert.rejects(resolve('belgium','nl'),/NOT_FOUND/);
 state.market='preparing';await assert.rejects(resolve('netherlands','nl'),/NOT_FOUND/);
 await assert.rejects(resolve('unknown','pl'),/NOT_FOUND/);
});

test('country links omit new hidden languages and preserve published national URLs',()=>{
 const visible=visibleNationalMarkets(new Set(['PL','BE','NL']),new Set(['en','fr','de']));
 assert(visible.every(p=>['BE','NL'].includes(p.code)));assert.equal(visible.length,4);
 assert.equal(nationalPagesForLocale(visible,'fr')[0].path,'/fr/markets/belgium');
 assert.equal(nationalPagesForLocale(visible,'es')[0].path,'/markets/belgium');
 assert.equal(new Set(nationalMarkets.map(p=>p.path)).size,nationalMarkets.length);
});

function compileModule(path,modules){
 const exports={};const code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
 }).outputText;
 vm.runInNewContext(code,{exports,require:name=>{assert(name in modules,name);return modules[name];}});
 return exports;
}

test('real sitemap wiring preserves published country URLs without publishing other hidden-language paths',async()=>{
 const localeModule=await import('../lib/locales.ts');
 const registry=parseLanguagesPayload(JSON.parse(readFileSync(new URL('../lib/languagesSnapshot.json',import.meta.url),'utf8'))).languages;
 const languages=siteLanguages({registry,shipped:locales,shippedNames:localeNames,isBundled:isLocalePackBundled});
 const countryModule=await import('../lib/nationalMarkets.ts');
 const state={markets:['IT','NL','BE','PL'].map(code=>({code,status:'active'}))};
 const sitemap=compileModule('../app/sitemap.ts',{
  '@/lib/data':{categories:[],cities:[]},'@/lib/languages':{getSiteLanguages:async()=>languages},
  '@/lib/locales':localeModule,'@/lib/publicDirectory':{getSitemapDirectory:async()=>({directoryPairs:[],helperSlugs:[]})},
  '@/lib/markets':{getMarkets:async()=>state.markets,isActive:row=>row.status==='active'},'@/lib/nationalMarkets':countryModule,
 }).default;
 let urls=(await sitemap()).map(row=>row.url);
 assert(urls.includes('https://www.swapspot.org/it/markets/italy'));
 assert(urls.includes('https://www.swapspot.org/nl/markets/netherlands'));
 assert(!urls.some(url=>url.includes('/pl/')));
 assert(!urls.includes('https://www.swapspot.org/nl/markets/belgium'));
 assert(!urls.includes('https://www.swapspot.org/nl'));
 state.markets=state.markets.map(row=>({...row,status:'preparing'}));
 urls=(await sitemap()).map(row=>row.url);assert(!urls.some(url=>url.includes('/markets/')));
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
