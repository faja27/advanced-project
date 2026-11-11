# PlateauView — Data Rekonstruksi Lempeng

## Sumber Data

**Model rekonstruksi:** MERDITH2021
**Layanan:** GPlates Web Service (GWS)
**URL layanan:** <https://gws.gplates.org>
**Dokumentasi layanan:** <https://gwsdoc.gplates.org>
**Tanggal akses:** 2026-11-10
**Endpoint yang dipakai:** `GET /reconstruct/coastlines/?time={Ma}&model=MERDITH2021`

---

## Sitasi

### Model MERDITH2021

> Andrew S. Merdith, Simon E. Williams, Alan S. Collins, Michael G. Tetley,
> Jacob A. Mulder, Morgan L. Blades, Alexander Young, Sheree E. Armistead,
> John Cannon, Sabin Zahirovic, R. Dietmar Müller (2021).
> Extending full-plate tectonic models into deep time: Linking the
> Neoproterozoic and the Phanerozoic.
> *Earth-Science Reviews*, Volume 214, 103477.
> <https://doi.org/10.1016/j.earscirev.2020.103477>

Data rekonstruksi (Zenodo, versi 1.2.4):
<https://doi.org/10.5281/zenodo.10346399>

### GPlates Web Service

GPlates Web Service, dikembangkan oleh EarthByte Group, University of Sydney.
Repositori: <https://github.com/GPlates/gplates-web-service>.
Tanggal akses: 2026-11-10.

---

## Lisensi

### Data model MERDITH2021

Lisensi yang tertera di Zenodo (doi:10.5281/zenodo.10346399):

> Creative Commons Attribution 4.0 International

Ketentuan: data boleh digunakan dan didistribusikan ulang dengan syarat
kredit diberikan kepada pencipta asli (lihat sitasi di atas).

Data dalam repositori ini diturunkan dari Merdith et al. (2021), CC BY 4.0,
dan telah diubah (disederhanakan, poligon kecil dibuang, poligon digabung)
untuk keperluan visualisasi.
Teks lengkap lisensi: <https://creativecommons.org/licenses/by/4.0/>

### Perangkat lunak GPlates Web Service

