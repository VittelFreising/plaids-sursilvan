'use strict';
(() => {
  const D=window.PLAIDS_DATA, cards=D.cards, $=id=>document.getElementById(id);
  const KEY='plaids.sursilvan.hs26.v1';
  let state={records:{},marked:[]}, queue=[],index=0,revealed=false,view='lernen',dictLimit=60;
  const ids=new Set(cards.map(c=>c.id));
  function validateState(raw){
    if(!raw || typeof raw!=='object' || !raw.records || typeof raw.records!=='object' || !Array.isArray(raw.marked))throw Error('Ungültige Sicherung.');
    const records={};
    for(const [id,r] of Object.entries(raw.records)){
      if(!ids.has(id))continue;
      if(!r || !Number.isFinite(r.due)||r.due<0||!Number.isFinite(r.interval)||r.interval<0||r.interval>365||!Number.isInteger(r.reviews)||r.reviews<0||![0,1,2,3].includes(r.grade))throw Error('Ungültige Lerndaten.');
      records[id]={due:r.due,interval:r.interval,reviews:r.reviews,grade:r.grade};
    }
    return {records,marked:[...new Set(raw.marked.filter(id=>ids.has(id)))]};
  }
  try{const raw=localStorage.getItem(KEY);if(raw)state=validateState(JSON.parse(raw));}catch(e){$('storage-warning').hidden=false;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){$('storage-warning').hidden=false;}stats();}
  function stats(){
    $('total').textContent=cards.length;
    $('due').textContent=cards.filter(c=>state.records[c.id]&&state.records[c.id].due<=Date.now()).length;
    $('learned').textContent=cards.filter(c=>state.records[c.id]?.grade>=2).length;
  }
  const groups=[...new Map(cards.map(c=>[c.group,c])).values()];
  for(const id of ['group','dict-group'])for(const g of groups){const o=document.createElement('option');o.value=g.group;o.textContent=g.theme+' · '+cards.filter(c=>c.group===g.group).length;$(id).append(o);}
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function start(){
    const group=$('group').value,scope=$('scope').value;
    const subset=cards.filter(c=>group==='all'||c.group===group);
    if(scope==='due'){
      const due=subset.filter(c=>state.records[c.id]&&state.records[c.id].due<=Date.now()).sort((a,b)=>state.records[a.id].due-state.records[b.id].due);
      queue=[...due,...shuffle(subset.filter(c=>!state.records[c.id])).slice(0,20)];
    }else queue=shuffle(subset.filter(c=>scope==='all'||(scope==='new'&&!state.records[c.id])||(scope==='marked'&&state.marked.includes(c.id))));
    index=0;renderCard();
  }
  function status(c){return c.status==='source'?'Quellenbeispiel · Liver; Notation vereinheitlicht':c.status==='regional'?'≈ Regionaler Ausdruck · Betonung und Lautung besonders prüfen':'≈ IPA-Annäherung · nicht wortweise verifiziert';}
  const intervals=c=>{const old=state.records[c.id]?.interval||0;return {good:Math.min(365,Math.max(3,old*2)),easy:Math.min(365,Math.max(7,old*3))};};
  function renderCard(){
    revealed=false;const c=queue[index];
    $('solution').hidden=true;$('ratings').hidden=true;$('feedback').textContent='';$('answer').value='';
    $('empty').hidden=!!c;$('reveal').hidden=!c;$('skip').hidden=!c;$('bookmark').hidden=!c;
    $('typing').hidden=!c||!$('spell').checked;
    $('prompt-label').hidden=!c;
    $('position').textContent=queue.length?`${Math.min(index+1,queue.length)} / ${queue.length}`:'0 Karten';
    $('progress').max=queue.length||1;$('progress').value=index;
    $('round-title').textContent=c?'Deine Lernrunde':index?'Runde abgeschlossen':'Keine passenden Karten';
    if(!c){$('prompt').textContent='Bien fatg.';$('front-ipa').textContent='';$('topic').textContent='Fertig';return;}
    const reverse=$('direction').value==='de-rm';
    $('topic').textContent=c.theme;$('prompt-label').textContent=reverse?'DEUTSCH → SURSILVAN':'SURSILVAN → DEUTSCH';
    $('prompt').textContent=reverse?c.de:c.word;
    $('front-ipa').textContent=reverse?'':`${c.status==='source'?'':'≈ '}[${c.ipa}]`;
    $('bookmark').textContent=state.marked.includes(c.id)?'★':'☆';$('bookmark').setAttribute('aria-pressed',state.marked.includes(c.id));
    $('reveal').innerHTML=$('spell').checked?'Antwort prüfen <kbd>Enter</kbd>':'Antwort zeigen <kbd>Leertaste</kbd>';
    const t=intervals(c);$('good-time').textContent=`In ${t.good} Tagen`;$('easy-time').textContent=`In ${t.easy} Tagen`;
  }
  function normalize(s){return s.toLowerCase().normalize('NFC').replace(/ß/g,'ss').replace(/[’‘]/g,"'").replace(/\([^)]*\)/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
  function matches(input,expected){const n=normalize(input);if(!n)return false;return expected.split(/[;\/]/).map(normalize).includes(n)||normalize(expected)===n;}
  function reveal(){
    const c=queue[index];if(!c||revealed)return;revealed=true;
    const reverse=$('direction').value==='de-rm';
    $('translation').textContent=reverse?c.word:c.de;$('solution-label').textContent=reverse?'SURSILVAN':'DEUTSCH';
    $('back-ipa').textContent=reverse?`${c.status==='source'?'':'≈ '}[${c.ipa}]`:'';
    $('word-note').textContent=c.note;$('ipa-status').textContent=status(c);
    $('source').textContent=c.source+' · '+c.lesson;
    if($('spell').checked){const ok=matches($('answer').value,reverse?c.word:c.de);$('feedback').textContent=ok?'Passt. Entscheide jetzt, wie sicher du warst.':'Vergleiche mit der Lösung. Andere sinngemässe Antworten können ebenfalls richtig sein.';$('feedback').className=ok?'correct':'review';}
    $('solution').hidden=false;$('ratings').hidden=false;$('reveal').hidden=true;
  }
  function grade(g){const c=queue[index];if(!c||!revealed)return;
    const t=intervals(c),interval=g===0?0:g===1?1:g===2?t.good:t.easy;
    state.records[c.id]={due:Date.now()+interval*86400000,interval,reviews:(state.records[c.id]?.reviews||0)+1,grade:g};
    if(g===0)queue.push(c);save();index++;renderCard();
  }
  function mark(id){if(state.marked.includes(id))state.marked=state.marked.filter(x=>x!==id);else state.marked.push(id);save();}
  $('bookmark').onclick=()=>{const c=queue[index];if(!c)return;mark(c.id);$('bookmark').textContent=state.marked.includes(c.id)?'★':'☆';$('bookmark').setAttribute('aria-pressed',state.marked.includes(c.id));};
  $('start').onclick=start;$('reveal').onclick=reveal;$('skip').onclick=()=>{index++;renderCard();};
  document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>grade(Number(b.dataset.grade)));
  $('spell').onchange=renderCard;$('direction').onchange=renderCard;
  function go(name){view=['lernen','woerter','hilfe','uebersetzen','kurs'].includes(name)?name:'lernen';document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!=='view-'+view);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view==='woerter')renderDict();}
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.view;go(b.dataset.view);});
  addEventListener('hashchange',()=>go(location.hash.slice(1)));
  addEventListener('keydown',e=>{if(view!=='lernen'||['INPUT','SELECT','TEXTAREA','BUTTON','A','SUMMARY'].includes(document.activeElement?.tagName))return;if(e.code==='Space'&&!revealed){e.preventDefault();reveal();}else if(revealed&&/^[1-4]$/.test(e.key))grade(Number(e.key)-1);});
  $('answer').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();reveal();}};
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  const alphabetical=[...cards].sort((a,b)=>a.word.localeCompare(b.word,'rm')||a.de.localeCompare(b.de,'de'));
  function renderDict(){
    const query=normalize($('search').value),group=$('dict-group').value,ipa=$('ipa-filter').value;
    const result=alphabetical.filter(c=>(group==='all'||group===c.group)&&(ipa==='all'||ipa===c.status)&&(!query||normalize(c.word+' '+c.de+' '+c.note).includes(query)));
    $('results').textContent=`${result.length} Karten gefunden · ${Math.min(dictLimit,result.length)} angezeigt`;
    $('word-list').replaceChildren();
    for(const c of result.slice(0,dictLimit)){
      const tr=el('tr'),a=el('td'),b=el('td'),d=el('td'),m=el('td');
      a.append(el('strong',c.word),el('p',`${c.status==='source'?'':'≈ '}[${c.ipa}]`,'ipa'),el('span',status(c),'status'));
      b.append(el('span',c.de));if(c.note)b.append(el('p',c.note,'small'));
      const details=el('details'),summary=el('summary','Quelle');details.append(summary,el('p',c.source,'small'));d.append(el('span',c.theme),details);
      const btn=el('button',state.marked.includes(c.id)?'★':'☆','icon');btn.setAttribute('aria-label',c.word+' merken');btn.setAttribute('aria-pressed',state.marked.includes(c.id));btn.onclick=()=>{mark(c.id);btn.textContent=state.marked.includes(c.id)?'★':'☆';btn.setAttribute('aria-pressed',state.marked.includes(c.id));};m.append(btn);tr.append(a,b,d,m);$('word-list').append(tr);
    }
    $('more').hidden=dictLimit>=result.length;
  }
  for(const id of ['search','dict-group','ipa-filter'])$(id).addEventListener(id==='search'?'input':'change',()=>{dictLimit=60;renderDict();});
  $('more').onclick=()=>{dictLimit+=60;renderDict();};
  for(const a of D.audio){const box=el('article',undefined,'audio-item');box.append(el('h3',a.title));const player=el('audio');player.controls=true;player.preload='none';player.src=a.src;player.setAttribute('aria-label',a.title);box.append(player,el('p',a.source,'small'));$('audio-list').append(box);player.onplay=()=>document.querySelectorAll('audio').forEach(other=>{if(other!==player)other.pause();});}
  $('export').onclick=()=>{const blob=new Blob([JSON.stringify({app:'Plaids',version:1,exported:new Date().toISOString(),...state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='Plaids-Fortschritt.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('backup-message').textContent='Sicherung erstellt. Bewahre die JSON-Datei auf.';};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Die Sicherungsdatei ist zu gross.');const raw=JSON.parse(await file.text());if(raw.app!=='Plaids'||raw.version!==1)throw Error('Keine passende Plaids-Sicherung.');const incoming=validateState(raw);for(const [id,r] of Object.entries(incoming.records)){const old=state.records[id];if(!old||r.reviews>=old.reviews)state.records[id]=r;}state.marked=[...new Set([...state.marked,...incoming.marked])];save();start();$('backup-message').textContent='Fortschritt zusammengeführt. Bestehende Einträge mit mehr Wiederholungen wurden behalten.';}catch(err){$('backup-message').textContent='Import fehlgeschlagen: '+err.message;}e.target.value='';};
  stats();start();go(location.hash.slice(1));
  // Pure functions exposed only for reproducible behaviour checks.
  window.PlaidsChecks={normalize,matches,validateState};
})();
