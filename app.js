// app.js — Suleiman Cyber System (main-screen chat, Gemini optional)
// NOTE: This file uses a client-side Gemini key only if you select "Gemini" mode.
// For production, using a server-side proxy is strongly recommended.

const courses = [
  { id:'intro-cyber', title:'Introduction to Cybersecurity', desc:'Foundations: CIA triad, basics, ethics.',
    lessons:[
      {id:'l1',title:'What is Cybersecurity?', content:'Cybersecurity protects systems, networks, and data. The CIA triad: Confidentiality, Integrity, Availability.'},
      {id:'l2',title:'Basic Terminology', content:'Threat, vulnerability, exploit, risk, mitigation, patching.'},
      {id:'l3',title:'Careers & Ethics', content:'Blue team, red team, SOC, compliance.'}
    ]
  },
  { id:'ethical-hacking', title:'Fundamentals of Ethical Hacking', desc:'Recon & scanning basics, responsible disclosure.',
    lessons:[
      {id:'h1',title:'Reconnaissance',content:'Passive vs active recon; examples: whois, DNS lookup.'},
      {id:'h2',title:'Scanning',content:'Port scanning basics (nmap).'},
      {id:'h3',title:'Exploitation Basics',content:'Overview of common vulnerabilities.'}
    ]
  },
  { id:'defense', title:'Defensive Strategies', desc:'Hardening, monitoring, incident response.',
    lessons:[
      {id:'d1',title:'Hardening Systems',content:'Least privilege, secure configs.'},
      {id:'d2',title:'Monitoring & Detection',content:'Logs, SIEM basics.'},
      {id:'d3',title:'Incident Response',content:'Identification → containment → recovery.'}
    ]
  }
];

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const create = (tag, cls='') => { const e = document.createElement(tag); if(cls) e.className = cls; return e; };

function saveJSON(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function readJSON(k,def=null){ try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def } }

/* ---------- DOM ---------- */
const chatWindow = $('#chatWindow');
const controls = $('#controls');
const aiModeSelect = $('#aiMode');
const geminiKeyInput = $('#geminiKey');
const saveKeyBtn = $('#saveKey');

const btnCatalog = $('#btnCatalog');
const btnMyWork = $('#btnMyWork');
const btnForum = $('#btnForum');
const btnSettings = $('#btnSettings');
const coursesGrid = $('#coursesGrid');
const catalog = $('#catalog');
const courseView = $('#courseView');
const courseContent = $('#courseContent');
const backToCatalog = $('#backToCatalog');
const myWork = $('#myWork');
const forum = $('#forum');
const forumList = $('#forumList');
const postMsgBtn = $('#postMsg');

/* ---------- UI management ---------- */
function clearChat(){ chatWindow.innerHTML=''; }
function pushMsg(text, who='ai'){ const m = create('div','msg '+(who==='ai'?'ai':'user')); m.textContent = text; chatWindow.appendChild(m); chatWindow.scrollTop = chatWindow.scrollHeight; }
function setControls(nodes){ controls.innerHTML=''; nodes.forEach(n=>controls.appendChild(n)); }

/* ---------- assistant flow (stepwise) ---------- */
function startAssistant(){
  clearChat();
  pushMsg('Hello — I am your AI assistant. I will guide you step-by-step and wait for your confirmation before continuing.');
  setTimeout(()=> askIntroQuestion(), 700);
}

function askIntroQuestion(){
  pushMsg('First: Do you have prior cybersecurity knowledge, or are you a beginner?');
  const btnBegin = create('button','btn'); btnBegin.textContent='I am a Beginner';
  const btnSome = create('button','btn'); btnSome.textContent='Some Knowledge';
  const btnAdv = create('button','btn'); btnAdv.textContent='Advanced';
  btnBegin.onclick = ()=> selectLevel('beginner');
  btnSome.onclick = ()=> selectLevel('intermediate');
  btnAdv.onclick = ()=> selectLevel('advanced');
  setControls([btnBegin, btnSome, btnAdv]);
}

