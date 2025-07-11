# OneBot12 Message Segment Matcher

一个用于匹配和解析OneBot12消息段的ESM/CJS Node.js工具，支持链式回调处理。
- <a href="https://pkg-size.dev/onebot-commander"><img src="https://pkg-size.dev/badge/install/62783" title="Install size for onebot-commander"></a> <a href="https://pkg-size.dev/onebot-commander"><img src="https://pkg-size.dev/badge/bundle/6396" title="Bundle size for onebot-commander"></a>
## 特性

- 🎯 **模式匹配**: 支持复杂的消息段模式匹配
- 🔧 **参数提取**: 自动提取匹配的参数
- 📝 **类型化字面量**: 支持 `{type:value}` 格式的类型化字面量
- ⚡ **链式回调**: 支持 `action()` 方法链式处理匹配结果
- 🎨 **灵活语法**: 支持必需参数 `<param:type>` 和可选参数 `[param:type]`
- 🔍 **文本分割**: 智能分割文本段，支持部分匹配
- 📦 **双格式支持**: 同时支持 ESM 和 CommonJS 格式，兼容各种 Node.js 环境

## 格式支持

本项目同时支持 **ESM (ES Modules)** 和 **CommonJS** 两种格式：

### ESM 格式 (推荐)
```javascript
import { Commander, match } from 'onebot-commander';
```

### CommonJS 格式
```javascript
const { Commander, match } = require('onebot-commander');
```

### 自动格式选择
- 在 ESM 环境中自动使用 ESM 格式
- 在 CommonJS 环境中自动使用 CommonJS 格式
- 无需手动指定导入格式

## 安装

```bash
npm install onebot-commander
```

## 使用方法

### 返回格式说明

`commander.match()` 方法返回一个数组，格式为 `[params, ...remaining]`：

- `params`: 包含所有匹配参数的对象，键为参数名，值为参数值
- `remaining`: 剩余的消息段数组（如果有的话）

匹配失败时返回空数组 `[]`。

### 基本用法

```javascript
import { match, Commander } from 'onebot-commander';

// 使用便捷函数
const command = match("hello <name:text>");
const [params] = command.match([
  { type: 'text', data: { text: 'hello world' } }
]);
console.log(params.name); // 'world'

// 使用类
const matcher = new Commander("ping [message:text]");
const [params] = matcher.match([
  { type: 'text', data: { text: 'ping hello' } }
]);
console.log(params.message); // 'hello'

// 使用自定义类型化字面量字段映射
const customMatcher = new Commander("test<arg1:text>", {
  text: 'text',
  face: 'id',
  image: ['file', 'url'],
  at: 'user_id'
});
```

## 输入输出示例

### 基础文本匹配

```javascript
import { match, SEGMENT_TYPES } from 'onebot-commander';

// 示例 1: 简单文本匹配
const matcher1 = match('hello');
const segments1 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'hello world' } }
];
const result1 = matcher1.match(segments1);
console.log(result1);
// 输出: [{}, { type: 'text', data: { text: ' world' } }]

// 示例 2: 必需参数提取
const matcher2 = match('hello <name:text>');
const segments2 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'hello Alice' } }
];
const result2 = matcher2.match(segments2);
console.log(result2);
// 输出: [{ name: 'Alice' }]

// 示例 3: 可选参数（提供时）
const matcher3 = match('ping [message:text]');
const segments3 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'ping hello' } }
];
const result3 = matcher3.match(segments3);
console.log(result3);
// 输出: [{ message: 'hello' }]

// 示例 4: 可选参数（未提供时）
const segments4 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'ping' } }
];
const result4 = matcher3.match(segments4);
console.log(result4);
// 输出: []
```

### 复杂模式匹配

```javascript
// 示例 5: 多参数混合模式
const matcher5 = match('test<arg1:text>[arg2:face]');
const segments5 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'test123' } },
  { type: SEGMENT_TYPES.FACE, data: { id: 1 } }
];
const result5 = matcher5.match(segments5);
console.log(result5);
// 输出: [{ arg1: '123', arg2: { type: 'face', data: { id: 1 } } }]

// 示例 6: 类型化字面量匹配
const matcher6 = match('{text:test}<arg1:text>');
const segments6 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'test123' } }
];
const result6 = matcher6.match(segments6);
console.log(result6);
// 输出: [{ arg1: '123' }]

// 示例 7: 表情类型化字面量（匹配失败）
const matcher7 = match('{face:2}<arg1:text>');
const segments7 = [
  { type: SEGMENT_TYPES.FACE, data: { id: 1 } },
  { type: SEGMENT_TYPES.TEXT, data: { text: '123' } }
];
const result7 = matcher7.match(segments7);
console.log(result7);
// 输出: []

// 示例 8: 图片类型化字面量（匹配成功）
const matcher8 = match('{image:test.jpg}<arg1:text>');
const segments8 = [
  { type: SEGMENT_TYPES.IMAGE, data: { file: 'test.jpg' } },
  { type: SEGMENT_TYPES.TEXT, data: { text: '123' } }
];
const result8 = matcher8.match(segments8);
console.log(result8);
// 输出: [{ arg1: '123' }]

// 示例 9: @类型化字面量
const matcher9 = match('{at:123456}<arg1:text>');
const segments9 = [
  { type: SEGMENT_TYPES.AT, data: { user_id: 123456 } },
  { type: SEGMENT_TYPES.TEXT, data: { text: '123' } }
];
const result9 = matcher9.match(segments9);
console.log(result9);
// 输出: [{ arg1: '123' }]
```

