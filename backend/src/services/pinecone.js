const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

let _pinecone = null;
let _openai = null;

function getPinecone() {
  if (!_pinecone) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    _pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return _pinecone;
}

function getOpenAI() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

function getIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) {
    throw new Error('PINECONE_INDEX_NAME 환경변수가 설정되지 않았습니다.');
  }
  const host = process.env.PINECONE_HOST;
  return host
    ? getPinecone().index(indexName, host)
    : getPinecone().index(indexName);
}

/**
 * 텍스트 배열을 OpenAI text-embedding-3-large로 임베딩 (데이터 저장용)
 * dimension: 3072 — Pinecone 인덱스도 3072으로 생성되어 있어야 함
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function embedTexts(texts) {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: texts,
  });
  return response.data.map((item) => item.embedding);
}

/**
 * 단일 쿼리 텍스트를 임베딩 (검색용)
 * @param {string} query
 * @returns {Promise<number[]>}
 */
async function embedQuery(query) {
  const [vector] = await embedTexts([query]);
  return vector;
}

/**
 * 벡터 유사도 검색
 * @param {number[]} queryVector
 * @param {number} topK
 * @returns {Promise<object[]>}
 */
async function querySimilar(queryVector, topK = 5) {
  const index = getIndex();
  const result = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  return result.matches;
}

module.exports = { getIndex, embedTexts, embedQuery, querySimilar };
