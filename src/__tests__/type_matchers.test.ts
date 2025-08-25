import {
  NumberTypeMatcher,
  IntegerTypeMatcher,
  FloatTypeMatcher,
  BooleanTypeMatcher,
  TextTypeMatcher,
  TypeMatcherRegistry,
  TypeMatcher
} from '../type_matchers';

describe('Type Matchers', () => {
  describe('NumberTypeMatcher', () => {
    const matcher = new NumberTypeMatcher();

    test('should match valid numbers', () => {
      expect(matcher.match('123')).toEqual({ success: true, value: 123 });
      expect(matcher.match('-123')).toEqual({ success: true, value: -123 });
      expect(matcher.match('123.45')).toEqual({ success: true, value: 123.45 });
      expect(matcher.match('-123.45')).toEqual({ success: true, value: -123.45 });
      expect(matcher.match('0')).toEqual({ success: true, value: 0 });
      expect(matcher.match('0.0')).toEqual({ success: true, value: 0 });
    });

    test('should not match invalid numbers', () => {
      expect(matcher.match('abc')).toEqual({ success: false });
      expect(matcher.match('12.34.56')).toEqual({ success: false });
      expect(matcher.match('Infinity')).toEqual({ success: false });
      expect(matcher.match('NaN')).toEqual({ success: false });
      expect(matcher.match('')).toEqual({ success: false });
      expect(matcher.match('1e+1000')).toEqual({ success: false }); // Number.POSITIVE_INFINITY
      expect(matcher.match('-1e+1000')).toEqual({ success: false }); // Number.NEGATIVE_INFINITY
      expect(matcher.match('0/0')).toEqual({ success: false }); // NaN
    });
  });

  describe('IntegerTypeMatcher', () => {
    const matcher = new IntegerTypeMatcher();

    test('should match valid integers', () => {
      expect(matcher.match('123')).toEqual({ success: true, value: 123 });
      expect(matcher.match('-123')).toEqual({ success: true, value: -123 });
      expect(matcher.match('0')).toEqual({ success: true, value: 0 });
    });

    test('should not match invalid integers', () => {
      expect(matcher.match('123.45')).toEqual({ success: false });
      expect(matcher.match('abc')).toEqual({ success: false });
      expect(matcher.match('Infinity')).toEqual({ success: false });
      expect(matcher.match('NaN')).toEqual({ success: false });
      expect(matcher.match('')).toEqual({ success: false });
      expect(matcher.match('1e+1000')).toEqual({ success: false }); // Number.POSITIVE_INFINITY
      expect(matcher.match('-1e+1000')).toEqual({ success: false }); // Number.NEGATIVE_INFINITY
      expect(matcher.match('0/0')).toEqual({ success: false }); // NaN
    });
  });

  describe('FloatTypeMatcher', () => {
    const matcher = new FloatTypeMatcher();

    test('should match valid floats', () => {
      expect(matcher.match('123.45')).toEqual({ success: true, value: 123.45 });
      expect(matcher.match('-123.45')).toEqual({ success: true, value: -123.45 });
      expect(matcher.match('0.0')).toEqual({ success: true, value: 0 });
    });

    test('should not match invalid floats', () => {
      expect(matcher.match('123')).toEqual({ success: false });
      expect(matcher.match('abc')).toEqual({ success: false });
      expect(matcher.match('Infinity')).toEqual({ success: false });
      expect(matcher.match('NaN')).toEqual({ success: false });
      expect(matcher.match('')).toEqual({ success: false });
      expect(matcher.match('1e+1000')).toEqual({ success: false }); // Number.POSITIVE_INFINITY
      expect(matcher.match('-1e+1000')).toEqual({ success: false }); // Number.NEGATIVE_INFINITY
      expect(matcher.match('0/0')).toEqual({ success: false }); // NaN
    });
  });

  describe('BooleanTypeMatcher', () => {
    const matcher = new BooleanTypeMatcher();

    test('should match valid booleans', () => {
      expect(matcher.match('true')).toEqual({ success: true, value: true });
      expect(matcher.match('false')).toEqual({ success: true, value: false });
    });

    test('should not match invalid booleans', () => {
      expect(matcher.match('True')).toEqual({ success: false });
      expect(matcher.match('False')).toEqual({ success: false });
      expect(matcher.match('1')).toEqual({ success: false });
      expect(matcher.match('0')).toEqual({ success: false });
      expect(matcher.match('')).toEqual({ success: false });
    });
  });

  describe('TextTypeMatcher', () => {
    const matcher = new TextTypeMatcher();

    test('should match any text', () => {
      expect(matcher.match('hello')).toEqual({ success: true, value: 'hello' });
      expect(matcher.match('123')).toEqual({ success: true, value: '123' });
      expect(matcher.match('')).toEqual({ success: true, value: '' });
    });
  });

  describe('TypeMatcherRegistry', () => {
    test('should get registered matchers', () => {
      expect(TypeMatcherRegistry.getMatcher('number')).toBeInstanceOf(NumberTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('integer')).toBeInstanceOf(IntegerTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('float')).toBeInstanceOf(FloatTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('boolean')).toBeInstanceOf(BooleanTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('text')).toBeInstanceOf(TextTypeMatcher);
      expect(TypeMatcherRegistry.getMatcher('unknown')).toBeNull();
    });

    test('should check for special matchers', () => {
      expect(TypeMatcherRegistry.hasSpecialMatcher('number')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('integer')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('float')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('boolean')).toBe(true);
      expect(TypeMatcherRegistry.hasSpecialMatcher('text')).toBe(false);
      expect(TypeMatcherRegistry.hasSpecialMatcher('unknown')).toBe(false);
    });

    test('should register new matcher', () => {
      class CustomMatcher implements TypeMatcher {
        match(text: string) {
          return { success: true, value: text };
        }
      }

      TypeMatcherRegistry.registerMatcher('custom', new CustomMatcher());
      expect(TypeMatcherRegistry.getMatcher('custom')).toBeInstanceOf(CustomMatcher);
      expect(TypeMatcherRegistry.hasSpecialMatcher('custom')).toBe(true);
    });

    test('should get supported types', () => {
      const types = TypeMatcherRegistry.getSupportedTypes();
      expect(types).toContain('number');
      expect(types).toContain('integer');
      expect(types).toContain('float');
      expect(types).toContain('boolean');
      expect(types).toContain('text');
    });
  });
});