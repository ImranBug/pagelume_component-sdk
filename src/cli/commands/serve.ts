import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get the project name from package.json
async function getProjectName(): Promise<string> {
  try {
    const packagePath = path.resolve(process.cwd(), 'package.json');
    const packageJson = await fs.readJSON(packagePath);
    return packageJson.name || 'Pagelume Component Gallery';
  } catch (error) {
    return 'Pagelume Component Gallery';
  }
}

export async function serveComponents(options: { port: string }) {
  console.log(chalk.blue.bold('🚀 Starting Pagelume Component Server\n'));
  
  try {
    // Check if we're in a Pagelume project
    const hasComponentsDir = await fs.pathExists('components');
    if (!hasComponentsDir) {
      console.error(chalk.red('Error: No components directory found. Are you in a Pagelume project?'));
      console.log(chalk.yellow('Run "pagelume init" to initialize a new project.'));
      process.exit(1);
    }
    
    // Create index.html if it doesn't exist
    const indexPath = 'index.html';
    if (!await fs.pathExists(indexPath)) {
      console.log(chalk.yellow('Creating index.html for component preview...'));
      await createIndexHtml();
    }
    
    // Create preview pages directory
    await fs.ensureDir('preview');
    
    // Generate component list page
    await generateComponentListPage();
    
    console.log(chalk.green(`Starting development server on port ${options.port}...`));
    console.log(chalk.cyan(`\nView your components at: http://localhost:${options.port}\n`));
    
    // Start Vite server
    const viteArgs = [
      'vite',
      '--port',
      options.port,
      '--open'
    ];
    
    const vite = spawn('npx', viteArgs, {
      stdio: 'inherit',
      shell: true
    });
    
    vite.on('error', (error) => {
      console.error(chalk.red('Failed to start Vite:'), error);
      process.exit(1);
    });
    
    vite.on('close', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Vite exited with code ${code}`));
        process.exit(code || 1);
      }
    });
    
  } catch (error) {
    console.error(chalk.red('Error starting server:'), error);
    process.exit(1);
  }
}

async function createIndexHtml() {
  const projectName = await getProjectName();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${projectName}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .gallery-header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .gallery-header h1 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .controls {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-box {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .filter-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
    }
    .component-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .component-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      position: relative;
    }
    .component-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .component-card:hover .new-tab-button {
      opacity: 1;
    }
    .new-tab-button {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 20px;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .new-tab-button:hover {
      background: rgba(0,0,0,0.8);
    }
    .component-preview {
      height: 200px;
      overflow: hidden;
      position: relative;
      background: #fafafa;
    }
    .component-preview iframe {
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: none;
    }
    .component-info {
      padding: 15px;
    }
    .component-type {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .component-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    .component-description {
      font-size: 13px;
      color: #666;
      margin-bottom: 10px;
    }
    .component-meta {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: #999;
    }
    .no-components {
      text-align: center;
      color: #666;
      padding: 60px;
      grid-column: 1 / -1;
    }
    .loading {
      text-align: center;
      padding: 40px;
      grid-column: 1 / -1;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      padding: 20px;
    }
    .modal.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: white;
      width: 90%;
      height: 90%;
      max-width: 1200px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-body {
      flex: 1;
      overflow: hidden;
    }
    .modal-body iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    .close-button:hover {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="gallery-header">
    <h1>${projectName}</h1>
    <div class="controls">
      <input type="text" class="search-box" placeholder="Search components..." id="searchBox">
      <div class="filter-group">
        <label>Type:</label>
        <select class="filter-select" id="typeFilter">
          <option value="">All Types</option>
        </select>
      </div>
    </div>
  </div>
  
  <div id="component-list" class="component-grid">
    <div class="loading">Loading components...</div>
  </div>
  
  <div class="modal" id="previewModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="modalTitle">Component Preview</h2>
        <button class="close-button" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <iframe id="modalFrame" src=""></iframe>
      </div>
    </div>
  </div>
  
  <script type="module">
    let allComponents = [];
    let filteredComponents = [];
    
    // Load components
    async function loadComponents() {
      try {
        const response = await fetch('/api/components');
        allComponents = await response.json();
        filteredComponents = [...allComponents];
        
        // Populate type filter
        const types = [...new Set(allComponents.map(c => c.type))];
        const typeFilter = document.getElementById('typeFilter');
        types.forEach(type => {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
          typeFilter.appendChild(option);
        });
        
        renderComponents();
      } catch (error) {
        console.error('Failed to load components:', error);
        document.getElementById('component-list').innerHTML = '<div class="no-components">Failed to load components</div>';
      }
    }
    
    // Render components
    function renderComponents() {
      const container = document.getElementById('component-list');
      
      if (filteredComponents.length === 0) {
        container.innerHTML = '<div class="no-components">No components found. Run <code>npm run create</code> to create your first component.</div>';
        return;
      }
      
      container.innerHTML = filteredComponents.map(component => \`
        <div class="component-card" onclick="openModal('\${component.type}', '\${component.variation}', '\${component.meta.name}')">
          <button class="new-tab-button" onclick="openInNewTab(event, '\${component.type}', '\${component.variation}')" title="Open in new tab">&#x2925;</button>
          <div class="component-preview">
            <iframe src="/preview/\${component.type}/\${component.variation}" loading="lazy"></iframe>
          </div>
          <div class="component-info">
            <div class="component-type">\${component.type}</div>
            <div class="component-name">\${component.meta.name}</div>
            <div class="component-description">\${component.meta.description || 'No description'}</div>
            <div class="component-meta">
              <span>v\${component.meta.version || '1.0.0'}</span>
              <span>•</span>
              <span>\${component.meta.fields?.length || 0} fields</span>
            </div>
          </div>
        </div>
      \`).join('');
    }
    
    // Filter components
    function filterComponents() {
      const searchTerm = document.getElementById('searchBox').value.toLowerCase();
      const typeFilter = document.getElementById('typeFilter').value;
      
      filteredComponents = allComponents.filter(component => {
        const matchesSearch = !searchTerm || 
          component.meta.name.toLowerCase().includes(searchTerm) ||
          component.meta.description?.toLowerCase().includes(searchTerm) ||
          component.type.toLowerCase().includes(searchTerm);
        
        const matchesType = !typeFilter || component.type === typeFilter;
        
        return matchesSearch && matchesType;
      });
      
      renderComponents();
    }
    
    // Modal functions
    window.openModal = function(type, variation, name) {
      document.getElementById('modalTitle').textContent = name;
      document.getElementById('modalFrame').src = \`/preview/\${type}/\${variation}\`;
      document.getElementById('previewModal').classList.add('active');
    }
    
    window.openInNewTab = function(event, type, variation) {
      event.stopPropagation();
      window.open(\`/preview/\${type}/\${variation}\`, '_blank');
    }
    
    window.closeModal = function() {
      document.getElementById('previewModal').classList.remove('active');
      document.getElementById('modalFrame').src = '';
    }
    
    // Event listeners
    document.getElementById('searchBox').addEventListener('input', filterComponents);
    document.getElementById('typeFilter').addEventListener('change', filterComponents);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
    
    // Load components on page load
    loadComponents();
  </script>
</body>
</html>`;
  
  await fs.writeFile('index.html', html);
}

async function generateComponentListPage() {
  // This would be handled by the Vite dev server middleware
  // For now, we'll create a simple preview system
} 