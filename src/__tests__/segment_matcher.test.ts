import { Commander, match, MessageSegment, ValidationError } from '../index';

describe('Commander', () => {
  describe('Basic functionality', () => {
    test('should match basic text pattern', () => {
      const matcher = match('hello');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];
      
      expect(matcher.match(segments)).toEqual([
        {},
        { type: 'text', data: { text: ' world' } }
      ]);
    });

    test('should match with required parameter', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello Alice' } }
      ];
      
      expect(matcher.getTokens().find(v=>v.type==='literal')?.value).toEqual('hello ');
      expect(matcher.match(segments)).toEqual([{ name: 'Alice' }]);
    });

    test('should match with optional parameter', () => {
      const matcher = match('ping [message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping hello' } }
      ];
      
      expect(matcher.getTokens().find(v=>v.type==='literal')?.value).toEqual('ping ');
      expect(matcher.match(segments)).toEqual([{ message: 'hello' }]);
    });

    test('should handle optional parameter when not provided', () => {
      const matcher = match('ping [message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    // 新增测试用例：空格敏感特性
    test('should handle whitespace sensitivity correctly', () => {
      const matcher = match('ping [count:number={value:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping' } }
      ];
      
      // 由于 literal 'ping ' 无法匹配 'ping'（缺少末尾空格），整个模式匹配失败
      expect(matcher.match(segments)).toEqual([]);
    });

    // 新增测试用例：literal 匹配成功时可选参数的默认值
    test('should use default value when literal matches but optional parameter not provided', () => {
      const matcher = match('ping [count:number={value:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping ' } }
      ];
      
      // literal 'ping ' 匹配成功，但没有提供 count 参数，使用默认值
      expect(matcher.match(segments)).toEqual([{ count: { value: 1 } }]);
    });

    // 新增测试用例：参数验证
    test('should throw ValidationError for invalid segments parameter', () => {
      const matcher = match('hello <name:text>');
      
      expect(() => matcher.match(null as any)).toThrow(ValidationError);
      expect(() => matcher.match(undefined as any)).toThrow(ValidationError);
      expect(() => matcher.match('not an array' as any)).toThrow(ValidationError);
    });

    // 新增测试用例：异步参数验证
    test('should throw ValidationError for invalid segments parameter in async mode', async () => {
      const matcher = match('hello <name:text>');
      
      await expect(matcher.matchAsync(null as any)).rejects.toThrow(ValidationError);
      await expect(matcher.matchAsync(undefined as any)).rejects.toThrow(ValidationError);
      await expect(matcher.matchAsync('not an array' as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('Complex patterns', () => {
    test('should match complex pattern with multiple parameters', () => {
      const matcher = match('test<arg1:text>[arg2:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } },
        { type: 'face', data: { id: 1 } }
      ];
      
      expect(matcher.match(segments)).toEqual([
        { 
          arg1: '123', 
          arg2: 1
        }
      ]);
    });

    test('should match typed literal pattern', () => {
      const matcher = match('{text:test}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });
    test('should match typed literal pattern for face', () => {
      const matcher = match('{face:2}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'face', data: { id: 1} },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([]);
    });

    test('should match typed literal pattern for image', () => {
      const matcher = match('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'test.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });

    test('should not match typed literal pattern for image with wrong url', () => {
      const matcher = match('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'wrong.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([]);
    });

    test('should match typed literal pattern for at', () => {
      const matcher = match('{at:123456}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'at', data: { user_id: 123456 } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });

    test('should not match typed literal pattern for at with wrong id', () => {
      const matcher = match('{at:123456}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'at', data: { user_id: 654321 } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([]);
    });

    test('should match typed literal pattern for image with file field', () => {
      const matcher = match('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'test.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });

    test('should match typed literal pattern for image with url field', () => {
      const matcher = match('{image:https://example.com/image.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { url: 'https://example.com/image.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });

    // 新增测试用例：自定义字段映射
    test('should work with custom field mapping', () => {
      const matcher = match('{image:avatar.png}<name:text>', {
        image: 'src'  // 使用 'src' 字段而不是默认的 'file' 或 'url'
      });
      
      const segments: MessageSegment[] = [
        { type: 'image', data: { src: 'avatar.png' } },
        { type: 'text', data: { text: 'Alice' } }
      ];
      
      // 由于自定义字段映射，应该能匹配成功
      const result = matcher.match(segments);
      expect(result).toEqual([{ name: 'Alice' }]);
    });

    // 新增测试用例：类型化字面量包含匹配
    test('should handle typed literal contains matching for text', () => {
      const matcher = match('{text:hello}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ name: ' world' }]);
    });

    // 新增测试用例：类型化字面量不匹配的情况
    test('should not match when typed literal field is undefined', () => {
      const matcher = match('{image:test.jpg}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: {} }, // 没有 file 或 url 字段
        { type: 'text', data: { text: 'Alice' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    // 新增测试用例：类型化字面量值未定义的情况
    test('should not match when typed literal value is undefined', () => {
      const matcher = match('{text:test}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });
  });

  describe('Rest parameters', () => {
    test('should match [...rest] pattern', () => {
      const matcher = match('test[...rest]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'face', data: { id: 1 } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];
      
      expect(matcher.match(segments)).toEqual([
        { rest: [
          { type: 'text', data: { text: 'hello' } },
          { type: 'face', data: { id: 1 } },
          { type: 'image', data: { file: 'test.jpg' } }
        ]}
      ]);
    });

    test('should match [...rest:face] pattern', () => {
      const matcher = match('test[...rest:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'face', data: { id: 2 } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];
      
      expect(matcher.match(segments)).toEqual([
        { 
          rest: [
            { type: 'face', data: { id: 1 } },
            { type: 'face', data: { id: 2 } }
          ]
        },
        { type: 'text', data: { text: 'hello' } },
        { type: 'image', data: { file: 'test.jpg' } }
      ]);
    });

    test('should match [...rest:text] pattern', () => {
      const matcher = match('test[...rest:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: 'world' } },
        { type: 'face', data: { id: 1 } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];
      
      expect(matcher.match(segments)).toEqual([
        { 
          rest: [
            { type: 'text', data: { text: 'hello' } },
            { type: 'text', data: { text: 'world' } }
          ]
        },
        { type: 'face', data: { id: 1 } },
        { type: 'image', data: { file: 'test.jpg' } }
      ]);
    });

    // 新增测试用例：剩余参数为空的情况
    test('should handle empty rest parameters', () => {
      const matcher = match('test[...rest]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      // 当没有剩余消息段时，rest 参数为空数组
      expect(matcher.match(segments)).toEqual([{ rest: [] }]);
    });

    // 新增测试用例：剩余参数类型限制为空的情况
    test('should handle rest parameters with empty type restriction', () => {
      const matcher = match('test[...rest:]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } }
      ];
      
      // 当类型限制为空字符串时，应该收集所有剩余消息段
      expect(matcher.match(segments)).toEqual([{ rest: [{ type: 'text', data: { text: 'hello' } }] }]);
    });
  });

  describe('Action chaining', () => {
    test('should support action chaining', () => {
      const matcher = match('test<arg1:text>')
        .action((result) => {
          return result.arg1;
        })
        .action((arg1: string) => {
          return arg1.toUpperCase();
        });

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(matcher.match(segments)).toEqual(['123']);
    });

    test('should support async action chaining', async () => {
      const matcher = match('test<arg1:text>')
        .action(async (result) => {
          // 模拟异步操作
          await new Promise(resolve => setTimeout(resolve, 10));
          return result.arg1;
        })
        .action(async (arg1: string) => {
          // 模拟异步操作
          await new Promise(resolve => setTimeout(resolve, 10));
          return arg1.toUpperCase();
        });

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(await matcher.matchAsync(segments)).toEqual(['123']);
    });

    test('should support mixed sync and async actions', async () => {
      const matcher = match('test<arg1:text>')
        .action((result: { arg1: string }) => {
          return result.arg1;
        })
        .action(async (arg1: string) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return arg1.toUpperCase();
        })
        .action((upperArg1: string) => {
          return upperArg1.length;
        });

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(await matcher.matchAsync(segments)).toEqual([3]);
    });

    test('should handle async actions with error', async () => {
      const matcher = match('test<arg1:text>')
        .action(async (result) => {
          throw new Error('Async error');
        });

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      await expect(matcher.matchAsync(segments)).rejects.toThrow('Async error');
    });

    // 新增测试用例：无回调函数的情况
    test('should handle no callbacks', () => {
      const matcher = match('test<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });

    // 新增测试用例：异步无回调函数的情况
    test('should handle no callbacks in async mode', async () => {
      const matcher = match('test<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(await matcher.matchAsync(segments)).toEqual([{ arg1: '123' }]);
    });

    // 新增测试用例：匹配失败时的回调链
    test('should handle callback chain when match fails', () => {
      const matcher = match('test<arg1:text>')
        .action(() => 'default')
        .action((result) => result + ' processed');

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'wrong' } }
      ];
      
      expect(matcher.match(segments)).toEqual(['default processed']);
    });

    // 新增测试用例：异步匹配失败时的回调链
    test('should handle callback chain when async match fails', async () => {
      const matcher = match('test<arg1:text>')
        .action(async () => 'default')
        .action((result) => result + ' processed');

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'wrong' } }
      ];
      
      expect(await matcher.matchAsync(segments)).toEqual(['default processed']);
    });
  });

  describe('Match failures', () => {
    test('should return null when pattern does not match', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'world' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    test('should return null when required parameter is missing', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    // 新增测试用例：字面量不匹配
    test('should return null when literal does not match', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'world Alice' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    // 新增测试用例：参数类型不匹配
    test('should return null when parameter type does not match', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello ' } },
        { type: 'face', data: { id: 1 } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    // 新增测试用例：未知令牌类型
    test('should handle unknown token type', () => {
      const matcher = match('hello <name:text>');
      const tokens = matcher.getTokens();
      
      // 模拟未知令牌类型
      const originalType = tokens[1].type;
      (tokens[1] as any).type = 'unknown';
      
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello Alice' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
      
      // 恢复原始类型
      (tokens[1] as any).type = originalType;
    });
  });

  describe('Token parsing', () => {
    test('should parse tokens correctly', () => {
      const matcher = match('hello <name:text> [count:number={value:1}]');
      const tokens = matcher.getTokens();
      
      expect(tokens).toHaveLength(4);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello ');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
      expect(tokens[1].dataType).toBe('text');
      expect(tokens[1].optional).toBe(false);
      expect(tokens[2].type).toBe('literal');
      expect(tokens[2].value).toBe(' ');
      expect(tokens[3].type).toBe('parameter');
      expect(tokens[3].name).toBe('count');
      expect(tokens[3].dataType).toBe('number');
      expect(tokens[3].optional).toBe(true);
      expect(tokens[3].defaultValue).toEqual({ value: 1 });
    });

    // 新增测试用例：获取令牌
    test('should get tokens correctly', () => {
      const matcher = match('test<arg1:text>');
      const tokens = matcher.getTokens();
      
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[0]).toHaveProperty('type');
    });
  });

  describe('Default value for optional parameter', () => {
    test('should use default value for optional face param if not present', () => {
      const matcher = match('test[emoji:face={id:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ emoji: { id: 1 } }]);
    });

    test('should use matched value for optional face param if present', () => {
      const matcher = match('test[emoji:face={id:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 2 } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ emoji: 2 }]);
    });

    test('should use default string value for optional text param', () => {
      const matcher = match('test[message:text={text:"hello"}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ message: { text: 'hello' } }]);
    });

    // 新增测试用例：数字默认值
    test('should use default number value for optional number param', () => {
      const matcher = match('test[count:number={value:5}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ count: { value: 5 } }]);
    });

    // 新增测试用例：布尔默认值
    test('should use default boolean value for optional boolean param', () => {
      const matcher = match('test[enabled:boolean={value:true}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ enabled: { value: true } }]);
    });

    // 新增测试用例：数字默认值（face id）
    test('should use default object value for face param', () => {
      const matcher = match('test[emoji:face={id:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ emoji: { id: 1 } }]);
    });

    // 新增测试用例：字符串默认值（image file）
    test('should use default object value for image param', () => {
      const matcher = match('test[img:image={file:"avatar.jpg"}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ img: { file: 'avatar.jpg' } }]);
    });

    // 新增测试用例：无默认值的可选参数
    test('should use null for optional param without default value (non-text)', () => {
      const matcher = match('test[emoji:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ emoji: null }]);
    });

    // 新增测试用例：无默认值的可选文本参数
    test('should use empty string for optional text param without default value', () => {
      const matcher = match('test[message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ message: '' }]);
    });
  });

  describe('Type support', () => {
    test('should not support string type anymore', () => {
      const matcher = match('test<arg1:string>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    test('should only support text type for text segments', () => {
      const matcher = match('test<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ arg1: '123' }]);
    });

    // 新增测试用例：其他消息段类型
    test('should support face type', () => {
      const matcher = match('test<emoji:face>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ emoji: 1 }]);
    });

    test('should support image type', () => {
      const matcher = match('test<img:image>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ img: 'test.jpg' }]);
    });

    test('should support at type', () => {
      const matcher = match('test<user:at>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'at', data: { user_id: 123456 } }
      ];
      
      expect(matcher.match(segments)).toEqual([{ user: 123456 }]);
    });
  });

  describe('Error handling', () => {
    test('should throw ValidationError for invalid pattern', () => {
      expect(() => new Commander('')).toThrow(ValidationError);
      expect(() => new Commander('   ')).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid segments', () => {
      const matcher = match('hello <name:text>');
      expect(() => matcher.match(null as any)).toThrow(ValidationError);
      expect(() => matcher.match(undefined as any)).toThrow(ValidationError);
      expect(() => matcher.match('not an array' as any)).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid typedLiteralFields', () => {
      expect(() => new Commander('hello <name:text>', 'not an object' as any)).toThrow(ValidationError);
    });

    test('should handle async validation errors', async () => {
      const matcher = match('hello <name:text>');
      await expect(matcher.matchAsync(null as any)).rejects.toThrow(ValidationError);
      await expect(matcher.matchAsync(undefined as any)).rejects.toThrow(ValidationError);
      await expect(matcher.matchAsync('not an array' as any)).rejects.toThrow(ValidationError);
    });

    // 新增测试用例：构造函数参数验证
    test('should throw ValidationError for non-string pattern', () => {
      expect(() => new Commander(null as any)).toThrow(ValidationError);
      expect(() => new Commander(undefined as any)).toThrow(ValidationError);
      expect(() => new Commander(123 as any)).toThrow(ValidationError);
      expect(() => new Commander({} as any)).toThrow(ValidationError);
    });

    // 新增测试用例：字段映射验证
    test('should handle null typedLiteralFields', () => {
      // 由于修复了 Object.assign 的问题，null 现在会被正确处理
      expect(() => new Commander('hello <name:text>', null as any)).not.toThrow();
    });

    // 新增测试用例：便捷函数
    test('should work with match function', () => {
      const matcher1 = match('hello <name:text>');
      const matcher2 = new Commander('hello <name:text>');
      
      expect(matcher1).toBeInstanceOf(Commander);
      expect(matcher2).toBeInstanceOf(Commander);
      
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello Alice' } }
      ];
      
      expect(matcher1.match(segments)).toEqual(matcher2.match(segments));
    });

    test('should work with match function and custom field mapping', () => {
      const customMapping = { image: 'src' };
      const matcher = match('{image:avatar.png}<name:text>', customMapping);
      
      expect(matcher).toBeInstanceOf(Commander);
    });
  });

  // 新增测试用例：边界情况
  describe('Edge cases', () => {
    test('should handle empty segments array', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [];
      
      expect(matcher.match(segments)).toEqual([]);
    });

    test('should handle segments with missing text field', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: {} }
      ];
      
      expect(matcher.match(segments)).toEqual([]);
    });
  });
}); 