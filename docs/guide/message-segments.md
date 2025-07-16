# 消息段匹配

消息段匹配是 OneBot Commander 的核心功能。本章将深入介绍消息段的结构、匹配机制和最佳实践。

## OneBot12 消息段结构

### 基本结构

每个消息段都包含以下字段：

```typescript
interface MessageSegment {
  type: string;      // 消息段类型
  data: Record<string, any>;  // 消息段数据
}
```

### 常见消息段类型

#### 文本消息段

```typescript
{
  type: 'text',
  data: {
    text: 'Hello World'
  }
}
```

#### 表情消息段

```typescript
{
  type: 'face',
  data: {
    id: 1
  }
}
```

#### 图片消息段

```typescript
{
  type: 'image',
  data: {
    file: 'http://example.com/image.jpg'
    // 或者
    url: 'http://example.com/image.jpg'
  }
}
```

#### @用户消息段

```typescript
{
  type: 'at',
  data: {
    user_id: 123456
  }
}
```

## 匹配机制

### 1. 类型匹配

首先检查消息段的类型是否匹配：

```typescript
const commander = new Commander('{face:1}<message:text>');

// 匹配成功
const segments1 = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'hello' } }
];

// 匹配失败 - 表情 ID 不匹配
const segments2 = [
  { type: 'face', data: { id: 2 } },
  { type: 'text', data: { text: 'hello' } }
];
```

### 2. 数据字段匹配

根据类型化字面量的值匹配数据字段：

```typescript
// 默认字段映射
const fieldMapping = {
  text: 'text',
  face: 'id',
  image: ['file', 'url'],
  at: 'user_id'
};

// 图片匹配示例
const commander = new Commander('{image:avatar.png}<caption:text>');

// 匹配 data.file
const segments1 = [
  { type: 'image', data: { file: 'avatar.png' } },
  { type: 'text', data: { text: 'My avatar' } }
];

// 匹配 data.url
const segments2 = [
  { type: 'image', data: { url: 'avatar.png' } },
  { type: 'text', data: { text: 'My avatar' } }
];
```

### 3. 顺序匹配

消息段按照在数组中的顺序进行匹配：

```typescript
const commander = new Commander('start<arg:text>end');

// 匹配成功
const segments1 = [
  { type: 'text', data: { text: 'start' } },
  { type: 'text', data: { text: 'middle' } },
  { type: 'text', data: { text: 'end' } }
];

// 匹配失败 - 顺序错误
const segments2 = [
  { type: 'text', data: { text: 'end' } },
  { type: 'text', data: { text: 'middle' } },
  { type: 'text', data: { text: 'start' } }
];
```

## 匹配策略

### 1. 贪婪匹配

默认情况下，文本参数会尽可能多地匹配：

```typescript
const commander = new Commander('echo <message:text>');

const segments = [
  { type: 'text', data: { text: 'echo Hello World' } }
];

// 匹配结果: { message: 'Hello World' }
const result = commander.match(segments);
```

### 2. 精确匹配

类型化字面量要求精确匹配：

```typescript
const commander = new Commander('{text:echo}<message:text>');

// 匹配成功
const segments1 = [
  { type: 'text', data: { text: 'echo Hello' } }
];

// 匹配失败 - 不是以 "echo" 开头
const segments2 = [
  { type: 'text', data: { text: 'hello echo' } }
];
```

### 3. 可选匹配

可选参数在匹配失败时不会影响整体匹配：

```typescript
const commander = new Commander('ping [message:text]');

// 有可选参数
const segments1 = [
  { type: 'text', data: { text: 'ping hello' } }
];
// 结果: { message: 'hello' }

// 无可选参数
const segments2 = [
  { type: 'text', data: { text: 'ping' } }
];
// 结果: {}
```

## 高级匹配技巧

### 1. 混合消息段匹配

```typescript
const commander = new Commander('{face:1}<command:text>[image:image]');

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'upload' } },
  { type: 'image', data: { file: 'photo.jpg' } }
];

const result = commander.match(segments);
// 结果: { command: 'upload', image: { type: 'image', data: { file: 'photo.jpg' } } }
```

### 2. 剩余参数匹配

```typescript
const commander = new Commander('forward[...messages]');

const segments = [
  { type: 'text', data: { text: 'forward' } },
  { type: 'text', data: { text: 'message1' } },
  { type: 'face', data: { id: 1 } },
  { type: 'image', data: { file: 'img.jpg' } }
];

const result = commander.match(segments);
// 结果: { messages: [text1, face1, image1] }
```

### 3. 类型化剩余参数

```typescript
const commander = new Commander('react[...faces:face]');

const segments = [
  { type: 'text', data: { text: 'react' } },
  { type: 'face', data: { id: 1 } },
  { type: 'face', data: { id: 2 } },
  { type: 'text', data: { text: 'hello' } }
];

const result = commander.match(segments);
// 结果: { faces: [face1, face2] }
// 剩余: [text1]
```

