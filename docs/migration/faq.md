# 迁移常见问题

本页面收集了从 OneBot Commander 旧版本迁移到新版本时的常见问题和解决方案。

## 安装和依赖问题

### Q1: 安装新版本后出现模块解析错误

**问题描述：**
```bash
Error: Cannot find module 'onebot-commander'
```

**可能原因：**
1. 包管理器缓存问题
2. Node.js 版本不兼容
3. 包损坏

**解决方案：**
```bash
# 清理缓存并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 或者使用 yarn
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

### Q2: TypeScript 编译时找不到类型定义

**问题描述：**
```typescript
Module '"onebot-commander"' has no exported member 'Commander'
```

**解决方案：**
1. 检查 `tsconfig.json` 配置：
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  }
}
```

2. 确保安装了正确的版本：
```bash
npm install onebot-commander@latest
```

### Q3: 在 CommonJS 环境中导入失败

**问题描述：**
```javascript
const { Commander } = require('onebot-commander');
// 报错：Commander is not a constructor
```

**解决方案：**
```javascript
// 方法1：使用解构导入
const { Commander } = require('onebot-commander');

// 方法2：使用默认导入
const OneBotCommander = require('onebot-commander');
const commander = new OneBotCommander.Commander();

// 方法3：明确指定 CJS 路径
const { Commander } = require('onebot-commander/dist/cjs/index.cjs');
```

## 运行时问题

### Q4: 模式匹配不工作

**问题描述：**
```typescript
commander.on('text:message', (segment, context) => {
  console.log(context.params.message); // undefined
});
```

**可能原因：**
1. 模式语法错误
2. 消息段格式不匹配
3. 字段映射配置问题

**解决方案：**
```typescript
// 检查模式语法
commander.on('text:message', (segment, context) => {
  console.log('Segment:', segment);
  console.log('Context:', context);
  console.log('Params:', context.params);
});

// 使用调试模式
const commander = new Commander({
  debug: true
});
```

### Q5: 异步处理不工作

**问题描述：**
```typescript
commander.on('text', async (segment, context) => {
  await someAsyncOperation();
  return 'result';
});
// 没有返回结果
```

**解决方案：**
```typescript
// 确保正确处理异步结果
const result = await commander.process([
  { type: 'text', data: { text: 'Hello' } }
]);
console.log(result);

// 或者使用 Promise
commander.process([
  { type: 'text', data: { text: 'Hello' } }
]).then(result => {
  console.log(result);
});
```

### Q6: 链式调用不按预期工作

**问题描述：**
```typescript
commander
  .on('text', (segment, context) => {
    return 'first';
  })
  .on('text', (segment, context) => {
    return 'second';
  });
// 只执行了最后一个处理器
```

**解决方案：**
```typescript
// 链式调用会按注册顺序执行
commander
  .on('text', (segment, context) => {
    console.log('First handler');
    return 'first';
  })
  .on('text', (segment, context) => {
    console.log('Second handler');
    return 'second';
  });

// 如果需要条件执行，使用不同的模式
commander
  .on('text:type1', (segment, context) => {
    return 'type1 handler';
  })
  .on('text:type2', (segment, context) => {
    return 'type2 handler';
  });
```

## 性能问题

### Q7: 处理速度变慢

**问题描述：** 升级后处理消息的速度明显变慢

**可能原因：**
1. 缓存未启用
2. 模式复杂度增加
3. 内存使用过高

**解决方案：**
```typescript
// 启用缓存
const commander = new Commander({
  enableCache: true,
  cacheSize: 1000
});

// 优化模式
// 避免过于复杂的模式
commander.on('text:simple', (segment, context) => {
  // 简单模式
});

// 使用更具体的模式
commander.on('text:command<string>', (segment, context) => {
  // 具体模式
});
```

### Q8: 内存使用过高

**问题描述：** 长时间运行后内存使用量持续增长

**解决方案：**
```typescript
// 定期清理缓存
setInterval(() => {
  commander.clearCache();
}, 300000); // 每5分钟清理一次

// 监控内存使用
const usage = process.memoryUsage();
console.log('Memory usage:', {
  rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`
});
```

## 构建和部署问题

### Q9: Webpack 构建失败

**问题描述：**
```bash
Module not found: Can't resolve 'onebot-commander'
```

**解决方案：**
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'onebot-commander': 'onebot-commander/dist/esm/index.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

### Q10: Rollup 打包问题

**问题描述：** Rollup 无法正确处理双格式包

**解决方案：**
```javascript
// rollup.config.js
export default {
  external: ['onebot-commander'],
  output: {
    globals: {
      'onebot-commander': 'OneBotCommander'
    }
  },
  plugins: [
    // 其他插件...
  ]
};
```

### Q11: Vite 开发服务器问题

**问题描述：** Vite 开发时模块解析错误

**解决方案：**
```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      'onebot-commander': 'onebot-commander/dist/esm/index.js'
    }
  },
  optimizeDeps: {
    include: ['onebot-commander']
  }
};
```

## 类型系统问题

### Q12: TypeScript 类型推断不准确

**问题描述：**
```typescript
commander.on('text:count<number>', (segment, context) => {
  const count = context.params.count; // 类型为 any
});
```

**解决方案：**
```typescript
// 使用类型断言
commander.on('text:count<number>', (segment, context) => {
  const count = context.params.count as number;
  return `Count: ${count}`;
});

