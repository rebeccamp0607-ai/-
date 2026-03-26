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
        "ming-void":  "#0a0a0f",
        "ming-paper": "#e8dfc8",
        "ming-gold":  "#c9a84c",
        "ming-fire":  "#d44f2a",
        "ming-water": "#2a6bd4",
        "ming-wood":  "#2ad44f",
        "ming-metal": "#d4c12a",
        "ming-earth": "#8b6914",
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Source Han Serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
