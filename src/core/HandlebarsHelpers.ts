import Handlebars from 'handlebars';

export class HandlebarsHelpers {
  /**
   * Register all custom helpers
   */
  static registerHelpers(handlebars: typeof Handlebars): void {
    // Comparison helpers
    this.registerComparisonHelpers(handlebars);
    
    // String helpers
    this.registerStringHelpers(handlebars);
    
    // Array helpers
    this.registerArrayHelpers(handlebars);
    
    // Math helpers
    this.registerMathHelpers(handlebars);
    
    // Date helpers
    this.registerDateHelpers(handlebars);
    
    // Utility helpers
    this.registerUtilityHelpers(handlebars);
  }

  /**
   * Register comparison helpers
   */
  private static registerComparisonHelpers(handlebars: typeof Handlebars): void {
    // Equal
    handlebars.registerHelper('eq', function(a: any, b: any) {
      return a === b;
    });

    // Not equal
    handlebars.registerHelper('ne', function(a: any, b: any) {
      return a !== b;
    });

    // Less than
    handlebars.registerHelper('lt', function(a: any, b: any) {
      return a < b;
    });

    // Greater than
    handlebars.registerHelper('gt', function(a: any, b: any) {
      return a > b;
    });

    // Less than or equal
    handlebars.registerHelper('lte', function(a: any, b: any) {
      return a <= b;
    });

    // Greater than or equal
    handlebars.registerHelper('gte', function(a: any, b: any) {
      return a >= b;
    });

    // And
    handlebars.registerHelper('and', function(...args: any[]) {
      return Array.prototype.slice.call(args, 0, -1).every(Boolean);
    });

    // Or
    handlebars.registerHelper('or', function(...args: any[]) {
      return Array.prototype.slice.call(args, 0, -1).some(Boolean);
    });
  }

  /**
   * Register string helpers
   */
  private static registerStringHelpers(handlebars: typeof Handlebars): void {
    // Uppercase
    handlebars.registerHelper('uppercase', function(str: string) {
      return str && str.toUpperCase();
    });

    // Lowercase
    handlebars.registerHelper('lowercase', function(str: string) {
      return str && str.toLowerCase();
    });

    // Capitalize
    handlebars.registerHelper('capitalize', function(str: string) {
      return str && str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Truncate
    handlebars.registerHelper('truncate', function(str: string, length: number) {
      if (!str || str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    // Replace
    handlebars.registerHelper('replace', function(str: string, find: string, replace: string) {
      return str && str.replace(new RegExp(find, 'g'), replace);
    });

    // Slugify
    handlebars.registerHelper('slugify', function(str: string) {
      return str && str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    });
  }

  /**
   * Register array helpers
   */
  private static registerArrayHelpers(handlebars: typeof Handlebars): void {
    // Array length
    handlebars.registerHelper('length', function(arr: any[]) {
      return Array.isArray(arr) ? arr.length : 0;
    });

    // First item
    handlebars.registerHelper('first', function(arr: any[]) {
      return Array.isArray(arr) ? arr[0] : null;
    });

    // Last item
    handlebars.registerHelper('last', function(arr: any[]) {
      return Array.isArray(arr) ? arr[arr.length - 1] : null;
    });

    // Join array
    handlebars.registerHelper('join', function(arr: any[], separator: string) {
      return Array.isArray(arr) ? arr.join(separator || ', ') : '';
    });

    // Contains
    handlebars.registerHelper('contains', function(arr: any[], value: any) {
      return Array.isArray(arr) && arr.includes(value);
    });

    // Limit array
    handlebars.registerHelper('limit', function(arr: any[], limit: number) {
      return Array.isArray(arr) ? arr.slice(0, limit) : [];
    });
  }

  /**
   * Register math helpers
   */
  private static registerMathHelpers(handlebars: typeof Handlebars): void {
    // Add
    handlebars.registerHelper('add', function(a: number, b: number) {
      return a + b;
    });

    // Subtract
    handlebars.registerHelper('subtract', function(a: number, b: number) {
      return a - b;
    });

    // Multiply
    handlebars.registerHelper('multiply', function(a: number, b: number) {
      return a * b;
    });

    // Divide
    handlebars.registerHelper('divide', function(a: number, b: number) {
      return b !== 0 ? a / b : 0;
    });

    // Modulo
    handlebars.registerHelper('mod', function(a: number, b: number) {
      return a % b;
    });

    // Round
    handlebars.registerHelper('round', function(num: number, decimals: number = 0) {
      return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
    });

    // Floor
    handlebars.registerHelper('floor', function(num: number) {
      return Math.floor(num);
    });

    // Ceil
    handlebars.registerHelper('ceil', function(num: number) {
      return Math.ceil(num);
    });
  }

  /**
   * Register date helpers
   */
  private static registerDateHelpers(handlebars: typeof Handlebars): void {
    // Format date
    handlebars.registerHelper('formatDate', function(date: Date | string, format: string) {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      // Simple date formatting (in production, use a library like date-fns)
      const formats: Record<string, string> = {
        'YYYY': d.getFullYear().toString(),
        'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
        'DD': d.getDate().toString().padStart(2, '0'),
        'HH': d.getHours().toString().padStart(2, '0'),
        'mm': d.getMinutes().toString().padStart(2, '0'),
        'ss': d.getSeconds().toString().padStart(2, '0')
      };
      
      let result = format;
      Object.entries(formats).forEach(([key, value]) => {
        result = result.replace(key, value);
      });
      
      return result;
    });

    // Relative time
    handlebars.registerHelper('relativeTime', function(date: Date | string) {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'just now';
    });
  }

  /**
   * Register utility helpers
   */
  private static registerUtilityHelpers(handlebars: typeof Handlebars): void {
    // JSON stringify
    handlebars.registerHelper('json', function(obj: any) {
      return JSON.stringify(obj, null, 2);
    });

    // Type of
    handlebars.registerHelper('typeof', function(obj: any) {
      return typeof obj;
    });

    // Default value
    handlebars.registerHelper('default', function(value: any, defaultValue: any) {
      return value || defaultValue;
    });

    // Random number
    handlebars.registerHelper('random', function(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });

    // Loop with index
    handlebars.registerHelper('times', function(n: number, block: any) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += block.fn({ index: i, first: i === 0, last: i === n - 1 });
      }
      return result;
    });

    // Switch statement
    handlebars.registerHelper('switch', function(this: any, value: any, options: any) {
      options.data.switch_value = value;
      return options.fn(this);
    });

    handlebars.registerHelper('case', function(this: any, value: any, options: any) {
      if (value === options.data.switch_value) {
        return options.fn(this);
      }
    });

    // Asset URL helper
    handlebars.registerHelper('asset', function(path: string) {
      // In production, this would handle asset URLs properly
      return `/assets/${path}`;
    });

    // Component class helper
    handlebars.registerHelper('componentClass', function(base: string, modifiers: any) {
      const classes = [base];
      
      if (typeof modifiers === 'object') {
        Object.entries(modifiers).forEach(([key, value]) => {
          if (value) {
            classes.push(`${base}--${key}`);
          }
        });
      }
      
      return classes.join(' ');
    });
  }
} 