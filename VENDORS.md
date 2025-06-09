# Vendor Scripts Guide

## Overview
Pagelume Component SDK provides an easy way to include popular third-party libraries (vendors) in your components. The vendor loading system automatically handles dependencies, CSS files, and ensures scripts are loaded in the correct order.

## Available Vendors

| Vendor Name | Library | Version | Dependencies |
|-------------|---------|---------|-------------|
| `jquery` | jQuery | 3.7.1 | None |
| `bootstrap` | Bootstrap | 5.3.3 | jQuery |
| `slick` | Slick Carousel | 1.8.1 | jQuery |
| `gsap` | GSAP | 3.12.5 | None |
| `gsapScrollTrigger` | GSAP ScrollTrigger | 3.12.5 | GSAP |
| `aos` | Animate On Scroll | 2.3.4 | None |
| `swiper` | Swiper.js | 11.x | None |
| `isotope` | Isotope Layout | 3.x | None |
| `lightbox2` | Lightbox2 | 2.11.4 | jQuery |

## How to Use Vendor Scripts

### 1. Specify Vendors in meta.json

When creating a component, include the vendors array in your `meta.json`:

```json
{
  "name": "My Component",
  "type": "hero",
  "variation": "animated-hero",
  "vendors": ["jquery", "gsap"],
  "fields": [...]
}
```

### 2. Add Data Attribute (Alternative Method)

You can also specify vendors directly in your HTML template:

```html
<section data-pagelume-vendors="jquery,slick">
  <!-- Your component content -->
</section>
```

### 3. Wait for Vendors in JavaScript

**❌ Wrong Way (will cause "$ is not defined" errors):**
```javascript
(function() {
  'use strict';
  
  // This will fail if jQuery isn't loaded yet
  $(document).ready(function() {
    console.log('This might not work!');
  });
})();
```

**✅ Correct Way:**
```javascript
(function() {
  'use strict';
  
  function initializeComponent() {
    // Now it's safe to use vendor libraries
    $(document).ready(function() {
      console.log('jQuery is ready!');
      $('.my-slider').slick({
        dots: true,
        infinite: true,
        speed: 300
      });
    });
  }
  
  // Wait for vendors to be loaded
  window.addEventListener('pagelume:vendorsLoaded', initializeComponent);
})();
```

### 4. Check Vendor Availability

You can also check if vendors are loaded:

```javascript
// Check if a specific vendor is loaded
if (window.Pagelume.isVendorLoaded('jquery')) {
  console.log('jQuery is available');
}

// Get all available vendors
console.log(window.Pagelume.getAvailableVendors());
```

## Example Components

### jQuery Slider Component

**meta.json:**
```json
{
  "name": "Image Slider",
  "type": "gallery",
  "variation": "simple-slider",
  "vendors": ["jquery", "slick"],
  "fields": [
    {
      "name": "images",
      "type": "array",
      "label": "Images",
      "default": []
    }
  ]
}
```

**index.html:**
```html
<div class="image-slider" data-pagelume-component="Gallery">
  <div class="slider-container">
    {{#each images}}
    <div class="slide">
      <img src="{{this.url}}" alt="{{this.alt}}">
    </div>
    {{/each}}
  </div>
</div>
```

**assets/js/script.js:**
```javascript
(function() {
  'use strict';
  
  function initializeSlider() {
    $('.slider-container').slick({
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      adaptiveHeight: true
    });
  }
  
  // Wait for vendors (jQuery + Slick) to be loaded
  window.addEventListener('pagelume:vendorsLoaded', initializeSlider);
})();
```

### GSAP Animation Component

**meta.json:**
```json
{
  "name": "Animated Hero",
  "type": "hero",
  "variation": "gsap-hero",
  "vendors": ["gsap", "gsapScrollTrigger"],
  "fields": [...]
}
```

**assets/js/script.js:**
```javascript
(function() {
  'use strict';
  
  function initializeAnimations() {
    // GSAP is now available
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.from('.hero-title', {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: 'power2.out'
    });
    
    gsap.from('.hero-subtitle', {
      duration: 1,
      y: 30,
      opacity: 0,
      delay: 0.3,
      ease: 'power2.out'
    });
  }
  
  window.addEventListener('pagelume:vendorsLoaded', initializeAnimations);
})();
```

## Troubleshooting

### "$ is not defined" Error
This happens when your JavaScript tries to use jQuery before it's loaded. Always wait for the `pagelume:vendorsLoaded` event.

### Vendor Not Loading
1. Check the browser console for errors
2. Verify the vendor name is spelled correctly
3. Make sure your internet connection allows CDN access
4. Check if there are any CORS or content security policy issues

### Dependencies
Some vendors depend on others. The system automatically loads dependencies:
- Bootstrap requires jQuery
- Slick requires jQuery  
- GSAP ScrollTrigger requires GSAP
- Lightbox2 requires jQuery

## Manual Vendor Loading

You can also load vendors programmatically:

```javascript
// Load a single vendor
window.Pagelume.loadVendor('jquery').then(() => {
  console.log('jQuery loaded!');
});

// Load multiple vendors
window.Pagelume.loadVendors(['jquery', 'slick']).then(() => {
  console.log('All vendors loaded!');
});
```

## CDN URLs

All vendors are loaded from trusted CDNs with integrity checks where available:
- jQuery: code.jquery.com
- Bootstrap: cdn.jsdelivr.net  
- GSAP: cdnjs.cloudflare.com
- AOS: unpkg.com
- Swiper: cdn.jsdelivr.net
- And more...

The vendor loader automatically handles CSS files, JavaScript files, and ensures proper loading order. 