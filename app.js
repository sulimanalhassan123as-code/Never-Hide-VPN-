/* Suleiman Cyber System - stepwise AI assistant + courses (no video)
   - assistant shows short messages and waits for user confirmation before continuing
   - lessons are text only
   - homework saved locally and receives simulated feedback
*/

const courses = [
  {
    id: 'intro-cyber',
    title: 'Introduction to Cybersecurity',
    desc: 'Foundations: CIA triad, basic terminology, careers.',
    lessons: [
      { id: 'l1', title: 'What is Cybersecurity?', content: 'Cybersecurity protects systems, networks, and data. The CIA triad: Confidentiality, Integrity, Availability.'},
      { id: 'l2', title: 'Basic Terminology', content: 'Threat, vulnerability, exploit, risk, mitigation, patching.'},
      { id: 'l3', title: 'Careers & Ethics', content: 'Blue team, red team, SOC, compliance.'}
    ]
  },
  {
    id: 'ethical-hacking',
    title: 'Fundamentals of Ethical Hacking',
    desc: 'Reconnaissance, scanning, exploitation basics, responsible disclosure.',
    lessons: [
      { id: 'h1', title: 'Reconnaissance', content: 'Passive vs active recon, tools (whois, nslookup).'},
      { id: 'h2', title: 'Scanning', content: 'Port scanning basics (nmap), service discovery.'},
      { id: 'h3', title: 'Exploitation Basics', content: 'Common web vulnerabilities overview (XSS, SQLi).'}
    ]
  },
  {
    id: 'defense',
    title: 'Defensive Strategies',
    desc: 'Hardening, patching, monitoring, incident response.',
    lessons: [
      { id: 'd1', title: 'Hardening Systems', content: 'Least privilege, secure configuration.'},
      { id: 'd2', title: 'Monitoring & Detection', content: 'SIEM basics, logs, alerts.'},
      { id: 'd3', title: 'Incident Response', content: 'Steps: Identification, containment, eradication, recovery.'}
    ]
  }
];

/* helpers */
const $ = s => document.querySelector(s);
const show = id => {
  document.querySelectorAll('main section, main > div.card, main aside.assistant').forEach(n=>n.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
};
const saveJSON = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const readJSON = (k,def=null)=>{ try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def } };

/* DOM */
const assistantMsgs = document.getElementById('assistantMessages');
const assistantControls = document.getElementById('assistantControls');

const welcomeCard = $('#welcomeCard');
const coursesGrid = $('#coursesGrid');
const catalog = $('#catalog');
const courseView = $('#courseView');
const courseContent = $('#courseContent');
const myWork = $('#myWork');
const forum = $('#forum');

const btnCatalog = $('#btnCatalog');
const btnMyWork = $('#btnMyWork');
const btnForum = $('#btnForum');
const btnSettings = $('#btnSettings');

btnCatalog.onclick = ()=> { renderCatalog(); show('catalog'); showAssistantPanel(); };
btnMyWork.onclick = ()=> { renderSubmissions(); show('myWork'); hideAssistantPanel(); };
btnForum.onclick = ()=> { renderForum(); show('forum'); hideAssistantPanel(); };
btnSettings.onclick = ()=> { show('settings'); hideAssistantPanel(); };

/* assistant helpers */
function clearAssistant(){
  assistantMsgs.innerHTML = '';
  assistantControls.innerHTML = '';
}
function pushAI(text){
  const d = document.createElement('div'); d.className='assistant-msg ai'; d.textContent = text;
  assistantMsgs.appendChild(d); assistantMsgs.scrollTop = assistantMsgs.scrollHeight;
}
function pushUser(text){
  const d = document.createElement('div'); d.className='assistant-msg user'; d.textContent = text;
  assistantMsgs.appendChild(d); assistantMsgs.scrollTop = assistantMsgs.scrollHeight;
}
function setAssistantButtons(buttons=[]){
  assistantControls.innerHTML = '';
  buttons.forEach(b=>{
    const btn = document.createElement('button');
    btn.className = b.primary ? 'btn-primary' : 'btn-ghost';
    btn.textContent = b.label;
    btn.onclick = b.onClick;
    assistantControls.appendChild(btn);
  });
}

/* initial assistant state */
function showAssistantPanel(){ document.querySelector('aside.assistant').classList.remove('hidden'); }
function hideAssistantPanel(){ document.querySelector('aside.assistant').classList.add('hidden'); }

/* Stepwise welcome flow */
function startWelcomeFlow(){
  clearAssistant();
  pushAI('Hello — I am your AI assistant. I will guide you step-by-step. First: do you understand that this course will teach cybersecurity basics and responsible ethical behavior?');
  setAssistantButtons([
    { label: 'I understand', primary:true, onClick: ()=> { pushUser('I understand'); step2(); } },
    { label: 'Explain again', onClick: ()=> { pushUser('Explain again'); pushAI('This platform teaches defensive and ethical skills: how to find vulnerabilities responsibly and how to protect systems. It will never teach harming others. Do you understand now?'); setAssistantButtons([{label:'I understand', primary:true, onClick: ()=> { pushUser('I understand'); step2(); }}]); } }
  ]);
}

