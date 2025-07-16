# OneBot Commander

[![npm version](https://img.shields.io/npm/v/onebot-commander.svg)](https://www.npmjs.com/package/onebot-commander)
[![npm downloads](https://img.shields.io/npm/dm/onebot-commander.svg)](https://www.npmjs.com/package/onebot-commander)
[![License](https://img.shields.io/npm/l/onebot-commander.svg)](https://github.com/your-username/onebot-commander/blob/main/LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/your-username/onebot-commander)
[![Node.js Version](https://img.shields.io/node/v/onebot-commander.svg)](https://nodejs.org/)

OneBot12 消息段命令解析器 - TypeScript 版本，支持 ESM/CJS 双格式

## 📖 文档

- [📚 完整文档](https://your-username.github.io/onebot-commander/) - 详细的 API 文档和使用指南
- [🚀 快速开始](/docs/guide/) - 5分钟快速上手
- [💡 使用示例](/docs/examples/) - 丰富的代码示例
- [🔄 迁移指南](/docs/migration/) - 从其他库迁移
- [🤝 贡献指南](/docs/contributing/) - 参与项目开发

## ✨ 特性

- 🎯 **精确匹配**: 支持复杂的消息段模式匹配
- ⚡ **高性能**: 基于优化的匹配算法，性能优异
- 🔧 **灵活配置**: 支持自定义类型化字面量字段映射
- 🛡️ **类型安全**: 完整的 TypeScript 支持
- 🔗 **链式调用**: 优雅的 API 设计
- 📦 **双格式**: 同时支持 ESM 和 CommonJS
- 🧪 **测试完善**: 90%+ 测试覆盖率

## 🚀 快速开始

### 安装

```bash
npm install onebot-commander
```

### 基础用法

```typescript
import { Commander } from 'onebot-commander';

// 创建命令解析器（注意空格敏感）
const commander = new Commander('hello <name:text>'); // "hello " 后面的空格

// 添加处理逻辑
commander
  .action((params) => {
    console.log(`Hello, ${params.name}!`);
    return params.name.toUpperCase();
  })
  .action((upperName) => {
    console.log(`Uppercase: ${upperName}`);
  });

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } } // 注意 "hello " 后面的空格
];

const result = commander.match(segments);
// 输出: Hello, Alice!
// 输出: Uppercase: ALICE
```

### ⚠️ 空格敏感特性

OneBot Commander 对空格非常敏感，这是确保命令精确匹配的重要特性：

```typescript
// 模式: "ping [count:number={value:1}]"
const commander = new Commander('ping [count:number={value:1}]'); // "ping " 后面的空格

commander.action((params) => {
  const count = params.count || { value: 1 };
  return `Pong! (${count.value} times)`;
});

// ✅ 用户输入 "ping " - 匹配成功
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = commander.match(segments1); // ['Pong! (1 times)']

// ❌ 用户输入 "ping" - 匹配失败
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = commander.match(segments2); // []
```

## 📚 文档站

本项目包含完整的文档站，使用 VitePress 构建：

### 本地开发

```bash
# 启动开发服务器
npm run docs:dev

# 构建文档
npm run docs:build

# 预览构建结果
npm run docs:preview
```

### 部署

```bash
# 部署到 GitHub Pages
npm run docs:deploy:github

# 部署到 Netlify
npm run docs:deploy:netlify

# 部署到 Vercel
npm run docs:deploy:vercel

# 生成部署配置
npm run docs:config
```

访问 http://localhost:5173 查看本地文档。

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行基准测试
npm run benchmark
```

## 📦 构建

```bash
# 构建项目
npm run build

# 清理构建产物
npm run clean
```

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](/docs/contributing/) 了解详情。

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [OneBot 官网](https://onebot.dev/)
- [OneBot12 规范](https://12.onebot.dev/)
- [GitHub 仓库](https://github.com/your-username/onebot-commander)
- [npm 包](https://www.npmjs.com/package/onebot-commander)
- [在线文档](https://your-username.github.io/onebot-commander/) 