# 新特性高级示例

本页面展示 OneBot Commander 新特性的高级使用方法和实际应用场景。

## 🎯 特殊类型规则高级应用

### 智能数据处理命令

```typescript
import { Commander } from 'onebot-commander';

// 数据分析命令
const analysisCmd = new Commander(
  '分析数据 <样本数:integer> <精度:float> [置信度:number=0.95] [启用缓存:boolean=true]'
);

analysisCmd.action((params) => {
  console.log('数据分析配置:');
  console.log(`📊 样本数: ${params.样本数} 个`);
  console.log(`🎯 精度: ${params.精度.toFixed(2)}`);
  console.log(`📈 置信度: ${(params.置信度 * 100).toFixed(1)}%`);
  console.log(`💾 缓存: ${params.启用缓存 ? '启用' : '禁用'}`);
  
  // 验证业务逻辑
  if (params.样本数 < 100) {
    return { error: '样本数不能少于100个' };
  }
  
  if (params.精度 < 0.1 || params.精度 > 1.0) {
    return { error: '精度必须在0.1-1.0之间' };
  }
  
  // 执行分析逻辑
  return {
    config: {
      samples: params.样本数,
      precision: params.精度,
      confidence: params.置信度,
      cache: params.启用缓存
    },
    status: 'ready'
  };
});

// 测试用例
analysisCmd.match([{ type: 'text', data: { text: '分析数据 1000 0.85 0.99 false' } }]);
// 完整参数配置

analysisCmd.match([{ type: 'text', data: { text: '分析数据 500 0.75' } }]);
// 使用部分默认值
```

### 游戏服务器配置

```typescript
// 游戏服务器启动命令
const serverCmd = new Commander(
  '启动服务器 [端口:integer=8080] [最大玩家:integer=100] [超时:float=30.5] [调试模式:boolean=false]'
);

serverCmd.action((params) => {
  const config = {
    port: params.端口,
    maxPlayers: params.最大玩家,
    timeout: params.超时,
    debug: params.调试模式
  };
  
  console.log('🚀 服务器配置:');
  console.log(`🌐 端口: ${config.port}`);
  console.log(`👥 最大玩家数: ${config.maxPlayers}`);
  console.log(`⏱️ 超时时间: ${config.timeout}s`);
  console.log(`🐛 调试模式: ${config.debug ? '开启' : '关闭'}`);
  
  // 模拟服务器启动
  return { server: config, status: 'running' };
});

// 快速启动（全默认）
serverCmd.match([{ type: 'text', data: { text: '启动服务器 ' } }]);

// 生产环境配置
serverCmd.match([{ type: 'text', data: { text: '启动服务器 80 1000 60.0 false' } }]);

// 开发环境配置
serverCmd.match([{ type: 'text', data: { text: '启动服务器 3000 10 5.0 true' } }]);
```

## 🔄 动态字段映射实际应用

### 多平台消息处理

```typescript
// 平台适配管理器
class PlatformAdapter {
  // 不同平台的字段映射配置
  private static readonly PLATFORM_MAPPINGS = {
    qq: {
      face: 'id',
      image: ['file', 'url'],
      at: 'user_id',
      voice: 'file'
    },
    wechat: {
      face: 'emoji_id',
      image: 'media_url',
      at: 'mention_id',
      voice: 'media_id'
    },
    telegram: {
      face: 'emoji',
      image: ['photo_url', 'file_url'],
      at: 'username',
      voice: 'audio_url'
    },
    discord: {
      face: 'emoji_name',
      image: ['attachment_url', 'embed_image'],
      at: 'user_mention',
      voice: 'voice_file'
    }
  };

  static getFieldMapping(platform: string) {
    return this.PLATFORM_MAPPINGS[platform] || {};
  }

  static createCommander(pattern: string, platform: string) {
    return new Commander(pattern, this.getFieldMapping(platform));
  }
}

// 通用媒体处理命令
const createMediaCommand = (platform: string) => {
  return PlatformAdapter.createCommander(
    '发送媒体 <图片:image> [表情:face] [语音:voice] [提及:at]',
    platform
  );
};

// 为不同平台创建命令处理器
const platforms = ['qq', 'wechat', 'telegram', 'discord'];
const mediaCommands = {};

platforms.forEach(platform => {
  const cmd = createMediaCommand(platform);
  
  cmd.action((params) => {
    console.log(`${platform.toUpperCase()} 平台媒体处理:`);
    if (params.图片) console.log(`🖼️ 图片: ${params.图片}`);
    if (params.表情) console.log(`😀 表情: ${params.表情}`);
    if (params.语音) console.log(`🎵 语音: ${params.语音}`);
    if (params.提及) console.log(`👤 提及: ${params.提及}`);
    
    return { platform, media: params };
  });
  
  mediaCommands[platform] = cmd;
});

// 模拟不同平台的消息段
const qqMessage = [
  { type: 'text', data: { text: '发送媒体 ' } },
  { type: 'image', data: { file: 'qq_image.jpg' } },
  { type: 'face', data: { id: 123 } },
  { type: 'at', data: { user_id: 'user123' } }
];

const wechatMessage = [
  { type: 'text', data: { text: '发送媒体 ' } },
  { type: 'image', data: { media_url: 'https://wx.qq.com/image.jpg' } },
  { type: 'face', data: { emoji_id: '😀' } },
  { type: 'at', data: { mention_id: '@user123' } }
];

// 测试不同平台
mediaCommands.qq.match(qqMessage);
mediaCommands.wechat.match(wechatMessage);
```

