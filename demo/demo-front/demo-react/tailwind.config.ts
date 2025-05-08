import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html", // Add index.html
    "./src/**/*.{js,ts,jsx,tsx}", // Scan src directory
    // "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Remove pages pattern
    // "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Keep or adjust components pattern if needed
    // "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Remove app pattern
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
