export interface MessageSegment {
    type: string;
    data: Record<string, any>;
}
export type TokenType = 'literal' | 'typed_literal' | 'parameter' | 'rest_parameter';
export interface PatternToken {
    type: TokenType;
    value?: string;
    segmentType?: string;
    name?: string;
    dataType?: string | null;
    optional?: boolean;
    defaultValue?: any;
}
export interface MatchResult {
    matched: MessageSegment[];
    params: Record<string, any>;
    remaining: MessageSegment[];
}
export interface MatchResponse {
    success: boolean;
    matched?: MessageSegment[];
    param?: {
        name: string;
        value: any;
    };
    newSegmentIndex?: number;
}
export type CallbackFunction<T extends any[] = any[], R = any> = ((...values: T) => R) | ((...values: T) => Promise<R>);
