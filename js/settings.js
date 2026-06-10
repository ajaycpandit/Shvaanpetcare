/* ═══════════════════════════════════════
   SETTINGS
═══════════════════════════════════════ */
function renderSettings() {
  const s=settings;
  document.getElementById('s-br').value=s.boardingRate; document.getElementById('s-dc').value=s.daycareRate;
  document.getElementById('s-th').value=s.threshold; document.getElementById('s-pc').value=s.surchargePct;
  document.getElementById('s-bn').value=s.bizName||''; document.getElementById('s-bp').value=s.bizPhone||'';
  document.getElementById('s-be').value=s.bizEmail||''; document.getElementById('s-ba').value=s.bizAddr||'';
  document.getElementById('s-cap').value=s.capacity||12;
  const lp=document.getElementById('logo-preview'); if(lp) lp.src=pendingLogo||currentLogo();
  updateScPrev();
}
let pendingLogo=null;
function handleLogoFile(input){
  const f=input.files[0]; if(!f) return;
  if(f.size>1024*1024){ toast('Logo must be under 1MB.', true); input.value=''; return; }
  const r=new FileReader();
  r.onload=e=>{ pendingLogo=e.target.result; const lp=document.getElementById('logo-preview'); if(lp) lp.src=pendingLogo; toast('Logo selected — click Save Settings to apply.'); };
  r.readAsDataURL(f);
}
function resetLogo(){ pendingLogo='__default__'; const lp=document.getElementById('logo-preview'); if(lp) lp.src=DEFAULT_LOGO; toast('Will reset to default logo on Save.'); }
function updateScPrev() {
  const t=parseFloat(document.getElementById('s-th').value)||3, p=parseFloat(document.getElementById('s-pc').value)||50, r=parseFloat(document.getElementById('s-br').value)||55;
  document.getElementById('sc-prev').innerHTML=`<strong>Rule:</strong> If check-out is more than <strong>${t} hour${t!==1?'s':''}</strong> past a full 24h period, a surcharge of <strong>${p}%</strong> ($${(r*p/100).toFixed(2)}) is added.`;
}
['s-th','s-pc','s-br'].forEach(id=>document.getElementById(id).addEventListener('input',updateScPrev));

async function saveSettings() {
  settings={
    boardingRate:parseFloat(document.getElementById('s-br').value)||DEF.boardingRate,
    daycareRate:parseFloat(document.getElementById('s-dc').value)||DEF.daycareRate,
    threshold:parseFloat(document.getElementById('s-th').value)||DEF.threshold,
    surchargePct:parseFloat(document.getElementById('s-pc').value)||DEF.surchargePct,
    bizName:document.getElementById('s-bn').value.trim()||DEF.bizName,
    bizPhone:document.getElementById('s-bp').value.trim(),
    bizEmail:document.getElementById('s-be').value.trim(),
    bizAddr:document.getElementById('s-ba').value.trim(),
    capacity:parseInt(document.getElementById('s-cap').value)||DEF.capacity,
    logo: pendingLogo==='__default__' ? null : (pendingLogo || settings.logo || null)
  };
  setSyncState('busy');
  try { await dbSaveSettings(settings); try{ if(settings.logo) localStorage.setItem('shvaan_logo', settings.logo); else localStorage.removeItem('shvaan_logo'); }catch(e){} pendingLogo=null; applyLogo(); setSyncState('ok'); toast('Settings saved!'); recalc(); }
  catch(e){ setSyncState('err'); toast('Error saving settings: '+e.message, true); }
}

async function resetSettings() {
  if(!confirm('Reset to defaults? (Logo will also reset)')) return;
  settings={...DEF};
  pendingLogo=null;
  setSyncState('busy');
  try { await dbSaveSettings(settings); applyLogo(); setSyncState('ok'); renderSettings(); toast('Reset to defaults.'); }
  catch(e){ setSyncState('err'); toast('Error: '+e.message, true); }
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
function esc(s){ if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
