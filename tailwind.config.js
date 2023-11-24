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
          'red': '#bd1717',
        }
      },
      // https://stackoverflow.com/questions/67150736/tailwind-background-gradient-transition
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
    }
  }
}