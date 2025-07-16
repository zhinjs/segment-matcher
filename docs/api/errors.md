# 错误处理

OneBot Commander 提供了完善的错误处理机制，帮助开发者识别和处理各种错误情况。

## 基本概念

### 错误类型

OneBot Commander 定义了多种错误类型，每种错误都有特定的错误代码和描述：

```typescript
import { CommanderError, ErrorCodes } from 'onebot-commander';

// 创建错误实例
const error = new CommanderError(
  ErrorCodes.PATTERN_PARSE_ERROR,
  '模式解析失败',
  { pattern: 'invalid pattern' }
);
```

### 错误代码

| 错误代码 | 描述 | 触发条件 |
|----------|------|----------|
| `PATTERN_PARSE_ERROR` | 模式解析错误 | 模式语法不正确 |
| `PARAMETER_MISSING` | 参数缺失 | 必需参数未提供 |
| `TYPE_MISMATCH` | 类型不匹配 | 参数类型与期望不符 |
| `FIELD_NOT_FOUND` | 字段不存在 | 消息段中缺少必要字段 |
| `VALUE_MISMATCH` | 值不匹配 | 类型化字面量值不匹配 |
| `MULTIPLE_REST_PARAMS` | 多个剩余参数 | 模式中有多个剩余参数 |
| `REST_PARAM_POSITION` | 剩余参数位置错误 | 剩余参数不在最后 |
| `DUPLICATE_PARAM` | 参数重复 | 模式中有重复的参数名 |

## 错误类

### CommanderError

主要的错误类，继承自 `Error`。

```typescript
class CommanderError extends Error {
  constructor(
    code: string,
    message: string,
    details?: any,
    cause?: Error
  );
  
  code: string;
  details?: any;
  cause?: Error;
}
```

#### 属性

- `code`: 错误代码
- `message`: 错误消息
- `details`: 错误详情
- `cause`: 原始错误

### 使用示例

```typescript
import { CommanderError, ErrorCodes } from 'onebot-commander';

// 创建错误
const error = new CommanderError(
  ErrorCodes.PATTERN_PARSE_ERROR,
  '模式语法错误',
  { pattern: 'hello <name>', line: 1, column: 10 }
);

console.log(error.code); // 'PATTERN_PARSE_ERROR'
console.log(error.message); // '模式语法错误'
console.log(error.details); // { pattern: 'hello <name>', line: 1, column: 10 }
```

## 错误处理模式

### 1. Try-Catch 模式

```typescript
import { Commander } from 'onebot-commander';

try {
  const commander = new Commander('hello <name:text>');
  const result = commander.match(segments);
  
  if (result.length > 0) {
    console.log('匹配成功:', result[0]);
  } else {
    console.log('没有匹配');
  }
} catch (error) {
  if (error instanceof CommanderError) {
    console.error('命令解析错误:', error.code, error.message);
    console.error('错误详情:', error.details);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 2. 错误检查模式

```typescript
import { Commander, CommanderError, ErrorCodes } from 'onebot-commander';

function safeCreateCommander(pattern: string) {
  try {
    return new Commander(pattern);
  } catch (error) {
    if (error instanceof CommanderError) {
      switch (error.code) {
        case ErrorCodes.PATTERN_PARSE_ERROR:
          console.error('模式语法错误:', error.message);
          // 尝试修复模式
          const fixedPattern = fixPattern(pattern);
          return new Commander(fixedPattern);
          
        case ErrorCodes.DUPLICATE_PARAM:
          console.error('参数重复:', error.details);
          throw new Error('请检查参数名是否重复');
          
        default:
          console.error('未知错误:', error.code);
          throw error;
      }
    }
    throw error;
  }
}

function fixPattern(pattern: string): string {
  // 简单的模式修复逻辑
  return pattern.replace(/<([^:>]+)>/g, '<$1:text>');
}
```

### 3. 异步错误处理

```typescript
import { Commander } from 'onebot-commander';

async function processCommand(pattern: string, segments: any[]) {
  const commander = new Commander(pattern);
  
  try {
    // 设置异步回调
    commander.action(async (params) => {
      // 模拟异步操作
      await someAsyncOperation(params);
      return { success: true };
    });
    
    const result = await commander.matchAsync(segments);
    return result;
  } catch (error) {
    if (error instanceof CommanderError) {
      console.error('命令处理错误:', error.code, error.message);
      return { error: error.message };
    }
    throw error;
  }
}
```

## 常见错误场景

### 1. 模式解析错误

```typescript
// 错误：缺少类型声明
try {
  const commander = new Commander('hello <name>');
} catch (error) {
  if (error instanceof CommanderError && error.code === 'PATTERN_PARSE_ERROR') {
    console.error('参数缺少类型声明，请使用 <name:type> 格式');
  }
}

