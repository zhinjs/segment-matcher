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
- 🎨 **丰富的类型系统**: 
  - 数字类型 (`number`) - 整数或浮点数
  - 整数类型 (`integer`) - 仅整数
  - 浮点数类型 (`float`) - 必须带小数点
  - 布尔类型 (`boolean`) - true/false
  - 单词类型 (`word`) - 非空格字符序列 ⭐ 新增
  - 文本类型 (`text`) - 支持引号包裹 ⭐ 增强
- 📝 **参数系统**: 
  - 必需参数 (`<param:type>`)
  - 可选参数 (`[param:type]`)
  - 带默认值的可选参数 (`[param:type=default]`)
  - 剩余参数 (`[...rest:type]`)
- 🔄 **字段映射**: 
  - 单字段映射
  - 多字段优先级映射
  - 动态字段提取
- 🚦 **智能空格处理**: 
  - 参数间的单个空格自动处理 ⭐ 新增
  - 多个空格视为字面量精确匹配
  - 支持单个文本段自动提取多个参数 ⭐ 新增
- 💬 **引号支持**: 
  - 单引号和双引号 ⭐ 新增
  - 嵌套不同类型引号 ⭐ 新增
  - 多个 text 参数明确边界 ⭐ 新增

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

#### 1. 单个文本段多参数提取 ⭐ 新功能

```typescript
// 支持从单个连续文本段中提取多个参数
const matcher = new SegmentMatcher('move [x:number=0] [y:number=0]');

// 单个文本段，匹配器会自动提取参数
const result = matcher.match([
  { type: 'text', data: { text: 'move 10 20' } }
]);

console.log(result.params); // { x: 10, y: 20 }
```

#### 2. word 类型 - 非空格字符 ⭐ 新类型

```typescript
// word 类型可以提取多个单词参数，不会像 text 那样贪婪匹配
const matcher = new SegmentMatcher('config [key:word=name] [value:word=default]');

const result = matcher.match([
  { type: 'text', data: { text: 'config database mysql' } }
]);

console.log(result.params); // { key: 'database', value: 'mysql' }
```

#### 3. 引号支持 - 包含空格的文本 ⭐ 新功能

```typescript
// 使用引号可以提取多个包含空格的 text 参数
const matcher = new SegmentMatcher('post [title:text=Untitled] [tags:text=none]');

// 使用双引号
const result1 = matcher.match([
  { type: 'text', data: { text: 'post "My Article Title" "tag1 tag2 tag3"' } }
]);
console.log(result1.params); 
// { title: 'My Article Title', tags: 'tag1 tag2 tag3' }

// 使用单引号
const result2 = matcher.match([
  { type: 'text', data: { text: "post 'Quick Tips' 'tutorial'" } }
]);
console.log(result2.params); 
// { title: 'Quick Tips', tags: 'tutorial' }

// 嵌套不同类型引号
const result3 = matcher.match([
  { type: 'text', data: { text: `post "It's great" 'He said "hello"'` } }
]);
console.log(result3.params); 
// { title: "It's great", tags: 'He said "hello"' }
```

#### 4. 类型化字面量

```typescript
// 匹配特定类型的消息段
const matcher = new SegmentMatcher('{text:hello}{at:123456}');

// 匹配结果包含完整的消息段信息
const result = matcher.match([
  { type: 'text', data: { text: 'hello' } },
  { type: 'at', data: { user_id: 123456 } }
]);
```

#### 5. 剩余参数匹配

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

#### 6. 自定义字段映射

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

#### 7. 智能空格处理 ⭐ 新功能

```typescript
// 参数间的单个空格会被自动处理（可选）
const matcher = new SegmentMatcher('cmd [a:number] [b:number]');

// 以下两种输入都可以匹配
matcher.match([{ type: 'text', data: { text: 'cmd 10 20' } }]);   // 有空格 ✅
matcher.match([{ type: 'text', data: { text: 'cmd 1020' } }]);     // 紧贴也可以 ✅

// 但多个空格会被视为字面量
const strictMatcher = new SegmentMatcher('cmd  [a:number]'); // 两个空格
strictMatcher.match([{ type: 'text', data: { text: 'cmd  10' } }]);  // 必须两个空格 ✅
strictMatcher.match([{ type: 'text', data: { text: 'cmd 10' } }]);   // 一个空格 ❌
```

### 📚 类型对比指南

| 场景 | 推荐类型 | 示例 | 说明 |
|------|---------|------|------|
| 单个单词 | `word` | `[name:word]` | 不包含空格的字符串 |
| 包含空格的文本 | `text` + 引号 | `[msg:text]` 输入 `"hello world"` | 明确边界 |
| 最后一个参数 | `text` | `[msg:text]` | 贪婪匹配剩余内容 |
| 数字 | `number` | `[count:number]` | 整数或浮点数 |
| 整数 | `integer` | `[age:integer]` | 只接受整数 |
| 浮点数 | `float` | `[price:float]` | 必须带小数点 |
| 布尔值 | `boolean` | `[flag:boolean]` | true/false |

### ⚠️ 注意事项

1. **智能空格处理** ⭐ 更新
   - 参数间的单个空格自动处理（可选匹配）
   - 多个连续空格视为字面量（必须精确匹配）
   - 支持单个文本段自动提取多个参数

2. **引号使用建议** ⭐ 新增
   - 使用引号包裹包含空格的 text 参数
   - 双引号内可以使用单引号，反之亦然
   - 相同类型的引号不能嵌套（如 `"a"b"` 会在第二个 `"` 处结束）

3. **类型选择** ⭐ 新增
   - 多个单词参数优先使用 `word` 类型
   - 需要包含空格时使用 `text` + 引号
   - `text` 类型放在参数列表末尾可以省略引号

4. **类型安全**
   - 建议启用 TypeScript 的严格模式
   - 使用类型断言时要小心

5. **性能优化**
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