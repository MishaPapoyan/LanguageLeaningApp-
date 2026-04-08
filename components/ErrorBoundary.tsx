"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Label shown in the default error UI, e.g. "AI Tutor" */
  label?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? "Something went wrong." };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const label = this.props.label ?? "This section";

    return (
      <div
        style={{
          maxWidth: 480,
          margin: "48px auto",
          padding: "36px 28px",
          borderRadius: 20,
          border: "1px solid var(--border-md)",
          background: "var(--surface-2)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "var(--text)",
            margin: "0 0 8px",
          }}
        >
          {label} ran into a problem
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          {this.state.message}
        </p>
        <button
          onClick={this.handleRetry}
          className="btn-primary"
          style={{ fontSize: 13, padding: "10px 24px" }}
        >
          Try again
        </button>
      </div>
    );
  }
}
