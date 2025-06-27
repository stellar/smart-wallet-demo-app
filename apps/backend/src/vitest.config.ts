import path from 'path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: path.resolve(__dirname, './'),
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./config/setup-tests.ts'],
    fileParallelism: false,
    includeSource: ['./**/*.ts'],
    exclude: [
      'node_modules/',
      './config/',
      'vitest.config.ts',
      './api/.*\\.docs.ts',
      './api/core/migrations/',
      './api/core/seeds/',
      './api/core/docs/',
      './api/core/messages.ts',
      './*/.*\\.types.ts',
      '.*\\mocks.ts',
      '*.test.ts',
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['cobertura', 'json', 'html', 'text', 'lcov'],
      exclude: ['node_modules/', 'config/', '**/*.d.ts', '**/*.mock.ts', '**/*.test.ts'],
      all: true,
      clean: true,
    },
  },
})
