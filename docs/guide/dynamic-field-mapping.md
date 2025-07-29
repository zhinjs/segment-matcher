# 动态字段映射

动态字段映射是 OneBot Commander 的一个强大特性，允许你自定义消息段的字段提取逻辑，而不依赖硬编码的字段名。这个功能特别适用于适配不同消息平台的字段名差异。

## 🎯 概述

动态字段映射系统支持：

1. **自定义字段映射** - 替代默认的硬编码字段逻辑
2. **多字段优先级** - 支持多个字段按优先级尝试
3. **平台适配** - 轻松适配不同平台的字段名差异
4. **智能回退** - 未配置时自动回退到默认行为

## 🔧 默认字段映射

OneBot Commander 内置了以下默认字段映射：

```typescript
const DEFAULT_TYPED_LITERAL_FIELD_MAP = {
  text: 'text',              // 文本字段
  face: 'id',                // 表情ID字段
  image: ['file', 'url'],    // 图片字段（支持多字段）
  at: 'user_id',             // @用户字段
};
```

## 📝 基础用法

### 单字段映射

```typescript
import { Commander } from 'onebot-commander';

// 使用自定义字段映射
const commander = new Commander('发送图片 <img:image>', {
  image: 'src'  // 使用 'src' 字段而不是默认的 'file' 或 'url'
});

commander.action((params) => {
  console.log(`图片路径: ${params.img}`);
});

// 匹配示例
const segments = [
  { type: 'text', data: { text: '发送图片 ' } },
  { type: 'image', data: { src: 'photo.jpg', file: 'ignored.jpg' } }
];

commander.match(segments);
// ✅ 输出: 图片路径: photo.jpg (使用自定义的 'src' 字段)
```

### 多字段优先级映射

```typescript
// 支持多个字段按优先级尝试
const commander = new Commander('头像 <avatar:image>', {
  image: ['primary', 'secondary', 'file', 'url']  // 按优先级尝试
});

commander.action((params) => {
  console.log(`头像: ${params.avatar}`);
});

// 测试不同的字段组合
// 1. 优先字段存在
commander.match([
  { type: 'text', data: { text: '头像 ' } },
  { type: 'image', data: { secondary: 'avatar.jpg', file: 'backup.jpg' } }
]);
// ✅ 输出: 头像: avatar.jpg (使用 'secondary' 字段)

// 2. 只有低优先级字段
commander.match([
  { type: 'text', data: { text: '头像 ' } },
  { type: 'image', data: { file: 'fallback.jpg' } }
]);
// ✅ 输出: 头像: fallback.jpg (使用 'file' 字段)
```

## 🌐 平台适配示例

### QQ 平台适配

```typescript
// QQ 平台的字段映射
const qqCommander = new Commander('发送 {face:smile} 和 <图片:image>', {
  face: 'id',           // QQ 表情使用 'id' 字段
  image: 'file'         // QQ 图片使用 'file' 字段
});

// QQ 消息段示例
const qqSegments = [
  { type: 'text', data: { text: '发送 ' } },
  { type: 'face', data: { id: 'smile' } },
  { type: 'text', data: { text: ' 和 ' } },
  { type: 'image', data: { file: 'image.jpg' } }
];

qqCommander.match(qqSegments);
```

### 微信平台适配

```typescript
// 微信平台的字段映射
const wechatCommander = new Commander('发送 {face:smile} 和 <图片:image>', {
  face: 'emoji_id',     // 微信表情使用 'emoji_id' 字段
  image: 'media_url'    // 微信图片使用 'media_url' 字段
});

// 微信消息段示例
const wechatSegments = [
  { type: 'text', data: { text: '发送 ' } },
  { type: 'face', data: { emoji_id: 'smile' } },
  { type: 'text', data: { text: ' 和 ' } },
  { type: 'image', data: { media_url: 'https://example.com/image.jpg' } }
];

wechatCommander.match(wechatSegments);
```

### 通用适配器

```typescript
// 创建一个通用的平台适配器
class PlatformAdapter {
  static getFieldMapping(platform: string): Record<string, string | string[]> {
    const mappings = {
      qq: {
        face: 'id',
        image: ['file', 'url'],
        at: 'user_id'
      },
      wechat: {
        face: 'emoji_id',
        image: 'media_url',
        at: 'mention_id'
      },
      telegram: {
        face: 'emoji',
        image: 'photo_url',
        at: 'user_name'
      }
    };
    
    return mappings[platform] || {};
  }
}

// 使用适配器
function createPlatformCommander(pattern: string, platform: string) {
  return new Commander(pattern, PlatformAdapter.getFieldMapping(platform));
}

// 为不同平台创建命令
const qqCmd = createPlatformCommander('@ <用户:at> 发送 <图片:image>', 'qq');
const wechatCmd = createPlatformCommander('@ <用户:at> 发送 <图片:image>', 'wechat');
```

