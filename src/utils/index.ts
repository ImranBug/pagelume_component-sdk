/**
 * Pagelume SDK Utility Functions
 */

import path from 'path';

/**
 * Validate component name
 */
export function validateComponentName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name);
}

/**
 * Validate component type
 */
export function validateComponentType(type: string): boolean {
  return /^[a-z0-9-]+$/.test(type);
}

/**
 * Get component path
 */
export function getComponentPath(type: string, variation: string, baseDir: string = 'components'): string {
  return path.join(baseDir, type, variation);
}

/**
 * Parse component path
 */
export function parseComponentPath(componentPath: string): { type: string; variation: string } | null {
  const parts = componentPath.split(path.sep);
  if (parts.length >= 2) {
    return {
      type: parts[parts.length - 2],
      variation: parts[parts.length - 1]
    };
  }
  return null;
}

/**
 * Logger utility
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[Pagelume] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[Pagelume] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[Pagelume] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG) {
      console.debug(`[Pagelume] ${message}`, ...args);
    }
  }
}; 