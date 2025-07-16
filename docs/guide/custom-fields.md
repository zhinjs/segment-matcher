# 自定义字段映射

OneBot Commander 允许你自定义消息段数据字段的映射关系，以适应不同的数据格式和需求。

## 基本概念

### 什么是字段映射

字段映射定义了如何从消息段的数据对象中提取值。默认情况下，OneBot Commander 使用预定义的映射关系：

```typescript
const DEFAULT_MAPPING = {
  text: 'text',
  face: 'id',
  image: ['file', 'url'],
  at: 'user_id',
  // ... 其他类型
};
```

### 自定义映射的作用

通过自定义映射，你可以：

1. 适配不同的数据格式
2. 支持自定义字段名
3. 处理多字段匹配
4. 兼容第三方数据格式

## 默认映射

### 标准映射关系

```typescript
const DEFAULT_MAPPING = {
  text: 'text',           // data.text
  face: 'id',             // data.id
  image: ['file', 'url'], // data.file 或 data.url
  voice: 'file',          // data.file
  video: 'file',          // data.file
  file: 'file',           // data.file
  at: 'user_id',          // data.user_id
  reply: 'id',            // data.id
  forward: 'id',          // data.id
  json: 'data',           // data.data
  xml: 'data',            // data.data
  card: 'data'            // data.data
};
```

### 多字段映射

某些类型支持多个字段映射，按优先级匹配：

```typescript
// 图片类型支持 file 和 url 字段
const imageMapping = ['file', 'url'];

// 匹配顺序：
// 1. 首先尝试 data.file
// 2. 如果不存在，尝试 data.url
// 3. 如果都不存在，匹配失败
```

## 自定义映射

### 基本用法

```typescript
// 自定义字段映射
const customMapping = {
  image: 'src',      // 只匹配 data.src
  face: 'face_id',   // 匹配 data.face_id
  text: 'content'    // 匹配 data.content
};

const commander = new Commander('{image:avatar.png}<name:text>', customMapping);

const segments = [
  { type: 'image', data: { src: 'avatar.png' } },
  { type: 'text', data: { content: 'Alice' } }
];

const result = commander.match(segments);
// result[0] = { name: 'Alice' }
```

### 覆盖默认映射

```typescript
// 只覆盖需要的字段，其他使用默认值
const partialMapping = {
  image: 'src',  // 自定义图片字段
  // 其他字段使用默认映射
};

const commander = new Commander('{image:photo.jpg}<caption:text>', partialMapping);
```

### 多字段自定义映射

```typescript
// 自定义多字段映射
const multiFieldMapping = {
  image: ['src', 'url', 'path'],  // 按优先级匹配
  file: ['path', 'file', 'name'], // 自定义文件字段
  text: 'content'                 // 自定义文本字段
};

const commander = new Commander('{image:photo.jpg}<name:text>', multiFieldMapping);

// 匹配 data.src
const segments1 = [
  { type: 'image', data: { src: 'photo.jpg' } },
  { type: 'text', data: { content: 'Alice' } }
];

// 匹配 data.url
const segments2 = [
  { type: 'image', data: { url: 'photo.jpg' } },
  { type: 'text', data: { content: 'Alice' } }
];

// 匹配 data.path
const segments3 = [
  { type: 'image', data: { path: 'photo.jpg' } },
  { type: 'text', data: { content: 'Alice' } }
];
```

## 实际应用示例

### 适配第三方数据格式

```typescript
// 适配微信数据格式
const wechatMapping = {
  text: 'content',
  image: 'media_id',
  voice: 'media_id',
  video: 'media_id',
  file: 'media_id',
  at: 'user_id'
};

const wechatCommander = new Commander('{text:hello}<name:text>', wechatMapping);

const wechatSegments = [
  { type: 'text', data: { content: 'hello Alice' } }
];

const result = wechatCommander.match(wechatSegments);
// result[0] = { name: 'Alice' }
```

### 适配 QQ 数据格式

