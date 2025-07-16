# 性能优化示例

本页面展示了 OneBot Commander 中各种性能优化技术和最佳实践。

## 缓存策略

### 内存缓存

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 简单的内存缓存
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

const cache = new MemoryCache();

commander.on('text', (segment, context) => {
  const text = segment.data.text;
  const cacheKey = `text_${text}`;
  
  // 检查缓存
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('缓存命中:', cacheKey);
    return cached;
  }
  
  // 执行昂贵的操作
  const result = expensiveOperation(text);
  
  // 缓存结果（5分钟）
  cache.set(cacheKey, result, 5 * 60 * 1000);
  
  return result;
});

function expensiveOperation(text: string): string {
  // 模拟昂贵的计算
  let result = '';
  for (let i = 0; i < 1000000; i++) {
    result = text.split('').reverse().join('');
  }
  return `处理结果: ${result}`;
}
```

### LRU 缓存

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// LRU 缓存实现
class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();
  
  constructor(capacity: number) {
    this.capacity = capacity;
  }
  
  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  size(): number {
    return this.cache.size;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const lruCache = new LRUCache<string, string>(100);

commander.on('text', (segment, context) => {
  const text = segment.data.text;
  const cacheKey = `lru_${text}`;
  
  // 检查 LRU 缓存
  const cached = lruCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 执行操作
  const result = processText(text);
  
  // 存入 LRU 缓存
  lruCache.set(cacheKey, result);
  
  return result;
});

function processText(text: string): string {
  // 模拟处理
  return `LRU 处理: ${text.toUpperCase()}`;
}
```

### 分层缓存

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 分层缓存系统
class LayeredCache {
  private l1Cache = new Map<string, { data: any; timestamp: number }>(); // 快速缓存
  private l2Cache = new Map<string, { data: any; timestamp: number }>(); // 慢速缓存
  
  get(key: string): any | null {
    // 先检查 L1 缓存
    const l1Item = this.l1Cache.get(key);
    if (l1Item && Date.now() - l1Item.timestamp < 60000) { // 1分钟
      return l1Item.data;
    }
    
    // 检查 L2 缓存
    const l2Item = this.l2Cache.get(key);
    if (l2Item && Date.now() - l2Item.timestamp < 300000) { // 5分钟
      // 提升到 L1 缓存
      this.l1Cache.set(key, { data: l2Item.data, timestamp: Date.now() });
      return l2Item.data;
    }
    
    return null;
  }
  
  set(key: string, data: any): void {
    const timestamp = Date.now();
    
    // 同时存入两个缓存层
    this.l1Cache.set(key, { data, timestamp });
    this.l2Cache.set(key, { data, timestamp });
    
    // 清理过期数据
    this.cleanup();
  }
  
  private cleanup(): void {
    const now = Date.now();
    
    // 清理 L1 缓存
    for (const [key, item] of this.l1Cache.entries()) {
      if (now - item.timestamp > 60000) {
        this.l1Cache.delete(key);
      }
    }
    
    // 清理 L2 缓存
    for (const [key, item] of this.l2Cache.entries()) {
      if (now - item.timestamp > 300000) {
        this.l2Cache.delete(key);
      }
    }
  }
  
  stats(): { l1Size: number; l2Size: number } {
    return {
      l1Size: this.l1Cache.size,
      l2Size: this.l2Cache.size
    };
  }
}

const layeredCache = new LayeredCache();

commander.on('text', (segment, context) => {
  const text = segment.data.text;
  const cacheKey = `layered_${text}`;
  
  // 检查分层缓存
  const cached = layeredCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 执行操作
  const result = heavyComputation(text);
  
  // 存入分层缓存
  layeredCache.set(cacheKey, result);
  
  return result;
});

