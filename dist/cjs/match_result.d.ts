import { MatchResult as IMatchResult, MessageSegment } from './types';
/**
 * 匹配结果类
 */
export declare class MatchResult implements IMatchResult {
    matched: MessageSegment[];
    params: Record<string, any>;
    remaining: MessageSegment[];
    addMatched(segment: MessageSegment): void;
    addParam(name: string, value: any): void;
    addRemaining(segment: MessageSegment): void;
    isValid(): boolean;
}
