import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PagelumeComponentSDK',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'vite',
        'express',
        'handlebars',
        'sass',
        'fs',
        'path',
        'url',
        'glob',
        'fs-extra',
        'chalk',
        'commander',
        'inquirer'
      ]
    }
  }
}); 