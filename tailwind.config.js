/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          base: '#020617',
          panel: '#0F172A',
          card: '#111827',
          cyan: '#22D3EE',
          teal: '#14B8A6',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
};
