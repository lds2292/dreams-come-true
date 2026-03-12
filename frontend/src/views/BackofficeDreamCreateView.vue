<template>
  <div class="backstage-wrap">
    <div class="backstage-container">
      <!-- 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <div class="logo">🌙 꿈해몽 사전</div>
          <span class="badge">백오피스</span>
        </div>
        <button class="logout-btn" @click="logout">로그아웃</button>
      </div>

      <div class="page-title">
        <h1>새 꿈해몽 등록</h1>
        <p>입력한 꿈 내용을 기반으로 AI가 자동으로 키워드를 생성하고 검색 인덱스에 저장합니다.</p>
      </div>

      <!-- 등록 폼 -->
      <form @submit.prevent="onSubmit" class="dream-form" v-if="!result">

        <!-- 카테고리 -->
        <div class="form-section">
          <h2 class="section-title">카테고리</h2>
          <div class="field-row">
            <div class="field">
              <label>대분류 <span class="required">*</span></label>
              <select v-model="form.category_id" @change="onCategoryChange" :disabled="loadingCategories">
                <option value="">카테고리 선택</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>소분류</label>
              <select v-model="form.sub_category_id" :disabled="!form.category_id || subCategories.length === 0">
                <option value="">소분류 선택 (선택)</option>
                <option v-for="sub in subCategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 꿈 내용 / 기본 해석 -->
        <div class="form-section">
          <h2 class="section-title">꿈 내용 및 해석 <span class="required">*</span></h2>
          <div class="field">
            <label>꿈 내용 <span class="required">*</span></label>
            <textarea
              v-model="form.dream"
              placeholder="예: 하늘을 자유롭게 날아다니는 꿈"
              rows="3"
              maxlength="200"
            />
            <span class="char-count">{{ form.dream.length }}/200</span>
          </div>
          <div class="field">
            <label>기본 해석 <span class="required">*</span></label>
            <textarea
              v-model="form.basic"
              placeholder="꿈의 기본적인 해석을 입력하세요."
              rows="5"
              maxlength="1000"
            />
            <span class="char-count">{{ form.basic.length }}/1000</span>
          </div>
        </div>

        <!-- 선택 해석 -->
        <div class="form-section">
          <button type="button" class="toggle-btn" @click="showOptional = !showOptional">
            <span>추가 해석 (태몽 / 일반 / 현실 / 점술)</span>
            <span class="toggle-arrow">{{ showOptional ? '▲' : '▼' }}</span>
          </button>

          <div v-if="showOptional" class="optional-fields">
            <div class="field">
              <label>태몽 해석</label>
              <textarea v-model="form.baby" placeholder="태몽으로 해석될 경우의 의미" rows="3" maxlength="500" />
            </div>
            <div class="field">
              <label>일반 운세</label>
              <textarea v-model="form.random" placeholder="일반 운세 관점의 해석" rows="3" maxlength="500" />
            </div>
            <div class="field">
              <label>현실 해석</label>
              <textarea v-model="form.reality" placeholder="현실적 심리 관점의 해석" rows="3" maxlength="500" />
            </div>
            <div class="field">
              <label>점술 해석</label>
              <textarea v-model="form.fortune_telling" placeholder="점술 관점의 해석" rows="3" maxlength="500" />
            </div>
          </div>
        </div>

        <!-- 에러 -->
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <!-- 진행 상태 -->
        <div v-if="loading" class="progress-wrap">
          <div class="progress-step" v-for="(step, i) in steps" :key="i"
               :class="{ active: currentStep === i, done: currentStep > i }">
            <span class="step-icon">
              {{ currentStep > i ? '✅' : currentStep === i ? '⏳' : '○' }}
            </span>
            <span>{{ step }}</span>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
          {{ loading ? '등록 중...' : '꿈해몽 등록' }}
        </button>
      </form>

      <!-- 결과 -->
      <div v-else class="result-wrap">
        <div class="result-card">
          <div class="result-icon">✨</div>
          <h2>등록 완료!</h2>
          <div class="result-item">
            <span class="result-label">Dream No</span>
            <span class="result-value highlight">{{ result.dream_no }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">생성된 키워드</span>
            <div class="keyword-chips">
              <span v-for="kw in result.keywords" :key="kw" class="keyword-chip">{{ kw }}</span>
            </div>
          </div>
          <div class="result-item">
            <span class="result-label">embed_text</span>
            <span class="result-value embed-text">{{ result.embed_text }}</span>
          </div>
          <div class="result-actions">
            <button class="add-more-btn" @click="resetForm">새 꿈 추가</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// backoffice 전용 axios 인스턴스 (타임아웃 넉넉하게)
const backstageApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000,
})
backstageApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('dct_backstage_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
backstageApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dct_backstage_token')
      router.push('/backstage')
    }
    return Promise.reject(err)
  }
)

// 공용 api (카테고리 조회)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

const categories = ref([])
const subCategories = ref([])
const loadingCategories = ref(false)
const showOptional = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const result = ref(null)
const currentStep = ref(-1)

const steps = [
  '키워드 생성 중...',
  '임베딩 생성 중...',
  'Pinecone 저장 중...',
  'Supabase 저장 중...',
]

