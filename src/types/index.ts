/**
 * Pagelume Component SDK Type Definitions
 */

export interface ComponentField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'url' | 'image' | 'list' | 'object';
  label: string;
  default?: any;
  required?: boolean;
  options?: string[] | { label: string; value: string }[];
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ComponentMeta {
  name: string;
  type: string;
  variation: string;
  description?: string;
  version?: string;
  author?: string;
  vendors?: string[];
  fields: ComponentField[];
  tags?: string[];
  preview?: {
    width?: number;
    height?: number;
    responsive?: boolean;
  };
}

export interface Component {
  meta: ComponentMeta;
  template: string;
  styles?: string;
  scripts?: string;
  assets?: {
    css?: string[];
    js?: string[];
    images?: string[];
  };
}

export interface ComponentData {
  [key: string]: any;
}

export interface RenderOptions {
  data: ComponentData;
  preview?: boolean;
  inlineStyles?: boolean;
  inlineScripts?: boolean;
}

export interface BuildOptions {
  sourcePath: string;
  outputPath: string;
  minify?: boolean;
  sourceMap?: boolean;
  watch?: boolean;
}

export interface VitePluginOptions {
  componentsDir?: string;
  globalAssetsDir?: string;
  enableHMR?: boolean;
} 