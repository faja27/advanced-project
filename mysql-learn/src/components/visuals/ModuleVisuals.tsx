import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Module 1: DB Architecture Diagram ─── */
export function VisualDBArchitecture() {
  const steps = ['Client / Aplikasi', 'SQL Query', 'MySQL Server', 'Query Optimizer', 'Storage Engine (InnoDB)', 'Disk / Data Files'];
  const [active, setActive] = useState(-1);

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-4 font-syne" style={{ color: '#58a6ff' }}>Arsitektur MySQL — Klik tiap langkah</h3>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <motion.div key={i} onClick={() => setActive(i === active ? -1 : i)} className="cursor-pointer">
            <motion.div
              className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all"
              animate={{ borderColor: active === i ? '#58a6ff' : '#30363d', background: active === i ? '#58a6ff15' : '#0d1117' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#58a6ff20', color: '#58a6ff' }}>{i + 1}</div>
              <span className="text-sm font-mono" style={{ color: active === i ? '#58a6ff' : '#e6edf3' }}>{step}</span>
              {i < steps.length - 1 && <span className="ml-auto text-xs" style={{ color: '#30363d' }}>▼</span>}
            </motion.div>
          </motion.div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: '#8b949e' }}>Klik setiap lapisan untuk melihat penjelasannya</p>
    </div>
  );
}

