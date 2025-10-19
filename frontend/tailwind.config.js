/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,html,css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'uniform': ['UniformMedium-Regular', 'sans-serif'],
        'system': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        'bluebunny': ['Cinzel', 'serif'], // brand font
        'playfair': ['"Playfair Display"', 'serif'],
        'crimson': ['"Crimson Text"', 'serif'],
        'libre': ['"Libre Baskerville"', 'serif'],
        'cormorant': ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        "Pace-blue": "#002d73",
        "bluebunny": "#2877A7",   // brand blue
        "bluebunnyBg": "#F5F1E8", // background beige
      },
    },
  },
  plugins: [],
};
