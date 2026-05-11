const fs = require('fs');
let content = fs.readFileSync('app/admin/products/page.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('app/admin/products/page.tsx', content);
