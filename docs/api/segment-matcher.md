# SegmentMatcher

SegmentMatcher 是 OneBot Commander 的核心匹配引擎，负责将解析后的模式令牌与消息段进行匹配。

## 基本概念

### 什么是 SegmentMatcher

SegmentMatcher 是一个消息段匹配器，它接收模式令牌和消息段数组，执行匹配逻辑并返回匹配结果。

```typescript
import { SegmentMatcher, PatternToken } from 'onebot-commander';

const matcher = new SegmentMatcher();
const tokens = parsePattern('hello <name:text>');
const segments = [{ type: 'text', data: { text: 'hello Alice' } }];

const result = matcher.match(tokens, segments);
```

### 匹配过程

1. **令牌解析**: 将模式字符串解析为令牌数组
2. **顺序匹配**: 按顺序匹配每个令牌与对应的消息段
3. **参数提取**: 从匹配的消息段中提取参数值
4. **结果返回**: 返回匹配的参数对象和剩余消息段

## API 参考

### 构造函数

```typescript
new SegmentMatcher(options?: SegmentMatcherOptions)
```

#### 参数

- `options` (可选): 匹配器配置选项
  - `fieldMapping`: 字段映射配置
  - `strictMode`: 严格模式，默认为 `false`
  - `caseSensitive`: 大小写敏感，默认为 `true`

### 方法

#### match(tokens: PatternToken[], segments: MessageSegment[]): MatchResult

执行消息段匹配并返回结果。

```typescript
const matcher = new SegmentMatcher();
const result = matcher.match(tokens, segments);

if (result.success) {
  console.log('匹配成功:', result.params);
  console.log('剩余消息段:', result.remaining);
} else {
  console.log('匹配失败:', result.reason);
}
```

#### matchAsync(tokens: PatternToken[], segments: MessageSegment[]): Promise<MatchResult>

异步执行消息段匹配。

```typescript
const matcher = new SegmentMatcher();
const result = await matcher.matchAsync(tokens, segments);
```

## 匹配结果

### MatchResult

匹配结果对象。

```typescript
interface MatchResult {
  success: boolean;
  params?: Record<string, any>;
  remaining?: MessageSegment[];
  reason?: string;
  consumed?: number;
}
```

#### 属性说明

- `success`: 是否匹配成功
- `params`: 匹配到的参数对象
- `remaining`: 剩余的消息段
- `reason`: 匹配失败的原因
- `consumed`: 消耗的消息段数量

## 使用示例

### 基本匹配

```typescript
import { SegmentMatcher, PatternParser } from 'onebot-commander';

const parser = new PatternParser();
const matcher = new SegmentMatcher();

// 解析模式
const tokens = parser.parse('hello <name:text>');

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = matcher.match(tokens, segments);

if (result.success) {
  console.log('参数:', result.params); // { name: 'Alice' }
  console.log('剩余:', result.remaining); // []
  console.log('消耗:', result.consumed); // 1
} else {
  console.log('匹配失败:', result.reason);
}
```

### 复杂匹配

```typescript
// 复杂模式匹配
const tokens = parser.parse('{face:1}<command:text>[count:number=1]');

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'ping' } },
  { type: 'text', data: { text: '5' } }
];

const result = matcher.match(tokens, segments);

if (result.success) {
  console.log('参数:', result.params);
  // { command: 'ping', count: 5 }
  console.log('剩余:', result.remaining);
  // []
  console.log('消耗:', result.consumed);
  // 3
}
```

### 匹配失败处理

```typescript
// 匹配失败的情况
const tokens = parser.parse('{face:1}<command:text>');

const segments = [
  { type: 'face', data: { id: 2 } }, // ID 不匹配
  { type: 'text', data: { text: 'ping' } }
];

const result = matcher.match(tokens, segments);

if (!result.success) {
  console.log('匹配失败:', result.reason);
  // 输出: "类型化字面量匹配失败: 期望 face.id = 1, 实际 = 2"
}
```

## 高级用法

### 自定义字段映射

```typescript
const customMapping = {
  text: 'content',
  image: 'src',
  face: 'emoji_id'
};

const matcher = new SegmentMatcher({ fieldMapping: customMapping });

const tokens = parser.parse('{text:hello}<name:text>');

const segments = [
  { type: 'text', data: { content: 'hello Alice' } }
];

const result = matcher.match(tokens, segments);
// result.params = { name: 'Alice' }
```

### 大小写不敏感匹配

```typescript
const matcher = new SegmentMatcher({ caseSensitive: false });

const tokens = parser.parse('HELLO <name:text>');

const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = matcher.match(tokens, segments);
// 匹配成功，因为大小写不敏感
```

### 严格模式

```typescript
const matcher = new SegmentMatcher({ strictMode: true });

const tokens = parser.parse('hello <name:text>');

const segments = [
  { type: 'text', data: { text: 'hello Alice' } },
  { type: 'text', data: { text: 'extra' } }
];

const result = matcher.match(tokens, segments);
// 在严格模式下，如果有剩余消息段，匹配会失败
```

