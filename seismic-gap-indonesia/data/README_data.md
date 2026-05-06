# Data Documentation

## Processed Dataset (Included)

**File:** `indonesia_earthquakes_final.csv` (≈8.7 MB)

This is the main earthquake catalogue used in all analyses. It has been filtered, merged, and standardized from the sources described below. It is safe to use directly without any additional downloads.

| Field | Description |
|---|---|
| `time` | Event origin time (UTC, ISO 8601) |
| `latitude` | Epicenter latitude (degrees, WGS84) |
| `longitude` | Epicenter longitude (degrees, WGS84) |
| `depth` | Focal depth (km) |
| `mag` | Preferred magnitude |
| `magType` | Magnitude scale (Mw, mb, ML, Ms, etc.) |
| `source` | Data origin (`USGS_historical`, `Mendeley_2025`, `USGS_recent`) |
| `zone` | Assigned seismotectonic zone (output of `01_clustering.ipynb`) |

**Filter criteria applied:**
- Region: Indonesia (lat −15° to 10°N, lon 90° to 145°E)
- Minimum magnitude: M ≥ 4.0
- Period: 1950–2026
- Depth: 0–800 km (full Wadati–Benioff zone)

---

## Source Catalogue (Must Download Separately)

The raw integrated catalogue covering 88 AD–2024 (~40 MB) is archived on **Mendeley Data** under CC BY 4.0 and must be downloaded separately.

### Download Instructions

1. Visit the dataset page:
   **DOI: [https://doi.org/10.17632/26zjrr4sgp.1](https://doi.org/10.17632/26zjrr4sgp.1)**

2. Download the file:
   `Integrated_Standardized_Earthquake_Catalogue_Indonesia_88AD_2024.csv`

3. Place the downloaded file in this `data/` directory:
   ```
   data/
   └── Integrated_Standardized_Earthquake_Catalogue_Indonesia_88AD_2024.csv
   ```

4. The download script can also retrieve USGS data automatically:
   ```bash
   python scripts/download_earthquakes.py
   ```

### Citation

If you use the source catalogue, please cite:

> Masykuri, Anas Fauzi; Suryanto, Wiwit; Irnaka, Theodosius Marwan; Pranata, Bayu (2025).
> "Dataset for the Integrated and Standardized Earthquake Catalogue of Indonesia (88 AD–2024)."
> *Mendeley Data*, V1. https://doi.org/10.17632/26zjrr4sgp.1

---

## Additional USGS Data (Downloaded Automatically)

Historical USGS data (1950–1997) and recent events (2025–2026) were obtained from the
[USGS Earthquake Catalog API](https://earthquake.usgs.gov/fdsnws/event/1/).
The script `scripts/download_earthquakes.py` retrieves this data automatically.

---

## Data Provenance Summary

| Source | Period | N events (approx.) | % of final dataset |
|---|---|---|---|
| USGS ComCat (historical) | 1950–1997 | ~19,000 | ~22% |
| Masykuri et al. (2025) | 1998–2024 | ~65,000 | ~75% |
| USGS ComCat (recent) | 2025–2026 | ~3,000 | ~3% |

Events from different sources were deduplicated using a 60-second / 0.5° spatial window.

---

## Magnitude of Completeness

Based on Gutenberg–Richter analysis (see `02_spatio_temporal.ipynb`):

| Period | Mc (estimated) |
|---|---|
| 1950–1969 | ~M 5.0 |
| 1970–1997 | ~M 4.5 |
| 1998–2026 | ~M 4.0 |

For LSTM training, all events M ≥ 4.0 were retained. Users performing b-value or
completeness-sensitive analyses should apply period-specific Mc filters.

---

## License

The processed file `indonesia_earthquakes_final.csv` is derived from:
- USGS data (public domain, US Government work)
- Masykuri et al. (2025) under CC BY 4.0

The derived dataset in this repository is therefore distributed under **CC BY 4.0**.
Please cite both the original sources and this repository if you use it.
