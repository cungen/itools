/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'fill-100': 'repeat(auto-fill, minmax(100px, 1fr))',
      },
      colors: {
         accent: '#3b82f6',
      }
    },
  },
  plugins: [],
}
