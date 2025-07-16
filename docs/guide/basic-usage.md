# 基础用法

本章将介绍 OneBot Commander 的基础用法，包括创建命令解析器、添加处理逻辑和匹配消息段。

## 创建命令解析器

### 基本语法

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander(pattern, options?);
```

- `pattern`: 匹配模式字符串
- `options`: 可选配置对象

### 简单示例

```typescript
// 创建简单的文本匹配器（注意空格敏感）
const commander = new Commander('hello '); // 注意末尾的空格

// 创建带参数的匹配器
const commanderWithParams = new Commander('hello <name:text>'); // "hello " 后面的空格

// 创建带可选参数的匹配器
const commanderWithOptional = new Commander('ping [message:text]'); // "ping " 后面的空格
```

### ⚠️ 空格敏感提醒

```typescript
// 模式: "ping [count:number=1]"
const commander = new Commander('ping [count:number=1]');

// ✅ 正确 - 用户输入 "ping " 会触发
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = commander.match(segments1); // 匹配成功

// ❌ 错误 - 用户输入 "ping" 不会触发
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = commander.match(segments2); // 匹配失败
```

## 添加处理逻辑

### action 方法

使用 `action` 方法添加处理逻辑：

```typescript
commander.action(callback);
```

回调函数接收以下参数：
- `params`: 匹配到的参数对象
- `...remaining`: 剩余的消息段

### 链式调用

```typescript
const commander = new Commander('echo <message:text>');

commander
  .action((params) => {
    console.log('收到消息:', params.message);
    return params.message.toUpperCase();
  })
  .action((upperMessage) => {
    console.log('大写消息:', upperMessage);
    return upperMessage.length;
  })
  .action((length) => {
    console.log('消息长度:', length);
  });
```

## 匹配消息段

### 同步匹配

```typescript
const segments = [
  { type: 'text', data: { text: 'echo Hello World' } }
];

const result = commander.match(segments);
```

### 异步匹配

```typescript
const result = await commander.matchAsync(segments);
```

## 完整示例

### 基础命令处理

```typescript
import { Commander } from 'onebot-commander';

// 创建命令解析器（注意空格敏感）
const commander = new Commander('hello <name:text>'); // "hello " 后面的空格

// 添加处理逻辑
commander.action((params) => {
  console.log(`Hello, ${params.name}!`);
  return `Welcome, ${params.name}!`;
});

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } } // 注意 "hello " 后面的空格
];

const result = commander.match(segments);
console.log(result); // ['Welcome, Alice!']
```

### 空格敏感示例

```typescript
// 模式: "ping [count:number=1]"
const pingCommander = new Commander('ping [count:number=1]');

pingCommander.action((params) => {
  const count = params.count || 1;
  return `Pong! (${count} times)`;
});

// ✅ 用户输入 "ping " - 匹配成功
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = pingCommander.match(segments1); // ['Pong! (1 times)']

// ❌ 用户输入 "ping" - 匹配失败
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = pingCommander.match(segments2); // []
```

### 多参数处理

```typescript
const commander = new Commander('test<arg1:text>[arg2:face]');

commander.action((params) => {
  console.log('必需参数:', params.arg1);
  if (params.arg2) {
    console.log('可选参数:', params.arg2);
  }
  return { arg1: params.arg1, arg2: params.arg2 };
});

const segments = [
  { type: 'text', data: { text: 'test123' } },
  { type: 'face', data: { id: 1 } }
];

const result = commander.match(segments);
```

### 错误处理

```typescript
try {
  const result = commander.match(segments);
  if (result.length === 0) {
    console.log('匹配失败');
  } else {
    console.log('匹配成功:', result);
  }
} catch (error) {
  console.error('处理错误:', error);
}
```

## 参数类型

### 支持的数据类型

- `text` - 文本类型
- `face` - 表情类型
- `image` - 图片类型
- `voice` - 语音类型
- `video` - 视频类型
- `file` - 文件类型
- `at` - @类型
- `reply` - 回复类型
- `forward` - 转发类型
- `json` - JSON类型
- `xml` - XML类型
- `card` - 卡片类型

### 参数示例

```typescript
// 文本参数
const textCommander = new Commander('echo <message:text>');

// 表情参数
const faceCommander = new Commander('react <emoji:face>');

// 图片参数
const imageCommander = new Commander('show <img:image>');

// @参数
const atCommander = new Commander('ping <user:at>');
```

## 返回值处理

### 同步返回值

```typescript
commander.action((params) => {
  // 返回字符串
  return 'Hello World';
  
  // 返回对象
  return { message: 'Hello', user: params.name };
  
  // 返回数组
  return ['item1', 'item2'];
  
  // 返回 null 或 undefined
  return null;
});
```

### 异步返回值

```typescript
commander.action(async (params) => {
  // 模拟异步操作
  const result = await fetchData(params.id);
  return result;
});
```

## 最佳实践

### 1. 参数验证

```typescript
commander.action((params) => {
  // 验证必需参数
  if (!params.name || params.name.trim() === '') {
    throw new Error('名称不能为空');
  }
  
  // 验证参数长度
  if (params.message && params.message.length > 100) {
    throw new Error('消息长度不能超过100字符');
  }
  
  return processParams(params);
});
```

### 2. 错误处理

```typescript
commander.action((params) => {
  try {
    return processParams(params);
  } catch (error) {
    console.error('处理参数时出错:', error);
    return { error: error.message };
  }
});
```

### 3. 性能优化

```typescript
// 缓存 Commander 实例
const commanderCache = new Map();

function getCommander(pattern) {
  if (!commanderCache.has(pattern)) {
    commanderCache.set(pattern, new Commander(pattern));
  }
  return commanderCache.get(pattern);
}
```

### 4. 代码组织

```typescript
// 将命令处理逻辑分离
class CommandHandler {
  constructor() {
    this.commanders = new Map();
    this.setupCommands();
  }
  
  setupCommands() {
    this.commanders.set('echo', new Commander('echo <message:text>'));
    this.commanders.set('ping', new Commander('ping [count:number]'));
  }
  
  handleMessage(segments) {
    for (const [name, commander] of this.commanders) {
      const result = commander.match(segments);
      if (result.length > 0) {
        return { command: name, result };
      }
    }
    return null;
  }
}
```

## 下一步

- [模式语法](/guide/pattern-syntax) - 学习完整的模式语法
- [消息段匹配](/guide/message-segments) - 深入了解消息段匹配机制
- [参数提取](/guide/parameter-extraction) - 学习参数提取技巧
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>建议从简单的文本匹配开始，逐步学习更复杂的模式。每个命令解析器都可以独立使用，也可以组合使用。</p>
</div> 