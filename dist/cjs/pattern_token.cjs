"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternToken = void 0;
/**
 * 模式令牌类
 */
class PatternToken {
    constructor(type, options = {}) {
        this.type = type;
        Object.assign(this, options);
    }
    static createLiteral(value) {
        return new PatternToken('literal', { value });
    }
    static createTypedLiteral(segmentType, value) {
        return new PatternToken('typed_literal', { segmentType, value });
    }
    static createParameter(name, dataType, optional = false, defaultValue) {
        return new PatternToken('parameter', { name, dataType, optional, defaultValue });
    }
    static createRestParameter(name, dataType) {
        return new PatternToken('rest_parameter', { name, dataType });
    }
}
exports.PatternToken = PatternToken;
