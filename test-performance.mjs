#!/usr/bin/env node

import { detectAgenticEnvironment } from './packages/am-i-vibing/dist/index.mjs';

console.log('Testing performance fix...');

// Mock an environment without any agentic tools detected
const mockEnv = {
  NODE_ENV: 'test',
  PATH: '/usr/bin:/bin',
  HOME: '/home/test'
};

// Test multiple calls to verify caching works
console.time('Detection performance');

for (let i = 0; i < 10; i++) {
  const result = detectAgenticEnvironment(mockEnv);
  if (i === 0) {
    console.log('Detection result:', result);
  }
}

console.timeEnd('Detection performance');
console.log('Performance test completed - no slow process checks should have run!');