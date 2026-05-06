# Spatiotemporal Clustering and LSTM-Based Seismic Gap Analysis along the Indonesian Subduction Zone (1950–2026)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![TensorFlow 2.x](https://img.shields.io/badge/TensorFlow-2.x-orange.svg)](https://www.tensorflow.org/)
[![Computers & Geosciences](https://img.shields.io/badge/Journal-Computers%20%26%20Geosciences-green.svg)](https://www.journals.elsevier.com/computers-and-geosciences)

Reproducibility repository for the paper:

> **Spatiotemporal Clustering and LSTM-Based Seismic Gap Analysis along the Indonesian Subduction Zone (1950–2026)**
> *Submitted to Computers & Geosciences (Elsevier, Q1)*

---

## Overview

This repository contains all code, pre-trained models, results, and figures required to reproduce the main findings of the paper. The study applies:

- **K-Means spatial clustering** to delineate five seismotectonic zones along the Indonesian subduction system
- **Spatiotemporal analysis** including b-value estimation, seasonal decomposition, and seismic gap identification
- **LSTM neural networks** trained per zone to forecast monthly seismicity rates (2026–2027)

The five zones identified are: Sumatera, Jawa–Bali–NTB, Sulawesi–NTT, Maluku, and Papua.

---

## Repository Structure

```
.
├── README.md                          # This file
├── LICENSE                            # MIT License
├── requirements.txt                   # Python dependencies
├── notebooks/
│   ├── 01_clustering.ipynb            # Spatial clustering (K-Means, elbow, silhouette)
│   ├── 02_spatio_temporal.ipynb       # Spatiotemporal analysis and seismic gap detection
│   ├── 03_lstm_modeling_v3.ipynb      # LSTM training, evaluation, and forecasting
│   └── 04_summary_jurnal.ipynb        # Summary figures and tables for the paper
├── scripts/
│   ├── download_earthquakes.py        # Download raw USGS earthquake data
│   └── preprocess_ml.py              # Data preprocessing pipeline
├── data/
│   ├── README_data.md                 # How to obtain the earthquake catalogue
│   ├── indonesia_earthquakes_final.csv  # Main processed dataset (M≥4.0, 1950–2026)
│   └── cluster_centroids.csv          # K-Means cluster centroid coordinates
├── models/
│   ├── lstm_Zona_Sumatera_v3.keras
│   ├── lstm_Zona_Jawa_Bali_NTB_v3.keras
│   ├── lstm_Zona_Sulawesi_NTT_v3.keras
│   ├── lstm_Zona_Maluku_v3.keras
│   └── lstm_Zona_Papua_v3.keras
├── figures/
│   ├── figure1_seismicity_map.png
│   ├── figure2_temporal_analysis.png
│   ├── figure2a_temporal_sumatera.png
│   ├── figure2b_temporal_jawa_bali_ntb.png
│   ├── figure2c_temporal_sulawesi_ntt.png
│   ├── figure2d_temporal_maluku.png
│   ├── figure2e_temporal_papua.png
│   ├── figure3_gutenberg_richter.png
│   ├── figure4_seismic_gap_map.png
│   ├── figure5_lstm_prediction.png
│   └── figure6_risk_map.png
├── tables/
│   ├── table1_dataset_summary.csv
│   ├── table2_clustering_results.csv
│   ├── table3_hazard_assessment.csv
│   └── table4_lstm_performance.csv
└── results/
    ├── spatio_temporal_summary.csv
    ├── seismic_gap_zones.csv
    ├── lstm_metrics_v3.csv
    ├── lstm_forecast_2026_2027_v3.csv
    └── predictions/
        ├── predictions_Zona_Sumatera_v3.csv
        ├── predictions_Zona_Jawa_Bali_NTB_v3.csv
        ├── predictions_Zona_Sulawesi_NTT_v3.csv
        ├── predictions_Zona_Maluku_v3.csv
        └── predictions_Zona_Papua_v3.csv
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/faja27/seismic-gap-indonesia.git
cd seismic-gap-indonesia
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> **Note on Cartopy:** Cartopy requires GEOS and PROJ system libraries. On Windows, the easiest install path is via conda:
> ```bash
> conda install -c conda-forge cartopy
> ```

### 4. Obtain the earthquake catalogue

See [`data/README_data.md`](data/README_data.md) for full instructions. The main processed dataset (`data/indonesia_earthquakes_final.csv`) is included in this repository. The raw source catalogue (88 AD–2024, ~40 MB) must be downloaded separately from Mendeley Data.

### 5. Run the notebooks in order

```bash
jupyter notebook
```

Execute the notebooks in sequence:

| Notebook | Description | Est. runtime |
|---|---|---|
| `01_clustering.ipynb` | Spatial clustering of seismotectonic zones | ~2 min |
| `02_spatio_temporal.ipynb` | Spatiotemporal analysis and gap detection | ~5 min |
| `03_lstm_modeling_v3.ipynb` | LSTM training (or load pre-trained models) | ~30 min (GPU) / ~2 h (CPU) |
| `04_summary_jurnal.ipynb` | Final figures and tables | ~3 min |

All notebooks use **relative paths** and will write outputs to the standard subdirectories (`figures/`, `tables/`, `results/`, `models/`). No path configuration is required.

---

## Data

See [`data/README_data.md`](data/README_data.md) for the full data provenance description.

**Main processed dataset** — `data/indonesia_earthquakes_final.csv`:
- **Period:** 1950–2026
- **Filter:** M ≥ 4.0, Indonesia region (lat −15° to 10°, lon 90° to 145°)
- **Events:** ~88,000 records
- **Columns:** `time`, `latitude`, `longitude`, `depth`, `mag`, `magType`, `source`, `zone`
- **Sources:** USGS ComCat (1950–1997, 2025–2026), Integrated Standardized Earthquake Catalogue of Indonesia (Masykuri et al., 2025)

---

## Pre-trained Models

Five LSTM models (one per seismotectonic zone) are provided in the `models/` directory. They can be loaded directly without retraining:

```python
import tensorflow as tf

model = tf.keras.models.load_model("models/lstm_Zona_Sumatera_v3.keras")
```

Each model was trained on monthly seismicity rate time series (1950–2024) and forecasts 2026–2027. Architecture: 2-layer stacked LSTM (64 units each) with dropout (0.2) and a Dense output layer. See `03_lstm_modeling_v3.ipynb` for full architecture details and hyperparameters.

---

## Computational Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Python | 3.9 | 3.11 |
| RAM | 8 GB | 16 GB |
| Storage | 500 MB | 1 GB |
| GPU | Not required | NVIDIA CUDA-compatible |
| LSTM training time | ~2 h (CPU) | ~30 min (GPU) |

All analyses were originally run on Windows 10, Intel Core i7, 16 GB RAM, without a dedicated GPU.

---

## Results Summary

| Zone | RMSE | MAE | R² | Seismic Gap |
|---|---|---|---|---|
| Sumatera | 17.60 | 16.16 | −1.52 | Yes |
| Jawa–Bali–NTB | 27.90 | 19.98 | 0.21 | Yes |
| Sulawesi–NTT | 14.22 | 9.65 | 0.08 | Partial |
| Maluku | 11.34 | 8.66 | −0.08 | No |
| Papua | 47.50 | 31.69 | −0.03 | Partial |

---

## Citation

If you use this code or data in your research, please cite:

```bibtex
@article{Farhan2026seismicgap,
  title   = {Spatiotemporal Clustering and LSTM-Based Seismic Gap Analysis
             along the Indonesian Subduction Zone (1950--2026)},
  author  = {Farhan, Mochammad and Tukiyat and Basir, Choirul},
  journal = {Computers \& Geosciences},
  year    = {2026},
  doi     = {[DOI upon acceptance]}
}
```

For the earthquake catalogue, please also cite:

```bibtex
@data{masykuri2025,
  author    = {Masykuri, Anas Fauzi and Suryanto, Wiwit and
               Irnaka, Theodosius Marwan and Pranata, Bayu},
  title     = {Dataset for the Integrated and Standardized Earthquake
               Catalogue of Indonesia (88 AD--2024)},
  year      = {2025},
  publisher = {Mendeley Data},
  version   = {V1},
  doi       = {10.17632/26zjrr4sgp.1}
}
```

---

## License

This code is released under the [MIT License](LICENSE).

The earthquake catalogue from Masykuri et al. (2025) is distributed separately under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
