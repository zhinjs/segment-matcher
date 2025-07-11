import { MatchResult as IMatchResult, MessageSegment } from './types';

/**
 * 匹配结果类
 */
export class MatchResult implements IMatchResult {
  matched: MessageSegment[] = [];
  params: Record<string, any> = {};
  remaining: MessageSegment[] = [];

  addMatched(segment: MessageSegment): void {
    this.matched.push(segment);
  }

  addParam(name: string, value: any): void {
    this.params[name] = value;
  }

  addRemaining(segment: MessageSegment): void {
    this.remaining.push(segment);
  }

  isValid(): boolean {
    // 只要有参数（即使是默认值）就算有效
    return Object.keys(this.params).length > 0 || this.matched.length > 0;
  }
} 