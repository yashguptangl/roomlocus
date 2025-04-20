/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      // packages content
      '../../packages/**/*.{js,ts,jx,tsx}',
      // Or if using `src` directory:
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          blue :{
            300 : "#17A2B8",    //lightblue     
            400 : "#016481",   //blue
            500 : "#67C2D0",    //loginblue
            600 : "#0056B3"     //login darkblue
          },
          gray : {
            400 : "#EDEBEC",    //lightgray
            500 : "#CACACA",    //gray  
            600 : "#7C7C7C"     //textgray
          }
        },
        screens :{
          ssm : "320px",
          mod : "375px",
          ml: "425px",
        }
      },
    },
    plugins: [],
  }