import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fdfcf8", // 這是我們指定的米色背景
      },
      fontFamily: {
        "serif-tc": ["var(--font-noto-serif-tc)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;