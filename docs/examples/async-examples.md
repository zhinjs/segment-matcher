# 异步处理示例

本页面展示了 OneBot Commander 中异步处理的各种用法和最佳实践。

## 基础异步回调

### 简单的异步处理

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 异步回调函数
commander.on('text', async (segment, context) => {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('异步处理完成:', segment.data.text);
  return '处理完成！';
});

// 使用示例
const result = await commander.process([
  { type: 'text', data: { text: 'Hello World' } }
]);
```

### 异步数据获取

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 异步获取用户信息
commander.on('at', async (segment, context) => {
  const userId = segment.data.qq;
  
  try {
    // 模拟从数据库获取用户信息
    const userInfo = await fetchUserInfo(userId);
    return `用户 ${userInfo.name} 的信息：${userInfo.description}`;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return '获取用户信息失败';
  }
});

async function fetchUserInfo(userId: string) {
  // 模拟 API 调用
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    name: `用户${userId}`,
    description: '这是一个示例用户'
  };
}
```

## Promise 链式处理

### 多个异步操作串联

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  const text = segment.data.text;
  
  // 多个异步操作串联
  const result = await Promise.resolve(text)
    .then(async (t) => {
      // 第一步：文本预处理
      const processed = await preprocessText(t);
      return processed;
    })
    .then(async (processed) => {
      // 第二步：内容分析
      const analysis = await analyzeContent(processed);
      return { processed, analysis };
    })
    .then(async ({ processed, analysis }) => {
      // 第三步：生成响应
      const response = await generateResponse(processed, analysis);
      return response;
    });
  
  return result;
});

async function preprocessText(text: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return text.toLowerCase().trim();
}

async function analyzeContent(text: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    length: text.length,
    hasEmoji: /[\u{1F600}-\u{1F64F}]/u.test(text),
    sentiment: 'positive'
  };
}

async function generateResponse(text: string, analysis: any): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return `分析结果：文本长度 ${analysis.length}，情感：${analysis.sentiment}`;
}
```

### 并行异步操作

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  const text = segment.data.text;
  
  // 并行执行多个异步操作
  const [translation, sentiment, keywords] = await Promise.all([
    translateText(text),
    analyzeSentiment(text),
    extractKeywords(text)
  ]);
  
  return {
    original: text,
    translation,
    sentiment,
    keywords
  };
});

async function translateText(text: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return `翻译结果: ${text}`;
}

async function analyzeSentiment(text: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return Math.random() > 0.5 ? 'positive' : 'negative';
}

async function extractKeywords(text: string): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 250));
  return text.split(' ').slice(0, 3);
}
```

## 异步错误处理

### 异步操作中的错误捕获

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  try {
    const result = await riskyAsyncOperation(segment.data.text);
    return result;
  } catch (error) {
    console.error('异步操作失败:', error);
    return '操作失败，请稍后重试';
  }
});

