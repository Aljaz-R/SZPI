import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfIzpiti",
      filename: "remoteEntry.js",
      exposes: {
        "./IzpitiApp": "./src/IzpitiApp.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: { target: "esnext" },
});