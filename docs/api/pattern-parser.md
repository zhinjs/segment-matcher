# PatternParser

PatternParser 是 OneBot Commander 的核心组件，负责解析模式字符串并生成匹配令牌。

## 基本概念

### 什么是 PatternParser

PatternParser 是一个模式解析器，它将模式字符串解析为结构化的令牌数组，供 SegmentMatcher 使用进行消息段匹配。

```typescript
import { PatternParser } from 'onebot-commander';

const parser = new PatternParser();
const tokens = parser.parse('hello <name:text> [count:number=1]');
```

### 支持的令牌类型

| 令牌类型 | 描述 | 示例 |
|----------|------|------|
| `literal` | 文本字面量 | `"hello"` |
| `required_param` | 必需参数 | `<name:text>` |
| `optional_param` | 可选参数 | `[count:number]` |
| `typed_literal` | 类型化字面量 | `{text:hello}` |
| `rest_param` | 剩余参数 | `[...args]` |

## API 参考

### 构造函数

```typescript
new PatternParser(options?: PatternParserOptions)
```

#### 参数

- `options` (可选): 解析器配置选项
  - `fieldMapping`: 字段映射配置
  - `strictMode`: 严格模式，默认为 `false`

### 方法

#### parse(pattern: string): PatternToken[]

解析模式字符串并返回令牌数组。

```typescript
const parser = new PatternParser();
const tokens = parser.parse('hello <name:text> [count:number=1]');

console.log(tokens);
// 输出:
// [
//   { type: 'literal', value: 'hello' },
//   { type: 'required_param', name: 'name', paramType: 'text' },
//   { type: 'optional_param', name: 'count', paramType: 'number', defaultValue: 1 }
// ]
```

#### validate(pattern: string): ValidationResult

验证模式字符串的语法正确性。

```typescript
const parser = new PatternParser();
const result = parser.validate('hello <name:text> [count:number=1]');

if (result.isValid) {
  console.log('模式语法正确');
} else {
  console.log('模式语法错误:', result.errors);
}
```

## 令牌结构

### LiteralToken

文本字面量令牌。

```typescript
interface LiteralToken {
  type: 'literal';
  value: string;
}
```

### RequiredParamToken

必需参数令牌。

```typescript
interface RequiredParamToken {
  type: 'required_param';
  name: string;
  paramType: string;
}
```

### OptionalParamToken

可选参数令牌。

```typescript
interface OptionalParamToken {
  type: 'optional_param';
  name: string;
  paramType: string;
  defaultValue?: any;
}
```

### TypedLiteralToken

类型化字面量令牌。

```typescript
interface TypedLiteralToken {
  type: 'typed_literal';
  segmentType: string;
  value: any;
}
```

### RestParamToken

剩余参数令牌。

```typescript
interface RestParamToken {
  type: 'rest_param';
  name: string;
  paramType?: string;
}
```

## 使用示例

### 基本解析

```typescript
import { PatternParser } from 'onebot-commander';

const parser = new PatternParser();

// 解析简单模式
const simpleTokens = parser.parse('hello');
console.log(simpleTokens);
// [{ type: 'literal', value: 'hello' }]

// 解析带参数的模式
const paramTokens = parser.parse('echo <message:text>');
console.log(paramTokens);
// [
//   { type: 'literal', value: 'echo' },
//   { type: 'required_param', name: 'message', paramType: 'text' }
// ]

// 解析复杂模式
const complexTokens = parser.parse('{face:1}<command:text>[count:number=1]');
console.log(complexTokens);
// [
//   { type: 'typed_literal', segmentType: 'face', value: 1 },
//   { type: 'required_param', name: 'command', paramType: 'text' },
//   { type: 'optional_param', name: 'count', paramType: 'number', defaultValue: 1 }
// ]
```

### 模式验证

```typescript
const parser = new PatternParser();

// 验证有效模式
const validResult = parser.validate('hello <name:text>');
console.log(validResult.isValid); // true

// 验证无效模式
const invalidResult = parser.validate('hello <name>'); // 缺少类型
console.log(invalidResult.isValid); // false
console.log(invalidResult.errors); // ['参数缺少类型声明']

// 验证复杂模式
const complexResult = parser.validate('{face:1}<command:text>[count:number=1][...rest]');
console.log(complexResult.isValid); // true
```

### 自定义字段映射

```typescript
const customMapping = {
  text: 'content',
  image: 'src',
  face: 'emoji_id'
};

const parser = new PatternParser({ fieldMapping: customMapping });
const tokens = parser.parse('{text:hello}<name:text>');

console.log(tokens);
// [
//   { type: 'typed_literal', segmentType: 'text', value: 'hello' },
//   { type: 'required_param', name: 'name', paramType: 'text' }
// ]
```

## 高级用法

### 批量解析

```typescript
const parser = new PatternParser();

const patterns = [
  'hello <name:text>',
  'echo <message:text>',
  'ping [count:number=1]',
  '{face:1}<command:text>'
];

const allTokens = patterns.map(pattern => ({
  pattern,
  tokens: parser.parse(pattern)
}));

console.log(allTokens);
```

