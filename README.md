# Dashboard PPSi 2026 — SMK Dato' Undang Musa Al-Haj

Papan pemantauan interaktif untuk **Pelaporan Pentaksiran Psikometrik (PPSi)** Tahun 2026: Inventori Minat Kerjaya (IMK) dan Inventori Tret Personaliti (ITP).

**477 rekod** &middot; 18 kelas &middot; Tingkatan 1, 2, 4 dan 5 &middot; Kod sekolah NEA0025

---

## Baca dahulu: perlindungan data murid

Fail `data.js` mengandungi **nama penuh dan nombor pengenalan 477 murid bawah umur**, bersama isyarat kesejahteraan seperti skor Kritik Diri. Jika repositori GitHub ditetapkan sebagai *public*, semua maklumat ini boleh dibaca oleh sesiapa sahaja dan diindeks oleh Google.

Tiga pilihan penerbitan:

| Pilihan | Cara | Sesuai untuk |
|---|---|---|
| **A — Repositori privasi (disyorkan)** | Tetapkan repo sebagai *Private*. Buka `index.html` terus dari komputer, atau hidupkan GitHub Pages (perlu langganan GitHub Pro untuk repo privasi). | Kegunaan harian dengan data sebenar |
| **B — Terbitan awam tanpa data peribadi** | Namakan semula `data_awam.js` kepada `data.js` sebelum tolak ke GitHub. Nama bertukar kepada inisial dan nombor pengenalan dibuang. Semua graf dan analisis kekal berfungsi. | Pertandingan inovasi, perkongsian amalan terbaik, demonstrasi |
| **C — Awam + Sheet privasi** | Jangan tolak `data.js` sama sekali (masukkan dalam `.gitignore`), muatkan data dari Google Sheet. Ambil perhatian: Sheet yang *diterbitkan ke web* juga terbuka kepada umum. | Hanya jika Sheet dikawal melalui Apps Script berkebenaran |

Aplikasi ini **menyamarkan nombor pengenalan secara lalai**. Tekan *Papar No. Pengenalan* di sidebar hanya apabila perlu.

---

## Fail dalam repositori

| Fail | Fungsi |
|---|---|
| `index.html` | Rangka dan gaya. Buka fail ini untuk menjalankan aplikasi. |
| `app.js` | Semua logik: carian, penapis, graf SVG, cetakan, tema. |
| `data.js` | Data penuh (nama sebenar + nombor pengenalan). |
| `data_awam.js` | Data tanpa maklumat peribadi, untuk penerbitan awam. |
| `IMK_2026.csv`, `ITP_2026.csv` | Untuk diimport ke Google Sheet. |
| `.nojekyll` | Memberitahu GitHub Pages supaya tidak memproses fail melalui Jekyll. |

**Tiada CDN, tiada pustaka luar, tiada pemasangan.** Semua graf dilukis sendiri dalam SVG dan fon menggunakan fon sistem, jadi laman tetap berfungsi walaupun rangkaian sekolah menyekat sumber luar — dan boleh dibuka terus dari fail tanpa pelayan.

---

## Terbitkan di GitHub Pages

1. Buat repositori baharu, contohnya `ppsi-smkduma`.
2. Muat naik `index.html`, `app.js`, `data.js` (atau `data_awam.js` yang dinamakan semula) dan `.nojekyll` ke root repositori.
3. Pergi ke **Settings → Pages**.
4. *Source*: **Deploy from a branch**. *Branch*: `main`, folder `/ (root)`. Tekan **Save**.
5. Tunggu satu hingga dua minit. Laman terbit di `https://<nama-anda>.github.io/ppsi-smkduma/`

---

## Sandaran ke Google Sheet

**Sandaran sahaja** (cukup untuk simpanan):

1. Tekan *Muat turun CSV* dalam aplikasi, atau guna `IMK_2026.csv` dan `ITP_2026.csv`.
2. Google Sheet baharu → **Fail → Import** → pilih CSV → letakkan pada dua helaian berasingan bernama `IMK` dan `ITP`.

**Jadikan Sheet sumber data langsung** (pilihan, supaya cukup sunting Sheet sahaja):

3. **Fail → Kongsi → Terbitkan ke web** → pilih helaian `IMK` → format **Nilai dipisahkan koma (.csv)** → salin pautan. Ulang untuk helaian `ITP`.
4. Buka `app.js`, isikan pada bahagian `CONFIG` di baris pertama:

```js
const CONFIG = {
  SHEET_IMK_CSV: 'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
  SHEET_ITP_CSV: 'https://docs.google.com/.../pub?gid=1&single=true&output=csv',
  SHEET_PAUTAN:  'https://docs.google.com/spreadsheets/d/.../edit',
  ZON: 'Asia/Kuala_Lumpur'
};
```

