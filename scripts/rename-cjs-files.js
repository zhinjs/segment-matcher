#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distCjsPath = path.join(__dirname, '../dist/cjs');

// 递归处理目录中的所有 .js 文件
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      renameFile(filePath);
    }
  }
}

// 重命名文件从 .js 到 .cjs
function renameFile(filePath) {
  const newPath = filePath.replace(/\.js$/, '.cjs');
  fs.renameSync(filePath, newPath);
  console.log(`Renamed: ${filePath} -> ${newPath}`);
}

function main() {
  if (!fs.existsSync(distCjsPath)) {
    console.error('dist/cjs directory does not exist. Please run build first.');
    process.exit(1);
  }
  
  console.log('Renaming CJS build files from .js to .cjs...');
  processDirectory(distCjsPath);
  console.log('✅ Done!');
}

main(); 