# 🤖 Segment Matcher

> A powerful message segment matcher with TypeScript support and dual format (ESM/CJS) output

[![npm version](https://badge.fury.io/js/segment-matcher.svg)](https://badge.fury.io/js/segment-matcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🚀 **High Performance**: Built with TypeScript, compiled to native JavaScript
- 📦 **Dual Format Support**: Supports both ESM and CommonJS module formats
- 🔧 **Flexible Configuration**: Supports custom typed literal field mapping
- ⚡ **Async Support**: Supports both synchronous and asynchronous callback functions
- 🎯 **Precise Matching**: Supports required parameters, optional parameters, rest parameters, and typed literals
- 🔗 **Chainable Calls**: Supports chained callback processing
- 🛡️ **Type Safety**: Complete TypeScript type definitions

## 📦 Installation

```bash
npm install segment-matcher
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { SegmentMatcher } from 'segment-matcher';

// Simple text matching
const matcher = new SegmentMatcher('hello <name:text>');
const segments = [
  { type: 'text', data: { text: 'hello world' } }
];

const result = matcher.match(segments);
if (result) {
  console.log(result.name); // 'world'
}
```

### Chained Callback Processing

```javascript
import { SegmentMatcher } from 'segment-matcher';

const matcher = new SegmentMatcher("test<arg1:text>[arg2:face]");

const result = matcher.match([
  { type: 'text', data: { text: 'test123' } },
  { type: 'face', data: { id: 1 } }
]);

if (result) {
  console.log('arg1:', result.arg1);        // '123'
  console.log('arg2:', result.arg2);        // { type: 'face', data: { id: 1 } }
  
  const arg1 = result.arg1;
  console.log('Processing arg1:', arg1.toUpperCase());
  const length = arg1.length;
  console.log('arg1 length:', length);
}
```

### Async Processing

```javascript
const matcher = new SegmentMatcher("test<arg1:text>");

const result = matcher.match([
  { type: 'text', data: { text: 'test123' } }
]);

if (result) {
  // Simulate async operation
  (async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Async processing arg1:', result.arg1);
    const upperArg1 = result.arg1.toUpperCase();
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Async processing result:', upperArg1);
    const length = upperArg1.length;
    console.log('Final result:', length);
  })();
}
```

## 📖 Detailed Usage

### Basic Text Matching

```javascript
import { SegmentMatcher } from 'segment-matcher';

// Example 1: Simple text matching
const matcher1 = match('hello');
const segments1 = [
  { type: 'text', data: { text: 'hello world' } }
];
const result1 = matcher1.match(segments1);
console.log(result1);
// Output: [{}, { type: 'text', data: { text: ' world' } }]

// Example 2: Required parameter extraction
const matcher2 = match('hello <name:text>');
const segments2 = [
  { type: 'text', data: { text: 'hello Alice' } }
];
const result2 = matcher2.match(segments2);
console.log(result2);
// Output: [{ name: 'Alice' }]

// Example 3: Optional parameter (provided)
const matcher3 = match('ping [message:text]');
const segments3 = [
  { type: 'text', data: { text: 'ping hello' } }
];
const result3 = matcher3.match(segments3);
console.log(result3);
// Output: [{ message: 'hello' }]

// Example 4: Optional parameter (not provided)
const segments4 = [
  { type: 'text', data: { text: 'ping' } }
];
const result4 = matcher3.match(segments4);
console.log(result4);
// Output: []
```

### Complex Pattern Matching

```javascript
// Example 5: Mixed parameter pattern
const matcher5 = match('test<arg1:text>[arg2:face]');
const segments5 = [
  { type: 'text', data: { text: 'test123' } },
  { type: 'face', data: { id: 1 } }
];
const result5 = matcher5.match(segments5);
console.log(result5);
// Output: [{ arg1: '123', arg2: { type: 'face', data: { id: 1 } } }]

// Example 6: Typed literal matching
const matcher6 = match('{text:test}<arg1:text>');
const segments6 = [
  { type: 'text', data: { text: 'test123' } }
];
const result6 = matcher6.match(segments6);
console.log(result6);
// Output: [{ arg1: '123' }]

// Example 7: Face typed literal (match failure)
const matcher7 = match('{face:2}<arg1:text>');
const segments7 = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: '123' } }
];
const result7 = matcher7.match(segments7);
console.log(result7);
// Output: []

// Example 8: Image typed literal (match success)
const matcher8 = match('{image:test.jpg}<arg1:text>');
const segments8 = [
  { type: 'image', data: { file: 'test.jpg' } },
  { type: 'text', data: { text: '123' } }
];
const result8 = matcher8.match(segments8);
console.log(result8);
// Output: [{ arg1: '123' }]

// Example 9: @ typed literal
const matcher9 = match('{at:123456}<arg1:text>');
const segments9 = [
  { type: 'at', data: { user_id: 123456 } },
  { type: 'text', data: { text: '123' } }
];
const result9 = matcher9.match(segments9);
console.log(result9);
// Output: [{ arg1: '123' }]
```

### Rest Parameter Matching

```javascript
// Example 10: Generic rest parameters
const matcher10 = match('test[...rest]');
const segments10 = [
  { type: 'text', data: { text: 'test' } },
  { type: 'text', data: { text: 'hello' } },
  { type: 'face', data: { id: 1 } },
  { type: 'image', data: { file: 'test.jpg' } }
];
const result10 = matcher10.match(segments10);
console.log(result10);
// Output: [
//   {
//     rest: [
//       { type: 'text', data: { text: 'hello' } },
//       { type: 'face', data: { id: 1 } },
//       { type: 'image', data: { file: 'test.jpg' } }
//     ]
//   }
// ]

// Example 11: Typed rest parameters
const matcher11 = match('test[...rest:face]');
const segments11 = [
  { type: 'text', data: { text: 'test' } },
  { type: 'face', data: { id: 1 } },
  { type: 'face', data: { id: 2 } },
  { type: 'text', data: { text: 'hello' } },
  { type: 'image', data: { file: 'test.jpg' } }
];
const result11 = matcher11.match(segments11);
console.log(result11);
// Output: [
//   {
//     rest: [
//       { type: 'face', data: { id: 1 } },
//       { type: 'face', data: { id: 2 } }
//     ]
//   },
//   { type: 'text', data: { text: 'hello' } },
//   { type: 'image', data: { file: 'test.jpg' } }
// ]
```

### Default Value Support

```javascript
// Example 12: Optional parameter default value
const matcher12 = match('foo[mFace:face={"id":1}]');
const segments12a = [
  { type: 'text', data: { text: 'foo' } }
];
const result12a = matcher12.match(segments12a);
console.log(result12a);
// Output: [{ mFace: { id: 1 } }]

const segments12b = [
  { type: 'text', data: { text: 'foo' } },
  { type: 'face', data: { id: 2 } }
];
const result12b = matcher12.match(segments12b);
console.log(result12b);
// Output: [{ mFace: { type: 'face', data: { id: 2 } } }]

// Example 13: String default value
const matcher13 = match('foo[msg:text=hello]');
const segments13 = [
  { type: 'text', data: { text: 'foo' } }
];
const result13 = matcher13.match(segments13);
console.log(result13);
// Output: [{ msg: 'hello' }]
```

## 🔧 API Reference

### Commander

Main class for creating message segment matchers.

#### Constructor

```javascript
new Commander(pattern, typedLiteralFields?)
```

- `pattern` (string): Matching pattern string
- `typedLiteralFields` (Record<string, string | string[]>): Typed literal field mapping, optional parameter

#### Methods

##### action(callback)

Add callback function to processing chain.

- `callback` (Function): Callback function, receives parameters `(params, ...remaining)`, where `params` is the parameter object and `remaining` is the remaining message segments. Supports both synchronous and asynchronous functions.
- Returns: Commander instance, supports chaining

##### match(segments)

Match message segments and execute callback chain (synchronous version).

- `segments` (Array): OneBot12 message segment array
- Returns: Matching result array `[params, ...remaining]` or empty array `[]` (when matching fails)

##### matchAsync(segments)

Match message segments and execute callback chain (asynchronous version).

- `segments` (Array): OneBot12 message segment array
- Returns: Promise<matching result array> or Promise<empty array> (when matching fails)

##### getTokens()

Get parsed tokens (for debugging).

- Returns: Array<PatternToken>

#### Static Properties

##### DEFAULT_TYPED_LITERAL_FIELD_MAP

Default typed literal field mapping.

```javascript
{
  text: 'text',
  face: 'id', 
  image: ['file', 'url'],
  at: 'user_id'
}
```

### Convenience Functions

#### match(pattern, typedLiteralFields?)

Convenience function to create Commander instance.

- `pattern` (string): Matching pattern string
- `typedLiteralFields` (Record<string, string | string[]>): Typed literal field mapping, optional parameter
- Returns: Commander instance

## 🚨 Error Handling

### Exception Types

The project provides multiple custom exception types for easy error location and handling:

```javascript
import { CommanderError, ValidationError, PatternParseError, MatchError } from 'onebot-commander';

try {
  const matcher = new Commander('invalid pattern');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Parameter validation failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Details:', error.details);
  }
}
```

#### CommanderError

Base exception class, contains error code and detailed information.

```javascript
class CommanderError extends Error {
  constructor(message: string, code: string, details?: any);
}
```

#### ValidationError

Parameter validation exception, thrown when invalid parameters are passed.

```javascript
// Common trigger scenarios
new Commander('');                    // Empty pattern
new Commander(null);                  // Non-string pattern
new Commander('hello', 'invalid');    // Invalid field mapping
matcher.match(null);                  // Non-array message segments
```

#### PatternParseError

Pattern parsing exception, thrown when pattern string format is incorrect.

```javascript
// Common trigger scenarios
new Commander('hello <name:text');    // Missing closing bracket
new Commander('hello [name:text');    // Missing closing square bracket
```

### Error Handling Best Practices

```javascript
import { Commander, ValidationError, PatternParseError } from 'onebot-commander';

function createMatcher(pattern) {
  try {
    return new Commander(pattern);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Pattern validation failed:', error.message);
      // Provide default pattern or re-prompt user
      return new Commander('default <text:text>');
    } else if (error instanceof PatternParseError) {
      console.error('Pattern parsing failed:', error.message);
      // Log error and return null
      return null;
    }
    throw error; // Re-throw unknown exceptions
  }
}

function matchSegments(matcher, segments) {
  try {
    return matcher.match(segments);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Message segment validation failed:', error.message);
      return [];
    }
    throw error;
  }
}
```

## ⚡ Performance Optimization

### Performance Benchmarks

Built-in performance benchmark tests can be run with:

```bash
npm run benchmark
```

Typical performance (based on Node.js 18+):

```
🔧 Pattern Parsing Performance:
   Pattern: "hello <name:text>"     - 1,377,924 ops/sec
   Pattern: "test[...rest]"         - 2,511,932 ops/sec
   Pattern: "test[...rest:face]"    - 2,930,832 ops/sec

🎯 Matching Performance:
   Match: "hello <name:text>"       - 559,617 ops/sec
   Match: "test[...rest]"           - 316,834 ops/sec
   Match: "test[...rest:face]"      - 267,298 ops/sec

⛓️  Action Chaining Performance:
   Action Chaining (3 actions)      - 498,532 ops/sec
```

### Performance Optimization Tips

#### 1. Pattern Caching

For frequently used patterns, cache Commander instances:

```javascript
// ❌ Not recommended: Create new instance every time
function processMessage(pattern, segments) {
  const matcher = new Commander(pattern); // Parse pattern every time
  return matcher.match(segments);
}

// ✅ Recommended: Cache instances
const matcherCache = new Map();

function processMessage(pattern, segments) {
  let matcher = matcherCache.get(pattern);
  if (!matcher) {
    matcher = new Commander(pattern);
    matcherCache.set(pattern, matcher);
  }
  return matcher.match(segments);
}
```

#### 2. Batch Processing Optimization

For large numbers of message segments, consider batch processing:

```javascript
// Process large numbers of message segments
function processBatch(segments, batchSize = 100) {
  const results = [];
  for (let i = 0; i < segments.length; i += batchSize) {
    const batch = segments.slice(i, i + batchSize);
    const batchResults = matcher.match(batch);
    results.push(...batchResults);
  }
  return results;
}
```

#### 3. Async Processing Optimization

For async operations, use `matchAsync` to avoid blocking:

```javascript
// Async batch processing
async function processBatchAsync(segments, batchSize = 100) {
  const results = [];
  const batches = [];
  
  // Batch
  for (let i = 0; i < segments.length; i += batchSize) {
    batches.push(segments.slice(i, i + batchSize));
  }
  
  // Parallel processing
  const batchPromises = batches.map(batch => matcher.matchAsync(batch));
  const batchResults = await Promise.all(batchPromises);
  
  return batchResults.flat();
}
```

#### 4. Memory Optimization

Avoid unnecessary deep copying for read-only operations:

```javascript
// If you don't need to modify original data, avoid deep copying
const matcher = new Commander('test<arg:text>');
const segments = [{ type: 'text', data: { text: 'test123' } }];

// Library handles data copying internally, no manual deep copy needed
const result = matcher.match(segments);
```

### Performance Monitoring

In production environments, monitor key performance metrics:

```javascript
// Performance monitoring example
function measurePerformance(fn, name) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start}ms`);
  return result;
}