function selectLevel(level){
  pushMsg(`Selected: ${level}`, 'user');
  localStorage.setItem('suleiman_user_level', level);
  setControls([]);
  setTimeout(()=> {
    pushMsg(`Nice. I will recommend a short learning path for you. Ready for recommendations?`);
    const yes = create('button','btn primary'); yes.textContent='Yes, show me';
    const later = create('button','btn'); later.textContent='Maybe later';
    yes.onclick = ()=> { pushMsg('Yes, show me','user'); showRecommendations(level); };
    later.onclick = ()=> { pushMsg('Maybe later','user'); pushMsg('Alright — open the Catalog anytime from the top menu.'); setControls([]); };
    setControls([yes,later]);
  },600);
}

function showRecommendations(level){
  setControls([]);
  if(level === 'beginner'){
    pushMsg('Recommended path: 1) Introduction to Cybersecurity → 2) Ethical Hacking basics → 3) Defensive Strategies');
  } else if(level === 'intermediate'){
    pushMsg('Recommended path: 1) Ethical Hacking basics → 2) Defensive Strategies → 3) Labs');
  } else {
    pushMsg('Recommended path: 1) Advanced offensive techniques (ethical) → 2) Defensive response → 3) Labs');
  }
  const open = create('button','btn primary'); open.textContent='Open Catalog';
  open.onclick = ()=> { pushMsg('Open Catalog','user'); renderCatalog(); showSection('catalog'); setControls([]); };
  setControls([open]);
}

/* ---------- Catalog ---------- */
function renderCatalog(){
  coursesGrid.innerHTML = '';
  const level = localStorage.getItem('suleiman_user_level') || 'beginner';
  const list = [...courses];
  if(level === 'beginner') list.sort((a,b)=> a.id==='intro-cyber' ? -1 : 0);
  list.forEach(c=>{
    const el = create('div','book'); el.innerHTML = `<h3>${c.title}</h3><p>${c.desc}</p>`;
    const open = create('button','openBtn'); open.textContent='Open';
    open.onclick = ()=> openCourse(c.id);
    el.appendChild(open);
    coursesGrid.appendChild(el);
  });
}

/* ---------- open a course (text only) ---------- */
function openCourse(id){
  const c = courses.find(x=>x.id===id);
  if(!c) return;
  courseContent.innerHTML = `<h2>${c.title}</h2><p style="color:#9fb9c9">${c.desc}</p>`;
  c.lessons.forEach(lesson=>{
    const d = create('div','lesson card');
    d.innerHTML = `<h4>${lesson.title}</h4><p>${lesson.content}</p>
      <div class="homework">
        <label>Homework: Summarize this lesson in 2–4 sentences</label>
        <textarea id="hw-${lesson.id}" placeholder="Write summary here..." style="width:100%;min-height:90px;margin-top:8px;padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.04);color:#dff6ff"></textarea>
        <button data-course="${id}" data-lesson="${lesson.id}" class="btn" style="margin-top:8px">Submit</button>
        <div id="fb-${lesson.id}" style="margin-top:8px;color:#9fb9c9"></div>
      </div>`;
    courseContent.appendChild(d);
  });
  // certificate
  const cert = create('button','btn'); cert.textContent='Generate Certificate'; cert.style.marginTop='8px';
  cert.onclick = ()=> generateCertificate(c.title);
  courseContent.appendChild(cert);

  backToCatalog.onclick = ()=> { renderCatalog(); showSection('catalog') };
  showSection('courseView');

  // attach submit listeners
  setTimeout(()=>{
    document.querySelectorAll('.homework button').forEach(b=>{
      b.addEventListener('click', async (e)=>{
        const courseId = e.target.dataset.course;
        const lessonId = e.target.dataset.lesson;
        const ta = document.getElementById(`hw-${lessonId}`);
        const answer = (ta.value || '').trim();
        if(!answer){ alert('Please write your homework before submitting.'); return; }
        // save submission locally
        const subs = readJSON('suleiman_submissions', []) || [];
        const record = { id:Date.now(), courseId, lessonId, answer, ts:new Date().toISOString() };
        subs.unshift(record); saveJSON('suleiman_submissions', subs);
        // get feedback (Gemini or simulated)
        const fb = await getAIResponse(`Give brief feedback for this student answer: "${answer}"`);
        document.getElementById(`fb-${lesson.id}`).textContent = `Feedback: ${fb}`;
        renderSubmissions();
        // ask user if they understood
        pushMsg('I have given feedback. Do you understand the suggestions?');
        const yes = create('button','btn primary'); yes.textContent='Yes, understood';
        const explain = create('button','btn'); explain.textContent='Explain more';
        yes.onclick = ()=> { pushMsg('Yes, understood','user'); pushMsg('Great — move to the next lesson when ready.'); setControls([]); };
        explain.onclick = ()=> { pushMsg('Explain more','user'); pushMsg('Example: add a short real-world example showing how the concept applies.'); };
        setControls([yes, explain]);
      });
    });
  }, 120);
}

