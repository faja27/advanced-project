"""
build_manifest.py — Validasi frames & tulis public/data/manifest.json
                     + render scripts/_out/contact_sheet.png
"""

import json
import os
import sys
import math

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Polygon as MplPoly
from matplotlib.collections import PatchCollection
import numpy as np
from shapely.geometry import shape
from shapely.validation import make_valid

FRAMES_DIR   = os.path.join(os.path.dirname(__file__), "..", "public", "data", "frames")
MANIFEST_OUT = os.path.join(os.path.dirname(__file__), "..", "public", "data", "manifest.json")
OUT_DIR      = os.path.join(os.path.dirname(__file__), "_out")
os.makedirs(OUT_DIR, exist_ok=True)

MODEL        = "MERDITH2021"
POLAR_LON_SPAN = 300.0
POLAR_LAT      = 80.0

CONTACT_TIMES = [0, 50, 100, 150, 200, 250, 300, 400, 500, 650, 800, 1000]

# ── Helpers ───────────────────────────────────────────────────────────────────

def expected_times():
    """Daftar waktu yang diharapkan sesuai interval PRD."""
    t = list(range(0, 251, 5))          # 0–250 Ma, step 5
    t += list(range(260, 1001, 10))     # 260–1000 Ma, step 10
    return t


def is_polar_cap(coords):
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    return (max(lons) - min(lons)) > POLAR_LON_SPAN and (
        max(lats) > POLAR_LAT or min(lats) < -POLAR_LAT
    )


def analyze_frame(t):
    """
    Baca, validasi, dan ekstrak metadata satu frame.
    Kembalikan dict info + list pesan error.
    """
    path   = os.path.join(FRAMES_DIR, f"{t}.json")
    errors = []

    if not os.path.exists(path):
        return None, [f"File tidak ada: {t}.json"]

    size_bytes = os.path.getsize(path)

    # Cek JSON valid
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return None, [f"JSON rusak: {e}"]

    if data.get("type") != "FeatureCollection":
        errors.append("Bukan FeatureCollection")

    features = data.get("features", [])
    n_feat   = len(features)
    has_polar = False
    n_invalid_geom = 0

    for feat in features:
        geom_dict = feat.get("geometry", {})
        gtype     = geom_dict.get("type", "")

        # Cek polar cap
        if gtype == "Polygon":
            rings = [geom_dict["coordinates"][0]]
        elif gtype == "MultiPolygon":
            rings = [poly[0] for poly in geom_dict["coordinates"]]
        else:
            rings = []
        for ring in rings:
            if is_polar_cap(ring):
                has_polar = True

        # Validasi geometri shapely
        try:
            g = shape(geom_dict)
            if not g.is_valid:
                fixed = make_valid(g)
                if not fixed.is_valid:
                    n_invalid_geom += 1
        except Exception:
            n_invalid_geom += 1

    if n_invalid_geom:
        errors.append(f"{n_invalid_geom} geometri tidak valid setelah make_valid")

    info = {
        "time_ma":    t,
        "file":       f"{t}.json",
        "size_bytes": size_bytes,
        "n_features": n_feat,
        "has_polar_cap": has_polar,
    }
    return info, errors


# ── Validasi interval ─────────────────────────────────────────────────────────

def validate_intervals(found_times, expected):
    missing = sorted(set(expected) - set(found_times))
    extra   = sorted(set(found_times) - set(expected))
    return missing, extra


# ── Contact sheet ─────────────────────────────────────────────────────────────

