import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const REPO_ROOT = path.resolve(__dirname, '../..');
const DOCS_BASE_DIR = path.resolve(__dirname, '..');
const DOCS_CONTENT_DIR = path.join(DOCS_BASE_DIR, 'src/content/docs');
const DOCS_ASSETS_DIR = path.join(DOCS_BASE_DIR, 'src/assets');
const DOCS_PUBLIC_DIR = path.join(DOCS_BASE_DIR, 'public');
const SIDEBAR_FILE = path.join(DOCS_BASE_DIR, 'src/sidebar.json');
const META_FILE = path.join(DOCS_BASE_DIR, 'src/meta.json');
const APPS_DOCS_META = path.resolve(REPO_ROOT, 'apps/docs/meta.yaml');

const SOURCES: { name: string; dir: string; isModuleDir?: boolean }[] = [
  { name: 'Core', dir: path.resolve(REPO_ROOT, 'core/docs') },
  { name: 'Apps Docs', dir: path.resolve(REPO_ROOT, 'apps/docs') },
  { name: 'Backend Modules', dir: path.resolve(REPO_ROOT, 'apps/backend/modules'), isModuleDir: true },
  { name: 'Frontend Modules', dir: path.resolve(REPO_ROOT, 'apps/frontend/modules'), isModuleDir: true },
];

/**
 * Utility to deep merge directories.
 */
function deepMerge(src: string, dest: string, options: { exclude?: string[] } = {}) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (options.exclude?.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      deepMerge(srcPath, destPath, options);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Clean up generated directories
 */
function clean() {
  console.info('Cleaning generated directories...');
  [DOCS_CONTENT_DIR, DOCS_ASSETS_DIR, DOCS_PUBLIC_DIR].forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  });
}

/**
 * Collect all documentation sources and merge them.
 */
function aggregate() {
  console.info('Aggregating documentation...');

  for (const source of SOURCES) {
    if (!fs.existsSync(source.dir)) continue;

    if (source.isModuleDir) {
      const modules = fs.readdirSync(source.dir).filter((name) =>
        fs.statSync(path.join(source.dir, name)).isDirectory()
      );

      for (const moduleName of modules) {
        const moduleDocsPath = path.join(source.dir, moduleName, 'docs');
        if (fs.existsSync(moduleDocsPath)) {
          console.info(`Merging module: ${moduleName}`);
          mergeSource(moduleDocsPath);
        }
      }
    } else {
      console.info(`Merging source: ${source.name}`);
      mergeSource(source.dir);
    }
  }
}

/**
 * Merges a documentation source folder into the docs project.
 */
function mergeSource(sourcePath: string) {
  // 1. Content (excluding assets and public)
  deepMerge(sourcePath, DOCS_CONTENT_DIR, { exclude: ['assets', 'public'] });

  // 2. Assets
  const assetsPath = path.join(sourcePath, 'assets');
  if (fs.existsSync(assetsPath)) {
    deepMerge(assetsPath, DOCS_ASSETS_DIR);
  }

  // 3. Public
  const publicPath = path.join(sourcePath, 'public');
  if (fs.existsSync(publicPath)) {
    deepMerge(publicPath, DOCS_PUBLIC_DIR);
  }
}

/**
 * Generates the sidebar configuration based on the aggregated content.
 */
interface SidebarEntry {
  label: string;
  autogenerate?: { directory: string };
  items?: SidebarEntry[];
  link?: string;
}

function generateSidebar() {
  console.info('Generating sidebar navigation...');

  const entries = fs.readdirSync(DOCS_CONTENT_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
    .map(entry => {
      // Strip numeric prefix (e.g., "01-") for the label
      const cleanName = entry.name.replace(/^\d+-/, '');

      const label = cleanName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        label,
        autogenerate: { directory: entry.name }
      };
    });

  fs.writeFileSync(SIDEBAR_FILE, JSON.stringify(entries, null, 2));
}

/**
 * Proccesses site metadata from meta.yaml.
 */
function processMetadata() {
  console.info('Processing site metadata...');

  const defaultMeta = {
    title: 'Nexical Documentation',
    social: []
  };

  if (fs.existsSync(APPS_DOCS_META)) {
    try {
      const content = fs.readFileSync(APPS_DOCS_META, 'utf8');
      const meta = YAML.parse(content);
      fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
      return;
    } catch (e) {
      console.error(`Failed to parse ${APPS_DOCS_META}:`, e);
    }
  }

  fs.writeFileSync(META_FILE, JSON.stringify(defaultMeta, null, 2));
}

// Execution
clean();
aggregate();
generateSidebar();
processMetadata();

console.info('Documentation aggregation complete.');
