import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

const componentTypes = [
  { name: '🎨 Custom Component', value: 'custom' },
  { name: '📄 Header', value: 'header' },
  { name: '🎯 Hero Section', value: 'hero' },
  { name: '⭐ Features', value: 'features' },
  { name: '💰 Pricing', value: 'pricing' },
  { name: '💬 Testimonial', value: 'testimonial' },
  { name: '📝 Footer', value: 'footer' },
  { name: '🚀 Call to Action', value: 'cta' },
  { name: '🖼️ Gallery', value: 'gallery' },
  { name: '👥 Team', value: 'team' },
  { name: '📞 Contact', value: 'contact' }
];

// Convert any string to kebab-case for file/folder names
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Convert kebab-case to camelCase for JavaScript function names
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Convert kebab-case to PascalCase for JavaScript function names
function toPascalCase(str: string): string {
  return str.replace(/(^|-)([a-z])/g, (match, dash, letter) => letter.toUpperCase());
}

export async function createComponent() {
  console.log(chalk.blue.bold('🎨 Create a New Component\n'));
  
  try {
    // Check if we're in a Pagelume project
    const hasComponentsDir = await fs.pathExists('components');
    if (!hasComponentsDir) {
      console.error(chalk.red('Error: No components directory found. Are you in a Pagelume project?'));
      console.log(chalk.yellow('Run "pagelume init" to initialize a new project.'));
      process.exit(1);
    }
    
    // Gather component information with improved UX
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of component would you like to create?',
        choices: componentTypes,
        pageSize: 12
      },
      {
        type: 'input',
        name: 'customType',
        message: 'Enter your custom component type:',
        when: (answers) => answers.type === 'custom',
        validate: (input) => {
          if (!input) return 'Component type is required';
          const kebabCase = toKebabCase(input);
          if (!kebabCase) return 'Please enter a valid component type';
          return true;
        },
        filter: (input) => toKebabCase(input)
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'What should we call this component?',
        validate: (input) => {
          if (!input) return 'Component name is required';
          const kebabCase = toKebabCase(input);
          if (!kebabCase) return 'Please enter a valid component name';
          return true;
        },
        transformer: (input) => {
          return chalk.gray(`(will create: ${toKebabCase(input)})`);
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Brief description (optional):',
        default: ''
      },
      {
        type: 'checkbox',
        name: 'vendors',
        message: 'Select any vendor scripts you need:',
        choices: [
          { name: 'jQuery', value: 'jquery' },
          { name: 'Bootstrap', value: 'bootstrap' },
          { name: 'Slick Carousel', value: 'slick' },
          { name: 'GSAP Animation', value: 'gsap' },
          { name: 'GSAP ScrollTrigger', value: 'gsapScrollTrigger' },
          { name: 'AOS (Animate On Scroll)', value: 'aos' },
          { name: 'Swiper', value: 'swiper' },
          { name: 'Isotope Layout', value: 'isotope' },
          { name: 'Lightbox2', value: 'lightbox2' }
        ],
        pageSize: 10
      }
    ]);
    
    const componentType = answers.type === 'custom' ? answers.customType : answers.type;
    const variationName = toKebabCase(answers.componentName);
    const displayName = answers.componentName;
    const componentPath = path.join('components', componentType, variationName);
    
    // Check if component already exists
    if (await fs.pathExists(componentPath)) {
      console.error(chalk.red(`\n❌ Component ${componentType}/${variationName} already exists!`));
      process.exit(1);
    }
    
    console.log(chalk.blue('\n📁 Creating component structure...'));
    
    // Create directories
    await fs.ensureDir(path.join(componentPath, 'assets', 'css'));
    await fs.ensureDir(path.join(componentPath, 'assets', 'scss'));
    await fs.ensureDir(path.join(componentPath, 'assets', 'js'));
    await fs.ensureDir(path.join(componentPath, 'assets', 'img'));
    
    // Create meta.json
    const meta = {
      name: displayName,
      type: componentType,
      variation: variationName,
      description: answers.description || `A ${componentType} component`,
      version: '1.0.0',
      vendors: answers.vendors,
      fields: [
        {
          name: 'content',
          type: 'text',
          label: 'Content',
          default: 'Sample content'
        }
      ]
    };
    
    await fs.writeJSON(path.join(componentPath, 'meta.json'), meta, { spaces: 2 });
    
    // Create component template based on type
    const template = getComponentTemplate(componentType, variationName, answers.vendors);
    await fs.writeFile(path.join(componentPath, 'index.html'), template.html);
    
    // Create SCSS file
    await fs.writeFile(path.join(componentPath, 'assets', 'scss', 'styles.scss'), template.scss);
    
    // Create JS file
    await fs.writeFile(path.join(componentPath, 'assets', 'js', 'script.js'), template.js);
    
    console.log(chalk.green.bold('\n✅ Component created successfully!'));
    console.log(chalk.cyan(`\n📍 Location: ${componentPath}`));
    console.log(chalk.gray(`🔗 URL: /preview/${componentType}/${variationName}`));
    
    console.log(chalk.yellow('\n🚀 Next steps:'));
    console.log(chalk.white('  1. ') + chalk.cyan('npm run dev') + chalk.white(' - Start development server'));
    console.log(chalk.white('  2. Edit ') + chalk.gray('index.html') + chalk.white(' - Component template'));
    console.log(chalk.white('  3. Edit ') + chalk.gray('meta.json') + chalk.white(' - Add dynamic fields'));
    console.log(chalk.white('  4. Style ') + chalk.gray('assets/scss/styles.scss') + chalk.white(' - Component styles'));
    console.log(chalk.white('  5. Code ') + chalk.gray('assets/js/script.js') + chalk.white(' - Component behavior'));
    
  } catch (error) {
    console.error(chalk.red('Error creating component:'), error);
    process.exit(1);
  }
}

