/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: app ディレクトリ配下の全ファイルを対象にする
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
