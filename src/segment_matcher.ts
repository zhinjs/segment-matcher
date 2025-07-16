import { MessageSegment, MatchResponse } from './types';
import { PatternToken } from './pattern_token';
import { MatchResult } from './match_result';

/**
 * 性能优化的深拷贝函数
 * 
 * 根据对象复杂度选择最优的拷贝策略：
 * - 简单对象：浅拷贝 + 手动深拷贝关键字段
 * - 复杂对象：结构化克隆
 * - 降级方案：JSON 深拷贝
 * 
 * @param obj - 要深拷贝的对象
 * @returns 深拷贝后的对象
 */
function optimizedDeepClone<T>(obj: T): T {
  // 快速路径：null 或 undefined
  if (obj == null) return obj;
  
  // 快速路径：基本类型
  if (typeof obj !== 'object') return obj;
  
  // 快速路径：Date 和 RegExp
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof RegExp) return new RegExp(obj) as T;
  
  // 检查是否为简单对象（只包含基本类型和数组）
  if (isSimpleObject(obj)) {
    return simpleDeepClone(obj);
  }
  
  // 复杂对象使用结构化克隆
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch {
      // 结构化克隆失败，降级到 JSON 方法
    }
  }
  
  // 降级方案：JSON 深拷贝
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 检查是否为简单对象（只包含基本类型、数组和简单对象）
 */
function isSimpleObject(obj: any): boolean {
  if (Array.isArray(obj)) {
    return obj.every(item => isSimpleObject(item));
  }
  
  if (obj === null || typeof obj !== 'object') {
    return true;
  }
  
  // 检查是否为 Date、RegExp 等复杂对象
  if (obj instanceof Date || obj instanceof RegExp || obj instanceof Map || obj instanceof Set) {
    return false;
  }
  
  // 递归检查所有属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!isSimpleObject(obj[key])) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 简单对象的快速深拷贝
 */
function simpleDeepClone<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(item => simpleDeepClone(item)) as T;
  }
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = simpleDeepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * 类型检查缓存
 */
const typeCheckCache = new WeakMap<object, boolean>();

/**
 * 缓存类型检查结果
 */
function cachedTypeCheck(segment: MessageSegment, expectedType: string): boolean {
  const cacheKey = segment as object;
  if (typeCheckCache.has(cacheKey)) {
    return typeCheckCache.get(cacheKey)!;
  }
  
  const result = segment.type === expectedType;
  typeCheckCache.set(cacheKey, result);
  return result;
}

/**
 * 优化的数组插入操作
 */
function optimizedArrayInsert<T>(arr: T[], index: number, item: T): void {
  // 对于小数组，直接使用 splice
  if (arr.length < 100) {
    arr.splice(index, 0, item);
    return;
  }
  
  // 对于大数组，使用更高效的方法
  arr.length++;
  for (let i = arr.length - 1; i > index; i--) {
    arr[i] = arr[i - 1];
  }
  arr[index] = item;
}

/**
 * 优化的字符串分割
 */
function optimizedSplitText(text: string, pattern: string): { beforeText: string; matchedText: string; afterText: string } {
  const index = text.indexOf(pattern);
  if (index === -1) {
    return { beforeText: text, matchedText: '', afterText: '' };
  }
  
  return {
    beforeText: text.substring(0, index),
    matchedText: pattern,
    afterText: text.substring(index + pattern.length)
  };
}

/**
 * 消息段匹配器类
 * 
 * 负责根据模式令牌数组匹配 OneBot12 消息段。
 * 支持字面量匹配、类型化字面量匹配、参数提取和剩余参数收集。
 * 
 * @example
 * ```typescript
 * const tokens = PatternParser.parse('hello <name:text>');
 * const segments = [{ type: 'text', data: { text: 'hello Alice' } }];
 * const result = SegmentMatcher.match(tokens, segments);
 * // result.params.name === 'Alice'
 * ```
 */