```typescript
// 适配 QQ 数据格式
const qqMapping = {
  text: 'text',
  face: 'face_id',
  image: 'file_id',
  at: 'qq'
};

const qqCommander = new Commander('{face:1}<message:text>', qqMapping);

const qqSegments = [
  { type: 'face', data: { face_id: 1 } },
  { type: 'text', data: { text: 'Hello' } }
];

const result = qqCommander.match(qqSegments);
// result[0] = { message: 'Hello' }
```

### 适配自定义数据格式

```typescript
// 适配自定义数据格式
const customDataMapping = {
  text: 'value',
  image: 'source',
  face: 'emoji_id',
  at: 'target_user',
  file: 'attachment'
};

const customCommander = new Commander('{image:avatar.png}<user:text>', customDataMapping);

const customSegments = [
  { type: 'image', data: { source: 'avatar.png' } },
  { type: 'text', data: { value: 'Alice' } }
];

const result = customCommander.match(customSegments);
// result[0] = { user: 'Alice' }
```

## 高级用法

### 动态字段映射

```typescript
class DynamicMapping {
  constructor() {
    this.mappings = new Map();
  }
  
  setMapping(platform, mapping) {
    this.mappings.set(platform, mapping);
  }
  
  getMapping(platform) {
    return this.mappings.get(platform) || DEFAULT_MAPPING;
  }
  
  createCommander(pattern, platform) {
    const mapping = this.getMapping(platform);
    return new Commander(pattern, mapping);
  }
}

const dynamicMapping = new DynamicMapping();

// 设置不同平台的映射
dynamicMapping.setMapping('wechat', {
  text: 'content',
  image: 'media_id',
  at: 'user_id'
});

dynamicMapping.setMapping('qq', {
  text: 'text',
  face: 'face_id',
  image: 'file_id'
});

// 根据平台创建命令解析器
const wechatCommander = dynamicMapping.createCommander('{text:hello}<name:text>', 'wechat');
const qqCommander = dynamicMapping.createCommander('{text:hello}<name:text>', 'qq');
```

### 条件字段映射

```typescript
function createConditionalMapping(condition) {
  const baseMapping = {
    text: 'text',
    image: 'file'
  };
  
  if (condition.useCustomFields) {
    return {
      ...baseMapping,
      text: 'content',
      image: 'src'
    };
  }
  
  return baseMapping;
}

// 根据条件创建不同的映射
const mapping1 = createConditionalMapping({ useCustomFields: false });
const mapping2 = createConditionalMapping({ useCustomFields: true });

const commander1 = new Commander('{text:hello}<name:text>', mapping1);
const commander2 = new Commander('{text:hello}<name:text>', mapping2);
```

### 嵌套字段映射

```typescript
// 支持嵌套字段访问
const nestedMapping = {
  text: 'data.text',
  image: 'data.file',
  face: 'data.emoji.id'
};

// 注意：这需要自定义字段访问逻辑
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// 创建支持嵌套字段的命令解析器
class NestedCommander extends Commander {
  constructor(pattern, mapping) {
    super(pattern, mapping);
    this.nestedMapping = mapping;
  }
  
  getFieldValue(segment, fieldPath) {
    return getNestedValue(segment.data, fieldPath);
  }
}
```

## 错误处理

### 字段映射验证

```typescript
function validateMapping(mapping) {
  const errors = [];
  
  for (const [type, field] of Object.entries(mapping)) {
    if (typeof field === 'string') {
      // 验证字符串字段
      if (!field.trim()) {
        errors.push(`${type}: 字段名不能为空`);
      }
    } else if (Array.isArray(field)) {
      // 验证数组字段
      if (field.length === 0) {
        errors.push(`${type}: 字段数组不能为空`);
      }
      for (const f of field) {
        if (typeof f !== 'string' || !f.trim()) {
          errors.push(`${type}: 字段名必须是有效字符串`);
        }
      }
    } else {
      errors.push(`${type}: 字段映射必须是字符串或数组`);
    }
  }
  
  return errors;
}

// 使用示例
const mapping = {
  text: 'content',
  image: ['src', 'url'],
  face: ''  // 错误：空字段名
};

const errors = validateMapping(mapping);
if (errors.length > 0) {
  console.error('字段映射错误:', errors);
}
```

