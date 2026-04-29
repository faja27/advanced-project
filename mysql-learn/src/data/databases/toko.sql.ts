export const tokoSQL = `
CREATE TABLE kategori (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT
);

CREATE TABLE produk (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  harga REAL NOT NULL,
  stok INTEGER DEFAULT 0,
  kategori_id INTEGER,
  berat_gram INTEGER,
  tanggal_masuk TEXT,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id)
);

CREATE TABLE pelanggan (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE,
  telepon TEXT,
  kota TEXT,
  bergabung TEXT
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  pelanggan_id INTEGER,
  tanggal TEXT,
  status TEXT,
  total REAL,
  catatan TEXT,
  FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id)
);

CREATE TABLE order_detail (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  produk_id INTEGER,
  jumlah INTEGER,
  harga_satuan REAL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (produk_id) REFERENCES produk(id)
);

INSERT INTO kategori VALUES
(1,'Elektronik','Perangkat elektronik dan gadget'),
(2,'Pakaian','Baju, celana, dan aksesori fashion'),
(3,'Makanan','Makanan dan minuman'),
(4,'Buku','Buku cetak dan digital'),
(5,'Olahraga','Peralatan dan aksesori olahraga'),
(6,'Rumah Tangga','Peralatan dan furnitur rumah'),
(7,'Kesehatan','Produk kesehatan dan kecantikan'),
(8,'Otomotif','Aksesori dan perawatan kendaraan');

INSERT INTO produk VALUES
(1,'Laptop ASUS VivoBook',8500000,15,1,2100,'2024-01-05'),
(2,'Samsung Galaxy A54',4200000,28,1,202,'2024-01-10'),
(3,'Kaos Polos Putih',85000,150,2,200,'2024-01-12'),
(4,'Celana Jeans Slim',250000,80,2,550,'2024-01-15'),
(5,'Nasi Goreng Instan',12000,500,3,85,'2024-01-20'),
(6,'Kopi Susu Sachetan',8500,300,3,20,'2024-01-22'),
(7,'Belajar SQL Dasar',125000,50,4,300,'2024-01-25'),
(8,'Python untuk Pemula',145000,45,4,350,'2024-01-28'),
(9,'Sepatu Lari Nike',650000,60,5,720,'2024-02-01'),
(10,'Matras Yoga',185000,35,5,1200,'2024-02-05'),
(11,'Headset Bluetooth',320000,40,1,180,'2024-02-10'),
(12,'Kemeja Batik',175000,90,2,300,'2024-02-15'),
(13,'Teh Hijau Premium',45000,200,3,100,'2024-02-18'),
(14,'Novel Laskar Pelangi',75000,30,4,250,'2024-02-20'),
(15,'Raket Badminton',285000,25,5,280,'2024-02-25'),
(16,'Mouse Wireless',145000,55,1,120,'2024-03-01'),
(17,'Jaket Hoodie',320000,70,2,600,'2024-03-05'),
(18,'Mie Goreng Spesial',15000,400,3,90,'2024-03-08'),
(19,'Atlas Dunia',95000,20,4,800,'2024-03-10'),
(20,'Bola Futsal',150000,18,5,420,'2024-03-15'),
(21,'Blender Miyako',350000,22,6,1800,'2024-03-20'),
(22,'Panci Anti Lengket',225000,30,6,900,'2024-03-22'),
(23,'Vitamin C 1000mg',85000,120,7,200,'2024-03-25'),
(24,'Masker Wajah Korea',55000,200,7,50,'2024-03-28'),
(25,'Parfum Hugo Boss',650000,15,7,150,'2024-04-01'),
(26,'Sarung Tangan Gym',95000,40,5,180,'2024-04-03'),
(27,'Kamus Besar Bahasa Indonesia',120000,25,4,700,'2024-04-05'),
(28,'Kabel USB-C 1m',35000,100,1,80,'2024-04-08'),
(29,'Wiper Mobil',75000,50,8,300,'2024-04-10'),
(30,'Semir Sepatu Hitam',25000,80,8,120,'2024-04-12');

INSERT INTO pelanggan VALUES
(1,'Budi Santoso','budi@email.com','081234567890','Jakarta','2023-06-01'),
(2,'Siti Rahayu','siti@email.com','082345678901','Bandung','2023-07-15'),
(3,'Ahmad Fauzi','ahmad@email.com','083456789012','Surabaya','2023-08-20'),
(4,'Dewi Lestari','dewi@email.com','084567890123','Yogyakarta','2023-09-10'),
(5,'Eko Prasetyo','eko@email.com','085678901234','Medan','2023-10-05'),
(6,'Fitri Handayani','fitri@email.com','086789012345','Semarang','2023-11-12'),
(7,'Gilang Ramadan','gilang@email.com','087890123456','Makassar','2023-12-01'),
(8,'Hani Safitri','hani@email.com','088901234567','Palembang','2024-01-08'),
(9,'Irwan Kusuma','irwan@email.com','089012345678','Balikpapan','2024-01-20'),
(10,'Joko Widodo','joko@email.com','081123456789','Jakarta','2024-02-14'),
(11,'Kartini Susilo','kartini@email.com','082234567890','Bandung','2024-02-20'),
(12,'Luki Pratama','luki@email.com','083345678901','Surabaya','2024-03-01'),
(13,'Maya Sari','maya@email.com','084456789012','Denpasar','2024-03-10'),
(14,'Nanda Putra','nanda@email.com','085567890123','Malang','2024-03-15'),
(15,'Omar Fauzi','omar@email.com','086678901234','Jakarta','2024-03-20'),
(16,'Putri Indah','putri@email.com','087789012345','Semarang','2024-03-25'),
(17,'Reza Kurniawan','reza@email.com','088890123456','Medan','2024-04-01'),
(18,'Sari Dewi','sari@email.com','089901234567','Makassar','2024-04-05'),
(19,'Tono Hartono','tono@email.com','081012345678','Bandung','2024-04-08'),
(20,'Umar Bakri','umar@email.com','082123456789','Yogyakarta','2024-04-10'),
(21,'Vina Melati','vina@email.com','083234567890','Jakarta','2024-04-12'),
(22,'Wahyu Setiawan','wahyu@email.com','084345678901','Surabaya','2024-04-14'),
(23,'Xena Putri','xena@email.com','085456789012','Pontianak','2024-04-16'),
(24,'Yudi Prasetya','yudi@email.com','086567890123','Samarinda','2024-04-18'),
(25,'Zahra Nisa','zahra@email.com','087678901234','Mataram','2024-04-20');

INSERT INTO orders VALUES
(1,1,'2024-01-15','selesai',8585000,'Terima kasih'),
(2,2,'2024-01-20','selesai',250000,NULL),
(3,3,'2024-01-25','selesai',650000,NULL),
(4,4,'2024-02-01','selesai',260000,NULL),
(5,5,'2024-02-05','dikirim',320000,NULL),
(6,1,'2024-02-10','selesai',175000,NULL),
(7,6,'2024-02-15','selesai',550000,NULL),
(8,7,'2024-02-20','selesai',145000,NULL),
(9,8,'2024-02-25','selesai',95000,'Kemas dengan hati-hati'),
(10,9,'2024-03-01','diproses',1505000,NULL),
(11,10,'2024-03-05','selesai',385000,NULL),
(12,11,'2024-03-10','selesai',185000,NULL),
(13,12,'2024-03-15','dibatalkan',350000,'Kehabisan stok'),
(14,13,'2024-03-20','selesai',225000,NULL),
(15,14,'2024-03-25','dikirim',495000,NULL),
(16,15,'2024-04-01','selesai',270000,NULL),
(17,16,'2024-04-05','selesai',140000,NULL),
(18,17,'2024-04-08','diproses',650000,NULL),
(19,18,'2024-04-10','selesai',120000,NULL),
(20,19,'2024-04-12','selesai',460000,NULL);

INSERT INTO order_detail VALUES
(1,1,1,1,8500000),
(2,1,6,10,8500),
(3,2,4,1,250000),
(4,3,9,1,650000),
(5,4,3,2,85000),(6,4,7,1,125000),
(7,5,17,1,320000),
(8,6,12,1,175000),
(9,7,10,1,185000),(10,7,15,1,285000),(11,7,26,1,95000),
(12,8,16,1,145000),
(13,9,23,1,85000),
(14,10,2,1,4200000),(15,10,28,8,35000),(16,10,5,20,12000),
(17,11,11,1,320000),(18,11,13,2,45000),
(19,12,10,1,185000),
(20,13,17,1,320000),(21,13,3,1,85000),
(22,14,22,1,225000),
(23,15,7,2,125000),(24,15,8,1,145000),(25,15,14,1,75000),
(26,16,4,1,250000),(27,16,3,1,85000),
(28,17,28,4,35000),
(29,18,9,1,650000),
(30,19,19,1,95000),(31,19,14,1,75000),
(32,20,15,1,285000),(33,20,26,1,95000),(34,20,13,2,45000);
`;
