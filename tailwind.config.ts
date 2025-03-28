import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-warning",
    "text-warning",
    "bg-error",
    "text-error",
    "bg-success",
    "text-success",
    "bg-[#52C893]",
    "text-[#52C893]",
  ],

  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "radial-top":
          "radial-gradient(circle at center top, var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },

  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#A32123",
          secondary: "#D14E30",
          accent: "#DB752D",
          neutral: "#15110d",
          "base-100": "#F7F6F5",
          info: "#00d7ff",
          success: "#68D26D", // Previously #008d3c
          warning: "#ffa200",
          error: "#c5002c",
        },
      },
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
};
export default config;
