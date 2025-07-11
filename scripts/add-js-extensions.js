#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distEsmPath = path.join(__dirname, '../dist/esm');

// 递归处理目录中的所有 .js 文件
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

// 处理单个文件，添加 .js 扩展名到 import/export 语句
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. import ... from '...'
  // 2. export ... from '...'
  // 3. export * from '...'
  // 4. export { ... } from '...'
  // 5. 支持注释、as、default、花括号、任意空格
  // 只处理 ./ 或 ../ 开头且无扩展名的路径

  // 统一正则：捕获 from 后的字符串字面量
  const regex = /((?:import|export)[^'"\n]+from\s*['"])(\.\.?\/[^'"\n]*?)(['"])/g;

  content = content.replace(regex, (match, prefix, importPath, suffix) => {
    // 跳过已经有扩展名的
    if (/\.[a-zA-Z0-9]+$/.test(importPath)) return match;
    // 只处理本地路径
    if (!importPath.startsWith('./') && !importPath.startsWith('../')) return match;
    return `${prefix}${importPath}.js${suffix}`;
  });

  // 还要处理 export * from '...'
  const exportStarRegex = /(export\s+\*\s+from\s*['"])(\.\.?\/[^'"\n]*?)(['"])/g;
  content = content.replace(exportStarRegex, (match, prefix, importPath, suffix) => {
    if (/\.[a-zA-Z0-9]+$/.test(importPath)) return match;
    if (!importPath.startsWith('./') && !importPath.startsWith('../')) return match;
    return `${prefix}${importPath}.js${suffix}`;
  });

  if (content !== original) {
    console.log(`Patched: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function main() {
  if (!fs.existsSync(distEsmPath)) {
    console.error('dist/esm directory does not exist. Please run build first.');
    process.exit(1);
  }
  console.log('Adding .js extensions to ESM build files...');
  processDirectory(distEsmPath);
  console.log('✅ Done!');
}

main(); 