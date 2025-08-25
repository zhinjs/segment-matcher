# 使用指南

## 基础概念

### 消息段

消息段是一个具有 `type` 和 `data` 字段的对象：

```typescript
interface MessageSegment {
  type: string;
  data: Record<string, any>;
}
```

常见的消息段类型：

- `text`: 文本消息
  ```typescript
  { type: 'text', data: { text: 'hello' } }
  ```
- `at`: @某人
  ```typescript
  { type: 'at', data: { user_id: 123456 } }
  ```
- `face`: 表情
  ```typescript
  { type: 'face', data: { id: 1 } }
  ```
- `image`: 图片
  ```typescript
  { type: 'image', data: { file: 'image.jpg' } }
  ```

### 模式语法

#### 字面量

直接匹配文本：

```typescript
const matcher = new SegmentMatcher('hello');
// 匹配 { type: 'text', data: { text: 'hello' } }
```

#### 类型化字面量

匹配特定类型的消息段：

```typescript
const matcher = new SegmentMatcher('{text:hello}{at:123456}');
// 匹配:
// [
//   { type: 'text', data: { text: 'hello' } },
//   { type: 'at', data: { user_id: 123456 } }
// ]
```

#### 参数

提取参数值：

```typescript
const matcher = new SegmentMatcher('hello <name:text>');
// 从 'hello Alice' 中提取 name = 'Alice'
```

#### 可选参数

带默认值的可选参数：

```typescript
const matcher = new SegmentMatcher('repeat [times:number=1]');
// 'repeat' → times = 1
// 'repeat 3' → times = 3
```

#### 剩余参数

收集剩余的消息段：

```typescript
const matcher = new SegmentMatcher('images[...urls:image]');
// 收集所有图片消息段
```

## 高级用法

### 自定义字段映射

#### 单字段映射

```typescript
const matcher = new SegmentMatcher('image <img:image>', {
  image: 'url'  // 使用 url 字段
});
```

#### 多字段优先级

```typescript
const matcher = new SegmentMatcher('image <img:image>', {
  image: ['url', 'file', 'src']  // 按顺序尝试
});
```

### 特殊类型规则

#### 数字类型

```typescript
// 数字（整数或小数）
const matcher1 = new SegmentMatcher('<n:number>');
// 匹配: '123', '3.14'

// 整数
const matcher2 = new SegmentMatcher('<n:integer>');
// 匹配: '123'

// 小数
const matcher3 = new SegmentMatcher('<n:float>');
// 匹配: '3.14'
```

#### 布尔类型

```typescript
const matcher = new SegmentMatcher('<enabled:boolean>');
// 匹配: 'true', 'false'
```

### 空格处理

#### 精确匹配

```typescript
// 'hello ' 后有空格
const matcher = new SegmentMatcher('hello <name:text>');

// ✅ 匹配成功
matcher.match([{ type: 'text', data: { text: 'hello Alice' } }]);

// ❌ 匹配失败
matcher.match([{ type: 'text', data: { text: 'helloAlice' } }]);
```

#### 忽略空格

使用类型化字面量：

```typescript
const matcher = new SegmentMatcher('{text:hello}<name:text>');
// 可以匹配 'hello Alice' 和 'helloAlice'
```

### 错误处理

#### 验证错误

```typescript
try {
  // 无效的模式
  new SegmentMatcher('');  // 抛出 ValidationError
  
  // 无效的参数
  matcher.match(null);  // 抛出 ValidationError
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('验证错误:', error.message);
  }
}
```

#### 匹配失败

```typescript
const result = matcher.match(segments);
if (result === null) {
  console.log('匹配失败');
} else {
  console.log('匹配成功:', result);
}
```

## 性能优化

### 缓存机制

1. 类型检查缓存
   ```typescript
   // 自动缓存类型检查结果
   const matcher = new SegmentMatcher('pattern');
   matcher.match(segments);  // 首次检查
   matcher.match(segments);  // 使用缓存
   ```

2. 模式解析缓存
   ```typescript
   // 相同的模式只解析一次
   const m1 = new SegmentMatcher('pattern');
   const m2 = new SegmentMatcher('pattern');  // 使用缓存
   ```

### 优化策略

1. 重用实例
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('pattern');
   for (const seg of segments) {
     matcher.match(seg);
   }
   ```

2. 使用字段映射
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('pattern', {
     image: 'url'  // 只访问需要的字段
   });
   ```

3. 避免不必要的类型检查
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('[...rest]');  // 不指定类型
   ```

## 最佳实践

### 模式设计

1. 使用明确的类型
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('<count:integer>');
   
   // ❌ 不好的做法
   const matcher = new SegmentMatcher('<count:number>');
   ```

2. 合理使用可选参数
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('cmd [opt:text]');
   
   // ❌ 不好的做法
   const matcher = new SegmentMatcher('cmd<opt:text>');
   ```

3. 注意空格敏感性
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('cmd <arg:text>');  // 明确的空格
   
   // ❌ 不好的做法
   const matcher = new SegmentMatcher('cmd<arg:text>');  // 模糊的空格要求
   ```

### 错误处理

1. 使用类型断言
   ```typescript
   // ✅ 好的做法
   if (result?.params.count != null) {
     const count = result.params.count as number;
   }
   ```

2. 提供默认值
   ```typescript
   // ✅ 好的做法
   const count = result?.params.count ?? 1;
   ```

### 性能考虑

1. 缓存实例
   ```typescript
   // ✅ 好的做法
   const matchers = new Map<string, SegmentMatcher>();
   
   function getMatcher(pattern: string) {
     if (!matchers.has(pattern)) {
       matchers.set(pattern, new SegmentMatcher(pattern));
     }
     return matchers.get(pattern)!;
   }
   ```

2. 使用适当的类型
   ```typescript
   // ✅ 好的做法
   const matcher = new SegmentMatcher('<n:integer>');  // 只匹配整数
   
   // ❌ 不好的做法
   const matcher = new SegmentMatcher('<n:text>');  // 匹配文本后转换
   ```

## 常见问题

### 空格相关

Q: 为什么我的模式无法匹配？
A: 检查空格是否完全匹配。模式中的每个空格都必须在输入中有对应的空格。

### 类型相关

Q: 为什么参数类型不正确？
A: 确保使用了正确的类型声明，并在必要时使用类型断言。

### 性能相关

Q: 如何提高匹配性能？
A: 
1. 重用匹配器实例
2. 使用适当的字段映射
3. 避免不必要的类型检查
4. 使用缓存机制

## 调试技巧

### 查看令牌

```typescript
const matcher = new SegmentMatcher('pattern');
console.log(matcher.getTokens());  // 查看解析后的令牌
```

### 检查匹配结果

```typescript
const result = matcher.match(segments);
console.log({
  matched: result?.matched,
  params: result?.params,
  remaining: result?.remaining
});
```