

import { PatternToken } from './pattern_token';
import { PatternParseError } from './errors';

/**
 * 解析缓存
 */
const parseCache = new Map<string, PatternToken[]>();

/**
 * 优化的字符串分割函数
 */
function optimizedSplit(str: string, delimiter: string): string[] {
  const index = str.indexOf(delimiter);
  if (index === -1) {
    return [str];
  }
  return [str.substring(0, index), str.substring(index + delimiter.length)];
}

/**
 * 优化的字符串修剪函数
 */
function optimizedTrim(str: string): string {
  let start = 0;
  let end = str.length;
  
  while (start < end && str[start] <= ' ') start++;
  while (end > start && str[end - 1] <= ' ') end--;
  
  return str.substring(start, end);
}

/**
 * 模式解析器类
 * 
 * 负责将命令模式字符串解析为令牌数组。
 * 支持多种模式元素：字面量、类型化字面量、必需参数、可选参数、剩余参数等。
 * 
 * @example
 * ```typescript
 * const tokens = PatternParser.parse('hello <name:text> [count:number=1]');
 * // 返回解析后的令牌数组
 * ```
 */
export class PatternParser {
  /**
   * 解析命令模式字符串
   * 
   * 将模式字符串解析为令牌数组，支持以下模式元素：
   * - 普通字面量：`hello`
   * - 类型化字面量：`{text:start}`, `{face:1}`, `{image:avatar.png}`
   * - 必需参数：`<name:text>`, `<count:number>`
   * - 可选参数：`[message:text]`, `[count:number=1]`
   * - 剩余参数：`[...rest]`, `[...rest:face]`
   * 
   * @param pattern - 命令模式字符串
   * @returns 解析后的令牌数组
   * 
   * @throws {PatternParseError} 当模式格式错误或解析失败时抛出
   * 
   * @example
   * ```typescript
   * // 基础模式
   * const tokens1 = PatternParser.parse('hello <name:text>');
   * 
   * // 复杂模式
   * const tokens2 = PatternParser.parse('{text:start}<command:text>[count:number=1][...rest]');
   * ```
   */
  static parse(pattern: string): PatternToken[] {
    // 检查缓存
    if (parseCache.has(pattern)) {
      return parseCache.get(pattern)!;
    }
    
    const tokens: PatternToken[] = [];
    let i = 0; // 当前解析位置
    
    try {
      while (i < pattern.length) {
        const char = pattern[i];
        
        // 根据当前字符类型选择解析方法
        if (char === '{') {
          // 解析类型化字面量：{type:value}
          tokens.push(PatternParser.parseTypedLiteral(pattern, i));
          i = PatternParser.findClosingBrace(pattern, i);
        } else if (char === '<') {
          // 解析必需参数：<name:type>
          tokens.push(PatternParser.parseRequiredParameter(pattern, i));
          i = PatternParser.findClosingBrace(pattern, i);
        } else if (char === '[') {
          // 解析可选参数：[name:type] 或 [name:type=default]
          tokens.push(PatternParser.parseOptionalParameter(pattern, i));
          i = PatternParser.findClosingBrace(pattern, i);
        } else {
          // 解析普通字面量
          const { token, newIndex } = PatternParser.parseLiteral(pattern, i);
          if (token) tokens.push(token);
          i = newIndex;
        }
      }
      
      // 缓存结果
      parseCache.set(pattern, tokens);
      return tokens;
    } catch (error) {
      // 统一错误处理，确保抛出 PatternParseError
      if (error instanceof PatternParseError) {
        throw error;
      }
      throw new PatternParseError(
        `Failed to parse pattern: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pattern,
        i
      );
    }
  }

  /**
   * 清除解析缓存
   * 
   * 在内存紧张或需要强制重新解析时调用。
   */
  static clearCache(): void {
    parseCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { size: number } {
    return { size: parseCache.size };
  }

  /**
   * 解析类型化字面量
   * 
   * 解析格式为 `{type:value}` 的类型化字面量。
   * 支持各种消息段类型，如 text、face、image、at 等。
   * 
   * @param pattern - 完整的模式字符串
   * @param startIndex - 开始解析的位置（'{' 的位置）
   * @returns 解析后的类型化字面量令牌
   * 
   * @example
   * ```typescript
   * // 文本类型化字面量
   * const token1 = PatternParser.parseTypedLiteral('{text:start}', 0);
   * 
   * // 表情类型化字面量
   * const token2 = PatternParser.parseTypedLiteral('{face:1}', 0);
   * 
   * // 图片类型化字面量
   * const token3 = PatternParser.parseTypedLiteral('{image:avatar.png}', 0);
   * ```
   */
  private static parseTypedLiteral(pattern: string, startIndex: number): PatternToken {
    let i = startIndex + 1; // 跳过 '{'
    let content = '';
    
    // 收集 '{' 和 '}' 之间的内容
    while (i < pattern.length && pattern[i] !== '}') {
      content += pattern[i];
      i++;
    }
    
    // 只分割第一个冒号，避免 URL 中的冒号被错误分割
    const parts = optimizedSplit(content, ':');
    const type = optimizedTrim(parts[0]);
    const value = parts.length > 1 ? optimizedTrim(parts[1]) : '';
    
    // 不做类型白名单校验
    return PatternToken.createTypedLiteral(type as any, value);
  }

  /**
   * 解析必需参数
   * 
   * 解析格式为 `<name:type>` 的必需参数。
   * 必需参数在匹配时必须提供，否则匹配失败。
   * 
   * @param pattern - 完整的模式字符串
   * @param startIndex - 开始解析的位置（'<' 的位置）
   * @returns 解析后的必需参数令牌
   * 
   * @example
   * ```typescript
   * // 文本参数
   * const token1 = PatternParser.parseRequiredParameter('<name:text>', 0);
   * 
   * // 数字参数
   * const token2 = PatternParser.parseRequiredParameter('<count:number>', 0);
   * 
   * // 表情参数
   * const token3 = PatternParser.parseRequiredParameter('<emoji:face>', 0);
   * ```
   */
  private static parseRequiredParameter(pattern: string, startIndex: number): PatternToken {
    let i = startIndex + 1; // 跳过 '<'
    let content = '';
    
    // 收集 '<' 和 '>' 之间的内容
    while (i < pattern.length && pattern[i] !== '>') {
      content += pattern[i];
      i++;
    }
    
    // 分割参数名和类型
    const parts = optimizedSplit(content, ':');
    const name = optimizedTrim(parts[0]);
    const segType = parts.length > 1 ? optimizedTrim(parts[1]) : 'text';
    
    // 不做类型白名单校验
    return PatternToken.createParameter(name, segType, false);
  }

  /**
   * 解析可选参数
   * 
   * 解析格式为 `[name:type]` 或 `[name:type=default]` 的可选参数。
   * 支持默认值语法，包括字符串、数字、JSON 对象等。
   * 还支持剩余参数语法 `[...rest]` 和 `[...rest:type]`。
   * 
   * @param pattern - 完整的模式字符串
   * @param startIndex - 开始解析的位置（'[' 的位置）
   * @returns 解析后的可选参数令牌
   * 
   * @example
   * ```typescript
   * // 基础可选参数
   * const token1 = PatternParser.parseOptionalParameter('[message:text]', 0);
   * 
   * // 带默认值的可选参数
   * const token2 = PatternParser.parseOptionalParameter('[count:number=1]', 0);
   * 
   * // 带 JSON 默认值的可选参数
   * const token3 = PatternParser.parseOptionalParameter('[emoji:face={"id":1}]', 0);
   * 
   * // 剩余参数
   * const token4 = PatternParser.parseOptionalParameter('[...rest]', 0);
   * const token5 = PatternParser.parseOptionalParameter('[...rest:face]', 0);
   * ```
   */
  private static parseOptionalParameter(pattern: string, startIndex: number): PatternToken {
    // 使用 findClosingBrace 获取完整内容
    const endIndex = PatternParser.findClosingBrace(pattern, startIndex);
    const content = pattern.slice(startIndex + 1, endIndex - 1); // 不包括 '[' 和 ']'
    
    // 检查是否为剩余参数：...rest 或 ...rest:type
    if (content.startsWith('...')) {
      const restContent = content.slice(3); // 跳过 '...'
             if (restContent.includes(':')) {
         const [name, type] = optimizedSplit(restContent, ':');
         return PatternToken.createRestParameter(optimizedTrim(name), optimizedTrim(type));
       } else {
         return PatternToken.createRestParameter(optimizedTrim(restContent), null);
       }
    }
    
    // 检查是否包含默认值（等号）
    const equalIndex = content.indexOf('=');
    if (equalIndex !== -1) {
      // 包含默认值：[name:type=default]
      const beforeEqual = content.slice(0, equalIndex);
      const afterEqual = content.slice(equalIndex + 1);
      
      const [name, type] = optimizedSplit(beforeEqual, ':');
      const defaultValue = PatternParser.parseDefaultValue(afterEqual);
      
      return PatternToken.createParameter(
        optimizedTrim(name),
        optimizedTrim(type || 'text'),
        true,
        defaultValue
      );
    } else {
      // 不包含默认值：[name:type]
      const [name, type] = optimizedSplit(content, ':');
      return PatternToken.createParameter(
        optimizedTrim(name),
        optimizedTrim(type || 'text'),
        true
      );
    }
  }

  /**
   * 解析默认值
   * 
   * 解析字符串、数字、JSON 对象等类型的默认值。
   * 支持嵌套的 JSON 结构，如对象和数组。
   * 
   * @param defaultValueStr - 默认值字符串
   * @returns 解析后的默认值
   * 
   * @example
   * ```typescript
   * // 字符串默认值
   * PatternParser.parseDefaultValue('hello'); // 'hello'
   * 
   * // 数字默认值
   * PatternParser.parseDefaultValue('42'); // 42
   * 
   * // JSON 对象默认值
   * PatternParser.parseDefaultValue('{"id":1,"name":"test"}'); // {id: 1, name: "test"}
   * 
   * // 数组默认值
   * PatternParser.parseDefaultValue('[1,2,3]'); // [1, 2, 3]
   * ```
   */
  private static parseDefaultValue(defaultValueStr: string): any {
    const trimmed = optimizedTrim(defaultValueStr);
    
    // 尝试解析为 JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // JSON 解析失败，尝试修复常见问题
        try {
          // 修复缺少引号的键名
          const fixed = trimmed.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
          return JSON.parse(fixed);
        } catch {
          // 仍然失败，返回原始字符串
          return trimmed;
        }
      }
    }
    
    // 尝试解析为数字
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!isNaN(num)) {
        return num;
      }
    }
    
    // 布尔值
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    
    // 返回原始字符串
    return trimmed;
  }

  /**
   * 解析普通字面量
   * 
   * 解析连续的普通字符作为字面量令牌。
   * 遇到特殊字符（'{', '<', '['）时停止解析。
   * 
   * @param pattern - 完整的模式字符串
   * @param startIndex - 开始解析的位置
   * @returns 解析结果，包含令牌和新的解析位置
   * 
   * @example
   * ```typescript
   * // 解析简单字面量
   * const result1 = PatternParser.parseLiteral('hello <name>', 0);
   * // result1.token.value === 'hello', result1.newIndex === 5
   * 
   * // 解析包含空格的字面量
   * const result2 = PatternParser.parseLiteral('hello world <name>', 0);
   * // result2.token.value === 'hello world ', result2.newIndex === 12
   * ```
   */
  private static parseLiteral(pattern: string, startIndex: number): { token: PatternToken | null; newIndex: number } {
    let i = startIndex;
    let literal = '';
    
    // 收集连续的普通字符
    while (i < pattern.length) {
      const char = pattern[i];
      
      // 遇到特殊字符时停止
      if (char === '{' || char === '<' || char === '[') {
        break;
      }
      
      literal += char;
      i++;
    }
    
    // 如果收集到了字面量内容，创建令牌
    if (literal.length > 0) {
      return {
        token: PatternToken.createLiteral(literal),
        newIndex: i
      };
    }
    
    // 没有收集到内容，返回 null
    return {
      token: null,
      newIndex: i
    };
  }

  /**
   * 查找匹配的闭合括号
   * 
   * 从指定的开始位置查找匹配的闭合括号。
   * 支持嵌套的括号结构，如 `{[...]}`。
   * 
   * @param pattern - 完整的模式字符串
   * @param startIndex - 开始位置（开括号的位置）
   * @returns 闭合括号的位置
   * 
   * @throws {PatternParseError} 当找不到匹配的闭合括号时抛出
   * 
   * @example
   * ```typescript
   * // 简单括号匹配
   * PatternParser.findClosingBrace('{text:hello}', 0); // 返回 11
   * 
   * // 嵌套括号匹配
   * PatternParser.findClosingBrace('{[text:hello]}', 0); // 返回 13
   * ```
   */
  private static findClosingBrace(pattern: string, startIndex: number): number {
    const openChar = pattern[startIndex];
    const closeChar = openChar === '{' ? '}' : openChar === '<' ? '>' : ']';
    let depth = 0;
    let i = startIndex;
    
    while (i < pattern.length) {
      const char = pattern[i];
      
      if (char === openChar) {
        depth++;
      } else if (char === closeChar) {
        depth--;
        if (depth === 0) {
          return i + 1; // 返回闭合括号后的位置
        }
      }
      
      i++;
    }
    
    // 找不到匹配的闭合括号
    throw new PatternParseError(
      `Unmatched opening brace '${openChar}' at position ${startIndex}`,
      pattern,
      startIndex
    );
  }
} 