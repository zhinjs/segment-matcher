# 错误处理示例

本页面展示了 OneBot Commander 中错误处理的各种策略和最佳实践。

## 基础错误处理

### 简单的错误捕获

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', (segment, context) => {
  try {
    // 可能出错的操作
    const result = processText(segment.data.text);
    return result;
  } catch (error) {
    console.error('处理文本时出错:', error);
    return '处理失败，请稍后重试';
  }
});

function processText(text: string): string {
  if (!text || text.length === 0) {
    throw new Error('文本不能为空');
  }
  
  if (text.length > 100) {
    throw new Error('文本长度超过限制');
  }
  
  return `处理结果: ${text.toUpperCase()}`;
}
```

### 异步错误处理

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  try {
    const result = await asyncProcessText(segment.data.text);
    return result;
  } catch (error) {
    console.error('异步处理失败:', error);
    
    // 根据错误类型返回不同的错误信息
    if (error instanceof NetworkError) {
      return '网络连接失败，请检查网络设置';
    } else if (error instanceof ValidationError) {
      return '输入格式错误，请检查输入内容';
    } else {
      return '系统错误，请联系管理员';
    }
  }
});

async function asyncProcessText(text: string): Promise<string> {
  // 模拟网络请求
  if (Math.random() > 0.8) {
    throw new NetworkError('网络连接超时');
  }
  
  // 模拟验证错误
  if (text.includes('error')) {
    throw new ValidationError('文本包含敏感词汇');
  }
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return `异步处理结果: ${text}`;
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## 自定义错误类型

### 定义业务错误

```typescript
import { Commander } from 'onebot-commander';

// 自定义错误基类
abstract class CommanderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 具体的错误类型
class InvalidPatternError extends CommanderError {
  constructor(pattern: string) {
    super(`无效的模式: ${pattern}`, 'INVALID_PATTERN', 400);
  }
}

class SegmentNotFoundError extends CommanderError {
  constructor(segmentType: string) {
    super(`未找到消息段类型: ${segmentType}`, 'SEGMENT_NOT_FOUND', 404);
  }
}

class ProcessingTimeoutError extends CommanderError {
  constructor(timeout: number) {
    super(`处理超时: ${timeout}ms`, 'PROCESSING_TIMEOUT', 408);
  }
}

const commander = new Commander();

commander.on('text', (segment, context) => {
  try {
    return processWithCustomErrors(segment.data.text);
  } catch (error) {
    if (error instanceof CommanderError) {
      console.error(`[${error.code}] ${error.message}`);
      return `错误 ${error.code}: ${error.message}`;
    }
    
    // 未知错误
    console.error('未知错误:', error);
    return '系统内部错误';
  }
});

function processWithCustomErrors(text: string): string {
  if (text.includes('invalid')) {
    throw new InvalidPatternError(text);
  }
  
  if (text.includes('missing')) {
    throw new SegmentNotFoundError('image');
  }
  
  if (text.includes('timeout')) {
    throw new ProcessingTimeoutError(5000);
  }
  
  return `处理成功: ${text}`;
}
```

## 错误恢复策略

### 优雅降级

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  try {
    // 尝试主要处理方式
    return await primaryProcessing(segment.data.text);
  } catch (error) {
    console.warn('主要处理失败，尝试备用方案:', error.message);
    
    try {
      // 备用处理方式
      return await fallbackProcessing(segment.data.text);
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError.message);
      return '服务暂时不可用，请稍后重试';
    }
  }
});

async function primaryProcessing(text: string): Promise<string> {
  // 模拟可能失败的主要处理
  if (Math.random() > 0.7) {
    throw new Error('主要服务不可用');
  }
  
  await new Promise(resolve => setTimeout(resolve, 200));
  return `主要处理结果: ${text}`;
}

async function fallbackProcessing(text: string): Promise<string> {
  // 简化的备用处理
  await new Promise(resolve => setTimeout(resolve, 100));
  return `备用处理结果: ${text.substring(0, 10)}...`;
}
```