function heavyComputation(text: string): string {
  // 模拟重计算
  return `分层缓存结果: ${text.split('').reverse().join('')}`;
}
```

## 批量处理

### 消息批量处理

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 批量处理器
class BatchProcessor {
  private batch: Array<{ segment: any; context: any; resolve: Function }> = [];
  private batchSize: number;
  private batchTimeout: number;
  private timer: NodeJS.Timeout | null = null;
  
  constructor(batchSize: number = 10, batchTimeout: number = 100) {
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
  }
  
  add(segment: any, context: any): Promise<any> {
    return new Promise((resolve) => {
      this.batch.push({ segment, context, resolve });
      
      if (this.batch.length >= this.batchSize) {
        this.processBatch();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.processBatch(), this.batchTimeout);
      }
    });
  }
  
  private async processBatch(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.batch.length === 0) return;
    
    const currentBatch = this.batch.splice(0, this.batchSize);
    const segments = currentBatch.map(item => item.segment);
    const contexts = currentBatch.map(item => item.context);
    
    try {
      // 批量处理
      const results = await batchProcess(segments, contexts);
      
      // 返回结果
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // 错误处理
      currentBatch.forEach(item => {
        item.resolve({ error: error.message });
      });
    }
  }
  
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.processBatch();
  }
}

const batchProcessor = new BatchProcessor(5, 50);

commander.on('text', (segment, context) => {
  return batchProcessor.add(segment, context);
});

async function batchProcess(segments: any[], contexts: any[]): Promise<any[]> {
  // 模拟批量处理
  console.log(`批量处理 ${segments.length} 个消息`);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return segments.map((segment, index) => {
    const text = segment.data.text;
    return `批量处理结果 ${index + 1}: ${text}`;
  });
}
```

### 并发控制

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 并发控制器
class ConcurrencyController {
  private running = 0;
  private queue: Array<{ task: () => Promise<any>; resolve: Function; reject: Function }> = [];
  private maxConcurrency: number;
  
  constructor(maxConcurrency: number = 3) {
    this.maxConcurrency = maxConcurrency;
  }
  
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    
    const { task, resolve, reject } = this.queue.shift()!;
    this.running++;
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
  
  getStats(): { running: number; queued: number } {
    return {
      running: this.running,
      queued: this.queue.length
    };
  }
}

const concurrencyController = new ConcurrencyController(2);

commander.on('text', async (segment, context) => {
  return concurrencyController.execute(async () => {
    console.log('开始处理:', segment.data.text);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('处理完成:', segment.data.text);
    return `并发处理结果: ${segment.data.text}`;
  });
});
```

## 内存优化

### 对象池

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 对象池
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;
  
  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }
  
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  size(): number {
    return this.pool.length;
  }
  
  clear(): void {
    this.pool.length = 0;
  }
}

// 使用对象池处理消息段
interface ProcessedSegment {
  type: string;
  data: any;
  timestamp: number;
  metadata: Record<string, any>;
}

const segmentPool = new ObjectPool<ProcessedSegment>(
  () => ({
    type: '',
    data: {},
    timestamp: 0,
    metadata: {}
  }),
  (segment) => {
    segment.type = '';
    segment.data = {};
    segment.timestamp = 0;
    segment.metadata = {};
  },
  50
);

commander.on('text', (segment, context) => {
  const processedSegment = segmentPool.acquire();
  
  try {
    // 使用对象
    processedSegment.type = segment.type;
    processedSegment.data = segment.data;
    processedSegment.timestamp = Date.now();
    processedSegment.metadata = { userId: context.userId };
    
    return processSegment(processedSegment);
  } finally {
    // 归还对象到池中
    segmentPool.release(processedSegment);
  }
});

function processSegment(segment: ProcessedSegment): string {
  return `对象池处理: ${segment.data.text}`;
}
```

