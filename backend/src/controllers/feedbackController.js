const fs   = require('fs');
const path = require('path');

const DATA_DIR     = path.join(__dirname, '../../data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const submit = (req, res) => {
  const { dreamId, query, helpful, aiGenerated } = req.body;

  if (!dreamId || typeof helpful !== 'boolean') {
    return res.status(400).json({ message: 'dreamId와 helpful(boolean)은 필수입니다.' });
  }

  const entry = {
    dreamId,
    query:       query       ?? '',
    helpful,
    aiGenerated: aiGenerated ?? false,
    ts:          new Date().toISOString(),
  };

  try {
    ensureDataDir();
    fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(entry) + '\n', 'utf-8');
    console.log(`[피드백] dreamId=${dreamId}, helpful=${helpful}, ai=${aiGenerated}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(`[피드백 저장 오류] ${err.message}`);
    res.status(500).json({ message: '피드백 저장 중 오류가 발생했습니다.' });
  }
};

module.exports = { submit };
