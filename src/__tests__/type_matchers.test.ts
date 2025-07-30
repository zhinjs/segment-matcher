import {
  TypeMatcher,
  TypeMatchResult,
  NumberTypeMatcher,
  IntegerTypeMatcher,
  FloatTypeMatcher,
  BooleanTypeMatcher,
  TextTypeMatcher,
  TypeMatcherRegistry
} from '../type_matchers';

describe('TypeMatcher System', () => {
  describe('NumberTypeMatcher', () => {
    let matcher: NumberTypeMatcher;

    beforeEach(() => {
      matcher = new NumberTypeMatcher();
    });

    test('should match positive integers', () => {
      const result = matcher.match('123');
      expect(result.success).toBe(true);
      expect(result.value).toBe(123);
      expect(typeof result.value).toBe('number');
    });

    test('should match negative integers', () => {
      const result = matcher.match('-456');
      expect(result.success).toBe(true);
      expect(result.value).toBe(-456);
      expect(typeof result.value).toBe('number');
    });

    test('should match positive decimals', () => {
      const result = matcher.match('123.45');
      expect(result.success).toBe(true);
      expect(result.value).toBe(123.45);
      expect(typeof result.value).toBe('number');
    });

    test('should match negative decimals', () => {
      const result = matcher.match('-123.45');
      expect(result.success).toBe(true);
      expect(result.value).toBe(-123.45);
      expect(typeof result.value).toBe('number');
    });

    test('should match zero', () => {
      const result = matcher.match('0');
      expect(result.success).toBe(true);
      expect(result.value).toBe(0);
      expect(typeof result.value).toBe('number');
    });

    test('should match decimal zero', () => {
      const result = matcher.match('0.0');
      expect(result.success).toBe(true);
      expect(result.value).toBe(0);
      expect(typeof result.value).toBe('number');
    });

    test('should reject non-numeric strings', () => {
      const result = matcher.match('abc');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject mixed alphanumeric strings', () => {
      const result = matcher.match('123abc');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject empty string', () => {
      const result = matcher.match('');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });
  });

  describe('IntegerTypeMatcher', () => {
    let matcher: IntegerTypeMatcher;

    beforeEach(() => {
      matcher = new IntegerTypeMatcher();
    });

    test('should match positive integers', () => {
      const result = matcher.match('123');
      expect(result.success).toBe(true);
      expect(result.value).toBe(123);
      expect(typeof result.value).toBe('number');
      expect(Number.isInteger(result.value)).toBe(true);
    });

    test('should match negative integers', () => {
      const result = matcher.match('-456');
      expect(result.success).toBe(true);
      expect(result.value).toBe(-456);
      expect(typeof result.value).toBe('number');
      expect(Number.isInteger(result.value)).toBe(true);
    });

    test('should match zero', () => {
      const result = matcher.match('0');
      expect(result.success).toBe(true);
      expect(result.value).toBe(0);
      expect(typeof result.value).toBe('number');
      expect(Number.isInteger(result.value)).toBe(true);
    });

    test('should reject decimals', () => {
      const result = matcher.match('123.45');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject decimal zero', () => {
      const result = matcher.match('0.0');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject non-numeric strings', () => {
      const result = matcher.match('abc');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });
  });

  describe('FloatTypeMatcher', () => {
    let matcher: FloatTypeMatcher;

    beforeEach(() => {
      matcher = new FloatTypeMatcher();
    });

    test('should match positive floats', () => {
      const result = matcher.match('123.45');
      expect(result.success).toBe(true);
      expect(result.value).toBe(123.45);
      expect(typeof result.value).toBe('number');
    });

    test('should match negative floats', () => {
      const result = matcher.match('-123.45');
      expect(result.success).toBe(true);
      expect(result.value).toBe(-123.45);
      expect(typeof result.value).toBe('number');
    });

    test('should match decimal zero', () => {
      const result = matcher.match('0.0');
      expect(result.success).toBe(true);
      expect(result.value).toBe(0);
      expect(typeof result.value).toBe('number');
    });

    test('should reject integers without decimal point', () => {
      const result = matcher.match('123');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject zero without decimal point', () => {
      const result = matcher.match('0');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject non-numeric strings', () => {
      const result = matcher.match('abc');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });
  });

  describe('BooleanTypeMatcher', () => {
    let matcher: BooleanTypeMatcher;

    beforeEach(() => {
      matcher = new BooleanTypeMatcher();
    });

    test('should match "true" as boolean true', () => {
      const result = matcher.match('true');
      expect(result.success).toBe(true);
      expect(result.value).toBe(true);
      expect(typeof result.value).toBe('boolean');
    });

    test('should match "false" as boolean false', () => {
      const result = matcher.match('false');
      expect(result.success).toBe(true);
      expect(result.value).toBe(false);
      expect(typeof result.value).toBe('boolean');
    });

    test('should reject "True" (case sensitive)', () => {
      const result = matcher.match('True');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject "FALSE" (case sensitive)', () => {
      const result = matcher.match('FALSE');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject other strings', () => {
      const result = matcher.match('maybe');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });

    test('should reject empty string', () => {
      const result = matcher.match('');
      expect(result.success).toBe(false);
      expect(result.value).toBeUndefined();
    });
  });

  describe('TextTypeMatcher', () => {
    let matcher: TextTypeMatcher;

    beforeEach(() => {
      matcher = new TextTypeMatcher();
    });

    test('should match any text string', () => {
      const result = matcher.match('hello world');
      expect(result.success).toBe(true);
      expect(result.value).toBe('hello world');
      expect(typeof result.value).toBe('string');
    });

    test('should match empty string', () => {
      const result = matcher.match('');
      expect(result.success).toBe(true);
      expect(result.value).toBe('');
      expect(typeof result.value).toBe('string');
    });

    test('should match numeric strings as text', () => {
      const result = matcher.match('123');
      expect(result.success).toBe(true);
      expect(result.value).toBe('123');
      expect(typeof result.value).toBe('string');
    });
  });

  describe('TypeMatcherRegistry', () => {
    test('should return correct matcher for supported types', () => {
      expect(TypeMatcherRegistry.getMatcher('number')).toBeInstanceOf(NumberTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('integer')).toBeInstanceOf(IntegerTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('float')).toBeInstanceOf(FloatTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('boolean')).toBeInstanceOf(BooleanTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('text')).toBeInstanceOf(TextTypeMatcher);
    });

    test('should return null for unsupported types', () => {
      expect(TypeMatcherRegistry.getMatcher('unknown')).toBeNull();
      expect(TypeMatcherRegistry.getMatcher('face')).toBeNull();
      expect(TypeMatcherRegistry.getMatcher('image')).toBeNull();
    });

    test('should correctly identify special matchers', () => {
      expect(TypeMatcherRegistry.hasSpecialMatcher('number')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('integer')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('float')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('boolean')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('text')).toBe(false); // text is not considered special
      expect(TypeMatcherRegistry.hasSpecialMatcher('unknown')).toBe(false);
    });

    test('should return all supported types', () => {
      const supportedTypes = TypeMatcherRegistry.getSupportedTypes();
      expect(supportedTypes).toContain('number');
      expect(supportedTypes).toContain('integer');
      expect(supportedTypes).toContain('float');
      expect(supportedTypes).toContain('boolean');
      expect(supportedTypes).toContain('text');
      expect(supportedTypes).toHaveLength(5);
    });

    test('should allow registering new matchers', () => {
             // Create a custom matcher for testing
       class CustomTypeMatcher implements TypeMatcher {
         match(text: string): TypeMatchResult {
           if (text === 'custom') {
             return { success: true, value: 'matched' };
           }
           return { success: false };
         }
       }

      const customMatcher = new CustomTypeMatcher();
      TypeMatcherRegistry.registerMatcher('custom', customMatcher);

      expect(TypeMatcherRegistry.getMatcher('custom')).toBe(customMatcher);
      expect(TypeMatcherRegistry.hasSpecialMatcher('custom')).toBe(true);
      expect(TypeMatcherRegistry.getSupportedTypes()).toContain('custom');

      // Test the custom matcher works
      const matcher = TypeMatcherRegistry.getMatcher('custom')!;
      expect(matcher.match('custom')).toEqual({ success: true, value: 'matched' });
      expect(matcher.match('other')).toEqual({ success: false });
    });
  });

  describe('Integration with existing functionality', () => {
    test('should maintain backward compatibility with SegmentMatcher', () => {
      // Import SegmentMatcher to test integration
      const { SegmentMatcher } = require('../segment_matcher');

      // Test that the refactored code still works with existing patterns
      const numberCmd = new SegmentMatcher('test <value:number>');
      const integerCmd = new SegmentMatcher('test <value:integer>');
      const floatCmd = new SegmentMatcher('test <value:float>');
      const booleanCmd = new SegmentMatcher('test <value:boolean>');

      // Test number matching
      const numberResult = numberCmd.match([{ type: 'text', data: { text: 'test 123.45' } }]);
      expect(numberResult).not.toBeNull();
      expect(numberResult?.params).toEqual({ value: 123.45 });

      // Test integer matching
      const integerResult = integerCmd.match([{ type: 'text', data: { text: 'test 123' } }]);
      expect(integerResult).not.toBeNull();
      expect(integerResult?.params).toEqual({ value: 123 });

      // Test float matching
      const floatResult = floatCmd.match([{ type: 'text', data: { text: 'test 123.45' } }]);
      expect(floatResult).not.toBeNull();
      expect(floatResult?.params).toEqual({ value: 123.45 });

      // Test boolean matching
      const booleanResult = booleanCmd.match([{ type: 'text', data: { text: 'test true' } }]);
      expect(booleanResult).not.toBeNull();
      expect(booleanResult?.params).toEqual({ value: true });
    });

    test('should work with optional parameters and default values', () => {
      const { SegmentMatcher } = require('../segment_matcher');

      const optionalCmd = new SegmentMatcher('config [value:number=100]');
      
      // Test with missing parameter (should use default)
      const defaultResult = optionalCmd.match([{ type: 'text', data: { text: 'config ' } }]);
      expect(defaultResult).not.toBeNull();
      expect(defaultResult?.params).toEqual({ value: 100 });

      // Test with provided parameter
      const providedResult = optionalCmd.match([{ type: 'text', data: { text: 'config 200' } }]);
      expect(providedResult).not.toBeNull();
      expect(providedResult?.params).toEqual({ value: 200 });

      // Test with invalid format (should use default and add to remaining)
      const invalidResult = optionalCmd.match([{ type: 'text', data: { text: 'config abc' } }]);
      expect(invalidResult).not.toBeNull();
      expect(invalidResult?.params).toEqual({ value: 100 });
      expect(invalidResult?.remaining).toEqual([{ type: 'text', data: { text: 'abc' } }]);
    });
  });
}); 