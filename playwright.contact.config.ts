import {defineConfig} from '@playwright/test';
// Existing local dev server; all inquiry and notification requests are mocked.
export default defineConfig({testDir:'./tests',testMatch:'contact-completion.spec.ts',workers:1,timeout:60000,use:{baseURL:process.env.CONTACT_TEST_URL || 'http://127.0.0.1:3102'}});
