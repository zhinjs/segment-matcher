import { PatternParser } from '../pattern_parser';
import { PatternParseError } from '../errors';

describe('PatternParser', () => {
  describe('parse', () => {
    test('should parse simple literal pattern', () => {
      const tokens = PatternParser.parse('hello');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello');
    });

    test('should parse pattern with required parameter', () => {
      const tokens = PatternParser.parse('hello <name:text>');
      
      // 新逻辑：字面量末尾的单个空格会被分离为可选的空格 token
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello');
      expect(tokens[1].type).toBe('literal');
      expect(tokens[1].value).toBe(' ');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('name');
      expect(tokens[2].dataType).toBe('text');
      expect(tokens[2].optional).toBe(false);
    });

    test('should parse pattern with optional parameter', () => {
      const tokens = PatternParser.parse('ping [message:text]');
      
      // 新逻辑：字面量末尾的单个空格会被分离为可选的空格 token
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('ping');
      expect(tokens[1].type).toBe('literal');
      expect(tokens[1].value).toBe(' ');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('message');
      expect(tokens[2].dataType).toBe('text');
      expect(tokens[2].optional).toBe(true);
    });

    test('should parse pattern with typed literal', () => {
      const tokens = PatternParser.parse('{text:start}<name:text>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('typed_literal');
      expect(tokens[0].segmentType).toBe('text');
      expect(tokens[0].value).toBe('start');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
    });

    test('should parse pattern with rest parameter', () => {
      const tokens = PatternParser.parse('test[...rest]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('rest_parameter');
      expect(tokens[1].name).toBe('rest');
      expect(tokens[1].dataType).toBe(null);
    });

    test('should parse pattern with typed rest parameter', () => {
      const tokens = PatternParser.parse('test[...rest:text]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('rest_parameter');
      expect(tokens[1].name).toBe('rest');
      expect(tokens[1].dataType).toBe('text');
    });

    test('should parse complex pattern', () => {
      const tokens = PatternParser.parse('hello <name:text> [count:number={value:1}] [...rest]');
      
      // 新逻辑：字面量末尾的单个空格会被分离为可选的空格 token
      expect(tokens).toHaveLength(7);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello');
      expect(tokens[1].type).toBe('literal');
      expect(tokens[1].value).toBe(' ');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('name');
      expect(tokens[2].dataType).toBe('text');
      expect(tokens[2].optional).toBe(false);
      expect(tokens[3].type).toBe('literal');
      expect(tokens[3].value).toBe(' ');
      expect(tokens[3].optional).toBe(true);
      expect(tokens[4].type).toBe('parameter');
      expect(tokens[4].name).toBe('count');
      expect(tokens[4].dataType).toBe('number');
      expect(tokens[4].optional).toBe(true);
      expect(tokens[4].defaultValue).toEqual({ value: 1 });
      expect(tokens[5].type).toBe('literal');
      expect(tokens[5].value).toBe(' ');
      expect(tokens[5].optional).toBe(true);
      expect(tokens[6].type).toBe('rest_parameter');
      expect(tokens[6].name).toBe('rest');
    });

    test('should parse pattern with empty literal', () => {
      const tokens = PatternParser.parse('<name:text>');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('parameter');
      expect(tokens[0].name).toBe('name');
    });

    test('should parse pattern with only whitespace literal', () => {
      const tokens = PatternParser.parse(' <name:text>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe(' ');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
    });

    test('should parse pattern with special characters in literal', () => {
      const tokens = PatternParser.parse('!@#$%^&*() <name:text>');
      
      // 新逻辑：字面量末尾的单个空格会被分离为可选的空格 token
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('!@#$%^&*()');
      expect(tokens[1].type).toBe('literal');
      expect(tokens[1].value).toBe(' ');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('name');
    });

    test('should parse pattern with URL in typed literal', () => {
      const tokens = PatternParser.parse('{image:https://example.com/image.jpg}<name:text>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('typed_literal');
      expect(tokens[0].segmentType).toBe('image');
      expect(tokens[0].value).toBe('https://example.com/image.jpg');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
    });

    test('should parse pattern with face default value', () => {
      const tokens = PatternParser.parse('test[emoji:face={id:1}]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('emoji');
      expect(tokens[1].dataType).toBe('face');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[1].defaultValue).toEqual({ id: 1 });
    });

    test('should parse pattern with image default value', () => {
      const tokens = PatternParser.parse('test[img:image={file:"avatar.jpg"}]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('img');
      expect(tokens[1].dataType).toBe('image');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[1].defaultValue).toEqual({ file: 'avatar.jpg' });
    });

    test('should parse pattern with at default value', () => {
      const tokens = PatternParser.parse('test[user:at={user_id:123456}]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('user');
      expect(tokens[1].dataType).toBe('at');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[1].defaultValue).toEqual({ user_id: 123456 });
    });

    test('should parse pattern with string default value', () => {
      const tokens = PatternParser.parse('test[message:text={text:"hello world"}]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('message');
      expect(tokens[1].dataType).toBe('text');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[1].defaultValue).toEqual({ text: 'hello world' });
    });

    test('should parse pattern with empty default value', () => {
      const tokens = PatternParser.parse('test[message:text={text:""}]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('message');
      expect(tokens[1].dataType).toBe('text');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[1].defaultValue).toEqual({ text: '' });
    });

    test('should parse pattern with parameter without type', () => {
      const tokens = PatternParser.parse('test<name>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
      expect(tokens[1].dataType).toBe('text'); // 默认类型
      expect(tokens[1].optional).toBe(false);
    });

    test('should parse pattern with optional parameter without type', () => {
      const tokens = PatternParser.parse('test[name]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
      expect(tokens[1].dataType).toBe('text'); // 默认类型
      expect(tokens[1].optional).toBe(true);
    });

    test('should parse pattern with typed literal without value', () => {
      const tokens = PatternParser.parse('{text}<name:text>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('typed_literal');
      expect(tokens[0].segmentType).toBe('text');
      expect(tokens[0].value).toBe('');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
    });

    test('should parse pattern with rest parameter without type', () => {
      const tokens = PatternParser.parse('test[...rest:]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('rest_parameter');
      expect(tokens[1].name).toBe('rest');
      expect(tokens[1].dataType).toBe('');
    });

    test('should parse pattern with multiple consecutive literals', () => {
      const tokens = PatternParser.parse('hello world <name:text>');
      
      // 新逻辑：字面量末尾的单个空格会被分离为可选的空格 token
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello world');
      expect(tokens[1].type).toBe('literal');
      expect(tokens[1].value).toBe(' ');
      expect(tokens[1].optional).toBe(true);
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('name');
    });

    test('should parse pattern with mixed content', () => {
      const tokens = PatternParser.parse('{text:start}hello<name:text>[emoji:face={id:1}]');
      
      expect(tokens).toHaveLength(4);
      expect(tokens[0].type).toBe('typed_literal');
      expect(tokens[0].segmentType).toBe('text');
      expect(tokens[0].value).toBe('start');
      expect(tokens[1].type).toBe('literal');
      expect(tokens[1].value).toBe('hello');
      expect(tokens[2].type).toBe('parameter');
      expect(tokens[2].name).toBe('name');
      expect(tokens[3].type).toBe('parameter');
      expect(tokens[3].name).toBe('emoji');
    });
  });

  describe('error handling', () => {
    test('should handle parsing errors gracefully', () => {
      // 模拟解析过程中的错误
      const originalParseTypedLiteral = PatternParser['parseTypedLiteral'];
      PatternParser['parseTypedLiteral'] = () => {
        throw new Error('Simulated parsing error');
      };

      expect(() => PatternParser.parse('{text:test}')).toThrow(PatternParseError);

      // 恢复原始方法
      PatternParser['parseTypedLiteral'] = originalParseTypedLiteral;
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      PatternParser.clearCache();
    });

    test('should handle empty pattern', () => {
      const tokens = PatternParser.parse('');
      expect(tokens).toHaveLength(0);
    });

    test('should use cache for repeated patterns', () => {
      const pattern = 'hello <name:text>';
      
      // First call should parse and cache
      const tokens1 = PatternParser.parse(pattern);
      expect(PatternParser.getCacheStats().size).toBe(1);
      
      // Second call should use cache
      const tokens2 = PatternParser.parse(pattern);
      expect(tokens2).toBe(tokens1); // Same instance due to caching
      
      // Clear cache
      PatternParser.clearCache();
      expect(PatternParser.getCacheStats().size).toBe(0);
      
      // Third call should parse again
      const tokens3 = PatternParser.parse(pattern);
      expect(tokens3).not.toBe(tokens1); // Different instance after cache clear
    });

    test('should handle invalid JSON in default value', () => {
      // 测试缺少引号的 JSON
      const tokens1 = PatternParser.parse('[config:json={id:1,name:"test"}]');
      expect(tokens1[0].defaultValue).toEqual({ id: 1, name: "test" });

      // 测试完全无效的 JSON
      const tokens2 = PatternParser.parse('[config:json={invalid:json:here}]');
      expect(tokens2[0].defaultValue).toBe('{invalid:json:here}');

      // 测试非 JSON 字符串
      const tokens3 = PatternParser.parse('[text:string=hello world]');
      expect(tokens3[0].defaultValue).toBe('hello world');
    });

    test('should handle empty literal segments', () => {
      const tokens = PatternParser.parse('{text:hello}{text:world}');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('typed_literal');
      expect(tokens[1].type).toBe('typed_literal');
    });

    test('should handle consecutive special characters', () => {
      const tokens = PatternParser.parse('<>{text:test}[name]');
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('parameter');
      expect(tokens[1].type).toBe('typed_literal');
      expect(tokens[2].type).toBe('parameter');
    });

    test('should throw error for unmatched braces', () => {
      expect(() => PatternParser.parse('{unclosed')).toThrow(PatternParseError);
      expect(() => PatternParser.parse('<unclosed')).toThrow(PatternParseError);
      expect(() => PatternParser.parse('[unclosed')).toThrow(PatternParseError);
    });

    test('should handle pattern with only special characters', () => {
      const tokens = PatternParser.parse('<>[]{}');
      
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('parameter');
      expect(tokens[0].name).toBe('');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('');
      expect(tokens[2].type).toBe('typed_literal');
      expect(tokens[2].segmentType).toBe('');
    });

    test('should handle pattern with nested brackets', () => {
      const tokens = PatternParser.parse('test<name:text=[value]>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
      expect(tokens[1].dataType).toBe('text=[value]');
    });

    test('should handle pattern with equals in parameter name', () => {
      const tokens = PatternParser.parse('test<name=value:text>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name=value');
      expect(tokens[1].dataType).toBe('text');
    });
  });
}); 