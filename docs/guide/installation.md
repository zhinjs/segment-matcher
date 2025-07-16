# 安装指南

## 环境要求

OneBot Commander 需要以下环境：

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **TypeScript**: 4.3.5 或更高版本（推荐）

## 安装方式

### npm 安装（推荐）

```bash
npm install onebot-commander
```

### yarn 安装

```bash
yarn add onebot-commander
```

### pnpm 安装

```bash
pnpm add onebot-commander
```

## 导入方式

### ESM 导入（推荐）

```typescript
import { Commander } from 'onebot-commander';
```

### CommonJS 导入

```javascript
const { Commander } = require('onebot-commander');
```

### TypeScript 类型导入

```typescript
import type { MessageSegment, PatternToken } from 'onebot-commander';
```

## 验证安装

创建一个测试文件来验证安装是否成功：

```typescript
// test.js
import { Commander } from 'onebot-commander';

// 注意：OneBot Commander 对空格敏感
const commander = new Commander('hello <name:text>'); // "hello " 后面的空格
commander.action((params) => {
  console.log(`Hello, ${params.name}!`);
});

const segments = [
  { type: 'text', data: { text: 'hello Alice' } } // 注意 "hello " 后面的空格
];

const result = commander.match(segments);
console.log('安装成功！');

// 空格敏感测试
const pingCommander = new Commander('ping [count:number=1]'); // "ping " 后面的空格
pingCommander.action((params) => {
  console.log(`Pong! (${params.count || 1} times)`);
});

// ✅ 正确 - 有空格
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = pingCommander.match(segments1); // 匹配成功

// ❌ 错误 - 没有空格
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = pingCommander.match(segments2); // 匹配失败

console.log('空格敏感测试完成！');
```

运行测试：

```bash
node test.js
```

如果看到 "安装成功！" 和 "空格敏感测试完成！" 的输出，说明安装正确。

## 开发环境设置

### 克隆仓库

```bash
git clone https://github.com/your-username/onebot-commander.git
cd onebot-commander
```

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 运行基准测试

```bash
npm run benchmark
```

## 版本兼容性

| 版本范围 | Node.js 要求 | 主要特性 |
|---------|-------------|---------|
| 1.0.0 - 1.0.5 | 16+ | 基础功能 |
| 1.0.6+ | 18+ | 性能优化，错误处理改进 |

## 故障排除

### 常见问题

#### 1. 模块找不到错误

```bash
Error: Cannot find module 'onebot-commander'
```

**解决方案**：
- 检查 package.json 中是否正确添加了依赖
- 重新安装依赖：`npm install`
- 检查 Node.js 版本是否符合要求

#### 2. TypeScript 类型错误

```bash
TS2307: Cannot find module 'onebot-commander' or its corresponding type declarations.
```

**解决方案**：
- 确保安装了 TypeScript：`npm install -D typescript`
- 检查 tsconfig.json 配置
- 重新安装依赖：`npm install`

#### 3. 构建错误

```bash
Error: Cannot resolve module 'onebot-commander'
```

**解决方案**：
- 检查构建工具配置（webpack、vite 等）
- 确保正确配置了模块解析
- 尝试清除缓存后重新构建

### 获取帮助

如果遇到其他问题：

1. 查看 [GitHub Issues](https://github.com/your-username/onebot-commander/issues)
2. 阅读 [故障排除指南](/guide/troubleshooting)
3. 提交详细的错误报告

## 下一步

安装完成后，你可以：

- [快速开始](/guide/) - 学习基础用法
- [查看示例](/examples/) - 了解更多使用场景
- [API 参考](/api/) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>如果你使用的是较旧的 Node.js 版本，建议升级到 18+ 以获得最佳性能和功能支持。</p>
</div> 