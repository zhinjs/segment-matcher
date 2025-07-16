# 测试指南

本页面详细介绍了 OneBot Commander 项目的测试策略和最佳实践。

## 测试策略

### 测试金字塔

我们遵循测试金字塔原则：

```
    E2E Tests (少量)
       /    \
   Integration Tests (中等)
      /      \
  Unit Tests (大量)
```

- **单元测试**：测试单个函数或类的功能
- **集成测试**：测试模块间的交互
- **端到端测试**：测试完整的用户流程

### 测试覆盖率目标

- 单元测试覆盖率：≥ 90%
- 集成测试覆盖率：≥ 80%
- 关键路径覆盖率：100%

## 单元测试

### 测试框架

我们使用 Jest 作为测试框架：

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### 测试文件组织

```
src/
├── commander.ts
├── pattern-parser.ts
└── segment-matcher.ts

tests/
├── unit/
│   ├── commander.test.ts
│   ├── pattern-parser.test.ts
│   └── segment-matcher.test.ts
├── integration/
│   └── commander-integration.test.ts
└── fixtures/
    ├── patterns.json
    └── segments.json
```

### 基础测试示例

```typescript
// tests/unit/commander.test.ts
import { Commander } from '../../src/commander';

describe('Commander', () => {
  let commander: Commander;

  beforeEach(() => {
    commander = new Commander();
  });

  afterEach(() => {
    commander.clearCache();
  });

  describe('constructor', () => {
    it('应该使用默认选项创建实例', () => {
      expect(commander).toBeInstanceOf(Commander);
      expect(commander.getOptions()).toEqual({
        enableCache: true,
        cacheSize: 1000,
        debug: false
      });
    });

    it('应该使用自定义选项创建实例', () => {
      const customCommander = new Commander({
        enableCache: false,
        cacheSize: 500,
        debug: true
      });

      expect(customCommander.getOptions()).toEqual({
        enableCache: false,
        cacheSize: 500,
        debug: true
      });
    });
  });

  describe('on()', () => {
    it('应该注册处理器', () => {
      const handler = jest.fn();
      commander.on('text', handler);

      expect(commander.hasHandler('text')).toBe(true);
    });

    it('应该支持链式调用', () => {
      const result = commander
        .on('text', () => 'first')
        .on('text', () => 'second');

      expect(result).toBe(commander);
    });

    it('应该验证模式格式', () => {
      expect(() => {
        commander.on('', () => {});
      }).toThrow('Pattern cannot be empty');

      expect(() => {
        commander.on('invalid:pattern:', () => {});
      }).toThrow('Invalid pattern format');
    });
  });

  describe('process()', () => {
    it('应该处理简单的文本消息', async () => {
      commander.on('text', () => 'Hello World');

      const result = await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);

      expect(result).toBe('Hello World');
    });

    it('应该处理参数提取', async () => {
      commander.on('text:message', (segment, context) => {
        return `Received: ${context.params.message}`;
      });

      const result = await commander.process([
        { type: 'text', data: { text: 'Hello World' } }
      ]);

      expect(result).toBe('Received: Hello World');
    });

    it('应该处理异步处理器', async () => {
      commander.on('text', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'async result';
      });

      const result = await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);

      expect(result).toBe('async result');
    });

    it('应该处理多个处理器', async () => {
      commander
        .on('text', () => 'first')
        .on('text', () => 'second');

      const result = await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);

      expect(result).toEqual(['first', 'second']);
    });

    it('应该处理错误', async () => {
      commander.on('text', () => {
        throw new Error('Test error');
      });

      await expect(
        commander.process([{ type: 'text', data: { text: 'test' } }])
      ).rejects.toThrow('Test error');
    });
  });
});
```

### 模式解析器测试

