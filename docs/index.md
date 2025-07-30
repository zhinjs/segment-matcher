# Segment Matcher

一个强大的 TypeScript 消息段匹配器，专为 OneBot 协议设计，支持空格敏感的模式匹配和类型化参数提取。

## ✨ 核心特性

- 🎯 **空格敏感匹配** - 精确控制命令格式，避免误匹配
- 🔧 **类型化参数** - 自动类型转换和验证
- ⚡ **高性能** - 智能缓存和高效匹配算法
- 🛡️ **类型安全** - 完整的 TypeScript 支持
- 🔄 **灵活配置** - 自定义字段映射和默认值

## 🚀 快速开始

```typescript
import { SegmentMatcher } from 'segment-matcher';

// 创建匹配器
const matcher = new SegmentMatcher('hello <name:text>');

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = matcher.match(segments);
if (result) {
  console.log(`Hello, ${result.name}!`); // Hello, Alice!
}
```

## 📦 安装

```bash
npm install segment-matcher
```

## 🎯 主要功能

### 空格敏感特性
确保命令格式的精确匹配，避免误触发：

```typescript
const matcher = new SegmentMatcher('ping [count:number=1]');

// ✅ 匹配成功 - 有空格
matcher.match([{ type: 'text', data: { text: 'ping ' } }]);

// ❌ 匹配失败 - 无空格
matcher.match([{ type: 'text', data: { text: 'ping' } }]);
```

### 类型化参数
自动类型转换和验证：

```typescript
const matcher = new SegmentMatcher('user <name:text> <age:number>');

const result = matcher.match([
  { type: 'text', data: { text: 'user Alice 25' } }
]);

if (result) {
  console.log(typeof result.age); // 'number'
  console.log(result.age); // 25
}
```

### 可选参数和默认值
灵活的参数配置：

```typescript
const matcher = new SegmentMatcher('greet [name:text=World] [count:number=1]');

// 使用默认值
const result1 = matcher.match([{ type: 'text', data: { text: 'greet' } }]);
// result1: { name: 'World', count: 1 }

// 自定义参数
const result2 = matcher.match([{ type: 'text', data: { text: 'greet Alice 3' } }]);
// result2: { name: 'Alice', count: 3 }
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- [GitHub 仓库](https://github.com/your-username/segment-matcher)
- [问题反馈](https://github.com/your-username/segment-matcher/issues)
- [功能建议](https://github.com/your-username/segment-matcher/discussions)

## 📄 许可证

MIT License - 详见 [LICENSE](https://github.com/your-username/segment-matcher/blob/main/LICENSE) 文件 