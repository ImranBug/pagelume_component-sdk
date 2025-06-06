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
        'dev': 'pagelume serve',
        'create': 'pagelume create',
        'list': 'pagelume list'
      },
      devDependencies: {
        '@pagelume/component-sdk': '^1.0.0'
      }
    };
    
    await fs.writeJSON('package.json', packageJson, { spaces: 2 });
    
    // Create directory structure
    await fs.ensureDir('components');
    await fs.ensureDir('assets/global');
    
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