<template>
  <div class="page-card">
    <h3>仪表盘</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-value">128</p>
        <p class="stat-label">活跃用户</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">24</p>
        <p class="stat-label">待处理任务</p>
      </div>
      <div class="stat-card">
        <p class="stat-value">8</p>
        <p class="stat-label">今日新增</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.stat-card {
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  margin: 6px 0 0;
  color: #64748b;
}
</style>
