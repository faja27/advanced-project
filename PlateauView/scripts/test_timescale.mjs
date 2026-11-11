// scripts/test_timescale.mjs — tes unit untuk src/timescale.js
// Jalankan: node scripts/test_timescale.mjs

import {
  sliderToMa, maToSlider, segmentOf, formatMa, nearestAvailableMa,
  MANIFEST_FRAMES,
} from '../src/timescale.js';

let pass = 0, fail = 0;

function check(label, actual, expected, tol = 1e-9) {
  const ok = typeof expected === 'string'
    ? actual === expected
    : Math.abs(actual - expected) <= tol;
  if (ok) {
    console.log(`  ✓  ${label}`);
    pass++;
  } else {
    console.error(`  ✗  ${label}`);
    console.error(`       got      : ${JSON.stringify(actual)}`);
    console.error(`       expected : ${JSON.stringify(expected)}`);
    fail++;
  }
}

// ---------------------------------------------------------------------------
// 1. Batas segmen (nilai tepat di ujung)
// ---------------------------------------------------------------------------
console.log('\n── 1. Batas segmen: sliderToMa ──────────────────────────');
check('sliderToMa(0.00) = 4600', sliderToMa(0.00), 4600);
check('sliderToMa(0.15) = 1000', sliderToMa(0.15), 1000);
check('sliderToMa(0.85) =    0', sliderToMa(0.85), 0);
check('sliderToMa(1.00) = -250', sliderToMa(1.00), -250);

console.log('\n── 2. Batas segmen: maToSlider ──────────────────────────');
check('maToSlider(4600) = 0.00', maToSlider(4600), 0.00);
check('maToSlider(1000) = 0.15', maToSlider(1000), 0.15);
check('maToSlider(   0) = 0.85', maToSlider(0),    0.85);
check('maToSlider(-250) = 1.00', maToSlider(-250), 1.00);

// ---------------------------------------------------------------------------
// 2. Titik tengah tiap segmen
// ---------------------------------------------------------------------------
console.log('\n── 3. Titik tengah segmen ───────────────────────────────');
// Seg A tengah: p=0.075 → ma=(4600+1000)/2=2800
check('sliderToMa(0.075) = 2800', sliderToMa(0.075), 2800);
check('maToSlider(2800)  = 0.075', maToSlider(2800), 0.075);
// Seg B tengah: p=0.50 → ma=(1000+0)/2=500
check('sliderToMa(0.50)  =  500', sliderToMa(0.50),  500);
check('maToSlider(500)   =  0.50', maToSlider(500),  0.50);
// Seg C tengah: p=0.925 → ma=(0+(-250))/2=-125
check('sliderToMa(0.925) = -125', sliderToMa(0.925), -125);
check('maToSlider(-125)  = 0.925', maToSlider(-125), 0.925);

// ---------------------------------------------------------------------------
// 3. Bolak-balik sliderToMa → maToSlider
// ---------------------------------------------------------------------------
console.log('\n── 4. Bolak-balik ma → slider → ma ─────────────────────');
const roundtripMa = [4600, 3000, 1001, 1000, 500, 200, 50, 1, 0, -1, -100, -250];
for (const ma of roundtripMa) {
  const p  = maToSlider(ma);
  const rt = sliderToMa(p);
  check(`roundtrip(${String(ma).padStart(5)})`, rt, ma, 1e-9);
}

// ---------------------------------------------------------------------------
// 4. Bolak-balik sliderToMa → maToSlider
// ---------------------------------------------------------------------------
console.log('\n── 5. Bolak-balik p → ma → p ───────────────────────────');
const roundtripP = [0.00, 0.075, 0.15, 0.30, 0.50, 0.70, 0.85, 0.925, 1.00];
for (const p of roundtripP) {
  const ma = sliderToMa(p);
  const rt = maToSlider(ma);
  check(`roundtrip(p=${p})`, rt, p, 1e-12);
}

// ---------------------------------------------------------------------------
// 5. segmentOf
// ---------------------------------------------------------------------------
console.log('\n── 6. segmentOf ─────────────────────────────────────────');
check("segmentOf(4600) = 'A'", segmentOf(4600), 'A');
check("segmentOf(1001) = 'A'", segmentOf(1001), 'A');
check("segmentOf(1000) = 'B'", segmentOf(1000), 'B'); // batas → B
check("segmentOf( 500) = 'B'", segmentOf(500),  'B');
check("segmentOf(   1) = 'B'", segmentOf(1),    'B');
check("segmentOf(   0) = 'B'", segmentOf(0),    'B'); // batas → B
check("segmentOf(  -1) = 'C'", segmentOf(-1),   'C');
check("segmentOf(-250) = 'C'", segmentOf(-250), 'C');

