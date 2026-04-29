import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  private isLocalStorageError(): boolean {
    const msg = this.state.error?.message ?? '';
    return (
      msg.includes('localStorage') ||
      msg.includes('JSON') ||
      msg.includes('parse') ||
      msg.includes('storage')
    );
  }

  private handleResetProgress = () => {
    try {
      localStorage.removeItem('mysql-learn-progress');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isDev = import.meta.env.DEV;
      const isStorageError = this.isLocalStorageError();

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0d1117',
            color: '#e6edf3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: 560,
              width: '100%',
              background: '#161b22',
              border: '1px solid #30363d',
              borderLeft: '4px solid #f85149',
              borderRadius: 12,
              padding: '2rem',
            }}
          >
            {/* Icon */}
            <div style={{ marginBottom: '1rem' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" stroke="#f85149" strokeWidth="1.5" />
                <path d="M20 12v10M20 27v2" stroke="#f85149" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#e6edf3',
                marginBottom: '0.5rem',
                fontFamily: 'inherit',
              }}
            >
              Terjadi Kesalahan
            </h1>

            <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Aplikasi mengalami error yang tidak terduga. Coba muat ulang halaman untuk melanjutkan.
            </p>

            {/* Error detail — dev only */}
            {isDev && this.state.error && (
              <div
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.75rem',
                  color: '#f85149',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ color: '#8b949e', marginBottom: 4 }}>Error (dev mode only):</div>
                {this.state.error.message}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#f85149',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Muat Ulang Halaman
              </button>

              {isStorageError && (
                <button
                  onClick={this.handleResetProgress}
                  style={{
                    background: 'transparent',
                    color: '#f85149',
                    border: '1px solid #f85149',
                    borderRadius: 8,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Reset Progress &amp; Muat Ulang
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
