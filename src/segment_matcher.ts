import { MessageSegment } from './types';
import { PatternToken } from './pattern_token';
import { PatternParser } from './pattern_parser';
import { BasicMatcher } from './basic_matcher';
import { MatchResult } from './match_result';
import { ValidationError } from './errors';

/**
 * 快速参数验证
 */
function fastValidateSegments(segments: any): boolean {
  // 快速路径：null 或 undefined
  if (segments == null) {
    return false;
  }
  
  // 检查是否为数组
  return Array.isArray(segments);
}

/**
 * Segment Matcher 主类
 * 
 * 用于解析和匹配消息段的匹配器。
 * 支持复杂的模式匹配、参数提取和链式回调处理。
 * 
 * ```
 */
export class SegmentMatcher {
  
  /** 解析后的模式令牌数组 */
  private tokens: PatternToken[];
  
  /** 类型化字面量的字段映射配置 */
  private typedLiteralFields: Record<string, string | string[]>;

  /**
   * 默认的类型化字面量字段映射规则
   * 
   * 定义了不同消息段类型对应的数据字段：
   * - text: 使用 'text' 字段
   * - face: 使用 'id' 字段
   * - image: 使用 'file' 或 'url' 字段（支持多字段）
   * - at: 使用 'user_id' 字段
   */
  static DEFAULT_TYPED_LITERAL_FIELD_MAP: Record<string, string | string[]> = {
    text: 'text',
    face: 'id',
    image: ['file', 'url'],
    at: 'user_id',
  };

  static create(pattern: string, typedLiteralFields: Record<string, string | string[]>={...SegmentMatcher.DEFAULT_TYPED_LITERAL_FIELD_MAP}): SegmentMatcher {
    return new SegmentMatcher(pattern, typedLiteralFields);
  }

  /**
   * 构造函数
   * 
   * @param pattern - 命令模式字符串，定义匹配规则
   * @param typedLiteralFields - 自定义的类型化字面量字段映射（可选）
   * 
   * @throws {ValidationError} 当模式为空或格式错误时抛出
   * 
   * @example
   * ```typescript
   * // 基础用法
   * const commander = new Commander('hello <name:text>');
   * 
   * // 自定义字段映射
   * const customCommander = new Commander('{image:avatar.png}<name:text>', {
   *   image: 'src'  // 使用 'src' 字段而不是默认的 'file' 或 'url'
   * });
   * ```
   */
  constructor(pattern: string, typedLiteralFields: Record<string, string | string[]>={...SegmentMatcher.DEFAULT_TYPED_LITERAL_FIELD_MAP}) {
    // 参数验证：确保模式是有效的字符串
    if (typeof pattern !== 'string') {
      throw new ValidationError('Pattern must be a string', 'pattern', pattern);
    }
    
    // 参数验证：确保模式不为空
    if (!pattern.trim()) {
      throw new ValidationError('Pattern cannot be empty', 'pattern', pattern);
    }

    // 参数验证：确保字段映射是有效的对象
    if (typedLiteralFields && typeof typedLiteralFields !== 'object') {
      throw new ValidationError('typedLiteralFields must be an object', 'typedLiteralFields', typedLiteralFields);
    }
    this.tokens = PatternParser.parse(pattern);
    
    // 合并默认字段映射和自定义字段映射
    // 自定义映射会覆盖默认映射
    this.typedLiteralFields = Object.assign({}, {
      ...SegmentMatcher.DEFAULT_TYPED_LITERAL_FIELD_MAP,
    }, typedLiteralFields);
  }

  /**
   * 匹配消息段
   * 
   */
  match(segments: MessageSegment[]): MatchResult|null {
    // 快速参数验证
    if (!fastValidateSegments(segments)) {
      throw new ValidationError('Segments must be an array', 'segments', segments);
    }
    return BasicMatcher.match(this.tokens, segments, this.typedLiteralFields);
  }
  /**
   * 获取解析后的模式令牌
   * 
   * 主要用于调试和测试，返回模式解析器生成的令牌数组。
   * 
   * @returns 模式令牌数组
   * 
   * @example
   * ```typescript
   * const commander = new Commander('hello <name:text>');
   * const tokens = segmentMatcher.getTokens();
   * console.log(tokens); // 显示解析后的令牌结构
   * ```
   */
  getTokens(): PatternToken[] {
    return this.tokens;
  }
}

/**
 * 便捷函数：创建命令匹配器实例
 * 
 * 这是一个工厂函数，提供更简洁的 API 来创建 Commander 实例。
 * 
 * @param pattern - 命令模式字符串
 * @param typedLiteralFields - 自定义的类型化字面量字段映射（可选）
 * @returns 新创建的 Commander 实例
 * 
 * @example
 * ```typescript
 * // 使用便捷函数创建实例
 * const commander = match('hello <name:text>');
 * 
 * // 等同于
 * const commander = new Commander('hello <name:text>');
 * ```
 */
export function createMatcher(pattern: string, typedLiteralFields?: Record<string, string | string[]>): SegmentMatcher {
  return SegmentMatcher.create(pattern, typedLiteralFields);
} 