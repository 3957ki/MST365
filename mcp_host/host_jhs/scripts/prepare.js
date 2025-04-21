#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM에서는 __dirname이 없으므로 대체 방법 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = path.resolve(dirname(__dirname));

console.log('프로젝트 설치 준비 중...');

const dirs = [
  'test-results/screenshots',
  'test-results/reports',
  'test-results/logs'
];

// 디렉토리 생성
for (const dir of dirs) {
  const dirPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`디렉토리 생성: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log('설치 준비가 완료되었습니다!');