```typescript
// tests/unit/pattern-parser.test.ts
import { PatternParser } from '../../src/pattern-parser';

describe('PatternParser', () => {
  let parser: PatternParser;

  beforeEach(() => {
    parser = new PatternParser();
  });

  describe('parse()', () => {
    it('应该解析简单模式', () => {
      const result = parser.parse('text');
      
      expect(result).toEqual({
        type: 'text',
        parameters: [],
        isOptional: false
      });
    });

    it('应该解析带参数的模式', () => {
      const result = parser.parse('text:message');
      
      expect(result).toEqual({
        type: 'text',
        parameters: [{
          name: 'message',
          type: 'string',
          isOptional: false,
          defaultValue: undefined
        }],
        isOptional: false
      });
    });

    it('应该解析类型化参数', () => {
      const result = parser.parse('text:count<number>');
      
      expect(result.parameters[0]).toEqual({
        name: 'count',
        type: 'number',
        isOptional: false,
        defaultValue: undefined
      });
    });

    it('应该解析带默认值的参数', () => {
      const result = parser.parse('text:message="default"');
      
      expect(result.parameters[0]).toEqual({
        name: 'message',
        type: 'string',
        isOptional: false,
        defaultValue: 'default'
      });
    });

    it('应该解析剩余参数', () => {
      const result = parser.parse('text:first:string...rest:string[]');
      
      expect(result.parameters).toEqual([
        {
          name: 'first',
          type: 'string',
          isOptional: false,
          defaultValue: undefined
        },
        {
          name: 'rest',
          type: 'string[]',
          isOptional: false,
          defaultValue: undefined,
          isRest: true
        }
      ]);
    });

    it('应该验证模式格式', () => {
      expect(() => parser.parse('')).toThrow('Pattern cannot be empty');
      expect(() => parser.parse('invalid:')).toThrow('Invalid parameter format');
      expect(() => parser.parse('text:param<invalid>')).toThrow('Unsupported type: invalid');
    });
  });
});
```

### 消息段匹配器测试

```typescript
// tests/unit/segment-matcher.test.ts
import { SegmentMatcher } from '../../src/segment-matcher';

describe('SegmentMatcher', () => {
  let matcher: SegmentMatcher;

  beforeEach(() => {
    matcher = new SegmentMatcher();
  });

  describe('match()', () => {
    it('应该匹配简单的文本段', () => {
      const pattern = { type: 'text', parameters: [] };
      const segment = { type: 'text', data: { text: 'Hello' } };

      const result = matcher.match(pattern, segment);

      expect(result.matched).toBe(true);
      expect(result.params).toEqual({});
    });

    it('应该提取参数', () => {
      const pattern = {
        type: 'text',
        parameters: [{ name: 'message', type: 'string' }]
      };
      const segment = { type: 'text', data: { text: 'Hello World' } };

      const result = matcher.match(pattern, segment);

      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ message: 'Hello World' });
    });

    it('应该处理类型转换', () => {
      const pattern = {
        type: 'text',
        parameters: [{ name: 'count', type: 'number' }]
      };
      const segment = { type: 'text', data: { text: '42' } };

      const result = matcher.match(pattern, segment);

      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ count: 42 });
    });

    it('应该处理默认值', () => {
      const pattern = {
        type: 'text',
        parameters: [{ 
          name: 'message', 
          type: 'string', 
          defaultValue: 'default' 
        }]
      };
      const segment = { type: 'text', data: { text: '' } };

      const result = matcher.match(pattern, segment);

      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ message: 'default' });
    });

    it('应该处理剩余参数', () => {
      const pattern = {
        type: 'text',
        parameters: [
          { name: 'first', type: 'string' },
          { name: 'rest', type: 'string[]', isRest: true }
        ]
      };
      const segment = { type: 'text', data: { text: 'hello world test' } };

      const result = matcher.match(pattern, segment);

      expect(result.matched).toBe(true);
      expect(result.params).toEqual({
        first: 'hello',
        rest: ['world', 'test']
      });
    });
  });
});
```

## 集成测试

### 端到端流程测试