### 剩余参数匹配

```javascript
// 示例 10: 通用剩余参数
const matcher10 = match('test[...rest]');
const segments10 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'test' } },
  { type: SEGMENT_TYPES.TEXT, data: { text: 'hello' } },
  { type: SEGMENT_TYPES.FACE, data: { id: 1 } },
  { type: SEGMENT_TYPES.IMAGE, data: { file: 'test.jpg' } }
];
const result10 = matcher10.match(segments10);
console.log(result10);
// 输出: [
//   {
//     rest: [
//       { type: 'text', data: { text: 'hello' } },
//       { type: 'face', data: { id: 1 } },
//       { type: 'image', data: { file: 'test.jpg' } }
//     ]
//   }
// ]

// 示例 11: 类型化剩余参数
const matcher11 = match('test[...rest:face]');
const segments11 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'test' } },
  { type: SEGMENT_TYPES.FACE, data: { id: 1 } },
  { type: SEGMENT_TYPES.FACE, data: { id: 2 } },
  { type: SEGMENT_TYPES.TEXT, data: { text: 'hello' } },
  { type: SEGMENT_TYPES.IMAGE, data: { file: 'test.jpg' } }
];
const result11 = matcher11.match(segments11);
console.log(result11);
// 输出: [
//   {
//     rest: [
//       { type: 'face', data: { id: 1 } },
//       { type: 'face', data: { id: 2 } }
//     ]
//   },
//   { type: 'text', data: { text: 'hello' } },
//   { type: 'image', data: { file: 'test.jpg' } }
// ]
```

### 默认值支持

```javascript
// 示例 12: 可选参数默认值
const matcher12 = match('foo[mFace:face={"id":1}]');
const segments12a = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'foo' } }
];
const result12a = matcher12.match(segments12a);
console.log(result12a);
// 输出: [{ mFace: { id: 1 } }]

const segments12b = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'foo' } },
  { type: SEGMENT_TYPES.FACE, data: { id: 2 } }
];
const result12b = matcher12.match(segments12b);
console.log(result12b);
// 输出: [{ mFace: { type: 'face', data: { id: 2 } } }]

// 示例 13: 文本默认值
const matcher13 = match('foo[msg:text=hello]');
const segments13 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'foo' } }
];
const result13 = matcher13.match(segments13);
console.log(result13);
// 输出: [{ msg: 'hello' }]
```

### 链式回调处理

回调函数的参数格式为 `(params, ...remaining)`，其中：
- `params`: 包含所有匹配参数的对象
- `remaining`: 剩余的消息段数组

```javascript
// 示例 14: 链式处理
const matcher14 = match('test<arg1:text>')
  .action((params) => {
    return params.arg1;
  })
  .action((arg1) => {
    return arg1.toUpperCase();
  });

const segments14 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'test123' } }
];
const [result14] = matcher14.match(segments14);
console.log(result14);
// 输出: '123'
```

### 匹配失败情况

```javascript
// 示例 15: 模式不匹配
const matcher15 = match('hello <name:text>');
const segments15 = [
  { type: SEGMENT_TYPES.FACE, data: { id: 1 } }
];
const result15 = matcher15.match(segments15);
console.log(result15);
// 输出: []

// 示例 16: 必需参数缺失
const matcher16 = match('hello <name:text>');
const segments16 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'hello' } }
];
const result16 = matcher16.match(segments16);
console.log(result16);
// 输出: []

// 示例 17: 类型不匹配（string类型已移除）
const matcher17 = match('hello <name:string>');
const segments17 = [
  { type: SEGMENT_TYPES.TEXT, data: { text: 'hello world' } }
];
const result17 = matcher17.match(segments17);
console.log(result17);
// 输出: []
```

### 链式回调处理

```javascript
import { Commander } from 'onebot-commander';

const command = new Commander("test<arg1:text>[arg2:face]");

command
  .action((params) => {
    console.log('arg1:', params.arg1);        // '123'
    console.log('arg2:', params.arg2);        // { type: 'face', data: { id: 1 } }
    return params.arg1;
  })
  .action((arg1) => {
    console.log('处理arg1:', arg1.toUpperCase());
    return arg1.length;
  })
  .action((length) => {
    console.log('arg1长度:', length);
  })
  .match([
    { type: 'text', data: { text: 'test123' } },
    { type: 'face', data: { id: 1 } }
  ]);
```

### 匹配失败处理