async function riskyAsyncOperation(text: string): Promise<string> {
  // 模拟可能失败的操作
  if (Math.random() > 0.7) {
    throw new Error('随机错误');
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return `处理成功: ${text}`;
}
```

### 超时处理

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  try {
    // 设置超时时间
    const result = await Promise.race([
      slowAsyncOperation(segment.data.text),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('操作超时')), 3000)
      )
    ]);
    
    return result;
  } catch (error) {
    if (error.message === '操作超时') {
      return '操作超时，请稍后重试';
    }
    return '操作失败';
  }
});

async function slowAsyncOperation(text: string): Promise<string> {
  // 模拟耗时操作
  await new Promise(resolve => setTimeout(resolve, 5000));
  return `处理完成: ${text}`;
}
```

## 异步上下文传递

### 在异步操作中保持上下文

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander.on('text', async (segment, context) => {
  // 保存原始上下文
  const originalContext = { ...context };
  
  const result = await processWithContext(segment.data.text, originalContext);
  return result;
});

async function processWithContext(text: string, context: any): Promise<string> {
  // 在异步操作中使用上下文信息
  const userId = context.userId;
  const timestamp = context.timestamp;
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return `用户 ${userId} 在 ${timestamp} 发送了: ${text}`;
}
```

## 异步队列处理

### 顺序处理多个消息

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 消息处理队列
const messageQueue: Array<{ segment: any, context: any, resolve: Function }> = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || messageQueue.length === 0) return;
  
  isProcessing = true;
  
  while (messageQueue.length > 0) {
    const { segment, context, resolve } = messageQueue.shift()!;
    
    try {
      const result = await commander.process([segment], context);
      resolve(result);
    } catch (error) {
      resolve({ error: error.message });
    }
  }
  
  isProcessing = false;
}

// 包装异步处理
commander.on('text', async (segment, context) => {
  return new Promise((resolve) => {
    messageQueue.push({ segment, context, resolve });
    processQueue();
  });
});
```

## 异步缓存

### 缓存异步操作结果

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 简单的内存缓存
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

commander.on('text', async (segment, context) => {
  const text = segment.data.text;
  const cacheKey = `text_${text}`;
  
  // 检查缓存
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return `缓存结果: ${cached.data}`;
  }
  
  // 执行异步操作
  const result = await expensiveAsyncOperation(text);
  
  // 更新缓存
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
});

async function expensiveAsyncOperation(text: string): Promise<string> {
  // 模拟昂贵的异步操作
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `处理结果: ${text.toUpperCase()}`;
}
```

## 异步重试机制

### 自动重试失败的异步操作

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

async function retryAsyncOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries) {
        console.log(`重试 ${i + 1}/${maxRetries}: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}

commander.on('text', async (segment, context) => {
  try {
    const result = await retryAsyncOperation(
      () => unreliableAsyncOperation(segment.data.text),
      3,
      1000
    );
    
    return result;
  } catch (error) {
    return `操作失败，已重试3次: ${error.message}`;
  }
});

async function unreliableAsyncOperation(text: string): Promise<string> {
  // 模拟不稳定的操作
  if (Math.random() > 0.6) {
    throw new Error('网络错误');
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return `成功处理: ${text}`;
}
```

## 性能优化建议

### 异步操作的最佳实践

1. **避免阻塞操作**
   ```typescript
   // 错误：同步阻塞
   commander.on('text', (segment, context) => {
     const result = heavySyncOperation(segment.data.text);
     return result;
   });
   
   // 正确：异步处理
   commander.on('text', async (segment, context) => {
     const result = await heavyAsyncOperation(segment.data.text);
     return result;
   });
   ```

2. **合理使用 Promise.all**
   ```typescript
   // 并行处理多个独立操作
   const results = await Promise.all([
     operation1(),
     operation2(),
     operation3()
   ]);
   ```

3. **设置合理的超时时间**
   ```typescript
   const timeoutPromise = new Promise((_, reject) => 
     setTimeout(() => reject(new Error('超时')), 5000)
   );
   
   const result = await Promise.race([
     asyncOperation(),
     timeoutPromise
   ]);
   ```

4. **使用缓存减少重复计算**
   ```typescript
   const cache = new Map();
   
   async function cachedOperation(key: string) {
     if (cache.has(key)) {
       return cache.get(key);
     }
     
     const result = await expensiveOperation();
     cache.set(key, result);
     return result;
   }
   ```

## 调试技巧

### 异步操作的调试

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 添加异步操作日志
commander.on('text', async (segment, context) => {
  const startTime = Date.now();
  console.log(`开始处理消息: ${segment.data.text}`);
  
  try {
    const result = await asyncOperation(segment.data.text);
    const duration = Date.now() - startTime;
    console.log(`处理完成，耗时: ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`处理失败，耗时: ${duration}ms`, error);
    throw error;
  }
});

async function asyncOperation(text: string): Promise<string> {
  console.log('执行异步操作...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('异步操作完成');
  return `结果: ${text}`;
}
```

这些示例展示了 OneBot Commander 中异步处理的各种用法。记住要合理使用异步操作，避免阻塞主线程，并做好错误处理和性能优化。 