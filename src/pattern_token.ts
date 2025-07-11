import { PatternToken as IPatternToken, TokenType, SegmentType } from './types';

/**
 * 模式令牌类
 */
export class PatternToken implements IPatternToken {
  type: TokenType;
  value?: string;
  segmentType?: SegmentType;
  name?: string;
  dataType?: string | null;
  optional?: boolean;
  defaultValue?: any;

  constructor(type: TokenType, options: Partial<IPatternToken> = {}) {
    this.type = type;
    Object.assign(this, options);
  }

  static createLiteral(value: string): PatternToken {
    return new PatternToken('literal', { value });
  }

  static createTypedLiteral(segmentType: SegmentType, value: string): PatternToken {
    return new PatternToken('typed_literal', { segmentType, value });
  }

  static createParameter(name: string, dataType: string, optional: boolean = false, defaultValue?: any): PatternToken {
    return new PatternToken('parameter', { name, dataType, optional, defaultValue });
  }

  static createRestParameter(name: string, dataType: string | null): PatternToken {
    return new PatternToken('rest_parameter', { name, dataType });
  }
} 