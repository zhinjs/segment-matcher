# 发布流程

本页面详细介绍了 OneBot Commander 项目的发布流程和版本管理策略。

## 版本管理

### 语义化版本

我们遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) 规范：

```
主版本号.次版本号.修订号
```

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 版本类型

```bash
# 主版本发布（重大变更）
npm version major  # 1.0.0 -> 2.0.0

# 次版本发布（新功能）
npm version minor  # 1.0.0 -> 1.1.0

# 修订版本发布（bug 修复）
npm version patch  # 1.0.0 -> 1.0.1

# 预发布版本
npm version prerelease --preid=beta  # 1.0.0 -> 1.0.0-beta.0
```

### 版本标签

```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

## 发布前检查清单

### 代码质量检查

```bash
# 运行所有测试
npm test

# 检查测试覆盖率
npm run test:coverage

# 运行代码检查
npm run lint

# 检查代码格式
npm run format:check

# 运行性能基准测试
npm run benchmark
```

### 文档检查

- [ ] README.md 更新
- [ ] API 文档更新
- [ ] 示例代码更新
- [ ] 迁移指南更新
- [ ] 变更日志更新

### 构建检查

```bash
# 清理构建目录
npm run clean

# 构建项目
npm run build

# 验证构建输出
ls -la dist/
```

## 发布流程

### 1. 准备发布分支

```bash
# 确保在主分支上
git checkout main

# 拉取最新代码
git pull origin main

# 创建发布分支
git checkout -b release/v1.0.0
```

### 2. 更新版本号

```bash
# 更新 package.json 版本号
npm version patch  # 或 minor, major

# 或者手动编辑 package.json
{
  "version": "1.0.1"
}
```

### 3. 更新变更日志

```markdown
# CHANGELOG.md

## [1.0.1] - 2024-01-15

### 修复
- 修复模式匹配中的内存泄漏问题
- 修复 TypeScript 类型定义错误

### 改进
- 优化缓存性能
- 改进错误处理机制

### 新增
- 添加新的调试选项
```

### 4. 构建和测试

```bash
# 安装依赖
npm ci

# 运行测试
npm test

# 构建项目
npm run build

# 验证构建结果
node -e "console.log(require('./dist/esm/index.js'))"
```

### 5. 提交更改

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "chore: prepare release v1.0.1

- Update version to 1.0.1
- Update changelog
- Fix build issues"

# 推送分支
git push origin release/v1.0.0
```

### 6. 创建 Pull Request

在 GitHub 上创建 Pull Request，从 `release/v1.0.0` 到 `main`。

**PR 标题格式：**
```
Release v1.0.1
```

**PR 描述：**
```markdown
## 发布说明

### 版本
v1.0.1

### 变更类型
- [x] Bug 修复
- [x] 性能改进
- [ ] 新功能
- [ ] 破坏性变更

### 主要变更
- 修复模式匹配中的内存泄漏问题
- 优化缓存性能
- 改进错误处理机制

### 测试
- [x] 单元测试通过
- [x] 集成测试通过
- [x] 性能测试通过
- [x] 构建验证通过

### 文档
- [x] README 更新
- [x] API 文档更新
- [x] 变更日志更新

Closes #123
```

### 7. 代码审查

确保以下项目通过审查：

- [ ] 代码质量检查通过
- [ ] 测试覆盖率达标
- [ ] 文档更新完整
- [ ] 构建验证通过
- [ ] 性能测试通过

### 8. 合并和发布

```bash
# 合并到主分支
git checkout main
git merge release/v1.0.0

# 创建版本标签
git tag -a v1.0.1 -m "Release version 1.0.1"

# 推送主分支和标签
git push origin main
git push origin v1.0.1

# 发布到 npm
npm publish

# 清理发布分支
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

## 自动化发布

### GitHub Actions 自动化

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Publish to npm
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body: |
          ## 变更日志
          
          请查看 [CHANGELOG.md](https://github.com/your-username/onebot-commander/blob/main/CHANGELOG.md) 了解详细变更。
          
          ## 安装
          
          ```bash
          npm install onebot-commander@${{ github.ref_name }}
          ```
        
        draft: false
        prerelease: false
```

### 发布脚本

```javascript
// scripts/release.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  console.log(`执行: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function updateChangelog(version) {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  let content = fs.readFileSync(changelogPath, 'utf8');
  
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `\n## [${version}] - ${today}\n\n### 修复\n\n### 改进\n\n### 新增\n\n`;
  
  // 在第一个版本条目前插入新条目
  const lines = content.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## ['));
  lines.splice(insertIndex, 0, newEntry);
  
  fs.writeFileSync(changelogPath, lines.join('\n'));
  console.log(`更新变更日志: ${version}`);
}

