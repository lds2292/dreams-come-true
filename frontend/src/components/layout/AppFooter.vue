<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <span class="company-name">꿈해몽 사전</span>
      <p class="footer-copyright">© 2026 꿈해몽 사전. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--bg-surface);
  border-top: 1px solid var(--divider);
}

.footer-inner {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.company-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.footer-copyright {
  margin: 0;
  font-size: 11px;
  color: var(--text-disabled);
}
</style>
