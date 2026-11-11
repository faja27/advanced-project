// src/timescale.js — pemetaan slider ↔ Ma dan utilitas format waktu.
//
// KONVENSI TANDA (berbeda dari deskripsi PRD §F2):
//   PRD menyebut slider dari "−4.600 Ma" (tertua) sampai "+250 Ma" (masa depan),
//   menggunakan tanda negatif untuk masa lalu.
//   Implementasi ini memilih KEBALIKAN supaya selaras dengan manifest.json dan
//   parameter URL ?t=200 yang sudah berjalan:
//     ma > 0  →  juta tahun LALU   (misal 200 = 200 Ma yang lalu)
//     ma = 0  →  masa kini
//     ma < 0  →  juta tahun KE DEPAN  (misal -100 = 100 juta tahun mendatang)
//   Slider p=0 = kiri (tertua, 4600 Ma lalu) ; p=1 = kanan (masa depan, -250).

// ---------------------------------------------------------------------------
// Konstanta segmen
// ---------------------------------------------------------------------------

/** Batas segmen dalam Ma (positif = lalu, negatif = depan). */
const SEG = Object.freeze({
  A_OLD:    4600,  // ujung kiri slider — bumi awal
  A_B:      1000,  // batas segmen A/B — awal rekonstruksi
  B_C:         0,  // batas segmen B/C — masa kini
  C_YOUNG:  -250,  // ujung kanan slider — proyeksi masa depan
});

/** Posisi slider (0–1) di setiap batas segmen. */
const P = Object.freeze({
  A0: 0.00,  // = SEG.A_OLD
  AB: 0.15,  // = SEG.A_B   (Segmen A: 15% lebar)
  BC: 0.85,  // = SEG.B_C   (Segmen B: 70% lebar; Segmen C: 15% lebar)
  C1: 1.00,  // = SEG.C_YOUNG
});

// ---------------------------------------------------------------------------
// Daftar frame dari manifest (dibangun sekali — 126 frame, cocok dengan
// manifest.json total_frames:126 dan intervalnya)
// ---------------------------------------------------------------------------
const MANIFEST_FRAMES = (() => {
  const f = [];
  for (let t = 0;   t <= 250;  t += 5)  f.push(t);  // 0, 5, …, 250  (51 frame)
  for (let t = 260; t <= 1000; t += 10) f.push(t);  // 260, 270, …, 1000 (75 frame)
  return f;
})();

// ---------------------------------------------------------------------------
// sliderToMa
// ---------------------------------------------------------------------------

/**
 * Konversi posisi slider (0–1) → waktu dalam Ma.
 *   p=0.00 → 4600 Ma lalu  (ujung kiri, tertua)
 *   p=0.15 → 1000 Ma lalu  (batas A/B)
 *   p=0.85 →    0           (masa kini, batas B/C)
 *   p=1.00 →  -250          (250 juta tahun ke depan)
 *
 * Nilai p di luar [0,1] diklem sebelum dihitung.
 *
 * @param {number} p
 * @returns {number} ma
 */
export function sliderToMa(p) {
  const pc = Math.max(P.A0, Math.min(P.C1, p));

  if (pc <= P.AB) {
    // Segmen A: 4600 → 1000 Ma
    const t = pc / (P.AB - P.A0);
    return SEG.A_OLD + t * (SEG.A_B - SEG.A_OLD);
  }
  if (pc <= P.BC) {
    // Segmen B: 1000 → 0 Ma
    const t = (pc - P.AB) / (P.BC - P.AB);
    return SEG.A_B + t * (SEG.B_C - SEG.A_B);
  }
  // Segmen C: 0 → -250
  const t = (pc - P.BC) / (P.C1 - P.BC);
  return SEG.B_C + t * (SEG.C_YOUNG - SEG.B_C);
}

// ---------------------------------------------------------------------------
// maToSlider
// ---------------------------------------------------------------------------

/**
 * Konversi waktu (Ma) → posisi slider (0–1).
 * Nilai ma di luar [SEG.C_YOUNG, SEG.A_OLD] diklem.
 *
 * @param {number} ma
 * @returns {number} p ∈ [0, 1]
 */
