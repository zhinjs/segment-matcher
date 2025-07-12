import { PatternToken } from './pattern_token';
/**
 * 模式解析器类
 */
export declare class PatternParser {
    /**
     * 解析命令模式字符串
     * @param pattern - 命令模式字符串
     * @returns 解析后的令牌数组
     */
    static parse(pattern: string): PatternToken[];
    private static parseTypedLiteral;
    private static parseRequiredParameter;
    private static parseOptionalParameter;
    private static parseDefaultValue;
    private static parseLiteral;
    private static findClosingBrace;
}
