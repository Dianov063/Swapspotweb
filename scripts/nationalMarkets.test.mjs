import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {nationalMarkets,visibleNationalMarkets,nationalPagesForLocale,isPreviouslyPublishedNationalPage,nationalMarketCoverageReview} from '../lib/nationalMarkets.ts';
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
  '@/lib/languages':{
   nationalPageLocale:async page=>state.publicLocales.includes(page.locale)||isPreviouslyPublishedNationalPage(page)?page.locale:null,
   pageLocale:async locale=>state.publicLocales.includes(locale)?locale:null,
  },
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

test('Czech and Slovak routes, directory and sitemap selection require both rollout gates',async()=>{
 const state={market:'active',publicLocales:['en','fr','de','nl','pl']};
 const resolve=pageGate(state);
 for (const [country,slug,locale] of [['CZ','czechia','cs'],['SK','slovakia','sk']]) {
  const path=`/${locale}/markets/${slug}`;
  await assert.rejects(resolve(slug,locale),/NOT_FOUND/);
  assert(!visibleNationalMarkets(new Set([country]),new Set(state.publicLocales)).some(p=>p.path===path));
  state.publicLocales.push(locale);state.market='preparing';
  await assert.rejects(resolve(slug,locale),/NOT_FOUND/);
  assert(!visibleNationalMarkets(new Set(),new Set(state.publicLocales)).some(p=>p.path===path));
  state.market='active';
  assert.equal((await resolve(slug,locale)).path,path);
  const visible=visibleNationalMarkets(new Set([country]),new Set(state.publicLocales));
  assert.equal(visible.length,1);assert.equal(visible[0].path,path);
  assert.equal(nationalPagesForLocale(visible,locale)[0].path,path);
 }
});

test('all eleven existing European countries retain an available national page',()=>{
 const active=new Set(['IE','ES','FR','DE','AT','PT','MT','IT','NL','BE','PL']);
 const publicLocales=new Set(['en','es','fr','de','pt','nl','pl']);
 const pages=visibleNationalMarkets(active,publicLocales);
 assert.deepEqual([...new Set(pages.map(p=>p.code))].sort(),[...active].sort());
 assert(!pages.some(p=>['CZ','SK'].includes(p.code)));
 assert(pages.every(p=>!p.path.includes('synthetic:')));
});

function compileModule(path,modules,globals={}){
 const exports={};const code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
 }).outputText;
 vm.runInNewContext(code,{exports,require:name=>{assert(name in modules,name);return modules[name];},...globals});
 return exports;
}

test('real sitemap wiring preserves published country URLs without publishing other hidden-language paths',async()=>{
 const localeModule=await import('../lib/locales.ts');
 const registry=parseLanguagesPayload(JSON.parse(readFileSync(new URL('../lib/languagesSnapshot.json',import.meta.url),'utf8'))).languages;
 let languages=siteLanguages({registry,shipped:locales,shippedNames:localeNames,isBundled:isLocalePackBundled});
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
 // The actual sitemap must follow both gates for newly prepared countries too.
 state.markets.push({code:'CZ',status:'active'},{code:'SK',status:'active'});
 urls=(await sitemap()).map(row=>row.url);
 assert(!urls.includes('https://www.swapspot.org/cs/markets/czechia'));
 assert(!urls.includes('https://www.swapspot.org/sk/markets/slovakia'));
 languages=[...languages,{code:'cs',segment:'cs',hreflang:'cs',nativeName:'Čeština',dir:'ltr'},
  {code:'sk',segment:'sk',hreflang:'sk',nativeName:'Slovenčina',dir:'ltr'}];
 urls=(await sitemap()).map(row=>row.url);
 assert(urls.includes('https://www.swapspot.org/cs/markets/czechia'));
 assert(urls.includes('https://www.swapspot.org/sk/markets/slovakia'));
 assert(!urls.some(url=>url.includes('synthetic:')));
 state.markets=state.markets.map(row=>({...row,status:'preparing'}));
 urls=(await sitemap()).map(row=>row.url);assert(!urls.some(url=>url.includes('/markets/')));
});

