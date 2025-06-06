import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import sass from 'sass';
import { Component, ComponentMeta, BuildOptions } from '../types/index.js';

export class ComponentBuilder {
  private options: BuildOptions;

  constructor(options: BuildOptions) {
    this.options = {
      minify: false,
      sourceMap: false,
      watch: false,
      ...options
    };
  }

  /**
   * Build all components
   */
  async build(): Promise<Component[]> {
    const components: Component[] = [];
    const componentPaths = await this.findComponents();

    for (const componentPath of componentPaths) {
      try {
        const component = await this.buildComponent(componentPath);
        components.push(component);
      } catch (error) {
        console.error(`Failed to build component at ${componentPath}:`, error);
      }
    }

    return components;
  }

  /**
   * Build a single component
   */
  async buildComponent(componentPath: string): Promise<Component> {
    // Read meta.json
    const metaPath = path.join(componentPath, 'meta.json');
    const meta: ComponentMeta = await fs.readJSON(metaPath);

    // Read template
    const templatePath = path.join(componentPath, 'index.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Build styles
    const styles = await this.buildStyles(componentPath);

    // Build scripts
    const scripts = await this.buildScripts(componentPath);

    // Find assets
    const assets = await this.findAssets(componentPath);

    return {
      meta,
      template,
      styles,
      scripts,
      assets
    };
  }

  /**
   * Find all components in the source directory
   */
  private async findComponents(): Promise<string[]> {
    const pattern = path.join(this.options.sourcePath, '**/meta.json');
    const metaFiles = await glob(pattern, {
      ignore: ['node_modules/**', 'dist/**']
    });

    return metaFiles.map((metaFile: string) => path.dirname(metaFile));
  }

  /**
   * Build component styles
   */
  private async buildStyles(componentPath: string): Promise<string> {
    const scssPath = path.join(componentPath, 'assets/scss/styles.scss');
    const cssPath = path.join(componentPath, 'assets/css/styles.css');

    // Check for SCSS file first
    if (await fs.pathExists(scssPath)) {
      const result = sass.compile(scssPath, {
        sourceMap: this.options.sourceMap,
        style: this.options.minify ? 'compressed' : 'expanded',
        loadPaths: [
          path.resolve(process.cwd(), 'node_modules'),
          path.resolve(process.cwd(), 'node_modules/@pagelume/component-sdk')
        ]
      });

      // Write compiled CSS
      await fs.ensureDir(path.dirname(cssPath));
      await fs.writeFile(cssPath, result.css);

      if (this.options.sourceMap && result.sourceMap) {
        await fs.writeFile(`${cssPath}.map`, JSON.stringify(result.sourceMap));
      }

      return result.css;
    }

    // Check for CSS file
    if (await fs.pathExists(cssPath)) {
      return await fs.readFile(cssPath, 'utf-8');
    }

    return '';
  }

  /**
   * Build component scripts
   */
  private async buildScripts(componentPath: string): Promise<string> {
    const jsPath = path.join(componentPath, 'assets/js/script.js');

    if (await fs.pathExists(jsPath)) {
      const script = await fs.readFile(jsPath, 'utf-8');
      
      if (this.options.minify) {
        // In a real implementation, you would use a minifier like terser
        return script.replace(/\s+/g, ' ').trim();
      }

      return script;
    }

    return '';
  }

  /**
   * Find component assets
   */
  private async findAssets(componentPath: string): Promise<Component['assets']> {
    const assetsPath = path.join(componentPath, 'assets');
    const assets: Component['assets'] = {
      css: [],
      js: [],
      images: []
    };

    if (!await fs.pathExists(assetsPath)) {
      return assets;
    }

    // Find CSS files
    const cssFiles = await glob('css/**/*.css', {
      cwd: assetsPath
    });
    assets.css = cssFiles;

    // Find JS files
    const jsFiles = await glob('js/**/*.js', {
      cwd: assetsPath
    });
    assets.js = jsFiles;

    // Find image files
    const imageFiles = await glob('img/**/*.{jpg,jpeg,png,gif,svg,webp}', {
      cwd: assetsPath
    });
    assets.images = imageFiles;

    return assets;
  }

  /**
   * Watch for changes
   */
  async watch(callback: (component: Component) => void): Promise<void> {
    if (!this.options.watch) {
      throw new Error('Watch mode is not enabled');
    }

    // Implementation would use chokidar or similar
    // For now, this is a placeholder
    console.log('Watch mode not fully implemented yet');
  }
} 