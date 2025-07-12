/**
 * 模式令牌类
 */
export class PatternToken {
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
