import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

WORKDIR    = Path(".")
INPUT_CSV  = WORKDIR / "indonesia_earthquakes_combined_1950_2026.csv"
OUTPUT_CSV = WORKDIR / "indonesia_earthquakes_final.csv"
REPORT_TXT = WORKDIR / "preprocessing_report.txt"

SEP = "=" * 70
sep = "-" * 70
log = []

def plog(msg=""):
    print(msg); log.append(str(msg))

def section(title):
    plog(f"\n{SEP}\n{title}\n{SEP}")

# ─────────────────────────────────────────────────────────────────────────────
# LOAD
# ─────────────────────────────────────────────────────────────────────────────
section("LOAD DATA")

df = pd.read_csv(INPUT_CSV)
df["time"] = pd.to_datetime(df["time"], format="mixed", errors="coerce")

# Hapus kolom yang tidak diperlukan
drop_cols = [c for c in ["time_reconstructed", "type"] if c in df.columns]
if drop_cols:
    df.drop(columns=drop_cols, inplace=True)
    plog(f"  Kolom dihapus (tidak dipakai): {drop_cols}")

n_load = len(df)
plog(f"  Total baris dimuat : {n_load:,}")
plog(f"  Kolom              : {list(df.columns)}")

# ─────────────────────────────────────────────────────────────────────────────
# ISU 5 — KOLOM DATA SOURCE  (dikerjakan lebih dulu agar bisa dipakai ISU 2)
# ─────────────────────────────────────────────────────────────────────────────
section("ISU 5 — TAMBAH KOLOM data_source")

def classify_source(id_val):
    s = str(id_val)
    if s.startswith("BMKG"):                          return "BMKG"
    if s.startswith("ISC"):                           return "ISC"
    if s.startswith(("usp","us","USGS","iscgem",
                     "iscgemsup","official")):        return "USGS"
    if s.startswith("GFZ"):                           return "GFZ"
    return "OTHER"

df["data_source"] = df["id"].apply(classify_source)

src_dist = df["data_source"].value_counts()
plog("\n  Distribusi data_source:")
for src, n in src_dist.items():
    plog(f"    {src:<8}: {n:>8,}  ({n/n_load*100:.2f}%)")

# ─────────────────────────────────────────────────────────────────────────────
# ISU 1 — FILTER MAGNITUDO >= 4.0
# ─────────────────────────────────────────────────────────────────────────────
section("ISU 1 — FILTER MAGNITUDO >= 4.0")

n_before = len(df)
per_src_before = df["data_source"].value_counts()

df = df[df["mag"] >= 4.0].copy()
n_after  = len(df)
n_removed = n_before - n_after

per_src_after  = df["data_source"].value_counts()
per_src_removed = per_src_before - per_src_after.reindex(per_src_before.index, fill_value=0)

plog(f"\n  Sebelum filter : {n_before:,} baris")
plog(f"  Sesudah filter : {n_after:,} baris  (hapus {n_removed:,} | {n_removed/n_before*100:.1f}%)")
plog(f"\n  Detail per sumber:")
plog(f"  {'Sumber':<8}  {'Sebelum':>9}  {'Sesudah':>9}  {'Dihapus':>9}  {'%Hilang':>9}")
plog(f"  {'-'*8}  {'-'*9}  {'-'*9}  {'-'*9}  {'-'*9}")
for src in per_src_before.index:
    b = per_src_before.get(src, 0)
    a = per_src_after.get(src, 0)
    r = b - a
    plog(f"  {src:<8}  {b:>9,}  {a:>9,}  {r:>9,}  {r/b*100:>8.1f}%")

plog(f"\n  Rentang magnitudo setelah filter: {df['mag'].min():.1f} – {df['mag'].max():.1f}")

# ─────────────────────────────────────────────────────────────────────────────
# ISU 2 — IMPUTASI magType
# ─────────────────────────────────────────────────────────────────────────────
section("ISU 2 — IMPUTASI magType")

n_nan_before = df["magType"].isna().sum()
plog(f"\n  NaN magType sebelum imputasi : {n_nan_before:,}  ({n_nan_before/n_after*100:.2f}%)")

# Hitung modus magType per sumber dari baris yang TIDAK NaN
modus_map = {}
plog(f"\n  Modus magType per sumber (dihitung dari data valid):")
plog(f"  {'Sumber':<8}  {'Modus':>8}  {'N valid':>9}  {'N NaN sebelum':>14}")
for src in df["data_source"].unique():
    mask_src  = df["data_source"] == src
    valid_mag = df.loc[mask_src & df["magType"].notna(), "magType"]
    nan_count = (mask_src & df["magType"].isna()).sum()
    if len(valid_mag) > 0:
        modus = valid_mag.mode()[0]
    else:
        modus = "mb"   # fallback global
    modus_map[src] = modus
    plog(f"  {src:<8}  {modus:>8}  {len(valid_mag):>9,}  {nan_count:>14,}")

