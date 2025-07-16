---
layout: home
hero:
  name: OneBot Commander
  text: OneBot12 消息段命令解析器
  tagline: 强大的 TypeScript 消息段匹配库，支持 ESM/CJS 双格式
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: 查看 API
      link: /api/
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/your-username/onebot-commander

features:
  - icon: 🚀
    title: 高性能
    details: 基于 TypeScript 构建，编译为原生 JavaScript，性能优异
  - icon: 📦
    title: 双格式支持
    details: 同时支持 ESM 和 CommonJS 模块格式，兼容性极佳
  - icon: 🔧
    title: 灵活配置
    details: 支持自定义类型化字面量字段映射，满足各种需求
  - icon: ⚡
    title: 异步支持
    details: 支持同步和异步回调函数，处理复杂业务逻辑
  - icon: 🎯
    title: 精确匹配
    details: 支持必需参数、可选参数、剩余参数和类型化字面量
  - icon: 🔗
    title: 链式调用
    details: 支持链式回调处理，代码更简洁优雅
  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 类型定义，开发体验优秀
  - icon: 🧪
    title: 测试完善
    details: 90%+ 测试覆盖率，确保代码质量和稳定性
---

## 快速体验

```typescript
import { Commander } from 'onebot-commander';

// 创建命令解析器
const commander = new Commander('hello <name:text>');

// 添加处理逻辑
commander
  .action((params) => {
    console.log(`Hello, ${params.name}!`);
    return params.name.toUpperCase();
  })
  .action((upperName) => {
    console.log(`Uppercase: ${upperName}`);
  });

// 匹配消息段
const segments = [
  { type: 'text', data: { text: 'hello Alice' } }
];

const result = commander.match(segments);
// 输出: Hello, Alice!
// 输出: Uppercase: ALICE
```

## 核心特性

### 🎯 强大的模式匹配

支持复杂的消息段模式匹配：

```typescript
// 基础文本匹配
"hello <name:text>"

// 可选参数
"ping [message:text]"

// 复杂模式
"test<arg1:text>[arg2:face]"

// 类型化字面量
"{text:test}<arg1:text>[arg2:face]"

// 剩余参数
"test[...rest:face]"
```

### ⚡ 异步处理支持

```typescript
const asyncCommander = new Commander('echo <message:text>');

asyncCommander
  .action(async (params) => {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    return params.message.toUpperCase();
  })
  .action(async (upperMessage) => {
    // 继续异步处理
    await new Promise(resolve => setTimeout(resolve, 100));
    return upperMessage.length;
  });

const result = await asyncCommander.matchAsync(segments);
```

### 🔧 自定义字段映射

```typescript
const customCommander = new Commander('{image:avatar.png}<name:text>', {
  image: 'src'  // 匹配 data.src 而不是默认的 data.file/url
});
```

## 性能表现

- **模式解析**: 1.4M-2.9M ops/sec
- **消息匹配**: 248K-751K ops/sec
- **动作链**: 237K-508K ops/sec

## 开始使用

<div class="vp-raw">
  <div class="language-bash">
    <button class="copy"></button>
    <span class="lang">bash</span>
    <pre class="shiki" style="background-color: #1e1e1e"><code><span class="line"><span style="color: #D4D4D4">npm install onebot-commander</span></span></code></pre>
  </div>
</div>

## 相关链接

- [📖 完整文档](/guide/)
- [🔧 API 参考](/api/)
- [💡 使用示例](/examples/)
- [🔄 迁移指南](/migration/)
- [🤝 贡献指南](/contributing/)
- [⭐ GitHub 仓库](https://github.com/your-username/onebot-commander)

---

<div class="vp-raw">
  <div class="custom-block tip">
    <p class="custom-block-title">💡 提示</p>
    <p>OneBot Commander 专为 OneBot12 消息段设计，提供类型安全、高性能的消息解析能力。</p>
  </div>
</div>

