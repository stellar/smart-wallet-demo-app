import path from 'path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: path.resolve(__dirname, './'),
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/config/setup-tests.ts'],
    fileParallelism: false,
    coverage: {
      reporter: ['json', 'html', 'text-summary', 'cobertura'],
      exclude: ['node_modules/', 'src/config/', 'vitest.config.ts'],
    },
    exclude: ['node_modules/', 'src/config/'],
  },
})
