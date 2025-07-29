# 可选参数

可选参数是 OneBot Commander 的一个强大特性，允许你定义不是必需的参数，并为它们设置默认值。这使得命令更加灵活和用户友好。

## 🎯 概述

可选参数使用方括号 `[]` 语法定义，支持：

1. **灵活匹配** - 用户可以省略可选参数
2. **默认值支持** - 为缺失的参数提供默认值
3. **类型安全** - 与特殊类型规则完美结合
4. **智能处理** - 自动处理格式错误的可选参数

## 📝 基础语法

### 基本可选参数

```typescript
import { Commander } from 'onebot-commander';

// 基础可选参数（默认值为空字符串）
const commander = new Commander('你好 [name:text]');

commander.action((params) => {
  const name = params.name || '世界';
  console.log(`Hello, ${name}!`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '你好 ' } }]);
// ✅ 输出: Hello, 世界!

commander.match([{ type: 'text', data: { text: '你好 张三' } }]);
// ✅ 输出: Hello, 张三!
```

### 带默认值的可选参数

```typescript
// 使用 = 设置默认值
const commander = new Commander('你好 [name:text=世界]');

commander.action((params) => {
  console.log(`Hello, ${params.name}!`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '你好 ' } }]);
// ✅ 输出: Hello, 世界! (使用默认值)
```

## 🔢 数字类型的可选参数

### Number 类型

```typescript
const configCmd = new Commander('配置 [timeout:number=30]');

configCmd.action((params) => {
  console.log(`超时设置: ${params.timeout} 秒`);
});

// 测试示例
configCmd.match([{ type: 'text', data: { text: '配置 ' } }]);
// ✅ 输出: 超时设置: 30 秒

configCmd.match([{ type: 'text', data: { text: '配置 60' } }]);
// ✅ 输出: 超时设置: 60 秒

configCmd.match([{ type: 'text', data: { text: '配置 45.5' } }]);
// ✅ 输出: 超时设置: 45.5 秒
```

### Integer 类型

```typescript
const repeatCmd = new Commander('重复 [times:integer=3]');

repeatCmd.action((params) => {
  console.log(`将重复 ${params.times} 次`);
});

// 测试示例
repeatCmd.match([{ type: 'text', data: { text: '重复 ' } }]);
// ✅ 输出: 将重复 3 次

repeatCmd.match([{ type: 'text', data: { text: '重复 5' } }]);
// ✅ 输出: 将重复 5 次

repeatCmd.match([{ type: 'text', data: { text: '重复 2.5' } }]);
// ✅ 输出: 将重复 3 次 (格式错误，使用默认值)
```

### Float 类型

```typescript
const rateCmd = new Commander('设置比例 [rate:float=1.0]');

rateCmd.action((params) => {
  console.log(`比例: ${params.rate}`);
});

// 测试示例
rateCmd.match([{ type: 'text', data: { text: '设置比例 ' } }]);
// ✅ 输出: 比例: 1.0

rateCmd.match([{ type: 'text', data: { text: '设置比例 2.5' } }]);
// ✅ 输出: 比例: 2.5

rateCmd.match([{ type: 'text', data: { text: '设置比例 3' } }]);
// ✅ 输出: 比例: 1.0 (格式错误，使用默认值)
```

## 🔘 Boolean 类型的可选参数

```typescript
const featureCmd = new Commander('功能 [enabled:boolean=true]');

featureCmd.action((params) => {
  console.log(`功能状态: ${params.enabled ? '启用' : '禁用'}`);
});

// 测试示例
featureCmd.match([{ type: 'text', data: { text: '功能 ' } }]);
// ✅ 输出: 功能状态: 启用

featureCmd.match([{ type: 'text', data: { text: '功能 false' } }]);
// ✅ 输出: 功能状态: 禁用

featureCmd.match([{ type: 'text', data: { text: '功能 yes' } }]);
// ✅ 输出: 功能状态: 启用 (格式错误，使用默认值)
```

## 🔄 多个可选参数

### 顺序可选参数

```typescript
const gameCmd = new Commander('创建房间 [玩家数:integer=4] [时间:number=60] [困难:boolean=false]');

gameCmd.action((params) => {
  console.log('房间配置:');
  console.log(`- 玩家数: ${params.玩家数}`);
  console.log(`- 时间限制: ${params.时间} 秒`);
  console.log(`- 困难模式: ${params.困难 ? '开启' : '关闭'}`);
});

// 测试各种组合
gameCmd.match([{ type: 'text', data: { text: '创建房间 ' } }]);
// 使用所有默认值: 玩家数=4, 时间=60, 困难=false

gameCmd.match([{ type: 'text', data: { text: '创建房间 8' } }]);
// 部分自定义: 玩家数=8, 时间=60, 困难=false

gameCmd.match([{ type: 'text', data: { text: '创建房间 6 90 true' } }]);
// 全部自定义: 玩家数=6, 时间=90, 困难=true
```

### 混合可选参数处理

```typescript
const advancedCmd = new Commander('设置 [level:integer=1] [name:text=用户] [active:boolean=true]');

advancedCmd.action((params) => {
  console.log(`配置: 等级=${params.level}, 姓名=${params.name}, 激活=${params.active}`);
});

// 复杂测试场景
advancedCmd.match([{ type: 'text', data: { text: '设置 5 张三 false' } }]);
// ✅ 配置: 等级=5, 姓名=张三, 激活=false

advancedCmd.match([{ type: 'text', data: { text: '设置 abc 李四 true' } }]);
// 第一个参数格式错误，使用默认值
// ✅ 配置: 等级=1, 姓名=李四, 激活=true
```