## 🔄 与类型化字面量结合

### 图片匹配示例

```typescript
const imageCmd = new Commander('{image:photo.jpg} 设置尺寸', {
  image: 'custom_path'  // 自定义图片字段
});

// 匹配时需要指定字段的图片
const segments = [
  { type: 'image', data: { custom_path: 'photo.jpg' } },
  { type: 'text', data: { text: ' 设置尺寸' } }
];

imageCmd.match(segments);
// ✅ 匹配成功
```

### 复杂类型化字面量

```typescript
const complexCmd = new Commander('{face:😀}{at:user123}{image:avatar.png}', {
  face: 'unicode',       // 表情使用 unicode 字段
  at: ['target', 'uid'], // @用户支持多字段
  image: 'avatar_url'    // 图片使用自定义字段
});

const segments = [
  { type: 'face', data: { unicode: '😀' } },
  { type: 'at', data: { target: 'user123' } },
  { type: 'image', data: { avatar_url: 'avatar.png' } }
];

complexCmd.match(segments);
// ✅ 匹配成功
```

## 🔧 与参数类型结合

### 基础参数类型

```typescript
const paramCmd = new Commander('发送 <表情:face> 给 <用户:at>', {
  face: 'custom_id',
  at: 'target_user'
});

paramCmd.action((params) => {
  console.log(`表情: ${params.表情}, 用户: ${params.用户}`);
});

const segments = [
  { type: 'text', data: { text: '发送 ' } },
  { type: 'face', data: { custom_id: 123 } },
  { type: 'text', data: { text: ' 给 ' } },
  { type: 'at', data: { target_user: 'alice' } }
];

paramCmd.match(segments);
// ✅ 输出: 表情: 123, 用户: alice
```

### 混合参数类型

```typescript
const mixedCmd = new Commander('设置 <头像:image> <昵称:text> <等级:integer>', {
  image: ['primary_avatar', 'avatar_url', 'file'],
  text: 'content'  // 文本使用自定义字段
});

mixedCmd.action((params) => {
  console.log('用户设置:');
  console.log(`- 头像: ${params.头像}`);
  console.log(`- 昵称: ${params.昵称}`);
  console.log(`- 等级: ${params.等级}`);
});
```

## 🛡️ 回退机制

当没有为某个类型配置自定义映射时，系统会智能回退到默认行为：

```typescript
const partialCmd = new Commander('发送 <图片:image> <表情:face>', {
  image: 'custom_url'
  // 注意：没有为 face 配置映射
});

const segments = [
  { type: 'text', data: { text: '发送 ' } },
  { type: 'image', data: { custom_url: 'photo.jpg' } },  // 使用自定义映射
  { type: 'text', data: { text: ' ' } },
  { type: 'face', data: { id: 123 } }                    // 回退到默认的 'id' 字段
];

partialCmd.action((params) => {
  console.log(`图片: ${params.图片}, 表情: ${params.表情}`);
});

partialCmd.match(segments);
// ✅ 输出: 图片: photo.jpg, 表情: 123
```

## 🎨 高级用法

### 条件字段映射

```typescript
class ConditionalFieldMapper {
  static createMapping(conditions: any): Record<string, string | string[]> {
    const mapping: Record<string, string | string[]> = {};
    
    // 根据条件动态创建映射
    if (conditions.useHighRes) {
      mapping.image = ['hd_url', 'url', 'file'];
    } else {
      mapping.image = ['thumb_url', 'url', 'file'];
    }
    
    if (conditions.useDisplayName) {
      mapping.at = ['display_name', 'username', 'user_id'];
    } else {
      mapping.at = 'user_id';
    }
    
    return mapping;
  }
}

// 使用条件映射
const hdCmd = new Commander('显示 <图片:image>', 
  ConditionalFieldMapper.createMapping({ useHighRes: true })
);
```

### 动态映射更新

```typescript
class DynamicCommander extends Commander {
  updateFieldMapping(newMapping: Record<string, string | string[]>) {
    // 更新字段映射（注意：这只是示例，实际实现可能需要重新解析）
    Object.assign(this.typedLiteralFields, newMapping);
  }
}

const dynamicCmd = new DynamicCommander('处理 <数据:image>');

// 根据运行时条件更新映射
if (process.env.NODE_ENV === 'development') {
  dynamicCmd.updateFieldMapping({ image: 'debug_path' });
} else {
  dynamicCmd.updateFieldMapping({ image: 'prod_path' });
}
```

## 📊 性能优化

### 字段查找优化

动态字段映射系统经过性能优化：

