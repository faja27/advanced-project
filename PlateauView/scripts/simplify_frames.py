"""
simplify_frames.py — Sederhanakan frame mentah → public/data/frames/.

Contoh:
  python simplify_frames.py --start 0 --end 50
  python simplify_frames.py --start 0 --end 1000 --tolerance 0.3 --min-area 0.5
"""

import argparse
import json
import os
import sys

from shapely.affinity import translate
from shapely.geometry import box, mapping, shape
from shapely.ops import unary_union
from shapely.validation import make_valid

RAW_DIR   = os.path.join(os.path.dirname(__file__), "_raw", "frames")
OUT_DIR   = os.path.join(os.path.dirname(__file__), "..", "public", "data", "frames")

TARGET_KB       = 100.0
DEFAULT_TOL     = 0.3
DEFAULT_MIN_AREA = 0.5          # derajat² (~50×50 km di ekuator)
TOL_STEPS       = [0.3, 0.5, 0.75, 1.0, 1.5, 2.0]
POLAR_LAT       = 80.0          # lintang batas polar cap


# ── Coordinate helpers ────────────────────────────────────────────────────────

def _normalize_ring(coords):
    """
    Unroll ring longitude agar tidak ada lompatan > 180° antar titik.
    Mengembalikan list (lon, lat) tanpa komponen Z.
    """
    if not coords:
        return []
    pts = [(float(c[0]), float(c[1])) for c in coords]
    out = [pts[0]]
    for lon, lat in pts[1:]:
        prev = out[-1][0]
        while lon - prev >  180: lon -= 360
        while prev - lon >  180: lon += 360
        out.append((lon, lat))
    return out


def _round_ring(coords, d=2):
    return [[round(c[0], d), round(c[1], d)] for c in coords]


def _preprocess_geom_dict(gd):
    """
    Normalisasi koordinat di dict GeoJSON sebelum dikonversi ke Shapely,
    agar Shapely tidak melihat lompatan koordinat besar di dalam satu ring.
    """
    t = gd.get("type", "")
    if t == "Polygon":
        return {"type": t,
                "coordinates": [_normalize_ring(r) for r in gd["coordinates"]]}
    if t == "MultiPolygon":
        return {"type": t,
                "coordinates": [[_normalize_ring(r) for r in poly]
                                 for poly in gd["coordinates"]]}
    return gd


# ── Antimeridian fix ──────────────────────────────────────────────────────────

def _split_poly_at_antimeridian(poly):
    """
    Setelah normalisasi ring, beberapa polygon akan memiliki koordinat di luar
    [-180, 180]. Fungsi ini memotongnya di garis ±180° dan mengembalikan
    fragmen dengan koordinat kembali di [-180, 180].
    """
    minx, _, maxx, _ = poly.bounds
    if minx >= -180 and maxx <= 180:
        return poly                      # tidak menyeberang antimeridian

    pieces = []
    if maxx > 180:
        left  = poly.intersection(box(-360, -90, 180,  90))
        right = poly.intersection(box( 180, -90, 540,  90))
        if not left.is_empty:
            pieces.append(left)
        if not right.is_empty:
            pieces.append(translate(right, xoff=-360))
    if minx < -180:
        right = poly.intersection(box(-180, -90, 360,  90))
        left  = poly.intersection(box(-540, -90, -180, 90))
        if not right.is_empty:
            pieces.append(right)
        if not left.is_empty:
            pieces.append(translate(left, xoff=360))

    if not pieces:
        return poly
    merged = unary_union(pieces)
    return make_valid(merged) if not merged.is_valid else merged


def fix_antimeridian(geom):
    """Terapkan _split_poly_at_antimeridian ke seluruh geometri (Polygon/MultiPolygon)."""
    if geom.is_empty:
        return geom
    if geom.geom_type == "MultiPolygon":
        fixed = [fix_antimeridian(p) for p in geom.geoms if not p.is_empty]
        return unary_union(fixed) if fixed else geom
    if geom.geom_type == "Polygon":
        return _split_poly_at_antimeridian(geom)
    # GeometryCollection / lainnya — iterasi
    parts = []
    for g in getattr(geom, "geoms", [geom]):
        if g.geom_type in ("Polygon", "MultiPolygon"):
            parts.append(fix_antimeridian(g))
    return unary_union(parts) if parts else geom


# ── Polar cap detection ───────────────────────────────────────────────────────

