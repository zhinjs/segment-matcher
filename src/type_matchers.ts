
/**
 * 类型匹配器接口
 * 
 * 定义了各种特殊类型的匹配规则和转换逻辑。
 * 每个类型匹配器负责验证输入格式并进行类型转换。
 */
export interface TypeMatcher {
  /**
   * 匹配并转换输入值
   * 
   * @param text - 输入的文本内容
   * @returns 匹配结果，包含是否成功和转换后的值
   */
  match(text: string): TypeMatchResult;
}

/**
 * 类型匹配结果
 */
export interface TypeMatchResult {
  /** 是否匹配成功 */
  success: boolean;
  /** 转换后的值（仅在成功时存在） */
  value?: any;
}

/**
 * Number类型匹配器
 * 
 * 支持整数和小数：123, 123.45, 0, 0.5, -10, -3.14
 */
export class NumberTypeMatcher implements TypeMatcher {
  private readonly regex = /^-?\d+(\.\d+)?$/;

  match(text: string): TypeMatchResult {
    if (!this.regex.test(text)) {
      return { success: false };
    }

    const value = Number(text);
    if (isNaN(value)) {
      return { success: false };
    }

    return { success: true, value };
  }
}

/**
 * Integer类型匹配器
 * 
 * 只支持整数：123, 0, -5
 */
export class IntegerTypeMatcher implements TypeMatcher {
  private readonly regex = /^-?\d+$/;

  match(text: string): TypeMatchResult {
    if (!this.regex.test(text)) {
      return { success: false };
    }

    const value = parseInt(text, 10);
    if (isNaN(value)) {
      return { success: false };
    }

    return { success: true, value };
  }
}

/**
 * Float类型匹配器
 * 
 * 只支持浮点数（必须包含小数点）：123.45, 0.5, -3.14
 */
export class FloatTypeMatcher implements TypeMatcher {
  private readonly regex = /^-?\d+\.\d+$/;

  match(text: string): TypeMatchResult {
    if (!this.regex.test(text)) {
      return { success: false };
    }

    const value = parseFloat(text);
    if (isNaN(value)) {
      return { success: false };
    }

    return { success: true, value };
  }
}

/**
 * Boolean类型匹配器
 * 
 * 支持true/false字符串：true, false
 */
export class BooleanTypeMatcher implements TypeMatcher {
  private readonly regex = /^(true|false)$/;

  match(text: string): TypeMatchResult {
    if (!this.regex.test(text)) {
      return { success: false };
    }

    const value = text === 'true';
    return { success: true, value };
  }
}

/**
 * Text类型匹配器
 * 
 * 直接返回文本内容，总是成功匹配
 */
export class TextTypeMatcher implements TypeMatcher {
  match(text: string): TypeMatchResult {
    return { success: true, value: text };
  }
}

/**
 * 类型匹配器注册表
 * 
 * 管理所有可用的类型匹配器，提供统一的访问接口。
 */
export class TypeMatcherRegistry {
  private static readonly matchers = new Map<string, TypeMatcher>([
    ['number', new NumberTypeMatcher()],
    ['integer', new IntegerTypeMatcher()],
    ['float', new FloatTypeMatcher()],
    ['boolean', new BooleanTypeMatcher()],
    ['text', new TextTypeMatcher()],
  ]);

  /**
   * 获取指定类型的匹配器
   * 
   * @param dataType - 数据类型名称
   * @returns 对应的类型匹配器，如果不存在则返回null
   */
  static getMatcher(dataType: string): TypeMatcher | null {
    return this.matchers.get(dataType) || null;
  }

  /**
   * 检查是否支持指定类型的特殊匹配
   * 
   * @param dataType - 数据类型名称
   * @returns 是否支持特殊匹配
   */
  static hasSpecialMatcher(dataType: string): boolean {
    // text类型不需要特殊处理，其他类型都需要
    return this.matchers.has(dataType) && dataType !== 'text';
  }

  /**
   * 注册新的类型匹配器
   * 
   * @param dataType - 数据类型名称
   * @param matcher - 类型匹配器实例
   */
  static registerMatcher(dataType: string, matcher: TypeMatcher): void {
    this.matchers.set(dataType, matcher);
  }

  /**
   * 获取所有支持的数据类型
   * 
   * @returns 支持的数据类型列表
   */
  static getSupportedTypes(): string[] {
    return Array.from(this.matchers.keys());
  }
} 