## 🛡️ 错误处理机制

### 格式错误的处理

当可选参数的输入格式不符合指定类型时，系统会：

1. 使用该参数的默认值
2. 将不匹配的文本作为剩余内容返回

```typescript
const testCmd = new Commander('测试 [num:number=100]');

const result = testCmd.match([{ type: 'text', data: { text: '测试 abc' } }]);

console.log('匹配结果:', result);
// 输出可能包含:
// - params: { num: 100 } (使用默认值)
// - remaining: [{ type: 'text', data: { text: 'abc' } }] (剩余文本)
```

### 空值处理

```typescript
const emptyCmd = new Commander('命令 [value:text=默认值]');

// 空格处理
emptyCmd.match([{ type: 'text', data: { text: '命令 ' } }]);
// ✅ value = '默认值'

emptyCmd.match([{ type: 'text', data: { text: '命令' } }]);
// ✅ value = '默认值' (缺少尾随空格)
```

## 🎨 高级示例

### 复杂配置命令

```typescript
const serverCmd = new Commander(
  '启动服务器 [端口:integer=8080] [主机:text=localhost] [调试:boolean=false] [工作线程:integer=4]'
);

serverCmd.action((params) => {
  console.log('服务器配置:');
  console.log(`🌐 地址: http://${params.主机}:${params.端口}`);
  console.log(`🐛 调试模式: ${params.调试 ? '开启' : '关闭'}`);
  console.log(`⚡ 工作线程: ${params.工作线程} 个`);
  
  // 模拟启动服务器
  return `服务器已在 ${params.主机}:${params.端口} 启动`;
});

// 测试不同的配置组合
serverCmd.match([{ type: 'text', data: { text: '启动服务器 ' } }]);
// 使用所有默认配置

serverCmd.match([{ type: 'text', data: { text: '启动服务器 3000 0.0.0.0 true' } }]);
// 自定义端口、主机和调试模式
```

### 数据库连接命令

```typescript
const dbCmd = new Commander(
  '连接数据库 [超时:number=30.0] [重试:integer=3] [SSL:boolean=true] [数据库:text=main]'
);

dbCmd.action((params) => {
  const config = {
    timeout: params.超时,
    retries: params.重试,
    ssl: params.SSL,
    database: params.数据库
  };
  
  console.log('数据库连接配置:', JSON.stringify(config, null, 2));
  return '数据库连接已建立';
});

// 测试
dbCmd.match([{ type: 'text', data: { text: '连接数据库 45.5 5 false test_db' } }]);
```

## 🔧 与其他特性结合

### 与类型化字面量结合

```typescript
const imageCmd = new Commander('{image:default.jpg} [宽度:integer=800] [高度:integer=600]');

imageCmd.action((params) => {
  console.log(`图片尺寸: ${params.宽度}x${params.高度}`);
});

// 匹配时必须有图片，但尺寸是可选的
const segments = [
  { type: 'image', data: { file: 'default.jpg' } }
];
imageCmd.match(segments);
// ✅ 图片尺寸: 800x600
```

### 与剩余参数结合

```typescript
const tagCmd = new Commander('标签 [颜色:text=蓝色] <...标签:text>');

tagCmd.action((params) => {
  console.log(`颜色: ${params.颜色}`);
  console.log(`标签: ${params.标签.join(', ')}`);
});

tagCmd.match([{ type: 'text', data: { text: '标签 红色 重要 紧急 处理中' } }]);
// ✅ 颜色: 红色, 标签: 重要, 紧急, 处理中
```

## 💡 最佳实践

### 1. 合理的默认值

```typescript
// ✅ 好的实践：提供有意义的默认值
const goodCmd = new Commander('分页 [页码:integer=1] [大小:integer=10]');

// ❌ 避免：没有默认值或默认值无意义
const badCmd = new Commander('分页 [页码:integer] [大小:integer=0]');
```

### 2. 参数顺序

```typescript
// ✅ 好的实践：常用参数在前，不常用参数在后
const wellOrderedCmd = new Commander('搜索 [关键词:text] [页码:integer=1] [调试:boolean=false]');

// ❌ 避免：把调试参数放在常用参数前面
const poorlyOrderedCmd = new Commander('搜索 [调试:boolean=false] [关键词:text] [页码:integer=1]');
```

### 3. 类型选择

```typescript
// ✅ 好的实践：根据业务需求选择最合适的类型
const preciseCmd = new Commander('配置 [端口:integer=8080] [超时:float=30.5]');

// ❌ 避免：全部使用通用的 number 类型
const impreciseCmd = new Commander('配置 [端口:number=8080] [超时:number=30.5]');
```

### 4. 错误处理

```typescript
const robustCmd = new Commander('设置 [值:integer=10]');

robustCmd
  .action((params) => {
    // 业务逻辑验证
    if (params.值 < 1 || params.值 > 100) {
      return '值必须在 1-100 之间';
    }
    return `设置成功: ${params.值}`;
  })
  .catch((error) => {
    return '参数格式错误，请检查输入';
  });
```

## 🔗 相关文档

- [特殊类型规则](/docs/guide/special-type-rules.md)
- [参数提取详解](/docs/guide/parameter-extraction.md)
- [默认值详解](/docs/guide/default-values.md)
- [错误处理指南](/docs/examples/error-handling.md)

## 📊 兼容性说明

可选参数特性与以下功能完全兼容：

- ✅ 特殊类型规则（number, integer, float, boolean）
- ✅ 动态字段映射
- ✅ 类型化字面量
- ✅ 剩余参数
- ✅ 链式调用
- ✅ 异步处理

这使得你可以构建非常灵活和强大的命令解析系统。 