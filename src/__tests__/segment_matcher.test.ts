import { SegmentMatcher, createMatcher, MessageSegment, ValidationError } from '../index';

describe('SegmentMatcher', () => {
  describe('Constructor validation', () => {
    test('should throw ValidationError for non-string pattern', () => {
      expect(() => new SegmentMatcher(123 as any)).toThrow(ValidationError);
      expect(() => new SegmentMatcher(null as any)).toThrow(ValidationError);
      expect(() => new SegmentMatcher(undefined as any)).toThrow(ValidationError);
      expect(() => new SegmentMatcher({} as any)).toThrow(ValidationError);
    });

    test('should throw ValidationError for empty pattern', () => {
      expect(() => new SegmentMatcher('')).toThrow(ValidationError);
      expect(() => new SegmentMatcher('   ')).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid typedLiteralFields', () => {
      expect(() => new SegmentMatcher('test', 'not an object' as any)).toThrow(ValidationError);
      expect(() => new SegmentMatcher('test', 123 as any)).toThrow(ValidationError);
    });

    test('should merge default and custom field mappings', () => {
      const matcher = new SegmentMatcher('test[...rest:image]', {
        image: 'src',  // 覆盖默认映射
        custom: 'value'  // 新增映射
      });

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { src: 'test.jpg' } }
      ];

      const result = matcher.match(segments);
      expect(result).not.toBeNull();
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { src: 'test.jpg' } }
      ]);
      expect(result?.params).toEqual({
        rest: ['test.jpg']
      });
    });

    test('should use static create method', () => {
      const matcher1 = SegmentMatcher.create('test');
      const matcher2 = createMatcher('test');

      expect(matcher1).toBeInstanceOf(SegmentMatcher);
      expect(matcher2).toBeInstanceOf(SegmentMatcher);

      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];

      expect(matcher1.match(segments)).toEqual(matcher2.match(segments));
    });
  });

  describe('Basic functionality', () => {
    test('should match basic text pattern', () => {
      const matcher = createMatcher('hello');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [{ type: 'text', data: { text: 'hello' } }],
        params: {},
        remaining: [{ type: 'text', data: { text: ' world' } }]
      });
    });

    test('should match with required parameter', () => {
      const matcher = createMatcher('hello <name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello Alice' } }
      ];

      expect(matcher.getTokens().find(v => v.type === 'literal')?.value).toEqual('hello ');
      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'hello ' } },
          { type: 'text', data: { text: 'Alice' } }
        ],
        params: { name: 'Alice' },
        remaining: []
      });
    });

    test('should match with optional parameter', () => {
      const matcher = createMatcher('ping [message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping hello' } }
      ];

      expect(matcher.getTokens().find(v => v.type === 'literal')?.value).toEqual('ping ');
      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'ping ' } },
          { type: 'text', data: { text: 'hello' } }
        ],
        params: { message: 'hello' },
        remaining: []
      });
    });

    test('should handle optional parameter when not provided', () => {
      const matcher = createMatcher('ping [message:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping' } }
      ];

      expect(matcher.match(segments)).toBeNull();
    });

    // 新增测试用例：空格敏感特性
    test('should handle whitespace sensitivity correctly', () => {
      const matcher = createMatcher('ping [count:number={value:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping' } }
      ];

      // 由于 literal 'ping ' 无法匹配 'ping'（缺少末尾空格），整个模式匹配失败
      expect(matcher.match(segments)).toBeNull();
    });

    // 新增测试用例：literal 匹配成功时可选参数的默认值
    test('should use default value when literal matches but optional parameter not provided', () => {
      const matcher = createMatcher('ping [count:number={value:1}]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'ping ' } }
      ];

      // literal 'ping ' 匹配成功，但没有提供 count 参数，使用默认值
      expect(matcher.match(segments)).toEqual({
        matched: [{ type: 'text', data: { text: 'ping ' } }],
        params: { count: { value: 1 } },
        remaining: []
      });
    });

    // 新增测试用例：参数验证
    test('should throw ValidationError for invalid segments parameter', () => {
      const matcher = createMatcher('hello <name:text>');

      expect(() => matcher.match(null as any)).toThrow(ValidationError);
      expect(() => matcher.match(undefined as any)).toThrow(ValidationError);
      expect(() => matcher.match('not an array' as any)).toThrow(ValidationError);
    });
  });

  describe('Complex patterns', () => {
    test('should match complex pattern with multiple parameters', () => {
      const matcher = createMatcher('test<arg1:text>[arg2:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } },
        { type: 'face', data: { id: 1 } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'test' } },
          { type: 'text', data: { text: '123' } },
          { type: 'face', data: { id: 1 } }
        ],
        params: { arg1: '123', arg2: 1 },
        remaining: []
      });
    });

    test('should match typed literal pattern', () => {
      const matcher = createMatcher('{text:test}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'test' } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
    });
    test('should match typed literal pattern for face', () => {
      const matcher = createMatcher('{face:2}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'face', data: { id: 1 } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toBeNull();
    });

    test('should match typed literal pattern for image', () => {
      const matcher = createMatcher('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'test.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'image', data: { file: 'test.jpg' } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
    });

    test('should not match typed literal pattern for image with wrong url', () => {
      const matcher = createMatcher('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'wrong.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toBeNull();
    });

    test('should match typed literal pattern for at', () => {
      const matcher = createMatcher('{at:123456}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'at', data: { user_id: 123456 } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'at', data: { user_id: 123456 } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
    });

    test('should not match typed literal pattern for at with wrong id', () => {
      const matcher = createMatcher('{at:123456}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'at', data: { user_id: 654321 } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toBeNull();
    });

    test('should match typed literal pattern for image with file field', () => {
      const matcher = createMatcher('{image:test.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { file: 'test.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'image', data: { file: 'test.jpg' } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
    });

    test('should match typed literal pattern for image with url field', () => {
      const matcher = createMatcher('{image:https://example.com/image.jpg}<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: { url: 'https://example.com/image.jpg' } },
        { type: 'text', data: { text: '123' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'image', data: { url: 'https://example.com/image.jpg' } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
    });

    // 新增测试用例：自定义字段映射
    test('should work with custom field mapping', () => {
      const matcher = createMatcher('{image:avatar.png}<name:text>', {
        image: 'src'  // 使用 'src' 字段而不是默认的 'file' 或 'url'
      });

      const segments: MessageSegment[] = [
        { type: 'image', data: { src: 'avatar.png' } },
        { type: 'text', data: { text: 'Alice' } }
      ];

      // 由于自定义字段映射，应该能匹配成功
      const result = matcher.match(segments);
      expect(result).toEqual({
        matched: [
          { type: 'image', data: { src: 'avatar.png' } },
          { type: 'text', data: { text: 'Alice' } }
        ],
        params: { name: 'Alice' },
        remaining: []
      });
    });

    // 新增测试用例：类型化字面量包含匹配
    test('should handle typed literal contains matching for text', () => {
      const matcher = createMatcher('{text:hello}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'hello' } },
          { type: 'text', data: { text: ' world' } }
        ],
        params: { name: ' world' },
        remaining: []
      });
    });

    // 新增测试用例：类型化字面量不匹配的情况
    test('should not match when typed literal field is undefined', () => {
      const matcher = createMatcher('{image:test.jpg}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'image', data: {} }, // 没有 file 或 url 字段
        { type: 'text', data: { text: 'Alice' } }
      ];

      expect(matcher.match(segments)).toBeNull();
    });

    // 新增测试用例：类型化字面量值未定义的情况
    test('should not match when typed literal value is undefined', () => {
      const matcher = createMatcher('{text:test}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello' } }
      ];

      expect(matcher.match(segments)).toBeNull();
    });
  });

  describe('Rest parameters', () => {
    test('should match [...rest:image] pattern and extract file/url values', () => {
      const matcher = createMatcher('test[...rest:image]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { file: 'test1.jpg' } },
        { type: 'image', data: { file: 'test2.jpg' } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { file: 'test1.jpg' } },
        { type: 'image', data: { file: 'test2.jpg' } }
      ]);
      expect(result?.params).toEqual({
        rest: ['test1.jpg', 'test2.jpg']
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should handle spaces between segments in [...rest:face] pattern', () => {
      const matcher = createMatcher('test[...rest:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'face', data: { id: 2 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'face', data: { id: 3 } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'face', data: { id: 2 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'face', data: { id: 3 } }
      ]);
      expect(result?.params).toEqual({
        rest: [1, 2, 3]
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should match [...rest:face] pattern and extract id values', () => {
      const matcher = createMatcher('test[...rest:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'face', data: { id: 2 } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'face', data: { id: 2 } }
      ]);
      expect(result?.params).toEqual({
        rest: [1, 2]
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should handle type checking with invalid segment data', () => {
      const matcher = createMatcher('test<name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: {} }  // 无效的 data
      ];

      const result = matcher.match(segments);
      expect(result).toBeNull();
      
      // 测试 rest parameter 的情况
      const restMatcher = createMatcher('test[...rest:text]');
      const segments2: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: {} }  // 无效的 data
      ];
      const result2 = restMatcher.match(segments2);
      expect(result2).not.toBeNull();
      expect(result2?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: {} }
      ]);
      expect(result2?.params).toEqual({
        rest: [null]  // 无效的 text 字段返回 null，'test' 是模式的一部分，不应该包含在 rest 中
      });
    });

    test('should handle field mapping with undefined data', () => {
      const matcher = createMatcher('test[...rest:image]', {
        image: 'src'
      });
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: {} }  // 无效的 data
      ];

      const result = matcher.match(segments);
      expect(result).not.toBeNull();
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: {} }
      ]);
      expect(result?.params).toEqual({
        rest: [null]  // 无效字段映射返回 null
      });
      expect(result?.remaining).toEqual([]);
    });

    test('should handle text splitting with typed literal', () => {
      const matcher = createMatcher('{text:hello}<name:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world' } }
      ];

      const result = matcher.match(segments);
      expect(result).not.toBeNull();
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: ' world' } }
      ]);
      expect(result?.params).toEqual({
        name: ' world'
      });
      expect(result?.remaining).toEqual([]);
    });

    test('should handle text splitting with multiple typed literals', () => {
      const matcher = createMatcher('{text:hello}{text:world}');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello world extra' } }
      ];

      const result = matcher.match(segments);
      expect(result).not.toBeNull();
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'text', data: { text: 'world' } }
      ]);
      expect(result?.params).toEqual({});
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: ' extra' } }
      ]);
    });

    test('should handle whitespace pattern', () => {
      const matcher = createMatcher('{text:hello}');  // 使用类型化字面量，不包含空格
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello test' } }
      ];

      const result = matcher.match(segments);
      expect(result).not.toBeNull();
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
      expect(result?.params).toEqual({});
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: ' test' } }
      ]);
    });

    test('should handle empty segments with optional parameters', () => {
      const matcher = createMatcher('[name:text][...rest:face]');  // 移除必需的 'test' 字面量
      const segments: MessageSegment[] = [];

      const result = matcher.match(segments);
      expect(result).not.toBeNull();
      expect(result?.matched).toEqual([]);
      expect(result?.params).toEqual({
        name: '',
        rest: []
      });
      expect(result?.remaining).toEqual([]);
    });

    test('should handle empty segments with required parameters', () => {
      const matcher = createMatcher('test <name:text>');
      const segments: MessageSegment[] = [];

      const result = matcher.match(segments);
      expect(result).toBeNull();
    });

    test('should return full segment when no field mapping is found', () => {
      const matcher = createMatcher('test[...rest:unknown]', {
        image: ['src', 'file', 'url']  // 没有 unknown 类型的映射
      });
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'unknown', data: { value: 'data1' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'unknown', data: { value: 'data2' } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'unknown', data: { value: 'data1' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'unknown', data: { value: 'data2' } }
      ]);
      expect(result?.params).toEqual({
        rest: [
          { type: 'unknown', data: { value: 'data1' } },
          { type: 'unknown', data: { value: 'data2' } }
        ]
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should handle multiple field mapping in [...rest:image] pattern', () => {
      const matcher = createMatcher('test[...rest:image]', {
        image: ['src', 'file', 'url']  // 按顺序尝试这些字段
      });
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { src: 'image1.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { file: 'image2.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { url: 'image3.jpg' } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { src: 'image1.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { file: 'image2.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { url: 'image3.jpg' } }
      ]);
      expect(result?.params).toEqual({
        rest: ['image1.jpg', 'image2.jpg', 'image3.jpg']
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should handle custom field mapping in [...rest:image] pattern', () => {
      const matcher = createMatcher('test[...rest:image]', {
        image: 'src'  // 使用 'src' 字段而不是默认的 'file' 或 'url'
      });
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { src: 'image1.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { src: 'image2.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { src: 'image3.jpg' } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'image', data: { src: 'image1.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { src: 'image2.jpg' } },
        { type: 'text', data: { text: ' ' } },
        { type: 'image', data: { src: 'image3.jpg' } }
      ]);
      expect(result?.params).toEqual({
        rest: ['image1.jpg', 'image2.jpg', 'image3.jpg']
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should handle spaces between segments in [...rest:at] pattern', () => {
      const matcher = createMatcher('test[...rest:at]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'at', data: { user_id: 123456 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'at', data: { user_id: 654321 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'at', data: { user_id: 789012 } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'at', data: { user_id: 123456 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'at', data: { user_id: 654321 } },
        { type: 'text', data: { text: ' ' } },
        { type: 'at', data: { user_id: 789012 } }
      ]);
      expect(result?.params).toEqual({
        rest: [123456, 654321, 789012]
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should match [...rest:at] pattern and extract user_id values', () => {
      const matcher = createMatcher('test[...rest:at]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'at', data: { user_id: 123456 } },
        { type: 'at', data: { user_id: 654321 } },
        { type: 'text', data: { text: 'hello' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'at', data: { user_id: 123456 } },
        { type: 'at', data: { user_id: 654321 } }
      ]);
      expect(result?.params).toEqual({
        rest: [123456, 654321]
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } }
      ]);
    });

    test('should match [...rest:text] pattern and extract text values', () => {
      const matcher = createMatcher('test[...rest:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: 'world' } },
        { type: 'face', data: { id: 1 } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: 'world' } }
      ]);
      expect(result?.params).toEqual({
        rest: ['hello', 'world']
      });
      expect(result?.remaining).toEqual([
        { type: 'face', data: { id: 1 } }
      ]);
    });

    test('should match [...rest] pattern', () => {
      const matcher = createMatcher('test[...rest]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'face', data: { id: 1 } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'test' } },
          { type: 'text', data: { text: 'hello' } },
          { type: 'face', data: { id: 1 } },
          { type: 'image', data: { file: 'test.jpg' } }
        ],
        params: {
          rest: [
            { type: 'text', data: { text: 'hello' } },
            { type: 'face', data: { id: 1 } },
            { type: 'image', data: { file: 'test.jpg' } }
          ]
        },
        remaining: []
      });
    });

    test('should match [...rest:face] pattern', () => {
      const matcher = createMatcher('test[...rest:face]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'face', data: { id: 2 } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'face', data: { id: 1 } },
        { type: 'face', data: { id: 2 } }
      ]);
      expect(result?.params).toEqual({
        rest: [1, 2]
      });
      expect(result?.remaining).toEqual([
        { type: 'text', data: { text: 'hello' } },
        { type: 'image', data: { file: 'test.jpg' } }
      ]);
    });

    test('should match [...rest:text] pattern', () => {
      const matcher = createMatcher('test[...rest:text]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: 'world' } },
        { type: 'face', data: { id: 1 } },
        { type: 'image', data: { file: 'test.jpg' } }
      ];

      const result = matcher.match(segments);
      expect(result?.matched).toEqual([
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } },
        { type: 'text', data: { text: 'world' } }
      ]);
      expect(result?.params).toEqual({
        rest: ['hello', 'world']
      });
      expect(result?.remaining).toEqual([
        { type: 'face', data: { id: 1 } },
        { type: 'image', data: { file: 'test.jpg' } }
      ]);
    });

    // 新增测试用例：剩余参数为空的情况
    test('should handle empty rest parameters', () => {
      const matcher = createMatcher('test[...rest]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } }
      ];

      // 当没有剩余消息段时，rest 参数为空数组
      expect(matcher.match(segments)).toEqual({
        matched: [{ type: 'text', data: { text: 'test' } }],
        params: { rest: [] },
        remaining: []
      });
    });

    // 新增测试用例：剩余参数类型限制为空的情况
    test('should handle rest parameters with empty type restriction', () => {
      const matcher = createMatcher('test[...rest:]');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test' } },
        { type: 'text', data: { text: 'hello' } }
      ];

      // 当类型限制为空字符串时，应该收集所有剩余消息段
      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'test' } },
          { type: 'text', data: { text: 'hello' } }
        ],
        params: { rest: [{ type: 'text', data: { text: 'hello' } }] },
        remaining: []
      });
    });
  });

  describe('Advanced features', () => {
    test('should return correct match result structure', () => {
      const matcher = createMatcher('test<arg1:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test123' } }
      ];

      expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'test' } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
    });

    describe('Match failures', () => {
      test('should return null when pattern does not match', () => {
        const matcher = createMatcher('hello <name:text>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'world' } }
        ];

        expect(matcher.match(segments)).toEqual(null);
      });

      test('should return null when required parameter is missing', () => {
        const matcher = createMatcher('hello <name:text>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello' } }
        ];

        expect(matcher.match(segments)).toEqual(null);
      });

      // 新增测试用例：字面量不匹配
      test('should return null when literal does not match', () => {
        const matcher = createMatcher('hello <name:text>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'world Alice' } }
        ];

        expect(matcher.match(segments)).toEqual(null);
      });

      // 新增测试用例：参数类型不匹配
      test('should return null when parameter type does not match', () => {
        const matcher = createMatcher('hello <name:text>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello ' } },
          { type: 'face', data: { id: 1 } }
        ];

        expect(matcher.match(segments)).toEqual(null);
      });

      // 新增测试用例：未知令牌类型
      test('should handle unknown token type', () => {
        const matcher = createMatcher('hello <name:text>');
        const tokens = matcher.getTokens();

        // 模拟未知令牌类型
        const originalType = tokens[1].type;
        (tokens[1] as any).type = 'unknown';

        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello Alice' } }
        ];

        expect(matcher.match(segments)).toEqual(null);

        // 恢复原始类型
        (tokens[1] as any).type = originalType;
      });
    });

    describe('Token parsing', () => {
      test('should parse tokens correctly', () => {
        const matcher = createMatcher('hello <name:text> [count:number={value:1}]');
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
        const matcher = createMatcher('test<arg1:text>');
        const tokens = matcher.getTokens();

        expect(Array.isArray(tokens)).toBe(true);
        expect(tokens.length).toBeGreaterThan(0);
        expect(tokens[0]).toHaveProperty('type');
      });
    });

    describe('Default value for optional parameter', () => {
      test('should use default value for optional face param if not present', () => {
        const matcher = createMatcher('test[emoji:face={id:1}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { emoji: { id: 1 } },
          remaining: []
        });
      });

      test('should use matched value for optional face param if present', () => {
        const matcher = createMatcher('test[emoji:face={id:1}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } },
          { type: 'face', data: { id: 2 } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [
            { type: 'text', data: { text: 'test' } },
            { type: 'face', data: { id: 2 } }
          ],
          params: { emoji: 2 },
          remaining: []
        });
      });

      test('should use default string value for optional text param', () => {
        const matcher = createMatcher('test[message:text={text:"hello"}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { message: { text: 'hello' } },
          remaining: []
        });
      });

      // 新增测试用例：数字默认值
      test('should use default number value for optional number param', () => {
        const matcher = createMatcher('test[count:number={value:5}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { count: { value: 5 } },
          remaining: []
        });
      });

      // 新增测试用例：布尔默认值
      test('should use default boolean value for optional boolean param', () => {
        const matcher = createMatcher('test[enabled:boolean={value:true}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { enabled: { value: true } },
          remaining: []
        });
      });

      // 新增测试用例：数字默认值（face id）
      test('should use default object value for face param', () => {
        const matcher = createMatcher('test[emoji:face={id:1}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { emoji: { id: 1 } },
          remaining: []
        });
      });

      // 新增测试用例：字符串默认值（image file）
      test('should use default object value for image param', () => {
        const matcher = createMatcher('test[img:image={file:"avatar.jpg"}]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { img: { file: 'avatar.jpg' } },
          remaining: []
        });
      });

      // 新增测试用例：无默认值的可选参数
      test('should use null for optional param without default value (non-text)', () => {
        const matcher = createMatcher('test[emoji:face]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { emoji: null },
          remaining: []
        });
      });

      // 新增测试用例：无默认值的可选文本参数
      test('should use empty string for optional text param without default value', () => {
        const matcher = createMatcher('test[message:text]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [{ type: 'text', data: { text: 'test' } }],
          params: { message: '' },
          remaining: []
        });
      });
    });

    describe('Type support', () => {
      test('should not support string type anymore', () => {
        const matcher = createMatcher('test<arg1:string>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test123' } }
        ];

        expect(matcher.match(segments)).toBeNull();
      });

      test('should only support text type for text segments', () => {
        const matcher = createMatcher('test<arg1:text>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test123' } }
        ];

        expect(matcher.match(segments)).toEqual({
        matched: [
          { type: 'text', data: { text: 'test' } },
          { type: 'text', data: { text: '123' } }
        ],
        params: { arg1: '123' },
        remaining: []
      });
      });

      // 新增测试用例：其他消息段类型
      test('should support face type', () => {
        const matcher = createMatcher('test<emoji:face>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } },
          { type: 'face', data: { id: 1 } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [
            { type: 'text', data: { text: 'test' } },
            { type: 'face', data: { id: 1 } }
          ],
          params: { emoji: 1 },
          remaining: []
        });
      });

      test('should support image type', () => {
        const matcher = createMatcher('test<img:image>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } },
          { type: 'image', data: { file: 'test.jpg' } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [
            { type: 'text', data: { text: 'test' } },
            { type: 'image', data: { file: 'test.jpg' } }
          ],
          params: { img: 'test.jpg' },
          remaining: []
        });
      });

      test('should support at type', () => {
        const matcher = createMatcher('test<user:at>');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test' } },
          { type: 'at', data: { user_id: 123456 } }
        ];

        expect(matcher.match(segments)).toEqual({
          matched: [
            { type: 'text', data: { text: 'test' } },
            { type: 'at', data: { user_id: 123456 } }
          ],
          params: { user: 123456 },
          remaining: []
        });
      });
    });

    describe('Error handling', () => {
      test('should throw ValidationError for invalid pattern', () => {
        expect(() => new SegmentMatcher('')).toThrow(ValidationError);
        expect(() => new SegmentMatcher('   ')).toThrow(ValidationError);
      });

      test('should throw ValidationError for invalid segments', () => {
        const matcher = createMatcher('hello <name:text>');
        expect(() => matcher.match(null as any)).toThrow(ValidationError);
        expect(() => matcher.match(undefined as any)).toThrow(ValidationError);
        expect(() => matcher.match('not an array' as any)).toThrow(ValidationError);
      });

      test('should throw ValidationError for invalid typedLiteralFields', () => {
        expect(() => new SegmentMatcher('hello <name:text>', 'not an object' as any)).toThrow(ValidationError);
      });

      test('should handle validation errors', () => {
        const matcher = createMatcher('hello <name:text>');
        expect(() => matcher.match(null as any)).toThrow(ValidationError);
        expect(() => matcher.match(undefined as any)).toThrow(ValidationError);
        expect(() => matcher.match('not an array' as any)).toThrow(ValidationError);
      });

      // 新增测试用例：构造函数参数验证
      test('should throw ValidationError for non-string pattern', () => {
        expect(() => new SegmentMatcher(null as any)).toThrow(ValidationError);
        expect(() => new SegmentMatcher(undefined as any)).toThrow(ValidationError);
        expect(() => new SegmentMatcher(123 as any)).toThrow(ValidationError);
        expect(() => new SegmentMatcher({} as any)).toThrow(ValidationError);
      });

      // 新增测试用例：字段映射验证
      test('should handle null typedLiteralFields', () => {
        // 由于修复了 Object.assign 的问题，null 现在会被正确处理
        expect(() => new SegmentMatcher('hello <name:text>', null as any)).not.toThrow();
      });

      // 新增测试用例：便捷函数
      test('should work with match function', () => {
        const matcher1 = createMatcher('hello <name:text>');
        const matcher2 = new SegmentMatcher('hello <name:text>');

        expect(matcher1).toBeInstanceOf(SegmentMatcher);
        expect(matcher2).toBeInstanceOf(SegmentMatcher);

        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello Alice' } }
        ];

        expect(matcher1.match(segments)).toEqual(matcher2.match(segments));
      });

      test('should work with match function and custom field mapping', () => {
        const customMapping = { image: 'src' };
        const matcher = createMatcher('{image:avatar.png}<name:text>', customMapping);

        expect(matcher).toBeInstanceOf(SegmentMatcher);
      });

      test('should work with dynamic field extractors', () => {
        // 自定义提取器
        const customMapping = {
          image: (segment: MessageSegment) => {
            // 根据条件选择不同的字段
            if ('url' in segment.data) return segment.data.url;
            if ('file' in segment.data) return segment.data.file;
            if ('base64' in segment.data) return segment.data.base64;
            return null;
          },
          face: (segment: MessageSegment) => {
            // 组合多个字段
            const { id, name } = segment.data;
            return name ? `${id}#${name}` : id;
          }
        };

        const matcher = createMatcher('test<img:image><emoji:face>', customMapping);

        // 测试 URL 图片
        const result1 = matcher.match([
          { type: 'text', data: { text: 'test' } },
          { type: 'image', data: { url: 'https://example.com/image.jpg' } },
          { type: 'face', data: { id: 1, name: 'smile' } }
        ]);
        expect(result1?.params).toEqual({
          img: 'https://example.com/image.jpg',
          emoji: '1#smile'
        });

        // 测试文件图片
        const result2 = matcher.match([
          { type: 'text', data: { text: 'test' } },
          { type: 'image', data: { file: 'local.jpg' } },
          { type: 'face', data: { id: 2 } }
        ]);
        expect(result2?.params).toEqual({
          img: 'local.jpg',
          emoji: 2
        });

        // 测试 Base64 图片
        const result3 = matcher.match([
          { type: 'text', data: { text: 'test' } },
          { type: 'image', data: { base64: 'data:image/png;base64,...' } },
          { type: 'face', data: { id: 3, name: 'wink' } }
        ]);
        expect(result3?.params).toEqual({
          img: 'data:image/png;base64,...',
          emoji: '3#wink'
        });
      });
    });

    // 新增测试用例：边界情况
    describe('Edge cases', () => {
      test('should handle empty segments array', () => {
        const matcher = createMatcher('hello <name:text>');
        const segments: MessageSegment[] = [];

        expect(matcher.match(segments)).toBeNull();
      });

      test('should handle text splitting with multiple matches', () => {
        const matcher = createMatcher('{text:hello}{text:world}');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello world extra' } }
        ];

        const result = matcher.match(segments);
        expect(result).not.toBeNull();
        expect(result?.matched).toEqual([
          { type: 'text', data: { text: 'hello' } },
          { type: 'text', data: { text: ' ' } },
          { type: 'text', data: { text: 'world' } }
        ]);
        expect(result?.remaining).toEqual([
          { type: 'text', data: { text: ' extra' } }
        ]);
      });

      test('should handle segments with missing text field', () => {
        const matcher = createMatcher('hello <name:text>');
        const segments: MessageSegment[] = [
          { type: 'text', data: {} }
        ];

        expect(matcher.match(segments)).toBeNull();
      });
    });
  });
}); 