# 类型化字面量

类型化字面量是 OneBot Commander 的高级功能，允许你精确匹配特定类型的消息段值。

## 基本概念

### 什么是类型化字面量

类型化字面量使用花括号 `{}` 语法，允许你指定消息段的类型和期望的值：

```typescript
const commander = new Commander('{text:hello}<name:text>');
// 匹配: "hello Alice" -> { name: 'Alice' }
```

语法格式：`{类型:值}`

### 支持的字段映射

每种类型都有对应的数据字段：

| 类型 | 数据字段 | 示例 |
|------|----------|------|
| `text` | `data.text` | `{text:hello}` |
| `face` | `data.id` | `{face:1}` |
| `image` | `data.file` 或 `data.url` | `{image:avatar.png}` |
| `at` | `data.user_id` | `{at:123456}` |

## 基础用法

### 文本类型化字面量

```typescript
// 匹配以 "hello" 开头的文本
const commander = new Commander('{text:hello}<name:text>');

const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = commander.match(segments);
// result[0] = { name: 'Alice' }
```

### 表情类型化字面量

```typescript
// 匹配特定 ID 的表情
const commander = new Commander('{face:1}<message:text>');

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'Hello World' } }
];

const result = commander.match(segments);
// result[0] = { message: 'Hello World' }
```

### 图片类型化字面量

```typescript
// 匹配特定文件名的图片
const commander = new Commander('{image:avatar.png}<caption:text>');

const segments = [
  { type: 'image', data: { file: 'avatar.png' } },
  { type: 'text', data: { text: 'My avatar' } }
];

const result = commander.match(segments);
// result[0] = { caption: 'My avatar' }
```

## 高级用法

### 多字段匹配

图片类型支持多个字段匹配：

```typescript
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

// 两种情况都会匹配成功
```

### 复杂模式组合

```typescript
// 组合多个类型化字面量
const commander = new Commander('{face:1}{text:start}<command:text>[image:image]');

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'start' } },
  { type: 'text', data: { text: 'upload' } },
  { type: 'image', data: { file: 'photo.jpg' } }
];

const result = commander.match(segments);
// result[0] = { command: 'upload', image: { type: 'image', data: { file: 'photo.jpg' } } }
```

### 条件匹配

使用类型化字面量进行条件匹配：

```typescript
// 只有表情 ID 为 1 时才匹配
const commander = new Commander('{face:1}<action:text>');

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

## 实际应用示例

### 表情反应系统

```typescript
// 根据表情 ID 触发不同反应
const reactionCommands = {
  happy: new Commander('{face:1}<message:text>'),
  sad: new Commander('{face:2}<message:text>'),
  angry: new Commander('{face:3}<message:text>')
};

function handleReaction(segments) {
  for (const [emotion, commander] of Object.entries(reactionCommands)) {
    const result = commander.match(segments);
    if (result.length > 0) {
      return { emotion, message: result[0].message };
    }
  }
  return null;
}

// 使用示例
const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'I am happy!' } }
];

const reaction = handleReaction(segments);
// reaction = { emotion: 'happy', message: 'I am happy!' }
```

### 图片处理系统

```typescript
// 根据图片类型进行不同处理
const imageCommands = {
  avatar: new Commander('{image:avatar.png}<user:text>'),
  photo: new Commander('{image:photo.jpg}<caption:text>'),
  screenshot: new Commander('{image:screenshot.png}<description:text>')
};

async function handleImage(segments) {
  for (const [type, commander] of Object.entries(imageCommands)) {
    const result = commander.match(segments);
    if (result.length > 0) {
      switch (type) {
        case 'avatar':
          return await processAvatar(result[0].user);
        case 'photo':
          return await processPhoto(result[0].caption);
        case 'screenshot':
          return await processScreenshot(result[0].description);
      }
    }
  }
  return null;
}
```

### 用户交互系统

```typescript
// 根据 @ 用户进行不同处理
const userCommands = {
  admin: new Commander('{at:123456}<command:text>'),
  moderator: new Commander('{at:789012}<action:text>'),
  user: new Commander('{at:345678}<request:text>')
};

function handleUserInteraction(segments) {
  for (const [role, commander] of Object.entries(userCommands)) {
    const result = commander.match(segments);
    if (result.length > 0) {
      return { role, ...result[0] };
    }
  }
  return null;
}
```

## 自定义字段映射

### 默认映射

```typescript
const DEFAULT_MAPPING = {
  text: 'text',
  face: 'id',
  image: ['file', 'url'],
  at: 'user_id',
  voice: 'file',
  video: 'file',
  file: 'file',
  reply: 'id',
  forward: 'id',
  json: 'data',
  xml: 'data',
  card: 'data'
};
```

### 自定义映射

```typescript
// 自定义字段映射
const customMapping = {
  image: 'src',  // 只匹配 data.src
  face: 'face_id',  // 匹配 data.face_id
  text: 'content'  // 匹配 data.content
};

const commander = new Commander('{image:avatar.png}<name:text>', customMapping);

