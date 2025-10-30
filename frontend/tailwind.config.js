/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
        },
        accent: {
          DEFAULT: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
      },
    },
  },
  plugins: [],
}
