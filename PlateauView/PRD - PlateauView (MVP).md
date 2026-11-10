# PRD — PlateauView (MVP)

Nov 10, 2026 · @farhan · Status: Draft v0.1

## 1. Ringkasan

PlateauView adalah website interaktif berbentuk **globe 3D** yang menampilkan pergerakan benua/lempeng bumi dari awal terbentuknya bumi (±4,6 miliar tahun lalu), masa kini, sampai proyeksi masa depan (±250 juta tahun ke depan). Pengguna mengontrol waktu lewat **slider**, bisa memutar animasi dengan **tombol play**, dan selalu melihat **label era** geologi yang sedang aktif.

MVP hanya berisi fitur inti tersebut. Penjelasan era dan makhluk hidup per daerah masuk pengembangan lanjutan.

## 2. Tujuan & Non-Tujuan

**Tujuan MVP**

- Menampilkan posisi benua di globe 3D untuk rentang waktu yang didukung data.
- Pengguna bisa berpindah waktu dengan mulus (slider) dan menonton animasinya (play/pause).
- Pengguna selalu tahu sedang berada di era/periode apa dan berapa juta tahun lalu.
- Bisa dipakai sebagai media ajar di kelas dan bahan konten edukasi.

**Non-tujuan MVP (ditunda)**

- Penjelasan detail tiap era.
- Makhluk hidup per daerah/era.
- Akun pengguna, kuis, multi-bahasa.
- Simulasi fisika lempeng sendiri (MVP memakai data rekonstruksi yang sudah ada).

## 3. Pengguna & Skenario Penggunaan

| Pengguna | Skenario |
| --- | --- |
| Guru | Menampilkan globe di proyektor, memutar animasi Pangaea pecah sambil menjelaskan. |
| Siswa SMP/SMA | Menggeser slider sendiri untuk melihat posisi Indonesia/benua di era tertentu. |
| Penonton konten edukasi | Membuka link dari media sosial, langsung menekan play, menonton 1–2 menit. |

## 4. Fitur Inti (Requirement Fungsional)

### F1 — Globe 3D

- Globe bisa diputar (drag), di-zoom (scroll/pinch), dan berputar pelan otomatis saat idle.
- Menampilkan poligon daratan/benua pada waktu terpilih; laut sebagai warna dasar globe.
- Garis pantai masa kini bisa ditampilkan tipis sebagai pembanding (toggle, default mati).
- Saat waktu berubah, poligon diganti dengan transisi halus (crossfade), bukan berkedip.

### F2 — Slider Waktu

- Rentang: **−4.600 juta tahun (Ma) sampai +250 Ma**, dengan 0 = masa kini.
- Skala **tidak linier** (dibagi 3 segmen) supaya bagian yang ada datanya mendapat ruang lebih besar:

| Segmen | Rentang | Porsi lebar slider | Sifat tampilan |
| --- | --- | --- | --- |
| A. Bumi awal | 4.600–1.000 Ma lalu | ±15% | Ilustratif (tahapan, bukan peta akurat) |
| B. Rekonstruksi | 1.000 Ma lalu – kini | ±70% | Berdasarkan data rekonstruksi |
| C. Masa depan | kini – +250 Ma | ±15% | Skenario/proyeksi, diberi label jelas |

- Angka waktu tampil di atas thumb slider, contoh: "200 juta tahun lalu" / "Masa kini" / "+100 juta tahun".
- Tick marks di batas era utama.
- Kontrol keyboard: panah kiri/kanan untuk langkah kecil, Shift + panah untuk langkah besar.

### F3 — Tombol Play/Pause

- Play memutar waktu maju dari posisi saat ini sampai ujung slider, lalu berhenti.
- Pilihan kecepatan: 0,5×, 1×, 2×. Pada 1×, satu putaran penuh segmen B ±60 detik.
- Menggeser slider saat animasi berjalan otomatis menjeda animasi.
- Tombol reset ke awal (−4.600 Ma) dan tombol lompat ke "Masa kini".

### F4 — Label Era

- Panel kecil selalu terlihat, menampilkan: **Eon → Era → Periode** yang aktif, contoh: Fanerozoikum › Mesozoikum › Jura.
- Penanda superbenua bila sedang aktif: Rodinia, Pannotia, Pangaea; serta skenario masa depan (mis. Pangaea Proxima).
- Pada segmen C, muncul badge **"Proyeksi — bukan data pasti"**.
- Pita warna era di sepanjang slider (warna mengikuti standar skala waktu geologi ICS).

