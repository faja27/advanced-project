import json
import os
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Polygon as MplPolygon
from matplotlib.collections import PatchCollection
import numpy as np

RAW_DIR = os.path.join(os.path.dirname(__file__), "_raw", "test")
OUT_DIR = os.path.join(os.path.dirname(__file__), "_out")
os.makedirs(OUT_DIR, exist_ok=True)

TIMES = [0, 100, 200]
MODELS = ["MULLER2019", "MERDITH2021"]
COLORS = {"MULLER2019": "#e8a87c", "MERDITH2021": "#7cb8e8"}


def load_geojson(model, t):
    path = os.path.join(RAW_DIR, f"{model}_{t}Ma.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def collect_polygons(geojson):
    """Flatten all Polygon/MultiPolygon rings into list of numpy arrays."""
    rings = []
    for feat in geojson.get("features", []):
        geom = feat.get("geometry")
        if not geom:
            continue
        if geom["type"] == "Polygon":
            rings.append(np.array(geom["coordinates"][0]))
        elif geom["type"] == "MultiPolygon":
            for poly in geom["coordinates"]:
                rings.append(np.array(poly[0]))
    return rings


def draw_map(ax, rings, color, title):
    patches = []
    for ring in rings:
        if len(ring) < 3:
            continue
        patches.append(MplPolygon(ring[:, :2], closed=True))
    pc = PatchCollection(patches, facecolor=color, edgecolor="none", alpha=0.85)
    ax.add_collection(pc)
    ax.set_xlim(-180, 180)
    ax.set_ylim(-90, 90)
    ax.set_aspect("equal")
    ax.set_facecolor("#0d1b2a")
    ax.set_title(title, fontsize=9, color="white", pad=4)
    ax.tick_params(colors="gray", labelsize=6)
    for spine in ax.spines.values():
        spine.set_edgecolor("#333")


def feature_count(geojson):
    return len(geojson.get("features", []))


# ── Main figure: 3 rows × 2 cols ─────────────────────────────────────────────
fig, axes = plt.subplots(
    len(TIMES), len(MODELS),
    figsize=(12, 9),
    facecolor="#0a0a0a",
    gridspec_kw={"hspace": 0.35, "wspace": 0.08},
)

for row, t in enumerate(TIMES):
    for col, model in enumerate(MODELS):
        ax = axes[row][col]
        data = load_geojson(model, t)
        rings = collect_polygons(data)
        n = feature_count(data)
        label = f"{model}  |  {t} Ma  |  {n} features"
        draw_map(ax, rings, COLORS[model], label)

# Row labels
for row, t in enumerate(TIMES):
    axes[row][0].set_ylabel(f"{t} Ma", color="white", fontsize=10, labelpad=6)

# Legend
patches_leg = [
    mpatches.Patch(color=COLORS["MULLER2019"],  label="MULLER2019  (0–250 Ma)"),
    mpatches.Patch(color=COLORS["MERDITH2021"], label="MERDITH2021 (0–1000 Ma)"),
]
fig.legend(
    handles=patches_leg, loc="lower center", ncol=2,
    fontsize=9, facecolor="#1a1a1a", edgecolor="#444",
    labelcolor="white", framealpha=0.9,
    bbox_to_anchor=(0.5, 0.01),
)

fig.suptitle(
    "GPlates Web Service — MULLER2019 vs MERDITH2021\nPerbandingan garis pantai rekonstruksi",
    color="white", fontsize=12, y=0.98,
)

out_path = os.path.join(OUT_DIR, "compare.png")
plt.savefig(out_path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print(f"Saved: {out_path}")

# ── Tambahan: overlay 250 Ma untuk cek lompatan visual ───────────────────────
# Ambil live dari GWS untuk 250 Ma
import requests, time as _time

def fetch_live(model, t):
    url = f"https://gws.gplates.org/reconstruct/coastlines/?time={t}&model={model}"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()

print("Mengambil 250 Ma dari kedua model untuk cek lompatan ...")
t0 = _time.perf_counter()
data_m19_250  = fetch_live("MULLER2019",  250)
data_merd_250 = fetch_live("MERDITH2021", 250)
print(f"  selesai dalam {int((_time.perf_counter()-t0)*1000)} ms")

fig2, axes2 = plt.subplots(
    1, 3, figsize=(15, 4),
    facecolor="#0a0a0a",
    gridspec_kw={"wspace": 0.06},
)
fig2.suptitle(
    "Cek lompatan visual di 250 Ma\n"
    "Jika MULLER2019 dipakai s.d. 250 Ma dan MERDITH2021 mulai 250 Ma",
    color="white", fontsize=11, y=1.01,
)

panels = [
    (axes2[0], data_m19_250,  COLORS["MULLER2019"],  "MULLER2019 @ 250 Ma\n(batas atas model ini)"),
    (axes2[1], data_merd_250, COLORS["MERDITH2021"], "MERDITH2021 @ 250 Ma\n(akan dipakai mulai sini)"),
    (axes2[2], None, None, "Overlay keduanya @ 250 Ma"),
]

for ax, data, color, title in panels:
    if data is not None:
        draw_map(ax, collect_polygons(data), color, title)
    else:
        # overlay
        draw_map(ax, collect_polygons(data_m19_250),  COLORS["MULLER2019"],  title)
        rings_merd = collect_polygons(data_merd_250)
        patches = [MplPolygon(r[:, :2], closed=True) for r in rings_merd if len(r) >= 3]
        pc = PatchCollection(patches, facecolor=COLORS["MERDITH2021"],
                             edgecolor="none", alpha=0.5)
        ax.add_collection(pc)

patches_leg2 = [
    mpatches.Patch(color=COLORS["MULLER2019"],  label="MULLER2019",  alpha=0.85),
    mpatches.Patch(color=COLORS["MERDITH2021"], label="MERDITH2021", alpha=0.85),
]
fig2.legend(
    handles=patches_leg2, loc="lower center", ncol=2,
    fontsize=9, facecolor="#1a1a1a", edgecolor="#444",
    labelcolor="white", framealpha=0.9,
    bbox_to_anchor=(0.5, -0.08),
)

out_path2 = os.path.join(OUT_DIR, "compare_250Ma_jump.png")
plt.savefig(out_path2, dpi=150, bbox_inches="tight", facecolor=fig2.get_facecolor())
plt.close()
print(f"Saved: {out_path2}")
print("\nSelesai. File output:")
print(f"  {out_path}")
print(f"  {out_path2}")