Lisensi perangkat lunak yang tertera di repositori GitHub
(<https://github.com/GPlates/gplates-web-service>):

> GNU General Public License Version 2, June 1991
> Copyright (C) 1989, 1991 Free Software Foundation, Inc.

Data model berlisensi CC BY 4.0; kode GPlates Web Service berlisensi GPLv2.

---

## Langkah Mereproduksi Data

Jalankan script berikut secara berurutan dari folder `scripts/` menggunakan
Python di `C:\venvs\plateauview\Scripts\python.exe`.

### 1. Unduh frame mentah

```
python fetch_frames.py
```

Argumen default mengunduh seluruh rentang sesuai PRD:
- 0–250 Ma, interval 5 Ma
- 260–1000 Ma, interval 10 Ma

Output: `scripts/_raw/frames/{waktu}.json` (GeoJSON mentah, ~185 MB total).
File yang sudah ada dan valid dilewati otomatis (resume-safe).

Untuk sebagian rentang:
```
python fetch_frames.py --start 0 --end 50 --step 5
```

Parameter CLI lengkap: `--model`, `--start`, `--end`, `--step`, `--out`.

### 2. Sederhanakan frame

```
python simplify_frames.py --start 0 --end 1000
```

Output: `public/data/frames/{waktu}.json`.
Parameter CLI: `--start`, `--end`, `--tolerance` (default 0.3), `--min-area` (default 0.5), `--out`.

### 3. Buat manifest

```
python build_manifest.py
```

Output: `public/data/manifest.json` dan `scripts/_out/contact_sheet.png`.

---

## Struktur File

### `manifest.json`

```json
{
  "model": "MERDITH2021",
  "generated_at": "2026-11-10T...",
  "total_frames": 126,
  "total_bytes": 8395451,
  "intervals": [
    { "start_ma": 0,   "end_ma": 250,  "step_ma": 5  },
    { "start_ma": 260, "end_ma": 1000, "step_ma": 10 }
  ],
  "frames": [
    {
      "time_ma":       0,
      "file":          "0.json",
      "size_bytes":    89581,
      "n_features":    129,
      "has_polar_cap": true
    },
    ...
  ]
}
```

### `frames/{waktu}.json`

Format GeoJSON standar (RFC 7946):

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[ [lon, lat], ... ]]
      },
      "properties": {}
    }
  ]
}
```

- Tipe geometri: `Polygon` (semua feature; `MultiPolygon` tidak muncul
  setelah simplifikasi karena poligon kecil digabung atau dibuang).
- `properties` selalu objek kosong `{}` — tidak ada atribut tambahan.
- Koordinat: `[longitude, latitude]` dalam derajat desimal, dibulatkan
  2 desimal.
- Waktu rekonstruksi tidak disimpan di dalam file; waktu dapat disimpulkan
  dari nama file.

---

## Batasan Data

### Interval waktu

| Rentang | Interval | Jumlah frame |
|---------|----------|-------------|
| 0–250 Ma | 5 Ma | 51 |
| 260–1000 Ma | 10 Ma | 75 |
| **Total** | | **126** |

Tidak ada frame di antara titik-titik tersebut. Website menggunakan frame
terdekat untuk setiap posisi slider.

### Simplifikasi geometri

- **Tolerance:** 0,3° (≈ 33 km di ekuator), `shapely.simplify(preserve_topology=True)`.
- **Pembulatan koordinat:** 2 desimal (presisi ≈ 1,1 km di ekuator).
- **Filter luas minimum:** poligon dengan luas < 0,5 derajat² dibuang.
  Akibatnya, **pulau-pulau kecil tidak muncul** (misalnya kepulauan di
  Pasifik, Karibia, Asia Tenggara pada era tertentu).
- Poligon-poligon yang bersinggungan digabung dahulu (`unary_union`) sebelum
  disederhanakan, sehingga batas internal antar-fragment hilang.

### Ketidakpastian era tua

- Frame di atas 600 Ma memiliki jumlah feature yang jauh lebih sedikit
  (55–82 feature vs. 129–152 untuk 0–50 Ma) dan representasi geometri lebih
  kasar — mencerminkan keterbatasan data rekonstruksi purba, bukan masalah
  teknis.
- Rekonstruksi di atas ~800 Ma dianggap lebih spekulatif secara ilmiah.

### Tanda `has_polar_cap`

Flag `has_polar_cap: true` di manifest berarti setidaknya satu poligon dalam
frame tersebut memiliki **rentang bujur (longitude span) > 300°** dan berada
di lintang ekstrem (> 80° atau < −80°). Ini adalah **kriteria deteksi
otomatis**, bukan tanda bahwa poligon rusak.

Poligon seperti ini umumnya merepresentasikan superbenua besar (misalnya
Gondwana di kutub selatan pada 200–500 Ma) yang secara geografis memang
membentang di hampir semua bujur pada lintang tinggi. Sebagian besar akan
render dengan benar di Globe.gl (Three.js, ruang 3D). Jika muncul artefak
visual, pertimbangkan polar clip di ±85° lintang.

### Poligon melingkupi kutub — perlu diverifikasi

Beberapa frame menampilkan daratan yang menutupi area kutub secara luas:

- **200 Ma (kutub utara):** Dalam model MERDITH2021, daratan besar (bagian
  Pangaea) menutupi kutub utara, sementara kutub selatan relatif kosong.
  Ini berbeda dari MULLER2019 yang menempatkan Antartika lebih dekat ke
  kutub selatan pada waktu yang sama. Perbedaan ini bukan kesalahan, melainkan
  konsekuensi perbedaan *absolute reference frame* (paleomagnetic vs. mantle).
- **300–500 Ma (kutub selatan):** Superbenua Gondwana berposisi di lintang
  selatan tinggi, menghasilkan polar cap besar yang terdeteksi.
- **250 → 200 Ma:** Pangaea tampak bergeser cukup jauh ke utara antara 250
  dan 200 Ma dalam model ini — ini adalah karakteristik MERDITH2021 yang
  menggunakan paleomagnetic reference frame, berbeda dari mantle frame
  MULLER2019. Perlu diberi catatan kepada pengguna agar tidak
  diinterpretasikan sebagai pergerakan tiba-tiba.

Semua kasus di atas perlu **diverifikasi secara visual saat render globe
(Tahap 2)** sebelum data dinyatakan siap tayang.

---

## Catatan Reference Frame

Model MERDITH2021 menggunakan **paleomagnetic reference frame** (kombinasi
MULLER2016 yang dimodifikasi dan MATTHEWS2016). Ini berbeda dari
**mantle reference frame** yang dipakai MULLER2019.

Implikasi praktis untuk PlateauView:
- Posisi absolut benua terhadap kutub bumi berbeda antara kedua model.
- Tidak ada "benar mutlak" — keduanya adalah rekonstruksi ilmiah dengan
  asumsi berbeda.
- PlateauView menggunakan MERDITH2021 secara konsisten untuk seluruh
  rentang 0–1000 Ma, sehingga tidak ada lompatan visual antar-frame.
- Label "Proyeksi — bukan data pasti" wajib ditampilkan untuk segmen A
  (< 0 Ma) dan C (> 0 Ma masa depan) sesuai PRD.
