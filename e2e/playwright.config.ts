import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  use: {
    baseURL: 'http://127.0.0.1:5173'
  },
  webServer: [
    {
      command: 'corepack pnpm --filter @online-docs/api dev',
      port: 3000,
      reuseExistingServer: true
    },
    {
      command: 'corepack pnpm --filter @online-docs/web dev',
      port: 5173,
      reuseExistingServer: true
    }
  ]
});
