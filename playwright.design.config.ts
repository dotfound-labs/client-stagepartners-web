import {defineConfig} from "@playwright/test";export default defineConfig({testDir:"./tests",testMatch:"admin-responsive.spec.ts",workers:1,timeout:60000});
