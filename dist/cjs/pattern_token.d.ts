import { PatternToken as IPatternToken, TokenType } from './types';
/**
 * 模式令牌类
 */
export declare class PatternToken implements IPatternToken {
    type: TokenType;
    value?: string;
    segmentType?: string;
    name?: string;
    dataType?: string | null;
    optional?: boolean;
    defaultValue?: any;
    constructor(type: TokenType, options?: Partial<IPatternToken>);
    static createLiteral(value: string): PatternToken;
    static createTypedLiteral(segmentType: string, value: string): PatternToken;
    static createParameter(name: string, dataType: string, optional?: boolean, defaultValue?: any): PatternToken;
    static createRestParameter(name: string, dataType: string | null): PatternToken;
}
