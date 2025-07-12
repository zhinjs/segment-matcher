/**
 * 匹配结果类
 */
export class MatchResult {
    constructor() {
        this.matched = [];
        this.params = {};
        this.remaining = [];
    }
    addMatched(segment) {
        this.matched.push(segment);
    }
    addParam(name, value) {
        this.params[name] = value;
    }
    addRemaining(segment) {
        this.remaining.push(segment);
    }
    isValid() {
        // 只要有参数（即使是默认值）就算有效
        return Object.keys(this.params).length > 0 || this.matched.length > 0;
    }
}
