"""
polar_check.py — Render beberapa frame dalam proyeksi ortografik kutub.
"""

import json
import os
import sys
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

FRAMES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data", "frames")
OUT_DIR    = os.path.join(os.path.dirname(__file__), "_out")
os.makedirs(OUT_DIR, exist_ok=True)

TIMES   = [100, 200, 500]
POLES   = [("N", 90, 0), ("S", -90, 0)]   # label, center_lat, center_lon
BG      = "#0d1b2a"
LAND    = "#c8a97a"
OCEAN   = "#0a2240"
POLAR_LAT = 80.0

# ── Helpers ──────────────────────────────────────────────────────────────────

def load_frame(t):
    path = os.path.join(FRAMES_DIR, f"{t}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def to_rad(deg):
    return deg * np.pi / 180


def orthographic_project(lon_deg, lat_deg, center_lat, center_lon):
    """
    Proyeksi ortografik: (lon, lat) → (x, y) dari sudut pandang center.
    Titik yang berada di sisi belakang dikembalikan sebagai NaN.
    """
    lon  = to_rad(lon_deg)
    lat  = to_rad(lat_deg)
    lon0 = to_rad(center_lon)
    lat0 = to_rad(center_lat)

    cos_c = (np.sin(lat0) * np.sin(lat) +
             np.cos(lat0) * np.cos(lat) * np.cos(lon - lon0))
    # Sembunyikan titik di sisi belakang (cos_c < 0)
    visible = cos_c >= 0

    x = np.cos(lat) * np.sin(lon - lon0)
    y = (np.cos(lat0) * np.sin(lat) -
         np.sin(lat0) * np.cos(lat) * np.cos(lon - lon0))

    x = np.where(visible, x, np.nan)
    y = np.where(visible, y, np.nan)
    return x, y


def project_ring(coords, center_lat, center_lon):
    """Proyeksikan satu ring koordinat."""
    if len(coords) < 3:
        return None, None
    lons = np.array([c[0] for c in coords])
    lats = np.array([c[1] for c in coords])
    x, y = orthographic_project(lons, lats, center_lat, center_lon)
    return x, y


def is_polar_cap(coords, polar_lat=POLAR_LAT):
    """Deteksi polar cap: lon span > 300° di lintang ekstrem."""
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    lon_span = max(lons) - min(lons)
    return lon_span > 300 and (max(lats) > polar_lat or min(lats) < -polar_lat)


def draw_globe(ax, geojson, center_lat, center_lon, title):
    """Render satu globe ortografik."""
    # Latar laut
    theta = np.linspace(0, 2 * np.pi, 360)
    ax.fill(np.cos(theta), np.sin(theta), color=OCEAN, zorder=0)
    ax.plot(np.cos(theta), np.sin(theta), color="#1a3a5c", lw=0.5, zorder=1)

    n_polar = 0
    n_normal = 0

    for feat in geojson.get("features", []):
        geom = feat.get("geometry", {})
        gtype = geom.get("type", "")

        rings = []
        if gtype == "Polygon":
            rings = [geom["coordinates"][0]]      # hanya exterior
        elif gtype == "MultiPolygon":
            rings = [poly[0] for poly in geom["coordinates"]]

        for ring in rings:
            if is_polar_cap(ring):
                n_polar += 1
                # Gambar polar cap dengan warna berbeda untuk inspeksi
                x, y = project_ring(ring, center_lat, center_lon)
                if x is None or np.all(np.isnan(x)):
                    continue
                valid = ~np.isnan(x)
                if valid.sum() < 3:
                    continue
                ax.fill(x[valid], y[valid], color="#e05050", alpha=0.7, zorder=3)
                ax.plot(x[valid], y[valid], color="#ff8080", lw=0.4, zorder=4)
            else:
                n_normal += 1
                x, y = project_ring(ring, center_lat, center_lon)
                if x is None or np.all(np.isnan(x)):
                    continue
                valid = ~np.isnan(x)
                if valid.sum() < 3:
                    continue
                ax.fill(x[valid], y[valid], color=LAND, alpha=0.9, zorder=2)
                ax.plot(x[valid], y[valid], color="#8b7355", lw=0.2, zorder=2)

    # Grid garis lintang
    for lat_grid in range(-80, 90, 20):
        lons_g = np.linspace(-180, 180, 361)
        xg, yg = orthographic_project(lons_g, np.full_like(lons_g, lat_grid),
                                      center_lat, center_lon)
        m = ~np.isnan(xg)
        if m.sum() > 1:
            ax.plot(xg[m], yg[m], color="#ffffff", lw=0.2, alpha=0.2, zorder=5)

    ax.set_xlim(-1.05, 1.05)
    ax.set_ylim(-1.05, 1.05)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_facecolor(BG)

    n_total = n_normal + n_polar
    polar_note = f"  [{n_polar} polar cap — merah]" if n_polar else ""
    ax.set_title(f"{title}\n{n_total} polygon{polar_note}",
                 color="white", fontsize=8, pad=4)

    return n_polar


# ── Main ─────────────────────────────────────────────────────────────────────

n_rows = len(TIMES)
n_cols = len(POLES)

fig, axes = plt.subplots(
    n_rows, n_cols,
    figsize=(n_cols * 4.5, n_rows * 4.5),
    facecolor="#080808",
    gridspec_kw={"hspace": 0.25, "wspace": 0.08},
)

polar_summary = {}

for row, t in enumerate(TIMES):
    data = load_frame(t)
    if data is None:
        print(f"  [!] Frame {t} Ma tidak ditemukan di {FRAMES_DIR}")
        continue

    for col, (pole_label, clat, clon) in enumerate(POLES):
        ax = axes[row][col]
        title = f"{t} Ma — Kutub {'Utara' if pole_label=='N' else 'Selatan'}"
        n_p = draw_globe(ax, data, clat, clon, title)
        polar_summary[(t, pole_label)] = n_p

legend_handles = [
    mpatches.Patch(color=LAND,    label="Daratan (normal)"),
    mpatches.Patch(color="#e05050", label="Polar cap (lon-span > 300°)"),
    mpatches.Patch(color=OCEAN,   label="Laut"),
]
fig.legend(handles=legend_handles, loc="lower center", ncol=3,
           fontsize=9, facecolor="#1a1a1a", edgecolor="#444",
           labelcolor="white", framealpha=0.9,
           bbox_to_anchor=(0.5, 0.01))

fig.suptitle(
    "Polar Check — public/data/frames/ (setelah simplifikasi)\n"
    "Proyeksi ortografik kutub utara (kiri) & selatan (kanan) | merah = polar cap",
    color="white", fontsize=11, y=0.99,
)

out_path = os.path.join(OUT_DIR, "polar_check.png")
plt.savefig(out_path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print(f"Saved: {out_path}")

print("\nRingkasan polar cap per frame:")
for (t, pole), n in sorted(polar_summary.items()):
    print(f"  {t} Ma / Kutub {pole}: {n} polar cap")
