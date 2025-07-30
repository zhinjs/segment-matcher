import { PatternToken as IPatternToken, TokenType } from './types';

/**
 * 模式令牌类
 * 
 * 表示解析后的模式元素，包括字面量、类型化字面量、参数等。
 * 每个令牌包含类型信息和相关的数据。
 * 
 * @example
 * ```typescript
 * // 创建字面量令牌
 * const literalToken = PatternToken.createLiteral('hello ');
 * 
 * // 创建类型化字面量令牌
 * const typedToken = PatternToken.createTypedLiteral('text', 'start');
 * 
 * // 创建参数令牌
 * const paramToken = PatternToken.createParameter('name', 'text', false);
 * 
 * // 创建剩余参数令牌
 * const restToken = PatternToken.createRestParameter('rest', 'text');
 * ```
 */
export class PatternToken implements IPatternToken {
  /** 令牌类型：literal | typed_literal | parameter | rest_parameter */
  type: TokenType;
  
  /** 字面量值（仅用于 literal 类型） */
  value?: string;
  
  /** 消息段类型（仅用于 typed_literal 类型） */
  segmentType?: string;
  
  /** 参数名称（仅用于 parameter 和 rest_parameter 类型） */
  name?: string;
  
  /** 数据类型（仅用于 parameter 和 rest_parameter 类型） */
  dataType?: string | null;
  
  /** 是否为可选参数（仅用于 parameter 类型） */
  optional?: boolean;
  
  /** 默认值（仅用于可选参数） */
  defaultValue?: any;

  /**
   * 构造函数
   * 
   * @param type - 令牌类型
   * @param options - 可选的令牌属性
   */
  constructor(type: TokenType, options: Partial<IPatternToken> = {}) {
    this.type = type;
    Object.assign(this, options);
  }

  /**
   * 创建字面量令牌
   * 
   * 用于表示模式中的普通文本，如空格、标点符号等。
   * 这些字面量必须与输入文本完全匹配。
   * 
   * @param value - 字面量值
   * @returns 字面量令牌实例
   * 
   * @example
   * ```typescript
   * const token = PatternToken.createLiteral('hello ');
   * // token.type === 'literal'
   * // token.value === 'hello '
   * ```
   */
  static createLiteral(value: string): PatternToken {
    return new PatternToken('literal', { value });
  }

  /**
   * 创建类型化字面量令牌
   * 
   * 用于表示特定类型的消息段，如表情、图片、@用户等。
   * 支持各种消息段类型。
   * 
   * @param segmentType - 消息段类型（text、face、image、at 等）
   * @param value - 期望的值
   * @returns 类型化字面量令牌实例
   * 
   * @example
   * ```typescript
   * // 文本类型化字面量
   * const textToken = PatternToken.createTypedLiteral('text', 'start');
   * 
   * // 表情类型化字面量
   * const faceToken = PatternToken.createTypedLiteral('face', '1');
   * 
   * // 图片类型化字面量
   * const imageToken = PatternToken.createTypedLiteral('image', 'avatar.png');
   * ```
   */
  static createTypedLiteral(segmentType: string, value: string): PatternToken {
    return new PatternToken('typed_literal', { segmentType, value });
  }

  /**
   * 创建参数令牌
   * 
   * 用于表示模式中的参数，可以是必需参数或可选参数。
   * 支持默认值设置。
   * 
   * @param name - 参数名称
   * @param dataType - 数据类型（text、number、face、image 等）
   * @param optional - 是否为可选参数，默认为 false
   * @param defaultValue - 默认值（仅用于可选参数）
   * @returns 参数令牌实例
   * 
   * @example
   * ```typescript
   * // 必需参数
   * const requiredToken = PatternToken.createParameter('name', 'text', false);
   * 
   * // 可选参数
   * const optionalToken = PatternToken.createParameter('count', 'number', true, 1);
   * 
   * // 带默认值的可选参数
   * const defaultToken = PatternToken.createParameter('emoji', 'face', true, { id: 1 });
   * ```
   */
  static createParameter(name: string, dataType: string, optional: boolean = false, defaultValue?: any): PatternToken {
    return new PatternToken('parameter', { name, dataType, optional, defaultValue });
  }

  /**
   * 创建剩余参数令牌
   * 
   * 用于收集模式中剩余的所有消息段或指定类型的消息段。
   * 支持类型限制。
   * 
   * @param name - 参数名称
   * @param dataType - 数据类型限制（可选，null 表示收集所有类型）
   * @returns 剩余参数令牌实例
   * 
   * @example
   * ```typescript
   * // 收集所有剩余消息段
   * const allToken = PatternToken.createRestParameter('rest', null);
   * 
   * // 只收集表情消息段
   * const faceToken = PatternToken.createRestParameter('faces', 'face');
   * 
   * // 只收集文本消息段
   * const textToken = PatternToken.createRestParameter('messages', 'text');
   * ```
   */
  static createRestParameter(name: string, dataType: string | null): PatternToken {
    return new PatternToken('rest_parameter', { name, dataType });
  }
} 