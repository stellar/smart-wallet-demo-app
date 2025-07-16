import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: './src/config/',
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
