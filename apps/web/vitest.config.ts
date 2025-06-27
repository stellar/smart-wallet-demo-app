import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'

import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  test: {
    environment: 'jsdom', // Use jsdom for DOM API support
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    globals: true, // Enable global test APIs like `describe`, `it`
    setupFiles: './src/setup-tests.ts', // Setup file path
    css: true, // Enable CSS if you're importing CSS files in components
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text', 'cobertura', 'lcov'],
      exclude: [
        'src/index.tsx',
        'src/**/App.tsx',
        'src/**/types.ts',
        'src/**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/**/config/**',
        'src/**/routes/**',
        'src/**/interfaces/**',
      ],
    },
  },
  resolve: {
    alias: {
      'test-utils': '/src/helpers/tests/index.tsx',
    },
  },
})
