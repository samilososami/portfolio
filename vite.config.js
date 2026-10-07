import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'tools-directory-index',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/tools' || url.pathname === '/tools/') {
          req.url = '/tools/index.html' + url.search;
        }
        next();
      });
    }
  }],
  server: {
    port: 3000,
    proxy: {
      '/tools/casio/casiovideo': {target:'http://localhost:5178',changeOrigin:true}
    }
  }
})