function step2(){
  pushAI('Good. Next: I will show you a short course recommendation based on your level. Would you like to continue to recommendations?');
  setAssistantButtons([
    { label: 'Yes, continue', primary:true, onClick: ()=> { pushUser('Yes, continue'); showRecommendations(); } },
    { label: 'Not now', onClick: ()=> { pushUser('Not now'); pushAI('No problem — you can open the Catalog anytime.'); setAssistantButtons([{label:'Open Catalog', primary:true, onClick: ()=>{ pushUser('Open Catalog'); renderCatalog(); show('catalog'); }}]); } }
  ]);
}

function showRecommendations(){
  // simple tailored message
  const level = localStorage.getItem('suleiman_user_level') || 'beginner';
  pushAI(`Based on your level: ${level}. I recommend starting with:`);
  if(level === 'beginner') pushAI('1) Introduction to Cybersecurity\n2) Fundamentals of Ethical Hacking\n3) Defensive Strategies');
  else if(level === 'intermediate') pushAI('1) Fundamentals of Ethical Hacking\n2) Defensive Strategies\n3) Labs & Practice');
  else pushAI('1) Offensive techniques (responsibly)\n2) Defense & Incident Response\n3) Advanced labs');
  setAssistantButtons([{ label: 'Open Catalog', primary:true, onClick: ()=>{ pushUser('Open Catalog'); renderCatalog(); show('catalog'); } }]);
}

/* Welcome button handlers (choose level) */
document.querySelectorAll('.pill').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const level = e.target.dataset.level;
    localStorage.setItem('suleiman_user_level', level);
    pushUser(`Level selected: ${level}`);
    startWelcomeFlow();
  });
});

/* render catalog */
function renderCatalog(){
  coursesGrid.innerHTML = '';
  const userLevel = localStorage.getItem('suleiman_user_level') || 'beginner';
  const ordered = [...courses];
  if(userLevel === 'beginner') ordered.sort((a,b)=> a.id === 'intro-cyber' ? -1 : 0);
  ordered.forEach(c=>{
    const card = document.createElement('div'); card.className='book card book';
    card.innerHTML = `<h3>${c.title}</h3><p>${c.desc}</p><button class="openBtn">Open Course</button>`;
    card.querySelector('.openBtn').addEventListener('click', ()=> openCourse(c.id));
    coursesGrid.appendChild(card);
  });
}

/* open course (no video) */
function openCourse(courseId){
  const c = courses.find(x=>x.id===courseId);
  if(!c) return;
  courseContent.innerHTML = `<h2>${c.title}</h2><p class="muted">${c.desc}</p>`;
  c.lessons.forEach(lesson=>{
    const d = document.createElement('div'); d.className='lesson card';
    d.innerHTML = `<h4>${lesson.title}</h4>
                   <p>${lesson.content}</p>
                   <div class="homework"><label>Homework: Summarize this lesson in 2-4 sentences</label>
                   <textarea id="hw-${lesson.id}" placeholder="Write your summary here..."></textarea>
                   <button data-course="${courseId}" data-lesson="${lesson.id}" class="submitHomework">Submit Homework</button>
                   <div class="feedback" id="fb-${lesson.id}"></div>
                   </div>`;
    courseContent.appendChild(d);
  });

  const certBtn = document.createElement('button'); certBtn.className='link'; certBtn.textContent='Download Certificate for this Course';
  certBtn.addEventListener('click', ()=> generateCertificate(c.title));
  courseContent.appendChild(certBtn);

  $('#backToCatalog').onclick = ()=> { renderCatalog(); show('catalog'); };
  show('courseView');
  showAssistantPanel();
  pushAI(`You opened the course: ${c.title}. Read each lesson, then submit the short homework when ready. I will check it and give feedback. Would you like me to remind you to take breaks?`);
  setAssistantButtons([
    { label: 'Yes, remind me', primary:true, onClick: ()=> { pushUser('Yes, remind me'); pushAI('I will remind after each lesson to rest 5 minutes. Good luck!'); setAssistantButtons([{label:'OK', onClick: ()=>{ pushUser('OK'); }}]); } },
    { label: 'No, thanks', onClick: ()=> { pushUser('No, thanks'); pushAI('Alright — continue at your pace.'); setAssistantButtons([{label:'Let\'s continue', primary:true, onClick: ()=>{ pushUser('Let\'s continue'); }}]); } }
  ]);

  // attach homework submit listeners
  setTimeout(()=>{
    document.querySelectorAll('.submitHomework').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const courseId = e.target.dataset.course;
        const lessonId = e.target.dataset.lesson;
        const textarea = document.getElementById(`hw-${lessonId}`);
        const answer = textarea.value.trim();
        if(!answer){ alert('Please write your homework before submitting.'); return; }
        const submissions = readJSON('suleiman_submissions', []) || [];
        const record = { id: Date.now(), courseId, lessonId, answer, timestamp: new Date().toISOString() };
        submissions.unshift(record);
        saveJSON('suleiman_submissions', submissions);
        const fb = await getFeedback(answer);
        document.getElementById(`fb-${lessonId}`).innerHTML = `<div class="muted">Feedback: ${fb}</div>`;
        renderSubmissions();
        // assistant asks if user understood feedback
        pushAI('I gave feedback. Do you understand the suggestions?');
        setAssistantButtons([
          { label: 'Yes, understood', primary:true, onClick: ()=>{ pushUser('Yes, understood'); pushAI('Great — move to the next lesson when ready.'); setAssistantButtons([]); } },
          { label: 'Explain more', onClick: ()=>{ pushUser('Explain more'); pushAI('Example: add an example scenario with steps and tools. If you want, ask me for sample commands.'); } }
        ]);
      });
    });
  }, 120);
}

