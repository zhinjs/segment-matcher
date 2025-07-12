"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.MatchResult = exports.PatternToken = void 0;
// 导出所有类型和类
__exportStar(require("./types.cjs"), exports);
var pattern_token_1 = require("./pattern_token.cjs");
Object.defineProperty(exports, "PatternToken", { enumerable: true, get: function () { return pattern_token_1.PatternToken; } });
var match_result_1 = require("./match_result.cjs");
Object.defineProperty(exports, "MatchResult", { enumerable: true, get: function () { return match_result_1.MatchResult; } });
__exportStar(require("./pattern_parser.cjs"), exports);
__exportStar(require("./segment_matcher.cjs"), exports);
__exportStar(require("./commander.cjs"), exports);
// 默认导出
var commander_1 = require("./commander.cjs");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return commander_1.Commander; } });
