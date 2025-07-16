# 🔄 Migration Guide

This guide helps you migrate from other command parsing libraries to OneBot Commander.

## 📋 Table of Contents

- [From Regular Expressions](#from-regular-expressions)
- [From String Parsing](#from-string-parsing)
- [From Other Command Libraries](#from-other-command-libraries)
- [Common Migration Patterns](#common-migration-patterns)
- [Troubleshooting](#troubleshooting)

## 🔍 From Regular Expressions

### Before (Regex-based parsing)

```javascript
// Old regex-based approach
const commandRegex = /^hello\s+(\w+)(?:\s+(.+))?$/;

function parseCommand(text) {
  const match = text.match(commandRegex);
  if (!match) return null;
  
  return {
    name: match[1],
    message: match[2] || null
  };
}

// Usage
const result = parseCommand('hello world how are you');
// result: { name: 'world', message: 'how are you' }
```

### After (OneBot Commander)

```javascript
import { match } from 'onebot-commander';

// New OneBot Commander approach
const matcher = match('hello <name:text>[message:text]');

function parseCommand(segments) {
  const result = matcher.match(segments);
  if (result.length === 0) return null;
  
  return result[0];
}

// Usage
const segments = [
  { type: 'text', data: { text: 'hello world how are you' } }
];
const result = parseCommand(segments);
// result: { name: 'world', message: 'how are you' }
```

### Benefits

- ✅ **Type Safety**: Full TypeScript support
- ✅ **Better Error Handling**: Structured exceptions
- ✅ **Extensible**: Easy to add new parameter types
- ✅ **Maintainable**: Declarative pattern syntax

## 📝 From String Parsing

### Before (Manual string parsing)

```javascript
// Old manual parsing approach
function parseCommand(text) {
  const parts = text.split(' ');
  const command = parts[0];
  
  if (command === 'ping') {
    return {
      type: 'ping',
      message: parts.slice(1).join(' ') || null
    };
  }
  
  if (command === 'echo') {
    return {
      type: 'echo',
      message: parts.slice(1).join(' ')
    };
  }
  
  return null;
}

// Usage
parseCommand('ping hello world');
// result: { type: 'ping', message: 'hello world' }
```

### After (OneBot Commander)

```javascript
import { Commander } from 'onebot-commander';

// New OneBot Commander approach
const pingMatcher = new Commander('ping [message:text]');
const echoMatcher = new Commander('echo <message:text>');

function parseCommand(segments) {
  // Try ping command
  const pingResult = pingMatcher.match(segments);
  if (pingResult.length > 0) {
    return { type: 'ping', ...pingResult[0] };
  }
  
  // Try echo command
  const echoResult = echoMatcher.match(segments);
  if (echoResult.length > 0) {
    return { type: 'echo', ...echoResult[0] };
  }
  
  return null;
}

// Usage
const segments = [
  { type: 'text', data: { text: 'ping hello world' } }
];
const result = parseCommand(segments);
// result: { type: 'ping', message: 'hello world' }
```

### Benefits

- ✅ **Structured**: Clear command definitions
- ✅ **Reusable**: Matchers can be cached
- ✅ **Flexible**: Easy to add new commands
- ✅ **Robust**: Better error handling

## 📚 From Other Command Libraries

### From Commander.js

#### Before (Commander.js)

```javascript
const { Command } = require('commander');

const program = new Command();

program
  .name('bot')
  .description('A simple bot')
  .version('1.0.0');

program
  .command('hello')
  .argument('<name>', 'user name')
  .option('-m, --message <message>', 'optional message')
  .action((name, options) => {
    console.log(`Hello ${name}!`);
    if (options.message) {
      console.log(`Message: ${options.message}`);
    }
  });

program.parse();
```

#### After (OneBot Commander)

```javascript
import { Commander } from 'onebot-commander';

const helloMatcher = new Commander('hello <name:text>[-m|--message <message:text>]');

helloMatcher
  .action((params) => {
    console.log(`Hello ${params.name}!`);
    if (params.message) {
      console.log(`Message: ${params.message}`);
    }
  });

// Usage
const segments = [
  { type: 'text', data: { text: 'hello world -m hello there' } }
];
helloMatcher.match(segments);
```

### From Yargs

#### Before (Yargs)

```javascript
const yargs = require('yargs');

const argv = yargs
  .command('search <query>', 'Search for something', {
    limit: {
      alias: 'l',
      type: 'number',
      default: 10
    },
    verbose: {
      alias: 'v',
      type: 'boolean',
      default: false
    }
  })
  .argv;

console.log(`Searching for: ${argv.query}`);
console.log(`Limit: ${argv.limit}`);
console.log(`Verbose: ${argv.verbose}`);
```

#### After (OneBot Commander)

```javascript
import { Commander } from 'onebot-commander';

const searchMatcher = new Commander('search <query:text>[-l|--limit <limit:number=10>][-v|--verbose]');

searchMatcher
  .action((params) => {
    console.log(`Searching for: ${params.query}`);
    console.log(`Limit: ${params.limit}`);
    console.log(`Verbose: ${params.verbose}`);
  });

// Usage
const segments = [
  { type: 'text', data: { text: 'search typescript -l 20 -v' } }
];
searchMatcher.match(segments);
```

## 🔄 Common Migration Patterns

### Pattern 1: Simple Text Commands

#### Before
```javascript
function parseSimpleCommand(text) {
  if (text.startsWith('/help')) {
    return { command: 'help' };
  }
  if (text.startsWith('/ping')) {
    return { command: 'ping' };
  }
  return null;
}
```

#### After
```javascript
import { match } from 'onebot-commander';

const helpMatcher = match('help');
const pingMatcher = match('ping');

function parseSimpleCommand(segments) {
  if (helpMatcher.match(segments).length > 0) {
    return { command: 'help' };
  }
  if (pingMatcher.match(segments).length > 0) {
    return { command: 'ping' };
  }
  return null;
}
```

### Pattern 2: Commands with Parameters

#### Before
```javascript
function parseCommandWithParams(text) {
  const helpMatch = text.match(/^\/help\s+(.+)$/);
  if (helpMatch) {
    return { command: 'help', topic: helpMatch[1] };
  }
  
  const echoMatch = text.match(/^\/echo\s+(.+)$/);
  if (echoMatch) {
    return { command: 'echo', message: echoMatch[1] };
  }
  
  return null;
}
```

#### After
```javascript
import { match } from 'onebot-commander';

const helpMatcher = match('help <topic:text>');
const echoMatcher = match('echo <message:text>');

function parseCommandWithParams(segments) {
  const helpResult = helpMatcher.match(segments);
  if (helpResult.length > 0) {
    return { command: 'help', ...helpResult[0] };
  }
  
  const echoResult = echoMatcher.match(segments);
  if (echoResult.length > 0) {
    return { command: 'echo', ...echoResult[0] };
  }
  
  return null;
}
```

### Pattern 3: Commands with Optional Parameters

#### Before
```javascript
function parseOptionalParams(text) {
  const pingMatch = text.match(/^\/ping(?:\s+(.+))?$/);
  if (pingMatch) {
    return { 
      command: 'ping', 
      message: pingMatch[1] || null 
    };
  }
  
  const configMatch = text.match(/^\/config(?:\s+(\w+))?(?:\s+(.+))?$/);
  if (configMatch) {
    return {
      command: 'config',
      key: configMatch[1] || null,
      value: configMatch[2] || null
    };
  }
  
  return null;
}
```

#### After
```javascript
import { match } from 'onebot-commander';

const pingMatcher = match('ping [message:text]');
const configMatcher = match('config [key:text][value:text]');

function parseOptionalParams(segments) {
  const pingResult = pingMatcher.match(segments);
  if (pingResult.length > 0) {
    return { command: 'ping', ...pingResult[0] };
  }
  
  const configResult = configMatcher.match(segments);
  if (configResult.length > 0) {
    return { command: 'config', ...configResult[0] };
  }
  
  return null;
}
```

### Pattern 4: Complex Commands with Multiple Types

#### Before
```javascript
function parseComplexCommand(text) {
  // Complex regex for parsing commands with multiple parameter types
  const complexMatch = text.match(/^\/send\s+(\w+)\s+(\d+)\s+(.+)$/);
  if (complexMatch) {
    return {
      command: 'send',
      type: complexMatch[1],
      count: parseInt(complexMatch[2]),
      message: complexMatch[3]
    };
  }
  return null;
}
```

#### After
```javascript
import { Commander } from 'onebot-commander';

const sendMatcher = new Commander('send <type:text><count:number><message:text>');

sendMatcher
  .action((params) => {
    return {
      command: 'send',
      type: params.type,
      count: params.count,
      message: params.message
    };
  });

function parseComplexCommand(segments) {
  const result = sendMatcher.match(segments);
  return result.length > 0 ? result[0] : null;
}
```

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Pattern not matching

**Problem**: Your pattern doesn't match expected input.

**Solution**: 
1. Check pattern syntax
2. Verify segment structure
3. Use `getTokens()` for debugging

```javascript
const matcher = new Commander('your pattern');
console.log('Tokens:', matcher.getTokens());
```

#### Issue 2: Performance issues

**Problem**: Slow matching performance.

**Solution**:
1. Cache matcher instances
2. Use batch processing for large datasets
3. Run benchmarks to identify bottlenecks

```javascript
// Cache matchers
const matcherCache = new Map();

function getMatcher(pattern) {
  if (!matcherCache.has(pattern)) {
    matcherCache.set(pattern, new Commander(pattern));
  }
  return matcherCache.get(pattern);
}
```

#### Issue 3: Type errors

**Problem**: TypeScript compilation errors.

**Solution**:
1. Check import statements
2. Verify type definitions
3. Use proper type annotations

```javascript
import { Commander, MessageSegment } from 'onebot-commander';

const segments: MessageSegment[] = [
  { type: 'text', data: { text: 'hello world' } }
];
```

### Getting Help

If you encounter issues during migration:

1. Check the [API Reference](../README.md#api-reference)
2. Review [Error Handling](../README.md#error-handling) section
3. Run tests to verify your implementation
4. Create an issue with detailed information

## 🎯 Migration Checklist

- [ ] Identify all command patterns in your current code
- [ ] Map regex patterns to OneBot Commander patterns
- [ ] Update command parsing functions
- [ ] Add proper error handling
- [ ] Write tests for new implementations
- [ ] Update documentation
- [ ] Performance test the new implementation
- [ ] Deploy and monitor

## 🚀 Next Steps

After migration:

1. **Optimize**: Use caching and batch processing
2. **Extend**: Add new command types and features
3. **Monitor**: Track performance and usage
4. **Contribute**: Share your migration experience

Happy migrating! 🎉 