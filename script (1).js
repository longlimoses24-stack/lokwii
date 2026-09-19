/* ============================================================
   NAV / ROUTING
   ============================================================ */
function go(viewId, anchorId){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+viewId).classList.add('active');
  document.getElementById('navlinks').classList.remove('open');
  if(anchorId){
    setTimeout(()=>{
      const el = document.getElementById(anchorId);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, 30);
  } else {
    window.scrollTo({top:0, behavior:'auto'});
  }
  renderNav();
  if(viewId==='dashboard') renderDashboard();
}

function renderNav(){
  const btn = document.getElementById('nav-login-btn');
  if(session){
    btn.textContent = 'My Dashboard';
    btn.onclick = ()=>go('dashboard');
  } else {
    btn.textContent = 'Sponsor Login';
    btn.onclick = ()=>go('auth');
  }
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
const FAQS = [
  {q:'How does child sponsorship work?', a:'When you sponsor a child, your monthly gift goes directly toward that child’s school fees, meals, shelter, and skills training. Our team matches you with a specific child in the age group you choose, and keeps you updated on their progress.'},
  {q:'Where exactly does my money go?', a:'Your contribution funds the six core services the Foundation provides: shelter, food, education, computer skills training, farming and animal-rearing training, and spiritual guidance — all delivered to children in and around Lorengchora, Napak District.'},
  {q:'Can I visit the children I sponsor?', a:'Yes. We welcome sponsors and partners to visit Lorengchora and see the work firsthand. Reach out through the contact form or call our director, Hannah Longoli, to plan your visit.'},
  {q:'What age group can I sponsor?', a:'We support Karamojong children aged 8 to 15. You can choose to sponsor a child in the 8–10, 11–13, or 14–15 age range when you sign up.'},
  {q:'How is Hannah Foundation run?', a:'The Foundation is led by founder and director Hannah Longoli, supported by a team of five staff who work directly in the community — identifying children in need, coordinating schooling, and running day-to-day programs.'},
  {q:'How do I become a partner or volunteer?', a:'We’d love to have you. Use the contact form below, or email hannahfoundation360@gmail.com directly, and our team will follow up with ways to get involved.'}
];

function renderFaqs(){
  const list = document.getElementById('faqlist');
  list.innerHTML = FAQS.map((f,i)=>`
    <div class="faqitem" id="faq-${i}">
      <button class="faqq" onclick="toggleFaq(${i})">
        <span>${f.q}</span><span class="plus">+</span>
      </button>
      <div class="faqa" id="faqa-${i}"><div class="faqa-inner">${f.a}</div></div>
    </div>`).join('');
}
function toggleFaq(i){
  const item = document.getElementById('faq-'+i);
  const panel = document.getElementById('faqa-'+i);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faqitem.open').forEach(el=>{
    el.classList.remove('open');
    document.getElementById(el.id.replace('faq-','faqa-')).style.maxHeight = null;
  });
  if(!isOpen){
    item.classList.add('open');
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }
}

/* ============================================================
   CONTACT FORM (client-only — opens a pre-filled email)
   ============================================================ */
function handleContactForm(e){
  e.preventDefault();
  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const message = document.getElementById('c-message').value.trim();
  const subject = encodeURIComponent('Message from '+name+' via Hannah Foundation website');
  const body = encodeURIComponent(message + '\\n\\nFrom: '+name+' ('+email+')');
  window.location.href = `mailto:hannahfoundation360@gmail.com?subject=${subject}&body=${body}`;
  const msg = document.getElementById('contact-msg');
  msg.classList.add('show');
  e.target.reset();
  return false;
}

/* ============================================================
   SPONSOR AUTH + PLEDGES (client-only demo, localStorage)
   ============================================================ */
