
const VERSION="0.8.7";
const KEY="dl2-companion-state-v1";
const SYNC_API="https://dl2-companion-sync.ralf-music.workers.dev";
const freshState=()=>({health:1,stamina:1,pilgrimRank:1,language:"de",found:{},areaDone:{},safeDone:{},currentArea:"Houndfield",airDone:{},greDone:{},sunkenDone:{},quarantineDone:{},duckDone:{},collectDone:{},collectionGameCounts:{memento:0,tape:0,graffiti:0}}); let state=freshState(), inhibitors=[], districts=[], safes=[], faq=[], builds=[], changelog=[], activities={}, airdrops=[], gre=[], sunken=[], quarantine=[], ducks=[], airFilter="all", greFilter="all", sunkenFilter="all", region="all", collectibles=[], langDE={}, langEN={}, collectType="all";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function normalizeState(s={}){
 const n={...freshState(),...s,found:s.found||{},areaDone:s.areaDone||{},safeDone:s.safeDone||{},airDone:s.airDone||{},greDone:s.greDone||{},sunkenDone:s.sunkenDone||{},quarantineDone:s.quarantineDone||{},duckDone:s.duckDone||{},collectDone:s.collectDone||{},collectionGameCounts:{...freshState().collectionGameCounts,...(s.collectionGameCounts||{})}};
 Object.keys(n.areaDone).filter(k=>k.startsWith("safe:")&&n.areaDone[k]).forEach(k=>n.safeDone[k.slice(5)]=true);
 return n
} function loadState(){try{state=normalizeState(JSON.parse(localStorage.getItem(KEY)||"{}"))}catch{state=freshState()}}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state)); updateDashboard()}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
async function init(){
 loadState();
 [districts,inhibitors,safes,faq,builds,changelog,activities,airdrops,gre,sunken,quarantine,ducks,collectibles,langDE,langEN]=await Promise.all(["data/districts.json","data/inhibitors.json","data/safes.json","data/faq.json","data/builds.json","data/changelog.json","data/activities.json","data/airdrops.json","data/gre-anomalies.json","data/sunken-airdrops.json","data/gre-quarantine.json","data/ducks.json","data/collectibles.json","data/lang-de.json","data/lang-en.json"].map(x=>fetch(x).then(r=>r.json())));
 reconcileLinkedState(); localStorage.setItem(KEY,JSON.stringify(state));
 bind(); applyLanguage(); renderDistricts(); renderSafes(); renderCharacter(); renderFAQ(); renderBuilds(); renderAll(); setupPWA();
}
function go(name){$$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name)); $$(".bottomnav button").forEach(b=>b.classList.toggle("active",b.dataset.go===name)); scrollTo(0,0)}
function bind(){
 $("#languageSelect").value=state.language||"de";
 $("#languageSelect").onchange=e=>{state.language=e.target.value;saveState();applyLanguage();renderAll();applyLanguage()};
 $("#collectSearch").oninput=renderCollectibles;
 $("#collectMissing").onchange=renderCollectibles;
 $$("[data-collecttype]").forEach(b=>b.onclick=()=>{collectType=b.dataset.collecttype;$$("[data-collecttype]").forEach(x=>x.classList.toggle("active",x===b));renderCollectibles()});
 [["gameMemento","memento",209],["gameTape","tape",68],["gameGraffiti","graffiti",71]].forEach(([id,key,max])=>{$("#"+id).onchange=e=>{state.collectionGameCounts[key]=Math.max(0,Math.min(max,+e.target.value||0));saveState();renderCollectibles()}});

 $$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
 $("#inhSearch").oninput=renderDistricts; $("#safeSearch").oninput=renderSafes; $("#onlyInhibitor").onchange=renderSafes; $("#onlyMissingSafes").onchange=renderSafes; $("#faqSearch").oninput=renderFAQ; $$("[data-airfilter]").forEach(b=>b.onclick=()=>{airFilter=b.dataset.airfilter;$$("[data-airfilter]").forEach(x=>x.classList.toggle("active",x===b));renderAirdrops()});
$$("[data-grefilter]").forEach(b=>b.onclick=()=>{greFilter=b.dataset.grefilter;$$("[data-grefilter]").forEach(x=>x.classList.toggle("active",x===b));renderGRE()});
$$("[data-sunkenfilter]").forEach(b=>b.onclick=()=>{sunkenFilter=b.dataset.sunkenfilter;$$("[data-sunkenfilter]").forEach(x=>x.classList.toggle("active",x===b));renderSunken()}); $("#areaSelect").onchange=e=>{state.currentArea=e.target.value;saveState();renderAreas();updateDashboard()};
 $("#versionBtn").onclick=()=>{$("#changelogModal").classList.add("open");$("#changelogModal").setAttribute("aria-hidden","false")};
 $("#closeChangelog").onclick=closeChangelog; $("#changelogModal").onclick=e=>{if(e.target.id==="changelogModal")closeChangelog()};
 $$("#regionFilters button").forEach(b=>b.onclick=()=>{region=b.dataset.region;$$("#regionFilters button").forEach(x=>x.classList.toggle("active",x===b));renderDistricts()});
 $("#healthRange").oninput=e=>{state.health=+e.target.value;saveState();renderCharacter()};
 $("#staminaRange").oninput=e=>{state.stamina=+e.target.value;saveState();renderCharacter()};
 $("#pilgrimRange").oninput=e=>{state.pilgrimRank=+e.target.value;saveState();renderCharacter()};
 $("#exportBtn").onclick=exportData; $("#importFile").onchange=importData;
 $("#syncCreateBtn").onclick=createSyncCode; $("#syncRedeemBtn").onclick=redeemSyncCode; $("#syncCopyBtn").onclick=copySyncCode;
 $("#syncInput").oninput=e=>{let v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);e.target.value=v.length>4?v.slice(0,4)+"-"+v.slice(4):v};
 $("#collectClose").onclick=closeCollectDetail;
 $("#collectModal").onclick=e=>{if(e.target.id==="collectModal")closeCollectDetail()};
 $("#resetBtn").onclick=()=>{if(confirm("Wirklich alle lokalen DL2-Companion-Daten löschen?")){localStorage.removeItem(KEY);state=freshState();saveState();renderAll();toast("Lokale Daten gelöscht")}};
}