// ---------------------------------------------------------------------------
// 6. formatMa
// ---------------------------------------------------------------------------
console.log('\n── 7. formatMa ──────────────────────────────────────────');
check('formatMa(0)',    formatMa(0),    'Masa kini');
check('formatMa(1)',    formatMa(1),    '1 juta tahun lalu');
check('formatMa(200)',  formatMa(200),  '200 juta tahun lalu');
check('formatMa(999)',  formatMa(999),  '999 juta tahun lalu');
check('formatMa(1000)', formatMa(1000), '1,0 miliar tahun lalu');
check('formatMa(1500)', formatMa(1500), '1,5 miliar tahun lalu');
check('formatMa(2500)', formatMa(2500), '2,5 miliar tahun lalu');
check('formatMa(4600)', formatMa(4600), '4,6 miliar tahun lalu');
check('formatMa(-1)',   formatMa(-1),   '+1 juta tahun');
check('formatMa(-100)', formatMa(-100), '+100 juta tahun');
check('formatMa(-250)', formatMa(-250), '+250 juta tahun');

// ---------------------------------------------------------------------------
// 7. nearestAvailableMa
// ---------------------------------------------------------------------------
console.log('\n── 8. nearestAvailableMa ────────────────────────────────');

// Segmen A → klem ke 1000
check('near(4600) → 1000', nearestAvailableMa(4600), 1000);
check('near(1500) → 1000', nearestAvailableMa(1500), 1000);
check('near(1001) → 1000', nearestAvailableMa(1001), 1000);

// Tepat di batas A/B → cari di manifest (ada frame 1000)
check('near(1000) → 1000', nearestAvailableMa(1000), 1000);

// Dalam segmen B — pengecekan step-5 (0–250)
check('near(  0) →   0', nearestAvailableMa(0),   0);
check('near(  7) →   5', nearestAvailableMa(7),   5);  // 5 lebih dekat dari 10
check('near(  8) →  10', nearestAvailableMa(8),  10);  // 10 lebih dekat dari 5
check('near(100) → 100', nearestAvailableMa(100), 100); // tepat
// Interval kedua adalah step-10 (260,270,…,500,510,…). Tidak ada frame di 505.
check('near(502) → 500', nearestAvailableMa(502), 500); // 500(diff=2) vs 510(diff=8)
check('near(503) → 500', nearestAvailableMa(503), 500); // 500(diff=3) vs 510(diff=7)
check('near(507) → 510', nearestAvailableMa(507), 510); // 510(diff=3) vs 500(diff=7)
check('near(250) → 250', nearestAvailableMa(250), 250); // tepat, ujung interval 1

// Gap 251–259 (tidak ada frame di sana)
check('near(254) → 250', nearestAvailableMa(254), 250); // 250 (diff=4) vs 260 (diff=6)
check('near(257) → 260', nearestAvailableMa(257), 260); // 260 (diff=3) vs 250 (diff=7)
check('near(260) → 260', nearestAvailableMa(260), 260); // tepat, awal interval 2

// Dalam segmen B — step-10 (260–1000)
check('near(993) → 990', nearestAvailableMa(993), 990); // 990 (diff=3) vs 1000 (diff=7)
check('near(997) → 1000', nearestAvailableMa(997), 1000);// 1000(diff=3) vs 990(diff=7)
check('near(1000)→ 1000', nearestAvailableMa(1000), 1000); // tepat

// Segmen C → klem ke 0
check('near(  -1) → 0', nearestAvailableMa(-1),   0);
check('near(-100) → 0', nearestAvailableMa(-100), 0);
check('near(-250) → 0', nearestAvailableMa(-250), 0);

// ---------------------------------------------------------------------------
// 8. Jumlah frame manifest
// ---------------------------------------------------------------------------
console.log('\n── 9. Jumlah frame MANIFEST_FRAMES ─────────────────────');
check('MANIFEST_FRAMES.length = 126', MANIFEST_FRAMES.length, 126);
check('MANIFEST_FRAMES[0]     =   0', MANIFEST_FRAMES[0],       0);
check('MANIFEST_FRAMES[50]    = 250', MANIFEST_FRAMES[50],    250);
check('MANIFEST_FRAMES[51]    = 260', MANIFEST_FRAMES[51],    260);
check('MANIFEST_FRAMES[125]   = 1000', MANIFEST_FRAMES[125], 1000);

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------
const total = pass + fail;
console.log(`\n${'─'.repeat(52)}`);
console.log(`Hasil: ${pass}/${total} lulus${fail > 0 ? `, ${fail} GAGAL` : ' ✓'}`);
if (fail > 0) process.exit(1);
