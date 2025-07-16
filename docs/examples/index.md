# 基础示例

这里提供了一些 OneBot Commander 的基础使用示例，帮助你快速上手。

## ⚠️ 重要：空格敏感特性

**OneBot Commander 对空格非常敏感**，这是确保命令精确匹配的重要特性：

- 模式中的空格必须与输入文本中的空格完全匹配
- 缺少空格或多余空格都会导致匹配失败
- 这个特性确保了命令的精确匹配

### 空格敏感示例

```typescript
// 模式: "ping [count:number={value:1}]"
const commander = new Commander('ping [count:number={value:1}]');

commander.action((params) => {
  const count = params.count || { value: 1 };
  return `Pong! (${count.value} times)`;
});

// ✅ 用户输入 "ping " - 匹配成功
const segments1 = [{ type: 'text', data: { text: 'ping ' } }];
const result1 = commander.match(segments1); // ['Pong! (1 times)']

// ❌ 用户输入 "ping" - 匹配失败
const segments2 = [{ type: 'text', data: { text: 'ping' } }];
const result2 = commander.match(segments2); // []
```

## 快速开始

### 1. 简单的文本匹配

```typescript
import { Commander } from 'onebot-commander';

// 创建命令解析器（注意空格敏感）
const commander = new Commander('hello <name:text>'); // "hello " 后面的空格

// 设置回调函数
commander.action((params) => {
  console.log(`Hello, ${params.name}!`);
  return { message: `Hello, ${params.name}!` };
});

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } } // 注意 "hello " 后面的空格
];

const results = commander.match(segments);
console.log(results[0]); // { name: 'Alice' }
```

### 2. 带可选参数的命令

```typescript
const commander = new Commander('ping [count:number={value:1}]'); // "ping " 后面的空格

commander.action((params) => {
  const { count = { value: 1 } } = params;
  console.log(`Pinging ${count.value} times...`);
  return { action: 'ping', count };
});

// 有参数的情况
const segments1 = [
  { type: 'text', data: { text: 'ping 5' } } // 注意 "ping " 后面的空格
];
const result1 = commander.match(segments1);
console.log(result1[0]); // { count: 5 }

// 无参数的情况
const segments2 = [
  { type: 'text', data: { text: 'ping ' } } // 注意末尾的空格
];
const result2 = commander.match(segments2);
console.log(result2[0]); // { count: { value: 1 } }
```

### 3. 多参数命令

```typescript
const commander = new Commander('user <name:text> <age:number> [email:text]'); // 注意参数间的空格

commander.action((params) => {
  const { name, age, email } = params;
  console.log(`用户: ${name}, 年龄: ${age}`);
  if (email) {
    console.log(`邮箱: ${email}`);
  }
  return { user: { name, age, email } };
});

const segments = [
  { type: 'text', data: { text: 'user Alice 25 alice@example.com' } } // 注意参数间的空格
];

const results = commander.match(segments);
console.log(results[0]); // { name: 'Alice', age: 25, email: 'alice@example.com' }
```

## 消息段类型示例

### 1. 表情消息

```typescript
const commander = new Commander('{face:1}<message:text>');

commander.action((params) => {
  console.log(`表情消息: ${params.message}`);
  return { type: 'face_message', message: params.message };
});

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'Hello!' } }
];

const results = commander.match(segments);
console.log(results[0]); // { message: 'Hello!' }
```

### 2. 图片消息

```typescript
const commander = new Commander('{image:photo.jpg}<caption:text>');

commander.action((params) => {
  console.log(`图片说明: ${params.caption}`);
  return { type: 'image', caption: params.caption };
});

const segments = [
  { type: 'image', data: { file: 'photo.jpg' } },
  { type: 'text', data: { text: '美丽的风景' } }
];

const results = commander.match(segments);
console.log(results[0]); // { caption: '美丽的风景' }
```

### 3. @用户消息

```typescript
const commander = new Commander('{at:123456}<message:text>');

commander.action((params) => {
  console.log(`@用户消息: ${params.message}`);
  return { type: 'at_message', message: params.message };
});

const segments = [
  { type: 'at', data: { user_id: '123456' } },
  { type: 'text', data: { text: '请查看这个' } }
];

const results = commander.match(segments);
console.log(results[0]); // { message: '请查看这个' }
```

