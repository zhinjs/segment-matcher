// 导出所有类型和类
export { SegmentMatcher,createMatcher } from './segment_matcher';
export { PatternParser } from './pattern_parser';
export { PatternToken } from './pattern_token';
export { BasicMatcher } from './basic_matcher';
export { MatchResult } from './match_result';
export * from './errors';
export * from './types';
export * from './type_matchers';

// 默认导出
export { SegmentMatcher as default } from './segment_matcher'; 