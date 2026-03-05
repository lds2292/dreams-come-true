<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 회사 정보 -->
      <div class="footer-company">
        <span class="company-name">DreamsComeTrue Inc.</span>
      </div>

      <!-- 링크 -->
      <div class="footer-links">
        <a href="#" class="footer-link">이용약관</a>
        <span class="divider">|</span>
        <a href="#" class="footer-link font-semibold">개인정보처리방침</a>
        <span class="divider">|</span>
        <a href="#" class="footer-link">고객센터</a>
      </div>

      <!-- 사업자 정보 -->
      <div class="footer-info">
        <p>대표이사 : 홍길동&nbsp;&nbsp;사업자등록번호 : 000-00-00000</p>
        <p>주소 : 서울특별시 강남구 테헤란로 123</p>
        <p>고객센터 : 1588-0000&nbsp;&nbsp;이메일 : help@dreamcomtrue.com</p>
      </div>

      <p class="footer-copyright">© 2026 DreamsComeTrue. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #f8f8f8;
  border-top: 1px solid #ebebeb;
}

.footer-inner {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-company {
  display: flex;
  align-items: center;
}

.company-name {
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.footer-link {
  font-size: 12px;
  color: #555;
  text-decoration: none;
}

.footer-link:active {
  text-decoration: underline;
}

.divider {
  font-size: 11px;
  color: #ccc;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.footer-info p {
  margin: 0;
  font-size: 11px;
  color: #888;
  line-height: 1.6;
}

.footer-copyright {
  margin: 4px 0 0;
  font-size: 11px;
  color: #aaa;
}
</style>
