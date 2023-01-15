import { defineConfig, splitVendorChunkPlugin, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react(), splitVendorChunkPlugin()],
    build: {
      minify: true,
    },
    publicDir: "./public",
  });
};
