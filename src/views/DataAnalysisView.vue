<template>
  <div class="page-card">
    <div class="page-heading">
      <h3>数据分析</h3>
    </div>
    <div class="analytics-grid">
      <div class="chart-card">
        <h4>销售趋势</h4>
        <div ref="trendChart" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <h4>品类占比</h4>
        <div ref="pieChart" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { fetchAnalyticsData } from '@/api/http'

const trendChart = ref<HTMLDivElement | null>(null)
const pieChart = ref<HTMLDivElement | null>(null)

const initCharts = async () => {
  const response = await fetchAnalyticsData()
  const { salesTrend, categoryShare } = response.data

  if (trendChart.value) {
    const trend = echarts.init(trendChart.value)
    trend.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: salesTrend.map((item: any) => item.date)
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          data: salesTrend.map((item: any) => item.value)
        }
      ]
    })
  }

  if (pieChart.value) {
    const pie = echarts.init(pieChart.value)
    pie.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'horizontal', bottom: 0 },
      series: [
        {
          name: '品类占比',
          type: 'pie',
          radius: '60%',
          data: categoryShare,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.25)'
            }
          }
        }
      ]
    })
  }
}

onMounted(initCharts)
</script>

<style scoped>
.page-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}
.page-heading {
  margin-bottom: 18px;
}
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.chart-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
}
.chart-container {
  width: 100%;
  height: 340px;
}
</style>