const SAFE_INHIBITOR_LINKS={"safe-02":"inh-005","safe-09":"inh-028","safe-12":"inh-037","safe-16":"inh-057","safe-18":"inh-059"};
const AIR_INHIBITOR_LINKS={"THB-04B":"inh-008","THB-1L0":"inh-029","THB-UT0":"inh-042","THB-NW4":"inh-043","THB-4UL":"inh-066"};
const QUARANTINE_INHIBITOR_LINKS={"q1":"inh-002","q2":"inh-016","q3":"inh-026","q4":"inh-049","q5":"inh-056","q6":"inh-063"};
function setFlag(obj,key,val){if(val)obj[key]=true;else delete obj[key]}
function linkedByInhibitor(id){
 const safe=Object.entries(SAFE_INHIBITOR_LINKS).find(([,v])=>v===id)?.[0];
 const air=Object.entries(AIR_INHIBITOR_LINKS).find(([,v])=>v===id)?.[0];
 const anomaly=gre.find(x=>x.inhibitorId===id)?.id;
 const q=Object.entries(QUARANTINE_INHIBITOR_LINKS).find(([,v])=>v===id)?.[0];
 return {safe,air,anomaly,q}
}
function syncFromInhibitor(id,val){
 const l=linkedByInhibitor(id);
 if(l.safe)setFlag(state.safeDone,l.safe,val);
 if(l.air)setFlag(state.airDone,l.air,val);
 if(l.anomaly)setFlag(state.greDone,l.anomaly,val);
 if(l.q){const q=quarantine.find(x=>x.id===l.q);if(q)q.crates.forEach((_,i)=>setFlag(state.quarantineDone,l.q+"-"+i,val))}
}
function syncFromSafe(id,val){const inh=SAFE_INHIBITOR_LINKS[id];if(inh)setFlag(state.found,inh,val)}
function syncFromAir(id,val){const inh=AIR_INHIBITOR_LINKS[id];if(inh)setFlag(state.found,inh,val)}
function syncFromGRE(id,val){const x=gre.find(a=>a.id===id);if(x?.inhibitorId)setFlag(state.found,x.inhibitorId,val)}
function syncFromQuarantine(id){
 const q=quarantine.find(x=>x.id===id),inh=QUARANTINE_INHIBITOR_LINKS[id];if(!q||!inh)return;
 setFlag(state.found,inh,q.crates.every((_,i)=>state.quarantineDone[id+"-"+i]));
}
function reconcileLinkedState(){
 Object.entries(SAFE_INHIBITOR_LINKS).forEach(([a,i])=>{const v=!!state.safeDone[a]||!!state.found[i];setFlag(state.safeDone,a,v);setFlag(state.found,i,v)});
 Object.entries(AIR_INHIBITOR_LINKS).forEach(([a,i])=>{const v=!!state.airDone[a]||!!state.found[i];setFlag(state.airDone,a,v);setFlag(state.found,i,v)});
 gre.forEach(x=>{if(!x.inhibitorId)return;const v=!!state.greDone[x.id]||!!state.found[x.inhibitorId];setFlag(state.greDone,x.id,v);setFlag(state.found,x.inhibitorId,v)});
 Object.entries(QUARANTINE_INHIBITOR_LINKS).forEach(([qid,iid])=>{const q=quarantine.find(x=>x.id===qid);if(!q)return;
   if(state.found[iid])q.crates.forEach((_,i)=>setFlag(state.quarantineDone,qid+"-"+i,true));
   else if(q.crates.every((_,i)=>state.quarantineDone[qid+"-"+i]))setFlag(state.found,iid,true);
 });
}