export class SegmentMatcher {
  /**
   * 匹配消息段
   * 
   * 根据模式令牌数组匹配消息段，提取参数并收集剩余消息段。
   * 支持空格敏感匹配和自定义字段映射。
   * 
   * @param pattern - 解析后的模式令牌数组
   * @param segments - OneBot12 消息段数组
   * @param typedLiteralFieldMap - 自定义的类型化字面量字段映射（可选）
   * @returns 匹配结果或 null（匹配失败时）
   * 
   * @example
   * ```typescript
   * // 基础匹配
   * const result = SegmentMatcher.match(tokens, segments);
   * 
   * // 自定义字段映射
   * const customResult = SegmentMatcher.match(tokens, segments, {
   *   image: 'src'  // 使用 'src' 字段而不是默认的 'file' 或 'url'
   * });
   * ```
   */
  static match(pattern: PatternToken[], segments: MessageSegment[], typedLiteralFieldMap?: Record<string, string | string[]>): MatchResult | null {
    // 快速路径：空模式或空消息段
    if (!pattern.length) {
      return segments.length ? new MatchResult() : null;
    }
    
    if (!segments.length) {
      // 检查是否所有令牌都是可选的
      const allOptional = pattern.every(token => token.optional || token.type === 'rest_parameter');
      if (allOptional) {
        const result = new MatchResult();
        pattern.forEach(token => {
          if (token.name && token.optional) {
            const defaultValue = token.defaultValue !== undefined ? token.defaultValue : 
                               (token.dataType === 'text' ? '' : null);
            result.addParam(token.name, defaultValue);
          } else if (token.name && token.type === 'rest_parameter') {
            result.addParam(token.name, []);
          }
        });
        return result;
      }
      return null;
    }
    
    const result = new MatchResult();
    const segmentsCopy = optimizedDeepClone(segments) as MessageSegment[]; // 使用优化的深拷贝
    
    let segmentIndex = 0; // 当前处理的消息段索引
    let patternIndex = 0; // 当前处理的模式令牌索引
    
    // 逐个匹配模式令牌和消息段
    while (patternIndex < pattern.length) {
      const patternToken = pattern[patternIndex];
      const segment = segmentIndex < segmentsCopy.length ? segmentsCopy[segmentIndex] : undefined;
  
      if (segment) {
        // 尝试匹配当前令牌和消息段
        const matchResult = SegmentMatcher.matchToken(patternToken, segment, segmentsCopy, segmentIndex, typedLiteralFieldMap);
        if (matchResult.success) {
          // 匹配成功，添加匹配的消息段
          if (matchResult.matched) {
            result.matched.push(...matchResult.matched);
          }
          if (matchResult.param) {
            // 添加提取的参数
            result.addParam(matchResult.param.name, matchResult.param.value);
          }
          // literal 匹配后，判断是否插入了新 segment
          if (patternToken.type === 'literal') {
            // 检查 literal 匹配后是否插入了新 segment
            const matchedText = patternToken.value!;
            const originalText = segment.type === 'text' && segment.data && typeof segment.data.text === 'string' ? segment.data.text : '';
            const afterText = originalText.substring(matchedText.length);
            if (afterText) {
              // 插入了新 segment，segmentIndex 递增后正好指向新 segment
              segmentIndex++;
            } else {
              // 没有插入新 segment，segmentIndex 递增
              segmentIndex++;
            }
          } else {
            // 其他类型，按 matchResult.newSegmentIndex 或默认递增
            segmentIndex = matchResult.newSegmentIndex !== undefined ? matchResult.newSegmentIndex : segmentIndex + 1;
          }
          patternIndex++;
          continue;
        }
      }
      
      // 当前消息段不存在或不匹配
      if (patternToken.optional) {
        // 处理可选参数
        if (patternToken.name) {
          // 设置默认值（无论 segment 是否匹配都返回）
          const defaultValue = patternToken.defaultValue !== undefined ? patternToken.defaultValue : 
                             (patternToken.dataType === 'text' ? '' : null);
          result.addParam(patternToken.name, defaultValue);
        }
        patternIndex++;
        // segmentIndex 只在 segment 存在且匹配时才递增（已在上面处理）
      } else if (patternToken.type === 'rest_parameter') {
        // rest 参数无论是否有剩余 segment 都返回空数组
        if (patternToken.name) {
          result.addParam(patternToken.name, []);
        }
        patternIndex++;
      } else {
        // 必需参数不匹配，返回 null 表示匹配失败
        return null;
      }
    }
    
    // 处理剩余的消息段（未被模式匹配的部分）
    while (segmentIndex < segmentsCopy.length) {
      result.addRemaining(segmentsCopy[segmentIndex]);
      segmentIndex++;
    }
    
    // 返回有效的匹配结果，否则返回 null
    return result.isValid() ? result : null;
  }

