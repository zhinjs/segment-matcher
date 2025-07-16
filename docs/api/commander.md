# Commander

Commander 是 OneBot Commander 的核心类，提供了完整的消息段命令解析功能。

## 基本概念

### 什么是 Commander

Commander 是一个消息段命令解析器，它可以根据预定义的模式匹配消息段，提取参数并执行相应的回调函数。

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander('hello <name:text>');
commander.action((params) => {
  console.log(`Hello, ${params.name}!`);
});
```

### 主要功能

1. **模式匹配**: 根据模式字符串匹配消息段
2. **参数提取**: 从匹配的消息段中提取参数
3. **回调执行**: 执行用户定义的回调函数
4. **类型安全**: 提供完整的 TypeScript 类型支持

## API 参考

### 构造函数

```typescript
new Commander(pattern: string, options?: CommanderOptions)
```

#### 参数

- `pattern`: 模式字符串，定义匹配规则
- `options`: 可选的配置选项

#### 配置选项

```typescript
interface CommanderOptions {
  fieldMapping?: FieldMapping;  // 字段映射配置
  strictMode?: boolean;         // 严格模式，默认为 false
  caseSensitive?: boolean;      // 大小写敏感，默认为 true
}
```

### 方法

#### action(callback: ActionCallback): this

设置动作回调函数。

```typescript
commander.action((params, ...remaining) => {
  // 处理匹配到的参数
  console.log('参数:', params);
  console.log('剩余消息段:', remaining);
  
  return { success: true };
});
```

#### match(segments: MessageSegment[]): MatchResult[]

执行消息段匹配。

```typescript
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const results = commander.match(segments);
if (results.length > 0) {
  console.log('匹配成功:', results[0]);
}
```

#### matchAsync(segments: MessageSegment[]): Promise<MatchResult[]>

异步执行消息段匹配。

```typescript
const results = await commander.matchAsync(segments);
```

## 模式语法

### 基本语法

| 语法 | 描述 | 示例 |
|------|------|------|
| `text` | 文本字面量 | `"hello"` |
| `<name:type>` | 必需参数 | `<name:text>` |
| `[name:type]` | 可选参数 | `[count:number]` |
| `{type:value}` | 类型化字面量 | `{face:1}` |
| `[...name]` | 剩余参数 | `[...args]` |

### 支持的类型

- `text`: 文本类型
- `number`: 数字类型
- `boolean`: 布尔类型
- `face`: 表情类型
- `image`: 图片类型
- `voice`: 语音类型
- `video`: 视频类型
- `file`: 文件类型
- `at`: @用户类型
- `reply`: 回复类型
- `forward`: 转发类型
- `json`: JSON 类型
- `xml`: XML 类型
- `card`: 卡片类型

## 使用示例

### 基本用法

```typescript
import { Commander } from 'onebot-commander';

// 创建命令解析器
const commander = new Commander('hello <name:text>');

// 设置回调函数
commander.action((params) => {
  console.log(`Hello, ${params.name}!`);
  return { message: `Hello, ${params.name}!` };
});

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const results = commander.match(segments);
// results[0] = { name: 'Alice' }
```

### 复杂模式

```typescript
const commander = new Commander('{face:1}<command:text>[count:number={value:1}]');

commander.action((params) => {
  const { command, count } = params;
  console.log(`执行命令: ${command}, 次数: ${count.value}`);
  
  return {
    command,
    count,
    timestamp: Date.now()
  };
});

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'ping' } },
  { type: 'text', data: { text: '5' } }
];

const results = commander.match(segments);
// results[0] = { command: 'ping', count: 5 }
```

### 异步处理

```typescript
const commander = new Commander('search <query:text>');

commander.action(async (params) => {
  const { query } = params;
  
  // 模拟异步搜索
  const results = await performSearch(query);
  
  return {
    query,
    results,
    count: results.length
  };
});

// 异步匹配
const segments = [
  { type: 'text', data: { text: 'search TypeScript' } }
];

const results = await commander.matchAsync(segments);
```

### 链式调用

```typescript
const commander = new Commander('ping [count:number={value:1}]')
  .action((params) => {
    console.log(`Ping ${params.count.value} times`);
    return params.count;
  })
  .action((count) => {
    return `Pong! (${count.value} times)`;
  });
