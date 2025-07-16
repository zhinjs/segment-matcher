# 代码规范

本页面定义了 OneBot Commander 项目的代码规范和编码标准。

## 基本原则

### 1. 可读性优先

代码应该易于阅读和理解，优先考虑可读性而不是简洁性。

```typescript
// 好的写法
const isUserValid = user && user.id && user.name && user.email;

// 不好的写法
const isValid = u && u.id && u.n && u.e;
```

### 2. 一致性

在整个项目中保持一致的编码风格和命名规范。

### 3. 可维护性

编写易于维护和扩展的代码，避免过度优化和复杂化。

## TypeScript 规范

### 类型定义

#### 接口命名

```typescript
// 使用 PascalCase 命名接口
interface MessageSegment {
  type: string;
  data: Record<string, any>;
}

interface ProcessingContext {
  params: Record<string, any>;
  metadata?: Record<string, any>;
}

// 使用 I 前缀表示接口（可选）
interface ICommander {
  on(pattern: string, handler: Handler): this;
  process(segments: MessageSegment[]): Promise<any>;
}
```

#### 类型别名

```typescript
// 使用 PascalCase 命名类型别名
type Handler = (segment: MessageSegment, context: ProcessingContext) => any;

type SegmentType = 'text' | 'image' | 'file' | 'at';

type PatternMatcher = (segment: MessageSegment) => boolean;
```

#### 泛型命名

```typescript
// 使用单个大写字母命名泛型参数
interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

// 对于复杂的泛型，使用描述性名称
interface FieldMapping<TField extends string = string> {
  [key: string]: TField;
}
```

### 变量和函数命名

#### 变量命名

```typescript
// 使用 camelCase 命名变量
const messageSegment = { type: 'text', data: { text: 'Hello' } };
const processingContext = { params: {}, metadata: {} };

// 布尔值使用 is/has/can 前缀
const isValid = true;
const hasPermission = false;
const canProcess = true;

// 常量使用 UPPER_SNAKE_CASE
const MAX_CACHE_SIZE = 1000;
const DEFAULT_TIMEOUT = 5000;
const SUPPORTED_SEGMENT_TYPES = ['text', 'image', 'file'];
```

#### 函数命名

```typescript
// 使用 camelCase 命名函数
function processMessage(segment: MessageSegment): string {
  return 'processed';
}

// 动词开头，描述动作
function validatePattern(pattern: string): boolean {
  return pattern.length > 0;
}

function extractParameters(segment: MessageSegment): Record<string, any> {
  return {};
}

// 异步函数使用 async/await
async function fetchUserData(userId: string): Promise<User> {
  return await api.getUser(userId);
}
```

#### 类命名

```typescript
// 使用 PascalCase 命名类
class Commander {
  private cache: Cache<any>;
  
  constructor(options?: CommanderOptions) {
    this.cache = new Cache();
  }
}

class PatternParser {
  parse(pattern: string): ParsedPattern {
    // 实现
  }
}
```

### 代码组织

#### 导入顺序

```typescript
// 1. 第三方库导入
import { performance } from 'perf_hooks';

// 2. 项目内部导入
import { Commander } from './commander';
import { PatternParser } from './pattern-parser';

// 3. 类型导入
import type { MessageSegment, ProcessingContext } from './types';
```

#### 类成员顺序

```typescript
class ExampleClass {
  // 1. 静态属性
  static readonly DEFAULT_OPTIONS = {};
  
  // 2. 实例属性
  private cache: Cache<any>;
  protected options: Options;
  
  // 3. 构造函数
  constructor(options?: Options) {
    this.options = options || ExampleClass.DEFAULT_OPTIONS;
  }
  
  // 4. 公共方法
  public process(data: any): any {
    return this.privateMethod(data);
  }
  
  // 5. 受保护方法
  protected validate(data: any): boolean {
    return true;
  }
  
  // 6. 私有方法
  private privateMethod(data: any): any {
    return data;
  }
}
```

## 注释规范

### 文档注释

```typescript
/**
 * 处理消息段的指挥官类
 * 
 * @example
 * ```typescript
 * const commander = new Commander();
 * commander.on('text', (segment, context) => {
 *   return 'Hello World';
 * });
 * ```
 */
class Commander {
  /**
   * 注册消息段处理器
   * 
   * @param pattern - 匹配模式，支持参数提取
   * @param handler - 处理函数
   * @returns 当前实例，支持链式调用
   * 
   * @example
   * ```typescript
   * commander.on('text:message', (segment, context) => {
   *   console.log(context.params.message);
   *   return 'processed';
   * });
   * ```
   */
  on(pattern: string, handler: Handler): this {
    // 实现
  }
  
  /**
   * 处理消息段数组
   * 
   * @param segments - 消息段数组
   * @param context - 处理上下文
   * @returns 处理结果
   * 
   * @throws {Error} 当处理失败时抛出错误
   */
  async process(segments: MessageSegment[], context?: ProcessingContext): Promise<any> {
    // 实现
  }
}
```