// Usage example
const result = measurePerformance(() => {
  return matcher.match(segments);
}, 'Message matching');
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode testing
npm run test:watch

# Test coverage
npm run test:coverage
```

## 🏗️ Building and Development

### Building Dual Format Output

The project uses TypeScript to build and automatically generates ESM and CommonJS formats:

```bash
# Build all formats
npm run build

# Build ESM format only
npm run build:esm

# Build CommonJS format only
npm run build:cjs
```

### Build Output Structure

```
dist/
├── esm/           # ESM format output
│   ├── index.js
│   ├── index.d.ts
│   ├── commander.js
│   ├── pattern_parser.js
│   ├── segment_matcher.js
│   └── ...
└── cjs/           # CommonJS format output
    ├── index.cjs
    ├── commander.cjs
    ├── pattern_parser.cjs
    ├── segment_matcher.cjs
    └── ...
```

### Development Scripts

```bash
# Run tests
npm test

# Watch mode testing
npm run test:watch

# Test coverage
npm run test:coverage

# Performance benchmark
npm run benchmark

# Clean build files
npm run clean
```

### Pre-publish Preparation

```bash
# Build and run tests
npm run prepublishOnly
```

## 📄 License

MIT License

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

### Related Documentation

- [📖 中文文档](README.md) - Chinese documentation
- [🔄 Migration Guide](MIGRATION.md) - Migration guide from other libraries
- [🤝 Contributing Guide](CONTRIBUTING.md) - How to contribute to this project

## ⭐ Support

If this project helps you, please give it a star! 