## 链式调用示例

### 1. 数据处理链

```typescript
const commander = new Commander('process <data:text>');

commander
  .action((params) => {
    // 第一步：数据验证
    if (!params.data.trim()) {
      throw new Error('数据不能为空');
    }
    return { data: params.data.trim() };
  })
  .action((params) => {
    // 第二步：数据转换
    return { data: params.data.toUpperCase() };
  })
  .action((params) => {
    // 第三步：数据输出
    console.log(`处理结果: ${params.data}`);
    return { result: params.data };
  });

const segments = [
  { type: 'text', data: { text: 'process hello world' } }
];

const results = commander.match(segments);
console.log(results[0]); // { result: 'HELLO WORLD' }
```

### 2. 条件处理链

```typescript
const commander = new Commander('check <value:number>');

commander
  .action((params) => {
    // 检查数值范围
    if (params.value < 0) {
      throw new Error('数值不能为负数');
    }
    return params;
  })
  .action((params) => {
    // 根据数值大小分类
    if (params.value < 10) {
      return { ...params, category: 'small' };
    } else if (params.value < 100) {
      return { ...params, category: 'medium' };
    } else {
      return { ...params, category: 'large' };
    }
  })
  .action((params) => {
    // 输出结果
    console.log(`数值 ${params.value} 属于 ${params.category} 类别`);
    return params;
  });

const segments = [
  { type: 'text', data: { text: 'check 25' } }
];

const results = commander.match(segments);
console.log(results[0]); // { value: 25, category: 'medium' }
```

## 错误处理示例

### 1. 基本错误处理

```typescript
const commander = new Commander('divide <a:number> <b:number>');

commander.action((params) => {
  const { a, b } = params;
  
  if (b === 0) {
    throw new Error('除数不能为零');
  }
  
  const result = a / b;
  return { result, operation: 'division' };
});

try {
  const segments = [
    { type: 'text', data: { text: 'divide 10 0' } }
  ];
  
  const results = commander.match(segments);
  console.log(results[0]);
} catch (error) {
  console.error('计算错误:', error.message);
}
```

### 2. 参数验证

```typescript
const commander = new Commander('user <name:text> <age:number>');

commander.action((params) => {
  const { name, age } = params;
  
  // 验证姓名
  if (name.length < 2) {
    throw new Error('姓名长度不能少于2个字符');
  }
  
  // 验证年龄
  if (age < 0 || age > 150) {
    throw new Error('年龄必须在0-150之间');
  }
  
  return { name, age, valid: true };
});

try {
  const segments = [
    { type: 'text', data: { text: 'user A 200' } }
  ];
  
  const results = commander.match(segments);
  console.log(results[0]);
} catch (error) {
  console.error('验证失败:', error.message);
}
```

## 实际应用示例

### 1. 简单的聊天机器人

```typescript
class ChatBot {
  private commanders = new Map();
  
  constructor() {
    this.setupCommands();
  }
  
  setupCommands() {
    // 问候命令
    const greetCommander = new Commander('hello [name:text=World]');
    greetCommander.action((params) => {
      return `Hello, ${params.name}!`;
    });
    this.commanders.set('greet', greetCommander);
    
    // 天气查询命令
    const weatherCommander = new Commander('weather <city:text>');
    weatherCommander.action((params) => {
      return `查询 ${params.city} 的天气信息...`;
    });
    this.commanders.set('weather', weatherCommander);
    
    // 计算命令
    const calcCommander = new Commander('calc <expression:text>');
    calcCommander.action((params) => {
      try {
        const result = eval(params.expression);
        return `计算结果: ${result}`;
      } catch (error) {
        return `计算错误: ${error.message}`;
      }
    });
    this.commanders.set('calc', calcCommander);
  }
  
  processMessage(segments) {
    for (const [name, commander] of this.commanders) {
      try {
        const results = commander.match(segments);
        if (results.length > 0) {
          return results[0];
        }
      } catch (error) {
        console.warn(`命令 ${name} 执行失败:`, error.message);
      }
    }
    return '抱歉，我不理解这个命令。';
  }
}

// 使用示例
const bot = new ChatBot();

const messages = [
  { type: 'text', data: { text: 'hello Alice' } },
  { type: 'text', data: { text: 'weather Beijing' } },
  { type: 'text', data: { text: 'calc 2 + 3 * 4' } }
];

messages.forEach(segments => {
  const response = bot.processMessage([segments]);
  console.log('机器人回复:', response);
});
```