```typescript
// tests/integration/commander-integration.test.ts
import { Commander } from '../../src/commander';

describe('Commander Integration', () => {
  let commander: Commander;

  beforeEach(() => {
    commander = new Commander({
      enableCache: true,
      cacheSize: 100
    });
  });

  describe('完整的消息处理流程', () => {
    it('应该处理复杂的消息序列', async () => {
      // 注册多个处理器
      commander
        .on('text:command<string>', (segment, context) => {
          return `Command: ${context.params.command}`;
        })
        .on('at:user<number>', (segment, context) => {
          return `User: ${context.params.user}`;
        })
        .on('image:file<string>', (segment, context) => {
          return `Image: ${context.params.file}`;
        });

      // 处理复杂的消息序列
      const messages = [
        { type: 'text', data: { text: 'help' } },
        { type: 'at', data: { qq: '123456' } },
        { type: 'image', data: { file: 'image.jpg' } }
      ];

      const results = await commander.process(messages);

      expect(results).toEqual([
        'Command: help',
        'User: 123456',
        'Image: image.jpg'
      ]);
    });

    it('应该处理异步处理器链', async () => {
      const results: string[] = [];

      commander
        .on('text', async (segment, context) => {
          await new Promise(resolve => setTimeout(resolve, 50));
          results.push('first');
          return 'first';
        })
        .on('text', async (segment, context) => {
          await new Promise(resolve => setTimeout(resolve, 30));
          results.push('second');
          return 'second';
        });

      await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);

      expect(results).toEqual(['first', 'second']);
    });

    it('应该处理错误恢复', async () => {
      commander
        .on('text', () => {
          throw new Error('First error');
        })
        .on('text', () => {
          return 'Recovery';
        });

      const result = await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);

      expect(result).toBe('Recovery');
    });
  });

  describe('缓存机制', () => {
    it('应该缓存匹配结果', async () => {
      let callCount = 0;
      
      commander.on('text:message', (segment, context) => {
        callCount++;
        return `Processed: ${context.params.message}`;
      });

      // 第一次调用
      await commander.process([
        { type: 'text', data: { text: 'Hello' } }
      ]);

      // 第二次调用（应该使用缓存）
      await commander.process([
        { type: 'text', data: { text: 'Hello' } }
      ]);

      expect(callCount).toBe(1);
    });

    it('应该清理过期缓存', async () => {
      const cacheSize = 2;
      const commander = new Commander({ cacheSize });

      commander.on('text:message', (segment, context) => {
        return `Processed: ${context.params.message}`;
      });

      // 填充缓存
      await commander.process([
        { type: 'text', data: { text: 'A' } }
      ]);
      await commander.process([
        { type: 'text', data: { text: 'B' } }
      ]);
      await commander.process([
        { type: 'text', data: { text: 'C' } }
      ]);

      const stats = commander.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(cacheSize);
    });
  });
});
```

## 性能测试

### 基准测试

```typescript
// tests/performance/benchmark.test.ts
import { Commander } from '../../src/commander';

describe('Performance Benchmarks', () => {
  let commander: Commander;

  beforeEach(() => {
    commander = new Commander({
      enableCache: true,
      cacheSize: 1000
    });
  });

  it('应该快速处理大量消息', async () => {
    commander.on('text', () => 'response');

    const messages = Array.from({ length: 1000 }, (_, i) => ({
      type: 'text' as const,
      data: { text: `message${i}` }
    }));

    const startTime = performance.now();
    
    for (const message of messages) {
      await commander.process([message]);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / messages.length;

    console.log(`处理 ${messages.length} 条消息耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`平均每条消息: ${avgTime.toFixed(2)}ms`);

    expect(avgTime).toBeLessThan(1); // 平均每条消息少于1ms
  });

  it('应该高效处理复杂模式', async () => {
    commander.on('text:command<string>:args<string[]>', (segment, context) => {
      return `Command: ${context.params.command}, Args: ${context.params.args.join(',')}`;
    });

    const messages = Array.from({ length: 100 }, (_, i) => ({
      type: 'text' as const,
      data: { text: `cmd${i} arg1 arg2 arg3` }
    }));

    const startTime = performance.now();
    
    for (const message of messages) {
      await commander.process([message]);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(100); // 总时间少于100ms
  });

  it('应该测试内存使用', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // 创建大量处理器
    for (let i = 0; i < 1000; i++) {
      commander.on(`text:pattern${i}`, () => `response${i}`);
    }

    // 处理消息
    for (let i = 0; i < 100; i++) {
      await commander.process([
        { type: 'text', data: { text: `pattern${i}` } }
      ]);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 少于50MB
  });
});
```

## 测试工具和辅助函数

### 测试辅助函数

```typescript
// tests/helpers/test-utils.ts
export function createMockSegment(type: string, data: any) {
  return { type, data };
}