### 字段不存在处理

```typescript
function createSafeMapping(baseMapping, fallbackValue = null) {
  const safeMapping = {};
  
  for (const [type, field] of Object.entries(baseMapping)) {
    if (Array.isArray(field)) {
      // 多字段映射，添加安全访问
      safeMapping[type] = field.map(f => ({
        field: f,
        fallback: fallbackValue
      }));
    } else {
      // 单字段映射
      safeMapping[type] = {
        field: field,
        fallback: fallbackValue
      };
    }
  }
  
  return safeMapping;
}

// 使用安全映射
const safeMapping = createSafeMapping({
  text: 'content',
  image: ['src', 'url']
}, '');

// 在匹配时处理字段不存在的情况
function safeGetValue(segment, fieldConfig) {
  if (Array.isArray(fieldConfig)) {
    // 多字段配置
    for (const config of fieldConfig) {
      const value = segment.data[config.field];
      if (value !== undefined) {
        return value;
      }
    }
    return fieldConfig[0].fallback;
  } else {
    // 单字段配置
    return segment.data[fieldConfig.field] ?? fieldConfig.fallback;
  }
}
```

## 性能优化

### 映射缓存

```typescript
const mappingCache = new Map();

function getCachedMapping(mapping) {
  const key = JSON.stringify(mapping);
  
  if (!mappingCache.has(key)) {
    mappingCache.set(key, mapping);
  }
  
  return mappingCache.get(key);
}

// 使用缓存的映射
const mapping = getCachedMapping({
  text: 'content',
  image: 'src'
});

const commander = new Commander('{text:hello}<name:text>', mapping);
```

### 预编译映射

```typescript
class PrecompiledMapping {
  constructor(mapping) {
    this.mapping = mapping;
    this.compiled = this.compile(mapping);
  }
  
  compile(mapping) {
    const compiled = {};
    
    for (const [type, field] of Object.entries(mapping)) {
      if (Array.isArray(field)) {
        // 预编译多字段访问
        compiled[type] = field.map(f => `data.${f}`);
      } else {
        // 预编译单字段访问
        compiled[type] = `data.${field}`;
      }
    }
    
    return compiled;
  }
  
  getValue(segment, type) {
    const path = this.compiled[type];
    if (!path) return undefined;
    
    if (Array.isArray(path)) {
      // 多字段路径
      for (const p of path) {
        const value = this.evaluatePath(segment, p);
        if (value !== undefined) {
          return value;
        }
      }
      return undefined;
    } else {
      // 单字段路径
      return this.evaluatePath(segment, path);
    }
  }
  
  evaluatePath(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
```

## 调试技巧

### 映射调试

```typescript
function debugMapping(mapping, segments) {
  console.log('字段映射:', mapping);
  console.log('消息段:', segments);
  
  for (const segment of segments) {
    const fieldConfig = mapping[segment.type];
    if (fieldConfig) {
      console.log(`类型 ${segment.type}:`);
      
      if (Array.isArray(fieldConfig)) {
        for (const field of fieldConfig) {
          const value = segment.data[field];
          console.log(`  字段 ${field}: ${value} (${typeof value})`);
        }
      } else {
        const value = segment.data[fieldConfig];
        console.log(`  字段 ${fieldConfig}: ${value} (${typeof value})`);
      }
    } else {
      console.log(`类型 ${segment.type}: 无映射配置`);
    }
  }
}

// 使用示例
const mapping = {
  text: 'content',
  image: ['src', 'url']
};

const segments = [
  { type: 'text', data: { content: 'hello' } },
  { type: 'image', data: { src: 'photo.jpg' } }
];

debugMapping(mapping, segments);
```