// 或者定义接口
interface TextContext {
  params: {
    count: number;
  };
}

commander.on('text:count<number>', (segment, context: TextContext) => {
  const count = context.params.count; // 类型为 number
  return `Count: ${count}`;
});
```

### Q13: 自定义类型不工作

**问题描述：**
```typescript
commander.on('text:data<CustomType>', (segment, context) => {
  // CustomType 类型不生效
});
```

**解决方案：**
```typescript
// 定义自定义类型
interface CustomType {
  id: number;
  name: string;
}

// 使用类型转换
commander.on('text:data<CustomType>', (segment, context) => {
  const data = context.params.data as CustomType;
  return `ID: ${data.id}, Name: ${data.name}`;
});
```

## 新功能使用问题

### Q14: 剩余参数不工作

**问题描述：**
```typescript
commander.on('text:first:string...rest:string[]', (segment, context) => {
  console.log(context.params.rest); // 不是数组
});
```

**解决方案：**
```typescript
// 确保模式语法正确
commander.on('text:first:string...rest:string[]', (segment, context) => {
  console.log('First:', context.params.first);
  console.log('Rest:', context.params.rest); // 应该是数组
});

// 检查消息格式
const result = await commander.process([
  { type: 'text', data: { text: 'hello world test' } }
]);
```

### Q15: 默认值不生效

**问题描述：**
```typescript
commander.on('text:message:string="default"', (segment, context) => {
  console.log(context.params.message); // 不是 "default"
});
```

**解决方案：**
```typescript
// 确保模式语法正确
commander.on('text:message:string="default"', (segment, context) => {
  console.log('Message:', context.params.message);
});

// 测试没有匹配的情况
const result = await commander.process([
  { type: 'text', data: { text: 'other text' } }
]);
```

### Q16: 自定义字段映射不工作

**问题描述：**
```typescript
const commander = new Commander({
  fieldMappings: {
    text: { text: 'content' }
  }
});

commander.on('text:content', (segment, context) => {
  console.log(context.params.content); // undefined
});
```

**解决方案：**
```typescript
// 检查字段映射配置
const commander = new Commander({
  fieldMappings: {
    text: { text: 'content' }
  }
});

// 使用映射后的字段名
commander.on('text:content', (segment, context) => {
  console.log('Segment data:', segment.data);
  console.log('Mapped content:', context.params.content);
});

// 测试
const result = await commander.process([
  { type: 'text', data: { text: 'Hello World' } }
]);
```

## 调试技巧

### Q17: 如何调试模式匹配问题

**解决方案：**
```typescript
// 启用调试模式
const commander = new Commander({
  debug: true
});

// 添加日志
commander.on('text', (segment, context) => {
  console.log('Segment:', JSON.stringify(segment, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  return 'debug response';
});
```

### Q18: 如何检查缓存状态

**解决方案：**
```typescript
// 检查缓存统计
console.log('Cache stats:', commander.getCacheStats());

// 手动清理缓存
commander.clearCache();

// 检查特定模式的缓存
const cached = commander.getCachedPattern('text:message');
console.log('Cached pattern:', cached);
```

### Q19: 如何监控性能

**解决方案：**
```typescript
// 性能监控
const startTime = performance.now();
const result = await commander.process(messages);
const endTime = performance.now();

console.log(`处理耗时: ${endTime - startTime}ms`);

// 批量性能测试
const iterations = 1000;
const startTime = performance.now();

for (let i = 0; i < iterations; i++) {
  await commander.process([
    { type: 'text', data: { text: `test${i}` } }
  ]);
}

const endTime = performance.now();
console.log(`平均处理时间: ${(endTime - startTime) / iterations}ms`);
```

## 获取更多帮助

如果以上解决方案无法解决你的问题：

1. **查看完整文档**：[API 参考](../api/)、[使用指南](../guide/)
2. **查看示例代码**：[示例页面](../examples/)
3. **提交 Issue**：在 GitHub 上提交详细的问题描述
4. **社区支持**：在相关社区寻求帮助

**提交 Issue 时请包含：**
- OneBot Commander 版本
- Node.js 版本
- 操作系统
- 完整的错误信息
- 可复现的代码示例
- 期望的行为 