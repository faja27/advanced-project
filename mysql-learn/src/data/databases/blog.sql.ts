export const blogSQL = `
CREATE TABLE penulis (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE,
  bio TEXT,
  bergabung TEXT,
  total_artikel INTEGER DEFAULT 0
);

CREATE TABLE artikel (
  id INTEGER PRIMARY KEY,
  judul TEXT NOT NULL,
  konten TEXT,
  penulis_id INTEGER,
  kategori TEXT,
  status TEXT DEFAULT 'draft',
  dilihat INTEGER DEFAULT 0,
  diterbitkan TEXT,
  dibuat TEXT,
  FOREIGN KEY (penulis_id) REFERENCES penulis(id)
);

CREATE TABLE komentar (
  id INTEGER PRIMARY KEY,
  artikel_id INTEGER,
  nama_komentator TEXT,
  konten TEXT,
  dibuat TEXT,
  disetujui INTEGER DEFAULT 0,
  FOREIGN KEY (artikel_id) REFERENCES artikel(id)
);

CREATE TABLE tag (
  id INTEGER PRIMARY KEY,
  nama TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE
);

CREATE TABLE artikel_tag (
  artikel_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (artikel_id, tag_id),
  FOREIGN KEY (artikel_id) REFERENCES artikel(id),
  FOREIGN KEY (tag_id) REFERENCES tag(id)
);

INSERT INTO penulis VALUES
(1,'Andi Wijaya','andi@blog.com','Penulis teknologi dan programmer Python berpengalaman','2022-01-01',8),
(2,'Budi Santoso','budi@blog.com','Penulis tentang startup dan bisnis digital','2022-03-15',12),
(3,'Citra Dewi','citra@blog.com','Fotografer profesional dan penulis lifestyle','2022-06-01',6),
(4,'Dian Nugroho','dian@blog.com','Pengembang web fullstack 10 tahun pengalaman','2023-01-10',7),
(5,'Eka Putri','eka@blog.com','Data scientist dan penulis topik AI dan machine learning','2023-04-20',9),
(6,'Fajar Ramadhan','fajar@blog.com','Spesialis keamanan siber dan ethical hacker','2022-09-01',5),
(7,'Gita Sari','gita@blog.com','Penulis pariwisata dan kuliner nusantara','2023-02-15',6),
(8,'Hendra Gunawan','hendra@blog.com','Konsultan manajemen dan produktivitas','2023-05-10',4),
(9,'Indah Permata','indah@blog.com','Dokter umum yang menulis tentang kesehatan digital','2022-11-20',7),
(10,'Jaka Santosa','jaka@blog.com','Penulis sejarah dan budaya Indonesia','2023-07-01',3);

INSERT INTO artikel VALUES
(1,'Pengenalan Python untuk Pemula','Python adalah bahasa pemrograman yang mudah dipelajari dan sangat populer di dunia. Dengan sintaks yang bersih dan komunitas yang besar, Python menjadi pilihan utama bagi pemula yang ingin belajar coding.',1,'teknologi','published',15420,'2023-01-15','2023-01-10'),
(2,'Membangun Startup dari Nol','Memulai startup membutuhkan ide inovatif, tim yang solid, dan modal yang cukup. Artikel ini membahas langkah-langkah praktis membangun startup dari tahap ideasi hingga peluncuran produk.',2,'bisnis','published',8930,'2023-02-01','2023-01-28'),
(3,'Tips Fotografi Smartphone 2024','Dengan smartphone modern, kamu bisa menghasilkan foto berkualitas profesional. Pelajari teknik komposisi, pencahayaan, dan editing yang tepat untuk meningkatkan skill fotografimu.',3,'lifestyle','published',12300,'2023-02-15','2023-02-10'),
(4,'Tutorial SQL Lengkap untuk Developer','SQL adalah bahasa standar untuk database relasional yang wajib dikuasai setiap developer. Dari SELECT dasar hingga JOIN kompleks, artikel ini membahas semua yang perlu kamu ketahui.',4,'teknologi','published',22100,'2023-03-01','2023-02-25'),
(5,'Machine Learning untuk Pemula','Machine learning adalah cabang AI yang memungkinkan komputer belajar dari data. Pelajari konsep dasar, algoritma populer, dan cara mulai belajar machine learning dari nol.',5,'teknologi','published',18500,'2023-03-15','2023-03-10'),
(6,'Strategi Marketing Digital 2024','Di era digital, pemasaran online sangat penting untuk bisnis. Pelajari strategi SEO, media sosial, email marketing, dan iklan berbayar yang efektif untuk meningkatkan penjualan.',2,'bisnis','published',9800,'2023-04-01','2023-03-28'),
(7,'React vs Vue: Pilih Framework Mana?','Kedua framework JavaScript ini sangat populer di kalangan developer frontend. Kami membandingkan ekosistem, performa, kurva belajar, dan use case terbaik untuk setiap framework.',4,'teknologi','published',14200,'2023-04-15','2023-04-10'),
(8,'Investasi Saham untuk Generasi Muda','Saham adalah instrumen investasi yang menjanjikan untuk jangka panjang. Pelajari cara membaca laporan keuangan, analisis fundamental, dan strategi investasi yang tepat.',2,'keuangan','published',11600,'2023-05-01','2023-04-28'),
(9,'Docker dan Containerization Modern','Container technology telah mengubah cara developer membangun dan mendeploy aplikasi. Pelajari konsep dasar Docker, Docker Compose, dan praktik terbaik containerization.',1,'teknologi','published',8900,'2023-05-15','2023-05-10'),
(10,'Tren AI dan Masa Depan Teknologi','Kecerdasan buatan semakin berkembang pesat dan mengubah berbagai industri. Dari ChatGPT hingga autonomous vehicles, bagaimana AI akan membentuk dunia di masa depan?',5,'teknologi','published',25400,'2023-06-01','2023-05-28'),
(11,'Panduan Wisata Bali Hemat 2024','Bali tetap menjadi destinasi wisata favorit domestik dan mancanegara. Temukan tips wisata hemat, tempat makan lokal terbaik, dan atraksi tersembunyi yang belum banyak diketahui.',3,'lifestyle','published',18700,'2023-06-15','2023-06-10'),
(12,'Panduan Git untuk Kolaborasi Tim','Kolaborasi dengan Git membutuhkan strategi yang baik. Pelajari git flow, branching strategy, code review, dan best practice untuk tim pengembang perangkat lunak.',4,'teknologi','published',7300,'2023-07-01','2023-06-28'),
(13,'Keamanan Siber: Ancaman Terbaru','Ancaman siber semakin canggih dengan munculnya ransomware, phishing yang lebih pintar, dan serangan supply chain. Pelajari cara melindungi data dan sistem kamu dari ancaman terkini.',6,'teknologi','published',9450,'2023-07-15','2023-07-10'),
(14,'Cara Kerja DNS dan HTTP Explained','Memahami infrastruktur internet adalah kunci untuk menjadi developer yang handal. Artikel ini menjelaskan cara kerja DNS, HTTP/HTTPS, TCP/IP, dan protokol penting lainnya.',4,'teknologi','published',6800,'2023-08-01','2023-07-28'),
(15,'10 Destinasi Kuliner Tersembunyi Jakarta','Jakarta menyimpan banyak permata kuliner yang belum banyak diketahui. Dari warung tenda di gang sempit hingga restoran heritage tersembunyi.',3,'lifestyle','published',21500,'2023-08-15','2023-08-10'),
(16,'Kubernetes untuk Developer Pemula','Kubernetes adalah platform orkestrasi container yang powerful. Pelajari konsep dasar pod, deployment, service, dan cara mengelola aplikasi skala besar di Kubernetes.',1,'teknologi','published',5600,'2023-09-01','2023-08-28'),
(17,'Psikologi Uang: Mengapa Kita Boros','Perilaku keuangan kita sangat dipengaruhi oleh psikologi dan emosi. Pelajari bias kognitif yang membuat kita boros dan cara membangun kebiasaan keuangan yang sehat.',8,'keuangan','published',13200,'2023-09-15','2023-09-10'),
(18,'Deep Learning dengan PyTorch','PyTorch adalah framework deep learning yang paling populer di kalangan peneliti. Pelajari cara membangun neural network, melatih model, dan melakukan inference dengan PyTorch.',5,'teknologi','published',8100,'2023-10-01','2023-09-28'),
(19,'Kuliner Nusantara: Rendang dan Sejarahnya','Rendang telah dinobatkan sebagai makanan terlezat di dunia. Pelajari sejarah, variasi regional, dan cara membuat rendang otentik Minangkabau.',7,'lifestyle','published',16800,'2023-10-15','2023-10-10'),
(20,'Tips Kesehatan Digital di Era WFH','Bekerja dari rumah membawa tantangan kesehatan baru: mata lelah, postur buruk, dan burnout digital. Pelajari cara menjaga kesehatan fisik dan mental di era remote work.',9,'kesehatan','published',12400,'2023-11-01','2023-10-28'),
(21,'Blockchain Beyond Cryptocurrency','Teknologi blockchain memiliki potensi jauh melampaui cryptocurrency. Dari supply chain management hingga sistem voting, pelajari aplikasi blockchain di dunia nyata.',6,'teknologi','published',7900,'2023-11-15','2023-11-10'),
(22,'Sejarah Batik: Warisan UNESCO Indonesia','Batik Indonesia telah diakui UNESCO sebagai Warisan Budaya Tak Benda. Pelajari sejarah batik, makna motif-motifnya, dan perkembangan batik modern di Indonesia.',10,'budaya','published',14300,'2023-12-01','2023-11-28'),
(23,'GraphQL vs REST API: Perbandingan Lengkap','Memilih antara GraphQL dan REST API mempengaruhi arsitektur aplikasimu. Kami membandingkan performa, fleksibilitas, learning curve, dan use case terbaik untuk keduanya.',4,'teknologi','published',9200,'2023-12-15','2023-12-10'),
(24,'Mindfulness dan Produktivitas Developer','Profesi developer membutuhkan konsentrasi tinggi. Pelajari teknik mindfulness, time management, dan cara mencegah burnout yang cocok untuk software developer.',8,'produktivitas','published',10500,'2024-01-01','2023-12-28'),
(25,'Cara Kerja LLM: ChatGPT Explained','Large Language Model seperti ChatGPT menggunakan arsitektur transformer yang kompleks. Artikel ini menjelaskan cara kerja LLM dalam bahasa yang mudah dipahami.',5,'teknologi','published',31200,'2024-01-15','2024-01-10'),
(26,'PostgreSQL vs MySQL: Mana yang Lebih Baik?','Dua database relasional paling populer memiliki kelebihan masing-masing. Kami membandingkan performa, fitur, ekosistem, dan skenario penggunaan terbaik untuk keduanya.',4,'teknologi','published',11800,'2024-02-01','2024-01-28'),
(27,'Pariwisata Regeneratif: Tren Wisata 2024','Wisatawan modern semakin peduli lingkungan. Pelajari konsep pariwisata regeneratif, destinasi ramah lingkungan, dan cara berwisata yang bertanggung jawab.',7,'lifestyle','published',8400,'2024-02-15','2024-02-10'),
(28,'Zero-Shot Learning dalam Computer Vision','Zero-shot learning memungkinkan model AI mengenali objek yang belum pernah dilihat sebelumnya. Pelajari teknik canggih ini dan implementasinya dalam computer vision.',5,'teknologi','published',6100,'2024-03-01','2024-02-28'),
(29,'Draft: Panduan Redis untuk Production','Redis adalah in-memory database yang sangat cepat. Artikel ini sedang ditulis...',1,'teknologi','draft',0,NULL,'2024-03-15'),
(30,'Draft: Strategi Konten Media Sosial 2025','Panduan lengkap membuat konten media sosial yang viral dan engaging...',2,'bisnis','draft',0,NULL,'2024-04-01');

INSERT INTO komentar VALUES
(1,1,'Reza Pratama','Artikel yang sangat bermanfaat untuk pemula seperti saya! Terima kasih.','2023-01-18',1),
(2,1,'Maya Sari','Penjelasannya sangat mudah dipahami. Bisa request tutorial Python lanjutan?','2023-01-22',1),
(3,1,'Bimo Saputra','Sudah coba kodenya dan berhasil. Lanjutkan konten berkualitas seperti ini!','2023-01-25',1),
(4,2,'Linda Wati','Sangat inspiratif. Saya sedang merintis startup dan artikel ini sangat membantu.','2023-02-05',1),
(5,2,'Diko Ramadhan','Bisa tambahkan bagian tentang mencari investor? Itu tantangan terbesar kami.','2023-02-08',1),
(6,4,'Sari Dewi','Tutorial SQL terlengkap yang pernah saya baca! Bookmarked.','2023-03-05',1),
(7,4,'Tono Hadi','Bisa request artikel tentang query optimization? Sangat butuh itu.','2023-03-10',1),
(8,4,'Umar Bakri','Akhirnya ngerti JOIN setelah baca artikel ini. Makasih banyak!','2023-03-15',1),
(9,5,'Xena Putri','Artikel yang membuka wawasan tentang AI. Well written!','2023-03-25',1),
(10,5,'Yudi Prasetya','Sudah mulai belajar sklearn setelah baca ini. Sangat membantu.','2023-03-28',1),
(11,7,'Zahra Nisa','Saya pilih React karena ekosistemnya lebih besar. Setuju tidak?','2023-04-20',1),
(12,7,'Anis Wulandari','Vue lebih mudah dipelajari menurut saya. Artikel ini sangat objektif.','2023-04-22',1),
(13,10,'Kevin Santosa','Artikel terbaik tentang AI yang pernah saya baca di internet!','2023-06-05',1),
(14,10,'Nita Rahayu','Sangat informatif dan mudah dipahami untuk awam seperti saya.','2023-06-10',1),
(15,10,'Spam Comment','Dapatkan penghasilan jutaan rupiah dari rumah! Klik link ini...','2023-06-15',0),
(16,11,'Budi Arif','Sudah ke Bali 5 kali tapi masih nemu spot baru dari artikel ini!','2023-06-20',1),
(17,13,'Deni Saputra','Sebagai IT security professional, artikel ini sangat akurat. Good job!','2023-07-20',1),
(18,15,'Cindy Rahayu','Sudah cobain semua tempat makan yang direkomendasikan. Semuanya top!','2023-08-25',1),
(19,17,'Faisal Mochtar','Relate banget! Saya juga selalu gagal nabung karena bias-bias ini.','2023-09-20',1),
(20,19,'Ibu Ratna','Akhirnya ada artikel lengkap tentang sejarah rendang. Terima kasih!','2023-10-20',1),
(21,20,'Dr. Haris','Sebagai dokter, saya sangat mengapresiasi artikel kesehatan digital ini.','2023-11-10',1),
(22,22,'Prof. Sutarto','Artikel yang sangat akurat tentang sejarah batik Indonesia.','2023-12-10',1),
(23,25,'Anita Wulandari','ChatGPT explained dengan bahasa yang mudah dipahami. Luar biasa!','2024-01-20',1),
(24,25,'Bambang Eko','Ini artikel terbaik tentang LLM dalam bahasa Indonesia!','2024-01-22',1),
(25,25,'Candra Dewi','Minta kelanjutannya tentang cara fine-tuning LLM dong!','2024-01-25',1),
(26,26,'Eko Wahyu','Akhirnya ada perbandingan komprehensif MySQL vs PostgreSQL.','2024-02-05',1),
(27,4,'Fadil Hardianto','Sudah satu tahun pakai tutorial ini sebagai referensi. Top!','2024-02-10',1),
(28,5,'Gita Maharani','Berkat artikel ini saya berhasil masuk program bootcamp data science!','2024-02-15',1),
(29,1,'Hana Pertiwi','Artikel ini yang pertama kali membuat saya tertarik coding.','2024-02-20',1),
(30,10,'Ivan Kusuma','Prediksi AI di artikel ini banyak yang sudah terbukti. Visioner!','2024-03-01',1),
(31,12,'Jeni Saraswati','Git tutorial paling jelas yang pernah ada. Pakai ini untuk training tim.','2024-03-05',1),
(32,7,'Kiki Pradana','Update dong untuk React 19 dan Vue 4!','2024-03-10',1),
(33,2,'Lani Dewi','Berhasil raise seed funding setelah ikuti saran di artikel ini!','2024-03-15',1),
(34,8,'Mira Santoso','Mulai investasi saham setelah baca artikel ini. Sudah 6 bulan untung!','2024-03-20',1),
(35,13,'Nino Rahmat','Artikel tentang supply chain attack sangat relevan dengan insiden terkini.','2024-03-25',1),
(36,16,'Obi Waskito','Kubernetes di production itu challenging, artikel ini sangat membantu.','2024-04-01',1),
(37,20,'Prita Hapsari','Sebagai WFH worker, artikel ini sangat berguna. Terimakasih!','2024-04-05',1),
(38,23,'Qori Ananda','GraphQL memang game changer untuk API development!','2024-04-10',1),
(39,24,'Rama Wijaya','Teknik mindfulness yang dibahas di sini benar-benar membantu produktivitas saya.','2024-04-15',1),
(40,25,'Spam Bot','CONGRATULATIONS! You won $1,000,000. Click here!','2024-04-20',0);

INSERT INTO tag VALUES
(1,'python','python'),(2,'sql','sql'),(3,'javascript','javascript'),
(4,'ai','ai'),(5,'machine-learning','machine-learning'),(6,'startup','startup'),
(7,'marketing','marketing'),(8,'fotografi','fotografi'),(9,'docker','docker'),
(10,'react','react'),(11,'investasi','investasi'),(12,'keamanan-siber','keamanan-siber'),
(13,'kubernetes','kubernetes'),(14,'database','database'),(15,'kesehatan','kesehatan');

INSERT INTO artikel_tag VALUES
(1,1),(1,2),
(2,6),(2,7),
(3,8),
(4,2),(4,14),
(5,4),(5,5),
(6,7),
(7,3),(7,10),
(8,11),
(9,9),(9,13),
(10,4),(10,5),
(11,8),
(12,3),(12,14),
(13,12),
(14,14),
(16,9),(16,13),
(17,11),
(18,4),(18,5),
(20,15),
(21,12),
(23,14),(23,3),
(24,15),
(25,4),(25,5),(25,1),
(26,2),(26,14),
(28,4),(28,5),
(1,14),(4,1),(5,1),(9,1),(10,1),(16,1),(25,1);
`;
