# 参数提取

参数提取是 OneBot Commander 的重要功能，它允许你从匹配的消息段中获取和处理各种类型的参数。

## 参数类型

### 基础类型参数

#### 文本参数

```typescript
const commander = new Commander('echo <message:text>');

const segments = [
  { type: 'text', data: { text: 'echo Hello World' } }
];

const result = commander.match(segments);
// result[0] = { message: 'Hello World' }
```

#### 数字参数

```typescript
const commander = new Commander('count <number:number>');

const segments = [
  { type: 'text', data: { text: 'count 123' } }
];

const result = commander.match(segments);
// result[0] = { number: 123 }
```

#### 布尔参数

```typescript
const commander = new Commander('toggle <state:boolean>');

const segments = [
  { type: 'text', data: { text: 'toggle true' } }
];

const result = commander.match(segments);
// result[0] = { state: true }
```

### OneBot 消息段参数

#### 表情参数

```typescript
const commander = new Commander('react <emoji:face>');

const segments = [
  { type: 'text', data: { text: 'react' } },
  { type: 'face', data: { id: 1 } }
];

const result = commander.match(segments);
// result[0] = { emoji: { type: 'face', data: { id: 1 } } }
```

#### 图片参数

```typescript
const commander = new Commander('upload <image:image>');

const segments = [
  { type: 'text', data: { text: 'upload' } },
  { type: 'image', data: { file: 'photo.jpg' } }
];

const result = commander.match(segments);
// result[0] = { image: { type: 'image', data: { file: 'photo.jpg' } } }
```

#### @用户参数

```typescript
const commander = new Commander('ping <user:at>');

const segments = [
  { type: 'text', data: { text: 'ping' } },
  { type: 'at', data: { user_id: 123456 } }
];

const result = commander.match(segments);
// result[0] = { user: { type: 'at', data: { user_id: 123456 } } }
```

## 参数处理技巧

### 1. 参数验证

```typescript
const commander = new Commander('user <name:text> <age:number>');

commander.action((params) => {
  // 验证必需参数
  if (!params.name || params.name.trim() === '') {
    throw new Error('用户名不能为空');
  }
  
  if (params.age < 0 || params.age > 150) {
    throw new Error('年龄必须在 0-150 之间');
  }
  
  return { name: params.name, age: params.age };
});
```

### 2. 参数转换

```typescript
const commander = new Commander('config <key:text> <value:text>');

commander.action((params) => {
  // 转换参数格式
  const key = params.key.toLowerCase().replace(/\s+/g, '_');
  const value = params.value.trim();
  
  return { key, value };
});
```

### 3. 参数组合

```typescript
const commander = new Commander('search <query:text> [...filters:text]');

commander.action((params) => {
  const { query, filters = [] } = params;
  
  // 组合搜索条件
  const searchCriteria = {
    query: query.trim(),
    filters: filters.map(f => f.trim()).filter(f => f.length > 0)
  };
  
  return searchCriteria;
});
```

## 高级参数提取

### 1. 嵌套参数

```typescript
const commander = new Commander('api <endpoint:text> <data:json>');

const segments = [
  { type: 'text', data: { text: 'api /users' } },
  { type: 'json', data: { data: '{"name":"Alice","age":25}' } }
];

const result = commander.match(segments);
// result[0] = { 
//   endpoint: '/users', 
//   data: { name: 'Alice', age: 25 } 
// }
```

### 2. 剩余参数

```typescript
const commander = new Commander('forward [...messages]');

const segments = [
  { type: 'text', data: { text: 'forward' } },
  { type: 'text', data: { text: 'message1' } },
  { type: 'face', data: { id: 1 } },
  { type: 'image', data: { file: 'img.jpg' } }
];

const result = commander.match(segments);
// result[0] = { 
//   messages: [
//     { type: 'text', data: { text: 'message1' } },
//     { type: 'face', data: { id: 1 } },
//     { type: 'image', data: { file: 'img.jpg' } }
//   ] 
// }
```

### 3. 类型化剩余参数

```typescript
const commander = new Commander('gallery [...images:image]');

const segments = [
  { type: 'text', data: { text: 'gallery' } },
  { type: 'image', data: { file: 'img1.jpg' } },
  { type: 'image', data: { file: 'img2.jpg' } },
  { type: 'text', data: { text: 'caption' } }
];

const result = commander.match(segments);
// result[0] = { 
//   images: [
//     { type: 'image', data: { file: 'img1.jpg' } },
//     { type: 'image', data: { file: 'img2.jpg' } }
//   ] 
// }
// 剩余: [{ type: 'text', data: { text: 'caption' } }]
```

## 参数处理最佳实践

### 1. 默认值处理

