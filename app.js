/* =========================================================================
   Dashboard PPSi 2026 — SMK Dato' Undang Musa Al-Haj
   Tiada CDN, tiada pustaka luar. Semua graf dilukis sendiri (SVG/HTML).
   Versi 3 — reka bentuk kaca moden + senarai murid boleh klik.
   ========================================================================= */

/* ----------------------------- TETAPAN ----------------------------------- */
const CONFIG = {
  // Tampal pautan CSV Google Sheet yang telah diterbitkan di sini untuk
  // menarik data terus dari Sheet. Biarkan kosong untuk guna data.js.
  // Contoh: 'https://docs.google.com/spreadsheets/d/e/2PACX-xxxx/pub?gid=0&single=true&output=csv'
  SHEET_IMK_CSV: '',
  SHEET_ITP_CSV: '',
  SHEET_PAUTAN: '',           // pautan Google Sheet untuk butang "Buka Sheet"
  ZON: 'Asia/Kuala_Lumpur'
};

/* --------------------------- KAMUS RUJUKAN ------------------------------- */
const HOLLAND = [
  { k:'R', nama:'Realistik',    warna:'--r', ringkas:'Kemahiran praktikal dan mekanikal. Suka bekerja dengan objek, peralatan, mesin, haiwan atau tumbuhan, dan lebih selesa bekerja di luar bangunan.', kerjaya:'Jurutera, mekanik, juruteknik, tentera, pertanian, sukan' },
  { k:'I', nama:'Investigatif', warna:'--i', ringkas:'Kemahiran menyelidik, saintifik dan analitikal. Suka membuat pemerhatian, menganalisis dan menyelesaikan masalah dengan tepat.', kerjaya:'Saintis, doktor, penyelidik, ahli farmasi, penganalisis data' },
  { k:'A', nama:'Artistik',     warna:'--a', ringkas:'Ekspresif, original dan kreatif. Selesa dalam situasi kurang berstruktur dan menghargai hasil seni.', kerjaya:'Pereka, seniman, penulis, muzik, seni bina, media' },
  { k:'S', nama:'Sosial',       warna:'--s', ringkas:'Suka interaksi, kerjasama dan membantu orang lain. Kemahiran komunikasi yang baik dan cenderung kepada kerja perkhidmatan.', kerjaya:'Guru, kaunselor, jururawat, kerja sosial, latihan' },
  { k:'E', nama:'Enterprising', warna:'--e', ringkas:'Cenderung kepada pentadbiran, perniagaan dan keusahawanan. Suka memimpin, mempengaruhi dan menguruskan orang lain.', kerjaya:'Usahawan, pengurus, jualan, pemasaran, undang-undang' },
  { k:'K', nama:'Konvensional', warna:'--k', ringkas:'Suka kerja berstruktur dan teratur yang melibatkan data, nombor dan tugas perkeranian mengikut peraturan.', kerjaya:'Perakaunan, pentadbiran, perbankan, audit, kesetiausahaan' }
];
const HMAP = Object.fromEntries(HOLLAND.map(h => [h.k, h]));

const KONSTRUK = [
  { k:'AUT', nama:'Autonomi',     ringkas:'Kebebasan bertindak, berdikari dan yakin membuat keputusan sendiri.' },
  { k:'KTF', nama:'Kreatif',      ringkas:'Daya imaginasi tinggi, banyak idea dan mampu menghasilkan karya original.' },
  { k:'AGF', nama:'Agresif',      ringkas:'Ketegasan diri. Skor tinggi menunjukkan berani mengkritik dan sangat fokus pada matlamat sendiri.' },
  { k:'EKT', nama:'Ekstrovet',    ringkas:'Peramah, suka bergaul dan yakin bercakap di hadapan orang ramai.' },
  { k:'PCP', nama:'Pencapaian',   ringkas:'Motivasi tinggi, suka bersaing dan berorientasikan kecemerlangan.' },
  { k:'KPG', nama:'Kepelbagaian', ringkas:'Suka perubahan dan perkara baharu; kerja rutin cepat membosankan.' },
  { k:'ITL', nama:'Intelektual',  ringkas:'Suka aktiviti mencabar minda dan mempunyai sifat ingin tahu yang tinggi.' },
  { k:'KPN', nama:'Kepimpinan',   ringkas:'Tegas, bijak membuat keputusan, berinisiatif dan mampu mempengaruhi orang lain.' },
  { k:'STR', nama:'Struktur',     ringkas:'Gemar perkara berstruktur, rutin, kemas dan terperinci.' },
  { k:'RSL', nama:'Resilien',     ringkas:'Ketahanan fizikal, mental dan emosi yang tinggi serta semangat juang untuk menghabiskan tugas.' },
  { k:'MLG', nama:'Menolong',     ringkas:'Empati tinggi, prihatin dan mudah menghulurkan bantuan secara sukarela.' },
  { k:'ATL', nama:'Analitikal',   ringkas:'Peka terhadap persekitaran, suka menganalisis dan memerlukan bukti berasaskan fakta.' },
  { k:'KD',  nama:'Kritik Diri',  ringkas:'Skor tinggi menunjukkan kerap berasa rendah diri, bimbang dan cemas. Skor melebihi 80% dicadangkan berjumpa guru kaunseling.', songsang:true },
  { k:'WSN', nama:'Wawasan',      ringkas:'Cita-cita tinggi serta hala tuju, visi dan misi yang jelas.' },
  { k:'KTN', nama:'Ketelusan',    ringkas:'Skor 50% dan ke atas menunjukkan murid kurang telus menjawab inventori, jadi dapatan tret mungkin tidak menepati diri sebenar.', songsang:true }
];
const KMAP = Object.fromEntries(KONSTRUK.map(k => [k.k, k]));
const KUNCI = KONSTRUK.map(k => k.k);
const KUNCI_TRET = KUNCI.filter(k => k !== 'KD' && k !== 'KTN');

const TING_NAMA = { 1:'Tingkatan 1', 2:'Tingkatan 2', 3:'Tingkatan 3', 4:'Tingkatan 4', 5:'Tingkatan 5' };
const BULAN_MS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const HARI_MS  = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];

/* ------------------------------ KEADAAN --------------------------------- */
const S = {
  papar: 'papan',
  cari: '',
  jenis: 'SEMUA',       // SEMUA | IMK | ITP
  ting: 'SEMUA',
  kelas: 'SEMUA',
  jantina: 'SEMUA',
  tapisKod: '',          // huruf Holland dominan
  susun: { medan:'nama', arah:1 },
  tunjukIC: false,
  murid: []
};

/* ------------------------------- ALATAN --------------------------------- */
const $  = (s, n=document) => n.querySelector(s);
const $$ = (s, n=document) => [...n.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wv = v => `var(${v})`;
const simpan = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };
const ambil  = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };

