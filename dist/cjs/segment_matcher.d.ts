import { MessageSegment } from './types';
import { PatternToken } from './pattern_token';
import { MatchResult } from './match_result';
/**
 * 消息段匹配器类
 */
export declare class SegmentMatcher {
    /**
     * 匹配消息段
     * @param pattern - 解析后的模式数组
     * @param segments - OneBot12消息段数组
     * @returns 匹配结果或null
     */
    static match(pattern: PatternToken[], segments: MessageSegment[], typedLiteralFieldMap?: Record<string, string | string[]>): MatchResult | null;
    private static matchToken;
    private static matchLiteral;
    private static matchTypedLiteral;
    private static matchParameter;
    private static matchRestParameter;
    private static splitText;
}