### 2. 文件处理系统

```typescript
class FileProcessor {
  private commanders = new Map();
  
  constructor() {
    this.setupCommands();
  }
  
  setupCommands() {
    // 文件上传命令
    const uploadCommander = new Commander('upload <filename:text> [description:text]');
    uploadCommander.action(async (params) => {
      const { filename, description } = params;
      console.log(`上传文件: ${filename}`);
      if (description) {
        console.log(`文件描述: ${description}`);
      }
      return { action: 'upload', filename, description };
    });
    this.commanders.set('upload', uploadCommander);
    
    // 文件下载命令
    const downloadCommander = new Commander('download <filename:text>');
    downloadCommander.action(async (params) => {
      const { filename } = params;
      console.log(`下载文件: ${filename}`);
      return { action: 'download', filename };
    });
    this.commanders.set('download', downloadCommander);
    
    // 文件列表命令
    const listCommander = new Commander('list [pattern:text=*]');
    listCommander.action(async (params) => {
      const { pattern } = params;
      console.log(`列出文件: ${pattern}`);
      return { action: 'list', pattern };
    });
    this.commanders.set('list', listCommander);
  }
  
  async processCommand(segments) {
    for (const [name, commander] of this.commanders) {
      try {
        const results = await commander.matchAsync(segments);
        if (results.length > 0) {
          return results[0];
        }
      } catch (error) {
        console.error(`命令 ${name} 执行失败:`, error.message);
      }
    }
    throw new Error('未知命令');
  }
}

// 使用示例
const processor = new FileProcessor();

const commands = [
  { type: 'text', data: { text: 'upload document.pdf 重要文档' } },
  { type: 'text', data: { text: 'download image.jpg' } },
  { type: 'text', data: { text: 'list *.pdf' } }
];

async function runCommands() {
  for (const segments of commands) {
    try {
      const result = await processor.processCommand([segments]);
      console.log('处理结果:', result);
    } catch (error) {
      console.error('处理失败:', error.message);
    }
  }
}

runCommands();
```

## 性能优化示例

### 1. 缓存命令解析器

```typescript
class CachedCommandManager {
  private cache = new Map();
  
  getCommander(pattern) {
    if (!this.cache.has(pattern)) {
      this.cache.set(pattern, new Commander(pattern));
    }
    return this.cache.get(pattern);
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  getCacheSize() {
    return this.cache.size;
  }
}

const manager = new CachedCommandManager();

// 重复使用相同的模式
const commander1 = manager.getCommander('hello <name:text>');
const commander2 = manager.getCommander('hello <name:text>'); // 从缓存获取

console.log('缓存大小:', manager.getCacheSize()); // 1
```

### 2. 批量处理

```typescript
function batchProcess(commanders, segments) {
  const results = [];
  
  for (const commander of commanders) {
    try {
      const result = commander.match(segments);
      if (result.length > 0) {
        results.push({ commander, result: result[0] });
        break; // 找到第一个匹配就停止
      }
    } catch (error) {
      console.warn('匹配失败:', error.message);
    }
  }
  
  return results;
}

const commanders = [
  new Commander('hello <name:text>'),
  new Commander('ping [count:number]'),
  new Commander('echo <message:text>')
];

const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const results = batchProcess(commanders, segments);
console.log('批量处理结果:', results);
```

## 下一步

- [复杂模式](/examples/complex-patterns) - 学习更复杂的模式匹配
- [异步处理](/examples/async-examples) - 了解异步操作示例
- [错误处理](/examples/error-handling) - 掌握错误处理技巧
- [性能优化](/examples/performance) - 学习性能优化方法

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>这些基础示例展示了 OneBot Commander 的核心功能，建议先掌握这些基础用法，再学习更高级的特性。</p>
</div> 