export function createMockContext(params: Record<string, any> = {}) {
  return {
    params,
    metadata: {},
    timestamp: Date.now()
  };
}

export function createCommanderWithHandlers(handlers: Record<string, Function>) {
  const commander = new Commander();
  
  Object.entries(handlers).forEach(([pattern, handler]) => {
    commander.on(pattern, handler);
  });
  
  return commander;
}

export async function measurePerformance<T>(
  operation: () => Promise<T>,
  iterations: number = 1
): Promise<{ result: T; avgTime: number; totalTime: number }> {
  const startTime = performance.now();
  
  let result: T;
  for (let i = 0; i < iterations; i++) {
    result = await operation();
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  return { result: result!, avgTime, totalTime };
}
```

### 测试数据生成器

```typescript
// tests/helpers/data-generators.ts
export function generateTextSegments(count: number): any[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'text',
    data: { text: `message${i}` }
  }));
}

export function generateComplexSegments(count: number): any[] {
  const types = ['text', 'image', 'file', 'at'];
  
  return Array.from({ length: count }, (_, i) => ({
    type: types[i % types.length],
    data: {
      text: `message${i}`,
      file: `file${i}.jpg`,
      qq: `${100000 + i}`
    }
  }));
}

export function generatePatterns(count: number): string[] {
  return Array.from({ length: count }, (_, i) => 
    `text:param${i}<string>`
  );
}
```

## 持续集成测试

### GitHub Actions 配置

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Run coverage
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 测试最佳实践

### 1. 测试命名

```typescript
// 使用描述性的测试名称
describe('Commander', () => {
  describe('when processing text messages', () => {
    it('should return the handler response', async () => {
      // 测试实现
    });
    
    it('should handle empty text gracefully', async () => {
      // 测试实现
    });
  });
});
```

### 2. 测试隔离

```typescript
// 每个测试都应该是独立的
describe('Commander', () => {
  let commander: Commander;

  beforeEach(() => {
    commander = new Commander(); // 每个测试都使用新的实例
  });

  afterEach(() => {
    commander.clearCache(); // 清理状态
  });
});
```

### 3. 边界条件测试

```typescript
// 测试边界条件和异常情况
describe('PatternParser', () => {
  it('should handle empty patterns', () => {
    expect(() => parser.parse('')).toThrow();
  });

  it('should handle very long patterns', () => {
    const longPattern = 'text:' + 'a'.repeat(10000);
    expect(() => parser.parse(longPattern)).not.toThrow();
  });

  it('should handle special characters', () => {
    const pattern = 'text:message<"special">';
    expect(() => parser.parse(pattern)).toThrow();
  });
});
```

### 4. 异步测试

```typescript
// 正确处理异步测试
describe('Async Processing', () => {
  it('should handle async handlers', async () => {
    const handler = jest.fn().mockResolvedValue('result');
    commander.on('text', handler);

    const result = await commander.process([
      { type: 'text', data: { text: 'test' } }
    ]);

    expect(result).toBe('result');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should handle timeout scenarios', async () => {
    commander.on('text', async () => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      return 'slow result';
    });

    await expect(
      Promise.race([
        commander.process([{ type: 'text', data: { text: 'test' } }]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 1000)
        )
      ])
    ).rejects.toThrow('timeout');
  });
});
```

遵循这些测试指南可以确保代码质量和系统稳定性。定期运行测试并监控测试覆盖率，确保项目的高质量标准。 