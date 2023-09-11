import { defineConfig } from "vite"
import solid from "vite-plugin-solid"

export default defineConfig({
  plugins: [solid()],
  optimizeDeps: {
    exclude: ["slate-jsx", "example-blocks"],
  },
})
