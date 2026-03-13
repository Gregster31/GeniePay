import React from 'react';
import { useRouteError, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  stack?: string;
}

export const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  const errorCode = error?.status
    ? `${error.status} · ${error.statusText ?? 'Error'}`
    : 'Runtime Error';

  const errorMessage =
    error?.statusText || error?.message || 'An unexpected error occurred';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0e0d14' }}
    >
      {/* ── Ambient background grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Glow blobs ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 360, height: 360,
          background: '#7c3aed',
          filter: 'blur(90px)',
          opacity: 0.12,
          top: -80, left: -100,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          background: '#a855f7',
          filter: 'blur(80px)',
          opacity: 0.08,
          bottom: -40, right: -60,
        }}
      />

      {/* ── Card ── */}
      <div
        className="relative z-10 w-full max-w-md text-center"
        style={{
          background: 'rgba(22, 19, 36, 0.9)',
          border: '1px solid rgba(124, 58, 237, 0.22)',
          borderRadius: 20,
          padding: '48px 44px 40px',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* GeniePay wordmark */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#6d5fa8' }}
          >
            GeniePay
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-7">
          <div
            className="flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.28)',
            }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: '#a78bfa' }} />
          </div>
        </div>

        {/* Error badge */}
        <div className="flex justify-center mb-4">
          <span
            className="text-xs font-mono font-medium tracking-widest uppercase px-3 py-1 rounded-md"
            style={{
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            {errorCode}
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-2xl font-semibold mb-3 font-mono"
          style={{ color: '#f0eeff', letterSpacing: '-0.01em' }}
        >
          Something went wrong
        </h1>

        {/* Message */}
        <p
          className="text-sm leading-relaxed mb-9 mx-auto font-mono" 
          style={{ color: '#8b879f', maxWidth: 300 }}
        >
          {errorMessage}
        </p>

        {/* Divider */}
        <div
          className="mb-7"
          style={{
            height: 1,
            background: 'rgba(124,58,237,0.14)',
            margin: '0 -44px 28px',
          }}
        />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-sm font-mono text-white py-3 px-6 rounded-xl transition-opacity hover:opacity-85"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              textDecoration: 'none',
            }}
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 text-sm py-3 px-6 rounded-xl transition-all font-mono"
            style={{
              color: '#8b879f',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
              e.currentTarget.style.color = '#c4b8f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = '#8b879f';
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};