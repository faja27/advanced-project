import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { runQuery, resetDatabase, warmupSQL } from '../../utils/sqlRunner';
import { databases } from '../../data/databases';
import type { DatabaseType, QueryResult } from '../../types';

interface Props {
  dbType: DatabaseType;
  initialQuery?: string;
}

export function SQLEditor({ dbType, initialQuery = 'SELECT * FROM produk LIMIT 10;' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [limitDismissed, setLimitDismissed] = useState(false);
  const editorRef = useRef<unknown>(null);

  useEffect(() => {
    warmupSQL().then(() => setEngineReady(true));
  }, []);

  // Reset limit banner when result changes
  useEffect(() => {
    setLimitDismissed(false);
  }, [result]);

  const handleRun = async () => {
    setLoading(true);
    const seed = databases[dbType];
    const res = await runQuery(dbType, seed, query);
    setResult(res);
    setLoading(false);
  };

  const handleReset = () => {
    resetDatabase(dbType);
    setResult(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRun();
  };

  // ── Loading skeleton (sql.js WebAssembly downloading)
  if (!engineReady) {
    return (
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#30363d', background: '#0d1117' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#30363d', background: '#161b22' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3fb950' }} />
            <span className="text-xs font-mono" style={{ color: '#8b949e' }}>SQL Editor — Memuat Engine...</span>
          </div>
        </div>
        <div className="p-6 space-y-3" style={{ background: '#0d1117' }}>
          <div className="h-4 rounded animate-pulse" style={{ background: '#21262d', width: '60%' }} />
          <div className="h-4 rounded animate-pulse" style={{ background: '#21262d', width: '80%' }} />
          <div className="h-4 rounded animate-pulse" style={{ background: '#21262d', width: '45%' }} />
          <div className="flex items-center gap-2 mt-4">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#3fb950', borderTopColor: 'transparent' }} />
            <span className="text-xs font-mono" style={{ color: '#8b949e' }}>Memuat SQL Engine (WebAssembly)...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#30363d', background: '#0d1117' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#30363d', background: '#161b22' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3fb950' }} />
          <span className="text-xs font-mono" style={{ color: '#8b949e' }}>SQL Editor — {dbType}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1 rounded border transition-colors hover:opacity-80"
            style={{ color: '#8b949e', borderColor: '#30363d' }}
          >
            Reset DB
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            className="text-xs px-3 py-1 rounded font-bold transition-all hover:opacity-90"
            style={{ background: '#238636', color: '#e6edf3', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-t-transparent animate-spin inline-block" style={{ borderColor: '#e6edf3', borderTopColor: 'transparent' }} />
                Berjalan...
              </span>
            ) : (
              '▶ Jalankan (Ctrl+Enter)'
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div onKeyDown={handleKeyDown}>
        <Editor
          height="160px"
          language="sql"
          value={query}
          onChange={(v) => setQuery(v || '')}
          onMount={(editor) => { editorRef.current = editor; }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: '"JetBrains Mono", monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>

      {/* Result panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t"
            style={{ borderColor: '#30363d' }}
          >
            <ResultPanel result={result} limitDismissed={limitDismissed} onDismissLimit={() => setLimitDismissed(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────────

function ResultPanel({
  result,
  limitDismissed,
  onDismissLimit,
}: {
  result: QueryResult;
  limitDismissed: boolean;
  onDismissLimit: () => void;
}) {
  const { resultType, error, rows, columns, rowsAffected, wasLimitAdded } = result;

  // Blocked query
  if (resultType === 'blocked') {
    return (
      <div className="p-4 flex items-start gap-3" style={{ background: '#e3b34108', borderLeft: '3px solid #e3b341' }}>
        <span style={{ color: '#e3b341' }}>⊘</span>
        <div>
          <div className="text-xs font-bold font-mono mb-0.5" style={{ color: '#e3b341' }}>Query Diblokir</div>
          <div className="text-xs font-mono" style={{ color: '#8b949e' }}>{error}</div>
        </div>
      </div>
    );
  }

  // Timeout
  if (resultType === 'timeout') {
    return (
      <div className="p-4 flex items-start gap-3" style={{ background: '#ff6b3510', borderLeft: '3px solid #ff6b35' }}>
        <span style={{ color: '#ff6b35' }}>⏱</span>
        <div>
          <div className="text-xs font-bold font-mono mb-0.5" style={{ color: '#ff6b35' }}>Query Timeout</div>
          <div className="text-xs font-mono whitespace-pre-line" style={{ color: '#8b949e' }}>{error}</div>
        </div>
      </div>
    );
  }

  // SQL Error
  if (resultType === 'error' || error) {
    return (
      <div className="p-4 flex items-start gap-3" style={{ background: '#ff000012', borderLeft: '3px solid #f85149' }}>
        <span style={{ color: '#f85149' }}>⚠</span>
        <div>
          <div className="text-xs font-bold font-mono mb-0.5" style={{ color: '#f85149' }}>Error SQL</div>
          <div className="text-xs font-mono break-all" style={{ color: '#ffa198' }}>{error}</div>
        </div>
      </div>
    );
  }

  // DML success (INSERT / UPDATE / DELETE)
  if (resultType === 'dml_success') {
    return (
      <div className="p-4 flex items-center gap-3" style={{ background: '#3fb95012', borderLeft: '3px solid #3fb950' }}>
        <span style={{ color: '#3fb950', fontSize: 16 }}>✓</span>
        <div>
          <div className="text-xs font-bold font-mono" style={{ color: '#3fb950' }}>
            Query berhasil — {rowsAffected ?? 0} baris terpengaruh
          </div>
        </div>
      </div>
    );
  }

  // DDL / empty result
  if (resultType === 'empty' || columns.length === 0) {
    return (
      <div className="p-4 flex items-center gap-3" style={{ background: '#3fb95008', borderLeft: '3px solid #3fb95040' }}>
        <span style={{ color: '#3fb950' }}>✓</span>
        <div className="text-xs font-mono" style={{ color: '#8b949e' }}>Query berhasil dieksekusi (0 baris dikembalikan)</div>
      </div>
    );
  }

  // SELECT rows
  return (
    <div>
      {/* Auto-limit banner */}
      {wasLimitAdded && !limitDismissed && (
        <div className="flex items-center justify-between px-4 py-2" style={{ background: '#e3b34110', borderBottom: '1px solid #e3b34130' }}>
          <span className="text-xs font-mono" style={{ color: '#e3b341' }}>
            ⚡ Hasil dibatasi 100 baris pertama. Tambahkan LIMIT untuk hasil spesifik.
          </span>
          <button
            onClick={onDismissLimit}
            className="text-xs ml-4 hover:opacity-70 transition-opacity"
            style={{ color: '#8b949e' }}
          >
            ✕
          </button>
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight: 300 }}>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr style={{ background: '#21262d' }}>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left border-b border-r" style={{ color: '#58a6ff', borderColor: '#30363d', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : '#0a0f14' }}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-1.5 border-b border-r" style={{ color: cell === null ? '#8b949e' : '#e6edf3', borderColor: '#21262d', whiteSpace: 'nowrap' }}>
                    {cell === null ? 'NULL' : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 py-1.5 text-xs border-t flex items-center gap-2" style={{ color: '#8b949e', borderColor: '#30363d' }}>
          <span>{rows.length} baris dikembalikan</span>
          {wasLimitAdded && limitDismissed && (
            <span style={{ color: '#e3b341' }}>· dibatasi 100 baris</span>
          )}
        </div>
      </div>
    </div>
  );
}
