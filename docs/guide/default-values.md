# 默认值

OneBot Commander 支持为可选参数设置默认值，当参数未提供时使用预设的值。

## 基本概念

### 什么是默认值

默认值允许你为可选参数指定一个预设值，当用户没有提供该参数时自动使用：

```typescript
const commander = new Commander('ping [count:number={value:1}]');
// 匹配: "ping " -> { count: { value: 1 } }
// 匹配: "ping 5" -> { count: 5 }
```

语法格式：`[参数名:类型={字段:值}]`

### 支持的数据类型

| 类型 | 默认值示例 | 说明 |
|------|------------|------|
| `text` | `[msg:text={text:hello}]` | 字符串默认值 |
| `number` | `[count:number={value:10}]` | 数字默认值 |
| `boolean` | `[flag:boolean={value:true}]` | 布尔默认值 |
| `face` | `[emoji:face={id:1}]` | 对象默认值 |

## 基础用法

### 文本默认值

```typescript
const commander = new Commander('echo [message:text={text:Hello World}]');

// 有参数
const segments1 = [
  { type: 'text', data: { text: 'echo Custom message' } }
];
const result1 = commander.match(segments1);
// result1[0] = { message: 'Custom message' }

// 无参数
const segments2 = [
  { type: 'text', data: { text: 'echo ' } }
];
const result2 = commander.match(segments2);
// result2[0] = { message: { text: 'Hello World' } }
```

### 数字默认值

```typescript
const commander = new Commander('count [limit:number={value:100}]');

// 有参数
const segments1 = [
  { type: 'text', data: { text: 'count 50' } }
];
const result1 = commander.match(segments1);
// result1[0] = { limit: 50 }

// 无参数
const segments2 = [
  { type: 'text', data: { text: 'count ' } }
];
const result2 = commander.match(segments2);
// result2[0] = { limit: { value: 100 } }
```

### 布尔默认值

```typescript
const commander = new Commander('toggle [state:boolean={value:true}]');

// 有参数
const segments1 = [
  { type: 'text', data: { text: 'toggle false' } }
];
const result1 = commander.match(segments1);
// result1[0] = { state: false }

// 无参数
const segments2 = [
  { type: 'text', data: { text: 'toggle ' } }
];
const result2 = commander.match(segments2);
// result2[0] = { state: { value: true } }
```

### 对象默认值

```typescript
const commander = new Commander('react [emoji:face={id:1}]');

// 有参数
const segments1 = [
  { type: 'text', data: { text: 'react ' } },
  { type: 'face', data: { id: 2 } }
];
const result1 = commander.match(segments1);
// result1[0] = { emoji: 2 }

// 无参数
const segments2 = [
  { type: 'text', data: { text: 'react ' } }
];
const result2 = commander.match(segments2);
// result2[0] = { emoji: { id: 1 } }
```

## 高级用法

### 多个默认值参数

```typescript
const commander = new Commander('config [theme:text={text:dark}] [size:number={value:12}] [debug:boolean={value:false}]');

// 部分参数
const segments1 = [
  { type: 'text', data: { text: 'config light' } }
];
const result1 = commander.match(segments1);
// result1[0] = { theme: 'light', size: 12, debug: false }

// 无参数
const segments2 = [
  { type: 'text', data: { text: 'config' } }
];
const result2 = commander.match(segments2);
// result2[0] = { theme: 'dark', size: 12, debug: false }
```

### 复杂对象默认值

```typescript
const commander = new Commander('user [settings:json={theme:"dark",lang:"zh"}]');

// 有自定义设置
const segments1 = [
  { type: 'text', data: { text: 'user' } },
  { type: 'json', data: { data: '{"theme":"light","lang":"en"}' } }
];
const result1 = commander.match(segments1);
// result1[0] = { settings: { theme: 'light', lang: 'en' } }

// 使用默认设置
const segments2 = [
  { type: 'text', data: { text: 'user' } }
];
const result2 = commander.match(segments2);
// result2[0] = { settings: { theme: 'dark', lang: 'zh' } }
```

### 条件默认值

```typescript
const commander = new Commander('search [query:text] [limit:number={value:10}]');

commander.action((params) => {
  const { query, limit } = params;
  
  // 根据查询类型设置不同的默认限制
  let actualLimit = limit;
  if (query && query.includes('*')) {
    actualLimit = Math.max(limit, 50); // 通配符查询使用更大的限制
  }
  
  return { query, limit: actualLimit };
});
```

## 实际应用示例

### 分页系统

```typescript
const pageCommander = new Commander('list [page:number={value:1}] [size:number={value:20}] [sort:text={value:id}]');

pageCommander.action(async (params) => {
  const { page, size, sort } = params;
  
  // 验证参数
  const validPage = Math.max(1, page);
  const validSize = Math.min(100, Math.max(1, size));
  
  // 执行查询
  const results = await fetchData({
    page: validPage,
    size: validSize,
    sort: sort
  });
  
  return {
    page: validPage,
    size: validSize,
    sort,
    total: results.total,
    items: results.items
  };
});
```

### 配置系统

