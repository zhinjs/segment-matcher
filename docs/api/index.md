# API 参考

欢迎使用 OneBot Commander API 参考文档。本页面提供了完整的 API 概览和快速导航。

## API 概览

OneBot Commander 提供了以下核心 API：

### 主要类

- **[Commander](./commander)** - 主要的消息段处理类
- **[PatternParser](./pattern-parser)** - 模式解析器
- **[SegmentMatcher](./segment-matcher)** - 消息段匹配器

### 类型系统

- **[类型定义](./types)** - 完整的 TypeScript 类型定义
- **[错误处理](./errors)** - 错误类型和处理机制

## 快速开始

### 基础用法

```typescript
import { Commander } from 'onebot-commander';

// 创建指挥官实例
const commander = new Commander();

// 注册处理器（注意空格敏感）
commander.on('text', (segment, context) => {
  return 'Hello World';
});

// 处理消息
const result = await commander.process([
  { type: 'text', data: { text: 'Hello' } }
]);
```

### ⚠️ 空格敏感特性

OneBot Commander 对空格非常敏感，这是确保命令精确匹配的重要特性：

```typescript
// 模式: "ping [count:number=1]"
commander.on('text', (segment, context) => {
  return 'Pong!';
});

// ✅ 用户输入 "ping " - 匹配成功
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = await commander.process(segments1); // ['Pong!']

// ❌ 用户输入 "ping" - 匹配失败
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = await commander.process(segments2); // []
```

### 参数提取

```typescript
// 提取文本参数
commander.on('text:message', (segment, context) => {
  console.log(context.params.message);
  return `收到消息: ${context.params.message}`;
});

// 类型化参数
commander.on('text:count<number>', (segment, context) => {
  const count = context.params.count; // 自动推断为 number 类型
  return `计数: ${count}`;
});
```

### 链式调用

```typescript
commander
  .on('text', (segment, context) => {
    return '第一步处理';
  })
  .on('text', (segment, context) => {
    return '第二步处理';
  });
```

## API 特性

### 🚀 高性能

- 智能缓存机制
- 高效的模式匹配
- 内存优化

### 🔧 类型安全

- 完整的 TypeScript 支持
- 类型化参数提取
- 编译时类型检查

### 🎯 灵活配置

- 自定义字段映射
- 可配置的缓存策略
- 调试模式支持

### 🔄 异步支持

- 原生 async/await 支持
- Promise 链式处理
- 错误处理机制

## 核心概念

### 消息段 (Message Segment)

消息段是 OneBot 协议中的基本单位，包含类型和数据：

```typescript
interface MessageSegment {
  type: string;           // 消息段类型
  data: Record<string, any>; // 消息段数据
}
```

### 模式 (Pattern)

模式定义了如何匹配和提取消息段中的信息：

```typescript
// 简单模式
'text'

// 参数提取模式
'text:message'

// 类型化模式
'text:count<number>'

// 默认值模式
'text:message="default"'

// 剩余参数模式
'text:first:string...rest:string[]'
```

### 处理器 (Handler)

处理器是响应匹配消息段的函数：

```typescript
type Handler = (
  segment: MessageSegment,
  context: ProcessingContext
) => any | Promise<any>;
```

### 处理上下文 (Processing Context)

处理上下文包含匹配的参数和元数据：

```typescript
interface ProcessingContext {
  params: Record<string, any>;    // 提取的参数
  metadata?: Record<string, any>; // 元数据
}
```

## 配置选项

### Commander 配置

```typescript
interface CommanderOptions {
  enableCache?: boolean;    // 启用缓存 (默认: true)
  cacheSize?: number;       // 缓存大小 (默认: 1000)
  debug?: boolean;          // 调试模式 (默认: false)
  fieldMappings?: {         // 字段映射
    [segmentType: string]: {
      [originalField: string]: string;
    };
  };
}
```

### 使用配置