### 弱引用缓存

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 弱引用缓存
class WeakRefCache<K extends object, V> {
  private cache = new Map<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    this.cache.delete(key);
  });
  
  set(key: K, value: V): void {
    const weakRef = new WeakRef(value);
    this.cache.set(key, weakRef);
    this.registry.register(value, key);
  }
  
  get(key: K): V | undefined {
    const weakRef = this.cache.get(key);
    if (!weakRef) return undefined;
    
    const value = weakRef.deref();
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }
    
    return value;
  }
  
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  
  size(): number {
    return this.cache.size;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 使用弱引用缓存
const weakCache = new WeakRefCache<object, string>();

commander.on('text', (segment, context) => {
  const key = { text: segment.data.text, userId: context.userId };
  
  // 检查弱引用缓存
  const cached = weakCache.get(key);
  if (cached) {
    return cached;
  }
  
  // 处理并缓存
  const result = processWithWeakCache(segment.data.text);
  weakCache.set(key, result);
  
  return result;
});

function processWithWeakCache(text: string): string {
  return `弱引用缓存结果: ${text}`;
}
```

## 性能监控

### 性能指标收集

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 性能监控器
class PerformanceMonitor {
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    errors: number;
  }>();
  
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }
  
  recordMetric(operation: string, duration: number, isError: boolean = false): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0
      });
    }
    
    const metric = this.metrics.get(operation)!;
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    
    if (isError) {
      metric.errors++;
    }
  }
  
  getStats(operation?: string): any {
    if (operation) {
      const metric = this.metrics.get(operation);
      if (!metric) return null;
      
      return {
        operation,
        count: metric.count,
        avgTime: metric.totalTime / metric.count,
        minTime: metric.minTime,
        maxTime: metric.maxTime,
        errorRate: metric.errors / metric.count
      };
    }
    
    return Object.fromEntries(
      Array.from(this.metrics.keys()).map(op => [op, this.getStats(op)])
    );
  }
  
  reset(): void {
    this.metrics.clear();
  }
}

const performanceMonitor = new PerformanceMonitor();

// 包装处理器以添加性能监控
const originalOn = commander.on.bind(commander);
commander.on = function(pattern: string, handler: Function) {
  const wrappedHandler = async (segment: any, context: any) => {
    const stopTimer = performanceMonitor.startTimer(`pattern_${pattern}`);
    
    try {
      const result = await handler(segment, context);
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      performanceMonitor.recordMetric(`pattern_${pattern}`, 0, true);
      throw error;
    }
  };
  
  return originalOn(pattern, wrappedHandler);
};

// 使用示例
commander.on('text', async (segment, context) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return `性能监控: ${segment.data.text}`;
});

// 定期输出性能统计
setInterval(() => {
  console.log('性能统计:', performanceMonitor.getStats());
}, 10000);
```

### 内存使用监控

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 内存监控器
class MemoryMonitor {
  private snapshots: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = [];
  private maxSnapshots = 100;
  
  takeSnapshot(): void {
    const usage = process.memoryUsage();
    this.snapshots.push({
      timestamp: Date.now(),
      usage
    });
    
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }
  
  getCurrentUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }
  
  getTrend(): {
    rss: { current: number; avg: number; trend: 'increasing' | 'decreasing' | 'stable' };
    heapUsed: { current: number; avg: number; trend: 'increasing' | 'decreasing' | 'stable' };
  } {
    if (this.snapshots.length < 2) {
      return {
        rss: { current: 0, avg: 0, trend: 'stable' },
        heapUsed: { current: 0, avg: 0, trend: 'stable' }
      };
    }
    
    const current = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];
    
    const rssAvg = this.snapshots.reduce((sum, s) => sum + s.usage.rss, 0) / this.snapshots.length;
    const heapAvg = this.snapshots.reduce((sum, s) => sum + s.usage.heapUsed, 0) / this.snapshots.length;
    
    return {
      rss: {
        current: current.usage.rss,
        avg: rssAvg,
        trend: current.usage.rss > previous.usage.rss ? 'increasing' : 
               current.usage.rss < previous.usage.rss ? 'decreasing' : 'stable'
      },
      heapUsed: {
        current: current.usage.heapUsed,
        avg: heapAvg,
        trend: current.usage.heapUsed > previous.usage.heapUsed ? 'increasing' : 
               current.usage.heapUsed < previous.usage.heapUsed ? 'decreasing' : 'stable'
      }
    };
  }
  
  getAlerts(): string[] {
    const usage = this.getCurrentUsage();
    const alerts: string[] = [];
    
    // 检查内存使用阈值
    if (usage.heapUsed > 100 * 1024 * 1024) { // 100MB
      alerts.push('堆内存使用过高');
    }
    
    if (usage.rss > 500 * 1024 * 1024) { // 500MB
      alerts.push('RSS 内存使用过高');
    }
    
    return alerts;
  }
}

