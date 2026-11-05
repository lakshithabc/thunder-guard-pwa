const $ = (id) => document.getElementById(id);
const btn = $('locateBtn');
let refreshTimer;

function ringPoints(lat, lon) {
  const pts = [[lat,lon]];
  // Eight points at 10 km and eight at 19 km: approximate 20 km forecast coverage.
  for (const radius of [10,19]) {
    for (let i=0;i<8;i++) {
      const angle = i*Math.PI/4;
      const north = radius*Math.cos(angle)/111.32;
      const east = radius*Math.sin(angle)/(111.32*Math.cos(lat*Math.PI/180));
      pts.push([lat+north,lon+east]);
    }
  }
  return pts;
}
function riskInfo(p) {
  if (p >= 70) return {label:'High forecast risk',icon:'⛈️',desc:'Thunderstorm conditions are strongly indicated in the forecast area. Seek a substantial enclosed shelter and follow official warnings.'};
  if (p >= 40) return {label:'Moderate forecast risk',icon:'🌩️',desc:'Thunderstorm potential is elevated. Review local conditions and be ready to move indoors.'};
  if (p >= 20) return {label:'Low forecast risk',icon:'🌦️',desc:'Some thunderstorm potential is forecast. Continue monitoring conditions.'};
  return {label:'Very low forecast risk',icon:'☀️',desc:'The forecast currently indicates low thunderstorm potential. Conditions can change.'};
}
function renderHours(times, values) {
  const now = Date.now();
  const selected=[];
  for(let i=0;i<times.length && selected.length<6;i++) if(new Date(times[i]).getTime()>=now-3600000) selected.push({time:times[i],p:values[i]??0});
  $('hours').innerHTML = selected.length ? selected.map(x=>`<div class="hour"><b>${new Date(x.time).toLocaleTimeString([], {hour:'numeric'})}</b><strong>${Math.round(x.p)}%</strong><span>Storm probability</span></div>`).join('') : '<p class="muted">Hourly forecast unavailable.</p>';
}
async function check(lat,lon) {
  $('summary').textContent='Loading forecast data for the surrounding area…';
  const pts=ringPoints(lat,lon);
  const lats=pts.map(p=>p[0].toFixed(4)).join(',');
  const lons=pts.map(p=>p[1].toFixed(4)).join(',');
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&hourly=thunderstorm_probability,precipitation_probability,weather_code&forecast_days=1&timezone=auto`;
  const response=await fetch(url);
  if(!response.ok) throw new Error('Weather service returned '+response.status);
  const raw=await response.json();
  const locations=Array.isArray(raw)?raw:[raw];
  const probs=locations.map(x=>x.hourly?.thunderstorm_probability||[]);
  const valid=probs.flat().filter(v=>v!==null && Number.isFinite(Number(v))).map(Number);
  if(!valid.length) throw new Error('Thunderstorm probability is not available for this forecast area. Please try again later.');
  const max=Math.max(...valid);
  const info=riskInfo(max);
  $('riskIcon').textContent=info.icon;$('riskLabel').textContent=info.label;$('riskValue').textContent=Math.round(max)+'%';$('summary').textContent=info.desc;
  const center=locations[0];
  renderHours(center.hourly?.time||[],center.hourly?.thunderstorm_probability||[]);
  $('updated').textContent='Updated '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  $('locationText').textContent=`Location: ${lat.toFixed(3)}, ${lon.toFixed(3)} · 17 forecast sample points`;
}
function locateAndCheck() {
  if(!navigator.geolocation){$('summary').textContent='This browser does not support location services.';return;}
  btn.disabled=true;btn.textContent='Checking location…';
  navigator.geolocation.getCurrentPosition(async pos=>{
    try { await check(pos.coords.latitude,pos.coords.longitude); }
    catch(err){$('summary').textContent='Unable to load forecast: '+err.message;}
    finally{btn.disabled=false;btn.textContent='Refresh forecast';}
  },err=>{
    $('summary').textContent='Location permission was not granted. Allow location access in your browser settings and try again.';
    btn.disabled=false;btn.textContent='Try location again';
  },{enableHighAccuracy:false,timeout:15000,maximumAge:300000});
}
btn.addEventListener('click',locateAndCheck);
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
// Refresh only while the page is open. This does not provide continuous background monitoring.
setInterval(()=>{ if(document.visibilityState==='visible' && $('locationText').textContent.startsWith('Location: ')){const m=$('locationText').textContent.match(/Location: (-?[\d.]+), (-?[\d.]+)/);if(m) check(Number(m[1]),Number(m[2])).catch(e=>$('summary').textContent='Forecast refresh failed: '+e.message);} },15*60*1000);