def _is_polar_cap(geom):
    """
    Deteksi polygon yang membentang > 300° bujur di lintang ekstrem (> POLAR_LAT).
    Polygon semacam ini bisa merepresentasikan "kebalikan" dari yang dimaksud
    dan merusak rendering di globe 3D.
    """
    minx, miny, maxx, maxy = geom.bounds
    lon_span = maxx - minx
    return lon_span > 300 and (maxy > POLAR_LAT or miny < -POLAR_LAT)


# ── Geometry → GeoJSON dict ───────────────────────────────────────────────────

def _round_mapping(mp, d=2):
    t = mp["type"]
    if t == "Polygon":
        return {"type": t,
                "coordinates": [_round_ring(r, d) for r in mp["coordinates"]]}
    if t == "MultiPolygon":
        return {"type": t,
                "coordinates": [[_round_ring(r, d) for r in poly]
                                 for poly in mp["coordinates"]]}
    return mp


def _to_feature(geom):
    return {"type": "Feature",
            "geometry": _round_mapping(mapping(geom)),
            "properties": {}}


# ── Core simplification ───────────────────────────────────────────────────────

def simplify_geoms(geoms, tolerance, min_area):
    """
    1. Union untuk menghilangkan batas internal
    2. Perbaiki geometri tidak valid
    3. Fix antimeridian
    4. Sederhanakan
    5. Pecah jadi Polygon individual
    6. Buang terlalu kecil & polar cap
    Kembalikan (list_polygon, list_polar_cap_bounds).
    """
    merged = unary_union(geoms)
    if not merged.is_valid:
        merged = make_valid(merged)

    merged = fix_antimeridian(merged)
    if not merged.is_valid:
        merged = make_valid(merged)

    simplified = merged.simplify(tolerance, preserve_topology=True)
    if not simplified.is_valid:
        simplified = make_valid(simplified)

    # Pecah ke Polygon tunggal
    if simplified.geom_type == "Polygon":
        raw_polys = [simplified]
    elif simplified.geom_type == "MultiPolygon":
        raw_polys = list(simplified.geoms)
    else:
        raw_polys = [g for g in getattr(simplified, "geoms", [simplified])
                     if g.geom_type in ("Polygon", "MultiPolygon")]

    result, polar_caps = [], []
    for p in raw_polys:
        subs = list(p.geoms) if p.geom_type == "MultiPolygon" else [p]
        for s in subs:
            if s.is_empty or s.area < min_area:
                continue
            if _is_polar_cap(s):
                polar_caps.append(s.bounds)
                # Simpan tetap tapi tandai — globe 3D biasanya masih OK
                result.append(s)
                continue
            result.append(s)

    return result, polar_caps


# ── Per-frame processing ──────────────────────────────────────────────────────

