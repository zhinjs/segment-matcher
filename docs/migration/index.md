# 迁移指南

本指南将帮助您从旧版本或其他库迁移到 OneBot Commander。

## 版本兼容性

| 版本范围 | Node.js 要求 | 主要变更 |
|---------|-------------|---------|
| 1.0.0 - 1.0.5 | 16+ | 初始版本 |
| 1.0.6+ | 18+ | 性能优化，错误处理改进 |

## 从其他库迁移

### 从正则表达式迁移

如果你之前使用正则表达式来解析消息，可以这样迁移：

#### 之前的代码

```javascript
// 使用正则表达式
const pattern = /^hello\s+(\w+)$/;
const message = 'hello Alice';

const match = message.match(pattern);
if (match) {
  const name = match[1];
  console.log(`Hello, ${name}!`);
}
```

#### 迁移后的代码

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander('hello <name:text>');
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = commander.match(segments);
if (result.length > 0) {
  const name = result[0].name;
  console.log(`Hello, ${name}!`);
}
```

### 从字符串分割迁移

#### 之前的代码

```javascript
// 使用字符串分割
const message = 'echo Hello World';
const parts = message.split(' ');
const command = parts[0];
const args = parts.slice(1);

if (command === 'echo') {
  console.log(args.join(' '));
}
```

#### 迁移后的代码

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander('echo <message:text>');
const segments = [
  { type: 'text', data: { text: 'echo Hello World' } }
];

const result = commander.match(segments);
if (result.length > 0) {
  console.log(result[0].message);
}
```

### 从其他解析库迁移

如果你使用其他消息解析库，可以参考以下迁移模式：

#### 通用迁移模式

```typescript
// 1. 定义模式映射
const patternMap = {
  'hello <name>': 'hello <name:text>',
  'ping [count]': 'ping [count:number]',
  'image <url>': 'image <url:text>'
};

// 2. 创建 Commander 实例
const commanders = {};
for (const [oldPattern, newPattern] of Object.entries(patternMap)) {
  commanders[oldPattern] = new Commander(newPattern);
}

// 3. 迁移处理逻辑
function migrateHandler(oldHandler, commander) {
  return (segments) => {
    const result = commander.match(segments);
    if (result.length > 0) {
      return oldHandler(result[0]);
    }
    return null;
  };
}
```

## 从 1.0.5 迁移到 1.0.6

### 破坏性变更

#### 1. Node.js 版本要求

**变更**: 最低 Node.js 版本从 16+ 提升到 18+

**迁移步骤**:
```bash
# 检查当前 Node.js 版本
node --version

# 如果版本低于 18，请升级 Node.js
nvm install 18
nvm use 18
```

#### 2. 错误处理改进

**变更**: 新增自定义错误类和参数验证

**迁移步骤**:
```typescript
// 旧版本
try {
  const result = commander.parse(message);
} catch (error) {
  console.error('解析失败:', error.message);
}

// 新版本
try {
  const result = commander.parse(message);
} catch (error) {
  if (error instanceof CommanderError) {
    console.error('命令解析错误:', error.message);
    console.error('错误类型:', error.type);
    console.error('错误代码:', error.code);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 新增功能

#### 1. 自定义错误类

```typescript
import { CommanderError, ValidationError, ParseError } from 'onebot-commander';

// 错误类型检查
if (error instanceof ValidationError) {
  console.error('参数验证失败:', error.details);
} else if (error instanceof ParseError) {
  console.error('解析失败:', error.position);
} else if (error instanceof CommanderError) {
  console.error('命令错误:', error.type);
}
```

#### 2. 参数验证

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

commander
  .command('echo <message>')
  .validate((params) => {
    if (params.message.length > 100) {
      throw new ValidationError('消息长度不能超过100字符');
    }
  })
  .action((params) => {
    console.log(params.message);
  });
```

## 迁移检查清单

在完成迁移后，请检查以下项目：

- [ ] Node.js 版本 >= 18
- [ ] 所有测试通过
- [ ] 错误处理逻辑已更新
- [ ] 性能测试结果正常
- [ ] 文档已更新
- [ ] 依赖包已更新到最新版本

## 回滚指南

如果遇到问题需要回滚：

```bash
# 安装特定版本
npm install onebot-commander@1.0.5

# 或使用 yarn
yarn add onebot-commander@1.0.5
```

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/your-username/onebot-commander/issues)
2. 阅读 [API 文档](/api/)
3. 运行测试用例作为参考
4. 提交详细的错误报告

## 版本历史

详细的版本变更记录请参考 [CHANGELOG.md](https://github.com/your-username/onebot-commander/blob/main/CHANGELOG.md)。

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>建议在迁移前先在测试环境中验证，确保所有功能正常工作后再部署到生产环境。</p>
</div> 