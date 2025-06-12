import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <svg
                className="w-16 h-16 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 14.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h1 className="error-boundary__title">
              Something went wrong
            </h1>
            
            <p className="error-boundary__message">
              The IoT Dashboard has encountered an unexpected error. This might be a temporary issue.
            </p>

            <div className="error-boundary__actions">
              <button 
                className="btn btn--primary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              
              <button 
                className="btn btn--secondary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
            </div>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  Error Details (Development Mode)
                </summary>
                
                <div className="error-boundary__error-info">
                  <h3>Error:</h3>
                  <pre className="error-boundary__error-text">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre className="error-boundary__stack-trace">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: var(--color-bg-secondary);
              padding: var(--spacing-4);
            }

            .error-boundary__container {
              max-width: 500px;
              text-align: center;
              background: var(--color-bg-primary);
              padding: var(--spacing-8);
              border-radius: var(--radius-lg);
              box-shadow: var(--shadow-lg);
            }

            .error-boundary__icon {
              margin: 0 auto var(--spacing-6);
              color: var(--color-error);
            }

            .error-boundary__icon svg {
              width: 64px;
              height: 64px;
            }

            .error-boundary__title {
              font-size: var(--font-size-2xl);
              font-weight: var(--font-weight-bold);
              color: var(--color-text-primary);
              margin-bottom: var(--spacing-4);
            }

            .error-boundary__message {
              font-size: var(--font-size-base);
              color: var(--color-text-secondary);
              margin-bottom: var(--spacing-6);
              line-height: var(--line-height-relaxed);
            }

            .error-boundary__actions {
              display: flex;
              gap: var(--spacing-3);
              justify-content: center;
              margin-bottom: var(--spacing-6);
            }

            .error-boundary__details {
              margin-top: var(--spacing-6);
              text-align: left;
              border: 1px solid var(--color-border-light);
              border-radius: var(--radius);
              overflow: hidden;
            }

            .error-boundary__details-summary {
              padding: var(--spacing-3) var(--spacing-4);
              background-color: var(--color-bg-tertiary);
              cursor: pointer;
              font-weight: var(--font-weight-medium);
              border-bottom: 1px solid var(--color-border-light);
            }

            .error-boundary__details-summary:hover {
              background-color: var(--color-gray-200);
            }

            .error-boundary__error-info {
              padding: var(--spacing-4);
            }

            .error-boundary__error-info h3 {
              font-size: var(--font-size-sm);
              font-weight: var(--font-weight-semibold);
              color: var(--color-text-primary);
              margin: var(--spacing-4) 0 var(--spacing-2) 0;
            }

            .error-boundary__error-info h3:first-child {
              margin-top: 0;
            }

            .error-boundary__error-text,
            .error-boundary__stack-trace {
              font-family: var(--font-mono);
              font-size: var(--font-size-xs);
              background-color: var(--color-bg-tertiary);
              padding: var(--spacing-3);
              border-radius: var(--radius);
              border: 1px solid var(--color-border-light);
              white-space: pre-wrap;
              overflow-x: auto;
              max-height: 300px;
              overflow-y: auto;
            }

            .error-boundary__error-text {
              color: var(--color-error);
            }

            .error-boundary__stack-trace {
              color: var(--color-text-secondary);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
