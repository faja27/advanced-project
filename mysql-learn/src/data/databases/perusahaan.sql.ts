export const perusahaanSQL = `
CREATE TABLE departemen (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  lokasi TEXT,
  budget REAL
);

CREATE TABLE karyawan (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT,
  jabatan TEXT,
  departemen_id INTEGER,
  tanggal_masuk TEXT,
  manager_id INTEGER,
  FOREIGN KEY (departemen_id) REFERENCES departemen(id)
);

CREATE TABLE gaji (
  id INTEGER PRIMARY KEY,
  karyawan_id INTEGER,
  bulan TEXT,
  gaji_pokok REAL,
  tunjangan REAL,
  bonus REAL,
  FOREIGN KEY (karyawan_id) REFERENCES karyawan(id)
);

INSERT INTO departemen VALUES
(1,'Teknologi Informasi','Jakarta',500000000),
(2,'Pemasaran','Bandung',300000000),
(3,'Keuangan','Jakarta',400000000),
(4,'Sumber Daya Manusia','Jakarta',200000000),
(5,'Operasional','Surabaya',350000000),
(6,'Riset dan Pengembangan','Yogyakarta',600000000);

INSERT INTO karyawan VALUES
(1,'Andi Wijaya','andi@company.com','Direktur TI',1,'2018-01-15',NULL),
(2,'Budi Kurniawan','budi@company.com','Manajer Pengembangan',1,'2019-03-01',1),
(3,'Citra Dewi','citra@company.com','Developer Senior',1,'2020-06-01',2),
(4,'Dani Setiawan','dani@company.com','Developer Senior',1,'2020-09-01',2),
(5,'Eka Nugroho','eka@company.com','Developer Junior',1,'2022-01-10',3),
(6,'Fajar Ramadhan','fajar@company.com','DevOps Engineer',1,'2021-08-01',2),
(7,'Gita Sari','gita@company.com','Direktur Pemasaran',2,'2017-05-01',NULL),
(8,'Hendra Gunawan','hendra@company.com','Manajer Brand',2,'2019-07-01',7),
(9,'Indah Permata','indah@company.com','Staf Pemasaran Digital',2,'2021-02-15',8),
(10,'Jaka Santosa','jaka@company.com','Staf Pemasaran',2,'2022-03-10',8),
(11,'Kartika Sari','kartika@company.com','Direktur Keuangan',3,'2016-08-01',NULL),
(12,'Luki Pratama','luki@company.com','Manajer Akuntansi',3,'2018-05-01',11),
(13,'Maya Indah','maya@company.com','Akuntan Senior',3,'2020-07-01',12),
(14,'Nanda Putra','nanda@company.com','Akuntan Junior',3,'2022-09-01',12),
(15,'Omar Fauzi','omar@company.com','Direktur SDM',4,'2017-03-01',NULL),
(16,'Putri Handayani','putri@company.com','Manajer Rekrutmen',4,'2019-11-01',15),
(17,'Reza Kurniawan','reza@company.com','Staf SDM',4,'2021-06-01',16),
(18,'Sari Melati','sari@company.com','Staf Pelatihan',4,'2022-01-15',16),
(19,'Tono Hartono','tono@company.com','Direktur Operasional',5,'2018-02-01',NULL),
(20,'Umar Bakri','umar@company.com','Manajer Logistik',5,'2019-04-15',19),
(21,'Vina Susanti','vina@company.com','Staf Operasional',5,'2021-03-01',20),
(22,'Wahyu Setiawan','wahyu@company.com','Staf Logistik',5,'2021-07-01',20),
(23,'Xenia Putri','xenia@company.com','Staf Operasional',5,'2022-05-01',20),
(24,'Yudi Prasetya','yudi@company.com','Direktur R&D',6,'2019-01-01',NULL),
(25,'Zahra Nisa','zahra@company.com','Peneliti Senior',6,'2020-03-01',24),
(26,'Anis Wulandari','anis@company.com','Peneliti Senior',6,'2020-06-01',24),
(27,'Bimo Saputra','bimo@company.com','Peneliti Junior',6,'2022-02-01',25),
(28,'Cindy Rahayu','cindy@company.com','Peneliti Junior',6,'2022-08-01',25),
(29,'Diko Pratama','diko@company.com','Analis Data',1,'2023-01-15',2),
(30,'Elsa Fitriani','elsa@company.com','UI/UX Designer',1,'2023-03-01',2);

INSERT INTO gaji VALUES
(1,1,'2024-03',20000000,4000000,5000000),
(2,2,'2024-03',15000000,3000000,3000000),
(3,3,'2024-03',12000000,2500000,2000000),
(4,4,'2024-03',12000000,2500000,2000000),
(5,5,'2024-03',8000000,1500000,500000),
(6,6,'2024-03',11000000,2000000,1500000),
(7,7,'2024-03',18000000,3500000,4000000),
(8,8,'2024-03',13000000,2500000,2000000),
(9,9,'2024-03',7500000,1500000,500000),
(10,10,'2024-03',7000000,1000000,500000),
(11,11,'2024-03',19000000,4000000,4500000),
(12,12,'2024-03',14000000,2500000,2500000),
(13,13,'2024-03',10000000,2000000,1000000),
(14,14,'2024-03',7500000,1500000,500000),
(15,15,'2024-03',17000000,3000000,3500000),
(16,16,'2024-03',12000000,2000000,1500000),
(17,17,'2024-03',7000000,1000000,500000),
(18,18,'2024-03',6800000,1000000,300000),
(19,19,'2024-03',16000000,3000000,3000000),
(20,20,'2024-03',12000000,2000000,1500000),
(21,21,'2024-03',7200000,1000000,500000),
(22,22,'2024-03',7000000,1000000,500000),
(23,23,'2024-03',6900000,1000000,300000),
(24,24,'2024-03',22000000,4000000,6000000),
(25,25,'2024-03',15000000,3000000,3000000),
(26,26,'2024-03',14000000,2500000,2500000),
(27,27,'2024-03',9000000,1500000,1000000),
(28,28,'2024-03',8500000,1500000,800000),
(29,29,'2024-03',9500000,2000000,1000000),
(30,30,'2024-03',8000000,1500000,800000),
(31,1,'2024-02',20000000,4000000,3000000),
(32,2,'2024-02',15000000,3000000,2000000),
(33,11,'2024-02',19000000,4000000,3000000),
(34,24,'2024-02',22000000,4000000,4000000),
(35,7,'2024-02',18000000,3500000,2500000);
`;