def process_frame(t, out_dir, tolerance, min_area):
    """
    Baca _raw/frames/{t}.json, proses, tulis output.
    Jika hasil > TARGET_KB, coba tolerance lebih besar secara otomatis.
    Kembalikan dict info.
    """
    raw_path = os.path.join(RAW_DIR, f"{t}.json")
    if not os.path.exists(raw_path):
        return {"time": t, "status": "NO_INPUT"}

    with open(raw_path, encoding="utf-8") as f:
        data = json.load(f)

    # Kumpulkan & normalisasi geometri
    geoms = []
    for feat in data.get("features", []):
        gd = feat.get("geometry")
        if not gd:
            continue
        try:
            g = shape(_preprocess_geom_dict(gd))
            if not g.is_valid:
                g = make_valid(g)
            if not g.is_empty:
                geoms.append(g)
        except Exception:
            continue

    if not geoms:
        return {"time": t, "status": "EMPTY", "n_in": 0}

    n_in = len(geoms)
    out_path = os.path.join(out_dir, f"{t}.json")

    # Coba tolerance dari kecil ke besar sampai ukuran < TARGET_KB
    tols_to_try = sorted(set([tolerance] + [s for s in TOL_STEPS if s >= tolerance]))
    final_tol   = tolerance
    text        = ""
    polys       = []
    polar_caps  = []

    for tol in tols_to_try:
        polys, polar_caps = simplify_geoms(geoms, tol, min_area)
        features = [_to_feature(p) for p in polys]
        result   = {"type": "FeatureCollection", "features": features}
        text     = json.dumps(result, separators=(",", ":"))
        size_kb  = len(text.encode("utf-8")) / 1024
        final_tol = tol
        if size_kb <= TARGET_KB:
            break

    os.makedirs(out_dir, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)

    return {
        "time":       t,
        "status":     "OK",
        "n_in":       n_in,
        "n_out":      len(polys),
        "size_kb":    len(text.encode("utf-8")) / 1024,
        "tolerance":  final_tol,
        "polar_caps": len(polar_caps),
        "tol_bumped": final_tol > tolerance,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--start",     type=int,   default=0)
    p.add_argument("--end",       type=int,   default=1000)
    p.add_argument("--tolerance", type=float, default=DEFAULT_TOL,
                   help=f"Toleransi awal simplifikasi dalam derajat (default {DEFAULT_TOL})")
    p.add_argument("--min-area",  type=float, default=DEFAULT_MIN_AREA,
                   help=f"Luas minimum poligon dalam derajat² (default {DEFAULT_MIN_AREA})")
    p.add_argument("--out",       default=OUT_DIR)
    return p.parse_args()


def collect_times(start, end):
    """Temukan file yang ada di _raw/frames/ dalam rentang [start, end]."""
    times = []
    for fname in sorted(os.listdir(RAW_DIR), key=lambda x: int(x.replace(".json","")) if x.endswith(".json") and x[:-5].isdigit() else -1):
        if not fname.endswith(".json"):
            continue
        try:
            t = int(fname[:-5])
        except ValueError:
            continue
        if start <= t <= end:
            times.append(t)
    return times


if __name__ == "__main__":
    args = parse_args()

    times = collect_times(args.start, args.end)
    if not times:
        print(f"Tidak ada file input di {RAW_DIR} untuk rentang {args.start}–{args.end} Ma.")
        sys.exit(1)

    print(f"\nSimplifikasi  : {args.start}–{args.end} Ma ({len(times)} frame)")
    print(f"Tolerance     : {args.tolerance}°")
    print(f"Min-area      : {args.min_area} deg²")
    print(f"Output        : {args.out}")
    print(f"Target        : < {TARGET_KB} KB / frame")
    print()

    # Header tabel
    hdr = f"{'Ma':>5}  {'Raw KB':>7}  {'Out KB':>7}  {'Feat in':>7}  {'Feat out':>8}  {'Tol':>5}  {'Polar':>5}  Status"
    print(hdr)
    print("-" * len(hdr))

    over_target = []
    errors      = []

    for t in times:
        raw_path = os.path.join(RAW_DIR, f"{t}.json")
        raw_kb   = os.path.getsize(raw_path) / 1024 if os.path.exists(raw_path) else 0

        info = process_frame(t, args.out, args.tolerance, getattr(args, "min_area"))

        if info["status"] == "NO_INPUT":
            print(f"{t:>5}  {'—':>7}  {'—':>7}  {'—':>7}  {'—':>8}  {'—':>5}  {'—':>5}  NO_INPUT")
            errors.append(t)
            continue
        if info["status"] == "EMPTY":
            print(f"{t:>5}  {raw_kb:>7.1f}  {'—':>7}  {'0':>7}  {'—':>8}  {'—':>5}  {'—':>5}  EMPTY")
            errors.append(t)
            continue

        tol_tag   = f"{info['tolerance']:.2f}" + ("*" if info["tol_bumped"] else "")
        over_flag = " >" if info["size_kb"] > TARGET_KB else "  "
        polar_tag = str(info["polar_caps"]) if info["polar_caps"] else "—"

        print(
            f"{t:>5}  {raw_kb:>7.1f}  {info['size_kb']:>7.1f}  "
            f"{info['n_in']:>7}  {info['n_out']:>8}  {tol_tag:>5}  "
            f"{polar_tag:>5} {over_flag}"
        )

        if info["size_kb"] > TARGET_KB:
            over_target.append((t, info["size_kb"], info["tolerance"]))

    print("-" * len(hdr))
    print(f"\nSelesai: {len(times)} frame diproses, {len(errors)} error.")

    if over_target:
        print(f"\n[!] {len(over_target)} frame masih > {TARGET_KB} KB setelah tolerance maksimum {TOL_STEPS[-1]}°:")
        for t, kb, tol in over_target:
            print(f"    {t} Ma → {kb:.1f} KB (tol={tol})")
        print("    Pertimbangkan menaikkan --min-area atau memotong jumlah feature secara manual.")
    else:
        print(f"    Semua frame di bawah {TARGET_KB} KB.")
