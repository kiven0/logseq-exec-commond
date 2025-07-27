import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [],
  base: './',
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    emptyOutDir: true,
    // 复制静态资源到构建目录
    assetsInclude: ['icon.png'],
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      // 外部化处理Node.js模块
      external: ['fs', 'path', 'os'],
      // 全局变量定义
      output: {
        globals: {}
      }
    },
  },
  // 定义Node.js全局变量
  define: {
    'process.env': {}
  },
  // 优化依赖项
  optimizeDeps: {
    exclude: []
  }
});