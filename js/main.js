const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

function initTheme() {
  const btn = $('#theme-toggle');
  const apply = (t) => {
    document.documentElement.dataset.theme = t;
    btn.textContent = t === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-pressed', String(t === 'dark'));
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  const saved = store.get('tolpar-theme');
  apply(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    store.set('tolpar-theme', next);
  });
}

function initNav() {
  const toggle = $('#menu-toggle');
  const nav = $('#nav');
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.textContent = open ? '✕' : '☰';
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
}

function initToTop() {
  const btn = $('#to-top');
  addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 500), { passive: true });
  btn.addEventListener('click', () => scrollTo({ top: 0 }));
}

const TEAS = [
  { name: 'Sylhet black tea', secs: 180, note: 'Strong and malty. Drink it plain or with a little milk.' },
  { name: 'Green tea', secs: 120, note: 'Light and grassy. Do not go over two minutes.' },
  { name: 'Masala chai', secs: 300, note: 'Simmer with ginger and cardamom, then add milk.' },
  { name: 'Tulsi herbal', secs: 360, note: 'Soft and sweet. Cover the cup while it steeps.' }
];

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function initBrew() {
  const select = $('#tea-select');
  if (!select) return;
  const ring = $('#ring');
  const label = $('#time');
  const note = $('#brew-note');
  const startBtn = $('#brew-start');
  const C = 2 * Math.PI * 52;
  ring.style.strokeDasharray = C;
  let tea = TEAS[0];
  let left = tea.secs;
  let timer = null;

  TEAS.forEach((t, i) => select.add(new Option(`${t.name} (${fmt(t.secs)})`, i)));

  const draw = () => {
    label.textContent = fmt(left);
    ring.style.strokeDashoffset = C * (1 - left / tea.secs);
  };
  const stop = () => { clearInterval(timer); timer = null; startBtn.textContent = 'Start'; };
  const reset = () => { stop(); left = tea.secs; note.textContent = tea.note; draw(); };

  select.addEventListener('change', () => { tea = TEAS[select.value]; reset(); });
  $('#brew-reset').addEventListener('click', reset);
  startBtn.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (left === 0) reset();
    startBtn.textContent = 'Pause';
    note.textContent = 'Steeping…';
    timer = setInterval(() => {
      left -= 1;
      draw();
      if (left <= 0) { stop(); note.textContent = `Your ${tea.name.toLowerCase()} is ready. Pour it now.`; }
    }, 1000);
  });
  reset();
}

const MENU = [
  { n: 'Sylhet black tea', c: 'Hot tea', p: 80, d: 'Estate leaf from Srimangal, brewed in a clay pot.' },
  { n: 'Masala chai', c: 'Hot tea', p: 100, d: 'Ginger, cardamom and clove simmered with milk.' },
  { n: 'Lemon green tea', c: 'Hot tea', p: 90, d: 'Light green tea with fresh gondhoraj lemon.' },
  { n: 'Tulsi herbal', c: 'Hot tea', p: 90, d: 'Holy basil and mint, caffeine free.' },
  { n: 'Iced lemon tea', c: 'Cold', p: 110, d: 'Black tea over ice with lemon and mint.' },
  { n: 'Cold milk chai', c: 'Cold', p: 130, d: 'Chilled masala chai shaken with ice.' },
  { n: 'Mango lassi', c: 'Cold', p: 150, d: 'Yoghurt, ripe himsagar mango and cardamom.' },
  { n: 'Singara', c: 'Snacks', p: 40, d: 'Two crisp pastries with spiced potato and peas.' },
  { n: 'Chicken roll', c: 'Snacks', p: 160, d: 'Paratha wrapped around grilled chicken and onion.' },
  { n: 'Nimki and daal', c: 'Snacks', p: 70, d: 'Crunchy nimki with a small bowl of spiced lentils.' },
  { n: 'Pitha plate', c: 'Snacks', p: 120, d: 'Seasonal pitha with date palm jaggery.' }
];

function initMenu() {
  const grid = $('#menu-grid');
  if (!grid) return;
  const count = $('#menu-count');
  const search = $('#menu-search');
  let cat = 'all';

  const render = () => {
    const q = search.value.trim().toLowerCase();
    const list = MENU.filter((m) => (cat === 'all' || m.c === cat) && (m.n + m.d).toLowerCase().includes(q));
    grid.innerHTML = list.length
      ? list.map((m) => `<article class="item"><div class="row"><h3>${m.n}</h3><span class="price">৳${m.p}</span></div><p>${m.d}</p><span class="tag">${m.c}</span></article>`).join('')
      : '<div class="empty"><p>No items match your search. Clear the search or pick a different filter.</p></div>';
    count.textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'} shown`;
  };

  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    cat = chip.dataset.cat;
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    render();
  }));
  search.addEventListener('input', render);
  render();
}

const FAQS = [
  ['Do I need to book a table?', 'Walk-ins are welcome, but window and balcony seats fill up on Friday evenings. Booking holds your seat for 15 minutes.'],
  ['What is the holding fee?', 'We take ৳100 per guest when you book. The full amount is taken off your bill when you arrive.'],
  ['Do you have vegetarian options?', 'Yes. Every tea, the singara, nimki and the pitha plate are vegetarian.'],
  ['Can I work on my laptop?', 'Yes, on weekdays before 5:00 pm. Wi-Fi is free and the quiet corner has plug points.']
];

