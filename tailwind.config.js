/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          elevated: 'var(--bg-elevated)',
          hover: 'var(--bg-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          danger: 'var(--text-danger)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        stat: {
          code: 'var(--stat-code)',
          wealth: 'var(--stat-wealth)',
          body: 'var(--stat-body)',
          mind: 'var(--stat-mind)',
          brand: 'var(--stat-brand)',
          network: 'var(--stat-network)',
          freedom: 'var(--stat-freedom)',
        },
        system: {
          success: 'var(--success)',
          danger: 'var(--danger)',
          warning: 'var(--warning)',
        }
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
