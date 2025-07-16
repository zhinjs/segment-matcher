# 空格敏感特性

OneBot Commander 对空格非常敏感，这是一个重要的设计特性，用于确保命令的精确匹配。

## 为什么空格敏感？

### 1. 精确匹配

空格敏感特性确保了命令的精确匹配，避免了意外的匹配：

```typescript
// 模式: "ping [count:number={value:1}]"
const commander = new Commander('ping [count:number={value:1}]');

// ✅ 用户明确输入 "ping " - 匹配成功
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = commander.match(segments1); // 匹配成功

// ❌ 用户输入 "ping" - 不匹配，避免意外触发
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = commander.match(segments2); // 匹配失败
```

### 2. 避免冲突

防止不同命令之间的意外匹配：

```typescript
const pingCommander = new Commander('ping [count:number={value:1}]');
const pingpongCommander = new Commander('pingpong');

// 用户输入 "ping " - 只匹配 ping 命令
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = pingCommander.match(segments1); // 匹配成功
const result2 = pingpongCommander.match(segments1); // 匹配失败

// 用户输入 "pingpong" - 只匹配 pingpong 命令
const segments2 = [{ type: 'text', data: { text: 'pingpong' } }];
const result3 = pingCommander.match(segments2); // 匹配失败
const result4 = pingpongCommander.match(segments2); // 匹配成功
```

## 空格处理规则

### 1. 完全匹配

模式中的每个空格都必须与输入文本中的空格完全匹配：

```typescript
const commander = new Commander('hello <name:text>');

// ✅ 正确 - 空格完全匹配
const segments1 = [{ type: 'text', data: { text: 'hello Alice' } }];
const result1 = commander.match(segments1); // 匹配成功

// ❌ 错误 - 缺少空格
const segments2 = [{ type: 'text', data: { text: 'helloAlice' } }];
const result2 = commander.match(segments2); // 匹配失败

// ❌ 错误 - 多余空格
const segments3 = [{ type: 'text', data: { text: 'hello  Alice' } }];
const result3 = commander.match(segments3); // 匹配失败
```

### 2. 参数间空格

多个参数之间的空格必须正确：

```typescript
const commander = new Commander('user <name:text> <age:number> [email:text]');

// ✅ 正确 - 参数间空格正确
const segments1 = [{ type: 'text', data: { text: 'user Alice 25 alice@example.com' } }];
const result1 = commander.match(segments1); // 匹配成功

// ❌ 错误 - 参数间缺少空格
const segments2 = [{ type: 'text', data: { text: 'user Alice25 alice@example.com' } }];
const result2 = commander.match(segments2); // 匹配失败

// ❌ 错误 - 参数间多余空格
const segments3 = [{ type: 'text', data: { text: 'user Alice  25 alice@example.com' } }];
const result3 = commander.match(segments3); // 匹配失败
```

### 3. 可选参数的空格

可选参数前的空格处理：

```typescript
const commander = new Commander('ping [count:number={value:1}]');

// ✅ 正确 - 有可选参数
const segments1 = [{ type: 'text', data: { text: 'ping 5' } }];
const result1 = commander.match(segments1); // 匹配成功，count = 5

// ✅ 正确 - 无可选参数，但有空格
const segments2 = [{ type: 'text', data: { text: 'ping ' } }];
const result2 = commander.match(segments2); // 匹配成功，count = { value: 1 }

// ❌ 错误 - 无可选参数，且无空格
const segments3 = [{ type: 'text', data: { text: 'ping' } }];
const result3 = commander.match(segments3); // 匹配失败
```

## 最佳实践

### 1. 明确指定空格

在模式中明确指定所有必要的空格：

```typescript
// ✅ 推荐 - 明确指定空格
const commander1 = new Commander('hello <name:text>'); // "hello " 后面的空格
const commander2 = new Commander('ping [count:number={value:1}]'); // "ping " 后面的空格
const commander3 = new Commander('echo <message:text> <count:number>'); // 参数间的空格
```

### 2. 测试空格场景

编写测试时包含空格相关的测试用例：

```typescript
describe('空格敏感测试', () => {
  const commander = new Commander('ping [count:number={value:1}]');

  test('有空格应该匹配成功', () => {
    const segments = [{ type: 'text', data: { text: 'ping ' } }];
    const result = commander.match(segments);
    expect(result.length).toBeGreaterThan(0);
  });

  test('无空格应该匹配失败', () => {
    const segments = [{ type: 'text', data: { text: 'ping' } }];
    const result = commander.match(segments);
    expect(result.length).toBe(0);
  });

  test('多余空格应该匹配失败', () => {
    const segments = [{ type: 'text', data: { text: 'ping  ' } }];
    const result = commander.match(segments);
    expect(result.length).toBe(0);
  });
});
```