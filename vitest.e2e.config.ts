// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['e2e/**/*.test.ts'],
    globalSetup: ['e2e/globalSetup.ts'],
    testTimeout: 120_000,
  },
});
