import { PatternParser } from '../pattern_parser';
import { PatternToken } from '../pattern_token';
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
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello ');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
      expect(tokens[1].dataType).toBe('text');
      expect(tokens[1].optional).toBe(false);
    });

    test('should parse pattern with optional parameter', () => {
      const tokens = PatternParser.parse('ping [message:text]');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('ping ');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('message');
      expect(tokens[1].dataType).toBe('text');
      expect(tokens[1].optional).toBe(true);
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
      
      expect(tokens).toHaveLength(6);
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
      expect(tokens[4].type).toBe('literal');
      expect(tokens[4].value).toBe(' ');
      expect(tokens[5].type).toBe('rest_parameter');
      expect(tokens[5].name).toBe('rest');
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
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('!@#$%^&*() ');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
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
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('literal');
      expect(tokens[0].value).toBe('hello world ');
      expect(tokens[1].type).toBe('parameter');
      expect(tokens[1].name).toBe('name');
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
    test('should handle empty pattern', () => {
      const tokens = PatternParser.parse('');
      
      expect(tokens).toHaveLength(0);
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