/* simulated AI feedback */
async function getFeedback(text){
  const mode = (document.getElementById('aiMode')?.value) || 'sim';
  if(mode === 'api'){
    const key = localStorage.getItem('suleiman_ai_key') || '';
    if(!key) return 'AI key not set. Switch to Simulated mode or add key in Settings.';
    return 'External AI mode selected but no live call configured in this demo.';
  } else {
    const words = text.split(/\s+/).length;
    if(words < 8) return 'Short answer — try to write at least 2-3 sentences with examples.';
    if(text.toLowerCase().includes('attack') || text.toLowerCase().includes('exploit')) {
      return 'Good awareness of attacker methods — emphasize ethics and defense.';
    }
    return 'Nice summary! You covered the main ideas — consider adding an example scenario.';
  }
}

/* submissions & forum */
function renderSubmissions(){
  const list = readJSON('suleiman_submissions', []) || [];
  const el = $('#submissionsList'); if(!el) return;
  el.innerHTML = '';
  if(!list.length) { el.innerHTML = '<div class="card muted">No submissions yet.</div>'; return; }
  list.forEach(s=>{
    const d = document.createElement('div'); d.className='card';
    const course = courses.find(c=>c.id === s.courseId)?.title || s.courseId;
    d.innerHTML = `<strong>${course} — ${s.lessonId}</strong><div class="muted">${new Date(s.timestamp).toLocaleString()}</div><p>${s.answer}</p>`;
    el.appendChild(d);
  });
  const certEl = $('#certList'); certEl.innerHTML = '<h3>Your Certificates</h3><div class="muted">Certificates for completed courses will appear here.</div>';
}

/* forum */
$('#postMsg').addEventListener('click', ()=>{
  const name = $('#forumName').value.trim() || 'Anonymous';
  const msg = $('#forumMsg').value.trim();
  if(!msg) return alert('Type a message first');
  const posts = readJSON('suleiman_forum', []) || [];
  posts.unshift({id:Date.now(), name, msg, ts: new Date().toISOString()});
  saveJSON('suleiman_forum', posts);
  $('#forumMsg').value = '';
  renderForum();
});
function renderForum(){
  const posts = readJSON('suleiman_forum', []) || [];
  const list = $('#forumList'); list.innerHTML = '';
  if(!posts.length) { list.innerHTML = '<div class="card muted">No posts yet — be the first!</div>'; return; }
  posts.forEach(p=>{
    const e = document.createElement('div'); e.className='forum-entry';
    e.innerHTML = `<strong>${p.name}</strong> <span class="muted">${new Date(p.ts).toLocaleString()}</span><p>${p.msg}</p>`;
    list.appendChild(e);
  });
}

/* certificate generation (printable) */
function generateCertificate(courseTitle){
  const name = prompt('Enter your name for the certificate:') || 'Student';
  const w = window.open('', '_blank');
  const html = `
    <html><head><title>Certificate</title>
    <style>body{font-family:Arial;padding:40px;color:#042;} .card{border:8px solid #0e7b6b;padding:30px;border-radius:12px;text-align:center} h1{margin-bottom:0}</style>
    </head><body><div class="card"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${name}</h2><p>has completed</p><h3>${courseTitle}</h3><p>Date: ${new Date().toLocaleDateString()}</p><p>Powered by Suleiman Cyber System</p></div></body></html>`;
  w.document.write(html); w.document.close();
}

/* settings */
$('#aiMode').addEventListener('change', (e)=>{
  const showRow = e.target.value === 'api';
  document.getElementById('apiKeyRow').classList.toggle('hidden', !showRow);
});
$('#saveKey').addEventListener('click', ()=>{
  const key = $('#aiKey').value.trim();
  if(!key) return alert('Enter a key or cancel');
  localStorage.setItem('suleiman_ai_key', key);
  alert('Key saved locally. Keep it private.');
});

/* initial UI */
renderCatalog();
renderSubmissions();
renderForum();
showAssistantPanel();

/* service worker registration (PWA) */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{ /* ignore */ });
        }