**Data era (acuan ICS, dibulatkan)**

| Unit | Mulai (Ma lalu) |
| --- | --- |
| Hadean | 4.600 |
| Arkean | 4.000 |
| Proterozoikum | 2.500 |
| Kambrium | 538,8 |
| Ordovisium | 485,4 |
| Silur | 443,8 |
| Devon | 419,2 |
| Karbon | 358,9 |
| Perm | 298,9 |
| Trias | 251,9 |
| Jura | 201,4 |
| Kapur | 145 |
| Paleogen | 66 |
| Neogen | 23,03 |
| Kuarter | 2,58 |

## 5. Data & Sumber

- **Segmen B (data):** GeoJSON garis pantai/benua hasil rekonstruksi dari **GPlates Web Service** atau pyGPlates. Kandidat model: Merdith dkk. 2021 (mencakup ±1.000 Ma) dan Müller dkk. 2019 (±250 Ma, lebih detail). Model final dipilih setelah uji coba.
- **Segmen A (ilustratif):** 4–6 keyframe buatan sendiri: bumi cair/lautan magma, kerak pertama, kraton purba, Columbia/Nuna. Diberi label "ilustrasi".
- **Segmen C (proyeksi):** 3–5 keyframe berdasarkan skenario ilmiah yang dipublikasikan (mis. Pangaea Proxima dari Scotese). Diberi label "skenario".
- **Pra-proses data (offline):** script Python mengambil GeoJSON tiap langkah waktu (5 Ma untuk 0–250 Ma, 10 Ma untuk 250–1.000 Ma), menyederhanakan poligon, lalu menyimpannya sebagai file statis. Website tidak memanggil API secara live.
- Atribusi sumber data dan lisensi ditampilkan di halaman (tombol "Sumber").

## 6. Arsitektur & Tech Stack

| Komponen | Pilihan |
| --- | --- |
| Globe | Globe.gl (berbasis Three.js) |
| Frontend | HTML + JavaScript (Vite), tanpa framework berat |
| Data | File GeoJSON statis per frame waktu + `eras.json` |
| Pra-proses | Python (requests / pyGPlates, shapely untuk simplifikasi) |
| Hosting | GitHub Pages atau Vercel (statis, gratis) |

Alur: slider menentukan waktu → cari frame terdekat → muat GeoJSON (cache + preload frame berikutnya) → render di globe → update label era.

## 7. Desain UI (garis besar)

- Globe memenuhi layar, latar gelap (luar angkasa).
- **Atas kiri:** judul + panel label era.
- **Bawah:** bar kontrol berisi tombol reset, play/pause, kecepatan, slider dengan pita warna era, tombol "Masa kini".
- **Atas kanan:** toggle garis pantai masa kini, tombol Sumber.
- Responsif: di HP, panel era menyusut jadi satu baris.

## 8. Requirement Non-Fungsional

- Muat awal < 3 detik di koneksi 4G; total data awal < 3 MB (frame lain dimuat bertahap).
- Animasi stabil ±30 fps di laptop sekolah kelas menengah dan HP Android menengah.
- Berjalan di Chrome, Edge, Firefox versi terbaru; desktop dan mobile.
- Bisa dipakai di proyektor (teks terbaca dari belakang kelas, kontras tinggi).

## 9. Kriteria Selesai (Acceptance)

- Globe bisa diputar dan di-zoom, benua tampil sesuai waktu terpilih.
- Slider mencakup −4.600 Ma sampai +250 Ma dengan 3 segmen dan angka waktu yang benar.
- Play/pause, kecepatan, reset, dan "Masa kini" berfungsi; menggeser slider menjeda animasi.
- Label era selalu sesuai dengan waktu di slider (diuji di tiap batas era).
- Segmen A dan C diberi label ilustrasi/proyeksi.
- Sumber data tercantum.

## 10. Rencana Kerja & Tahap Pembuatan

