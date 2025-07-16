import { MatchResult as IMatchResult, MessageSegment } from './types';

/**
 * 匹配结果类
 * 
 * 存储模式匹配的结果，包括匹配的消息段、提取的参数和剩余的消息段。
 * 提供便捷的方法来添加和管理匹配结果。
 * 
 * @example
 * ```typescript
 * const result = new MatchResult();
 * 
 * // 添加匹配的消息段
 * result.addMatched({ type: 'text', data: { text: 'hello' } });
 * 
 * // 添加提取的参数
 * result.addParam('name', 'Alice');
 * 
 * // 添加剩余的消息段
 * result.addRemaining({ type: 'text', data: { text: 'world' } });
 * 
 * // 检查结果是否有效
 * if (result.isValid()) {
 *   console.log('匹配成功');
 * }
 * ```
 */
export class MatchResult implements IMatchResult {
  /** 匹配的消息段数组 */
  matched: MessageSegment[] = [];
  
  /** 提取的参数对象 */
  params: Record<string, any> = {};
  
  /** 剩余的消息段数组 */
  remaining: MessageSegment[] = [];

  /**
   * 添加匹配的消息段
   * 
   * @param segment - 匹配的消息段
   * 
   * @example
   * ```typescript
   * result.addMatched({ type: 'text', data: { text: 'hello' } });
   * ```
   */
  addMatched(segment: MessageSegment): void {
    this.matched.push(segment);
  }

  /**
   * 添加提取的参数
   * 
   * @param name - 参数名称
   * @param value - 参数值
   * 
   * @example
   * ```typescript
   * result.addParam('name', 'Alice');
   * result.addParam('age', 25);
   * result.addParam('emoji', { type: 'face', data: { id: 1 } });
   * ```
   */
  addParam(name: string, value: any): void {
    this.params[name] = value;
  }

  /**
   * 添加剩余的消息段
   * 
   * 剩余的消息段是指模式匹配完成后，未被匹配的消息段。
   * 这些消息段可以传递给回调函数进行进一步处理。
   * 
   * @param segment - 剩余的消息段
   * 
   * @example
   * ```typescript
   * result.addRemaining({ type: 'text', data: { text: 'world' } });
   * result.addRemaining({ type: 'face', data: { id: 1 } });
   * ```
   */
  addRemaining(segment: MessageSegment): void {
    this.remaining.push(segment);
  }

  /**
   * 检查是否包含指定参数
   * 
   * @param name - 参数名称
   * @returns 如果包含指定参数返回 true，否则返回 false
   * 
   * @example
   * ```typescript
   * if (result.hasParam('name')) {
   *   console.log('包含 name 参数:', result.params.name);
   * }
   * ```
   */
  hasParam(name: string): boolean {
    return name in this.params;
  }

  /**
   * 检查匹配结果是否有效
   * 
   * 匹配结果被认为是有效的，当且仅当：
   * - 有提取的参数（即使是默认值），或者
   * - 有匹配的消息段
   * 
   * @returns 如果匹配结果有效返回 true，否则返回 false
   * 
   * @example
   * ```typescript
   * if (result.isValid()) {
   *   console.log('匹配成功，参数:', result.params);
   *   console.log('匹配的消息段:', result.matched);
   *   console.log('剩余的消息段:', result.remaining);
   * } else {
   *   console.log('匹配失败');
   * }
   * ```
   */
  isValid(): boolean {
    // 只要有参数（即使是默认值）就算有效
    return Object.keys(this.params).length > 0 || this.matched.length > 0;
  }
} 