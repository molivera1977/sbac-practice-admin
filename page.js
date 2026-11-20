/* SBAC Practice Sites — the admin page (Marcos 11/19/2026: "make an admin version so they can see all of them in one
   place"). Every SBAC practice site for Grades 3–6, by grade, each with its test window and its teachers.

   Opened with the teacher/admin code (…/?share=<code>), each card opens that site's TEACHER / ADMIN guest view (its
   teacher screen with no PIN, nothing saved; "Try it as a student" is in there) and gives EACH TEACHER'S CLASS LINK, the
   real link she hands her students (Marcos 11/19: "the specific link for each teacher … get rid of the separate Student
   View link since the student view can be seen in the Teacher/Admin link"). Opened without it (no code, the student
   code or a wrong one): no sites at all, only "Use the admin link" (Marcos 11/19: "Yes, only that" — the plain page's
   student guest buttons looked like the admin page and led him to a student guest view). The code is never written in this public page: it rides in the link Mr. O sends, and the page hands
   it on; only its fingerprint is here, the same one every site's share.js checks (site-tests holds them equal). */
(function () {
  'use strict';

  const TEACHER_HASH = 'ce64cc1c';   // = share.js on every site
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
    const buttons = `<a class="btn btn-teacher" href="${esc(teacherLink(s.repo))}" target="_blank" rel="noopener">🧑‍🏫 Teacher / admin view</a>
         ${s.teachers.map(t => `<a class="btn btn-class" href="${esc(classLink(s.repo, t))}" target="_blank" rel="noopener">🔗 ${esc(t.name)}'s class link</a>`).join('\n         ')}`;
    return `<article class="card" data-repo="${esc(s.repo)}">
      <div class="tags"><span class="tag tag-${s.subject.toLowerCase()}">${esc(s.subject)}</span><span class="tag tag-kind">${esc(s.kind)}</span>${s.std ? `<span class="tag tag-std">${esc(s.std)}</span>` : ''}</div>
      <h3 class="title">${esc(s.title)}</h3>
      <p class="who">${esc(names(s).join(' · '))}</p>
      <p class="when ${w.cls}">${esc(w.text)}</p>
      <div class="btns">${buttons}</div>
    </article>`;
  }

  window.ADMIN_PAGE = { ADMIN, SITES, TEACHER_HASH };   // the site test reads these
  // no admin code: nothing but where to get the admin link
  if (!ADMIN) {
    document.getElementById('sub').textContent = 'For teachers and administrators';
    document.getElementById('how').innerHTML = `<p class="how-head">🔒 Use the admin link</p>
       <p class="how-note">This page opens with the admin link from Mr. Olivera. Ask him for it.</p>`;
    return;
  }

  // how the sites were made, for an administrator (Marcos 11/19: "maybe a short explanation for admin on top of full page
  // explaining how these sites were created"); the admin view only
  const made = document.getElementById('made');
  // each part: a heading, then a subheading over each paragraph (his 11/19 "let's give subheadings");
  // an item is [subheading, which sites it's on ('' = all), the paragraph]
  // each set's average reading level and words per passage, by site (see the note at "Each set's level")
  const LEVELS = [
    ['🌱 Warm Up',       ['2.7', 350], ['3.8', 400], ['4.7', 490]],
    ['📘 Review',        ['3.7', 440], ['4.8', 510], ['5.6', 610]],
    ['📝 Test A and B',  ['4.6', 540], ['5.8', 600], ['6.6', 770]],
  ];
  const LEVELS_HTML = `<table class="levels"><thead><tr><th></th><th>Grade 3 site</th><th>Grade 5 site</th><th>Grade 6 site</th></tr></thead><tbody>${
    LEVELS.map(([set, ...cells]) => `<tr><th>${set}</th>${cells.map(([fk, words]) => `<td><b>Level ${fk}</b><span>about ${words} words</span></td>`).join('')}</tr>`).join('')
  }</tbody></table>`;
  const MADE = [
    { head: 'How these sites were made', items: [
      ['📐 Modeled on the real test', '', `Each site matches the real test's passage length, reading level, vocabulary, and how the questions and answer choices are specifically worded, in the same answer formats: pick one answer, select two, Part A and Part B, click a sentence in the passage, type the answer, or mark a True/False table. On the Grade 3, 5 and 6 sites and Fractions, even the wrong answers are planned: they are the same kinds of mistakes the real test uses, and each one comes with a short note on why it's wrong.`],
      ['✍️ Written new', '', 'Every passage and question is original. Nothing is copied from the real test.'],
      ['🔊 Read aloud', '', 'A recorded computer voice reads the questions, answer choices and passages, so a student who struggles to read can still practice the thinking the test asks for. Students who get text-to-speech or read-aloud on the real test practice with it here too.'],
    ] },
    // its own section, "How it runs" (his 11/19), the order of the sets just under it
    { head: 'How it runs', flow: 'Warm Up → Review → Test A → Test B', note: 'How students move through the Grade 3, 5 and 6 sites and Grade 5 Fractions:', items: [
      ['🌱 Warm Up', '', 'Start here: the gentlest set, with 💡 reminders read aloud. Each passage is about 2 grade levels easier to read than the test passage it matches, and about two-thirds as long. 2 takes; take 2 has new passages (or new numbers in math).'],
      ['📘 Review', '', 'A step up from the Warm Up. Each passage is about 1 grade level easier to read than the test passage it matches, and about 80% as long. 2 takes, the second one new.'],
      ['📝 Test A and Test B', '', 'Just like the real test in length, difficulty and question types. 1 take each.'],
      // his 11/19 "Be specific with what levels warm up and Review are at": measured 11/19 from each site's drafts with its
      // tools/measure.py (textstat Flesch-Kincaid, the same measure as the real test's numbers; build_data.py --check = the
      // site's data), averaged over the 6 passages of each set (take 1 and take 2); Fractions from tools/difficulty.js
      ['🪜 Each set\'s level', '', 'The average reading level (Flesch-Kincaid grade level) and length of each set\'s passages:', LEVELS_HTML
        + '<p class="levels-math">Fractions: the Warm Up\'s problems need common denominators of 10 or less, the Review\'s 12 or less, and Test A and Test B the same kinds as the real test, up to 24.</p>'
        // Base Ten: the numbers in every version of each part (data/form_*.js), held by tools/check_nbt.js (Warm-Up ≤
        // Practice ≤ Test at every spot; Test A and B within 25% of the real item)
        + '<p class="levels-math">Base Ten: the Warm-Up adds 3-digit numbers and rounds 4-digit numbers to the nearest thousand; the Practice adds a 4-digit and a 3-digit number and rounds 5- and 6-digit numbers; Test Form A and Test Form B use the real test\'s sizes, like adding two 4-digit numbers with regrouping and rounding a 6-digit number.</p>'],
      ['🔓 In order', '', `Each set opens when the one before it is finished. An extra take, starting a set early, or starting over needs the teacher's PIN.`],
      // the Grade 4 Math IAB (Marcos 11/19: "why have you not included the 4th grade Math IAB"); each fact from the two
      // its part names stay as the students know them (his 11/19 "Keep Practice"); this line says the Practice is the Review step
      // sites' script.js (parts, PASS_PCT 70 vs 0, one try, retake PIN, school-clock.js) and data (4 versions, the twins)
      ['🔢 Grade 4 Base Ten (Math IAB)', 'Both Base Ten sites', `Warm-Up → Practice (the same step as the Review) → Test Form A → Test Form B. The Warm-Up starts with worked examples, then easier questions. The Practice asks the test's kinds of questions, and after a miss the student tries one like it. Both have 4 versions, with new numbers on each retry. Test Form A and Test Form B are one try each, show only right or wrong, and open at school only; a retake needs the teacher's PIN. On Mr. Olivera's site a student needs 70% on the Warm-Up and the Practice to move on; on Mrs. Wright's, finishing a part opens the next.`],
    ] },
    { head: 'Built for the classroom', items: [
      [`🔀 Each student's own order`, 'Grades 3, 5 and 6', `The passages start in a different place for each student and every question's answer choices are mixed, so neighbors' screens don't match. A student's order stays the same on any computer.`],
      ['💡 The right answer and why', 'Grades 3, 5 and 6 and Fractions', 'After every question, students read why their answer is right or wrong before going on.'],
      ['💾 Saved after every question', 'Grades 3, 5 and 6 and Fractions', `A student can stop and keep going later. The teacher's Class Scores shows who is working now, on which question, how many right and wrong, and heat maps by question and by skill or standard.`],
      ['✏️ Name check', 'Grades 3, 5 and 6 and Fractions', 'Students type their name and confirm "Is this your name?" A teacher can fix a misspelled name with her PIN.'],
      ['🖨️ Printable answer key', 'Every site', `On each site's teacher screen.`],
      ['🏫 Tests at school only', 'Both Base Ten sites', 'The test forms open only when the teacher turns them on, and then only during school hours.'],
    ] },
  ];
  // an item may carry more after its paragraph (the levels table)
  const itemHTML = ([title, where, text, more = '']) =>
    `<li><h4><b>${title}</b>${where ? ` <span class="where">${where}</span>` : ''}</h4><p>${text}</p>${more}</li>`;
  // each part its own white card, the teal between them (his 11/19 "i want to break up the white")
  made.innerHTML = MADE.map(part => `<div class="how made-part"><p class="how-head">${part.head}</p>`
    + (part.flow ? `<p class="flow">${part.flow}</p>` : '')
    + (part.note ? `<p class="how-note">${part.note}</p>` : '')
    + `<ul>${part.items.map(itemHTML).join('')}</ul></div>`).join('');
  made.hidden = false;

  const grades = [...new Set(shown.map(s => s.grade))].sort((a, b) => a - b);
  document.getElementById('grades').innerHTML = grades.map(g => {
    const list = shown.filter(s => s.grade === g).sort((a, b) => day(a.window[0]) - day(b.window[0]));
    return `<section class="grade" id="grade-${g}"><h2>Grade ${g}</h2><div class="cards">${list.map(cardHTML).join('')}</div></section>`;
  }).join('');

  document.getElementById('sub').textContent = `Grades ${grades[0]}–${grades[grades.length - 1]} · ${shown.length} practice sites for the SBAC interim tests (IAB and FIAB)`;
  // what the buttons on each site's box do (Marcos 11/19: "they may not understand on every card")
  document.getElementById('how').innerHTML = `<p class="how-head">How to use the links below</p>
       <ul>
         <li><b>🧑‍🏫 Teacher / admin view</b> — opens straight to the site's teacher screen, the page a teacher sees after Teacher Access, with no PIN: try any set as a student and see the answer key. On the Grades 3, 5 and 6 sites it also shows the class heat map with sample students. Nothing is saved or sent.</li>
         <li><b>🔗 Class links</b> — the link each teacher gives her students. Work done there saves to that teacher's score sheet, so use the teacher / admin view to look around.</li>
         <li><b>🔒 Each teacher's PIN</b> — each teacher opens Class Scores with their own PIN in Teacher Access and sees only their own class, with real student names and scores. The teacher / admin view shows sample students only.</li>
       </ul>`;
  document.body.classList.add('admin');
  document.title = 'SBAC Practice Sites · Admin View';
})();
