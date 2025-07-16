# 复杂模式

这里展示了一些 OneBot Commander 的复杂模式匹配示例，帮助你掌握高级用法。

## ⚠️ 重要：空格敏感特性

在使用复杂模式时，请特别注意 **OneBot Commander 对空格非常敏感**：

- 模式中的每个空格都必须与输入文本中的空格完全匹配
- 在复杂模式中，空格的处理变得更加重要
- 建议在开发时仔细检查空格的使用

### 空格敏感示例

```typescript
// 复杂模式: "config <key:text> [value:text] [type:text={text:string}]"
const commander = new Commander('config <key:text> [value:text] [type:text={text:string}]');

// ✅ 正确 - 所有空格都匹配
const segments1 = [{ type: 'text', data: { text: 'config theme dark' } }];
const result1 = commander.match(segments1); // 匹配成功

// ❌ 错误 - 缺少空格
const segments2 = [{ type: 'text', data: { text: 'configtheme dark' } }];
const result2 = commander.match(segments2); // 匹配失败

// ❌ 错误 - 多余空格
const segments3 = [{ type: 'text', data: { text: 'config  theme dark' } }];
const result3 = commander.match(segments3); // 匹配失败
```

## 多参数组合

### 1. 混合必需和可选参数

```typescript
import { Commander } from 'onebot-commander';

const commander = new Commander('config <key:text> [value:text] [type:text={text:string}]'); // 注意参数间的空格

commander.action((params) => {
  const { key, value, type } = params;
  
  if (!value) {
    // 获取配置
    return { action: 'get', key, type };
  } else {
    // 设置配置
    return { action: 'set', key, value, type };
  }
});

// 设置配置
const segments1 = [
  { type: 'text', data: { text: 'config theme dark' } } // 注意参数间的空格
];
const result1 = commander.match(segments1);
console.log(result1[0]); // { action: 'set', key: 'theme', value: 'dark', type: { text: 'string' } }

// 获取配置
const segments2 = [
  { type: 'text', data: { text: 'config theme' } } // 注意参数间的空格
];
const result2 = commander.match(segments2);
console.log(result2[0]); // { action: 'get', key: 'theme', type: { text: 'string' } }

// 指定类型
const segments3 = [
  { type: 'text', data: { text: 'config timeout 30 number' } } // 注意参数间的空格
];
const result3 = commander.match(segments3);
console.log(result3[0]); // { action: 'set', key: 'timeout', value: '30', type: 'number' }
```

### 2. 复杂的数据结构

```typescript
const commander = new Commander('user <name:text> <age:number> [email:text] [tags:text]'); // 注意参数间的空格

commander.action((params) => {
  const { name, age, email, tags } = params;
  
  const user = {
    name,
    age,
    email: email || null,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
  };
  
  return { user, timestamp: Date.now() };
});

const segments = [
  { type: 'text', data: { text: 'user Alice 25 alice@example.com admin,moderator' } } // 注意参数间的空格
];

const results = commander.match(segments);
console.log(results[0]);
// {
//   user: {
//     name: 'Alice',
//     age: 25,
//     email: 'alice@example.com',
//     tags: ['admin', 'moderator']
//   },
//   timestamp: 1234567890
// }
```

## 类型化字面量组合

### 1. 多类型字面量

```typescript
const commander = new Commander('{face:1}{text:start}<command:text>[count:number={value:1}]');

commander.action((params) => {
  const { command, count } = params;
  console.log(`表情 + 文本 + 命令: ${command}, 次数: ${count.value}`);
  return { type: 'complex_command', command, count };
});

const segments = [
  { type: 'face', data: { id: 1 } },
  { type: 'text', data: { text: 'start ping' } },
  { type: 'text', data: { text: '5' } }
];

const results = commander.match(segments);
console.log(results[0]); // { command: 'ping', count: 5 }
```

### 2. 条件类型化字面量

