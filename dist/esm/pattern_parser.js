import { PatternToken } from './pattern_token.js';
/**
 * 模式解析器类
 */
export class PatternParser {
    /**
     * 解析命令模式字符串
     * @param pattern - 命令模式字符串
     * @returns 解析后的令牌数组
     */
    static parse(pattern) {
        const tokens = [];
        let i = 0;
        while (i < pattern.length) {
            const char = pattern[i];
            if (char === '{') {
                tokens.push(PatternParser.parseTypedLiteral(pattern, i));
                i = PatternParser.findClosingBrace(pattern, i);
            }
            else if (char === '<') {
                tokens.push(PatternParser.parseRequiredParameter(pattern, i));
                i = PatternParser.findClosingBrace(pattern, i);
            }
            else if (char === '[') {
                tokens.push(PatternParser.parseOptionalParameter(pattern, i));
                i = PatternParser.findClosingBrace(pattern, i);
            }
            else {
                const { token, newIndex } = PatternParser.parseLiteral(pattern, i);
                if (token)
                    tokens.push(token);
                i = newIndex;
            }
        }
        // eslint-disable-next-line no-console
        console.log('DEBUG parse tokens:', tokens);
        return tokens;
    }
    static parseTypedLiteral(pattern, startIndex) {
        let i = startIndex + 1; // 跳过 {
        let content = '';
        while (i < pattern.length && pattern[i] !== '}') {
            content += pattern[i];
            i++;
        }
        // 只分割第一个冒号，避免URL中的冒号被分割
        const colonIdx = content.indexOf(':');
        if (colonIdx !== -1) {
            const type = content.slice(0, colonIdx).trim();
            const value = content.slice(colonIdx + 1).trim();
            return PatternToken.createTypedLiteral(type, value);
        }
        // 如果没有冒号，整个内容作为类型
        return PatternToken.createTypedLiteral(content.trim(), '');
    }
    static parseRequiredParameter(pattern, startIndex) {
        let i = startIndex + 1; // 跳过 <
        let content = '';
        while (i < pattern.length && pattern[i] !== '>') {
            content += pattern[i];
            i++;
        }
        const [name, type] = content.split(':');
        return PatternToken.createParameter(name.trim(), type ? type.trim() : 'text', false);
    }
    static parseOptionalParameter(pattern, startIndex) {
        let i = startIndex + 1; // 跳过 [
        let content = '';
        while (i < pattern.length && pattern[i] !== ']') {
            content += pattern[i];
            i++;
        }
        // 支持 [name:type=default]，type 允许有 =，且=右侧可以为JSON
        // 先找第一个冒号
        const colonIdx = content.indexOf(':');
        let trimmedName = content;
        let typeAndDefault = '';
        if (colonIdx !== -1) {
            trimmedName = content.slice(0, colonIdx).trim();
            typeAndDefault = content.slice(colonIdx + 1).trim();
        }
        // 检查是否为rest参数 [...rest] 或 [...rest:type]
        if (trimmedName.startsWith('...')) {
            const restName = trimmedName.substring(3); // 去掉 ...
            return PatternToken.createRestParameter(restName, typeAndDefault || null);
        }
        // 检查是否有默认值语法，=右侧为JSON或字符串
        let dataType = typeAndDefault;
        let defaultValue = undefined;
        // 只分割第一个=，避免JSON内的=
        const eqIdx = typeAndDefault.indexOf('=');
        if (eqIdx !== -1) {
            dataType = typeAndDefault.slice(0, eqIdx).trim();
            let defaultValueStr = typeAndDefault.slice(eqIdx + 1).trim();
            // 如果是JSON对象，允许没有引号
            if (/^\{.*\}$/.test(defaultValueStr)) {
                try {
                    defaultValue = JSON.parse(defaultValueStr.replace(/([a-zA-Z0-9_]+):/g, '"$1":'));
                }
                catch {
                    defaultValue = defaultValueStr;
                }
            }
            else {
                defaultValue = PatternParser.parseDefaultValue(defaultValueStr);
            }
        }
        // eslint-disable-next-line no-console
        console.log('DEBUG parseOptionalParameter:', { trimmedName, dataType, defaultValue });
        return PatternToken.createParameter(trimmedName, dataType || 'text', true, defaultValue);
    }
    static parseDefaultValue(defaultValueStr) {
        // 尝试解析JSON格式的默认值
        try {
            return JSON.parse(defaultValueStr);
        }
        catch {
            // 如果不是JSON格式，返回原始字符串
            return defaultValueStr;
        }
    }
    static parseLiteral(pattern, startIndex) {
        let i = startIndex;
        let literal = '';
        while (i < pattern.length &&
            pattern[i] !== '<' &&
            pattern[i] !== '[' &&
            pattern[i] !== '{') {
            literal += pattern[i];
            i++;
        }
        // 只判断是否为空，不要trim内容
        return {
            token: literal ? PatternToken.createLiteral(literal) : null,
            newIndex: i
        };
    }
    static findClosingBrace(pattern, startIndex) {
        const openChar = pattern[startIndex];
        const closeChar = openChar === '{' ? '}' : openChar === '<' ? '>' : ']';
        let i = startIndex + 1;
        while (i < pattern.length && pattern[i] !== closeChar) {
            i++;
        }
        return i + 1; // 返回结束位置的下一个位置
    }
}
