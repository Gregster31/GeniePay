import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold dark:text-white text-gray-900">Something went wrong.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="px-4 py-2 rounded-lg bg-purple text-white text-sm font-medium"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
