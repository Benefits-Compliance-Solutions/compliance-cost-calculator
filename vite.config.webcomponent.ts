import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

function cssToGlobalVariable(): Plugin {
  return {
    name: "css-to-global-variable",
    enforce: "post",
    generateBundle(_, bundle) {
      let cssContent = "";

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith(".css") && chunk.type === "asset") {
          cssContent += chunk.source;
          delete bundle[fileName];
        }
      }

      if (cssContent) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === "chunk" && chunk.isEntry) {
            const cssVar = `window.__COMPLIANCE_CALCULATOR_STYLES__=${JSON.stringify(cssContent)};`;
            chunk.code = cssVar + chunk.code;
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssToGlobalVariable(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    target: "es2020",
    lib: {
      entry: path.resolve(
        import.meta.dirname,
        "client/src/main-webcomponent.tsx"
      ),
      name: "ComplianceCalculator",
      fileName: () => "compliance-calculator.js",
      formats: ["iife"],
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
