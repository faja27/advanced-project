import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  code: string;
  title?: string;
  output?: string;
}

export function CodeBlock({ code, title, output }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (sql: string) => {
    const escaped = sql.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const keywords = /\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|SET|DELETE|CREATE|TABLE|DATABASE|DROP|ALTER|ADD|COLUMN|INDEX|JOIN|INNER|LEFT|RIGHT|OUTER|FULL|CROSS|SELF|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|DISTINCT|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|EXISTS|UNION|ALL|CASE|WHEN|THEN|ELSE|END|VALUES|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|AUTO_INCREMENT|NOT\s+NULL|UNIQUE|CONSTRAINT|SHOW|DESCRIBE|EXPLAIN|CALL|PROCEDURE|FUNCTION|TRIGGER|VIEW|EVENT|TRANSACTION|COMMIT|ROLLBACK|SAVEPOINT|WITH|RECURSIVE|PARTITION|BY|OVER|ROWS|UNBOUNDED|PRECEDING|FOLLOWING|CURRENT\s+ROW|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|GRANT|REVOKE|USER|IDENTIFIED|ROLE|START|STOP|USING|BEFORE|AFTER|FOR|EACH|ROW|RETURNS|RETURN|BEGIN|DECLARE|IF|THEN|ELSEIF|END\s+IF|WHILE|DO|LOOP|LEAVE|ITERATE|REPLACE|TRUNCATE|LOCK|UNLOCK|TABLES|INTERVAL|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)\b/gi;
    const strings = /('([^'\\]|\\.)*')/g;
    const numbers = /\b(\d+(?:\.\d+)?)\b/g;
    const comments = /(--[^\n]*|#[^\n]*)/g;
    const funcs = /\b([A-Z_][A-Z0-9_]*)\s*(?=\()/g;

    return escaped
      .replace(comments, '<span class="sql-comment">$1</span>')
      .replace(strings, '<span class="sql-string">$1</span>')
      .replace(keywords, (m) => `<span class="sql-keyword">${m}</span>`)
      .replace(funcs, (m) => `<span class="sql-function">${m}</span>`)
      .replace(numbers, '<span class="sql-number">$1</span>');
  };

  return (
    <div className="rounded-xl overflow-hidden my-4" style={{ background: '#050810', border: '1px solid #1e2d4a' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#0f1629', borderBottom: '1px solid #1e2d4a' }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span className="text-xs font-mono" style={{ color: '#3d5a7a' }}>
            {title || 'query.sql'}
          </span>
        </div>
        <button
          onClick={copy}
          className="text-xs px-2.5 py-1 rounded-lg transition-all font-mono"
          style={{
            color: copied ? '#00ff88' : '#7a9cc4',
            background: copied ? '#00ff8811' : 'transparent',
            border: `1px solid ${copied ? '#00ff8833' : '#1e2d4a'}`,
          }}
        >
          {copied ? '✓ Disalin' : 'Salin'}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono" style={{ color: '#e8f4fd', margin: 0 }}>
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t px-4 py-3"
            style={{ borderColor: '#1e2d4a', background: '#0a0e1a' }}
          >
            <div className="text-xs mb-2 font-mono" style={{ color: '#00ff88' }}>▶ Output:</div>
            <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: '#7a9cc4', margin: 0 }}>{output}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
