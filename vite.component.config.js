import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';

// Function to scan for components
function getComponents() {
  const componentsDir = resolve(__dirname, 'components');
  const components = [];
  
  try {
    const componentTypes = readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    componentTypes.forEach(type => {
      const typeDir = resolve(componentsDir, type);
      const variations = readdirSync(typeDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      variations.forEach(variation => {
        const componentPath = resolve(typeDir, variation);
        const metaPath = resolve(componentPath, 'meta.json');
        
        try {
          const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
          components.push({
            type,
            variation,
            path: componentPath,
            meta
          });
        } catch (e) {
          console.warn(`Failed to load meta.json for ${type}/${variation}`);
        }
      });
    });
  } catch (e) {
    console.warn('No components directory found');
  }
  
  return components;
}

export default defineConfig({
  root: resolve(__dirname),
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'components'),
      context: {
        // Default context data for Handlebars
        title: 'Pagelume Component Preview',
        components: getComponents()
      }
    })
  ],
  resolve: {
    alias: {
      '@pagelume/sdk': resolve(__dirname, 'src'),
      '@global': resolve(__dirname, 'global-assets')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@global/scss/variables";`
      }
    }
  }
}); 