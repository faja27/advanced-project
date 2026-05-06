"""
Download data gempa bumi Indonesia dari USGS Earthquake API
Area: 11°LS - 9°LU, 95°BT - 141°BT
Periode: Januari 1950 - Mei 2026
Minimum magnitude: 4.0
"""

import os
import time
import calendar
import requests
import pandas as pd
from pathlib import Path
from tqdm import tqdm
from datetime import datetime

# ── Konfigurasi ─────────────────────────────────────────────────────────────
BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
PARAMS_BASE = {
    "format": "csv",
    "minlatitude": -11,
    "maxlatitude": 9,
    "minlongitude": 95,
    "maxlongitude": 141,
    "minmagnitude": 4.0,
    "orderby": "time",
    "limit": 20000,
}
COLUMNS = ["time", "latitude", "longitude", "depth", "mag", "magType", "place", "type", "id"]

START_YEAR, START_MONTH = 1950, 1
END_YEAR,   END_MONTH   = 2026, 5

RAW_DIR      = Path("raw_monthly")
OUTPUT_FILE  = Path("indonesia_earthquakes_1950_2026.csv")
FAILED_FILE  = Path("failed_months.txt")

MAX_RETRY    = 3
RETRY_DELAY  = 5   # detik
REQUEST_TIMEOUT = 120  # detik

# ── Helper: daftar semua bulan ───────────────────────────────────────────────
def generate_months(start_year, start_month, end_year, end_month):
    months = []
    y, m = start_year, start_month
    while (y, m) <= (end_year, end_month):
        months.append((y, m))
        m += 1
        if m > 12:
            m = 1
            y += 1
    return months


# ── Download satu bulan ──────────────────────────────────────────────────────
def download_month(year: int, month: int) -> pd.DataFrame | None:
    last_day = calendar.monthrange(year, month)[1]
    params = {
        **PARAMS_BASE,
        "starttime": f"{year:04d}-{month:02d}-01",
        "endtime":   f"{year:04d}-{month:02d}-{last_day:02d}",
    }

    for attempt in range(1, MAX_RETRY + 1):
        try:
            resp = requests.get(BASE_URL, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()

            # USGS mengembalikan teks CSV; parse langsung dari konten
            from io import StringIO
            df = pd.read_csv(StringIO(resp.text))

            # Pilih kolom yang ada (API kadang kembalikan nama sedikit berbeda)
            available = [c for c in COLUMNS if c in df.columns]
            df = df[available]
            return df

        except Exception as exc:
            if attempt < MAX_RETRY:
                time.sleep(RETRY_DELAY)
            else:
                return None  # Semua retry gagal

    return None


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    RAW_DIR.mkdir(exist_ok=True)
    months = generate_months(START_YEAR, START_MONTH, END_YEAR, END_MONTH)
    failed_months = []

    print(f"Total bulan yang akan diproses: {len(months)}")
    print(f"Periode: {START_YEAR}-{START_MONTH:02d} s/d {END_YEAR}-{END_MONTH:02d}")
    print(f"Area   : Lat [{PARAMS_BASE['minlatitude']}, {PARAMS_BASE['maxlatitude']}]  "
          f"Lon [{PARAMS_BASE['minlongitude']}, {PARAMS_BASE['maxlongitude']}]")
    print(f"Min Mag: {PARAMS_BASE['minmagnitude']}\n")

    pbar = tqdm(months, desc="Downloading", unit="bulan", ncols=90)

    for year, month in pbar:
        fname = RAW_DIR / f"eq_{year:04d}_{month:02d}.csv"

        # Resume: lewati jika sudah ada
        if fname.exists():
            pbar.set_postfix_str(f"{year}-{month:02d} [skip]")
            continue

        pbar.set_postfix_str(f"{year}-{month:02d} ...")
        df = download_month(year, month)

        if df is None:
            failed_months.append(f"{year:04d}-{month:02d}")
            pbar.set_postfix_str(f"{year}-{month:02d} [FAILED]")
            continue

        if df.empty:
            # Simpan file kosong agar tidak di-download ulang saat resume
            df.to_csv(fname, index=False)
            pbar.set_postfix_str(f"{year}-{month:02d} [0 event]")
        else:
            df.to_csv(fname, index=False)
            pbar.set_postfix_str(f"{year}-{month:02d} [{len(df)} event]")

        # Jeda kecil agar tidak membebani server USGS
        time.sleep(0.3)

    pbar.close()

    # ── Catat bulan yang gagal ───────────────────────────────────────────────
    if failed_months:
        with open(FAILED_FILE, "w") as f:
            f.write("\n".join(failed_months))
        print(f"\n[!] {len(failed_months)} bulan gagal didownload → {FAILED_FILE}")

    # ── Gabungkan semua file ─────────────────────────────────────────────────
    print("\nMenggabungkan semua file bulanan...")
    csv_files = sorted(RAW_DIR.glob("eq_*.csv"))

    if not csv_files:
        print("[!] Tidak ada file yang berhasil didownload.")
        return

    dfs = []
    for f in tqdm(csv_files, desc="Merging", unit="file", ncols=90):
        try:
            df = pd.read_csv(f)
            if not df.empty:
                dfs.append(df)
        except Exception:
            pass  # File kosong atau corrupt — lewati

    if not dfs:
        print("[!] Semua file kosong — tidak ada data untuk digabungkan.")
        return

    combined = pd.concat(dfs, ignore_index=True)

    # Pastikan urutan kolom dan hapus duplikat berdasarkan id
    avail_cols = [c for c in COLUMNS if c in combined.columns]
    combined = combined[avail_cols].drop_duplicates(subset=["id"] if "id" in avail_cols else None)
    combined = combined.sort_values("time").reset_index(drop=True)

    combined.to_csv(OUTPUT_FILE, index=False)
    print(f"\nFile gabungan disimpan: {OUTPUT_FILE}")

    # ── Hapus folder raw_monthly ─────────────────────────────────────────────
    print("Menghapus folder raw_monthly/ ...")
    import shutil
    shutil.rmtree(RAW_DIR)
    print("Folder raw_monthly/ berhasil dihapus.")

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n" + "="*55)
    print("  SUMMARY")
    print("="*55)
    print(f"  Total event          : {len(combined):,}")
    if "time" in combined.columns:
        print(f"  Tanggal pertama      : {combined['time'].min()}")
        print(f"  Tanggal terakhir     : {combined['time'].max()}")
    if "mag" in combined.columns:
        print(f"  Magnitude min/max    : {combined['mag'].min()} / {combined['mag'].max()}")
    print(f"  Bulan gagal download : {len(failed_months)}")
    if failed_months:
        print(f"  Detail               : lihat {FAILED_FILE}")
    print(f"  Output file          : {OUTPUT_FILE}")
    print("="*55)


if __name__ == "__main__":
    main()
