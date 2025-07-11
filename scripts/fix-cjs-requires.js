#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distCjsPath = path.join(__dirname, '../dist/cjs');

// 递归处理目录中的所有 .cjs 文件
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.cjs')) {
      processFile(filePath);
    }
  }
}

// 处理单个文件，修复 require 路径
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 修复 require('./xxx') 为 require('./xxx.cjs')
  const requireRegex = /(require\s*\(\s*['"])(\.\.?\/[^'"\n]*?)(['"]\s*\))/g;
  
  content = content.replace(requireRegex, (match, prefix, requirePath, suffix) => {
    // 跳过已经有扩展名的
    if (/\.[a-zA-Z0-9]+$/.test(requirePath)) return match;
    // 只处理本地路径
    if (!requirePath.startsWith('./') && !requirePath.startsWith('../')) return match;
    return `${prefix}${requirePath}.cjs${suffix}`;
  });

  if (content !== original) {
    console.log(`Fixed requires: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function main() {
  if (!fs.existsSync(distCjsPath)) {
    console.error('dist/cjs directory does not exist. Please run build first.');
    process.exit(1);
  }
  
  console.log('Fixing require paths in CJS build files...');
  processDirectory(distCjsPath);
  console.log('✅ Done!');
}

main(); 