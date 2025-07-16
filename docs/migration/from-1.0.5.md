# 从 1.0.5 迁移

本指南将帮助你从 OneBot Commander 1.0.5 版本迁移到最新版本。

## 主要变更

### 1. 包结构变更

**1.0.5 版本：**
```typescript
// 旧版本导入方式
import { Commander } from 'onebot-commander';
```

**新版本：**
```typescript
// 新版本支持双格式
import { Commander } from 'onebot-commander';
// 或者
const { Commander } = require('onebot-commander');
```

### 2. 构建输出变更

**1.0.5 版本：**
```
dist/
├── index.js
├── index.d.ts
└── ...
```

**新版本：**
```
dist/
├── esm/
│   ├── index.js
│   ├── index.d.ts
│   └── ...
└── cjs/
    ├── index.cjs
    ├── index.d.ts
    └── ...
```

## 迁移步骤

### 步骤 1：更新依赖

```bash
# 更新到最新版本
npm install onebot-commander@latest
```

### 步骤 2：检查导入语句

如果你的项目使用 ESM：

```typescript
// 保持不变
import { Commander } from 'onebot-commander';
```

如果你的项目使用 CommonJS：

```typescript
// 旧版本
const { Commander } = require('onebot-commander');

// 新版本（推荐）
const { Commander } = require('onebot-commander');
```

### 步骤 3：更新 TypeScript 配置

如果你的项目使用 TypeScript，确保 `tsconfig.json` 配置正确：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### 步骤 4：更新构建配置

如果你有自定义的构建配置，需要更新：

**Webpack 配置：**
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'onebot-commander': 'onebot-commander/dist/esm/index.js'
    }
  }
};
```

**Rollup 配置：**
```javascript
// rollup.config.js
export default {
  external: ['onebot-commander'],
  output: {
    globals: {
      'onebot-commander': 'OneBotCommander'
    }
  }
};
```

## 兼容性说明

### 完全兼容的 API

以下 API 在新版本中完全兼容：

```typescript
// 基础用法
const commander = new Commander();

// 模式匹配
commander.on('text', (segment, context) => {
  return 'Hello World';
});

// 参数提取
commander.on('text:message', (segment, context) => {
  console.log(context.params.message);
  return '参数提取成功';
});

// 链式调用
commander
  .on('text', (segment, context) => {
    return '第一步';
  })
  .on('text', (segment, context) => {
    return '第二步';
  });

// 消息处理
const result = await commander.process([
  { type: 'text', data: { text: 'Hello' } }
]);
```

### 新增功能

新版本新增了以下功能，但不影响现有代码：

```typescript
// 1. 类型化字面量（新功能）
commander.on('text:message<string>', (segment, context) => {
  // context.params.message 现在是 string 类型
  return `字符串: ${context.params.message}`;
});

// 2. 剩余参数（新功能）
commander.on('text:first:string...rest:string[]', (segment, context) => {
  console.log(context.params.first); // string
  console.log(context.params.rest);  // string[]
  return '剩余参数处理';
});

// 3. 默认值（新功能）
commander.on('text:message:string="default"', (segment, context) => {
  console.log(context.params.message); // 如果没有匹配到，使用 "default"
  return '默认值处理';
});

// 4. 自定义字段映射（新功能）
const commander = new Commander({
  fieldMappings: {
    text: { text: 'content' }, // 将 text 字段映射到 content
    image: { file: 'url' }     // 将 file 字段映射到 url
  }
});
```

## 常见迁移问题

### 问题 1：模块解析错误

**错误信息：**
```
Cannot resolve module 'onebot-commander'
```

**解决方案：**
1. 检查 `package.json` 中的 `type` 字段
2. 确保使用正确的导入路径
3. 更新构建工具配置

```json
// package.json
{
  "type": "module", // 或 "commonjs"
  "dependencies": {
    "onebot-commander": "^1.0.6"
  }
}
```

### 问题 2：TypeScript 类型错误

**错误信息：**
```
Module '"onebot-commander"' has no exported member 'Commander'
```

**解决方案：**
1. 更新 TypeScript 配置
2. 检查导入语句
3. 确保安装了正确的类型定义

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  }
}
```

### 问题 3：构建工具兼容性

**问题：** 某些构建工具可能无法正确处理双格式包

**解决方案：**
1. 更新构建工具到最新版本
2. 使用明确的导入路径
3. 配置模块解析

```javascript
// 明确指定导入路径
import { Commander } from 'onebot-commander/dist/esm/index.js';
```

## 性能优化建议

### 1. 利用新版本的性能改进

```typescript
// 新版本支持更高效的模式匹配
const commander = new Commander({
  // 启用缓存
  enableCache: true,
  // 设置缓存大小
  cacheSize: 1000
});
```

### 2. 使用新的类型系统

```typescript
// 利用类型化字面量提高类型安全性
commander.on('text:count<number>', (segment, context) => {
  const count = context.params.count; // 自动推断为 number 类型
  return `计数: ${count}`;
});
```

### 3. 优化字段映射

```typescript
// 使用自定义字段映射减少数据转换
const commander = new Commander({
  fieldMappings: {
    text: { text: 'content' },
    image: { file: 'url', type: 'format' }
  }
});
```

## 测试迁移

### 1. 单元测试

确保所有测试用例仍然通过：

```bash
npm test
```

### 2. 集成测试

测试与现有系统的集成：

```typescript
// 测试基本功能
const commander = new Commander();
commander.on('text', (segment, context) => {
  return '测试响应';
});

const result = await commander.process([
  { type: 'text', data: { text: 'test' } }
]);
console.assert(result === '测试响应');
```

### 3. 性能测试

比较迁移前后的性能：

```typescript
// 性能基准测试
const startTime = performance.now();
for (let i = 0; i < 1000; i++) {
  await commander.process([
    { type: 'text', data: { text: `test${i}` } }
  ]);
}
const endTime = performance.now();
console.log(`处理 1000 条消息耗时: ${endTime - startTime}ms`);
```

## 回滚计划

如果迁移过程中遇到问题，可以回滚到 1.0.5 版本：

```bash
# 回滚到 1.0.5
npm install onebot-commander@1.0.5
```

## 迁移检查清单

- [ ] 更新 `package.json` 中的版本号
- [ ] 检查所有导入语句
- [ ] 更新 TypeScript 配置（如果使用）
- [ ] 更新构建工具配置
- [ ] 运行所有测试
- [ ] 进行性能测试
- [ ] 更新文档和示例
- [ ] 部署到测试环境验证
- [ ] 监控生产环境性能

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/your-username/onebot-commander/issues)
2. 阅读 [API 文档](../api/)
3. 查看 [示例代码](../examples/)
4. 提交新的 Issue 描述问题

## 总结

从 1.0.5 迁移到新版本是一个相对简单的过程，主要涉及：

1. **包结构优化**：支持 ESM 和 CJS 双格式
2. **性能提升**：更高效的模式匹配和缓存机制
3. **功能增强**：类型化字面量、剩余参数、默认值等新特性
4. **向后兼容**：现有代码无需修改即可使用

建议按照本指南逐步进行迁移，并在每个步骤后进行充分测试。 