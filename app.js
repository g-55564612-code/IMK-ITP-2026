/* =========================================================================
   Dashboard PPSi 2026 — SMK Dato' Undang Musa Al-Haj
   Tiada CDN, tiada pustaka luar. Semua graf dilukis sendiri dalam SVG.
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
function tahap(v) {
  if (v >= 70) return { nama:'Tinggi',    warna:'--tinggi',    k:'T' };
  if (v >= 40) return { nama:'Sederhana', warna:'--sederhana', k:'S' };
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
  'Minat kurang jelas':'Indeks perbezaan 4 dan ke bawah — minat kerjaya belum terarah dan sesuai untuk sesi bimbingan.'
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
  if (m.jenis === 'IMK' && m.status === 'DITAKSIR' && m.indeks <= 4)
    out.push({ jenis:'Minat kurang jelas', huraian:`Indeks perbezaan hanya ${m.indeks}. Minat kerjaya belum terarah — sesuai untuk sesi bimbingan kerjaya.`, aras:'perhati' });
  return out;
}

/* ======================================================================== */
/*                            GRAF SVG BUATAN SENDIRI                        */
/* ======================================================================== */

/* --- 1. HEKSAGON HOLLAND (elemen tanda aplikasi ini) --- */
function heksagon(skor, opt = {}) {
  const R = opt.r || 108, pad = opt.pad ?? 54;
  const W = (R + pad) * 2, cx = W/2, cy = W/2;
  const maks = opt.maks || 30;
  const susunan = ['R','I','A','S','E','K'];
  const titik = (i, f) => {
    const a = (-90 + i*60) * Math.PI/180;
    return [cx + Math.cos(a)*R*f, cy + Math.sin(a)*R*f];
  };
  let g = '';

  // gelang rujukan
  [0.25,0.5,0.75,1].forEach((f,idx) => {
    const p = susunan.map((_,i)=>titik(i,f).map(n=>n.toFixed(1)).join(',')).join(' ');
    g += `<polygon points="${p}" fill="${idx===3?'var(--papan2)':'none'}" stroke="var(--garis)" stroke-width="1"${idx===3?'':' stroke-dasharray="3 4"'}/>`;
  });
  susunan.forEach((_,i)=>{
    const [x,y] = titik(i,1);
    g += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--garis)" stroke-width="1"/>`;
  });

  // poligon skor (hanya nilai yang dilaporkan)
  const ada = susunan.map((k,i)=>({k,i,v:skor[k]||0})).filter(o=>o.v>0);
  if (ada.length >= 2) {
    const p = ada.map(o=>titik(o.i, Math.min(1,o.v/maks)).map(n=>n.toFixed(1)).join(',')).join(' ');
    g += `<polygon points="${p}" fill="var(--brand)" fill-opacity=".17" stroke="var(--brand)" stroke-width="2.2" stroke-linejoin="round"/>`;
  }

  // titik + label
  susunan.forEach((k,i)=>{
    const h = HMAP[k], v = skor[k] || 0, hidup = v > 0;
    const [lx,ly] = titik(i, 1.30);
    const [sx,sy] = titik(i, Math.min(1, v/maks));
    if (hidup) {
      g += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5.5" fill="${wv(h.warna)}" stroke="var(--papan)" stroke-width="2"/>`;
    }
    const bulat = titik(i, 1.06);
    g += `<g><circle cx="${bulat[0].toFixed(1)}" cy="${bulat[1].toFixed(1)}" r="11" fill="${hidup?wv(h.warna):'var(--papan3)'}"/>`;
    g += `<text x="${bulat[0].toFixed(1)}" y="${(bulat[1]+4).toFixed(1)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" font-weight="700" fill="${hidup?'#fff':'var(--dakwat3)'}">${k}</text></g>`;
    g += `<text x="${lx.toFixed(1)}" y="${(ly-1).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${hidup?'var(--dakwat)':'var(--dakwat3)'}">${h.nama}</text>`;
    g += `<text x="${lx.toFixed(1)}" y="${(ly+11).toFixed(1)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="700" fill="${hidup?wv(h.warna):'var(--dakwat3)'}">${hidup?v:'—'}</text>`;
  });

  if (opt.tengah) {
    g += `<text x="${cx}" y="${cy-4}" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="var(--dakwat)">${esc(opt.tengah)}</text>`;
    if (opt.tengahLbl) g += `<text x="${cx}" y="${cy+13}" text-anchor="middle" font-size="9.5" letter-spacing="1.4" fill="var(--dakwat3)">${esc(opt.tengahLbl)}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${W}" class="hero-heks" role="img" aria-label="Heksagon Holland" style="max-width:${W}px;margin:0 auto">${g}</svg>`;
}

