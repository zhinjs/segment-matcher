import { MessageSegment, CallbackFunction } from './types';
import { PatternToken } from './pattern_token';
import { PatternParser } from './pattern_parser';
import { SegmentMatcher } from './segment_matcher';

/**
 * Commander 主类
 */
export class Commander {
  private callbacks: CallbackFunction[];
  private tokens: PatternToken[];
  private typedLiteralFields: Record<string, string | string[]>;

  // 默认规则
  static DEFAULT_TYPED_LITERAL_FIELD_MAP: Record<string, string | string[]> = {
    text: 'text',
    face: 'id',
    image: ['file', 'url'],
    at: 'user_id',
  };

  constructor(pattern: string, typedLiteralFields: Record<string, string | string[]>={...Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP}) {
    this.callbacks = [];
    this.tokens = PatternParser.parse(pattern);
    this.typedLiteralFields = Object.assign(typedLiteralFields,{
      ...Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP,
    });
  }

  /**
   * 添加回调函数
   * @param callback - 回调函数
   * @returns 当前实例，支持链式调用
   */
  action(callback: CallbackFunction): Commander {
    this.callbacks.push(callback);
    return this;
  }

  /**
   * 匹配消息段，根据结果调用回调
   * @param segments - OneBot12消息段数组
   * @returns 返回匹配结果数组或null
   */
  match(segments: MessageSegment[]): any {
    const result = SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
    
    if (result) {
      // 匹配成功，将所有参数按顺序展开，最后一个参数为remaining
      const paramValues = Object.values(result.params);
      const args = [...paramValues, result.remaining];
      
      // 执行回调链
      const next = (value: any): any => {
        const callback = this.callbacks.shift();
        if (!callback) return value;
        return next(callback(value));
      }
      return next(args);
    } else {
      // 匹配失败，执行回调链
      const next = (value: any): any => {
        const callback = this.callbacks.shift();
        if (!callback) return value;
        return next(callback(value));
      }
      return next(null);
    }
  }

  /**
   * 获取解析后的令牌（用于调试）
   * @returns 令牌数组
   */
  getTokens(): PatternToken[] {
    return this.tokens;
  }
}

/**
 * 便捷函数：创建命令匹配器
 * @param pattern - 命令模式
 * @returns 命令匹配器实例
 */
export function match(pattern: string, typedLiteralFields?: Record<string, string | string[]>): Commander {
  return new Commander(pattern, typedLiteralFields);
} 