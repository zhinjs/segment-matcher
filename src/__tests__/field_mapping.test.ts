import { extractFieldValue } from '../field_mapping';
import { MessageSegment } from '../types';

describe('Field Mapping', () => {
  describe('extractFieldValue', () => {
    const segment: MessageSegment = {
      type: 'custom',
      data: {
        id: 123,
        name: 'test',
        nested: {
          value: 'nested value'
        },
        array: [1, 2, 3]
      }
    };

    test('should extract value using string field', () => {
      expect(extractFieldValue(segment, 'id')).toBe(123);
      expect(extractFieldValue(segment, 'name')).toBe('test');
      expect(extractFieldValue(segment, 'nonexistent')).toBeNull();
    });

    test('should extract value using string array', () => {
      expect(extractFieldValue(segment, ['id', 'name'])).toBe(123);
      expect(extractFieldValue(segment, ['nonexistent', 'id'])).toBe(123);
      expect(extractFieldValue(segment, ['nonexistent'])).toBeNull();
    });

    test('should extract value using function', () => {
      const extractor = (seg: MessageSegment) => seg.data.nested.value;
      expect(extractFieldValue(segment, extractor)).toBe('nested value');
    });

    test('should handle function errors', () => {
      const badExtractor = () => { throw new Error('test error'); };
      expect(extractFieldValue(segment, badExtractor)).toBeNull();
    });

    test('should handle complex extractors', () => {
      // 数组操作
      const arrayExtractor = (seg: MessageSegment) => seg.data.array.join(',');
      expect(extractFieldValue(segment, arrayExtractor)).toBe('1,2,3');

      // 条件提取
      const conditionalExtractor = (seg: MessageSegment) => 
        seg.data.id > 100 ? seg.data.name : null;
      expect(extractFieldValue(segment, conditionalExtractor)).toBe('test');

      // 组合多个字段
      const combineExtractor = (seg: MessageSegment) => 
        `${seg.data.name}#${seg.data.id}`;
      expect(extractFieldValue(segment, combineExtractor)).toBe('test#123');
    });

    test('should handle edge cases', () => {
      const emptySegment: MessageSegment = { type: 'empty', data: {} };
      
      // 空对象
      expect(extractFieldValue(emptySegment, 'any')).toBeNull();
      
      // null 值
      const nullSegment: MessageSegment = { 
        type: 'null', 
        data: { field: null } 
      };
      expect(extractFieldValue(nullSegment, 'field')).toBeNull();
      
      // undefined 值
      const undefinedSegment: MessageSegment = { 
        type: 'undefined', 
        data: { field: undefined } 
      };
      expect(extractFieldValue(undefinedSegment, 'field')).toBeNull();
    });
  });
});