function icPapar(ic) {
  if (!ic) return '—';
  const b = String(ic).replace(/\D/g, '');
  if (b.length !== 12) return S.tunjukIC ? ic : '••••••';
  const f = `${b.slice(0,6)}-${b.slice(6,8)}-${b.slice(8)}`;
  return S.tunjukIC ? f : `${b.slice(0,6)}-${b.slice(6,8)}-••••`;
}
function tarikhPapar(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-').map(Number);
  return `${d} ${BULAN_MS[m-1]} ${y}`;
}
function tahap(v, jenis) {
  const b = jenis === 'IKP' ? [75, 50] : [70, 40];
  if (v >= b[0]) return { nama:'Tinggi',    warna:'--tinggi',    k:'T' };
  if (v >= b[1]) return { nama:'Sederhana', warna:'--sederhana', k:'S' };
  return { nama:'Rendah', warna:'--rendah', k:'R' };
}
function kategoriIndeks(n) {
  if (n >= 10) return { nama:'Minat jelas',  warna:'--tinggi' };
  if (n >= 5)  return { nama:'Minat sederhana', warna:'--sederhana' };
  return { nama:'Minat kurang jelas', warna:'--waspada' };
}
function purata(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

/* ---------------------- PENANDA / ISYARAT PERHATIAN --------------------- */
const KRITERIA = {
  'Tidak ditaksir':'Murid tiada rekod keputusan dalam laporan PPSi.',
  'Kritik diri tinggi':'Skor Kritik Diri 80% dan ke atas. Panduan PPSi mencadangkan rujukan kepada guru bimbingan dan kaunseling.',
  'Kritik diri perlu dipantau':'Skor Kritik Diri 70% hingga 79% — tahap tinggi, belum mencapai ambang rujukan.',
  'Ketelusan rendah':'Skor Ketelusan 50% dan ke atas. Dapatan tret mungkin tidak menepati personaliti sebenar, jadi sahkan melalui temu bual.',
  'Resilien rendah':'Skor Resilien 30% dan ke bawah — murid mungkin perlu sokongan ketahanan diri.',
  'Minat kurang jelas':'Indeks perbezaan 4 dan ke bawah — minat kerjaya belum terarah dan sesuai untuk sesi bimbingan.',
  'Tiada domain kecerdasan tinggi':'Tiada domain IKP mencapai 75%. Profil kekuatan belum menonjol dan perlu digali melalui aktiviti amali serta temu bual.'
};
function isyarat(m) {
  const out = [];
  if (m.status !== 'DITAKSIR')
    out.push({ jenis:'Tidak ditaksir', huraian: m.sebab || 'Tiada rekod pentaksiran.', aras:'waspada' });
  if (m.jenis === 'ITP') {
    if (m.skor.KD >= 80) out.push({ jenis:'Kritik diri tinggi', huraian:`Skor Kritik Diri ${m.skor.KD}%. Cadangan PPSi: rujuk guru bimbingan dan kaunseling.`, aras:'waspada' });
    else if (m.skor.KD >= 70) out.push({ jenis:'Kritik diri perlu dipantau', huraian:`Skor Kritik Diri ${m.skor.KD}% berada pada tahap tinggi.`, aras:'perhati' });
    if (m.skor.KTN >= 50) out.push({ jenis:'Ketelusan rendah', huraian:`Skor Ketelusan ${m.skor.KTN}%. Dapatan tret mungkin tidak menepati personaliti sebenar — sahkan melalui temu bual.`, aras:'perhati' });
    if (m.skor.RSL <= 30) out.push({ jenis:'Resilien rendah', huraian:`Skor Resilien ${m.skor.RSL}%. Perlu sokongan ketahanan diri.`, aras:'perhati' });
  }
  if (m.jenis === 'IKP' && m.status === 'DITAKSIR' && !KUNCI_IKP.some(k => m.skor[k] >= 75))
    out.push({ jenis:'Tiada domain kecerdasan tinggi', huraian:`Tiada satu pun daripada 10 domain IKP mencapai 75%. Skor tertinggi ialah ${Math.max(...KUNCI_IKP.map(k=>m.skor[k]))}% — bantu murid mengenal pasti kekuatan melalui aktiviti amali.`, aras:'perhati' });
  if (m.jenis === 'IMK' && m.status === 'DITAKSIR' && m.indeks <= 4)
    out.push({ jenis:'Minat kurang jelas', huraian:`Indeks perbezaan hanya ${m.indeks}. Minat kerjaya belum terarah — sesuai untuk sesi bimbingan kerjaya.`, aras:'perhati' });
  return out;
}

/* ======================================================================== */
/*                            GRAF SVG BUATAN SENDIRI                        */
/* ======================================================================== */

/* --- 1. HEKSAGON HOLLAND (elemen tanda aplikasi ini) --- */

/* --- 2. KIPAS 15 KONSTRUK ITP --- */

/* --- 3. BAR MELINTANG --- */

/* --- 4. BAR MENEGAK BERKUMPULAN --- */

/* --- 5. DONAT --- */
function donat(data, opt = {}) {
  const R = 66, tebal = 20, W = 168, cx = W/2, cy = W/2;
  const jum = data.reduce((a,b)=>a+b.nilai,0) || 1;
  let a0 = -Math.PI/2, g = '';
  data.forEach(d=>{
    const sudut = (d.nilai/jum) * Math.PI*2, a1 = a0 + sudut;
    const P = a => [(cx+Math.cos(a)*R).toFixed(1), (cy+Math.sin(a)*R).toFixed(1)];
    const [x1,y1]=P(a0), [x2,y2]=P(a1);
    const besar = sudut > Math.PI ? 1 : 0;
    g += `<path d="M${x1} ${y1} A${R} ${R} 0 ${besar} 1 ${x2} ${y2}" fill="none" stroke="${wv(d.warna)}" stroke-width="${tebal}" stroke-linecap="butt"><title>${esc(d.label)}: ${d.nilai}</title></path>`;
    a0 = a1;
  });
  g += `<text x="${cx}" y="${cy-2}" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="var(--dakwat)">${opt.tengah ?? jum}</text>`;
  g += `<text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="8.5" letter-spacing="1.3" fill="var(--dakwat3)">${esc(opt.lbl||'')}</text>`;
  return `<svg viewBox="0 0 ${W} ${W}" style="width:${W}px;height:auto;flex:none" role="img" aria-label="${esc(opt.alt||'Graf donat')}">${g}</svg>`;
}

/* --- 6. PETA HABA --- */

/* ======================================================================== */
/*                          PENAPIS DAN CARIAN                               */
/* ======================================================================== */
function bina(m) {
  const b = [m.nama, m.kelasPenuh, m.kelas, TING_NAMA[m.ting], `tingkatan ${m.ting}`, m.jenis, m.ic,
             m.tarikh, tarikhPapar(m.tarikh), m.status, m.sebab,
             m.jantina === 'L' ? 'lelaki' : 'perempuan'];
  if (m.jenis === 'IMK') {
    if (m.kod) b.push(m.kod, `kod ${m.kod}`);
    (m.bidang || []).forEach((nm, i) => { b.push(nm); if (i === 0) b.push(`${nm} dominan`, `dominan ${nm}`); });
    HOLLAND.forEach(h => { if (m.skor[h.k] > 0) b.push(h.k, h.kerjaya); });
    if (m.status === 'DITAKSIR') {
      b.push(kategoriIndeks(m.indeks).nama);
      if (KERJAYA[m.dominan]) b.push(KERJAYA[m.dominan].bidang, KERJAYA[m.dominan].contoh, KERJAYA[m.dominan].laluan);
      if (m.ting === 3) cadanganElektif(m).senarai.slice(0,3).forEach(x => b.push(x.e.nama, x.e.id, 'elektif ' + x.e.nama, 'elektif ' + x.e.id));
    }
  } else if (m.jenis === 'ITP') {
    KONSTRUK.forEach(k => {
      b.push(k.k, k.nama);
      b.push(`${k.nama} ${tahap(m.skor[k.k]).nama.toLowerCase()}`);
    });
  } else {
    KECERDASAN.forEach(k => {
      b.push(k.k, k.nama);
      b.push(`${k.nama} ${tahap(m.skor[k.k], 'IKP').nama.toLowerCase()}`);
    });
    if (m.ting === 3) cadanganElektif(m).senarai.slice(0,3).forEach(x => b.push(x.e.nama, x.e.id, 'elektif ' + x.e.nama, 'elektif ' + x.e.id));
  }
  isyarat(m).forEach(f => b.push(f.jenis));
  return b.join(' | ').toLowerCase();
}

function tapis(abai = {}) {
  const asas = S.murid.filter(m => {
    if (!abai.jenis   && S.jenis   !== 'SEMUA' && m.jenis !== S.jenis) return false;
    if (!abai.ting    && S.ting    !== 'SEMUA' && String(m.ting) !== S.ting) return false;
    if (!abai.kelas   && S.kelas   !== 'SEMUA' && m.kelas !== S.kelas) return false;
    if (!abai.jantina && S.jantina !== 'SEMUA' && m.jantina !== S.jantina) return false;
    if (!abai.kod && S.tapisKod && m.dominan !== S.tapisKod) return false;
    return true;
  });
  const q = S.cari.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return asas;
  // Pusingan 1 — padanan frasa penuh. Jika ada, itu sahaja yang dipulangkan,
  // supaya "kritik diri tinggi" tidak terkena semua rekod yang ada kata "tinggi".
  const frasa = asas.filter(m => m._cari.includes(q));
  if (frasa.length) return frasa;
  // Pusingan 2 — semua kata mesti hadir.
  const kata = q.split(' ');
  return asas.filter(m => kata.every(k => m._cari.includes(k)));
}

function susun(senarai) {
  const { medan, arah } = S.susun;
  return senarai.slice().sort((a,b) => {
    let x, y;
    if (medan === 'nama' || medan === 'kelasPenuh' || medan === 'kod' || medan === 'tarikh') { x = a[medan] || ''; y = b[medan] || ''; }
    else if (medan.startsWith('h:')) { const k = medan.slice(2); x = a.skor[k] || 0; y = b.skor[k] || 0; }
    else { x = a[medan] ?? 0; y = b[medan] ?? 0; }
    if (typeof x === 'string') return x.localeCompare(y, 'ms') * arah;
    return (x - y) * arah;
  });
}

/* ======================================================================== */
/*                          KOMPONEN BOLEH GUNA SEMULA                       */
/* ======================================================================== */
function kodHeks(kod) {
  if (!kod) return '<span class="mono" style="color:var(--dakwat3)">—</span>';
  return `<span class="kod-heks">${[...kod].map(c=>`<i style="background:${wv(HMAP[c]?HMAP[c].warna:'--rendah')}" title="${esc(HMAP[c]?HMAP[c].nama:c)}">${c}</i>`).join('')}</span>`;
}
function lencanaTahap(v) {
  const t = tahap(v);
  return `<span class="lencana" style="background:color-mix(in srgb,${wv(t.warna)} 16%,transparent);color:${wv(t.warna)}">${t.nama} ${v}%</span>`;
}
function petunjukHolland() {
  return `<div class="petunjuk">${HOLLAND.map(h=>`<span><i style="background:${wv(h.warna)}"></i>${h.k} — ${h.nama}</span>`).join('')}</div>`;
}
function petunjukTahap() {
  return `<div class="petunjuk">
    <span><i style="background:var(--tinggi)"></i>Tinggi 70–99%</span>
    <span><i style="background:var(--sederhana)"></i>Sederhana 40–60%</span>
    <span><i style="background:var(--rendah)"></i>Rendah 1–30%</span>
    <span><i style="background:var(--waspada)"></i>Perlu perhatian</span></div>`;
}
const IKON = {
  murid:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/></svg>',
  heks:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"/></svg>',
  bintang:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8z"/></svg>',
  awas:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4 3 19h18z"/><path d="M12 10v4M12 16.5v.3"/></svg>',
  kelas:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-5 9 5-9 5z"/><path d="M7 12v5c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-5"/></svg>'
};

function jadualKosong(pesan) {
  return `<div class="kosong-nota"><b>Tiada rekod sepadan</b>${esc(pesan||'Ubah kata carian atau tetapkan semula penapis.')}</div>`;
}

/* --------------------------- BARIS PENAPIS ------------------------------- */
function barisTapis(pilihan = {}) {
  const kelasSenarai = [...new Set(S.murid.map(m=>m.kelas))].sort();
  const tingSenarai = [...new Set(S.murid.map(m=>m.ting))].sort();
  let h = `<div class="baris-tapis"><span class="tapis-lbl">Penapis</span>`;
  if (pilihan.jenis !== false) {
    h += `<select class="tapis" data-tapis="jenis">
      <option value="SEMUA"${S.jenis==='SEMUA'?' selected':''}>Semua instrumen</option>
      <option value="IMK"${S.jenis==='IMK'?' selected':''}>IMK — Minat Kerjaya</option>
      <option value="ITP"${S.jenis==='ITP'?' selected':''}>ITP — Tret Personaliti</option>
      <option value="IKP"${S.jenis==='IKP'?' selected':''}>IKP — Kecerdasan Pelbagai</option></select>`;
  }
  if (pilihan.ting !== false) {
    h += `<select class="tapis" data-tapis="ting"><option value="SEMUA">Semua tingkatan</option>
      ${tingSenarai.map(t=>`<option value="${t}"${S.ting===String(t)?' selected':''}>${TING_NAMA[t]}</option>`).join('')}</select>`;
  }
  h += `<select class="tapis" data-tapis="kelas"><option value="SEMUA">Semua kelas</option>
    ${kelasSenarai.map(k=>`<option value="${esc(k)}"${S.kelas===k?' selected':''}>${esc(k)}</option>`).join('')}</select>`;
  h += `<select class="tapis" data-tapis="jantina"><option value="SEMUA">Lelaki &amp; perempuan</option>
    <option value="L"${S.jantina==='L'?' selected':''}>Lelaki</option>
    <option value="P"${S.jantina==='P'?' selected':''}>Perempuan</option></select>`;
  if (pilihan.kod) {
    h += `<span style="width:8px"></span>` + HOLLAND.map(hh=>
      `<button class="cip${S.tapisKod===hh.k?' on':''}" data-kod="${hh.k}"><span class="titik" style="background:${wv(hh.warna)}"></span>${hh.k}</button>`).join('');
  }
  if (S.cari.trim()) h += `<button class="cip on cip-cari" data-kosong-cari type="button">Carian: “${esc(S.cari.trim())}” <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
  h += `<button class="reset" id="btn-reset">Tetapkan semula</button></div>`;
  return h;
}

/* ======================================================================== */
/*                              PAPARAN 1 — PAPAN UTAMA                      */
/* ======================================================================== */

/* ======================================================================== */
/*                        PAPARAN 2 — INVENTORI MINAT KERJAYA                */
/* ======================================================================== */

/* ======================================================================== */
/*                       PAPARAN 3 — INVENTORI TRET PERSONALITI              */
/* ======================================================================== */

/* ======================================================================== */
/*                          PAPARAN 4 — ANALISIS KELAS                       */
/* ======================================================================== */

/* ======================================================================== */
/*                        PAPARAN 5 — PERLU PERHATIAN                        */
/* ======================================================================== */

/* ======================================================================== */
/*                        PAPARAN 6 — DATA & SANDARAN                        */
/* ======================================================================== */
function vData() {
  const senarai = tapis();
  return `
  <div class="tajuk-blok">
    <div class="mata">Pengurusan data</div>
    <h1>Data dan <em>sandaran</em></h1>
    <p class="perihal">Data dipacu daripada fail <code>data.js</code> yang dijana daripada PDF pelaporan PPSi. Anda boleh menyandarkannya ke Google Sheet dan, jika mahu, menjadikan Sheet itu sumber langsung.</p>
  </div>

  <div class="grid g3" style="margin-bottom:14px">
    ${kadAngka('Sumber semasa', SUMBER.jenis, SUMBER.nota, SUMBER.jenis==='Google Sheet'?'--tinggi':'--brand', IKON.heks)}
    ${kadAngka('Rekod dimuatkan', S.murid.length, `dijana ${tarikhPapar(DATA.meta.dijana)}`, '--i', IKON.murid)}
    ${kadAngka('Dalam penapis semasa', senarai.length, 'akan dieksport ke CSV', '--s', IKON.kelas)}
  </div>

  <div class="grid g2" style="margin-bottom:14px">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Eksport</h2><p>Fail CSV pengekodan UTF-8, sedia diimport ke Google Sheet atau Excel.</p></div></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button class="ikon-btn" data-eksport="IMK">Muat turun IMK (CSV)</button>
        <button class="ikon-btn" data-eksport="ITP">Muat turun ITP (CSV)</button>
        <button class="ikon-btn" data-eksport="IKP">Muat turun IKP (CSV)</button>
        <button class="ikon-btn" data-eksport="TAPIS">Muat turun hasil penapis</button>
      </div>
      <p style="font-size:12px;color:var(--dakwat3);margin:12px 0 0">Nombor pengenalan dieksport penuh tanpa mengira tetapan penyamaran pada paparan. Fail IKP turut mengandungi tiga cadangan elektif setiap murid.</p>
    </div>
    <div class="kad">
      <div class="kad-kepala"><div><h2>Google Sheet</h2><p>Sandaran dan sumber data pilihan.</p></div></div>
      ${CONFIG.SHEET_PAUTAN ? `<a class="ikon-btn" href="${esc(CONFIG.SHEET_PAUTAN)}" target="_blank" rel="noopener">Buka Google Sheet</a>` :
        `<p style="font-size:13px;color:var(--dakwat2);margin:0">Pautan Sheet belum ditetapkan. Isikan <code>CONFIG.SHEET_PAUTAN</code> dalam <code>app.js</code>.</p>`}
      <div style="margin-top:12px;font-size:12.5px;color:var(--dakwat2)">
        <b style="color:var(--dakwat)">Status tarikan langsung</b>
        <p style="margin:3px 0 0">${CONFIG.SHEET_IMK_CSV || CONFIG.SHEET_ITP_CSV ? esc(SUMBER.nota) : 'Tidak aktif — aplikasi guna <code>data.js</code>. Isikan <code>CONFIG.SHEET_IMK_CSV</code> dan <code>CONFIG.SHEET_ITP_CSV</code> untuk mengaktifkannya.'}</p>
      </div>
    </div>
  </div>

  <div class="kad">
    <div class="kad-kepala"><div><h2>Menyandarkan data ke Google Sheet</h2><p>Sekali sahaja, kemudian cukup kemas kini Sheet setiap kali ada data baharu.</p></div></div>
    <ol class="langkah">
      <li><b>Muat turun CSV</b><p>Tekan <i>Muat turun IMK</i> dan <i>Muat turun ITP</i> di atas.</p></li>
      <li><b>Import ke Google Sheet</b><p>Buka Sheet baharu &rarr; <code>Fail &gt; Import</code> &rarr; pilih fail CSV &rarr; letakkan setiap instrumen pada helaian berasingan bernama <code>IMK</code> dan <code>ITP</code>.</p></li>
      <li><b>Terbitkan setiap helaian sebagai CSV</b><p><code>Fail &gt; Kongsi &gt; Terbitkan ke web</code> &rarr; pilih helaian &rarr; format <b>Nilai dipisahkan koma (.csv)</b> &rarr; salin pautan.</p></li>
      <li><b>Tampal pautan ke dalam app.js</b><p>Isikan <code>SHEET_IMK_CSV</code>, <code>SHEET_ITP_CSV</code> dan <code>SHEET_PAUTAN</code> pada bahagian <code>CONFIG</code> di baris pertama <code>app.js</code>, kemudian tolak semula ke GitHub.</p></li>
      <li><b>Selesai</b><p>Selepas ini, sunting Sheet sahaja — laman akan menarik data terkini setiap kali dibuka. Jika tarikan gagal, aplikasi berbalik kepada <code>data.js</code> secara automatik supaya paparan tidak pernah kosong.</p></li>
    </ol>
  </div>`;
}

/* ======================================================================== */
/*                            PAPARAN 7 — PANDUAN                            */
/* ======================================================================== */
function vPanduan() {
  return `
  <div class="tajuk-blok">
    <div class="mata">Rujukan</div>
    <h1>Panduan <em>tafsiran</em> dan penggunaan</h1>
    <p class="perihal">Rujukan pantas semasa membentang: makna setiap kod, cara membaca skor, dan pintasan papan kekunci.</p>
  </div>

  <div class="grid g2" style="margin-bottom:14px">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Enam bidang Holland (IMK)</h2><p>Kod tiga huruf menunjukkan tiga bidang tertinggi, mengikut urutan.</p></div></div>
      <div class="tafsir">
        ${HOLLAND.map(h=>`<article style="border-left-color:${wv(h.warna)}">
          <h4><span class="kod-heks"><i style="background:${wv(h.warna)}">${h.k}</i></span> ${esc(h.nama)}</h4>
          <p>${esc(h.ringkas)}</p>
          <p style="margin-top:4px;color:var(--dakwat3);font-size:11.5px"><b>Contoh bidang kerjaya:</b> ${esc(h.kerjaya)}</p>
        </article>`).join('')}
      </div>
      <div class="info"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.3"/></svg>
      <p><b>Indeks perbezaan</b> ialah skor Holland tertinggi tolak terendah. Semakin besar nilainya, semakin jelas kecenderungan minat murid. Pengelasan <i>jelas / sederhana / kurang jelas</i> dalam aplikasi ini ialah ambang kerja untuk memudahkan tapisan, bukan pengelasan rasmi KPM.</p></div>
    </div>

    <div class="kad">
      <div class="kad-kepala"><div><h2>Lima belas konstruk (ITP)</h2><p>Skor dilaporkan dalam peratus pada band tetap: 1, 10, 20 … 90, 99.</p></div></div>
      <div class="tafsir">
        ${KONSTRUK.map(k=>`<article style="border-left-color:${k.songsang?'var(--waspada)':'var(--i)'}">
          <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k.k}</span> ${esc(k.nama)}
          ${k.songsang?'<span class="lencana" style="background:color-mix(in srgb,var(--waspada) 14%,transparent);color:var(--waspada)">Baca songsang</span>':''}</h4>
          <p>${esc(k.ringkas)}</p></article>`).join('')}
      </div>
      ${petunjukTahap()}
    </div>
  </div>

  <div class="kad" style="margin-bottom:14px">
    <div class="kad-kepala"><div><h2>Sepuluh domain kecerdasan (IKP)</h2><p>Ditadbir kepada Tingkatan 3. Tafsiran: 75–100% tinggi, 50–74% sederhana, 0–49% rendah.</p></div></div>
    <div class="grid g2" style="gap:0 22px">
      <div class="tafsir">${KECERDASAN.slice(0,5).map(k=>`<article style="border-left-color:var(--k)">
        <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k.k}</span> ${esc(k.nama)}</h4>
        <p>${esc(k.ringkas)}</p></article>`).join('')}</div>
      <div class="tafsir">${KECERDASAN.slice(5).map(k=>`<article style="border-left-color:var(--k)">
        <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k.k}</span> ${esc(k.nama)}</h4>
        <p>${esc(k.ringkas)}</p></article>`).join('')}</div>
    </div>
    ${petunjukIKP()}
  </div>

  <div class="grid g2">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Cara mencari</h2><p>Satu medan carian merentas semua medan.</p></div></div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:var(--dakwat2);line-height:1.8">
        <li>Nama penuh atau sebahagian nama: <code>nurul</code></li>
        <li>Kelas: <code>4 bestari</code>, <code>tingkatan 2</code></li>
        <li>Kod Holland: <code>SKR</code>, atau nama bidang: <code>artistik</code></li>
        <li>Konstruk ITP: <code>kepimpinan tinggi</code>, <code>resilien rendah</code></li>
        <li>Domain IKP: <code>logik matematik tinggi</code>, <code>naturalis rendah</code></li>
        <li>Cadangan elektif: <code>sains tulen</code>, <code>elektif gkt</code></li>
        <li>Isyarat: <code>kritik diri tinggi</code>, <code>tidak ditaksir</code></li>
        <li>Bidang kerjaya: <code>kaunselor</code>, <code>jurutera</code></li>
        <li>Gabungkan bebas: <code>5 arif perempuan sosial</code></li>
      </ul>
      <p style="font-size:12px;color:var(--dakwat3);margin:12px 0 0">Semua kata mesti dipadankan, jadi menambah kata akan menyempitkan hasil.</p>
    </div>
    <div class="kad">
      <div class="kad-kepala"><div><h2>Semasa membentang</h2></div></div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:var(--dakwat2);line-height:1.8">
        <li><b>Mod malam</b> lebih selesa untuk projektor dalam bilik gelap; mod siang lebih jelas untuk cetakan dan skrin terang.</li>
        <li><b>Sembunyikan nombor pengenalan</b> (tetapan lalai) sebelum memaparkan skrin kepada khalayak luar.</li>
        <li><b>Cetak</b> menghasilkan susun atur A4 tanpa sidebar. Buka profil murid dahulu untuk mencetak satu laporan individu.</li>
        <li>Tekan <code>/</code> untuk terus ke medan carian, <code>Esc</code> untuk menutup panel profil.</li>
        <li>Klik pada tajuk lajur untuk menyusun; klik sekali lagi untuk menyongsangkan urutan.</li>
      </ul>
    </div>
  </div>`;
}

/* ======================================================================== */
/*                            PANEL PROFIL MURID                             */
/* ======================================================================== */
function bukaProfil(id) {
  const m = S.murid.find(x=>x.id===id);
  if (!m) return;
  const f = isyarat(m);
  const panel = $('#panel');

  let isi = '';
  if (m.jenis === 'IMK') {
    isi = m.status === 'DITAKSIR' ? `
      ${heksagon(m.skor, { r:96, tengah:m.kod, tengahLbl:'KOD HOLLAND' })}
      ${petunjukHolland()}
      <div class="info" style="margin-top:14px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.3"/></svg>
        <p>Indeks perbezaan <b>${m.indeks}</b> — ${esc(kategoriIndeks(m.indeks).nama.toLowerCase())}. Hanya tiga mata Holland tertinggi diterbitkan dalam laporan PPSi.</p></div>
      <div class="tafsir">
        ${(m.bidang||[]).map((b,i)=>{
          const h = HOLLAND.find(x=>x.nama.toUpperCase()===String(b).toUpperCase()) || {};
          return `<article style="border-left-color:${wv(h.warna||'--rendah')}">
            <h4><span class="kod-heks"><i style="background:${wv(h.warna||'--rendah')}">${esc(h.k||'?')}</i></span> Bidang ${i+1}: ${esc(b)}
            <span class="lencana" style="background:color-mix(in srgb,${wv(h.warna||'--rendah')} 15%,transparent);color:${wv(h.warna||'--rendah')}">${m.skor[h.k]||0} mata</span></h4>
            <p>${esc(h.ringkas||'')}</p>
            <p style="margin-top:4px;color:var(--dakwat3);font-size:11.5px"><b>Contoh kerjaya:</b> ${esc(h.kerjaya||'')}</p></article>`;
        }).join('')}
      </div>` : `<div class="amaran"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4 3 19h18z"/><path d="M12 10v4M12 16.5v.3"/></svg>
        <div><b>Murid tidak ditaksir</b><p>${esc(m.sebab||'Tiada sebab direkodkan.')}</p></div></div>`;
  } else if (m.jenis === 'IKP') {
    const tinggi = KUNCI_IKP.filter(k=>m.skor[k]>=75).sort((a,b)=>m.skor[b]-m.skor[a]);
    const rendah = KUNCI_IKP.filter(k=>m.skor[k]<=49).sort((a,b)=>m.skor[a]-m.skor[b]);
    isi = `
      ${kipas(m.skor, { kunci:KUNCI_IKP, peta:CMAP, jenis:'IKP', tengah:`${m.purata}%`, tengahLbl:'PURATA' })}
      ${petunjukIKP()}
      ${barMelintang(KUNCI_IKP.map(k=>({ label:`${k} · ${CMAP[k].nama}`, nilai:m.skor[k], warna:tahap(m.skor[k],'IKP').warna })),
        { w:580, lblW:196, maks:100, unit:'%', alt:'Skor domain kecerdasan' })}
      <div class="tafsir" style="margin-top:18px">
        <h3 style="margin-bottom:8px">Kecerdasan menonjol (75% dan ke atas)</h3>
        ${tinggi.length ? tinggi.map(k=>`<article style="border-left-color:var(--tinggi)">
          <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k}</span> ${esc(CMAP[k].nama)}
          <span class="lencana" style="background:color-mix(in srgb,var(--tinggi) 16%,transparent);color:var(--tinggi)">Tinggi ${m.skor[k]}%</span></h4>
          <p>${esc(CMAP[k].ringkas)}</p></article>`).join('')
          : '<p style="font-size:12.5px;color:var(--dakwat3)">Tiada domain mencapai tahap tinggi. Bantu murid menemui kekuatan melalui aktiviti amali dan kokurikulum.</p>'}
        <h3 style="margin:16px 0 8px">Perlu disokong (49% dan ke bawah)</h3>
        ${rendah.length ? rendah.map(k=>`<article style="border-left-color:var(--rendah)">
          <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k}</span> ${esc(CMAP[k].nama)}
          <span class="lencana" style="background:color-mix(in srgb,var(--rendah) 18%,transparent);color:var(--rendah)">Rendah ${m.skor[k]}%</span></h4>
          <p>${esc(CMAP[k].ringkas)}</p></article>`).join('')
          : '<p style="font-size:12.5px;color:var(--dakwat3)">Tiada domain pada tahap rendah.</p>'}
      </div>`;
  } else {
    const tinggi = KUNCI_TRET.filter(k=>m.skor[k]>=70).sort((a,b)=>m.skor[b]-m.skor[a]);
    const rendah = KUNCI_TRET.filter(k=>m.skor[k]<=30).sort((a,b)=>m.skor[a]-m.skor[b]);
    isi = `
      ${kipas(m.skor, { tengah:`${m.purata}%`, tengahLbl:'PURATA TRET' })}
      ${petunjukTahap()}
      ${barMelintang(KUNCI.map(k=>({
        label:`${k} · ${KMAP[k].nama}`, nilai:m.skor[k],
        warna: (k==='KD'&&m.skor[k]>=80)||(k==='KTN'&&m.skor[k]>=50) ? '--waspada' : tahap(m.skor[k]).warna
      })), { w:560, lblW:158, maks:99, unit:'%', alt:'Skor konstruk murid' })}
      <div class="tafsir" style="margin-top:18px">
        <h3 style="margin-bottom:8px">Kekuatan menonjol (70% dan ke atas)</h3>
        ${tinggi.length ? tinggi.map(k=>`<article style="border-left-color:var(--tinggi)">
          <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k}</span> ${esc(KMAP[k].nama)} ${lencanaTahap(m.skor[k])}</h4>
          <p>${esc(KMAP[k].ringkas)}</p></article>`).join('') : '<p style="font-size:12.5px;color:var(--dakwat3)">Tiada konstruk pada tahap tinggi.</p>'}
        <h3 style="margin:16px 0 8px">Perlu dibangunkan (30% dan ke bawah)</h3>
        ${rendah.length ? rendah.map(k=>`<article style="border-left-color:var(--rendah)">
          <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${k}</span> ${esc(KMAP[k].nama)} ${lencanaTahap(m.skor[k])}</h4>
          <p>${esc(KMAP[k].ringkas)}</p></article>`).join('') : '<p style="font-size:12.5px;color:var(--dakwat3)">Tiada konstruk pada tahap rendah.</p>'}
      </div>`;
  }

  panel.innerHTML = `
    <div class="panel-kepala">
      <div>
        <div class="mata">${m.jenis === 'IMK' ? 'Inventori Minat Kerjaya' : m.jenis === 'ITP' ? 'Inventori Tret Personaliti' : 'Inventori Kecerdasan Pelbagai'}</div>
        <h2>${esc(m.nama)}</h2>
        <div class="mono">${icPapar(m.ic)} &middot; ${esc(m.kelasPenuh)} &middot; ${tarikhPapar(m.tarikh)}</div>
      </div>
      <button class="tutup" id="btn-tutup" aria-label="Tutup profil">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div class="panel-isi">
      <dl class="fakta">
        <div><dt>Kelas</dt><dd>${esc(m.kelasPenuh)}</dd></div>
        <div><dt>Tingkatan</dt><dd>${esc(TING_NAMA[m.ting]||'—')}</dd></div>
        <div><dt>Jantina</dt><dd>${m.jantina==='L'?'Lelaki':m.jantina==='P'?'Perempuan':'—'}</dd></div>
        <div><dt>Tarikh pentaksiran</dt><dd>${tarikhPapar(m.tarikh)}</dd></div>
        ${m.jenis==='IMK'
          ? `<div><dt>Kod Holland</dt><dd>${m.status==='DITAKSIR'?esc(m.kod):'—'}</dd></div><div><dt>Indeks perbezaan</dt><dd>${m.status==='DITAKSIR'?m.indeks:'—'}</dd></div>`
          : m.jenis==='ITP'
          ? `<div><dt>Purata 13 tret</dt><dd>${m.purata}%</dd></div><div><dt>Ketelusan</dt><dd>${m.skor.KTN}%</dd></div>`
          : `<div><dt>Purata 10 domain</dt><dd>${m.purata}%</dd></div><div><dt>Domain tertinggi</dt><dd>${esc(CMAP[KUNCI_IKP.slice().sort((x,y)=>m.skor[y]-m.skor[x])[0]].nama)}</dd></div>`}
      </dl>

      ${f.length ? f.map(x=>`<div class="${x.aras==='waspada'?'amaran':'info'}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 9.5v5M12 17.2v.3"/></svg>
        <div><b>${esc(x.jenis)}</b><p>${esc(x.huraian)}</p></div></div>`).join('') : ''}

      ${isi}
      ${m.ting === 3 ? blokElektif(m) : ''}
      ${m.ting === 5 && m.jenis === 'IMK' ? blokKerjaya(m) : ''}

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px">
        <button class="ikon-btn" id="btn-cetak-profil">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6.5 9V3.5h11V9"/><rect x="3" y="9" width="18" height="7.5" rx="2"/><path d="M6.5 14h11v6.5h-11z"/></svg>
          Cetak profil ini
        </button>
        <button class="ikon-btn" data-caripintas="${esc(m.kelasPenuh)}">Lihat semua ${esc(m.kelasPenuh)}</button>
      </div>
      <p style="font-size:11.5px;color:var(--dakwat3);margin:14px 0 0;line-height:1.6">Tafsiran di atas ialah ringkasan panduan PPSi. Keputusan psikometrik adalah maklumat sokongan — bukan label tetap terhadap murid — dan perlu dibincangkan bersama guru bimbingan dan kaunseling sebelum sebarang tindakan.</p>
    </div>`;

  panel.classList.add('buka');
  $('#tudung').classList.add('buka');
  $('#btn-tutup').onclick = tutupProfil;
  $('#btn-cetak-profil').onclick = () => {
    document.body.classList.add('cetak-profil');
    $('#cetak-tajuk').textContent = `Profil PPSi ${m.jenis} — ${m.nama}`;
    window.print();
    setTimeout(()=>document.body.classList.remove('cetak-profil'), 400);
  };
  panel.querySelectorAll('[data-caripintas]').forEach(b=>{
    b.onclick = () => { tutupProfil(); $('#cari').value = b.dataset.caripintas; S.cari = b.dataset.caripintas; kemasCari(); lukis(); };
  });
  panel.scrollTop = 0;
  $('#btn-tutup').focus();
}
function tutupProfil() {
  $('#panel').classList.remove('buka');
  $('#tudung').classList.remove('buka');
}

/* ======================================================================== */
/*                                 CSV                                       */
/* ======================================================================== */
function keCSV(rekod, jenis) {
  const q = v => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
  let kepala, baris;
  if (jenis === 'IMK') {
    kepala = ['NAMA','NO_PENGENALAN','JANTINA','TINGKATAN','KELAS','KELAS_PENUH','TARIKH','STATUS','SEBAB','KOD_HOLLAND',
              ...HOLLAND.map(h=>h.k),'INDEKS_PERBEZAAN','BIDANG_1','BIDANG_2','BIDANG_3'];
    baris = rekod.map(m=>[m.nama,m.ic,m.jantina,m.ting,m.kelas,m.kelasPenuh,m.tarikh,m.status,m.sebab,m.kod,
      ...HOLLAND.map(h=>m.skor[h.k]||0), m.indeks, (m.bidang||[])[0]||'', (m.bidang||[])[1]||'', (m.bidang||[])[2]||'']);
  } else if (jenis === 'ITP') {
    kepala = ['NAMA','NO_PENGENALAN','JANTINA','TINGKATAN','KELAS','KELAS_PENUH','TARIKH',...KUNCI,'PURATA_13_KONSTRUK','ISYARAT'];
    baris = rekod.map(m=>[m.nama,m.ic,m.jantina,m.ting,m.kelas,m.kelasPenuh,m.tarikh,
      ...KUNCI.map(k=>m.skor[k]??''), m.purata, isyarat(m).map(x=>x.jenis).join('; ')]);
  } else {
    kepala = ['NAMA','NO_PENGENALAN','JANTINA','TINGKATAN','KELAS','KELAS_PENUH','TARIKH',...KUNCI_IKP,
              'PURATA','DOMAIN_TERTINGGI','ELEKTIF_1','SKOR_1','ELEKTIF_2','SKOR_2','ELEKTIF_3','SKOR_3','ASAS_CADANGAN'];
    baris = rekod.map(m=>{
      const c = cadanganElektif(m), t = c.senarai;
      const atas = KUNCI_IKP.slice().sort((x,y)=>m.skor[y]-m.skor[x])[0];
      return [m.nama,m.ic,m.jantina,m.ting,m.kelas,m.kelasPenuh,m.tarikh,
        ...KUNCI_IKP.map(k=>m.skor[k]??''), m.purata, CMAP[atas] ? CMAP[atas].nama : '',
        t[0]?t[0].e.nama:'', t[0]?t[0].skor:'', t[1]?t[1].e.nama:'', t[1]?t[1].skor:'',
        t[2]?t[2].e.nama:'', t[2]?t[2].skor:'', c.asas];
    });
  }
  return '\uFEFF' + [kepala, ...baris].map(r=>r.map(q).join(',')).join('\r\n');
}
function turun(nama, teks) {
  const b = new Blob([teks], { type:'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = nama;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function eksport(mod) {
  const cap = new Date().toISOString().slice(0,10);
  if (mod === 'IMK' || mod === 'ITP' || mod === 'IKP') {
    const r = S.murid.filter(m=>m.jenis===mod);
    turun(`PPSi_${mod}_${DATA.meta.tahun}_${cap}.csv`, keCSV(r, mod));
  } else {
    const r = tapis();
    let tunda = 0, ada = false;
    ['IMK','ITP','IKP'].forEach(j=>{
      const bhg = r.filter(m=>m.jenis===j);
      if (!bhg.length) return;
      ada = true;
      setTimeout(()=>turun(`PPSi_${j}_tapisan_${cap}.csv`, keCSV(bhg,j)), tunda);
      tunda += 600;
    });
    if (!ada) alert('Tiada rekod dalam penapis semasa untuk dieksport.');
  }
}

/* ======================================================================== */
/*                        JAM LANGSUNG DAN TEMA                              */
/* ======================================================================== */
function jam() {
  const kini = new Date();
  const bhg = new Intl.DateTimeFormat('en-GB', {
    timeZone: CONFIG.ZON, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false,
    weekday:'short', day:'numeric', month:'numeric', year:'numeric'
  }).formatToParts(kini).reduce((o,p)=>(o[p.type]=p.value,o),{});
  $('#jam-masa').innerHTML = `${bhg.hour}:${bhg.minute}<small>:${bhg.second}</small>`;
  const d = new Date(`${bhg.year}-${String(bhg.month).padStart(2,'0')}-${String(bhg.day).padStart(2,'0')}T00:00:00`);
  $('#jam-tarikh').textContent = `${HARI_MS[d.getDay()]}, ${bhg.day} ${BULAN_MS[Number(bhg.month)-1]} ${bhg.year}`;
  const jk = $('#jam-kecil');
  if (jk) jk.innerHTML = `${bhg.hour}:${bhg.minute}<span class="tarikh-langsung"> · ${HARI_MS[d.getDay()]}, ${bhg.day} ${BULAN_MS[Number(bhg.month)-1].slice(0,3)}</span>`;
  $('#cetak-kaki').textContent =
    `${DATA.meta.sekolah} (${DATA.meta.kodSekolah}) · Dicetak ${bhg.day} ${BULAN_MS[Number(bhg.month)-1]} ${bhg.year}, ${bhg.hour}:${bhg.minute} · Sumber: Pelaporan Pentaksiran Psikometrik KPM`;
}

function setTema(t) {
  document.documentElement.dataset.tema = t;
  const malam = t === 'malam';
  $('#teks-tema').textContent = malam ? 'Mod Siang' : 'Mod Malam';
  $('#ikon-tema').innerHTML = malam
    ? '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>'
    : '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/>';
  const t2 = $('#ikon-tema2');
  if (t2) t2.innerHTML = malam
    ? '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/>'
    : '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>';
  const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.content = malam ? '#080C1D' : '#EEF0FA';
  simpan('ppsi-tema', t);
}

/* ======================================================================== */
/*                            NAVIGASI DAN LUKISAN                           */
/* ======================================================================== */
const PAPARAN = { papan:vPapan, imk:vIMK, itp:vITP, ikp:vIKP, elektif:vElektif, kerjaya:vKerjaya,
                  kelas:vKelas, perhatian:vPerhatian, data:vData, panduan:vPanduan };
const TAJUK = { papan:'Papan Utama', imk:'Inventori Minat Kerjaya', itp:'Inventori Tret Personaliti',
                ikp:'Inventori Kecerdasan Pelbagai', elektif:'Cadangan Elektif Tingkatan 4',
                kerjaya:'Laluan Kerjaya Selepas SPM',
                kelas:'Analisis Kelas', perhatian:'Murid Perlu Perhatian', data:'Data & Sandaran', panduan:'Panduan' };

function lukis(animasi = false) {
  const el = $('#v-' + S.papar);
  if (!el) return;
  SENARAI = {}; SENARAI_N = 0;
  el.innerHTML = PAPARAN[S.papar]();
  if (animasi) hidupkan(el); else el.classList.remove('animasi');
  const jh = $('#jejak-hal'); if (jh) jh.textContent = TAJUK[S.papar];
  $$('.paparan').forEach(p=>{
    const ini = p.id === 'v-' + S.papar;
    p.classList.toggle('aktif', ini);
    if (!ini) p.innerHTML = '';   // buang paparan lama supaya DOM kekal ringan
  });
  $$('#nav a').forEach(a=>{
    if (a.dataset.pergi === S.papar) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });
  $('#cetak-tajuk').textContent = `Dashboard PPSi ${DATA.meta.tahun} — ${TAJUK[S.papar]}`;
  $('#kira-imk').textContent = S.murid.filter(m=>m.jenis==='IMK').length;
  $('#kira-itp').textContent = S.murid.filter(m=>m.jenis==='ITP').length;
  const kIkp = $('#kira-ikp'), kElek = $('#kira-elektif');
  if (kIkp) kIkp.textContent = S.murid.filter(m=>m.jenis==='IKP').length;
  if (kElek) kElek.textContent = new Set(S.murid.filter(m=>m.ting===3).map(m=>m.ic)).size;
  $('#kira-flag').textContent = S.murid.filter(m=>isyarat(m).length).length;
  ikat(el);
  hasilCari(false);
}

function ikat(root) {
  $$('tbody tr[data-id]', root).forEach(tr=>{
    tr.onclick = () => bukaProfil(tr.dataset.id);
    tr.tabIndex = 0;
    tr.onkeydown = e => { if (e.key === 'Enter') bukaProfil(tr.dataset.id); };
  });
  $$('[data-susun]', root).forEach(th=>{
    th.onclick = () => {
      const m = th.dataset.susun;
      S.susun = S.susun.medan === m ? { medan:m, arah:-S.susun.arah } : { medan:m, arah: m==='nama'||m==='kelasPenuh'||m==='kod'||m==='tarikh' ? 1 : -1 };
      lukis();
    };
  });
  $$('[data-tapis]', root).forEach(sel=>{
    sel.onchange = () => { S[sel.dataset.tapis] = sel.value; lukis(); };
  });
  $$('[data-kod]', root).forEach(b=>{
    b.onclick = () => { S.tapisKod = S.tapisKod === b.dataset.kod ? '' : b.dataset.kod; lukis(); };
  });
  $$('[data-caripintas]', root).forEach(b=>{
    b.onclick = () => { $('#cari').value = b.dataset.caripintas; S.cari = b.dataset.caripintas; kemasCari(); lukis(); };
  });
  $$('[data-eksport]', root).forEach(b=>{ b.onclick = () => eksport(b.dataset.eksport); });
  $$('[data-pergi-cepat]', root).forEach(b=>{ b.onclick = () => pergi(b.dataset.pergiCepat); });
  $$('[data-kosong-cari]', root).forEach(b => { b.onclick = kosongkanCari; });
  const r = $('#btn-reset', root);
  if (r) r.onclick = () => {
    S.jenis='SEMUA'; S.ting='SEMUA'; S.kelas='SEMUA'; S.jantina='SEMUA'; S.tapisKod=''; S.cari='';
    $('#cari').value=''; kemasCari(); lukis();
  };
}

function tutupSisi() { $('#sisi').classList.remove('buka'); const t = $('#tudung-sisi'); if (t) t.classList.remove('buka'); }
function kemasCari() { $('#bekas-cari').classList.toggle('ada', !!$('#cari').value); }

function pergi(p) {
  if (!PAPARAN[p]) p = 'papan';
  tutupProfil(); tutupSenarai(); tutupSisi();
  S.papar = p;
  if (location.hash.slice(1) !== p) history.replaceState(null, '', '#' + p);
  lukis(true);
  window.scrollTo({ top:0, behavior:'instant' });
}

/* ======================================================================== */
/*                     MUATAN DATA (data.js atau Google Sheet)               */
/* ======================================================================== */
let DATA = window.PPSI || { meta:{ sekolah:'—', kodSekolah:'—', tahun:new Date().getFullYear(), dijana:'' }, murid:[] };
let SUMBER = { jenis:'Fail data.js', nota:'Dijana daripada PDF pelaporan PPSi' };

function pecahCSV(teks) {
  const baris = []; let f = '', r = [], dlm = false;
  teks = teks.replace(/^\uFEFF/, '');
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (dlm) {
      if (c === '"') { if (teks[i+1] === '"') { f += '"'; i++; } else dlm = false; }
      else f += c;
    } else if (c === '"') dlm = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); baris.push(r); r = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || r.length) { r.push(f); baris.push(r); }
  return baris.filter(b => b.some(x => x.trim()));
}

function dariSheet(baris, jenis) {
  const kepala = baris[0].map(h=>h.trim().toUpperCase());
  const idx = n => kepala.indexOf(n);
  const N = (r,n) => { const i = idx(n); return i < 0 ? '' : (r[i] ?? '').trim(); };
  return baris.slice(1).map(r=>{
    const ic = N(r,'NO_PENGENALAN'), ting = Number(N(r,'TINGKATAN')) || 0;
    const asas = { id:`${jenis}-${ic}`, jenis, nama:N(r,'NAMA'), ic, jantina:N(r,'JANTINA') || '-',
      ting, tingkatan:'', kelas:N(r,'KELAS'), kelasPenuh:N(r,'KELAS_PENUH') || `${ting} ${N(r,'KELAS')}`,
      tarikh:N(r,'TARIKH'), status:N(r,'STATUS') || 'DITAKSIR', sebab:N(r,'SEBAB') };
    if (jenis === 'IMK') {
      const skor = {}; HOLLAND.forEach(h=>skor[h.k] = Number(N(r,h.k)) || 0);
      const kod = N(r,'KOD_HOLLAND');
      return { ...asas, skor, kod, indeks:Number(N(r,'INDEKS_PERBEZAAN'))||0, dominan:kod[0]||'',
        bidang:[N(r,'BIDANG_1'),N(r,'BIDANG_2'),N(r,'BIDANG_3')].filter(Boolean) };
    }
    const skor = {}; KUNCI.forEach(k=>skor[k] = Number(N(r,k)) || 0);
    return { ...asas, skor, purata: Math.round(purata(KUNCI_TRET.map(k=>skor[k]))*10)/10 };
  }).filter(m=>m.nama);
}

async function muatSheet() {
  if (!CONFIG.SHEET_IMK_CSV && !CONFIG.SHEET_ITP_CSV) return false;
  try {
    const kerja = [];
    if (CONFIG.SHEET_IMK_CSV) kerja.push(fetch(CONFIG.SHEET_IMK_CSV).then(r=>r.text()).then(t=>dariSheet(pecahCSV(t),'IMK')));
    if (CONFIG.SHEET_ITP_CSV) kerja.push(fetch(CONFIG.SHEET_ITP_CSV).then(r=>r.text()).then(t=>dariSheet(pecahCSV(t),'ITP')));
    const hasil = (await Promise.all(kerja)).flat();
    if (!hasil.length) throw new Error('Sheet kosong');
    S.murid = hasil;
    S.murid.forEach(m=>m._cari = bina(m));
    SUMBER = { jenis:'Google Sheet', nota:`${hasil.length} rekod ditarik terus dari Sheet` };
    lukis();
    return true;
  } catch (e) {
    SUMBER = { jenis:'Fail data.js', nota:'Tarikan Google Sheet gagal — kembali kepada data tempatan' };
    console.warn('Tarikan Sheet gagal:', e);
    return false;
  }
}

/* ======================================================================== */
/*                                  MULA                                     */
/* ======================================================================== */
function mula() {
  S.murid = DATA.murid.slice();
  S.murid.forEach(m=>m._cari = bina(m));

  setTema(ambil('ppsi-tema') || 'siang');
  S.tunjukIC = ambil('ppsi-ic') === '1';
  $('#teks-ic').textContent = S.tunjukIC ? 'Sembunyikan No. Pengenalan' : 'Papar No. Pengenalan';

  jam(); setInterval(jam, 1000);

  $('#cari').addEventListener('input', e => {
    S.cari = e.target.value; kemasCari();
    clearTimeout(window._tangguhCari);
    window._tangguhCari = setTimeout(() => { lukis(); hasilCari(true); }, 160);
  });
  $('#cari').addEventListener('focus', () => { if (S.cari.trim()) hasilCari(true); });
  $('#cari').addEventListener('blur', () => setTimeout(tutupHasilCari, 200));
  $('#cari').addEventListener('keydown', kekunciCari);
  $('#btn-kosong').onclick = () => { kosongkanCari(); $('#cari').focus(); };
  const tukarTema = () => setTema(document.documentElement.dataset.tema === 'malam' ? 'siang' : 'malam');
  $('#btn-tema').onclick = tukarTema;
  if ($('#btn-tema2')) $('#btn-tema2').onclick = tukarTema;
  if (ambil('ppsi-rel') === '1') document.body.classList.add('rel');
  if ($('#btn-rel')) $('#btn-rel').onclick = () => {
    document.body.classList.toggle('rel');
    simpan('ppsi-rel', document.body.classList.contains('rel') ? '1' : '0');
    $('#btn-rel span').textContent = document.body.classList.contains('rel') ? 'Besarkan menu' : 'Kecilkan menu';
  };
  if ($('#btn-rel') && document.body.classList.contains('rel')) $('#btn-rel span').textContent = 'Besarkan menu';
  $('#btn-ic').onclick = () => {
    S.tunjukIC = !S.tunjukIC;
    simpan('ppsi-ic', S.tunjukIC ? '1' : '0');
    $('#teks-ic').textContent = S.tunjukIC ? 'Sembunyikan No. Pengenalan' : 'Papar No. Pengenalan';
    lukis();
  };
  $('#btn-csv').onclick = () => eksport('TAPIS');
  $('#btn-sisi').onclick = () => { $('#sisi').classList.add('buka'); $('#tudung-sisi').classList.add('buka'); };
  $('#tudung-sisi').onclick = tutupSisi;
  $('#tudung').onclick = tutupProfil;
  $('#tudung-senarai').onclick = tutupSenarai;

  // klik mana-mana item yang ada angka -> senarai murid
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-senarai]');
    if (!t || t.closest('#senarai')) return;
    e.preventDefault();
    tutupHasilCari();
    bukaSenarai(t.dataset.senarai);
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g[data-senarai],path[data-senarai]')) {
      e.preventDefault(); bukaSenarai(e.target.dataset.senarai);
    }
  });

  $$('#nav a').forEach(a=>{ a.onclick = e => { e.preventDefault(); pergi(a.dataset.pergi); }; });
  window.addEventListener('hashchange', () => pergi(location.hash.slice(1) || 'papan'));

  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape') {
      if ($('#hasil-cari') && $('#hasil-cari').classList.contains('buka')) tutupHasilCari();
      else if ($('#panel').classList.contains('buka')) tutupProfil();
      else if ($('#senarai').classList.contains('buka')) tutupSenarai();
      else tutupSisi();
    }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); $('#cari').focus(); }
  });

  // pastikan angka sudah lengkap sebelum dicetak
  window.addEventListener('beforeprint', () => $$('[data-kira]').forEach(n => n.textContent = n.dataset.kira));

  pergi(location.hash.slice(1) || 'papan');
  muatSheet();
}

/* =========================================================================
   MODUL TAMBAHAN — Tingkatan 3 (IKP), cadangan elektif, laluan kerjaya
   ========================================================================= */

/* ---------------- Inventori Kecerdasan Pelbagai (10 konstruk) ------------ */
const KECERDASAN = [
  { k:'VLM',   nama:'Verbal Linguistik BM', ringkas:'Keupayaan menggunakan bahasa Melayu, memahami maklumat dan memberi respons dalam pelbagai bentuk komunikasi.' },
  { k:'VLI',   nama:'Verbal Linguistik BI', ringkas:'Keupayaan menggunakan bahasa Inggeris, memahami maklumat dan memberi respons dalam pelbagai bentuk komunikasi.' },
  { k:'LM',    nama:'Logik Matematik',      ringkas:'Keupayaan menggunakan nombor dalam kehidupan seharian untuk membuat penyelesaian secara logikal.' },
  { k:'VR',    nama:'Visual Ruang',         ringkas:'Kecerdasan bukan verbal — keupayaan mengguna, menganggar dan mentafsir ruang.' },
  { k:'MZK',   nama:'Muzik',                ringkas:'Keupayaan menghargai, menghayati dan menggubah muzik.' },
  { k:'NAT',   nama:'Naturalis',            ringkas:'Keupayaan mengenal pasti dan menghargai alam semula jadi.' },
  { k:'INTRA', nama:'Intrapersonal',        ringkas:'Keupayaan memahami dan menilai kekuatan, kelemahan, bakat dan minat kendiri.' },
  { k:'INTER', nama:'Interpersonal',        ringkas:'Keupayaan berkomunikasi, berinteraksi dan bekerjasama dengan orang lain.' },
  { k:'KN',    nama:'Kinestetik',           ringkas:'Kecerdasan jasmani — keupayaan mengawal dan memahami pergerakan tubuh.' },
  { k:'EK',    nama:'Eksistensial',         ringkas:'Peka dan berkebolehan membincangkan hal kewujudan seperti mencari makna dalam kehidupan.' }
];
const CMAP = Object.fromEntries(KECERDASAN.map(k => [k.k, k]));
const KUNCI_IKP = KECERDASAN.map(k => k.k);

/* ---------------- Mata pelajaran elektif Tingkatan 4 -------------------- */
/* Pemberat di bawah ialah rubrik kerja sekolah, bukan formula rasmi KPM.
   Ubah nilainya di sini jika panitia mahu penekanan berbeza.            */
const ELEKTIF = [
  { id:'ST',  nama:'Sains Tulen', warna:'--i',
    perihal:'Fizik, Kimia, Biologi dan Matematik Tambahan.',
    holland:{ utama:'I', sokong:['R','K'] },
    ikp:{ utama:['LM','VR'], sokong:['VLI','NAT'] },
    syarat:'Menuntut asas Matematik dan Sains yang kukuh dalam PT3 serta ketekunan menjawab soalan berstruktur.',
    lanjut:'Perubatan, farmasi, kejuruteraan, sains gunaan, bioteknologi, kesihatan bersekutu.' },
  { id:'SK',  nama:'Sains Komputer', warna:'--i',
    perihal:'Pemikiran komputasional, algoritma, pengaturcaraan dan pangkalan data.',
    holland:{ utama:'I', sokong:['K','R'] },
    ikp:{ utama:['LM','VLI'], sokong:['VR','INTRA'] },
    syarat:'Menuntut logik yang kemas, kesabaran menyahpepijat dan keselesaan membaca dokumentasi dalam bahasa Inggeris.',
    lanjut:'Sains komputer, kejuruteraan perisian, keselamatan siber, sains data, rangkaian dan sistem maklumat.' },
  { id:'PP',  nama:'Prinsip Perakaunan', warna:'--k',
    perihal:'Kitaran perakaunan, penyata kewangan, perakaunan kos.',
    holland:{ utama:'K', sokong:['E','I'] },
    ikp:{ utama:['LM','VLM'], sokong:['INTRA','VLI'] },
    syarat:'Sesuai untuk murid yang teliti, sabar dengan angka dan suka kerja berstruktur mengikut peraturan.',
    lanjut:'Perakaunan, audit, percukaian, perbankan, kewangan korporat.' },
  { id:'PN',  nama:'Pengajian Perniagaan', warna:'--e',
    perihal:'Pengurusan, pemasaran, keusahawanan dan operasi perniagaan.',
    holland:{ utama:'E', sokong:['K','S'] },
    ikp:{ utama:['VLM','INTER'], sokong:['VLI','LM'] },
    syarat:'Banyak penulisan esei dan kajian kes, jadi kekuatan bahasa amat membantu.',
    lanjut:'Pengurusan perniagaan, pemasaran, sumber manusia, logistik, keusahawanan.' },
  { id:'RC',  nama:'Reka Cipta', warna:'--r',
    perihal:'Proses reka bentuk, inovasi produk dan pembinaan prototaip.',
    holland:{ utama:'R', sokong:['I','A'] },
    ikp:{ utama:['VR','KN'], sokong:['LM','NAT'] },
    syarat:'Berasaskan projek dan kerja tangan — sesuai untuk murid yang suka mencuba dan membina.',
    lanjut:'Reka bentuk perindustrian, kejuruteraan produk, inovasi dan pembuatan.' },
  { id:'GKT', nama:'Grafik Komunikasi Teknikal', warna:'--k',
    perihal:'Lukisan kejuruteraan, unjuran ortografik, lukisan berbantu komputer.',
    holland:{ utama:'R', sokong:['I','K'] },
    ikp:{ utama:['VR','LM'], sokong:['KN','INTRA'] },
    syarat:'Menuntut ketepatan, kekemasan dan keupayaan membayangkan objek tiga dimensi.',
    lanjut:'Seni bina, ukur bahan, kejuruteraan awam dan mekanikal, pelukis pelan.' },
  { id:'PSV', nama:'Pendidikan Seni Visual', warna:'--a',
    perihal:'Seni halus, reka bentuk grafik, sejarah dan apresiasi seni.',
    holland:{ utama:'A', sokong:['R','S'] },
    ikp:{ utama:['VR','MZK'], sokong:['KN','INTRA'] },
    syarat:'Portfolio dan kerja amali berterusan — perlu komitmen masa di luar waktu kelas.',
    lanjut:'Reka bentuk grafik, animasi, multimedia, seni bina dalaman, fesyen.' },
  { id:'LN',  nama:'Landskap dan Nurseri', warna:'--r',
    perihal:'Reka bentuk landskap, pembiakan tanaman dan pengurusan nurseri.',
    holland:{ utama:'R', sokong:['A','I'] },
    ikp:{ utama:['NAT','KN'], sokong:['VR','INTRA'] },
    syarat:'Banyak kerja amali di luar bilik darjah dan penjagaan tanaman berjadual.',
    lanjut:'Seni bina landskap, hortikultur, pertanian, pengurusan taman dan rekreasi.' }
];

/* ---------------- Laluan kerjaya selepas SPM (mengikut kod Holland) ------ */
const KERJAYA = {
  R:{ bidang:'Teknikal, kejuruteraan dan pengendalian', pendek:'Teknikal & kejuruteraan',
      laluan:'Politeknik, Kolej Komuniti, ILP/IKBN/ADTEC, Matrikulasi Sains, Tingkatan 6 Sains, Giat MARA',
      contoh:'Jurutera, juruteknik, mekanik automotif, juruelektrik, juruukur, penyelenggaraan pesawat, tentera dan polis, pertanian' },
  I:{ bidang:'Penyelidikan, sains dan analisis', pendek:'Penyelidikan & sains',
      laluan:'Matrikulasi, Asasi Sains universiti awam, Tingkatan 6 Sains, Diploma Sains Kesihatan',
      contoh:'Doktor, ahli farmasi, saintis makmal, penganalisis data, ahli kimia, pegawai penyelidik, jurutera penyelidikan' },
  A:{ bidang:'Kreatif, reka bentuk dan media', pendek:'Kreatif & media',
      laluan:'Diploma seni dan reka bentuk (politeknik/IPTA/IPTS), ASWARA, Tingkatan 6 Sastera, portfolio persendirian',
      contoh:'Pereka grafik, animator, arkitek, pereka fesyen, penulis, penerbit media, jurugambar, pereka dalaman' },
  S:{ bidang:'Perkhidmatan, pendidikan dan kesihatan', pendek:'Perkhidmatan & pendidikan',
      laluan:'Institut Pendidikan Guru (IPG), Matrikulasi, Tingkatan 6, Kolej Sains Kesihatan Bersekutu, Diploma Kerja Sosial',
      contoh:'Guru, jururawat, kaunselor, pegawai kebajikan, ahli fisioterapi, jurulatih sukan, pegawai perhubungan awam' },
  E:{ bidang:'Perniagaan, pengurusan dan keusahawanan', pendek:'Perniagaan & pengurusan',
      laluan:'Diploma Pengurusan Perniagaan, Tingkatan 6 Sastera, UiTM/Kolej Profesional MARA, program keusahawanan',
      contoh:'Usahawan, eksekutif pemasaran, pengurus jualan, ejen hartanah, pegawai perhubungan pelanggan, peguam' },
  K:{ bidang:'Pentadbiran, kewangan dan pengurusan data', pendek:'Pentadbiran & kewangan',
      laluan:'Diploma Perakaunan/Pentadbiran, Tingkatan 6 Perdagangan, LCCI, ACCA Foundation, Kolej Komuniti',
      contoh:'Akauntan, juruaudit, kerani kanan, pegawai bank, pembantu tadbir, pegawai insurans, pengurus rekod' }
};
const GABUNG = {
  RI:'Kejuruteraan dan teknologi gunaan — mekanikal, elektrik, awam, aeroangkasa, penyelenggaraan industri.',
  RA:'Seni bina, reka bentuk perindustrian dan pertukangan halus yang menggabungkan ketepatan dengan estetika.',
  RS:'Sains sukan, perkhidmatan penyelamat, kejururawatan kecemasan dan kejurulatihan.',
  RE:'Pembinaan dan kontraktor, pengurusan projek teknikal, jualan peralatan industri.',
  RK:'Penyelenggaraan berjadual, logistik dan gudang, ukur bahan, kawalan kualiti pengeluaran.',
  IA:'Animasi saintifik, bioinformatik, reka bentuk perubatan, fotografi dan penerbitan sains.',
  IS:'Perubatan, farmasi, psikologi, pemakanan dan pendidikan sains.',
  IE:'Aktuari, analitik perniagaan, perundingan teknologi, pengurusan produk.',
  IK:'Sains data, statistik, makmal kawalan kualiti, penyelidikan pasaran.',
  AS:'Pendidikan seni, terapi seni, penyiaran, komunikasi dan penerbitan.',
  AE:'Pengiklanan, pembinaan jenama, keusahawanan kreatif, pengurusan acara.',
  AK:'Reka bentuk grafik korporat, penerbitan, reka bentuk dalaman, pengurusan arkib visual.',
  SE:'Sumber manusia, pemasaran, perhubungan awam, latihan korporat dan keguruan.',
  SK:'Pentadbiran pendidikan, kerja sosial, perkhidmatan pelanggan, pengurusan pejabat.',
  EK:'Perbankan, perakaunan, insurans, pengurusan perniagaan dan percukaian.'
};
const HSUSUN = 'RIASEK';
function kunciGabung(a, b) {
  const [x, y] = [a, b].sort((p, q) => HSUSUN.indexOf(p) - HSUSUN.indexOf(q));
  return x + y;
}

/* ---------------- Enjin pemadanan --------------------------------------- */
function pasangan(m) {
  // rekod pasangan instrumen bagi murid yang sama
  return S.murid.find(x => x.ic === m.ic && x.jenis !== m.jenis && x.ting === m.ting) || null;
}

function skorElektif(e, imk, ikp) {
  let h = null, g = null;
  if (imk && imk.kod && imk.status === 'DITAKSIR') {
    const w = [3, 2, 1];
    let s = 0;
    [...imk.kod].forEach((c, i) => {
      if (c === e.holland.utama) s += w[i];
      else if (e.holland.sokong.includes(c)) s += w[i] * 0.5;
    });
    h = Math.min(100, s / 4.5 * 100);
  }
  if (ikp && ikp.status === 'DITAKSIR') {
    let jum = 0, berat = 0;
    e.ikp.utama.forEach(k => { jum += (ikp.skor[k] || 0) * 2; berat += 2; });
    e.ikp.sokong.forEach(k => { jum += (ikp.skor[k] || 0); berat += 1; });
    g = jum / berat;
  }
  if (h === null && g === null) return null;
  if (h === null) return { skor: Math.round(g), asas: 'IKP sahaja' };
  if (g === null) return { skor: Math.round(h), asas: 'IMK sahaja' };
  return { skor: Math.round(0.45 * h + 0.55 * g), asas: 'IMK + IKP' };
}

function cadanganElektif(m) {
  const lain = pasangan(m);
  const imk = m.jenis === 'IMK' ? m : (lain && lain.jenis === 'IMK' ? lain : null);
  const ikp = m.jenis === 'IKP' ? m : (lain && lain.jenis === 'IKP' ? lain : null);
  const hasil = ELEKTIF.map(e => {
    const s = skorElektif(e, imk, ikp);
    return s ? { e, ...s } : null;
  }).filter(Boolean).sort((a, b) => b.skor - a.skor);
  return { senarai: hasil, asas: hasil.length ? hasil[0].asas : 'Tiada data' };
}

function laluanKerjaya(m) {
  if (!m.kod || m.status !== 'DITAKSIR') return null;
  const [a, b] = [m.kod[0], m.kod[1]];
  return {
    utama: KERJAYA[a],
    huruf: a,
    kedua: b,
    gabung: GABUNG[kunciGabung(a, b)] || '',
    sokong: KERJAYA[b]
  };
}

/* ======================================================================== */
/*                    PAPARAN — KECERDASAN PELBAGAI (IKP)                    */
/* ======================================================================== */

function petunjukIKP() {
  return `<div class="petunjuk">
    <span><i style="background:var(--tinggi)"></i>Tinggi 75–100%</span>
    <span><i style="background:var(--sederhana)"></i>Sederhana 50–74%</span>
    <span><i style="background:var(--rendah)"></i>Rendah 0–49%</span></div>`;
}

/* ======================================================================== */
/*                  PAPARAN — CADANGAN ELEKTIF TINGKATAN 4                   */
/* ======================================================================== */

/* ======================================================================== */
/*                   PAPARAN — LALUAN KERJAYA SELEPAS SPM                    */
/* ======================================================================== */

/* ---------------- Blok untuk panel profil ------------------------------- */
function blokElektif(m) {
  const c = cadanganElektif(m);
  if (!c.senarai.length) return '';
  const tiga = c.senarai.slice(0, 3);
  return `
  <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--garis)">
    <div class="mata">Perancangan Tingkatan 4</div>
    <h3 style="margin:5px 0 3px;font-size:17px;font-weight:720;letter-spacing:-.02em">Cadangan mata pelajaran elektif</h3>
    <p style="font-size:12px;color:var(--dakwat3);margin:0 0 12px">Dikira daripada ${esc(c.asas)}. Perlu disemak bersama pencapaian PT3.</p>
    <div class="tafsir">
      ${tiga.map((x,i)=>`<article style="border-left-color:${wv(x.e.warna)}">
        <h4><span class="mono" style="background:var(--papan3);padding:1px 6px;border-radius:5px;font-size:11.5px">${i+1}</span> ${esc(x.e.nama)}
        <span class="lencana" style="background:color-mix(in srgb,${wv(x.e.warna)} 15%,transparent);color:${wv(x.e.warna)}">Padanan ${x.skor}</span></h4>
        <p>${esc(x.e.perihal)} ${esc(x.e.syarat)}</p>
        <p style="margin-top:4px;color:var(--dakwat3);font-size:11.5px"><b>Membawa ke:</b> ${esc(x.e.lanjut)}</p>
      </article>`).join('')}
    </div>
    ${barMelintang(c.senarai.map(x=>({label:x.e.nama, nilai:x.skor, warna:x.e.warna})),
      { w:560, lblW:186, maks:100, alt:'Skor padanan elektif' })}
    <p style="font-size:11.5px;color:var(--dakwat3);margin:10px 0 0;line-height:1.6">Skor padanan mengukur keserasian minat dan kecerdasan sahaja. Penempatan sebenar bergantung pada keputusan PT3, kuota kelas dan pilihan murid serta ibu bapa.</p>
  </div>`;
}

function blokKerjaya(m) {
  const l = laluanKerjaya(m);
  if (!l) return '';
  return `
  <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--garis)">
    <div class="mata">Selepas SPM</div>
    <h3 style="margin:5px 0 3px;font-size:17px;font-weight:720;letter-spacing:-.02em">Laluan kerjaya dan pengajian</h3>
    <p style="font-size:12px;color:var(--dakwat3);margin:0 0 12px">Berdasarkan kod ${esc(m.kod)}.</p>
    <div class="tafsir">
      <article style="border-left-color:${wv(HMAP[l.huruf].warna)}">
        <h4><span class="kod-heks"><i style="background:${wv(HMAP[l.huruf].warna)}">${l.huruf}</i></span> ${esc(l.utama.bidang)}</h4>
        <p><b>Laluan selepas SPM:</b> ${esc(l.utama.laluan)}</p>
        <p style="margin-top:4px"><b>Contoh kerjaya:</b> ${esc(l.utama.contoh)}</p>
      </article>
      ${l.gabung ? `<article style="border-left-color:var(--signal)">
        <h4>Gabungan ${esc(m.kod[0])} + ${esc(m.kod[1])}</h4>
        <p>${esc(l.gabung)}</p></article>` : ''}
      ${l.sokong ? `<article style="border-left-color:${wv(HMAP[l.kedua].warna)}">
        <h4><span class="kod-heks"><i style="background:${wv(HMAP[l.kedua].warna)}">${l.kedua}</i></span> Bidang sokongan: ${esc(l.sokong.bidang)}</h4>
        <p style="color:var(--dakwat3);font-size:11.5px"><b>Contoh kerjaya:</b> ${esc(l.sokong.contoh)}</p></article>` : ''}
    </div>
  </div>`;
}


/* =========================================================================
   MODUL UI MODEN — senarai murid boleh klik, animasi, graf baharu
   ========================================================================= */
const PANAH = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';
const CHEVRON = '<svg class="bh-anak" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>';
const gayaL = w => `background:color-mix(in srgb,var(${w}) 14%,transparent);color:var(${w})`;

/* ---------------------------- DAFTAR SENARAI ----------------------------- */
let SENARAI = {}, SENARAI_N = 0;
const SM = { aktif:null, susun:'kelas', q:'' };

function daftar(tajuk, murid, opt = {}) {
  const k = 's' + (++SENARAI_N);
  SENARAI[k] = { tajuk, murid: murid.slice(), ...opt };
  return k;
}

function apaLalai(m) {
  if (m.status !== 'DITAKSIR') return `<span class="lencana" style="${gayaL('--waspada')}">Tidak ditaksir</span>`;
  if (m.jenis === 'IMK') return `${kodHeks(m.kod)}<span class="lencana" style="${gayaL('--rendah')}">IMK</span>`;
  if (m.jenis === 'ITP') return `<span class="lencana" style="${gayaL(tahap(m.purata).warna)}">ITP · ${m.purata}%</span>`;
  return `<span class="lencana" style="${gayaL(tahap(m.purata,'IKP').warna)}">IKP · ${m.purata}%</span>`;
}
function apaTeksLalai(m) {
  if (m.status !== 'DITAKSIR') return `Tidak ditaksir${m.sebab ? ' — ' + m.sebab : ''}`;
  if (m.jenis === 'IMK') return `IMK kod ${m.kod}, indeks ${m.indeks}`;
  return `${m.jenis} purata ${m.purata}%`;
}
function chipSkor(v, jenis, k) {
  const bahaya = (k === 'KD' && v >= 80) || (k === 'KTN' && v >= 50);
  const t = tahap(v, jenis);
  return `<span class="lencana" style="${gayaL(bahaya ? '--waspada' : t.warna)}">${k} · ${v}%</span>`;
}

/* Murid mengikut bidang Holland — mod 'dominan' (huruf pertama) atau 'ada' (dalam 3 mata) */
function lsBidang(pop, k, mod, konteks, tajuk) {
  const h = HMAP[k];
  const ahli = pop.filter(m => m.jenis === 'IMK' && m.status === 'DITAKSIR' &&
    (mod === 'dominan' ? m.dominan === k : (m.kod || '').includes(k)));
  return daftar(tajuk || h.nama, ahli, {
    eyebrow: konteks, warna: h.warna,
    huraian: mod === 'dominan'
      ? `Kod Holland bermula dengan ${k} — ${h.nama.toLowerCase()} ialah bidang paling menonjol. ${h.ringkas}`
      : `Murid yang mempunyai ${k} (${h.nama}) dalam tiga mata Holland mereka. ${h.ringkas}`,
    nilai: m => m.skor[k] || 0, labelNilai: `Skor ${k}`,
    apa: m => `${kodHeks(m.kod)}<span class="lencana" style="${gayaL(h.warna)}">${k} ${m.skor[k]}</span>`,
    apaTeks: m => `Kod ${m.kod}, skor ${k} = ${m.skor[k]}`
  });
}

/* Murid mengikut satu konstruk ITP/IKP, disusun ikut skor */
function lsKonstruk(pop, k, jenis, konteks, tajuk, opt = {}) {
  const peta = jenis === 'IKP' ? CMAP : KMAP;
  const ahli = pop.filter(m => m.jenis === jenis && m.status === 'DITAKSIR');
  const kira = t => ahli.filter(m => tahap(m.skor[k], jenis).k === t).length;
  const pur = Math.round(purata(ahli.map(m => m.skor[k])));
  return daftar(tajuk || peta[k].nama, ahli, {
    eyebrow: konteks,
    warna: peta[k].songsang ? '--waspada' : tahap(pur, jenis).warna,
    huraian: `Purata ${pur}% · ${kira('T')} tinggi · ${kira('S')} sederhana · ${kira('R')} rendah. ${peta[k].ringkas}`,
    nilai: m => m.skor[k], labelNilai: k, naik: !!opt.naik,
    apa: m => chipSkor(m.skor[k], jenis, k),
    apaTeks: m => `${k} ${m.skor[k]}% (${tahap(m.skor[k], jenis).nama})`
  });
}

function nilaiIsyarat(m, j) {
  if (/Kritik diri/.test(j)) return m.skor.KD;
  if (j === 'Ketelusan rendah') return m.skor.KTN;
  if (j === 'Resilien rendah') return -m.skor.RSL;
  if (j === 'Minat kurang jelas') return -m.indeks;
  if (j === 'Tiada domain kecerdasan tinggi') return -Math.max(...KUNCI_IKP.map(k => m.skor[k]));
  return 0;
}
function apaIsyarat(m, j) {
  if (/Kritik diri/.test(j)) return chipSkor(m.skor.KD, 'ITP', 'KD');
  if (j === 'Ketelusan rendah') return chipSkor(m.skor.KTN, 'ITP', 'KTN');
  if (j === 'Resilien rendah') return chipSkor(m.skor.RSL, 'ITP', 'RSL');
  if (j === 'Minat kurang jelas') return `${kodHeks(m.kod)}<span class="lencana" style="${gayaL('--waspada')}">Indeks ${m.indeks}</span>`;
  if (j === 'Tiada domain kecerdasan tinggi') return `<span class="lencana" style="${gayaL('--sederhana')}">Tertinggi ${Math.max(...KUNCI_IKP.map(k => m.skor[k]))}%</span>`;
  if (j === 'Tidak ditaksir') return `<span class="lencana" style="${gayaL('--waspada')}">${esc(m.sebab || 'Tidak ditaksir')}</span>`;
  return apaLalai(m);
}
function lsIsyarat(arr, j, konteks) {
  const f0 = arr.length ? isyarat(arr[0]).find(f => f.jenis === j) : null;
  return daftar(j, arr, {
    eyebrow: konteks, warna: f0 && f0.aras === 'waspada' ? '--waspada' : '--sederhana',
    huraian: KRITERIA[j] || '',
    nilai: m => nilaiIsyarat(m, j), labelNilai: 'Keutamaan',
    apa: m => apaIsyarat(m, j),
    apaTeks: m => (isyarat(m).find(f => f.jenis === j) || {}).huraian || j
  });
}

/* Satu baris per murid Tingkatan 3 + cadangan elektif */
function kumpulT3(pop) {
  const peta = new Map();
  pop.filter(m => m.ting === 3).forEach(m => { if (!peta.has(m.ic)) peta.set(m.ic, m); });
  const murid = [...peta.values()].sort((a, b) =>
    a.kelasPenuh.localeCompare(b.kelasPenuh, 'ms') || a.nama.localeCompare(b.nama, 'ms'));
  const hasil = murid.map(m => ({ m, c: cadanganElektif(m) }));
  return { murid, hasil, petaC: new Map(hasil.map(h => [h.m.id, h.c])) };
}
function lsElektif(hasil, e, mod, konteks) {
  const cari = h => { const i = h.c.senarai.findIndex(x => x.e.id === e.id); return { i, x: h.c.senarai[i] }; };
  const pilih = hasil.filter(h => { const { i } = cari(h); return mod === 'pertama' ? i === 0 : (i >= 0 && i < 3); });
  const peta = new Map(pilih.map(h => [h.m.id, cari(h)]));
  return daftar(e.nama, pilih.map(h => h.m), {
    eyebrow: konteks, warna: e.warna,
    huraian: (mod === 'pertama' ? `Padanan terbaik murid ini ialah ${e.nama}. ` : `${e.nama} berada dalam tiga cadangan teratas murid ini. `) + e.perihal,
    nilai: m => peta.get(m.id).x.skor, labelNilai: 'Skor padanan',
    apa: m => { const o = peta.get(m.id);
      return `${mod !== 'pertama' ? `<span class="lencana" style="${gayaL('--rendah')}">Pilihan ${o.i + 1}</span>` : ''}`
        + `<span class="bar-mini" style="display:inline-block;width:46px"><i style="width:${o.x.skor}%;background:${wv(e.warna)}"></i></span>`
        + `<span class="lencana" style="${gayaL(e.warna)}">${o.x.skor}</span>`; },
    apaTeks: m => { const o = peta.get(m.id); return `${e.nama} — pilihan ${o.i + 1}, skor padanan ${o.x.skor}`; }
  });
}

/* ---------------------------- KOMPONEN ---------------------------------- */
function kadAngka(lbl, nilai, nota, warna, ikon, key) {
  const nombor = typeof nilai === 'number' || /^\d+(\.\d+)?$/.test(String(nilai));
  const isi = nombor ? `<span data-kira="${nilai}">${nilai}</span>` : nilai;
  let mini = '';
  const s = key && SENARAI[key];
  if (s) {
    const kump = {};
    s.murid.forEach(m => kump[m.kelasPenuh] = (kump[m.kelasPenuh] || 0) + 1);
    const kls = Object.keys(kump).sort((a, b) => a.localeCompare(b, 'ms', { numeric:true }));
    if (kls.length >= 2 && kls.length <= 24) {
      const maks = Math.max(...Object.values(kump));
      mini = `<span class="mini" title="Taburan mengikut kelas">${kls.map((k, j) =>
        `<i style="height:${Math.max(10, kump[k] / maks * 100)}%;--j:${j}" class="${kump[k] === maks ? 'puncak' : ''}" title="${esc(k)}: ${kump[k]}"></i>`).join('')}</span>`;
    }
  }
  const tag = s ? 'button' : 'div';
  const atr = s ? `type="button" data-senarai="${key}" aria-label="${esc(lbl)} — lihat senarai murid"` : '';
  return `<${tag} class="angka${s ? ' klik' : ''}" style="--w:${wv(warna)}" ${atr}>
    <span class="cahaya"></span>
    <span class="angka-atas"><span class="cip-ikon">${ikon || ''}</span><span class="lbl">${esc(lbl)}</span>${s ? `<span class="anak">${PANAH}</span>` : ''}</span>
    <span class="angka-bawah"><span class="nilai${nombor ? '' : ' teks'}">${isi}</span>${mini}</span>
    <span class="nota" style="display:block">${nota || ''}</span>
  </${tag}>`;
}

function tajukBlok(mata, h1, perihal, kanan = '') {
  return `<div class="tajuk-blok${kanan ? ' dua' : ''}"><div>
    <span class="mata">${mata}</span>
    <h1>${h1}</h1>
    ${perihal ? `<p class="perihal">${perihal}</p>` : ''}
  </div>${kanan}</div>`;
}

function kepalaKad(tajuk, sub, petua) {
  return `<div class="kad-kepala"><div><h2>${tajuk}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${petua ? `<span class="petua">${petua}</span>` : ''}</div>`;
}
const PETUA_KLIK = 'Klik untuk senarai';

/* ---------------------------- GRAF ------------------------------------- */
function barMelintang(data, opt = {}) {
  const maks = opt.maks || Math.max(1, ...data.map(d => d.nilai));
  const lbl = Math.min(opt.lblW || 130, 210);
  return `<div class="bar-h" style="--lbl:${lbl}px" aria-label="${esc(opt.alt || 'Graf bar')}">${data.map((d, i) => {
    const p = d.nilai > 0 ? Math.max(2, d.nilai / maks * 100) : 0;
    const k = d.senarai, tag = k ? 'button' : 'div';
    const nilai = `${d.teks ?? d.nilai}${opt.unit || ''}`;
    const atr = k ? `type="button" data-senarai="${k}" aria-label="${esc(d.label)}: ${nilai} — lihat senarai murid"` : '';
    return `<${tag} class="bh-baris${k ? ' klik' : ''}" style="--n:${i}" ${atr} title="${esc(d.label)}: ${nilai}${k ? ' · klik untuk senarai murid' : ''}">
      <span class="bh-lbl">${esc(d.label)}</span>
      <span class="bh-trek"><i style="width:${p.toFixed(1)}%;--w:${wv(d.warna || '--brand')}"></i></span>
      <span class="bh-nilai">${nilai}</span>${k ? CHEVRON : '<span></span>'}
    </${tag}>`;
  }).join('')}</div>`;
}

function heksagon(skor, opt = {}) {
  const R = opt.r || 108, pad = opt.pad ?? 56;
  const W = (R + pad) * 2, cx = W / 2, cy = W / 2;
  const maks = opt.maks || 30;
  const susunan = ['R','I','A','S','E','K'];
  const titik = (i, f) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; };
  const f1 = n => n.toFixed(1);
  let g = `<defs><linearGradient id="gh-isi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".28"/><stop offset="1" stop-color="var(--brand2)" stop-opacity=".12"/></linearGradient></defs>`;
  [0.25, 0.5, 0.75, 1].forEach((f, idx) => {
    const p = susunan.map((_, i) => titik(i, f).map(f1).join(',')).join(' ');
    g += `<polygon points="${p}" fill="${idx === 3 ? 'var(--papan2)' : 'none'}" fill-opacity=".7" stroke="var(--garis)" stroke-width="1"${idx === 3 ? '' : ' stroke-dasharray="3 4"'}/>`;
  });
  susunan.forEach((_, i) => { const [x, y] = titik(i, 1); g += `<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="var(--garis)" stroke-width="1"/>`; });
  const ada = susunan.map((k, i) => ({ k, i, v: skor[k] || 0 })).filter(o => o.v > 0);
  if (ada.length >= 2) {
    const p = ada.map(o => titik(o.i, Math.min(1, o.v / maks)).map(f1).join(',')).join(' ');
    g += `<polygon class="heks-poli" points="${p}" fill="url(#gh-isi)" stroke="var(--brand)" stroke-width="2.4" stroke-linejoin="round"/>`;
  }
  susunan.forEach((k, i) => {
    const h = HMAP[k], v = skor[k] || 0, hidup = v > 0;
    const [lx, ly] = titik(i, 1.31), [sx, sy] = titik(i, Math.min(1, v / maks)), b = titik(i, 1.06), sasar = titik(i, 1.2);
    if (hidup) g += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="5.5" fill="${wv(h.warna)}" stroke="var(--papan)" stroke-width="2.2"/>`;
    const key = opt.senarai ? opt.senarai(k) : null;
    g += key ? `<g class="klik-svg" data-senarai="${key}" tabindex="0" role="button" aria-label="${h.nama} — lihat senarai murid">` : '<g>';
    if (key) g += `<circle class="sasar" cx="${f1(sasar[0])}" cy="${f1(sasar[1])}" r="31" fill="transparent" stroke="transparent"/>`;
    g += `<circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="12" fill="${hidup ? wv(h.warna) : 'var(--papan3)'}"/>`;
    g += `<text x="${f1(b[0])}" y="${f1(b[1] + 4)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" font-weight="700" fill="${hidup ? '#fff' : 'var(--dakwat3)'}">${k}</text>`;
    g += `<text x="${f1(lx)}" y="${f1(ly - 1)}" text-anchor="middle" font-size="10.5" font-weight="650" fill="${hidup ? 'var(--dakwat)' : 'var(--dakwat3)'}">${h.nama}</text>`;
    g += `<text x="${f1(lx)}" y="${f1(ly + 11)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="700" fill="${hidup ? wv(h.warna) : 'var(--dakwat3)'}">${hidup ? v : '—'}</text></g>`;
  });
  if (opt.tengah) {
    g += `<text x="${cx}" y="${cy - 3}" text-anchor="middle" style="font-family:var(--papar);font-weight:760;letter-spacing:-1px" font-size="27" fill="var(--dakwat)">${esc(opt.tengah)}</text>`;
    if (opt.tengahLbl) g += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9" font-weight="650" letter-spacing="1.4" fill="var(--dakwat3)">${esc(opt.tengahLbl)}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${W}" class="hero-heks" role="img" aria-label="Heksagon Holland" style="max-width:${W}px;margin:0 auto">${g}</svg>`;
}

function kipas(skor, opt = {}) {
  const dlm = opt.dlm || 46, luar = opt.luar || 118, pad = opt.pad || 62;
  const W = (luar + pad) * 2, cx = W / 2, cy = W / 2;
  const kunci = opt.kunci || KUNCI, peta = opt.peta || KMAP;
  const maks = opt.maks || (opt.jenis === 'IKP' ? 100 : 99);
  const n = kunci.length, lebar = 360 / n, jrk = 2.6;
  let g = '';
  (opt.jenis === 'IKP' ? [25, 50, 75, 100] : [30, 40, 60, 70, 99]).forEach(v => {
    const rr = dlm + (luar - dlm) * (v / maks);
    g += `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(1)}" fill="none" stroke="var(--garis)" stroke-width="1" stroke-dasharray="2 4"/>`;
  });
  g += `<circle cx="${cx}" cy="${cy}" r="${dlm}" fill="var(--papan)" stroke="var(--garis)"/>`;
  kunci.forEach((k, i) => {
    const v = skor[k] ?? 0, t = tahap(v, opt.jenis), kk = peta[k];
    const wr = (kk.songsang && v >= (k === 'KD' ? 80 : 50)) ? '--waspada' : t.warna;
    const a0 = (-90 + i * lebar + jrk / 2) * Math.PI / 180, a1 = (-90 + (i + 1) * lebar - jrk / 2) * Math.PI / 180;
    const rr = dlm + (luar - dlm) * (v / maks);
    const P = (r, a) => [(cx + Math.cos(a) * r).toFixed(1), (cy + Math.sin(a) * r).toFixed(1)];
    const [x1, y1] = P(dlm, a0), [x2, y2] = P(rr, a0), [x3, y3] = P(rr, a1), [x4, y4] = P(dlm, a1);
    const key = opt.senarai ? opt.senarai(k) : null;
    g += `<path class="kipas-seg${key ? ' klik-svg' : ''}" style="--n:${i};transform-origin:${cx}px ${cy}px"${key ? ` data-senarai="${key}" tabindex="0" role="button" aria-label="${esc(kk.nama)} — lihat senarai murid"` : ''} d="M${x1} ${y1} L${x2} ${y2} A${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 1 ${x3} ${y3} L${x4} ${y4} A${dlm} ${dlm} 0 0 0 ${x1} ${y1} Z" fill="${wv(wr)}" fill-opacity=".88"><title>${kk.nama} — ${v}% (${t.nama})${key ? ' · klik untuk senarai' : ''}</title></path>`;
    const am = (a0 + a1) / 2, [lx, ly] = P(luar + 21, am);
    g += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="9.5"><tspan font-weight="700" fill="var(--dakwat2)">${k}</tspan><tspan dx="4" fill="${wv(wr)}">${v}</tspan></text>`;
  });
  if (opt.tengah) {
    g += `<text x="${cx}" y="${cy - 1}" text-anchor="middle" style="font-family:var(--papar);font-weight:760;letter-spacing:-.8px" font-size="20" fill="var(--dakwat)">${esc(opt.tengah)}</text>`;
    g += `<text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="8.5" font-weight="650" letter-spacing="1.2" fill="var(--dakwat3)">${esc(opt.tengahLbl || '')}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${W}" class="hero-heks" role="img" aria-label="Kipas konstruk" style="max-width:${W}px;margin:0 auto">${g}</svg>`;
}

function barMenegak(kump, siri, opt = {}) {
  const W = opt.w || 620, H = opt.h || 240, kiri = 34, bawah = 44, atas = 14;
  const maks = opt.maks || Math.max(1, ...siri.flatMap(s => s.nilai));
  const lebarKump = (W - kiri - 10) / kump.length;
  const lebarBar = Math.min(26, (lebarKump - 10) / siri.length);
  let g = '';
  for (let t = 0; t <= 4; t++) {
    const v = maks * t / 4, y = atas + (H - atas - bawah) * (1 - t / 4);
    g += `<line x1="${kiri}" y1="${y.toFixed(1)}" x2="${W - 6}" y2="${y.toFixed(1)}" stroke="var(--garis)" stroke-width="1" stroke-dasharray="2 4"/>`;
    g += `<text x="${kiri - 6}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-family="ui-monospace,monospace" font-size="9.5" fill="var(--dakwat3)">${Math.round(v)}</text>`;
  }
  let n = 0;
  kump.forEach((nama, i) => {
    const x0 = kiri + i * lebarKump;
    siri.forEach((s, j) => {
      const v = s.nilai[i] || 0, h = (H - atas - bawah) * (v / maks);
      const x = x0 + (lebarKump - lebarBar * siri.length) / 2 + j * lebarBar;
      const key = v && opt.senarai ? opt.senarai(i, j) : null;
      g += key ? `<g class="klik-svg" data-senarai="${key}" tabindex="0" role="button" aria-label="${esc(nama)} ${esc(s.nama)}: ${v} — lihat senarai">` : '<g>';
      g += `<rect class="bm-rect" style="--n:${n++}" x="${x.toFixed(1)}" y="${(H - bawah - h).toFixed(1)}" width="${(lebarBar - 3).toFixed(1)}" height="${Math.max(1, h).toFixed(1)}" rx="4" fill="${wv(s.warna)}"><title>${esc(nama)} — ${esc(s.nama)}: ${v}${key ? ' · klik untuk senarai' : ''}</title></rect></g>`;
    });
    g += `<text x="${(x0 + lebarKump / 2).toFixed(1)}" y="${H - bawah + 16}" text-anchor="middle" font-size="10.5" font-weight="650" fill="var(--dakwat2)">${esc(nama)}</text>`;
  });
  g += `<line x1="${kiri}" y1="${H - bawah}" x2="${W - 6}" y2="${H - bawah}" stroke="var(--dakwat3)" stroke-width="1"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;min-width:${Math.min(W, 560)}px" role="img" aria-label="${esc(opt.alt || 'Graf bar menegak')}">${g}</svg>`;
}

function petaHaba(barisNama, lajurNama, nilai, opt = {}) {
  const lblW = 96, sel = opt.sel || 31, kepalaH = 30;
  const W = lblW + lajurNama.length * sel + 6, H = kepalaH + barisNama.length * sel + 6;
  const maks = opt.maks || 99, min = opt.min || 0;
  let g = '';
  lajurNama.forEach((c, j) => {
    g += `<text x="${(lblW + j * sel + sel / 2).toFixed(1)}" y="${kepalaH - 9}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" font-weight="700" fill="var(--dakwat2)">${esc(c)}</text>`;
  });
  barisNama.forEach((r, i) => {
    g += `<text x="${lblW - 8}" y="${(kepalaH + i * sel + sel / 2 + 3.5).toFixed(1)}" text-anchor="end" font-size="11" font-weight="650" fill="var(--dakwat2)">${esc(r)}</text>`;
    lajurNama.forEach((c, j) => {
      const v = nilai[i][j], f = Math.max(0, Math.min(1, (v - min) / (maks - min))), t = tahap(v, opt.jenis);
      const key = opt.senarai ? opt.senarai(i, j) : null;
      g += key ? `<g class="klik-svg" data-senarai="${key}" tabindex="0" role="button" aria-label="${esc(r)} ${esc(c)}: ${v} — lihat senarai">` : '<g>';
      g += `<rect x="${(lblW + j * sel).toFixed(1)}" y="${(kepalaH + i * sel).toFixed(1)}" width="${sel - 3}" height="${sel - 3}" rx="6" fill="${wv(t.warna)}" fill-opacity="${(0.16 + f * 0.84).toFixed(2)}"><title>${esc(r)} — ${esc(c)}: ${v}${key ? ' · klik untuk senarai' : ''}</title></rect>`;
      g += `<text x="${(lblW + j * sel + (sel - 3) / 2).toFixed(1)}" y="${(kepalaH + i * sel + (sel - 3) / 2 + 3.5).toFixed(1)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8.5" font-weight="700" fill="${f > 0.55 ? '#fff' : 'var(--dakwat)'}" pointer-events="none">${Math.round(v)}</text></g>`;
    });
  });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;min-width:${W}px" role="img" aria-label="${esc(opt.alt || 'Peta haba')}">${g}</svg>`;
}

/* ======================================================================== */
/*                               PAPAN UTAMA                                 */
/* ======================================================================== */
function salamMasa() {
  const j = Number(new Intl.DateTimeFormat('en-GB', { timeZone: CONFIG.ZON, hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
  return j < 5 ? 'Selamat malam' : j < 12 ? 'Selamat pagi' : j < 14 ? 'Selamat tengah hari' : j < 19 ? 'Selamat petang' : 'Selamat malam';
}

function vPapan() {
  const semua = S.cari.trim() ? tapis({ jenis: true, ting: true, kelas: true, jantina: true, kod: true }) : S.murid;
  const imk = semua.filter(m => m.jenis === 'IMK'), itp = semua.filter(m => m.jenis === 'ITP'), ikp = semua.filter(m => m.jenis === 'IKP');
  const bendera = semua.filter(m => isyarat(m).length);
  const kelasBil = new Set(semua.map(m => m.kelasPenuh)).size;
  const { murid: t3, hasil } = kumpulT3(semua);
  const ctx = 'Papan Utama';

  const komposit = {};
  HOLLAND.forEach(h => { const v = imk.filter(m => m.skor[h.k] > 0).map(m => m.skor[h.k]); komposit[h.k] = v.length ? Math.round(purata(v) * 10) / 10 : 0; });
  const kerapDom = HOLLAND.map(h => ({ label: `${h.k} · ${h.nama}`, nilai: imk.filter(m => m.dominan === h.k).length, warna: h.warna,
    senarai: lsBidang(imk, h.k, 'dominan', `${ctx} · Bidang dominan`) })).sort((a, b) => b.nilai - a.nilai);
  const kerapAda = HOLLAND.map(h => ({ label: h.nama, nilai: imk.filter(m => (m.kod || '').includes(h.k)).length, warna: h.warna,
    senarai: lsBidang(imk, h.k, 'ada', `${ctx} · Bidang dalam tiga mata`) })).sort((a, b) => b.nilai - a.nilai);
  const purITP = KUNCI.map(k => { const p = Math.round(purata(itp.map(m => m.skor[k])) * 10) / 10;
    return { label: `${k} · ${KMAP[k].nama}`, nilai: p, warna: KMAP[k].songsang ? '--waspada' : tahap(p).warna,
      senarai: lsKonstruk(itp, k, 'ITP', `${ctx} · Konstruk ITP`) }; }).sort((a, b) => b.nilai - a.nilai);
  const purIKP = KUNCI_IKP.map(k => { const p = ikp.length ? Math.round(purata(ikp.map(m => m.skor[k])) * 10) / 10 : 0;
    return { label: `${k} · ${CMAP[k].nama}`, nilai: p, warna: tahap(p, 'IKP').warna,
      senarai: lsKonstruk(ikp, k, 'IKP', `${ctx} · Domain IKP`) }; }).sort((a, b) => b.nilai - a.nilai);
  const kodTop = Object.entries(imk.reduce((o, m) => { if (m.kod) o[m.kod] = (o[m.kod] || 0) + 1; return o; }, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 9);

  const kSemua = daftar('Semua rekod', semua, { eyebrow: ctx, huraian: 'Semua rekod daripada tiga instrumen. Murid Tingkatan 3 muncul dua kali kerana mereka menduduki IMK dan IKP.' });
  const kIMK = daftar('Inventori Minat Kerjaya', imk, { eyebrow: ctx, warna: '--s', huraian: 'Rekod IMK Tingkatan 1, 3 dan 5.' });
  const kITP = daftar('Inventori Tret Personaliti', itp, { eyebrow: ctx, warna: '--i', huraian: 'Rekod ITP Tingkatan 2 dan 4.', nilai: m => m.purata, labelNilai: 'Purata' });
  const kIKP = daftar('Inventori Kecerdasan Pelbagai', ikp, { eyebrow: ctx, warna: '--k', huraian: 'Rekod IKP Tingkatan 3.', nilai: m => m.purata, labelNilai: 'Purata' });
  const kBendera = daftar('Perlu perhatian', bendera, { eyebrow: ctx, warna: '--waspada',
    huraian: 'Murid yang memenuhi sekurang-kurangnya satu kriteria isyarat. Ini titik permulaan perbincangan, bukan diagnosis.',
    nilai: m => isyarat(m).length, labelNilai: 'Bil. isyarat',
    apa: m => isyarat(m).slice(0, 2).map(f => `<span class="lencana" style="${gayaL(f.aras === 'waspada' ? '--waspada' : '--sederhana')}">${esc(f.jenis)}</span>`).join('') + (isyarat(m).length > 2 ? `<span class="lencana" style="${gayaL('--rendah')}">+${isyarat(m).length - 2}</span>` : ''),
    apaTeks: m => isyarat(m).map(f => f.jenis).join('; ') });

  const barT3 = ELEKTIF.map(e => ({ label: e.nama, nilai: hasil.filter(h => h.c.senarai[0] && h.c.senarai[0].e.id === e.id).length,
    warna: e.warna, senarai: lsElektif(hasil, e, 'pertama', `${ctx} · Cadangan pertama`) })).sort((a, b) => b.nilai - a.nilai);

  if (S.cari.trim() && !semua.length) return `
  ${tajukBlok(`${salamMasa()} &middot; PPSi ${DATA.meta.tahun}`, 'Semakan psikometrik <em>seluruh sekolah</em>', '')}
  ${barisCari()}
  <div class="kad">${jadualKosong(`Tiada rekod sepadan dengan “${S.cari.trim()}”. Cuba nama, kelas (contoh: 3 Bestari), kod Holland (SKR) atau konstruk (kepimpinan tinggi).`)}</div>`;
  return `
  ${tajukBlok(`${salamMasa()} &middot; PPSi ${DATA.meta.tahun}`, 'Semakan psikometrik <em>seluruh sekolah</em>',
    `${esc(DATA.meta.sekolah)}. ${semua.length} rekod daripada tiga instrumen. <b>Klik mana-mana angka, bar atau kod</b> untuk melihat murid di sebaliknya.`,
    `<button class="ikon-btn utama-btn" data-pergi-cepat="elektif">Cadangan elektif ${PANAH}</button>`)}
  ${barisCari()}

  <div class="grid g5" style="margin-bottom:16px">
    ${kadAngka('Jumlah rekod', semua.length, `${kelasBil} kelas &middot; T${[...new Set(semua.map(m => m.ting))].sort().join(', T')}`, '--brand', IKON.murid, kSemua)}
    ${kadAngka('Minat Kerjaya (IMK)', imk.length, `${imk.filter(m => m.status === 'DITAKSIR').length} ditaksir &middot; T1, T3, T5`, '--s', IKON.heks, kIMK)}
    ${kadAngka('Tret Personaliti (ITP)', itp.length, `${KUNCI.length} konstruk &middot; T2, T4`, '--i', IKON.bintang, kITP)}
    ${kadAngka('Kecerdasan Pelbagai', ikp.length, `${KUNCI_IKP.length} domain &middot; Tingkatan 3`, '--k', IKON.kelas, kIKP)}
    ${kadAngka('Perlu perhatian', bendera.length, `${Math.round(bendera.length / Math.max(1, semua.length) * 100)}% daripada semua rekod`, '--waspada', IKON.awas, kBendera)}
  </div>

  ${t3.length ? `<div class="kad-gelap" style="margin-bottom:16px">
    <div>
      <span class="label-hidup"><i class="nadi"></i>Tindakan seterusnya &middot; Tingkatan 3</span>
      <div class="besar"><span data-kira="${t3.length}">${t3.length}</span><em>murid</em></div>
      <p>perlu memilih elektif Tingkatan 4. Padanan minat (IMK) dan kecerdasan (IKP) mereka sudah dikira untuk lapan elektif — klik mana-mana elektif untuk melihat siapa.</p>
      <button class="btn-neon" data-pergi-cepat="elektif">Buka cadangan elektif ${PANAH}</button>
    </div>
    <div class="monitor">
      <div class="monitor-tajuk"><span>Cadangan pertama</span><span>${PETUA_KLIK}</span></div>
      ${barMelintang(barT3, { lblW: 170, alt: 'Taburan cadangan elektif pertama' })}
    </div>
  </div>` : ''}

  <div class="grid g-hero" style="margin-bottom:16px">
    <div class="hero">
      <div class="hero-atas">${kepalaKad('Heksagon Holland sekolah', 'Purata skor setiap bidang. Klik huruf untuk senarai murid yang mempunyai bidang itu.', PETUA_KLIK)}</div>
      ${heksagon(komposit, { r: 104, tengah: String(imk.length), tengahLbl: 'REKOD IMK', senarai: k => lsBidang(imk, k, 'ada', `${ctx} · Heksagon Holland`) })}
      <div style="padding:0 20px 18px">${petunjukHolland()}
        <div class="info" style="margin:14px 0 0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.3"/></svg>
        <p>Laporan PPSi hanya memaparkan <b>tiga mata Holland tertinggi</b> setiap murid. Bidang tanpa skor ditanda &ldquo;—&rdquo; kerana nilainya tidak diterbitkan, bukan bermakna sifar.</p></div></div>
    </div>
    <div style="display:grid;gap:16px;align-content:start">
      <div class="kad">${kepalaKad('Bidang dominan', 'Huruf pertama kod Holland setiap murid.', PETUA_KLIK)}
        ${barMelintang(kerapDom, { lblW: 126, alt: 'Kekerapan bidang dominan' })}</div>
      <div class="kad">${kepalaKad('Kod Holland terkerap', 'Gabungan tiga mata yang paling banyak berulang.', PETUA_KLIK)}
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${kodTop.map(([k, n]) => `<button class="cip" data-senarai="${daftar(`Kod ${k}`, imk.filter(m => m.kod === k), {
            eyebrow: `${ctx} · Kod Holland`, warna: HMAP[k[0]].warna,
            huraian: `Murid dengan kod ${k}: ${[...k].map(c => HMAP[c].nama).join(', ')}.`,
            nilai: m => m.indeks, labelNilai: 'Indeks',
            apa: m => `${kodHeks(m.kod)}<span class="lencana" style="${gayaL(kategoriIndeks(m.indeks).warna)}">Indeks ${m.indeks}</span>` })}" style="gap:8px;padding:6px 10px 6px 7px">${kodHeks(k)} <b class="mono">${n}</b></button>`).join('')}
        </div></div>
    </div>
  </div>

  <div class="grid g3">
    <div class="kad">${kepalaKad('Bidang dalam tiga mata', 'Berapa ramai murid mempunyai bidang ini dalam kod mereka.', PETUA_KLIK)}
      ${barMelintang(kerapAda, { lblW: 110, alt: 'Kekerapan bidang' })}</div>
    <div class="kad">${kepalaKad('Purata 15 konstruk ITP', 'Klik konstruk untuk melihat murid disusun ikut skor.', PETUA_KLIK)}
      ${barMelintang(purITP, { lblW: 150, maks: 99, unit: '%', alt: 'Purata konstruk ITP' })}${petunjukTahap()}</div>
    <div class="kad">${kepalaKad('Purata 10 domain IKP', 'Profil kecerdasan pelbagai murid Tingkatan 3.', PETUA_KLIK)}
      ${ikp.length ? barMelintang(purIKP, { lblW: 172, maks: 100, unit: '%', alt: 'Purata domain IKP' }) + petunjukIKP()
        : '<p style="font-size:12.5px;color:var(--dakwat3)">Tiada rekod IKP dalam data semasa.</p>'}</div>
  </div>`;
}

/* ======================================================================== */
/*                         INVENTORI MINAT KERJAYA                           */
/* ======================================================================== */
function thSusun(medan, teks, kls = '') {
  return `<th class="boleh ${kls}"${S.susun.medan === medan ? ` data-arah="${S.susun.arah}"` : ''} data-susun="${medan}">${teks} <span class="ar">${S.susun.medan === medan ? (S.susun.arah > 0 ? '▲' : '▼') : '⇅'}</span></th>`;
}
function kepalaJadual(tajuk, sub, n, unit = 'baris') {
  return `<div style="padding:16px 18px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
    <div><h2>${tajuk}</h2><p style="margin:2px 0 0;font-size:12.5px;color:var(--dakwat3)">${sub}</p></div>
    <span class="lencana" style="background:var(--papan3);color:var(--dakwat2)">${n} ${unit}</span></div>`;
}

function vIMK() {
  const simpanJenis = S.jenis; S.jenis = 'IMK';
  const senarai = susun(tapis({ jenis: true })).filter(m => m.jenis === 'IMK');
  S.jenis = simpanJenis;
  const ctx = 'Minat Kerjaya';
  const ditaksir = senarai.filter(m => m.status === 'DITAKSIR');
  const komposit = {};
  HOLLAND.forEach(h => { const v = ditaksir.filter(m => m.skor[h.k] > 0).map(m => m.skor[h.k]); komposit[h.k] = v.length ? Math.round(purata(v) * 10) / 10 : 0; });
  const kerapDom = HOLLAND.map(h => ({ k: h.k, label: h.nama, nilai: ditaksir.filter(m => m.dominan === h.k).length, warna: h.warna,
    senarai: lsBidang(ditaksir, h.k, 'dominan', `${ctx} · Bidang dominan`) })).sort((a, b) => b.nilai - a.nilai);
  const idx = ditaksir.map(m => m.indeks);
  const lsIndeks = (tajuk, arr, w, hur) => daftar(tajuk, arr, { eyebrow: `${ctx} · Kejelasan minat`, warna: w, huraian: hur,
    nilai: m => m.indeks, labelNilai: 'Indeks',
    apa: m => `${kodHeks(m.kod)}<span class="lencana" style="${gayaL(kategoriIndeks(m.indeks).warna)}">Indeks ${m.indeks}</span>`,
    apaTeks: m => `Kod ${m.kod}, indeks perbezaan ${m.indeks}` });
  const jelas = ditaksir.filter(m => m.indeks >= 10), sed = ditaksir.filter(m => m.indeks >= 5 && m.indeks < 10), kurang = ditaksir.filter(m => m.indeks <= 4);
  const kKurang = lsIndeks('Minat kurang jelas', kurang, '--waspada', 'Indeks perbezaan 4 dan ke bawah — minat kerjaya belum terarah. Sesuai untuk sesi bimbingan kerjaya.');
  const t = kerapDom[0];

  return `
  ${tajukBlok('Instrumen 1 &middot; IMK', 'Inventori <em>Minat Kerjaya</em>',
    'Kecenderungan minat kerjaya berdasarkan enam bidang Holland — R, I, A, S, E dan K. Setiap murid menerima kod tiga huruf bagi tiga bidang tertinggi.')}
  ${barisTapis({ jenis: false, kod: true })}

  <div class="grid g4" style="margin-bottom:16px">
    ${kadAngka('Rekod dipaparkan', senarai.length, `daripada ${S.murid.filter(m => m.jenis === 'IMK').length} rekod IMK`, '--brand', IKON.murid,
      daftar('Rekod IMK dipaparkan', senarai, { eyebrow: ctx, warna: '--s' }))}
    ${kadAngka('Bidang paling dominan', t && t.nilai ? esc(t.label) : '—', `${t ? t.nilai : 0} murid`, t ? t.warna : '--s', IKON.heks, t && t.nilai ? t.senarai : null)}
    ${kadAngka('Purata indeks perbezaan', idx.length ? Math.round(purata(idx) * 10) / 10 : '—', 'Semakin tinggi, semakin jelas minat', '--i', IKON.bintang,
      lsIndeks('Indeks perbezaan', ditaksir, '--i', 'Semua murid disusun ikut indeks perbezaan — skor Holland tertinggi tolak terendah.'))}
    ${kadAngka('Minat kurang jelas', kurang.length, 'Indeks perbezaan 4 dan ke bawah', '--waspada', IKON.awas, kKurang)}
  </div>

  <div class="grid g-hero" style="margin-bottom:16px">
    <div class="kad">${kepalaKad('Profil kumpulan terpilih', `Purata skor Holland bagi ${ditaksir.length} rekod. Klik huruf untuk senarai.`, PETUA_KLIK)}
      ${heksagon(komposit, { r: 100, tengah: String(ditaksir.length), tengahLbl: 'MURID', senarai: k => lsBidang(ditaksir, k, 'ada', `${ctx} · Heksagon`) })}
      ${petunjukHolland()}</div>
    <div style="display:grid;gap:16px;align-content:start">
      <div class="kad">${kepalaKad('Sebaran bidang dominan', '', PETUA_KLIK)}
        ${barMelintang(kerapDom, { lblW: 116, alt: 'Sebaran bidang dominan' })}</div>
      <div class="kad">${kepalaKad('Kejelasan minat', 'Berdasarkan indeks perbezaan.', PETUA_KLIK)}
        ${barMelintang([
          { label: 'Minat jelas (≥10)', nilai: jelas.length, warna: '--tinggi', senarai: lsIndeks('Minat jelas', jelas, '--tinggi', 'Indeks perbezaan 10 dan ke atas — kecenderungan minat yang jelas.') },
          { label: 'Sederhana (5–9)', nilai: sed.length, warna: '--sederhana', senarai: lsIndeks('Minat sederhana', sed, '--sederhana', 'Indeks perbezaan 5 hingga 9.') },
          { label: 'Kurang jelas (≤4)', nilai: kurang.length, warna: '--waspada', senarai: kKurang }
        ], { lblW: 136, alt: 'Kejelasan minat' })}</div>
    </div>
  </div>

  <div class="kad" style="padding:0;overflow:hidden">
    ${kepalaJadual('Senarai murid', 'Klik baris untuk profil penuh dan heksagon individu.', senarai.length)}
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${senarai.length ? `<table><thead><tr>
        ${thSusun('nama', 'Nama murid')}${thSusun('kelasPenuh', 'Kelas')}<th class="tengah">J</th>${thSusun('kod', 'Kod')}
        ${HOLLAND.map(h => `<th class="boleh tengah"${S.susun.medan === 'h:' + h.k ? ` data-arah="${S.susun.arah}"` : ''} data-susun="h:${h.k}" title="${esc(h.nama)}" style="color:${wv(h.warna)}">${h.k}</th>`).join('')}
        ${thSusun('indeks', 'Indeks', 'tengah')}<th>Bidang utama</th>${thSusun('tarikh', 'Tarikh')}
      </tr></thead><tbody>
      ${senarai.map(m => `<tr data-id="${esc(m.id)}">
        <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td>
        <td>${esc(m.kelasPenuh)}</td><td class="tengah mono">${m.jantina}</td>
        <td>${m.status === 'DITAKSIR' ? kodHeks(m.kod) : `<span class="lencana" style="${gayaL('--waspada')}">TD</span>`}</td>
        ${HOLLAND.map(h => { const v = m.skor[h.k] || 0;
          return v ? `<td class="sel-skor"><span class="sk s-${h.k}" style="--o:${(0.12 + v / 30 * 0.42).toFixed(2)}">${v}</span></td>` : `<td class="sel-skor"><span class="sk sk-kosong">—</span></td>`; }).join('')}
        <td class="tengah mono" style="font-weight:700;color:${wv(kategoriIndeks(m.indeks).warna)}">${m.status === 'DITAKSIR' ? m.indeks : '—'}</td>
        <td style="font-size:12px;color:var(--dakwat2)">${m.status === 'DITAKSIR' ? esc((m.bidang || [])[0] || '') : esc(m.sebab || 'Tidak ditaksir')}</td>
        <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td>
      </tr>`).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                       INVENTORI TRET PERSONALITI                          */
/* ======================================================================== */
function vITP() {
  const simpanJenis = S.jenis; S.jenis = 'ITP';
  const senarai = susun(tapis({ jenis: true })).filter(m => m.jenis === 'ITP');
  S.jenis = simpanJenis;
  const ctx = 'Tret Personaliti';
  const purataK = {};
  KUNCI.forEach(k => purataK[k] = senarai.length ? Math.round(purata(senarai.map(m => m.skor[k]))) : 0);
  const barK = KUNCI.map(k => ({ k, label: `${k} · ${KMAP[k].nama}`, nilai: purataK[k],
    warna: KMAP[k].songsang ? '--waspada' : tahap(purataK[k]).warna, senarai: lsKonstruk(senarai, k, 'ITP', `${ctx} · Purata konstruk`) }));
  const kelasList = [...new Set(senarai.map(m => m.kelasPenuh))].sort();
  const matriks = kelasList.map(kl => KUNCI.map(k => Math.round(purata(senarai.filter(m => m.kelasPenuh === kl).map(m => m.skor[k])))));
  const kd = senarai.filter(m => m.skor.KD >= 80), ktn = senarai.filter(m => m.skor.KTN >= 50);
  const atas = barK.filter(b => !KMAP[b.k].songsang).sort((a, b) => b.nilai - a.nilai)[0];

  return `
  ${tajukBlok('Instrumen 2 &middot; ITP', 'Inventori <em>Tret Personaliti</em>',
    'Lima belas konstruk dalam peratus. Tafsiran PPSi: 70–99% tinggi, 40–60% sederhana, 1–30% rendah. Kritik Diri dan Ketelusan dibaca secara songsang.')}
  ${barisTapis({ jenis: false })}

  <div class="grid g4" style="margin-bottom:16px">
    ${kadAngka('Rekod dipaparkan', senarai.length, `daripada ${S.murid.filter(m => m.jenis === 'ITP').length} rekod ITP`, '--brand', IKON.murid,
      daftar('Rekod ITP dipaparkan', senarai, { eyebrow: ctx, warna: '--i', nilai: m => m.purata, labelNilai: 'Purata' }))}
    ${kadAngka('Konstruk tertinggi', atas ? esc(KMAP[atas.k].nama) : '—', `purata ${atas ? atas.nilai : 0}%`, '--tinggi', IKON.bintang, atas ? atas.senarai : null)}
    ${kadAngka('Kritik diri ≥ 80%', kd.length, 'Cadangan rujuk guru kaunseling', '--waspada', IKON.awas, lsIsyarat(kd, 'Kritik diri tinggi', ctx))}
    ${kadAngka('Ketelusan ≥ 50%', ktn.length, 'Dapatan perlu disahkan semula', '--sederhana', IKON.awas, lsIsyarat(ktn, 'Ketelusan rendah', ctx))}
  </div>

  <div class="grid g-hero" style="margin-bottom:16px">
    <div class="kad">${kepalaKad('Kipas konstruk kumpulan', `Purata bagi ${senarai.length} rekod. Klik segmen untuk senarai.`, PETUA_KLIK)}
      ${kipas(purataK, { tengah: String(senarai.length), tengahLbl: 'REKOD', senarai: k => lsKonstruk(senarai, k, 'ITP', `${ctx} · Kipas konstruk`) })}
      ${petunjukTahap()}</div>
    <div class="kad">${kepalaKad('Purata setiap konstruk', 'Disusun mengikut skor tertinggi.', PETUA_KLIK)}
      ${barMelintang(barK.slice().sort((a, b) => b.nilai - a.nilai), { lblW: 150, maks: 99, unit: '%', alt: 'Purata konstruk' })}</div>
  </div>

  ${kelasList.length > 1 ? `<div class="kad" style="margin-bottom:16px">
    ${kepalaKad('Peta haba kelas &times; konstruk', 'Purata setiap kelas. Klik petak untuk melihat murid kelas itu.', PETUA_KLIK)}
    <div style="overflow-x:auto">${petaHaba(kelasList, KUNCI, matriks, { alt: 'Peta haba kelas lawan konstruk',
      senarai: (i, j) => lsKonstruk(senarai.filter(m => m.kelasPenuh === kelasList[i]), KUNCI[j], 'ITP', `${ctx} · Peta haba`, `${KMAP[KUNCI[j]].nama} — ${kelasList[i]}`) })}</div>
    ${petunjukTahap()}</div>` : ''}

  <div class="kad" style="padding:0;overflow:hidden">
    ${kepalaJadual('Senarai murid', 'Setiap sel berwarna mengikut tahap. Klik baris untuk profil penuh.', senarai.length)}
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${senarai.length ? `<table><thead><tr>
        ${thSusun('nama', 'Nama murid')}${thSusun('kelasPenuh', 'Kelas')}<th class="tengah">J</th>
        ${KUNCI.map(k => `<th class="boleh tengah"${S.susun.medan === 'h:' + k ? ` data-arah="${S.susun.arah}"` : ''} data-susun="h:${k}" title="${esc(KMAP[k].nama)}"${KMAP[k].songsang ? ' style="color:var(--waspada)"' : ''}>${k}</th>`).join('')}
        ${thSusun('purata', 'Purata', 'tengah')}${thSusun('tarikh', 'Tarikh')}
      </tr></thead><tbody>
      ${senarai.map(m => `<tr data-id="${esc(m.id)}">
        <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td>
        <td>${esc(m.kelasPenuh)}</td><td class="tengah mono">${m.jantina}</td>
        ${KUNCI.map(k => { const v = m.skor[k], bahaya = (k === 'KD' && v >= 80) || (k === 'KTN' && v >= 50);
          return `<td class="sel-skor"><span class="sk ${bahaya ? 'k-W' : 'k-' + tahap(v).k}${v >= 70 ? ' pekat' : ''}" style="--o:${(0.10 + v / 99 * 0.6).toFixed(2)}">${v}</span></td>`; }).join('')}
        <td class="tengah mono" style="font-weight:700">${m.purata}</td>
        <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td>
      </tr>`).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                       INVENTORI KECERDASAN PELBAGAI                       */
/* ======================================================================== */
function vIKP() {
  const simpanJ = S.jenis; S.jenis = 'IKP';
  const senarai = susun(tapis({ jenis: true })).filter(m => m.jenis === 'IKP');
  S.jenis = simpanJ;
  const ctx = 'Kecerdasan Pelbagai';
  const purataK = {};
  KUNCI_IKP.forEach(k => purataK[k] = senarai.length ? Math.round(purata(senarai.map(m => m.skor[k]))) : 0);
  const barK = KUNCI_IKP.map(k => ({ k, label: `${k} · ${CMAP[k].nama}`, nilai: purataK[k], warna: tahap(purataK[k], 'IKP').warna,
    senarai: lsKonstruk(senarai, k, 'IKP', `${ctx} · Purata domain`) }));
  const kelasList = [...new Set(senarai.map(m => m.kelasPenuh))].sort();
  const matriks = kelasList.map(kl => KUNCI_IKP.map(k => Math.round(purata(senarai.filter(m => m.kelasPenuh === kl).map(m => m.skor[k])))));
  const atas = barK.slice().sort((a, b) => b.nilai - a.nilai)[0], bawah = barK.slice().sort((a, b) => a.nilai - b.nilai)[0];
  const tanpa = senarai.filter(m => !KUNCI_IKP.some(k => m.skor[k] >= 75));

  return `
  ${tajukBlok('Instrumen 3 &middot; IKP &middot; Tingkatan 3', 'Inventori <em>Kecerdasan Pelbagai</em>',
    'Sepuluh domain kecerdasan. Tafsiran PPSi: 75–100% tinggi, 50–74% sederhana, 0–49% rendah. Digunakan bersama IMK untuk mencadangkan elektif Tingkatan 4.')}
  ${barisTapis({ jenis: false })}

  <div class="grid g4" style="margin-bottom:16px">
    ${kadAngka('Rekod dipaparkan', senarai.length, `daripada ${S.murid.filter(m => m.jenis === 'IKP').length} rekod IKP`, '--brand', IKON.murid,
      daftar('Rekod IKP dipaparkan', senarai, { eyebrow: ctx, warna: '--k', nilai: m => m.purata, labelNilai: 'Purata' }))}
    ${kadAngka('Kecerdasan tertinggi', atas ? esc(CMAP[atas.k].nama) : '—', `purata ${atas ? atas.nilai : 0}%`, '--tinggi', IKON.bintang, atas ? atas.senarai : null)}
    ${kadAngka('Paling perlu sokongan', bawah ? esc(CMAP[bawah.k].nama) : '—', `purata ${bawah ? bawah.nilai : 0}%`, '--sederhana', IKON.awas,
      bawah ? lsKonstruk(senarai, bawah.k, 'IKP', `${ctx} · Paling perlu sokongan`, null, { naik: true }) : null)}
    ${kadAngka('Tanpa domain tinggi', tanpa.length, 'tiada domain mencapai 75%', '--waspada', IKON.awas, lsIsyarat(tanpa, 'Tiada domain kecerdasan tinggi', ctx))}
  </div>

  <div class="grid g-hero" style="margin-bottom:16px">
    <div class="kad">${kepalaKad('Kipas kecerdasan kumpulan', `Purata bagi ${senarai.length} rekod. Klik segmen untuk senarai.`, PETUA_KLIK)}
      ${kipas(purataK, { kunci: KUNCI_IKP, peta: CMAP, jenis: 'IKP', tengah: String(senarai.length), tengahLbl: 'REKOD',
        senarai: k => lsKonstruk(senarai, k, 'IKP', `${ctx} · Kipas`) })}
      ${petunjukIKP()}</div>
    <div class="kad">${kepalaKad('Purata setiap domain', 'Disusun mengikut skor tertinggi.', PETUA_KLIK)}
      ${barMelintang(barK.slice().sort((a, b) => b.nilai - a.nilai), { lblW: 178, maks: 100, unit: '%', alt: 'Purata domain IKP' })}</div>
  </div>

  ${kelasList.length > 1 ? `<div class="kad" style="margin-bottom:16px">
    ${kepalaKad('Peta haba kelas &times; domain', 'Kekuatan kolektif setiap kelas. Klik petak untuk senarai.', PETUA_KLIK)}
    <div style="overflow-x:auto">${petaHaba(kelasList, KUNCI_IKP, matriks, { jenis: 'IKP', maks: 100, alt: 'Peta haba IKP',
      senarai: (i, j) => lsKonstruk(senarai.filter(m => m.kelasPenuh === kelasList[i]), KUNCI_IKP[j], 'IKP', `${ctx} · Peta haba`, `${CMAP[KUNCI_IKP[j]].nama} — ${kelasList[i]}`) })}</div>
    ${petunjukIKP()}</div>` : ''}

  <div class="kad" style="padding:0;overflow:hidden">
    ${kepalaJadual('Senarai murid', 'Klik baris untuk profil penuh dan cadangan elektif.', senarai.length)}
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${senarai.length ? `<table><thead><tr>
        ${thSusun('nama', 'Nama murid')}${thSusun('kelasPenuh', 'Kelas')}<th class="tengah">J</th>
        ${KUNCI_IKP.map(k => `<th class="boleh tengah"${S.susun.medan === 'h:' + k ? ` data-arah="${S.susun.arah}"` : ''} data-susun="h:${k}" title="${esc(CMAP[k].nama)}">${k}</th>`).join('')}
        ${thSusun('purata', 'Purata', 'tengah')}${thSusun('tarikh', 'Tarikh')}
      </tr></thead><tbody>
      ${senarai.map(m => `<tr data-id="${esc(m.id)}">
        <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td>
        <td>${esc(m.kelasPenuh)}</td><td class="tengah mono">${m.jantina}</td>
        ${KUNCI_IKP.map(k => { const v = m.skor[k];
          return `<td class="sel-skor"><span class="sk k-${tahap(v, 'IKP').k}${v >= 75 ? ' pekat' : ''}" style="--o:${(0.10 + v / 100 * 0.6).toFixed(2)}">${v}</span></td>`; }).join('')}
        <td class="tengah mono" style="font-weight:700">${m.purata}</td>
        <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td>
      </tr>`).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                       CADANGAN ELEKTIF TINGKATAN 4                        */
/* ======================================================================== */
function vElektif() {
  const asas = tapis({ jenis: true, ting: true }).filter(m => m.ting === 3);
  const { murid, hasil, petaC } = kumpulT3(asas);
  const ctx = 'Cadangan Elektif';
  const kiraPertama = e => hasil.filter(h => h.c.senarai[0] && h.c.senarai[0].e.id === e.id).length;
  const kiraTiga = e => hasil.filter(h => h.c.senarai.slice(0, 3).some(x => x.e.id === e.id)).length;
  const barPilihan = ELEKTIF.map(e => ({ e, label: e.nama, nilai: kiraPertama(e), warna: e.warna,
    senarai: lsElektif(hasil, e, 'pertama', `${ctx} · Taburan cadangan pertama`) })).sort((a, b) => b.nilai - a.nilai);
  const lengkap = hasil.filter(h => h.c.asas === 'IMK + IKP');
  const lemah = hasil.filter(h => h.c.senarai[0] && h.c.senarai[0].skor < 50);
  const apaAtas = m => { const x = (petaC.get(m.id) || { senarai: [] }).senarai[0];
    return x ? `<span class="lencana" style="${gayaL(x.e.warna)}">${esc(x.e.nama)} · ${x.skor}</span>` : '—'; };
  const teksAtas = m => { const c = petaC.get(m.id); return c ? c.senarai.slice(0, 3).map((x, i) => `${i + 1}) ${x.e.nama} ${x.skor}`).join(', ') : ''; };
  const nilaiAtas = m => { const x = (petaC.get(m.id) || { senarai: [] }).senarai[0]; return x ? x.skor : 0; };
  const atas = barPilihan[0];

  return `
  ${tajukBlok('Perancangan Tingkatan 4', 'Cadangan elektif <em>Tingkatan 4</em>',
    'Padanan antara kod Holland (IMK) dan profil kecerdasan (IKP) setiap murid Tingkatan 3 dengan lapan elektif sekolah. <b>Klik mana-mana elektif atau angka</b> untuk melihat siapa murid itu.')}

  <div class="amaran">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 9.5v5M12 17.2v.3"/></svg>
    <div><b>Cadangan, bukan penempatan</b>
    <p>Skor padanan dikira daripada minat dan kecerdasan sahaja. Ia <b>tidak mengambil kira pencapaian PT3, kuota kelas atau kelayakan mata pelajaran</b> — faktor yang sebenarnya menentukan penempatan. Bawa senarai ini ke sesi kaunseling.</p></div>
  </div>

  ${barisTapis({ jenis: false, ting: false })}

  <div class="grid g4" style="margin-bottom:16px">
    ${kadAngka('Murid Tingkatan 3', murid.length, `${new Set(murid.map(m => m.kelasPenuh)).size} kelas`, '--brand', IKON.murid,
      daftar('Murid Tingkatan 3', murid, { eyebrow: ctx, huraian: 'Setiap murid dengan cadangan elektif pertamanya. Klik nama untuk tiga cadangan penuh.',
        apa: apaAtas, apaTeks: teksAtas, nilai: nilaiAtas, labelNilai: 'Padanan teratas' }))}
    ${kadAngka('Padanan penuh', lengkap.length, 'ada kedua-dua IMK dan IKP', '--tinggi', IKON.heks,
      daftar('Padanan penuh (IMK + IKP)', lengkap.map(h => h.m), { eyebrow: ctx, warna: '--tinggi', apa: apaAtas, apaTeks: teksAtas, nilai: nilaiAtas, labelNilai: 'Padanan teratas',
        huraian: 'Murid yang mempunyai kedua-dua rekod IMK dan IKP, jadi cadangan dikira daripada minat dan kecerdasan.' }))}
    ${kadAngka('Cadangan teratas', atas && atas.nilai ? esc(atas.label) : '—', `${atas ? atas.nilai : 0} murid`, atas ? atas.warna : '--brand', IKON.bintang, atas && atas.nilai ? atas.senarai : null)}
    ${kadAngka('Padanan lemah', lemah.length, 'skor tertinggi bawah 50 — perlu temu bual', '--sederhana', IKON.awas,
      daftar('Padanan lemah', lemah.map(h => h.m), { eyebrow: ctx, warna: '--sederhana', apa: apaAtas, apaTeks: teksAtas, nilai: nilaiAtas, naik: true, labelNilai: 'Padanan teratas',
        huraian: 'Skor padanan tertinggi murid ini di bawah 50 — minat dan kecerdasannya tidak sepadan kuat dengan mana-mana elektif. Perlu temu bual.' }))}
  </div>

  <div class="grid g2" style="margin-bottom:16px">
    <div class="kad">${kepalaKad('Taburan cadangan pertama', 'Bilangan murid bagi setiap elektif sebagai padanan terbaik.', PETUA_KLIK)}
      ${barMelintang(barPilihan, { lblW: 190, alt: 'Taburan cadangan elektif' })}
      <p style="font-size:12px;color:var(--dakwat3);margin:12px 0 0">Taburan tidak sekata adalah normal — ia mencerminkan minat kohort, bukan kapasiti kelas.</p></div>
    <div class="kad">${kepalaKad('Dalam tiga cadangan teratas', 'Berapa ramai murid yang elektif ini muncul dalam tiga pilihan teratas mereka.', PETUA_KLIK)}
      ${barMelintang(ELEKTIF.map(e => ({ label: e.nama, nilai: kiraTiga(e), warna: e.warna,
        senarai: lsElektif(hasil, e, 'tiga', `${ctx} · Tiga cadangan teratas`) })).sort((a, b) => b.nilai - a.nilai), { lblW: 190, alt: 'Elektif dalam tiga teratas' })}
      <p style="font-size:12px;color:var(--dakwat3);margin:12px 0 0"><b>Cara skor dikira:</b> 55% daripada domain IKP berkaitan + 45% daripada kedudukan bidang Holland dalam kod murid. Pemberat boleh diubah dalam <code>app.js</code>.</p></div>
  </div>

  <div class="kad" style="padding:0;overflow:hidden">
    ${kepalaJadual('Cadangan setiap murid', 'Tiga padanan terbaik mengikut susunan. Klik baris untuk huraian penuh.', murid.length, 'murid')}
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${murid.length ? `<table><thead><tr>
        <th>Nama murid</th><th>Kelas</th><th class="tengah">Kod</th><th>Cadangan 1</th><th>Cadangan 2</th><th>Cadangan 3</th><th class="tengah">Asas</th>
      </tr></thead><tbody>
      ${hasil.map(({ m, c }) => {
        const p = pasangan(m), imk = m.jenis === 'IMK' ? m : (p && p.jenis === 'IMK' ? p : null);
        const sel = i => { const x = c.senarai[i]; if (!x) return '<td style="color:var(--dakwat3)">—</td>';
          return `<td><div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;font-weight:${i === 0 ? 650 : 450};min-width:128px">${esc(x.e.nama)}</span>
            <div class="bar-mini" style="width:44px"><i style="width:${x.skor}%;background:${wv(x.e.warna)}"></i></div><span class="mono" style="font-size:11px;color:var(--dakwat2)">${x.skor}</span></div></td>`; };
        return `<tr data-id="${esc(m.id)}"><td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td><td>${esc(m.kelasPenuh)}</td>
          <td class="tengah">${imk && imk.kod ? kodHeks(imk.kod) : '<span class="mono" style="color:var(--dakwat3)">—</span>'}</td>${sel(0)}${sel(1)}${sel(2)}
          <td class="tengah"><span class="lencana" style="${gayaL(c.asas === 'IMK + IKP' ? '--tinggi' : '--sederhana')}">${esc(c.asas)}</span></td></tr>`;
      }).join('')}
      </tbody></table>` : jadualKosong('Tiada murid Tingkatan 3 dalam penapis semasa.')}
    </div>
  </div>

  <div class="kad" style="margin-top:16px">${kepalaKad('Lapan elektif yang ditawarkan', 'Apa yang dipelajari, siapa yang sesuai, dan ke mana ia membawa.')}
    <div class="tafsir">
      ${ELEKTIF.map(e => { const n1 = kiraPertama(e), n3 = kiraTiga(e);
        return `<article style="border-left-color:${wv(e.warna)}">
        <h4>${esc(e.nama)} <span class="lencana" style="${gayaL(e.warna)}">${e.holland.utama} ${esc(HMAP[e.holland.utama].nama)}</span></h4>
        <p>${esc(e.perihal)} ${esc(e.syarat)}</p>
        <p style="margin-top:4px;color:var(--dakwat3);font-size:11.5px"><b>Domain IKP utama:</b> ${e.ikp.utama.map(k => esc(CMAP[k].nama)).join(', ')} &middot; <b>Membawa ke:</b> ${esc(e.lanjut)}</p>
        <button class="btn-mini" data-senarai="${lsElektif(hasil, e, 'pertama', `${ctx} · ${e.nama}`)}">${n1} murid pilihan pertama ${PANAH}</button>
        <button class="btn-mini" data-senarai="${lsElektif(hasil, e, 'tiga', `${ctx} · ${e.nama}`)}">${n3} dalam tiga teratas ${PANAH}</button>
      </article>`; }).join('')}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                       LALUAN KERJAYA SELEPAS SPM                          */
/* ======================================================================== */
function vKerjaya() {
  const simpanTing = S.ting, simpanJenis = S.jenis;
  if (S.ting === 'SEMUA') S.ting = '5';
  S.jenis = 'IMK';
  const senarai = susun(tapis({ jenis: true })).filter(m => m.jenis === 'IMK');
  S.ting = simpanTing; S.jenis = simpanJenis;
  const ctx = 'Laluan Kerjaya';
  const ditaksir = senarai.filter(m => m.status === 'DITAKSIR');
  const lsKerjaya = k => { const id = lsBidang(ditaksir, k, 'dominan', `${ctx} · ${KERJAYA[k].pendek}`, KERJAYA[k].bidang);
    SENARAI[id].huraian = `Laluan: ${KERJAYA[k].laluan}. Contoh kerjaya: ${KERJAYA[k].contoh}.`;
    SENARAI[id].apa = m => { const l = laluanKerjaya(m); return `${kodHeks(m.kod)}${l && l.sokong ? `<span class="lencana" style="${gayaL(HMAP[l.kedua].warna)}">+ ${esc(KERJAYA[l.kedua].pendek)}</span>` : ''}`; };
    SENARAI[id].apaTeks = m => { const l = laluanKerjaya(m); return `Kod ${m.kod}${l && l.gabung ? ' — ' + l.gabung : ''}`; };
    return id; };
  const kiraBidang = HOLLAND.map(h => ({ k: h.k, label: `${h.k} · ${KERJAYA[h.k].pendek}`, nilai: ditaksir.filter(m => m.dominan === h.k).length,
    warna: h.warna, senarai: lsKerjaya(h.k) })).sort((a, b) => b.nilai - a.nilai);

  return `
  ${tajukBlok('Selepas SPM', 'Laluan kerjaya <em>selepas SPM</em>',
    'Cadangan bidang pengajian dan kerjaya berdasarkan kod Holland setiap murid. Sesuai untuk sesi bimbingan kerjaya, minggu kerjaya atau perjumpaan ibu bapa Tingkatan 5.')}

  <div class="info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.3"/></svg>
    <p>Senarai kerjaya ialah contoh lazim bagi setiap bidang Holland, bukan ramalan. Kemasukan sebenar ke matrikulasi, IPG, politeknik atau universiti bergantung pada keputusan SPM dan syarat kemasukan semasa.</p></div>

  ${barisTapis({ jenis: false })}

  <div class="grid g4" style="margin-bottom:16px">
    ${kadAngka('Murid dipaparkan', senarai.length, `${new Set(senarai.map(m => m.kelasPenuh)).size} kelas`, '--brand', IKON.murid,
      daftar('Murid dipaparkan', senarai, { eyebrow: ctx, apa: m => { const l = laluanKerjaya(m); return l ? `${kodHeks(m.kod)}<span class="lencana" style="${gayaL(HMAP[l.huruf].warna)}">${esc(KERJAYA[l.huruf].pendek)}</span>` : apaLalai(m); } }))}
    ${kiraBidang.slice(0, 3).map(b => kadAngka(KERJAYA[b.k].pendek, b.nilai, `kod bermula dengan ${b.k}`, b.warna, IKON.heks, b.senarai)).join('')}
  </div>

  <div class="kad" style="margin-bottom:16px">${kepalaKad('Taburan bidang kerjaya dominan', 'Berdasarkan huruf pertama kod Holland.', PETUA_KLIK)}
    ${barMelintang(kiraBidang, { lblW: 210, alt: 'Taburan bidang kerjaya' })}</div>

  <div class="kad" style="padding:0;overflow:hidden;margin-bottom:16px">
    ${kepalaJadual('Cadangan setiap murid', 'Klik baris untuk laluan pengajian penuh.', senarai.length)}
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${senarai.length ? `<table><thead><tr><th>Nama murid</th><th>Kelas</th><th class="tengah">Kod</th><th>Bidang utama</th><th>Cadangan gabungan dua bidang teratas</th></tr></thead><tbody>
      ${senarai.map(m => { const l = laluanKerjaya(m);
        return `<tr data-id="${esc(m.id)}"><td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td><td>${esc(m.kelasPenuh)}</td>
          <td class="tengah">${m.kod ? kodHeks(m.kod) : '<span class="mono" style="color:var(--dakwat3)">—</span>'}</td>
          <td style="font-size:12.5px">${l ? esc(l.utama.bidang) : '<span style="color:var(--dakwat3)">Tidak ditaksir</span>'}</td>
          <td style="font-size:12.5px;color:var(--dakwat2)">${l ? esc(l.gabung) : '—'}</td></tr>`; }).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>

  <div class="kad">${kepalaKad('Enam bidang dan laluan selepas SPM', 'Rujukan pantas semasa sesi bimbingan.')}
    <div class="tafsir">
      ${HOLLAND.map(h => { const b = kiraBidang.find(x => x.k === h.k);
        return `<article style="border-left-color:${wv(h.warna)}">
        <h4><span class="kod-heks"><i style="background:${wv(h.warna)}">${h.k}</i></span> ${esc(KERJAYA[h.k].bidang)}</h4>
        <p><b>Laluan:</b> ${esc(KERJAYA[h.k].laluan)}</p>
        <p style="margin-top:4px"><b>Contoh kerjaya:</b> ${esc(KERJAYA[h.k].contoh)}</p>
        ${b && b.nilai ? `<button class="btn-mini" data-senarai="${b.senarai}">${b.nilai} murid dalam bidang ini ${PANAH}</button>` : ''}
      </article>`; }).join('')}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                               ANALISIS KELAS                              */
/* ======================================================================== */
function vKelas() {
  const senarai = susun(tapis());
  const ctx = 'Analisis Kelas';
  const kelasList = [...new Set(senarai.map(m => m.kelasPenuh))].sort();
  const imkKelas = kelasList.filter(k => senarai.some(m => m.kelasPenuh === k && m.jenis === 'IMK'));
  const itpKelas = kelasList.filter(k => senarai.some(m => m.kelasPenuh === k && m.jenis === 'ITP'));
  const siriDom = HOLLAND.map(h => ({ nama: h.nama, warna: h.warna,
    nilai: imkKelas.map(kl => senarai.filter(m => m.kelasPenuh === kl && m.dominan === h.k).length) }));
  const matriks = itpKelas.map(kl => KUNCI.map(k => Math.round(purata(senarai.filter(m => m.kelasPenuh === kl && m.jenis === 'ITP').map(m => m.skor[k])))));
  const sel = (n, key, gaya = '') => n ? `<button class="sel-klik" data-senarai="${key}" style="${gaya}">${n}</button>` : '<span style="color:var(--dakwat3)">—</span>';

  const baris = kelasList.map(kl => {
    const ahli = senarai.filter(m => m.kelasPenuh === kl);
    const i = ahli.filter(m => m.jenis === 'IMK'), t = ahli.filter(m => m.jenis === 'ITP'), c = ahli.filter(m => m.jenis === 'IKP');
    const it = i.filter(m => m.status === 'DITAKSIR');
    const dom = HOLLAND.map(h => ({ k: h.k, n: it.filter(m => m.dominan === h.k).length })).sort((a, b) => b.n - a.n)[0];
    const kd = t.filter(m => m.skor.KD >= 80), flag = ahli.filter(m => isyarat(m).length);
    const indeks = it.length ? Math.round(purata(it.map(m => m.indeks)) * 10) / 10 : null;
    const pur = t.length ? Math.round(purata(t.map(m => m.purata)) * 10) / 10 : null;
    const c1 = `${ctx} · ${kl}`;
    return `<tr style="cursor:default">
      <td class="nm" style="min-width:auto">${esc(kl)}</td>
      <td class="tengah">${sel(ahli.length, daftar(`Semua rekod — ${kl}`, ahli, { eyebrow: c1 }))}</td>
      <td class="tengah">${sel(ahli.filter(m => m.jantina === 'L').length, daftar(`Lelaki — ${kl}`, ahli.filter(m => m.jantina === 'L'), { eyebrow: c1, warna: '--i' }))}</td>
      <td class="tengah">${sel(ahli.filter(m => m.jantina === 'P').length, daftar(`Perempuan — ${kl}`, ahli.filter(m => m.jantina === 'P'), { eyebrow: c1, warna: '--e' }))}</td>
      <td class="tengah">${sel(i.length, daftar(`IMK — ${kl}`, i, { eyebrow: c1, warna: '--s' }))}</td>
      <td class="tengah">${sel(t.length, daftar(`ITP — ${kl}`, t, { eyebrow: c1, warna: '--i', nilai: m => m.purata, labelNilai: 'Purata' }))}</td>
      <td class="tengah">${sel(c.length, daftar(`IKP — ${kl}`, c, { eyebrow: c1, warna: '--k', nilai: m => m.purata, labelNilai: 'Purata' }))}</td>
      <td>${dom && dom.n ? `<button class="sel-klik" style="text-decoration:none;display:inline-flex;gap:6px;align-items:center" data-senarai="${lsBidang(it, dom.k, 'dominan', c1, `${HMAP[dom.k].nama} — ${kl}`)}">${kodHeks(dom.k)} <span style="font-size:12px;font-family:var(--badan);font-weight:600">${esc(HMAP[dom.k].nama)} · ${dom.n}</span></button>` : '—'}</td>
      <td class="tengah mono" style="font-weight:700">${indeks !== null ? indeks : '—'}</td>
      <td>${pur !== null ? `<div style="display:flex;align-items:center;gap:8px"><span class="mono" style="font-weight:700;min-width:38px">${pur}%</span><div class="bar-mini" style="flex:1"><i style="width:${pur}%;background:${wv(tahap(pur).warna)}"></i></div></div>` : '—'}</td>
      <td class="tengah">${t.length ? sel(kd.length, lsIsyarat(kd, 'Kritik diri tinggi', c1), 'color:var(--waspada)') : '—'}</td>
      <td class="tengah">${sel(flag.length, daftar(`Isyarat perhatian — ${kl}`, flag, { eyebrow: c1, warna: '--sederhana', nilai: m => isyarat(m).length, labelNilai: 'Bil. isyarat',
        apa: m => isyarat(m).slice(0, 2).map(f => `<span class="lencana" style="${gayaL(f.aras === 'waspada' ? '--waspada' : '--sederhana')}">${esc(f.jenis)}</span>`).join(''),
        apaTeks: m => isyarat(m).map(f => f.jenis).join('; ') }), 'color:color-mix(in srgb,var(--sederhana) 80%,var(--dakwat))')}</td>
    </tr>`;
  });

  return `
  ${tajukBlok('Perbandingan', 'Analisis <em>setiap kelas</em>',
    'Bandingkan corak minat dan tret personaliti antara kelas. <b>Setiap angka dalam jadual boleh diklik</b> untuk melihat murid berkenaan.')}
  ${barisTapis()}

  <div class="kad" style="margin-bottom:16px;padding:0;overflow:hidden">
    <div style="padding:16px 18px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <div><h2>Ringkasan setiap kelas</h2><p style="margin:2px 0 0;font-size:12.5px;color:var(--dakwat3)">“—” bermakna instrumen itu tidak ditadbir bagi kelas tersebut.</p></div>
      <span class="petua" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--brand);background:color-mix(in srgb,var(--brand) 9%,transparent);padding:3px 9px;border-radius:99px">${PETUA_KLIK}</span></div>
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${baris.length ? `<table><thead><tr>
        <th>Kelas</th><th class="tengah">Rekod</th><th class="tengah">L</th><th class="tengah">P</th><th class="tengah">IMK</th><th class="tengah">ITP</th><th class="tengah">IKP</th>
        <th>Bidang dominan</th><th class="tengah">Purata indeks</th><th>Purata tret</th><th class="tengah">Kritik diri ≥80</th><th class="tengah">Isyarat</th>
      </tr></thead><tbody>${baris.join('')}</tbody></table>` : jadualKosong()}
    </div>
  </div>

  ${imkKelas.length ? `<div class="kad" style="margin-bottom:16px">${kepalaKad('Bidang dominan mengikut kelas', 'Bilangan murid bagi setiap bidang Holland. Klik batang untuk senarai.', PETUA_KLIK)}
    <div style="overflow-x:auto">${barMenegak(imkKelas, siriDom, { w: Math.max(620, imkKelas.length * 105), h: 260, alt: 'Bidang dominan mengikut kelas',
      senarai: (i, j) => lsBidang(senarai.filter(m => m.kelasPenuh === imkKelas[i]), HOLLAND[j].k, 'dominan', `${ctx} · ${imkKelas[i]}`, `${HOLLAND[j].nama} — ${imkKelas[i]}`) })}</div>
    ${petunjukHolland()}</div>` : ''}

  ${itpKelas.length ? `<div class="kad">${kepalaKad('Purata konstruk ITP mengikut kelas', 'Klik petak untuk melihat murid kelas itu disusun ikut skor.', PETUA_KLIK)}
    <div style="overflow-x:auto">${petaHaba(itpKelas, KUNCI, matriks, { alt: 'Purata konstruk mengikut kelas',
      senarai: (i, j) => lsKonstruk(senarai.filter(m => m.kelasPenuh === itpKelas[i]), KUNCI[j], 'ITP', `${ctx} · ${itpKelas[i]}`, `${KMAP[KUNCI[j]].nama} — ${itpKelas[i]}`) })}</div>
    ${petunjukTahap()}</div>` : ''}`;
}

/* ======================================================================== */
/*                               PERLU PERHATIAN                             */
/* ======================================================================== */
function vPerhatian() {
  const senarai = susun(tapis()).map(m => ({ m, f: isyarat(m) })).filter(o => o.f.length);
  const ctx = 'Perlu Perhatian';
  const kump = {};
  senarai.forEach(o => o.f.forEach(f => { (kump[f.jenis] = kump[f.jenis] || []).push({ ...o, f }); }));
  const jenis = Object.entries(kump).sort((a, b) => b[1].length - a[1].length);
  const kunci = Object.fromEntries(jenis.map(([j, arr]) => [j, lsIsyarat(arr.map(o => o.m), j, ctx)]));
  const w = arr => arr[0].f.aras === 'waspada' ? '--waspada' : '--sederhana';

  return `
  ${tajukBlok('Tindakan susulan', 'Murid yang <em>perlu perhatian</em>',
    'Dijana automatik daripada kriteria laporan PPSi. Ini titik permulaan perbincangan, bukan diagnosis — sahkan setiap kes melalui temu bual bersama guru kaunseling.')}

  <div class="amaran"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 9.5v5M12 17.2v.3"/></svg>
    <div><b>Maklumat sensitif</b><p>Paparan ini mengandungi nama murid bersama isyarat kesejahteraan. Jangan kongsi tangkap layar di luar mesyuarat rasmi, dan hadkan capaian kepada guru yang terlibat sahaja.</p></div></div>

  ${barisTapis()}

  <div class="grid g4" style="margin-bottom:16px">
    ${jenis.map(([j, arr]) => kadAngka(j, arr.length, 'murid dikenal pasti', w(arr), IKON.awas, kunci[j])).join('')}
  </div>

  ${jenis.length ? jenis.map(([j, arr]) => `
    <div class="kad" style="margin-bottom:16px;padding:0;overflow:hidden">
      <div style="padding:15px 18px 11px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <div><h2>${esc(j)}</h2><p style="margin:2px 0 0;font-size:12.5px;color:var(--dakwat2);max-width:70ch">${esc(KRITERIA[j] || '')}</p></div>
        <button class="ikon-btn" data-senarai="${kunci[j]}" style="color:var(${w(arr)})">${arr.length} murid · Lihat senarai ${PANAH}</button>
      </div>
      <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
        <table><thead><tr><th>Nama murid</th><th>Kelas</th><th class="tengah">Instrumen</th><th>Butiran</th><th>Tarikh</th></tr></thead><tbody>
        ${arr.map(({ m, f }) => `<tr data-id="${esc(m.id)}">
          <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td><td>${esc(m.kelasPenuh)}</td>
          <td class="tengah"><span class="lencana" style="background:var(--papan3);color:var(--dakwat2)">${m.jenis}</span></td>
          <td style="font-size:12.5px;color:var(--dakwat2)">${esc(f.huraian)}</td>
          <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>`).join('') : `<div class="kad">${jadualKosong('Tiada murid memenuhi kriteria isyarat dalam penapis semasa.')}</div>`}`;
}

/* ======================================================================== */
/*                        MODAL SENARAI MURID                                */
/* ======================================================================== */
const AVATAR = [['#6E7CFF','#9A6BFF'],['#13A89A','#3BD18A'],['#F0883A','#F5B347'],['#E5486D','#F27BA0'],
                ['#3B6FF0','#53B5F5'],['#9B5DE5','#D66BE0'],['#139FB5','#4CC7D8'],['#4E5BEF','#7AA2FF']];
function warnaAvatar(nama) { let h = 0; for (const c of nama) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AVATAR[h % AVATAR.length]; }
function inisial(nama) {
  const abai = new Set(['BIN','BINTI','BT','BTE','B.','A/L','A/P','A/K','AL','AP','AK','@']);
  const k = String(nama).split(/\s+/).filter(w => w && !abai.has(w.toUpperCase()));
  return ((k[0] || '?')[0] + ((k[1] || '')[0] || '')).toUpperCase();
}

function urutanSM() {
  const s = SM.aktif; let arr = s.murid.slice();
  const q = SM.q.trim().toLowerCase();
  if (q) arr = arr.filter(m => `${m.nama} ${m.kelasPenuh} ${m.jenis}`.toLowerCase().includes(q));
  if (SM.susun === 'nilai' && s.nilai) arr.sort((a, b) => (s.naik ? 1 : -1) * (s.nilai(a) - s.nilai(b)) || a.nama.localeCompare(b.nama, 'ms'));
  else arr.sort((a, b) => a.kelasPenuh.localeCompare(b.kelasPenuh, 'ms', { numeric: true }) || a.nama.localeCompare(b.nama, 'ms'));
  return arr;
}

function barisSM(m, i, s) {
  const [a1, a2] = warnaAvatar(m.nama);
  const jan = m.jantina === 'L' ? 'Lelaki' : m.jantina === 'P' ? 'Perempuan' : '—';
  return `<button class="bm" type="button" data-id="${esc(m.id)}" style="--n:${Math.min(i, 26)}">
    <span class="no">${i + 1}</span>
    <span class="avatar" style="--av1:${a1};--av2:${a2}">${esc(inisial(m.nama))}</span>
    <span class="bm-teks"><b>${esc(m.nama)}</b><small>${esc(m.kelasPenuh)} · ${jan} · ${m.jenis}${S.tunjukIC ? ' · ' + icPapar(m.ic) : ''}</small></span>
    <span class="bm-apa">${(s.apa || apaLalai)(m)}</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>
  </button>`;
}

function isiSenarai(animasi) {
  const s = SM.aktif, arr = urutanSM(), isi = $('#sm-isi');
  if (!arr.length) { isi.innerHTML = `<div class="sm-kosong">${s.murid.length ? 'Tiada nama sepadan dengan carian.' : 'Tiada murid dalam kategori ini.'}</div>`; return; }
  let h = '';
  const kelasBanyak = new Set(arr.map(m => m.kelasPenuh)).size > 1;
  if (SM.susun === 'kelas' && kelasBanyak) {
    let semasa = null;
    arr.forEach((m, i) => {
      if (m.kelasPenuh !== semasa) { semasa = m.kelasPenuh;
        h += `<div class="sm-kump">${esc(semasa)} <span>${arr.filter(x => x.kelasPenuh === semasa).length}</span></div>`; }
      h += barisSM(m, i, s);
    });
  } else h = arr.map((m, i) => barisSM(m, i, s)).join('');
  isi.innerHTML = h;
  isi.classList.toggle('animasi-baris', !!animasi && !GERAK_KURANG());
  isi.scrollTop = 0;
}

function bukaSenarai(k) {
  const s = SENARAI[k];
  if (!s) return;
  SM.aktif = s; SM.q = ''; SM.susun = s.nilai ? 'nilai' : 'kelas';
  const n = s.murid.length;
  const unik = new Set(s.murid.map(m => m.ic)).size === n;
  const nKelas = new Set(s.murid.map(m => m.kelasPenuh)).size;
  const md = $('#senarai');
  md.style.setProperty('--w', `var(${s.warna || '--brand'})`);
  md.innerHTML = `
    <div class="tajuk-cetak tajuk-cetak-senarai"><img src="${($('.jata .logo img') || {}).src || ''}" alt="">
      <div><b>Senarai murid — ${esc(s.tajuk)}</b><span>${esc(DATA.meta.sekolah)} (${esc(DATA.meta.kodSekolah)}) · ${esc(s.eyebrow || '')} · Dicetak ${new Date().toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric' })}</span></div></div>
    <div class="sm-kepala">
      <div class="sm-baris1">
        <div style="flex:1;min-width:0">
          ${s.eyebrow ? `<span class="mata">${esc(s.eyebrow)}</span>` : ''}
          <h2>${esc(s.tajuk)}</h2>
          <div class="sm-kiraan"><b>${n}</b> ${unik ? 'murid' : 'rekod'}${nKelas > 1 ? `<span style="color:var(--dakwat3);font-weight:600">&nbsp;· ${nKelas} kelas</span>` : ''}</div>
          ${s.huraian ? `<p class="sm-huraian">${esc(s.huraian)}</p>` : ''}
        </div>
        <button class="tutup" id="sm-tutup" aria-label="Tutup senarai"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </div>
      <div class="sm-alat">
        <div class="cari"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
          <input id="sm-cari" type="search" autocomplete="off" placeholder="Tapis nama atau kelas…" aria-label="Tapis senarai"></div>
        ${s.nilai ? `<div class="sm-susun" role="group" aria-label="Susunan"><button type="button" data-ss="nilai">${esc(s.labelNilai || 'Skor')}</button><button type="button" data-ss="kelas">Kelas</button></div>` : ''}
        <button class="ikon-btn" id="sm-salin" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>Salin nama</button>
        <button class="ikon-btn" id="sm-csv" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5v11M8 11l4 3.5 4-3.5"/><path d="M4 17v2.5h16V17"/></svg>CSV</button>
        <button class="ikon-btn bulat" id="sm-cetak" type="button" aria-label="Cetak senarai"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 9V3.5h11V9"/><rect x="3" y="9" width="18" height="7.5" rx="2"/><path d="M6.5 14h11v6.5h-11z"/></svg></button>
      </div>
    </div>
    <div class="sm-isi" id="sm-isi"></div>`;
  const kemasSusun = () => $$('[data-ss]', md).forEach(b => b.classList.toggle('on', b.dataset.ss === SM.susun));
  kemasSusun();
  isiSenarai(true);
  md.classList.add('buka');
  $('#tudung-senarai').classList.add('buka');

  $('#sm-tutup').onclick = tutupSenarai;
  $('#sm-cari').oninput = e => { SM.q = e.target.value; isiSenarai(false); };
  $$('[data-ss]', md).forEach(b => b.onclick = () => { SM.susun = b.dataset.ss; kemasSusun(); isiSenarai(false); });
  $('#sm-isi').onclick = e => { const b = e.target.closest('.bm'); if (b) bukaProfil(b.dataset.id); };
  $('#sm-salin').onclick = salinSenarai;
  $('#sm-csv').onclick = csvSenarai;
  $('#sm-cetak').onclick = () => {
    document.body.classList.add('cetak-senarai');
    $('#cetak-tajuk').textContent = `Senarai murid — ${s.tajuk}`;
    window.print();
    setTimeout(() => { document.body.classList.remove('cetak-senarai'); $('#cetak-tajuk').textContent = `Dashboard PPSi ${DATA.meta.tahun} — ${TAJUK[S.papar]}`; }, 500);
  };
  setTimeout(() => { if (window.matchMedia('(hover:hover)').matches) $('#sm-cari').focus(); }, 60);
}

function tutupSenarai() {
  $('#senarai').classList.remove('buka');
  $('#tudung-senarai').classList.remove('buka');
}

function teksBaris(m, i, s) {
  const apa = (s.apaTeks || apaTeksLalai)(m);
  return `${i + 1}. ${m.nama} — ${m.kelasPenuh}${apa ? ' — ' + apa : ''}`;
}
function salinSenarai() {
  const s = SM.aktif, arr = urutanSM();
  const teks = `${s.tajuk} (${arr.length})\n` + arr.map((m, i) => teksBaris(m, i, s)).join('\n');
  const siap = () => toast(`${arr.length} nama disalin`);
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(teks).then(siap, () => salinLama(teks, siap));
  else salinLama(teks, siap);
}
function salinLama(teks, siap) {
  const t = document.createElement('textarea'); t.value = teks; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); siap(); } catch (e) { toast('Tidak dapat menyalin'); }
  t.remove();
}
function csvSenarai() {
  const s = SM.aktif, arr = urutanSM();
  const q = v => { const x = String(v ?? ''); return /[",\n;]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x; };
  const baris = [['BIL','NAMA','NO_PENGENALAN','JANTINA','KELAS','INSTRUMEN','MAKLUMAT'],
    ...arr.map((m, i) => [i + 1, m.nama, m.ic, m.jantina, m.kelasPenuh, m.jenis, (s.apaTeks || apaTeksLalai)(m)])];
  const nama = s.tajuk.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  turun(`Senarai_${nama}_${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + baris.map(r => r.map(q).join(',')).join('\r\n'));
  toast('CSV dimuat turun');
}

let _toastT;
function toast(teks) {
  const t = $('#toast');
  t.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7CF0B0" stroke-width="2.6" stroke-linecap="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>${esc(teks)}`;
  t.classList.add('tunjuk');
  clearTimeout(_toastT); _toastT = setTimeout(() => t.classList.remove('tunjuk'), 2200);
}

/* ======================================================================== */
/*                         ANIMASI MASUK & KIRA NAIK                         */
/* ======================================================================== */
const GERAK_KURANG = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hidupkan(el) {
  $$('.tajuk-blok,.baris-tapis,.amaran,.info,.angka,.kad,.hero,.kad-gelap', el).forEach((n, i) => n.style.setProperty('--n', Math.min(i, 16)));
  el.classList.remove('animasi'); void el.offsetWidth; el.classList.add('animasi');
  if (GERAK_KURANG()) return;
  $$('[data-kira]', el).forEach((n, i) => {
    const asal = n.dataset.kira, akhir = parseFloat(asal);
    if (isNaN(akhir)) return;
    const dp = (asal.split('.')[1] || '').length, t0 = performance.now() + 150 + Math.min(i, 10) * 45, dur = 950;
    n.textContent = (0).toFixed(dp);
    const langkah = t => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
      n.textContent = (akhir * e).toFixed(dp);
      if (p < 1) requestAnimationFrame(langkah); else n.textContent = asal;
    };
    requestAnimationFrame(langkah);
  });
}


/* ======================================================================== */
/*                       CARIAN — KOTAK HASIL SEGERA                         */
/* ======================================================================== */
let _pilihHC = -1, _kunciSemuaHC = null;

function barisCari() {
  if (!S.cari.trim()) return '';
  return `<div class="baris-tapis"><span class="tapis-lbl">Papan ditapis</span>
    <button class="cip on cip-cari" data-kosong-cari type="button">Carian: “${esc(S.cari.trim())}” <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`;
}

function kosongkanCari() {
  $('#cari').value = ''; S.cari = ''; kemasCari(); tutupHasilCari(); lukis();
}

function tandaPadanan(teks) {
  const kata = S.cari.trim().split(/\s+/).filter(k => k.length > 1).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const t = esc(teks);
  if (!kata.length) return t;
  return t.replace(new RegExp(`(${kata.join('|')})`, 'gi'), '<mark>$1</mark>');
}

function hasilCari(buka) {
  const kotak = $('#hasil-cari');
  if (!kotak) return;
  const q = S.cari.trim();
  if (!q) { tutupHasilCari(); return; }
  if (!buka && !kotak.classList.contains('buka')) return;

  const rekod = tapis({ jenis: true, ting: true, kelas: true, jantina: true, kod: true });
  const peta = new Map();
  rekod.forEach(m => { if (!peta.has(m.ic)) peta.set(m.ic, []); peta.get(m.ic).push(m); });
  const murid = [...peta.values()];
  _kunciSemuaHC = rekod.length ? daftar(`Hasil carian “${q}”`, rekod, { eyebrow: 'Carian',
    huraian: `${murid.length} murid (${rekod.length} rekod) sepadan dengan carian ini.` }) : null;
  _pilihHC = -1;

  if (!rekod.length) {
    kotak.innerHTML = `<div class="hc-kosong"><b>Tiada padanan untuk “${esc(q)}”</b>
      Cuba nama murid, kelas (<i>3 Bestari</i>), kod Holland (<i>SKR</i>), konstruk (<i>kepimpinan tinggi</i>) atau elektif (<i>sains tulen</i>).</div>`;
  } else {
    const tunjuk = murid.slice(0, 7);
    kotak.innerHTML = `<div class="hc-tajuk"><span>${murid.length} murid ditemui</span><span>${rekod.length} rekod</span></div>
      ${tunjuk.map(arr => {
        const m = arr[0], [a1, a2] = warnaAvatar(m.nama);
        const cip = arr.map(x => `<span class="lencana" style="${gayaL(x.jenis === 'IMK' ? '--s' : x.jenis === 'ITP' ? '--i' : '--k')}">${x.jenis}${x.jenis === 'IMK' && x.kod ? ' ' + x.kod : ''}</span>`).join('');
        return `<button class="hc-baris" type="button" data-id="${esc(m.id)}">
          <span class="avatar" style="--av1:${a1};--av2:${a2}">${esc(inisial(m.nama))}</span>
          <span class="bm-teks"><b>${tandaPadanan(m.nama)}</b><small>${tandaPadanan(m.kelasPenuh)} · ${m.jantina === 'L' ? 'Lelaki' : m.jantina === 'P' ? 'Perempuan' : '—'}</small></span>
          <span class="hc-cip">${cip}</span></button>`;
      }).join('')}
      <button class="hc-kaki" type="button" data-senarai="${_kunciSemuaHC}">Lihat semua ${murid.length} murid dalam senarai ${PANAH}</button>`;
  }
  kotak.classList.add('buka');
  $$('.hc-baris', kotak).forEach(b => {
    b.onmousedown = e => e.preventDefault();      // elak blur sebelum klik
    b.onclick = () => { tutupHasilCari(); $('#cari').blur(); bukaProfil(b.dataset.id); };
  });
  const kaki = $('.hc-kaki', kotak);
  if (kaki) kaki.onmousedown = e => e.preventDefault();
}

function tutupHasilCari() {
  const k = $('#hasil-cari'); if (k) k.classList.remove('buka');
  _pilihHC = -1;
}

function kekunciCari(e) {
  const kotak = $('#hasil-cari');
  const baris = kotak ? $$('.hc-baris', kotak) : [];
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!kotak.classList.contains('buka')) hasilCari(true);
    if (!baris.length) return;
    e.preventDefault();
    _pilihHC = (_pilihHC + (e.key === 'ArrowDown' ? 1 : -1) + baris.length) % baris.length;
    baris.forEach((b, i) => b.classList.toggle('pilih', i === _pilihHC));
    baris[_pilihHC].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    clearTimeout(window._tangguhCari);
    S.cari = e.target.value; lukis();
    if (_pilihHC >= 0 && baris[_pilihHC]) { baris[_pilihHC].click(); return; }
    hasilCari(true);
    if (_kunciSemuaHC) { tutupHasilCari(); e.target.blur(); bukaSenarai(_kunciSemuaHC); }
  } else if (e.key === 'Escape') {
    if (kotak && kotak.classList.contains('buka')) { e.stopPropagation(); tutupHasilCari(); }
  }
}

document.addEventListener('DOMContentLoaded', mula);
