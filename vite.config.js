import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
// viteSingleFile bundles the whole app into ONE html file (dist/index.html)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