function getComponentTemplate(type: string, variation: string, vendors: string[]) {
  const vendorsAttr = vendors.length > 0 ? ` data-pagelume-vendors="${vendors.join(',')}"` : '';
  
  const templates: Record<string, any> = {
    header: {
      html: `<header class="${variation}-header" data-pagelume-component="Header"${vendorsAttr}>
  <div class="container">
    <nav class="navbar">
      <div class="navbar-brand">
        {{#if logo}}
        <img src="{{logo}}" alt="{{siteName}}" class="logo">
        {{else}}
        <span class="site-name">{{siteName}}</span>
        {{/if}}
      </div>
      
      <ul class="navbar-menu">
        {{#each menuItems}}
        <li class="menu-item">
          <a href="{{this.url}}" class="menu-link">{{this.label}}</a>
        </li>
        {{/each}}
      </ul>
      
      <button class="mobile-menu-toggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  </div>
</header>`,
      scss: `@import '@pagelume/sdk/global-assets/scss/variables';
@import '@pagelume/sdk/global-assets/scss/mixins';

.${variation}-header {
  background-color: $white;
  box-shadow: $box-shadow-sm;
  position: sticky;
  top: 0;
  z-index: $zindex-sticky;
  
  .navbar {
    @include flex-between;
    padding: $spacer 0;
  }
  
  .navbar-brand {
    .logo {
      height: 40px;
      width: auto;
    }
    
    .site-name {
      font-size: $h4-font-size;
      font-weight: $font-weight-bold;
      color: $primary;
    }
  }
  
  .navbar-menu {
    display: none;
    list-style: none;
    margin: 0;
    padding: 0;
    
    @include md-up {
      display: flex;
      gap: $spacer * 2;
    }
  }
  
  .menu-link {
    color: $gray-700;
    text-decoration: none;
    font-weight: $font-weight-medium;
    transition: color 0.3s ease;
    
    &:hover {
      color: $primary;
    }
  }
  
  .mobile-menu-toggle {
    @include md-up {
      display: none;
    }
  }
}`,
      js: `(function() {
  'use strict';
  
  // Initialize header component
  function initializeHeader() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.navbar-menu');
    
    if (toggle && menu) {
      toggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
      });
    }
  }
  
  // Wait for vendors to be loaded if any
  if (${vendors.length > 0}) {
    window.addEventListener('pagelume:vendorsLoaded', initializeHeader);
  } else {
    // No vendors needed, initialize immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeHeader);
    } else {
      initializeHeader();
    }
  }
})();`
    },
    hero: {
      html: `<section class="${variation}-hero" data-pagelume-component="Hero"${vendorsAttr}>
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">{{title}}</h1>
      {{#if subtitle}}
      <p class="hero-subtitle">{{subtitle}}</p>
      {{/if}}
      
      {{#if buttons}}
      <div class="hero-buttons">
        {{#each buttons}}
        <a href="{{this.url}}" class="btn {{this.style}}">{{this.text}}</a>
        {{/each}}
      </div>
      {{/if}}
    </div>
    
    {{#if backgroundImage}}
    <div class="hero-background">
      <img src="{{backgroundImage}}" alt="">
    </div>
    {{/if}}
  </div>
</section>`,
      scss: `@import '@pagelume/sdk/global-assets/scss/variables';
@import '@pagelume/sdk/global-assets/scss/mixins';

.${variation}-hero {
  position: relative;
  padding: $spacer * 6 0;
  overflow: hidden;
  
  @include md-up {
    padding: $spacer * 8 0;
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .hero-title {
    @include heading-style($h1-font-size * 1.5);
    
    @include md-up {
      font-size: $h1-font-size * 2;
    }
  }
  
  .hero-subtitle {
    font-size: $font-size-lg;
    color: $gray-600;
    margin-bottom: $spacer * 2;
  }
  
  .hero-buttons {
    display: flex;
    gap: $spacer;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn {
    @include button-base;
    
    &.primary {
      @include button-variant($primary);
    }
    
    &.secondary {
      @include button-variant($secondary);
    }
  }
  
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    &::after {
      @include overlay(rgba($black, 0.5));
    }
  }
}`,
      js: `(function() {
  'use strict';
  
  // Initialize hero component
  function initializeHero() {
    console.log('${variation} hero component initialized');
    
    // Example: Add any initialization code here
    // If using jQuery: $(document).ready(function() { ... });
    // If using GSAP: gsap.from('.hero-title', { ... });
  }
  
  // Wait for vendors to be loaded if any
  if (${vendors.length > 0}) {
    window.addEventListener('pagelume:vendorsLoaded', initializeHero);
  } else {
    // No vendors needed, initialize immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeHero);
    } else {
      initializeHero();
    }
  }
})();`
    }
  };
  
  // Default template for other types
  const defaultTemplate = {
    html: `<section class="${variation}-${type}" data-pagelume-component="${type}"${vendorsAttr}>
  <div class="container">
    <div class="content">
      {{content}}
    </div>
  </div>
</section>`,
    scss: `@import '@pagelume/sdk/global-assets/scss/variables';
@import '@pagelume/sdk/global-assets/scss/mixins';

.${variation}-${type} {
  padding: $spacer * 4 0;
  
  .content {
    // Add your styles here
  }
}`,
    js: `(function() {
  'use strict';
  
  // Initialize ${type} component
  function initialize${toPascalCase(variation)}${toPascalCase(type)}() {
    console.log('${variation} ${type} component initialized');
    
    // Add your initialization code here
    // If using jQuery: $(document).ready(function() { ... });
    // If using other vendors, they will be available at this point
  }
  
  // Wait for vendors to be loaded if any
  if (${vendors.length > 0}) {
    window.addEventListener('pagelume:vendorsLoaded', initialize${toPascalCase(variation)}${toPascalCase(type)});
  } else {
    // No vendors needed, initialize immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize${toPascalCase(variation)}${toPascalCase(type)});
    } else {
      initialize${toPascalCase(variation)}${toPascalCase(type)}();
    }
  }
})();`
  };
  
  return templates[type] || defaultTemplate;
} 