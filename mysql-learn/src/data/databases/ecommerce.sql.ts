export const ecommerceSQL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE,
  nama_lengkap TEXT,
  kota TEXT,
  bergabung TEXT,
  saldo REAL DEFAULT 0
);

CREATE TABLE kategori (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  parent_id INTEGER
);

CREATE TABLE produk (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  harga REAL NOT NULL,
  stok INTEGER DEFAULT 0,
  kategori_id INTEGER,
  seller_id INTEGER,
  rating REAL DEFAULT 0,
  terjual INTEGER DEFAULT 0,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  tanggal TEXT,
  status TEXT,
  total REAL,
  alamat_pengiriman TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
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

INSERT INTO users VALUES
(1,'budisanto','budi@mail.com','Budi Santoso','Jakarta','2023-01-10',500000),
(2,'sitirahayu','siti@mail.com','Siti Rahayu','Bandung','2023-02-15',250000),
(3,'ahmadF','ahmad@mail.com','Ahmad Fauzi','Surabaya','2023-03-20',750000),
(4,'dewiL','dewi@mail.com','Dewi Lestari','Yogyakarta','2023-04-05',100000),
(5,'ekopras','eko@mail.com','Eko Prasetyo','Medan','2023-05-12',300000),
(6,'fitriH','fitri@mail.com','Fitri Handayani','Semarang','2023-06-18',150000),
(7,'gilangR','gilang@mail.com','Gilang Ramadan','Makassar','2023-07-22',200000),
(8,'haniS','hani@mail.com','Hani Safitri','Palembang','2023-08-30',80000),
(9,'irwanK','irwan@mail.com','Irwan Kusuma','Balikpapan','2023-09-14',450000),
(10,'jokoW','joko@mail.com','Joko Wibowo','Jakarta','2023-10-01',320000),
(11,'kartikaS','kartika@mail.com','Kartika Sari','Bandung','2023-10-20',180000),
(12,'lukiP','luki@mail.com','Luki Pratama','Denpasar','2023-11-05',90000),
(13,'seller_elektronik','selekt@mail.com','Toko Elektronik Jaya','Jakarta','2022-06-01',0),
(14,'seller_fashion','selfash@mail.com','Fashion House Bandung','Bandung','2022-07-15',0),
(15,'seller_makanan','selmak@mail.com','Food Paradise Surabaya','Surabaya','2022-08-20',0),
(16,'seller_olahraga','selolah@mail.com','Sport Center','Jakarta','2022-09-10',0),
(17,'mayaI','maya@mail.com','Maya Indah','Malang','2023-11-15',260000),
(18,'nandaP','nanda@mail.com','Nanda Putra','Semarang','2023-12-01',130000),
(19,'omarF','omar@mail.com','Omar Fauzi','Medan','2023-12-15',75000),
(20,'putriH','putri@mail.com','Putri Handayani','Jakarta','2024-01-05',400000);

INSERT INTO kategori VALUES
(1,'Elektronik',NULL),(2,'Smartphone',1),(3,'Laptop',1),(4,'Aksesoris Elektronik',1),
(5,'Fashion',NULL),(6,'Pakaian Pria',5),(7,'Pakaian Wanita',5),(8,'Sepatu',5),
(9,'Makanan & Minuman',NULL),(10,'Makanan Kering',9),(11,'Minuman',9),
(12,'Olahraga',NULL),(13,'Peralatan Gym',12),(14,'Pakaian Olahraga',12);

INSERT INTO produk VALUES
(1,'iPhone 15 Pro Max',19500000,8,2,13,4.9,312),
(2,'Samsung Galaxy S24 Ultra',17000000,12,2,13,4.8,245),
(3,'Xiaomi 14 Pro',8500000,25,2,13,4.7,189),
(4,'MacBook Air M3',22000000,6,3,13,4.9,134),
(5,'ASUS ROG Strix G16',19000000,9,3,13,4.7,98),
(6,'Lenovo ThinkPad X1',16500000,11,3,13,4.6,76),
(7,'AirPods Pro 2nd Gen',3800000,45,4,13,4.8,567),
(8,'Powerbank Anker 20000mAh',450000,80,4,13,4.6,823),
(9,'Kabel Data USB-C 2m',55000,200,4,13,4.4,1245),
(10,'Kaos Polos Premium Pria',125000,300,6,14,4.5,2341),
(11,'Kemeja Flannel Pria',185000,150,6,14,4.4,876),
(12,'Celana Chino Slim',210000,120,6,14,4.5,654),
(13,'Dress Floral Wanita',195000,100,7,14,4.6,1089),
(14,'Hijab Satin Premium',85000,400,7,14,4.7,3456),
(15,'Blouse Wanita Motif',150000,180,7,14,4.5,923),
(16,'Sepatu Running Nike',780000,60,8,14,4.8,432),
(17,'Sepatu Kulit Formal',650000,40,8,14,4.6,287),
(18,'Rendang Daging Sapi 250g',95000,80,10,15,4.9,567),
(19,'Keripik Singkong Pedas',28000,600,10,15,4.5,4521),
(20,'Kopi Arabika Toraja 250g',115000,150,11,15,4.8,789),
(21,'Teh Hijau Premium 100g',65000,250,11,15,4.6,934),
(22,'Barbel 10kg Pasang',325000,35,13,16,4.7,234),
(23,'Matras Yoga 8mm',175000,55,13,16,4.6,312),
(24,'Jersey Olahraga Pria',135000,120,14,16,4.5,654),
(25,'Celana Training Wanita',115000,140,14,16,4.6,743);

INSERT INTO orders VALUES
(1,1,'2023-10-05','selesai',19555000,'Jl. Sudirman No. 1 Jakarta'),
(2,2,'2023-10-12','selesai',210000,'Jl. Braga No. 5 Bandung'),
(3,3,'2023-10-20','selesai',3800000,'Jl. Pemuda No. 10 Surabaya'),
(4,4,'2023-11-03','selesai',195000,'Jl. Malioboro No. 15 Yogyakarta'),
(5,5,'2023-11-10','selesai',225000,'Jl. Imam Bonjol No. 20 Medan'),
(6,1,'2023-11-18','selesai',22000000,'Jl. Sudirman No. 1 Jakarta'),
(7,6,'2023-11-25','selesai',370000,'Jl. Pandanaran No. 8 Semarang'),
(8,7,'2023-12-02','selesai',780000,'Jl. A. Yani No. 12 Makassar'),
(9,8,'2023-12-10','selesai',180000,'Jl. Merdeka No. 3 Palembang'),
(10,9,'2023-12-18','dikirim',17000000,'Jl. Sudirman No. 5 Balikpapan'),
(11,10,'2024-01-05','selesai',450000,'Jl. Gatot Subroto No. 7 Jakarta'),
(12,11,'2024-01-12','selesai',695000,'Jl. Asia Afrika No. 9 Bandung'),
(13,12,'2024-01-20','selesai',305000,'Jl. Kuta No. 4 Denpasar'),
(14,3,'2024-01-28','selesai',95000,'Jl. Pemuda No. 10 Surabaya'),
(15,17,'2024-02-05','selesai',325000,'Jl. Ijen No. 6 Malang'),
(16,2,'2024-02-12','selesai',8500000,'Jl. Braga No. 5 Bandung'),
(17,18,'2024-02-20','diproses',540000,'Jl. Pandanaran No. 8 Semarang'),
(18,19,'2024-02-28','selesai',230000,'Jl. Imam Bonjol No. 20 Medan'),
(19,20,'2024-03-07','selesai',19500000,'Jl. Thamrin No. 2 Jakarta'),
(20,4,'2024-03-14','selesai',310000,'Jl. Malioboro No. 15 Yogyakarta'),
(21,5,'2024-03-21','dikirim',175000,'Jl. Imam Bonjol No. 20 Medan'),
(22,10,'2024-03-28','selesai',650000,'Jl. Gatot Subroto No. 7 Jakarta'),
(23,1,'2024-04-04','selesai',505000,'Jl. Sudirman No. 1 Jakarta'),
(24,6,'2024-04-11','dibatalkan',185000,'Jl. Pandanaran No. 8 Semarang'),
(25,7,'2024-04-18','selesai',250000,'Jl. A. Yani No. 12 Makassar'),
(26,9,'2024-04-25','diproses',8500000,'Jl. Sudirman No. 5 Balikpapan'),
(27,11,'2024-05-02','selesai',920000,'Jl. Asia Afrika No. 9 Bandung'),
(28,12,'2024-05-09','selesai',115000,'Jl. Kuta No. 4 Denpasar'),
(29,17,'2024-05-16','selesai',16500000,'Jl. Ijen No. 6 Malang'),
(30,20,'2024-05-23','dikirim',460000,'Jl. Thamrin No. 2 Jakarta');

INSERT INTO order_detail VALUES
(1,1,1,1,19500000),(2,1,9,1,55000),
(3,2,12,1,210000),
(4,3,7,1,3800000),
(5,4,13,1,195000),
(6,5,10,1,125000),(7,5,21,1,65000),(8,5,19,1,28000),
(9,6,4,1,22000000),
(10,7,11,1,185000),(11,7,15,1,150000),(12,7,21,1,65000),
(13,8,16,1,780000),
(14,9,14,2,85000),
(15,10,2,1,17000000),
(16,11,8,1,450000),
(17,12,17,1,650000),(18,12,9,1,55000),
(19,13,23,1,175000),(20,13,24,1,135000),
(21,14,18,1,95000),
(22,15,22,1,325000),
(23,16,3,1,8500000),
(24,17,12,1,210000),(25,17,11,1,185000),(26,17,14,1,85000),(27,17,21,1,65000),
(28,18,19,3,28000),(29,18,20,1,115000),
(30,19,1,1,19500000),
(31,20,10,2,125000),(32,20,15,1,150000),
(33,21,23,1,175000),
(34,22,17,1,650000),
(35,23,8,1,450000),(36,23,7,1,55000),
(37,24,15,1,185000),
(38,25,14,2,85000),(39,25,24,1,135000),
(40,26,3,1,8500000),
(41,27,16,1,780000),(42,27,24,1,135000),
(43,28,21,1,65000),(44,28,20,1,115000),
(45,29,6,1,16500000),
(46,30,10,2,125000),(47,30,13,1,195000),(48,30,25,1,115000);
`;
