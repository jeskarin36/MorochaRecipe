import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react'; // Cambiamos el nombre de la importación
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    reactPlugin(), // Usamos el nuevo nombre aquí
    tailwindcss()
  ],
});