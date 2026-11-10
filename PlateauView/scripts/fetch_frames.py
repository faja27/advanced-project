"""
fetch_frames.py — Unduh frame rekonstruksi dari GPlates Web Service.

Contoh pemakaian:
  python fetch_frames.py                          # default: 0-1000 Ma dua interval
  python fetch_frames.py --start 0 --end 50 --step 5   # uji awal
  python fetch_frames.py --model MERDITH2021 --start 260 --end 1000 --step 10
"""

import argparse
import json
import os
import sys
import time

import requests

BASE_URL = "https://gws.gplates.org/reconstruct/coastlines/"
DEFAULT_MODEL = "MERDITH2021"
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "_raw", "frames")

REQUEST_DELAY = 1.5   # detik antar request berhasil
RETRY_DELAYS  = [5, 15, 30]  # detik sebelum retry ke-1, ke-2, ke-3
TIMEOUT       = 60    # detik per request


# ── Helpers ──────────────────────────────────────────────────────────────────

def is_valid_geojson(path: str) -> bool:
    """Cek apakah file ada, bisa dibaca sebagai JSON, dan berisi FeatureCollection."""
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return (
            isinstance(data, dict)
            and data.get("type") == "FeatureCollection"
            and isinstance(data.get("features"), list)
            and len(data["features"]) > 0
        )
    except Exception:
        return False


def fetch_one(model: str, t: int, timeout: int) -> dict:
    """Ambil satu frame; raise HTTPError / Timeout / ConnectionError jika gagal."""
    url = f"{BASE_URL}?time={t}&model={model}"
    r = requests.get(url, timeout=timeout)
    r.raise_for_status()
    return r.json()


def fetch_with_retry(model: str, t: int, timeout: int) -> tuple[dict, int]:
    """
    Coba fetch dengan retry eksponensial.
    Kembalikan (data, jumlah_retry).
    Raise jika semua retry habis.
    """
    last_exc = None
    for attempt, delay in enumerate([0] + RETRY_DELAYS):
        if delay:
            print(f"    retry {attempt}/{len(RETRY_DELAYS)}, tunggu {delay}s ...", flush=True)
            time.sleep(delay)
        try:
            t0 = time.perf_counter()
            data = fetch_one(model, t, timeout)
            elapsed = time.perf_counter() - t0
            return data, attempt, elapsed
        except (requests.HTTPError, requests.ConnectionError,
                requests.Timeout, ValueError) as e:
            last_exc = e
            print(f"    gagal ({type(e).__name__}: {e})", flush=True)
    raise RuntimeError(f"Semua retry habis untuk {t} Ma") from last_exc


# ── Main ─────────────────────────────────────────────────────────────────────

def build_time_list(start: int, end: int, step: int) -> list[int]:
    times = []
    t = start
    while t <= end:
        times.append(t)
        t += step
    return times


def run(model: str, times: list[int], out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    total = len(times)
    skipped = 0
    downloaded = 0
    failed = []

    print(f"\nModel  : {model}")
    print(f"Frames : {times[0]}–{times[-1]} Ma ({total} frame)")
    print(f"Output : {out_dir}")
    print("-" * 60)

    for i, t in enumerate(times, 1):
        path = os.path.join(out_dir, f"{t}.json")
        prefix = f"[{i:>3}/{total}]  {t:>4} Ma"

        if is_valid_geojson(path):
            size_kb = os.path.getsize(path) / 1024
            print(f"{prefix}  SKIP   ({size_kb:.0f} KB sudah ada)", flush=True)
            skipped += 1
            continue

        try:
            data, retries, elapsed = fetch_with_retry(model, t, TIMEOUT)
            n_feat = len(data.get("features", []))

            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, separators=(",", ":"))

            size_kb = os.path.getsize(path) / 1024
            retry_tag = f" (+{retries} retry)" if retries else ""
            print(
                f"{prefix}  OK     {elapsed:5.1f}s  {size_kb:>7.1f} KB  "
                f"{n_feat:>5} feat{retry_tag}",
                flush=True,
            )
            downloaded += 1

        except Exception as e:
            print(f"{prefix}  GAGAL  {e}", flush=True)
            failed.append(t)
            continue

        if i < total:
            time.sleep(REQUEST_DELAY)

    print("-" * 60)
    print(f"Selesai: {downloaded} diunduh, {skipped} dilewati, {len(failed)} gagal.")
    if failed:
        print(f"Frame gagal: {failed}")
    return len(failed) == 0


def parse_args():
    p = argparse.ArgumentParser(description="Unduh frame rekonstruksi dari GPlates Web Service.")
    p.add_argument("--model", default=DEFAULT_MODEL,
                   help=f"Nama model (default: {DEFAULT_MODEL})")
    p.add_argument("--start", type=int, default=None,
                   help="Waktu mulai dalam Ma (default: 0)")
    p.add_argument("--end",   type=int, default=None,
                   help="Waktu akhir dalam Ma (default: 1000)")
    p.add_argument("--step",  type=int, default=None,
                   help="Interval dalam Ma (default: 5 untuk ≤250, 10 untuk >250)")
    p.add_argument("--out",   default=DEFAULT_OUT,
                   help=f"Folder output (default: {DEFAULT_OUT})")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()

    # Bangun daftar waktu
    if args.start is not None or args.end is not None or args.step is not None:
        # Mode manual: semua parameter dari CLI
        start = args.start if args.start is not None else 0
        end   = args.end   if args.end   is not None else 1000
        step  = args.step  if args.step  is not None else 5
        times = build_time_list(start, end, step)
    else:
        # Mode default: dua interval sesuai PRD
        times = build_time_list(0, 250, 5) + build_time_list(260, 1000, 10)

    ok = run(args.model, times, args.out)
    sys.exit(0 if ok else 1)
