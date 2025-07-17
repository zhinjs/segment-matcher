# 贡献指南

感谢您对 OneBot Commander 的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🧪 添加测试用例
- 🌍 翻译文档

## 开发环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/onebot-commander.git
cd onebot-commander
```

### 2. 安装依赖

```bash
npm install
```

### 3. 构建项目

```bash
npm run build
```

### 4. 运行测试

```bash
npm test
```

### 5. 运行基准测试

```bash
npm run benchmark
```

## 开发流程

### 1. 创建分支

```bash
# 从 main 分支创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 开发

- 编写代码
- 添加测试用例
- 更新文档
- 运行测试确保通过

### 3. 提交代码

```bash
# 添加文件
git add .

# 提交代码（使用约定式提交）
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

### 4. 推送分支

```bash
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

在 GitHub 上创建 Pull Request，并填写模板信息。

## 代码规范

### TypeScript 规范

- 使用 TypeScript 4.3.5+
- 启用严格模式
- 使用接口定义类型
- 避免使用 `any` 类型

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 行尾不加分号
- 使用 Prettier 格式化

### 命名规范

- 类名：PascalCase
- 函数名：camelCase
- 常量：UPPER_SNAKE_CASE
- 文件名：snake_case

### 注释规范

```typescript
/**
 * 函数描述
 * @param param1 参数1描述
 * @param param2 参数2描述
 * @returns 返回值描述
 */
function example(param1: string, param2: number): boolean {
  // 实现逻辑
  return true;
}
```

## 测试规范

### 单元测试

- 使用 Jest 测试框架
- 测试覆盖率不低于 90%
- 每个函数都要有对应的测试用例
- 测试用例要覆盖正常情况和异常情况

### 测试文件命名

```
src/__tests__/component.test.ts
```

### 测试用例示例

```typescript
import { Commander } from '../commander';

describe('Commander', () => {
  describe('match', () => {
    it('should match simple text pattern', () => {
      const commander = new Commander('hello');
      const segments = [
        { type: 'text', data: { text: 'hello' } }
      ];
      
      const result = commander.match(segments);
      expect(result).toEqual([{}]);
    });

    it('should handle invalid input', () => {
      const commander = new Commander('hello');
      
      expect(() => {
        commander.match(null);
      }).toThrow(ValidationError);
    });
  });
});
```

## 文档规范

### 代码注释

- 所有公共 API 都要有 JSDoc 注释
- 复杂逻辑要有行内注释
- 注释要简洁明了

### 文档更新

- 新增功能要更新 README
- API 变更要更新文档
- 示例代码要确保可运行

## 提交规范

我们使用 [约定式提交](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 提交示例

```bash
git commit -m "feat: add support for custom field mapping"
git commit -m "fix: resolve pattern parsing issue with optional parameters"
git commit -m "docs: update installation guide"
git commit -m "test: add test cases for error handling"
```

## Pull Request 规范

### PR 标题

使用约定式提交格式：

```
feat: add new feature
fix: resolve bug
docs: update documentation
```

### PR 描述

请包含以下信息：

1. **问题描述**：简要描述要解决的问题或新功能
2. **解决方案**：详细说明实现方案
3. **测试**：说明如何测试
4. **影响**：说明对现有功能的影响
5. **检查清单**：完成相关检查项

### PR 模板

```markdown
## 问题描述
简要描述要解决的问题或新功能

## 解决方案
详细说明实现方案

## 测试
- [ ] 单元测试通过
- [ ] 基准测试通过
- [ ] 手动测试通过

## 影响
- [ ] 向后兼容
- [ ] 性能影响
- [ ] 文档更新

## 检查清单
- [ ] 代码符合规范
- [ ] 测试覆盖率达标
- [ ] 文档已更新
- [ ] 提交信息规范
```

## 发布流程

### 版本号规范

使用 [语义化版本](https://semver.org/)：

- `MAJOR.MINOR.PATCH`
- `MAJOR`: 不兼容的 API 修改
- `MINOR`: 向下兼容的功能性新增
- `PATCH`: 向下兼容的问题修正

### 发布步骤

1. 更新版本号
2. 更新 CHANGELOG
3. 创建发布标签
4. 发布到 npm

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 构建项目
npm run build

# 发布
npm publish
```

## 行为准则

### 社区准则

- 尊重所有贡献者
- 保持专业和友善
- 提供建设性反馈
- 帮助新贡献者

### 沟通渠道

- GitHub Issues：问题报告和功能建议
- GitHub Discussions：一般讨论
- Pull Requests：代码贡献

## 获取帮助

如果您在贡献过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/your-username/onebot-commander/issues)
2. 参与 [GitHub Discussions](https://github.com/your-username/onebot-commander/discussions)

## 致谢

感谢所有为 OneBot Commander 做出贡献的开发者！

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>即使是不完整的贡献也是受欢迎的！我们可以一起完善它。</p>
</div> 