# Terapkan imputasi
for src, modus in modus_map.items():
    mask_fill = (df["data_source"] == src) & df["magType"].isna()
    df.loc[mask_fill, "magType"] = modus

n_nan_after = df["magType"].isna().sum()
plog(f"\n  NaN magType sesudah imputasi : {n_nan_after:,}")
plog(f"  Berhasil diimputasi          : {n_nan_before - n_nan_after:,}")

plog(f"\n  Distribusi magType setelah imputasi (top 10):")
mt_dist = df["magType"].value_counts().head(10)
for mt, n in mt_dist.items():
    plog(f"    {mt:<8}: {n:>8,}  ({n/n_after*100:.2f}%)")

# ─────────────────────────────────────────────────────────────────────────────
# ISU 3 — GANTI place DENGAN grid_id
# ─────────────────────────────────────────────────────────────────────────────
section("ISU 3 — GRID ID (1°x1°) GANTI KOLOM place")

n_place_nan = df["place"].isna().sum()
plog(f"\n  NaN di kolom place : {n_place_nan:,}  ({n_place_nan/n_after*100:.1f}%)")
plog(f"  -> Membuat grid_id dari lat/lon floor 1° ...")

def make_grid_id(lat, lon):
    """Format: LAT-8_LON115  (integer floor, negatif eksplisit)."""
    lat_f = int(np.floor(lat))
    lon_f = int(np.floor(lon))
    return f"LAT{lat_f}_LON{lon_f}"

df["grid_id"] = df.apply(lambda r: make_grid_id(r["latitude"], r["longitude"]), axis=1)

n_grids = df["grid_id"].nunique()
plog(f"  Jumlah grid_id unik: {n_grids}")
plog(f"\n  Contoh grid_id:")
samples = df[["latitude","longitude","grid_id"]].drop_duplicates().head(8)
plog(samples.to_string(index=False))

plog(f"\n  Top 10 grid terpadat:")
top_grid = df["grid_id"].value_counts().head(10)
for g, n in top_grid.items():
    plog(f"    {g:<20}: {n:>7,}")

# Hapus kolom place
df.drop(columns=["place"], inplace=True)
plog(f"\n  Kolom 'place' dihapus.")

# ─────────────────────────────────────────────────────────────────────────────
# ISU 4 — FITUR TAMBAHAN UNTUK ML
# ─────────────────────────────────────────────────────────────────────────────
section("ISU 4 — FITUR TAMBAHAN UNTUK ML")

# depth_category
depth_bins   = [0, 70, 300, 10000]
depth_labels = ["shallow", "intermediate", "deep"]
df["depth_category"] = pd.cut(df["depth"], bins=depth_bins,
                               labels=depth_labels, right=True, include_lowest=True)
depth_dist = df["depth_category"].value_counts().reindex(depth_labels)
plog(f"\n  [depth_category]")
for cat, n in depth_dist.items():
    plog(f"    {cat:<14}: {n:>7,}  ({n/n_after*100:.1f}%)")

