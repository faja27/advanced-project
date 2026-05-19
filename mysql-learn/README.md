<div align="left">

<img src="https://img.shields.io/badge/version-1.0.0-00e5ff?style=flat-square" />
<img src="https://img.shields.io/badge/status-production--ready-00e5ff?style=flat-square" />
<img src="https://img.shields.io/badge/license-free-blueviolet?style=flat-square" />
<img src="https://img.shields.io/badge/modules-38-ff6b6b?style=flat-square" />

<br /><br />

```
███╗   ███╗██╗   ██╗███████╗ ██████╗ ██╗     ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗
████╗ ████║╚██╗ ██╔╝██╔════╝██╔═══██╗██║     ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██╔████╔██║ ╚████╔╝ ███████╗██║   ██║██║     ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝
██║╚██╔╝██║  ╚██╔╝  ╚════██║██║▄▄ ██║██║     ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗
██║ ╚═╝ ██║   ██║   ███████║╚██████╔╝███████╗██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║
╚═╝     ╚═╝   ╚═╝   ╚══════╝ ╚══▀▀═╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```

### Platform Belajar MySQL Interaktif — dari Nol hingga Expert

**[🚀 Live Demo](#)** &nbsp;·&nbsp; **[📖 Dokumentasi](#)** &nbsp;·&nbsp; **[🐛 Laporkan Bug](../../issues)** &nbsp;·&nbsp; **[💡 Request Fitur](../../issues)**

<br />

![Hero Screenshot](https://placehold.co/900x450/0d1117/00e5ff?text=MySQLMaster+Screenshot)

</div>

---

## ✦ Tentang Proyek

**MySQLMaster** adalah platform pembelajaran MySQL berbasis browser tidak perlu instalasi, tidak perlu server. Tulis SQL, eksekusi, dan lihat hasilnya langsung di browser menggunakan WebAssembly.

Dirancang dari awal untuk pengalaman belajar yang terstruktur: setiap modul harus diselesaikan sebelum membuka modul berikutnya, ujian harus lulus dengan nilai minimal 70, dan setiap progres tercatat secara detail.

```sql
-- Selamat datang di MySQLMaster
SELECT 'Belajar MySQL' AS mulai_dari,
       'Browser' AS cukup_pakai,
       'Gratis' AS harganya;
```

---

## ✦ Fitur

<table>
<tr>
<td width="50%">

**🖥️ SQL Editor Interaktif**
Monaco Editor (engine yang sama dengan VS Code) dengan syntax highlighting, autocomplete, dan eksekusi SQL langsung di browser via WebAssembly. Tidak perlu install MySQL.

</td>
<td width="50%">

**📚 38 Modul Terstruktur**
Dari `SELECT` dasar hingga Window Functions dan Performance Tuning. Setiap modul punya konten, contoh kode, dan ujian. Lock system memastikan urutan belajar yang benar.

</td>
</tr>
<tr>
<td width="50%">

**📝 Sistem Ujian**
380+ soal pilihan ganda per modul dengan timer 15 menit dan grading otomatis. Nilai minimal 70 untuk lulus dan membuka modul berikutnya.

</td>
<td width="50%">

**📊 Progress Dashboard**
Streak harian, badge pencapaian, grafik aktivitas mingguan, dan statistik detail. Export/import progress ke JSON untuk backup antar device.

</td>
</tr>
<tr>
<td width="50%">

**🛡️ Sandbox Protection**
Perintah berbahaya (`DROP TABLE`, `DELETE` tanpa `WHERE`, dll) diblokir dengan pesan error informatif. Sandbox aman untuk eksperimen.

</td>
<td width="50%">

**📱 Responsive**
Berfungsi di desktop, tablet, dan mobile. Sidebar collapsible dengan overlay di layar kecil.

</td>
</tr>
</table>

---

## ✦ Kurikulum

```
LEVEL 01 — FONDASI                    6 modul
├── Pengenalan Database & MySQL
├── Tipe Data & Constraints
├── DDL: CREATE, ALTER, DROP
├── DML: INSERT, UPDATE, DELETE
├── SELECT & Filtering Data
└── Fungsi Agregat Dasar

LEVEL 02 — MENENGAH                  12 modul
├── Fungsi String & Numerik
├── Agregasi & GROUP BY / HAVING
├── JOIN: INNER, LEFT, RIGHT, FULL
├── Subquery & Correlated Query
├── Index & Optimasi Query
└── ... dan 7 modul lainnya

LEVEL 03 — LANJUTAN                   9 modul
├── Stored Procedure & Function
├── Trigger & Event Scheduler
├── VIEW & Transaksi ACID
├── Full-Text Search
└── EXPLAIN & Query Analysis

LEVEL 04 — EXPERT                    11 modul
├── Window Functions & CTE
├── JSON di MySQL 8+
├── Performance Tuning
├── Security & Privilege Management
└── Backup, Replikasi & Monitoring
```

---

## ✦ Tech Stack

| Layer | Teknologi |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS + Plus Jakarta Sans |
| Animasi | Framer Motion |
| State Management | Zustand + localStorage persistence |
| SQL Engine | sql.js (SQLite via WebAssembly) |
| Code Editor | Monaco Editor (lazy-loaded) |
| Charts | Recharts |
| Routing | React Router v7 |

---

## ✦ Instalasi & Menjalankan

### Prasyarat
- Node.js 18+
- npm 9+

### Langkah

```bash
# 1. Clone repository
git clone https://github.com/username/mysql-learn.git
cd mysql-learn

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
```

Buka **http://localhost:5173** di browser.

```bash
# Build production
npm run build

# Preview build
npm run preview
```

---

## ✦ Struktur Proyek

```
mysql-learn/
├── public/
│   └── sql-wasm.wasm              # sql.js WASM binary (self-hosted)
├── src/
│   ├── components/
│   │   ├── editor/                # SQLEditor + LazyMonaco wrapper
│   │   ├── exam/                  # ExamIntro, ExamResult
│   │   ├── layout/                # PageLayout, Sidebar (responsive)
│   │   ├── module/                # ModuleContent
│   │   └── ui/                    # ProgressBar, BadgeDisplay, dll
│   ├── data/
│   │   ├── modules/               # Konten 38 modul
│   │   ├── exam/                  # 380+ soal ujian
│   │   └── databases/             # 5 sandbox database SQL
│   ├── hooks/
│   │   ├── useExamTimer.ts        # Timer countdown ujian
│   │   └── useModuleTimer.ts      # Tracking waktu belajar
│   ├── pages/                     # Dashboard, Modul, Ujian, Level, Profil
│   ├── store/
│   │   └── progressStore.ts       # Zustand store + export/import
│   └── utils/
│       └── sqlRunner.ts           # sql.js engine + sandbox protection
└── package.json
```

---

## ✦ Cara Pakai

1. **Buat username** di halaman awal
2. **Pilih modul** dari dashboard — mulai dari Level 1
3. **Baca semua topik** dan tandai sebagai selesai
4. **Coba query** di SQL Playground di bagian bawah modul
5. **Ambil ujian** — nilai minimal 70 untuk lulus
6. **Ulangi** sampai 38 modul selesai

### Backup Progress

Progress tersimpan di `localStorage`. Untuk backup:

> Dashboard → scroll ke bawah → **Export Progress** → simpan file `.json`

Untuk restore di device lain: **Import Progress** → pilih file backup.

---

## ✦ Keterbatasan

- **localStorage only** — progress tidak sinkron antar device. Gunakan Export/Import.
- **sql.js ≠ MySQL murni** — berbasis SQLite. Beberapa fitur MySQL 8.0 spesifik mungkin berperilaku berbeda.
- **Bundle size ~1 MB** — Monaco Editor berkontribusi signifikan. Di-lazy load untuk mengurangi waktu load awal.

---

## ✦ Lisensi

Bebas digunakan dan dimodifikasi untuk tujuan pembelajaran dan non komersial.

---

<div align="center">

dibuat dengan ☕ dan banyak `SELECT * FROM kesabaran`

</div>
