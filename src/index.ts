/**
 * Pagelume Component SDK
 * Official SDK for building Pagelume components
 */

export { ComponentBuilder } from './core/ComponentBuilder.js';
export { ComponentRenderer } from './core/ComponentRenderer.js';
export { HandlebarsHelpers } from './core/HandlebarsHelpers.js';
export { VitePlugin } from './core/VitePlugin.js';
export * from './utils/index.js';

// Re-export types
export type { Component, ComponentMeta, ComponentField } from './types/index.js';