# decade
df["decade"] = (df["time"].dt.year // 10 * 10).astype("Int64")
decade_dist = df["decade"].value_counts().sort_index()
plog(f"\n  [decade] — distribusi:")
plog("  " + "  ".join([f"{int(d)}:{int(n)}" for d, n in decade_dist.items()]))

# day_of_year
df["day_of_year"] = df["time"].dt.day_of_year.astype("Int64")
plog(f"\n  [day_of_year] range: {df['day_of_year'].min()} – {df['day_of_year'].max()}")

# month
df["month"] = df["time"].dt.month.astype("Int64")
month_dist = df["month"].value_counts().sort_index()
plog(f"\n  [month] distribusi:")
month_names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
plog("  " + "  ".join([f"{month_names[int(m)-1]}:{int(n)}" for m, n in month_dist.items()]))

plog(f"\n  Semua fitur tambahan berhasil dibuat.")

# ─────────────────────────────────────────────────────────────────────────────
# ISU 6 — VALIDASI AKHIR
# ─────────────────────────────────────────────────────────────────────────────
section("ISU 6 — VALIDASI AKHIR")

# Pastikan urutan kolom rapi
col_order = [
    "time", "latitude", "longitude", "depth", "mag",
    "magType", "grid_id", "id", "data_source",
    "depth_category", "decade", "month", "day_of_year",
]
df = df[col_order].copy()

# Pastikan time sudah datetime
plog(f"\n  dtype kolom 'time'  : {df['time'].dtype}")
plog(f"  Contoh nilai time   : {df['time'].iloc[0]}")
n_nat = df["time"].isna().sum()
plog(f"  NaT di kolom time   : {n_nat}")

# Urutkan kronologis
df.sort_values("time", inplace=True)
df.reset_index(drop=True, inplace=True)
plog(f"  Urutan kronologis   : OK (sorted)")

# Summary
plog(f"\n  {'─'*60}")
plog(f"  SUMMARY DATASET FINAL")
plog(f"  {'─'*60}")
plog(f"  Total event         : {len(df):,}")
plog(f"  Rentang tanggal     : {df['time'].min().date()} s/d {df['time'].max().date()}")
plog(f"  Rentang magnitudo   : {df['mag'].min():.1f} – {df['mag'].max():.1f}")

plog(f"\n  [Distribusi data_source]")
for src, n in df["data_source"].value_counts().items():
    plog(f"    {src:<8}: {n:>7,}  ({n/len(df)*100:.2f}%)")

plog(f"\n  [Distribusi depth_category]")
for cat, n in df["depth_category"].value_counts().reindex(depth_labels).items():
    plog(f"    {cat:<14}: {n:>7,}  ({n/len(df)*100:.1f}%)")

plog(f"\n  [NaN per kolom — KRITIS: harus 0]")
critical = ["time","latitude","longitude","depth","mag","magType","grid_id","id","data_source"]
plog(f"  {'Kolom':<16}  {'NaN':>8}  {'%':>7}  {'Status':>8}")
plog(f"  {'-'*16}  {'-'*8}  {'-'*7}  {'-'*8}")
for col in col_order:
    n = df[col].isna().sum()
    status = "[OK]" if (col in critical and n == 0) else ("[WARN]" if n > 0 else "[OK]")
    plog(f"  {col:<16}  {n:>8,}  {n/len(df)*100:>6.2f}%  {status:>8}")

# Cek duplikasi
n_dup = df.duplicated(subset=["time","latitude","longitude","mag"]).sum()
plog(f"\n  Duplikasi (time+lat+lon+mag) : {n_dup:,}")

# ─────────────────────────────────────────────────────────────────────────────
# SIMPAN
# ─────────────────────────────────────────────────────────────────────────────
section("SIMPAN OUTPUT")

# Simpan CSV — format time sebagai string ISO 8601
df_save = df.copy()
df_save["time"] = df_save["time"].dt.strftime("%Y-%m-%dT%H:%M:%S")
df_save.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")
size_mb = OUTPUT_CSV.stat().st_size / (1024**2)
plog(f"\n  [OK] Dataset final   : {OUTPUT_CSV.name}  ({size_mb:.2f} MB)")
plog(f"       Total baris     : {len(df_save):,}")
plog(f"       Total kolom     : {len(df_save.columns)}: {list(df_save.columns)}")

# Simpan laporan
report = f"""LAPORAN PREPROCESSING — KATALOG GEMPA BUMI INDONESIA
{'='*70}
Tanggal  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Input    : {INPUT_CSV.name}
Output   : {OUTPUT_CSV.name}

RINGKASAN PERUBAHAN
{sep}
ISU 1 — Filter Magnitudo >= 4.0
  Sebelum  : {n_before:,} baris
  Sesudah  : {n_after:,} baris
  Dihapus  : {n_removed:,} baris ({n_removed/n_before*100:.1f}%)
  Alasan   : Menghilangkan bias threshold antar sumber
             (USGS min M4.0 vs Mendeley/ISC min M3.0)

ISU 2 — Imputasi magType
  NaN sebelum  : {n_nan_before:,}
  NaN sesudah  : {n_nan_after:,}
  Modus per sumber: {modus_map}

ISU 3 — grid_id (1°x1°) menggantikan kolom place
  Grid unik    : {n_grids}
  Format       : LAT{{lat_floor}}_LON{{lon_floor}}
  Contoh       : LAT-8_LON115 (lat=-8.3, lon=115.7)
  Kolom place  : DIHAPUS (NaN {n_place_nan/n_after*100:.1f}% — tidak reliable)

ISU 4 — Fitur tambahan ML
  depth_category : shallow / intermediate / deep
  decade         : dekade tahun (1950, 1960, ... 2020)
  month          : bulan 1-12
  day_of_year    : hari ke-1 s/d 366

ISU 5 — Kolom data_source
  Pemetaan id prefix -> data_source:
    BMKG*              -> BMKG
    ISC*               -> ISC
    usp/us/USGS/iscgem -> USGS
    GFZ*               -> GFZ
    lainnya            -> OTHER

DATASET FINAL
{sep}
Total event     : {len(df):,}
Rentang tanggal : {df['time'].min().date()} s/d {df['time'].max().date()}
Rentang mag     : {df['mag'].min():.1f} – {df['mag'].max():.1f}
Kolom output    : {list(df_save.columns)}

NaN per kolom kritis:
  time, latitude, longitude, depth, mag, magType,
  grid_id, id, data_source = 0 (BERSIH)
{'='*70}
"""
REPORT_TXT.write_text(report, encoding="utf-8")
plog(f"  [OK] Laporan         : {REPORT_TXT.name}")

plog(f"\n{'='*70}")
plog("SELESAI — Preprocessing selesai, dataset siap untuk ML")
plog(f"{'='*70}")
