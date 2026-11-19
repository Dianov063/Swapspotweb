const BASE='/admin/server';
const $=id=>document.getElementById(id);
const names={appplatform_prod:'AppPlatform · общий API',swapspot_web:'SwapSpot',mailhub:'MailHub',ledgerhound:'LedgerHound',towhub_web:'TowHub',voicedata_beta:'VoiceData',logihub_prod:'LogiHub',maybachmiami_prod:'Maybach Miami',immigrationtracker_r1a:'ImmigrationTracker · API',immigrationtracker_sandbox_demo:'ImmigrationTracker · демо',server_ops:'Server Ops'};
let data=null,hours=24;
const num=n=>typeof n==='number'&&Number.isFinite(n);
const fmt=n=>num(n)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(n):'—';
const gib=n=>num(n)?fmt(n/1024**3)+' ГиБ':'—';
const mib=n=>num(n)?fmt(n/1024**2)+' МиБ':'—';
const date=t=>t?new Date(t*1000).toLocaleString('ru-RU',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
function text(id,value){$(id).textContent=value;}
function element(tag,value,cls){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(cls)e.className=cls;return e;}
function badge(value,severity=''){return element('span',value,'badge '+severity);}
function row(values){const tr=element('tr');for(const v of values){const td=element('td');v instanceof Node?td.append(v):td.textContent=v;tr.append(td);}return tr;}
async function request(path,options){const r=await fetch(BASE+path,{cache:'no-store',...options});let result={};try{result=await r.json();}catch{}if(!r.ok){const err=Error(result.error||'Нет ответа сервера');err.status=r.status;throw err;}return result;}
function chart(points,memTotal){const target=$('chart');target.replaceChildren();if(!points.length){target.append(element('p','История ещё накапливается.','empty'));return;}
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 900 220');
 function shape(tag,attrs){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));svg.append(e);return e;}
 for(const n of [0,25,50,75,100]){const y=178-n*1.5;shape('line',{x1:34,y1:y,x2:888,y2:y,stroke:'#243247','stroke-width':1,'stroke-dasharray':'3 5'});shape('text',{x:1,y:y+4,fill:'#6d829f','font-size':10}).textContent=n;}
 const min=points[0].ts,max=points.at(-1).ts;
 const xpos=p=>34+(p.ts-min)/Math.max(max-min,60)*854;
 for(const [key,color]of [['cpu','#8bddbe'],['memory','#91b8fc']]){const valid=points.filter(p=>num(p[key]));const d=valid.map((p,i)=>(i?'L':'M')+xpos(p)+','+(178-Math.min(100,key==='memory'?p[key]/memTotal*100:p[key])*1.5)).join(' ');shape('path',{d,fill:'none',stroke:color,'stroke-width':2,'stroke-linejoin':'round'});if(valid.length===1)shape('circle',{cx:xpos(valid[0]),cy:178-(key==='memory'?valid[0][key]/memTotal*100:valid[0][key])*1.5,r:3,fill:color});}
 for(let i=0;i<5;i++){const t=min+(max-min)*i/4;shape('text',{x:34+854*i/4,y:210,fill:'#6d829f','font-size':10,'text-anchor':i===4?'end':i===0?'start':'middle'}).textContent=new Date(t*1000).toLocaleString('ru-RU',{timeZone:'America/New_York',...(hours===720?{day:'numeric',month:'short'}:{hour:'2-digit',minute:'2-digit'})});}
 svg.addEventListener('mousemove',event=>{const rect=svg.getBoundingClientRect();const fraction=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));const point=points[Math.min(points.length-1,Math.round(fraction*(points.length-1)))];text('chart-detail',date(point.ts)+' · CPU '+fmt(point.cpu)+'% · Память '+gib(point.memory)+(num(point.requests)?' · Запросов за интервал: '+fmt(point.requests):''));});target.append(svg);
}
function render(value){data=value;$('login').hidden=true;$('content').hidden=false;const s=value.latest,h=s.host;
 text('fresh',value.age_seconds<180?'● Обновлено '+date(s.ts):'Данные устарели · '+date(s.ts));$('fresh').classList.toggle('bad',value.age_seconds>=180);
 text('cpu',fmt(h.cpu_pct)+'%');text('load','Load '+fmt(h.load)+' · '+h.cores+' ядра');$('cpu-bar').style.width=Math.min(h.cpu_pct||0,100)+'%';
 const used=h.mem_total-h.mem_available;text('memory',gib(used));text('memory-meta','из '+gib(h.mem_total)+' · доступно '+gib(h.mem_available));$('memory-bar').style.width=used/h.mem_total*100+'%';
 text('disk',fmt(h.disk_pct)+'%');text('disk-meta','свободно '+gib(h.disk_free)+' из '+gib(h.disk_total));$('disk-bar').style.width=h.disk_pct+'%';
 const projects=Object.entries(s.projects);text('project-count',projects.length);text('container-count',projects.reduce((n,[,p])=>n+(p.container_count||0),0)+' работающих контейнеров');
 const ext=value.external;text('external-state',ext?'Внешняя проверка: '+(Date.now()/1000-ext.checked_at>180?'устарела':ext.reason?'сбой':'работает')+' · '+date(ext.checked_at):'Внешняя проверка: ожидается первое измерение');
 const active=value.incidents.filter(i=>!i.closed);$('alerts').hidden=!active.length&&value.age_seconds<180;$('alerts').replaceChildren();
 if(value.age_seconds>=180)$('alerts').append(element('strong','Сборщик не обновил данные вовремя. Показания ниже нельзя считать текущими.'));
 for(const a of active)$('alerts').append(element('p',(names[a.project]||a.project)+': '+a.message));
 text('coverage','Фактически собрано '+fmt(value.coverage_hours)+' ч из выбранных '+hours+' ч. Отсутствующая история не считается нулевым расходом.');chart(value.chart,h.mem_total);
 const body=$('project-rows');body.replaceChildren();let routeTotals={};
 for(const [name,p]of projects.sort((a,b)=>(value.totals[b[0]]?.cpu_seconds||0)-(value.totals[a[0]]?.cpu_seconds||0))){const total=value.totals[name]||{};const issues=active.filter(a=>a.project===name);const status=issues.length?badge(issues.length+' предупрежд.',issues.some(a=>a.severity==='critical')?'critical':'warning'):badge('Работает');
  const title=element('span',names[name]||name);title.append(element('br'));title.append(element('small',name));
  body.append(row([title,fmt(p.cpu_pct)+'%',fmt(total.cpu_seconds/60)+' мин',mib(p.memory),fmt(total.requests),fmt(total.errors),num(p.cache_bytes)?mib(p.cache_bytes):'—',num(p.volume_bytes)?gib(p.volume_bytes)+(p.volumes_measured<p.volume_count?' *':''):'—',status]));
  for(const[r,n]of Object.entries(total.routes||{}))routeTotals[r]=(routeTotals[r]||0)+n;
 }
 $('routes').replaceChildren();for(const[name,count]of Object.entries(routeTotals).sort((a,b)=>b[1]-a[1]))$('routes').append(element('span',name+': '+fmt(count)));
 $('incident-list').replaceChildren();for(const item of value.incidents.slice(0,15)){const e=element('div',undefined,'event'),body=element('div',undefined,'event-body');e.append(badge(item.closed?'Закрыт':item.severity,item.closed?'':item.severity));body.append(element('strong',names[item.project]||item.project),element('p',item.message),element('small',date(item.opened)+(item.closed?' → '+date(item.closed):' · активен')));e.append(body);$('incident-list').append(e);}if(!value.incidents.length)$('incident-list').append(element('div','Инцидентов с начала наблюдения не зарегистрировано.','empty'));
 $('notification-list').replaceChildren();for(const item of value.notifications.slice(0,12)){const e=element('div',undefined,'event');e.append(badge(item.sent?'Принято MailHub':item.error?'Ошибка отправки':'Ожидает',item.error?'warning':''));const body=element('div',undefined,'event-body');body.append(element('p',item.key),element('small',date(item.sent||item.created)+(item.error?' · '+item.error:'')));e.append(body);$('notification-list').append(e);}if(!value.notifications.length)$('notification-list').append(element('div','Писем пока не требовалось. Сводка — ежедневно в 11:05.','empty'));
 $('daily-rows').replaceChildren();for(const d of [...value.daily].reverse().slice(0,150))$('daily-rows').append(row([d.day,names[d.project]||d.project,fmt(d.cpu_seconds/60),mib(d.memory_sum/d.samples)+' / '+mib(d.memory_peak),fmt(d.requests)+' / '+fmt(d.errors),fmt(d.samples)]));
}
async function load(){try{render(await request('/api/state?hours='+hours));}catch(e){if(e.status===401){$('login').hidden=false;$('content').hidden=true;text('fresh','Требуется вход');}else{text('fresh','Ошибка обновления');$('fresh').classList.add('bad');text('login-error',e.message);}}}
$('login-form').addEventListener('submit',async event=>{event.preventDefault();text('login-error','');try{await request('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value})});$('password').value='';await load();}catch(e){text('login-error',e.message);}});
$('logout').addEventListener('click',async()=>{await request('/api/logout',{method:'POST'});location.reload();});$('refresh').addEventListener('click',load);
for(const b of document.querySelectorAll('[data-hours]'))b.addEventListener('click',()=>{hours=Number(b.dataset.hours);for(const c of document.querySelectorAll('[data-hours]'))c.classList.toggle('selected',c===b);load();});
$('csv').addEventListener('click',()=>{if(!data)return;const lines=[['Project','CPU seconds','Requests','5xx','Response bytes'],...Object.entries(data.totals).map(([p,t])=>[p,t.cpu_seconds,t.requests,t.errors,t.response_bytes])];const safe=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const blob=new Blob(['\ufeff'+lines.map(r=>r.map(safe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=element('a');a.href=url;a.download='ovh-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);});
load();setInterval(()=>{if(!document.hidden)load();},60000);
