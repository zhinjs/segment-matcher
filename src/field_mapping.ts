import { MessageSegment } from './types';

/**
 * 字段提取函数
 * 从消息段中提取值
 */
export type FieldExtractor = (segment: MessageSegment) => any;

/**
 * 字段映射配置
 * 可以是：
 * 1. 字符串：直接访问该字段
 * 2. 字符串数组：按优先级尝试访问这些字段
 * 3. 函数：自定义提取逻辑
 */
export type FieldMapping = string | string[] | FieldExtractor;

/**
 * 字段映射配置对象
 */
export type FieldMappingConfig = Record<string, FieldMapping>;

/**
 * 提取字段值
 * 
 * @param segment - 消息段
 * @param mapping - 字段映射配置
 * @returns 提取的值，如果无法提取则返回 null
 */
export function extractFieldValue(segment: MessageSegment, mapping: FieldMapping): any {
  // 如果是函数，直接调用
  if (typeof mapping === 'function') {
    try {
      return mapping(segment);
    } catch {
      return null;
    }
  }

  // 如果是字符串数组，按顺序尝试
  if (Array.isArray(mapping)) {
    for (const field of mapping) {
      if (field in segment.data && segment.data[field] != null) {
        return segment.data[field];
      }
    }
    return null;
  }

  // 如果是字符串，直接访问字段
  if (typeof mapping === 'string') {
    return segment.data[mapping] ?? null;
  }

  return null;
}
