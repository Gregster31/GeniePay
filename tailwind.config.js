/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: '#5D00F2' },
        cyan:   { DEFAULT: '#23DDC6' },
      },
      keyframes: {
        'scroll-left': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'scroll-right': {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-18px)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.85)', opacity: '1' },
          '100%': { transform: 'scale(2.2)',  opacity: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.45' },
          '50%':      { opacity: '0.9' },
        },
        'drift': {
          '0%':   { transform: 'translate(0, 0) scale(1)' },
          '33%':  { transform: 'translate(40px, -30px) scale(1.05)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.97)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'scroll-left':  'scroll-left linear infinite',
        'scroll-right': 'scroll-right linear infinite',
        'fade-in-up':   'fade-in-up 0.7s ease-out both',
        'fade-in':      'fade-in 0.5s ease-out both',
        'float':        'float 6s ease-in-out infinite',
        'pulse-ring':   'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'spin-slow':    'spin-slow 14s linear infinite',
        'glow-pulse':   'glow-pulse 2.8s ease-in-out infinite',
        'drift':        'drift 18s ease-in-out infinite',
        'gradient-x':   'gradient-x 6s ease infinite',
      },
    },
  },
  plugins: [],
}
