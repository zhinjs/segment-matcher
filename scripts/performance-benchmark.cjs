#!/usr/bin/env node

const { performance } = require('perf_hooks');
const { Commander } = require('../dist/cjs/commander.cjs');

/**
 * 性能基准测试
 * 
 * 测试优化后的匹配算法性能，包括：
 * - 模式解析性能
 * - 匹配性能
 * - 内存使用
 * - 缓存效果
 */

// 测试数据
const testPatterns = [
  'hello <name:text>',
  'hello <name:text> [count:number=1]',
  '{text:start}<command:text>[count:number=1][...rest]',
  'hello <name:text> <age:number> [city:text=Beijing] [hobbies:text=reading]',
  'very long pattern with many <parameters:text> and [optional:number=42] and {typed:literal} and more <stuff:text>',
];

const testSegments = [
  // 简单匹配
  [{ type: 'text', data: { text: 'hello Alice' } }],
  
  // 复杂匹配
  [
    { type: 'text', data: { text: 'start' } },
    { type: 'text', data: { text: 'command' } },
    { type: 'face', data: { id: 1 } },
    { type: 'image', data: { file: 'test.jpg' } }
  ],
  
  // 大量消息段
  Array.from({ length: 100 }, (_, i) => ({
    type: 'text',
    data: { text: `message ${i}` }
  })),
  
  // 混合类型消息段
  [
    { type: 'text', data: { text: 'hello' } },
    { type: 'at', data: { user_id: '123' } },
    { type: 'face', data: { id: 1 } },
    { type: 'image', data: { file: 'avatar.png' } },
    { type: 'text', data: { text: 'world' } }
  ]
];

/**
 * 运行性能测试
 */
function runPerformanceTest() {
  console.log('🚀 开始性能基准测试...\n');
  
  // 测试模式解析性能
  console.log('📊 模式解析性能测试:');
  testPatterns.forEach((pattern, index) => {
    const start = performance.now();
    const commander = new Commander(pattern);
    const end = performance.now();
    
    console.log(`  模式 ${index + 1}: ${(end - start).toFixed(3)}ms`);
  });
  
  // 测试匹配性能
  console.log('\n📊 匹配性能测试:');
  testSegments.forEach((segments, index) => {
    const pattern = testPatterns[Math.min(index, testPatterns.length - 1)];
    const commander = new Commander(pattern);
    
    // 预热
    for (let i = 0; i < 10; i++) {
      commander.match(segments);
    }
    
    // 实际测试
    const iterations = 1000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      commander.match(segments);
    }
    const end = performance.now();
    
    const avgTime = (end - start) / iterations;
    console.log(`  测试 ${index + 1} (${segments.length} 消息段): ${avgTime.toFixed(6)}ms/次`);
  });
  
  // 测试缓存效果
  console.log('\n📊 缓存效果测试:');
  const pattern = testPatterns[0];
  const segments = testSegments[0];
  
  // 第一次解析（无缓存）
  const start1 = performance.now();
  const commander1 = new Commander(pattern);
  const end1 = performance.now();
  
  // 第二次解析（有缓存）
  const start2 = performance.now();
  const commander2 = new Commander(pattern);
  const end2 = performance.now();
  
  console.log(`  首次解析: ${(end1 - start1).toFixed(3)}ms`);
  console.log(`  缓存解析: ${(end2 - start2).toFixed(3)}ms`);
  console.log(`  缓存加速: ${((end1 - start1) / (end2 - start2)).toFixed(1)}x`);
  
  // 测试内存使用
  console.log('\n📊 内存使用测试:');
  const initialMemory = process.memoryUsage();
  
  // 创建大量实例
  const commanders = [];
  for (let i = 0; i < 1000; i++) {
    commanders.push(new Commander(testPatterns[i % testPatterns.length]));
  }
  
  const finalMemory = process.memoryUsage();
  const memoryIncrease = {
    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    external: finalMemory.external - initialMemory.external
  };
  
  console.log(`  堆内存增长: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  总堆内存增长: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  外部内存增长: ${(memoryIncrease.external / 1024 / 1024).toFixed(2)}MB`);
  
  // 测试并发性能
  console.log('\n📊 并发性能测试:');
  const concurrentTest = () => {
    const commanders = testPatterns.map(pattern => new Commander(pattern));
    const results = [];
    
    for (let i = 0; i < 100; i++) {
      const segments = testSegments[i % testSegments.length];
      const commander = commanders[i % commanders.length];
      results.push(commander.match(segments));
    }
    
    return results;
  };
  
  const start = performance.now();
  concurrentTest();
  const end = performance.now();
  
  console.log(`  并发测试 (100 次): ${(end - start).toFixed(3)}ms`);
  
  // 测试错误处理性能
  console.log('\n📊 错误处理性能测试:');
  const errorPattern = 'invalid <pattern:';
  const startError = performance.now();
  
  try {
    new Commander(errorPattern);
  } catch (error) {
    // 预期错误
  }
  
  const endError = performance.now();
  console.log(`  错误处理: ${(endError - startError).toFixed(3)}ms`);
  
  console.log('\n✅ 性能基准测试完成!');
}

/**
 * 运行内存泄漏测试
 */
function runMemoryLeakTest() {
  console.log('\n🔍 内存泄漏测试...');
  
  const initialMemory = process.memoryUsage().heapUsed;
  
  // 运行多轮测试
  for (let round = 0; round < 10; round++) {
    const commanders = [];
    
    // 创建大量实例
    for (let i = 0; i < 100; i++) {
      const commander = new Commander(testPatterns[i % testPatterns.length]);
      commanders.push(commander);
      
      // 执行匹配
      testSegments.forEach(segments => {
        commander.match(segments);
      });
    }
    
    // 清理引用
    commanders.length = 0;
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }
    
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = currentMemory - initialMemory;
    
    console.log(`  轮次 ${round + 1}: 内存增长 ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
  }
  
  console.log('✅ 内存泄漏测试完成!');
}

// 主函数
function main() {
  try {
    runPerformanceTest();
    runMemoryLeakTest();
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  runPerformanceTest,
  runMemoryLeakTest
}; 