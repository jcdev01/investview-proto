<template>
  <div class="relative" :style="{ height: height + 'px' }">
    <canvas ref="canvasRef"></canvas>
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-[#0d1f38]/80 rounded-lg">
      <div class="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps({
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true },
  height: { type: Number, default: 280 },
  loading: { type: Boolean, default: false },
  formatTooltip: { type: Function, default: null },
  showLegend: { type: Boolean, default: false },
  area: { type: Boolean, default: true },
})

const canvasRef = ref(null)
let chartInstance = null

function getOrCreateGradient(ctx, area, color) {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom)
  gradient.addColorStop(0, color + '33')
  gradient.addColorStop(1, color + '00')
  return gradient
}

function buildChart() {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const defaultColors = ['#22d3ee', '#34d399', '#f87171', '#f59e0b', '#8b5cf6']

  const processedDatasets = props.datasets.map((ds, i) => {
    const color = ds.color || defaultColors[i % defaultColors.length]
    return {
      label: ds.label || '',
      data: ds.data,
      borderColor: color,
      backgroundColor: props.area
        ? (context) => {
            const chart = context.chart
            const { ctx: c, chartArea } = chart
            if (!chartArea) return color + '22'
            return getOrCreateGradient(c, chartArea, color)
          }
        : 'transparent',
      borderWidth: 2,
      pointRadius: ds.data.length > 60 ? 0 : 3,
      pointHoverRadius: 5,
      pointBackgroundColor: color,
      pointBorderColor: '#0d1f38',
      pointBorderWidth: 2,
      tension: 0.4,
      fill: props.area,
    }
  })

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: processedDatasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: props.showLegend,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
            usePointStyle: true,
            pointStyleWidth: 8,
            boxHeight: 6,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#0d1f38',
          borderColor: '#1e3a5f',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#e2e8f0',
          padding: 12,
          callbacks: {
            label: (context) => {
              if (props.formatTooltip) {
                return props.formatTooltip(context)
              }
              return ` ${context.dataset.label}: ${context.formattedValue}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#1e3a5f33', drawBorder: false },
          ticks: {
            color: '#475569',
            font: { size: 11, family: 'Inter' },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
        },
        y: {
          grid: { color: '#1e3a5f33', drawBorder: false },
          ticks: {
            color: '#475569',
            font: { size: 11, family: 'Inter' },
            callback: (value) => {
              if (props.formatTooltip) return value
              return value >= 1000
                ? `${(value / 1000).toFixed(0)}K`
                : value.toFixed(2)
            },
          },
        },
      },
    },
  })
}

onMounted(async () => {
  await nextTick()
  buildChart()
})

watch(
  () => [props.labels, props.datasets, props.loading],
  async () => {
    await nextTick()
    buildChart()
  },
  { deep: true }
)

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
