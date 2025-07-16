import { CommanderError, PatternParseError, ValidationError, MatchError } from '../errors';

describe('Error Classes', () => {
  describe('CommanderError', () => {
    test('should create CommanderError with message and code', () => {
      const error = new CommanderError('Test error', 'TEST_ERROR', { detail: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('CommanderError');
    });

    test('should create CommanderError without details', () => {
      const error = new CommanderError('Simple error', 'SIMPLE_ERROR');
      
      expect(error.message).toBe('Simple error');
      expect(error.code).toBe('SIMPLE_ERROR');
      expect(error.details).toBeUndefined();
    });

    test('should be instance of Error', () => {
      const error = new CommanderError('Test', 'TEST');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('PatternParseError', () => {
    test('should create PatternParseError with pattern and position', () => {
      const error = new PatternParseError('Parse failed', 'hello <name:text>', 10);
      
      expect(error.message).toBe('Parse failed');
      expect(error.code).toBe('PATTERN_PARSE_ERROR');
      expect(error.details?.pattern).toBe('hello <name:text>');
      expect(error.details?.position).toBe(10);
      expect(error.name).toBe('PatternParseError');
    });

    test('should create PatternParseError without pattern and position', () => {
      const error = new PatternParseError('Parse failed');
      
      expect(error.message).toBe('Parse failed');
      expect(error.code).toBe('PATTERN_PARSE_ERROR');
      expect(error.details?.pattern).toBeUndefined();
      expect(error.details?.position).toBeUndefined();
    });

    test('should be instance of CommanderError', () => {
      const error = new PatternParseError('Test');
      expect(error).toBeInstanceOf(CommanderError);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with field and value', () => {
      const error = new ValidationError('Invalid input', 'pattern', 'invalid_pattern');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details?.field).toBe('pattern');
      expect(error.details?.value).toBe('invalid_pattern');
      expect(error.name).toBe('ValidationError');
    });

    test('should create ValidationError without field and value', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details?.field).toBeUndefined();
      expect(error.details?.value).toBeUndefined();
    });

    test('should be instance of CommanderError', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(CommanderError);
    });
  });

  describe('MatchError', () => {
    test('should create MatchError with pattern and segments', () => {
      const segments = [{ type: 'text', data: { text: 'hello' } }];
      const error = new MatchError('Match failed', 'hello <name:text>', segments);
      
      expect(error.message).toBe('Match failed');
      expect(error.code).toBe('MATCH_ERROR');
      expect(error.details?.pattern).toBe('hello <name:text>');
      expect(error.details?.segments).toEqual(segments);
      expect(error.name).toBe('MatchError');
    });

    test('should create MatchError without pattern and segments', () => {
      const error = new MatchError('Match failed');
      
      expect(error.message).toBe('Match failed');
      expect(error.code).toBe('MATCH_ERROR');
      expect(error.details?.pattern).toBeUndefined();
      expect(error.details?.segments).toBeUndefined();
    });

    test('should be instance of CommanderError', () => {
      const error = new MatchError('Test');
      expect(error).toBeInstanceOf(CommanderError);
    });
  });
}); 