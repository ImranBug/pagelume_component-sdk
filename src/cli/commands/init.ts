import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initProject() {
  console.log(chalk.blue.bold('🚀 Initializing a new Pagelume Component Project'));
  
  try {
    // Check if current directory is empty
    const files = await fs.readdir(process.cwd());
    const hasFiles = files.some(file => !file.startsWith('.'));
    
    if (hasFiles) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Current directory is not empty. Continue?',
          default: false
        }
      ]);
      
      if (!proceed) {
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }
    }
    
    // Get project information
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'A collection of Pagelume components'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author:',
        default: ''
      }
    ]);
    
    console.log(chalk.blue('\n📦 Setting up project structure...'));
    
    // Create package.json
    const packageJson = {
      name: answers.projectName,
      version: '1.0.0',
      description: answers.description,
      author: answers.author,
      type: 'module',
      scripts: {
        'dev': 'pagelume-cli serve',
        'create': 'pagelume-cli create',
        'list': 'pagelume-cli list'
      },
      devDependencies: {
        '@pagelume/component-sdk': '^1.0.3'
      }
    };
    
    await fs.writeJSON('package.json', packageJson, { spaces: 2 });
    
    // Create directory structure
    await fs.ensureDir('components');
    
    // Copy template files
    const templatesDir = path.resolve(__dirname, '../../../templates');
    
    // Create .gitignore
    const gitignoreContent = `node_modules/
dist/
.DS_Store
*.log
.env
.vscode/
.idea/`;
    
    await fs.writeFile('.gitignore', gitignoreContent);
    
    // Create vite.config.js
    const viteConfigContent = `import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import { readdirSync, readFileSync, existsSync } from 'fs';

// Function to scan for components
function getComponents() {
  const componentsDir = resolve(process.cwd(), 'components');
  const components = [];
  
  if (!existsSync(componentsDir)) {
    return components;
  }
  
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
            meta,
            id: \`\${type}-\${variation}\`
          });
        } catch (e) {
          console.warn(\`Failed to load meta.json for \${type}/\${variation}\`);
        }
      });
    });
  } catch (e) {
    console.error('Error scanning components:', e);
  }
  
  return components;
}

// Custom plugin to serve component data and previews
function pagelumeComponentPlugin() {
  return {
    name: 'pagelume-component-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // API endpoint for component data
        if (req.url === '/api/components') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(getComponents()));
          return;
        }
        
        // Component preview pages
        const previewMatch = req.url.match(/^\\/preview\\/([^/]+)\\/([^/?]+)/);
        if (previewMatch) {
          const [, type, variation] = previewMatch;
          const components = getComponents();
          const component = components.find(c => c.type === type && c.variation === variation);
          
          if (component) {
            // Compile template on server side
            const templatePath = resolve(process.cwd(), \`components/\${type}/\${variation}/index.html\`);
            const templateContent = readFileSync(templatePath, 'utf-8');
            
            // Import handlebars server-side
            const handlebars = await import('handlebars').then(m => m.default);
            const compiledTemplate = handlebars.compile(templateContent);
            
            // Generate data from fields
            const data = component.meta.fields.reduce((acc, field) => {
              acc[field.name] = field.default || '';
              return acc;
            }, {});
            
            // Render the component
            const renderedComponent = compiledTemplate(data);
            
            const previewHtml = \`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>\${component.meta.name} - Preview</title>
  <link rel="stylesheet" href="/components/\${type}/\${variation}/assets/css/styles.css">
  <style>
    body { margin: 0; padding: 20px; background: #f5f5f5; }
    .preview-container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  </style>
  \${component.meta.vendors?.map(v => 
    \`<!-- Vendor: \${v} will be loaded by vendor-loader.js -->\`
  ).join('\\n') || ''}
</head>
<body>
  <div class="preview-container">
    \${renderedComponent}
  </div>
  
  <script src="/node_modules/@pagelume/component-sdk/global-assets/js/pagelume-core.js"></script>
  <script src="/node_modules/@pagelume/component-sdk/global-assets/js/vendor-loader.js"></script>
  \${component.meta.vendors?.length ? \`
  <script>
    // Ensure vendors are loaded after everything is ready
    document.addEventListener('DOMContentLoaded', function() {
      if (window.Pagelume && window.Pagelume.loadVendors) {
        window.Pagelume.loadVendors(\${JSON.stringify(component.meta.vendors)}).then(function() {
          console.log('All vendors loaded successfully');
          // Trigger custom event to notify components that vendors are ready
          window.dispatchEvent(new CustomEvent('pagelume:vendorsLoaded'));
        }).catch(function(error) {
          console.error('Failed to load vendors:', error);
        });
      } else {
        console.error('Pagelume vendor loader not available');
      }
    });
  </script>
  \` : ''}
  <script src="/components/\${type}/\${variation}/assets/js/script.js"></script>
</body>
</html>\`;
            res.setHeader('Content-Type', 'text/html');
            res.end(previewHtml);
            return;
          }
        }
        
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(process.cwd(), 'components'),
      reloadOnPartialChange: true
    }),
    pagelumeComponentPlugin()
  ],
  resolve: {
    alias: {
      '@pagelume/sdk': '@pagelume/component-sdk',
      '@global': resolve(process.cwd(), 'node_modules/@pagelume/component-sdk/global-assets')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: \`@import "@global/scss/variables";\`
      }
    }
  }
});`;
    
    await fs.writeFile('vite.config.js', viteConfigContent);
    
    // Create README.md
    const readmeContent = `# ${answers.projectName}

${answers.description}

## Getting Started

This project uses the Pagelume Component SDK for building modular web components.

### Installation

\`\`\`bash
npm install
\`\`\`

### Creating a new component

\`\`\`bash
npm run create
\`\`\`

### Viewing components

\`\`\`bash
npm run dev
\`\`\`

### Listing all components

\`\`\`bash
npm run list
\`\`\`

## Component Structure

Each component follows this structure:
\`\`\`
components/
├── [component-type]/
│   └── [variation-name]/
│       ├── index.html    # Handlebars template
│       ├── meta.json     # Component metadata
│       └── assets/
│           ├── css/
│           ├── scss/
│           ├── js/
│           └── img/
\`\`\`

## Global Assets

Global styles and scripts available to all components are located in:
- \`node_modules/@pagelume/component-sdk/global-assets/\`

You can import global SCSS variables and mixins in your component styles:
\`\`\`scss
@import '@pagelume/sdk/global-assets/scss/variables';
@import '@pagelume/sdk/global-assets/scss/mixins';
\`\`\`

## Available Vendor Scripts

The SDK provides easy access to common vendor scripts:
- jQuery
- Bootstrap
- Slick Carousel
- GSAP
- AOS (Animate On Scroll)
- Swiper
- Isotope
- Lightbox2

To use vendor scripts in your components, add the \`data-pagelume-vendors\` attribute:
\`\`\`html
<div data-pagelume-vendors="jquery,slick">
  <!-- Your component content -->
</div>
\`\`\`
`;
    
    await fs.writeFile('README.md', readmeContent);
    
    // Create example component
    console.log(chalk.blue('\n🎨 Creating example component...'));
    
    const exampleDir = 'components/hero/example-hero';
    await fs.ensureDir(`${exampleDir}/assets/css`);
    await fs.ensureDir(`${exampleDir}/assets/scss`);
    await fs.ensureDir(`${exampleDir}/assets/js`);
    await fs.ensureDir(`${exampleDir}/assets/img`);
    
    // Example component meta.json
    const exampleMeta = {
      name: 'Example Hero',
      type: 'hero',
      variation: 'example-hero',
      description: 'A simple hero component example',
      version: '1.0.0',
      author: answers.author,
      vendors: [],
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          default: 'Welcome to Pagelume'
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
          default: 'Build amazing web components'
        },
        {
          name: 'buttonText',
          type: 'text',
          label: 'Button Text',
          default: 'Get Started'
        },
        {
          name: 'buttonUrl',
          type: 'url',
          label: 'Button URL',
          default: '#'
        }
      ]
    };
    
    await fs.writeJSON(`${exampleDir}/meta.json`, exampleMeta, { spaces: 2 });
    
    // Example component HTML
    const exampleHtml = `<section class="hero-section" data-pagelume-component="Hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">{{title}}</h1>
      <p class="hero-subtitle">{{subtitle}}</p>
      {{#if buttonText}}
      <a href="{{buttonUrl}}" class="hero-button">{{buttonText}}</a>
      {{/if}}
    </div>
  </div>
</section>`;
    
    await fs.writeFile(`${exampleDir}/index.html`, exampleHtml);
    
    // Example component SCSS
    const exampleScss = `// Import Pagelume global styles
@import '@pagelume/sdk/global-assets/scss/variables';
@import '@pagelume/sdk/global-assets/scss/mixins';

.hero-section {
  background: linear-gradient(135deg, $primary 0%, darken($primary, 10%) 100%);
  color: $white;
  padding: 100px 0;
  text-align: center;
  
  @include md-up {
    padding: 150px 0;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  @include heading-style($h1-font-size);
  margin-bottom: $spacer;
  
  @include md-up {
    font-size: $h1-font-size * 1.2;
  }
}

.hero-subtitle {
  font-size: $font-size-lg;
  margin-bottom: $spacer * 2;
  opacity: 0.9;
}

.hero-button {
  @include button-base;
  @include button-variant($white, $primary);
  font-size: $font-size-lg;
  padding: 12px 32px;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $box-shadow;
  }
}`;
    
    await fs.writeFile(`${exampleDir}/assets/scss/styles.scss`, exampleScss);
    
    // Example component JS
    const exampleJs = `// Example Hero Component JavaScript
(function() {
  'use strict';
  
  // Wait for Pagelume to be ready
  if (window.Pagelume && window.Pagelume.events) {
    window.Pagelume.events.on('ready', function() {
      console.log('Hero component initialized');
      
      // Example: Add animation on scroll
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
            }
          });
        });
        
        observer.observe(heroSection);
      }
    });
  }
})();`;
    
    await fs.writeFile(`${exampleDir}/assets/js/script.js`, exampleJs);
    
    console.log(chalk.green.bold('\n✅ Project initialized successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.white('  1. Install dependencies: ') + chalk.yellow('npm install'));
    console.log(chalk.white('  2. Start development server: ') + chalk.yellow('npm run dev'));
    console.log(chalk.white('  3. Create new components: ') + chalk.yellow('npm run create'));
    
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error);
    process.exit(1);
  }
}