```typescript
const commander = new Commander('ping [count:number] [message:text]');

commander.action((params) => {
  // 设置默认值
  const count = params.count || 1;
  const message = params.message || 'pong';
  
  return { count, message };
});
```

### 2. 参数清理

```typescript
const commander = new Commander('user <name:text> [email:text]');

commander.action((params) => {
  // 清理和验证参数
  const name = params.name.trim();
  const email = params.email ? params.email.trim().toLowerCase() : null;
  
  // 验证邮箱格式
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('邮箱格式不正确');
  }
  
  return { name, email };
});
```

### 3. 参数类型转换

```typescript
const commander = new Commander('calc <a:number> <op:text> <b:number>');

commander.action((params) => {
  const { a, op, b } = params;
  
  // 类型转换和验证
  const numA = Number(a);
  const numB = Number(b);
  
  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('参数必须是数字');
  }
  
  // 执行计算
  let result;
  switch (op) {
    case '+': result = numA + numB; break;
    case '-': result = numA - numB; break;
    case '*': result = numA * numB; break;
    case '/': result = numA / numB; break;
    default: throw new Error('不支持的运算符');
  }
  
  return { a: numA, op, b: numB, result };
});
```

## 错误处理

### 1. 参数验证错误

```typescript
const commander = new Commander('user <name:text> <age:number>');

commander.action((params) => {
  try {
    // 参数验证
    if (!params.name || params.name.length < 2) {
      throw new Error('用户名至少需要2个字符');
    }
    
    if (params.age < 0 || params.age > 150) {
      throw new Error('年龄必须在0-150之间');
    }
    
    return { name: params.name, age: params.age };
  } catch (error) {
    return { error: error.message };
  }
});
```

### 2. 类型转换错误

```typescript
const commander = new Commander('convert <value:text> <type:text>');

commander.action((params) => {
  try {
    const { value, type } = params;
    let result;
    
    switch (type) {
      case 'number':
        result = Number(value);
        if (isNaN(result)) throw new Error('无法转换为数字');
        break;
      case 'boolean':
        result = value.toLowerCase() === 'true';
        break;
      case 'json':
        result = JSON.parse(value);
        break;
      default:
        throw new Error('不支持的转换类型');
    }
    
    return { original: value, converted: result, type };
  } catch (error) {
    return { error: error.message };
  }
});
```

## 性能优化

### 1. 参数缓存

```typescript
const paramCache = new Map();

function processParam(param, type) {
  const key = `${param}_${type}`;
  
  if (!paramCache.has(key)) {
    let processed;
    switch (type) {
      case 'number':
        processed = Number(param);
        break;
      case 'boolean':
        processed = param.toLowerCase() === 'true';
        break;
      default:
        processed = param;
    }
    paramCache.set(key, processed);
  }
  
  return paramCache.get(key);
}
```

### 2. 批量参数处理

```typescript
function batchProcessParams(params, processors) {
  const results = {};
  
  for (const [key, processor] of Object.entries(processors)) {
    if (params[key] !== undefined) {
      results[key] = processor(params[key]);
    }
  }
  
  return results;
}

// 使用示例
const processors = {
  name: (value) => value.trim(),
  age: (value) => Number(value),
  email: (value) => value.toLowerCase()
};

const processed = batchProcessParams(params, processors);
```

## 调试技巧

### 1. 参数日志

```typescript
const commander = new Commander('debug <param:text>');

commander.action((params) => {
  console.log('原始参数:', params);
  console.log('参数类型:', typeof params.param);
  console.log('参数长度:', params.param.length);
  
  return { debug: true, param: params.param };
});
```

### 2. 参数验证工具

```typescript
function validateParams(params, schema) {
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = params[key];
    
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`${key} 是必需的`);
    }
    
    if (value !== undefined && rules.type && typeof value !== rules.type) {
      errors.push(`${key} 必须是 ${rules.type} 类型`);
    }
    
    if (value !== undefined && rules.min && value < rules.min) {
      errors.push(`${key} 不能小于 ${rules.min}`);
    }
    
    if (value !== undefined && rules.max && value > rules.max) {
      errors.push(`${key} 不能大于 ${rules.max}`);
    }
  }
  
  return errors;
}

// 使用示例
const schema = {
  name: { required: true, type: 'string', min: 2 },
  age: { required: false, type: 'number', min: 0, max: 150 }
};

const errors = validateParams(params, schema);
if (errors.length > 0) {
  console.error('参数验证失败:', errors);
}
```

## 下一步

- [链式回调](/guide/action-chaining) - 了解回调链机制
- [异步处理](/guide/async-processing) - 掌握异步参数处理
- [类型化字面量](/guide/typed-literals) - 学习高级参数匹配
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>参数提取是处理用户输入的关键步骤，良好的参数处理可以提高代码的健壮性和用户体验。</p>
</div> 