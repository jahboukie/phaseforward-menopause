// Error Boundary Component for Graceful Error Handling
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service (in production)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback 
        error={this.state.error}
        resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        componentName={this.props.componentName}
      />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError, componentName = "Component" }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-700 text-sm mb-4">
            We encountered an error in the {componentName}. Our team has been notified.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={resetError}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
            <a
              href="mailto:support@menowellness.com"
              className="inline-block text-red-600 text-sm hover:text-red-700"
            >
              Contact Support
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-red-600 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export function SymptomTrackerErrorFallback({ error, resetError }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
      <div className="text-center">
        <div className="text-3xl mb-3">📊❌</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Symptom Tracker Error
        </h3>
        <p className="text-red-700 text-sm mb-4">
          We couldn't load your symptom tracking data. Your data is safe and secure.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
          >
            Retry Loading
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export function AIInsightsErrorFallback({ error, resetError }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 m-4">
      <div className="text-center">
        <div className="text-3xl mb-3">🤖❌</div>
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          AI Insights Temporarily Unavailable
        </h3>
        <p className="text-purple-700 text-sm mb-4">
          Our AI analysis service is temporarily unavailable. Please try again in a few minutes.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-2"
          >
            Retry Analysis
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continue Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;