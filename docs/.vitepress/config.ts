import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OneBot Commander',
  description: 'OneBot12 Message Segment Commander - TypeScript version with dual ESM/CJS format support',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['link', { rel: 'stylesheet', href: '/theme/custom.css' }]
  ],

  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '迁移', link: '/migration/' },
      { text: '贡献', link: '/contributing/' },
      { 
        text: 'GitHub', 
        link: 'https://github.com/your-username/onebot-commander',
        target: '_blank'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门指南',
          items: [
            { text: '快速开始', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '模式语法', link: '/guide/pattern-syntax' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '空格敏感特性', link: '/guide/whitespace-sensitivity' },
            { text: '消息段匹配', link: '/guide/message-segments' },
            { text: '参数提取', link: '/guide/parameter-extraction' },
            { text: '链式回调', link: '/guide/action-chaining' },
            { text: '异步处理', link: '/guide/async-processing' }
          ]
        },
        {
          text: '高级特性',
          items: [
            { text: '类型化字面量', link: '/guide/typed-literals' },
            { text: '剩余参数', link: '/guide/rest-parameters' },
            { text: '默认值', link: '/guide/default-values' },
            { text: '自定义字段映射', link: '/guide/custom-fields' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Commander', link: '/api/commander' },
            { text: 'PatternParser', link: '/api/pattern-parser' },
            { text: 'SegmentMatcher', link: '/api/segment-matcher' },
            { text: '错误处理', link: '/api/errors' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '基础示例', link: '/examples/' },
            { text: '复杂模式', link: '/examples/complex-patterns' },
            { text: '异步处理', link: '/examples/async-examples' },
            { text: '错误处理', link: '/examples/error-handling' },
            { text: '性能优化', link: '/examples/performance' }
          ]
        }
      ],
      '/migration/': [
        {
          text: '迁移指南',
          items: [
            { text: '版本兼容性', link: '/migration/' },
            { text: '从 1.0.5 迁移', link: '/migration/from-1.0.5' },
            { text: '常见问题', link: '/migration/faq' }
          ]
        }
      ],
      '/contributing/': [
        {
          text: '贡献指南',
          items: [
            { text: '开发环境', link: '/contributing/' },
            { text: '代码规范', link: '/contributing/code-style' },
            { text: '测试指南', link: '/contributing/testing' },
            { text: '发布流程', link: '/contributing/release' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/onebot-commander' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present OneBot Commander'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: 'material-theme-palenight',
    lineNumbers: true,
    toc: { level: [1, 2, 3] }
  },

  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    css: {
      devSourcemap: true
    }
  }
})