```typescript
const configCommander = new Commander('config [key:text] [value:text] [type:text={value:string}]');

configCommander.action(async (params) => {
  const { key, value, type } = params;
  
  if (!key) {
    // 显示所有配置
    return await getAllConfig();
  }
  
  if (!value) {
    // 显示特定配置
    return await getConfig(key);
  }
  
  // 设置配置
  let parsedValue = value;
  switch (type) {
    case 'number':
      parsedValue = Number(value);
      break;
    case 'boolean':
      parsedValue = value.toLowerCase() === 'true';
      break;
    case 'json':
      parsedValue = JSON.parse(value);
      break;
  }
  
  await setConfig(key, parsedValue);
  return { key, value: parsedValue, type };
});
```

### 搜索系统

```typescript
const searchCommander = new Commander('search [query:text] [fuzzy:boolean={value:true}] [limit:number={value:50}]');

searchCommander.action(async (params) => {
  const { query, fuzzy, limit } = params;
  
  if (!query) {
    return { error: '搜索查询不能为空' };
  }
  
  const results = await performSearch({
    query,
    fuzzy,
    limit,
    includeMetadata: true
  });
  
  return {
    query,
    fuzzy,
    limit,
    results: results.items,
    total: results.total,
    time: results.time
  };
});
```

## 默认值处理技巧

### 动态默认值

```typescript
const commander = new Commander('time [format:text={value:local}]');

commander.action((params) => {
  const { format } = params;
  
  const now = new Date();
  let result;
  
  switch (format) {
    case 'utc':
      result = now.toUTCString();
      break;
    case 'iso':
      result = now.toISOString();
      break;
    case 'local':
    default:
      result = now.toLocaleString();
      break;
  }
  
  return { format, time: result };
});
```

### 环境相关默认值

```typescript
const commander = new Commander('log [level:text={value:info}] [output:text={value:console}]');

commander.action((params) => {
  const { level, output } = params;
  
  // 根据环境调整默认值
  const isProduction = process.env.NODE_ENV === 'production';
  const actualLevel = isProduction && level === 'debug' ? 'info' : level;
  const actualOutput = isProduction && output === 'console' ? 'file' : output;
  
  return {
    level: actualLevel,
    output: actualOutput,
    environment: process.env.NODE_ENV || 'development'
  };
});
```

### 用户偏好默认值

```typescript
class UserPreferences {
  constructor() {
    this.preferences = new Map();
  }
  
  setPreference(userId, key, value) {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, {});
    }
    this.preferences.get(userId)[key] = value;
  }
  
  getPreference(userId, key, defaultValue) {
    const userPrefs = this.preferences.get(userId);
    return userPrefs ? userPrefs[key] : defaultValue;
  }
}

const userPrefs = new UserPreferences();

const commander = new Commander('theme [color:text={value:blue}] [size:text={value:medium}]');

commander.action((params, ...remaining) => {
  const { color, size } = params;
  const userId = extractUserId(remaining);
  
  // 获取用户偏好，如果没有则使用默认值
  const userColor = userPrefs.getPreference(userId, 'theme.color', color);
  const userSize = userPrefs.getPreference(userId, 'theme.size', size);
  
  // 保存用户偏好
  userPrefs.setPreference(userId, 'theme.color', userColor);
  userPrefs.setPreference(userId, 'theme.size', userSize);
  
  return { color: userColor, size: userSize, userId };
});
```

## 错误处理

### 默认值验证

```typescript
const commander = new Commander('validate [value:number={value:0}] [min:number={value:0}] [max:number={value:100}]');

commander.action((params) => {
  const { value, min, max } = params;
  
  // 验证默认值是否合理
  if (min > max) {
    throw new Error('最小值不能大于最大值');
  }
  
  if (value < min || value > max) {
    throw new Error(`值 ${value} 超出范围 [${min}, ${max}]`);
  }
  
  return {
    value,
    min,
    max,
    valid: true,
    message: '验证通过'
  };
});
```

### 类型转换错误

```typescript
const commander = new Commander('convert [value:text={value:0}] [type:text={value:number}]');

commander.action((params) => {
  const { value, type } = params;
  
  try {
    let converted;
    switch (type) {
      case 'number':
        converted = Number(value);
        if (isNaN(converted)) {
          throw new Error('无法转换为数字');
        }
        break;
      case 'boolean':
        converted = value.toLowerCase() === 'true';
        break;
      case 'json':
        converted = JSON.parse(value);
        break;
      default:
        converted = value;
    }
    
    return {
      original: value,
      converted,
      type,
      success: true
    };
  } catch (error) {
    return {
      original: value,
      error: error.message,
      type,
      success: false
    };
  }
});
```

## 性能优化

### 默认值缓存

```typescript
const defaultValueCache = new Map();

function getDefaultValue(type, value) {
  const key = `${type}:${value}`;
  
  if (!defaultValueCache.has(key)) {
    let parsed;
    switch (type) {
      case 'number':
        parsed = Number(value);
        break;
      case 'boolean':
        parsed = value.toLowerCase() === 'true';
        break;
      case 'json':
        parsed = JSON.parse(value);
        break;
      default:
        parsed = value;
    }
    defaultValueCache.set(key, parsed);
  }
  
  return defaultValueCache.get(key);
}

const commander = new Commander('cached [value:number={value:100}]');
commander.action((params) => {
  const defaultValue = getDefaultValue('number', '100');
  return { value: params.value || defaultValue };
});
```