### 重试机制

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // 指数退避
        console.log(`重试 ${attempt + 1}/${maxRetries}，等待 ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

commander.on('text', async (segment, context) => {
  try {
    const result = await retryWithBackoff(
      () => unreliableOperation(segment.data.text),
      3,
      1000
    );
    return result;
  } catch (error) {
    return `操作失败，已重试3次: ${error.message}`;
  }
});

async function unreliableOperation(text: string): Promise<string> {
  // 模拟不稳定的操作
  if (Math.random() > 0.5) {
    throw new Error('临时错误');
  }
  
  await new Promise(resolve => setTimeout(resolve, 200));
  return `成功处理: ${text}`;
}
```

## 错误日志和监控

### 结构化错误日志

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

interface ErrorLog {
  timestamp: string;
  errorType: string;
  message: string;
  stack?: string;
  context: {
    segmentType: string;
    userId?: string;
    sessionId?: string;
  };
  metadata: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  
  log(error: Error, context: any, metadata: Record<string, any> = {}) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name,
      message: error.message,
      stack: error.stack,
      context: {
        segmentType: context.segmentType || 'unknown',
        userId: context.userId,
        sessionId: context.sessionId
      },
      metadata
    };
    
    this.logs.push(errorLog);
    console.error('错误日志:', JSON.stringify(errorLog, null, 2));
  }
  
  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.logs.slice(-limit);
  }
  
  getErrorsByType(errorType: string): ErrorLog[] {
    return this.logs.filter(log => log.errorType === errorType);
  }
}

const errorLogger = new ErrorLogger();

commander.on('text', async (segment, context) => {
  try {
    const result = await processWithLogging(segment.data.text);
    return result;
  } catch (error) {
    // 记录错误日志
    errorLogger.log(error as Error, {
      segmentType: 'text',
      userId: context.userId,
      sessionId: context.sessionId
    }, {
      originalText: segment.data.text,
      processingTime: Date.now() - context.startTime
    });
    
    return '处理失败，错误已记录';
  }
});

async function processWithLogging(text: string): Promise<string> {
  if (text.includes('error')) {
    throw new Error('模拟处理错误');
  }
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return `处理成功: ${text}`;
}
```

## 错误边界处理

### 全局错误处理器

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 全局错误处理器
class GlobalErrorHandler {
  private errorCount = 0;
  private readonly maxErrors = 100;
  
  handleError(error: Error, context: any): string {
    this.errorCount++;
    
    // 记录错误
    console.error(`[${this.errorCount}] 全局错误:`, {
      error: error.message,
      stack: error.stack,
      context
    });
    
    // 错误过多时的处理
    if (this.errorCount > this.maxErrors) {
      console.error('错误数量过多，可能需要重启服务');
      return '系统维护中，请稍后重试';
    }
    
    // 根据错误类型返回不同的响应
    if (error.name === 'TypeError') {
      return '数据类型错误，请检查输入';
    } else if (error.name === 'RangeError') {
      return '数值超出范围';
    } else if (error.name === 'SyntaxError') {
      return '语法错误';
    } else {
      return '系统错误，请联系管理员';
    }
  }
  
  resetErrorCount(): void {
    this.errorCount = 0;
  }
  
  getErrorCount(): number {
    return this.errorCount;
  }
}

const globalErrorHandler = new GlobalErrorHandler();

// 包装所有处理器
const originalOn = commander.on.bind(commander);
commander.on = function(pattern: string, handler: Function) {
  const wrappedHandler = async (segment: any, context: any) => {
    try {
      return await handler(segment, context);
    } catch (error) {
      return globalErrorHandler.handleError(error as Error, {
        pattern,
        segment,
        context
      });
    }
  };
  
  return originalOn(pattern, wrappedHandler);
};

// 使用示例
commander.on('text', (segment, context) => {
  // 这个处理器现在被全局错误处理器保护
  if (segment.data.text.includes('crash')) {
    throw new Error('模拟崩溃');
  }
  
  return `处理成功: ${segment.data.text}`;
});
```

## 错误恢复和状态管理

### 状态恢复机制

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

interface ProcessingState {
  isProcessing: boolean;
  lastError?: Error;
  retryCount: number;
  lastSuccessTime?: number;
}

class StateManager {
  private states = new Map<string, ProcessingState>();
  
  getState(key: string): ProcessingState {
    if (!this.states.has(key)) {
      this.states.set(key, {
        isProcessing: false,
        retryCount: 0
      });
    }
    return this.states.get(key)!;
  }
  
  updateState(key: string, updates: Partial<ProcessingState>): void {
    const state = this.getState(key);
    Object.assign(state, updates);
  }
  
  resetState(key: string): void {
    this.states.delete(key);
  }
  
  isHealthy(key: string): boolean {
    const state = this.getState(key);
    return !state.isProcessing && 
           state.retryCount < 5 && 
           (!state.lastSuccessTime || Date.now() - state.lastSuccessTime < 300000);
  }
}

const stateManager = new StateManager();

