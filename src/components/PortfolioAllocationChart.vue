<template>
  <div class="relative" :style="{ height: height + 'px' }">
    <canvas ref="canvasRef"></canvas>
    <div v-if="!hasData" class="absolute inset-0 flex items-center justify-center">
      <p class="text-sm text-slate-600">Sem ativos na carteira</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ label, value, color }]
  height: { type: Number, default: 220 },
})

const canvasRef = ref(null)
let chartInstance = null

const hasData = computed(() => props.data && props.data.length > 0)

function buildChart() {
  if (!canvasRef.value || !hasData.value) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const ctx = canvasRef.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.data.map(d => d.label),
      datasets: [{
        data: props.data.map(d => d.value),
        backgroundColor: props.data.map(d => d.color + 'cc'),
        borderColor: props.data.map(d => d.color),
        borderWidth: 1.5,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d1f38',
          borderColor: '#1e3a5f',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#e2e8f0',
          padding: 12,
          callbacks: {
            label: (context) => {
              const val = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const pct = ((val / total) * 100).toFixed(1)
              return ` ${context.label}: ${pct}%`
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

watch(() => props.data, async () => {
  await nextTick()
  buildChart()
}, { deep: true })

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
