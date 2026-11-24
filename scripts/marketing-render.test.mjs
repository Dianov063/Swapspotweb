import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as jsx from 'react/jsx-runtime';
import * as icons from 'lucide-react';
import * as i18n from '../lib/i18n.ts';
import * as phone from '../lib/copy/phone.ts';
import * as preview from '../lib/copy/appPreview.ts';
import * as clients from '../lib/copy/forClients.ts';
import * as price from '../lib/priceFormat.ts';
import * as labels from '../lib/illustrationLabel.ts';
import * as data from '../lib/data.ts';
import * as country from '../lib/nationalMarkets.ts';
import * as directory from '../lib/directoryStrings/index.ts';
import * as localeModule from '../lib/locales.ts';
import * as languageCore from '../lib/languagesCore.ts';
import * as packs from '../lib/localePacks.ts';

const link=({children,href,...rest})=>React.createElement('a',{href,...rest},children);
const bridge={
 'react/jsx-runtime':jsx,'lucide-react':icons,'next/link':{__esModule:true,default:link},
 '@/lib/i18n':i18n,'@/lib/copy/phone':phone,'@/lib/copy/appPreview':preview,'@/lib/copy/forClients':clients,
 '@/lib/priceFormat':price,'@/lib/illustrationLabel':labels,'@/lib/data':data,
};
function compile(path,modules=bridge){
 const exports={};const code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
 }).outputText;
 vm.runInNewContext(code,{exports,fetch:()=>{throw new Error('Unexpected test network request');},require:name=>{assert(name in modules,name);return modules[name];}});return exports;
}
const ui=compile('../components/ui.tsx');
const mockup=compile('../components/PhoneMockup.tsx');
const components=[
 mockup.default,
 compile('../components/Hero.tsx',{...bridge,'./ui':ui,'./PhoneMockup':mockup}).default,
 compile('../components/AppPreview.tsx',{...bridge,'./ui':ui}).default,
 compile('../components/ForHelpers.tsx',{...bridge,'./ui':ui}).default,
 compile('../components/ForClients.tsx',{...bridge,'./ui':ui}).default,
];
const snapshot=JSON.parse(readFileSync(new URL('../lib/languagesSnapshot.json',import.meta.url),'utf8'));
const registry=languageCore.parseLanguagesPayload(snapshot).languages;
const options={registry,shipped:localeModule.locales,shippedNames:localeModule.localeNames,isBundled:packs.isLocalePackBundled};

test('five actual marketing components omit fixed prices, ratings and earnings, with visible example labels',()=>{
 const pl=languageCore.siteLanguages({...options,registry:registry.map(r=>r.code==='pl'?{...r,status:'machine',public:true}:r)}).find(r=>r.code==='pl');
 packs.ensureLocaleTables(pl);
 for(const locale of ['pl','en','fr','de']){
  for(const Component of components){
   const html=renderToStaticMarkup(React.createElement(Component,{locale,dictionary:i18n.getDictionary(locale)}));
   assert(!/\$|4\.9|\(128\)|\+18%|2,300/.test(html),locale+' '+Component.name);
   assert(html.includes(labels.illustrationLabel(locale)),locale+' missing visible example label');
  }
 }
});

test('real country loader preserves published national copy without registering draft dictionaries or global routes',async()=>{
 const languages=compile('../lib/languages.ts',{
  react:{cache:fn=>fn},'./languagesCore':languageCore,'./nationalMarkets':country,
  './languagesSnapshot.json':{__esModule:true,default:snapshot},'./localePacks':packs,
  './locales':localeModule,'./supabaseAdmin':{appPlatformAppBase:()=>null},
 });
 for(const [code,locale,slug] of [['IT','it','italy'],['NL','nl','netherlands']]){
  const prior=i18n.getDictionary(locale);
  assert.equal(await languages.routeLocale(locale),null);
  assert.equal(await languages.nationalPageLocale({code,locale,path:`/${locale}/markets/${slug}`}),locale);
  assert.equal(i18n.getDictionary(locale),prior);
  assert.equal(await languages.routeLocale(locale),null);
 }
 assert.equal(await languages.nationalPageLocale({code:'BE',locale:'nl',path:'/nl/markets/belgium'}),null);
 assert.equal(await languages.nationalPageLocale({code:'PL',locale:'pl',path:'/pl/markets/poland'}),null);
 const seen=[];
 const nav=({locale,dictionary})=>{seen.push({locale,label:dictionary.nav.getApp});return React.createElement('a',{href:i18n.localizedPath(locale,'/privacy')},'Privacy');};
 const pageModule=compile('../components/directory/NationalMarketPage.tsx',{
  ...bridge,'next/navigation':{notFound:()=>{throw Error('NOT_FOUND');}},
  '@/components/Header':{__esModule:true,default:nav},'@/components/Footer':{__esModule:true,default:nav},
  '@/components/ui':ui,'@/lib/appLinks':{APP_STORE_URL:'https://apps.apple.com/app/test',GOOGLE_PLAY_URL:'https://play.google.com/store/apps/details?id=test'},
  '@/lib/markets':{getMarket:async code=>({code,status:'active'}),isActive:row=>row.status==='active'},
  '@/lib/nationalMarkets':country,'@/lib/languages':languages,
 });
 for(const [locale,slug] of [['nl','netherlands'],['it','italy']]){
  const page=await pageModule.activeNationalMarket(slug,locale);
  assert.equal(page.navigationLocale,'en');
  const html=renderToStaticMarkup(React.createElement(pageModule.default,{page}));
  assert(html.includes('href="/services"'));assert(html.includes('href="/privacy"'));
  assert(!html.includes(`href="/${locale}/`));
 }
 assert(seen.every(row=>row.locale==='en' && row.label===i18n.getDictionary('en').nav.getApp));
});

test('rendered real services directory keeps published country links and excludes new hidden-language links',async()=>{
 const state={markets:['IT','NL','BE','PL'].map(code=>({code,status:'active'}))};
 const Component=compile('../components/directory/ServicesDirectoryPage.tsx',{
  ...bridge,'@/components/Header':{__esModule:true,default:()=>null},'@/components/Footer':{__esModule:true,default:()=>null},
  '@/components/ui':ui,'@/lib/directoryStrings':directory,'@/lib/locales':localeModule,
  '@/lib/languages':{getSiteLanguages:async()=>languageCore.siteLanguages(options)},
  '@/lib/markets':{getMarkets:async()=>state.markets,isActive:row=>row.status==='active',marketName:code=>code},
  '@/lib/nationalMarkets':country,'@/lib/publicDirectory':{getDirectoryPairs:async()=>[]},
 }).default;
 let html=renderToStaticMarkup(await Component({locale:'en'}));
 assert(html.includes('href="/it/markets/italy"'));assert(html.includes('href="/nl/markets/netherlands"'));
 assert(!html.includes('href="/pl/markets/poland"'));assert(!html.includes('href="/nl/markets/belgium"'));
 assert.equal((html.match(/href="\/markets\/belgium"/g)||[]).length,1);
 state.markets=state.markets.map(row=>({...row,status:'preparing'}));
 html=renderToStaticMarkup(await Component({locale:'en'}));assert(!html.includes('/markets/'));
});
