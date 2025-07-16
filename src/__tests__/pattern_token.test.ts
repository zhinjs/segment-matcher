import { PatternToken } from '../pattern_token';

describe('PatternToken', () => {
  describe('createLiteral', () => {
    test('should create literal token with value', () => {
      const token = PatternToken.createLiteral('hello ');
      
      expect(token.type).toBe('literal');
      expect(token.value).toBe('hello ');
      expect(token.segmentType).toBeUndefined();
      expect(token.name).toBeUndefined();
      expect(token.dataType).toBeUndefined();
      expect(token.optional).toBeUndefined();
      expect(token.defaultValue).toBeUndefined();
    });

    test('should create literal token with empty string', () => {
      const token = PatternToken.createLiteral('');
      
      expect(token.type).toBe('literal');
      expect(token.value).toBe('');
    });

    test('should create literal token with special characters', () => {
      const token = PatternToken.createLiteral('!@#$%^&*()');
      
      expect(token.type).toBe('literal');
      expect(token.value).toBe('!@#$%^&*()');
    });
  });

  describe('createTypedLiteral', () => {
    test('should create typed literal token with text type', () => {
      const token = PatternToken.createTypedLiteral('text', 'start');
      
      expect(token.type).toBe('typed_literal');
      expect(token.segmentType).toBe('text');
      expect(token.value).toBe('start');
      expect(token.name).toBeUndefined();
      expect(token.dataType).toBeUndefined();
      expect(token.optional).toBeUndefined();
      expect(token.defaultValue).toBeUndefined();
    });

    test('should create typed literal token with face type', () => {
      const token = PatternToken.createTypedLiteral('face', '1');
      
      expect(token.type).toBe('typed_literal');
      expect(token.segmentType).toBe('face');
      expect(token.value).toBe('1');
    });

    test('should create typed literal token with image type', () => {
      const token = PatternToken.createTypedLiteral('image', 'avatar.png');
      
      expect(token.type).toBe('typed_literal');
      expect(token.segmentType).toBe('image');
      expect(token.value).toBe('avatar.png');
    });

    test('should create typed literal token with at type', () => {
      const token = PatternToken.createTypedLiteral('at', '123456');
      
      expect(token.type).toBe('typed_literal');
      expect(token.segmentType).toBe('at');
      expect(token.value).toBe('123456');
    });

    test('should create typed literal token with empty value', () => {
      const token = PatternToken.createTypedLiteral('text', '');
      
      expect(token.type).toBe('typed_literal');
      expect(token.segmentType).toBe('text');
      expect(token.value).toBe('');
    });
  });

  describe('createParameter', () => {
    test('should create required parameter token', () => {
      const token = PatternToken.createParameter('name', 'text', false);
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('name');
      expect(token.dataType).toBe('text');
      expect(token.optional).toBe(false);
      expect(token.defaultValue).toBeUndefined();
      expect(token.value).toBeUndefined();
      expect(token.segmentType).toBeUndefined();
    });

    test('should create optional parameter token', () => {
      const token = PatternToken.createParameter('count', 'number', true);
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('count');
      expect(token.dataType).toBe('number');
      expect(token.optional).toBe(true);
      expect(token.defaultValue).toBeUndefined();
    });

    test('should create optional parameter token with default value', () => {
      const token = PatternToken.createParameter('count', 'number', true, 1);
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('count');
      expect(token.dataType).toBe('number');
      expect(token.optional).toBe(true);
      expect(token.defaultValue).toBe(1);
    });

    test('should create parameter token with face type', () => {
      const token = PatternToken.createParameter('emoji', 'face', false);
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('emoji');
      expect(token.dataType).toBe('face');
      expect(token.optional).toBe(false);
    });

    test('should create parameter token with image type', () => {
      const token = PatternToken.createParameter('img', 'image', false);
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('img');
      expect(token.dataType).toBe('image');
      expect(token.optional).toBe(false);
    });

    test('should create parameter token with complex default value', () => {
      const defaultValue = { id: 1, name: 'smile' };
      const token = PatternToken.createParameter('emoji', 'face', true, defaultValue);
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('emoji');
      expect(token.dataType).toBe('face');
      expect(token.optional).toBe(true);
      expect(token.defaultValue).toEqual(defaultValue);
    });

    test('should use default optional value (false)', () => {
      const token = PatternToken.createParameter('name', 'text');
      
      expect(token.type).toBe('parameter');
      expect(token.name).toBe('name');
      expect(token.dataType).toBe('text');
      expect(token.optional).toBe(false);
    });
  });

  describe('createRestParameter', () => {
    test('should create rest parameter token without type restriction', () => {
      const token = PatternToken.createRestParameter('rest', null);
      
      expect(token.type).toBe('rest_parameter');
      expect(token.name).toBe('rest');
      expect(token.dataType).toBe(null);
      expect(token.optional).toBeUndefined();
      expect(token.defaultValue).toBeUndefined();
      expect(token.value).toBeUndefined();
      expect(token.segmentType).toBeUndefined();
    });

    test('should create rest parameter token with text type restriction', () => {
      const token = PatternToken.createRestParameter('messages', 'text');
      
      expect(token.type).toBe('rest_parameter');
      expect(token.name).toBe('messages');
      expect(token.dataType).toBe('text');
    });

    test('should create rest parameter token with face type restriction', () => {
      const token = PatternToken.createRestParameter('faces', 'face');
      
      expect(token.type).toBe('rest_parameter');
      expect(token.name).toBe('faces');
      expect(token.dataType).toBe('face');
    });

    test('should create rest parameter token with image type restriction', () => {
      const token = PatternToken.createRestParameter('images', 'image');
      
      expect(token.type).toBe('rest_parameter');
      expect(token.name).toBe('images');
      expect(token.dataType).toBe('image');
    });

    test('should create rest parameter token with empty string type', () => {
      const token = PatternToken.createRestParameter('rest', '');
      
      expect(token.type).toBe('rest_parameter');
      expect(token.name).toBe('rest');
      expect(token.dataType).toBe('');
    });
  });

  describe('constructor', () => {
    test('should create token with minimal options', () => {
      const token = new PatternToken('literal');
      
      expect(token.type).toBe('literal');
      expect(token.value).toBeUndefined();
      expect(token.name).toBeUndefined();
    });

    test('should create token with all options', () => {
      const options = {
        value: 'test',
        segmentType: 'text',
        name: 'param',
        dataType: 'text',
        optional: true,
        defaultValue: 'default'
      };
      const token = new PatternToken('parameter', options);
      
      expect(token.type).toBe('parameter');
      expect(token.value).toBe('test');
      expect(token.segmentType).toBe('text');
      expect(token.name).toBe('param');
      expect(token.dataType).toBe('text');
      expect(token.optional).toBe(true);
      expect(token.defaultValue).toBe('default');
    });

    test('should create token with partial options', () => {
      const token = new PatternToken('typed_literal', { segmentType: 'face', value: '1' });
      
      expect(token.type).toBe('typed_literal');
      expect(token.segmentType).toBe('face');
      expect(token.value).toBe('1');
      expect(token.name).toBeUndefined();
      expect(token.dataType).toBeUndefined();
    });
  });
}); 