/* ─── Module 2: Data Type Comparison ─── */
export function VisualDataTypes() {
  const types = [
    { name: 'TINYINT', bytes: 1, range: '-128 ~ 127', color: '#3fb950' },
    { name: 'SMALLINT', bytes: 2, range: '-32K ~ 32K', color: '#58a6ff' },
    { name: 'INT', bytes: 4, range: '-2.1B ~ 2.1B', color: '#bc8cff' },
    { name: 'BIGINT', bytes: 8, range: '±9.2 × 10¹⁸', color: '#e3b341' },
    { name: 'FLOAT', bytes: 4, range: 'Presisi ~7 digit', color: '#f78166' },
    { name: 'DOUBLE', bytes: 8, range: 'Presisi ~15 digit', color: '#79c0ff' },
  ];
  const max = 8;

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-4 font-syne" style={{ color: '#e3b341' }}>Perbandingan Ukuran Tipe Numerik</h3>
      <div className="space-y-3">
        {types.map((t) => (
          <div key={t.name} className="flex items-center gap-3">
            <div className="w-20 text-xs font-mono font-bold" style={{ color: t.color }}>{t.name}</div>
            <div className="flex-1 relative h-6 rounded" style={{ background: '#21262d' }}>
              <motion.div
                className="h-full rounded flex items-center px-2"
                style={{ background: t.color + '40', width: `${(t.bytes / max) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(t.bytes / max) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="text-xs font-mono" style={{ color: t.color }}>{t.bytes}B</span>
              </motion.div>
            </div>
            <div className="text-xs w-32" style={{ color: '#8b949e' }}>{t.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Module 3: Build Table Animation ─── */
export function VisualBuildTable() {
  const [columns, setColumns] = useState<string[]>([]);
  const allCols = ['id INT AUTO_INCREMENT PK', 'nama VARCHAR(200) NOT NULL', 'harga DECIMAL(10,2)', 'stok INT DEFAULT 0', 'dibuat TIMESTAMP'];

  const addCol = () => {
    if (columns.length < allCols.length) setColumns(allCols.slice(0, columns.length + 1));
  };
  const reset = () => setColumns([]);

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-4 font-syne" style={{ color: '#3fb950' }}>Membangun Tabel — Klik untuk tambah kolom</h3>
      <div className="font-mono text-xs mb-4" style={{ color: '#8b949e' }}>
        <span style={{ color: '#ff7b72' }}>CREATE TABLE</span> <span style={{ color: '#e6edf3' }}>produk</span> <span style={{ color: '#e6edf3' }}>(</span>
        <AnimatePresence>
          {columns.map((col, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-4" style={{ color: '#3fb950' }}>
              {col}{i < columns.length - 1 ? ',' : ''}
            </motion.div>
          ))}
        </AnimatePresence>
        <span style={{ color: '#e6edf3' }}>);</span>
      </div>
      <div className="flex gap-2">
        <button onClick={addCol} disabled={columns.length >= allCols.length} className="px-4 py-2 rounded text-xs font-bold" style={{ background: '#1f4c2e', color: '#3fb950' }}>
          + Tambah Kolom
        </button>
        <button onClick={reset} className="px-4 py-2 rounded text-xs border" style={{ color: '#8b949e', borderColor: '#30363d' }}>Reset</button>
      </div>
    </div>
  );
}

/* ─── Module 4: DML Table Visualizer ─── */
export function VisualDMLTable() {
  const [rows, setRows] = useState([
    { id: 1, nama: 'Laptop', harga: 8500000 },
    { id: 2, nama: 'Mouse', harga: 150000 },
    { id: 3, nama: 'Keyboard', harga: 450000 },
  ]);
  const [msg, setMsg] = useState('');

  const insert = () => {
    const id = Math.max(...rows.map((r) => r.id)) + 1;
    setRows([...rows, { id, nama: `Produk ${id}`, harga: Math.floor(Math.random() * 1000000) }]);
    setMsg(`✅ INSERT: Produk ${id} ditambahkan`);
  };
  const del = () => {
    if (rows.length === 0) return;
    const last = rows[rows.length - 1];
    setRows(rows.slice(0, -1));
    setMsg(`🗑 DELETE: Produk ${last.id} dihapus`);
  };
  const update = () => {
    if (rows.length === 0) return;
    setRows(rows.map((r, i) => i === 0 ? { ...r, harga: r.harga + 100000 } : r));
    setMsg(`✏️ UPDATE: Harga ${rows[0].nama} dinaikkan 100.000`);
  };

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-3 font-syne" style={{ color: '#bc8cff' }}>Visualisasi DML Interaktif</h3>
      {msg && <div className="text-xs mb-3 px-3 py-2 rounded" style={{ background: '#1f4c2e', color: '#3fb950' }}>{msg}</div>}
      <table className="w-full text-xs font-mono mb-4">
        <thead><tr style={{ background: '#21262d' }}>
          {['ID', 'Nama', 'Harga'].map((h) => <th key={h} className="px-3 py-2 text-left" style={{ color: '#58a6ff' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          <AnimatePresence>
            {rows.map((r) => (
              <motion.tr key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <td className="px-3 py-1.5" style={{ color: '#e3b341' }}>{r.id}</td>
                <td className="px-3 py-1.5" style={{ color: '#e6edf3' }}>{r.nama}</td>
                <td className="px-3 py-1.5" style={{ color: '#3fb950' }}>{r.harga.toLocaleString('id-ID')}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <div className="flex gap-2">
        <button onClick={insert} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: '#1f4c2e', color: '#3fb950' }}>INSERT</button>
        <button onClick={update} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: '#1b2f4b', color: '#58a6ff' }}>UPDATE</button>
        <button onClick={del} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: '#3d1a1a', color: '#f78166' }}>DELETE</button>
      </div>
    </div>
  );
}

/* ─── Module 5: SELECT Filter Visual ─── */
export function VisualSelectFilter() {
  const [minHarga, setMinHarga] = useState(0);
  const rows = [
    { nama: 'Laptop', harga: 8500000 }, { nama: 'Mouse', harga: 150000 },
    { nama: 'Keyboard', harga: 450000 }, { nama: 'Monitor', harga: 3200000 },
    { nama: 'Headset', harga: 320000 }, { nama: 'Webcam', harga: 580000 },
  ];
  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-3 font-syne" style={{ color: '#58a6ff' }}>Filter WHERE — Geser untuk filter harga</h3>
      <div className="mb-4">
        <label className="text-xs mb-1 block" style={{ color: '#8b949e' }}>Harga minimum: Rp {minHarga.toLocaleString('id-ID')}</label>
        <input type="range" min="0" max="5000000" step="100000" value={minHarga} onChange={(e) => setMinHarga(+e.target.value)} className="w-full" />
        <div className="text-xs mt-1 font-mono" style={{ color: '#8b949e' }}>WHERE harga &gt;= {minHarga}</div>
      </div>
      <div className="space-y-2">
        {rows.map((r) => {
          const visible = r.harga >= minHarga;
          return (
            <motion.div key={r.nama} animate={{ opacity: visible ? 1 : 0.2, scale: visible ? 1 : 0.97 }} className="flex justify-between px-3 py-2 rounded border" style={{ borderColor: '#30363d', background: visible ? '#0d1117' : '#1a0000' }}>
              <span className="text-xs font-mono" style={{ color: visible ? '#e6edf3' : '#8b949e' }}>{r.nama}</span>
              <span className="text-xs font-mono" style={{ color: visible ? '#3fb950' : '#8b949e' }}>Rp {r.harga.toLocaleString('id-ID')}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Module 6: Truth Table ─── */
export function VisualTruthTable() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-4 font-syne" style={{ color: '#e3b341' }}>Tabel Kebenaran — Toggle kondisi</h3>
      <div className="flex gap-4 mb-6">
        {[{ label: 'Kondisi A', val: a, set: setA }, { label: 'Kondisi B', val: b, set: setB }].map(({ label, val, set }) => (
          <button key={label} onClick={() => set(!val)} className="px-4 py-2 rounded-lg border text-xs font-bold" style={{ background: val ? '#1f4c2e' : '#3d1a1a', borderColor: val ? '#3fb950' : '#f78166', color: val ? '#3fb950' : '#f78166' }}>
            {label}: {val ? 'TRUE' : 'FALSE'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        {[
          { op: 'A AND B', result: a && b },
          { op: 'A OR B', result: a || b },
          { op: 'NOT A', result: !a },
          { op: 'NOT B', result: !b },
          { op: 'A AND NOT B', result: a && !b },
          { op: 'NOT A OR B', result: !a || b },
        ].map(({ op, result }) => (
          <div key={op} className="p-3 rounded border text-center" style={{ borderColor: result ? '#3fb950' : '#f78166', background: result ? '#1f4c2e' : '#3d1a1a' }}>
            <div style={{ color: '#8b949e' }} className="mb-1">{op}</div>
            <div className="font-bold text-sm" style={{ color: result ? '#3fb950' : '#f78166' }}>{result ? 'TRUE' : 'FALSE'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Module 14: JOIN Venn Diagram ─── */
export function VisualJoinDiagram() {
  const [joinType, setJoinType] = useState<'INNER' | 'LEFT' | 'RIGHT'>('INNER');
  const data = {
    INNER: { left: false, center: true, right: false, desc: 'Hanya baris yang cocok di KEDUA tabel' },
    LEFT: { left: true, center: true, right: false, desc: 'SEMUA baris tabel kiri + yang cocok dari kanan' },
    RIGHT: { left: false, center: true, right: true, desc: 'SEMUA baris tabel kanan + yang cocok dari kiri' },
  };
  const d = data[joinType];

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-4 font-syne" style={{ color: '#bc8cff' }}>Visualisasi JOIN</h3>
      <div className="flex gap-2 mb-6">
        {(['INNER', 'LEFT', 'RIGHT'] as const).map((t) => (
          <button key={t} onClick={() => setJoinType(t)} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: joinType === t ? '#bc8cff20' : '#21262d', color: joinType === t ? '#bc8cff' : '#8b949e', border: `1px solid ${joinType === t ? '#bc8cff' : '#30363d'}` }}>
            {t} JOIN
          </button>
        ))}
      </div>
      <div className="flex justify-center items-center mb-4" style={{ height: 100 }}>
        <svg width="200" height="100" viewBox="0 0 200 100">
          <circle cx="75" cy="50" r="45" fill={d.left ? '#58a6ff40' : 'transparent'} stroke="#58a6ff" strokeWidth="2" />
          <circle cx="125" cy="50" r="45" fill={d.right ? '#3fb95040' : 'transparent'} stroke="#3fb950" strokeWidth="2" />
          {d.center && <ellipse cx="100" cy="50" rx="20" ry="38" fill="#bc8cff60" />}
          <text x="55" y="54" textAnchor="middle" fill="#58a6ff" fontSize="10">Tabel A</text>
          <text x="145" y="54" textAnchor="middle" fill="#3fb950" fontSize="10">Tabel B</text>
        </svg>
      </div>
      <div className="text-center text-sm" style={{ color: '#e6edf3' }}>{d.desc}</div>
    </div>
  );
}

/* ─── Module 11: Aggregation Bar Chart ─── */
export function VisualAggregation() {
  const [groupBy, setGroupBy] = useState<'departemen' | 'jabatan'>('departemen');
  const data = {
    departemen: [{ label: 'TI', val: 12000000 }, { label: 'Pemasaran', val: 8500000 }, { label: 'Keuangan', val: 10000000 }, { label: 'SDM', val: 7500000 }],
    jabatan: [{ label: 'Manajer', val: 14000000 }, { label: 'Senior', val: 11000000 }, { label: 'Junior', val: 7000000 }, { label: 'Staff', val: 6500000 }],
  };
  const rows = data[groupBy];
  const max = Math.max(...rows.map((r) => r.val));

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-3 font-syne" style={{ color: '#3fb950' }}>Rata-rata Gaji — GROUP BY</h3>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setGroupBy('departemen')} className="px-3 py-1 rounded text-xs" style={{ background: groupBy === 'departemen' ? '#1f4c2e' : '#21262d', color: groupBy === 'departemen' ? '#3fb950' : '#8b949e' }}>Departemen</button>
        <button onClick={() => setGroupBy('jabatan')} className="px-3 py-1 rounded text-xs" style={{ background: groupBy === 'jabatan' ? '#1f4c2e' : '#21262d', color: groupBy === 'jabatan' ? '#3fb950' : '#8b949e' }}>Jabatan</button>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <div className="w-20 text-xs font-mono" style={{ color: '#8b949e' }}>{r.label}</div>
            <div className="flex-1 h-6 rounded relative" style={{ background: '#21262d' }}>
              <motion.div className="h-full rounded flex items-center px-2" style={{ background: '#3fb95060' }} animate={{ width: `${(r.val / max) * 100}%` }} transition={{ duration: 0.5 }}>
                <span className="text-xs font-mono" style={{ color: '#3fb950' }}>Rp {(r.val / 1000000).toFixed(1)}jt</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Module 26: ACID Animation ─── */
export function VisualACID() {
  const [phase, setPhase] = useState(0);
  const phases = ['Idle', 'START TRANSACTION', 'INSERT data', 'Error terjadi!', 'ROLLBACK — data kembali'];
  const colors = ['#8b949e', '#58a6ff', '#3fb950', '#f78166', '#e3b341'];

  return (
    <div className="rounded-xl p-6 border" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <h3 className="font-bold mb-4 font-syne" style={{ color: '#e3b341' }}>Simulasi Transaksi & ROLLBACK</h3>
      <div className="flex gap-2 mb-4 flex-wrap">
        {phases.map((p, i) => (
          <button key={i} onClick={() => setPhase(i)} className="px-3 py-1.5 rounded text-xs font-mono" style={{ background: phase === i ? colors[i] + '30' : '#21262d', color: phase === i ? colors[i] : '#8b949e', border: `1px solid ${phase === i ? colors[i] : '#30363d'}` }}>
            {p}
          </button>
        ))}
      </div>
      <div className="font-mono text-xs p-4 rounded border" style={{ background: '#0d1117', borderColor: '#30363d', color: colors[phase] }}>
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {phase === 0 && 'Database dalam kondisi normal — siap menerima transaksi'}
            {phase === 1 && '> START TRANSACTION;\nTransaksi dimulai. Semua perubahan bersifat sementara...'}
            {phase === 2 && '> INSERT INTO akun (saldo) VALUES (500000);\nData dimasukkan — belum permanent!'}
            {phase === 3 && '⚠ ERROR: Koneksi terputus!\nData belum di-COMMIT...'}
            {phase === 4 && '> ROLLBACK;\nSemua perubahan dibatalkan. Database kembali seperti semula. ✓'}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Generic placeholder for other modules ─── */
export function VisualPlaceholder({ moduleId }: { moduleId: number }) {
  const visuals: Record<number, () => React.JSX.Element> = {
    1: VisualDBArchitecture, 2: VisualDataTypes, 3: VisualBuildTable,
    4: VisualDMLTable, 5: VisualSelectFilter, 6: VisualTruthTable,
    11: VisualAggregation, 14: VisualJoinDiagram, 26: VisualACID,
  };
  const Component = visuals[moduleId];
  if (Component) return <Component />;

  return (
    <div className="rounded-xl p-6 border text-center" style={{ background: '#161b22', borderColor: '#30363d' }}>
      <div className="text-4xl mb-3">🎮</div>
      <div className="text-sm" style={{ color: '#58a6ff' }}>Visual Interaktif Modul {moduleId}</div>
      <div className="text-xs mt-2" style={{ color: '#8b949e' }}>Gunakan SQL Editor di bawah untuk bereksperimen langsung!</div>
    </div>
  );
}
