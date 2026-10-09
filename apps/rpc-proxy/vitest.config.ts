import path from 'path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: path.resolve(__dirname, './'),
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    coverage: {
      provider: 'istanbul',
      reporter: ['cobertura', 'json', 'html', 'text', 'lcov'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.test.ts'],
      all: true,
      clean: true,
    },
  },
})
