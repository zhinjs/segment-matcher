# 特殊类型规则

OneBot Commander 提供了强大的特殊类型规则系统，支持自动类型转换和验证。这个系统基于 TypeMatcher 架构实现，为常见的数据类型提供了开箱即用的匹配和转换功能。

## 🎯 概述

特殊类型规则允许你在模式中指定参数的数据类型，系统会自动：

1. **验证输入格式** - 确保输入符合指定类型的格式要求
2. **自动类型转换** - 将字符串输入转换为对应的 JavaScript 类型
3. **类型安全** - 提供完整的 TypeScript 类型支持

## 📚 支持的类型

### 1. Number 类型

`number` 类型支持整数和小数：

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander('设置年龄 <age:number>');

commander.action((params) => {
  console.log(`年龄: ${params.age} (类型: ${typeof params.age})`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '设置年龄 25' } }]);
// ✅ 输出: 年龄: 25 (类型: number)

commander.match([{ type: 'text', data: { text: '设置年龄 25.5' } }]);
// ✅ 输出: 年龄: 25.5 (类型: number)

commander.match([{ type: 'text', data: { text: '设置年龄 -10' } }]);
// ✅ 输出: 年龄: -10 (类型: number)

commander.match([{ type: 'text', data: { text: '设置年龄 abc' } }]);
// ❌ 匹配失败，返回空数组
```

**支持的格式**：
- 正整数：`123`
- 负整数：`-456`
- 正小数：`123.45`
- 负小数：`-123.45`
- 零：`0`, `0.0`

### 2. Integer 类型

`integer` 类型只接受整数（不包含小数点）：

```typescript
const commander = new Commander('重复 <times:integer> 次');

commander.action((params) => {
  console.log(`重复 ${params.times} 次`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '重复 5 次' } }]);
// ✅ 输出: 重复 5 次

commander.match([{ type: 'text', data: { text: '重复 -3 次' } }]);
// ✅ 输出: 重复 -3 次

commander.match([{ type: 'text', data: { text: '重复 5.5 次' } }]);
// ❌ 匹配失败（包含小数点）
```

**支持的格式**：
- 正整数：`123`
- 负整数：`-456`
- 零：`0`

### 3. Float 类型

`float` 类型只接受浮点数（必须包含小数点）：

```typescript
const commander = new Commander('设置比例 <rate:float>');

commander.action((params) => {
  console.log(`比例: ${params.rate}`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '设置比例 1.5' } }]);
// ✅ 输出: 比例: 1.5

commander.match([{ type: 'text', data: { text: '设置比例 0.75' } }]);
// ✅ 输出: 比例: 0.75

commander.match([{ type: 'text', data: { text: '设置比例 5' } }]);
// ❌ 匹配失败（没有小数点）
```

**支持的格式**：
- 正浮点数：`123.45`
- 负浮点数：`-123.45`
- 小数零：`0.0`

### 4. Boolean 类型

`boolean` 类型支持 `true` 和 `false` 字符串的自动转换：

```typescript
const commander = new Commander('启用功能 <enabled:boolean>');

commander.action((params) => {
  console.log(`功能状态: ${params.enabled} (类型: ${typeof params.enabled})`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '启用功能 true' } }]);
// ✅ 输出: 功能状态: true (类型: boolean)

commander.match([{ type: 'text', data: { text: '启用功能 false' } }]);
// ✅ 输出: 功能状态: false (类型: boolean)

commander.match([{ type: 'text', data: { text: '启用功能 yes' } }]);
// ❌ 匹配失败（只支持 true/false）
```

**支持的值**：
- `true` → `true` (boolean)
- `false` → `false` (boolean)

**注意**：布尔类型是严格区分大小写的，`True`、`FALSE` 等变体不会被识别。

## 🔄 与可选参数结合

特殊类型规则与可选参数完美结合：

```typescript
const commander = new Commander('配置 [timeout:number=30] [enabled:boolean=true]');

commander.action((params) => {
  console.log(`超时: ${params.timeout}s, 启用: ${params.enabled}`);
});

// 匹配示例
commander.match([{ type: 'text', data: { text: '配置 ' } }]);
// ✅ 输出: 超时: 30s, 启用: true (使用默认值)

commander.match([{ type: 'text', data: { text: '配置 60 false' } }]);
// ✅ 输出: 超时: 60s, 启用: false (使用提供的值)