const segments = [
  { type: 'image', data: { src: 'avatar.png' } },
  { type: 'text', data: { content: 'Alice' } }
];

const result = commander.match(segments);
// result[0] = { name: 'Alice' }
```

## 性能优化

### 预编译模式

```typescript
// 缓存编译后的模式
const patternCache = new Map();

function getTypedCommander(pattern, mapping = null) {
  const key = `${pattern}_${JSON.stringify(mapping)}`;
  
  if (!patternCache.has(key)) {
    patternCache.set(key, new Commander(pattern, mapping));
  }
  
  return patternCache.get(key);
}

// 使用示例
const commander = getTypedCommander('{face:1}<message:text>');
```

### 批量匹配

```typescript
function batchTypedMatch(commanders, segments) {
  for (const commander of commanders) {
    const result = commander.match(segments);
    if (result.length > 0) {
      return result;
    }
  }
  return null;
}

// 使用示例
const typedCommanders = [
  new Commander('{face:1}<message:text>'),
  new Commander('{face:2}<message:text>'),
  new Commander('{face:3}<message:text>')
];

const result = batchTypedMatch(typedCommanders, segments);
```

## 调试技巧

### 模式验证

```typescript
function validateTypedPattern(pattern) {
  const typedLiteralRegex = /\{([^:]+):([^}]+)\}/g;
  const matches = pattern.match(typedLiteralRegex);
  
  if (matches) {
    console.log('发现类型化字面量:');
    matches.forEach(match => {
      const [, type, value] = match.match(/\{([^:]+):([^}]+)\}/);
      console.log(`  类型: ${type}, 值: ${value}`);
    });
  }
  
  return matches;
}

// 使用示例
validateTypedPattern('{face:1}{text:hello}<name:text>');
```

### 匹配调试

```typescript
function debugTypedMatch(commander, segments) {
  console.log('模式:', commander.getTokens());
  console.log('消息段:', segments);
  
  // 检查类型化字面量匹配
  const tokens = commander.getTokens();
  const typedTokens = tokens.filter(token => token.type === 'typed_literal');
  
  console.log('类型化字面量令牌:', typedTokens);
  
  const result = commander.match(segments);
  console.log('匹配结果:', result);
  
  return result;
}
```

## 最佳实践

### 1. 模式设计

```typescript
// ✅ 清晰明确的类型化字面量
const good = new Commander('{face:1}<message:text>');

// ❌ 过于复杂的类型化字面量
const bad = new Commander('{face:1}{text:start}{image:avatar.png}<arg1:text>[arg2:face]');
```

### 2. 性能考虑

```typescript
// ✅ 缓存类型化命令解析器
const typedCommanders = new Map();

function getTypedCommander(pattern) {
  if (!typedCommanders.has(pattern)) {
    typedCommanders.set(pattern, new Commander(pattern));
  }
  return typedCommanders.get(pattern);
}

// ❌ 每次都创建新的解析器
function badGetCommander(pattern) {
  return new Commander(pattern); // 每次都重新创建
}
```

### 3. 错误处理

```typescript
// ✅ 完善的错误处理
try {
  const commander = new Commander('{face:1}<message:text>');
  const result = commander.match(segments);
  
  if (result.length === 0) {
    console.log('类型化字面量匹配失败');
  } else {
    console.log('匹配成功:', result);
  }
} catch (error) {
  console.error('类型化字面量处理错误:', error);
}
```

## 常见问题

### 1. 字段不匹配

```typescript
// 问题：字段名不匹配
const commander = new Commander('{image:avatar.png}<name:text>');

// 消息段使用 data.src，但默认映射是 data.file
const segments = [
  { type: 'image', data: { src: 'avatar.png' } }  // 不匹配
];

// 解决方案：使用自定义映射
const customMapping = { image: 'src' };
const commander = new Commander('{image:avatar.png}<name:text>', customMapping);
```

### 2. 值类型不匹配

```typescript
// 问题：值类型不匹配
const commander = new Commander('{face:1}<message:text>');

// 消息段中的 ID 是字符串，但模式中是数字
const segments = [
  { type: 'face', data: { id: '1' } }  // 不匹配
];

// 解决方案：使用字符串值
const commander = new Commander('{face:1}<message:text>');
```

### 3. 多字段优先级

```typescript
// 图片类型支持多个字段，按优先级匹配
const commander = new Commander('{image:avatar.png}<name:text>');

// 优先匹配 data.file，然后是 data.url
const segments = [
  { type: 'image', data: { file: 'avatar.png' } }  // 匹配成功
];

const segments2 = [
  { type: 'image', data: { url: 'avatar.png' } }  // 也匹配成功
];
```

## 下一步

- [剩余参数](/guide/rest-parameters) - 掌握剩余参数处理
- [默认值](/guide/default-values) - 了解默认值设置
- [自定义字段映射](/guide/custom-fields) - 学习自定义映射
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>类型化字面量是创建精确匹配模式的有力工具，特别适用于需要根据特定值进行条件处理的场景。</p>
</div> 