```typescript
class ConditionalCommander {
  private commanders = new Map();
  
  constructor() {
    this.setupCommanders();
  }
  
  setupCommanders() {
    // 表情 + 命令
    const faceCommander = new Commander('{face:1}<command:text>');
    faceCommander.action((params) => {
      return { type: 'face_command', command: params.command };
    });
    this.commanders.set('face', faceCommander);
    
    // 图片 + 命令
    const imageCommander = new Commander('{image:icon.png}<command:text>');
    imageCommander.action((params) => {
      return { type: 'image_command', command: params.command };
    });
    this.commanders.set('image', imageCommander);
    
    // 文本 + 命令
    const textCommander = new Commander('{text:cmd}<command:text>');
    textCommander.action((params) => {
      return { type: 'text_command', command: params.command };
    });
    this.commanders.set('text', textCommander);
  }
  
  match(segments) {
    for (const [type, commander] of this.commanders) {
      try {
        const results = commander.match(segments);
        if (results.length > 0) {
          return { type, result: results[0] };
        }
      } catch (error) {
        // 继续尝试下一个
      }
    }
    return null;
  }
}

const conditionalCommander = new ConditionalCommander();

// 测试不同的组合
const testCases = [
  [
    { type: 'face', data: { id: 1 } },
    { type: 'text', data: { text: 'ping' } }
  ],
  [
    { type: 'image', data: { file: 'icon.png' } },
    { type: 'text', data: { text: 'upload' } }
  ],
  [
    { type: 'text', data: { text: 'cmd echo' } }
  ]
];

testCases.forEach((segments, index) => {
  const result = conditionalCommander.match(segments);
  console.log(`测试 ${index + 1}:`, result);
});
```

## 剩余参数高级用法

### 1. 智能剩余参数处理

```typescript
const commander = new Commander('process [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 分析剩余参数
  const analysis = {
    total: items.length,
    types: {},
    textItems: [],
    numericItems: [],
    otherItems: []
  };
  
  for (const item of items) {
    // 统计类型
    analysis.types[item.type] = (analysis.types[item.type] || 0) + 1;
    
    // 分类处理
    if (item.type === 'text') {
      const text = item.data.text;
      analysis.textItems.push(text);
      
      // 检查是否为数字
      if (!isNaN(text)) {
        analysis.numericItems.push(Number(text));
      }
    } else {
      analysis.otherItems.push(item);
    }
  }
  
  return {
    action: 'process',
    analysis,
    summary: `处理了 ${analysis.total} 个项目，包含 ${Object.keys(analysis.types).length} 种类型`
  };
});

const segments = [
  { type: 'text', data: { text: 'process' } },
  { type: 'text', data: { text: 'hello' } },
  { type: 'text', data: { text: '123' } },
  { type: 'face', data: { id: 1 } },
  { type: 'image', data: { file: 'photo.jpg' } }
];

const results = commander.match(segments);
console.log(results[0]);
// {
//   action: 'process',
//   analysis: {
//     total: 4,
//     types: { text: 2, face: 1, image: 1 },
//     textItems: ['hello', '123'],
//     numericItems: [123],
//     otherItems: [{ type: 'face', data: { id: 1 } }, { type: 'image', data: { file: 'photo.jpg' } }]
//   },
//   summary: '处理了 4 个项目，包含 3 种类型'
// }
```

### 2. 分组剩余参数

```typescript
const commander = new Commander('group [...items]');

commander.action((params) => {
  const { items = [] } = params;
  
  // 按类型分组
  const groups = {};
  
  for (const item of items) {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
  }
  
  // 生成分组统计
  const stats = Object.entries(groups).map(([type, items]) => ({
    type,
    count: items.length,
    items
  }));
  
  return {
    action: 'group',
    groups,
    stats,
    totalGroups: Object.keys(groups).length,
    totalItems: items.length
  };
});

const segments = [
  { type: 'text', data: { text: 'group' } },
  { type: 'text', data: { text: 'item1' } },
  { type: 'text', data: { text: 'item2' } },
  { type: 'face', data: { id: 1 } },
  { type: 'face', data: { id: 2 } },
  { type: 'image', data: { file: 'photo1.jpg' } }
];

const results = commander.match(segments);
console.log(results[0]);
// {
//   action: 'group',
//   groups: {
//     text: [{ type: 'text', data: { text: 'item1' } }, { type: 'text', data: { text: 'item2' } }],
//     face: [{ type: 'face', data: { id: 1 } }, { type: 'face', data: { id: 2 } }],
//     image: [{ type: 'image', data: { file: 'photo1.jpg' } }]
//   },
//   stats: [
//     { type: 'text', count: 2, items: [...] },
//     { type: 'face', count: 2, items: [...] },
//     { type: 'image', count: 1, items: [...] }
//   ],
//   totalGroups: 3,
//   totalItems: 5
// }
```

## 嵌套模式

### 1. 子命令模式