function foundCount(){return inhibitors.reduce((a,x)=>a+(state.found[x.id]?x.count:0),0)}
function updateDashboard(){const op=overallProgress();if($("#overallPct")){$("#overallPct").textContent=op.pct+" % COMPANION-FORTSCHRITT";$("#overallBar").style.width=op.pct+"%";if($("#overallCount"))$("#overallCount").textContent=op.done+" von "+op.total+" Einträgen abgeschlossen";const ap=districtProgress(state.currentArea);$("#currentAreaName").textContent=state.currentArea;$("#currentAreaMissing").textContent=(ap.total-ap.done)+" von "+ap.total+" Einträgen noch offen";}
 const n=foundCount(), pct=Math.round(n/126*100);
 $("#dashFound").textContent=`${n} / 126`;$("#dashBar").style.width=pct+"%";$("#dashPercent").textContent=pct+" % dokumentiert";if($("#inhDash"))$("#inhDash").textContent=`${n} / 126`;
 $("#dashHealth").textContent=state.health;$("#dashStamina").textContent=state.stamina;
 if($("#inhTotal")){$("#inhTotal").textContent=`${n} / 126`;$("#inhBar").style.width=pct+"%"}
}
function renderDistricts(){
 if(!inhibitors.length)return;
 const q=$("#inhSearch").value.toLowerCase().trim();
 const wrap=$("#districtList");
 const openDistricts=new Set([...wrap.querySelectorAll(".district.open")].map(x=>x.dataset.district).filter(Boolean));
 wrap.innerHTML="";
 districts.filter(d=>region==="all"||d.region===region).forEach(d=>{
   const rows=inhibitors.filter(x=>x.district===d.id && (!q || (x.name+" "+x.description+" "+d.name).toLowerCase().includes(q)));
   if(!rows.length)return;
   const done=inhibitors.filter(x=>x.district===d.id&&state.found[x.id]).reduce((a,x)=>a+x.count,0);
   const box=document.createElement("div");
   box.dataset.district=d.id;
   box.className="district"+((q||openDistricts.has(d.id))?" open":"");
   box.innerHTML=`<button><span class="dname"><b>${d.name}</b><small>${d.region}</small></span><span class="dcount">${done} / ${d.count}</span></button><div class="items"></div>`;
   box.querySelector("button").onclick=()=>box.classList.toggle("open");
   const items=box.querySelector(".items");
   rows.forEach(x=>{
      const row=document.createElement("label");row.className="inhitem"+(state.found[x.id]?" done":"");
      row.innerHTML=`<input type="checkbox" ${state.found[x.id]?"checked":""}><span><b>${x.name}</b><p>${x.description}</p><a class="yt-find" onclick="event.stopPropagation()" target="_blank" rel="noopener" href="${ytLink(`Dying Light 2 ${d.name} ${x.name} ${x.searchAlias||""} ${x.description} Inhibitor location`)}">▶ FUNDORT AUF YOUTUBE</a></span><span class="countbadge">×${x.count}</span>`;
      row.querySelector("input").onchange=e=>{setFlag(state.found,x.id,e.target.checked);syncFromInhibitor(x.id,e.target.checked);saveState();renderAll()};
      items.appendChild(row)
   });
   wrap.appendChild(box)
 });
 updateDashboard()
}
function renderSafes(){
 if(!safes.length)return;
 const q=$("#safeSearch").value.toLowerCase().trim(), only=$("#onlyInhibitor").checked, missing=$("#onlyMissingSafes").checked;
 const totalDone=safes.filter(s=>state.safeDone[s.id]).length;
 $("#safeProgress").textContent=`${totalDone}/${safes.length}`;
 const rows=safes.filter(s=>(!only||s.tag==="inhibitor")&&(!missing||!state.safeDone[s.id])&&(!q||(s.district+" "+s.place+" "+s.code+" "+s.loot).toLowerCase().includes(q)));
 $("#safeCount").textContent=`${rows.length} von ${safes.length} angezeigt`;
 const w=$("#safeList");w.innerHTML="";
 rows.forEach(s=>{
   const e=document.createElement("article");e.className="safeitem"+(state.safeDone[s.id]?" done":"");
   e.innerHTML=`<input class="safe-check" type="checkbox" data-safe="${s.id}" ${state.safeDone[s.id]?"checked":""}><div class="safehead"><div><div class="districttag">${s.district.toUpperCase()}</div><h3>${s.place}</h3></div><div class="code">${s.code}</div></div><div class="loot ${s.tag==="inhibitor"?"hot":""}">${s.tag==="inhibitor"?"HEMMSTOFF · ":""}${s.loot}</div><div class="safehint">${s.hint||""}</div><a class="yt-find" target="_blank" rel="noopener" href="${ytLink(`Dying Light 2 ${s.district} ${s.place} safe code ${s.code} location`)}">▶ FUNDORT AUF YOUTUBE</a>`;
   w.appendChild(e)
 });
 $$("[data-safe]").forEach(c=>c.onchange=()=>{setFlag(state.safeDone,c.dataset.safe,c.checked);syncFromSafe(c.dataset.safe,c.checked);saveState();renderSafes();renderDistricts();renderAreas();updateDashboard()})
}