// 错误：无效的语法
try {
  const commander = new Commander('hello <name:text> <name:number>');
} catch (error) {
  if (error instanceof CommanderError && error.code === 'DUPLICATE_PARAM') {
    console.error('参数名重复:', error.details.paramName);
  }
}
```

### 2. 匹配错误

```typescript
const commander = new Commander('{face:1}<command:text>');

const segments = [
  { type: 'text', data: { text: 'hello' } } // 类型不匹配
];

try {
  const result = commander.match(segments);
} catch (error) {
  if (error instanceof CommanderError) {
    switch (error.code) {
      case 'TYPE_MISMATCH':
        console.error('消息段类型不匹配:', error.details);
        break;
      case 'VALUE_MISMATCH':
        console.error('值不匹配:', error.details);
        break;
    }
  }
}
```

### 3. 字段映射错误

```typescript
const customMapping = {
  text: 'content',
  image: 'src'
};

const commander = new Commander('{image:photo.jpg}<caption:text>', customMapping);

const segments = [
  { type: 'image', data: { file: 'photo.jpg' } }, // 使用 file 而不是 src
  { type: 'text', data: { text: 'caption' } }
];

try {
  const result = commander.match(segments);
} catch (error) {
  if (error instanceof CommanderError && error.code === 'FIELD_NOT_FOUND') {
    console.error('字段不存在:', error.details);
    // 可能需要调整字段映射或数据格式
  }
}
```

## 错误恢复策略

### 1. 自动修复

```typescript
class AutoFixCommander extends Commander {
  constructor(pattern: string, options?: any) {
    try {
      super(pattern, options);
    } catch (error) {
      if (error instanceof CommanderError && error.code === 'PATTERN_PARSE_ERROR') {
        const fixedPattern = this.autoFixPattern(pattern);
        super(fixedPattern, options);
      } else {
        throw error;
      }
    }
  }
  
  private autoFixPattern(pattern: string): string {
    return pattern
      .replace(/<([^:>]+)>/g, '<$1:text>') // 添加默认类型
      .replace(/\[([^:>\]]+)\]/g, '[$1:text]'); // 添加默认类型
  }
}

// 使用自动修复
const commander = new AutoFixCommander('hello <name>'); // 自动修复为 'hello <name:text>'
```

### 2. 降级处理

```typescript
function createCommanderWithFallback(pattern: string) {
  try {
    return new Commander(pattern);
  } catch (error) {
    if (error instanceof CommanderError) {
      console.warn('使用降级模式:', error.message);
      
      // 创建简单的文本匹配器作为降级
      return new Commander('.*');
    }
    throw error;
  }
}
```

### 3. 错误报告

```typescript
class ErrorReportingCommander extends Commander {
  private errorReports: any[] = [];
  
  constructor(pattern: string, options?: any) {
    try {
      super(pattern, options);
    } catch (error) {
      this.reportError(error);
      throw error;
    }
  }
  
  private reportError(error: any) {
    const report = {
      timestamp: new Date().toISOString(),
      pattern: this.pattern,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
    
    this.errorReports.push(report);
    
    // 发送错误报告
    this.sendErrorReport(report);
  }
  
  private sendErrorReport(report: any) {
    // 实现错误报告发送逻辑
    console.error('错误报告:', report);
  }
  
  getErrorReports() {
    return this.errorReports;
  }
}
```

## 调试工具

### 1. 错误诊断

```typescript
function diagnoseError(error: CommanderError): string {
  const suggestions = [];
  
  switch (error.code) {
    case 'PATTERN_PARSE_ERROR':
      suggestions.push('检查模式语法是否正确');
      suggestions.push('确保参数有类型声明，如 <name:text>');
      suggestions.push('检查括号是否匹配');
      break;
      
    case 'DUPLICATE_PARAM':
      suggestions.push('检查参数名是否重复');
      suggestions.push('使用不同的参数名');
      break;
      
    case 'TYPE_MISMATCH':
      suggestions.push('检查消息段类型是否匹配');
      suggestions.push('确认字段映射配置');
      break;
      
    case 'FIELD_NOT_FOUND':
      suggestions.push('检查消息段数据结构');
      suggestions.push('确认字段映射配置');
      suggestions.push('检查字段名是否正确');
      break;
  }
  
  return suggestions.join('\n');
}

// 使用诊断
try {
  const commander = new Commander('invalid pattern');
} catch (error) {
  if (error instanceof CommanderError) {
    console.error('错误诊断:');
    console.error(diagnoseError(error));
  }
}
```

### 2. 错误日志

```typescript
class LoggingCommander extends Commander {
  private errorLog: any[] = [];
  
  constructor(pattern: string, options?: any) {
    try {
      super(pattern, options);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }
  
  private logError(error: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      pattern: this.pattern,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack
      }
    };
    
    this.errorLog.push(logEntry);
    
    // 写入日志文件
    this.writeToLogFile(logEntry);
  }
  
  private writeToLogFile(logEntry: any) {
    const logLine = JSON.stringify(logEntry) + '\n';
    // 实现日志写入逻辑
    console.log('错误日志:', logLine);
  }
  