commander.match([{ type: 'text', data: { text: '配置 abc' } }]);
// ✅ 输出: 超时: 30s, 启用: true (无效格式时使用默认值)
```

## 🎨 复杂示例

### 游戏配置命令

```typescript
const gameCmd = new Commander(
  '创建房间 [玩家数:integer=4] [时间限制:number=60.0] [困难模式:boolean=false]'
);

gameCmd.action((params) => {
  console.log('房间配置:');
  console.log(`- 玩家数: ${params.玩家数} 人`);
  console.log(`- 时间限制: ${params.时间限制} 秒`);
  console.log(`- 困难模式: ${params.困难模式 ? '启用' : '禁用'}`);
});

// 测试各种输入
gameCmd.match([{ type: 'text', data: { text: '创建房间 ' } }]);
// 使用所有默认值

gameCmd.match([{ type: 'text', data: { text: '创建房间 8 90.5 true' } }]);
// 自定义所有配置
```

### 数学计算命令

```typescript
const mathCmd = new Commander('计算 <a:number> <op:text> <b:number>');

mathCmd.action((params) => {
  const { a, op, b } = params;
  let result: number;
  
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = a / b; break;
    default: return '不支持的运算符';
  }
  
  return `${a} ${op} ${b} = ${result}`;
});

// 测试
mathCmd.match([{ type: 'text', data: { text: '计算 12.5 + 7.3' } }]);
// ✅ 输出: 12.5 + 7.3 = 19.8
```

## 🔧 自定义类型匹配器

如果内置的类型不满足需求，你可以注册自定义的类型匹配器：

```typescript
import { TypeMatcherRegistry, TypeMatcher, TypeMatchResult } from 'onebot-commander';

// 自定义邮箱类型匹配器
class EmailTypeMatcher implements TypeMatcher {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  match(text: string): TypeMatchResult {
    if (!this.emailRegex.test(text)) {
      return { success: false };
    }
    
    return { success: true, value: text.toLowerCase() };
  }
}

// 注册自定义匹配器
TypeMatcherRegistry.registerMatcher('email', new EmailTypeMatcher());

// 使用自定义类型
const emailCmd = new Commander('设置邮箱 <email:email>');
emailCmd.action((params) => {
  console.log(`邮箱已设置为: ${params.email}`);
});

emailCmd.match([{ type: 'text', data: { text: '设置邮箱 USER@EXAMPLE.COM' } }]);
// ✅ 输出: 邮箱已设置为: user@example.com
```

## 🛡️ 错误处理

当特殊类型匹配失败时：

1. **必需参数**：整个命令匹配失败，返回空数组
2. **可选参数**：使用默认值，继续匹配其他部分

```typescript
const cmd = new Commander('设置 <required:number> [optional:integer=10]');

// 必需参数格式错误
cmd.match([{ type: 'text', data: { text: '设置 abc 20' } }]);
// ❌ 返回: []

// 可选参数格式错误
cmd.match([{ type: 'text', data: { text: '设置 5 abc' } }]);
// ✅ 返回: [{ required: 5, optional: 10 }] 
// 注意：无效的可选参数 'abc' 会被忽略，使用默认值 10
```

## 📊 性能特性

TypeMatcher 系统经过性能优化：

- **预编译正则表达式**：避免重复编译的开销
- **短路验证**：快速识别明显不匹配的输入
- **类型缓存**：避免重复的类型检查
- **内存友好**：单例模式，避免重复实例化

## 🔗 相关文档

- [可选参数指南](/docs/guide/optional-parameters.md)
- [TypeMatcher API 参考](/docs/api/type-matchers.md)
- [参数提取详解](/docs/guide/parameter-extraction.md)
- [错误处理指南](/docs/examples/error-handling.md)

## 💡 最佳实践

1. **类型选择**：根据实际需求选择最严格的类型（如需要整数时使用 `integer` 而不是 `number`）
2. **默认值**：为可选参数提供合理的默认值
3. **错误处理**：在 action 中添加额外的业务逻辑验证
4. **用户体验**：提供清晰的错误提示，告知用户正确的输入格式

```typescript
const betterCmd = new Commander('设置年龄 <age:integer>');

betterCmd
  .action((params) => {
    if (params.age < 0 || params.age > 150) {
      return '年龄必须在 0-150 之间';
    }
    return `年龄设置为: ${params.age}`;
  })
  .catch((error) => {
    return '输入格式错误，请输入有效的整数';
  });
``` 