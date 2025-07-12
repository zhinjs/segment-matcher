import { Commander, match, MessageSegment } from '../index';

describe('Commander', () => {
  describe('Basic functionality', () => {
    test('should match basic text pattern', () => {
      const matcher = match('hello');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([
        {},
        { type: 'text', data: { text: ' world' } }
      ]);
    });

    test('should match with required parameter', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello Alice' } }
      ];
      
      const result = matcher.match(segments);
      expect(matcher.getTokens().find(v=>v.type==='literal')?.value).toEqual('hello ');
      expect(result).toEqual([{ name: 'Alice' }]);
    });

    test('should match with optional parameter', () => {
      const matcher = match('ping [message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping hello' } }
      ];
      
      const result = matcher.match(segments);
      expect(matcher.getTokens().find(v=>v.type==='literal')?.value).toEqual('ping ');
      expect(result).toEqual([{ message: 'hello' }]);
    });

    test('should handle optional parameter when not provided', () => {
      const matcher = match('ping [message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping' } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([]);
    });
  });

  describe('Complex patterns', () => {
    test('should match complex pattern with multiple parameters', () => {
      const matcher = match('test<arg1:text>[arg2:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } },
        { type: 'face', data: { id: 1 } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([
        { 
          arg1: '123', 
          arg2: { type: 'face', data: { id: 1 } } 
        }
      ]);
    });

    test('should match typed literal pattern', () => {
      const matcher = match('{text:test}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([{ arg1: '123' }]);
    });
    test('should match typed literal pattern for face', () => {
      const matcher = match('{face:2}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'face', data: { id: 1} },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([]);
    });

    test('should match typed literal pattern for image', () => {
      const matcher = match('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'test.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([{ arg1: '123' }]);
    });

    test('should not match typed literal pattern for image with wrong url', () => {
      const matcher = match('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'wrong.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([]);
    });

    test('should match typed literal pattern for at', () => {
      const matcher = match('{at:123456}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'at', data: { user_id: 123456 } },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([{ arg1: '123' }]);
    });

    test('should not match typed literal pattern for at with wrong id', () => {
      const matcher = match('{at:123456}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'at', data: { user_id: 654321 } },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([]);
    });

    test('should match typed literal pattern for image with file field', () => {
      const matcher = match('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'test.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([{ arg1: '123' }]);
    });

    test('should match typed literal pattern for image with url field', () => {
      const matcher = match('{image:https://example.com/image.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { url: 'https://example.com/image.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      const result = matcher.match(segments);
      expect(result).toEqual([{ arg1: '123' }]);
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
      
      const result = matcher.match(segments);
      expect(result).toEqual([
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
      
      const result = matcher.match(segments);
      expect(result).toEqual([
        { 
          rest: [
            { type: 'face', data: { id: 1 } },
            { type: 'face', data: { id: 2 } },
            { type: 'text', data: { text: 'hello' } },
            { type: 'image', data: { file: 'test.jpg' } }
          ]
        }
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
      
      const result = matcher.match(segments);
      expect(result).toEqual([
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
      
      const [str] = matcher.match(segments);
      expect(str).toEqual('123');
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
      
      const [str] = await matcher.matchAsync(segments);
      expect(str).toEqual('123');
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
      
      const [length] = await matcher.matchAsync(segments);
      expect(length).toEqual(3);
    });

    test('should handle async actions with error', async () => {
      const matcher = match('test<arg1:text>')
        .action(async (result: { arg1: string }) => {
          throw new Error('Async error');
        });

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];
      
      await expect(matcher.matchAsync(segments)).rejects.toThrow('Async error');
    });
  });

  describe('Match failures', () => {
    test('should return null when pattern does not match', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'face', data: { id: 1 } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([]);
    });

    test('should return null when required parameter is missing', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello' } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([]);
    });
  });

  describe('Token parsing', () => {
    test('should parse tokens correctly', () => {
      const matcher = match('test<arg1:text>[arg2:face]');
      const tokens = matcher.getTokens();
      
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('arg1');
      expect(tokens[1].dataType).toBe('text');
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('arg2');
      expect(tokens[2].dataType).toBe('face');
    });
  });

  describe('Default value for optional parameter', () => {
    test('should use default value for optional face param if not present', () => {
      const matcher = match('foo[mFace:face={"id":1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'foo' } }
      ];
      const result = matcher.match(segments);
      expect(result).toEqual([{ mFace: { id: 1 } }]);
    });

    test('should use matched value for optional face param if present', () => {
      const matcher = match('foo[mFace:face={"id":1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'foo' } },
        { type: 'face', data: { id: 2 } }
      ];
      const result = matcher.match(segments);
      expect(result).toEqual([
        { mFace: { type: 'face', data: { id: 2 } } }
      ]);
    });

    test('should use default string value for optional text param', () => {
      const matcher = match('foo[msg:text=hello]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'foo' } }
      ];
      const result = matcher.match(segments);
      expect(result).toEqual([{ msg: 'hello' }]);
    });
  });

  describe('Type support', () => {
    test('should not support string type anymore', () => {
      const matcher = match('hello <name:string>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];
      
      const result = matcher.match(segments);
      // string type should not match text segments anymore
      expect(result).toEqual([]);
    });

    test('should only support text type for text segments', () => {
      const matcher = match('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];
      
      const result = matcher.match(segments);
      expect(result).toEqual([{ name: 'world' }]);
    });
  });
}); 