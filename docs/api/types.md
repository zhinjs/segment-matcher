# 类型定义

OneBot Commander 提供了完整的 TypeScript 类型定义，帮助开发者构建类型安全的应用程序。

## 基本类型

### MessageSegment

消息段的基本类型定义。

```typescript
interface MessageSegment {
  type: string;
  data: Record<string, any>;
}
```

#### 属性

- `type`: 消息段类型，如 `'text'`, `'face'`, `'image'` 等
- `data`: 消息段数据，包含具体的字段和值

#### 示例

```typescript
const textSegment: MessageSegment = {
  type: 'text',
  data: { text: 'Hello World' }
};

const faceSegment: MessageSegment = {
  type: 'face',
  data: { id: 1 }
};

const imageSegment: MessageSegment = {
  type: 'image',
  data: { file: 'photo.jpg', url: 'https://example.com/photo.jpg' }
};
```

### PatternToken

模式令牌的类型定义。

```typescript
type PatternToken = 
  | LiteralToken
  | RequiredParamToken
  | OptionalParamToken
  | TypedLiteralToken
  | RestParamToken;
```

#### LiteralToken

文本字面量令牌。

```typescript
interface LiteralToken {
  type: 'literal';
  value: string;
}
```

#### RequiredParamToken

必需参数令牌。

```typescript
interface RequiredParamToken {
  type: 'required_param';
  name: string;
  paramType: string;
}
```

#### OptionalParamToken

可选参数令牌。

```typescript
interface OptionalParamToken {
  type: 'optional_param';
  name: string;
  paramType: string;
  defaultValue?: any;
}
```

#### TypedLiteralToken

类型化字面量令牌。

```typescript
interface TypedLiteralToken {
  type: 'typed_literal';
  segmentType: string;
  value: any;
}
```

#### RestParamToken

剩余参数令牌。

```typescript
interface RestParamToken {
  type: 'rest_param';
  name: string;
  paramType?: string;
}
```

### MatchResult

匹配结果的类型定义。

```typescript
interface MatchResult {
  success: boolean;
  params?: Record<string, any>;
  remaining?: MessageSegment[];
  reason?: string;
  consumed?: number;
}
```

#### 属性

- `success`: 是否匹配成功
- `params`: 匹配到的参数对象
- `remaining`: 剩余的消息段
- `reason`: 匹配失败的原因
- `consumed`: 消耗的消息段数量

## 配置类型

### CommanderOptions

Commander 构造函数的配置选项。

```typescript
interface CommanderOptions {
  fieldMapping?: FieldMapping;
  strictMode?: boolean;
  caseSensitive?: boolean;
}
```

#### 属性

- `fieldMapping`: 字段映射配置
- `strictMode`: 严格模式，默认为 `false`
- `caseSensitive`: 大小写敏感，默认为 `true`

### FieldMapping

字段映射配置。

```typescript
type FieldMapping = Record<string, string | string[]>;
```

#### 示例

```typescript
const fieldMapping: FieldMapping = {
  text: 'content',
  image: ['src', 'url'],
  face: 'emoji_id',
  at: 'user_id'
};
```

### PatternParserOptions

PatternParser 的配置选项。

```typescript
interface PatternParserOptions {
  fieldMapping?: FieldMapping;
  strictMode?: boolean;
}
```

### SegmentMatcherOptions

SegmentMatcher 的配置选项。

```typescript
interface SegmentMatcherOptions {
  fieldMapping?: FieldMapping;
  strictMode?: boolean;
  caseSensitive?: boolean;
}
```

## 错误类型

### CommanderError

主要的错误类。

```typescript
class CommanderError extends Error {
  constructor(
    code: string,
    message: string,
    details?: any,
    cause?: Error
  );
  
  code: string;
  details?: any;
  cause?: Error;
}
```

### ErrorCodes

错误代码常量。

```typescript
const ErrorCodes = {
  PATTERN_PARSE_ERROR: 'PATTERN_PARSE_ERROR',
  PARAMETER_MISSING: 'PARAMETER_MISSING',
  TYPE_MISMATCH: 'TYPE_MISMATCH',
  FIELD_NOT_FOUND: 'FIELD_NOT_FOUND',
  VALUE_MISMATCH: 'VALUE_MISMATCH',
  MULTIPLE_REST_PARAMS: 'MULTIPLE_REST_PARAMS',
  REST_PARAM_POSITION: 'REST_PARAM_POSITION',
  DUPLICATE_PARAM: 'DUPLICATE_PARAM'
} as const;
```

## 回调函数类型

### ActionCallback

动作回调函数类型。

```typescript
type ActionCallback = (params: Record<string, any>, ...remaining: MessageSegment[]) => any;
```

#### 参数

- `params`: 匹配到的参数对象
- `remaining`: 剩余的消息段

#### 示例

```typescript
const callback: ActionCallback = (params, ...remaining) => {
  console.log('参数:', params);
  console.log('剩余消息段:', remaining);
  
  return {
    success: true,
    message: `处理完成: ${params.name}`
  };
};
```

