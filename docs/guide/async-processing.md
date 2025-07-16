# 异步处理

OneBot Commander 完全支持异步处理，允许你在回调函数中使用 `async/await` 语法处理异步操作。

## 基本用法

### 异步回调函数

```typescript
const commander = new Commander('async <id:number>');

commander.action(async (params) => {
  // 异步获取数据
  const data = await fetchData(params.id);
  return data;
});
```

### 异步匹配

使用 `matchAsync` 方法进行异步匹配：

```typescript
const segments = [
  { type: 'text', data: { text: 'async 123' } }
];

// 异步匹配
const result = await commander.matchAsync(segments);
console.log(result);
```

## 异步链式回调

### 完整的异步流水线

```typescript
const commander = new Commander('process <data:text>');

commander
  .action(async (params) => {
    // 步骤1: 异步验证
    const validated = await validateData(params.data);
    return validated;
  })
  .action(async (validated) => {
    // 步骤2: 异步处理
    const processed = await processData(validated);
    return processed;
  })
  .action(async (processed) => {
    // 步骤3: 异步保存
    const saved = await saveData(processed);
    return saved;
  })
  .action(async (saved) => {
    // 步骤4: 异步通知
    await sendNotification(saved);
    return { success: true, data: saved };
  });
```

### 混合同步和异步

```typescript
commander
  .action((params) => {
    // 同步验证
    if (!params.data) {
      throw new Error('数据不能为空');
    }
    return params.data;
  })
  .action(async (data) => {
    // 异步处理
    const processed = await processData(data);
    return processed;
  })
  .action((processed) => {
    // 同步格式化
    return formatResult(processed);
  })
  .action(async (formatted) => {
    // 异步发送
    await sendResult(formatted);
    return formatted;
  });
```

## 错误处理

### 异步错误捕获

```typescript
const commander = new Commander('safe <id:number>');

commander.action(async (params) => {
  try {
    const data = await fetchData(params.id);
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    return { error: error.message };
  }
});

// 调用时也需要处理异步错误
try {
  const result = await commander.matchAsync(segments);
  console.log(result);
} catch (error) {
  console.error('处理失败:', error);
}
```

### 错误恢复

```typescript
commander
  .action(async (params) => {
    try {
      return await fetchData(params.id);
    } catch (error) {
      // 使用缓存数据作为备选
      return await getCachedData(params.id);
    }
  })
  .action(async (data) => {
    if (data.error) {
      // 处理错误情况
      return { status: 'error', message: data.error };
    }
    return await processData(data);
  });
```

## 高级异步模式

### 并行处理

```typescript
const commander = new Commander('parallel <ids:text>');

commander.action(async (params) => {
  const ids = params.ids.split(',').map(id => parseInt(id.trim()));
  
  // 并行获取多个数据
  const promises = ids.map(id => fetchData(id));
  const results = await Promise.all(promises);
  
  return results;
});
```

### 条件异步处理

```typescript
const commander = new Commander('conditional <type:text> <data:text>');

commander.action(async (params) => {
  const { type, data } = params;
  
  // 根据类型选择不同的异步处理
  switch (type) {
    case 'user':
      return await processUserData(data);
    case 'product':
      return await processProductData(data);
    case 'order':
      return await processOrderData(data);
    default:
      throw new Error(`不支持的类型: ${type}`);
  }
});
```

### 重试机制

```typescript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`重试 ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

const commander = new Commander('retry <id:number>');

commander.action(async (params) => {
  return await withRetry(async () => {
    return await fetchData(params.id);
  });
});
```

## 性能优化

### 缓存异步结果

```typescript
const cache = new Map();

const commander = new Commander('cached <id:number>');

commander.action(async (params) => {
  const { id } = params;
  
  // 检查缓存
  if (cache.has(id)) {
    const cached = cache.get(id);
    if (Date.now() - cached.timestamp < 60000) { // 1分钟缓存
      return cached.data;
    }
  }
  
  // 获取新数据
  const data = await fetchData(id);
  
  // 更新缓存
  cache.set(id, {
    data,
    timestamp: Date.now()
  });
  
  return data;
});
```

### 批量异步处理

```typescript
const commander = new Commander('batch [...items:text]');

commander.action(async (params) => {
  const { items = [] } = params;
  
  // 分批处理，避免同时发起太多请求
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(item => processItem(item));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
});
```

### 超时控制

```typescript
async function withTimeout(promise, timeout = 5000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('操作超时')), timeout);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

