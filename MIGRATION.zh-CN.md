# 迁移指南

本指南将帮助您从旧版本迁移到 onebot-commander 的最新版本。我们致力于保持 API 的向后兼容性，但在某些情况下，为了改进功能和性能，可能需要引入破坏性变更。

## 版本兼容性

| 版本范围 | Node.js 要求 | 主要变更 |
|---------|-------------|---------|
| 1.0.0 - 1.0.5 | 16+ | 初始版本 |
| 1.0.6+ | 18+ | 性能优化，错误处理改进 |

## 从 1.0.5 迁移到 1.0.6

### 破坏性变更

#### 1. Node.js 版本要求

**变更**: 最低 Node.js 版本从 16+ 提升到 18+

**原因**: 使用 `structuredClone` API 提升性能

**迁移步骤**:
```bash
# 检查当前 Node.js 版本
node --version

# 如果版本低于 18，请升级 Node.js
# 使用 nvm 升级（推荐）
nvm install 18
nvm use 18

# 或使用官方安装包
# https://nodejs.org/
```

#### 2. 错误处理改进

**变更**: 新增自定义错误类和参数验证

**影响**: 错误信息更加详细和结构化

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

#### 3. 性能优化

**变更**: 使用 `structuredClone` 替代 JSON 序列化进行深度克隆

**影响**: 更好的性能和更准确的类型保持

**迁移步骤**: 无需代码变更，自动优化

### 新增功能

#### 1. 自定义错误类

```typescript
import { CommanderError, ValidationError, ParseError } from 'onebot-commander';

// 错误类型检查
if (error instanceof ValidationError) {
  // 参数验证错误
  console.error('参数验证失败:', error.details);
} else if (error instanceof ParseError) {
  // 解析错误
  console.error('解析失败:', error.position);
} else if (error instanceof CommanderError) {
  // 通用命令错误
  console.error('命令错误:', error.type);
}
```

#### 2. 参数验证

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander();

// 添加参数验证
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

#### 3. 性能基准测试

```bash
# 运行性能测试
npm run benchmark

# 输出示例
# 解析性能测试结果:
# - 简单命令: 1,234,567 ops/sec
# - 复杂命令: 123,456 ops/sec
# - 错误处理: 987,654 ops/sec
```

## 从 1.0.0-1.0.4 迁移到 1.0.6

### 主要变更

#### 1. 包结构优化

**变更**: 改进的 ESM/CJS 双格式支持

**迁移步骤**:
```typescript
// 旧版本导入方式仍然有效
import { Commander } from 'onebot-commander';

// 新版本推荐使用 ESM 导入
import { Commander } from 'onebot-commander';
```

#### 2. 类型定义改进

**变更**: 更严格的 TypeScript 类型定义

**迁移步骤**:
```typescript
// 旧版本
const result = commander.parse(message);
const command = result.command; // 可能为 undefined

// 新版本
const result = commander.parse(message);
if (result.matched) {
  const command = result.command; // 类型安全
  console.log('匹配的命令:', command.name);
} else {
  console.log('未找到匹配的命令');
}
```

#### 3. 测试框架更新

**变更**: 改进的测试用例和覆盖率

**迁移步骤**: 无需代码变更，但建议运行测试确保兼容性

```bash
npm test
npm run test:coverage
```

## 常见迁移问题

### 1. 模块导入错误

**问题**: `Cannot resolve module 'onebot-commander'`

**解决方案**:
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 检查 package.json 中的导入配置
```

### 2. TypeScript 类型错误

**问题**: 类型定义不匹配

**解决方案**:
```typescript
// 更新类型导入
import type { 
  Commander, 
  MatchResult, 
  PatternToken,
  CommanderError 
} from 'onebot-commander';
```

### 3. 性能问题

**问题**: 解析速度变慢

**解决方案**:
```typescript
// 使用缓存优化
const commander = new Commander();
commander.enableCache(); // 启用解析缓存

// 或使用预编译模式
commander.precompile();
```

### 4. 错误处理变化

**问题**: 错误信息格式变化

**解决方案**:
```typescript
// 统一错误处理
try {
  const result = commander.parse(message);
} catch (error) {
  if (error instanceof CommanderError) {
    // 处理命令相关错误
    handleCommanderError(error);
  } else {
    // 处理其他错误
    handleGenericError(error);
  }
}

function handleCommanderError(error: CommanderError) {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      console.error('参数验证失败:', error.message);
      break;
    case 'PARSE_ERROR':
      console.error('解析错误:', error.message);
      break;
    default:
      console.error('命令错误:', error.message);
  }
}
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

1. 查看 [GitHub Issues](https://github.com/zhinjs/onebot-commander/issues)
2. 阅读 [API 文档](./README.md)
3. 运行测试用例作为参考
4. 提交详细的错误报告

## 版本历史

详细的版本变更记录请参考 [CHANGELOG.md](./CHANGELOG.md)。

---

感谢您使用 onebot-commander！我们致力于提供平滑的升级体验。 