
const VERSION="0.3.0";
const KEY="dl2-companion-state-v1";
let state={health:1,stamina:1,found:{},areaDone:{},currentArea:"Houndfield"}, inhibitors=[], districts=[], safes=[], faq=[], builds=[], changelog=[], activities={}, region="all";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function loadState(){try{state={...state,...JSON.parse(localStorage.getItem(KEY)||"{}")}; state.found ||= {}}catch{}}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state)); updateDashboard()}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
async function init(){
 loadState();
 [districts,inhibitors,safes,faq,builds,changelog,activities]=await Promise.all(["data/districts.json","data/inhibitors.json","data/safes.json","data/faq.json","data/builds.json","data/changelog.json","data/activities.json"].map(x=>fetch(x).then(r=>r.json())));
 bind(); renderDistricts(); renderSafes(); renderCharacter(); renderFAQ(); renderBuilds(); renderChangelog(); renderAreas(); updateDashboard(); setupPWA();
}
function go(name){$$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name)); $$(".bottomnav button").forEach(b=>b.classList.toggle("active",b.dataset.go===name)); scrollTo(0,0)}
function bind(){
 $$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
 $("#inhSearch").oninput=renderDistricts; $("#safeSearch").oninput=renderSafes; $("#onlyInhibitor").onchange=renderSafes; $("#faqSearch").oninput=renderFAQ; $("#areaSelect").onchange=e=>{state.currentArea=e.target.value;save();renderAreas();updateDashboard()};
 $("#versionBtn").onclick=()=>{$("#changelogModal").classList.add("open");$("#changelogModal").setAttribute("aria-hidden","false")};
 $("#closeChangelog").onclick=closeChangelog; $("#changelogModal").onclick=e=>{if(e.target.id==="changelogModal")closeChangelog()};
 $$("#regionFilters button").forEach(b=>b.onclick=()=>{region=b.dataset.region;$$("#regionFilters button").forEach(x=>x.classList.toggle("active",x===b));renderDistricts()});
 $("#healthRange").oninput=e=>{state.health=+e.target.value;saveState();renderCharacter()};
 $("#staminaRange").oninput=e=>{state.stamina=+e.target.value;saveState();renderCharacter()};
 $("#exportBtn").onclick=exportData; $("#importFile").onchange=importData;
 $("#resetBtn").onclick=()=>{if(confirm("Wirklich alle lokalen DL2-Companion-Daten löschen?")){localStorage.removeItem(KEY);state={health:1,stamina:1,found:{}};renderDistricts();renderCharacter();updateDashboard();toast("Lokale Daten gelöscht")}};
}
function foundCount(){return inhibitors.reduce((a,x)=>a+(state.found[x.id]?x.count:0),0)}
function updateDashboard(){const op=overallProgress();if($("#overallPct")){$("#overallPct").textContent=op.pct+" % GESAMTFORTSCHRITT";$("#overallBar").style.width=op.pct+"%";const ap=districtProgress(state.currentArea);$("#currentAreaName").textContent=state.currentArea;$("#currentAreaMissing").textContent=(ap.total-ap.done)+" von "+ap.total+" Einträgen noch offen";}
 const n=foundCount(), pct=Math.round(n/126*100);
 $("#dashFound").textContent=`${n} / 126`;$("#dashBar").style.width=pct+"%";$("#dashPercent").textContent=pct+" % dokumentiert";
 $("#dashHealth").textContent=state.health;$("#dashStamina").textContent=state.stamina;
 if($("#inhTotal")){$("#inhTotal").textContent=`${n} / 126`;$("#inhBar").style.width=pct+"%"}
}
function renderDistricts(){
 if(!inhibitors.length)return;
 const q=$("#inhSearch").value.toLowerCase().trim();
 const wrap=$("#districtList"); wrap.innerHTML="";
 districts.filter(d=>region==="all"||d.region===region).forEach(d=>{
   const rows=inhibitors.filter(x=>x.district===d.id && (!q || (x.name+" "+x.description+" "+d.name).toLowerCase().includes(q)));
   if(!rows.length)return;
   const done=inhibitors.filter(x=>x.district===d.id&&state.found[x.id]).reduce((a,x)=>a+x.count,0);
   const box=document.createElement("div"); box.className="district"+(q?" open":"");
   box.innerHTML=`<button><span class="dname"><b>${d.name}</b><small>${d.region}</small></span><span class="dcount">${done} / ${d.count}</span></button><div class="items"></div>`;
   box.querySelector("button").onclick=()=>box.classList.toggle("open");
   const items=box.querySelector(".items");
   rows.forEach(x=>{
      const row=document.createElement("label");row.className="inhitem"+(state.found[x.id]?" done":"");
      row.innerHTML=`<input type="checkbox" ${state.found[x.id]?"checked":""}><span><b>${x.name}</b><p>${x.description}</p></span><span class="countbadge">×${x.count}</span>`;
      row.querySelector("input").onchange=e=>{state.found[x.id]=e.target.checked; if(!e.target.checked)delete state.found[x.id];saveState();renderDistricts()};
      items.appendChild(row)
   });
   wrap.appendChild(box)
 });
 updateDashboard()
}
function renderSafes(){
 if(!safes.length)return;
 const q=$("#safeSearch").value.toLowerCase().trim(), only=$("#onlyInhibitor").checked;
 const rows=safes.filter(s=>(!only||s.tag==="inhibitor")&&(!q||(s.district+" "+s.place+" "+s.code+" "+s.loot).toLowerCase().includes(q)));
 $("#safeCount").textContent=`${rows.length} Treffer`;const w=$("#safeList");w.innerHTML="";
 rows.forEach(s=>{const e=document.createElement("article");e.className="safeitem";e.innerHTML=`<div class="safehead"><div><div class="districttag">${s.district.toUpperCase()}</div><h3>${s.place}</h3></div><div class="code">${s.code}</div></div><div class="loot ${s.tag==="inhibitor"?"hot":""}">${s.tag==="inhibitor"?"HEMMSTOFF · ":""}${s.loot}</div><div class="safehint">${s.hint||""}</div>`;w.appendChild(e)})
}

