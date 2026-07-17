import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    watch: {
      ignored: ['**/music/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/xiaohongshu': {
        target: 'https://sf1-cdn-tos.huoshanstatic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xiaohongshu/, '')
      },
      '/chinaz': {
        target: 'http://downsc.chinaz.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chinaz/, '')
      },
      '/soundhelix': {
        target: 'https://www.soundhelix.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soundhelix/, '')
      },
      '/kozco': {
        target: 'https://www.kozco.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kozco/, '')
      },
      '/myhk': {
        target: 'https://myhkw.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/myhk/, '')
      }
    }
  }
})