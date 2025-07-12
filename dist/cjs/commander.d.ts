import { MessageSegment, CallbackFunction } from './types';
import { PatternToken } from './pattern_token';
/**
 * Commander 主类
 */
export declare class Commander {
    private callbacks;
    private tokens;
    private typedLiteralFields;
    static DEFAULT_TYPED_LITERAL_FIELD_MAP: Record<string, string | string[]>;
    constructor(pattern: string, typedLiteralFields?: Record<string, string | string[]>);
    /**
     * 添加回调函数
     * @param callback - 回调函数（支持同步和异步）
     * @returns 当前实例，支持链式调用
     */
    action(callback: CallbackFunction): Commander;
    /**
     * 匹配消息段，根据结果调用回调（同步版本）
     * @param segments - OneBot12消息段数组
     * @returns 返回匹配结果数组或空数组
     */
    match(segments: MessageSegment[]): any[];
    /**
     * 匹配消息段，根据结果调用回调（异步版本）
     * @param segments - OneBot12消息段数组
     * @returns 返回Promise<匹配结果数组>或Promise<空数组>
     */
    matchAsync(segments: MessageSegment[]): Promise<any[]>;
    /**
     * 获取解析后的令牌（用于调试）
     * @returns 令牌数组
     */
    getTokens(): PatternToken[];
}
/**
 * 便捷函数：创建命令匹配器
 * @param pattern - 命令模式
 * @returns 命令匹配器实例
 */
export declare function match(pattern: string, typedLiteralFields?: Record<string, string | string[]>): Commander;
