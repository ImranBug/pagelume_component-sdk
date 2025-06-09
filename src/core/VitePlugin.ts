import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs-extra';
import { glob } from 'glob';
import { ComponentBuilder } from './ComponentBuilder.js';
import { ComponentRenderer } from './ComponentRenderer.js';
import { VitePluginOptions } from '../types/index.js';

export function VitePlugin(options: VitePluginOptions = {}): Plugin {
  const {
    componentsDir = 'components',
    globalAssetsDir = 'node_modules/@pagelume/component-sdk/global-assets',
    enableHMR = true
  } = options;

  let builder: ComponentBuilder;
  let renderer: ComponentRenderer;

  return {
    name: 'pagelume-component-sdk',

    configResolved(config: ResolvedConfig) {
      builder = new ComponentBuilder({
        sourcePath: path.resolve(config.root, componentsDir),
        outputPath: path.resolve(config.root, 'dist'),
        sourceMap: config.build.sourcemap !== false
      });

      renderer = new ComponentRenderer();
    },

    configureServer(server: ViteDevServer) {
      // Add middleware for component API
      server.middlewares.use('/api/components', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const components = await builder.build();
          const componentList = components.map(c => ({
            name: c.meta.name,
            type: c.meta.type,
            variation: c.meta.variation,
            description: c.meta.description,
            vendors: c.meta.vendors
          }));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(componentList));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // Add middleware for component preview
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/preview/')) {
          return next();
        }

        try {
          const urlParts = req.url.split('/').filter(Boolean);
          if (urlParts.length < 3) {
            return next();
          }

          const [, type, variation] = urlParts;
          const componentPath = path.join(componentsDir, type, variation);
          
          if (!await fs.pathExists(componentPath)) {
            return next();
          }

          const component = await builder.buildComponent(componentPath);
          
          // Generate sample data from fields
          const sampleData: any = {};
          component.meta.fields.forEach(field => {
            if (field.default !== undefined) {
              sampleData[field.name] = field.default;
            }
          });

          // Render the component
          const html = renderer.render(component, {
            data: sampleData,
            preview: true,
            inlineStyles: true,
            inlineScripts: true
          });

          // Create full HTML page
          const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${component.meta.name} - Pagelume Component Preview</title>
  <link rel="stylesheet" href="/${globalAssetsDir}/scss/pagelume-global.scss">
  <style>
    .pagelume-preview {
      margin: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }
    .pagelume-preview__info {
      background: #f5f5f5;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .pagelume-preview__type {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .pagelume-preview__name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-left: 10px;
    }
    .pagelume-preview__content {
      position: relative;
    }
  </style>
  ${component.meta.vendors?.map(v => 
    `<!-- Vendor: ${v} will be loaded by vendor-loader.js -->`
  ).join('\n')}
</head>
<body>
  ${html}
  
  <script src="/${globalAssetsDir}/js/pagelume-core.js"></script>
  <script src="/${globalAssetsDir}/js/vendor-loader.js"></script>
  ${component.meta.vendors?.length ? `
  <script>
    // Auto-load required vendors
    Pagelume.loadVendors(${JSON.stringify(component.meta.vendors)});
  </script>
  ` : ''}
</body>
</html>`;

          res.setHeader('Content-Type', 'text/html');
          res.end(fullHtml);
        } catch (error: any) {
          console.error('Error rendering component:', error);
          next();
        }
      });

      // Enable HMR for components
      if (enableHMR) {
        server.watcher.add(path.join(componentsDir, '**/*'));
        
        server.watcher.on('change', async (file) => {
          if (file.includes(componentsDir)) {
            const componentDir = findComponentDir(file, componentsDir);
            if (componentDir) {
              server.ws.send({
                type: 'custom',
                event: 'pagelume:component-update',
                data: { path: componentDir }
              });
            }
          }
        });
      }
    },

    transformIndexHtml(html) {
      // Inject Pagelume client-side HMR code
      if (enableHMR) {
        return html.replace(
          '</body>',
          `<script>
            if (import.meta.hot) {
              import.meta.hot.on('pagelume:component-update', (data) => {
                console.log('Component updated:', data.path);
                window.location.reload();
              });
            }
          </script>
          </body>`
        );
      }
      return html;
    }
  };
}

function findComponentDir(file: string, componentsDir: string): string | null {
  const relative = path.relative(componentsDir, file);
  const parts = relative.split(path.sep);
  
  if (parts.length >= 2) {
    return path.join(componentsDir, parts[0], parts[1]);
  }
  
  return null;
} 