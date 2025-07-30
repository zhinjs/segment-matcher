/**
 * Segment Matcher 自定义异常基类
 * 
 * 所有 Segment Matcher 相关的异常都继承自此类。
 * 提供了统一的错误处理接口和错误信息格式。
 * 
 * @example
 * ```typescript
 * try {
 *   const commander = new Commander('');
 * } catch (error) {
 *   if (error instanceof CommanderError) {
 *     console.log('Error code:', error.code);
 *     console.log('Error details:', error.details);
 *   }
 * }
 * ```
 */
export class CommanderError extends Error {
  /**
   * 构造函数
   * 
   * @param message - 错误消息
   * @param code - 错误代码，用于标识错误类型
   * @param details - 错误详情，包含额外的错误信息
   */
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'CommanderError';
  }
}

/**
 * 模式解析异常
 * 
 * 当模式字符串格式错误或无法解析时抛出此异常。
 * 包含模式字符串和错误位置信息，便于调试。
 * 
 * @example
 * ```typescript
 * try {
 *   const commander = new Commander('hello <name:invalid_type>');
 * } catch (error) {
 *   if (error instanceof PatternParseError) {
 *     console.log('Pattern:', error.details?.pattern);
 *     console.log('Position:', error.details?.position);
 *   }
 * }
 * ```
 */
export class PatternParseError extends CommanderError {
  /**
   * 构造函数
   * 
   * @param message - 错误消息
   * @param pattern - 导致错误的模式字符串（可选）
   * @param position - 错误在模式中的位置（可选）
   */
  constructor(message: string, pattern?: string, position?: number) {
    super(message, 'PATTERN_PARSE_ERROR', { pattern, position });
    this.name = 'PatternParseError';
  }
}

/**
 * 参数验证异常
 * 
 * 当传入的参数不符合要求时抛出此异常。
 * 包含字段名和无效值信息，便于定位问题。
 * 
 * @example
 * ```typescript
 * try {
 *   const commander = new Commander('hello <name:text>');
 *   commander.match(null); // 传入无效参数
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.log('Field:', error.details?.field);
 *     console.log('Invalid value:', error.details?.value);
 *   }
 * }
 * ```
 */
export class ValidationError extends CommanderError {
  /**
   * 构造函数
   * 
   * @param message - 错误消息
   * @param field - 验证失败的字段名（可选）
   * @param value - 无效的值（可选）
   */
  constructor(message: string, field?: string, value?: any) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

/**
 * 匹配异常
 * 
 * 当消息段匹配过程中发生错误时抛出此异常。
 * 包含模式信息和消息段信息，便于调试匹配问题。
 * 
 * @example
 * ```typescript
 * try {
 *   // 匹配过程中发生错误
 *   const result = commander.match(segments);
 * } catch (error) {
 *   if (error instanceof MatchError) {
 *     console.log('Pattern:', error.details?.pattern);
 *     console.log('Segments:', error.details?.segments);
 *   }
 * }
 * ```
 */
export class MatchError extends CommanderError {
  /**
   * 构造函数
   * 
   * @param message - 错误消息
   * @param pattern - 匹配模式（可选）
   * @param segments - 消息段数组（可选）
   */
  constructor(message: string, pattern?: string, segments?: any[]) {
    super(message, 'MATCH_ERROR', { pattern, segments });
    this.name = 'MatchError';
  }
} 