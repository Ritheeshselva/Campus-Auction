/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bce0fd',
          300: '#8ecbfc',
          400: '#58adf8',
          500: '#328cf3',
          600: '#1b6de7',
          700: '#1457d4',
          800: '#1647ab',
          900: '#173d87',
          950: '#132652'
        },
        campus: {
          primary: '#1e3a8a',
          secondary: '#d97706',
          accent: '#059669',
          crimson: '#dc2626'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.8s infinite'
      }
    }
  },
  plugins: []
};
