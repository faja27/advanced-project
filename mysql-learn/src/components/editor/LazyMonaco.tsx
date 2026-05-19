import React, { Suspense } from 'react';
import type { EditorProps } from '@monaco-editor/react';

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

export function LazyMonaco(props: EditorProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: typeof props.height === 'number' ? `${props.height}px` : (props.height ?? '160px'),
            background: '#21262d',
          }}
          className="animate-pulse"
        />
      }
    >
      <MonacoEditor {...props} />
    </Suspense>
  );
}
