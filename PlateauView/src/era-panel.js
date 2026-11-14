import { segmentOf } from './timescale.js';

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Find the active eon / era / period for a given ma.
 * Iterates youngest → oldest so that shared boundary values (e.g. 538.8 Ma)
 * are attributed to the younger unit (the one that starts there).
 */
function findActive(eons, ma) {
  for (let i = eons.length - 1; i >= 0; i--) {
    const eon = eons[i];
    if (ma < eon.end_ma || ma > eon.start_ma) continue;

    let era = null, period = null;
    if (eon.eras && eon.eras.length > 0) {
      for (let j = eon.eras.length - 1; j >= 0; j--) {
        const e = eon.eras[j];
        if (ma < e.end_ma || ma > e.start_ma) continue;
        era = e;
        if (e.periods && e.periods.length > 0) {
          for (let k = e.periods.length - 1; k >= 0; k--) {
            const p = e.periods[k];
            if (ma >= p.end_ma && ma <= p.start_ma) { period = p; break; }
          }
        }
        break;
      }
    }
    return { eon, era, period };
  }
  return { eon: null, era: null, period: null };
}

/**
 * Return supercontinents active at time ma.
 * Past supercontinents: show when ma is within [end_ma, start_ma].
 * Future / projection supercontinents: show whenever ma < 0 (segment C).
 */
function findSupercontinents(scs, ma) {
  return scs.filter(sc => {
    if (sc.projection) return ma < 0;
    if (sc.end_ma === null) return false;
    return ma <= sc.start_ma && ma >= sc.end_ma;
  });
}

function fmtSc(sc) {
  if (sc.projection) {
    return `${sc.name_id} (skenario, ~${Math.abs(sc.start_ma)} Ma ke depan)`;
  }
  const prefix = sc.approximate ? 'sekitar ' : '';
  let text = `${sc.name_id} (${prefix}${sc.start_ma}–${sc.end_ma} Ma lalu)`;
  if (sc.id === 'pannotia') text += ' — keberadaannya diperdebatkan';
  return text;
}

// ── Render ────────────────────────────────────────────────────────────────────

function render(panel, data, ma) {
  const seg = segmentOf(ma);
  const { eon, era, period } = findActive(data.eons, ma);
  const activeSCs = findSupercontinents(data.supercontinents, ma);

  const key = `${eon?.id}|${era?.id}|${period?.id}|${activeSCs.map(s => s.id).join(',')}|${seg}`;
  if (panel._renderKey === key) return;
  panel._renderKey = key;

  // Build hierarchy levels deepest-first so the last item is the most specific
  const levels = [];
  if (eon)    levels.push({ text: eon.name_id,    color: eon.color    });
  if (era)    levels.push({ text: era.name_id,    color: era.color    });
  if (period) levels.push({ text: period.name_id, color: period.color });

  const active      = period || era || eon;
  const accentColor = active ? active.color : '#3a3870';
  panel.style.setProperty('--accent', accentColor);

  let html = '';

  // ── Hierarchy breadcrumb ──
  if (levels.length > 0) {
    const parents = levels.slice(0, -1);
    const main    = levels[levels.length - 1];

    if (parents.length > 0) {
      html += `<div class="ep-parents">${parents.map(l => l.text).join(' › ')}</div>`;
    }

    html += `<div class="ep-main">`;
    html += `<span class="ep-dot" style="background:${main.color}"></span>`;
    html += `<span class="ep-main-text">${main.text}</span>`;
    html += `</div>`;
  } else {
    // Segment C with no matching ICS unit (ma < 0)
    html += '<div class="ep-parents">Masa Depan</div>';
    html += '<div class="ep-main"><span class="ep-dot" style="background:#3a3870"></span>';
    html +=   '<span class="ep-main-text">Proyeksi</span></div>';
  }

  // ── Supercontinents ──
  if (activeSCs.length > 0) {
    html += '<div class="ep-scs">';
    for (const sc of activeSCs) {
      html += `<div class="ep-sc" style="color:${sc.color}">◆ ${fmtSc(sc)}</div>`;
    }
    html += '</div>';
  }

  // ── Segment badge ──
  if (seg === 'A') {
    html += '<div class="ep-badge ep-badge-a">Ilustrasi — data belum tersedia</div>';
  } else if (seg === 'C') {
    html += '<div class="ep-badge ep-badge-c">Proyeksi — bukan data pasti</div>';
  }

  panel.innerHTML = html;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function initEraPanel(initialMa = 0) {
  const res  = await fetch('/data/eras.json');
  const data = await res.json();

  const panel = document.createElement('div');
  panel.id = 'era-panel';
  document.body.appendChild(panel);

  window.addEventListener('plateauview:timechange', e => {
    render(panel, data, e.detail.ma);
  });

  render(panel, data, initialMa);
}

// ── Boundary test helper (called from browser console for QA) ─────────────────
export function _testBoundaries(data) {
  const TEST = [538.8, 251.9, 201.4, 145, 66, 2.58, 0, 1000];
  const results = {};
  for (const ma of TEST) {
    const { eon, era, period } = findActive(data.eons, ma);
    const chain = [eon?.name_id, era?.name_id, period?.name_id]
      .filter(Boolean).join(' › ');
    results[`${ma} Ma`] = chain || '(tidak ditemukan)';
  }
  return results;
}
