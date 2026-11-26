import { defineConfig } from "vite";

// The laser room hero as one module for the static site, which ships no React and no app bundle of its own.
// public/laser-hero.js loads it from /laser-room/laser-room.js next to itself; the export copies dist/client.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist/client/laser-room",
    emptyOutDir: true,
    target: "es2020",
    minify: true,
    sourcemap: false,
    // library builds keep ES output readable by default; this one is shipped as is, so minify it fully
    rolldownOptions: { output: { minify: true } },
    lib: {
      entry: "components/laser-room/mount.ts",
      formats: ["es"],
      fileName: () => "laser-room.js",
    },
  },
});
