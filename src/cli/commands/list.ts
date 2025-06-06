import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

interface ComponentMeta {
  name: string;
  type: string;
  variation: string;
  description?: string;
  version?: string;
  vendors?: string[];
  path?: string;
}

export async function listComponents() {
  console.log(chalk.blue.bold('📋 Listing All Components\n'));
  
  try {
    // Check if components directory exists
    const hasComponentsDir = await fs.pathExists('components');
    if (!hasComponentsDir) {
      console.error(chalk.red('Error: No components directory found. Are you in a Pagelume project?'));
      process.exit(1);
    }
    
    // Find all meta.json files
    const metaFiles = await glob('components/**/meta.json', {
      ignore: ['node_modules/**']
    });
    
    if (metaFiles.length === 0) {
      console.log(chalk.yellow('No components found.'));
      console.log(chalk.cyan('Run "pagelume create" to create your first component.'));
      return;
    }
    
    // Group components by type
    const componentsByType: Record<string, ComponentMeta[]> = {};
    
    for (const metaFile of metaFiles) {
      try {
        const meta: ComponentMeta = await fs.readJSON(metaFile);
        const componentPath = path.dirname(metaFile);
        const relativePath = path.relative('components', componentPath);
        
        if (!componentsByType[meta.type]) {
          componentsByType[meta.type] = [];
        }
        
        componentsByType[meta.type].push({
          ...meta,
          path: relativePath
        });
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not read ${metaFile}`));
      }
    }
    
    // Display components organized by type
    const types = Object.keys(componentsByType).sort();
    
    console.log(chalk.green(`Found ${metaFiles.length} component(s) in ${types.length} type(s):\n`));
    
    for (const type of types) {
      console.log(chalk.cyan.bold(`📁 ${type}`));
      
      const components = componentsByType[type];
      components.forEach((component, index) => {
        const isLast = index === components.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        
        console.log(`   ${prefix}${chalk.white(component.variation)}`);
        console.log(`   ${isLast ? '    ' : '│   '}${chalk.gray(`Name: ${component.name}`)}`);
        
        if (component.description) {
          console.log(`   ${isLast ? '    ' : '│   '}${chalk.gray(`Desc: ${component.description}`)}`);
        }
        
        if (component.vendors && component.vendors.length > 0) {
          console.log(`   ${isLast ? '    ' : '│   '}${chalk.gray(`Vendors: ${component.vendors.join(', ')}`)}`);
        }
        
        if (component.version) {
          console.log(`   ${isLast ? '    ' : '│   '}${chalk.gray(`Version: ${component.version}`)}`);
        }
        
        if (!isLast) {
          console.log('   │');
        }
      });
      
      console.log('');
    }
    
    // Show summary
    console.log(chalk.blue('─'.repeat(50)));
    console.log(chalk.white('Total components: ') + chalk.green(metaFiles.length));
    console.log(chalk.white('Component types: ') + chalk.green(types.join(', ')));
    
  } catch (error) {
    console.error(chalk.red('Error listing components:'), error);
    process.exit(1);
  }
} 