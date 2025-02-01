import { reactRouter } from "@react-router/dev/vite";
// import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    // sentryVitePlugin({
    //   disable: process.env.NODE_ENV != "production",
    //   sourcemaps: { filesToDeleteAfterUpload: "./build/**/*.map" },
    //   telemetry: false,
    // }),
  ],
});
