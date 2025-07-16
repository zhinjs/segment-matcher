# 剩余参数

剩余参数是 OneBot Commander 的高级功能，允许你捕获模式匹配后剩余的所有消息段。

## 基本概念

### 什么是剩余参数

剩余参数使用 `...` 语法，可以捕获模式匹配后剩余的所有消息段：

```typescript
const commander = new Commander('command [...rest]');
// 匹配: "command arg1 arg2 arg3" -> { rest: ['arg1', 'arg2', 'arg3'] }
```

语法格式：`[...参数名]` 或 `[...参数名:类型]`

### 基本用法

```typescript
// 通用剩余参数
const commander = new Commander('echo [...args]');

const segments = [
  { type: 'text', data: { text: 'echo hello world' } }
];

const result = commander.match(segments);
// result[0] = { args: ['hello', 'world'] }
```

## 类型化剩余参数

### 指定类型的剩余参数

```typescript
// 只捕获文本类型的剩余参数
const commander = new Commander('text [...messages:text]');

const segments = [
  { type: 'text', data: { text: 'text' } },
  { type: 'text', data: { text: 'message1' } },
  { type: 'text', data: { text: 'message2' } },
  { type: 'face', data: { id: 1 } }
];

const result = commander.match(segments);
// result[0] = { messages: ['message1', 'message2'] }
// 剩余: [{ type: 'face', data: { id: 1 } }]
```

### 混合类型剩余参数

```typescript
// 捕获所有类型的剩余参数
const commander = new Commander('forward [...items]');

const segments = [
  { type: 'text', data: { text: 'forward' } },
  { type: 'text', data: { text: 'message' } },
  { type: 'face', data: { id: 1 } },
  { type: 'image', data: { file: 'img.jpg' } }
];

const result = commander.match(segments);
// result[0] = { 
//   items: [
//     { type: 'text', data: { text: 'message' } },
//     { type: 'face', data: { id: 1 } },
//     { type: 'image', data: { file: 'img.jpg' } }
//   ] 
// }
```

## 高级用法

### 组合必需参数和剩余参数

```typescript
// 必需参数 + 剩余参数
const commander = new Commander('process <action:text> [...data]');

const segments = [
  { type: 'text', data: { text: 'process upload' } },
  { type: 'text', data: { text: 'file1.txt' } },
  { type: 'text', data: { text: 'file2.txt' } }
];

const result = commander.match(segments);
// result[0] = { 
//   action: 'upload',
//   data: [
//     { type: 'text', data: { text: 'file1.txt' } },
//     { type: 'text', data: { text: 'file2.txt' } }
//   ] 
// }
```

### 多个剩余参数

```typescript
// 注意：一个模式中只能有一个剩余参数
const commander = new Commander('batch [...items] [...options]');
// 这是错误的语法，会抛出异常
```

### 剩余参数与可选参数

```typescript
// 可选参数 + 剩余参数
const commander = new Commander('search [query:text] [...filters]');

// 有查询条件
const segments1 = [
  { type: 'text', data: { text: 'search hello' } },
  { type: 'text', data: { text: 'filter1' } },
  { type: 'text', data: { text: 'filter2' } }
];
// result[0] = { query: 'hello', filters: ['filter1', 'filter2'] }

// 无查询条件
const segments2 = [
  { type: 'text', data: { text: 'search' } },
  { type: 'text', data: { text: 'filter1' } }
];
// result[0] = { filters: ['filter1'] }
```

## 实际应用示例

### 消息转发系统

```typescript
const forwardCommander = new Commander('forward [...messages]');

forwardCommander.action((params) => {
  const { messages = [] } = params;
  
  // 处理转发的消息
  return {
    type: 'forward',
    count: messages.length,
    messages: messages.map(msg => ({
      type: msg.type,
      data: msg.data
    }))
  };
});

// 使用示例
const segments = [
  { type: 'text', data: { text: 'forward' } },
  { type: 'text', data: { text: 'Hello' } },
  { type: 'face', data: { id: 1 } },
  { type: 'image', data: { file: 'photo.jpg' } }
];

const result = forwardCommander.match(segments);
// result[0] = {
//   type: 'forward',
//   count: 3,
//   messages: [
//     { type: 'text', data: { text: 'Hello' } },
//     { type: 'face', data: { id: 1 } },
//     { type: 'image', data: { file: 'photo.jpg' } }
//   ]
// }
```

### 批量处理系统

```typescript
const batchCommander = new Commander('batch <operation:text> [...items]');

batchCommander.action(async (params) => {
  const { operation, items = [] } = params;
  
  const results = [];
  
  for (const item of items) {
    try {
      let result;
      switch (operation) {
        case 'process':
          result = await processItem(item);
          break;
        case 'validate':
          result = await validateItem(item);
          break;
        case 'transform':
          result = await transformItem(item);
          break;
        default:
          throw new Error(`不支持的操作: ${operation}`);
      }
      results.push({ item, result, success: true });
    } catch (error) {
      results.push({ item, error: error.message, success: false });
    }
  }
  
  return {
    operation,
    total: items.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
});
```

### 搜索系统

```typescript
const searchCommander = new Commander('search <query:text> [...options]');

searchCommander.action(async (params) => {
  const { query, options = [] } = params;
  
  // 解析搜索选项
  const searchOptions = {};
  for (const option of options) {
    if (typeof option === 'string' && option.includes(':')) {
      const [key, value] = option.split(':');
      searchOptions[key] = value;
    }
  }
  
  // 执行搜索
  const results = await performSearch(query, searchOptions);
  
  return {
    query,
    options: searchOptions,
    results,
    count: results.length
  };
});
```

## 数据处理技巧