## 匹配策略

### 贪婪匹配

文本参数默认使用贪婪匹配策略：

```typescript
const tokens = parser.parse('echo <message:text>');

const segments = [
  { type: 'text', data: { text: 'echo Hello World' } }
];

const result = matcher.match(tokens, segments);
// result.params = { message: 'Hello World' }
```

### 精确匹配

类型化字面量使用精确匹配：

```typescript
const tokens = parser.parse('{text:echo}<message:text>');

const segments = [
  { type: 'text', data: { text: 'echo Hello' } }
];

const result = matcher.match(tokens, segments);
// 匹配成功，因为文本以 "echo" 开头

const segments2 = [
  { type: 'text', data: { text: 'hello echo' } }
];

const result2 = matcher.match(tokens, segments2);
// 匹配失败，因为文本不是以 "echo" 开头
```

### 可选匹配

可选参数在匹配失败时不会影响整体匹配：

```typescript
const tokens = parser.parse('ping [count:number]');

const segments1 = [
  { type: 'text', data: { text: 'ping 5' } }
];
const result1 = matcher.match(tokens, segments1);
// result1.params = { count: 5 }

const segments2 = [
  { type: 'text', data: { text: 'ping' } }
];
const result2 = matcher.match(tokens, segments2);
// result2.params = {}
```

## 错误处理

### 常见错误类型

```typescript
// 1. 类型不匹配
const tokens = parser.parse('{face:1}<text:text>');
const segments = [{ type: 'text', data: { text: 'hello' } }];
const result = matcher.match(tokens, segments);
// result.reason = "期望消息段类型为 face，实际为 text"

// 2. 值不匹配
const tokens2 = parser.parse('{face:1}<text:text>');
const segments2 = [{ type: 'face', data: { id: 2 } }];
const result2 = matcher.match(tokens2, segments2);
// result2.reason = "类型化字面量匹配失败: 期望 face.id = 1, 实际 = 2"

// 3. 必需参数缺失
const tokens3 = parser.parse('hello <name:text>');
const segments3 = [{ type: 'text', data: { text: 'hello' } }];
const result3 = matcher.match(tokens3, segments3);
// result3.reason = "必需参数 name 缺失"

// 4. 字段不存在
const tokens4 = parser.parse('{image:photo.jpg}<caption:text>');
const segments4 = [
  { type: 'image', data: { src: 'photo.jpg' } }, // 使用 src 而不是 file
  { type: 'text', data: { text: 'caption' } }
];
const result4 = matcher.match(tokens4, segments4);
// 如果字段映射不包含 src，会匹配失败
```

### 错误恢复

```typescript
function safeMatch(matcher: SegmentMatcher, tokens: PatternToken[], segments: MessageSegment[]) {
  try {
    const result = matcher.match(tokens, segments);
    
    if (result.success) {
      return { success: true, data: result };
    } else {
      // 尝试部分匹配
      const partialResult = tryPartialMatch(tokens, segments);
      if (partialResult) {
        return { 
          success: true, 
          data: partialResult, 
          warning: '部分匹配成功' 
        };
      }
      
      return { success: false, error: result.reason };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function tryPartialMatch(tokens: PatternToken[], segments: MessageSegment[]) {
  // 实现部分匹配逻辑
  // 例如：忽略可选参数，只匹配必需参数
  return null;
}
```

## 性能优化

### 匹配器缓存

```typescript
class CachedSegmentMatcher {
  private matcher = new SegmentMatcher();
  private cache = new Map<string, MatchResult>();
  
  match(tokens: PatternToken[], segments: MessageSegment[]): MatchResult {
    const key = this.generateKey(tokens, segments);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const result = this.matcher.match(tokens, segments);
    this.cache.set(key, result);
    return result;
  }
  
  private generateKey(tokens: PatternToken[], segments: MessageSegment[]): string {
    return JSON.stringify({ tokens, segments });
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
```

### 预过滤

```typescript
function preFilter(segments: MessageSegment[], requiredTypes: string[]): boolean {
  return segments.some(segment => requiredTypes.includes(segment.type));
}

// 使用预过滤提高性能
const requiredTypes = ['text', 'face'];
if (preFilter(segments, requiredTypes)) {
  const result = matcher.match(tokens, segments);
}
```

### 批量匹配

```typescript
function batchMatch(matcher: SegmentMatcher, patterns: PatternToken[][], segments: MessageSegment[]) {
  const results = [];
  
  for (const tokens of patterns) {
    const result = matcher.match(tokens, segments);
    if (result.success) {
      results.push({ tokens, result });
      break; // 找到第一个匹配就停止
    }
  }
  
  return results;
}
```

## 调试技巧

### 匹配过程日志

```typescript
class DebugSegmentMatcher extends SegmentMatcher {
  match(tokens: PatternToken[], segments: MessageSegment[]): MatchResult {
    console.log('开始匹配:');
    console.log('令牌:', tokens);
    console.log('消息段:', segments);
    
    const result = super.match(tokens, segments);
    
    console.log('匹配结果:', result);
    return result;
  }
}

const debugMatcher = new DebugSegmentMatcher();
const result = debugMatcher.match(tokens, segments);
```

