import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SQLEditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SQLEditorErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#7a9cc4',
            background: '#0a0e1a',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ color: '#ff5f57', marginBottom: '0.5rem', fontSize: '1.25rem' }}>⚠</div>
          Editor tidak dapat dimuat, coba refresh halaman.
          <br />
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              background: 'transparent',
              border: '1px solid #1e2d4a',
              color: '#00d4ff',
              borderRadius: 8,
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
            }}
          >
            Refresh Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