function L(key){const d=state.language==="en"?langEN:langDE;return d[key]||langDE[key]||key}
function applyLanguage(){
 document.documentElement.lang=state.language||"de";
 if($("#languageSelect"))$("#languageSelect").value=state.language||"de";
 const set=(id,key)=>{const e=$("#"+id);if(e)e.textContent=L(key)};
 set("fanBadge","fanProject");set("legalFan","fanProject");set("legalText","disclaimer");
 set("villedorAssistant","villedorAssistant");set("companionModules","companionModules");set("navCollectibles","navCollectibles");
 const bw=$("#backupWarning");if(bw)bw.innerHTML=`<b>${L("backupWarningTitle")}</b><span>${L("backupWarning")}</span>`;
 set("collectTitle","collectibles");set("mementoLabel","mementos");set("tapeLabel","tapes");set("graffitiLabel","graffiti");
 set("gameMementoLabel","gameCount");set("gameTapeLabel","gameCount");set("gameGraffitiLabel","gameCount");
 set("collectTrackerNote","trackerNote");set("collectSlotNotice","slotNotice");
 if($("#collectSearch"))$("#collectSearch").placeholder=L("searchCollectibles");
 if($("#collectMissingLabel"))$("#collectMissingLabel").textContent=state.language==="en"?"Show missing only":"Nur fehlende anzeigen";
 if($("#collectCollectedLabel"))$("#collectCollectedLabel").textContent=L("collected").toUpperCase();
 const staticMap=state.language==="en"?{
  "GESUNDHEIT":"HEALTH","AUSDAUER":"STAMINA","Stufe":"Level","HEMMSTOFFE":"INHIBITORS","SAFE-CODES":"SAFE CODES",
  "CHARAKTER":"CHARACTER","BUILDS":"BUILDS","FAQ / WISSEN":"FAQ / KNOWLEDGE","DATEN":"DATA","GEBIETE":"DISTRICTS",
  "MILITARY TECH":"MILITARY TECH","GRE-ANOMALIEN":"GRE ANOMALIES","GRE-QUARANTÄNE":"GRE QUARANTINE",
  "ENTEN & EASTER EGGS":"DUCKS & EASTER EGGS","SAMMLERSTÜCKE":"COLLECTIBLES","Alle":"All","OFFEN":"OPEN","ERLEDIGT":"DONE"
 }:{};
 if(state.language==="en"){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n;while(n=walker.nextNode()){const t=n.nodeValue.trim();if(staticMap[t])n.nodeValue=n.nodeValue.replace(t,staticMap[t])}
 }
}
function openCollectDetail(id){
 const x=collectibles.find(v=>v.id===id);if(!x)return;
 const labels={memento:L("mementos"),tape:L("tapes"),graffiti:L("graffiti")};
 $("#collectDetailType").textContent=labels[x.type].toUpperCase()+" · #"+String(x.index).padStart(x.type==="memento"?3:2,"0");
 $("#collectDetailName").textContent=state.language==="en"?x.name_en:x.name_de;
 $("#collectDetailMeta").textContent=(x.district||"Villedor")+(x.missable?" · MISSABLE":"");
 $("#collectDetailDone").checked=!!state.collectDone[x.id];
 $("#collectDetailDone").dataset.id=x.id;
 $("#collectDetailDoneLabel").textContent=L("collected");
 $("#collectDetailYoutube").textContent=L("youtube");
 $("#collectDetailYoutube").href=ytLink(`Dying Light 2 ${x.name_en} ${x.district||""} collectible location`);
 $("#collectModal").classList.add("open");$("#collectModal").setAttribute("aria-hidden","false");
}
function closeCollectDetail(){$("#collectModal").classList.remove("open");$("#collectModal").setAttribute("aria-hidden","true")}
function renderCollectibles(){
 if(!collectibles.length)return;
 const q=($("#collectSearch")?.value||"").toLowerCase().trim(), missing=$("#collectMissing")?.checked;
 const doneAll=collectibles.filter(x=>state.collectDone[x.id]).length;
 const counts={memento:[0,209],tape:[0,68],graffiti:[0,71]};
 Object.keys(counts).forEach(k=>counts[k][0]=collectibles.filter(x=>x.type===k&&state.collectDone[x.id]).length);
 $("#collectTotal").textContent=doneAll+"/348";
 $("#mementoCount").textContent=counts.memento[0]+"/209";$("#tapeCount").textContent=counts.tape[0]+"/68";$("#graffitiCount").textContent=counts.graffiti[0]+"/71";
 $("#gameMemento").value=state.collectionGameCounts.memento||0;$("#gameTape").value=state.collectionGameCounts.tape||0;$("#gameGraffiti").value=state.collectionGameCounts.graffiti||0;
 const rows=collectibles.filter(x=>(collectType==="all"||x.type===collectType)&&(!missing||!state.collectDone[x.id])&&(!q||((state.language==="en"?x.name_en:x.name_de)+" "+x.index+" "+(x.district||"")).toLowerCase().includes(q)));
 const groups={memento:[],tape:[],graffiti:[]};rows.forEach(x=>groups[x.type].push(x));
 const labels={memento:L("mementos"),tape:L("tapes"),graffiti:L("graffiti")};
 $("#collectibleList").innerHTML=Object.entries(groups).filter(([,a])=>a.length).map(([type,a])=>`<div class="airdistrict"><h3>${labels[type].toUpperCase()} · ${a.length}</h3><div class="collect-grid">${a.map(x=>{const name=state.language==="en"?x.name_en:x.name_de;return `<button type="button" class="collect-tile ${state.collectDone[x.id]?"done":""}" data-collecttile="${x.id}"><span class="tile-num">#${String(x.index).padStart(type==="memento"?3:2,"0")}</span><span class="tile-name">${name}</span><span class="tile-state">${state.collectDone[x.id]?L("collected").toUpperCase():L("open").toUpperCase()}</span></button>`}).join("")}</div></div>`).join("")||'<div class="area-empty">'+(state.language==="en"?"No entries in this filter.":"Keine Einträge in diesem Filter.")+'</div>';
 $$("[data-collecttile]").forEach(b=>b.onclick=()=>openCollectDetail(b.dataset.collecttile));
 $("#collectDetailDone").onchange=e=>{const id=e.target.dataset.id;if(!id)return;state.collectDone[id]=e.target.checked;if(!e.target.checked)delete state.collectDone[id];saveState();renderCollectibles();renderAreas();updateDashboard();openCollectDetail(id)};
}
function renderAll(){
  renderDistricts();
  renderCharacter();
  renderSafes();
  renderFAQ();
  renderBuilds();
  renderChangelog();
  renderAreas();
  renderAirdrops();
  renderGRE();
  renderSunken();
  renderQuarantine();
  renderDucks();
  renderCollectibles();
  updateDashboard();
  applyLanguage();
}
function ytLink(q){return "https://www.youtube.com/results?search_query="+encodeURIComponent(q)}
function renderQuarantine(){if(!quarantine.length)return;let total=0,b=0;quarantine.forEach(q=>{let c=0;q.crates.forEach((n,i)=>{if(state.quarantineDone[q.id+"-"+i])c+=n});total+=c;if(c===4)b++});$("#qCount").textContent=b+"/6";$("#qBuildings").textContent=b+"/6";$("#qInhib").textContent=total+"/24";$("#qOpen").textContent=24-total;if($("#qDash"))$("#qDash").textContent=b+" / 6";$("#quarantineList").innerHTML=quarantine.map(q=>`<div class="qcard"><h3>${q.name}</h3><div class="qmeta">${q.district} · Stufe ${q.rank} · 4 Hemmstoffe</div><div class="qcrates">${q.crates.map((n,i)=>`<label><input type="checkbox" data-q="${q.id}-${i}" ${state.quarantineDone[q.id+"-"+i]?"checked":""}> Kiste ${i+1}: ${n}</label>`).join("")}</div><a class="yt-find" target="_blank" rel="noopener" href="${ytLink(q.youtube)}">▶ FUNDORT AUF YOUTUBE</a></div>`).join("");$$("[data-q]").forEach(c=>c.onchange=()=>{state.quarantineDone[c.dataset.q]=c.checked;saveState();renderQuarantine()})}
function renderDucks(){if(!ducks.length)return;const d=ducks.filter(x=>state.duckDone[x.id]).length;$("#duckCount").textContent=d+"/12";if($("#duckDash"))$("#duckDash").textContent=d+" / 12";$("#duckList").innerHTML=["black","red"].map(t=>`<div class="airdistrict"><h3>${t==="black"?"SCHWARZE ENTEN · DOOM":"ROTE ENTEN · FAHRRAD"}</h3>${ducks.filter(x=>x.type===t).map(x=>`<div class="duckcard"><div class="duckrow"><input type="checkbox" data-duck="${x.id}" ${state.duckDone[x.id]?"checked":""}><div><h3>${x.label}</h3><div class="duckmeta">${x.district} · ${x.purpose}</div><a class="yt-find" target="_blank" rel="noopener" href="${ytLink(x.youtube)}">▶ FUNDORT AUF YOUTUBE</a></div></div></div>`).join("")}</div>`).join("");$$("[data-duck]").forEach(c=>c.onchange=()=>{state.duckDone[c.dataset.duck]=c.checked;saveState();renderDucks()})}
function renderGRE(){if(!gre.length)return;const done=gre.filter(x=>state.greDone[x.id]).length;$("#greCount").textContent=done+"/12";$("#greOpen").textContent=12-done;$("#greInhib").textContent=(done*2)+"/24";$("#greTrophy").textContent=Math.round(done/12*100)+"%";if($("#greDash"))$("#greDash").textContent=done+" / 12";const a=gre.filter(x=>greFilter==="all"||(greFilter==="open"&&!state.greDone[x.id])||(greFilter==="done"&&state.greDone[x.id])),g={};a.forEach(x=>(g[x.district]??=[]).push(x));$("#greList").innerHTML=Object.entries(g).map(([d,l])=>`<div class="airdistrict"><h3>${d.toUpperCase()}</h3>${l.map(x=>`<label class="grecard ${state.greDone[x.id]?"done":""}"><input type="checkbox" data-gre="${x.id}" ${state.greDone[x.id]?"checked":""}><div class="greinfo"><b>${x.id}</b><p>${x.note}</p><div class="gre-meta"><span class="gre-tag hot">2 HEMMSTOFFE</span><span class="gre-tag">NUR NACHTS</span></div><a class="yt-find" onclick="event.stopPropagation()" target="_blank" rel="noopener" href="${ytLink(`Dying Light 2 GRE Anomaly ${x.id} ${x.district} location`)}">▶ FUNDORT AUF YOUTUBE</a></div></label>`).join("")}</div>`).join("")||'<div class="area-empty">Keine GRE-Anomalien in diesem Filter.</div>';$$("[data-gre]").forEach(c=>c.onchange=()=>{const x=gre.find(a=>a.id===c.dataset.gre);setFlag(state.greDone,x.id,c.checked);syncFromGRE(x.id,c.checked);saveState();renderGRE();renderDistricts();renderAreas();updateDashboard()})}
function renderSunken(){if(!sunken.length)return;const done=sunken.filter(x=>state.sunkenDone[x.id]).length;$("#sunkenCount").textContent=done+"/12";const a=sunken.filter(x=>sunkenFilter==="all"||(sunkenFilter==="open"&&!state.sunkenDone[x.id])||(sunkenFilter==="done"&&state.sunkenDone[x.id]));$("#sunkenList").innerHTML=a.map(x=>`<label class="sunken-card ${state.sunkenDone[x.id]?"done":""}"><input type="checkbox" data-sunken="${x.id}" ${state.sunkenDone[x.id]?"checked":""}><div class="sunken-info"><b>${x.label}</b><p>${x.note}</p><span class="no-tech">KEIN MILITARY TECH</span></div></label>`).join("")||'<div class="area-empty">Keine versunkenen Airdrops in diesem Filter.</div>';$$("[data-sunken]").forEach(c=>c.onchange=()=>{state.sunkenDone[c.dataset.sunken]=c.checked;saveState();renderSunken()})}
function renderAirdrops(){if(!airdrops.length)return;const done=airdrops.filter(x=>state.airDone[x.id]).length,inh=airdrops.filter(x=>x.inhibitor&&state.airDone[x.id]).length;$("#airCount").textContent=done+"/14";$("#airOpen").textContent=14-done;$("#airTech").textContent=done;$("#airInhib").textContent=inh+"/5";if($("#airDash"))$("#airDash").textContent=done+" / 14";const a=airdrops.filter(x=>airFilter==="all"||(airFilter==="open"&&!state.airDone[x.id])||(airFilter==="done"&&state.airDone[x.id])),g={};a.forEach(x=>(g[x.district]??=[]).push(x));$("#airdropList").innerHTML=Object.entries(g).map(([d,l])=>`<div class="airdistrict"><h3>${d.toUpperCase()}</h3>${l.map(x=>`<label class="aircard ${state.airDone[x.id]?"done":""}"><input type="checkbox" data-air="${x.id}" ${state.airDone[x.id]?"checked":""}><div class="airinfo"><b>${x.id}</b><p>${x.note}</p><span class="airtag">MILITARY TECH</span>${x.inhibitor?'<span class="airtag">HEMMSTOFF</span>':""}<a class="yt-find" onclick="event.stopPropagation()" target="_blank" rel="noopener" href="${ytLink(`Dying Light 2 Military Airdrop ${x.id} ${x.district} location`)}">▶ FUNDORT AUF YOUTUBE</a></div></label>`).join("")}</div>`).join("");$$("[data-air]").forEach(c=>c.onchange=()=>{state.airDone[c.dataset.air]=c.checked;syncFromAir(x.id,c.checked);saveState();renderAirdrops();updateDashboard()})}
function districtMatches(value,d){
 if(!value)return false;
 const district=districts.find(x=>x.name===d);
 const vals=[d,district?.id||""];
 if(d==="Saint Paul Island")vals.push("Insel Saint Paul","Saint Paul");
 if(d==="Newfound Lost Lands")vals.push("Südlich Newfound Lost Lands");
 return vals.some(v=>v&&String(value).toLowerCase().includes(String(v).toLowerCase()))
}
function areaItems(d){
 const out=[],district=districts.find(x=>x.name===d);
 inhibitors.filter(x=>x.district===district?.id).forEach(x=>out.push({id:"inh:"+x.id,type:"Hemmstoffe",name:x.name+" ("+(x.count||1)+")",kind:"inhibitor",ref:x}));
 safes.filter(x=>districtMatches(x.district,d)).forEach(x=>out.push({id:"safe:"+x.id,type:"Safe-Codes",name:x.place+" · "+x.code,kind:"safe",ref:x}));
 airdrops.filter(x=>districtMatches(x.district,d)).forEach(x=>out.push({id:"air:"+x.id,type:"Military Airdrops",name:x.id,kind:"air",ref:x}));
 sunken.filter(x=>districtMatches(x.district,d)).forEach(x=>out.push({id:"sunken:"+x.id,type:"Versunkene Airdrops",name:x.label,kind:"sunken",ref:x}));
 gre.filter(x=>districtMatches(x.district,d)).forEach(x=>out.push({id:"gre:"+x.id,type:"GRE-Anomalien",name:x.id,kind:"gre",ref:x}));
 quarantine.filter(x=>districtMatches(x.district,d)).forEach(q=>q.crates.forEach((count,i)=>out.push({id:"q:"+q.id+"-"+i,type:"GRE-Quarantäne",name:q.name+" · Kiste "+(i+1)+" (×"+count+")",kind:"quarantine",ref:q,index:i})));
 ducks.filter(x=>districtMatches(x.district,d)).forEach(x=>out.push({id:"duck:"+x.id,type:"Enten",name:x.label,kind:"duck",ref:x}));
 collectibles.filter(x=>x.district&&districtMatches(x.district,d)).forEach(x=>out.push({id:"collect:"+x.id,type:"Sammlerstücke",name:(state.language==="en"?x.name_en:x.name_de),kind:"collect",ref:x}));
 return out
}
function itemDone(x){
 if(x.kind==="inhibitor")return !!state.found[x.ref.id];
 if(x.kind==="safe")return !!state.safeDone[x.ref.id];
 if(x.kind==="air")return !!state.airDone[x.ref.id];
 if(x.kind==="sunken")return !!state.sunkenDone[x.ref.id];
 if(x.kind==="gre")return !!state.greDone[x.ref.id];
 if(x.kind==="quarantine")return !!state.quarantineDone[x.ref.id+"-"+x.index];
 if(x.kind==="duck")return !!state.duckDone[x.ref.id];
 if(x.kind==="collect")return !!state.collectDone[x.ref.id];
 return false
}
function setItemDone(x,val){
 const set=(obj,key)=>{obj[key]=val;if(!val)delete obj[key]};
 if(x.kind==="inhibitor"){set(state.found,x.ref.id);syncFromInhibitor(x.ref.id,val)}
 else if(x.kind==="safe"){set(state.safeDone,x.ref.id);syncFromSafe(x.ref.id,val)}
 else if(x.kind==="air"){set(state.airDone,x.ref.id);syncFromAir(x.ref.id,val)}
 else if(x.kind==="sunken")set(state.sunkenDone,x.ref.id);
 else if(x.kind==="gre"){set(state.greDone,x.ref.id);syncFromGRE(x.ref.id,val)}
 else if(x.kind==="quarantine"){set(state.quarantineDone,x.ref.id+"-"+x.index);syncFromQuarantine(x.ref.id)}
 else if(x.kind==="duck")set(state.duckDone,x.ref.id);
 else if(x.kind==="collect")set(state.collectDone,x.ref.id)
}
function districtProgress(d){const a=areaItems(d),done=a.filter(itemDone).length;return {done,total:a.length,pct:a.length?Math.round(done/a.length*100):0}}
function overallProgress(){
 const inhibitorTotal=inhibitors.reduce((s,x)=>s+(x.count||1),0), inhibitorDone=inhibitors.reduce((s,x)=>s+(state.found[x.id]?(x.count||1):0),0);
 const safeTotal=safes.length, safeDone=safes.filter(x=>state.safeDone[x.id]).length;
 const airTotal=airdrops.length, airDone=airdrops.filter(x=>state.airDone[x.id]).length;
 const sunkenTotal=sunken.length, sunkenDone=sunken.filter(x=>state.sunkenDone[x.id]).length;
 const greTotal=gre.length, greDone=gre.filter(x=>state.greDone[x.id]).length;
 const quarantineTotal=quarantine.reduce((s,q)=>s+q.crates.length,0), quarantineDone=quarantine.reduce((s,q)=>s+q.crates.filter((_,i)=>state.quarantineDone[q.id+"-"+i]).length,0);
 const duckTotal=ducks.length, duckDone=ducks.filter(x=>state.duckDone[x.id]).length;
 const collectTotal=collectibles.length, collectDone=collectibles.filter(x=>state.collectDone[x.id]).length;
 const total=inhibitorTotal+safeTotal+airTotal+sunkenTotal+greTotal+quarantineTotal+duckTotal+collectTotal;
 const done=inhibitorDone+safeDone+airDone+sunkenDone+greDone+quarantineDone+duckDone+collectDone;
 return {done,total,pct:total?Math.round(done/total*100):0};
}
function renderAreas(){
 if(!districts.length)return;
 const sel=$("#areaSelect");sel.innerHTML=districts.map(d=>`<option ${d.name===state.currentArea?"selected":""}>${d.name}</option>`).join("");
 const d=state.currentArea,p=districtProgress(d),items=areaItems(d);
 $("#areaHero").innerHTML=`<div class="eyebrow">AKTUELLER BEZIRK</div><h3>${d}</h3><div class="bigpct">${p.pct} %</div><div class="progress"><i style="width:${p.pct}%"></i></div><small>${p.done} von ${p.total} bekannten Einträgen erledigt</small>`;
 const open=items.filter(x=>!itemDone(x)),g={};open.forEach(x=>(g[x.type]??=[]).push(x));
 $("#missingHere").innerHTML=`<h3>WAS FEHLT MIR HIER?</h3><p>${open.length?Object.entries(g).map(([k,v])=>`${k}: <b>${v.length}</b>`).join(" · "):"<b>Bezirk abgeschlossen.</b>"}</p>`;
 const all={};items.forEach(x=>(all[x.type]??=[]).push(x));
 $("#areaChecklist").innerHTML=Object.entries(all).map(([type,list])=>`<div class="area-group"><div class="area-group-head"><b>${type.toUpperCase()}</b><small>${list.filter(itemDone).length}/${list.length}</small></div>${list.map(x=>`<label class="area-task ${itemDone(x)?"done":""}"><input type="checkbox" data-area-id="${encodeURIComponent(x.id)}" ${itemDone(x)?"checked":""}><span>${x.name}</span></label>`).join("")}</div>`).join("")||'<div class="area-empty">Für diesen Bezirk sind noch keine zuordenbaren Tracker-Daten hinterlegt.</div>';
 $$("[data-area-id]").forEach(c=>c.onchange=()=>{const id=decodeURIComponent(c.dataset.areaId),x=items.find(i=>i.id===id);if(!x)return;setItemDone(x,c.checked);saveState();renderAreas();renderDistricts();renderSafes();renderAirdrops();renderSunken();renderGRE();renderQuarantine();renderDucks();renderCollectibles();updateDashboard()})
}
function renderFAQ(){
 if(!faq.length)return; const q=$("#faqSearch").value.toLowerCase().trim(),w=$("#faqList");w.innerHTML="";
 faq.filter(x=>!q||(x.q+" "+x.a).toLowerCase().includes(q)).forEach(x=>{const e=document.createElement("article");e.className="faqitem";e.innerHTML=`<button><b>${x.q}</b><span class="chev">+</span></button><div class="faqbody">${x.a}</div>`;e.querySelector("button").onclick=()=>e.classList.toggle("open");w.appendChild(e)})
}
function renderBuilds(){
 if(!builds.length)return; const w=$("#buildList");w.innerHTML="";
 builds.forEach(x=>{const e=document.createElement("article");e.className="buildcard";e.innerHTML=`<button><span class="buildtitle"><small>${x.subtitle}</small><b>${x.name}</b></span><span class="chev">+</span></button><div class="buildbody"><span class="buildclass">${x.class}</span><p>${x.goal}</p><h4>PRIORITÄTEN</h4><ol>${x.priorities.map(v=>`<li>${v}</li>`).join("")}</ol><h4>SINNVOLL DAZU</h4><ul>${x.extras.map(v=>`<li>${v}</li>`).join("")}</ul><p class="buildnote">${x.note}</p></div>`;e.querySelector("button").onclick=()=>e.classList.toggle("open");w.appendChild(e)})
}
function renderChangelog(){
 if(!changelog.length)return;$("#changelogList").innerHTML=changelog.slice(0,8).map(x=>`<div class="change"><div class="changehead"><b>v${x.version}</b><small>${x.date}</small></div><ul>${x.changes.map(v=>`<li>${v}</li>`).join("")}</ul></div>`).join("")
}
function closeChangelog(){$("#changelogModal").classList.remove("open");$("#changelogModal").setAttribute("aria-hidden","true")}

function renderCharacter(){
 const rank=Math.max(1,Math.min(9,+state.pilgrimRank||1));
 state.pilgrimRank=rank;
 $("#healthRange").value=state.health;$("#staminaRange").value=state.stamina;$("#pilgrimRange").value=rank;
 $("#healthLabel").textContent=state.health;$("#staminaLabel").textContent=state.stamina;$("#pilgrimLabel").textContent=rank;
 const rankBonus=Math.min(Math.max(rank-1,0),5)*20;
 const attributeValue=lvl=>80+(lvl*20)+rankBonus;
 $("#healthValue").textContent=attributeValue(state.health);$("#staminaValue").textContent=attributeValue(state.stamina);
 $("#pilgrimBonus").textContent=`+${rankBonus}`;
 $("#pilgrimBonusNote").textContent=rank<6?`Aktuell +${rankBonus} auf Gesundheit und Ausdauer · nächster Rang: +20`:`Maximaler Statusbonus erreicht: +100 auf Gesundheit und Ausdauer`;
 const spent=(state.health+state.stamina)*3, needed=(52-state.health-state.stamina)*3;
 $("#spentInh").textContent=spent;$("#neededInh").textContent=needed;
 let html=`<div class="levelrow head"><span>Stufe</span><span>Kosten bis hier</span><span>Basiswert*</span></div>`;
 for(let i=1;i<=26;i++) html+=`<div class="levelrow"><span>${i}</span><span>${i*3} Hemmstoffe</span><span>${80+i*20}</span></div>`;
 html+=`<div class="levelrow"><span>* Basiswert ohne Pilgerrang-Bonus. Rang 2–6 geben jeweils +20 Gesundheit und Ausdauer; ab Rang 6 insgesamt +100.</span><span></span><span></span></div>`;
 $("#levelTable").innerHTML=html;
}
function backupPayload(){
 return {app:"DL2 Companion",version:VERSION,exported:new Date().toISOString(),state};
}
function exportData(){
 const blob=new Blob([JSON.stringify(backupPayload(),null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`dl2-companion-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup erstellt")
}
function applyImportedState(raw){
 const incoming=raw?.state ?? raw;
 if(!incoming || typeof incoming!=="object")throw new Error("invalid");
 state=normalizeState(incoming);saveState();renderAll();
}
function importData(e){
 const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);applyImportedState(d);toast("Backup importiert")}catch{toast("Ungültiges Backup")}};r.readAsText(f);e.target.value=""
}
function setSyncStatus(text,type=""){
 const el=$("#syncStatus"); if(!el)return; el.textContent=text; el.className="sync-status"+(type?" "+type:"");
}
async function createSyncCode(){
 const btn=$("#syncCreateBtn");btn.disabled=true;setSyncStatus("Sync-Code wird erstellt …");
 try{
  const res=await fetch(SYNC_API+"/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(backupPayload())});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok)throw new Error(data.error||"Sync-Code konnte nicht erstellt werden.");
  $("#syncCode").textContent=data.code;$("#syncExpiry").textContent=`${data.expiresInMinutes||30} Minuten gültig`;
  $("#syncCodeBox").hidden=false;setSyncStatus("Code erstellt. Auf dem anderen Gerät unter Daten einlösen.","ok");
 }catch(err){setSyncStatus(err.message||"Cloud-Sync nicht erreichbar.","error")}
 finally{btn.disabled=false}
}
async function copySyncCode(){
 const code=$("#syncCode").textContent.trim();if(!code||code==="----")return;
 try{await navigator.clipboard.writeText(code);setSyncStatus("Sync-Code kopiert.","ok")}
 catch{setSyncStatus("Kopieren nicht möglich. Code bitte manuell übernehmen.","error")}
}
async function redeemSyncCode(){
 const input=$("#syncInput"),code=input.value.trim().toUpperCase();
 if(!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)){setSyncStatus("Bitte einen gültigen Code im Format ABCD-1234 eingeben.","error");return}
 if(!confirm("Lokalen DL2-Companion-Stand durch den Sync-Stand ersetzen? Ein gültiger Code wird nach erfolgreichem Abruf verbraucht."))return;
 const btn=$("#syncRedeemBtn");btn.disabled=true;setSyncStatus("Sync-Code wird eingelöst …");
 try{
  const res=await fetch(SYNC_API+"/redeem",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok)throw new Error(data.error||"Sync-Code konnte nicht eingelöst werden.");
  applyImportedState(data.state);input.value="";setSyncStatus("Spielstand erfolgreich übernommen. Der Sync-Code ist jetzt ungültig.","ok");toast("Sync übernommen");
 }catch(err){setSyncStatus(err.message||"Cloud-Sync nicht erreichbar.","error")}
 finally{btn.disabled=false}
}
let deferredPrompt;
function setupPWA(){
 if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js");
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});
 $("#installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true}}
}
init().catch(e=>{console.error(e);toast("Daten konnten nicht geladen werden")});

document.addEventListener("click",e=>{if(e.target?.id==="globalVersion"){const b=$("#versionBtn")||$("#version")||$("#appVersion")||$("[data-changelog]");if(b)b.click()}})