/* ---------- Submissions & forum ---------- */
function renderSubmissions(){
  const list = readJSON('suleiman_submissions', []) || [];
  const el = $('#submissionsList'); if(!el) return;
  el.innerHTML = '';
  if(!list.length){ el.innerHTML = '<div class="card" style="color:#9fb9c9">No submissions yet.</div>'; return; }
  list.forEach(s=>{
    const d = create('div','card'); d.innerHTML = `<strong>${s.courseId} — ${s.lessonId}</strong><div style="color:#9fb9c9">${new Date(s.ts).toLocaleString()}</div><p>${s.answer}</p>`;
    el.appendChild(d);
  });
  const certEl = $('#certList'); if(certEl) certEl.innerHTML = '<div style="color:#9fb9c9">Certificates will appear here.</div>';
}

postMsgBtn.addEventListener('click', ()=>{
  const name = $('#forumName').value.trim() || 'Anonymous';
  const msg = $('#forumMsg').value.trim();
  if(!msg) return alert('Type a message first');
  const posts = readJSON('suleiman_forum',[])||[];
  posts.unshift({id:Date.now(),name,msg,ts:new Date().toISOString()});
  saveJSON('suleiman_forum', posts);
  $('#forumMsg').value='';
  renderForum();
});
function renderForum(){
  const posts = readJSON('suleiman_forum',[])||[];
  forumList.innerHTML='';
  if(!posts.length){ forumList.innerHTML = '<div class="card" style="color:#9fb9c9">No posts yet.</div>'; return; }
  posts.forEach(p=>{
    const e = create('div','forum-entry card'); e.innerHTML = `<strong>${p.name}</strong><div style="color:#9fb9c9">${new Date(p.ts).toLocaleString()}</div><p>${p.msg}</p>`;
    forumList.appendChild(e);
  });
}

/* ---------- Certificate ---------- */
function generateCertificate(courseTitle){
  const name = prompt('Enter your name for the certificate:') || 'Student';
  const w = window.open('','_blank');
  const html = `
    <html><head><title>Certificate</title>
    <style>body{font-family:Arial;padding:40px;color:#042;background:#fff} .card{border:8px solid ${getComputedStyle(document.documentElement).getPropertyValue('--accent')||'#1294d6'};padding:30px;border-radius:12px;text-align:center}</style></head>
    <body><div class="card"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${name}</h2><p>has completed</p><h3>${courseTitle}</h3><p>Date: ${new Date().toLocaleDateString()}</p><p>Powered by SULEIMAN CYBER SYSTEM</p></div></body></html>`;
  w.document.write(html); w.document.close();
}

/* ---------- AI / Gemini integration ---------- */

