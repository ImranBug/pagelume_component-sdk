# Pagelume Component SDK

Official SDK for building modular, reusable web components for the Pagelume platform.

## Features

- 🎨 **Component Templates** - Pre-built templates for common component types
- 🎯 **Handlebars Support** - Full templating with custom helpers
- 💅 **Global Styles** - SCSS variables, mixins, and utility classes
- 📦 **Vendor Scripts** - Easy integration with popular libraries
- ⚡ **Hot Reload** - Instant preview updates with Vite
- 🔧 **CLI Tools** - Command-line tools for component management

## Installation

```bash
npm install @pagelume/component-sdk
```

## Quick Start

### 1. Initialize a New Project

```bash
npx @pagelume/component-sdk init
cd my-components
npm install
```

### 2. Create a Component

```bash
npx @pagelume/component-sdk create
```

Follow the prompts to create your component.

### 3. Start Development Server

```bash
npx @pagelume/component-sdk serve
```

Visit `http://localhost:3000` to see your components.

## Component Structure

Each component follows this structure:

```
components/
├── [component-type]/
│   └── [variation-name]/
│       ├── index.html      # Handlebars template
│       ├── meta.json       # Component metadata
│       └── assets/
│           ├── css/        # Compiled CSS
│           ├── scss/       # SCSS source files
│           ├── js/         # JavaScript files
│           └── img/        # Images
```

### Example meta.json

```json
{
  "name": "Simple Hero",
  "type": "hero",
  "variation": "simple-hero",
  "description": "A basic hero section",
  "version": "1.0.0",
  "vendors": ["gsap"],
  "fields": [
    {
      "name": "title",
      "type": "text",
      "label": "Title",
      "default": "Welcome"
    },
    {
      "name": "subtitle",
      "type": "text",
      "label": "Subtitle",
      "default": "Build amazing components"
    }
  ]
}
```

## Global Assets

### SCSS Variables & Mixins

Import global styles in your component SCSS:

```scss
@import '@pagelume/sdk/global-assets/scss/variables';
@import '@pagelume/sdk/global-assets/scss/mixins';

.my-component {
  color: $primary;
  @include container;
  
  @include md-up {
    padding: $spacer * 2;
  }
}
```

### Vendor Scripts

Add vendor dependencies using the `data-pagelume-vendors` attribute:

```html
<div data-pagelume-vendors="jquery,slick">
  <!-- Your component -->
</div>
```

Available vendors:
- `jquery` - jQuery
- `bootstrap` - Bootstrap 5
- `slick` - Slick Carousel
- `gsap` - GSAP Animation
- `gsapScrollTrigger` - GSAP ScrollTrigger
- `aos` - Animate On Scroll
- `swiper` - Swiper.js
- `isotope` - Isotope Layout
- `lightbox2` - Lightbox2

## Handlebars Helpers

The SDK provides numerous custom Handlebars helpers:

### Comparison Helpers
- `{{#if (eq value1 value2)}}` - Equal
- `{{#if (ne value1 value2)}}` - Not equal
- `{{#if (lt value1 value2)}}` - Less than
- `{{#if (gt value1 value2)}}` - Greater than
- `{{#if (and condition1 condition2)}}` - Logical AND
- `{{#if (or condition1 condition2)}}` - Logical OR

### String Helpers
- `{{uppercase text}}` - Convert to uppercase
- `{{lowercase text}}` - Convert to lowercase
- `{{capitalize text}}` - Capitalize first letter
- `{{truncate text 50}}` - Truncate text
- `{{slugify text}}` - Convert to URL slug

### Array Helpers
- `{{length array}}` - Get array length
- `{{first array}}` - Get first item
- `{{last array}}` - Get last item
- `{{join array ", "}}` - Join array items

### Math Helpers
- `{{add num1 num2}}` - Addition
- `{{subtract num1 num2}}` - Subtraction
- `{{multiply num1 num2}}` - Multiplication
- `{{divide num1 num2}}` - Division

## CLI Commands

### Initialize Project
```bash
npx @pagelume/component-sdk init
```

### Create Component
```bash
npx @pagelume/component-sdk create
```

### List Components
```bash
npx @pagelume/component-sdk list
```

### Serve Components
```bash
npx @pagelume/component-sdk serve [--port 3000]
```

If you have the package installed locally, you can also use the shorter `pagelume-cli` command:
```bash
npm install @pagelume/component-sdk
pagelume-cli init
pagelume-cli create
pagelume-cli list
pagelume-cli serve
```

## API Usage

### ComponentBuilder

```javascript
import { ComponentBuilder } from '@pagelume/component-sdk';

const builder = new ComponentBuilder({
  sourcePath: './components',
  outputPath: './dist'
});

const components = await builder.build();
```

### ComponentRenderer

```javascript
import { ComponentRenderer } from '@pagelume/component-sdk';

const renderer = new ComponentRenderer();
const html = renderer.render(component, {
  data: { title: 'Hello World' },
  inlineStyles: true,
  inlineScripts: true
});
```

### Vite Plugin

```javascript
// vite.config.js
import { VitePlugin } from '@pagelume/component-sdk';

export default {
  plugins: [
    VitePlugin({
      componentsDir: 'components',
      enableHMR: true
    })
  ]
};
```

## Development

To work on the SDK itself:

```bash
# Clone the repository
git clone https://github.com/ImranBug/pagelume_component-sdk.git
cd component-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Run in development mode
npm run dev
```

## License

MIT

## Support

For issues and feature requests, please visit our [GitHub repository](https://github.com/ImranBug/pagelume_component-sdk). 