commander.on('text', async (segment, context) => {
  const sessionKey = context.sessionId || 'default';
  const state = stateManager.getState(sessionKey);
  
  // 检查状态是否健康
  if (!stateManager.isHealthy(sessionKey)) {
    return '系统暂时不可用，请稍后重试';
  }
  
  try {
    stateManager.updateState(sessionKey, { isProcessing: true });
    
    const result = await processWithStateRecovery(segment.data.text, sessionKey);
    
    // 成功处理
    stateManager.updateState(sessionKey, {
      isProcessing: false,
      lastError: undefined,
      retryCount: 0,
      lastSuccessTime: Date.now()
    });
    
    return result;
  } catch (error) {
    // 处理失败
    stateManager.updateState(sessionKey, {
      isProcessing: false,
      lastError: error as Error,
      retryCount: state.retryCount + 1
    });
    
    throw error;
  }
});

async function processWithStateRecovery(text: string, sessionKey: string): Promise<string> {
  // 模拟可能失败的处理
  if (text.includes('fail')) {
    throw new Error('处理失败');
  }
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return `状态恢复处理成功: ${text}`;
}
```

## 错误处理最佳实践

### 1. 错误分类和处理策略

```typescript
// 错误分类
enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PROCESSING = 'processing',
  SYSTEM = 'system'
}

// 错误处理策略
const errorHandlers = {
  [ErrorCategory.VALIDATION]: (error: Error) => ({
    message: '输入格式错误',
    shouldRetry: false,
    userMessage: '请检查输入格式'
  }),
  
  [ErrorCategory.NETWORK]: (error: Error) => ({
    message: '网络连接错误',
    shouldRetry: true,
    userMessage: '网络连接失败，正在重试...'
  }),
  
  [ErrorCategory.PROCESSING]: (error: Error) => ({
    message: '处理错误',
    shouldRetry: true,
    userMessage: '处理失败，正在重试...'
  }),
  
  [ErrorCategory.SYSTEM]: (error: Error) => ({
    message: '系统错误',
    shouldRetry: false,
    userMessage: '系统错误，请联系管理员'
  })
};

function categorizeError(error: Error): ErrorCategory {
  if (error.message.includes('validation') || error.message.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  } else if (error.message.includes('network') || error.message.includes('timeout')) {
    return ErrorCategory.NETWORK;
  } else if (error.message.includes('processing') || error.message.includes('failed')) {
    return ErrorCategory.PROCESSING;
  } else {
    return ErrorCategory.SYSTEM;
  }
}
```

### 2. 错误恢复和降级策略

```typescript
// 降级策略
const fallbackStrategies = {
  text: (originalText: string) => `简化处理: ${originalText.substring(0, 20)}...`,
  image: () => '图片处理服务暂时不可用',
  file: () => '文件处理服务暂时不可用',
  default: () => '服务暂时不可用，请稍后重试'
};

// 错误恢复
async function handleErrorWithRecovery(
  error: Error, 
  segment: any, 
  context: any
): Promise<string> {
  const category = categorizeError(error);
  const handler = errorHandlers[category];
  const strategy = fallbackStrategies[segment.type] || fallbackStrategies.default;
  
  console.error(`[${category}] ${handler(error).message}:`, error);
  
  if (handler(error).shouldRetry) {
    // 尝试重试
    try {
      return await retryOperation(() => processSegment(segment, context));
    } catch (retryError) {
      return strategy(segment.data);
    }
  } else {
    return handler(error).userMessage;
  }
}
```

### 3. 错误监控和告警

```typescript
// 错误监控
class ErrorMonitor {
  private errorStats = new Map<string, number>();
  private alertThreshold = 10;
  
  recordError(errorType: string): void {
    const count = this.errorStats.get(errorType) || 0;
    this.errorStats.set(errorType, count + 1);
    
    if (count + 1 >= this.alertThreshold) {
      this.sendAlert(errorType, count + 1);
    }
  }
  
  private sendAlert(errorType: string, count: number): void {
    console.warn(`⚠️ 错误告警: ${errorType} 错误已达到 ${count} 次`);
    // 这里可以集成真实的告警系统
  }
  
  getStats(): Record<string, number> {
    return Object.fromEntries(this.errorStats);
  }
  
  resetStats(): void {
    this.errorStats.clear();
  }
}

const errorMonitor = new ErrorMonitor();
```

这些示例展示了 OneBot Commander 中错误处理的各种策略。记住要：

1. **分类处理错误**：根据错误类型采用不同的处理策略
2. **提供降级方案**：确保系统在出错时仍能提供基本服务
3. **记录错误日志**：便于问题排查和系统监控
4. **实现重试机制**：对于临时性错误进行自动重试
5. **设置错误边界**：防止单个错误影响整个系统
6. **监控错误趋势**：及时发现和处理系统问题 