### 条件字段映射

```typescript
// 动态字段映射配置
class DynamicFieldConfig {
  static createImageMapping(highQuality: boolean, supportWebP: boolean) {
    const mapping = {};
    
    if (highQuality) {
      mapping.image = supportWebP 
        ? ['hd_webp', 'hd_jpg', 'webp', 'jpg', 'png']
        : ['hd_jpg', 'jpg', 'png'];
    } else {
      mapping.image = supportWebP
        ? ['webp', 'jpg', 'png']
        : ['jpg', 'png'];
    }
    
    return mapping;
  }
  
  static createUserMapping(useDisplayName: boolean, includeAvatar: boolean) {
    const mapping = {
      at: useDisplayName ? ['display_name', 'username', 'user_id'] : ['user_id', 'username']
    };
    
    if (includeAvatar) {
      mapping.image = ['avatar_hd', 'avatar', 'default_avatar'];
    }
    
    return mapping;
  }
}

// 根据设备能力创建命令
const createImageCommand = (deviceConfig: any) => {
  const fieldMapping = DynamicFieldConfig.createImageMapping(
    deviceConfig.highQuality,
    deviceConfig.supportWebP
  );
  
  return new Commander('展示图片 <pic:image>', fieldMapping);
};

// 不同设备配置
const mobileConfig = { highQuality: false, supportWebP: true };
const desktopConfig = { highQuality: true, supportWebP: true };
const legacyConfig = { highQuality: false, supportWebP: false };

const mobileCmd = createImageCommand(mobileConfig);
const desktopCmd = createImageCommand(desktopConfig);
const legacyCmd = createImageCommand(legacyConfig);
```

## 📱 实际应用场景

### 机器人命令系统

```typescript
// 聊天机器人命令系统
class ChatBot {
  private commands = new Map<string, Commander>();
  
  constructor(platform: string) {
    this.initializeCommands(platform);
  }
  
  private initializeCommands(platform: string) {
    const fieldMapping = PlatformAdapter.getFieldMapping(platform);
    
    // 用户管理命令
    const userCmd = new Commander(
      '用户 <操作:text> <用户ID:integer> [新昵称:text] [新等级:integer] [启用:boolean=true]',
      fieldMapping
    );
    
    userCmd.action((params) => {
      const { 操作, 用户ID, 新昵称, 新等级, 启用 } = params;
      
      switch (操作) {
        case '查询':
          return this.queryUser(用户ID);
        case '更新':
          return this.updateUser(用户ID, { 昵称: 新昵称, 等级: 新等级, 启用 });
        case '删除':
          return this.deleteUser(用户ID);
        default:
          return { error: '不支持的操作' };
      }
    });
    
    // 数据统计命令
    const statsCmd = new Commander(
      '统计 <类型:text> [开始时间:integer] [结束时间:integer] [详细模式:boolean=false]',
      fieldMapping
    );
    
    statsCmd.action((params) => {
      return this.generateStats(
        params.类型,
        params.开始时间,
        params.结束时间,
        params.详细模式
      );
    });
    
    // 系统配置命令
    const configCmd = new Commander(
      '配置 <项目:text> <值:text> [重启服务:boolean=false]',
      fieldMapping
    );
    
    configCmd.action((params) => {
      return this.updateConfig(params.项目, params.值, params.重启服务);
    });
    
    this.commands.set('用户', userCmd);
    this.commands.set('统计', statsCmd);
    this.commands.set('配置', configCmd);
  }
  
  private queryUser(userId: number) {
    // 模拟用户查询
    return {
      id: userId,
      nickname: `用户${userId}`,
      level: Math.floor(Math.random() * 100),
      active: true
    };
  }
  
  private updateUser(userId: number, updates: any) {
    // 模拟用户更新
    console.log(`更新用户 ${userId}:`, updates);
    return { success: true, userId, updates };
  }
  
  private deleteUser(userId: number) {
    // 模拟用户删除
    console.log(`删除用户 ${userId}`);
    return { success: true, userId, action: 'deleted' };
  }
  
  private generateStats(type: string, start?: number, end?: number, detailed = false) {
    // 模拟统计生成
    return {
      type,
      period: { start, end },
      detailed,
      data: {
        total: Math.floor(Math.random() * 10000),
        active: Math.floor(Math.random() * 5000)
      }
    };
  }
  
  private updateConfig(key: string, value: string, restart = false) {
    // 模拟配置更新
    console.log(`配置更新: ${key} = ${value}`);
    if (restart) {
      console.log('重启服务中...');
    }
    return { success: true, config: { [key]: value }, restart };
  }
  
  processMessage(segments: any[]) {
    for (const [name, command] of this.commands) {
      const result = command.match(segments);
      if (result.length > 0) {
        return { command: name, result: result[0] };
      }
    }
    return { error: '未知命令' };
  }
}

// 创建不同平台的机器人
const qqBot = new ChatBot('qq');
const wechatBot = new ChatBot('wechat');

// 测试命令
const testMessages = [
  [{ type: 'text', data: { text: '用户 查询 12345' } }],
  [{ type: 'text', data: { text: '统计 活跃用户 1640995200 1641081600 true' } }],
  [{ type: 'text', data: { text: '配置 最大连接数 1000 true' } }],
];

testMessages.forEach(segments => {
  console.log('QQ Bot:', qqBot.processMessage(segments));
  console.log('WeChat Bot:', wechatBot.processMessage(segments));
});
```