### 剩余参数过滤

```typescript
const commander = new Commander('filter [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 过滤空值
  const filtered = items.filter(item => {
    if (item.type === 'text') {
      return item.data.text && item.data.text.trim() !== '';
    }
    return true;
  });
  
  return {
    original: items.length,
    filtered: filtered.length,
    items: filtered
  };
});
```

### 剩余参数转换

```typescript
const commander = new Commander('convert [...values]');

commander.action((params) => {
  const { values = [] } = params;
  
  // 转换不同类型的值
  const converted = values.map(item => {
    if (item.type === 'text') {
      const text = item.data.text;
      
      // 尝试转换为数字
      if (!isNaN(text)) {
        return Number(text);
      }
      
      // 尝试转换为布尔值
      if (text.toLowerCase() === 'true') return true;
      if (text.toLowerCase() === 'false') return false;
      
      // 保持为字符串
      return text;
    }
    
    return item;
  });
  
  return { converted };
});
```

### 剩余参数分组

```typescript
const commander = new Commander('group [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 按类型分组
  const groups = {};
  
  for (const item of items) {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
  }
  
  return {
    groups,
    summary: Object.entries(groups).map(([type, items]) => ({
      type,
      count: items.length
    }))
  };
});
```

## 性能优化

### 延迟处理

```typescript
const commander = new Commander('lazy [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 返回处理函数，而不是立即处理
  return {
    items,
    process: async () => {
      const results = [];
      for (const item of items) {
        const result = await processItem(item);
        results.push(result);
      }
      return results;
    }
  };
});
```

### 流式处理

```typescript
const commander = new Commander('stream [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 创建流式处理器
  return {
    items,
    async *process() {
      for (const item of items) {
        const result = await processItem(item);
        yield result;
      }
    }
  };
});
```

## 错误处理

### 剩余参数验证

```typescript
const commander = new Commander('validate [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  const validationResults = [];
  
  for (const item of items) {
    try {
      // 验证每个项目
      const isValid = validateItem(item);
      validationResults.push({
        item,
        valid: isValid,
        error: null
      });
    } catch (error) {
      validationResults.push({
        item,
        valid: false,
        error: error.message
      });
    }
  }
  
  return {
    total: items.length,
    valid: validationResults.filter(r => r.valid).length,
    invalid: validationResults.filter(r => !r.valid).length,
    results: validationResults
  };
});
```

### 部分失败处理

```typescript
const commander = new Commander('safe [...items]');

commander.action(async (params) => {
  const { items = [] } = params;
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processItem(items[i]);
      results.push({ index: i, result });
    } catch (error) {
      errors.push({ index: i, error: error.message });
    }
  }
  
  return {
    total: items.length,
    success: results.length,
    failed: errors.length,
    results,
    errors
  };
});
```

## 调试技巧

### 剩余参数日志

```typescript
const commander = new Commander('debug [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  console.log('剩余参数数量:', items.length);
  console.log('剩余参数类型分布:');
  
  const typeCount = {};
  for (const item of items) {
    typeCount[item.type] = (typeCount[item.type] || 0) + 1;
  }
  
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  return {
    count: items.length,
    types: typeCount,
    items
  };
});
```

### 剩余参数分析

```typescript
function analyzeRestParams(items) {
  const analysis = {
    total: items.length,
    types: {},
    textLengths: [],
    hasImages: false,
    hasFiles: false
  };
  
  for (const item of items) {
    // 统计类型
    analysis.types[item.type] = (analysis.types[item.type] || 0) + 1;
    
    // 分析文本长度
    if (item.type === 'text') {
      analysis.textLengths.push(item.data.text.length);
    }
    
    // 检查特殊类型
    if (item.type === 'image') analysis.hasImages = true;
    if (item.type === 'file') analysis.hasFiles = true;
  }
  
  return analysis;
}

const commander = new Commander('analyze [...items]');
commander.action((params) => {
  return analyzeRestParams(params.items || []);
});
```

## 最佳实践

### 1. 合理使用剩余参数

```typescript
// ✅ 好的使用方式
const good = new Commander('forward [...messages]');
const good2 = new Commander('batch <operation:text> [...items]');

// ❌ 避免过度使用
const bad = new Commander('[...everything]'); // 过于宽泛
```

### 2. 类型安全

```typescript
// ✅ 指定类型以提高安全性
const safe = new Commander('text [...messages:text]');

// ❌ 不指定类型可能导致类型错误
const unsafe = new Commander('text [...messages]');
```

### 3. 性能考虑

```typescript
// ✅ 限制剩余参数数量
const commander = new Commander('process [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 限制处理数量
  if (items.length > 100) {
    throw new Error('项目数量过多，最多支持100个');
  }
  
  return processItems(items);
});
```

## 常见问题

### 1. 剩余参数位置

```typescript
// 剩余参数必须在最后
const commander = new Commander('command [...rest]<required:text>');
// 这是错误的语法
```

### 2. 多个剩余参数

```typescript
// 一个模式中只能有一个剩余参数
const commander = new Commander('command [...rest1][...rest2]');
// 这是错误的语法
```

### 3. 剩余参数为空

```typescript
const commander = new Commander('command [...rest]');

// 没有剩余参数时
const segments = [{ type: 'text', data: { text: 'command' } }];
const result = commander.match(segments);
// result[0] = { rest: [] }
```

## 下一步

- [默认值](/guide/default-values) - 了解默认值设置
- [自定义字段映射](/guide/custom-fields) - 学习自定义映射
- [错误处理](/api/errors) - 掌握错误处理机制
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>剩余参数是处理可变长度输入的有力工具，特别适用于批量操作和消息转发等场景。</p>
</div> 