### 延迟计算默认值

```typescript
const commander = new Commander('lazy [timestamp:number]');

commander.action((params) => {
  const { timestamp } = params;
  
  // 只在需要时计算时间戳
  const actualTimestamp = timestamp || Date.now();
  
  return {
    timestamp: actualTimestamp,
    date: new Date(actualTimestamp).toISOString()
  };
});
```

## 调试技巧

### 默认值日志

```typescript
const commander = new Commander('debug [level:text={value:info}] [verbose:boolean={value:false}]');

commander.action((params) => {
  const { level, verbose } = params;
  
  console.log('参数:', params);
  console.log('使用的默认值:');
  console.log(`  level: ${level} (默认: info)`);
  console.log(`  verbose: ${verbose} (默认: false)`);
  
  return {
    level,
    verbose,
    timestamp: Date.now(),
    message: '调试信息已记录'
  };
});
```

### 默认值验证工具

```typescript
function validateDefaultValues(pattern) {
  const defaultValueRegex = /\[([^:]+):([^=]+)=([^\]]+)\]/g;
  const matches = pattern.match(defaultValueRegex);
  
  if (matches) {
    console.log('发现默认值:');
    matches.forEach(match => {
      const [, name, type, defaultValue] = match.match(/\[([^:]+):([^=]+)=([^\]]+)\]/);
      console.log(`  参数: ${name}, 类型: ${type}, 默认值: ${defaultValue}`);
      
      // 验证默认值类型
      try {
        switch (type) {
          case 'number':
            if (isNaN(Number(defaultValue))) {
              console.warn(`    警告: 默认值 "${defaultValue}" 无法转换为数字`);
            }
            break;
          case 'boolean':
            if (!['true', 'false'].includes(defaultValue.toLowerCase())) {
              console.warn(`    警告: 默认值 "${defaultValue}" 不是有效的布尔值`);
            }
            break;
          case 'json':
            JSON.parse(defaultValue);
            break;
        }
      } catch (error) {
        console.error(`    错误: 默认值 "${defaultValue}" 类型验证失败:`, error.message);
      }
    });
  }
  
  return matches;
}

// 使用示例
validateDefaultValues('command [count:number={value:10}] [flag:boolean={value:true}] [data:json={"key":"value"}]');
```

## 最佳实践

### 1. 合理的默认值

```typescript
// ✅ 好的默认值
const good = new Commander('ping [count:number={value:1}]');
const good2 = new Commander('config [theme:text={text:dark}]');

// ❌ 避免不合理的默认值
const bad = new Commander('delete [confirm:boolean={value:true}]'); // 危险操作不应默认为 true
const bad2 = new Commander('limit [max:number={value:999999}]'); // 默认值过大
```

### 2. 类型一致性

```typescript
// ✅ 类型一致的默认值
const good = new Commander('number [value:number={value:0}]');
const good2 = new Commander('text [message:text={text:hello}]');

// ❌ 类型不一致
const bad = new Commander('number [value:number={value:abc}]'); // 数字类型使用字符串默认值
```

### 3. 用户友好

```typescript
// ✅ 用户友好的默认值
const good = new Commander('search [query:text] [limit:number={value:20}]');

// ❌ 不友好的默认值
const bad = new Commander('search [query:text] [limit:number={value:1}]'); // 限制过小
```

## 常见问题

### 1. 默认值中的特殊字符

```typescript
// 问题：默认值包含特殊字符
const commander = new Commander('echo [msg:text={text:Hello, World!}]');
// 这会导致解析错误

// 解决方案：使用转义或 JSON 格式
const commander = new Commander('echo [msg:text={text:Hello\\, World!}]');
// 或者
const commander = new Commander('echo [msg:text={text:Hello World}]');
```

### 2. 复杂对象默认值

```typescript
// 问题：复杂对象默认值
const commander = new Commander('config [settings:json={theme:"dark",size:12}]');
// 这可能导致解析问题

// 解决方案：使用简单的默认值
const commander = new Commander('config [theme:text={text:dark}] [size:number={value:12}]');
```

### 3. 动态默认值

```typescript
// 注意：模式中的默认值是静态的，不能在运行时动态计算
const commander = new Commander('time [format:text={value:local}]');

// 如果需要动态默认值，在回调函数中处理
commander.action((params) => {
  const { format } = params;
  const actualFormat = format || getCurrentTimeFormat(); // 动态获取默认值
  return getTime(actualFormat);
});
```

## 下一步

- [自定义字段映射](/guide/custom-fields) - 学习自定义映射
- [错误处理](/api/errors) - 掌握错误处理机制
- [类型定义](/api/types) - 了解类型系统
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>默认值可以大大改善用户体验，减少用户输入，但要注意设置合理且安全的默认值。</p>
</div> 