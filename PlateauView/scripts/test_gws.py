import requests
import json
import time
import os

BASE_URL = "https://gws.gplates.org/reconstruct/coastlines/"
OUT_DIR = os.path.join(os.path.dirname(__file__), "_raw", "test")
os.makedirs(OUT_DIR, exist_ok=True)

TESTS = [
    ("MULLER2019",  0),
    ("MULLER2019",  100),
    ("MULLER2019",  200),
    ("MERDITH2021", 0),
    ("MERDITH2021", 100),
    ("MERDITH2021", 200),
    ("MERDITH2021", 500),
    ("MERDITH2021", 900),
]

print(f"{'Model':<12} {'Time(Ma)':>8}  {'HTTP':>4}  {'ms':>6}  {'KB':>7}  {'Features':>8}  {'GeomTypes'}")
print("-" * 72)

for model, t in TESTS:
    url = f"{BASE_URL}?time={t}&model={model}"
    try:
        t0 = time.perf_counter()
        r = requests.get(url, timeout=60)
        elapsed_ms = int((time.perf_counter() - t0) * 1000)
        status = r.status_code

        if status == 200:
            data = r.json()
            features = data.get("features", [])
            n_feat = len(features)
            geom_types = set(
                f["geometry"]["type"] for f in features if f.get("geometry")
            )
            size_kb = round(len(r.content) / 1024, 1)

            fname = f"{model}_{t}Ma.json"
            fpath = os.path.join(OUT_DIR, fname)
            with open(fpath, "w", encoding="utf-8") as fh:
                json.dump(data, fh, separators=(",", ":"))

            print(f"{model:<12} {t:>8}  {status:>4}  {elapsed_ms:>6}  {size_kb:>7}  {n_feat:>8}  {', '.join(sorted(geom_types))}")
        else:
            print(f"{model:<12} {t:>8}  {status:>4}  {elapsed_ms:>6}  {'—':>7}  {'—':>8}  {r.text[:80]}")

    except Exception as e:
        print(f"{model:<12} {t:>8}  {'ERR':>4}  {'—':>6}  {'—':>7}  {'—':>8}  {e}")

print("\nFile tersimpan di:", OUT_DIR)