/* --- 2. KIPAS 15 KONSTRUK ITP --- */
function kipas(skor, opt = {}) {
  const dlm = opt.dlm || 46, luar = opt.luar || 118, pad = 52;
  const W = (luar + pad) * 2, cx = W/2, cy = W/2;
  const n = KUNCI.length, lebar = 360/n, jrk = 2.6;
  let g = '';

  [30,40,60,70,99].forEach(v=>{
    const rr = dlm + (luar-dlm) * (v/99);
    g += `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(1)}" fill="none" stroke="var(--garis)" stroke-width="1" stroke-dasharray="2 4"/>`;
  });
  g += `<circle cx="${cx}" cy="${cy}" r="${dlm}" fill="var(--papan2)" stroke="var(--garis)"/>`;

  KUNCI.forEach((k,i)=>{
    const v = skor[k] ?? 0, t = tahap(v);
    const kk = KMAP[k];
    const wr = (kk.songsang && v >= (k==='KD'?80:50)) ? '--waspada' : t.warna;
    const a0 = (-90 + i*lebar + jrk/2) * Math.PI/180;
    const a1 = (-90 + (i+1)*lebar - jrk/2) * Math.PI/180;
    const rr = dlm + (luar-dlm) * (v/99);
    const P = (r,a) => [(cx+Math.cos(a)*r).toFixed(1), (cy+Math.sin(a)*r).toFixed(1)];
    const [x1,y1]=P(dlm,a0), [x2,y2]=P(rr,a0), [x3,y3]=P(rr,a1), [x4,y4]=P(dlm,a1);
    g += `<path d="M${x1} ${y1} L${x2} ${y2} A${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 1 ${x3} ${y3} L${x4} ${y4} A${dlm} ${dlm} 0 0 0 ${x1} ${y1} Z" fill="${wv(wr)}" fill-opacity=".85"><title>${kk.nama} — ${v}% (${t.nama})</title></path>`;
    const am = (a0+a1)/2;
    const [lx,ly] = P(luar+16, am);
    g += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="9.5" font-weight="700" fill="var(--dakwat2)">${k}</text>`;
    const [vx,vy] = P(luar+31, am);
    g += `<text x="${vx}" y="${vy}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="9.5" fill="${wv(wr)}">${v}</text>`;
  });

  if (opt.tengah) {
    g += `<text x="${cx}" y="${cy-2}" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="var(--dakwat)">${esc(opt.tengah)}</text>`;
    g += `<text x="${cx}" y="${cy+13}" text-anchor="middle" font-size="8.5" letter-spacing="1.2" fill="var(--dakwat3)">${esc(opt.tengahLbl||'')}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${W}" class="hero-heks" role="img" aria-label="Kipas konstruk ITP" style="max-width:${W}px;margin:0 auto">${g}</svg>`;
}

/* --- 3. BAR MELINTANG --- */
function barMelintang(data, opt = {}) {
  const lblW = opt.lblW || 118, barH = opt.barH || 22, sela = 8, kanan = 46;
  const W = opt.w || 560, H = data.length * (barH+sela) + 6;
  const maks = opt.maks || Math.max(1, ...data.map(d=>d.nilai));
  let g = '';
  data.forEach((d,i)=>{
    const y = i*(barH+sela);
    const p = Math.max(2, (W-lblW-kanan) * (d.nilai/maks));
    g += `<text x="${lblW-9}" y="${y+barH/2+4}" text-anchor="end" font-size="11.5" font-weight="600" fill="var(--dakwat2)">${esc(d.label)}</text>`;
    g += `<rect x="${lblW}" y="${y}" width="${W-lblW-kanan}" height="${barH}" rx="4" fill="var(--papan3)"/>`;
    g += `<rect x="${lblW}" y="${y}" width="${p.toFixed(1)}" height="${barH}" rx="4" fill="${wv(d.warna||'--brand')}"><title>${esc(d.label)}: ${d.nilai}${opt.unit||''}</title></rect>`;
    g += `<text x="${(lblW+p+8).toFixed(1)}" y="${y+barH/2+4}" font-family="ui-monospace,monospace" font-size="11.5" font-weight="700" fill="var(--dakwat)">${d.teks ?? d.nilai}${opt.unit||''}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="${esc(opt.alt||'Graf bar')}">${g}</svg>`;
}

/* --- 4. BAR MENEGAK BERKUMPULAN --- */
function barMenegak(kump, siri, opt = {}) {
  const W = opt.w || 620, H = opt.h || 240, kiri = 34, bawah = 44, atas = 14;
  const maks = opt.maks || Math.max(1, ...siri.flatMap(s=>s.nilai));
  const lebarKump = (W-kiri-10) / kump.length;
  const lebarBar = Math.min(26, (lebarKump-10) / siri.length);
  let g = '';
  for (let t=0; t<=4; t++) {
    const v = maks*t/4, y = atas + (H-atas-bawah)*(1-t/4);
    g += `<line x1="${kiri}" y1="${y.toFixed(1)}" x2="${W-6}" y2="${y.toFixed(1)}" stroke="var(--garis)" stroke-width="1" stroke-dasharray="2 4"/>`;
    g += `<text x="${kiri-6}" y="${(y+3.5).toFixed(1)}" text-anchor="end" font-family="ui-monospace,monospace" font-size="9.5" fill="var(--dakwat3)">${Math.round(v)}</text>`;
  }
  kump.forEach((nama,i)=>{
    const x0 = kiri + i*lebarKump;
    siri.forEach((s,j)=>{
      const v = s.nilai[i] || 0;
      const h = (H-atas-bawah) * (v/maks);
      const x = x0 + (lebarKump - lebarBar*siri.length)/2 + j*lebarBar;
      g += `<rect x="${x.toFixed(1)}" y="${(H-bawah-h).toFixed(1)}" width="${(lebarBar-3).toFixed(1)}" height="${Math.max(1,h).toFixed(1)}" rx="3" fill="${wv(s.warna)}"><title>${esc(nama)} — ${esc(s.nama)}: ${v}</title></rect>`;
      if (v > 0 && siri.length <= 2)
        g += `<text x="${(x+(lebarBar-3)/2).toFixed(1)}" y="${(H-bawah-h-4).toFixed(1)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" font-weight="700" fill="var(--dakwat2)">${v}</text>`;
    });
    g += `<text x="${(x0+lebarKump/2).toFixed(1)}" y="${H-bawah+15}" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--dakwat2)">${esc(nama)}</text>`;
  });
  g += `<line x1="${kiri}" y1="${H-bawah}" x2="${W-6}" y2="${H-bawah}" stroke="var(--dakwat3)" stroke-width="1"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="${esc(opt.alt||'Graf bar menegak')}">${g}</svg>`;
}

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
function petaHaba(barisNama, lajurNama, nilai, opt = {}) {
  const lblW = 96, sel = opt.sel || 30, kepalaH = 30;
  const W = lblW + lajurNama.length*sel + 6;
  const H = kepalaH + barisNama.length*sel + 6;
  const maks = opt.maks || 99, min = opt.min || 0;
  let g = '';
  lajurNama.forEach((c,j)=>{
    g += `<text x="${(lblW + j*sel + sel/2).toFixed(1)}" y="${kepalaH-9}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" font-weight="700" fill="var(--dakwat2)">${esc(c)}</text>`;
  });
  barisNama.forEach((r,i)=>{
    g += `<text x="${lblW-8}" y="${(kepalaH + i*sel + sel/2 + 3.5).toFixed(1)}" text-anchor="end" font-size="11" font-weight="600" fill="var(--dakwat2)">${esc(r)}</text>`;
    lajurNama.forEach((c,j)=>{
      const v = nilai[i][j];
      const f = Math.max(0, Math.min(1, (v-min)/(maks-min)));
      const t = tahap(v);
      g += `<rect x="${(lblW + j*sel).toFixed(1)}" y="${(kepalaH + i*sel).toFixed(1)}" width="${sel-2}" height="${sel-2}" rx="3" fill="${wv(t.warna)}" fill-opacity="${(0.18 + f*0.82).toFixed(2)}"><title>${esc(r)} — ${esc(c)}: ${v}</title></rect>`;
      g += `<text x="${(lblW + j*sel + (sel-2)/2).toFixed(1)}" y="${(kepalaH + i*sel + (sel-2)/2 + 3.5).toFixed(1)}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8.5" font-weight="700" fill="${f>0.55?'#fff':'var(--dakwat)'}">${Math.round(v)}</text>`;
    });
  });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;min-width:${W}px" role="img" aria-label="${esc(opt.alt||'Peta haba')}">${g}</svg>`;
}

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
    if (m.status === 'DITAKSIR') b.push(kategoriIndeks(m.indeks).nama);
  } else {
    KONSTRUK.forEach(k => {
      b.push(k.k, k.nama);
      b.push(`${k.nama} ${tahap(m.skor[k.k]).nama.toLowerCase()}`);
    });
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
function kadAngka(lbl, nilai, nota, warna, ikon) {
  return `<div class="angka"><span class="pita" style="background:${wv(warna)}"></span>
    <div class="lbl">${ikon||''}${esc(lbl)}</div>
    <div class="nilai">${nilai}</div>
    <div class="nota">${nota||''}</div></div>`;
}
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
      <option value="ITP"${S.jenis==='ITP'?' selected':''}>ITP — Tret Personaliti</option></select>`;
  }
  h += `<select class="tapis" data-tapis="ting"><option value="SEMUA">Semua tingkatan</option>
    ${tingSenarai.map(t=>`<option value="${t}"${S.ting===String(t)?' selected':''}>${TING_NAMA[t]}</option>`).join('')}</select>`;
  h += `<select class="tapis" data-tapis="kelas"><option value="SEMUA">Semua kelas</option>
    ${kelasSenarai.map(k=>`<option value="${esc(k)}"${S.kelas===k?' selected':''}>${esc(k)}</option>`).join('')}</select>`;
  h += `<select class="tapis" data-tapis="jantina"><option value="SEMUA">Lelaki &amp; perempuan</option>
    <option value="L"${S.jantina==='L'?' selected':''}>Lelaki</option>
    <option value="P"${S.jantina==='P'?' selected':''}>Perempuan</option></select>`;
  if (pilihan.kod) {
    h += `<span style="width:8px"></span>` + HOLLAND.map(hh=>
      `<button class="cip${S.tapisKod===hh.k?' on':''}" data-kod="${hh.k}"><span class="titik" style="background:${wv(hh.warna)}"></span>${hh.k}</button>`).join('');
  }
  h += `<button class="reset" id="btn-reset">Tetapkan semula</button></div>`;
  return h;
}

/* ======================================================================== */
/*                              PAPARAN 1 — PAPAN UTAMA                      */
/* ======================================================================== */
function vPapan() {
  const semua = S.murid;
  const imk = semua.filter(m=>m.jenis==='IMK');
  const itp = semua.filter(m=>m.jenis==='ITP');
  const ditaksir = semua.filter(m=>m.status==='DITAKSIR');
  const bendera = semua.filter(m=>isyarat(m).length);
  const kelasBil = new Set(semua.map(m=>m.kelasPenuh)).size;

  // heksagon komposit sekolah: purata skor Holland yang dilaporkan
  const komposit = {};
  HOLLAND.forEach(h=>{
    const v = imk.filter(m=>m.skor[h.k]>0).map(m=>m.skor[h.k]);
    komposit[h.k] = v.length ? Math.round(purata(v)*10)/10 : 0;
  });
  // kekerapan bidang dominan
  const kerapDom = HOLLAND.map(h=>({
    label:`${h.k} · ${h.nama}`, nilai: imk.filter(m=>m.dominan===h.k).length, warna:h.warna
  })).sort((a,b)=>b.nilai-a.nilai);
  // kekerapan muncul dalam 3 mata
  const kerapAda = HOLLAND.map(h=>({
    label:h.nama, nilai: imk.filter(m=>m.kod.includes(h.k)).length, warna:h.warna
  })).sort((a,b)=>b.nilai-a.nilai);
  // purata konstruk ITP
  const purataK = KUNCI.map(k=>({
    label:`${k} · ${KMAP[k].nama}`, nilai: Math.round(purata(itp.map(m=>m.skor[k]))*10)/10,
    warna: KMAP[k].songsang ? '--waspada' : tahap(purata(itp.map(m=>m.skor[k]))).warna
  })).sort((a,b)=>b.nilai-a.nilai);

  const kodTop = Object.entries(imk.reduce((o,m)=>{ if(m.kod) o[m.kod]=(o[m.kod]||0)+1; return o; },{}))
    .sort((a,b)=>b[1]-a[1]).slice(0,8);

  return `
  <div class="tajuk-blok">
    <div class="mata">Pelaporan Pentaksiran Psikometrik &middot; Tahun ${DATA.meta.tahun}</div>
    <h1>Semakan pantas keputusan psikometrik seluruh sekolah</h1>
    <p class="perihal">${esc(DATA.meta.sekolah)} (${esc(DATA.meta.kodSekolah)}). ${semua.length} rekod murid daripada dua instrumen — Inventori Minat Kerjaya dan Inventori Tret Personaliti — dalam satu paparan yang boleh dicari, ditapis dan dicetak.</p>
  </div>

  <div class="grid g4" style="margin-bottom:14px">
    ${kadAngka('Jumlah rekod', semua.length, `${kelasBil} kelas &middot; Tingkatan ${[...new Set(semua.map(m=>m.ting))].sort().join(', ')}`, '--brand', IKON.murid)}
    ${kadAngka('Minat Kerjaya (IMK)', imk.length, `${imk.filter(m=>m.status==='DITAKSIR').length} ditaksir`, '--s', IKON.heks)}
    ${kadAngka('Tret Personaliti (ITP)', itp.length, `${KUNCI.length} konstruk setiap murid`, '--i', IKON.bintang)}
    ${kadAngka('Perlu perhatian', bendera.length, `${Math.round(bendera.length/semua.length*100)}% daripada semua rekod`, '--waspada', IKON.awas)}
  </div>

  <div class="grid g-hero" style="margin-bottom:14px">
    <div class="hero">
      <div class="hero-atas">
        <div class="kad-kepala"><div>
          <h2>Heksagon Holland sekolah</h2>
          <p>Purata skor bagi setiap bidang, dikira daripada nilai yang dilaporkan sahaja.</p>
        </div></div>
      </div>
      ${heksagon(komposit, { r:104, tengah:String(imk.length), tengahLbl:'REKOD IMK' })}
      <div style="padding:0 22px 18px">${petunjukHolland()}
      <div class="info" style="margin:14px 0 0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.3"/></svg>
      <p>Laporan PPSi hanya memaparkan <b>tiga mata Holland tertinggi</b> setiap murid. Bidang tanpa skor ditanda &ldquo;—&rdquo; kerana nilainya tidak diterbitkan, bukan bermakna sifar.</p></div></div>
    </div>

    <div style="display:grid;gap:14px;align-content:start">
      <div class="kad">
        <div class="kad-kepala"><div><h2>Bidang dominan</h2><p>Huruf pertama kod Holland setiap murid.</p></div></div>
        ${barMelintang(kerapDom, { w:470, lblW:126, alt:'Kekerapan bidang dominan' })}
      </div>
      <div class="kad">
        <div class="kad-kepala"><div><h2>Kod Holland terkerap</h2><p>Gabungan tiga mata yang paling banyak berulang.</p></div></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${kodTop.map(([k,n])=>`<button class="cip" data-caripintas="${esc(k)}" style="gap:8px">${kodHeks(k)} <b class="mono">${n}</b></button>`).join('')}
        </div>
        <p style="font-size:12px;color:var(--dakwat3);margin:12px 0 0">Klik mana-mana kod untuk terus mencarinya.</p>
      </div>
    </div>
  </div>

  <div class="grid g2">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Kekerapan bidang dalam tiga mata</h2><p>Berapa ramai murid mempunyai bidang ini dalam kod mereka.</p></div></div>
      ${barMelintang(kerapAda, { w:520, lblW:112, alt:'Kekerapan bidang' })}
    </div>
    <div class="kad">
      <div class="kad-kepala"><div><h2>Purata 15 konstruk ITP</h2><p>Peratus purata seluruh sekolah bagi setiap konstruk tret personaliti.</p></div></div>
      ${barMelintang(purataK, { w:520, lblW:150, maks:99, unit:'%', alt:'Purata konstruk ITP' })}
      ${petunjukTahap()}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                        PAPARAN 2 — INVENTORI MINAT KERJAYA                */
/* ======================================================================== */
function vIMK() {
  const simpanJenis = S.jenis; S.jenis = 'IMK';
  const senarai = susun(tapis({ jenis:true })).filter(m=>m.jenis==='IMK');
  S.jenis = simpanJenis;

  const ditaksir = senarai.filter(m=>m.status==='DITAKSIR');
  const komposit = {};
  HOLLAND.forEach(h=>{
    const v = ditaksir.filter(m=>m.skor[h.k]>0).map(m=>m.skor[h.k]);
    komposit[h.k] = v.length ? Math.round(purata(v)*10)/10 : 0;
  });
  const kerapDom = HOLLAND.map(h=>({ label:h.nama, nilai: ditaksir.filter(m=>m.dominan===h.k).length, warna:h.warna }));
  const idx = ditaksir.map(m=>m.indeks);

  const th = (medan, teks, kelas='') =>
    `<th class="boleh ${kelas}"${S.susun.medan===medan?` data-arah="${S.susun.arah}"`:''} data-susun="${medan}">${teks} <span class="ar">${S.susun.medan===medan?(S.susun.arah>0?'▲':'▼'):'⇅'}</span></th>`;

  return `
  <div class="tajuk-blok">
    <div class="mata">Instrumen 1</div>
    <h1>Inventori Minat Kerjaya (IMK)</h1>
    <p class="perihal">Mengenal pasti kecenderungan minat kerjaya murid berdasarkan enam bidang Holland — R, I, A, S, E dan K. Setiap murid menerima kod tiga huruf yang menunjukkan tiga bidang tertinggi.</p>
  </div>

  ${barisTapis({ jenis:false, kod:true })}

  <div class="grid g4" style="margin-bottom:14px">
    ${kadAngka('Rekod dipaparkan', senarai.length, `daripada ${S.murid.filter(m=>m.jenis==='IMK').length} rekod IMK`, '--brand', IKON.murid)}
    ${(()=>{const t=kerapDom.slice().sort((a,b)=>b.nilai-a.nilai)[0];
      return kadAngka('Bidang paling dominan', t&&t.nilai?esc(t.label):'—', `${t?t.nilai:0} murid`, '--s', IKON.heks);})()}
    ${kadAngka('Purata indeks perbezaan', idx.length ? (Math.round(purata(idx)*10)/10) : '—', 'Semakin tinggi, semakin jelas minat', '--i', IKON.bintang)}
    ${kadAngka('Minat kurang jelas', ditaksir.filter(m=>m.indeks<=4).length, 'Indeks perbezaan 4 dan ke bawah', '--waspada', IKON.awas)}
  </div>

  <div class="grid g-hero" style="margin-bottom:14px">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Profil kumpulan terpilih</h2><p>Purata skor Holland bagi ${ditaksir.length} rekod yang sedang dipaparkan.</p></div></div>
      ${heksagon(komposit, { r:100, tengah:String(ditaksir.length), tengahLbl:'MURID' })}
      <div>${petunjukHolland()}</div>
    </div>
    <div style="display:grid;gap:14px;align-content:start">
      <div class="kad">
        <div class="kad-kepala"><div><h2>Sebaran bidang dominan</h2></div></div>
        ${barMelintang(kerapDom.slice().sort((a,b)=>b.nilai-a.nilai), { w:440, lblW:110, alt:'Sebaran bidang dominan' })}
      </div>
      <div class="kad">
        <div class="kad-kepala"><div><h2>Kejelasan minat</h2><p>Berdasarkan indeks perbezaan (skor tertinggi tolak terendah).</p></div></div>
        ${barMelintang([
          { label:'Minat jelas (≥10)', nilai: ditaksir.filter(m=>m.indeks>=10).length, warna:'--tinggi' },
          { label:'Sederhana (5–9)',  nilai: ditaksir.filter(m=>m.indeks>=5&&m.indeks<10).length, warna:'--sederhana' },
          { label:'Kurang jelas (≤4)', nilai: ditaksir.filter(m=>m.indeks<=4).length, warna:'--waspada' }
        ], { w:440, lblW:132, alt:'Kejelasan minat' })}
      </div>
    </div>
  </div>

  <div class="kad" style="padding:0;overflow:hidden">
    <div style="padding:16px 18px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <div><h2>Senarai murid</h2><p style="margin:2px 0 0;font-size:12px;color:var(--dakwat3)">Klik baris untuk membuka profil penuh dan heksagon individu.</p></div>
      <span class="lencana" style="background:var(--papan3);color:var(--dakwat2)">${senarai.length} baris</span>
    </div>
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${senarai.length ? `<table><thead><tr>
        ${th('nama','Nama murid')}${th('kelasPenuh','Kelas')}<th class="tengah">J</th>${th('kod','Kod')}
        ${HOLLAND.map(h=>`<th class="boleh tengah"${S.susun.medan==='h:'+h.k?` data-arah="${S.susun.arah}"`:''} data-susun="h:${h.k}" title="${esc(h.nama)}" style="color:${wv(h.warna)}">${h.k}</th>`).join('')}
        ${th('indeks','Indeks','tengah')}<th>Bidang utama</th>${th('tarikh','Tarikh')}
      </tr></thead><tbody>
      ${senarai.map(m=>`<tr data-id="${esc(m.id)}">
        <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td>
        <td>${esc(m.kelasPenuh)}</td>
        <td class="tengah mono">${m.jantina}</td>
        <td>${m.status==='DITAKSIR' ? kodHeks(m.kod) : `<span class="lencana" style="background:color-mix(in srgb,var(--waspada) 14%,transparent);color:var(--waspada)">TD</span>`}</td>
        ${HOLLAND.map(h=>{
          const v = m.skor[h.k]||0;
          return v ? `<td class="sel-skor"><span class="sk s-${h.k}" style="--o:${(0.12+v/30*0.42).toFixed(2)}">${v}</span></td>`
                   : `<td class="sel-skor"><span class="sk sk-kosong">—</span></td>`;
        }).join('')}
        <td class="tengah mono" style="font-weight:700;color:${wv(kategoriIndeks(m.indeks).warna)}">${m.status==='DITAKSIR'?m.indeks:'—'}</td>
        <td style="font-size:12px;color:var(--dakwat2)">${m.status==='DITAKSIR' ? esc((m.bidang||[])[0]||'') : esc(m.sebab||'Tidak ditaksir')}</td>
        <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td>
      </tr>`).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                       PAPARAN 3 — INVENTORI TRET PERSONALITI              */
/* ======================================================================== */
function vITP() {
  const simpanJenis = S.jenis; S.jenis = 'ITP';
  const senarai = susun(tapis({ jenis:true })).filter(m=>m.jenis==='ITP');
  S.jenis = simpanJenis;

  const purataK = {};
  KUNCI.forEach(k => purataK[k] = senarai.length ? Math.round(purata(senarai.map(m=>m.skor[k]))) : 0);
  const barK = KUNCI.map(k=>({
    label:`${k} · ${KMAP[k].nama}`, nilai:purataK[k],
    warna: KMAP[k].songsang ? '--waspada' : tahap(purataK[k]).warna
  }));

  // peta haba kelas x konstruk
  const kelasList = [...new Set(senarai.map(m=>m.kelasPenuh))].sort();
  const matriks = kelasList.map(kl => KUNCI.map(k => Math.round(purata(senarai.filter(m=>m.kelasPenuh===kl).map(m=>m.skor[k])))));

  const kd = senarai.filter(m=>m.skor.KD>=80).length;
  const ktn = senarai.filter(m=>m.skor.KTN>=50).length;

  const th = (medan, teks, kelas='') =>
    `<th class="boleh ${kelas}"${S.susun.medan===medan?` data-arah="${S.susun.arah}"`:''} data-susun="${medan}">${teks} <span class="ar">${S.susun.medan===medan?(S.susun.arah>0?'▲':'▼'):'⇅'}</span></th>`;

  return `
  <div class="tajuk-blok">
    <div class="mata">Instrumen 2</div>
    <h1>Inventori Tret Personaliti (ITP)</h1>
    <p class="perihal">Lima belas konstruk personaliti dilaporkan dalam peratus. Tafsiran PPSi: 70–99% tinggi, 40–60% sederhana, 1–30% rendah. Dua konstruk dibaca secara songsang — Kritik Diri dan Ketelusan.</p>
  </div>

  ${barisTapis({ jenis:false })}

  <div class="grid g4" style="margin-bottom:14px">
    ${kadAngka('Rekod dipaparkan', senarai.length, `daripada ${S.murid.filter(m=>m.jenis==='ITP').length} rekod ITP`, '--brand', IKON.murid)}
    ${kadAngka('Konstruk tertinggi', barK.filter(b=>!KMAP[b.label.split(' · ')[0]].songsang).sort((a,b)=>b.nilai-a.nilai)[0]?.label.split(' · ')[1] || '—', `purata ${barK.filter(b=>!KMAP[b.label.split(' · ')[0]].songsang).sort((a,b)=>b.nilai-a.nilai)[0]?.nilai || 0}%`, '--tinggi', IKON.bintang)}
    ${kadAngka('Kritik diri ≥ 80%', kd, 'Cadangan rujuk guru kaunseling', '--waspada', IKON.awas)}
    ${kadAngka('Ketelusan ≥ 50%', ktn, 'Dapatan perlu disahkan semula', '--sederhana', IKON.awas)}
  </div>

  <div class="grid g-hero" style="margin-bottom:14px">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Kipas konstruk kumpulan</h2><p>Purata peratus setiap konstruk bagi ${senarai.length} rekod yang dipaparkan.</p></div></div>
      ${kipas(purataK, { tengah:String(senarai.length), tengahLbl:'REKOD' })}
      ${petunjukTahap()}
    </div>
    <div class="kad">
      <div class="kad-kepala"><div><h2>Purata setiap konstruk</h2><p>Disusun mengikut skor tertinggi.</p></div></div>
      ${barMelintang(barK.slice().sort((a,b)=>b.nilai-a.nilai), { w:520, lblW:150, maks:99, unit:'%', alt:'Purata konstruk' })}
    </div>
  </div>

  ${kelasList.length > 1 ? `<div class="kad" style="margin-bottom:14px">
    <div class="kad-kepala"><div><h2>Peta haba kelas &times; konstruk</h2><p>Purata peratus setiap kelas. Semakin gelap, semakin tinggi skor.</p></div></div>
    <div style="overflow-x:auto">${petaHaba(kelasList, KUNCI, matriks, { alt:'Peta haba kelas lawan konstruk' })}</div>
    ${petunjukTahap()}
  </div>` : ''}

  <div class="kad" style="padding:0;overflow:hidden">
    <div style="padding:16px 18px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <div><h2>Senarai murid</h2><p style="margin:2px 0 0;font-size:12px;color:var(--dakwat3)">Setiap sel berwarna mengikut tahap. Klik baris untuk profil penuh.</p></div>
      <span class="lencana" style="background:var(--papan3);color:var(--dakwat2)">${senarai.length} baris</span>
    </div>
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${senarai.length ? `<table><thead><tr>
        ${th('nama','Nama murid')}${th('kelasPenuh','Kelas')}<th class="tengah">J</th>
        ${KUNCI.map(k=>`<th class="boleh tengah"${S.susun.medan==='h:'+k?` data-arah="${S.susun.arah}"`:''} data-susun="h:${k}" title="${esc(KMAP[k].nama)}"${KMAP[k].songsang?' style="color:var(--waspada)"':''}>${k}</th>`).join('')}
        ${th('purata','Purata','tengah')}${th('tarikh','Tarikh')}
      </tr></thead><tbody>
      ${senarai.map(m=>`<tr data-id="${esc(m.id)}">
        <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td>
        <td>${esc(m.kelasPenuh)}</td>
        <td class="tengah mono">${m.jantina}</td>
        ${KUNCI.map(k=>{
          const v = m.skor[k];
          const bahaya = (k==='KD'&&v>=80)||(k==='KTN'&&v>=50);
          const kls = bahaya ? 'k-W' : 'k-' + tahap(v).k;
          return `<td class="sel-skor"><span class="sk ${kls}${v>=70?' pekat':''}" style="--o:${(0.10+v/99*0.48).toFixed(2)}">${v}</span></td>`;
        }).join('')}
        <td class="tengah mono" style="font-weight:700">${m.purata}</td>
        <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td>
      </tr>`).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>`;
}

/* ======================================================================== */
/*                          PAPARAN 4 — ANALISIS KELAS                       */
/* ======================================================================== */
function vKelas() {
  const senarai = susun(tapis());
  const kelasList = [...new Set(senarai.map(m=>m.kelasPenuh))].sort();

  const imkKelas = kelasList.filter(k=>senarai.some(m=>m.kelasPenuh===k&&m.jenis==='IMK'));
  const itpKelas = kelasList.filter(k=>senarai.some(m=>m.kelasPenuh===k&&m.jenis==='ITP'));

  const siriDom = HOLLAND.map(h=>({
    nama:h.nama, warna:h.warna,
    nilai: imkKelas.map(kl=>senarai.filter(m=>m.kelasPenuh===kl&&m.dominan===h.k).length)
  }));

  const matriks = itpKelas.map(kl => KUNCI.map(k => Math.round(purata(senarai.filter(m=>m.kelasPenuh===kl&&m.jenis==='ITP').map(m=>m.skor[k])))));

  const jadual = kelasList.map(kl=>{
    const ahli = senarai.filter(m=>m.kelasPenuh===kl);
    const i = ahli.filter(m=>m.jenis==='IMK'), t = ahli.filter(m=>m.jenis==='ITP');
    const dom = HOLLAND.map(h=>({k:h.k, n:i.filter(m=>m.dominan===h.k).length})).sort((a,b)=>b.n-a.n)[0];
    return {
      kelas:kl, bil:ahli.length, L:ahli.filter(m=>m.jantina==='L').length, P:ahli.filter(m=>m.jantina==='P').length,
      imk:i.length, itp:t.length,
      dom: dom && dom.n ? dom.k : '', 
      indeks: i.length ? Math.round(purata(i.filter(m=>m.status==='DITAKSIR').map(m=>m.indeks))*10)/10 : null,
      pur: t.length ? Math.round(purata(t.map(m=>m.purata))*10)/10 : null,
      kd: t.filter(m=>m.skor.KD>=80).length,
      flag: ahli.filter(m=>isyarat(m).length).length
    };
  });

  return `
  <div class="tajuk-blok">
    <div class="mata">Perbandingan</div>
    <h1>Analisis kelas</h1>
    <p class="perihal">Bandingkan corak minat dan tret personaliti antara kelas untuk perancangan bimbingan, pemilihan aliran dan aktiviti kokurikulum.</p>
  </div>

  ${barisTapis()}

  <div class="kad" style="margin-bottom:14px;padding:0;overflow:hidden">
    <div style="padding:16px 18px 12px"><h2>Ringkasan setiap kelas</h2>
      <p style="margin:2px 0 0;font-size:12px;color:var(--dakwat3)">Nilai kosong bermakna instrumen tersebut tidak ditadbir bagi kelas itu.</p></div>
    <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
      ${jadual.length ? `<table><thead><tr>
        <th>Kelas</th><th class="tengah">Rekod</th><th class="tengah">L</th><th class="tengah">P</th>
        <th class="tengah">IMK</th><th class="tengah">ITP</th><th>Bidang dominan</th>
        <th class="tengah">Purata indeks</th><th>Purata tret</th><th class="tengah">Kritik diri ≥80</th><th class="tengah">Isyarat</th>
      </tr></thead><tbody>
      ${jadual.map(r=>`<tr style="cursor:default">
        <td class="nm" style="min-width:auto">${esc(r.kelas)}</td>
        <td class="tengah mono">${r.bil}</td><td class="tengah mono">${r.L}</td><td class="tengah mono">${r.P}</td>
        <td class="tengah mono">${r.imk||'—'}</td><td class="tengah mono">${r.itp||'—'}</td>
        <td>${r.dom?`${kodHeks(r.dom)} <span style="font-size:12px;color:var(--dakwat2)">${esc(HMAP[r.dom].nama)}</span>`:'—'}</td>
        <td class="tengah mono">${r.indeks ?? '—'}</td>
        <td>${r.pur!==null?`<div style="display:flex;align-items:center;gap:8px"><span class="mono" style="font-weight:700;min-width:34px">${r.pur}%</span><div class="bar-mini" style="flex:1"><i style="width:${r.pur}%;background:${wv(tahap(r.pur).warna)}"></i></div></div>`:'—'}</td>
        <td class="tengah mono" style="${r.kd?'color:var(--waspada);font-weight:700':''}">${r.itp?r.kd:'—'}</td>
        <td class="tengah mono" style="${r.flag?'color:var(--sederhana);font-weight:700':''}">${r.flag}</td>
      </tr>`).join('')}
      </tbody></table>` : jadualKosong()}
    </div>
  </div>

  ${imkKelas.length ? `<div class="kad" style="margin-bottom:14px">
    <div class="kad-kepala"><div><h2>Bidang dominan mengikut kelas</h2><p>Bilangan murid bagi setiap bidang Holland.</p></div></div>
    ${barMenegak(imkKelas, siriDom, { w:Math.max(620, imkKelas.length*105), h:260, alt:'Bidang dominan mengikut kelas' })}
    ${petunjukHolland()}
  </div>` : ''}

  ${itpKelas.length ? `<div class="kad">
    <div class="kad-kepala"><div><h2>Purata konstruk mengikut kelas</h2><p>Guna paparan ini untuk mengenal pasti kelas yang perlu intervensi tertentu.</p></div></div>
    <div style="overflow-x:auto">${petaHaba(itpKelas, KUNCI, matriks, { alt:'Purata konstruk mengikut kelas' })}</div>
    ${petunjukTahap()}
  </div>` : ''}`;
}

/* ======================================================================== */
/*                        PAPARAN 5 — PERLU PERHATIAN                        */
/* ======================================================================== */
function vPerhatian() {
  const senarai = susun(tapis()).map(m=>({ m, f:isyarat(m) })).filter(o=>o.f.length);
  const kump = {};
  senarai.forEach(o=>o.f.forEach(f=>{ (kump[f.jenis] = kump[f.jenis] || []).push({ ...o, f }); }));
  const jenisSenarai = Object.entries(kump).sort((a,b)=>b[1].length-a[1].length);

  return `
  <div class="tajuk-blok">
    <div class="mata">Tindakan susulan</div>
    <h1>Murid yang perlu perhatian</h1>
    <p class="perihal">Senarai ini dijana secara automatik daripada kriteria dalam laporan PPSi dan panduan tafsiran. Ia titik permulaan perbincangan, bukan diagnosis — sahkan setiap kes melalui temu bual dengan murid dan guru kaunseling.</p>
  </div>

  <div class="amaran">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 9.5v5M12 17.2v.3"/></svg>
    <div><b>Maklumat sensitif</b>
    <p>Paparan ini mengandungi nama murid bersama isyarat kesejahteraan. Jangan kongsi tangkap layar paparan ini di luar mesyuarat rasmi, dan hadkan capaian kepada guru yang terlibat sahaja.</p></div>
  </div>

  ${barisTapis()}

  <div class="grid g4" style="margin-bottom:14px">
    ${jenisSenarai.slice(0,4).map(([j,arr],i)=>kadAngka(j, arr.length, 'murid dikenal pasti',
      arr[0].f.aras==='waspada'?'--waspada':'--sederhana', IKON.awas)).join('')}
  </div>

  ${jenisSenarai.length ? jenisSenarai.map(([j,arr])=>`
    <div class="kad" style="margin-bottom:14px;padding:0;overflow:hidden">
      <div style="padding:15px 18px 11px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <div><h2>${esc(j)}</h2><p style="margin:2px 0 0;font-size:12px;color:var(--dakwat2);max-width:70ch">${esc(KRITERIA[j]||'')}</p></div>
        <span class="lencana" style="background:color-mix(in srgb,${arr[0].f.aras==='waspada'?'var(--waspada)':'var(--sederhana)'} 15%,transparent);color:${arr[0].f.aras==='waspada'?'var(--waspada)':'var(--sederhana)'}">${arr.length} murid</span>
      </div>
      <div class="jadual-bekas" style="border:0;border-top:1px solid var(--garis);border-radius:0">
        <table><thead><tr><th>Nama murid</th><th>Kelas</th><th class="tengah">Instrumen</th><th>Butiran</th><th>Tarikh</th></tr></thead><tbody>
        ${arr.map(({m,f})=>`<tr data-id="${esc(m.id)}">
          <td class="nm">${esc(m.nama)}<small>${icPapar(m.ic)}</small></td>
          <td>${esc(m.kelasPenuh)}</td>
          <td class="tengah"><span class="lencana" style="background:var(--papan3);color:var(--dakwat2)">${m.jenis}</span></td>
          <td style="font-size:12.5px;color:var(--dakwat2)">${esc(f.huraian)}</td>
          <td class="mono" style="font-size:11.5px;color:var(--dakwat3);white-space:nowrap">${tarikhPapar(m.tarikh)}</td>
        </tr>`).join('')}
        </tbody></table>
      </div>
    </div>`).join('') : `<div class="kad">${jadualKosong('Tiada murid memenuhi kriteria isyarat dalam penapis semasa.')}</div>`}`;
}

/* ======================================================================== */
/*                        PAPARAN 6 — DATA & SANDARAN                        */
/* ======================================================================== */
function vData() {
  const senarai = tapis();
  return `
  <div class="tajuk-blok">
    <div class="mata">Pengurusan data</div>
    <h1>Data dan sandaran</h1>
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
        <button class="ikon-btn" data-eksport="TAPIS">Muat turun hasil penapis</button>
      </div>
      <p style="font-size:12px;color:var(--dakwat3);margin:12px 0 0">Nombor pengenalan dieksport penuh tanpa mengira tetapan penyamaran pada paparan.</p>
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
    <h1>Panduan tafsiran dan penggunaan</h1>
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

  <div class="grid g2">
    <div class="kad">
      <div class="kad-kepala"><div><h2>Cara mencari</h2><p>Satu medan carian merentas semua medan.</p></div></div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:var(--dakwat2);line-height:1.8">
        <li>Nama penuh atau sebahagian nama: <code>nurul</code></li>
        <li>Kelas: <code>4 bestari</code>, <code>tingkatan 2</code></li>
        <li>Kod Holland: <code>SKR</code>, atau nama bidang: <code>artistik</code></li>
        <li>Konstruk ITP: <code>kepimpinan tinggi</code>, <code>resilien rendah</code></li>
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
          const h = HOLLAND.find(x=>x.nama===b) || {};
          return `<article style="border-left-color:${wv(h.warna||'--rendah')}">
            <h4><span class="kod-heks"><i style="background:${wv(h.warna||'--rendah')}">${esc(h.k||'?')}</i></span> Bidang ${i+1}: ${esc(b)}
            <span class="lencana" style="background:color-mix(in srgb,${wv(h.warna||'--rendah')} 15%,transparent);color:${wv(h.warna||'--rendah')}">${m.skor[h.k]||0} mata</span></h4>
            <p>${esc(h.ringkas||'')}</p>
            <p style="margin-top:4px;color:var(--dakwat3);font-size:11.5px"><b>Contoh kerjaya:</b> ${esc(h.kerjaya||'')}</p></article>`;
        }).join('')}
      </div>` : `<div class="amaran"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4 3 19h18z"/><path d="M12 10v4M12 16.5v.3"/></svg>
        <div><b>Murid tidak ditaksir</b><p>${esc(m.sebab||'Tiada sebab direkodkan.')}</p></div></div>`;
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
        <div class="mata">${m.jenis === 'IMK' ? 'Inventori Minat Kerjaya' : 'Inventori Tret Personaliti'}</div>
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
          : `<div><dt>Purata 13 tret</dt><dd>${m.purata}%</dd></div><div><dt>Ketelusan</dt><dd>${m.skor.KTN}%</dd></div>`}
      </dl>

      ${f.length ? f.map(x=>`<div class="${x.aras==='waspada'?'amaran':'info'}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 9.5v5M12 17.2v.3"/></svg>
        <div><b>${esc(x.jenis)}</b><p>${esc(x.huraian)}</p></div></div>`).join('') : ''}

      ${isi}

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
  } else {
    kepala = ['NAMA','NO_PENGENALAN','JANTINA','TINGKATAN','KELAS','KELAS_PENUH','TARIKH',...KUNCI,'PURATA_13_KONSTRUK','ISYARAT'];
    baris = rekod.map(m=>[m.nama,m.ic,m.jantina,m.ting,m.kelas,m.kelasPenuh,m.tarikh,
      ...KUNCI.map(k=>m.skor[k]??''), m.purata, isyarat(m).map(x=>x.jenis).join('; ')]);
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
  if (mod === 'IMK' || mod === 'ITP') {
    const r = S.murid.filter(m=>m.jenis===mod);
    turun(`PPSi_${mod}_${DATA.meta.tahun}_${cap}.csv`, keCSV(r, mod));
  } else {
    const r = tapis();
    const imk = r.filter(m=>m.jenis==='IMK'), itp = r.filter(m=>m.jenis==='ITP');
    if (imk.length) turun(`PPSi_IMK_tapisan_${cap}.csv`, keCSV(imk,'IMK'));
    if (itp.length) setTimeout(()=>turun(`PPSi_ITP_tapisan_${cap}.csv`, keCSV(itp,'ITP')), 600);
    if (!imk.length && !itp.length) alert('Tiada rekod dalam penapis semasa untuk dieksport.');
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
  if (jk) jk.textContent = `${bhg.hour}:${bhg.minute} · ${bhg.day}/${bhg.month}`;
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
  simpan('ppsi-tema', t);
}

/* ======================================================================== */
/*                            NAVIGASI DAN LUKISAN                           */
/* ======================================================================== */
const PAPARAN = { papan:vPapan, imk:vIMK, itp:vITP, kelas:vKelas, perhatian:vPerhatian, data:vData, panduan:vPanduan };
const TAJUK = { papan:'Papan Utama', imk:'Inventori Minat Kerjaya', itp:'Inventori Tret Personaliti',
                kelas:'Analisis Kelas', perhatian:'Murid Perlu Perhatian', data:'Data & Sandaran', panduan:'Panduan' };

function lukis() {
  const el = $('#v-' + S.papar);
  if (!el) return;
  el.innerHTML = PAPARAN[S.papar]();
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
  $('#kira-flag').textContent = S.murid.filter(m=>isyarat(m).length).length;
  ikat(el);
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
  const r = $('#btn-reset', root);
  if (r) r.onclick = () => {
    S.jenis='SEMUA'; S.ting='SEMUA'; S.kelas='SEMUA'; S.jantina='SEMUA'; S.tapisKod=''; S.cari='';
    $('#cari').value=''; kemasCari(); lukis();
  };
}

function kemasCari() { $('#bekas-cari').classList.toggle('ada', !!$('#cari').value); }

function pergi(p) {
  if (!PAPARAN[p]) p = 'papan';
  tutupProfil();
  S.papar = p;
  if (location.hash.slice(1) !== p) history.replaceState(null, '', '#' + p);
  lukis();
  window.scrollTo({ top:0, behavior:'instant' });
  $('#sisi').classList.remove('buka');
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

  $('#cari').addEventListener('input', e => { S.cari = e.target.value; kemasCari(); lukis(); });
  $('#btn-kosong').onclick = () => { $('#cari').value=''; S.cari=''; kemasCari(); lukis(); $('#cari').focus(); };
  $('#btn-tema').onclick = () => setTema(document.documentElement.dataset.tema === 'malam' ? 'siang' : 'malam');
  $('#btn-ic').onclick = () => {
    S.tunjukIC = !S.tunjukIC;
    simpan('ppsi-ic', S.tunjukIC ? '1' : '0');
    $('#teks-ic').textContent = S.tunjukIC ? 'Sembunyikan No. Pengenalan' : 'Papar No. Pengenalan';
    lukis();
  };
  $('#btn-csv').onclick = () => eksport('TAPIS');
  $('#btn-sisi').onclick = () => $('#sisi').classList.toggle('buka');
  $('#tudung').onclick = tutupProfil;

  $$('#nav a').forEach(a=>{ a.onclick = e => { e.preventDefault(); pergi(a.dataset.pergi); }; });
  window.addEventListener('hashchange', () => pergi(location.hash.slice(1) || 'papan'));

  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape') { tutupProfil(); $('#sisi').classList.remove('buka'); }
    if (e.key === '/' && document.activeElement !== $('#cari')) { e.preventDefault(); $('#cari').focus(); }
  });

  pergi(location.hash.slice(1) || 'papan');
  muatSheet();
}
document.addEventListener('DOMContentLoaded', mula);