function main() {
  const version = process.argv[2];
  if (!version) {
    console.error('请提供版本号');
    process.exit(1);
  }
  
  try {
    // 检查工作目录是否干净
    const status = execSync('git status --porcelain').toString();
    if (status.trim()) {
      console.error('工作目录不干净，请先提交所有更改');
      process.exit(1);
    }
    
    // 运行测试
    runCommand('npm test');
    
    // 运行代码检查
    runCommand('npm run lint');
    
    // 构建项目
    runCommand('npm run build');
    
    // 更新版本号
    runCommand(`npm version ${version} --no-git-tag-version`);
    
    // 更新变更日志
    updateChangelog(version);
    
    // 提交更改
    runCommand('git add .');
    runCommand(`git commit -m "chore: release v${version}"`);
    
    // 创建标签
    runCommand(`git tag -a v${version} -m "Release version ${version}"`);
    
    // 推送更改
    runCommand('git push origin main');
    runCommand(`git push origin v${version}`);
    
    console.log(`✅ 版本 ${version} 发布成功！`);
    
  } catch (error) {
    console.error('发布失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

## 预发布版本

### Beta 版本

```bash
# 创建 beta 版本
npm version prerelease --preid=beta

# 发布 beta 版本
npm publish --tag beta
```

### RC 版本

```bash
# 创建 RC 版本
npm version prerelease --preid=rc

# 发布 RC 版本
npm publish --tag rc
```

### 安装预发布版本

```bash
# 安装最新的 beta 版本
npm install onebot-commander@beta

# 安装特定的预发布版本
npm install onebot-commander@1.0.0-beta.1
```

## 回滚发布

### 撤销 npm 发布

```bash
# 撤销特定版本（24小时内）
npm unpublish onebot-commander@1.0.1

# 撤销整个包（72小时内）
npm unpublish onebot-commander --force
```

### 撤销 Git 标签

```bash
# 删除本地标签
git tag -d v1.0.1

# 删除远程标签
git push origin --delete v1.0.1
```

### 回滚代码

```bash
# 回滚到上一个版本
git revert HEAD

# 或者重置到特定提交
git reset --hard <commit-hash>
git push origin main --force
```

## 发布后检查

### 验证发布

```bash
# 检查 npm 包信息
npm view onebot-commander

# 检查版本历史
npm view onebot-commander versions

# 测试安装
npm install onebot-commander@latest
```

### 更新文档

- [ ] 更新 GitHub 发布说明
- [ ] 更新项目主页
- [ ] 更新 API 文档
- [ ] 发送发布通知

### 监控

- [ ] 监控错误报告
- [ ] 监控性能指标
- [ ] 监控下载统计
- [ ] 收集用户反馈

## 发布频率

### 常规发布

- **修订版本**：每周或根据需要
- **次版本**：每月或功能完成时
- **主版本**：重大变更时

### 发布窗口

- **常规发布**：周二 14:00 UTC
- **紧急修复**：随时发布
- **预发布**：功能开发完成后

## 发布团队

### 角色分工

- **发布经理**：负责发布流程协调
- **代码审查员**：负责代码质量检查
- **测试工程师**：负责测试验证
- **文档维护者**：负责文档更新

### 发布权限

- **npm 发布权限**：项目维护者
- **GitHub 发布权限**：项目维护者
- **文档更新权限**：所有贡献者

## 发布最佳实践

### 1. 版本规划

```bash
# 使用 conventional commits
git commit -m "feat: add new pattern matching feature"
git commit -m "fix: resolve memory leak in cache"
git commit -m "docs: update API documentation"
```

### 2. 变更日志管理

```markdown
# 使用标准格式
## [1.0.1] - 2024-01-15

### 修复
- 修复模式匹配中的内存泄漏问题

### 改进
- 优化缓存性能

### 新增
- 添加新的调试选项
```

### 3. 测试策略

```bash
# 发布前完整测试
npm run test:all
npm run test:coverage
npm run test:integration
npm run test:performance
```

### 4. 沟通策略

- 提前通知用户重大变更
- 提供详细的迁移指南
- 及时响应用户反馈
- 维护良好的社区关系

遵循这些发布流程可以确保项目的稳定性和可靠性，同时为用户提供高质量的软件包。 