| Tahap | Isi | Estimasi |
| --- | --- | --- |
| 1 | Uji GPlates Web Service, pilih model, script pra-proses data | 2–3 hari |
| 2 | Globe + render satu frame GeoJSON | 1–2 hari |
| 3 | Slider 3 segmen + label era | 2 hari |
| 4 | Play/pause, kecepatan, transisi halus, preload | 2 hari |
| 5 | Keyframe segmen A & C | 2 hari |
| 6 | Polishing UI, uji di HP & proyektor, deploy | 1–2 hari |

### Detail Tahap Pembuatan

1. **Tahap 0 — Persiapan proyek**
   - Buat repo GitHub `plateauview`.
   - Inisialisasi proyek dengan Vite (vanilla JS).
   - Struktur folder: `src/` (kode), `public/data/frames/` (GeoJSON), `public/data/eras.json`, `scripts/` (Python).
2. **Tahap 1 — Data rekonstruksi**
   - Uji endpoint GPlates Web Service untuk garis pantai di 0, 100, dan 200 Ma.
   - Bandingkan model Merdith 2021 dan Müller 2019, pilih satu untuk MVP.
   - Tulis `scripts/fetch_frames.py`: ambil GeoJSON tiap 5 Ma (0–250 Ma) dan tiap 10 Ma (250–1.000 Ma).
   - Sederhanakan poligon (shapely/mapshaper), simpan sebagai `frames/{waktu}.json`.
   - Buat `manifest.json` berisi daftar frame; cek ukuran tiap file (target < 100 KB).
3. **Tahap 2 — Globe dasar**
   - Pasang Globe.gl, tampilkan globe dengan warna laut dan latar luar angkasa.
   - Muat frame 0 Ma dan render poligon benua.
   - Aktifkan drag, zoom, dan rotasi otomatis saat idle.
4. **Tahap 3 — Slider waktu & label era**
   - Isi `eras.json` (nama, waktu mulai–akhir, warna ICS, superbenua).
   - Buat fungsi skala 3 segmen: posisi slider ↔ waktu (Ma).
   - Hubungkan slider ke pemuatan frame terdekat.
   - Buat panel label era, pita warna era, dan tick marks di slider.
5. **Tahap 4 — Animasi & kontrol**
   - Loop animasi dengan `requestAnimationFrame`, tombol play/pause, dan pilihan kecepatan.
   - Cache frame dan preload beberapa frame berikutnya.
   - Transisi crossfade antar-frame (dua layer poligon dengan opacity bergantian).
   - Tombol reset dan "Masa kini", jeda otomatis saat slider digeser, kontrol keyboard.
6. **Tahap 5 — Keyframe segmen A & C**
   - Gambar 4–6 keyframe bumi awal (ilustratif) dan 3–5 keyframe masa depan (skenario).
   - Simpan dalam format GeoJSON yang sama agar satu sistem render.
   - Tambahkan badge "Ilustrasi" dan "Proyeksi — bukan data pasti".
7. **Tahap 6 — Polishing, uji & deploy**
   - Tampilan responsif HP, uji keterbacaan di proyektor kelas.
   - Modal "Sumber" berisi atribusi data dan lisensi.
   - Uji performa (Lighthouse, fps di laptop sekolah dan HP Android).
   - Deploy ke GitHub Pages/Vercel, lalu coba ke siswa untuk dapat masukan.

## 11. Pengembangan Lanjutan (setelah MVP)

- **Penjelasan tiap era:** panel/kartu berisi ringkasan iklim, peristiwa penting, kepunahan massal.
- **Makhluk hidup per daerah:** marker fosil di globe (mis. dari Paleobiology Database) yang bisa diklik, sesuai era dan lokasi purbanya.
- Lapisan batas lempeng masa kini dan sebaran gempa Indonesia.
- Mode presentasi guru (lompat ke titik-titik cerita).
- Versi bahasa Inggris.

## 12. Risiko & Pertanyaan Terbuka

- **Perbedaan antar model:** model rekonstruksi berbeda-beda; perlu memilih satu dan menyebutkannya.
- **Transisi poligon:** bentuk benua antar-frame tidak bisa di-morph langsung; MVP memakai crossfade. Perlu dicek apakah sudah cukup halus.
- **Lisensi data:** cek lisensi model GPlates dan gambar skenario masa depan sebelum publikasi.
- **Ukuran data:** jumlah frame × detail poligon bisa besar; perlu simplifikasi.
- **Pertanyaan:** domain untuk PlateauView? Target utama MVP: media ajar kelas, konten publik, atau portofolio?
