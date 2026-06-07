import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tema "blueprint de engenharia": papel claro + tinta naval + grade azul.
        ink: '#e8eef6', // papel recuado (inputs, blocos de código)
        paper: '#f4f7fb', // fundo principal
        panel: '#ffffff', // superfícies/cartões
        line: '#cad8ea', // bordas e linhas da grade
        navy: '#13314f', // texto primário (tinta)
        accent: '#2563eb', // azul blueprint (operador +)
        green: '#0f7a4d', // números / resultado
        amber: '#b45309', // parênteses
        pink: '#be185d', // operador *
        muted: '#5b6b82', // texto secundário
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