def load_frame(t):
    path = os.path.join(FRAMES_DIR, f"{t}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def draw_equirect(ax, geojson, t, n_feat, has_polar):
    """Render satu frame dalam proyeksi ekuirectangular sederhana."""
    ax.set_facecolor("#0a1929")
    ax.set_xlim(-180, 180)
    ax.set_ylim(-90, 90)
    ax.set_aspect("equal")

    if geojson is None:
        ax.text(0, 0, "TIDAK ADA", color="red", ha="center", va="center", fontsize=8)
        ax.set_title(f"{t} Ma", color="white", fontsize=8)
        return

    patches_norm  = []
    patches_polar = []

    for feat in geojson.get("features", []):
        geom = feat.get("geometry", {})
        gtype = geom.get("type", "")
        rings = []
        if gtype == "Polygon":
            rings = [geom["coordinates"][0]]
        elif gtype == "MultiPolygon":
            rings = [p[0] for p in geom["coordinates"]]
        for ring in rings:
            if len(ring) < 3:
                continue
            arr = np.array(ring)[:, :2]
            poly = MplPoly(arr, closed=True)
            if is_polar_cap(ring):
                patches_polar.append(poly)
            else:
                patches_norm.append(poly)

    if patches_norm:
        ax.add_collection(PatchCollection(patches_norm,
            facecolor="#c8a97a", edgecolor="none", alpha=0.9))
    if patches_polar:
        ax.add_collection(PatchCollection(patches_polar,
            facecolor="#e05050", edgecolor="none", alpha=0.75))

    # Grid tipis
    for lat in range(-60, 90, 30):
        ax.axhline(lat, color="white", lw=0.2, alpha=0.15)
    for lon in range(-120, 180, 60):
        ax.axvline(lon, color="white", lw=0.2, alpha=0.15)

    polar_tag = " ●" if has_polar else ""
    ax.set_title(f"{t} Ma  |  {n_feat} feat{polar_tag}",
                 color="white", fontsize=7.5, pad=3)
    ax.tick_params(left=False, bottom=False,
                   labelleft=False, labelbottom=False)
    for sp in ax.spines.values():
        sp.set_edgecolor("#223344")


def build_contact_sheet(frames_meta):
    """Render 12 frame terpilih ke contact_sheet.png."""
    meta_by_time = {m["time_ma"]: m for m in frames_meta}

    ncols, nrows = 3, 4
    fig, axes = plt.subplots(
        nrows, ncols,
        figsize=(ncols * 5.5, nrows * 2.8),
        facecolor="#060f1a",
        gridspec_kw={"hspace": 0.35, "wspace": 0.06},
    )
    axes_flat = axes.flatten()

    for idx, t in enumerate(CONTACT_TIMES):
        ax   = axes_flat[idx]
        meta = meta_by_time.get(t)
        data = load_frame(t)
        n_feat    = meta["n_features"]   if meta else 0
        has_polar = meta["has_polar_cap"] if meta else False
        draw_equirect(ax, data, t, n_feat, has_polar)

    legend_handles = [
        mpatches.Patch(color="#c8a97a", label="Daratan"),
        mpatches.Patch(color="#e05050", label="Polar cap (lon-span > 300°)  ●"),
        mpatches.Patch(color="#0a1929", label="Laut"),
    ]
    fig.legend(handles=legend_handles, loc="lower center", ncol=3,
               fontsize=8.5, facecolor="#0f1f30", edgecolor="#334",
               labelcolor="white", framealpha=0.95,
               bbox_to_anchor=(0.5, 0.005))

    fig.suptitle(
        f"Contact Sheet — {MODEL}  |  public/data/frames/  (proyeksi ekuirectangular)\n"
        "12 frame terpilih · merah = polar cap",
        color="white", fontsize=11, y=0.995,
    )

    out_path = os.path.join(OUT_DIR, "contact_sheet.png")
    plt.savefig(out_path, dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    plt.close()
    return out_path


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    expected = expected_times()
    found    = sorted(
        int(f[:-5]) for f in os.listdir(FRAMES_DIR)
        if f.endswith(".json") and f[:-5].isdigit()
    )

    print(f"Model  : {MODEL}")
    print(f"Frame ditemukan : {len(found)}")
    print(f"Frame diharapkan: {len(expected)}")

    # ── Validasi interval ────────────────────────────────────────────────────
    missing, extra = validate_intervals(found, expected)
    print()
    if missing:
        print(f"[!] CELAH — frame hilang ({len(missing)}): {missing}")
    else:
        print("[OK] Tidak ada celah interval")
    if extra:
        print(f"[!] Frame ekstra tidak diharapkan ({len(extra)}): {extra}")
    else:
        print("[OK] Tidak ada frame ekstra")

    # ── Analisis tiap frame ──────────────────────────────────────────────────
    print(f"\nMemvalidasi {len(found)} frame ...")
    all_meta   = []
    all_errors = {}
    total_bytes = 0

    for t in found:
        info, errs = analyze_frame(t)
        if info:
            all_meta.append(info)
            total_bytes += info["size_bytes"]
        if errs:
            all_errors[t] = errs

    # ── Laporan validasi geometri ────────────────────────────────────────────
    n_polar      = sum(1 for m in all_meta if m["has_polar_cap"])
    n_geom_err   = len(all_errors)
    total_feat   = sum(m["n_features"] for m in all_meta)

    print(f"\n{'='*55}")
    print(f"  Total frame valid    : {len(all_meta)}")
    print(f"  Frame dg polar cap   : {n_polar}")
    print(f"  Frame dg geom error  : {n_geom_err}")
    print(f"  Total fitur (semua)  : {total_feat:,}")
    print(f"  Total ukuran         : {total_bytes:,} bytes  "
          f"({total_bytes/1024:.1f} KB  /  {total_bytes/1024/1024:.2f} MB)")
    print(f"  Rata-rata per frame  : {total_bytes/len(all_meta)/1024:.1f} KB")
    print(f"  Frame terbesar       : "
          f"{max(all_meta, key=lambda m: m['size_bytes'])['time_ma']} Ma  "
          f"({max(m['size_bytes'] for m in all_meta)/1024:.1f} KB)")
    print(f"  Frame terkecil       : "
          f"{min(all_meta, key=lambda m: m['size_bytes'])['time_ma']} Ma  "
          f"({min(m['size_bytes'] for m in all_meta)/1024:.1f} KB)")
    print(f"{'='*55}")

    if all_errors:
        print("\n[!] Error per frame:")
        for t, errs in sorted(all_errors.items()):
            print(f"    {t} Ma: {'; '.join(errs)}")

    # ── Tulis manifest.json ──────────────────────────────────────────────────
    manifest = {
        "model":        MODEL,
        "generated_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total_frames": len(all_meta),
        "total_bytes":  total_bytes,
        "intervals": [
            {"start_ma": 0,   "end_ma": 250,  "step_ma": 5},
            {"start_ma": 260, "end_ma": 1000, "step_ma": 10},
        ],
        "frames": sorted(all_meta, key=lambda m: m["time_ma"]),
    }

    with open(MANIFEST_OUT, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[OK] manifest.json ditulis -> {MANIFEST_OUT}")
    print(f"     ({os.path.getsize(MANIFEST_OUT)/1024:.1f} KB)")

    # ── Contact sheet ────────────────────────────────────────────────────────
    print(f"\nMembuat contact_sheet.png ({len(CONTACT_TIMES)} frame) ...")
    out_png = build_contact_sheet(all_meta)
    print(f"[OK] {out_png}")

    print("\nSelesai.")
    sys.exit(1 if all_errors or missing or extra else 0)
