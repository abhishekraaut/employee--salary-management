import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev -- --host localhost',
    url: 'http://localhost:5173/login',
    reuseExistingServer: true,
    timeout: 120000
  }
});