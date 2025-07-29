# TypeMatcher API 参考

TypeMatcher 系统是 OneBot Commander 特殊类型规则的核心实现，提供了灵活的类型匹配和转换机制。

## 🏗️ 核心接口

### TypeMatcher

类型匹配器的基础接口，定义了类型匹配和转换的标准行为。

```typescript
interface TypeMatcher {
  /**
   * 匹配并转换输入值
   * 
   * @param text - 输入的文本内容
   * @returns 匹配结果，包含是否成功和转换后的值
   */
  match(text: string): TypeMatchResult;
}
```

### TypeMatchResult

类型匹配的结果接口。

```typescript
interface TypeMatchResult {
  /** 是否匹配成功 */
  success: boolean;
  /** 转换后的值（仅在成功时存在） */
  value?: any;
}
```

## 🎯 内置类型匹配器

### NumberTypeMatcher

处理通用数字类型（支持整数和小数）。

```typescript
class NumberTypeMatcher implements TypeMatcher {
  /**
   * 匹配数字格式并转换为 number 类型
   * 
   * 支持的格式：
   * - 正整数：123
   * - 负整数：-456
   * - 正小数：123.45
   * - 负小数：-123.45
   * - 零：0, 0.0
   * 
   * @param text - 输入文本
   * @returns 匹配结果
   */
  match(text: string): TypeMatchResult;
}
```

**使用示例：**

```typescript
import { NumberTypeMatcher } from 'onebot-commander';

const matcher = new NumberTypeMatcher();

console.log(matcher.match('123'));     // { success: true, value: 123 }
console.log(matcher.match('123.45')); // { success: true, value: 123.45 }
console.log(matcher.match('-10'));    // { success: true, value: -10 }
console.log(matcher.match('abc'));    // { success: false }
```

### IntegerTypeMatcher

处理整数类型（不包含小数点）。

```typescript
class IntegerTypeMatcher implements TypeMatcher {
  /**
   * 匹配整数格式并转换为 number 类型
   * 
   * 支持的格式：
   * - 正整数：123
   * - 负整数：-456
   * - 零：0
   * 
   * @param text - 输入文本
   * @returns 匹配结果
   */
  match(text: string): TypeMatchResult;
}
```

**使用示例：**

```typescript
import { IntegerTypeMatcher } from 'onebot-commander';

const matcher = new IntegerTypeMatcher();

console.log(matcher.match('123'));    // { success: true, value: 123 }
console.log(matcher.match('-456'));   // { success: true, value: -456 }
console.log(matcher.match('123.45')); // { success: false }
console.log(matcher.match('abc'));    // { success: false }
```

### FloatTypeMatcher

处理浮点数类型（必须包含小数点）。

```typescript
class FloatTypeMatcher implements TypeMatcher {
  /**
   * 匹配浮点数格式并转换为 number 类型
   * 
   * 支持的格式：
   * - 正浮点数：123.45
   * - 负浮点数：-123.45
   * - 小数零：0.0
   * 
   * @param text - 输入文本
   * @returns 匹配结果
   */
  match(text: string): TypeMatchResult;
}
```

**使用示例：**

```typescript
import { FloatTypeMatcher } from 'onebot-commander';

const matcher = new FloatTypeMatcher();

console.log(matcher.match('123.45'));  // { success: true, value: 123.45 }
console.log(matcher.match('-3.14'));   // { success: true, value: -3.14 }
console.log(matcher.match('123'));     // { success: false }
console.log(matcher.match('abc'));     // { success: false }
```

### BooleanTypeMatcher

处理布尔类型（true/false 字符串转换）。

```typescript
class BooleanTypeMatcher implements TypeMatcher {
  /**
   * 匹配布尔值格式并转换为 boolean 类型
   * 
   * 支持的值：
   * - "true" → true
   * - "false" → false
   * 
   * 注意：严格区分大小写
   * 
   * @param text - 输入文本
   * @returns 匹配结果
   */
  match(text: string): TypeMatchResult;
}
```

**使用示例：**

