import type {Config} from "tailwindcss";
export default {
 content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./lib/**/*.{ts,tsx}"],
 darkMode:"class",
 theme:{extend:{
  colors:{ink:"#14263B",accent:"#4361EE",muted:"#64748B",surface:"#F7F9FD"},
  fontFamily:{sans:["Inter","ui-sans-serif","system-ui","sans-serif"]},
  boxShadow:{soft:"0 4px 28px rgba(23,40,66,.055)"}
 }},
 plugins:[]
} satisfies Config;
