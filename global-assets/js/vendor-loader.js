/**
 * Pagelume Vendor Loader
 * Manages loading of third-party vendor scripts
 */

(function(window) {
  'use strict';

  window.Pagelume = window.Pagelume || {};

  // Vendor script configurations
  const vendorConfigs = {
    jquery: {
      src: 'https://code.jquery.com/jquery-3.7.1.min.js',
      integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=',
      crossorigin: 'anonymous',
      test: () => typeof window.jQuery !== 'undefined'
    },
    bootstrap: {
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
      integrity: 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz',
      crossorigin: 'anonymous',
      css: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
      cssIntegrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
      test: () => typeof window.bootstrap !== 'undefined',
      dependencies: ['jquery']
    },
    slick: {
      src: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js',
      css: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css',
      themeCss: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css',
      test: () => typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.slick !== 'undefined',
      dependencies: ['jquery']
    },
    gsap: {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
      test: () => typeof window.gsap !== 'undefined'
    },
    gsapScrollTrigger: {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
      test: () => typeof window.ScrollTrigger !== 'undefined',
      dependencies: ['gsap']
    },
    aos: {
      src: 'https://unpkg.com/aos@2.3.4/dist/aos.js',
      css: 'https://unpkg.com/aos@2.3.4/dist/aos.css',
      test: () => typeof window.AOS !== 'undefined'
    },
    swiper: {
      src: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
      css: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
      test: () => typeof window.Swiper !== 'undefined'
    },
    isotope: {
      src: 'https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js',
      test: () => typeof window.Isotope !== 'undefined'
    },
    lightbox2: {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js',
      css: 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/css/lightbox.min.css',
      test: () => typeof window.lightbox !== 'undefined',
      dependencies: ['jquery']
    }
  };

  // Track loaded vendors
  const loadedVendors = new Set();
  const loadingPromises = new Map();

  /**
   * Load a vendor script
   * @param {string} vendorName - Name of the vendor to load
   * @returns {Promise} Promise that resolves when vendor is loaded
   */
  Pagelume.loadVendor = async function(vendorName) {
    // Check if already loaded
    if (loadedVendors.has(vendorName)) {
      return Promise.resolve();
    }

    // Check if currently loading
    if (loadingPromises.has(vendorName)) {
      return loadingPromises.get(vendorName);
    }

    const config = vendorConfigs[vendorName];
    if (!config) {
      return Promise.reject(new Error(`Vendor "${vendorName}" not found`));
    }

    // Create loading promise
    const loadingPromise = (async () => {
      try {
        // Load dependencies first
        if (config.dependencies) {
          await Promise.all(config.dependencies.map(dep => Pagelume.loadVendor(dep)));
        }

        // Check if already loaded by another means
        if (config.test && config.test()) {
          loadedVendors.add(vendorName);
          return;
        }

        // Load CSS files if any
        const cssPromises = [];
        if (config.css) {
          cssPromises.push(loadCSS(config.css, config.cssIntegrity));
        }
        if (config.themeCss) {
          cssPromises.push(loadCSS(config.themeCss));
        }
        await Promise.all(cssPromises);

        // Load the script
        await loadScript(config);

        // Verify loading
        if (config.test && !config.test()) {
          throw new Error(`Vendor "${vendorName}" failed to load properly`);
        }

        loadedVendors.add(vendorName);
        console.log(`Vendor "${vendorName}" loaded successfully`);
      } catch (error) {
        console.error(`Failed to load vendor "${vendorName}":`, error);
        throw error;
      }
    })();

    loadingPromises.set(vendorName, loadingPromise);
    return loadingPromise;
  };

  /**
   * Load multiple vendors
   * @param {Array<string>} vendors - Array of vendor names
   * @returns {Promise} Promise that resolves when all vendors are loaded
   */
  Pagelume.loadVendors = function(vendors) {
    return Promise.all(vendors.map(vendor => Pagelume.loadVendor(vendor)));
  };

  /**
   * Check if a vendor is loaded
   * @param {string} vendorName - Name of the vendor
   * @returns {boolean} True if vendor is loaded
   */
  Pagelume.isVendorLoaded = function(vendorName) {
    return loadedVendors.has(vendorName);
  };

  /**
   * Get list of available vendors
   * @returns {Array<string>} Array of vendor names
   */
  Pagelume.getAvailableVendors = function() {
    return Object.keys(vendorConfigs);
  };

  /**
   * Helper function to load a script
   * @param {Object} config - Script configuration
   * @returns {Promise}
   */
  function loadScript(config) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = config.src;
      
      if (config.integrity) {
        script.integrity = config.integrity;
      }
      if (config.crossorigin) {
        script.crossOrigin = config.crossorigin;
      }
      
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${config.src}`));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Helper function to load CSS
   * @param {string} href - CSS URL
   * @param {string} integrity - Optional integrity hash
   * @returns {Promise}
   */
  function loadCSS(href, integrity) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      if (integrity) {
        link.integrity = integrity;
        link.crossOrigin = 'anonymous';
      }
      
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Auto-load vendors specified in data attributes
   */
  function autoLoadVendors() {
    const elements = document.querySelectorAll('[data-pagelume-vendors]');
    const vendorsToLoad = new Set();

    elements.forEach(element => {
      const vendors = element.getAttribute('data-pagelume-vendors').split(',').map(v => v.trim());
      vendors.forEach(vendor => vendorsToLoad.add(vendor));
    });

    if (vendorsToLoad.size > 0) {
      Pagelume.loadVendors(Array.from(vendorsToLoad)).catch(error => {
        console.error('Failed to auto-load vendors:', error);
      });
    }
  }

  // Auto-load on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoadVendors);
  } else {
    autoLoadVendors();
  }

})(window); 