const phase1Routes = [
 ['CZ','czechia','cs'],['SK','slovakia','sk'],['HU','hungary','hu'],['RO','romania','ro'],
 ['HR','croatia','hr'],['SI','slovenia','sl'],['BG','bulgaria','bg'],['GR','greece','el'],
 ['CY','cyprus','el'],['DK','denmark','da'],['SE','sweden','sv'],['FI','finland','fi'],
 ['EE','estonia','et'],['LV','latvia','lv'],['LT','lithuania','lt'],['LU','luxembourg','fr'],
 ['FI','finland','sv'],['LU','luxembourg','de'],
 ...[['HU','hungary'],['RO','romania'],['HR','croatia'],['SI','slovenia'],['BG','bulgaria'],
     ['GR','greece'],['CY','cyprus'],['DK','denmark'],['SE','sweden'],['FI','finland'],
     ['EE','estonia'],['LV','latvia'],['LT','lithuania'],['LU','luxembourg']].map(([c,s])=>[c,s,'en']),
];

test('all sixteen prepared EU markets have explicit-language country pages with both publication gates',async()=>{
 const countries=new Set(phase1Routes.map(([country])=>country));
 const expected=phase1Routes.map(([,slug,locale])=>`${locale==='en'?'':`/${locale}`}/markets/${slug}`).sort();
 assert.deepEqual(nationalMarkets.filter(page=>countries.has(page.code)).map(page=>page.path).sort(),expected);
 for(const [country,slug,locale] of phase1Routes){
  const state={market:'active',publicLocales:[]};const resolve=pageGate(state);
  await assert.rejects(resolve(slug,locale),/NOT_FOUND/);
  state.publicLocales.push(locale);state.market='preparing';await assert.rejects(resolve(slug,locale),/NOT_FOUND/);
  state.market='active';const page=await resolve(slug,locale);
  assert.equal(page.code,country);assert.equal(page.locale,locale);
  assert.equal(isPreviouslyPublishedNationalPage(page),false);
  assert(!/[€$]|\b(?:2,300|1,200|4\.9)\b/.test(JSON.stringify(page)),'no fake price, supply or review statistics');
 }
 assert(!nationalMarkets.some(page=>page.code==='CY'&&page.locale==='tr'));
 assert(!nationalMarkets.some(page=>page.code==='LU'&&page.locale==='lb'));
 assert.deepEqual([...nationalMarketCoverageReview.FI.excludedTerritories],['AX']);
 assert.deepEqual([...nationalMarketCoverageReview.DK.excludedTerritories],['FO','GL']);
 assert(nationalMarketCoverageReview.CY.open.some(note=>note.includes('Northern')));
 assert(nationalMarketCoverageReview.FI.open.length>0);
});

test('actual sitemap includes only active-country pages in explicitly public languages',async()=>{
 let languages=[{code:'en',segment:'en',hreflang:'en',nativeName:'English',dir:'ltr'}];
 let markets=phase1Routes.map(([code])=>({code,status:'preparing'}));
 const sitemap=compileModule('../app/sitemap.ts',{
  '@/lib/data':{categories:[],cities:[]},'@/lib/languages':{getSiteLanguages:async()=>languages},
  '@/lib/locales':await import('../lib/locales.ts'),
  '@/lib/publicDirectory':{getSitemapDirectory:async()=>({directoryPairs:[],helperSlugs:[]})},
  '@/lib/markets':{getMarkets:async()=>markets,isActive:row=>row.status==='active'},
  '@/lib/nationalMarkets':await import('../lib/nationalMarkets.ts'),
 }).default;
 let urls=(await sitemap()).map(row=>row.url);assert(!urls.some(url=>url.includes('/markets/')));
 markets=markets.map(row=>({...row,status:'active'}));
 urls=(await sitemap()).map(row=>row.url);
 assert.equal(urls.filter(url=>url.includes('/markets/')).length,14,'only explicitly English fallback country pages');
 assert(!urls.some(url=>url.includes('/fi/markets/')));
 for(const locale of new Set(phase1Routes.map(([, ,locale])=>locale))){
  if(locale!=='en')languages.push({code:locale,segment:locale,hreflang:locale,nativeName:locale,dir:'ltr'});
 }
 urls=(await sitemap()).map(row=>row.url);
 for(const [,slug,locale] of phase1Routes)assert(urls.includes(`https://www.swapspot.org${locale==='en'?'':`/${locale}`}/markets/${slug}`));
 assert(!urls.some(url=>url.includes('/markets/turkey')||url.includes('/markets/switzerland')));
});