```typescript
const commander = new Commander({
  enableCache: true,
  cacheSize: 2000,
  debug: true,
  fieldMappings: {
    text: { text: 'content' },
    image: { file: 'url' }
  }
});
```

## 错误处理

### 错误类型

```typescript
// 模式解析错误
class PatternParseError extends Error {
  constructor(pattern: string, message: string);
}

// 匹配错误
class MatchError extends Error {
  constructor(segment: MessageSegment, pattern: string);
}

// 处理错误
class ProcessingError extends Error {
  constructor(message: string, cause?: Error);
}
```

### 错误处理示例

```typescript
try {
  const result = await commander.process(segments);
  return result;
} catch (error) {
  if (error instanceof PatternParseError) {
    console.error('模式解析失败:', error.message);
  } else if (error instanceof MatchError) {
    console.error('匹配失败:', error.message);
  } else {
    console.error('处理失败:', error.message);
  }
}
```

## 性能优化

### 缓存策略

```typescript
// 启用缓存
const commander = new Commander({
  enableCache: true,
  cacheSize: 1000
});

// 手动清理缓存
commander.clearCache();

// 获取缓存统计
const stats = commander.getCacheStats();
console.log('缓存命中率:', stats.hitRate);
```

### 批量处理

```typescript
// 批量处理多个消息段
const results = await Promise.all(
  segments.map(segment => commander.process([segment]))
);
```

## 调试技巧

### 启用调试模式

```typescript
const commander = new Commander({
  debug: true
});

// 调试信息会输出到控制台
commander.on('text', (segment, context) => {
  console.log('处理消息段:', segment);
  console.log('上下文:', context);
  return 'debug response';
});
```

### 性能监控

```typescript
// 监控处理时间
const startTime = performance.now();
const result = await commander.process(segments);
const endTime = performance.now();

console.log(`处理耗时: ${endTime - startTime}ms`);
```

## 最佳实践

### 1. 模式设计

```typescript
// 好的模式设计
commander.on('text:command<string>', (segment, context) => {
  const command = context.params.command;
  return handleCommand(command);
});

// 避免过于复杂的模式
commander.on('text:very:complex:nested:pattern', (segment, context) => {
  // 难以维护
});
```

### 2. 错误处理

```typescript
// 优雅的错误处理
commander.on('text', async (segment, context) => {
  try {
    const result = await riskyOperation(segment.data.text);
    return result;
  } catch (error) {
    console.error('操作失败:', error);
    return '操作失败，请稍后重试';
  }
});
```

### 3. 性能优化

```typescript
// 使用缓存
const cache = new Map();

commander.on('text:query', async (segment, context) => {
  const query = context.params.query;
  const cacheKey = `query_${query}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await expensiveOperation(query);
  cache.set(cacheKey, result);
  return result;
});
```

## 迁移指南

### 从旧版本迁移

如果你正在从旧版本迁移，请参考：

- **[从 1.0.5 迁移](../migration/from-1.0.5)** - 详细的迁移步骤
- **[迁移常见问题](../migration/faq)** - 常见问题和解决方案

### 兼容性说明

- **向后兼容**：新版本保持与旧版本的 API 兼容性
- **渐进式升级**：可以逐步使用新功能
- **类型安全**：TypeScript 类型定义完全兼容

## 获取帮助

### 文档资源

- **[使用指南](../guide/)** - 详细的使用教程
- **[示例代码](../examples/)** - 丰富的代码示例
- **[贡献指南](../contributing/)** - 参与项目开发

### 社区支持

- **GitHub Issues** - 报告 bug 和功能请求
- **GitHub Discussions** - 讨论和问答
- **文档反馈** - 改进文档建议

### 快速链接

- [Commander API](./commander)
- [PatternParser API](./pattern-parser)
- [SegmentMatcher API](./segment-matcher)
- [类型定义](./types)
- [错误处理](./errors)

---

开始使用 OneBot Commander API 吧！如果你有任何问题，请随时查看相关文档或寻求社区帮助。 