  /**
   * 匹配单个令牌和消息段
   * 
   * 根据令牌类型选择相应的匹配策略。
   * 
   * @param token - 模式令牌
   * @param segment - 消息段
   * @param segments - 完整的消息段数组（用于修改）
   * @param segmentIndex - 当前消息段索引
   * @param typedLiteralFieldMap - 自定义字段映射
   * @returns 匹配响应
   */
  private static matchToken(token: PatternToken, segment: MessageSegment, segments: MessageSegment[], segmentIndex: number, typedLiteralFieldMap?: Record<string, string | string[]>): MatchResponse {
    switch (token.type) {
      case 'literal':
        return SegmentMatcher.matchLiteral(token, segment, segments, segmentIndex);
      case 'typed_literal':
        return SegmentMatcher.matchTypedLiteral(token, segment, segments, segmentIndex, typedLiteralFieldMap);
      case 'parameter':
        return SegmentMatcher.matchParameter(token, segment);
      case 'rest_parameter':
        return SegmentMatcher.matchRestParameter(token, segments, segmentIndex);
      default:
        // 未知的令牌类型，匹配失败
        return { success: false };
    }
  }

  /**
   * 匹配字面量令牌
   * 
   * 检查文本消息段是否以指定的字面量开头。
   * 支持空格敏感匹配，将剩余文本插入到下一个位置。
   * 
   * @param token - 字面量令牌
   * @param segment - 消息段
   * @param segments - 消息段数组（用于插入剩余文本）
   * @param segmentIndex - 当前索引
   * @returns 匹配响应
   */
  private static matchLiteral(token: PatternToken, segment: MessageSegment, segments: MessageSegment[], segmentIndex: number): MatchResponse {
    // 快速路径：类型检查
    if (segment.type !== 'text') return { success: false };
    
    const textData = segment.data?.text;
    if (typeof textData !== 'string') return { success: false };
    
    const tokenValue = token.value!;
    if (!textData.startsWith(tokenValue)) return { success: false };
    
    const afterText = textData.substring(tokenValue.length);
    const matched: MessageSegment[] = [];
    
    // 创建匹配的消息段
    matched.push({ type: 'text', data: { text: tokenValue } });
    
    // 将剩余文本插入到下一个位置，供后续匹配使用
    if (afterText) {
      optimizedArrayInsert(segments, segmentIndex + 1, {
        type: 'text',
        data: { text: afterText }
      });
    }
    
    return {
      success: true,
      matched,
      newSegmentIndex: segmentIndex + 1
    };
  }

  /**
   * 匹配类型化字面量令牌
   * 
   * 检查消息段类型和字段值是否匹配指定的类型化字面量。
   * 支持多字段匹配和文本包含匹配。
   * 
   * @param token - 类型化字面量令牌
   * @param segment - 消息段
   * @param segments - 消息段数组（用于插入分割后的文本）
   * @param segmentIndex - 当前索引
   * @param typedLiteralFieldMap - 自定义字段映射
   * @returns 匹配响应
   */
  private static matchTypedLiteral(token: PatternToken, segment: MessageSegment, segments: MessageSegment[], segmentIndex: number, typedLiteralFieldMap?: Record<string, string | string[]>): MatchResponse {
    // 快速路径：类型检查
    if (!cachedTypeCheck(segment, token.segmentType!)) {
      return { success: false };
    }
    
    const field = typedLiteralFieldMap?.[segment.type];
    if (!field || !segment.data || token.value === undefined) {
      return { success: false };
    }
    
    // 处理数组字段：只要其中一个匹配即可
    if (Array.isArray(field)) {
      for (const singleField of field) {
        const fieldValue = segment.data[singleField];
        if (fieldValue === undefined) continue;
        
        // 精确匹配
        if (String(fieldValue) === token.value) {
          return {
            success: true,
            matched: [segment],
            newSegmentIndex: segmentIndex + 1
          };
        }
        
        // text 类型特殊处理，允许包含匹配
        if (segment.type === 'text' && typeof fieldValue === 'string' && fieldValue.includes(token.value)) {
          const { beforeText, matchedText, afterText } = optimizedSplitText(fieldValue, token.value);
          const matched: MessageSegment[] = [];
          if (beforeText) {
            matched.push({ type: 'text', data: { text: beforeText } });
          }
          matched.push({ type: 'text', data: { text: matchedText } });
          if (afterText) {
            optimizedArrayInsert(segments, segmentIndex + 1, {
              type: 'text',
              data: { text: afterText }
            });
          }
          return {
            success: true,
            matched,
            newSegmentIndex: segmentIndex + 1
          };
        }
      }
    } else {
      // 处理单个字段
      const fieldValue = segment.data[field];
      if (fieldValue === undefined) return { success: false };
      
      // 精确匹配
      if (String(fieldValue) === token.value) {
        return {
          success: true,
          matched: [segment],
          newSegmentIndex: segmentIndex + 1
        };
      }
      
      // text 类型特殊处理，允许包含匹配
      if (segment.type === 'text' && typeof fieldValue === 'string' && fieldValue.includes(token.value)) {
        const { beforeText, matchedText, afterText } = optimizedSplitText(fieldValue, token.value);
        const matched: MessageSegment[] = [];
        if (beforeText) {
          matched.push({ type: 'text', data: { text: beforeText } });
        }
        matched.push({ type: 'text', data: { text: matchedText } });  
        if (afterText) {
          optimizedArrayInsert(segments, segmentIndex + 1, {
            type: 'text',
            data: { text: afterText }
          });
        }
        return {
          success: true,
          matched,
          newSegmentIndex: segmentIndex + 1
        };
      }
    }
    
    return { success: false };
  }