const memoryMonitor = new MemoryMonitor();

// 定期监控内存使用
setInterval(() => {
  memoryMonitor.takeSnapshot();
  
  const alerts = memoryMonitor.getAlerts();
  if (alerts.length > 0) {
    console.warn('内存告警:', alerts);
  }
  
  const trend = memoryMonitor.getTrend();
  console.log('内存趋势:', trend);
}, 5000);
```

## 优化最佳实践

### 1. 避免闭包陷阱

```typescript
// 错误：在循环中创建闭包
for (let i = 0; i < 1000; i++) {
  commander.on('text', (segment, context) => {
    return `处理 ${i}`; // 闭包捕获了 i
  });
}

// 正确：使用函数工厂
function createHandler(index: number) {
  return (segment: any, context: any) => {
    return `处理 ${index}`;
  };
}

for (let i = 0; i < 1000; i++) {
  commander.on('text', createHandler(i));
}
```

### 2. 使用对象池避免频繁创建

```typescript
// 错误：频繁创建对象
commander.on('text', (segment, context) => {
  const result = {
    type: 'response',
    data: { text: segment.data.text },
    timestamp: Date.now(),
    metadata: {}
  };
  return result;
});

// 正确：使用对象池
const resultPool = new ObjectPool(
  () => ({ type: '', data: {}, timestamp: 0, metadata: {} }),
  (obj) => { Object.assign(obj, { type: '', data: {}, timestamp: 0, metadata: {} }); }
);

commander.on('text', (segment, context) => {
  const result = resultPool.acquire();
  result.type = 'response';
  result.data = { text: segment.data.text };
  result.timestamp = Date.now();
  
  const response = { ...result };
  resultPool.release(result);
  return response;
});
```

### 3. 合理使用缓存

```typescript
// 缓存计算结果
const computationCache = new Map<string, string>();

commander.on('text', (segment, context) => {
  const text = segment.data.text;
  const cacheKey = `compute_${text}`;
  
  if (computationCache.has(cacheKey)) {
    return computationCache.get(cacheKey);
  }
  
  const result = expensiveComputation(text);
  computationCache.set(cacheKey, result);
  
  // 限制缓存大小
  if (computationCache.size > 1000) {
    const firstKey = computationCache.keys().next().value;
    computationCache.delete(firstKey);
  }
  
  return result;
});
```

### 4. 异步处理优化

```typescript
// 使用 Promise.all 并行处理
commander.on('text', async (segment, context) => {
  const text = segment.data.text;
  
  // 并行执行多个独立操作
  const [analysis, translation, sentiment] = await Promise.all([
    analyzeText(text),
    translateText(text),
    analyzeSentiment(text)
  ]);
  
  return { analysis, translation, sentiment };
});

// 使用 Promise.race 设置超时
commander.on('text', async (segment, context) => {
  const result = await Promise.race([
    processText(segment.data.text),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('超时')), 5000)
    )
  ]);
  
  return result;
});
```

这些优化技术可以显著提升 OneBot Commander 的性能。记住要根据实际使用场景选择合适的优化策略，并持续监控性能指标。 