```javascript
const command = new Commander("hello <name:text>");

command
  .action((params) => {
    console.log('匹配成功:', params.name);
    return params.name;
  })
  .match([
    { type: 'face', data: { id: 1 } }  // 不匹配，返回空数组 []
  ]);
```

## 模式语法

### 基本语法

- `<param:type>` - 必需参数
- `[param:type]` - 可选参数
- `{type:value}` - 类型化字面量
- `text` - 普通文本字面量

### 支持的类型

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

### 类型化字面量字段映射

默认的字段映射规则：

```javascript
{
  text: 'text',           // text类型匹配 data.text 字段
  face: 'id',             // face类型匹配 data.id 字段
  image: ['file', 'url'], // image类型匹配 data.file 或 data.url 字段
  at: 'user_id'           // at类型匹配 data.user_id 字段
}
```

您可以自定义字段映射：

```javascript
const customFields = {
  text: 'content',        // 自定义text字段
  face: 'face_id',        // 自定义face字段
  image: 'src',           // 自定义image字段
  at: 'target_id'         // 自定义at字段
};

const matcher = new Commander("test<arg1:text>", customFields);
```

### 示例模式

```javascript
// 基本文本匹配
"hello <name:text>"

// 可选参数
"ping [message:text]"

// 复杂模式
"test<arg1:text>[arg2:face]"

// 类型化字面量
"{text:test}<arg1:text>[arg2:face]"

// 表情匹配
"{face:1}<command:text>[arg:face]"

// 图片匹配（支持file或url字段）
"{image:test.jpg}<arg1:text>"

// 使用自定义字段映射
const customMatcher = new Commander("{image:avatar.png}<name:text>", {
  image: 'src'  // 匹配 data.src 而不是默认的 data.file/url
});
```

## API参考

### Commander

主类，用于创建消息段匹配器。

#### 构造函数

```javascript
new Commander(pattern, typedLiteralFields?)
```

- `pattern` (string): 匹配模式字符串
- `typedLiteralFields` (Record<string, string | string[]>): 类型化字面量字段映射，可选参数

#### 方法

##### action(callback)

添加回调函数到处理链。

- `callback` (Function): 回调函数，接收参数 `(params, ...remaining)`，其中 `params` 是参数对象，`remaining` 是剩余消息段
- 返回: Commander 实例，支持链式调用

##### match(segments)

匹配消息段并执行回调链。

- `segments` (Array): OneBot12消息段数组
- 返回: 匹配结果数组 `[params, ...remaining]` 或空数组 `[]`（匹配失败时）

##### getTokens()

获取解析后的令牌（用于调试）。

- 返回: Array<PatternToken>

#### 静态属性

##### DEFAULT_TYPED_LITERAL_FIELD_MAP

默认的类型化字面量字段映射。

```javascript
{
  text: 'text',
  face: 'id', 
  image: ['file', 'url'],
  at: 'user_id'
}
```

#### 静态方法

##### resolve(pattern, segments)

创建已解析的匹配器实例。

- `pattern` (string): 匹配模式
- `segments` (Array): 消息段数组
- 返回: Commander 实例

##### reject(pattern, error)

创建已拒绝的匹配器实例。

- `pattern` (string): 匹配模式
- `error` (Error): 错误对象
- 返回: Commander 实例

##### all(matchers)

等待所有匹配器完成。

- `matchers` (Array<Commander>): 匹配器数组
- 返回: Array 所有匹配器的结果

##### race(matchers)

等待任一匹配器完成。

- `matchers` (Array<SegmentMatcher>): 匹配器数组
- 返回: 第一个完成的匹配器结果

### 便捷函数

#### match(pattern, typedLiteralFields?)

创建Commander实例的便捷函数。

- `pattern` (string): 匹配模式字符串
- `typedLiteralFields` (Record<string, string | string[]>): 类型化字面量字段映射，可选参数
- 返回: Commander实例

## 运行测试

```bash
# 运行测试
npm test

# 监听模式测试
npm run test:watch

# 测试覆盖率
npm run test:coverage
```

## 许可证

MIT 

## 构建和开发

### 构建双格式输出

项目使用 TypeScript 构建，自动生成 ESM 和 CommonJS 两种格式：

```bash
# 构建所有格式
npm run build

# 仅构建 ESM 格式
npm run build:esm

# 仅构建 CommonJS 格式
npm run build:cjs
```

### 构建输出结构

```
dist/
├── esm/           # ESM 格式输出
│   ├── index.js
│   ├── index.d.ts
│   ├── commander.js
│   ├── pattern_parser.js
│   ├── segment_matcher.js
│   └── ...
└── cjs/           # CommonJS 格式输出
    ├── index.cjs
    ├── commander.cjs
    ├── pattern_parser.cjs
    ├── segment_matcher.cjs
    └── ...
```

### 开发脚本

```bash
# 运行测试
npm test

# 监听模式测试
npm run test:watch

# 测试覆盖率
npm run test:coverage

# 清理构建文件
npm run clean
```

### 发布前准备

```bash
# 构建并运行测试
npm run prepublishOnly
``` 