function areaItems(d){const out=[];inhibitors.filter(x=>x.district===d).forEach(x=>out.push({id:"inh:"+x.id,type:"Hemmstoffe",name:x.name+" ("+(x.count||1)+")",inh:x}));safes.filter(x=>x.district===d||x.district.startsWith(d+" /")||x.district.endsWith("/ "+d)).forEach(x=>out.push({id:"safe:"+x.id,type:"Safe-Codes",name:x.place+" · "+x.code}));return out}
function itemDone(x){return x.type==="Hemmstoffe"?!!state.found[x.inh.id]:!!state.areaDone[x.id]}
function districtProgress(d){const a=areaItems(d),done=a.filter(itemDone).length;return {done,total:a.length,pct:a.length?Math.round(done/a.length*100):0}}
function overallProgress(){const a=districts.map(d=>districtProgress(d.name)),total=a.reduce((s,x)=>s+x.total,0),done=a.reduce((s,x)=>s+x.done,0);return {done,total,pct:total?Math.round(done/total*100):0}}
function renderAreas(){if(!districts.length)return;const sel=$("#areaSelect");sel.innerHTML=districts.map(d=>`<option ${d.name===state.currentArea?"selected":""}>${d.name}</option>`).join("");const d=state.currentArea,p=districtProgress(d),items=areaItems(d);$("#areaHero").innerHTML=`<div class="eyebrow">AKTUELLER BEZIRK</div><h3>${d}</h3><div class="bigpct">${p.pct} %</div><div class="progress"><i style="width:${p.pct}%"></i></div><small>${p.done} von ${p.total} Einträgen erledigt</small>`;const open=items.filter(x=>!itemDone(x)),g={};open.forEach(x=>(g[x.type]??=[]).push(x));$("#missingHere").innerHTML=`<h3>WAS FEHLT MIR HIER?</h3><p>${open.length?Object.entries(g).map(([k,v])=>`${k}: <b>${v.length}</b>`).join(" · "):"<b>Bezirk abgeschlossen.</b>"}</p>`;const all={};items.forEach(x=>(all[x.type]??=[]).push(x));$("#areaChecklist").innerHTML=Object.entries(all).map(([type,list])=>`<div class="area-group"><div class="area-group-head"><b>${type.toUpperCase()}</b><small>${list.filter(itemDone).length}/${list.length}</small></div>${list.map(x=>`<label class="area-task ${itemDone(x)?"done":""}"><input type="checkbox" data-area-id="${encodeURIComponent(x.id)}" ${itemDone(x)?"checked":""}><span>${x.name}</span></label>`).join("")}</div>`).join("")||'<div class="area-empty">Keine Einträge.</div>';$$("[data-area-id]").forEach(c=>c.onchange=()=>{const id=decodeURIComponent(c.dataset.areaId),x=items.find(i=>i.id===id);if(x.type==="Hemmstoffe")state.found[x.inh.id]=c.checked;else state.areaDone[id]=c.checked;save();renderAreas();renderDistricts();updateDashboard()})}
function renderFAQ(){
 if(!faq.length)return; const q=$("#faqSearch").value.toLowerCase().trim(),w=$("#faqList");w.innerHTML="";
 faq.filter(x=>!q||(x.q+" "+x.a).toLowerCase().includes(q)).forEach(x=>{const e=document.createElement("article");e.className="faqitem";e.innerHTML=`<button><b>${x.q}</b><span class="chev">+</span></button><div class="faqbody">${x.a}</div>`;e.querySelector("button").onclick=()=>e.classList.toggle("open");w.appendChild(e)})
}
function renderBuilds(){
 if(!builds.length)return; const w=$("#buildList");w.innerHTML="";
 builds.forEach(x=>{const e=document.createElement("article");e.className="buildcard";e.innerHTML=`<button><span class="buildtitle"><small>${x.subtitle}</small><b>${x.name}</b></span><span class="chev">+</span></button><div class="buildbody"><span class="buildclass">${x.class}</span><p>${x.goal}</p><h4>PRIORITÄTEN</h4><ol>${x.priorities.map(v=>`<li>${v}</li>`).join("")}</ol><h4>SINNVOLL DAZU</h4><ul>${x.extras.map(v=>`<li>${v}</li>`).join("")}</ul><p class="buildnote">${x.note}</p></div>`;e.querySelector("button").onclick=()=>e.classList.toggle("open");w.appendChild(e)})
}
function renderChangelog(){
 if(!changelog.length)return;$("#changelogList").innerHTML=changelog.slice(0,5).map(x=>`<div class="change"><div class="changehead"><b>v${x.version}</b><small>${x.date}</small></div><ul>${x.changes.map(v=>`<li>${v}</li>`).join("")}</ul></div>`).join("")
}
function closeChangelog(){$("#changelogModal").classList.remove("open");$("#changelogModal").setAttribute("aria-hidden","true")}

