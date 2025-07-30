# 快速开始

Segment Matcher 是一个专为 OneBot 协议设计的 TypeScript 消息段匹配器。它提供了空格敏感的模式匹配和类型化参数提取功能。

## 基本概念

### 消息段 (Message Segment)
消息段是 OneBot 协议中的基本单位，包含类型和数据：

```typescript
interface MessageSegment {
  type: string;      // 消息段类型，如 'text', 'image', 'at' 等
  data: Record<string, any>;  // 消息段数据
}
```

### 模式语法
Segment Matcher 使用简洁的模式语法来描述匹配规则：

- `<name:type>` - 必需参数
- `[name:type=default]` - 可选参数，带默认值
- `{type:value}` - 字面量匹配

## 基础用法

### 1. 简单文本匹配

```typescript
import { SegmentMatcher } from 'segment-matcher';

const matcher = new SegmentMatcher('hello <name:text>');

const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = matcher.match(segments);
if (result) {
  console.log(`Hello, ${result.name}!`); // Hello, Alice!
}
```

### 2. 可选参数

```typescript
const matcher = new SegmentMatcher('ping [count:number=1]');

// 使用默认值
const result1 = matcher.match([
  { type: 'text', data: { text: 'ping' } }
]);
// result1: { count: 1 }

// 自定义参数
const result2 = matcher.match([
  { type: 'text', data: { text: 'ping 5' } }
]);
// result2: { count: 5 }
```

### 3. 多参数匹配

```typescript
const matcher = new SegmentMatcher('user <name:text> <age:number> [email:text]');

const result = matcher.match([
  { type: 'text', data: { text: 'user Alice 25 alice@example.com' } }
]);

if (result) {
  console.log(`用户: ${result.name}, 年龄: ${result.age}`);
  if (result.email) {
    console.log(`邮箱: ${result.email}`);
  }
}
```

## 空格敏感特性

Segment Matcher 对空格非常敏感，这是确保命令精确匹配的重要特性：

```typescript
const matcher = new SegmentMatcher('ping [count:number=1]');

// ✅ 匹配成功 - 有空格
const result1 = matcher.match([
  { type: 'text', data: { text: 'ping ' } }
]);

// ❌ 匹配失败 - 无空格
const result2 = matcher.match([
  { type: 'text', data: { text: 'ping' } }
]);
```

## 类型化参数

Segment Matcher 支持多种数据类型，并会自动进行类型转换：

```typescript
const matcher = new SegmentMatcher('config <timeout:number> <enabled:boolean>');

const result = matcher.match([
  { type: 'text', data: { text: 'config 30 true' } }
]);

if (result) {
  console.log(typeof result.timeout); // 'number'
  console.log(typeof result.enabled); // 'boolean'
  console.log(result.timeout); // 30
  console.log(result.enabled); // true
}
```

## 错误处理

当匹配失败时，`match()` 方法返回 `null`：

```typescript
const matcher = new SegmentMatcher('hello <name:text>');

const result = matcher.match([
  { type: 'text', data: { text: 'hi' } }  // 不匹配模式
]);

if (result === null) {
  console.log('匹配失败');
}
```
