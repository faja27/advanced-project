# Scripts — PlateauView

Script Python untuk pra-proses data rekonstruksi lempeng.

## Mengaktifkan Virtual Environment

Virtual environment berada di luar folder proyek (agar tidak disinkronkan OneDrive):

```powershell
# Windows PowerShell / Command Prompt
C:\venvs\plateauview\Scripts\activate
```

```bash
# Git Bash
source /c/venvs/plateauview/Scripts/activate
```

Setelah aktif, prompt berubah menjadi `(plateauview) ...`.

## Menonaktifkan

```
deactivate
```

## Memasang ulang paket (jika venv dibuat ulang)

```powershell
pip install -r requirements.txt
```

## Folder

| Folder | Isi |
| --- | --- |
| `_raw/` | Data mentah dari GPlates Web Service (di-gitignore) |
| `../public/data/frames/` | GeoJSON per frame waktu (output final, di-commit) |
