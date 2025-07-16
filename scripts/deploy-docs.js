#!/usr/bin/env node

/**
 * OneBot Commander 文档部署脚本
 * 支持 GitHub Pages、Netlify、Vercel 等平台
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  buildDir: 'docs/.vitepress/dist',
  publicDir: 'docs/public',
  baseUrl: process.env.BASE_URL || '/',
  platform: process.env.DEPLOY_PLATFORM || 'github'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 检查依赖
function checkDependencies() {
  try {
    require('vitepress');
    success('VitePress 已安装');
  } catch (e) {
    error('VitePress 未安装，请运行: npm install vitepress');
  }
}

// 构建文档
function buildDocs() {
  info('开始构建文档...');
  
  try {
    execSync('npm run docs:build', { stdio: 'inherit' });
    success('文档构建完成');
  } catch (e) {
    error('文档构建失败');
  }
}

// 检查构建产物
function checkBuildOutput() {
  if (!fs.existsSync(config.buildDir)) {
    error(`构建目录不存在: ${config.buildDir}`);
  }
  
  const files = fs.readdirSync(config.buildDir);
  if (files.length === 0) {
    error('构建目录为空');
  }
  
  success(`构建产物检查通过，共 ${files.length} 个文件`);
}

// GitHub Pages 部署
function deployToGitHubPages() {
  info('准备部署到 GitHub Pages...');
  
  // 检查是否在 Git 仓库中
  try {
    execSync('git status', { stdio: 'pipe' });
  } catch (e) {
    error('当前目录不是 Git 仓库');
  }
  
  // 检查是否有远程仓库
  try {
    execSync('git remote get-url origin', { stdio: 'pipe' });
  } catch (e) {
    error('未配置远程仓库 origin');
  }
  
  // 创建部署分支
  try {
    execSync('git checkout -b gh-pages', { stdio: 'pipe' });
  } catch (e) {
    // 分支可能已存在，切换到该分支
    try {
      execSync('git checkout gh-pages', { stdio: 'pipe' });
    } catch (e2) {
      error('无法创建或切换到 gh-pages 分支');
    }
  }
  
  // 复制构建产物
  execSync(`cp -r ${config.buildDir}/* .`, { stdio: 'inherit' });
  
  // 提交更改
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "docs: deploy to GitHub Pages"', { stdio: 'inherit' });
    execSync('git push origin gh-pages', { stdio: 'inherit' });
    success('已推送到 GitHub Pages 分支');
  } catch (e) {
    error('推送失败');
  }
  
  info('请在 GitHub 仓库设置中启用 GitHub Pages，并选择 gh-pages 分支作为源');
}

// Netlify 部署
function deployToNetlify() {
  info('准备部署到 Netlify...');
  
  // 检查 Netlify CLI
  try {
    execSync('netlify --version', { stdio: 'pipe' });
  } catch (e) {
    error('Netlify CLI 未安装，请运行: npm install -g netlify-cli');
  }
  
  // 部署
  try {
    execSync(`netlify deploy --dir=${config.buildDir} --prod`, { stdio: 'inherit' });
    success('Netlify 部署完成');
  } catch (e) {
    error('Netlify 部署失败');
  }
}

// Vercel 部署
function deployToVercel() {
  info('准备部署到 Vercel...');
  
  // 检查 Vercel CLI
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (e) {
    error('Vercel CLI 未安装，请运行: npm install -g vercel');
  }
  
  // 部署
  try {
    execSync(`vercel ${config.buildDir} --prod`, { stdio: 'inherit' });
    success('Vercel 部署完成');
  } catch (e) {
    error('Vercel 部署失败');
  }
}

// 生成部署配置
function generateDeployConfig() {
  const configs = {
    netlify: {
      build: 'npm run docs:build',
      publish: 'docs/.vitepress/dist',
      functions: {}
    },
    vercel: {
      buildCommand: 'npm run docs:build',
      outputDirectory: 'docs/.vitepress/dist',
      framework: null
    }
  };
  
  Object.entries(configs).forEach(([platform, config]) => {
    const filename = platform === 'netlify' ? 'netlify.toml' : 'vercel.json';
    fs.writeFileSync(filename, JSON.stringify(config, null, 2));
    info(`已生成 ${filename} 配置文件`);
  });
}

// 主函数
function main() {
  log('🚀 OneBot Commander 文档部署工具', 'bright');
  log('=====================================', 'cyan');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'build':
      checkDependencies();
      buildDocs();
      checkBuildOutput();
      break;
      
    case 'deploy':
      const platform = args[1] || config.platform;
      checkDependencies();
      buildDocs();
      checkBuildOutput();
      
      switch (platform) {
        case 'github':
          deployToGitHubPages();
          break;
        case 'netlify':
          deployToNetlify();
          break;
        case 'vercel':
          deployToVercel();
          break;
        default:
          error(`不支持的部署平台: ${platform}`);
      }
      break;
      
    case 'config':
      generateDeployConfig();
      break;
      
    case 'preview':
      info('启动预览服务器...');
      try {
        execSync('npm run docs:preview', { stdio: 'inherit' });
      } catch (e) {
        error('预览服务器启动失败');
      }
      break;
      
    default:
      log('用法:', 'bright');
      log('  node scripts/deploy-docs.js build                    # 构建文档', 'cyan');
      log('  node scripts/deploy-docs.js deploy [platform]        # 部署文档', 'cyan');
      log('  node scripts/deploy-docs.js config                   # 生成部署配置', 'cyan');
      log('  node scripts/deploy-docs.js preview                  # 预览构建结果', 'cyan');
      log('');
      log('支持的部署平台:', 'bright');
      log('  github  - GitHub Pages', 'cyan');
      log('  netlify - Netlify', 'cyan');
      log('  vercel  - Vercel', 'cyan');
      log('');
      log('环境变量:', 'bright');
      log('  DEPLOY_PLATFORM - 部署平台 (默认: github)', 'cyan');
      log('  BASE_URL       - 基础 URL (默认: /)', 'cyan');
  }
}

// 错误处理
process.on('uncaughtException', (err) => {
  error(`未捕获的异常: ${err.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  error(`未处理的 Promise 拒绝: ${reason}`);
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  buildDocs,
  deployToGitHubPages,
  deployToNetlify,
  deployToVercel
}; 