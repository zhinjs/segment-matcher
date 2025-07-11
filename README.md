# OneBot12 Message Segment Matcher

一个用于匹配和解析OneBot12消息段的ESM/CJS Node.js工具，支持链式回调处理。

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

### 基本用法

```javascript
import { match, Commander } from 'onebot-commander';

// 使用便捷函数
const command = match("hello <name:text>");
const result = command.match([
  { type: 'text', data: { text: 'hello world' } }
]);

// 使用类
const matcher = new Commander("ping [message:text]");
const result = matcher.match([
  { type: 'text', data: { text: 'ping hello' } }
]);

// 使用自定义类型化字面量字段映射
const customMatcher = new Commander("test<arg1:text>", {
  text: 'text',
  face: 'id',
  image: ['file', 'url'],
  at: 'user_id'
});
```

### 链式回调处理

```javascript
import { Commander } from 'onebot-commander';

const command = new Commander("test<arg1:text>[arg2:face]");

command
  .action((result) => {
    if (result) {
      const [arg1, arg2, remaining] = result;
      console.log('arg1:', arg1);        // '123'
      console.log('arg2:', arg2);        // { type: 'face', data: { id: 1 } }
      console.log('remaining:', remaining); // []
      return arg1;
    }
    return null;
  })
  .action((arg1) => {
    if (arg1) {
      console.log('处理arg1:', arg1.toUpperCase());
      return arg1.length;
    }
    return null;
  })
  .action((length) => {
    if (length) {
      console.log('arg1长度:', length);
    }
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
  .action((result) => {
    if (result) {
      const [name, remaining] = result;
      console.log('匹配成功:', name);
      return name;
    } else {
      console.log('匹配失败');
      return null;
    }
  })
  .match([
    { type: 'face', data: { id: 1 } }  // 不匹配
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

- `callback` (Function): 回调函数，接收上一个回调的返回值
- 返回: Commander 实例，支持链式调用

##### match(segments)

匹配消息段并执行回调链。

- `segments` (Array): OneBot12消息段数组
- 返回: 匹配结果数组 `[...params, remaining]` 或 `null`

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