```typescript
class SubCommandManager {
  private commanders = new Map();
  
  constructor() {
    this.setupSubCommands();
  }
  
  setupSubCommands() {
    // git 命令
    const gitCommander = new Commander('git <subcommand:text> [...args]');
    gitCommander.action((params) => {
      const { subcommand, args = [] } = params;
      
      switch (subcommand) {
        case 'clone':
          return this.handleGitClone(args);
        case 'push':
          return this.handleGitPush(args);
        case 'pull':
          return this.handleGitPull(args);
        default:
          return { error: `未知的 git 子命令: ${subcommand}` };
      }
    });
    this.commanders.set('git', gitCommander);
    
    // docker 命令
    const dockerCommander = new Commander('docker <subcommand:text> [...args]');
    dockerCommander.action((params) => {
      const { subcommand, args = [] } = params;
      
      switch (subcommand) {
        case 'run':
          return this.handleDockerRun(args);
        case 'build':
          return this.handleDockerBuild(args);
        case 'stop':
          return this.handleDockerStop(args);
        default:
          return { error: `未知的 docker 子命令: ${subcommand}` };
      }
    });
    this.commanders.set('docker', dockerCommander);
  }
  
  handleGitClone(args) {
    const [repo, ...options] = args;
    return {
      command: 'git',
      subcommand: 'clone',
      repository: repo,
      options: options
    };
  }
  
  handleGitPush(args) {
    const [remote, branch] = args;
    return {
      command: 'git',
      subcommand: 'push',
      remote: remote || 'origin',
      branch: branch || 'main'
    };
  }
  
  handleGitPull(args) {
    const [remote, branch] = args;
    return {
      command: 'git',
      subcommand: 'pull',
      remote: remote || 'origin',
      branch: branch || 'main'
    };
  }
  
  handleDockerRun(args) {
    const [image, ...options] = args;
    return {
      command: 'docker',
      subcommand: 'run',
      image,
      options
    };
  }
  
  handleDockerBuild(args) {
    const [context, ...options] = args;
    return {
      command: 'docker',
      subcommand: 'build',
      context: context || '.',
      options
    };
  }
  
  handleDockerStop(args) {
    const [container] = args;
    return {
      command: 'docker',
      subcommand: 'stop',
      container
    };
  }
  
  match(segments) {
    for (const [command, commander] of this.commanders) {
      try {
        const results = commander.match(segments);
        if (results.length > 0) {
          return results[0];
        }
      } catch (error) {
        // 继续尝试下一个
      }
    }
    return null;
  }
}

const manager = new SubCommandManager();

// 测试不同的子命令
const testCommands = [
  { type: 'text', data: { text: 'git clone https://github.com/user/repo.git' } },
  { type: 'text', data: { text: 'git push origin main' } },
  { type: 'text', data: { text: 'docker run nginx' } },
  { type: 'text', data: { text: 'docker build .' } }
];

testCommands.forEach((segments, index) => {
  const result = manager.match([segments]);
  console.log(`命令 ${index + 1}:`, result);
});
```

### 2. 层级命令结构

```typescript
class HierarchicalCommandManager {
  private commanders = new Map();
  
  constructor() {
    this.setupHierarchy();
  }
  
  setupHierarchy() {
    // 系统命令
    const systemCommander = new Commander('system <action:text> [target:text]');
    systemCommander.action((params) => {
      const { action, target } = params;
      return { level: 'system', action, target };
    });
    this.commanders.set('system', systemCommander);
    
    // 应用命令
    const appCommander = new Commander('app <name:text> <action:text> [...args]');
    appCommander.action((params) => {
      const { name, action, args = [] } = params;
      return { level: 'app', name, action, args };
    });
    this.commanders.set('app', appCommander);
    
    // 用户命令
    const userCommander = new Commander('user <id:text> <action:text> [...args]');
    userCommander.action((params) => {
      const { id, action, args = [] } = params;
      return { level: 'user', id, action, args };
    });
    this.commanders.set('user', userCommander);
  }
  
  match(segments) {
    for (const [level, commander] of this.commanders) {
      try {
        const results = commander.match(segments);
        if (results.length > 0) {
          return { level, ...results[0] };
        }
      } catch (error) {
        // 继续尝试下一个
      }
    }
    return null;
  }
}

const hierarchicalManager = new HierarchicalCommandManager();

// 测试不同层级的命令
const testHierarchy = [
  { type: 'text', data: { text: 'system restart server' } },
  { type: 'text', data: { text: 'app webapp start --port 3000' } },
  { type: 'text', data: { text: 'user 12345 login --remember' } }
];

testHierarchy.forEach((segments, index) => {
  const result = hierarchicalManager.match([segments]);
  console.log(`层级命令 ${index + 1}:`, result);
});
```

## 动态模式生成

### 1. 基于配置的模式

