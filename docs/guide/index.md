# 快速开始

欢迎使用 OneBot Commander！这是一个专为 OneBot12 消息段设计的强大命令解析器。

## 什么是 OneBot Commander？

OneBot Commander 是一个 TypeScript 库，用于解析和匹配 OneBot12 消息段。它提供了：

- 🎯 **精确的模式匹配**：支持复杂的消息段模式
- ⚡ **高性能**：基于优化的匹配算法
- 🔧 **灵活配置**：支持自定义字段映射
- 🛡️ **类型安全**：完整的 TypeScript 支持
- 🔗 **链式调用**：优雅的 API 设计

## 安装

```bash
npm install onebot-commander
```

## 基础用法

### ⚠️ 重要：空格敏感特性

**OneBot Commander 对空格非常敏感**，这是确保命令精确匹配的重要特性：

```typescript
// 模式: "ping [count:number=1]"
const commander = new Commander('ping [count:number=1]'); // "ping " 后面的空格

// ✅ 用户输入 "ping " - 匹配成功
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = commander.match(segments1); // 匹配成功

// ❌ 用户输入 "ping" - 匹配失败
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = commander.match(segments2); // 匹配失败
```

[了解更多空格敏感特性 →](/guide/whitespace-sensitivity)

### 1. 创建命令解析器

```typescript
import { Commander } from 'onebot-commander';

// 创建一个简单的命令解析器（注意空格敏感）
const commander = new Commander('hello <name:text>'); // "hello " 后面的空格
```

### 2. 添加处理逻辑

```typescript
commander
  .action((params) => {
    console.log(`Hello, ${params.name}!`);
    return params.name.toUpperCase();
  })
  .action((upperName) => {
    console.log(`Uppercase: ${upperName}`);
  });
```

### 3. 匹配消息段

```typescript
const segments = [
  { type: 'text', data: { text: 'hello Alice' } } // 注意 "hello " 后面的空格
];

const result = commander.match(segments);
// 输出: Hello, Alice!
// 输出: Uppercase: ALICE
```

## 模式语法

OneBot Commander 使用简洁的模式语法来描述消息段结构：

### 基础语法

- `<param:type>` - 必需参数
- `[param:type]` - 可选参数
- `{type:value}` - 类型化字面量
- `text` - 普通文本字面量

### 示例模式

```typescript
// 基础文本匹配
"hello <name:text>"

// 可选参数
"ping [message:text]"

// 复杂模式
"test<arg1:text>[arg2:face]"

// 类型化字面量
"{text:test}<arg1:text>[arg2:face]"

// 表情匹配
"{face:1}<command:text>[arg:face]"

// 图片匹配
"{image:test.jpg}<arg1:text>"

// 剩余参数
"test[...rest]"
```

## 支持的消息段类型

OneBot Commander 支持所有 OneBot12 消息段类型：

- `text` - 文本
- `face` - 表情
- `image` - 图片
- `voice` - 语音
- `video` - 视频
- `file` - 文件
- `at` - @用户
- `reply` - 回复
- `forward` - 转发
- `json` - JSON
- `xml` - XML
- `card` - 卡片

## 下一步

- [安装指南](/guide/installation) - 详细的安装说明
- [基础用法](/guide/basic-usage) - 更多基础用法示例
- [模式语法](/guide/pattern-syntax) - 完整的模式语法说明
- [API 参考](/api/) - 查看完整的 API 文档

## 快速体验

你可以直接在浏览器中尝试 OneBot Commander：

```typescript
// 在线体验代码（注意空格敏感）
import { Commander } from 'onebot-commander';

const commander = new Commander('echo <message:text>'); // "echo " 后面的空格
commander.action((params) => {
  return `Echo: ${params.message}`;
});

const segments = [
  { type: 'text', data: { text: 'echo Hello World' } } // 注意 "echo " 后面的空格
];

console.log(commander.match(segments));
// 输出: ['Echo: Hello World']

// 空格敏感测试
const pingCommander = new Commander('ping [count:number=1]'); // "ping " 后面的空格
pingCommander.action((params) => {
  return `Pong! (${params.count || 1} times)`;
});

// ✅ 正确 - 有空格
console.log(pingCommander.match([{ type: 'text', data: { text: 'ping ' } }]));
// 输出: ['Pong! (1 times)']

// ❌ 错误 - 没有空格
console.log(pingCommander.match([{ type: 'text', data: { text: 'ping' } }]));
// 输出: []
```

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>OneBot Commander 专为 OneBot12 设计，如果你使用的是其他机器人框架，可能需要适配消息段格式。</p>
</div> 