export function maToSlider(ma) {
  const mc = Math.max(SEG.C_YOUNG, Math.min(SEG.A_OLD, ma));

  if (mc >= SEG.A_B) {
    // Segmen A: 4600 → 1000 Ma  →  p 0.00 → 0.15
    const t = (SEG.A_OLD - mc) / (SEG.A_OLD - SEG.A_B);
    return P.A0 + t * (P.AB - P.A0);
  }
  if (mc >= SEG.B_C) {
    // Segmen B: 1000 → 0 Ma  →  p 0.15 → 0.85
    const t = (SEG.A_B - mc) / (SEG.A_B - SEG.B_C);
    return P.AB + t * (P.BC - P.AB);
  }
  // Segmen C: 0 → -250  →  p 0.85 → 1.00
  const t = (SEG.B_C - mc) / (SEG.B_C - SEG.C_YOUNG);
  return P.BC + t * (P.C1 - P.BC);
}

// ---------------------------------------------------------------------------
// segmentOf
// ---------------------------------------------------------------------------

/**
 * Kembalikan segmen yang mengandung nilai ma.
 *   'A' — bumi awal (ma > 1000)
 *   'B' — rekonstruksi (0 ≤ ma ≤ 1000)
 *   'C' — proyeksi masa depan (ma < 0)
 *
 * @param {number} ma
 * @returns {'A'|'B'|'C'}
 */
export function segmentOf(ma) {
  if (ma > SEG.A_B)  return 'A';
  if (ma >= SEG.B_C) return 'B';
  return 'C';
}

// ---------------------------------------------------------------------------
// formatMa
// ---------------------------------------------------------------------------

/**
 * Format waktu sebagai teks bahasa Indonesia.
 *
 *   0            → "Masa kini"
 *   1 – 999      → "200 juta tahun lalu"
 *   ≥ 1000       → "4,6 miliar tahun lalu"   (koma = pemisah desimal Indonesia)
 *   negatif      → "+100 juta tahun"
 *
 * @param {number} ma
 * @returns {string}
 */
export function formatMa(ma) {
  if (ma === 0) return 'Masa kini';

  if (ma < 0) {
    return `+${Math.round(-ma)} juta tahun`;
  }

  if (ma >= 1000) {
    // Tampilkan sebagai miliar dengan 1 desimal, koma sebagai pemisah (gaya ID)
    const bil = (ma / 1000).toFixed(1).replace('.', ',');
    return `${bil} miliar tahun lalu`;
  }

  return `${Math.round(ma)} juta tahun lalu`;
}

// ---------------------------------------------------------------------------
// nearestAvailableMa
// ---------------------------------------------------------------------------

/**
 * Kembalikan Ma terdekat yang memiliki frame di manifest.
 *
 *   Segmen A (ma > 1000) → 1000  (frame tertua manifest)
 *   Segmen C (ma < 0)    →    0  (frame masa kini)
 *   Segmen B (0 ≤ ma ≤ 1000) → frame paling dekat di MANIFEST_FRAMES.
 *     Interval manifest: 0–250 setiap 5 Ma, 260–1000 setiap 10 Ma.
 *     Gap 251–259 tidak ada frame; seri nilai tepat tengah (255) diselesaikan
 *     ke frame yang lebih awal (250) karena pencarian berhenti di nilai <.
 *
 * @param {number} ma
 * @returns {number}
 */
export function nearestAvailableMa(ma) {
  if (ma > SEG.A_B)  return SEG.A_B;   // 1000
  if (ma < SEG.B_C)  return SEG.B_C;   // 0

  let best     = MANIFEST_FRAMES[0];
  let bestDiff = Math.abs(best - ma);
  for (const f of MANIFEST_FRAMES) {
    const diff = Math.abs(f - ma);
    if (diff < bestDiff) { bestDiff = diff; best = f; }
  }
  return best;
}

// Re-ekspor konstanta yang berguna untuk Tahap 3 (slider, pita warna)
export { SEG, P, MANIFEST_FRAMES };
