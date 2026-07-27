import { Component, type ErrorInfo, type PropsWithChildren } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center bg-[color:var(--bg)] p-6 text-[color:var(--text)]">
          <div className="max-w-md rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-6 shadow-[var(--shadow-md)]">
            <h1 className="text-lg font-semibold text-[color:var(--text-h)]">Something went wrong</h1>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{this.state.message}</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--accent-fg)] focus-ring"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
