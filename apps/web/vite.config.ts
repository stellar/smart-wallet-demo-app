import react from '@vitejs/plugin-react'
import { defineConfig, PluginOption } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'

import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: './src/config/',
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