### 数据验证和转换

```typescript
// 高级数据验证命令
class DataValidator {
  static createValidatedCommand(pattern: string, validators: any = {}) {
    const cmd = new Commander(pattern);
    
    cmd.action((params) => {
      const errors = [];
      const processedParams = {};
      
      for (const [key, value] of Object.entries(params)) {
        const validator = validators[key];
        
        if (validator) {
          try {
            const validated = validator(value);
            if (validated.valid) {
              processedParams[key] = validated.value;
            } else {
              errors.push(`${key}: ${validated.error}`);
            }
          } catch (error) {
            errors.push(`${key}: 验证失败`);
          }
        } else {
          processedParams[key] = value;
        }
      }
      
      if (errors.length > 0) {
        return { success: false, errors };
      }
      
      return { success: true, data: processedParams };
    });
    
    return cmd;
  }
}

// 用户注册验证
const registerCmd = DataValidator.createValidatedCommand(
  '注册 <用户名:text> <年龄:integer> <邮箱:text> [VIP:boolean=false]',
  {
    用户名: (value) => {
      if (value.length < 3) return { valid: false, error: '用户名至少3个字符' };
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return { valid: false, error: '用户名只能包含字母、数字和下划线' };
      return { valid: true, value: value.toLowerCase() };
    },
    年龄: (value) => {
      if (value < 13) return { valid: false, error: '年龄不能小于13岁' };
      if (value > 120) return { valid: false, error: '年龄不能大于120岁' };
      return { valid: true, value };
    },
    邮箱: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return { valid: false, error: '邮箱格式不正确' };
      return { valid: true, value: value.toLowerCase() };
    }
  }
);

// 测试验证
registerCmd.match([{ type: 'text', data: { text: '注册 abc 15 test@example.com true' } }]);
// 正常注册

registerCmd.match([{ type: 'text', data: { text: '注册 ab 10 invalid-email false' } }]);
// 多项验证失败
```

## 🛠️ 自定义类型匹配器

### 创建业务特定的类型

