# MySQL Learn — Platform Belajar MySQL Interaktif

Aplikasi web interaktif untuk belajar MySQL dari level pemula hingga expert, lengkap dengan materi terstruktur, ujian per modul, dan SQL playground berbasis browser.

---

## Deskripsi

MySQL Learn adalah platform pembelajaran MySQL yang dirancang untuk pemula hingga developer yang ingin memperdalam SQL. Terdiri dari **38 modul** yang dikelompokkan dalam 4 level, setiap modul memiliki konten materi, contoh kode, dan ujian yang harus lulus untuk membuka modul berikutnya.

Seluruh SQL dieksekusi langsung di browser menggunakan **sql.js** (WebAssembly) — tidak perlu server database.

---

## Fitur Utama

- **38 Modul** terbagi dalam 4 level (Fondasi → Menengah → Lanjutan → Expert)
- **SQL Playground** — jalankan query SQL langsung di browser tanpa instalasi apapun
- **Sistem Ujian** — 10 soal pilihan ganda, fill-in-the-blank, dan write-query per modul dengan timer 15 menit
- **Progress Tracking** — lacak topik yang sudah dibaca, skor ujian, streak harian, dan total waktu belajar
- **Achievement System** — raih badge untuk pencapaian tertentu (streak, nilai sempurna, selesaikan level)
- **Export & Import Progress** — backup progress ke file JSON dan restore kapan saja
- **SQL Sandbox Protection** — perintah berbahaya (DROP TABLE, DELETE tanpa WHERE, dll) diblokir dengan pesan error informatif

---

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| React 19 + TypeScript | Framework UI utama |
| Vite 8 | Build tool dan dev server |
| Zustand | State management + persistence ke localStorage |
| sql.js (WebAssembly) | Engine SQL di browser |
| Monaco Editor | Code editor SQL dengan syntax highlighting |
| Framer Motion | Animasi UI |
| Recharts | Grafik aktivitas belajar |
| Tailwind CSS | Styling utility-first |
| React Router v7 | Client-side routing |

---

## Struktur Modul

| Level | Modul | Topik |
|-------|-------|-------|
| Level 1 — Fondasi | 1–6 | Pengenalan MySQL, Tipe Data, DDL, DML, SELECT, Fungsi Agregat |
| Level 2 — Menengah | 7–18 | JOIN, Subquery, Index, Grouping, String/Date Functions, Relasi |
| Level 3 — Lanjutan | 19–27 | Index Lanjutan, EXPLAIN, VIEW, Stored Procedure, Trigger, Event, Transaksi, Full-Text Search |
| Level 4 — Expert | 28–38 | Window Functions, CTE, JSON, Generated Columns, Partisi, Security, Backup, Monitoring, Normalisasi, MySQL 8+ |

---

## Setup & Menjalankan

### Prasyarat
- Node.js 18+
- npm 9+

### Instalasi

```bash
# Clone repository
git clone <url-repo>
cd mysql-learn

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka `http://localhost:5173` di browser.

### Build Production

```bash
npm run build
```

Output tersimpan di folder `dist/`.

### Preview Build

```bash
npm run preview
```

---

## Struktur Folder

```
mysql-learn/
├── public/
│   └── sql-wasm.wasm          # sql.js WebAssembly binary (self-hosted)
├── src/
│   ├── components/
│   │   ├── editor/            # SQLEditor + LazyMonaco wrapper
│   │   ├── exam/              # ExamIntro, ExamResult
│   │   ├── layout/            # PageLayout, Navbar, Sidebar
│   │   ├── module/            # ModuleContent
│   │   ├── ui/                # ProgressBar, BadgeDisplay, dll
│   │   └── visuals/           # ModuleVisuals (diagram interaktif)
│   ├── data/
│   │   ├── modules/           # Konten 38 modul (topics, code examples, summary)
│   │   └── exam/              # Soal ujian per modul
│   ├── hooks/
│   │   ├── useExamTimer.ts    # Countdown timer untuk ujian
│   │   └── useModuleTimer.ts  # Tracking waktu belajar per modul
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Halaman utama dengan statistik
│   │   ├── ModulePage.tsx     # Halaman konten modul
│   │   ├── ExamPage.tsx       # Halaman ujian
│   │   ├── LevelPage.tsx      # Daftar modul per level
│   │   └── ProfilePage.tsx    # Profil dan achievement
│   ├── store/
│   │   └── progressStore.ts   # Zustand store dengan localStorage persistence
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       └── sqlRunner.ts       # sql.js engine + sandbox protection
└── package.json
```

---

## Cara Menggunakan

1. **Buat nama pengguna** di halaman awal
2. **Pilih modul** dari dashboard atau level page
3. **Baca semua topik** dalam modul — tandai setiap topik sebagai sudah dibaca
4. **Coba query** di SQL Playground di bawah halaman modul
5. **Ambil ujian** setelah semua topik dibaca — nilai minimal 70 untuk lulus
6. **Buka modul berikutnya** setelah lulus ujian

---

## Backup & Restore Progress

Progress disimpan di `localStorage` browser. Untuk mencadangkan:

1. Buka **Dashboard**
2. Scroll ke bawah ke bagian **"Backup & Restore Progress"**
3. Klik **"↓ Export Progress"** untuk mengunduh file JSON
4. Klik **"↑ Import Progress"** untuk memulihkan dari backup

---

## Keterbatasan yang Diketahui

- **Data tidak persisten antar browser/device** — progress tersimpan di localStorage browser saat ini saja. Gunakan fitur Export/Import untuk pindah device.
- **sql.js bukan MySQL sungguhan** — beberapa fitur MySQL 8.0 (seperti window functions, JSON_TABLE) mungkin tidak tersedia atau berperilaku berbeda di sql.js (yang berbasis SQLite).
- **Monaco Editor** di-lazy load — mungkin terjadi sedikit delay saat pertama kali membuka halaman modul dengan koneksi lambat.
- **localStorage limit ~5MB** — jika storage browser penuh, akan muncul banner peringatan. Gunakan export untuk backup sebelum mencapai batas.

---

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran. Bebas digunakan dan dimodifikasi untuk tujuan non-komersial.
