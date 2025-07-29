import { Commander, MessageSegment } from '../index';

describe('Special Rules for Text Type Node Matching', () => {
  describe('match<age:number> special rule (supports integers and decimals)', () => {
    test('should match integers and convert to number', () => {
      const commander = new Commander('hello <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 25 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should match positive decimals and convert to number', () => {
      const commander = new Commander('test <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test 25.5' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 25.5 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should match negative numbers', () => {
      const commander = new Commander('check <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check -10' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: -10 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should match negative decimals', () => {
      const commander = new Commander('check <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check -3.14' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: -3.14 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should match zero', () => {
      const commander = new Commander('check <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check 0' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 0 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should match decimal zero', () => {
      const commander = new Commander('check <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check 0.0' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 0 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should fail to match non-numeric text', () => {
      const commander = new Commander('hello <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello abc' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });

    test('should fail to match numbers with non-numeric suffixes', () => {
      const commander = new Commander('hello <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25abc' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('match<age:integer> special rule (integers only)', () => {
    test('should match positive integers', () => {
      const commander = new Commander('hello <age:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 25 });
      expect(typeof result[0].age).toBe('number');
      expect(Number.isInteger(result[0].age)).toBe(true);
    });

    test('should match negative integers', () => {
      const commander = new Commander('test <age:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test -5' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: -5 });
      expect(typeof result[0].age).toBe('number');
      expect(Number.isInteger(result[0].age)).toBe(true);
    });

    test('should match zero', () => {
      const commander = new Commander('check <age:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check 0' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 0 });
      expect(typeof result[0].age).toBe('number');
      expect(Number.isInteger(result[0].age)).toBe(true);
    });

    test('should fail to match decimals', () => {
      const commander = new Commander('hello <age:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25.5' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });

    test('should fail to match non-numeric text', () => {
      const commander = new Commander('hello <age:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello abc' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('match<age:float> special rule (floats only)', () => {
    test('should match positive floats', () => {
      const commander = new Commander('hello <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25.5' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 25.5 });
      expect(typeof result[0].age).toBe('number');
      expect(result[0].age % 1 !== 0).toBe(true); // has decimal part
    });

    test('should match negative floats', () => {
      const commander = new Commander('test <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'test -3.14' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: -3.14 });
      expect(typeof result[0].age).toBe('number');
      expect(result[0].age % 1 !== 0).toBe(true); // has decimal part
    });

    test('should match decimal zero', () => {
      const commander = new Commander('check <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check 0.0' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 0 });
      expect(typeof result[0].age).toBe('number');
    });

    test('should fail to match integers without decimal point', () => {
      const commander = new Commander('hello <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });

    test('should fail to match zero without decimal point', () => {
      const commander = new Commander('hello <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 0' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });

    test('should fail to match non-numeric text', () => {
      const commander = new Commander('hello <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello abc' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('matchIsSex<matchIsSex:boolean> special rule', () => {
    test('should match "true" and convert to boolean true', () => {
      const commander = new Commander('check <matchIsSex:boolean>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check true' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ matchIsSex: true });
      expect(typeof result[0].matchIsSex).toBe('boolean');
      expect(result[0].matchIsSex).toBe(true);
    });

    test('should match "false" and convert to boolean false', () => {
      const commander = new Commander('verify <matchIsSex:boolean>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'verify false' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ matchIsSex: false });
      expect(typeof result[0].matchIsSex).toBe('boolean');
      expect(result[0].matchIsSex).toBe(false);
    });

    test('should fail to match when text is not "true" or "false"', () => {
      const commander = new Commander('check <matchIsSex:boolean>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check maybe' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });

    test('should fail to match when case is different', () => {
      const commander = new Commander('check <matchIsSex:boolean>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check True' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(0);
    });

    test('should work for any boolean parameter name', () => {
      const commander = new Commander('check <isActive:boolean>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check true' } }
      ];
      
      const result = commander.match(segments);
      
      // Should work for any parameter name with boolean type
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ isActive: true });
      expect(typeof result[0].isActive).toBe('boolean');
    });
  });

  describe('Optional parameters with special type rules', () => {
    describe('Optional number parameters', () => {
      test('should use default value when optional number parameter is missing', () => {
        const commander = new Commander('hello [age:number=25]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello ' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ age: 25 });
        expect(typeof result[0].age).toBe('number');
      });

      test('should use matched value when optional number parameter is provided', () => {
        const commander = new Commander('hello [age:number=25]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello 30' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ age: 30 });
        expect(typeof result[0].age).toBe('number');
      });

      test('should use default value when optional number parameter has invalid format', () => {
        const commander = new Commander('hello [age:number=25]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'hello abc' } }
        ];
        
        const result = commander.match(segments);
        
        // When optional parameter fails to match, it uses default value and unmatched text becomes remaining
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ age: 25 });
        expect(typeof result[0].age).toBe('number');
        expect(result[1]).toEqual({ type: 'text', data: { text: 'abc' } });
      });
    });

    describe('Optional integer parameters', () => {
      test('should use default value when optional integer parameter is missing', () => {
        const commander = new Commander('test [age:integer=10]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test ' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ age: 10 });
        expect(typeof result[0].age).toBe('number');
        expect(Number.isInteger(result[0].age)).toBe(true);
      });

      test('should use matched value when optional integer parameter is provided', () => {
        const commander = new Commander('test [age:integer=10]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test 15' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ age: 15 });
        expect(typeof result[0].age).toBe('number');
        expect(Number.isInteger(result[0].age)).toBe(true);
      });

      test('should use default value when optional integer parameter has decimal', () => {
        const commander = new Commander('test [age:integer=10]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'test 15.5' } }
        ];
        
        const result = commander.match(segments);
        
        // When optional integer parameter fails to match decimal, it uses default value and unmatched text becomes remaining
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ age: 10 });
        expect(typeof result[0].age).toBe('number');
        expect(Number.isInteger(result[0].age)).toBe(true);
        expect(result[1]).toEqual({ type: 'text', data: { text: '15.5' } });
      });
    });

    describe('Optional float parameters', () => {
      test('should use default value when optional float parameter is missing', () => {
        const commander = new Commander('calc [rate:float=3.14]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'calc ' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ rate: 3.14 });
        expect(typeof result[0].rate).toBe('number');
      });

      test('should use matched value when optional float parameter is provided', () => {
        const commander = new Commander('calc [rate:float=3.14]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'calc 2.71' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ rate: 2.71 });
        expect(typeof result[0].rate).toBe('number');
      });

      test('should use default value when optional float parameter has no decimal', () => {
        const commander = new Commander('calc [rate:float=3.14]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'calc 5' } }
        ];
        
        const result = commander.match(segments);
        
        // When optional float parameter fails to match integer, it uses default value and unmatched text becomes remaining
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ rate: 3.14 });
        expect(typeof result[0].rate).toBe('number');
        expect(result[1]).toEqual({ type: 'text', data: { text: '5' } });
      });
    });

    describe('Optional boolean parameters', () => {
      test('should use default value when optional boolean parameter is missing', () => {
        const commander = new Commander('toggle [enabled:boolean=true]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'toggle ' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ enabled: true });
        expect(typeof result[0].enabled).toBe('boolean');
      });

      test('should use matched value when optional boolean parameter is provided', () => {
        const commander = new Commander('toggle [enabled:boolean=true]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'toggle false' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ enabled: false });
        expect(typeof result[0].enabled).toBe('boolean');
      });

      test('should use default value when optional boolean parameter has invalid format', () => {
        const commander = new Commander('toggle [enabled:boolean=true]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'toggle maybe' } }
        ];
        
        const result = commander.match(segments);
        
        // When optional boolean parameter fails to match, it uses default value and unmatched text becomes remaining
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ enabled: true });
        expect(typeof result[0].enabled).toBe('boolean');
        expect(result[1]).toEqual({ type: 'text', data: { text: 'maybe' } });
      });
    });

    describe('Mixed optional parameters', () => {
      test('should handle multiple optional special type parameters', () => {
        const commander = new Commander('config[count:number=5][rate:float=1.5][enabled:boolean=false]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'config' } }
        ];
        
        const result = commander.match(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ count: 5, rate: 1.5, enabled: false });
      });

      test('should handle partial matches with optional special type parameters', () => {
        const commander = new Commander('config[count:number=5][rate:float=1.5][enabled:boolean=false]');
        const segments: MessageSegment[] = [
          { type: 'text', data: { text: 'config10false' } }
        ];
        
        const result = commander.match(segments);
        
        // When input cannot be cleanly parsed, all optional parameters use defaults and input becomes remaining
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ count: 5, rate: 1.5, enabled: false });
        expect(result[1]).toEqual({ type: 'text', data: { text: '10false' } });
      });
    });
  });

  describe('Special rules work for all parameter names', () => {
    test('should work for any parameter name - number type', () => {
      const commander = new Commander('hello <count:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25' } }
      ];
      
      const result = commander.match(segments);
      
      // Should now work for any parameter name with number type
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ count: 25 });
      expect(typeof result[0].count).toBe('number');
    });

    test('should work for any parameter name - integer type', () => {
      const commander = new Commander('hello <count:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25' } }
      ];
      
      const result = commander.match(segments);
      
      // Should now work for any parameter name with integer type
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ count: 25 });
      expect(typeof result[0].count).toBe('number');
      expect(Number.isInteger(result[0].count)).toBe(true);
    });

    test('should work for any parameter name - float type', () => {
      const commander = new Commander('hello <count:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'hello 25.5' } }
      ];
      
      const result = commander.match(segments);
      
      // Should now work for any parameter name with float type
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ count: 25.5 });
      expect(typeof result[0].count).toBe('number');
    });

    test('should work for any parameter name - boolean type', () => {
      const commander = new Commander('check <isActive:boolean>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'check true' } }
      ];
      
      const result = commander.match(segments);
      
      // Should now work for any parameter name with boolean type
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ isActive: true });
      expect(typeof result[0].isActive).toBe('boolean');
    });
  });

  // Special rules parameter name specificity tests removed
  // because special rules now work for all parameter names with matching types

  describe('Integration with other patterns', () => {
    test('should work with literal prefixes - number type', () => {
      const commander = new Commander('user info <age:number>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'user info 30.5' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 30.5 });
    });

    test('should work with literal prefixes - integer type', () => {
      const commander = new Commander('user info <age:integer>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'user info 30' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 30 });
    });

    test('should work with literal prefixes - float type', () => {
      const commander = new Commander('user info <age:float>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'user info 30.5' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ age: 30.5 });
    });

    test('should not interfere with regular text parameters', () => {
      const commander = new Commander('say <message:text>');
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: 'say hello world' } }
      ];
      
      const result = commander.match(segments);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ message: 'hello world' });
      expect(typeof result[0].message).toBe('string');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty text for age rules', () => {
      const numberCommander = new Commander('test <age:number>');
      const integerCommander = new Commander('test <age:integer>');
      const floatCommander = new Commander('test <age:float>');
      
      const segments: MessageSegment[] = [
        { type: 'text', data: { text: '' } }
      ];
      
      expect(numberCommander.match(segments)).toHaveLength(0);
      expect(integerCommander.match(segments)).toHaveLength(0);
      expect(floatCommander.match(segments)).toHaveLength(0);
    });

    test('should handle non-text segments for age rules', () => {
      const numberCommander = new Commander('test <age:number>');
      const integerCommander = new Commander('test <age:integer>');
      const floatCommander = new Commander('test <age:float>');
      
      const segments: MessageSegment[] = [
        { type: 'face', data: { id: 1 } }
      ];
      
      expect(numberCommander.match(segments)).toHaveLength(0);
      expect(integerCommander.match(segments)).toHaveLength(0);
      expect(floatCommander.match(segments)).toHaveLength(0);
    });
  });
}); 