function initFaq() {
  const list = $('#faq-list');
  if (!list) return;
  list.innerHTML = FAQS.map(([q, a], i) => `<div class="faq-item"><h3><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-${i}" id="faq-btn-${i}">${q}<span aria-hidden="true">+</span></button></h3><div class="faq-a" id="faq-${i}" role="region" aria-labelledby="faq-btn-${i}" hidden><p>${a}</p></div></div>`).join('');
  $$('.faq-q', list).forEach((btn) => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    $('#' + btn.getAttribute('aria-controls')).hidden = open;
  }));
}

function initBooking() {
  const form = $('#booking-form');
  if (!form) return;
  const f = form.elements;
  const timeSel = $('#time');
  const alertBox = $('#form-alert');
  const FEE = 100;
  const pad = (n) => String(n).padStart(2, '0');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const max = new Date(today.getTime() + 60 * 864e5);

  f.date.min = todayStr;
  f.date.max = `${max.getFullYear()}-${pad(max.getMonth() + 1)}-${pad(max.getDate())}`;
  timeSel.add(new Option('Choose a time', ''));
  for (let h = 9; h <= 21; h++) {
    const label = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'pm' : 'am'}`;
    timeSel.add(new Option(label, label));
  }

  const rules = {
    name: (v) => (v.trim().length < 3 ? 'Enter your full name (at least 3 letters).' : /\d/.test(v) ? 'Names cannot contain numbers.' : ''),
    phone: (v) => (/^01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a Bangladeshi mobile number like 01712345678.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email like name@example.com.'),
    date: (v) => (!v ? 'Choose a date.' : v < todayStr ? 'Pick today or a later date.' : v > f.date.max ? 'We take bookings up to 60 days ahead.' : ''),
    time: (v) => (v ? '' : 'Choose a time.'),
    guests: (v) => (Number.isInteger(+v) && +v >= 1 && +v <= 12 ? '' : 'Enter between 1 and 12 guests. For larger groups, call us.')
  };

  const check = (name) => {
    const field = f[name].closest('.field');
    const msg = rules[name](f[name].value);
    $('#' + name + '-err').textContent = msg;
    field.classList.toggle('invalid', !!msg);
    field.classList.toggle('valid', !msg);
    f[name].setAttribute('aria-invalid', String(!!msg));
    return !msg;
  };

  const summary = () => {
    const g = Math.min(12, Math.max(1, parseInt(f.guests.value, 10) || 1));
    $('#s-date').textContent = f.date.value ? new Date(f.date.value + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Not chosen';
    $('#s-time').textContent = f.time.value || 'Not chosen';
    $('#s-guests').textContent = g;
    $('#s-seat').textContent = f.seat.value;
    $('#s-total').textContent = '৳' + g * FEE;
  };

  Object.keys(rules).forEach((name) => {
    f[name].addEventListener('blur', () => check(name));
    f[name].addEventListener('input', () => { if (f[name].closest('.field').classList.contains('invalid')) check(name); summary(); });
    f[name].addEventListener('change', () => { check(name); summary(); });
  });
  $$('input[name="seat"]').forEach((r) => r.addEventListener('change', summary));

  const step = (d) => { f.guests.value = Math.min(12, Math.max(1, (parseInt(f.guests.value, 10) || 1) + d)); check('guests'); summary(); };
  $('#g-minus').addEventListener('click', () => step(-1));
  $('#g-plus').addEventListener('click', () => step(1));

  f.note.addEventListener('input', () => { $('#note-count').textContent = `${f.note.value.length} / 200`; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).filter((n) => !check(n));
    if (bad.length) {
      alertBox.hidden = false;
      alertBox.textContent = `Fix ${bad.length} ${bad.length === 1 ? 'field' : 'fields'} before confirming: ${bad.join(', ')}.`;
      f[bad[0]].focus();
      return;
    }
    alertBox.hidden = true;
    const ref = 'TP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const g = parseInt(f.guests.value, 10);
    store.set('tolpar-last-booking', JSON.stringify({ ref, name: f.name.value, date: f.date.value, time: f.time.value, guests: g }));
    $('#success-text').textContent = `Thanks, ${f.name.value.trim().split(' ')[0]}. Your table for ${g} is booked for ${$('#s-date').textContent} at ${f.time.value}, ${f.seat.value.toLowerCase()} seating. Holding fee: ৳${g * FEE}. Your reference is ${ref}.`;
    form.hidden = true;
    const box = $('#success');
    box.hidden = false;
    box.focus();
  });

  $('#book-again').addEventListener('click', () => {
    form.reset();
    $$('.field', form).forEach((x) => x.classList.remove('valid', 'invalid'));
    $$('.err', form).forEach((x) => { x.textContent = ''; });
    $('#note-count').textContent = '0 / 200';
    $('#success').hidden = true;
    form.hidden = false;
    summary();
    f.name.focus();
  });

  const last = store.get('tolpar-last-booking');
  if (last) { try { f.name.value = JSON.parse(last).name; } catch {} }
  summary();
}

initTheme();
initNav();
initToTop();
initBrew();
initMenu();
initFaq();
initBooking();
