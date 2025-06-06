#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createComponent } from './commands/create.js';
import { listComponents } from './commands/list.js';
import { serveComponents } from './commands/serve.js';
import { initProject } from './commands/init.js';

const program = new Command();

program
  .name('pagelume')
  .description('CLI for Pagelume Component SDK')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new Pagelume component project')
  .action(initProject);

program
  .command('create')
  .description('Create a new component')
  .action(createComponent);

program
  .command('list')
  .description('List all components in the project')
  .action(listComponents);

program
  .command('serve')
  .description('Start the development server to preview components')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action(serveComponents);

program.parse();

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 