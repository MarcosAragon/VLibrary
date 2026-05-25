const fs = require('fs');

function replaceColors(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#38bdf8/g, 'var(--primary-color)');
  content = content.replace(/rgba\(56,\s*189,\s*248,/g, 'rgba(var(--primary-rgb),');
  
  if (file.includes('App.css') && !content.includes(':root {')) {
     const rootBlock = `
:root {
  --primary-color: #38bdf8;
  --primary-rgb: 56, 189, 248;
}

[data-theme="matrix"] {
  --primary-color: #22c55e;
  --primary-rgb: 34, 197, 94;
}

[data-theme="sunset"] {
  --primary-color: #f97316;
  --primary-rgb: 249, 115, 22;
}

[data-theme="cyberpunk"] {
  --primary-color: #d946ef;
  --primary-rgb: 217, 70, 239;
}
`;
     content = rootBlock + content;
  }
  fs.writeFileSync(file, content);
}

replaceColors('c:/Users/XSandax/Desktop/Proyectos/portfolio/frontend/src/App.css');
replaceColors('c:/Users/XSandax/Desktop/Proyectos/portfolio/frontend/src/components/CrudJuegos.css');
console.log('Done!');