### 模式分析

```typescript
function analyzePattern(pattern: string) {
  const parser = new PatternParser();
  const tokens = parser.parse(pattern);
  
  const analysis = {
    pattern,
    tokenCount: tokens.length,
    hasRequiredParams: tokens.some(t => t.type === 'required_param'),
    hasOptionalParams: tokens.some(t => t.type === 'optional_param'),
    hasTypedLiterals: tokens.some(t => t.type === 'typed_literal'),
    hasRestParams: tokens.some(t => t.type === 'rest_param'),
    paramTypes: tokens
      .filter(t => t.type === 'required_param' || t.type === 'optional_param')
      .map(t => t.paramType)
  };
  
  return analysis;
}

const analysis = analyzePattern('{face:1}<command:text>[count:number=1][...rest]');
console.log(analysis);
// {
//   pattern: '{face:1}<command:text>[count:number=1][...rest]',
//   tokenCount: 4,
//   hasRequiredParams: true,
//   hasOptionalParams: true,
//   hasTypedLiterals: true,
//   hasRestParams: true,
//   paramTypes: ['text', 'number']
// }
```

### 模式转换

```typescript
function convertPattern(pattern: string, targetFormat: string) {
  const parser = new PatternParser();
  const tokens = parser.parse(pattern);
  
  switch (targetFormat) {
    case 'regex':
      return tokens.map(token => {
        switch (token.type) {
          case 'literal':
            return token.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          case 'required_param':
            return '([^\\s]+)';
          case 'optional_param':
            return '([^\\s]*)';
          case 'typed_literal':
            return `(${token.value})`;
          case 'rest_param':
            return '(.*)';
          default:
            return '';
        }
      }).join('');
      
    case 'description':
      return tokens.map(token => {
        switch (token.type) {
          case 'literal':
            return `"${token.value}"`;
          case 'required_param':
            return `<${token.name}:${token.paramType}>`;
          case 'optional_param':
            return `[${token.name}:${token.paramType}]`;
          case 'typed_literal':
            return `{${token.segmentType}:${token.value}}`;
          case 'rest_param':
            return `[...${token.name}]`;
          default:
            return '';
        }
      }).join(' ');
      
    default:
      return pattern;
  }
}

const regex = convertPattern('hello <name:text>', 'regex');
console.log(regex); // "hello\\s+([^\\s]+)"

const description = convertPattern('hello <name:text>', 'description');
console.log(description); // "hello" <name:text>
```

## 错误处理

### 常见错误类型

```typescript
// 1. 语法错误
try {
  parser.parse('hello <name>'); // 缺少类型
} catch (error) {
  console.error('语法错误:', error.message);
}

// 2. 参数名重复
try {
  parser.parse('hello <name:text> <name:number>'); // 重复的参数名
} catch (error) {
  console.error('参数重复:', error.message);
}

// 3. 无效的类型
try {
  parser.parse('hello <name:invalid_type>'); // 不支持的类型
} catch (error) {
  console.error('无效类型:', error.message);
}

// 4. 剩余参数位置错误
try {
  parser.parse('hello [...rest] <name:text>'); // 剩余参数不在最后
} catch (error) {
  console.error('位置错误:', error.message);
}
```

### 错误恢复

```typescript
function safeParse(pattern: string) {
  const parser = new PatternParser();
  
  try {
    const tokens = parser.parse(pattern);
    return { success: true, tokens };
  } catch (error) {
    // 尝试修复常见错误
    const fixedPattern = fixCommonErrors(pattern);
    
    try {
      const tokens = parser.parse(fixedPattern);
      return { 
        success: true, 
        tokens, 
        original: pattern, 
        fixed: fixedPattern,
        warning: '模式已自动修复'
      };
    } catch (secondError) {
      return { 
        success: false, 
        error: error.message,
        suggestion: getSuggestion(pattern)
      };
    }
  }
}

function fixCommonErrors(pattern: string): string {
  // 修复常见错误
  return pattern
    .replace(/<([^:>]+)>/g, '<$1:text>') // 添加默认类型
    .replace(/\[([^:>\]]+)\]/g, '[$1:text]'); // 添加默认类型
}

function getSuggestion(pattern: string): string {
  // 提供修复建议
  if (pattern.includes('<') && !pattern.includes(':')) {
    return '参数缺少类型声明，请使用 <name:type> 格式';
  }
  return '请检查模式语法';
}
```

## 性能优化

### 解析器缓存

```typescript
class CachedPatternParser {
  private parser = new PatternParser();
  private cache = new Map<string, PatternToken[]>();
  
  parse(pattern: string): PatternToken[] {
    if (this.cache.has(pattern)) {
      return this.cache.get(pattern)!;
    }
    
    const tokens = this.parser.parse(pattern);
    this.cache.set(pattern, tokens);
    return tokens;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  getCacheSize(): number {
    return this.cache.size;
  }
}

const cachedParser = new CachedPatternParser();
const tokens = cachedParser.parse('hello <name:text>'); // 第一次解析
const tokens2 = cachedParser.parse('hello <name:text>'); // 从缓存获取
```