```typescript
import { BooleanTypeMatcher } from 'onebot-commander';

const matcher = new BooleanTypeMatcher();

console.log(matcher.match('true'));   // { success: true, value: true }
console.log(matcher.match('false'));  // { success: true, value: false }
console.log(matcher.match('True'));   // { success: false }
console.log(matcher.match('yes'));    // { success: false }
```

### TextTypeMatcher

处理文本类型（总是成功匹配）。

```typescript
class TextTypeMatcher implements TypeMatcher {
  /**
   * 匹配文本内容（总是成功）
   * 
   * @param text - 输入文本
   * @returns 匹配结果（总是成功）
   */
  match(text: string): TypeMatchResult;
}
```

**使用示例：**

```typescript
import { TextTypeMatcher } from 'onebot-commander';

const matcher = new TextTypeMatcher();

console.log(matcher.match('hello'));  // { success: true, value: 'hello' }
console.log(matcher.match('123'));    // { success: true, value: '123' }
console.log(matcher.match(''));       // { success: true, value: '' }
```

## 📋 类型匹配器注册表

### TypeMatcherRegistry

管理所有类型匹配器的中央注册表。

```typescript
class TypeMatcherRegistry {
  /**
   * 获取指定类型的匹配器
   * 
   * @param dataType - 数据类型名称
   * @returns 对应的类型匹配器，如果不存在则返回null
   */
  static getMatcher(dataType: string): TypeMatcher | null;

  /**
   * 检查是否支持指定类型的特殊匹配
   * 
   * @param dataType - 数据类型名称
   * @returns 是否支持特殊匹配
   */
  static hasSpecialMatcher(dataType: string): boolean;

  /**
   * 注册新的类型匹配器
   * 
   * @param dataType - 数据类型名称
   * @param matcher - 类型匹配器实例
   */
  static registerMatcher(dataType: string, matcher: TypeMatcher): void;

  /**
   * 获取所有支持的数据类型
   * 
   * @returns 支持的数据类型列表
   */
  static getSupportedTypes(): string[];
}
```

**默认注册的类型：**

| 类型 | 匹配器 | 说明 |
|------|--------|------|
| `number` | NumberTypeMatcher | 通用数字（整数+小数） |
| `integer` | IntegerTypeMatcher | 整数（不含小数点） |
| `float` | FloatTypeMatcher | 浮点数（必含小数点） |
| `boolean` | BooleanTypeMatcher | 布尔值（true/false） |
| `text` | TextTypeMatcher | 文本（总是成功） |

**使用示例：**

```typescript
import { TypeMatcherRegistry } from 'onebot-commander';

// 获取匹配器
const numberMatcher = TypeMatcherRegistry.getMatcher('number');
if (numberMatcher) {
  const result = numberMatcher.match('123.45');
  console.log(result); // { success: true, value: 123.45 }
}

// 检查是否支持特殊匹配
console.log(TypeMatcherRegistry.hasSpecialMatcher('number'));  // true
console.log(TypeMatcherRegistry.hasSpecialMatcher('text'));    // false (text不算特殊)

// 获取所有支持的类型
console.log(TypeMatcherRegistry.getSupportedTypes());
// ['number', 'integer', 'float', 'boolean', 'text']
```

## 🔧 自定义类型匹配器

### 创建自定义匹配器

实现 `TypeMatcher` 接口来创建自定义的类型匹配器：

```typescript
import { TypeMatcher, TypeMatchResult } from 'onebot-commander';

class EmailTypeMatcher implements TypeMatcher {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  match(text: string): TypeMatchResult {
    if (!this.emailRegex.test(text)) {
      return { success: false };
    }
    
    // 可以在这里进行额外的处理，如标准化
    const normalizedEmail = text.toLowerCase().trim();
    
    return { success: true, value: normalizedEmail };
  }
}
```

### 注册自定义匹配器