5. Tolak semula ke GitHub. Jika tarikan gagal, aplikasi kembali kepada `data.js` secara automatik supaya paparan tidak pernah kosong.

Nama lajur dalam Sheet mesti kekal sama seperti dalam CSV (`NAMA`, `KELAS_PENUH`, `AUT`, `KTF`, dan seterusnya) kerana `app.js` memadankan lajur mengikut nama, bukan kedudukan.

---

## Yang ada dalam aplikasi

**Tujuh paparan** — Papan Utama, Inventori Minat Kerjaya, Inventori Tret Personaliti, Analisis Kelas, Perlu Perhatian, Data &amp; Sandaran, Panduan.

**Carian satu medan** merentas nama, kelas, tingkatan, kod Holland, nama bidang, konstruk ITP, contoh kerjaya dan isyarat perhatian. Frasa penuh diberi keutamaan, jadi `kritik diri tinggi` memulangkan murid berkenaan sahaja dan bukan setiap rekod yang mengandungi kata "tinggi".

**Graf yang dilukis sendiri** — heksagon Holland, kipas 15 konstruk, bar melintang, bar berkumpulan mengikut kelas, dan peta haba kelas &times; konstruk.

**Kod warna** — enam warna tetap bagi bidang Holland; hijau-biru untuk tahap tinggi, ambar untuk sederhana, kelabu untuk rendah, merah untuk item yang perlu perhatian.

**Mod siang dan malam**, jam serta tarikh langsung waktu Malaysia, cetakan A4 (paparan penuh atau satu profil individu), eksport CSV, dan penyamaran nombor pengenalan.

**Pintasan** — `/` untuk ke medan carian, `Esc` untuk menutup panel, klik tajuk lajur untuk menyusun.

---

## Isyarat "Perlu Perhatian"

Senarai ini dijana automatik daripada laporan PPSi:

| Isyarat | Kriteria |
|---|---|
| Kritik diri tinggi | KD ≥ 80% — panduan PPSi mencadangkan rujukan kepada guru bimbingan dan kaunseling |
| Kritik diri perlu dipantau | KD 70–79% |
| Ketelusan rendah | KTN ≥ 50% — dapatan tret mungkin tidak menepati personaliti sebenar |
| Resilien rendah | RSL ≤ 30% |
| Minat kurang jelas | Indeks perbezaan IMK ≤ 4 |
| Tidak ditaksir | Tiada keputusan dalam laporan |

Ambang **Kritik Diri ≥ 80%** dan **Ketelusan ≥ 50%** diambil terus daripada nota tafsiran laporan PPSi. Ambang **Resilien ≤ 30%** dan **indeks perbezaan ≤ 4** ialah ambang kerja yang ditetapkan untuk memudahkan tapisan, bukan pengelasan rasmi KPM — ubah nilainya dalam fungsi `isyarat()` di `app.js` jika sekolah mahu ambang lain.

Senarai ini titik permulaan perbincangan, bukan diagnosis.

---

## Nota tentang data

- Laporan PPSi **hanya menerbitkan tiga mata Holland tertinggi** setiap murid. Tiga bidang yang lain ditanda "—" kerana nilainya tidak ada dalam laporan, bukan bermakna sifar. Heksagon melukis nilai yang dilaporkan sahaja.
- Skor ITP dilaporkan pada band tetap: 1, 10, 20, 30, 40, 50, 60, 70, 80, 90 dan 99 peratus.
- Lajur jantina diterbitkan daripada digit terakhir nombor pengenalan (ganjil lelaki, genap perempuan). Dua rekod tidak dapat ditentukan dan dipaparkan sebagai "—".
- Purata tret ITP mengira **13 konstruk** sahaja; Kritik Diri dan Ketelusan dikecualikan kerana kedua-duanya dibaca secara songsang.
- IMK ditadbir kepada Tingkatan 1 dan 5; ITP kepada Tingkatan 2 dan 4. Sel kosong dalam Analisis Kelas bermakna instrumen itu tidak ditadbir bagi kelas tersebut.

---

## Mengemas kini untuk tahun berikutnya

Muat turun PDF bundle baharu dari `moeissppb.moe.gov.my`, kemudian pilih satu:

- **Melalui Google Sheet** — kemas kini baris dalam Sheet. Laman terus mengikut, tiada kod perlu disentuh.
- **Melalui `data.js`** — gantikan fail itu dengan struktur yang sama. Setiap rekod memerlukan `id`, `jenis` (`IMK` atau `ITP`), `nama`, `ic`, `jantina`, `ting`, `kelas`, `kelasPenuh`, `tarikh`, `status` dan objek `skor`.

---

Sumber data: Pelaporan Pentaksiran Psikometrik (PPSi), Kementerian Pendidikan Malaysia.
