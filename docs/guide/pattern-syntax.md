# 模式语法

OneBot Commander 使用简洁而强大的模式语法来描述消息段结构。本章将详细介绍所有支持的语法元素。

## ⚠️ 重要：空格敏感特性

**OneBot Commander 对空格非常敏感**，这是一个重要的特性：

- 模式中的空格必须与输入文本中的空格完全匹配
- 缺少空格或多余空格都会导致匹配失败
- 这个特性确保了命令的精确匹配

### 空格敏感示例

```typescript
// 模式: "ping [count:number={value:1}]"
const commander = new Commander('ping [count:number={value:1}]');

// ✅ 匹配成功 - 有空格
commander.match([{ type: 'text', data: { text: 'ping ' } }]);

// ❌ 匹配失败 - 没有空格
commander.match([{ type: 'text', data: { text: 'ping' } }]);

// ❌ 匹配失败 - 多余空格
commander.match([{ type: 'text', data: { text: 'ping  ' } }]);
```

### 空格处理最佳实践

```typescript
// 1. 明确指定空格
const commander1 = new Commander('hello <name:text>'); // 注意 "hello " 后面的空格

// 2. 使用可选参数时注意空格
const commander2 = new Commander('ping [count:number={value:1}]'); // "ping " 后面的空格

// 3. 多参数时的空格处理
const commander3 = new Commander('echo <message:text> <count:number>'); // 参数间的空格
```

## 基本语法元素

### 1. 文本字面量

纯文本，直接匹配（注意空格）：

```typescript
const commander = new Commander('hello ');
// 匹配: "hello " (注意末尾的空格)
// 不匹配: "hello" (没有空格)
```

### 2. 必需参数

使用尖括号 `<>` 表示必需参数：

```typescript
const commander = new Commander('hello <name:text>');
// 匹配: "hello Alice" -> { name: 'Alice' }
```

语法：`<参数名:类型>`

### 3. 可选参数

使用方括号 `[]` 表示可选参数：

```typescript
const commander = new Commander('ping [message:text]');
// 匹配: "ping" -> {}
// 匹配: "ping hello" -> { message: 'hello' }
```

语法：`[参数名:类型]`

### 4. 类型化字面量

使用花括号 `{}` 表示类型化字面量：

```typescript
const commander = new Commander('{text:test}<arg:text>');
// 匹配: "test123" -> { arg: '123' }
```

语法：`{类型:值}`

### 5. 剩余参数

使用 `...` 表示剩余参数：

```typescript
const commander = new Commander('test[...rest]');
// 匹配: "test a b c" -> { rest: ['a', 'b', 'c'] }
```

语法：`[...参数名]` 或 `[...参数名:类型]`

## 支持的数据类型

### 基础类型

| 类型 | 描述 | 示例 |
|------|------|------|
| `text` | 文本类型 | `"hello world"` |
| `number` | 数字类型 | `123`, `3.14` |
| `boolean` | 布尔类型 | `true`, `false` |

### OneBot 消息段类型

| 类型 | 描述 | 数据字段 |
|------|------|----------|
| `face` | 表情 | `data.id` |
| `image` | 图片 | `data.file` 或 `data.url` |
| `voice` | 语音 | `data.file` |
| `video` | 视频 | `data.file` |
| `file` | 文件 | `data.file` |
| `at` | @用户 | `data.user_id` |
| `reply` | 回复 | `data.id` |
| `forward` | 转发 | `data.id` |
| `json` | JSON | `data.data` |
| `xml` | XML | `data.data` |
| `card` | 卡片 | `data.data` |

## 复杂模式示例

### 混合参数模式

```typescript
// 必需参数 + 可选参数
const commander1 = new Commander('test<arg1:text>[arg2:face]');

// 类型化字面量 + 参数
const commander2 = new Commander('{text:start}<arg:text>[opt:face]');

// 多个必需参数
const commander3 = new Commander('echo <message:text> <count:number>');
```

### 剩余参数模式

```typescript
// 通用剩余参数
const commander1 = new Commander('test[...rest]');

// 类型化剩余参数
const commander2 = new Commander('test[...faces:face]');

// 混合剩余参数
const commander3 = new Commander('test<first:text>[...rest]');
```

### 默认值支持

```typescript
// 文本默认值
const commander1 = new Commander('foo[msg:text={text:hello}]');

// 表情默认值
const commander2 = new Commander('foo[emoji:face={id:1}]');

// 数字默认值
const commander3 = new Commander('foo[count:number={value:10}]');
```

## 高级语法特性

### 1. 嵌套参数

