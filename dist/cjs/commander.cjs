"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commander = void 0;
exports.match = match;
const pattern_parser_1 = require("./pattern_parser.cjs");
const segment_matcher_1 = require("./segment_matcher.cjs");
/**
 * Commander 主类
 */
class Commander {
    constructor(pattern, typedLiteralFields = { ...Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP }) {
        this.callbacks = [];
        this.tokens = pattern_parser_1.PatternParser.parse(pattern);
        this.typedLiteralFields = Object.assign(typedLiteralFields, {
            ...Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP,
        });
    }
    /**
     * 添加回调函数
     * @param callback - 回调函数（支持同步和异步）
     * @returns 当前实例，支持链式调用
     */
    action(callback) {
        this.callbacks.push(callback);
        return this;
    }
    /**
     * 匹配消息段，根据结果调用回调（同步版本）
     * @param segments - OneBot12消息段数组
     * @returns 返回匹配结果数组或空数组
     */
    match(segments) {
        const result = segment_matcher_1.SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
        // 执行回调链
        const next = (...values) => {
            const callback = this.callbacks.shift();
            if (!callback)
                return values;
            return next(callback(...values));
        };
        if (!result)
            return next();
        const args = [result.params, ...result.remaining];
        return next(...args);
    }
    /**
     * 匹配消息段，根据结果调用回调（异步版本）
     * @param segments - OneBot12消息段数组
     * @returns 返回Promise<匹配结果数组>或Promise<空数组>
     */
    async matchAsync(segments) {
        const result = segment_matcher_1.SegmentMatcher.match(this.tokens, segments, this.typedLiteralFields);
        // 执行异步回调链
        const next = async (...values) => {
            const callback = this.callbacks.shift();
            if (!callback)
                return values;
            const result = callback(...values);
            // 检查是否为Promise
            if (result instanceof Promise) {
                return next(await result);
            }
            else {
                return next(result);
            }
        };
        if (!result)
            return next();
        const args = [result.params, ...result.remaining];
        return next(...args);
    }
    /**
     * 获取解析后的令牌（用于调试）
     * @returns 令牌数组
     */
    getTokens() {
        return this.tokens;
    }
}
exports.Commander = Commander;
// 默认规则
Commander.DEFAULT_TYPED_LITERAL_FIELD_MAP = {
    text: 'text',
    face: 'id',
    image: ['file', 'url'],
    at: 'user_id',
};
/**
 * 便捷函数：创建命令匹配器
 * @param pattern - 命令模式
 * @returns 命令匹配器实例
 */
function match(pattern, typedLiteralFields) {
    return new Commander(pattern, typedLiteralFields);
}