### 映射测试

```typescript
function testMapping(mapping, testCases) {
  const results = [];
  
  for (const testCase of testCases) {
    const { type, data, expectedField, expectedValue } = testCase;
    
    const fieldConfig = mapping[type];
    let actualValue = undefined;
    
    if (fieldConfig) {
      if (Array.isArray(fieldConfig)) {
        for (const field of fieldConfig) {
          if (data[field] !== undefined) {
            actualValue = data[field];
            break;
          }
        }
      } else {
        actualValue = data[fieldConfig];
      }
    }
    
    const success = actualValue === expectedValue;
    results.push({
      type,
      expectedField,
      expectedValue,
      actualValue,
      success
    });
  }
  
  return results;
}

// 使用示例
const mapping = {
  text: 'content',
  image: ['src', 'url']
};

const testCases = [
  {
    type: 'text',
    data: { content: 'hello' },
    expectedField: 'content',
    expectedValue: 'hello'
  },
  {
    type: 'image',
    data: { src: 'photo.jpg' },
    expectedField: 'src',
    expectedValue: 'photo.jpg'
  }
];

const results = testMapping(mapping, testCases);
console.log('映射测试结果:', results);
```

## 最佳实践

### 1. 保持一致性

```typescript
// ✅ 一致的映射命名
const consistentMapping = {
  text: 'content',
  image: 'source',
  voice: 'source',
  video: 'source'
};

// ❌ 不一致的映射命名
const inconsistentMapping = {
  text: 'content',
  image: 'src',
  voice: 'file',
  video: 'path'
};
```

### 2. 向后兼容

```typescript
// ✅ 向后兼容的映射
const compatibleMapping = {
  text: ['content', 'text'],  // 支持新旧字段名
  image: ['src', 'file', 'url']  // 支持多种字段名
};

// ❌ 破坏性变更
const breakingMapping = {
  text: 'content',  // 只支持新字段名
  image: 'src'      // 只支持新字段名
};
```

### 3. 文档化映射

```typescript
// ✅ 文档化的映射
const documentedMapping = {
  // 文本消息：从 data.content 字段获取文本内容
  text: 'content',
  
  // 图片消息：优先从 data.src 获取，其次从 data.url 获取
  image: ['src', 'url'],
  
  // 表情消息：从 data.emoji_id 字段获取表情 ID
  face: 'emoji_id'
};

// ❌ 未文档化的映射
const undocumentedMapping = {
  text: 'content',
  image: ['src', 'url'],
  face: 'emoji_id'
};
```

## 常见问题

### 1. 字段名冲突

```typescript
// 问题：不同平台使用相同的字段名但含义不同
const conflictMapping = {
  text: 'id',    // 微信：消息 ID
  face: 'id'     // QQ：表情 ID
};

// 解决方案：使用更具体的字段名
const resolvedMapping = {
  text: 'message_id',
  face: 'emoji_id'
};
```

### 2. 多字段优先级

```typescript
// 问题：多字段映射的优先级不明确
const unclearMapping = {
  image: ['file', 'url', 'src']
};

// 解决方案：明确优先级并文档化
const clearMapping = {
  // 图片字段优先级：file > url > src
  image: ['file', 'url', 'src']
};
```

### 3. 字段类型不匹配

```typescript
// 问题：字段值类型与期望不匹配
const typeMismatchMapping = {
  face: 'id'  // 期望数字，但实际是字符串
};

// 解决方案：在回调函数中处理类型转换
commander.action((params) => {
  const faceId = typeof params.face === 'string' 
    ? parseInt(params.face, 10) 
    : params.face;
  
  return { faceId };
});
```

## 下一步

- [错误处理](/api/errors) - 掌握错误处理机制
- [类型定义](/api/types) - 了解类型系统
- [PatternParser](/api/pattern-parser) - 学习模式解析器
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>自定义字段映射是适配不同数据格式的强大工具，合理使用可以提高代码的灵活性和兼容性。</p>
</div> 