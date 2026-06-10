/* ═══════════════════════════════════════
   CALENDAR
═══════════════════════════════════════ */
function dStr(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function calEvents(){
  const evts=[];
  bookings.forEach(b=>{
    const ci=new Date(b.checkin), co=new Date(b.checkout), names=(b.entries||[]).map(e=>e.dogName||'').join(', ');
    // Normalize to midnight-local for whole-day span comparison
    const ciDay=new Date(ci.getFullYear(),ci.getMonth(),ci.getDate());
    const coDay=new Date(co.getFullYear(),co.getMonth(),co.getDate());
    evts.push({date:dStr(ciDay),type:'in',label:'In: '+names,detail:b});
    if(dStr(coDay)!==dStr(ciDay)) evts.push({date:dStr(coDay),type:'out',label:'Out: '+names,detail:b});
    let d=new Date(ciDay); d.setDate(d.getDate()+1);
    while(dStr(d)<dStr(coDay)){ evts.push({date:dStr(d),type:'stay',label:'Staying: '+names,detail:b}); d.setDate(d.getDate()+1); }
  });
  requests.filter(r=>r.status==='pending'||r.status==='confirmed'||r.status==='checked_in').forEach(r=>{
    const dog=dogs.find(d=>d.id===r.dog_id), name=dog?dog.dog_name:(r.dog_name||'Unknown');
    const ciSrc=r.actual_checkin||r.checkin;
    const rc=new Date(ciSrc), rcDay=new Date(rc.getFullYear(),rc.getMonth(),rc.getDate());
    if(r.status==='pending'){
      evts.push({date:dStr(rcDay),type:'req',label:'Req: '+name,detail:r});
    } else {
      // confirmed or checked_in: render as full span
      const co=new Date(r.checkout), coDay=new Date(co.getFullYear(),co.getMonth(),co.getDate());
      const prefix=r.status==='checked_in'?'🏠 ':'';
      evts.push({date:dStr(rcDay),type:'in',label:prefix+'In: '+name,detail:r});
      if(dStr(coDay)!==dStr(rcDay)) evts.push({date:dStr(coDay),type:'out',label:'Out: '+name,detail:r});
      let d=new Date(rcDay); d.setDate(d.getDate()+1);
      while(dStr(d)<dStr(coDay)){ evts.push({date:dStr(d),type:'stay',label:'Staying: '+name,detail:r}); d.setDate(d.getDate()+1); }
    }
  });
  return evts;
}
function renderCalendar(){
  const dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  document.getElementById('cal-title').textContent=new Date(calYear,calMonth,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const grid=document.getElementById('cal-grid'), evts=calEvents(), em={};
  evts.forEach(e=>{ if(!em[e.date]) em[e.date]=[]; em[e.date].push(e); });
  let html=dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const first=new Date(calYear,calMonth,1).getDay(), days=new Date(calYear,calMonth+1,0).getDate(), prev=new Date(calYear,calMonth,0).getDate(), todayS=dStr(new Date());
  for(let i=first-1;i>=0;i--){ const d=new Date(calYear,calMonth-1,prev-i); html+=`<div class="cal-day other-month" onclick="openDayMo('${dStr(d)}')"><div class="cal-day-num">${prev-i}</div></div>`; }
  for(let d=1;d<=days;d++){
    const ds=calYear+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const de=em[ds]||[], isT=ds===todayS, hasE=de.length>0, show=de.slice(0,3), more=de.length-3;
    html+=`<div class="cal-day${isT?' today':''}${hasE?' has-events':''}" onclick="openDayMo('${ds}')"><div class="cal-day-num">${d}</div>${show.map(e=>`<div class="cal-event ${e.type}">${esc(e.label)}</div>`).join('')}${more>0?`<div class="cal-event more">+${more} more</div>`:''}</div>`;
  }
  const total=first+days, nextFill=total%7===0?0:7-(total%7);
  for(let d=1;d<=nextFill;d++){ const nd=new Date(calYear,calMonth+1,d); html+=`<div class="cal-day other-month" onclick="openDayMo('${dStr(nd)}')"><div class="cal-day-num">${d}</div></div>`; }
  grid.innerHTML=html;
}
function calPrev(){ calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); }
function calNext(){ calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); }
function calToday(){ const n=new Date(); calYear=n.getFullYear(); calMonth=n.getMonth(); renderCalendar(); }
let calViewMode='month';
function setCalView(mode){
  calViewMode=mode;
  document.getElementById('calview-month').classList.toggle('active',mode==='month');
  document.getElementById('calview-list').classList.toggle('active',mode==='list');
  document.getElementById('cal-month-wrap').style.display=mode==='month'?'':'none';
  document.getElementById('cal-list-wrap').style.display=mode==='list'?'':'none';
  if(mode==='list') renderCalList();
}
function renderCalList(){
  const body=document.getElementById('cal-list-body');
  // Group all events by date, from today forward, plus recent past 7 days
  const evts=calEvents();
  const byDate={};
  evts.forEach(e=>{ if(!byDate[e.date]) byDate[e.date]=[]; byDate[e.date].push(e); });
  const todayS=dStr(new Date());
  const dates=Object.keys(byDate).filter(d=>d>=todayS).sort();
  if(!dates.length){ body.innerHTML='<div class="es" style="padding:24px"><span class="ei">📅</span><p>No upcoming scheduled days</p></div>'; return; }
  const typeIcon={in:'🏡',out:'👋',stay:'🛏️',req:'📩'};
  const typeLabel={in:'Check-in',out:'Check-out',stay:'Staying',req:'Request'};
  body.innerHTML=dates.map(ds=>{
    const dt=new Date(ds+'T12:00:00');
    const isToday=ds===todayS;
    const items=byDate[ds].sort((a,b)=>['in','out','stay','req'].indexOf(a.type)-['in','out','stay','req'].indexOf(b.type));
    return `<div style="padding:11px 18px;border-bottom:1px solid var(--cream-mid)">
      <div style="font-size:12px;font-weight:700;color:${isToday?'var(--brown-dark)':'var(--ink)'};margin-bottom:7px">${dt.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}${isToday?' · Today':''}</div>
      ${items.map(e=>`<div onclick="openDayMo('${ds}')" style="display:flex;align-items:center;gap:9px;padding:5px 0;cursor:pointer"><span style="font-size:15px">${typeIcon[e.type]}</span><span style="font-size:12px;font-weight:600;color:var(--ink-faint);min-width:72px">${typeLabel[e.type]}</span><span style="font-size:13px;color:var(--ink)">${esc(e.label.replace(/^(In|Out|Staying|Req|🏠 In): /,''))}</span></div>`).join('')}
    </div>`;
  }).join('');
}
function renderUpcoming(){
  const now=new Date(), in7=new Date(now); in7.setDate(in7.getDate()+7);
  // Combine saved bookings + confirmed requests into one upcoming list
  const reqAsBookings=requests.filter(r=>r.status==='confirmed'||r.status==='checked_in').map(r=>({
    _req:true, _status:r.status, service:r.service, checkin:r.actual_checkin||r.checkin, checkout:r.checkout,
    entries:[{dogName:r.dog_name,ownerName:r.owner_name}], grand_total:null
  }));
  const all=[...bookings,...reqAsBookings];
  const up=all.filter(b=>new Date(b.checkin)>=now&&new Date(b.checkin)<=in7).sort((a,b)=>new Date(a.checkin)-new Date(b.checkin));
  const ul=document.getElementById('upcoming-list');
  ul.innerHTML=up.length?up.map(b=>`<div style="display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid var(--cream-mid)"><div style="font-size:19px">${b.service==='boarding'?'🏡':'☀️'}</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--ink)">${esc((b.entries||[]).map(e=>e.dogName||'').join(', '))}${b._req?' <span class="bdg bdg-g" style="margin-left:4px">Confirmed</span>':''}</div><div style="font-size:11px;color:var(--ink-faint)">${new Date(b.checkin).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} → ${new Date(b.checkout).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div></div>${b.grand_total!=null?`<div style="font-family:'DM Serif Display',serif;font-size:15px;color:var(--ink)">$${parseFloat(b.grand_total).toFixed(2)}</div>`:''}</div>`).join(''):'<div class="es" style="padding:14px"><span class="ei" style="font-size:22px">📅</span><p>No upcoming stays this week</p></div>';
  const cur=all.filter(b=>new Date(b.checkin)<=now&&new Date(b.checkout)>=now);
  const cb=document.getElementById('currently-boarding');
  cb.innerHTML=cur.length?cur.map(b=>`<div style="display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid var(--cream-mid)"><div style="font-size:19px">🐶</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--ink)">${esc((b.entries||[]).map(e=>e.dogName||'').join(', '))}</div><div style="font-size:11px;color:var(--ink-faint)">Checks out ${new Date(b.checkout).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at ${new Date(b.checkout).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</div></div><span class="bdg bdg-b">${b.service==='boarding'?'Boarding':'Day Care'}</span></div>`).join(''):'<div class="es" style="padding:14px"><span class="ei" style="font-size:22px">🏡</span><p>No dogs currently boarding</p></div>';
}
function openDayMo(ds){
  const evts=calEvents().filter(e=>e.date===ds);
  const dt=new Date(ds+'T12:00:00');
  document.getElementById('day-mo-title').textContent=dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const body=document.getElementById('day-mo-body');
  if(!evts.length){ body.innerHTML='<div class="es"><span class="ei">📅</span><p>Nothing scheduled this day</p></div>'; document.getElementById('day-mo').classList.add('on'); return; }
  // Build hourly slots. Determine which hours have a timed check-in/out; staying/req are "all day".
  const allDay=[]; // stay + pending req
  const timed={}; // hour -> [{kind,label,sub,time}]
  evts.forEach(e=>{
    const b=e.detail, entries=b.entries||[];
    const names=entries.length?entries.map(x=>x.dogName||'').join(', '):(b.dog_name||'');
    const owners=entries.length?entries.map(x=>x.ownerName||'').join(', '):'';
    if(e.type==='stay'){ allDay.push({icon:'🛏️',kind:'Staying overnight',names,owners,color:'var(--bluep)'}); return; }
    if(e.type==='req'){ 
      // pending request: time from r.checkin
      const t=new Date(b.checkin); const h=t.getHours();
      (timed[h]=timed[h]||[]).push({icon:'📩',kind:'Requested check-in',names,owners,time:t,color:'#F0EDFB'}); return;
    }
    // in / out: use the relevant timestamp
    let t;
    if(e.type==='in') t=new Date(b.actual_checkin||b.checkin);
    else t=new Date(b.checkout);
    const h=t.getHours();
    (timed[h]=timed[h]||[]).push({icon:e.type==='in'?'🏡':'👋',kind:e.type==='in'?'Check-in':'Check-out',names,owners,time:t,color:e.type==='in'?'var(--forest-pale)':'var(--gold-pale)'});
  });
  // hour range: 6..21 default, expand to include any timed events
  let minH=6, maxH=21;
  Object.keys(timed).forEach(h=>{ h=+h; if(h<minH)minH=h; if(h>maxH)maxH=h; });
  let html='';
  if(allDay.length){
    html+='<div style="margin-bottom:14px">'+allDay.map(a=>`<div style="background:${a.color};border-radius:var(--radius-md);padding:9px 12px;margin-bottom:6px;display:flex;align-items:center;gap:8px"><span style="font-size:15px">${a.icon}</span><div><div style="font-size:13px;font-weight:600;color:var(--ink)">${esc(a.names)}</div><div style="font-size:11px;color:var(--ink-faint)">${a.kind}${a.owners?' · '+esc(a.owners):''}</div></div></div>`).join('')+'</div>';
  }
  html+='<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint);margin-bottom:8px">Hourly Schedule</div>';
  html+='<div style="border:1px solid var(--cream-dark);border-radius:var(--radius-md);overflow:hidden">';
  for(let h=minH;h<=maxH;h++){
    const items=timed[h]||[];
    const label=(h%12===0?12:h%12)+(h<12?' AM':' PM');
    html+=`<div style="display:flex;border-bottom:1px solid var(--cream-mid);min-height:38px">
      <div style="width:62px;flex-shrink:0;padding:8px 10px;font-size:11px;font-weight:600;color:var(--ink-faint);background:var(--cream-mid);text-align:right">${label}</div>
      <div style="flex:1;padding:5px 8px">${items.map(it=>`<div style="background:${it.color};border-radius:6px;padding:5px 9px;margin:2px 0;font-size:12px"><span style="font-weight:600;color:var(--ink)">${it.icon} ${esc(it.kind)}</span> — ${esc(it.names)} <span style="color:var(--ink-faint)">${it.time?it.time.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):''}</span></div>`).join('')}</div>
    </div>`;
  }
  html+='</div>';
  body.innerHTML=html;
  document.getElementById('day-mo').classList.add('on');
}
function closeDayMo(){ document.getElementById('day-mo').classList.remove('on'); }
document.getElementById('day-mo').addEventListener('click', function(e){ if(e.target===this) closeDayMo(); });
