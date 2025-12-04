/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
      },
      // ชุดสีใหม่จาก Evaluation System
      colors: {
        primary: { 
          navy: "#323B55",      // สีน้ำเงินเทา (เปลี่ยนจากน้ำเงินเข้มเดิม)
          gold: "#ffde91"       // สีเหลืองพาสเทล (เปลี่ยนจากส้มทองเดิม)
        },
        secondary: { 
          cream: "#F2EDE2",     // สีครีมรองพื้นหลัก
          silver: "#ABADB2", 
          darkgold: "#7E7258"   // สีน้ำตาลทองเข้ม
        },
        accent: { 
          royalblue: "#465580", 
          sand: "#D4C8B4" 
        },
        neutral: { 
          dark: "#1D2233", 
          medium: "#6E7480", 
          light: "#E5E7EB", 
          white: "#FFFFFF" 
        },
      }
    },
  },
  plugins: [],
}