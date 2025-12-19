/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.tsx",
    "./resources/**/*.ts",
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['\"Press Start 2P\"', 'cursive'],
      },
    },
  },
  plugins: [],
}


