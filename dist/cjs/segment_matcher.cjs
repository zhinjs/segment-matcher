"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentMatcher = void 0;
const match_result_1 = require("./match_result.cjs");
/**
 * 消息段匹配器类
 */
class SegmentMatcher {
    /**
     * 匹配消息段
     * @param pattern - 解析后的模式数组
     * @param segments - OneBot12消息段数组
     * @returns 匹配结果或null
     */
    static match(pattern, segments, typedLiteralFieldMap) {
        const result = new match_result_1.MatchResult();
        const segmentsCopy = JSON.parse(JSON.stringify(segments)); // 避免修改原始数据
        let segmentIndex = 0;
        let patternIndex = 0;
        while (patternIndex < pattern.length) {
            const patternToken = pattern[patternIndex];
            // eslint-disable-next-line no-console
            console.log('DEBUG patternToken:', patternToken);
            const segment = segmentIndex < segmentsCopy.length ? segmentsCopy[segmentIndex] : undefined;
            if (segment) {
                const matchResult = SegmentMatcher.matchToken(patternToken, segment, segmentsCopy, segmentIndex, typedLiteralFieldMap);
                if (matchResult.success) {
                    result.matched.push(...(matchResult.matched || []));
                    if (matchResult.param) {
                        result.addParam(matchResult.param.name, matchResult.param.value);
                    }
                    segmentIndex = matchResult.newSegmentIndex || segmentIndex + 1;
                    patternIndex++;
                    continue;
                }
            }
            // segment 不存在或不匹配
            if (patternToken.optional) {
                if (patternToken.name) {
                    // eslint-disable-next-line no-console
                    console.log('DEBUG addParam patternToken:', patternToken);
                    const defaultValue = patternToken.defaultValue !== undefined ? patternToken.defaultValue :
                        (patternToken.dataType === 'text' ? '' : null);
                    result.addParam(patternToken.name, defaultValue);
                }
                patternIndex++;
                // 对于可选参数，如果当前segment不匹配，我们跳过它
                if (segment) {
                    segmentIndex++;
                }
            }
            else {
                // 必需参数不匹配，返回null
                return null;
            }
        }
        // 处理剩余的段
        while (segmentIndex < segmentsCopy.length) {
            result.addRemaining(segmentsCopy[segmentIndex]);
            segmentIndex++;
        }
        // debug
        // eslint-disable-next-line no-console
        console.log('DEBUG result.params:', result.params, 'matched:', result.matched);
        return result.isValid() ? result : null;
    }
    static matchToken(token, segment, segments, segmentIndex, typedLiteralFieldMap) {
        switch (token.type) {
            case 'literal':
                return SegmentMatcher.matchLiteral(token, segment, segments, segmentIndex);
            case 'typed_literal':
                return SegmentMatcher.matchTypedLiteral(token, segment, segments, segmentIndex, typedLiteralFieldMap);
            case 'parameter':
                return SegmentMatcher.matchParameter(token, segment);
            case 'rest_parameter':
                return SegmentMatcher.matchRestParameter(token, segments, segmentIndex);
            default:
                return { success: false };
        }
    }
    static matchLiteral(token, segment, segments, segmentIndex) {
        if (segment.type === 'text' && segment.data.text.startsWith(token.value)) {
            const matchedText = token.value;
            let afterText = segment.data.text.substring(matchedText.length);
            const matched = [];
            matched.push({ type: 'text', data: { text: matchedText } });
            // 将剩余文本插入到下一个位置
            if (afterText) {
                segments.splice(segmentIndex + 1, 0, {
                    type: 'text',
                    data: { text: afterText }
                });
            }
            return {
                success: true,
                matched,
                newSegmentIndex: segmentIndex + 1
            };
        }
        return { success: false };
    }
    static matchTypedLiteral(token, segment, segments, segmentIndex, typedLiteralFieldMap) {
        if (segment.type === token.segmentType) {
            const field = typedLiteralFieldMap?.[segment.type];
            if (field && segment.data && token.value !== undefined) {
                // 处理数组字段：只要其中一个匹配即可
                if (Array.isArray(field)) {
                    for (const singleField of field) {
                        if (segment.data[singleField] !== undefined) {
                            if (String(segment.data[singleField]) === token.value) {
                                return {
                                    success: true,
                                    matched: [segment],
                                    newSegmentIndex: segmentIndex + 1
                                };
                            }
                            // text 类型特殊处理，允许包含
                            if (segment.type === 'text' && typeof segment.data[singleField] === 'string' && segment.data[singleField].includes(token.value)) {
                                const { beforeText, matchedText, afterText } = SegmentMatcher.splitText(segment.data[singleField], token.value);
                                const matched = [];
                                if (beforeText) {
                                    matched.push({ type: 'text', data: { text: beforeText } });
                                }
                                matched.push({ type: 'text', data: { text: matchedText } });
                                if (afterText) {
                                    segments.splice(segmentIndex + 1, 0, {
                                        type: 'text',
                                        data: { text: afterText }
                                    });
                                }
                                return {
                                    success: true,
                                    matched,
                                    newSegmentIndex: segmentIndex + 1
                                };
                            }
                        }
                    }
                }
                else {
                    // 处理单个字段
                    if (String(segment.data[field]) === token.value) {
                        return {
                            success: true,
                            matched: [segment],
                            newSegmentIndex: segmentIndex + 1
                        };
                    }
                    // text 类型特殊处理，允许包含
                    if (segment.type === 'text' && typeof segment.data[field] === 'string' && segment.data[field].includes(token.value)) {
                        const { beforeText, matchedText, afterText } = SegmentMatcher.splitText(segment.data[field], token.value);
                        const matched = [];
                        if (beforeText) {
                            matched.push({ type: 'text', data: { text: beforeText } });
                        }
                        matched.push({ type: 'text', data: { text: matchedText } });
                        if (afterText) {
                            segments.splice(segmentIndex + 1, 0, {
                                type: 'text',
                                data: { text: afterText }
                            });
                        }
                        return {
                            success: true,
                            matched,
                            newSegmentIndex: segmentIndex + 1
                        };
                    }
                }
            }
        }
        return { success: false };
    }
    static matchParameter(token, segment) {
        if (!segment)
            return { success: false };
        if (token.dataType === 'text') {
            if (segment.type === 'text') {
                return {
                    success: true,
                    matched: [segment],
                    param: { name: token.name, value: segment.data.text }
                };
            }
        }
        else {
            if (segment.type === token.dataType) {
                return {
                    success: true,
                    matched: [segment],
                    param: { name: token.name, value: segment }
                };
            }
        }
        return { success: false };
    }
    static matchRestParameter(token, segments, segmentIndex) {
        const restSegments = [];
        let currentSegmentIndex = segmentIndex;
        while (currentSegmentIndex < segments.length) {
            const segment = segments[currentSegmentIndex];
            // dataType为null时，收集所有类型
            if (!token.dataType) {
                restSegments.push(segment);
                currentSegmentIndex++;
            }
            else if (token.dataType === 'text') {
                if (segment.type === 'text') {
                    restSegments.push(segment);
                    currentSegmentIndex++;
                }
                else {
                    break;
                }
            }
            else {
                if (segment.type === token.dataType) {
                    restSegments.push(segment);
                    currentSegmentIndex++;
                }
                else {
                    break;
                }
            }
        }
        if (restSegments.length > 0) {
            return {
                success: true,
                matched: restSegments,
                param: { name: token.name, value: restSegments },
                newSegmentIndex: currentSegmentIndex
            };
        }
        return { success: false };
    }
    static splitText(text, pattern) {
        const index = text.indexOf(pattern);
        return {
            beforeText: text.substring(0, index),
            matchedText: pattern,
            afterText: text.substring(index + pattern.length)
        };
    }
}
exports.SegmentMatcher = SegmentMatcher;
