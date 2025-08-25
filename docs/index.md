# Segment Matcher

高性能、类型安全的消息段模式匹配库。

## 特性一览

### 🎯 精确匹配
- 支持字面量匹配：`hello world`
- 支持类型化字面量：`{text:hello}{at:123456}`
- 支持参数提取：`<name:text>`
- 支持可选参数：`[count:number]`
- 支持默认值：`[count:number=1]`
- 支持剩余参数：`[...rest:image]`

### ⚡ 高性能
- 优化的匹配算法
- 智能缓存系统
  - 类型检查缓存
  - 模式解析缓存
- 针对大小数组的优化策略
- 智能的深拷贝策略

### 🛡️ 类型安全
- 完整的 TypeScript 类型定义
- 运行时类型检查
- 智能类型推导
- 类型安全的参数提取

### 🔧 灵活配置
- 自定义字段映射
  ```typescript
  const matcher = new SegmentMatcher('图片<img:image>', {
    image: ['url', 'file', 'src']  // 按优先级尝试这些字段
  });
  ```
- 多字段优先级映射
- 动态字段提取
- 自定义类型规则

### 🎨 特殊类型规则
- `number`: 支持整数和小数
  ```typescript
  const matcher = new SegmentMatcher('数字<n:number>');
  // 可以匹配：'数字123' 或 '数字3.14'
  ```
- `integer`: 仅支持整数
  ```typescript
  const matcher = new SegmentMatcher('整数<n:integer>');
  // 只匹配：'整数123'，不匹配：'整数3.14'
  ```
- `float`: 必须包含小数点
  ```typescript
  const matcher = new SegmentMatcher('小数<n:float>');
  // 只匹配：'小数3.14'，不匹配：'小数123'
  ```
- `boolean`: 布尔值
  ```typescript
  const matcher = new SegmentMatcher('开关<enabled:boolean>');
  // 匹配：'开关true' 或 '开关false'
  ```

### 📝 参数系统
- 必需参数：`<param:type>`
- 可选参数：`[param:type]`
- 带默认值：`[param:type=default]`
- 剩余参数：`[...rest:type]`

### 🔄 字段映射
- 单字段映射
  ```typescript
  { image: 'url' }  // 使用 url 字段
  ```
- 多字段优先级
  ```typescript
  { image: ['url', 'file', 'src'] }  // 按顺序尝试
  ```
- 动态字段提取
  ```typescript
  { custom: (segment) => segment.data.value }
  ```

## 快速开始

### 安装

```bash
npm install segment-matcher
```

### 基础使用

```typescript
import { SegmentMatcher } from 'segment-matcher';

// 创建匹配器
const matcher = new SegmentMatcher('hello <name:text>');

// 准备消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

// 执行匹配
const result = matcher.match(segments);
if (result) {
  console.log('匹配的消息段:', result.matched);
  console.log('提取的参数:', result.params);
  console.log('剩余的消息段:', result.remaining);
}
```

### 匹配结果

匹配成功时，返回一个包含以下字段的对象：

```typescript
interface MatchResult {
  // 匹配到的消息段
  matched: MessageSegment[];
  
  // 提取的参数
  params: Record<string, any>;
  
  // 剩余的消息段
  remaining: MessageSegment[];
}
```

匹配失败时返回 `null`。

## 注意事项

### 空格敏感性

模式中的空格必须精确匹配：

```typescript
// "hello " 后面有一个空格
const matcher = new SegmentMatcher('hello <name:text>');

// ✅ 正确：包含空格
matcher.match([{ type: 'text', data: { text: 'hello Alice' } }]);

// ❌ 错误：缺少空格
matcher.match([{ type: 'text', data: { text: 'helloAlice' } }]);
```

### 类型安全

建议启用 TypeScript 的严格模式：

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### 性能优化

1. 重用匹配器实例
   ```typescript
   // ✅ 好的做法：创建一次，多次使用
   const matcher = new SegmentMatcher('pattern');
   segments.forEach(seg => matcher.match(seg));
   
   // ❌ 不好的做法：每次都创建新实例
   segments.forEach(seg => new SegmentMatcher('pattern').match(seg));
   ```

2. 使用字段映射优化字段访问
   ```typescript
   // ✅ 好的做法：指定具体字段
   const matcher = new SegmentMatcher('pattern', {
     image: 'url'  // 只访问 url 字段
   });
   
   // ❌ 不好的做法：不指定字段映射
   const matcher = new SegmentMatcher('pattern');
   ```

## 更多示例

查看 [指南](/guide/) 了解更多用法。