import { MessageSegment, CallbackFunction } from './types';
import { PatternToken } from './pattern_token';
import { PatternParser } from './pattern_parser';
import { SegmentMatcher } from './segment_matcher';
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
 * 优化的回调链执行器
 */
class OptimizedCallbackChain {
  private callbacks: CallbackFunction[];
  
  constructor(callbacks: CallbackFunction[]) {
    this.callbacks = [...callbacks]; // 创建副本避免修改原数组
  }
  
  /**
   * 同步执行回调链
   */
  executeSync(...initialValues: any[]): any[] {
    if (this.callbacks.length === 0) {
      return initialValues;
    }
    
    let values = initialValues;
    for (const callback of this.callbacks) {
      values = [callback(...values)];
    }
    
    return Array.isArray(values) ? values : [values];
  }
  
  /**
   * 异步执行回调链
   */
  async executeAsync(...initialValues: any[]): Promise<any[]> {
    if (this.callbacks.length === 0) {
      return initialValues;
    }
    
    let values = initialValues;
    for (const callback of this.callbacks) {
      const result = callback(...values);
      values = result instanceof Promise ? [await result] : [result];
    }
    
    return Array.isArray(values) ? values : [values];
  }
}

/**
 * OneBot Commander 主类
 * 
 * 用于解析和匹配 OneBot12 消息段的命令解析器。
 * 支持复杂的模式匹配、参数提取和链式回调处理。
 * 
 * @example
 * ```typescript
 * const commander = new Commander('hello <name:text>');
 * commander.action((params) => {
 *   console.log(`Hello, ${params.name}!`);
 * });
 * ```
 */
export class Commander {
  /** 回调函数数组，用于链式处理匹配结果 */
  private callbacks: CallbackFunction[];
  
  /** 解析后的模式令牌数组 */
  private tokens: PatternToken[];
  
  /** 类型化字面量的字段映射配置 */
  private typedLiteralFields: Record<string, string | string[]>;
  
  /** 缓存的回调链执行器 */
  private callbackChain: OptimizedCallbackChain | null = null;

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
  constructor(pattern: string, typedLiteralFields: Record<string, string | string[]>={...Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP}) {
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

    // 初始化实例属性
    this.callbacks = [];
    this.tokens = PatternParser.parse(pattern);
    
    // 合并默认字段映射和自定义字段映射
    // 自定义映射会覆盖默认映射
    this.typedLiteralFields = Object.assign({}, {
      ...Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP,
    }, typedLiteralFields);
  }

  /**
   * 添加回调函数到处理链
   * 
   * 支持同步和异步回调函数，可以链式调用。
   * 回调函数会按添加顺序执行，前一个回调的返回值会作为下一个回调的参数。
   * 
   * @param callback - 回调函数，接收匹配参数和剩余消息段
   * @returns 当前实例，支持链式调用
   * 
   * @example
   * ```typescript
   * commander
   *   .action((params) => {
   *     console.log('First action:', params);
   *     return params.name.toUpperCase();
   *   })
   *   .action((upperName) => {
   *     console.log('Second action:', upperName);
   *     return `Hello, ${upperName}!`;
   *   });
   * ```
   */
  action(callback: CallbackFunction): Commander {
    this.callbacks.push(callback);
    // 清除缓存的回调链执行器，因为回调发生了变化
    this.callbackChain = null;
    return this;
  }

  /**
   * 获取或创建优化的回调链执行器
   */
  private getCallbackChain(): OptimizedCallbackChain {
    if (!this.callbackChain) {
      this.callbackChain = new OptimizedCallbackChain(this.callbacks);
    }
    return this.callbackChain;
  }

  /**
   * 同步匹配消息段并执行回调链
   * 
   * 根据模式匹配消息段，如果匹配成功则按顺序执行所有回调函数。
   * 每个回调函数的返回值会作为下一个回调函数的参数。
   * 
   * @param segments - OneBot12 消息段数组
   * @returns 返回最后一个回调函数的返回值数组，如果匹配失败返回空数组
   * 
   * @throws {ValidationError} 当消息段参数无效时抛出
   * 
   * @example
   * ```typescript
   * const segments = [
   *   { type: 'text', data: { text: 'hello Alice' } }
   * ];
   * 
   * const result = commander.match(segments);
   * // result 包含所有回调函数的最终返回值
   * ```
   */
  match(segments: MessageSegment[]): any[] {
    // 快速参数验证
    if (!fastValidateSegments(segments)) {
      throw new ValidationError('Segments must be an array', 'segments', segments);
    }

    // 使用 SegmentMatcher 进行模式匹配
    const result = SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
    
    // 获取优化的回调链执行器
    const callbackChain = this.getCallbackChain();
    
    // 如果没有匹配结果，直接执行回调链（可能返回默认值）
    if (!result) return callbackChain.executeSync();
    
    // 如果 params 有内容（即使全是默认值），也应返回 [params]
    const args = [result.params, ...result.remaining];
    // 判断 params 是否为空对象
    const hasParams = Object.keys(result.params).length > 0;
    if (hasParams || result.matched.length > 0) {
      return callbackChain.executeSync(...args);
    } else {
      return [];
    }
  }

  /**
   * 异步匹配消息段并执行回调链
   * 
   * 异步版本的 match 方法，支持异步回调函数。
   * 会自动检测回调函数的返回值是否为 Promise，并正确处理异步执行。
   * 
   * @param segments - OneBot12 消息段数组
   * @returns 返回 Promise<匹配结果数组>，如果匹配失败返回 Promise<空数组>
   * 
   * @throws {ValidationError} 当消息段参数无效时抛出
   * 
   * @example
   * ```typescript
   * const segments = [
   *   { type: 'text', data: { text: 'hello Alice' } }
   * ];
   * 
   * const result = await commander.matchAsync(segments);
   * // result 包含所有异步回调函数的最终返回值
   * ```
   */
  async matchAsync(segments: MessageSegment[]): Promise<any[]> {
    // 快速参数验证
    if (!fastValidateSegments(segments)) {
      throw new ValidationError('Segments must be an array', 'segments', segments);
    }

    // 使用 SegmentMatcher 进行模式匹配
    const result = SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
    
    // 获取优化的回调链执行器
    const callbackChain = this.getCallbackChain();
    
    // 如果没有匹配结果，直接执行回调链
    if (!result) return callbackChain.executeAsync();
    
    // 将匹配参数和剩余消息段作为回调函数的参数
    const args = [result.params, ...result.remaining];
    return callbackChain.executeAsync(...args);
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
   * const tokens = commander.getTokens();
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
export function match(pattern: string, typedLiteralFields?: Record<string, string | string[]>): Commander {
  return new Commander(pattern, typedLiteralFields);
} 