### 匹配分析

```typescript
function analyzeMatch(tokens: PatternToken[], segments: MessageSegment[]) {
  const analysis = {
    tokenCount: tokens.length,
    segmentCount: segments.length,
    tokenTypes: tokens.map(t => t.type),
    segmentTypes: segments.map(s => s.type),
    complexity: calculateComplexity(tokens, segments)
  };
  
  return analysis;
}

function calculateComplexity(tokens: PatternToken[], segments: MessageSegment[]): number {
  let complexity = 0;
  
  // 令牌复杂度
  for (const token of tokens) {
    switch (token.type) {
      case 'literal':
        complexity += 1;
        break;
      case 'required_param':
        complexity += 2;
        break;
      case 'optional_param':
        complexity += 3;
        break;
      case 'typed_literal':
        complexity += 2;
        break;
      case 'rest_param':
        complexity += 4;
        break;
    }
  }
  
  // 消息段复杂度
  complexity += segments.length;
  
  return complexity;
}
```

### 匹配统计

```typescript
class StatisticsSegmentMatcher extends SegmentMatcher {
  private stats = {
    totalMatches: 0,
    successfulMatches: 0,
    failedMatches: 0,
    averageConsumed: 0,
    matchTimes: []
  };
  
  match(tokens: PatternToken[], segments: MessageSegment[]): MatchResult {
    const start = performance.now();
    
    const result = super.match(tokens, segments);
    
    const end = performance.now();
    const duration = end - start;
    
    this.updateStats(result, duration);
    
    return result;
  }
  
  private updateStats(result: MatchResult, duration: number) {
    this.stats.totalMatches++;
    this.stats.matchTimes.push(duration);
    
    if (result.success) {
      this.stats.successfulMatches++;
      if (result.consumed) {
        this.stats.averageConsumed = 
          (this.stats.averageConsumed * (this.stats.successfulMatches - 1) + result.consumed) / 
          this.stats.successfulMatches;
      }
    } else {
      this.stats.failedMatches++;
    }
  }
  
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.successfulMatches / this.stats.totalMatches,
      averageTime: this.stats.matchTimes.reduce((a, b) => a + b, 0) / this.stats.matchTimes.length
    };
  }
}
```

## 最佳实践

### 1. 错误处理

```typescript
// ✅ 完善的错误处理
function safeMatch(matcher: SegmentMatcher, tokens: PatternToken[], segments: MessageSegment[]) {
  try {
    const result = matcher.match(tokens, segments);
    
    if (result.success) {
      return { success: true, data: result };
    } else {
      console.warn('匹配失败:', result.reason);
      return { success: false, error: result.reason };
    }
  } catch (error) {
    console.error('匹配异常:', error);
    return { success: false, error: error.message };
  }
}

// ❌ 忽略错误
function badMatch(matcher: SegmentMatcher, tokens: PatternToken[], segments: MessageSegment[]) {
  return matcher.match(tokens, segments); // 可能抛出未处理的异常
}
```

### 2. 性能考虑

```typescript
// ✅ 使用缓存的匹配器
const cachedMatcher = new CachedSegmentMatcher();

function processMessages(messages: Array<{ tokens: PatternToken[], segments: MessageSegment[] }>) {
  return messages.map(({ tokens, segments }) => 
    cachedMatcher.match(tokens, segments)
  );
}

// ❌ 每次都创建新匹配器
function badProcessMessages(messages: Array<{ tokens: PatternToken[], segments: MessageSegment[] }>) {
  return messages.map(({ tokens, segments }) => {
    const matcher = new SegmentMatcher(); // 每次都创建新实例
    return matcher.match(tokens, segments);
  });
}
```

### 3. 调试友好

```typescript
// ✅ 调试友好的匹配器
class DebugMatcher extends SegmentMatcher {
  constructor(options?: SegmentMatcherOptions) {
    super(options);
    this.enableDebug = true;
  }
  
  match(tokens: PatternToken[], segments: MessageSegment[]): MatchResult {
    if (this.enableDebug) {
      console.log('匹配开始:', { tokens, segments });
    }
    
    const result = super.match(tokens, segments);
    
    if (this.enableDebug) {
      console.log('匹配结果:', result);
    }
    
    return result;
  }
}

// ❌ 难以调试的匹配器
function badMatch(tokens: PatternToken[], segments: MessageSegment[]) {
  // 没有日志，难以调试
  return new SegmentMatcher().match(tokens, segments);
}
```

## 下一步

- [错误处理](/api/errors) - 掌握错误处理机制
- [类型定义](/api/types) - 了解类型系统
- [PatternParser](/api/pattern-parser) - 学习模式解析器
- [Commander](/api/commander) - 查看主要的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>SegmentMatcher 是 OneBot Commander 的核心匹配引擎，理解其工作原理有助于优化匹配性能。</p>
</div> 