import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "./tests", timeout: 60000, workers: 1, webServer: { command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3101", url: "http://127.0.0.1:3101/admin", timeout: 60000, reuseExistingServer: false }, use: { viewport: { width: 1440, height: 1000 } } });
