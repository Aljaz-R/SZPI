import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfStudenti",
      filename: "remoteEntry.js",
      exposes: {
        "./StudentiApp": "./src/StudentiApp.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: { target: "esnext" },
});