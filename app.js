// Talks to the Google Apps Script backend (Code.gs). API_URL is set in js/config.js
function api(action,payload){
return fetch(API_URL,{method:'POST',body:JSON.stringify(Object.assign({action},payload))}).then(r=>r.json())}
const $=id=>document.getElementById(id);
const st=$('state'),lg=$('lga');
Object.keys(LGAS).sort().forEach(s=>st.add(new Option(s,s)));
st.onchange=()=>{lg.length=0;if(!st.value){lg.add(new Option('Select state first',''));lg.disabled=true;return}
lg.add(new Option('Select LGA',''));LGAS[st.value].split(',').forEach(l=>lg.add(new Option(l,l)));lg.disabled=false};
['phone','guardian'].forEach(i=>$(i).oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,11));
const phoneOk=p=>/^0[789][01]\d{8}$/.test(p);
const rules={
surname:v=>v.length>=2||'Enter your surname',
otherNames:v=>v.length>=2||'Enter your other names',
dob:v=>(v&&v<new Date().toISOString().slice(0,10))||'Choose a valid date of birth',
gender:v=>!!v||'Select your gender',
state:v=>!!v||'Select your state of origin',
lga:v=>!!v||'Select your LGA',
phone:v=>phoneOk(v)||'Enter a valid 11-digit Nigerian number (e.g. 08012345678)',
email:v=>/^[^\s@]+@[^\s@]+\.com$/i.test(v)||'Email must be valid and end with .com',
programme:v=>!!v||'Select your programme',
guardian:v=>phoneOk(v)||'Enter a valid 11-digit phone number'};
let JAMB='',ENTRY='UTME';
function setupLogin(fid,iid,eid,bid,mode){
const inp=$(iid);
inp.oninput=e=>e.target.value=e.target.value.toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,14);
$(fid).onsubmit=e=>{e.preventDefault();const v=inp.value.trim(),er=$(eid),b=$(bid);
if(!/^\d{12}[A-Z]{2}$/.test(v)){er.textContent='Enter a valid JAMB registration number.';return}
er.textContent='';b.disabled=true;b.textContent='Checking...';
api('check',{jamb:v,mode}).then(r=>{b.disabled=false;b.textContent='Continue';
if(r.ok){JAMB=v;ENTRY=mode;$('loginPage').style.display='none';$('dePage').style.display='none';$('formPage').style.display='block';
$('jambTag').textContent=(mode==='DE'?'Direct Entry | ':'')+'JAMB No: '+v;scrollTo(0,0)}else er.textContent=r.msg})
.catch(()=>{b.disabled=false;b.textContent='Continue';er.textContent='Network error. Please try again.'})}}
setupLogin('lf','jamb','jerr','lbtn','UTME');
setupLogin('df','jambDe','derr','dbtn','DE');
$('toDe').onclick=()=>{$('loginPage').style.display='none';$('dePage').style.display='block';scrollTo(0,0)};
$('toUtme').onclick=()=>{$('dePage').style.display='none';$('loginPage').style.display='block';scrollTo(0,0)};
$('f').onsubmit=e=>{e.preventDefault();let ok=true,d={};
Object.keys(rules).forEach(k=>{const el=$(k),v=el.value.trim(),r=rules[k](v);d[k]=v;
el.parentNode.querySelector('#'+k+' + .err').textContent=r===true?'':r;if(r!==true)ok=false});
d.matric=$('matric').value.trim();d.jamb=JAMB;d.entry=ENTRY;
if(!ok){$('top').textContent='Please correct the highlighted fields.';return}
$('top').textContent='';$('btn').disabled=true;$('btn').textContent='Submitting...';
api('submit',{data:d}).then(r=>{if(r.ok){$('f').style.display='none';$('done').style.display='block';scrollTo(0,0)}
else{$('top').textContent=r.msg;$('btn').disabled=false;$('btn').textContent='Submit registration'}})
.catch(()=>{$('top').textContent='Network error. Please try again.';$('btn').disabled=false;$('btn').textContent='Submit registration'})};