  getErrorLog() {
    return this.errorLog;
  }
  
  clearErrorLog() {
    this.errorLog = [];
  }
}
```

### 3. 错误统计

```typescript
class StatisticsCommander extends Commander {
  private errorStats = new Map<string, number>();
  
  constructor(pattern: string, options?: any) {
    try {
      super(pattern, options);
    } catch (error) {
      this.recordError(error);
      throw error;
    }
  }
  
  private recordError(error: any) {
    const code = error.code || 'UNKNOWN';
    const count = this.errorStats.get(code) || 0;
    this.errorStats.set(code, count + 1);
  }
  
  getErrorStatistics() {
    const stats = {};
    for (const [code, count] of this.errorStats) {
      stats[code] = count;
    }
    return stats;
  }
  
  getMostCommonError() {
    let maxCount = 0;
    let mostCommon = null;
    
    for (const [code, count] of this.errorStats) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = code;
      }
    }
    
    return mostCommon;
  }
}
```

## 最佳实践

### 1. 错误边界

```typescript
// ✅ 使用错误边界
function createCommanderWithBoundary(pattern: string) {
  try {
    return new Commander(pattern);
  } catch (error) {
    // 记录错误但不中断程序
    console.error('创建命令解析器失败:', error.message);
    
    // 返回一个安全的默认解析器
    return new Commander('.*');
  }
}

// ❌ 不处理错误
function badCreateCommander(pattern: string) {
  return new Commander(pattern); // 可能抛出未处理的异常
}
```

### 2. 错误分类

```typescript
// ✅ 按严重程度分类错误
function handleError(error: CommanderError) {
  const criticalErrors = ['PATTERN_PARSE_ERROR', 'DUPLICATE_PARAM'];
  const warningErrors = ['TYPE_MISMATCH', 'FIELD_NOT_FOUND'];
  
  if (criticalErrors.includes(error.code)) {
    console.error('严重错误:', error.message);
    // 可能需要停止程序或使用默认配置
  } else if (warningErrors.includes(error.code)) {
    console.warn('警告:', error.message);
    // 可以继续执行但记录警告
  } else {
    console.log('信息:', error.message);
  }
}

// ❌ 不分类处理
function badHandleError(error: any) {
  console.error(error); // 所有错误都同等处理
}
```

### 3. 用户友好

```typescript
// ✅ 用户友好的错误消息
function getUserFriendlyMessage(error: CommanderError): string {
  const messages = {
    'PATTERN_PARSE_ERROR': '模式语法错误，请检查格式',
    'DUPLICATE_PARAM': '参数名重复，请使用不同的名称',
    'TYPE_MISMATCH': '消息类型不匹配',
    'FIELD_NOT_FOUND': '缺少必要的数据字段',
    'VALUE_MISMATCH': '值不匹配，请检查输入'
  };
  
  return messages[error.code] || '发生未知错误';
}

// ❌ 技术性错误消息
function badGetMessage(error: any) {
  return error.message; // 可能包含技术细节
}
```

## 测试错误处理

### 1. 错误测试

```typescript
import { Commander, CommanderError, ErrorCodes } from 'onebot-commander';

describe('错误处理测试', () => {
  test('应该抛出模式解析错误', () => {
    expect(() => {
      new Commander('invalid pattern');
    }).toThrow(CommanderError);
    
    expect(() => {
      new Commander('invalid pattern');
    }).toThrow(/PATTERN_PARSE_ERROR/);
  });
  
  test('应该抛出参数重复错误', () => {
    expect(() => {
      new Commander('hello <name:text> <name:number>');
    }).toThrow(/DUPLICATE_PARAM/);
  });
  
  test('应该正确处理有效模式', () => {
    expect(() => {
      new Commander('hello <name:text>');
    }).not.toThrow();
  });
});
```

### 2. 错误恢复测试

```typescript
test('应该能够从错误中恢复', () => {
  const commander = createCommanderWithFallback('invalid pattern');
  
  expect(commander).toBeDefined();
  expect(commander.pattern).toBe('.*');
});

test('应该记录错误统计', () => {
  const commander = new StatisticsCommander('invalid pattern');
  
  try {
    new StatisticsCommander('another invalid pattern');
  } catch (error) {
    // 忽略错误
  }
  
  const stats = commander.getErrorStatistics();
  expect(stats['PATTERN_PARSE_ERROR']).toBeGreaterThan(0);
});
```

## 下一步

- [类型定义](/api/types) - 了解类型系统
- [PatternParser](/api/pattern-parser) - 学习模式解析器
- [SegmentMatcher](/api/segment-matcher) - 了解消息段匹配器
- [Commander](/api/commander) - 查看主要的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>完善的错误处理是构建健壮应用的关键，合理使用错误处理机制可以提高应用的稳定性和用户体验。</p>
</div> 