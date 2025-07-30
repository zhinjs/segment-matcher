#!/usr/bin/env node

import { Commander } from '../dist/esm/index.js';

console.log('🚀 Segment Matcher Performance Benchmark\n');

// 测试数据
const testPatterns = [
  'hello <name:text>',
  'ping [message:text]',
  'test<arg1:text>[arg2:face]',
  '{text:test}<arg1:text>',
  'test[...rest]',
  'test[...rest:face]'
];

const testSegments = [
  [{ type: 'text', data: { text: 'hello world' } }],
  [{ type: 'text', data: { text: 'ping hello' } }],
  [
    { type: 'text', data: { text: 'test123' } },
    { type: 'face', data: { id: 1 } }
  ],
  [{ type: 'text', data: { text: 'test123' } }],
  [
    { type: 'text', data: { text: 'test' } },
    { type: 'text', data: { text: 'hello' } },
    { type: 'face', data: { id: 1 } },
    { type: 'image', data: { file: 'test.jpg' } }
  ],
  [
    { type: 'text', data: { text: 'test' } },
    { type: 'face', data: { id: 1 } },
    { type: 'face', data: { id: 2 } },
    { type: 'text', data: { text: 'hello' } },
    { type: 'image', data: { file: 'test.jpg' } }
  ]
];

// 性能测试函数
function benchmark(name, fn, iterations = 10000) {
  console.log(`📊 Testing: ${name}`);
  
  // 预热
  for (let i = 0; i < 1000; i++) {
    fn();
  }
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  const opsPerSec = Math.round(iterations / (totalTime / 1000));
  
  console.log(`   ⏱️  Total: ${totalTime.toFixed(2)}ms`);
  console.log(`   📈 Average: ${avgTime.toFixed(4)}ms per operation`);
  console.log(`   🚀 Operations/sec: ${opsPerSec.toLocaleString()}`);
  console.log('');
  
  return { totalTime, avgTime, opsPerSec };
}

// 运行基准测试
console.log('🔧 Pattern Parsing Performance:');
for (let i = 0; i < testPatterns.length; i++) {
  const pattern = testPatterns[i];
  benchmark(`Pattern: "${pattern}"`, () => {
    new Commander(pattern);
  }, 10000);
}

console.log('🎯 Matching Performance:');
for (let i = 0; i < testPatterns.length; i++) {
  const pattern = testPatterns[i];
  const segments = testSegments[i];
  const commander = new Commander(pattern);
  
  benchmark(`Match: "${pattern}"`, () => {
    commander.match(segments);
  }, 10000);
}

console.log('⛓️  Action Chaining Performance:');
const chainingPattern = 'test<arg1:text>';
const chainingSegments = [{ type: 'text', data: { text: 'test123' } }];

benchmark('Action Chaining (3 actions)', () => {
  const commander = new Commander(chainingPattern)
    .action((result) => result.arg1)
    .action((arg1) => arg1.toUpperCase())
    .action((upper) => upper.length);
  
  commander.match(chainingSegments);
}, 10000);

console.log('🔄 Async Action Chaining Performance:');
benchmark('Async Action Chaining (3 actions)', async () => {
  const commander = new Commander(chainingPattern)
    .action(async (result) => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return result.arg1;
    })
    .action(async (arg1) => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return arg1.toUpperCase();
    })
    .action((upper) => upper.length);
  
  await commander.matchAsync(chainingSegments);
}, 1000);

console.log('✅ Benchmark completed!'); 