// 消息段类型定义
export const SEGMENT_TYPES = {
  TEXT: 'text',
  FACE: 'face',
  IMAGE: 'image',
  VOICE: 'voice',
  VIDEO: 'video',
  FILE: 'file',
  AT: 'at',
  REPLY: 'reply',
  FORWARD: 'forward',
  JSON: 'json',
  XML: 'xml',
  CARD: 'card'
} as const;

export type SegmentType = typeof SEGMENT_TYPES[keyof typeof SEGMENT_TYPES];

// 消息段接口
export interface MessageSegment {
  type: SegmentType;
  data: Record<string, any>;
}

// 模式令牌类型: literal 字面量, typed_literal 类型字面量, parameter 参数, rest_parameter 剩余参数
export type TokenType = 'literal' | 'typed_literal' | 'parameter' | 'rest_parameter';

// 模式令牌接口
export interface PatternToken {
  type: TokenType;
  value?: string;
  segmentType?: SegmentType;
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

// 回调函数类型（支持同步和异步）
export type CallbackFunction<T extends any[] = any[], R=any> = 
  | ((...values: T) => R)
  | ((...values: T) => Promise<R>);