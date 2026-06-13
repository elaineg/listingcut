import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

// Persistent profile so the ~50MB @imgly model is cached in IndexedDB
// across tests and re-runs (avoids re-downloading on every test).
const PROFILE_DIR = join(__dirname, '.playwright-profile');
try { mkdirSync(PROFILE_DIR, { recursive: true }); } catch {}

// E2e tests run against a DEPLOYED url: BASE_URL=https://... npm run test:e2e
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    // Persistent context keeps IndexedDB model cache between tests.
    userDataDir: PROFILE_DIR,
  },
});
