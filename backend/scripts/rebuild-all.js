/**
 * 전체 embed_text 개선 일괄 실행 스크립트
 *
 * 실행 방법:
 *   node scripts/rebuild-all.js
 *
 * 중단 후 재실행:
 *   node scripts/rebuild-all.js   ← 완료된 파일/단계는 자동 스킵
 *
 * 강제 처음부터:
 *   node scripts/rebuild-all.js --reset
 *
 * 진행 상태 파일: backend/scripts/.rebuild-progress.json
 *
 * 단계별 순서 (파일당):
 *   1. keywords  — GPT로 키워드 재생성
 *   2. embed     — embed_text 재구성 (로컬)
 *   3. pinecone  — Pinecone 재시딩
 *   4. supabase  — Supabase summary 동기화
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const FILES    = ['ACT', 'ANIMAL', 'DEATH', 'NATURE', 'GOODS', 'PERSON'];
const STEPS    = ['keywords', 'embed', 'pinecone', 'supabase'];
const CKPT_PATH = path.resolve(__dirname, '.rebuild-progress.json');

// ── 진행 상태 관리 ────────────────────────────────────────────────
function loadProgress() {
  if (fs.existsSync(CKPT_PATH)) {
    try { return JSON.parse(fs.readFileSync(CKPT_PATH, 'utf-8')); } catch {}
  }
  const init = {};
  FILES.forEach(f => { init[f] = { keywords: false, embed: false, pinecone: false, supabase: false }; });
  return init;
}

function saveProgress(progress) {
  fs.writeFileSync(CKPT_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

// ── 단계 실행 ─────────────────────────────────────────────────────
function runStep(step, filename) {
  const scriptMap = {
    keywords: `node scripts/rebuild-keywords.js ${filename}`,
    embed:    `node scripts/rebuild-embed-text.js ${filename}`,
    pinecone: `node scripts/seed-dreams.js ${filename}`,
    supabase: `node scripts/sync-supabase-summary.js ${filename}`,
  };
  execSync(scriptMap[step], { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  if (process.argv.includes('--reset')) {
    if (fs.existsSync(CKPT_PATH)) fs.unlinkSync(CKPT_PATH);
    console.log('🔄 진행 상태 초기화 완료\n');
  }

  const progress = loadProgress();
  const startTime = Date.now();

  console.log('========================================');
  console.log('  embed_text 전체 재구성 시작');
  console.log(`  대상: ${FILES.join(', ')}`);
  console.log('========================================\n');

  // 현재 상태 출력
  console.log('현재 진행 상태:');
  FILES.forEach(f => {
    const s = progress[f];
    const done = STEPS.filter(k => s[k]).length;
    console.log(`  ${f}: ${done}/${STEPS.length} 완료 [${STEPS.map(k => s[k] ? '✅' : '⬜').join(' ')}]`);
  });
  console.log();

  for (const filename of FILES) {
    const fileSteps = progress[filename];
    const remaining = STEPS.filter(s => !fileSteps[s]);

    if (remaining.length === 0) {
      console.log(`⏩ ${filename} — 전체 완료, 스킵\n`);
      continue;
    }

    console.log(`\n${'─'.repeat(40)}`);
    console.log(`📂 ${filename} 처리 시작`);
    console.log(`${'─'.repeat(40)}`);

    for (const step of STEPS) {
      if (fileSteps[step]) {
        console.log(`  ⏩ [${step}] 완료됨, 스킵`);
        continue;
      }

      console.log(`\n  ▶ [${step}] 시작...`);
      const t = Date.now();

      try {
        runStep(step, filename);
        fileSteps[step] = true;
        saveProgress(progress);
        console.log(`  ✅ [${step}] 완료 (${((Date.now() - t) / 1000).toFixed(1)}s)`);
      } catch (err) {
        console.error(`\n  ❌ [${step}] 실패: ${err.message}`);
        console.error(`\n중단됨. 재실행하면 이어서 진행합니다.`);
        console.error(`명령어: node scripts/rebuild-all.js`);
        process.exit(1);
      }
    }

    console.log(`\n✅ ${filename} 전체 완료`);
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n========================================');
  console.log(`  🎉 전체 완료! 소요 시간: ${elapsed}분`);
  console.log('========================================');

  // 완료 후 진행 파일 삭제
  if (fs.existsSync(CKPT_PATH)) fs.unlinkSync(CKPT_PATH);
}

main().catch(err => {
  console.error('\n❌ 예상치 못한 오류:', err.message);
  process.exit(1);
});
