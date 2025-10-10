
// 消息段接口
export interface MessageSegment {
  type: string|{name:string};
  data: Record<string, any>;
}

// 模式令牌类型: literal 字面量, typed_literal 类型字面量, parameter 参数, rest_parameter 剩余参数
export type TokenType = 'literal' | 'typed_literal' | 'parameter' | 'rest_parameter';

// 模式令牌接口
export interface PatternToken {
  type: TokenType;
  value?: string;
  segmentType?: string;
  name?: string;
  dataType?: string | null;
  optional?: boolean;
  defaultValue?: any;
}

// 匹配结果接口
export interface MatchResult {
  matched: MessageSegment[];
  params: Record<string, any>;
  remaining: MessageSegment[];
}

// 匹配响应接口
export interface MatchResponse {
  success: boolean;
  matched?: MessageSegment[];
  param?: { name: string; value: any };
  newSegmentIndex?: number;
}
