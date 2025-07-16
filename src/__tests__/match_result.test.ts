import { MatchResult } from '../match_result';
import { MessageSegment } from '../types';

describe('MatchResult', () => {
  let result: MatchResult;

  beforeEach(() => {
    result = new MatchResult();
  });

  describe('addMatched', () => {
    test('should add matched segment', () => {
      const segment: MessageSegment = { type: 'text', data: { text: 'hello' } };
      
      result.addMatched(segment);
      
      expect(result.matched).toHaveLength(1);
      expect(result.matched[0]).toEqual(segment);
    });

    test('should add multiple matched segments', () => {
      const segment1: MessageSegment = { type: 'text', data: { text: 'hello' } };
      const segment2: MessageSegment = { type: 'face', data: { id: 1 } };
      
      result.addMatched(segment1);
      result.addMatched(segment2);
      
      expect(result.matched).toHaveLength(2);
      expect(result.matched[0]).toEqual(segment1);
      expect(result.matched[1]).toEqual(segment2);
    });

    test('should add face segment', () => {
      const segment: MessageSegment = { type: 'face', data: { id: 1 } };
      
      result.addMatched(segment);
      
      expect(result.matched).toHaveLength(1);
      expect(result.matched[0]).toEqual(segment);
    });

    test('should add image segment', () => {
      const segment: MessageSegment = { type: 'image', data: { file: 'test.jpg' } };
      
      result.addMatched(segment);
      
      expect(result.matched).toHaveLength(1);
      expect(result.matched[0]).toEqual(segment);
    });
  });

  describe('addParam', () => {
    test('should add string parameter', () => {
      result.addParam('name', 'Alice');
      
      expect(result.params.name).toBe('Alice');
      expect(Object.keys(result.params)).toHaveLength(1);
    });

    test('should add number parameter', () => {
      result.addParam('age', 25);
      
      expect(result.params.age).toBe(25);
    });

    test('should add boolean parameter', () => {
      result.addParam('enabled', true);
      
      expect(result.params.enabled).toBe(true);
    });

    test('should add object parameter', () => {
      const obj = { id: 1, name: 'test' };
      result.addParam('config', obj);
      
      expect(result.params.config).toEqual(obj);
    });

    test('should add array parameter', () => {
      const arr = [1, 2, 3];
      result.addParam('numbers', arr);
      
      expect(result.params.numbers).toEqual(arr);
    });

    test('should add null parameter', () => {
      result.addParam('value', null);
      
      expect(result.params.value).toBe(null);
    });

    test('should add undefined parameter', () => {
      result.addParam('value', undefined);
      
      expect(result.params.value).toBe(undefined);
    });

    test('should add multiple parameters', () => {
      result.addParam('name', 'Alice');
      result.addParam('age', 25);
      result.addParam('city', 'Beijing');
      
      expect(result.params.name).toBe('Alice');
      expect(result.params.age).toBe(25);
      expect(result.params.city).toBe('Beijing');
      expect(Object.keys(result.params)).toHaveLength(3);
    });

    test('should override existing parameter', () => {
      result.addParam('name', 'Alice');
      result.addParam('name', 'Bob');
      
      expect(result.params.name).toBe('Bob');
      expect(Object.keys(result.params)).toHaveLength(1);
    });
  });

  describe('addRemaining', () => {
    test('should add remaining segment', () => {
      const segment: MessageSegment = { type: 'text', data: { text: 'world' } };
      
      result.addRemaining(segment);
      
      expect(result.remaining).toHaveLength(1);
      expect(result.remaining[0]).toEqual(segment);
    });

    test('should add multiple remaining segments', () => {
      const segment1: MessageSegment = { type: 'text', data: { text: 'hello' } };
      const segment2: MessageSegment = { type: 'text', data: { text: 'world' } };
      const segment3: MessageSegment = { type: 'face', data: { id: 1 } };
      
      result.addRemaining(segment1);
      result.addRemaining(segment2);
      result.addRemaining(segment3);
      
      expect(result.remaining).toHaveLength(3);
      expect(result.remaining[0]).toEqual(segment1);
      expect(result.remaining[1]).toEqual(segment2);
      expect(result.remaining[2]).toEqual(segment3);
    });

    test('should add complex remaining segment', () => {
      const segment: MessageSegment = { 
        type: 'image', 
        data: { 
          file: 'test.jpg',
          url: 'https://example.com/test.jpg'
        } 
      };
      
      result.addRemaining(segment);
      
      expect(result.remaining).toHaveLength(1);
      expect(result.remaining[0]).toEqual(segment);
    });
  });

  describe('isValid', () => {
    test('should return false for empty result', () => {
      expect(result.isValid()).toBe(false);
    });

    test('should return true when has parameters', () => {
      result.addParam('name', 'Alice');
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has matched segments', () => {
      result.addMatched({ type: 'text', data: { text: 'hello' } });
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has both parameters and matched segments', () => {
      result.addParam('name', 'Alice');
      result.addMatched({ type: 'text', data: { text: 'hello' } });
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has only remaining segments', () => {
      result.addRemaining({ type: 'text', data: { text: 'world' } });
      
      expect(result.isValid()).toBe(false);
    });

    test('should return true when has parameters with null values', () => {
      result.addParam('name', null);
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has parameters with empty string values', () => {
      result.addParam('name', '');
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has parameters with zero values', () => {
      result.addParam('count', 0);
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has parameters with false values', () => {
      result.addParam('enabled', false);
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has parameters with empty array values', () => {
      result.addParam('items', []);
      
      expect(result.isValid()).toBe(true);
    });

    test('should return true when has parameters with empty object values', () => {
      result.addParam('config', {});
      
      expect(result.isValid()).toBe(true);
    });
  });

  describe('initialization', () => {
    test('should initialize with empty arrays and object', () => {
      expect(result.matched).toEqual([]);
      expect(result.params).toEqual({});
      expect(result.remaining).toEqual([]);
    });

    test('should have correct types', () => {
      expect(Array.isArray(result.matched)).toBe(true);
      expect(typeof result.params).toBe('object');
      expect(Array.isArray(result.remaining)).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    test('should handle complex matching scenario', () => {
      // 模拟一个复杂的匹配场景
      result.addMatched({ type: 'text', data: { text: 'hello' } });
      result.addParam('name', 'Alice');
      result.addParam('age', 25);
      result.addRemaining({ type: 'text', data: { text: 'world' } });
      result.addRemaining({ type: 'face', data: { id: 1 } });
      
      expect(result.isValid()).toBe(true);
      expect(result.matched).toHaveLength(1);
      expect(Object.keys(result.params)).toHaveLength(2);
      expect(result.remaining).toHaveLength(2);
      expect(result.params.name).toBe('Alice');
      expect(result.params.age).toBe(25);
    });

    test('should handle empty string parameter', () => {
      result.addParam('message', '');
      
      expect(result.isValid()).toBe(true);
      expect(result.params.message).toBe('');
    });

    test('should handle whitespace parameter', () => {
      result.addParam('space', ' ');
      
      expect(result.isValid()).toBe(true);
      expect(result.params.space).toBe(' ');
    });
  });
}); 