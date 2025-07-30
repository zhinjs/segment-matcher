import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Segment Matcher',
  description: 'TypeScript 消息段匹配器，支持空格敏感的模式匹配和类型化参数提取',
  lang: 'zh-CN',
  
  themeConfig: {
    siteTitle: 'Segment Matcher',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      {
        text: 'GitHub',
        link: 'https://github.com/your-username/segment-matcher',
        target: '_blank'
      }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/' },
          ]
        }
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/segment-matcher' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Segment Matcher'
    }
  }
}) 