```typescript
class DynamicPatternGenerator {
  constructor(config) {
    this.config = config;
  }
  
  generatePattern(command) {
    const { parameters, options } = this.config[command] || {};
    
    if (!parameters) {
      return command;
    }
    
    let pattern = command;
    
    // 添加必需参数
    for (const param of parameters.required || []) {
      pattern += ` <${param.name}:${param.type}>`;
    }
    
    // 添加可选参数
    for (const param of parameters.optional || []) {
      const defaultValue = param.default ? `=${param.default}` : '';
      pattern += ` [${param.name}:${param.type}${defaultValue}]`;
    }
    
    // 添加剩余参数
    if (parameters.rest) {
      pattern += ` [...${parameters.rest.name}]`;
    }
    
    return pattern;
  }
  
  createCommander(command) {
    const pattern = this.generatePattern(command);
    return new Commander(pattern);
  }
}

// 配置示例
const commandConfig = {
  'user': {
    parameters: {
      required: [
        { name: 'name', type: 'text' },
        { name: 'age', type: 'number' }
      ],
      optional: [
        { name: 'email', type: 'text' },
        { name: 'role', type: 'text', default: 'user' }
      ]
    }
  },
  'file': {
    parameters: {
      required: [
        { name: 'action', type: 'text' },
        { name: 'path', type: 'text' }
      ],
      optional: [
        { name: 'mode', type: 'text', default: 'read' }
      ],
      rest: { name: 'options' }
    }
  }
};

const generator = new DynamicPatternGenerator(commandConfig);

// 生成命令解析器
const userCommander = generator.createCommander('user');
const fileCommander = generator.createCommander('file');

console.log('生成的模式:');
console.log('user:', generator.generatePattern('user'));
// 输出: user <name:text> <age:number> [email:text] [role:text=user]

console.log('file:', generator.generatePattern('file'));
// 输出: file <action:text> <path:text> [mode:text=read] [...options]

// 使用生成的解析器
userCommander.action((params) => {
  console.log('用户参数:', params);
  return { type: 'user', ...params };
});

const segments = [
  { type: 'text', data: { text: 'user Alice 25 alice@example.com' } }
];

const results = userCommander.match(segments);
console.log('匹配结果:', results[0]);
```

### 2. 模板模式

```typescript
class TemplatePatternManager {
  constructor() {
    this.templates = new Map();
    this.setupTemplates();
  }
  
  setupTemplates() {
    // CRUD 模板
    this.templates.set('crud', {
      pattern: '{entity} <action:text> [id:text] [...data]',
      description: '通用的 CRUD 操作模板'
    });
    
    // 查询模板
    this.templates.set('query', {
      pattern: 'query <target:text> [filter:text] [limit:number=10] [offset:number=0]',
      description: '通用查询模板'
    });
    
    // 配置模板
    this.templates.set('config', {
      pattern: 'config <key:text> [value:text] [type:text=string]',
      description: '配置管理模板'
    });
  }
  
  createFromTemplate(templateName, entity) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`未知模板: ${templateName}`);
    }
    
    let pattern = template.pattern;
    
    // 替换实体占位符
    if (entity) {
      pattern = pattern.replace('{entity}', entity);
    }
    
    return new Commander(pattern);
  }
  
  getAvailableTemplates() {
    return Array.from(this.templates.entries()).map(([name, template]) => ({
      name,
      pattern: template.pattern,
      description: template.description
    }));
  }
}

const templateManager = new TemplatePatternManager();

// 使用 CRUD 模板创建用户管理命令
const userCrudCommander = templateManager.createFromTemplate('crud', 'user');
userCrudCommander.action((params) => {
  const { action, id, data = [] } = params;
  return { entity: 'user', action, id, data };
});

// 使用查询模板创建搜索命令
const searchCommander = templateManager.createFromTemplate('query', null);
searchCommander.action((params) => {
  const { target, filter, limit, offset } = params;
  return { action: 'query', target, filter, limit, offset };
});

// 测试模板生成的命令
const testTemplates = [
  { type: 'text', data: { text: 'user create 123 name:Alice age:25' } },
  { type: 'text', data: { text: 'query users active 20 0' } }
];

testTemplates.forEach((segments, index) => {
  const result = userCrudCommander.match([segments]);
  console.log(`模板命令 ${index + 1}:`, result);
});

// 显示可用模板
console.log('可用模板:', templateManager.getAvailableTemplates());
```

## 下一步

- [异步处理](/examples/async-examples) - 了解异步操作示例
- [错误处理](/examples/error-handling) - 掌握错误处理技巧
- [性能优化](/examples/performance) - 学习性能优化方法
- [API 参考](/api/commander) - 查看完整的 API 文档

---

<div class="custom-block tip">
  <p class="custom-block-title">💡 提示</p>
  <p>复杂模式展示了 OneBot Commander 的强大功能，合理使用这些高级特性可以构建更加灵活和强大的命令解析系统。</p>
</div> 