```typescript
import { TypeMatcher, TypeMatchResult, TypeMatcherRegistry } from 'onebot-commander';

// 中国手机号匹配器
class ChinesePhoneMatcher implements TypeMatcher {
  private readonly phoneRegex = /^1[3-9]\d{9}$/;
  
  match(text: string): TypeMatchResult {
    if (!this.phoneRegex.test(text)) {
      return { success: false };
    }
    
    // 格式化手机号
    const formatted = `${text.slice(0, 3)}-${text.slice(3, 7)}-${text.slice(7)}`;
    
    return {
      success: true,
      value: {
        raw: text,
        formatted,
        carrier: this.detectCarrier(text)
      }
    };
  }
  
  private detectCarrier(phone: string): string {
    const prefix = phone.slice(0, 3);
    const carriers = {
      '134,135,136,137,138,139,147,150,151,152,157,158,159,178,182,183,184,187,188,198': '中国移动',
      '130,131,132,145,155,156,166,175,176,185,186,196': '中国联通',
      '133,149,153,173,177,180,181,189,191,193,199': '中国电信'
    };
    
    for (const [prefixes, carrier] of Object.entries(carriers)) {
      if (prefixes.includes(prefix)) {
        return carrier;
      }
    }
    
    return '未知运营商';
  }
}

// 身份证号匹配器
class IdCardMatcher implements TypeMatcher {
  private readonly cardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  
  match(text: string): TypeMatchResult {
    if (!this.cardRegex.test(text)) {
      return { success: false };
    }
    
    const info = this.parseIdCard(text);
    
    return { success: true, value: info };
  }
  
  private parseIdCard(idCard: string) {
    const year = parseInt(idCard.slice(6, 10));
    const month = parseInt(idCard.slice(10, 12));
    const day = parseInt(idCard.slice(12, 14));
    const gender = parseInt(idCard.slice(16, 17)) % 2 === 1 ? '男' : '女';
    const area = idCard.slice(0, 6);
    
    return {
      original: idCard,
      birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      age: new Date().getFullYear() - year,
      gender,
      areaCode: area,
      valid: this.validateChecksum(idCard)
    };
  }
  
  private validateChecksum(idCard: string): boolean {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checksums = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idCard.charAt(i)) * weights[i];
    }
    
    const expectedChecksum = checksums[sum % 11];
    const actualChecksum = idCard.charAt(17).toUpperCase();
    
    return expectedChecksum === actualChecksum;
  }
}

// 注册自定义类型
TypeMatcherRegistry.registerMatcher('phone', new ChinesePhoneMatcher());
TypeMatcherRegistry.registerMatcher('idcard', new IdCardMatcher());

// 使用自定义类型
const userInfoCmd = new Commander('录入信息 <姓名:text> <手机:phone> <身份证:idcard>');

userInfoCmd.action((params) => {
  console.log('用户信息录入:');
  console.log(`姓名: ${params.姓名}`);
  console.log(`手机: ${params.手机.formatted} (${params.手机.carrier})`);
  console.log(`身份证: ${params.身份证.original}`);
  console.log(`出生日期: ${params.身份证.birthDate}`);
  console.log(`年龄: ${params.身份证.age}岁`);
  console.log(`性别: ${params.身份证.gender}`);
  
  return {
    name: params.姓名,
    phone: params.手机,
    idCard: params.身份证
  };
});

// 测试自定义类型
userInfoCmd.match([{
  type: 'text',
  data: { text: '录入信息 张三 13812345678 110101199001011234' }
}]);
```

## 🎯 性能优化示例

### 缓存和预处理

```typescript
// 高性能命令处理器
class HighPerformanceBot {
  private commandCache = new Map();
  private resultCache = new Map();
  
  constructor() {
    this.initializeCommands();
  }
  
  private initializeCommands() {
    // 预编译频繁使用的命令
    const frequentCommands = [
      '查询 <ID:integer>',
      '搜索 <关键词:text> [页码:integer=1]',
      '统计 [类型:text=全部] [时间:integer]'
    ];
    
    frequentCommands.forEach(pattern => {
      const cmd = new Commander(pattern);
      cmd.action((params) => this.processCommand(pattern, params));
      this.commandCache.set(pattern, cmd);
    });
  }
  
  private processCommand(pattern: string, params: any) {
    // 生成缓存键
    const cacheKey = `${pattern}:${JSON.stringify(params)}`;
    
    // 检查结果缓存
    if (this.resultCache.has(cacheKey)) {
      console.log('命中缓存');
      return this.resultCache.get(cacheKey);
    }
    
    // 执行实际处理
    const result = this.executeCommand(pattern, params);
    
    // 缓存结果（限制缓存大小）
    if (this.resultCache.size < 1000) {
      this.resultCache.set(cacheKey, result);
    }
    
    return result;
  }
  
  private executeCommand(pattern: string, params: any) {
    // 模拟命令执行
    console.log(`执行命令: ${pattern}`, params);
    return { pattern, params, timestamp: Date.now() };
  }
  
  processMessage(segments: any[]) {
    for (const [pattern, command] of this.commandCache) {
      const result = command.match(segments);
      if (result.length > 0) {
        return result[0];
      }
    }
    return null;
  }
}

const highPerfBot = new HighPerformanceBot();

// 性能测试
const testStart = Date.now();
for (let i = 0; i < 1000; i++) {
  highPerfBot.processMessage([{ type: 'text', data: { text: `查询 ${i}` } }]);
}
console.log(`处理1000条消息耗时: ${Date.now() - testStart}ms`);
```

这些高级示例展示了如何在实际项目中充分利用 OneBot Commander 的新特性，实现高效、灵活和可维护的消息处理系统。 