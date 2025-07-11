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
   * @param callback - 回调函数（支持同步和异步）
   * @returns 当前实例，支持链式调用
   */
  action(callback: CallbackFunction): Commander {
    this.callbacks.push(callback);
    return this;
  }

  /**
   * 匹配消息段，根据结果调用回调（同步版本）
   * @param segments - OneBot12消息段数组
   * @returns 返回匹配结果数组或空数组
   */
  match(segments: MessageSegment[]): any[] {
    const result = SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
    // 执行回调链
    const next = (...values: any[]): any[] => {
      const callback = this.callbacks.shift();
      if (!callback) return values;
      return next(callback(...values));
    }
    if (!result) return next();
    const args = [result.params, ...result.remaining];
    return next(...args);
  }

  /**
   * 匹配消息段，根据结果调用回调（异步版本）
   * @param segments - OneBot12消息段数组
   * @returns 返回Promise<匹配结果数组>或Promise<空数组>
   */
  async matchAsync(segments: MessageSegment[]): Promise<any[]> {
    const result = SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
    // 执行异步回调链
    const next = async (...values: any[]): Promise<any[]> => {
      const callback = this.callbacks.shift();
      if (!callback) return values;
      const result = callback(...values);
      // 检查是否为Promise
      if (result instanceof Promise) {
        return next(await result);
      } else {
        return next(result);
      }
    }
    if (!result) return next();
    const args = [result.params, ...result.remaining];
    return next(...args);
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