### AsyncActionCallback

异步动作回调函数类型。

```typescript
type AsyncActionCallback = (params: Record<string, any>, ...remaining: MessageSegment[]) => Promise<any>;
```

#### 示例

```typescript
const asyncCallback: AsyncActionCallback = async (params, ...remaining) => {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    data: await fetchData(params.id)
  };
};
```

## 泛型类型

### TypedCommander

带类型参数的 Commander 类。

```typescript
class TypedCommander<T = Record<string, any>> {
  constructor(pattern: string, options?: CommanderOptions);
  
  action(callback: (params: T, ...remaining: MessageSegment[]) => any): this;
  match(segments: MessageSegment[]): (T & { remaining?: MessageSegment[] })[];
  matchAsync(segments: MessageSegment[]): Promise<(T & { remaining?: MessageSegment[] })[]>;
}
```

#### 使用示例

```typescript
interface UserCommand {
  name: string;
  age: number;
  email?: string;
}

const commander = new TypedCommander<UserCommand>('user <name:text> <age:number> [email:text]');

commander.action((params) => {
  // params 的类型是 UserCommand
  console.log(`用户: ${params.name}, 年龄: ${params.age}`);
  if (params.email) {
    console.log(`邮箱: ${params.email}`);
  }
});
```

### TypedMatchResult

带类型参数的匹配结果。

```typescript
interface TypedMatchResult<T = Record<string, any>> {
  success: boolean;
  params?: T;
  remaining?: MessageSegment[];
  reason?: string;
  consumed?: number;
}
```

## 工具类型

### DeepPartial

深度可选类型。

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

#### 使用示例

```typescript
interface Config {
  fieldMapping: FieldMapping;
  options: {
    strictMode: boolean;
    caseSensitive: boolean;
  };
}

// 所有字段都变为可选的
type PartialConfig = DeepPartial<Config>;

const partialConfig: PartialConfig = {
  options: {
    strictMode: true
    // caseSensitive 是可选的
  }
  // fieldMapping 是可选的
};
```

### RequiredFields

必需字段类型。

```typescript
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

#### 使用示例

```typescript
interface User {
  id: number;
  name?: string;
  email?: string;
}

// 使 name 和 email 成为必需字段
type UserWithRequiredInfo = RequiredFields<User, 'name' | 'email'>;

const user: UserWithRequiredInfo = {
  id: 1,
  name: 'Alice', // 必需
  email: 'alice@example.com' // 必需
};
```

### ExtractParams

从模式字符串中提取参数类型。

```typescript
type ExtractParams<Pattern extends string> = 
  Pattern extends `${string}<${infer Name}:${infer Type}>${infer Rest}`
    ? { [K in Name]: Type extends 'text' ? string : Type extends 'number' ? number : any } & ExtractParams<Rest>
    : Pattern extends `${string}[${infer Name}:${infer Type}]${infer Rest}`
    ? { [K in Name]?: Type extends 'text' ? string : Type extends 'number' ? number : any } & ExtractParams<Rest>
    : {};
```

#### 使用示例

```typescript
type Params = ExtractParams<'hello <name:text> <age:number> [email:text]'>;
// 结果: { name: string; age: number; email?: string }

const commander = new TypedCommander<Params>('hello <name:text> <age:number> [email:text]');
```

## 类型守卫

### isMessageSegment

检查对象是否为消息段。

```typescript
function isMessageSegment(obj: any): obj is MessageSegment {
  return obj && typeof obj === 'object' && typeof obj.type === 'string' && obj.data;
}
```

#### 使用示例

```typescript
const data = { type: 'text', data: { text: 'hello' } };

if (isMessageSegment(data)) {
  console.log('是消息段:', data.type);
} else {
  console.log('不是消息段');
}
```

### isPatternToken

检查对象是否为模式令牌。

```typescript
function isPatternToken(obj: any): obj is PatternToken {
  return obj && typeof obj === 'object' && typeof obj.type === 'string';
}
```

### isCommanderError

检查错误是否为 CommanderError。

```typescript
function isCommanderError(error: any): error is CommanderError {
  return error instanceof CommanderError;
}
```

## 类型断言

### 安全的类型断言

```typescript
function assertMessageSegment(obj: any): asserts obj is MessageSegment {
  if (!isMessageSegment(obj)) {
    throw new Error('对象不是有效的消息段');
  }
}

function assertPatternToken(obj: any): asserts obj is PatternToken {
  if (!isPatternToken(obj)) {
    throw new Error('对象不是有效的模式令牌');
  }
}
```

#### 使用示例

```typescript
const data = { type: 'text', data: { text: 'hello' } };

assertMessageSegment(data);
// 这里 TypeScript 知道 data 是 MessageSegment 类型
console.log(data.type); // 类型安全
```

## 类型组合

### 联合类型

```typescript
type SupportedSegmentType = 'text' | 'face' | 'image' | 'voice' | 'video' | 'file' | 'at' | 'reply' | 'forward' | 'json' | 'xml' | 'card';