const commander = new Commander('timeout <id:number>');

commander.action(async (params) => {
  return await withTimeout(
    fetchData(params.id),
    3000 // 3秒超时
  );
});
```

## 实际应用示例

### 用户管理系统

```typescript
const userCommander = new Commander('user <action:text> <id:number> [data:text]');

userCommander
  .action(async (params) => {
    const { action, id, data } = params;
    
    switch (action) {
      case 'get':
        return await getUser(id);
      case 'update':
        const userData = JSON.parse(data);
        return await updateUser(id, userData);
      case 'delete':
        return await deleteUser(id);
      default:
        throw new Error(`不支持的操作: ${action}`);
    }
  })
  .action(async (result) => {
    // 记录操作日志
    await logUserAction(result);
    return result;
  })
  .action(async (result) => {
    // 发送通知
    await sendUserNotification(result);
    return result;
  });
```

### 文件处理系统

```typescript
const fileCommander = new Commander('file <action:text> <path:text> [content:text]');

fileCommander
  .action(async (params) => {
    const { action, path, content } = params;
    
    switch (action) {
      case 'read':
        return await readFile(path);
      case 'write':
        return await writeFile(path, content);
      case 'delete':
        return await deleteFile(path);
      case 'copy':
        const [source, target] = path.split('->').map(p => p.trim());
        return await copyFile(source, target);
      default:
        throw new Error(`不支持的操作: ${action}`);
    }
  })
  .action(async (result) => {
    // 更新文件索引
    await updateFileIndex(result);
    return result;
  });
```

### API 代理

```typescript
const apiCommander = new Commander('api <method:text> <url:text> [body:text]');

apiCommander
  .action(async (params) => {
    const { method, url, body } = params;
    
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = body;
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  })
  .action(async (result) => {
    // 缓存响应
    if (result.status === 200) {
      await cacheResponse(result);
    }
    return result;
  });
```

## 调试技巧

### 异步调试

```typescript
function withAsyncLogging(fn, name) {
  return async (...args) => {
    console.log(`${name} 开始执行`);
    const start = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      console.log(`${name} 执行成功，耗时: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`${name} 执行失败，耗时: ${duration}ms`, error);
      throw error;
    }
  };
}

const commander = new Commander('debug <id:number>');

commander
  .action(withAsyncLogging(async (params) => {
    return await fetchData(params.id);
  }, '获取数据'))
  .action(withAsyncLogging(async (data) => {
    return await processData(data);
  }, '处理数据'));
```

### 性能监控

```typescript
class AsyncPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  async measure(name, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name).push(duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${name} 执行失败，耗时: ${duration}ms`);
      throw error;
    }
  }
  
  getStats(name) {
    const durations = this.metrics.get(name) || [];
    if (durations.length === 0) return null;
    
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return { avg, min, max, count: durations.length };
  }
}

const monitor = new AsyncPerformanceMonitor();

const commander = new Commander('monitor <id:number>');

commander.action(async (params) => {
  return await monitor.measure('fetchData', () => fetchData(params.id));
});
```

## 最佳实践

### 1. 错误处理

```typescript
// ✅ 好的错误处理
commander.action(async (params) => {
  try {
    const data = await riskyOperation(params);
    return { success: true, data };
  } catch (error) {
    console.error('操作失败:', error);
    return { success: false, error: error.message };
  }
});

// ❌ 不好的错误处理
commander.action(async (params) => {
  const data = await riskyOperation(params); // 可能抛出异常
  return data;
});
```

### 2. 超时控制

```typescript
// ✅ 设置合理的超时
const commander = new Commander('timeout <id:number>');

commander.action(async (params) => {
  return await withTimeout(
    fetchData(params.id),
    5000 // 5秒超时
  );
});
```

### 3. 资源清理

```typescript
// ✅ 确保资源清理
commander.action(async (params) => {
  let connection;
  try {
    connection = await createConnection();
    const data = await connection.query(params.query);
    return data;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});
```

## 下一步

- [类型化字面量](/guide/typed-literals) - 学习高级匹配功能
- [剩余参数](/guide/rest-parameters) - 掌握剩余参数处理
- [默认值](/guide/default-values) - 了解默认值设置
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>异步处理是处理复杂业务逻辑的重要工具，合理使用可以提高应用的响应性和用户体验。</p>
</div> 