### 行内注释

```typescript
// 使用 // 进行行内注释
const maxRetries = 3; // 最大重试次数

// 复杂逻辑需要详细注释
function complexAlgorithm(data: any[]): any {
  // 第一步：数据预处理
  const processed = data.filter(item => item.valid);
  
  // 第二步：应用业务逻辑
  const result = processed.map(item => {
    // 特殊处理空值情况
    if (!item.value) {
      return { ...item, value: 'default' };
    }
    return item;
  });
  
  return result;
}
```

### TODO 注释

```typescript
// TODO: 实现缓存清理机制
// FIXME: 修复内存泄漏问题
// NOTE: 这个函数将在下个版本重构
// HACK: 临时解决方案，需要重新设计
```

## 错误处理

### 异常处理

```typescript
// 使用 try-catch 处理可能出错的代码
async function processWithErrorHandling(data: any): Promise<any> {
  try {
    const result = await riskyOperation(data);
    return result;
  } catch (error) {
    // 记录错误日志
    console.error('处理失败:', error);
    
    // 重新抛出或返回默认值
    throw new Error(`处理失败: ${error.message}`);
  }
}

// 使用类型守卫检查错误类型
function handleError(error: unknown): string {
  if (error instanceof ValidationError) {
    return '验证失败';
  } else if (error instanceof NetworkError) {
    return '网络错误';
  } else {
    return '未知错误';
  }
}
```

### 自定义错误

```typescript
// 定义自定义错误类
class CommanderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends CommanderError {
  constructor(field: string, value: any) {
    super(`字段 ${field} 的值 ${value} 无效`, 'VALIDATION_ERROR', 400);
  }
}
```

## 性能考虑

### 避免性能陷阱

```typescript
// 避免在循环中创建函数
// 不好的写法
for (let i = 0; i < 1000; i++) {
  commander.on('text', (segment, context) => {
    return `处理 ${i}`; // 闭包捕获 i
  });
}

// 好的写法
function createHandler(index: number) {
  return (segment: any, context: any) => {
    return `处理 ${index}`;
  };
}

for (let i = 0; i < 1000; i++) {
  commander.on('text', createHandler(i));
}
```

### 缓存优化

```typescript
// 使用缓存避免重复计算
const cache = new Map<string, any>();

function expensiveOperation(key: string): any {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = computeExpensiveResult(key);
  cache.set(key, result);
  return result;
}
```

## 测试规范

### 测试文件命名

```typescript
// 测试文件使用 .test.ts 或 .spec.ts 后缀
// commander.test.ts
// pattern-parser.spec.ts
```

### 测试结构

```typescript
describe('Commander', () => {
  let commander: Commander;
  
  beforeEach(() => {
    commander = new Commander();
  });
  
  afterEach(() => {
    commander.clearCache();
  });
  
  describe('on()', () => {
    it('应该注册处理器', () => {
      const handler = jest.fn();
      commander.on('text', handler);
      
      expect(commander.hasHandler('text')).toBe(true);
    });
    
    it('应该支持链式调用', () => {
      const result = commander
        .on('text', () => 'first')
        .on('text', () => 'second');
      
      expect(result).toBe(commander);
    });
  });
  
  describe('process()', () => {
    it('应该处理消息段', async () => {
      commander.on('text', () => 'Hello World');
      
      const result = await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);
      
      expect(result).toBe('Hello World');
    });
    
    it('应该处理异步处理器', async () => {
      commander.on('text', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'async result';
      });
      
      const result = await commander.process([
        { type: 'text', data: { text: 'test' } }
      ]);
      
      expect(result).toBe('async result');
    });
  });
});
```

## 代码格式化

### Prettier 配置

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint 规则

```json
{
  "extends": [
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Git 提交规范

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型说明

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```
feat(commander): 添加缓存支持

- 实现内存缓存机制
- 添加缓存配置选项
- 支持缓存统计和清理

Closes #123
```

## 代码审查清单

### 功能正确性

- [ ] 代码实现了预期功能
- [ ] 边界条件处理正确
- [ ] 错误处理完善
- [ ] 性能满足要求

### 代码质量

- [ ] 代码可读性好
- [ ] 命名规范清晰
- [ ] 注释充分
- [ ] 无重复代码

### 测试覆盖

- [ ] 单元测试覆盖主要功能
- [ ] 集成测试验证端到端流程
- [ ] 边界条件测试
- [ ] 性能测试

### 文档更新

- [ ] API 文档更新
- [ ] 示例代码更新
- [ ] 迁移指南更新
- [ ] 变更日志记录

遵循这些代码规范可以确保项目代码的一致性和可维护性。如有疑问，请参考项目中的现有代码或咨询项目维护者。 