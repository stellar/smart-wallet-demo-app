import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  envDir: './src/config/',
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    nodePolyfills({
      protocolImports: true,
    }),
    ...(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT_WEB && process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT_WEB,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: {
              setCommits: {
                auto: true,
              },
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
