/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      width: {
        220: '55rem',
      },
      spacing: {
        ttc: 'var(--tooltip-offset)',
        half: '50%',
        nhalf: '-50%',
      },
      colors: {
        ttc: 'var(--tooltip-color)',
        ttct: 'var(--tooltip-text-color)',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}
