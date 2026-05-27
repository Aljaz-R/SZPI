import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        mfStudenti: "/mf-studenti/assets/remoteEntry.js",
        mfIzpiti: "/mf-izpiti/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  optimizeDeps: {
    exclude: ["mfStudenti/StudentiApp", "mfIzpiti/IzpitiApp"],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["mfStudenti/StudentiApp", "mfIzpiti/IzpitiApp"],
    },
  },
});