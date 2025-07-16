# 链式回调

链式回调是 OneBot Commander 的核心特性，它允许你将多个处理函数串联起来，形成处理流水线。

## 基本概念

### 什么是链式回调

链式回调允许你通过 `action()` 方法添加多个处理函数，这些函数会按顺序执行，前一个函数的返回值会作为下一个函数的输入。

```typescript
const commander = new Commander('echo <message:text>');

commander
  .action((params) => {
    // 第一个处理函数
    return params.message.toUpperCase();
  })
  .action((upperMessage) => {
    // 第二个处理函数，接收第一个函数的返回值
    return upperMessage.length;
  })
  .action((length) => {
    // 第三个处理函数，接收第二个函数的返回值
    console.log(`消息长度: ${length}`);
    return length;
  });
```

## 回调函数参数

### 参数结构

每个回调函数接收以下参数：

```typescript
function callback(params, ...remaining) {
  // params: 匹配到的参数对象
  // remaining: 剩余的消息段数组
}
```

### 参数示例

```typescript
const commander = new Commander('test<arg1:text>[arg2:face]');

commander.action((params, ...remaining) => {
  console.log('参数对象:', params);
  // 输出: { arg1: 'hello', arg2: { type: 'face', data: { id: 1 } } }
  
  console.log('剩余消息段:', remaining);
  // 输出: [{ type: 'text', data: { text: 'extra' } }]
  
  return params.arg1;
});
```

## 返回值处理

### 返回值传递

每个回调函数的返回值会传递给下一个回调函数：

```typescript
const commander = new Commander('process <text:text>');

commander
  .action((params) => {
    console.log('步骤1: 接收参数');
    return params.text;
  })
  .action((text) => {
    console.log('步骤2: 转换为大写');
    return text.toUpperCase();
  })
  .action((upperText) => {
    console.log('步骤3: 计算长度');
    return upperText.length;
  })
  .action((length) => {
    console.log('步骤4: 最终处理');
    return `处理完成，长度: ${length}`;
  });
```

### 返回值类型

回调函数可以返回任何类型的值：

```typescript
commander
  .action((params) => {
    // 返回字符串
    return 'hello';
  })
  .action((str) => {
    // 返回数字
    return str.length;
  })
  .action((num) => {
    // 返回对象
    return { length: num, doubled: num * 2 };
  })
  .action((obj) => {
    // 返回数组
    return [obj.length, obj.doubled];
  });
```

## 异步链式回调

### 异步函数支持

回调函数可以是异步函数，支持 `async/await`：

```typescript
const commander = new Commander('async <id:number>');

commander
  .action(async (params) => {
    console.log('步骤1: 异步获取数据');
    const data = await fetchData(params.id);
    return data;
  })
  .action(async (data) => {
    console.log('步骤2: 异步处理数据');
    const processed = await processData(data);
    return processed;
  })
  .action(async (processed) => {
    console.log('步骤3: 异步保存结果');
    const result = await saveResult(processed);
    return result;
  });
```

### 混合同步和异步

可以在同一个链中混合使用同步和异步函数：

```typescript
commander
  .action((params) => {
    // 同步处理
    console.log('同步步骤1');
    return params.id;
  })
  .action(async (id) => {
    // 异步处理
    console.log('异步步骤2');
    const data = await fetchData(id);
    return data;
  })
  .action((data) => {
    // 同步处理
    console.log('同步步骤3');
    return data.name;
  })
  .action(async (name) => {
    // 异步处理
    console.log('异步步骤4');
    const result = await saveName(name);
    return result;
  });
```

## 错误处理

### 异常传播

链式回调中的异常会向上传播：

```typescript
const commander = new Commander('error <text:text>');

commander
  .action((params) => {
    console.log('步骤1: 正常执行');
    return params.text;
  })
  .action((text) => {
    console.log('步骤2: 抛出异常');
    throw new Error('处理失败');
  })
  .action((result) => {
    // 这个函数不会执行，因为前一个函数抛出了异常
    console.log('步骤3: 不会执行');
    return result;
  });

// 调用时需要捕获异常
try {
  const result = commander.match(segments);
} catch (error) {
  console.error('链式回调异常:', error.message);
}
```

### 错误恢复

可以在回调函数中处理异常：

```typescript
commander
  .action((params) => {
    try {
      return processData(params.text);
    } catch (error) {
      console.error('处理失败，使用默认值');
      return 'default';
    }
  })
  .action((data) => {
    // 即使前一个函数出错，这个函数仍会执行
    return data.toUpperCase();
  });
```

## 高级用法

### 条件处理

根据参数或中间结果进行条件处理：

```typescript
const commander = new Commander('conditional <type:text> <value:text>');

commander
  .action((params) => {
    return { type: params.type, value: params.value };
  })
  .action((data) => {
    // 根据类型进行不同处理
    switch (data.type) {
      case 'text':
        return data.value.toUpperCase();
      case 'number':
        return Number(data.value) * 2;
      case 'json':
        return JSON.parse(data.value);
      default:
        throw new Error(`不支持的类型: ${data.type}`);
    }
  })
  .action((processed) => {
    return { result: processed, timestamp: Date.now() };
  });
```

### 数据转换流水线