```

## 高级用法

### 自定义字段映射

```typescript
const customMapping = {
  text: 'content',
  image: 'src',
  face: 'emoji_id'
};

const commander = new Commander('{text:hello}<name:text>', {
  fieldMapping: customMapping
});

const segments = [
  { type: 'text', data: { content: 'hello Alice' } }
];

const results = commander.match(segments);
// results[0] = { name: 'Alice' }
```

### 严格模式

```typescript
const commander = new Commander('hello <name:text>', {
  strictMode: true
});

const segments = [
  { type: 'text', data: { text: 'hello Alice' } },
  { type: 'text', data: { text: 'extra' } } // 在严格模式下会导致匹配失败
];

const results = commander.match(segments);
// 严格模式下，如果有剩余消息段，匹配会失败
```

### 大小写不敏感

```typescript
const commander = new Commander('HELLO <name:text>', {
  caseSensitive: false
});

const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const results = commander.match(segments);
// 匹配成功，因为大小写不敏感
```

## 错误处理

### 基本错误处理

```typescript
try {
  const commander = new Commander('hello <name:text>');
  const results = commander.match(segments);
  
  if (results.length > 0) {
    console.log('匹配成功:', results[0]);
  } else {
    console.log('没有匹配');
  }
} catch (error) {
  if (error instanceof CommanderError) {
    console.error('命令解析错误:', error.code, error.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 错误恢复

```typescript
function safeCreateCommander(pattern: string) {
  try {
    return new Commander(pattern);
  } catch (error) {
    if (error instanceof CommanderError) {
      console.warn('使用默认模式:', error.message);
      return new Commander('.*'); // 使用通配符模式作为降级
    }
    throw error;
  }
}

const commander = safeCreateCommander('invalid pattern');
```

## 性能优化

### 缓存模式

```typescript
class CachedCommander extends Commander {
  private static cache = new Map<string, Commander>();
  
  static create(pattern: string, options?: CommanderOptions): Commander {
    const key = JSON.stringify({ pattern, options });
    
    if (!this.cache.has(key)) {
      this.cache.set(key, new Commander(pattern, options));
    }
    
    return this.cache.get(key)!;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
}

// 使用缓存的命令解析器
const commander1 = CachedCommander.create('hello <name:text>');
const commander2 = CachedCommander.create('hello <name:text>'); // 从缓存获取
```

### 批量处理

```typescript
function batchMatch(commanders: Commander[], segments: MessageSegment[]) {
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

const results = batchMatch(commanders, segments);
```

## 调试技巧

### 调试模式

```typescript
class DebugCommander extends Commander {
  constructor(pattern: string, options?: CommanderOptions) {
    super(pattern, options);
    this.enableDebug = true;
  }
  
  match(segments: MessageSegment[]): MatchResult[] {
    if (this.enableDebug) {
      console.log('匹配开始:');
      console.log('模式:', this.pattern);
      console.log('消息段:', segments);
    }
    
    const results = super.match(segments);
    
    if (this.enableDebug) {
      console.log('匹配结果:', results);
    }
    
    return results;
  }
}

const debugCommander = new DebugCommander('hello <name:text>');
const results = debugCommander.match(segments);
```

### 性能监控

```typescript
class ProfiledCommander extends Commander {
  private matchTimes: number[] = [];
  
  match(segments: MessageSegment[]): MatchResult[] {
    const start = performance.now();
    
    const results = super.match(segments);
    
    const end = performance.now();
    this.matchTimes.push(end - start);
    
    return results;
  }
  
  getAverageMatchTime(): number {
    if (this.matchTimes.length === 0) return 0;
    return this.matchTimes.reduce((a, b) => a + b, 0) / this.matchTimes.length;
  }
  
  getMatchStats() {
    return {
      totalMatches: this.matchTimes.length,
      averageTime: this.getAverageMatchTime(),
      minTime: Math.min(...this.matchTimes),
      maxTime: Math.max(...this.matchTimes)
    };
  }
}
```

## 最佳实践

### 1. 模式设计

```typescript
// ✅ 清晰简洁的模式
const goodPatterns = [
  'hello <name:text>',
  'echo <message:text>',
  'ping [count:number=1]'
];

// ❌ 过于复杂的模式
const badPatterns = [
  '{face:1}{text:start}<arg1:text>[arg2:face][arg3:image][arg4:at]',
  'very long pattern with many parameters and complex structure'
];
```

### 2. 错误处理

```typescript
// ✅ 完善的错误处理
function createCommander(pattern: string) {
  try {
    return new Commander(pattern);
  } catch (error) {
    if (error instanceof CommanderError) {
      console.error(`模式解析失败: ${pattern}`, error.message);
      throw new Error(`无效的模式: ${pattern}`);
    }
    throw error;
  }
}

// ❌ 忽略错误
function badCreateCommander(pattern: string) {
  return new Commander(pattern); // 可能抛出未处理的异常
}
```

### 3. 性能考虑

```typescript
// ✅ 使用缓存的命令解析器
const commanderCache = new Map<string, Commander>();

function getCommander(pattern: string): Commander {
  if (!commanderCache.has(pattern)) {
    commanderCache.set(pattern, new Commander(pattern));
  }
  return commanderCache.get(pattern)!;
}

// ❌ 每次都创建新实例
function badGetCommander(pattern: string): Commander {
  return new Commander(pattern); // 每次都创建新实例
}
```

### 4. 类型安全

```typescript
// ✅ 使用类型安全的接口
interface UserCommand {
  name: string;
  age: number;
  email?: string;
}

const commander = new TypedCommander<UserCommand>('user <name:text> <age:number> [email:text]');

commander.action((params: UserCommand) => {
  // TypeScript 提供类型检查
  console.log(`用户: ${params.name}, 年龄: ${params.age}`);
  if (params.email) {
    console.log(`邮箱: ${params.email}`);
  }
});

// ❌ 不使用类型定义
const badCommander = new Commander('user <name:text> <age:number> [email:text]');

badCommander.action((params: any) => {
  // 没有类型检查，容易出现错误
  console.log(params.nme); // 拼写错误，但没有类型检查
});
```

## 测试

### 单元测试

```typescript
import { Commander } from 'onebot-commander';

describe('Commander', () => {
  test('应该匹配简单的文本模式', () => {
    const commander = new Commander('hello <name:text>');
    
    const segments = [
      { type: 'text', data: { text: 'hello Alice' } }
    ];
    
    const results = commander.match(segments);
    
    expect(results.length).toBe(1);
    expect(results[0]).toEqual({ name: 'Alice' });
  });
  
  test('应该处理可选参数', () => {
    const commander = new Commander('ping [count:number=1]');
    
    const segments1 = [
      { type: 'text', data: { text: 'ping 5' } }
    ];
    const results1 = commander.match(segments1);
    expect(results1[0]).toEqual({ count: 5 });
    
    const segments2 = [
      { type: 'text', data: { text: 'ping' } }
    ];
    const results2 = commander.match(segments2);
    expect(results2[0]).toEqual({ count: 1 });
  });
  
  test('应该处理类型化字面量', () => {
    const commander = new Commander('{face:1}<command:text>');
    
    const segments = [
      { type: 'face', data: { id: 1 } },
      { type: 'text', data: { text: 'ping' } }
    ];
    
    const results = commander.match(segments);
    expect(results[0]).toEqual({ command: 'ping' });
  });
});
```

### 集成测试

```typescript
describe('Commander 集成测试', () => {
  test('应该处理复杂的消息段序列', () => {
    const commander = new Commander('{face:1}<command:text>[count:number=1]');
    
    commander.action((params) => {
      return {
        command: params.command,
        count: params.count,
        timestamp: Date.now()
      };
    });
    
    const segments = [
      { type: 'face', data: { id: 1 } },
      { type: 'text', data: { text: 'ping' } },
      { type: 'text', data: { text: '5' } }
    ];
    
    const results = commander.match(segments);
    
    expect(results.length).toBe(1);
    expect(results[0].command).toBe('ping');
    expect(results[0].count).toBe(5);
    expect(results[0].timestamp).toBeDefined();
  });
});
```

## 下一步

- [PatternParser](/api/pattern-parser) - 学习模式解析器
- [SegmentMatcher](/api/segment-matcher) - 了解消息段匹配器
- [错误处理](/api/errors) - 掌握错误处理机制
- [类型定义](/api/types) - 了解类型系统

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>Commander 是 OneBot Commander 的核心类，掌握其使用方法可以构建强大的消息段命令解析系统。</p>
</div> 