```typescript
import { TypeMatcherRegistry } from 'onebot-commander';

// 注册自定义匹配器
TypeMatcherRegistry.registerMatcher('email', new EmailTypeMatcher());

// 现在可以在命令中使用自定义类型
const commander = new Commander('设置邮箱 <email:email>');

commander.action((params) => {
  console.log(`邮箱: ${params.email}`);
});

// 测试
commander.match([{ type: 'text', data: { text: '设置邮箱 USER@EXAMPLE.COM' } }]);
// 输出: 邮箱: user@example.com
```

### 复杂自定义匹配器示例

```typescript
// URL 匹配器
class UrlTypeMatcher implements TypeMatcher {
  private readonly urlRegex = /^https?:\/\/[^\s]+$/;

  match(text: string): TypeMatchResult {
    if (!this.urlRegex.test(text)) {
      return { success: false };
    }

    try {
      const url = new URL(text);
      return { 
        success: true, 
        value: {
          original: text,
          protocol: url.protocol,
          hostname: url.hostname,
          pathname: url.pathname
        }
      };
    } catch (error) {
      return { success: false };
    }
  }
}

// 日期匹配器
class DateTypeMatcher implements TypeMatcher {
  private readonly dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  match(text: string): TypeMatchResult {
    if (!this.dateRegex.test(text)) {
      return { success: false };
    }

    const date = new Date(text);
    if (isNaN(date.getTime())) {
      return { success: false };
    }

    return { success: true, value: date };
  }
}

// 注册多个自定义匹配器
TypeMatcherRegistry.registerMatcher('url', new UrlTypeMatcher());
TypeMatcherRegistry.registerMatcher('date', new DateTypeMatcher());
```

## 🎨 高级用法

### 条件匹配器

创建根据条件动态行为的匹配器：

```typescript
class ConditionalNumberMatcher implements TypeMatcher {
  constructor(
    private readonly min?: number,
    private readonly max?: number
  ) {}

  match(text: string): TypeMatchResult {
    const numberRegex = /^-?\d+(\.\d+)?$/;
    if (!numberRegex.test(text)) {
      return { success: false };
    }

    const value = Number(text);
    if (isNaN(value)) {
      return { success: false };
    }

    // 应用范围限制
    if (this.min !== undefined && value < this.min) {
      return { success: false };
    }
    if (this.max !== undefined && value > this.max) {
      return { success: false };
    }

    return { success: true, value };
  }
}

// 使用条件匹配器
TypeMatcherRegistry.registerMatcher('age', new ConditionalNumberMatcher(0, 150));
TypeMatcherRegistry.registerMatcher('score', new ConditionalNumberMatcher(0, 100));

const ageCmd = new Commander('设置年龄 <age:age>');
const scoreCmd = new Commander('设置分数 <score:score>');
```

### 组合匹配器

创建组合多个匹配器的复合匹配器：

```typescript
class UnionTypeMatcher implements TypeMatcher {
  constructor(private readonly matchers: TypeMatcher[]) {}

  match(text: string): TypeMatchResult {
    for (const matcher of this.matchers) {
      const result = matcher.match(text);
      if (result.success) {
        return result;
      }
    }
    return { success: false };
  }
}

// 创建数字或布尔值的联合类型
const numberOrBooleanMatcher = new UnionTypeMatcher([
  new NumberTypeMatcher(),
  new BooleanTypeMatcher()
]);

TypeMatcherRegistry.registerMatcher('numberOrBoolean', numberOrBooleanMatcher);
```

## 🛡️ 错误处理

### 匹配器错误处理

```typescript
class SafeTypeMatcher implements TypeMatcher {
  constructor(private readonly innerMatcher: TypeMatcher) {}

  match(text: string): TypeMatchResult {
    try {
      return this.innerMatcher.match(text);
    } catch (error) {
      console.error('Type matching error:', error);
      return { success: false };
    }
  }
}

// 包装现有匹配器以提供安全性
const safeNumberMatcher = new SafeTypeMatcher(new NumberTypeMatcher());
TypeMatcherRegistry.registerMatcher('safeNumber', safeNumberMatcher);
```

### 验证和日志