const form = ref({
  category_id: '',
  sub_category_id: '',
  dream: '',
  basic: '',
  baby: '',
  random: '',
  reality: '',
  fortune_telling: '',
})

const isFormValid = computed(() =>
  form.value.category_id && form.value.dream.trim() && form.value.basic.trim()
)

onMounted(async () => {
  loadingCategories.value = true
  try {
    const res = await api.get('/categories')
    categories.value = res.categories ?? []
  } catch {
    errorMsg.value = '카테고리 로드 실패'
  } finally {
    loadingCategories.value = false
  }
})

function onCategoryChange() {
  form.value.sub_category_id = ''
  const cat = categories.value.find((c) => c.id === form.value.category_id)
  subCategories.value = cat?.sub_categories ?? []
}

function logout() {
  localStorage.removeItem('dct_backstage_token')
  router.push('/backstage')
}

function resetForm() {
  result.value = null
  errorMsg.value = ''
  currentStep.value = -1
  form.value = {
    category_id: '',
    sub_category_id: '',
    dream: '',
    basic: '',
    baby: '',
    random: '',
    reality: '',
    fortune_telling: '',
  }
  subCategories.value = []
}

async function onSubmit() {
  if (!isFormValid.value) return
  errorMsg.value = ''
  loading.value = true
  currentStep.value = 0

  // 시각적으로 단계별 진행 표시 (실제 처리는 백엔드 단일 호출)
  const stepTimer = setInterval(() => {
    if (currentStep.value < steps.length - 1) currentStep.value++
  }, 3000)

  try {
    const payload = {
      category_id: form.value.category_id,
      dream: form.value.dream.trim(),
      basic: form.value.basic.trim(),
    }
    if (form.value.sub_category_id) payload.sub_category_id = form.value.sub_category_id
    if (form.value.baby.trim()) payload.baby = form.value.baby.trim()
    if (form.value.random.trim()) payload.random = form.value.random.trim()
    if (form.value.reality.trim()) payload.reality = form.value.reality.trim()
    if (form.value.fortune_telling.trim()) payload.fortune_telling = form.value.fortune_telling.trim()

    const data = await backstageApi.post('/backstage/dreams', payload)
    currentStep.value = steps.length
    result.value = data
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '등록 실패. 다시 시도해주세요.'
    currentStep.value = -1
  } finally {
    clearInterval(stepTimer)
    loading.value = false
  }
}
</script>

<style scoped>
.backstage-wrap {
  min-height: 100dvh;
  background: #0f0a1e;
  color: #fff;
  padding: 0 0 60px;
}

.backstage-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 헤더 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 16px;
  border-bottom: 1px solid rgba(124, 58, 237, 0.2);
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  background: rgba(124, 58, 237, 0.3);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.4);
  border-radius: 6px;
  padding: 2px 8px;
}

.logout-btn {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}

.logout-btn:hover {
  color: rgba(255, 255, 255, 0.7);
}

/* 페이지 타이틀 */
.page-title {
  margin-bottom: 32px;
}

.page-title h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.page-title p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
  margin: 0;
}

/* 폼 섹션 */
.form-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #a78bfa;
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 500px) {
  .field-row { grid-template-columns: 1fr; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  position: relative;
}

.field:last-child { margin-bottom: 0; }

.field label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
}

.required {
  color: #f87171;
}

.field input,
.field select,
.field textarea {
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #7c3aed;
}

.field select option {
  background: #1a1030;
  color: #fff;
}

.field select:disabled,
.field textarea:disabled {
  opacity: 0.4;
}

.char-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  text-align: right;
}

/* 선택 필드 토글 */
.toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  color: #a78bfa;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.toggle-arrow {
  font-size: 12px;
  color: rgba(167, 139, 250, 0.6);
}

.optional-fields {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.optional-fields .field {
  margin-bottom: 0;
}

/* 에러 */
.error-msg {
  font-size: 13px;
  color: #f87171;
  text-align: center;
  padding: 10px 14px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 10px;
  margin-bottom: 12px;
}

/* 진행 상태 */
.progress-wrap {
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.3s;
}

.progress-step.active {
  color: #a78bfa;
  font-weight: 600;
}

.progress-step.done {
  color: rgba(255, 255, 255, 0.5);
}

.step-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

/* 제출 버튼 */
.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
  opacity: 0.8;
}

/* 결과 */
.result-wrap {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.result-card {
  width: 100%;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.4);
  border-radius: 20px;
  padding: 32px 28px;
  text-align: center;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.result-card h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 24px;
  color: #fff;
}

.result-item {
  text-align: left;
  margin-bottom: 16px;
}

.result-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.result-value {
  font-size: 15px;
  color: #fff;
}

.result-value.highlight {
  font-size: 20px;
  font-weight: 700;
  color: #a78bfa;
}

.result-value.embed-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  display: block;
}

.keyword-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-chip {
  font-size: 13px;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.4);
  color: #c4b5fd;
  border-radius: 20px;
  padding: 4px 12px;
}

.result-actions {
  margin-top: 24px;
}

.add-more-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-more-btn:active { opacity: 0.8; }
</style>