  /**
   * 匹配参数令牌
   * 
   * 根据参数类型提取消息段数据。
   * 文本类型提取文本内容，其他类型提取整个消息段。
   * 
   * @param token - 参数令牌
   * @param segment - 消息段
   * @returns 匹配响应
   */
  private static matchParameter(token: PatternToken, segment: MessageSegment): MatchResponse {
    if (!segment) return { success: false };
    
    if (token.dataType === 'text') {
      // 文本类型参数：提取文本内容
      if (segment.type === 'text') {
        return {
          success: true,
          matched: [segment],
          param: { name: token.name!, value: segment.data.text }
        };
      }
    } else {
      // 其他类型参数：提取主字段值或使用默认值对象
      if (cachedTypeCheck(segment, token.dataType!)) {
        let value: any = null;
        // 根据 segment type 提取主字段
        switch (segment.type) {
          case 'face':
            value = segment.data.id;
            break;
          case 'image':
            value = segment.data.file || segment.data.url;
            break;
          case 'at':
            value = segment.data.user_id;
            break;
          default:
            value = null;
        }
        return {
          success: true,
          matched: [segment],
          param: { name: token.name!, value }
        };
      }
    }
    return { success: false };
  }

  /**
   * 匹配剩余参数令牌
   * 
   * 收集剩余的所有消息段或指定类型的消息段。
   * 支持类型限制，遇到第一个不匹配的类型就停止收集。
   * 
   * @param token - 剩余参数令牌
   * @param segments - 消息段数组
   * @param segmentIndex - 开始收集的位置
   * @returns 匹配响应
   */
  private static matchRestParameter(token: PatternToken, segments: MessageSegment[], segmentIndex: number): MatchResponse {
    const restSegments: MessageSegment[] = [];
    let currentSegmentIndex = segmentIndex;

    if (!token.dataType) {
      // [...rest]，收集所有剩余消息段
      const remainingCount = segments.length - segmentIndex;
      if (remainingCount > 0) {
        restSegments.length = remainingCount;
        for (let i = 0; i < remainingCount; i++) {
          restSegments[i] = segments[currentSegmentIndex + i];
        }
        currentSegmentIndex = segments.length;
      }
    } else {
      // [...rest:type]，只收集指定类型的消息段
      // 遇到第一个不匹配的类型就停止收集
      while (currentSegmentIndex < segments.length && cachedTypeCheck(segments[currentSegmentIndex], token.dataType!)) {
        restSegments.push(segments[currentSegmentIndex]);
        currentSegmentIndex++;
      }
    }

    // 即使没有剩余消息段，也返回成功，只是 rest 参数为空数组
    return {
      success: true,
      matched: restSegments,
      param: { name: token.name!, value: restSegments },
      newSegmentIndex: currentSegmentIndex
    };
  }

  /**
   * 分割文本
   * 
   * 将文本按照指定模式分割为前文本、匹配文本和后文本。
   * 用于类型化字面量的包含匹配。
   * 
   * @param text - 原始文本
   * @param pattern - 匹配模式
   * @returns 分割后的文本对象
   */
  private static splitText(text: string, pattern: string): { beforeText: string; matchedText: string; afterText: string } {
    return optimizedSplitText(text, pattern);
  }
} 