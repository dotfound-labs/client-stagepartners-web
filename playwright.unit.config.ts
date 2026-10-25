import { defineConfig } from "@playwright/test";

// Unit/component fixtures must run without a web server or installed browser.
// Live/browser flows remain in their dedicated configurations.
export default defineConfig({
  testDir: "./tests",
  testMatch: [
    "integrations.spec.ts",
    "page-bindings.spec.tsx",
    "password-feedback.spec.ts",
    "site-settings.spec.ts",
    "instagram-setup.spec.ts",
  ],
  grep: /SEO|Web3Forms|Instagram|invitation readiness|password page|password setup|publication dates|common navigation|typed link|telephone|metadata|historical hero/,
  grepInvert: /Instagram customer setup/,
  workers: 1,
});