```typescript
// 复杂对象参数
const commander = new Commander('config <settings:json>');

// 匹配 JSON 数据
const segments = [
  { type: 'text', data: { text: 'config' } },
  { type: 'json', data: { data: '{"theme":"dark"}' } }
];
```

### 2. 条件匹配

```typescript
// 使用类型化字面量进行条件匹配
const commander = new Commander('{face:1}<command:text>');

// 只有表情 ID 为 1 时才会匹配
const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'hello' } }
];
```

### 3. 多字段匹配

```typescript
// 图片支持 file 和 url 字段
const commander = new Commander('{image:avatar.png}<name:text>');

// 匹配 data.file 或 data.url
const segments = [
  { type: 'image', data: { file: 'avatar.png' } },
  { type: 'text', data: { text: 'Alice' } }
];
```

## 自定义字段映射

### 默认映射

```typescript
const DEFAULT_MAPPING = {
  text: 'text',
  face: 'id',
  image: ['file', 'url'],
  at: 'user_id',
  // ... 其他类型
};
```

### 自定义映射

```typescript
const customMapping = {
  image: 'src',  // 只匹配 data.src
  face: 'face_id',  // 匹配 data.face_id
  text: 'content'  // 匹配 data.content
};

const commander = new Commander('{image:avatar.png}<name:text>', customMapping);
```

## 模式解析规则

### 1. 优先级规则

1. 类型化字面量优先级最高
2. 必需参数次之
3. 可选参数优先级最低
4. 剩余参数最后匹配

### 2. 匹配顺序

```typescript
// 模式: "test<arg1:text>[arg2:face]"
// 匹配顺序:
// 1. 匹配字面量 "test"
// 2. 匹配必需参数 arg1
// 3. 尝试匹配可选参数 arg2
// 4. 返回匹配结果
```

### 3. 失败处理

```typescript
// 匹配失败时返回空数组
const result = commander.match(segments);
if (result.length === 0) {
  console.log('匹配失败');
}
```

## 常见模式示例

### 机器人命令

```typescript
// 基础命令
const echo = new Commander('echo <message:text>');
const ping = new Commander('ping [count:number]');
const help = new Commander('help [command:text]');

// 复杂命令
const config = new Commander('config <key:text> <value:text>');
const search = new Commander('search <query:text> [...options:text]');
```

### 消息处理

```typescript
// 表情反应
const react = new Commander('{face:1}<message:text>');

// 图片处理
const image = new Commander('{image:avatar.png}<caption:text>');

// @用户
const mention = new Commander('{at:123456}<message:text>');
```

### 系统命令

```typescript
// 系统信息
const info = new Commander('info [detail:text]');

// 状态查询
const status = new Commander('status [service:text]');

// 日志查看
const logs = new Commander('logs [level:text] [count:number]');
```

## 最佳实践

### 1. 模式设计

```typescript
// ✅ 好的模式设计
const good = new Commander('command <required:text> [optional:face]');

// ❌ 避免过于复杂的模式
const bad = new Commander('cmd<arg1:text>[arg2:face][arg3:image][arg4:at]');
```

### 2. 参数命名

```typescript
// ✅ 使用描述性名称
const commander = new Commander('user <username:text> <action:text>');

// ❌ 避免模糊名称
const commander = new Commander('user <a:text> <b:text>');
```

### 3. 类型选择

```typescript
// ✅ 选择合适的类型
const commander = new Commander('count <number:number>');

// ❌ 避免类型不匹配
const commander = new Commander('count <number:text>');
```

### 4. 错误处理

```typescript
try {
  const commander = new Commander(pattern);
} catch (error) {
  if (error instanceof PatternParseError) {
    console.error('模式语法错误:', error.message);
  }
}
```

## 调试技巧

### 1. 查看解析结果

```typescript
const commander = new Commander('hello <name:text>');
const tokens = commander.getTokens();
console.log('解析的令牌:', tokens);
```

### 2. 测试模式

```typescript
function testPattern(pattern, segments) {
  try {
    const commander = new Commander(pattern);
    const result = commander.match(segments);
    console.log('匹配结果:', result);
    return result.length > 0;
  } catch (error) {
    console.error('模式错误:', error.message);
    return false;
  }
}
```

## 下一步

- [消息段匹配](/guide/message-segments) - 深入了解匹配机制
- [参数提取](/guide/parameter-extraction) - 学习参数处理技巧
- [类型化字面量](/guide/typed-literals) - 掌握高级匹配功能
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>模式语法是 OneBot Commander 的核心，掌握好语法规则可以创建出强大而灵活的消息处理逻辑。</p>
</div> 