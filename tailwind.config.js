/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    fontFamily: {
      normal: 'Alfa Slab One',
    },
    extend: {
      colors: {
        'diagon': {
          'light': '#c5a485',
          'dark': '#843c0c',
        }
      },
    }
  }
}