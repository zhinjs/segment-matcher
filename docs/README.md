# OneBot Commander 文档站

这是 OneBot Commander 的官方文档站，使用 VitePress 构建。

## 快速开始

### 开发模式

```bash
npm run docs:dev
```

访问 http://localhost:5173 查看文档。

### 构建生产版本

```bash
npm run docs:build
```

构建产物位于 `docs/.vitepress/dist` 目录。

### 预览生产版本

```bash
npm run docs:preview
```

## 文档结构

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress 配置
│   └── theme/
│       └── custom.css     # 自定义样式
├── public/                # 静态资源
│   ├── favicon.ico
│   └── logo.png
├── guide/                 # 指南文档
│   ├── index.md
│   └── installation.md
├── api/                   # API 文档
│   └── commander.md
├── examples/              # 示例文档
│   └── index.md
├── migration/             # 迁移指南
│   └── index.md
├── contributing/          # 贡献指南
│   └── index.md
└── index.md              # 首页
```

## 自定义

### 修改配置

编辑 `docs/.vitepress/config.ts` 文件来修改：

- 站点标题和描述
- 导航栏和侧边栏
- 主题配置
- 插件设置

### 添加样式

编辑 `docs/.vitepress/theme/custom.css` 文件来自定义样式。

### 添加页面

在相应目录下创建 `.md` 文件，并在配置中添加导航链接。

## 部署

### GitHub Pages

1. 构建文档：`npm run docs:build`
2. 将 `docs/.vitepress/dist` 目录部署到 GitHub Pages

### Netlify

1. 连接 GitHub 仓库
2. 设置构建命令：`npm run docs:build`
3. 设置发布目录：`docs/.vitepress/dist`

### Vercel

1. 导入 GitHub 仓库
2. 设置构建命令：`npm run docs:build`
3. 设置输出目录：`docs/.vitepress/dist`

## 贡献

欢迎贡献文档改进！

1. Fork 仓库
2. 创建功能分支
3. 修改文档
4. 提交 Pull Request

## 许可证

MIT License 