test('real public-directory sitemap filtering excludes legacy demo identities and never reads discovery seeds',async()=>{
 const real='11111111-1100-0000-0000-000000000000',demo='22222222-2200-0000-0000-000000000000';
 const calls=[];
 const listings=[{helper_id:real,helper_display_name:'Real fixture',category_slug:'cleaning',category_name:'Cleaning',market_slug:'helsinki-fi',market_name:'Helsinki',country_code:'FI'},
  {helper_id:demo,helper_display_name:'Demo fixture',category_slug:'cleaning',category_name:'Cleaning',market_slug:'demo-town-fi',market_name:'Demo town',country_code:'FI'}];
 const helpers=[{id:real,user_id:'real-user'},{id:demo,user_id:'demo-user'}];
 const profiles=[{id:'real-user',email:'person@customer.invalid'},{id:'demo-user',email:'qa+demo@fixture.invalid'}];
 const module=compileModule('../lib/publicDirectory.ts',{
  react:{cache:fn=>fn},'next/cache':{unstable_cache:fn=>fn},
  '@/lib/supabaseAdmin':{appPlatformAppBase:()=>'/unused',swapspotBackend:()=> 'appplatform',supabaseAdminFetch:async path=>{
   calls.push(path);let rows;
   if(path.startsWith('public_service_listings?'))rows=new URLSearchParams(path.split('?')[1]).get('offset')==='0'?listings:[];
   else if(path.startsWith('helpers?'))rows=helpers.filter(row=>path.includes(row.id));
   else if(path.startsWith('profiles?'))rows=profiles.filter(row=>path.includes(row.id));
   else assert.fail(`Unexpected data read: ${path}`);
   return {ok:true,json:async()=>rows};
  }},
  '@/lib/data':{categories:[],cities:[]},'@/lib/directoryStrings':{},'@/lib/priceFormat':{},
 },{process:{env:{}},URLSearchParams});
 const index=await module.getSitemapDirectory();
 assert.deepEqual([...index.helperSlugs],['real-fixture-1111111111'],JSON.stringify(calls));
 assert.equal(index.directoryPairs.length,1);assert.equal(index.directoryPairs[0].marketSlug,'helsinki-fi');
 assert(calls.every(path=>!path.includes('discovery_seed')&&!path.includes('regional_demo')));
});

const phase2CountryPages=[
 ['GB','united-kingdom',['en']],['CH','switzerland',['de','fr','it','en']],['NO','norway',['nb','en']],
 ['IS','iceland',['is','en']],['AL','albania',['sq','en']],['BA','bosnia-herzegovina',['bs','hr','sr-Latn','en']],
 ['RS','serbia',['sr-Latn','en']],['ME','montenegro',['sr-Latn','bs','sq','hr','en']],
 ['MK','north-macedonia',['mk','sq','en']],['XK','kosovo',['sq','sr-Latn','en']],
 ['MD','moldova',['ro','en']],['UA','ukraine',['uk','en']],['BY','belarus',['ru','en']],['RU','russia',['ru','en']],
 ['LI','liechtenstein',['de','en']],['AD','andorra',['ca','en']],['MC','monaco',['fr','en']],['SM','san-marino',['it','en']],
 ['TR','turkiye',['tr','en']],['GE','georgia',['ka','en']],['AM','armenia',['hy','en']],['AZ','azerbaijan',['az','en']],
];

test('all22 phase2 countries have English pages and native pages only from complete packs, with both gates',async()=>{
 const legacy=new Set(['en','de','fr','ru']);
 for(const [country,slug,languages] of phase2CountryPages){
  for(const locale of languages){
   if(!legacy.has(locale)&&!existsSync(new URL(`../lib/locales/${locale}.json`,import.meta.url)))continue;
   const segment=locale.toLowerCase();
   const expected=`${segment==='en'?'':`/${segment}`}/markets/${slug}`;
   const page=nationalMarkets.find(page=>page.path===expected);
   assert(page,`Complete pack ${locale} requires explicit route ${expected}`);
   assert.equal(page.code,country);assert.equal(page.locale,segment);
   const state={market:'preparing',publicLocales:[segment]};const resolve=pageGate(state);
   await assert.rejects(resolve(slug,segment),/NOT_FOUND/);
   state.market='active';state.publicLocales=[];await assert.rejects(resolve(slug,segment),/NOT_FOUND/);
   state.publicLocales=[segment];assert.equal((await resolve(slug,segment)).path,expected);
   assert(!/[€$]|\b(?:2,300|1,200|4\.9)\b/.test(JSON.stringify(page)),'No invented price/review/supply claims');
  }
 }
 assert(!nationalMarkets.some(page=>page.code==='VA'));
 assert(nationalMarkets.some(page=>page.path==='/sr-latn/markets/serbia'));
 assert(!nationalMarkets.some(page=>page.path.includes('/sr-Latn/')));
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
