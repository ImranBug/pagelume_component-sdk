import Handlebars from 'handlebars';
import { Component, ComponentData, RenderOptions } from '../types/index.js';
import { HandlebarsHelpers } from './HandlebarsHelpers.js';

export class ComponentRenderer {
  private handlebars: typeof Handlebars;

  constructor() {
    // Create a new Handlebars instance
    this.handlebars = Handlebars.create();
    
    // Register custom helpers
    HandlebarsHelpers.registerHelpers(this.handlebars);
  }

  /**
   * Render a component with data
   */
  render(component: Component, options: RenderOptions): string {
    const { data, preview = false, inlineStyles = false, inlineScripts = false } = options;

    // Compile the template
    const template = this.handlebars.compile(component.template);

    // Merge default values with provided data
    const mergedData = this.mergeWithDefaults(component, data);

    // Render the template
    let html = template(mergedData);

    // Add styles if requested
    if (inlineStyles && component.styles) {
      html = `<style>${component.styles}</style>\n${html}`;
    }

    // Add scripts if requested
    if (inlineScripts && component.scripts) {
      html = `${html}\n<script>${component.scripts}</script>`;
    }

    // Wrap in preview container if needed
    if (preview) {
      html = this.wrapInPreview(html, component);
    }

    return html;
  }

  /**
   * Register a partial template
   */
  registerPartial(name: string, template: string): void {
    this.handlebars.registerPartial(name, template);
  }

  /**
   * Register a custom helper
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, helper);
  }

  /**
   * Merge provided data with component field defaults
   */
  private mergeWithDefaults(component: Component, data: ComponentData): ComponentData {
    const merged = { ...data };

    // Apply default values from component fields
    component.meta.fields.forEach(field => {
      if (!(field.name in merged) && field.default !== undefined) {
        merged[field.name] = field.default;
      }
    });

    return merged;
  }

  /**
   * Wrap HTML in preview container
   */
  private wrapInPreview(html: string, component: Component): string {
    const previewClasses = ['pagelume-preview'];
    
    if (component.meta.preview?.responsive) {
      previewClasses.push('pagelume-preview--responsive');
    }

    const style = [];
    if (component.meta.preview?.width) {
      style.push(`max-width: ${component.meta.preview.width}px`);
    }
    if (component.meta.preview?.height) {
      style.push(`min-height: ${component.meta.preview.height}px`);
    }

    return `
<div class="${previewClasses.join(' ')}" style="${style.join('; ')}">
  <div class="pagelume-preview__info">
    <span class="pagelume-preview__type">${component.meta.type}</span>
    <span class="pagelume-preview__name">${component.meta.name}</span>
  </div>
  <div class="pagelume-preview__content">
    ${html}
  </div>
</div>`;
  }

  /**
   * Render multiple components
   */
  renderMultiple(
    components: Array<{ component: Component; data: ComponentData }>,
    options: Omit<RenderOptions, 'data'>
  ): string[] {
    return components.map(({ component, data }) =>
      this.render(component, { ...options, data })
    );
  }

  /**
   * Get a list of all registered helpers
   */
  getHelpers(): string[] {
    return Object.keys(this.handlebars.helpers);
  }

  /**
   * Get a list of all registered partials
   */
  getPartials(): string[] {
    return Object.keys(this.handlebars.partials);
  }
} 