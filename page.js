/* SBAC Practice Sites — the admin page (Marcos 11/19/2026: "make an admin version so they can see all of them in one
   place"). Every SBAC practice site for Grades 3–6, by grade, each with its test window and its teachers.

   Opened with the teacher/admin code (…/?share=<code>), each card opens that site's TEACHER / ADMIN guest view (its
   teacher screen with no PIN, nothing saved; "Try it as a student" is in there) and gives EACH TEACHER'S CLASS LINK, the
   real link she hands her students (Marcos 11/19: "the specific link for each teacher … get rid of the separate Student
   View link since the student view can be seen in the Teacher/Admin link"). Opened without it, the cards offer the
   student guest view only (no class links). The code is never written in this public page: it rides in the link Mr. O sends, and the page hands
   it on; only its fingerprint is here, the same one every site's share.js checks (site-tests holds them equal). */
(function () {
  'use strict';

  const TEACHER_HASH = 'ae786515';   // = share.js on every site
  const STUDENT_CODE = 'mro';
  const BASE = 'https://mroteacher.com/';
  const fnv = s => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  };
  const given = (() => { try { return new URLSearchParams(location.search).get('share') || ''; } catch (e) { return ''; } })();
  const ADMIN = given !== '' && given !== STUDENT_CODE && fnv(given) === TEACHER_HASH;

  /* Each site: its grade, the test, the district's test window (ELA: the district FIAB/IAB schedule; math: the district
     Math IAB Schedule — the window starts when the module ends), its teachers, its repo. A teacher's cls is her class code
     (…/?class=<cls>); a teacher with none uses the site's plain address (her own site, or Mr. Olivera's own class).
     ready: false keeps a card off the page until that site is published. */
  const SITES = [
    { grade: 3, subject: 'Reading', kind: 'FIAB', title: 'Make & Support Inferences (Informational)', std: 'RI.3.1–RI.3.2',
      window: ['2026-12-07', '2026-12-11'], teachers: [{ name: 'Ms. Richardson', cls: 'richardson' }, { name: 'Mrs. McKissick', cls: 'mckissick' }], repo: 'sbac-g3-inferences-info-fiab' },
    { grade: 4, subject: 'Math', kind: 'FIAB', title: 'Place Value & Multidigit Whole Numbers', std: '',
      window: ['2026-09-14', '2026-09-18'], teachers: [{ name: 'Mr. Olivera' }], repo: 'sbac-place-value-fiab-review' },
    { grade: 4, subject: 'Reading', kind: 'FIAB', title: 'Make & Support Inferences (Literary)', std: '',
      window: ['2026-09-28', '2026-10-02'], teachers: [{ name: 'Mr. Olivera' }], repo: 'sbac-inferences-lit-fiab-review' },
    { grade: 4, subject: 'Reading', kind: 'IAB', title: 'Read Literary Texts', std: '',
      window: ['2026-10-19', '2026-10-23'], teachers: [{ name: 'Mr. Olivera' }], repo: 'sbac-read-literary-iab-review' },
    { grade: 4, subject: 'Math', kind: 'IAB', title: 'Number & Operations in Base Ten', std: '',
      window: ['2026-11-24', '2026-12-04'], teachers: [{ name: 'Mr. Olivera' }], repo: 'sbac-base-ten-iab-review' },
    { grade: 4, subject: 'Math', kind: 'IAB', title: 'Number & Operations in Base Ten', std: '',
      window: ['2026-11-24', '2026-12-04'], teachers: [{ name: 'Mrs. Wright' }], repo: 'sbac-base-ten-iab-wright' },
    { grade: 5, subject: 'Math', kind: 'FIAB', title: 'Add & Subtract with Equivalent Fractions', std: '',
      window: ['2026-11-17', '2026-11-23'], teachers: [{ name: 'Ms. Pudill', cls: 'pudill' }, { name: 'Mrs. Krotki', cls: 'krotki' }], repo: 'sbac-g5-fractions-fiab' },
    { grade: 5, subject: 'Reading', kind: 'FIAB', title: 'Make & Support Inferences (Informational)', std: 'RI.5.1–RI.5.2',
      window: ['2026-12-07', '2026-12-11'], teachers: [{ name: 'Ms. Pudill', cls: 'pudill' }, { name: 'Mrs. Krotki', cls: 'krotki' }], repo: 'sbac-g5-inferences-info-fiab' },
    { grade: 6, subject: 'Reading', kind: 'FIAB', title: 'Make & Support Inferences (Informational)', std: 'RI.6.1–RI.6.2',
      window: ['2026-12-07', '2026-12-11'], teachers: [{ name: 'Ms. Lynk', cls: 'lynk' }, { name: 'Mrs. Fitzsimmons', cls: 'fitzsimmons' }], repo: 'sbac-g6-inferences-info-fiab' }
  ];
  const shown = SITES.filter(s => s.ready !== false);

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const md = iso => { const t = day(iso); return `${t.getMonth() + 1}/${t.getDate()}`; };
  const today = (() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); })();
  // where today sits against a window: open now, coming, or done
  function windowNote([a, b]) {
    const span = `${md(a)}–${md(b)}`;
    if (today < day(a)) return { cls: 'w-soon', text: `Test window ${span}` };
    if (today > day(b)) return { cls: 'w-past', text: `Test window was ${span}` };
    return { cls: 'w-open', text: `Test window open now · ${span}` };
  }
  const link = (repo, code) => `${BASE}${repo}/?share=${encodeURIComponent(code)}`;
  // #teacher: share.js opens the site's teacher screen at once, the page a teacher sees after Teacher Access (Marcos
  // 11/19: "the teacher/admin buttons should take me to a typical teacher access page"), not the cover's two cards
  const teacherLink = repo => `${link(repo, given)}#teacher`;
  const classLink = (repo, t) => `${BASE}${repo}/` + (t.cls ? `?class=${encodeURIComponent(t.cls)}` : '');
  const names = s => s.teachers.map(t => t.name);

  function cardHTML(s) {
    const w = windowNote(s.window);
    const buttons = ADMIN
      ? `<a class="btn btn-teacher" href="${esc(teacherLink(s.repo))}" target="_blank" rel="noopener">🧑‍🏫 Teacher / admin view</a>
         ${s.teachers.map(t => `<a class="btn btn-class" href="${esc(classLink(s.repo, t))}" target="_blank" rel="noopener">🔗 ${esc(t.name)}'s class link</a>`).join('\n         ')}`
      : `<a class="btn btn-student" href="${esc(link(s.repo, STUDENT_CODE))}" target="_blank" rel="noopener">🎒 Try it as a student guest</a>`;
    return `<article class="card" data-repo="${esc(s.repo)}">
      <div class="tags"><span class="tag tag-${s.subject.toLowerCase()}">${esc(s.subject)}</span><span class="tag tag-kind">${esc(s.kind)}</span>${s.std ? `<span class="tag tag-std">${esc(s.std)}</span>` : ''}</div>
      <h3 class="title">${esc(s.title)}</h3>
      <p class="who">${esc(names(s).join(' · '))}</p>
      <p class="when ${w.cls}">${esc(w.text)}</p>
      <div class="btns">${buttons}</div>
    </article>`;
  }

  const grades = [...new Set(shown.map(s => s.grade))].sort((a, b) => a - b);
  document.getElementById('grades').innerHTML = grades.map(g => {
    const list = shown.filter(s => s.grade === g).sort((a, b) => day(a.window[0]) - day(b.window[0]));
    return `<section class="grade" id="grade-${g}"><h2>Grade ${g}</h2><div class="cards">${list.map(cardHTML).join('')}</div></section>`;
  }).join('');

  document.getElementById('sub').textContent = `Grades ${grades[0]}–${grades[grades.length - 1]} · ${shown.length} practice sites for the SBAC interim tests (IAB and FIAB)`;
  document.getElementById('how').innerHTML = ADMIN
    ? `<p class="how-head">On every card</p>
       <ul>
         <li><b>🧑‍🏫 Teacher / admin view</b> — opens straight to the site's teacher screen, the page a teacher sees after Teacher Access, with no PIN: try any set as a student and see the answer key. On the Grades 3, 5 and 6 sites it also shows the class heat map with sample students. Nothing is saved or sent.</li>
         <li><b>🔗 Class links</b> — the link each teacher gives her students. Work done there saves to that teacher's score sheet, so use the teacher / admin view to look around.</li>
         <li><b>🛡️ Real student scores</b> stay behind each teacher's PIN.</li>
       </ul>`
    : `<p class="how-head">Student guest links</p>
       <ul><li>Take any set the way a student does. Nothing is saved or sent.</li>
       <li>Teachers and administrators: open the admin link from Mr. Olivera to see each site's teacher screen.</li></ul>`;
  document.body.classList.toggle('admin', ADMIN);
  document.title = ADMIN ? 'SBAC Practice Sites · Admin View' : 'SBAC Practice Sites';
  window.ADMIN_PAGE = { ADMIN, SITES, TEACHER_HASH };   // the site test reads these
})();
