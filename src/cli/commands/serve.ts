import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export async function serveComponents(options: { port: string }) {
  console.log(chalk.blue.bold('🚀 Starting Pagelume Component Server\n'));
  
  try {
    // Check if we're in a Pagelume project
    const hasComponentsDir = await fs.pathExists('components');
    if (!hasComponentsDir) {
      console.error(chalk.red('Error: No components directory found. Are you in a Pagelume project?'));
      console.log(chalk.yellow('Run "pagelume init" to initialize a new project.'));
      process.exit(1);
    }
    
    // Create index.html if it doesn't exist
    const indexPath = 'index.html';
    if (!await fs.pathExists(indexPath)) {
      console.log(chalk.yellow('Creating index.html for component preview...'));
      await createIndexHtml();
    }
    
    // Create preview pages directory
    await fs.ensureDir('preview');
    
    // Generate component list page
    await generateComponentListPage();
    
    console.log(chalk.green(`Starting development server on port ${options.port}...`));
    console.log(chalk.cyan(`\nView your components at: http://localhost:${options.port}\n`));
    
    // Start Vite server
    const viteConfig = path.resolve(process.cwd(), 'vite.component.config.js');
    const hasCustomConfig = await fs.pathExists(viteConfig);
    
    const viteArgs = [
      'vite',
      '--port',
      options.port,
      '--open'
    ];
    
    if (hasCustomConfig) {
      viteArgs.push('--config', viteConfig);
    } else {
      // Use the SDK's vite config
      const sdkConfig = path.resolve(__dirname, '../../../vite.component.config.js');
      viteArgs.push('--config', sdkConfig);
    }
    
    const vite = spawn('npx', viteArgs, {
      stdio: 'inherit',
      shell: true
    });
    
    vite.on('error', (error) => {
      console.error(chalk.red('Failed to start Vite:'), error);
      process.exit(1);
    });
    
    vite.on('close', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Vite exited with code ${code}`));
        process.exit(code || 1);
      }
    });
    
  } catch (error) {
    console.error(chalk.red('Error starting server:'), error);
    process.exit(1);
  }
}

async function createIndexHtml() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagelume Component Gallery</title>
  <link rel="stylesheet" href="/node_modules/@pagelume/component-sdk/global-assets/scss/pagelume-global.scss">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .gallery-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .gallery-header h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .component-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .component-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .component-type {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .component-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }
    .component-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }
    .component-actions {
      display: flex;
      gap: 10px;
    }
    .component-link {
      display: inline-block;
      padding: 8px 16px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;
    }
    .component-link:hover {
      background: #0056b3;
    }
    .component-link.secondary {
      background: #6c757d;
    }
    .component-link.secondary:hover {
      background: #545b62;
    }
  </style>
</head>
<body>
  <div class="gallery-header">
    <h1>Pagelume Component Gallery</h1>
    <p>Browse and preview your components</p>
  </div>
  <div id="component-list" class="component-grid">
    <!-- Components will be loaded here -->
  </div>
  
  <script src="/node_modules/@pagelume/component-sdk/global-assets/js/pagelume-core.js"></script>
  <script>
    // Load component list
    fetch('/api/components')
      .then(res => res.json())
      .then(components => {
        const container = document.getElementById('component-list');
        if (components.length === 0) {
          container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No components found. Run "pagelume create" to create your first component.</p>';
          return;
        }
        
        components.forEach(component => {
          const card = document.createElement('div');
          card.className = 'component-card';
          card.innerHTML = \`
            <div class="component-type">\${component.type}</div>
            <div class="component-name">\${component.name}</div>
            <div class="component-description">\${component.description || 'No description'}</div>
            <div class="component-actions">
              <a href="/preview/\${component.type}/\${component.variation}" class="component-link">Preview</a>
              <a href="/preview/\${component.type}/\${component.variation}?edit=true" class="component-link secondary">Edit Data</a>
            </div>
          \`;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error('Failed to load components:', err);
      });
  </script>
</body>
</html>`;
  
  await fs.writeFile('index.html', html);
}

async function generateComponentListPage() {
  // This would be handled by the Vite dev server middleware
  // For now, we'll create a simple preview system
} 