const STORE_KEY = 'hannah_sponsors_v1';
function loadSponsors(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }catch(e){ return []; }
}
function saveSponsors(list){ localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

let session = JSON.parse(localStorage.getItem('hannah_session') || 'null');
let pendingAgeGroup = null;

function setAuthTab(which){
  document.getElementById('tab-login').classList.toggle('active', which==='login');
  document.getElementById('tab-signup').classList.toggle('active', which==='signup');
  document.getElementById('form-login').style.display = which==='login' ? 'block':'none';
  document.getElementById('form-signup').style.display = which==='signup' ? 'block':'none';
}

function startSponsorship(ageGroup){
  pendingAgeGroup = ageGroup;
  if(session){
    addPledge(ageGroup);
    go('dashboard');
  } else {
    go('auth');
    setAuthTab('signup');
  }
}

function handleLogin(e){
  e.preventDefault();
  const msg = document.getElementById('login-msg');
  msg.classList.remove('show');
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const sponsors = loadSponsors();
  const found = sponsors.find(s=>s.email.toLowerCase()===email && s.password===password);
  if(!found){
    msg.textContent = 'No sponsor account matches that email and password.';
    msg.classList.add('show');
    return false;
  }
  session = {email:found.email, name:found.name};
  localStorage.setItem('hannah_session', JSON.stringify(session));
  if(pendingAgeGroup){ addPledge(pendingAgeGroup); pendingAgeGroup=null; }
  go('dashboard');
  return false;
}

function handleSignup(e){
  e.preventDefault();
  const msg = document.getElementById('signup-msg');
  msg.classList.remove('show');
  const email = document.getElementById('su-email').value.trim();
  const sponsors = loadSponsors();
  if(sponsors.some(s=>s.email.toLowerCase()===email.toLowerCase())){
    msg.textContent = 'An account with that email already exists — try logging in instead.';
    msg.classList.add('show');
    return false;
  }
  const newSponsor = {
    name: document.getElementById('su-name').value.trim(),
    email,
    phone: document.getElementById('su-phone').value.trim(),
    password: document.getElementById('su-password').value,
    pledges: []
  };
  sponsors.push(newSponsor);
  saveSponsors(sponsors);
  session = {email:newSponsor.email, name:newSponsor.name};
  localStorage.setItem('hannah_session', JSON.stringify(session));
  if(pendingAgeGroup){ addPledge(pendingAgeGroup); pendingAgeGroup=null; }
  go('dashboard');
  return false;
}

function logout(){
  session = null;
  localStorage.removeItem('hannah_session');
  renderNav();
  go('home');
}

function addPledge(ageGroup){
  if(!session) return;
  const sponsors = loadSponsors();
  const me = sponsors.find(s=>s.email===session.email);
  if(!me) return;
  me.pledges = me.pledges || [];
  me.pledges.push({ageGroup, date:new Date().toISOString().slice(0,10)});
  saveSponsors(sponsors);
}

function renderDashboard(){
  if(!session){ go('auth'); return; }
  document.getElementById('dash-welcome').textContent = 'Welcome back, '+session.name;
  const sponsors = loadSponsors();
  const me = sponsors.find(s=>s.email===session.email);
  const list = document.getElementById('pledge-list');
  const pledges = (me && me.pledges) || [];
  if(pledges.length===0){
    list.innerHTML = `<div class="empty"><h3 style="font-family:'Domine',serif;color:var(--ink);margin-bottom:6px;">No sponsorships yet</h3><p>Choose an age group below to start sponsoring a child.</p></div>`;
    return;
  }
  list.innerHTML = pledges.map(p=>`
    <div class="pledgecard">
      <div><strong>Ages ${p.ageGroup}</strong><div style="font-size:0.78rem;color:var(--ink-soft);">Started ${p.date}</div></div>
      <span class="pc-amt">Matched by Foundation team</span>
    </div>`).join('');
}

/* ============================================================
   INIT
   ============================================================ */
renderFaqs();
renderNav();
document.getElementById('footer-year').textContent = new Date().getFullYear();
