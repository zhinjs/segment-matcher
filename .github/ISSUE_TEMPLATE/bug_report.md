---
name: 🐛 Bug 报告
about: 创建一个 Bug 报告来帮助我们改进
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: ''
---

## 🐛 Bug 描述

请简要描述这个 Bug：

## 🔄 重现步骤

重现行为的步骤：
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## ✅ 期望行为

请描述您期望发生的事情：

## 📱 环境信息

**操作系统:**
- [ ] Windows
- [ ] macOS
- [ ] Linux
- [ ] 其他 (请说明)

**Node.js 版本:** <!-- 例如: 18.17.0 -->
**onebot-commander 版本:** <!-- 例如: 1.0.6 -->

## 📋 代码示例

```typescript
// 请提供可重现的代码示例
import { Commander } from 'onebot-commander';

const commander = new Commander('test<arg:text>');
const segments = [
  { type: 'text', data: { text: 'test123' } }
];

const result = commander.match(segments);
console.log(result);
```

## 📊 错误信息

如果有错误信息，请提供完整的错误堆栈：

```
错误信息粘贴在这里
```

## 📸 截图

如果适用，请添加截图以帮助解释您的问题：

## 🔍 额外信息

添加关于此问题的任何其他上下文：

## 📋 检查清单

- [ ] 我已经搜索了现有的 issues，确认这是一个新问题
- [ ] 我已经提供了完整的重现步骤
- [ ] 我已经包含了相关的代码示例
- [ ] 我已经提供了环境信息
- [ ] 我已经检查了文档，确认这不是使用错误

---

**感谢您帮助我们改进 onebot-commander！** 🚀 