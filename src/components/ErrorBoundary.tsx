import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='p-8 text-center'>
          <h2 className='text-xl font-semibold mb-2'>Something went wrong</h2>
          <p className='text-muted-foreground mb-4'>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className='px-4 py-2 bg-primary text-primary-foreground rounded'>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}
