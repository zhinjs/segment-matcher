# Segment Matcher

[![npm version](https://img.shields.io/npm/v/segment-matcher.svg)](https://www.npmjs.com/package/segment-matcher)
[![npm downloads](https://img.shields.io/npm/dm/segment-matcher.svg)](https://www.npmjs.com/package/segment-matcher)
[![License](https://img.shields.io/npm/l/segment-matcher.svg)](https://github.com/zhinjs/segment-matcher/blob/main/LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen.svg)](https://github.com/zhinjs/segment-matcher)
[![Node.js Version](https://img.shields.io/node/v/segment-matcher.svg)](https://nodejs.org/)

消息段匹配器 - 高性能、类型安全的消息段模式匹配库，支持 ESM/CJS 双格式。

## 📖 文档

- [📚 完整文档](https://segment-matcher.pages.dev/) - 详细的 API 文档和使用指南

## ✨ 特性

- 🎯 **精确匹配**: 支持复杂的消息段模式匹配，包括字面量、类型化字面量、参数等
- ⚡ **高性能**: 
  - 优化的匹配算法
  - 智能缓存系统（类型检查缓存、模式解析缓存）
  - 针对大小数组的优化策略
- 🔧 **灵活配置**: 
  - 支持自定义类型化字面量字段映射
  - 支持多字段优先级映射
  - 支持动态字段提取
- 🛡️ **类型安全**: 
  - 完整的 TypeScript 类型定义
  - 运行时类型检查
  - 智能类型推导
- 🔗 **模块化设计**: 
  - 清晰的模块划分
  - 低耦合高内聚
  - 易于扩展
- 📦 **双格式支持**: 
  - ESM (ECMAScript Modules)
  - CommonJS
- 🧪 **测试完善**: 
  - 91%+ 测试覆盖率
  - 完整的单元测试
  - 边界情况测试
  - 性能测试
- 🎨 **特殊类型规则**: 
  - 数字类型 (`number`)
  - 整数类型 (`integer`)
  - 浮点数类型 (`float`)
  - 布尔类型 (`boolean`)
  - 文本类型 (`text`)
- 📝 **参数系统**: 
  - 必需参数 (`<param:type>`)
  - 可选参数 (`[param:type]`)
  - 带默认值的可选参数 (`[param:type=default]`)
  - 剩余参数 (`[...rest:type]`)
- 🔄 **字段映射**: 
  - 单字段映射
  - 多字段优先级映射
  - 动态字段提取
- 🚦 **空格敏感**: 精确的空格匹配，确保命令解析的准确性

## 🚀 快速开始

### 安装

```bash
npm install segment-matcher
```

### 基础用法

```typescript
import { SegmentMatcher } from 'segment-matcher';

// 创建消息段匹配器（注意空格敏感）
const matcher = new SegmentMatcher('hello <name:text>'); // "hello " 后面的空格

// 匹配消息段并处理结果
const segments = [
  { type: 'text', data: { text: 'hello Alice' } } // 注意 "hello " 后面的空格
];

const result = matcher.match(segments);
if (result) {
  console.log('匹配的消息段:', result.matched);
  console.log('提取的参数:', result.params);
  console.log('剩余的消息段:', result.remaining);
}
```

### 🎨 高级特性

#### 1. 类型化字面量

```typescript
// 匹配特定类型的消息段
const matcher = new SegmentMatcher('{text:hello}{at:123456}');

// 匹配结果包含完整的消息段信息
const result = matcher.match([
  { type: 'text', data: { text: 'hello' } },
  { type: 'at', data: { user_id: 123456 } }
]);
```

#### 2. 剩余参数匹配

```typescript
// 收集所有剩余的图片
const matcher = new SegmentMatcher('图片[...images:image]');

const result = matcher.match([
  { type: 'text', data: { text: '图片' } },
  { type: 'image', data: { file: '1.jpg' } },
  { type: 'image', data: { file: '2.jpg' } }
]);

// result.params.images 将包含所有图片的 URL
```

#### 3. 自定义字段映射

```typescript
// 自定义字段映射规则
const matcher = new SegmentMatcher('图片<img:image>', {
  image: ['url', 'file', 'src']  // 按优先级尝试这些字段
});

// 匹配时会按照指定的字段优先级提取值
const result = matcher.match([
  { type: 'text', data: { text: '图片' } },
  { type: 'image', data: { url: 'https://example.com/image.jpg' } }
]);
```

#### 4. 空格敏感匹配

```typescript
// 模式中的空格必须精确匹配
const matcher = new SegmentMatcher('at <user:at> <message:text>');

// 正确的消息段（注意空格）
const segments = [
  { type: 'text', data: { text: 'at ' } },
  { type: 'at', data: { user_id: 123456 } },
  { type: 'text', data: { text: ' hello' } }
];

// 错误的消息段（缺少空格）
const wrongSegments = [
  { type: 'text', data: { text: 'at' } },
  { type: 'at', data: { user_id: 123456 } },
  { type: 'text', data: { text: 'hello' } }
];
```

### ⚠️ 注意事项

1. **空格敏感性**
   - 模式中的空格必须精确匹配
   - 使用类型化字面量可以控制空格匹配行为

2. **类型安全**
   - 建议启用 TypeScript 的严格模式
   - 使用类型断言时要小心

3. **性能优化**
   - 对于频繁使用的模式，重用 `SegmentMatcher` 实例
   - 合理使用字段映射来避免不必要的字段访问

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 📦 构建

```bash
# 构建项目
npm run build

# 清理构建产物
npm run clean
```

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接
- [GitHub 仓库](https://github.com/zhinjs/segment-matcher)
- [npm 包](https://www.npmjs.com/package/segment-matcher)
- [在线文档](https://segment-matcher.pages.dev/)