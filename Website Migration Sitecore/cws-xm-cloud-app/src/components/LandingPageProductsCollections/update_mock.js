const fs = require('fs');

const file = '/Users/syatsenko/src/CWS/Website Migration Sitecore/cws-xm-cloud-app/src/components/LandingPageProductsCollections/LandingPageProductsCollections.mock.ts';
let content = fs.readFileSync(file, 'utf8');

// Add colorImages to ProductItem interface
content = content.replace('colors: string[];', 'colors: string[];\n  colorImages?: Record<string, string>;');

// Add a loop to inject colorImages logic at the end before exporting? No, we can just replace the mock export.
// Actually it's easier to just map the object in-place directly in the string, or modify the mock logic.

fs.writeFileSync(file, content);