function renderCharacter(){
 $("#healthRange").value=state.health;$("#staminaRange").value=state.stamina;$("#healthLabel").textContent=state.health;$("#staminaLabel").textContent=state.stamina;
 const attributeValue=lvl=>160+(lvl-1)*20;
 $("#healthValue").textContent=attributeValue(state.health);$("#staminaValue").textContent=attributeValue(state.stamina);
 const spent=(state.health+state.stamina)*3, needed=(52-state.health-state.stamina)*3;
 $("#spentInh").textContent=spent;$("#neededInh").textContent=needed;
 let html=`<div class="levelrow head"><span>Stufe</span><span>Kosten bis hier</span><span>Upgrade-Bonus*</span></div>`;
 for(let i=1;i<=26;i++) html+=`<div class="levelrow"><span>${i}</span><span>${i*3} Hemmstoffe</span><span>+${(i-1)*20}</span></div>`;
 html+=`<div class="levelrow"><span colspan="3">* kumulativer Bonus durch Hemmstoff-Upgrades; angezeigte Spielwerte können zusätzlich durch Spielerrang beeinflusst werden.</span><span></span><span></span></div>`;
 $("#levelTable").innerHTML=html;
}
function exportData(){
 const blob=new Blob([JSON.stringify({app:"DL2 Companion",version:VERSION,exported:new Date().toISOString(),state},null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`dl2-companion-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup erstellt")
}
function importData(e){
 const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.state)throw 0;state=d.state;saveState();renderDistricts();renderCharacter();toast("Backup importiert")}catch{toast("Ungültiges Backup")}};r.readAsText(f);e.target.value=""
}
let deferredPrompt;
function setupPWA(){
 if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js");
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});
 $("#installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true}}
}
init().catch(e=>{console.error(e);toast("Daten konnten nicht geladen werden")});