/*
  IMPORTANT SECURITY NOTE (read before enabling Gemini mode):
  - Putting your Gemini API key inside client-side JavaScript exposes it to anyone who inspects the page.
  - For production, you should create a small server-side proxy that stores your API key and forwards requests securely.
  - This demo supports a client-side Gemini call (best-effort), but CORS or endpoint changes might require a server proxy.
*/

/* helper: call Gemini or fallback to simulated response */
async function getAIResponse(prompt){
  const mode = (aiModeSelect.value || 'sim');
  // quick simulated responses (safe)
  if(mode === 'sim') {
    // simple rule-based reply (keeps things short - stepwise)
    const words = prompt.split(/\s+/).length;
    if(words < 6) return 'Short reply — try to add 2-3 sentences.';
    if(prompt.toLowerCase().includes('attack') || prompt.toLowerCase().includes('exploit')) {
      return 'Good awareness of attacker methods — emphasize ethics and defense.';
    }
    return 'Good summary. Add a brief example or step to improve clarity.';
  }

  // Gemini mode - use stored key (user provided)
  const key = (localStorage.getItem('suleiman_gemini_key') || '').trim();
  if(!key) return 'Gemini key not provided. Please save your key in Settings or use Simulated mode.';

  // Example of a generic request to a Gemini-like REST endpoint.
  // WARNING: This is a template. The actual Gemini REST endpoint, payload, and URL may change.
  // You might need to adapt to the exact endpoint your Gemini key requires.
  try {
    // Template endpoint used by Google GenAI REST (may require adjustment).
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';
    const body = {
      // model-specific fields differ between providers; adjust as necessary.
      "prompt": { "text": prompt },
      "temperature": 0.2,
      "maxOutputTokens": 240
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // using API key header or bearer depends on provider: many Google GenAI endpoints use key in URL or Authorization Bearer
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });

    if(!res.ok){
      // try fallback: maybe the provider expects apiKey as query param
      const txt = await res.text();
      console.warn('Gemini request failed:', res.status, txt);
      return 'Gemini request failed (check key / CORS). Using simulated answer instead.';
    }
    const j = await res.json();
    // The response shape can vary — try to find a human text piece
    const out = (j?.candidates?.[0]?.content) || j?.content?.[0]?.text || j?.output?.[0]?.content || JSON.stringify(j);
    // keep the answer short and stepwise
    return (typeof out === 'string' && out.length>0) ? out.slice(0,800) : JSON.stringify(out).slice(0,800);
  } catch (err) {
    console.error('Gemini fetch error',err);
    return 'Error calling Gemini (CORS or endpoint issue). Use simulated mode or set up server proxy.';
  }
}

/* ---------- helpers to show/hide sections ---------- */
function showSection(id){
  ['catalog','courseView','myWork','forum'].forEach(k=>{ const el = document.getElementById(k); if(el) el.classList.add('hidden'); });
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
}

/* ---------- navigation events ---------- */
btnCatalog.onclick = ()=> { renderCatalog(); showSection('catalog'); };
btnMyWork.onclick = ()=> { renderSubmissions(); showSection('myWork'); };
btnForum.onclick = ()=> { renderForum(); showSection('forum'); };
btnSettings.onclick = ()=> { showSection('catalog'); /* keep catalog visible and settings are on right */ };

/* ---------- save / load gemini key ---------- */
saveKeyBtn.addEventListener('click', ()=>{
  const val = geminiKeyInput.value.trim();
  if(!val){ alert('Enter a key to save or press Cancel'); return; }
  localStorage.setItem('suleiman_gemini_key', val);
  alert('Gemini key saved locally. Reminder: client-side keys are visible to anyone who inspects the site.');
});

/* ---------- initial run ---------- */
renderCatalog();
renderSubmissions();
renderForum();
startAssistant();

/* register service worker (optional but harmless if you add sw.js later) */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{ /* ignore */ });
}