### 批量验证

```typescript
function batchValidate(patterns: string[]): ValidationResult[] {
  const parser = new PatternParser();
  const results: ValidationResult[] = [];
  
  for (const pattern of patterns) {
    try {
      parser.parse(pattern);
      results.push({ isValid: true, pattern });
    } catch (error) {
      results.push({ 
        isValid: false, 
        pattern, 
        error: error.message 
      });
    }
  }
  
  return results;
}

const patterns = [
  'hello <name:text>',
  'echo <message>', // 缺少类型
  'ping [count:number=1]',
  'invalid pattern' // 无效模式
];

const validationResults = batchValidate(patterns);
console.log(validationResults);
```

## 调试技巧

### 令牌可视化

```typescript
function visualizeTokens(tokens: PatternToken[]): string {
  return tokens.map(token => {
    switch (token.type) {
      case 'literal':
        return `📝 "${token.value}"`;
      case 'required_param':
        return `🔴 <${token.name}:${token.paramType}>`;
      case 'optional_param':
        return `🟡 [${token.name}:${token.paramType}]`;
      case 'typed_literal':
        return `🔵 {${token.segmentType}:${token.value}}`;
      case 'rest_param':
        return `🟢 [...${token.name}]`;
      default:
        return `❓ ${token.type}`;
    }
  }).join(' ');
}

const parser = new PatternParser();
const tokens = parser.parse('{face:1}<command:text>[count:number=1]');
console.log(visualizeTokens(tokens));
// 🔵 {face:1} 🔴 <command:text> 🟡 [count:number]
```

### 模式复杂度分析

```typescript
function analyzeComplexity(pattern: string): ComplexityAnalysis {
  const parser = new PatternParser();
  const tokens = parser.parse(pattern);
  
  let complexity = 0;
  const features = [];
  
  for (const token of tokens) {
    switch (token.type) {
      case 'literal':
        complexity += 1;
        break;
      case 'required_param':
        complexity += 2;
        features.push('required_param');
        break;
      case 'optional_param':
        complexity += 3;
        features.push('optional_param');
        break;
      case 'typed_literal':
        complexity += 2;
        features.push('typed_literal');
        break;
      case 'rest_param':
        complexity += 4;
        features.push('rest_param');
        break;
    }
  }
  
  return {
    pattern,
    complexity,
    features: [...new Set(features)],
    tokenCount: tokens.length,
    level: complexity <= 5 ? 'simple' : complexity <= 10 ? 'medium' : 'complex'
  };
}

const analysis = analyzeComplexity('{face:1}<command:text>[count:number=1][...rest]');
console.log(analysis);
// {
//   pattern: '{face:1}<command:text>[count:number=1][...rest]',
//   complexity: 11,
//   features: ['typed_literal', 'required_param', 'optional_param', 'rest_param'],
//   tokenCount: 4,
//   level: 'complex'
// }
```

## 最佳实践

### 1. 模式设计

```typescript
// ✅ 清晰简洁的模式
const goodPatterns = [
  'hello <name:text>',
  'echo <message:text>',
  'ping [count:number=1]'
];

// ❌ 过于复杂的模式
const badPatterns = [
  '{face:1}{text:start}<arg1:text>[arg2:face][arg3:image][arg4:at]',
  'very long pattern with many parameters and complex structure'
];
```

### 2. 错误处理

```typescript
// ✅ 完善的错误处理
function createCommander(pattern: string) {
  const parser = new PatternParser();
  
  try {
    const tokens = parser.parse(pattern);
    return new Commander(pattern);
  } catch (error) {
    console.error(`模式解析失败: ${pattern}`, error.message);
    throw new Error(`无效的模式: ${pattern}`);
  }
}

// ❌ 忽略错误
function badCreateCommander(pattern: string) {
  return new Commander(pattern); // 可能抛出未处理的异常
}
```

### 3. 性能考虑

```typescript
// ✅ 使用缓存的解析器
const cachedParser = new CachedPatternParser();

function processPatterns(patterns: string[]) {
  return patterns.map(pattern => cachedParser.parse(pattern));
}

// ❌ 每次都创建新解析器
function badProcessPatterns(patterns: string[]) {
  return patterns.map(pattern => {
    const parser = new PatternParser(); // 每次都创建新实例
    return parser.parse(pattern);
  });
}
```

## 下一步

- [SegmentMatcher](/api/segment-matcher) - 了解消息段匹配器
- [错误处理](/api/errors) - 掌握错误处理机制
- [类型定义](/api/types) - 了解类型系统
- [Commander](/api/commander) - 查看主要的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>PatternParser 是 OneBot Commander 的基础组件，理解其工作原理有助于创建更有效的模式。</p>
</div> 