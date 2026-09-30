import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  test: { include: ['tests/**/*.test.ts'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/zrender/')) return 'chart-renderer'
          if (id.includes('/echarts/')) return 'charts'
          if (id.includes('/vuetify/')) return 'controls'
          if (id.includes('/@vue/') || id.includes('/vue/')) return 'vue'
        },
      },
    },
  },
})