## 匹配失败处理

### 1. 常见失败原因

```typescript
// 1. 类型不匹配
const commander1 = new Commander('{face:1}<text:text>');
const segments1 = [
  { type: 'text', data: { text: 'hello' } }  // 期望 face 类型
];

// 2. 值不匹配
const commander2 = new Commander('{face:1}<text:text>');
const segments2 = [
  { type: 'face', data: { id: 2 } },  // 期望 id: 1
  { type: 'text', data: { text: 'hello' } }
];

// 3. 必需参数缺失
const commander3 = new Commander('hello <name:text>');
const segments3 = [
  { type: 'text', data: { text: 'hello' } }  // 缺少 name 参数
];

// 4. 顺序错误
const commander4 = new Commander('start<arg:text>end');
const segments4 = [
  { type: 'text', data: { text: 'end' } },
  { type: 'text', data: { text: 'middle' } },
  { type: 'text', data: { text: 'start' } }
];
```

### 2. 错误处理

```typescript
function safeMatch(commander, segments) {
  try {
    const result = commander.match(segments);
    if (result.length === 0) {
      return { success: false, reason: 'no_match' };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 使用示例
const result = safeMatch(commander, segments);
if (result.success) {
  console.log('匹配成功:', result.data);
} else {
  console.log('匹配失败:', result.reason);
}
```

## 性能优化

### 1. 缓存匹配器

```typescript
const commanderCache = new Map();

function getCommander(pattern) {
  if (!commanderCache.has(pattern)) {
    commanderCache.set(pattern, new Commander(pattern));
  }
  return commanderCache.get(pattern);
}
```

### 2. 批量处理

```typescript
function batchMatch(commanders, segments) {
  const results = [];
  
  for (const commander of commanders) {
    const result = commander.match(segments);
    if (result.length > 0) {
      results.push({ commander, result });
      break; // 找到第一个匹配就停止
    }
  }
  
  return results;
}
```

### 3. 预过滤

```typescript
function preFilter(segments, requiredTypes) {
  return segments.some(segment => requiredTypes.includes(segment.type));
}

// 使用示例
const requiredTypes = ['text', 'face'];
if (preFilter(segments, requiredTypes)) {
  const result = commander.match(segments);
}
```

## 调试技巧

### 1. 查看匹配过程

```typescript
function debugMatch(commander, segments) {
  console.log('模式:', commander.getTokens());
  console.log('消息段:', segments);
  
  const result = commander.match(segments);
  console.log('匹配结果:', result);
  
  return result;
}
```

### 2. 验证消息段格式

```typescript
function validateSegments(segments) {
  return segments.every(segment => {
    return segment && 
           typeof segment.type === 'string' && 
           segment.data && 
           typeof segment.data === 'object';
  });
}
```

### 3. 测试工具

```typescript
function testMatch(pattern, testCases) {
  const commander = new Commander(pattern);
  
  testCases.forEach(({ segments, expected, description }) => {
    const result = commander.match(segments);
    const success = JSON.stringify(result) === JSON.stringify(expected);
    
    console.log(`${description}: ${success ? '✅' : '❌'}`);
    if (!success) {
      console.log('  期望:', expected);
      console.log('  实际:', result);
    }
  });
}

// 使用示例
testMatch('hello <name:text>', [
  {
    segments: [{ type: 'text', data: { text: 'hello Alice' } }],
    expected: [{ name: 'Alice' }],
    description: '基础文本匹配'
  }
]);
```

## 最佳实践

### 1. 模式设计

```typescript
// ✅ 清晰明确的模式
const good = new Commander('command <required:text> [optional:face]');

// ❌ 过于复杂的模式
const bad = new Commander('cmd<arg1:text>[arg2:face][arg3:image][arg4:at]');
```

### 2. 错误处理

```typescript
// ✅ 完善的错误处理
try {
  const result = commander.match(segments);
  if (result.length === 0) {
    // 处理匹配失败
    return handleNoMatch(segments);
  }
  return processResult(result);
} catch (error) {
  // 处理异常
  console.error('匹配异常:', error);
  return handleError(error);
}
```

### 3. 性能考虑

```typescript
// ✅ 性能优化
const commanders = new Map();
commanders.set('echo', new Commander('echo <message:text>'));
commanders.set('ping', new Commander('ping [count:number]'));

function handleMessage(segments) {
  for (const [name, commander] of commanders) {
    const result = commander.match(segments);
    if (result.length > 0) {
      return { command: name, result };
    }
  }
  return null;
}
```

## 下一步

- [参数提取](/guide/parameter-extraction) - 学习参数处理技巧
- [链式回调](/guide/action-chaining) - 了解回调链机制
- [异步处理](/guide/async-processing) - 掌握异步匹配
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>消息段匹配是 OneBot Commander 的基础，理解匹配机制有助于创建更准确和高效的模式。</p>
</div> 