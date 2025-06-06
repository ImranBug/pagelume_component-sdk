/**
 * Pagelume Core JavaScript
 * This file contains essential utilities and functions for all Pagelume components
 */

(function(window) {
  'use strict';

  // Create the Pagelume namespace
  window.Pagelume = window.Pagelume || {};

  /**
   * Component Registry
   * Keeps track of all initialized components on the page
   */
  Pagelume.components = {};

  /**
   * Register a component
   * @param {string} id - Unique identifier for the component
   * @param {Object} instance - Component instance
   */
  Pagelume.registerComponent = function(id, instance) {
    if (this.components[id]) {
      console.warn(`Component with id "${id}" already exists. Overwriting.`);
    }
    this.components[id] = instance;
  };

  /**
   * Get a component by ID
   * @param {string} id - Component ID
   * @returns {Object|null} Component instance or null
   */
  Pagelume.getComponent = function(id) {
    return this.components[id] || null;
  };

  /**
   * Utility Functions
   */
  Pagelume.utils = {
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Deep merge objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge: function(target, source) {
      const output = Object.assign({}, target);
      if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this.isObject(source[key])) {
            if (!(key in target))
              Object.assign(output, { [key]: source[key] });
            else
              output[key] = this.deepMerge(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    },

    /**
     * Check if value is an object
     * @param {*} item - Item to check
     * @returns {boolean}
     */
    isObject: function(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId: function(prefix = 'pagelume') {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Parse data attributes from element
     * @param {HTMLElement} element - DOM element
     * @param {string} prefix - Data attribute prefix
     * @returns {Object} Parsed data attributes
     */
    parseDataAttributes: function(element, prefix = 'pagelume') {
      const data = {};
      const prefixRegex = new RegExp(`^${prefix}`);
      
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-' + prefix + '-')) {
          const key = attr.name
            .replace(`data-${prefix}-`, '')
            .replace(/-./g, x => x[1].toUpperCase());
          
          // Try to parse as JSON, fallback to string
          try {
            data[key] = JSON.parse(attr.value);
          } catch (e) {
            data[key] = attr.value;
          }
        }
      });
      
      return data;
    },

    /**
     * Load external script
     * @param {string} src - Script source URL
     * @returns {Promise} Promise that resolves when script is loaded
     */
    loadScript: function(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    /**
     * Load external stylesheet
     * @param {string} href - Stylesheet URL
     * @returns {Promise} Promise that resolves when stylesheet is loaded
     */
    loadStylesheet: function(href) {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    }
  };

  /**
   * Event Emitter
   * Simple event system for components
   */
  Pagelume.EventEmitter = function() {
    this.events = {};
  };

  Pagelume.EventEmitter.prototype = {
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on: function(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
      
      // Return unsubscribe function
      return () => {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      };
    },

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to callbacks
     */
    emit: function(event, ...args) {
      if (this.events[event]) {
        this.events[event].forEach(callback => {
          callback.apply(this, args);
        });
      }
    },

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    once: function(event, callback) {
      const unsubscribe = this.on(event, (...args) => {
        callback.apply(this, args);
        unsubscribe();
      });
    }
  };

  /**
   * Base Component Class
   * All components should extend this class
   */
  Pagelume.Component = function(element, options = {}) {
    this.element = element;
    this.options = Pagelume.utils.deepMerge(this.constructor.defaults || {}, options);
    this.id = element.id || Pagelume.utils.generateId(this.constructor.name);
    
    // Initialize event emitter
    this.events = new Pagelume.EventEmitter();
    
    // Register component
    Pagelume.registerComponent(this.id, this);
    
    // Call init if defined
    if (typeof this.init === 'function') {
      this.init();
    }
  };

  Pagelume.Component.prototype = {
    /**
     * Destroy the component
     */
    destroy: function() {
      if (typeof this.cleanup === 'function') {
        this.cleanup();
      }
      delete Pagelume.components[this.id];
    },

    /**
     * Update component options
     * @param {Object} options - New options
     */
    updateOptions: function(options) {
      this.options = Pagelume.utils.deepMerge(this.options, options);
      if (typeof this.update === 'function') {
        this.update();
      }
    }
  };

  /**
   * Auto-initialization
   * Automatically initialize components with data-pagelume-component attribute
   */
  Pagelume.autoInit = function() {
    const components = document.querySelectorAll('[data-pagelume-component]');
    
    components.forEach(element => {
      const componentName = element.getAttribute('data-pagelume-component');
      const ComponentClass = Pagelume[componentName];
      
      if (ComponentClass && typeof ComponentClass === 'function') {
        const options = Pagelume.utils.parseDataAttributes(element);
        new ComponentClass(element, options);
      } else {
        console.warn(`Component "${componentName}" not found`);
      }
    });
  };

  /**
   * DOM Ready handler
   */
  function domReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /**
   * Initialize on DOM ready
   */
  domReady(function() {
    // Auto-initialize components
    Pagelume.autoInit();
    
    // Emit ready event
    if (window.Pagelume.events) {
      window.Pagelume.events.emit('ready');
    }
  });

  // Create global event emitter
  Pagelume.events = new Pagelume.EventEmitter();

})(window); 