1. **优先级短路**：一旦找到匹配的字段就停止查找
2. **存在性检查**：快速检查字段是否存在于数据中
3. **空值过滤**：自动过滤 null/undefined 值

```typescript
// 性能优化的映射配置
const optimizedCmd = new Commander('数据 <值:image>', {
  // ✅ 好的实践：把最常用的字段放在前面
  image: ['url', 'file', 'path', 'src'],
  
  // ❌ 避免：把不常用的字段放在前面
  // image: ['rarely_used', 'url', 'file']
});
```

### 缓存策略

```typescript
// 使用缓存优化重复查找
class CachedFieldMapper {
  private static cache = new Map<string, Record<string, string | string[]>>();
  
  static getMapping(key: string): Record<string, string | string[]> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const mapping = this.computeMapping(key);
    this.cache.set(key, mapping);
    return mapping;
  }
  
  private static computeMapping(key: string): Record<string, string | string[]> {
    // 复杂的映射计算逻辑
    return {};
  }
}
```

## 💡 最佳实践

### 1. 字段优先级设计

```typescript
// ✅ 好的实践：按使用频率排序
const goodMapping = {
  image: ['url', 'file', 'path'],        // 常用字段在前
  at: ['user_id', 'uid', 'username']     // 标准字段在前
};

// ❌ 避免：随意排序
const poorMapping = {
  image: ['path', 'url', 'file'],        // 不常用字段在前
  at: ['username', 'user_id', 'uid']     // 非标准字段在前
};
```

### 2. 平台兼容性

```typescript
// ✅ 好的实践：考虑多平台兼容
const compatibleMapping = {
  image: ['file', 'url', 'path', 'src'],  // 覆盖主流平台
  face: ['id', 'emoji', 'unicode']        // 支持不同表情格式
};

// ❌ 避免：只考虑单一平台
const limitedMapping = {
  image: 'qq_file',                       // 只适用于特定平台
  face: 'qq_face_id'
};
```

### 3. 错误处理

```typescript
// ✅ 好的实践：提供回退选项
const robustMapping = {
  image: ['primary', 'secondary', 'file'],  // 多级回退
  at: ['user_id', 'id']                     // 简单回退
};

// 处理映射失败的情况
const robustCmd = new Commander('处理 <数据:image>', robustMapping);

robustCmd.action((params) => {
  if (!params.数据) {
    return '无法获取图片数据';
  }
  return `处理图片: ${params.数据}`;
});
```

### 4. 文档化

```typescript
// ✅ 好的实践：详细注释映射配置
const documentedMapping = {
  // QQ平台：使用 'file' 字段存储图片文件路径
  // 微信平台：使用 'url' 字段存储图片URL
  // Telegram：使用 'path' 字段存储本地路径
  image: ['file', 'url', 'path'],
  
  // 标准OneBot：使用 'user_id' 字段
  // 自定义实现：可能使用 'uid' 或 'id' 字段
  at: ['user_id', 'uid', 'id']
};
```

## 🔗 相关文档

- [类型化字面量详解](/docs/guide/typed-literals.md)
- [参数提取详解](/docs/guide/parameter-extraction.md)
- [自定义字段指南](/docs/guide/custom-fields.md)
- [Commander API 参考](/docs/api/commander.md)

## 🧪 测试建议

### 单元测试示例

```typescript
describe('动态字段映射', () => {
  test('应该使用自定义字段映射', () => {
    const cmd = new Commander('图片 <img:image>', { image: 'custom_field' });
    
    const segments = [
      { type: 'text', data: { text: '图片 ' } },
      { type: 'image', data: { custom_field: 'test.jpg' } }
    ];
    
    const result = cmd.match(segments);
    expect(result[0]).toEqual({ img: 'test.jpg' });
  });
  
  test('应该支持多字段优先级', () => {
    const cmd = new Commander('数据 <data:image>', { 
      image: ['primary', 'secondary'] 
    });
    
    const segments = [
      { type: 'text', data: { text: '数据 ' } },
      { type: 'image', data: { secondary: 'value', primary: undefined } }
    ];
    
    const result = cmd.match(segments);
    expect(result[0]).toEqual({ data: 'value' });
  });
});
```

## 📈 迁移指南

如果你正在从硬编码字段名迁移到动态字段映射：

### 迁移前

```typescript
// 旧的硬编码方式（现在仍然支持）
const oldCmd = new Commander('发送 <图片:image>');
// 只能使用默认的 'file' 或 'url' 字段
```

### 迁移后

```typescript
// 新的动态映射方式
const newCmd = new Commander('发送 <图片:image>', {
  image: ['custom_url', 'file', 'url']  // 支持自定义字段和回退
});
```

这种迁移是完全向后兼容的，你可以逐步迁移现有代码。 