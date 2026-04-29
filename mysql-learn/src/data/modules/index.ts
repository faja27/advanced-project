import type { ModuleData } from '../../types';

export const modulesData: ModuleData[] = [
  {
    id: 1,
    title: 'Pengenalan Database & MySQL',
    level: 1,
    description: 'Memahami konsep dasar database, mengapa MySQL digunakan, dan arsitektur sistem database.',
    estimatedMinutes: 30,
    database: 'toko',
    topics: [
      {
        id: 'topic_1_1',
        title: 'Apa itu Database?',
        content: `Database adalah kumpulan data yang terorganisir secara sistematis sehingga dapat diakses, dikelola, dan diperbarui dengan mudah. Bayangkan database seperti lemari arsip raksasa yang sangat teratur — setiap laci (tabel) berisi dokumen (baris data) yang dikelompokkan berdasarkan jenisnya.

Tanpa database, data akan tersebar di mana-mana: file Excel yang tidak terhubung, catatan manual yang mudah hilang, dan duplikasi data yang menyebabkan inkonsistensi. Database menyelesaikan semua masalah ini.

**Jenis-jenis Database:**
- **Relasional (RDBMS):** MySQL, PostgreSQL, Oracle — menggunakan tabel dan relasi
- **Non-relasional (NoSQL):** MongoDB, Redis — menggunakan dokumen, key-value, atau graph
- **In-memory:** Redis, Memcached — data disimpan di RAM untuk akses super cepat`,
        codeExamples: [
          {
            title: 'Melihat database yang tersedia',
            code: `SHOW DATABASES;`,
            output: `+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| toko_online        |
+--------------------+`,
          },
        ],
        tips: ['Selalu beri nama database dengan huruf kecil dan underscore', 'Rancang struktur database sebelum mulai coding'],
      },
      {
        id: 'topic_1_2',
        title: 'Mengapa MySQL?',
        content: `MySQL adalah sistem manajemen database relasional (RDBMS) open-source yang paling populer di dunia. Digunakan oleh Facebook, Twitter, YouTube, dan jutaan aplikasi web lainnya.

**Keunggulan MySQL:**
- **Gratis dan Open Source** — tidak perlu membayar lisensi
- **Cepat dan Handal** — dioptimalkan untuk performa tinggi
- **Komunitas Besar** — banyak tutorial, forum, dan dokumentasi
- **Cross-platform** — berjalan di Windows, Linux, macOS
- **ACID Compliant** — menjamin konsistensi data`,
        codeExamples: [
          {
            title: 'Melihat versi MySQL',
            code: `SELECT VERSION();`,
            output: `+-----------+\n| VERSION() |\n+-----------+\n| 8.0.35    |\n+-----------+`,
          },
        ],
      },
      {
        id: 'topic_1_3',
        title: 'Arsitektur MySQL',
        content: `Memahami arsitektur MySQL membantu kamu menulis query yang lebih efisien dan mendiagnosis masalah performa.

**Lapisan Arsitektur MySQL:**
1. **Client Layer** — aplikasi yang mengirim query (aplikasi web, CLI, GUI tools)
2. **Connection Handling** — mengelola koneksi masuk dari client
3. **SQL Parser & Optimizer** — memparse dan mengoptimalkan query
4. **Storage Engine** — menangani penyimpanan fisik data (InnoDB adalah default)
5. **File System** — file data (.ibd, .frm) di disk

**Storage Engine Utama:**
- **InnoDB** — mendukung transaksi dan foreign key (direkomendasikan)
- **MyISAM** — lebih cepat untuk read-heavy, tidak mendukung transaksi
- **MEMORY** — data di RAM, sangat cepat tapi tidak persisten`,
        codeExamples: [
          {
            title: 'Melihat storage engine yang tersedia',
            code: `SHOW ENGINES;`,
            output: `+------------+---------+------------------------------+\n| Engine     | Support | Comment                      |\n+------------+---------+------------------------------+\n| InnoDB     | DEFAULT | Supports transactions, ACID  |\n| MyISAM     | YES     | Fast read operations         |\n| MEMORY     | YES     | Hash based, stored in memory |\n+------------+---------+------------------------------+`,
          },
        ],
      },
    ],
    summary: [
      'Database adalah kumpulan data terorganisir yang memudahkan akses dan pengelolaan',
      'MySQL adalah RDBMS open-source paling populer, digunakan oleh perusahaan besar',
      'Arsitektur MySQL terdiri dari client layer, parser, optimizer, dan storage engine',
      'InnoDB adalah storage engine default yang mendukung transaksi dan foreign key',
    ],
    funFact: 'MySQL dibuat oleh Michael Widenius pada tahun 1995. Nama "MySQL" diambil dari nama putrinya, My!',
  },
  {
    id: 2,
    title: 'Tipe Data MySQL',
    level: 1,
    description: 'Mengenal semua tipe data MySQL dan cara memilih tipe data yang tepat untuk efisiensi penyimpanan.',
    estimatedMinutes: 40,
    database: 'toko',
    topics: [
      {
        id: 'topic_2_1',
        title: 'Tipe Data Numerik',
        content: `Memilih tipe data numerik yang tepat sangat penting untuk efisiensi penyimpanan dan performa query.

| Tipe | Ukuran | Rentang |
|------|--------|---------|
| TINYINT | 1 byte | -128 s/d 127 |
| SMALLINT | 2 bytes | -32,768 s/d 32,767 |
| MEDIUMINT | 3 bytes | -8,388,608 s/d 8,388,607 |
| INT | 4 bytes | -2,147,483,648 s/d 2,147,483,647 |
| BIGINT | 8 bytes | -9.2 × 10¹⁸ s/d 9.2 × 10¹⁸ |
| FLOAT | 4 bytes | Presisi ~7 digit |
| DOUBLE | 8 bytes | Presisi ~15 digit |
| DECIMAL(p,s) | Variatif | Presisi eksak |

**Tips:** Untuk harga/uang, gunakan DECIMAL bukan FLOAT untuk menghindari pembulatan!`,
        codeExamples: [
          {
            title: 'Contoh penggunaan tipe numerik',
            code: `CREATE TABLE contoh_numerik (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umur TINYINT UNSIGNED,
  stok SMALLINT,
  harga DECIMAL(10,2),
  berat FLOAT
);

-- UNSIGNED: hanya nilai positif (0 s/d 255 untuk TINYINT)`,
            output: 'Query OK, 0 rows affected',
          },
        ],
        commonMistakes: ['Menggunakan FLOAT untuk menyimpan nilai uang — selalu gunakan DECIMAL', 'Menggunakan INT saat TINYINT sudah cukup'],
      },
      {
        id: 'topic_2_2',
        title: 'Tipe Data String',
        content: `Tipe string di MySQL bervariasi berdasarkan ukuran dan cara penyimpanannya.

| Tipe | Max Ukuran | Keterangan |
|------|-----------|------------|
| CHAR(n) | 255 karakter | Panjang tetap, diisi spasi |
| VARCHAR(n) | 65,535 bytes | Panjang variabel, efisien |
| TEXT | 65,535 bytes | Teks panjang |
| MEDIUMTEXT | 16 MB | Teks sangat panjang |
| LONGTEXT | 4 GB | Teks artikel/konten besar |
| ENUM | - | Nilai dari daftar tetap |
| SET | - | Kombinasi nilai dari daftar |

**Kapan pakai CHAR vs VARCHAR?**
- CHAR: data dengan panjang tetap (kode pos, nomor telepon dengan format sama)
- VARCHAR: data dengan panjang bervariasi (nama, email, alamat)`,
        codeExamples: [
          {
            title: 'Perbedaan CHAR dan VARCHAR',
            code: `-- CHAR(10) selalu menggunakan 10 bytes
-- VARCHAR(10) menggunakan sesuai panjang data

CREATE TABLE contoh_string (
  kode_pos CHAR(5),         -- selalu 5 karakter
  nama VARCHAR(100),        -- hingga 100 karakter
  status ENUM('aktif','nonaktif','pending'),
  deskripsi TEXT
);`,
          },
        ],
      },
      {
        id: 'topic_2_3',
        title: 'Tipe Data Tanggal & Waktu',
        content: `MySQL menyediakan beberapa tipe data untuk menyimpan tanggal dan waktu.

| Tipe | Format | Rentang |
|------|--------|---------|
| DATE | YYYY-MM-DD | 1000-01-01 s/d 9999-12-31 |
| TIME | HH:MM:SS | -838:59:59 s/d 838:59:59 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 1000-01-01 s/d 9999-12-31 |
| TIMESTAMP | YYYY-MM-DD HH:MM:SS | 1970-01-01 s/d 2038-01-19 |
| YEAR | YYYY | 1901 s/d 2155 |

**DATETIME vs TIMESTAMP:**
- DATETIME: menyimpan nilai literal, tidak terpengaruh timezone
- TIMESTAMP: dikonversi ke UTC, lebih cocok untuk data internasional`,
        codeExamples: [
          {
            title: 'Menggunakan tipe tanggal',
            code: `CREATE TABLE events (
  id INT PRIMARY KEY,
  nama VARCHAR(100),
  tanggal DATE,
  waktu_mulai TIME,
  dibuat_pada DATETIME DEFAULT NOW(),
  diperbarui TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`,
          },
        ],
      },
    ],
    summary: [
      'Pilih tipe numerik sesuai rentang data untuk menghemat storage',
      'Gunakan DECIMAL untuk nilai uang, bukan FLOAT',
      'VARCHAR lebih efisien dari CHAR untuk data panjang variabel',
      'TIMESTAMP otomatis tersimpan dalam UTC dan bisa auto-update',
    ],
    funFact: 'Menggunakan tipe data yang tepat bisa menghemat storage hingga 70% dan meningkatkan performa query 3x lipat!',
  },
  {
    id: 3,
    title: 'DDL — Mendefinisikan Struktur',
    level: 1,
    description: 'Menguasai perintah DDL: CREATE, ALTER, DROP untuk mendefinisikan dan memodifikasi struktur database.',
    estimatedMinutes: 45,
    database: 'toko',
    topics: [
      {
        id: 'topic_3_1',
        title: 'CREATE DATABASE & TABLE',
        content: `DDL (Data Definition Language) adalah perintah SQL untuk mendefinisikan struktur database. Perintah utama DDL adalah CREATE, ALTER, DROP, dan TRUNCATE.

**Sintaks CREATE DATABASE:**
\`\`\`sql
CREATE DATABASE [IF NOT EXISTS] nama_database
  [CHARACTER SET utf8mb4]
  [COLLATE utf8mb4_unicode_ci];
\`\`\`

**Sintaks CREATE TABLE:**
\`\`\`sql
CREATE TABLE [IF NOT EXISTS] nama_tabel (
  kolom1 TIPE_DATA [CONSTRAINT],
  kolom2 TIPE_DATA [CONSTRAINT],
  ...
  [TABLE CONSTRAINT]
);
\`\`\``,
        codeExamples: [
          {
            title: 'Membuat database dan tabel',
            code: `-- Membuat database
CREATE DATABASE IF NOT EXISTS toko_online
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Membuat tabel produk
CREATE TABLE produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(200) NOT NULL,
  harga DECIMAL(12,2) NOT NULL,
  stok INT DEFAULT 0,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
          },
          {
            title: 'Constraint pada kolom',
            code: `CREATE TABLE pelanggan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  telepon VARCHAR(20),
  umur TINYINT CHECK (umur >= 17),
  status ENUM('aktif','nonaktif') DEFAULT 'aktif'
);`,
          },
        ],
        tips: ['Selalu gunakan IF NOT EXISTS untuk menghindari error', 'Gunakan utf8mb4 untuk mendukung emoji dan karakter khusus'],
      },
      {
        id: 'topic_3_2',
        title: 'ALTER TABLE',
        content: `ALTER TABLE digunakan untuk memodifikasi struktur tabel yang sudah ada tanpa kehilangan data.

**Operasi ALTER TABLE:**
- ADD COLUMN — tambah kolom baru
- MODIFY COLUMN — ubah tipe data kolom
- CHANGE COLUMN — ubah nama dan tipe kolom
- DROP COLUMN — hapus kolom
- ADD/DROP INDEX — kelola index
- ADD/DROP CONSTRAINT — kelola constraint`,
        codeExamples: [
          {
            title: 'Berbagai operasi ALTER TABLE',
            code: `-- Tambah kolom baru
ALTER TABLE produk
  ADD COLUMN deskripsi TEXT AFTER nama,
  ADD COLUMN kategori_id INT;

-- Ubah tipe data kolom
ALTER TABLE produk
  MODIFY COLUMN nama VARCHAR(300) NOT NULL;

-- Rename kolom (MySQL 8.0+)
ALTER TABLE produk
  RENAME COLUMN kategori_id TO cat_id;

-- Hapus kolom
ALTER TABLE produk
  DROP COLUMN cat_id;`,
          },
        ],
        commonMistakes: ['ALTER TABLE pada tabel besar membutuhkan waktu lama — lakukan di jam sepi', 'DROP COLUMN tidak bisa di-undo tanpa backup!'],
      },
      {
        id: 'topic_3_3',
        title: 'DROP & TRUNCATE',
        content: `DROP menghapus objek database secara permanen, sementara TRUNCATE menghapus semua data tapi mempertahankan struktur tabel.

**Perbedaan DELETE, TRUNCATE, DROP:**
- DELETE: hapus baris tertentu, bisa di-rollback, lambat untuk data besar
- TRUNCATE: hapus semua baris, tidak bisa di-rollback, reset AUTO_INCREMENT, sangat cepat
- DROP: hapus tabel/database beserta strukturnya, tidak bisa di-undo`,
        codeExamples: [
          {
            title: 'DROP dan TRUNCATE',
            code: `-- Hapus tabel (HATI-HATI! Tidak bisa undo)
DROP TABLE IF EXISTS temp_data;

-- Hapus semua data, pertahankan struktur
TRUNCATE TABLE log_aktivitas;

-- Hapus database (sangat berbahaya!)
DROP DATABASE IF EXISTS database_lama;

-- Lihat struktur tabel
DESCRIBE produk;
SHOW CREATE TABLE produk;`,
          },
        ],
        tips: ['Selalu backup sebelum DROP atau TRUNCATE', 'Gunakan IF EXISTS untuk menghindari error'],
      },
    ],
    summary: [
      'CREATE membuat database dan tabel dengan definisi kolom dan constraint',
      'ALTER TABLE memodifikasi struktur tabel tanpa menghapus data',
      'TRUNCATE menghapus semua data dengan sangat cepat dan reset AUTO_INCREMENT',
      'DROP menghapus objek secara permanen — selalu backup terlebih dahulu',
    ],
    funFact: 'Di MySQL, perintah DDL seperti CREATE dan DROP adalah auto-commit — tidak bisa di-rollback dalam transaksi!',
  },
  {
    id: 4,
    title: 'DML — Manipulasi Data',
    level: 1,
    description: 'Menguasai INSERT, UPDATE, dan DELETE untuk memanipulasi data dalam tabel MySQL.',
    estimatedMinutes: 45,
    database: 'toko',
    topics: [
      {
        id: 'topic_4_1',
        title: 'INSERT — Menambah Data',
        content: `INSERT adalah perintah DML untuk menambahkan baris baru ke dalam tabel.

**Sintaks INSERT:**
\`\`\`sql
-- Insert satu baris
INSERT INTO tabel (kolom1, kolom2) VALUES (nilai1, nilai2);

-- Insert banyak baris sekaligus
INSERT INTO tabel (kolom1, kolom2) VALUES
  (nilai1, nilai2),
  (nilai3, nilai4);

-- Insert dari SELECT
INSERT INTO tabel_baru SELECT * FROM tabel_lama;
\`\`\``,
        codeExamples: [
          {
            title: 'Berbagai cara INSERT',
            code: `-- Insert satu produk
INSERT INTO produk (nama, harga, stok, kategori_id)
VALUES ('Laptop Gaming ASUS', 15000000, 10, 1);

-- Insert banyak produk sekaligus (lebih efisien)
INSERT INTO produk (nama, harga, stok, kategori_id) VALUES
  ('Mouse Wireless Logitech', 350000, 50, 1),
  ('Keyboard Mechanical', 850000, 30, 1),
  ('Headset Gaming', 450000, 25, 1);

-- INSERT IGNORE: skip jika ada duplikat
INSERT IGNORE INTO pelanggan (email, nama)
VALUES ('budi@email.com', 'Budi Santoso');`,
          },
          {
            title: 'INSERT ... ON DUPLICATE KEY UPDATE',
            code: `-- Jika email sudah ada, update nama
INSERT INTO pelanggan (email, nama)
VALUES ('budi@email.com', 'Budi S.')
ON DUPLICATE KEY UPDATE nama = VALUES(nama);`,
          },
        ],
      },
      {
        id: 'topic_4_2',
        title: 'UPDATE — Mengubah Data',
        content: `UPDATE mengubah nilai data yang sudah ada dalam tabel.

⚠️ **PERINGATAN PENTING:** Selalu gunakan klausa WHERE saat UPDATE! Tanpa WHERE, semua baris akan diubah.

**Sintaks UPDATE:**
\`\`\`sql
UPDATE tabel
SET kolom1 = nilai1, kolom2 = nilai2
WHERE kondisi;
\`\`\``,
        codeExamples: [
          {
            title: 'Berbagai pola UPDATE',
            code: `-- Update harga produk tertentu
UPDATE produk
SET harga = 14500000, stok = 8
WHERE id = 1;

-- Update dengan kalkulasi
UPDATE produk
SET harga = harga * 1.1   -- naikan harga 10%
WHERE kategori_id = 1;

-- Update berdasarkan kondisi kompleks
UPDATE produk
SET stok = 0
WHERE stok < 5 AND kategori_id = 2;

-- Multi-table UPDATE
UPDATE produk p
JOIN kategori k ON p.kategori_id = k.id
SET p.harga = p.harga * 0.9
WHERE k.nama = 'Elektronik';`,
          },
        ],
        commonMistakes: ['UPDATE tanpa WHERE mengubah SEMUA baris!', 'Lupa commit jika menggunakan transaksi manual'],
      },
      {
        id: 'topic_4_3',
        title: 'DELETE — Menghapus Data',
        content: `DELETE menghapus baris dari tabel berdasarkan kondisi tertentu.

⚠️ **PERINGATAN:** Selalu gunakan WHERE! DELETE tanpa WHERE menghapus SEMUA data.

Berbeda dengan TRUNCATE, DELETE bisa di-rollback dalam transaksi dan memicu trigger.`,
        codeExamples: [
          {
            title: 'Berbagai pola DELETE',
            code: `-- Hapus produk tertentu
DELETE FROM produk WHERE id = 5;

-- Hapus berdasarkan kondisi
DELETE FROM produk
WHERE stok = 0 AND tanggal_masuk < '2023-01-01';

-- Delete dengan LIMIT (hapus secara bertahap untuk data besar)
DELETE FROM log_aktivitas
WHERE dibuat_pada < '2023-01-01'
LIMIT 1000;

-- Multi-table DELETE
DELETE p FROM produk p
JOIN kategori k ON p.kategori_id = k.id
WHERE k.nama = 'Kadaluarsa';`,
          },
        ],
        tips: ['Uji kondisi WHERE dengan SELECT sebelum DELETE', 'Gunakan LIMIT untuk hapus data besar secara bertahap'],
      },
    ],
    summary: [
      'INSERT menambah data baru, bisa satu baris atau banyak baris sekaligus',
      'UPDATE mengubah data yang ada — SELALU gunakan WHERE',
      'DELETE menghapus baris — SELALU gunakan WHERE',
      'INSERT IGNORE dan ON DUPLICATE KEY UPDATE untuk menangani duplikat',
    ],
    funFact: 'MySQL memiliki mode "safe update" yang mencegah UPDATE/DELETE tanpa WHERE — aktifkan dengan SET sql_safe_updates = 1!',
  },
  {
    id: 5,
    title: 'Query Dasar — SELECT',
    level: 1,
    description: 'Menguasai perintah SELECT untuk mengambil data dengan berbagai kondisi, pengurutan, dan pembatasan.',
    estimatedMinutes: 50,
    database: 'toko',
    topics: [
      {
        id: 'topic_5_1',
        title: 'SELECT Dasar',
        content: `SELECT adalah perintah paling sering digunakan dalam SQL. Urutan penulisan klausa SELECT:

\`\`\`sql
SELECT kolom
FROM tabel
WHERE kondisi
GROUP BY kolom
HAVING kondisi_group
ORDER BY kolom
LIMIT n OFFSET m;
\`\`\`

Urutan eksekusi (berbeda dari urutan penulisan!):
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`,
        codeExamples: [
          {
            title: 'SELECT berbagai variasi',
            code: `-- Semua kolom
SELECT * FROM produk;

-- Kolom tertentu
SELECT nama, harga, stok FROM produk;

-- Dengan alias
SELECT nama AS nama_produk, harga AS harga_jual
FROM produk;

-- Kolom kalkulasi
SELECT nama, harga, stok,
       harga * stok AS total_nilai_stok
FROM produk;`,
          },
        ],
      },
      {
        id: 'topic_5_2',
        title: 'WHERE — Memfilter Data',
        content: `Klausa WHERE memfilter baris berdasarkan kondisi. Mendukung berbagai operator perbandingan dan logika.

**Operator yang tersedia:**
- Perbandingan: =, !=, <, >, <=, >=
- Rentang: BETWEEN ... AND
- Daftar: IN (...), NOT IN (...)
- Pola: LIKE (% untuk banyak karakter, _ untuk satu karakter)
- NULL: IS NULL, IS NOT NULL`,
        codeExamples: [
          {
            title: 'Berbagai kondisi WHERE',
            code: `-- Filter sederhana
SELECT * FROM produk WHERE harga > 1000000;

-- BETWEEN
SELECT * FROM produk
WHERE harga BETWEEN 100000 AND 500000;

-- IN
SELECT * FROM produk
WHERE kategori_id IN (1, 2, 3);

-- LIKE (cari produk yang mengandung 'Gaming')
SELECT * FROM produk WHERE nama LIKE '%Gaming%';

-- IS NULL
SELECT * FROM pelanggan WHERE telepon IS NULL;

-- Kombinasi kondisi
SELECT * FROM produk
WHERE kategori_id = 1
  AND harga < 5000000
  AND stok > 0;`,
          },
        ],
      },
      {
        id: 'topic_5_3',
        title: 'ORDER BY & LIMIT',
        content: `ORDER BY mengurutkan hasil query, LIMIT membatasi jumlah baris yang dikembalikan.

ORDER BY sangat penting untuk pagination dan laporan. Tanpa ORDER BY, urutan hasil tidak dijamin konsisten.`,
        codeExamples: [
          {
            title: 'ORDER BY dan LIMIT',
            code: `-- Urutkan berdasarkan harga (ASC = naik, default)
SELECT * FROM produk ORDER BY harga ASC;

-- Urutkan berdasarkan harga tertinggi dulu
SELECT * FROM produk ORDER BY harga DESC;

-- Multi-kolom sort
SELECT * FROM produk
ORDER BY kategori_id ASC, harga DESC;

-- 5 produk termahal
SELECT nama, harga FROM produk
ORDER BY harga DESC
LIMIT 5;

-- Halaman 2 (offset 5, ambil 5 baris)
SELECT nama, harga FROM produk
ORDER BY id
LIMIT 5 OFFSET 5;`,
          },
        ],
      },
      {
        id: 'topic_5_4',
        title: 'DISTINCT & SELECT lanjutan',
        content: `DISTINCT menghilangkan duplikat dari hasil query. Berguna untuk mendapatkan nilai unik dari kolom tertentu.`,
        codeExamples: [
          {
            title: 'DISTINCT dan teknik SELECT lanjutan',
            code: `-- Kota unik dari pelanggan
SELECT DISTINCT kota FROM pelanggan;

-- Kombinasi unik
SELECT DISTINCT kategori_id, status FROM produk;

-- COUNT dengan DISTINCT
SELECT COUNT(DISTINCT kota) AS jumlah_kota
FROM pelanggan;

-- Ekspresi dalam SELECT
SELECT
  nama,
  harga,
  CASE
    WHEN harga < 100000 THEN 'Murah'
    WHEN harga < 500000 THEN 'Sedang'
    ELSE 'Mahal'
  END AS kategori_harga
FROM produk;`,
          },
        ],
      },
    ],
    summary: [
      'SELECT mengambil data, bisa pilih kolom tertentu atau semua dengan *',
      'WHERE memfilter baris berdasarkan kondisi dengan berbagai operator',
      'ORDER BY mengurutkan hasil, LIMIT membatasi jumlah baris',
      'DISTINCT menghilangkan duplikat dari hasil query',
    ],
    funFact: 'Query SELECT tidak mengubah data apapun di database — aman untuk bereksperimen!',
  },
  {
    id: 6,
    title: 'Operator & Ekspresi',
    level: 1,
    description: 'Menguasai operator aritmatika, perbandingan, logika, dan string dalam SQL.',
    estimatedMinutes: 40,
    database: 'toko',
    topics: [
      {
        id: 'topic_6_1',
        title: 'Operator Aritmatika',
        content: `MySQL mendukung operator aritmatika standar untuk kalkulasi dalam query.

| Operator | Fungsi | Contoh |
|----------|--------|--------|
| + | Penjumlahan | harga + pajak |
| - | Pengurangan | harga - diskon |
| * | Perkalian | harga * jumlah |
| / | Pembagian | total / jumlah |
| % atau MOD | Modulo | id % 2 |
| DIV | Pembagian bulat | 10 DIV 3 = 3 |`,
        codeExamples: [
          {
            title: 'Kalkulasi dalam SELECT',
            code: `SELECT
  nama,
  harga,
  stok,
  harga * stok AS nilai_inventory,
  harga * 1.11 AS harga_dengan_ppn,
  harga * 0.9 AS harga_setelah_diskon_10persen
FROM produk
WHERE stok > 0
ORDER BY nilai_inventory DESC;`,
          },
        ],
      },
      {
        id: 'topic_6_2',
        title: 'Operator Logika',
        content: `Operator logika menggabungkan beberapa kondisi dalam klausa WHERE.

- **AND**: kedua kondisi harus TRUE
- **OR**: salah satu kondisi harus TRUE
- **NOT**: membalik kondisi
- **XOR**: tepat satu kondisi TRUE

**Prioritas operator:** NOT > AND > OR. Gunakan tanda kurung untuk kejelasan!`,
        codeExamples: [
          {
            title: 'Kombinasi operator logika',
            code: `-- AND: produk mahal DAN stok ada
SELECT * FROM produk
WHERE harga > 1000000 AND stok > 0;

-- OR: elektronik ATAU pakaian
SELECT * FROM produk
WHERE kategori_id = 1 OR kategori_id = 2;

-- NOT: bukan kategori elektronik
SELECT * FROM produk
WHERE NOT kategori_id = 1;

-- Kombinasi kompleks (gunakan kurung!)
SELECT * FROM produk
WHERE (kategori_id = 1 OR kategori_id = 2)
  AND harga < 500000
  AND stok > 10;`,
          },
        ],
      },
      {
        id: 'topic_6_3',
        title: 'CASE Expression',
        content: `CASE adalah ekspresi kondisional yang sangat powerful dalam SQL, mirip if-else dalam pemrograman.

**Dua sintaks CASE:**
1. Simple CASE: membandingkan satu ekspresi dengan banyak nilai
2. Searched CASE: mengevaluasi kondisi boolean yang berbeda-beda`,
        codeExamples: [
          {
            title: 'CASE Expression',
            code: `-- Simple CASE
SELECT nama,
  CASE kategori_id
    WHEN 1 THEN 'Elektronik'
    WHEN 2 THEN 'Pakaian'
    WHEN 3 THEN 'Makanan'
    ELSE 'Lainnya'
  END AS nama_kategori
FROM produk;

-- Searched CASE
SELECT nama, harga,
  CASE
    WHEN harga < 50000 THEN 'Budget'
    WHEN harga < 500000 THEN 'Ekonomis'
    WHEN harga < 5000000 THEN 'Menengah'
    ELSE 'Premium'
  END AS segmen_harga
FROM produk
ORDER BY harga;`,
          },
        ],
      },
    ],
    summary: [
      'Operator aritmatika memungkinkan kalkulasi langsung dalam query',
      'AND, OR, NOT menggabungkan kondisi — gunakan tanda kurung untuk kejelasan',
      'CASE expression seperti if-else untuk kondisi dalam SELECT',
      'Prioritas operator: NOT > AND > OR',
    ],
    funFact: 'MySQL juga mendukung operator bitwise (&, |, ^, ~, <<, >>) untuk operasi level bit yang jarang digunakan tapi sangat powerful!',
  },
  // Modules 7-38 abbreviated for brevity - full data below
  {
    id: 7, title: 'Fungsi String', level: 2, description: 'Menguasai fungsi-fungsi string MySQL untuk manipulasi dan transformasi teks.', estimatedMinutes: 45, database: 'perusahaan',
    topics: [
      { id: 'topic_7_1', title: 'Fungsi String Dasar', content: `MySQL menyediakan puluhan fungsi string bawaan untuk memanipulasi teks.\n\n**Fungsi populer:**\n- LENGTH(str) — panjang string dalam byte\n- CHAR_LENGTH(str) — panjang string dalam karakter\n- UPPER(str) / LOWER(str) — ubah huruf besar/kecil\n- TRIM(str) — hapus spasi di awal & akhir\n- LTRIM / RTRIM — hapus spasi kiri / kanan\n- SUBSTRING(str, pos, len) — ambil bagian string\n- CONCAT(str1, str2) — gabungkan string`, codeExamples: [{ title: 'Fungsi string dasar', code: `SELECT\n  nama,\n  LENGTH(nama) AS panjang_byte,\n  CHAR_LENGTH(nama) AS panjang_char,\n  UPPER(nama) AS huruf_besar,\n  LOWER(nama) AS huruf_kecil,\n  TRIM('  spasi  ') AS trimmed\nFROM karyawan\nLIMIT 5;` }] },
      { id: 'topic_7_2', title: 'Fungsi String Lanjutan', content: `Fungsi string lanjutan untuk transformasi dan pencarian teks yang kompleks.`, codeExamples: [{ title: 'REPLACE, CONCAT, SUBSTRING', code: `SELECT\n  nama,\n  CONCAT(nama, ' (', jabatan, ')') AS info,\n  SUBSTRING(email, 1, LOCATE('@', email)-1) AS username_email,\n  REPLACE(jabatan, 'Senior', 'Sr.') AS jabatan_singkat,\n  LPAD(id, 4, '0') AS id_format\nFROM karyawan;` }] },
    ],
    summary: ['LENGTH vs CHAR_LENGTH penting untuk string multibyte', 'CONCAT menggabungkan string, CONCAT_WS untuk separator otomatis', 'SUBSTRING dan LOCATE untuk ekstraksi dan pencarian teks'],
    funFact: 'MySQL 8.0 menambahkan fungsi REGEXP_REPLACE yang memungkinkan penggantian teks menggunakan regex!'
  },
  {
    id: 8, title: 'Fungsi Numerik & Matematika', level: 2, description: 'Menguasai fungsi matematika MySQL untuk kalkulasi dan pembulatan angka.', estimatedMinutes: 35, database: 'perusahaan',
    topics: [
      { id: 'topic_8_1', title: 'Fungsi Pembulatan', content: `MySQL menyediakan beberapa fungsi pembulatan dengan perilaku berbeda:\n- ROUND(x, d) — bulatkan ke d desimal\n- CEIL(x) / CEILING(x) — bulatkan ke atas\n- FLOOR(x) — bulatkan ke bawah\n- TRUNCATE(x, d) — potong tanpa pembulatan`, codeExamples: [{ title: 'Fungsi pembulatan', code: `SELECT\n  ROUND(3.456, 2),   -- 3.46\n  ROUND(3.454, 2),   -- 3.45\n  CEIL(3.1),         -- 4\n  FLOOR(3.9),        -- 3\n  TRUNCATE(3.987, 2); -- 3.98` }] },
      { id: 'topic_8_2', title: 'Fungsi Matematika Lainnya', content: `Fungsi matematika lainnya yang sering digunakan dalam analisis data.`, codeExamples: [{ title: 'ABS, MOD, POWER, SQRT', code: `SELECT\n  ABS(-150) AS nilai_absolut,\n  MOD(17, 5) AS sisa_bagi,\n  POWER(2, 10) AS dua_pangkat_10,\n  SQRT(144) AS akar_144,\n  RAND() AS angka_acak,\n  gaji_pokok,\n  ROUND(gaji_pokok * 0.05, -3) AS bonus_5persen\nFROM gaji LIMIT 5;` }] },
    ],
    summary: ['ROUND untuk pembulatan standar, CEIL/FLOOR untuk arah tertentu', 'TRUNCATE memotong desimal tanpa pembulatan', 'ABS untuk nilai absolut, MOD untuk sisa bagi'],
    funFact: 'MySQL menggunakan algoritma "round half away from zero" — ROUND(2.5) = 3, bukan 2!'
  },
  {
    id: 9, title: 'Fungsi Tanggal & Waktu', level: 2, description: 'Menguasai fungsi tanggal MySQL untuk manipulasi dan kalkulasi waktu.', estimatedMinutes: 50, database: 'perusahaan',
    topics: [
      { id: 'topic_9_1', title: 'Fungsi Tanggal Dasar', content: `Fungsi tanggal dan waktu sangat penting untuk laporan berbasis periode, kalkulasi umur, dan jadwal.`, codeExamples: [{ title: 'Fungsi tanggal utama', code: `SELECT\n  NOW() AS sekarang,\n  CURDATE() AS tanggal_hari_ini,\n  CURTIME() AS waktu_sekarang,\n  YEAR(NOW()) AS tahun,\n  MONTH(NOW()) AS bulan,\n  DAY(NOW()) AS hari,\n  DAYNAME(NOW()) AS nama_hari,\n  MONTHNAME(NOW()) AS nama_bulan;` }] },
      { id: 'topic_9_2', title: 'DATE_ADD, DATEDIFF, DATE_FORMAT', content: `Manipulasi tanggal dengan menambah/mengurangi interval dan memformat output.`, codeExamples: [{ title: 'Manipulasi tanggal', code: `SELECT\n  nama,\n  tanggal_masuk,\n  DATEDIFF(CURDATE(), tanggal_masuk) AS hari_bekerja,\n  FLOOR(DATEDIFF(CURDATE(), tanggal_masuk) / 365) AS tahun_bekerja,\n  DATE_FORMAT(tanggal_masuk, '%d %M %Y') AS tanggal_format,\n  DATE_ADD(tanggal_masuk, INTERVAL 1 YEAR) AS anniversary\nFROM karyawan;` }] },
    ],
    summary: ['NOW(), CURDATE(), CURTIME() untuk mendapatkan waktu saat ini', 'DATEDIFF menghitung selisih hari antara dua tanggal', 'DATE_FORMAT memformat tanggal sesuai kebutuhan tampilan'],
    funFact: 'MySQL menyimpan TIMESTAMP dalam UTC, jadi jika server pindah timezone, nilai TIMESTAMP otomatis menyesuaikan!'
  },
  {
    id: 10, title: 'Fungsi NULL & Kondisional', level: 2, description: 'Memahami cara MySQL menangani NULL dan fungsi kondisional seperti COALESCE dan IFNULL.', estimatedMinutes: 35, database: 'perusahaan',
    topics: [
      { id: 'topic_10_1', title: 'Memahami NULL', content: `NULL dalam SQL bukan 0, bukan string kosong — NULL berarti "tidak ada nilai" atau "tidak diketahui". Ini menyebabkan banyak bug jika tidak dipahami dengan benar.\n\n**Aturan NULL:**\n- NULL = NULL menghasilkan NULL (bukan TRUE!)\n- Gunakan IS NULL / IS NOT NULL untuk memeriksa NULL\n- Hampir semua operasi dengan NULL menghasilkan NULL`, codeExamples: [{ title: 'Perilaku NULL', code: `-- Ini SALAH: tidak akan mengembalikan baris apapun\nSELECT * FROM karyawan WHERE manager_id = NULL;\n\n-- Ini BENAR\nSELECT * FROM karyawan WHERE manager_id IS NULL;\n\n-- NULL dalam aritmatika\nSELECT 100 + NULL; -- NULL\nSELECT NULL = NULL; -- NULL (bukan TRUE!)` }] },
      { id: 'topic_10_2', title: 'IFNULL, COALESCE, NULLIF', content: `Fungsi untuk menangani NULL dengan elegan.`, codeExamples: [{ title: 'Fungsi NULL handling', code: `SELECT\n  nama,\n  IFNULL(manager_id, 'Tidak punya manager') AS manager,\n  COALESCE(telepon, email, 'Tidak ada kontak') AS kontak,\n  NULLIF(bonus, 0) AS bonus_jika_ada\nFROM karyawan k\nLEFT JOIN gaji g ON k.id = g.karyawan_id;` }] },
    ],
    summary: ['NULL bukan 0 dan bukan string kosong — artinya "tidak ada nilai"', 'Gunakan IS NULL / IS NOT NULL, bukan = NULL', 'COALESCE mengembalikan nilai pertama yang tidak NULL dari daftar'],
    funFact: 'NULL adalah salah satu konsep paling kontroversial dalam SQL! Edgar Codd, penemu SQL relasional, menyebut NULL sebagai "informasi yang hilang atau tidak berlaku".'
  },
  {
    id: 11, title: 'Agregasi & Grouping', level: 2, description: 'Menguasai fungsi agregat COUNT, SUM, AVG, MIN, MAX dan klausa GROUP BY, HAVING.', estimatedMinutes: 55, database: 'perusahaan',
    topics: [
      { id: 'topic_11_1', title: 'Fungsi Agregat', content: `Fungsi agregat menghitung nilai dari sekelompok baris dan mengembalikan satu nilai.\n\n| Fungsi | Deskripsi |\n|--------|----------|\n| COUNT(*) | Hitung jumlah baris |\n| COUNT(kolom) | Hitung baris non-NULL |\n| SUM(kolom) | Jumlahkan nilai |\n| AVG(kolom) | Rata-rata nilai |\n| MIN(kolom) | Nilai minimum |\n| MAX(kolom) | Nilai maksimum |`, codeExamples: [{ title: 'Fungsi agregat dasar', code: `SELECT\n  COUNT(*) AS total_karyawan,\n  COUNT(DISTINCT departemen_id) AS jumlah_dept,\n  AVG(gaji_pokok) AS rata_gaji,\n  MAX(gaji_pokok) AS gaji_tertinggi,\n  MIN(gaji_pokok) AS gaji_terendah,\n  SUM(gaji_pokok) AS total_gaji\nFROM karyawan k\nJOIN gaji g ON k.id = g.karyawan_id\nWHERE g.bulan = '2024-01';` }] },
      { id: 'topic_11_2', title: 'GROUP BY & HAVING', content: `GROUP BY mengelompokkan baris berdasarkan satu atau lebih kolom, lalu fungsi agregat diterapkan per group.\n\n**Perbedaan WHERE vs HAVING:**\n- WHERE: filter sebelum grouping\n- HAVING: filter setelah grouping (bisa menggunakan fungsi agregat)`, codeExamples: [{ title: 'GROUP BY dan HAVING', code: `-- Rata-rata gaji per departemen\nSELECT\n  d.nama AS departemen,\n  COUNT(k.id) AS jumlah_karyawan,\n  AVG(g.gaji_pokok) AS rata_gaji,\n  SUM(g.gaji_pokok + g.tunjangan + g.bonus) AS total_pengeluaran\nFROM departemen d\nJOIN karyawan k ON d.id = k.departemen_id\nJOIN gaji g ON k.id = g.karyawan_id\nWHERE g.bulan = '2024-01'\nGROUP BY d.id, d.nama\nHAVING AVG(g.gaji_pokok) > 8000000\nORDER BY rata_gaji DESC;` }] },
    ],
    summary: ['Fungsi agregat menghitung nilai dari sekelompok baris', 'GROUP BY mengelompokkan baris untuk agregasi per group', 'HAVING memfilter hasil GROUP BY, WHERE memfilter sebelum grouping'],
    funFact: 'MySQL 8.0 memperkenalkan ROLLUP extension untuk GROUP BY yang secara otomatis menghitung subtotal dan grand total!'
  },
  {
    id: 12, title: 'Regular Expression', level: 2, description: 'Menggunakan REGEXP dan RLIKE untuk pencarian pola teks yang kompleks dalam MySQL.', estimatedMinutes: 40, database: 'perusahaan',
    topics: [
      { id: 'topic_12_1', title: 'REGEXP Dasar', content: `Regular Expression (regex) adalah pola teks untuk mencari string yang kompleks. MySQL mendukung regex melalui operator REGEXP atau RLIKE.\n\n**Karakter Khusus Regex:**\n- . — karakter apapun\n- * — 0 atau lebih dari karakter sebelumnya\n- + — 1 atau lebih\n- ? — 0 atau 1\n- ^ — awal string\n- $ — akhir string\n- [abc] — salah satu dari a, b, atau c\n- [a-z] — rentang karakter`, codeExamples: [{ title: 'REGEXP dalam WHERE', code: `-- Email valid dengan domain tertentu\nSELECT nama, email FROM karyawan\nWHERE email REGEXP '^[a-z]+@company\\.com$';\n\n-- Nama yang dimulai dengan A atau B\nSELECT * FROM karyawan\nWHERE nama REGEXP '^[AB]';\n\n-- Nomor telepon format Indonesia\nSELECT * FROM karyawan\nWHERE telepon REGEXP '^08[0-9]{8,11}$';` }] },
    ],
    summary: ['REGEXP memungkinkan pencarian pola teks yang kompleks', 'MySQL 8.0 mendukung REGEXP_REPLACE, REGEXP_SUBSTR, REGEXP_INSTR', 'Regex lebih powerful dari LIKE tapi lebih lambat'],
    funFact: 'MySQL menggunakan library ICU (International Components for Unicode) untuk regex di versi 8.0, mendukung Unicode penuh!'
  },
  {
    id: 13, title: 'UNION & Temporary Table', level: 2, description: 'Menggabungkan hasil beberapa query dengan UNION dan menggunakan tabel sementara.', estimatedMinutes: 40, database: 'perusahaan',
    topics: [
      { id: 'topic_13_1', title: 'UNION & UNION ALL', content: `UNION menggabungkan hasil dari dua atau lebih SELECT query menjadi satu result set.\n\n**Aturan UNION:**\n- Jumlah kolom harus sama\n- Tipe data kolom harus kompatibel\n- UNION menghilangkan duplikat (lebih lambat)\n- UNION ALL mempertahankan duplikat (lebih cepat)`, codeExamples: [{ title: 'UNION dan UNION ALL', code: `-- Gabungkan karyawan dari 2 departemen\nSELECT nama, jabatan, 'TI' AS dept FROM karyawan WHERE departemen_id = 1\nUNION ALL\nSELECT nama, jabatan, 'Pemasaran' AS dept FROM karyawan WHERE departemen_id = 2\nORDER BY nama;` }] },
      { id: 'topic_13_2', title: 'Temporary Table', content: `Temporary table adalah tabel sementara yang hanya hidup selama sesi berlangsung. Sangat berguna untuk menyimpan hasil kalkulasi antara.`, codeExamples: [{ title: 'CREATE TEMPORARY TABLE', code: `-- Buat temporary table\nCREATE TEMPORARY TABLE temp_summary AS\nSELECT\n  departemen_id,\n  COUNT(*) AS jumlah,\n  AVG(gaji_pokok) AS rata_gaji\nFROM karyawan k\nJOIN gaji g ON k.id = g.karyawan_id\nGROUP BY departemen_id;\n\n-- Gunakan dalam query lain\nSELECT d.nama, t.jumlah, t.rata_gaji\nFROM departemen d\nJOIN temp_summary t ON d.id = t.departemen_id;` }] },
    ],
    summary: ['UNION menggabungkan hasil query, UNION ALL lebih cepat tapi bisa duplikat', 'Kolom UNION harus sama jumlah dan kompatibel tipenya', 'Temporary table otomatis terhapus saat sesi berakhir'],
    funFact: 'UNION dengan ORDER BY harus diletakkan di akhir query terakhir, bukan di tengah-tengah!'
  },
  {
    id: 14, title: 'JOIN Dasar', level: 2, description: 'Menguasai INNER JOIN, LEFT JOIN, RIGHT JOIN untuk menggabungkan data dari beberapa tabel.', estimatedMinutes: 60, database: 'ecommerce',
    topics: [
      { id: 'topic_14_1', title: 'INNER JOIN', content: `JOIN menggabungkan baris dari dua atau lebih tabel berdasarkan kolom yang memiliki nilai yang sama (kondisi join).\n\n**INNER JOIN** mengembalikan hanya baris yang memiliki kecocokan di KEDUA tabel.`, codeExamples: [{ title: 'INNER JOIN', code: `-- Produk beserta nama kategorinya\nSELECT p.nama, p.harga, k.nama AS kategori\nFROM produk p\nINNER JOIN kategori k ON p.kategori_id = k.id\nORDER BY k.nama, p.nama;` }] },
      { id: 'topic_14_2', title: 'LEFT JOIN & RIGHT JOIN', content: `**LEFT JOIN** mengembalikan semua baris dari tabel kiri, dan baris yang cocok dari tabel kanan (NULL jika tidak ada kecocokan).\n\n**RIGHT JOIN** adalah kebalikannya — semua baris dari tabel kanan.`, codeExamples: [{ title: 'LEFT JOIN', code: `-- Semua user, termasuk yang belum pernah order\nSELECT\n  u.nama_lengkap,\n  COUNT(o.id) AS total_order,\n  COALESCE(SUM(o.total), 0) AS total_belanja\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.nama_lengkap\nORDER BY total_belanja DESC;` }] },
    ],
    summary: ['INNER JOIN hanya baris yang match di kedua tabel', 'LEFT JOIN semua baris kiri + baris kanan yang match', 'JOIN bisa digabung lebih dari 2 tabel secara berantai'],
    funFact: 'CROSS JOIN menghasilkan produk kartesian — jika tabel A punya 100 baris dan B punya 100 baris, hasilnya 10.000 baris!'
  },
  {
    id: 15, title: 'JOIN Lanjutan', level: 2, description: 'SELF JOIN, CROSS JOIN, dan teknik JOIN kompleks untuk kasus khusus.', estimatedMinutes: 50, database: 'ecommerce',
    topics: [
      { id: 'topic_15_1', title: 'SELF JOIN', content: `SELF JOIN adalah tabel yang di-JOIN dengan dirinya sendiri. Berguna untuk data hierarki seperti struktur organisasi atau kategori parent-child.`, codeExamples: [{ title: 'SELF JOIN hierarki kategori', code: `-- Tampilkan kategori beserta parent-nya\nSELECT\n  anak.nama AS sub_kategori,\n  induk.nama AS kategori_induk\nFROM kategori anak\nLEFT JOIN kategori induk ON anak.parent_id = induk.id\nORDER BY induk.nama, anak.nama;` }] },
      { id: 'topic_15_2', title: 'Multi-table JOIN', content: `Menggabungkan lebih dari dua tabel sekaligus untuk mendapatkan data yang terhubung.`, codeExamples: [{ title: 'JOIN 4 tabel', code: `-- Detail order lengkap\nSELECT\n  o.id AS order_id,\n  u.nama_lengkap AS pelanggan,\n  p.nama AS produk,\n  od.jumlah,\n  od.harga_satuan,\n  od.jumlah * od.harga_satuan AS subtotal\nFROM orders o\nJOIN users u ON o.user_id = u.id\nJOIN order_detail od ON o.id = od.order_id\nJOIN produk p ON od.produk_id = p.id\nORDER BY o.id;` }] },
    ],
    summary: ['SELF JOIN berguna untuk data hierarki dalam satu tabel', 'Multi-table JOIN menggabungkan lebih dari 2 tabel berantai', 'Selalu beri alias tabel saat JOIN untuk kejelasan'],
    funFact: 'MySQL optimizer secara otomatis menentukan urutan terbaik untuk JOIN — kamu tidak perlu khawatir tentang urutan tabel!'
  },
  {
    id: 16, title: 'Subquery Dasar', level: 2, description: 'Menggunakan subquery (query dalam query) untuk kasus yang tidak bisa diselesaikan dengan JOIN biasa.', estimatedMinutes: 50, database: 'ecommerce',
    topics: [
      { id: 'topic_16_1', title: 'Subquery di WHERE', content: `Subquery adalah query yang nested di dalam query lain. Subquery di WHERE dieksekusi LEBIH DULU, hasilnya digunakan oleh query luar.`, codeExamples: [{ title: 'Subquery di WHERE', code: `-- Produk yang harganya di atas rata-rata\nSELECT nama, harga FROM produk\nWHERE harga > (SELECT AVG(harga) FROM produk)\nORDER BY harga DESC;\n\n-- User yang pernah memesan produk tertentu\nSELECT nama_lengkap FROM users\nWHERE id IN (\n  SELECT DISTINCT o.user_id\n  FROM orders o\n  JOIN order_detail od ON o.id = od.order_id\n  WHERE od.produk_id = 1\n);` }] },
      { id: 'topic_16_2', title: 'Subquery di FROM', content: `Subquery di FROM menciptakan "derived table" — tabel virtual yang bisa di-query lagi.`, codeExamples: [{ title: 'Derived Table', code: `-- Top 3 kategori berdasarkan total penjualan\nSELECT k.nama, sub.total_penjualan\nFROM (\n  SELECT p.kategori_id, SUM(od.jumlah * od.harga_satuan) AS total_penjualan\n  FROM order_detail od\n  JOIN produk p ON od.produk_id = p.id\n  GROUP BY p.kategori_id\n) AS sub\nJOIN kategori k ON sub.kategori_id = k.id\nORDER BY total_penjualan DESC\nLIMIT 3;` }] },
    ],
    summary: ['Subquery di WHERE menghasilkan nilai untuk kondisi', 'Subquery di FROM (derived table) menghasilkan tabel virtual', 'EXISTS lebih efisien dari IN untuk subquery yang mengembalikan banyak baris'],
    funFact: 'MySQL optimizer sering mengonversi subquery IN menjadi JOIN secara internal untuk performa yang lebih baik!'
  },
  {
    id: 17, title: 'Subquery Lanjutan', level: 2, description: 'Correlated subquery, EXISTS, dan teknik subquery untuk analisis data yang kompleks.', estimatedMinutes: 55, database: 'ecommerce',
    topics: [
      { id: 'topic_17_1', title: 'Correlated Subquery', content: `Correlated subquery mereferensikan kolom dari query luar. Dieksekusi SEKALI PER BARIS dari query luar (lebih lambat dari uncorrelated subquery).`, codeExamples: [{ title: 'Correlated Subquery', code: `-- Produk yang total terjual > rata-rata semua produk\nSELECT p.nama, p.terjual\nFROM produk p\nWHERE p.terjual > (\n  SELECT AVG(terjual) FROM produk\n);\n\n-- User yang total belanjanya di atas rata-rata\nSELECT u.nama_lengkap,\n  (SELECT SUM(o.total) FROM orders o WHERE o.user_id = u.id) AS total_belanja\nFROM users u\nHAVING total_belanja > (SELECT AVG(total) FROM orders);` }] },
      { id: 'topic_17_2', title: 'EXISTS & NOT EXISTS', content: `EXISTS mengembalikan TRUE jika subquery menghasilkan minimal satu baris. Lebih efisien dari IN untuk subquery besar.`, codeExamples: [{ title: 'EXISTS dan NOT EXISTS', code: `-- User yang memiliki order\nSELECT nama_lengkap FROM users u\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.user_id = u.id\n);\n\n-- Produk yang belum pernah dipesan\nSELECT nama FROM produk p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_detail od WHERE od.produk_id = p.id\n);` }] },
    ],
    summary: ['Correlated subquery dieksekusi per baris query luar — gunakan dengan hati-hati', 'EXISTS lebih efisien dari IN untuk memeriksa keberadaan data', 'NOT EXISTS berguna untuk mencari data yang tidak memiliki relasi'],
    funFact: 'EXISTS berhenti mencari begitu menemukan baris pertama yang cocok — itulah mengapa lebih efisien dari COUNT(*) > 0!'
  },
  {
    id: 18, title: 'Foreign Key & Desain Relasi', level: 2, description: 'Memahami Foreign Key, constraint relasional, dan prinsip desain database yang baik.', estimatedMinutes: 55, database: 'ecommerce',
    topics: [
      { id: 'topic_18_1', title: 'Foreign Key', content: `Foreign Key (FK) adalah constraint yang memastikan integritas referensial — nilai di kolom FK harus ada di tabel yang direferensikan.\n\n**ON DELETE/UPDATE actions:**\n- RESTRICT — tolak perubahan jika ada referensi\n- CASCADE — hapus/update baris terkait otomatis\n- SET NULL — set FK menjadi NULL\n- NO ACTION — seperti RESTRICT`, codeExamples: [{ title: 'Mendefinisikan Foreign Key', code: `CREATE TABLE order_detail (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  produk_id INT NOT NULL,\n  jumlah INT NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(id)\n    ON DELETE CASCADE ON UPDATE CASCADE,\n  FOREIGN KEY (produk_id) REFERENCES produk(id)\n    ON DELETE RESTRICT ON UPDATE CASCADE\n);` }] },
      { id: 'topic_18_2', title: 'Jenis Relasi Database', content: `Tiga jenis relasi utama:\n\n- **One-to-One (1:1)** — satu user punya satu profil\n- **One-to-Many (1:N)** — satu kategori punya banyak produk\n- **Many-to-Many (M:N)** — satu artikel bisa punya banyak tag, satu tag bisa di banyak artikel`, codeExamples: [{ title: 'Contoh relasi M:N', code: `-- Tabel junction untuk relasi Many-to-Many\nCREATE TABLE artikel_tag (\n  artikel_id INT NOT NULL,\n  tag_id INT NOT NULL,\n  PRIMARY KEY (artikel_id, tag_id),\n  FOREIGN KEY (artikel_id) REFERENCES artikel(id) ON DELETE CASCADE,\n  FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE\n);` }] },
    ],
    summary: ['Foreign Key menjaga integritas referensial antara tabel', 'CASCADE otomatis propagasi perubahan ke tabel anak', 'Relasi M:N membutuhkan tabel junction/pivot'],
    funFact: 'Foreign Key constraint hanya bekerja di storage engine InnoDB, tidak di MyISAM!'
  },
  {
    id: 19, title: 'Index', level: 3, description: 'Memahami cara kerja index MySQL dan kapan harus menggunakannya untuk optimasi query.', estimatedMinutes: 60, database: 'blog',
    topics: [
      { id: 'topic_19_1', title: 'Apa itu Index?', content: `Index adalah struktur data yang mempercepat pengambilan data, mirip indeks di belakang buku. Tanpa index, MySQL harus membaca semua baris (full table scan).\n\n**Tipe Index:**\n- PRIMARY KEY — unik, otomatis terindex\n- UNIQUE — nilai unik, bisa NULL\n- INDEX (KEY) — index biasa, nilai bisa duplikat\n- FULLTEXT — untuk full-text search\n- SPATIAL — untuk data geografis`, codeExamples: [{ title: 'Membuat dan memeriksa index', code: `-- Buat index\nCREATE INDEX idx_artikel_status ON artikel(status);\nCREATE INDEX idx_artikel_penulis ON artikel(penulis_id, status);\n\n-- Lihat index yang ada\nSHOW INDEX FROM artikel;\n\n-- Hapus index\nDROP INDEX idx_artikel_status ON artikel;` }] },
      { id: 'topic_19_2', title: 'Kapan Menggunakan Index?', content: `Index mempercepat SELECT tapi memperlambat INSERT/UPDATE/DELETE. Gunakan index pada:\n- Kolom yang sering di-WHERE atau JOIN\n- Kolom yang sering di-ORDER BY\n- Kolom foreign key\n\n**Jangan index kolom yang:**\n- Nilai sering berubah (overhead tinggi)\n- Kardinalitas rendah (misal: kolom gender)\n- Tabel kecil (full scan lebih cepat)`, codeExamples: [{ title: 'Composite Index', code: `-- Composite index untuk query yang sering digunakan\nCREATE INDEX idx_artikel_search\nON artikel(status, penulis_id, diterbitkan);\n\n-- Query ini akan menggunakan index di atas\nSELECT * FROM artikel\nWHERE status = 'published'\n  AND penulis_id = 1\nORDER BY diterbitkan DESC;` }] },
    ],
    summary: ['Index mempercepat SELECT tapi memperlambat write operations', 'Primary Key otomatis terindex', 'Composite index mengikuti aturan "leftmost prefix"'],
    funFact: 'InnoDB menggunakan B+Tree untuk index — setiap operasi find membutuhkan O(log n) waktu, jauh lebih cepat dari O(n) full scan!'
  },
  {
    id: 20, title: 'EXPLAIN & Analisis Query', level: 3, description: 'Menggunakan EXPLAIN untuk memahami dan mengoptimalkan execution plan query MySQL.', estimatedMinutes: 50, database: 'blog',
    topics: [
      { id: 'topic_20_1', title: 'EXPLAIN Dasar', content: `EXPLAIN menampilkan rencana eksekusi query — bagaimana MySQL akan menjalankan query tersebut. Ini adalah alat utama untuk optimasi query.\n\n**Kolom penting EXPLAIN:**\n- type: jenis akses (ALL=buruk, ref/eq_ref/const=baik)\n- key: index yang digunakan\n- rows: estimasi baris yang dibaca\n- Extra: informasi tambahan`, codeExamples: [{ title: 'Menggunakan EXPLAIN', code: `EXPLAIN SELECT a.judul, p.nama\nFROM artikel a\nJOIN penulis p ON a.penulis_id = p.id\nWHERE a.status = 'published'\nORDER BY a.diterbitkan DESC;\n\n-- EXPLAIN FORMAT=JSON untuk detail lebih lengkap\nEXPLAIN FORMAT=JSON\nSELECT * FROM artikel WHERE status = 'published';` }] },
    ],
    summary: ['EXPLAIN menampilkan rencana eksekusi query tanpa menjalankannya', 'type=ALL berarti full table scan — perlu optimasi', 'Perhatikan kolom rows dan Extra untuk identifikasi bottleneck'],
    funFact: 'MySQL 8.0 menambahkan EXPLAIN ANALYZE yang benar-benar menjalankan query dan menampilkan waktu aktual tiap operasi!'
  },
  {
    id: 21, title: 'VIEW', level: 3, description: 'Membuat dan menggunakan VIEW sebagai tabel virtual untuk menyederhanakan query kompleks.', estimatedMinutes: 40, database: 'blog',
    topics: [
      { id: 'topic_21_1', title: 'Membuat VIEW', content: `VIEW adalah tabel virtual yang definisinya berupa query SQL. View tidak menyimpan data — setiap kali diakses, query dasarnya dieksekusi ulang.\n\n**Manfaat VIEW:**\n- Menyederhanakan query kompleks\n- Keamanan — sembunyikan kolom sensitif\n- Konsistensi — satu definisi untuk semua user`, codeExamples: [{ title: 'CREATE VIEW', code: `-- View artikel published dengan info penulis\nCREATE VIEW v_artikel_published AS\nSELECT\n  a.id, a.judul, a.kategori,\n  a.dilihat, a.diterbitkan,\n  p.nama AS penulis,\n  COUNT(k.id) AS jumlah_komentar\nFROM artikel a\nJOIN penulis p ON a.penulis_id = p.id\nLEFT JOIN komentar k ON a.id = k.artikel_id AND k.disetujui = 1\nWHERE a.status = 'published'\nGROUP BY a.id;\n\n-- Gunakan view seperti tabel biasa\nSELECT * FROM v_artikel_published\nWHERE penulis = 'Andi Wijaya'\nORDER BY diterbitkan DESC;` }] },
    ],
    summary: ['VIEW adalah query tersimpan yang bisa diperlakukan sebagai tabel', 'View tidak menyimpan data, query dasarnya dieksekusi tiap akses', 'Updatable view memungkinkan INSERT/UPDATE/DELETE ke view'],
    funFact: 'MySQL memiliki konsep "Materialized View" melalui tabel dengan trigger, meski tidak seperti PostgreSQL yang mendukungnya secara native!'
  },
  {
    id: 22, title: 'Stored Procedure', level: 3, description: 'Membuat stored procedure untuk mengenkapsulasi logika bisnis di sisi database.', estimatedMinutes: 60, database: 'blog',
    topics: [
      { id: 'topic_22_1', title: 'Membuat Stored Procedure', content: `Stored Procedure adalah kumpulan perintah SQL yang tersimpan di database dan bisa dipanggil berulang kali.\n\n**Manfaat:**\n- Kurangi traffic jaringan\n- Enkapsulasi logika bisnis\n- Keamanan dan kontrol akses\n- Performa (pre-compiled)`, codeExamples: [{ title: 'CREATE PROCEDURE', code: `DELIMITER //\n\nCREATE PROCEDURE GetArtikelByPenulis(\n  IN p_penulis_id INT,\n  IN p_status VARCHAR(20),\n  OUT p_total INT\n)\nBEGIN\n  SELECT COUNT(*) INTO p_total\n  FROM artikel\n  WHERE penulis_id = p_penulis_id AND status = p_status;\n\n  SELECT id, judul, dilihat, diterbitkan\n  FROM artikel\n  WHERE penulis_id = p_penulis_id AND status = p_status\n  ORDER BY diterbitkan DESC;\nEND //\n\nDELIMITER ;\n\n-- Panggil procedure\nCALL GetArtikelByPenulis(1, 'published', @total);\nSELECT @total AS total_artikel;` }] },
    ],
    summary: ['Stored Procedure menyimpan logika SQL yang bisa dipanggil berulang', 'Parameter: IN (input), OUT (output), INOUT (keduanya)', 'DELIMITER harus diubah saat membuat prosedur dengan multiple statements'],
    funFact: 'Stored Procedure pertama kali diperkenalkan di MySQL 5.0 pada tahun 2005!'
  },
  {
    id: 23, title: 'User-Defined Function', level: 3, description: 'Membuat fungsi kustom yang mengembalikan nilai dan bisa digunakan dalam query SELECT.', estimatedMinutes: 45, database: 'blog',
    topics: [
      { id: 'topic_23_1', title: 'Membuat UDF', content: `User-Defined Function (UDF) mirip stored procedure, tapi MENGEMBALIKAN NILAI dan bisa digunakan langsung dalam query SELECT.\n\n**Perbedaan Function vs Procedure:**\n- Function: RETURNS nilai, bisa di-SELECT\n- Procedure: tidak return nilai langsung, dipanggil dengan CALL`, codeExamples: [{ title: 'CREATE FUNCTION', code: `DELIMITER //\n\nCREATE FUNCTION HitungRahayu(artikel_id INT)\nRETURNS DECIMAL(5,2)\nDETERMINISTIC\nREADS SQL DATA\nBEGIN\n  DECLARE total_komentar INT;\n  DECLARE rata_views DECIMAL(10,2);\n  DECLARE skor DECIMAL(5,2);\n\n  SELECT COUNT(*) INTO total_komentar\n  FROM komentar WHERE artikel_id = artikel_id AND disetujui = 1;\n\n  SELECT dilihat INTO rata_views\n  FROM artikel WHERE id = artikel_id;\n\n  SET skor = (rata_views / 1000) + (total_komentar * 2);\n  RETURN ROUND(skor, 2);\nEND //\n\nDELIMITER ;\n\n-- Gunakan dalam SELECT\nSELECT judul, HitungRahayu(id) AS engagement_score\nFROM artikel WHERE status = 'published'\nORDER BY engagement_score DESC;` }] },
    ],
    summary: ['Function mengembalikan nilai dan bisa digunakan dalam SELECT', 'DETERMINISTIC berarti output selalu sama untuk input yang sama', 'Gunakan READS SQL DATA atau MODIFIES SQL DATA sesuai operasi'],
    funFact: 'MySQL juga mendukung UDF berbasis plugin C/C++ untuk fungsi yang membutuhkan performa sangat tinggi!'
  },
  {
    id: 24, title: 'Trigger', level: 3, description: 'Membuat trigger untuk mengeksekusi aksi otomatis saat terjadi perubahan data.', estimatedMinutes: 50, database: 'blog',
    topics: [
      { id: 'topic_24_1', title: 'Membuat Trigger', content: `Trigger adalah prosedur yang otomatis dieksekusi saat terjadi event INSERT, UPDATE, atau DELETE pada tabel.\n\n**Jenis Trigger:**\n- BEFORE INSERT/UPDATE/DELETE\n- AFTER INSERT/UPDATE/DELETE\n\n**Referensi dalam trigger:**\n- NEW: baris baru (INSERT, UPDATE)\n- OLD: baris lama (UPDATE, DELETE)`, codeExamples: [{ title: 'AFTER INSERT Trigger', code: `DELIMITER //\n\nCREATE TRIGGER after_komentar_insert\nAFTER INSERT ON komentar\nFOR EACH ROW\nBEGIN\n  -- Update total komentar artikel\n  IF NEW.disetujui = 1 THEN\n    UPDATE artikel\n    SET -- kita catat waktu komentar terakhir\n        dibuat = dibuat  -- placeholder\n    WHERE id = NEW.artikel_id;\n  END IF;\nEND //\n\n-- Trigger untuk audit log\nCREATE TRIGGER before_artikel_update\nBEFORE UPDATE ON artikel\nFOR EACH ROW\nBEGIN\n  IF OLD.status != NEW.status THEN\n    INSERT INTO audit_log (tabel, aksi, id_data, waktu)\n    VALUES ('artikel', 'status_change', NEW.id, NOW());\n  END IF;\nEND //\n\nDELIMITER ;` }] },
    ],
    summary: ['Trigger otomatis berjalan saat INSERT, UPDATE, atau DELETE', 'NEW merujuk baris baru, OLD merujuk baris lama', 'BEFORE trigger bisa mencegah operasi dengan SIGNAL SQLSTATE'],
    funFact: 'MySQL tidak mendukung trigger yang memodifikasi tabel yang sama dengan yang memicunya — ini mencegah infinite loop!'
  },
  {
    id: 25, title: 'Event Scheduler', level: 3, description: 'Menjadwalkan eksekusi SQL otomatis pada waktu tertentu menggunakan MySQL Event Scheduler.', estimatedMinutes: 35, database: 'blog',
    topics: [
      { id: 'topic_25_1', title: 'Membuat Event', content: `Event Scheduler memungkinkan MySQL menjalankan query secara terjadwal, seperti cron job tapi di dalam database.\n\n**Aktifkan Event Scheduler:**\n\`\`\`sql\nSET GLOBAL event_scheduler = ON;\n\`\`\``, codeExamples: [{ title: 'CREATE EVENT', code: `-- Event sekali jalan\nCREATE EVENT hapus_draft_lama\nON SCHEDULE AT '2024-12-31 23:59:59'\nDO DELETE FROM artikel\nWHERE status = 'draft'\nAND dibuat < DATE_SUB(NOW(), INTERVAL 6 MONTH);\n\n-- Event berulang (setiap hari)\nCREATE EVENT backup_harian\nON SCHEDULE EVERY 1 DAY\nSTARTS '2024-01-01 02:00:00'\nDO\nBEGIN\n  INSERT INTO log_aktivitas (aksi, waktu)\n  VALUES ('Backup harian', NOW());\nEND;\n\n-- Lihat event yang ada\nSHOW EVENTS;` }] },
    ],
    summary: ['Event Scheduler menjalankan SQL secara terjadwal seperti cron', 'Bisa sekali jalan atau berulang dengan interval tertentu', 'Harus diaktifkan dulu dengan SET GLOBAL event_scheduler = ON'],
    funFact: 'Event Scheduler berjalan di thread terpisah di MySQL server, jadi tidak mempengaruhi performa query normal!'
  },
  {
    id: 26, title: 'Transaksi & ACID', level: 3, description: 'Memahami transaksi database, properti ACID, dan cara mengelola transaksi dengan COMMIT dan ROLLBACK.', estimatedMinutes: 55, database: 'blog',
    topics: [
      { id: 'topic_26_1', title: 'Transaksi & ACID', content: `Transaksi adalah sekelompok operasi SQL yang dianggap sebagai satu unit kerja — semuanya berhasil atau semuanya dibatalkan.\n\n**Properti ACID:**\n- **A**tomicity — semua atau tidak sama sekali\n- **C**onsistency — database tetap konsisten\n- **I**solation — transaksi tidak saling mengganggu\n- **D**urability — perubahan yang di-commit permanen`, codeExamples: [{ title: 'Transaksi dasar', code: `START TRANSACTION;\n\n-- Transfer uang antar rekening (contoh atomicity)\nUPDATE rekening SET saldo = saldo - 500000 WHERE id = 1;\nUPDATE rekening SET saldo = saldo + 500000 WHERE id = 2;\n\n-- Cek: jika saldo pengirim negatif, batalkan\n-- Jika OK:\nCOMMIT;\n\n-- Jika ada masalah:\n-- ROLLBACK;` }, { title: 'SAVEPOINT', code: `START TRANSACTION;\n\nINSERT INTO artikel (judul, penulis_id) VALUES ('Draft 1', 1);\nSAVEPOINT sp1;\n\nINSERT INTO artikel (judul, penulis_id) VALUES ('Draft 2', 1);\n-- Batalkan hanya sampai savepoint\nROLLBACK TO SAVEPOINT sp1;\n\n-- Draft 2 dibatalkan, Draft 1 masih ada\nCOMMIT;` }] },
    ],
    summary: ['Transaksi menjamin operasi berjalan atomis — semua atau tidak sama sekali', 'COMMIT menyimpan perubahan, ROLLBACK membatalkan', 'SAVEPOINT memungkinkan rollback parsial dalam transaksi'],
    funFact: 'InnoDB menggunakan undo log untuk mendukung ROLLBACK — setiap perubahan disimpan sebelum dieksekusi!'
  },
  {
    id: 27, title: 'Full-Text Search', level: 3, description: 'Mengimplementasikan pencarian teks lengkap yang cepat dan relevan dengan MySQL Full-Text Search.', estimatedMinutes: 45, database: 'blog',
    topics: [
      { id: 'topic_27_1', title: 'FULLTEXT Index', content: `Full-Text Search memungkinkan pencarian kata kunci dalam konten teks panjang, jauh lebih powerful dari LIKE '%kata%'.\n\n**Mode pencarian:**\n- IN NATURAL LANGUAGE MODE (default) — relevansi otomatis\n- IN BOOLEAN MODE — operator khusus (+, -, *, "")`, codeExamples: [{ title: 'FULLTEXT Search', code: `-- Tambah fulltext index\nALTER TABLE artikel ADD FULLTEXT INDEX ft_artikel(judul, konten);\n\n-- Natural language search\nSELECT judul, MATCH(judul, konten) AGAINST('python database') AS skor\nFROM artikel\nWHERE MATCH(judul, konten) AGAINST('python database')\nORDER BY skor DESC;\n\n-- Boolean mode\nSELECT judul FROM artikel\nWHERE MATCH(judul, konten)\n  AGAINST('+python -java tutorial*' IN BOOLEAN MODE);` }] },
    ],
    summary: ['FULLTEXT index jauh lebih cepat dari LIKE untuk pencarian teks', 'Natural language mode otomatis menghitung relevansi', 'Boolean mode mendukung operator khusus untuk pencarian presisi'],
    funFact: 'MySQL Full-Text Search mengabaikan "stopwords" umum seperti "the", "a", "is" secara default untuk meningkatkan relevansi!'
  },
  {
    id: 28, title: 'Window Functions', level: 4, description: 'Menguasai window functions untuk analisis data yang canggih tanpa GROUP BY tradisional.', estimatedMinutes: 65, database: 'analitik',
    topics: [
      { id: 'topic_28_1', title: 'Pengenalan Window Functions', content: `Window function melakukan kalkulasi pada "jendela" baris yang berhubungan dengan baris saat ini, TANPA mengelompokkan baris seperti GROUP BY.\n\n**Sintaks:**\n\`\`\`sql\nfungsi() OVER (\n  PARTITION BY kolom  -- kelompokkan\n  ORDER BY kolom      -- urutkan dalam window\n  ROWS BETWEEN ...    -- batasi frame\n)\n\`\`\`\n\n**Fungsi populer:** ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM, AVG`, codeExamples: [{ title: 'Ranking dengan Window Functions', code: `SELECT\n  p.nama AS produk,\n  p.kategori,\n  SUM(t.total_pendapatan) AS total_penjualan,\n  RANK() OVER (ORDER BY SUM(t.total_pendapatan) DESC) AS rank_global,\n  RANK() OVER (\n    PARTITION BY p.kategori\n    ORDER BY SUM(t.total_pendapatan) DESC\n  ) AS rank_per_kategori\nFROM transaksi t\nJOIN produk p ON t.produk_id = p.id\nGROUP BY p.id, p.nama, p.kategori\nORDER BY p.kategori, rank_per_kategori;` }] },
      { id: 'topic_28_2', title: 'LAG, LEAD & Running Total', content: `LAG dan LEAD mengakses baris sebelumnya/sesudahnya dalam window. Sangat berguna untuk analisis tren dan perbandingan periode.`, codeExamples: [{ title: 'LAG, LEAD, Running Total', code: `-- Pertumbuhan penjualan bulan ke bulan\nSELECT\n  w.nama_bulan,\n  SUM(t.total_pendapatan) AS penjualan_bulan_ini,\n  LAG(SUM(t.total_pendapatan)) OVER (ORDER BY w.bulan) AS penjualan_bulan_lalu,\n  SUM(SUM(t.total_pendapatan)) OVER (\n    ORDER BY w.bulan ROWS UNBOUNDED PRECEDING\n  ) AS total_kumulatif\nFROM transaksi t\nJOIN waktu w ON t.waktu_id = w.id\nGROUP BY w.bulan, w.nama_bulan\nORDER BY w.bulan;` }] },
    ],
    summary: ['Window functions melakukan kalkulasi per baris tanpa menggabungkan baris', 'PARTITION BY membagi data menjadi partisi terpisah', 'LAG/LEAD mengakses baris sebelumnya/sesudahnya'],
    funFact: 'Window functions ditambahkan di MySQL 8.0 — sebelumnya harus menggunakan teknik variabel yang rumit!'
  },
  {
    id: 29, title: 'CTE (Common Table Expression)', level: 4, description: 'Menggunakan CTE dan recursive CTE untuk query yang lebih readable dan powerful.', estimatedMinutes: 55, database: 'analitik',
    topics: [
      { id: 'topic_29_1', title: 'CTE Dasar', content: `CTE (Common Table Expression) adalah temporary result set yang didefinisikan dengan WITH clause. Membuat query kompleks lebih mudah dibaca dan dipahami.\n\n**Keunggulan CTE vs Subquery:**\n- Lebih mudah dibaca (terutama untuk query berlapis)\n- Bisa direferensikan beberapa kali\n- Mendukung recursion`, codeExamples: [{ title: 'CTE Dasar', code: `-- CTE sederhana\nWITH penjualan_bulanan AS (\n  SELECT\n    w.bulan,\n    w.nama_bulan,\n    SUM(t.total_pendapatan) AS total\n  FROM transaksi t\n  JOIN waktu w ON t.waktu_id = w.id\n  GROUP BY w.bulan, w.nama_bulan\n),\nrata_penjualan AS (\n  SELECT AVG(total) AS rata FROM penjualan_bulanan\n)\nSELECT\n  pb.nama_bulan,\n  pb.total,\n  rp.rata,\n  CASE WHEN pb.total > rp.rata THEN 'Di atas rata' ELSE 'Di bawah rata' END AS status\nFROM penjualan_bulanan pb\nCROSS JOIN rata_penjualan rp\nORDER BY pb.bulan;` }] },
      { id: 'topic_29_2', title: 'Recursive CTE', content: `Recursive CTE memungkinkan query yang merujuk dirinya sendiri — sangat berguna untuk data hierarki seperti struktur organisasi atau kategori bersarang.`, codeExamples: [{ title: 'Recursive CTE untuk hirarki', code: `-- Hasilkan deret angka 1-10\nWITH RECURSIVE angka AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM angka WHERE n < 10\n)\nSELECT n FROM angka;` }] },
    ],
    summary: ['CTE membuat query kompleks lebih readable dengan WITH clause', 'Bisa mendefinisikan beberapa CTE sekaligus dan saling mereferensikan', 'Recursive CTE sangat berguna untuk data hierarki'],
    funFact: 'CTE juga tersedia di PostgreSQL, SQL Server, dan Oracle — skill ini transferable ke berbagai database!'
  },
  {
    id: 30, title: 'JSON di MySQL', level: 4, description: 'Menyimpan dan mengquery data JSON dalam MySQL 5.7+ menggunakan tipe data dan fungsi JSON.', estimatedMinutes: 55, database: 'analitik',
    topics: [
      { id: 'topic_30_1', title: 'Tipe Data JSON', content: `MySQL 5.7+ mendukung tipe data JSON native yang memvalidasi JSON dan menyimpannya secara optimal.\n\n**Fungsi JSON utama:**\n- JSON_EXTRACT() atau operator -> untuk mengambil nilai\n- JSON_SET() untuk mengubah nilai\n- JSON_ARRAY() dan JSON_OBJECT() untuk membuat JSON\n- JSON_CONTAINS() untuk mencari dalam JSON`, codeExamples: [{ title: 'Bekerja dengan JSON', code: `-- Buat tabel dengan kolom JSON\nCREATE TABLE produk_extended (\n  id INT PRIMARY KEY,\n  nama VARCHAR(200),\n  atribut JSON\n);\n\n-- Insert JSON\nINSERT INTO produk_extended VALUES\n(1, 'Laptop ASUS', '{\"ram\": \"16GB\", \"storage\": \"512GB SSD\", \"warna\": [\"hitam\", \"silver\"]}');\n\n-- Query JSON dengan operator ->\nSELECT nama,\n  atribut->>'$.ram' AS ram,\n  atribut->>'$.storage' AS storage\nFROM produk_extended;\n\n-- Cari berdasarkan nilai JSON\nSELECT * FROM produk_extended\nWHERE JSON_CONTAINS(atribut->>'$.warna', '\"hitam\"');` }] },
    ],
    summary: ['Tipe JSON MySQL memvalidasi dan menyimpan JSON secara efisien', 'Operator -> dan ->> untuk mengakses nilai JSON', 'JSON index virtual column memungkinkan indexing nilai JSON'],
    funFact: 'MySQL mengkonversi JSON ke format binary internal yang lebih cepat untuk diakses daripada text JSON biasa!'
  },
  {
    id: 31, title: 'Generated Columns & Virtual Columns', level: 4, description: 'Menggunakan generated columns untuk membuat kolom yang nilainya dihitung otomatis dari kolom lain.', estimatedMinutes: 40, database: 'analitik',
    topics: [
      { id: 'topic_31_1', title: 'Generated Columns', content: `Generated column adalah kolom yang nilainya dihitung otomatis dari ekspresi yang kita definisikan.\n\n**Dua jenis:**\n- VIRTUAL — dihitung on-the-fly saat dibaca (tidak disimpan di disk)\n- STORED — dihitung saat INSERT/UPDATE dan disimpan di disk (bisa diindex)`, codeExamples: [{ title: 'Membuat Generated Column', code: `CREATE TABLE transaksi_extended (\n  id INT PRIMARY KEY,\n  jumlah INT,\n  harga_satuan DECIMAL(12,2),\n  diskon DECIMAL(5,2) DEFAULT 0,\n  -- Virtual generated column\n  subtotal DECIMAL(14,2) AS (jumlah * harga_satuan) VIRTUAL,\n  -- Stored generated column (bisa di-index)\n  total_setelah_diskon DECIMAL(14,2) AS\n    (jumlah * harga_satuan * (1 - diskon/100)) STORED\n);\n\n-- Index pada stored generated column\nCREATE INDEX idx_total ON transaksi_extended(total_setelah_diskon);` }] },
    ],
    summary: ['Generated column otomatis dihitung dari ekspresi', 'VIRTUAL: dihitung saat baca, tidak ada storage overhead', 'STORED: disimpan di disk, bisa diindex untuk performa'],
    funFact: 'Generated columns sangat berguna untuk mengindex nilai yang diekstrak dari kolom JSON!'
  },
  {
    id: 32, title: 'Optimasi Performa & Partisi', level: 4, description: 'Teknik optimasi query lanjutan dan partisi tabel untuk menangani data dalam skala besar.', estimatedMinutes: 65, database: 'analitik',
    topics: [
      { id: 'topic_32_1', title: 'Teknik Optimasi Query', content: `Optimasi query adalah ilmu dan seni untuk membuat query berjalan secepat mungkin.\n\n**Prinsip optimasi:**\n1. Gunakan index pada kolom yang di-filter/join\n2. Hindari SELECT * — pilih kolom yang dibutuhkan\n3. Hindari fungsi pada kolom di WHERE (mencegah index usage)\n4. Gunakan LIMIT untuk membatasi hasil\n5. Optimalkan JOIN — mulai dari tabel terkecil`, codeExamples: [{ title: 'Query yang buruk vs baik', code: `-- BURUK: fungsi pada kolom mencegah index\nSELECT * FROM transaksi\nWHERE YEAR(waktu_id) = 2024;\n\n-- BAIK: bandingkan langsung\nSELECT total_pendapatan FROM transaksi t\nJOIN waktu w ON t.waktu_id = w.id\nWHERE w.tahun = 2024;\n\n-- BURUK: subquery berulang\nSELECT * FROM produk\nWHERE harga > (SELECT AVG(harga) FROM produk);\n\n-- BAIK: hitung sekali dengan CTE\nWITH avg_harga AS (SELECT AVG(harga) AS rata FROM produk)\nSELECT p.* FROM produk p\nCROSS JOIN avg_harga WHERE p.harga > avg_harga.rata;` }] },
      { id: 'topic_32_2', title: 'Table Partitioning', content: `Partisi membagi tabel besar menjadi bagian-bagian yang lebih kecil berdasarkan kriteria tertentu. MySQL mengelola partisi secara transparan.`, codeExamples: [{ title: 'RANGE Partitioning', code: `CREATE TABLE transaksi_partisi (\n  id INT,\n  tahun SMALLINT,\n  total DECIMAL(14,2)\n)\nPARTITION BY RANGE (tahun) (\n  PARTITION p2022 VALUES LESS THAN (2023),\n  PARTITION p2023 VALUES LESS THAN (2024),\n  PARTITION p2024 VALUES LESS THAN (2025),\n  PARTITION p_future VALUES LESS THAN MAXVALUE\n);\n\n-- Query hanya membaca partisi yang relevan\nSELECT * FROM transaksi_partisi WHERE tahun = 2024;` }] },
    ],
    summary: ['Hindari fungsi pada kolom di WHERE untuk mempertahankan index usage', 'EXPLAIN adalah alat utama untuk mengidentifikasi bottleneck', 'Partisi memungkinkan "partition pruning" — hanya baca partisi relevan'],
    funFact: 'Query optimizer MySQL menggunakan "cost-based" approach — mengestimasi biaya setiap rencana eksekusi dan memilih yang termurah!'
  },
  {
    id: 33, title: 'User, Privilege & Keamanan', level: 4, description: 'Mengelola user MySQL, hak akses, dan mengamankan database dari ancaman seperti SQL injection.', estimatedMinutes: 55, database: 'analitik',
    topics: [
      { id: 'topic_33_1', title: 'Manajemen User', content: `MySQL memiliki sistem hak akses yang granular untuk mengontrol siapa bisa melakukan apa.`, codeExamples: [{ title: 'Membuat dan mengelola user', code: `-- Buat user\nCREATE USER 'developer'@'localhost' IDENTIFIED BY 'password_kuat';\n\n-- Beri hak akses\nGRANT SELECT, INSERT, UPDATE ON toko_db.* TO 'developer'@'localhost';\n\n-- Hak akses terbatas per tabel\nGRANT SELECT ON toko_db.produk TO 'readonly_user'@'%';\n\n-- Lihat hak akses\nSHOW GRANTS FOR 'developer'@'localhost';\n\n-- Cabut hak akses\nREVOKE INSERT ON toko_db.* FROM 'developer'@'localhost';\n\n-- Hapus user\nDROP USER 'developer'@'localhost';` }] },
      { id: 'topic_33_2', title: 'SQL Injection & Prepared Statements', content: `SQL Injection adalah serangan keamanan dimana attacker menyisipkan SQL berbahaya ke dalam input pengguna.\n\n**Pencegahan:** Selalu gunakan Prepared Statements!`, codeExamples: [{ title: 'SQL Injection vs Prepared Statement', code: `-- BERBAHAYA! SQL Injection rentan\n-- Input pengguna: "1 OR 1=1"\nquery = "SELECT * FROM users WHERE id = " + user_input;\n-- Hasilnya: SELECT * FROM users WHERE id = 1 OR 1=1\n-- Mengembalikan SEMUA user!\n\n-- AMAN: Prepared Statement\n-- Di MySQL level:\nPREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';\nSET @id = 1;\nEXECUTE stmt USING @id;\nDEALLOCATE PREPARE stmt;\n\n-- Di aplikasi (PHP PDO):\n-- $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");\n-- $stmt->execute([$id]);` }] },
    ],
    summary: ['Prinsip least privilege: berikan hak akses minimum yang diperlukan', 'Selalu gunakan prepared statement untuk mencegah SQL injection', 'Audit akses secara berkala dan hapus user yang tidak diperlukan'],
    funFact: 'SQL Injection adalah kerentanan #1 dalam OWASP Top 10 Web Application Security Risks selama lebih dari 10 tahun!'
  },
  {
    id: 34, title: 'Backup, Restore & Replikasi', level: 4, description: 'Strategi backup database, restore dari backup, dan konfigurasi replikasi master-slave.', estimatedMinutes: 60, database: 'analitik',
    topics: [
      { id: 'topic_34_1', title: 'Backup & Restore', content: `Backup adalah perlindungan terakhir dari kehilangan data. **Rule of thumb: 3-2-1** — 3 copy, 2 media berbeda, 1 offsite.`, codeExamples: [{ title: 'mysqldump — backup standar', code: `# Backup satu database\nmysqldump -u root -p toko_db > toko_backup.sql\n\n# Backup semua database\nmysqldump -u root -p --all-databases > all_backup.sql\n\n# Backup dengan kompresi\nmysqldump -u root -p toko_db | gzip > toko_backup.sql.gz\n\n# Restore\nmysql -u root -p toko_db < toko_backup.sql\n\n# Restore dari compressed backup\ngunzip < toko_backup.sql.gz | mysql -u root -p toko_db` }] },
      { id: 'topic_34_2', title: 'Replikasi MySQL', content: `Replikasi memungkinkan data dari satu server (master/primary) disalin secara otomatis ke server lain (slave/replica).\n\n**Manfaat replikasi:**\n- High availability\n- Load balancing (read dari slave)\n- Disaster recovery`, codeExamples: [{ title: 'Konfigurasi replikasi dasar', code: `-- Di Master server (my.cnf):\n-- server-id = 1\n-- log-bin = mysql-bin\n\n-- Buat user replikasi di Master\nCREATE USER 'repl'@'%' IDENTIFIED BY 'password';\nGRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';\n\n-- Di Slave server:\nCHANGE MASTER TO\n  MASTER_HOST = '192.168.1.100',\n  MASTER_USER = 'repl',\n  MASTER_PASSWORD = 'password',\n  MASTER_LOG_FILE = 'mysql-bin.000001',\n  MASTER_LOG_POS = 4;\n\nSTART SLAVE;\nSHOW SLAVE STATUS;` }] },
    ],
    summary: ['Backup rutin adalah keharusan — uji restore secara berkala', 'mysqldump untuk backup logis, mysqlinnobackup untuk backup fisik', 'Replikasi master-slave untuk high availability dan load balancing'],
    funFact: 'MySQL 8.0 mengubah terminologi "master/slave" menjadi "source/replica" untuk bahasa yang lebih inklusif!'
  },
  {
    id: 35, title: 'Monitoring & Profiling', level: 4, description: 'Memantau performa MySQL dan mengidentifikasi query lambat menggunakan tools monitoring bawaan.', estimatedMinutes: 50, database: 'analitik',
    topics: [
      { id: 'topic_35_1', title: 'Slow Query Log', content: `Slow query log mencatat semua query yang membutuhkan waktu lebih dari threshold tertentu. Ini adalah alat pertama untuk mengidentifikasi bottleneck.`, codeExamples: [{ title: 'Mengaktifkan Slow Query Log', code: `-- Aktifkan slow query log\nSET GLOBAL slow_query_log = ON;\nSET GLOBAL long_query_time = 1; -- log query > 1 detik\nSET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';\n\n-- Lihat query yang paling lambat dengan mysqldumpslow\n-- mysqldumpslow -s t -t 10 /var/log/mysql/slow.log\n\n-- Performance Schema\nSELECT * FROM performance_schema.events_statements_summary_by_digest\nORDER BY sum_timer_wait DESC\nLIMIT 10;` }] },
      { id: 'topic_35_2', title: 'SHOW STATUS & SHOW VARIABLES', content: `MySQL menyediakan ratusan variabel status untuk memantau kondisi server.`, codeExamples: [{ title: 'Monitoring dasar', code: `-- Koneksi aktif\nSHOW STATUS LIKE 'Threads_connected';\n\n-- Query statistics\nSHOW STATUS LIKE 'Questions';\nSHOW STATUS LIKE 'Slow_queries';\n\n-- InnoDB buffer pool hit rate\nSHOW STATUS LIKE 'Innodb_buffer_pool%';\n\n-- Proses yang sedang berjalan\nSHOW PROCESSLIST;\n\n-- Kill query yang lambat\nKILL QUERY 12345;` }] },
    ],
    summary: ['Slow query log adalah alat utama untuk menemukan query bermasalah', 'Performance Schema memberikan data monitoring yang sangat detail', 'Pantau koneksi, QPS, dan buffer pool hit rate secara rutin'],
    funFact: 'MySQL Performance Schema bisa mengukur waktu hingga nanosecond menggunakan CPU timer!'
  },
  {
    id: 36, title: 'MySQL di Dunia Nyata — Koneksi Aplikasi', level: 4, description: 'Cara mengkoneksikan MySQL ke aplikasi Python, Node.js, dan PHP dengan best practice.', estimatedMinutes: 55, database: 'analitik',
    topics: [
      { id: 'topic_36_1', title: 'Koneksi dari Python', content: `Python adalah salah satu bahasa paling populer untuk bekerja dengan MySQL. Library utama: mysql-connector-python, PyMySQL, atau SQLAlchemy.`, codeExamples: [{ title: 'Python + mysql-connector', code: `import mysql.connector\nfrom contextlib import contextmanager\n\n# Connection pool\npool = mysql.connector.pooling.MySQLConnectionPool(\n    pool_name="mypool",\n    pool_size=5,\n    host="localhost",\n    user="appuser",\n    password="secret",\n    database="toko_db"\n)\n\n@contextmanager\ndef get_connection():\n    conn = pool.get_connection()\n    try:\n        yield conn\n    finally:\n        conn.close()\n\n# Gunakan prepared statement (WAJIB untuk keamanan!)\ndef get_produk(kategori_id: int):\n    with get_connection() as conn:\n        cursor = conn.cursor(dictionary=True)\n        query = "SELECT * FROM produk WHERE kategori_id = %s AND stok > 0"\n        cursor.execute(query, (kategori_id,))\n        return cursor.fetchall()` }] },
      { id: 'topic_36_2', title: 'Koneksi dari Node.js', content: `Node.js menggunakan library mysql2 yang mendukung async/await dan prepared statements.`, codeExamples: [{ title: 'Node.js + mysql2', code: `const mysql = require('mysql2/promise');\n\n// Connection pool\nconst pool = mysql.createPool({\n  host: 'localhost',\n  user: 'appuser',\n  password: 'secret',\n  database: 'toko_db',\n  connectionLimit: 10,\n  waitForConnections: true\n});\n\n// Async function dengan prepared statement\nasync function getProduk(kategoriId) {\n  const [rows] = await pool.execute(\n    'SELECT * FROM produk WHERE kategori_id = ? AND stok > 0',\n    [kategoriId]\n  );\n  return rows;\n}` }] },
    ],
    summary: ['Selalu gunakan connection pool untuk aplikasi production', 'Prepared statement wajib untuk mencegah SQL injection', 'ORM seperti SQLAlchemy memudahkan tapi tambahkan lapisan abstraksi'],
    funFact: 'MySQL protocol mendukung compressed data transfer — berguna saat bandwidth antara app server dan DB server terbatas!'
  },
  {
    id: 37, title: 'Normalisasi & Schema Design', level: 4, description: 'Menerapkan prinsip normalisasi database (1NF, 2NF, 3NF, BCNF) untuk desain schema yang optimal.', estimatedMinutes: 65, database: 'analitik',
    topics: [
      { id: 'topic_37_1', title: 'Normalisasi Database', content: `Normalisasi adalah proses mengorganisir database untuk mengurangi redundansi dan meningkatkan integritas data.\n\n**Normal Form:**\n- **1NF:** setiap sel berisi satu nilai atomik\n- **2NF:** tidak ada partial dependency (untuk tabel dengan composite key)\n- **3NF:** tidak ada transitive dependency\n- **BCNF:** versi lebih ketat dari 3NF`, codeExamples: [{ title: 'Dari unnormalized ke 3NF', code: `-- UNNORMALIZED (buruk)\n-- ORDER tabel: order_id | customer_name | customer_email | product1 | product2\n\n-- 1NF: satu nilai per sel\n-- Pisahkan produk ke baris terpisah\n\n-- 2NF: hapus partial dependency\n-- Pisahkan customer ke tabel tersendiri\n\n-- 3NF: hapus transitive dependency\n-- Pisahkan data yang bergantung pada non-key\n\n-- HASIL 3NF:\nCREATE TABLE customers (id INT PK, name VARCHAR, email VARCHAR);\nCREATE TABLE orders (id INT PK, customer_id INT FK, date DATE, total DECIMAL);\nCREATE TABLE order_items (order_id INT FK, product_id INT FK, qty INT, price DECIMAL);` }] },
      { id: 'topic_37_2', title: 'Denormalisasi untuk Performa', content: `Terkadang denormalisasi (melanggar aturan normalisasi) diperlukan untuk performa pada skala besar.`, codeExamples: [{ title: 'Kapan denormalisasi masuk akal', code: `-- Contoh: menyimpan total_item di tabel orders\n-- (redundan karena bisa dihitung dari order_items)\n-- tapi menghindari JOIN mahal setiap kali query\n\nALTER TABLE orders ADD COLUMN total_items INT DEFAULT 0;\n\n-- Update via trigger\nCREATE TRIGGER update_order_total\nAFTER INSERT ON order_items\nFOR EACH ROW\nUPDATE orders SET total_items = total_items + NEW.qty\nWHERE id = NEW.order_id;` }] },
    ],
    summary: ['Normalisasi mengurangi redundansi dan anomali update/insert/delete', '3NF sudah cukup untuk kebanyakan aplikasi OLTP', 'Denormalisasi untuk performa — tapi pertimbangkan trade-off kompleksitas'],
    funFact: 'OLAP (data warehouse) sering sengaja menggunakan schema yang denormalized (star schema) untuk performa analitik!'
  },
  {
    id: 38, title: 'Fitur Modern MySQL 8+', level: 4, description: 'Mengenal dan memanfaatkan fitur-fitur terbaru MySQL 8.0 yang meningkatkan produktivitas dan performa.', estimatedMinutes: 55, database: 'analitik',
    topics: [
      { id: 'topic_38_1', title: 'Fitur Baru MySQL 8.0', content: `MySQL 8.0 membawa banyak perubahan signifikan dibanding versi sebelumnya.\n\n**Fitur utama MySQL 8.0:**\n- Window Functions (RANK, LAG, LEAD, dll)\n- CTE (Common Table Expressions) dengan WITH\n- INVISIBLE INDEX — disable index tanpa menghapus\n- DESCENDING INDEX\n- Atomic DDL — DDL dalam transaksi\n- Roles — kelompok privilege\n- utf8mb4 sebagai default charset\n- Improved JSON support\n- SKIP LOCKED & NOWAIT untuk row locking`, codeExamples: [{ title: 'Fitur MySQL 8.0', code: `-- INVISIBLE INDEX (test performa tanpa hapus index)\nALTER TABLE produk ALTER INDEX idx_harga INVISIBLE;\nALTER TABLE produk ALTER INDEX idx_harga VISIBLE;\n\n-- ROLES\nCREATE ROLE 'developer', 'analyst';\nGRANT SELECT, INSERT, UPDATE ON toko_db.* TO 'developer';\nGRANT SELECT ON toko_db.* TO 'analyst';\nGRANT 'developer' TO 'budi'@'localhost';\n\n-- SKIP LOCKED (untuk task queue)\nSELECT * FROM job_queue\nWHERE status = 'pending'\nLIMIT 1\nFOR UPDATE SKIP LOCKED;\n\n-- CHECK constraint (MySQL 8.0.16+)\nALTER TABLE produk\nADD CONSTRAINT chk_harga CHECK (harga > 0);` }] },
      { id: 'topic_38_2', title: 'MySQL 8.0 vs 5.7 Perbandingan', content: `Ringkasan perbedaan utama antara MySQL 5.7 dan 8.0.`, codeExamples: [{ title: 'Fitur yang hanya ada di 8.0', code: `-- 1. Window Functions\nSELECT ROW_NUMBER() OVER (ORDER BY id) AS nomor,\n       nama FROM produk; -- ERROR di 5.7!\n\n-- 2. CTE\nWITH top_produk AS (SELECT * FROM produk ORDER BY terjual DESC LIMIT 10)\nSELECT * FROM top_produk; -- ERROR di 5.7!\n\n-- 3. CHECK constraint benar-benar aktif\n-- Di 5.7, CHECK constraint diterima tapi diabaikan!\n\n-- 4. Regex functions\nSELECT REGEXP_REPLACE('Hello World', 'World', 'MySQL'); -- ERROR di 5.7!\n\n-- 5. Default auth plugin berbeda\n-- 5.7: mysql_native_password\n-- 8.0: caching_sha2_password (lebih aman)` }] },
    ],
    summary: ['MySQL 8.0 menambahkan Window Functions, CTE, Roles, dan banyak lagi', 'Default charset berubah dari latin1 ke utf8mb4', 'CHECK constraint sekarang benar-benar divalidasi (berbeda dari 5.7)'],
    funFact: 'MySQL melewati versi 6.x dan 7.x langsung ke 8.0 untuk menghindari kebingungan dengan MaxDB (MySQL 6.x yang tidak pernah dirilis)!'
  },
];
