# 贡献指南

感谢您对 segment-matcher 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 Bug 报告
- ✨ 新功能建议
- 📝 文档改进
- 🧪 测试用例
- 🔧 代码优化

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Git

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/zhinjs/segment-matcher.git
   cd segment-matcher
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **运行测试**
   ```bash
   npm test
   ```

## 开发工作流

### 1. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 开发规范

#### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 函数和类必须有 JSDoc 注释

#### 提交信息格式
使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型说明：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: 添加新的消息段类型支持"
git commit -m "fix(parser): 修复嵌套参数解析问题"
```

### 3. 测试要求

#### 单元测试
- 所有新功能必须包含测试用例
- 测试覆盖率不低于 90%
- 运行测试：`npm test`

#### 性能测试
- 新功能需要运行性能基准测试
- 确保性能不会显著下降
- 运行基准测试：`npm run benchmark`

### 4. 文档更新

- 更新 README.md 中的相关说明
- 添加新功能的示例代码
- 更新 API 文档

## 提交 Pull Request

### PR 检查清单

- [ ] 代码通过所有测试
- [ ] 新功能包含测试用例
- [ ] 文档已更新
- [ ] 提交信息符合规范
- [ ] 代码已格式化
- [ ] 没有控制台调试输出

### PR 模板

```markdown
## 变更描述
简要描述此次变更的内容和原因。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性变更
- [ ] 文档更新

## 测试
- [ ] 单元测试通过
- [ ] 性能测试通过
- [ ] 手动测试完成

## 相关 Issue
Closes #(issue number)

## 其他信息
任何其他需要说明的信息。
```

## 问题报告

### Bug 报告模板

```markdown
## 环境信息
- Node.js 版本：
- 操作系统：
- segment-matcher 版本：

## 问题描述
详细描述遇到的问题。

## 重现步骤
1. 
2. 
3. 

## 期望行为
描述期望的正确行为。

## 实际行为
描述实际发生的行为。

## 错误信息
如果有错误信息，请提供完整的错误堆栈。

## 代码示例
```typescript
// 提供可重现的代码示例
```

## 其他信息
任何其他相关信息。
```

### 功能请求模板

```markdown
## 功能描述
详细描述您希望添加的功能。

## 使用场景
描述该功能的使用场景和解决的问题。

## 实现建议
如果有实现建议，请提供。

## 相关讨论
任何相关的讨论或参考链接。
```

## 发布流程

### 版本号规则

遵循 [Semantic Versioning](https://semver.org/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布步骤

1. **更新版本号**
   ```bash
   npm version patch|minor|major
   ```

2. **更新 CHANGELOG.md**
   - 记录所有变更
   - 按类型分类
   - 添加迁移说明（如有破坏性变更）

3. **构建和测试**
   ```bash
   npm run build
   npm test
   npm run benchmark
   ```

4. **发布到 npm**
   ```bash
   npm publish
   ```

## 行为准则

### 社区准则

- 尊重所有贡献者
- 保持专业和友善的交流
- 欢迎新手提问
- 提供建设性的反馈

### 沟通渠道

- GitHub Issues：问题报告和功能讨论
- GitHub Discussions：一般性讨论
- Pull Requests：代码审查和合并

## 致谢

感谢所有为项目做出贡献的开发者！您的贡献让 segment-matcher 变得更好。

---

如有任何问题，请随时在 GitHub Issues 中提出。 