创建数据转换流水线：

```typescript
const commander = new Commander('pipeline <data:text>');

commander
  .action((params) => {
    // 步骤1: 解析数据
    return JSON.parse(params.data);
  })
  .action((parsed) => {
    // 步骤2: 验证数据
    if (!parsed.name || !parsed.age) {
      throw new Error('数据格式不正确');
    }
    return parsed;
  })
  .action((validated) => {
    // 步骤3: 转换数据
    return {
      name: validated.name.toUpperCase(),
      age: validated.age,
      category: validated.age < 18 ? 'minor' : 'adult'
    };
  })
  .action((transformed) => {
    // 步骤4: 格式化输出
    return `${transformed.name} (${transformed.age}) - ${transformed.category}`;
  });
```

### 分支处理

根据条件创建不同的处理分支：

```typescript
function createCommander(type) {
  const commander = new Commander(`${type} <data:text>`);
  
  if (type === 'user') {
    commander
      .action((params) => ({ type: 'user', data: params.data }))
      .action((data) => processUserData(data))
      .action((processed) => saveUser(processed));
  } else if (type === 'product') {
    commander
      .action((params) => ({ type: 'product', data: params.data }))
      .action((data) => processProductData(data))
      .action((processed) => saveProduct(processed));
  }
  
  return commander;
}

const userCommander = createCommander('user');
const productCommander = createCommander('product');
```

## 性能优化

### 1. 避免不必要的计算

```typescript
commander
  .action((params) => {
    // 只在需要时进行昂贵计算
    if (params.needExpensive) {
      return expensiveCalculation(params.data);
    }
    return params.data;
  })
  .action((data) => {
    // 后续处理
    return processData(data);
  });
```

### 2. 缓存中间结果

```typescript
const cache = new Map();

commander
  .action((params) => {
    const key = params.id;
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = expensiveCalculation(params.data);
    cache.set(key, result);
    return result;
  })
  .action((cached) => {
    return processCachedData(cached);
  });
```

### 3. 并行处理

```typescript
commander
  .action(async (params) => {
    // 并行执行多个异步操作
    const [result1, result2, result3] = await Promise.all([
      asyncOperation1(params.data),
      asyncOperation2(params.data),
      asyncOperation3(params.data)
    ]);
    
    return { result1, result2, result3 };
  })
  .action((results) => {
    return combineResults(results);
  });
```

## 调试技巧

### 1. 添加日志

```typescript
commander
  .action((params) => {
    console.log('步骤1 输入:', params);
    const result = processStep1(params);
    console.log('步骤1 输出:', result);
    return result;
  })
  .action((input) => {
    console.log('步骤2 输入:', input);
    const result = processStep2(input);
    console.log('步骤2 输出:', result);
    return result;
  });
```

### 2. 性能监控

```typescript
function withTiming(fn, name) {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    console.log(`${name} 耗时: ${end - start}ms`);
    return result;
  };
}

commander
  .action(withTiming(async (params) => {
    return await expensiveOperation(params);
  }, '步骤1'))
  .action(withTiming(async (data) => {
    return await anotherExpensiveOperation(data);
  }, '步骤2'));
```

### 3. 错误追踪

```typescript
function withErrorHandling(fn, stepName) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`步骤 ${stepName} 出错:`, error);
      throw error;
    }
  };
}

commander
  .action(withErrorHandling(async (params) => {
    return await riskyOperation(params);
  }, '风险操作'))
  .action(withErrorHandling(async (data) => {
    return await anotherRiskyOperation(data);
  }, '另一个风险操作'));
```

## 最佳实践

### 1. 单一职责

每个回调函数应该只负责一个特定的任务：

```typescript
// ✅ 好的设计
commander
  .action((params) => validateInput(params))
  .action((validated) => processData(validated))
  .action((processed) => formatOutput(processed));

// ❌ 不好的设计
commander.action((params) => {
  // 一个函数做太多事情
  const validated = validateInput(params);
  const processed = processData(validated);
  return formatOutput(processed);
});
```

### 2. 错误处理

在每个可能出错的地方添加适当的错误处理：

```typescript
commander
  .action((params) => {
    try {
      return validateAndParse(params);
    } catch (error) {
      console.error('验证失败:', error);
      return { error: error.message };
    }
  })
  .action((data) => {
    if (data.error) {
      return { success: false, error: data.error };
    }
    return processData(data);
  });
```

### 3. 类型安全

使用 TypeScript 确保类型安全：

```typescript
interface Step1Result {
  id: number;
  name: string;
}

interface Step2Result {
  processed: boolean;
  data: Step1Result;
}

const commander = new Commander('typed <id:number> <name:text>');

commander
  .action((params): Step1Result => {
    return { id: params.id, name: params.name };
  })
  .action((data: Step1Result): Step2Result => {
    return { processed: true, data };
  });
```

## 下一步

- [异步处理](/guide/async-processing) - 深入了解异步回调
- [类型化字面量](/guide/typed-literals) - 学习高级匹配功能
- [剩余参数](/guide/rest-parameters) - 掌握剩余参数处理
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>链式回调是 OneBot Commander 的强大特性，合理使用可以创建清晰、可维护的处理流水线。</p>
</div> 