# Content Gaps — Audit Level 3 & 4

**Tanggal audit:** 2026-05-19  
**Standar minimal:** ≥ 3 topik substantif DAN ≥ 2 code examples per modul

---

## Ringkasan

| Status | Jumlah Modul |
|--------|-------------|
| ✅ Lolos audit | 10 modul (19, 28, 29, 32, 33, 34, 35, 36, 37, 38) |
| ⚠️ Perlu penambahan | 10 modul (20–27, 30, 31) |

---

## Modul yang Butuh Penambahan

### Level 3

| Modul | Judul | Topics | Code Examples | Masalah | Status |
|-------|-------|--------|---------------|---------|--------|
| 20 | EXPLAIN & Analisis Query | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 21 | VIEW | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 22 | Stored Procedure | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 23 | User-Defined Function | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 24 | Trigger | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 25 | Event Scheduler | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 26 | Transaksi & ACID | 1 | 2 | < 3 topik (code examples OK) | ✅ Diperbaiki |
| 27 | Full-Text Search | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |

### Level 4

| Modul | Judul | Topics | Code Examples | Masalah | Status |
|-------|-------|--------|---------------|---------|--------|
| 30 | JSON di MySQL | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |
| 31 | Generated Columns | 1 | 1 | < 2 code examples, < 3 topik | ✅ Diperbaiki |

---

## Detail Penambahan Per Modul

### Modul 20 — EXPLAIN & Analisis Query
- **Ditambah:** topic_20_2 "Membaca Hasil EXPLAIN & Optimasi" + 1 code example (EXPLAIN ANALYZE, perbaikan query)
- **Summary tambahan:** EXPLAIN ANALYZE menampilkan waktu eksekusi aktual

### Modul 21 — VIEW
- **Ditambah:** topic_21_2 "Mengelola VIEW & WITH CHECK OPTION" + 1 code example (ALTER VIEW, WITH CHECK OPTION, INFORMATION_SCHEMA)
- **Summary tambahan:** WITH CHECK OPTION mencegah modifikasi data di luar kondisi WHERE

### Modul 22 — Stored Procedure
- **Ditambah:** topic_22_2 "Control Flow & Cursor dalam Procedure" + 1 code example (CURSOR, LOOP, IF/ELSEIF)
- **Summary tambahan:** CURSOR memungkinkan iterasi baris per baris dalam stored procedure

### Modul 23 — User-Defined Function
- **Ditambah:** topic_23_2 "Function vs Procedure & Kapan Menggunakannya" + 1 code example (perbandingan, best practices)
- **Summary tambahan:** Function bisa digunakan langsung dalam SELECT/WHERE

### Modul 24 — Trigger
- **Ditambah:** topic_24_2 "BEFORE Trigger & Validasi Data" + 1 code example (SIGNAL SQLSTATE, normalisasi data)
- **Summary tambahan:** SIGNAL SQLSTATE membatalkan operasi dengan error kustom

### Modul 25 — Event Scheduler
- **Ditambah:** topic_25_2 "Mengelola dan Memonitor Event" + 1 code example (ALTER EVENT, DISABLE/ENABLE, INFORMATION_SCHEMA)
- **Summary tambahan:** ALTER EVENT ubah jadwal tanpa drop dan recreate

### Modul 26 — Transaksi & ACID
- **Ditambah:** topic_26_2 "Isolation Level" + 1 code example (4 isolation levels, cara set)
- **Ditambah:** topic_26_3 "Locking & Deadlock" + 1 code example (FOR UPDATE, NOWAIT, SKIP LOCKED)
- **Summary tambahan:** REPEATABLE READ adalah isolation level default MySQL

### Modul 27 — Full-Text Search
- **Ditambah:** topic_27_2 "Operator Boolean & Tuning Relevansi" + 1 code example (operator +,-,*,"", WITH QUERY EXPANSION)
- **Summary tambahan:** Boolean Mode mendukung operator +, -, *, dan frasa

### Modul 30 — JSON di MySQL
- **Ditambah:** topic_30_2 "Fungsi JSON Lanjutan & JSON_TABLE" + 1 code example (JSON_ARRAYAGG, JSON_TABLE, JSON_MERGE_PATCH)
- **Summary tambahan:** JSON_TABLE mengkonversi nested JSON menjadi baris tabel relasional

### Modul 31 — Generated Columns & Virtual Columns
- **Ditambah:** topic_31_2 "Generated Column + JSON Index & Use Cases" + 1 code example (index pada JSON via generated column)
- **Summary tambahan:** Index pada STORED generated column dari JSON sama cepatnya dengan kolom biasa

---

## Modul yang Lulus Audit (tidak perlu perubahan)

| Modul | Judul | Topics | Code Examples |
|-------|-------|--------|---------------|
| 19 | Index | 2 | 2 |
| 28 | Window Functions | 2 | 2 |
| 29 | CTE | 2 | 2 |
| 32 | Optimasi Performa & Partisi | 2 | 2 |
| 33 | User, Privilege & Keamanan | 2 | 2 |
| 34 | Backup, Restore & Replikasi | 2 | 2 |
| 35 | Monitoring & Profiling | 2 | 2 |
| 36 | MySQL di Dunia Nyata | 2 | 2 |
| 37 | Normalisasi & Schema Design | 2 | 2 |
| 38 | Fitur Modern MySQL 8+ | 2 | 2 |