type SupportedParamType = 'text' | 'number' | 'boolean' | 'face' | 'image' | 'voice' | 'video' | 'file' | 'at' | 'reply' | 'forward' | 'json' | 'xml' | 'card';
```

### 条件类型

```typescript
type ParamValue<T extends string> = 
  T extends 'text' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'face' ? MessageSegment :
  T extends 'image' ? MessageSegment :
  T extends 'voice' ? MessageSegment :
  T extends 'video' ? MessageSegment :
  T extends 'file' ? MessageSegment :
  T extends 'at' ? MessageSegment :
  T extends 'reply' ? MessageSegment :
  T extends 'forward' ? MessageSegment :
  T extends 'json' ? any :
  T extends 'xml' ? any :
  T extends 'card' ? any :
  any;
```

## 类型导出

### 主要类型导出

```typescript
export {
  MessageSegment,
  PatternToken,
  LiteralToken,
  RequiredParamToken,
  OptionalParamToken,
  TypedLiteralToken,
  RestParamToken,
  MatchResult,
  CommanderOptions,
  FieldMapping,
  PatternParserOptions,
  SegmentMatcherOptions,
  CommanderError,
  ErrorCodes,
  ActionCallback,
  AsyncActionCallback,
  TypedCommander,
  TypedMatchResult
};
```

### 工具类型导出

```typescript
export {
  DeepPartial,
  RequiredFields,
  ExtractParams,
  isMessageSegment,
  isPatternToken,
  isCommanderError
};
```

## 类型使用示例

### 完整的类型安全示例

```typescript
import { 
  TypedCommander, 
  MessageSegment, 
  ActionCallback,
  isMessageSegment 
} from 'onebot-commander';

// 定义参数类型
interface PingCommand {
  count: number;
  target?: string;
}

// 创建类型安全的命令解析器
const commander = new TypedCommander<PingCommand>('ping <count:number> [target:text]');

// 类型安全的回调函数
const callback: ActionCallback = (params: PingCommand, ...remaining: MessageSegment[]) => {
  console.log(`Ping ${params.count} 次`);
  if (params.target) {
    console.log(`目标: ${params.target}`);
  }
  
  return {
    success: true,
    message: `Ping 完成: ${params.count} 次`
  };
};

commander.action(callback);

// 类型安全的消息段处理
function processSegments(segments: any[]): MessageSegment[] {
  return segments.filter(isMessageSegment);
}

const segments = processSegments([
  { type: 'text', data: { text: 'ping 5 localhost' } },
  { invalid: 'data' } // 会被过滤掉
]);

const result = commander.match(segments);
// result 的类型是 (PingCommand & { remaining?: MessageSegment[] })[]
```

### 高级类型使用

```typescript
import { TypedCommander, DeepPartial, RequiredFields } from 'onebot-commander';

// 基础配置接口
interface BaseConfig {
  fieldMapping?: Record<string, string>;
  options?: {
    strictMode?: boolean;
    caseSensitive?: boolean;
  };
}

// 必需配置
type RequiredConfig = RequiredFields<BaseConfig, 'fieldMapping'>;

// 部分配置
type PartialConfig = DeepPartial<BaseConfig>;

// 使用类型安全的配置
function createCommanderWithConfig(
  pattern: string, 
  config: RequiredConfig
): TypedCommander<any> {
  return new TypedCommander(pattern, config);
}

const config: RequiredConfig = {
  fieldMapping: {
    text: 'content',
    image: 'src'
  }
  // options 是可选的
};

const commander = createCommanderWithConfig('hello <name:text>', config);
```

## 类型检查

### 编译时类型检查

```typescript
// TypeScript 会在编译时检查类型
const commander = new TypedCommander<{ name: string; age: number }>('user <name:text> <age:number>');

commander.action((params) => {
  // TypeScript 知道 params 的类型
  console.log(params.name); // ✅ 类型安全
  console.log(params.age);  // ✅ 类型安全
  // console.log(params.email); // ❌ 编译错误，email 不存在
});
```

### 运行时类型检查

```typescript
import { isMessageSegment, isCommanderError } from 'onebot-commander';

function safeProcess(data: any) {
  if (isMessageSegment(data)) {
    // 运行时类型检查
    console.log('处理消息段:', data.type);
  } else {
    console.log('无效的数据格式');
  }
}

function safeErrorHandling(error: any) {
  if (isCommanderError(error)) {
    console.error('命令错误:', error.code, error.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 下一步

- [Commander](/api/commander) - 查看主要的 API 文档
- [PatternParser](/api/pattern-parser) - 学习模式解析器
- [SegmentMatcher](/api/segment-matcher) - 了解消息段匹配器
- [错误处理](/api/errors) - 掌握错误处理机制

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>充分利用 TypeScript 的类型系统可以大大提高代码的可靠性和开发效率。</p>
</div> 