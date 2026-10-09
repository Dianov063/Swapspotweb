// Isolated staging-only reset form. Reuses the reviewed website translations.
// No backend selection from the URL: requests always target this staging origin.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../app/auth/reset-password/strings.ts', import.meta.url), 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { exports, require: () => ({ isLocale: code => Object.hasOwn(exports.resetStrings, code) }), URLSearchParams });
const copy = exports.resetStrings;
if (Object.keys(copy).length !== 16) throw new Error('Expected all 16 languages');
const output = resolve(process.argv[2] || '.local/staging-reset-page');
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'index.html'), `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>SwapSpot — Staging</title>
<link rel="stylesheet" href="/auth/reset-assets/reset.css"><main><small>SwapSpot · Staging</small><h1 id="title"></h1><p id="intro"></p><p id="notice" role="status"></p><form hidden id="form"><label><span id="newLabel"></span><input name="password" type="password" required minlength="8" autocomplete="new-password"></label><label><span id="confirmLabel"></span><input name="confirm" type="password" required minlength="8" autocomplete="new-password"></label><button id="save" type="submit"></button></form></main><script src="/auth/reset-assets/reset.js" defer></script></html>`);
writeFileSync(resolve(output, 'reset.css'), 'body{margin:0;background:#f4f7f3;color:#193c2d;font:17px system-ui,sans-serif}main{max-width:520px;margin:8vh auto;padding:30px}small{color:#43705a}h1{font-size:36px}p{line-height:1.6}label{display:grid;gap:8px;margin:18px 0}input,button{font:inherit;padding:14px;border-radius:8px;border:1px solid #b5cabd}button{background:#216742;color:white;cursor:pointer;width:100%}button:disabled{opacity:.6}[hidden]{display:none}');
writeFileSync(resolve(output, 'reset.js'), `"use strict";
const copy=${JSON.stringify(copy)};
const candidates=[new URLSearchParams(location.search).get('lang')||'',...(navigator.languages||[navigator.language])];
let locale='en';for(const raw of candidates){const code=raw.toLowerCase().replace('_','-');const base=code.startsWith('zh')?'zh':code.split('-')[0];if(copy[base]){locale=base;break;}}
const s=copy[locale];document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';
const byId=id=>document.getElementById(id);for(const [id,key] of [['title','title'],['intro','intro'],['newLabel','newPassword'],['confirmLabel','repeatPassword'],['save','save']])byId(id).textContent=s[key];
const token=new URLSearchParams(location.hash.slice(1)).get('token');
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
const form=byId('form'),notice=byId('notice'),button=byId('save');
if(token && token.length>=16 && token.length<=256)form.hidden=false;else notice.textContent=s.openLink;
form.addEventListener('submit',async event=>{event.preventDefault();const password=form.elements.password.value;if(password.length<8){notice.textContent=s.tooShort;return;}if(password!==form.elements.confirm.value){notice.textContent=s.mismatch;return;}button.disabled=true;button.textContent=s.saving;try{const response=await fetch('/v1/auth/reset-password',{method:'POST',headers:{'Content-Type':'application/json','X-App-Slug':'swapspot_staging'},body:JSON.stringify({app_slug:'swapspot_staging',token,new_password:password})});if(!response.ok)throw new Error('reset failed');form.hidden=true;notice.textContent=s.done;form.reset();}catch{notice.textContent=s.invalid;}finally{button.disabled=false;button.textContent=s.save;}});
`);
console.log(JSON.stringify({ output, languages: Object.keys(copy).length, backend: 'same-origin', appSlug: 'swapspot_staging' }));
