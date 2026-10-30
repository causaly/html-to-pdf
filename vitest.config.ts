// eslint-disable-next-line import/no-unresolved
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