```typescript
class ValidatingTypeMatcher implements TypeMatcher {
  constructor(
    private readonly innerMatcher: TypeMatcher,
    private readonly validator?: (value: any) => boolean,
    private readonly logger?: (text: string, result: TypeMatchResult) => void
  ) {}

  match(text: string): TypeMatchResult {
    const result = this.innerMatcher.match(text);
    
    // 记录匹配过程
    if (this.logger) {
      this.logger(text, result);
    }
    
    // 应用额外验证
    if (result.success && this.validator && !this.validator(result.value)) {
      return { success: false };
    }
    
    return result;
  }
}
```

## 📊 性能优化

### 缓存匹配器

```typescript
class CachedTypeMatcher implements TypeMatcher {
  private cache = new Map<string, TypeMatchResult>();
  
  constructor(
    private readonly innerMatcher: TypeMatcher,
    private readonly maxCacheSize = 1000
  ) {}

  match(text: string): TypeMatchResult {
    // 检查缓存
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    // 执行匹配
    const result = this.innerMatcher.match(text);
    
    // 缓存结果
    if (this.cache.size < this.maxCacheSize) {
      this.cache.set(text, result);
    }
    
    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

### 预编译匹配器

```typescript
class PrecompiledRegexMatcher implements TypeMatcher {
  private readonly regex: RegExp;
  private readonly converter: (text: string) => any;

  constructor(pattern: string, converter: (text: string) => any) {
    this.regex = new RegExp(pattern);
    this.converter = converter;
  }

  match(text: string): TypeMatchResult {
    if (!this.regex.test(text)) {
      return { success: false };
    }

    try {
      const value = this.converter(text);
      return { success: true, value };
    } catch (error) {
      return { success: false };
    }
  }
}

// 使用预编译匹配器
const hexColorMatcher = new PrecompiledRegexMatcher(
  '^#[0-9a-fA-F]{6}$',
  (text) => text.toLowerCase()
);

TypeMatcherRegistry.registerMatcher('hexColor', hexColorMatcher);
```

## 🔗 集成指南

### 与 Commander 集成

TypeMatcher 系统与 Commander 无缝集成：

```typescript
import { Commander } from 'onebot-commander';

// 使用内置类型
const cmd1 = new Commander('设置 <值:number>');

// 使用自定义类型
TypeMatcherRegistry.registerMatcher('customType', new CustomTypeMatcher());
const cmd2 = new Commander('处理 <数据:customType>');
```

### 类型安全

使用 TypeScript 时可以增强类型安全：

```typescript
interface CustomType {
  value: string;
  processed: boolean;
}

class CustomTypeMatcher implements TypeMatcher {
  match(text: string): TypeMatchResult {
    // 返回强类型值
    const customValue: CustomType = {
      value: text,
      processed: true
    };
    
    return { success: true, value: customValue };
  }
}
```

## 📈 迁移指南

### 从硬编码类型检查迁移

**迁移前：**

```typescript
// 旧的硬编码方式
if (token.dataType === 'number') {
  const num = parseFloat(text);
  if (!isNaN(num)) {
    // 处理数字
  }
}
```

**迁移后：**

```typescript
// 使用 TypeMatcher 系统
const matcher = TypeMatcherRegistry.getMatcher(token.dataType!);
if (matcher) {
  const result = matcher.match(text);
  if (result.success) {
    // 处理匹配成功的值
  }
}
```

这种迁移提供了更好的可扩展性和一致性。

## 🧪 测试工具

TypeMatcher 系统提供了良好的可测试性：

```typescript
describe('CustomTypeMatcher', () => {
  let matcher: CustomTypeMatcher;

  beforeEach(() => {
    matcher = new CustomTypeMatcher();
  });

  test('should match valid input', () => {
    const result = matcher.match('valid-input');
    expect(result.success).toBe(true);
    expect(result.value).toBeDefined();
  });

  test('should reject invalid input', () => {
    const result = matcher.match('invalid-input');
    expect(result.success).toBe(false);
    expect(result.value).toBeUndefined();
  });
});
``` 