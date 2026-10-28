<template>
  <DashboardLayout>
    <div class="space-y-5">
      <!-- Selection panel -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-white mb-4">Selecionar Ativos para Comparar</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Asset selectors -->
          <div v-for="(slot, idx) in assetSlots" :key="idx" class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-500">
              Ativo {{ idx + 1 }} {{ idx < 2 ? '*' : '(opcional)' }}
            </label>
            <div class="relative">
              <input
                v-model="slot.search"
                type="text"
                :placeholder="idx === 0 ? 'Ex: PETR4 ou Petrobras' : idx === 1 ? 'Ex: VALE3 ou Vale' : 'Adicionar mais um...'"
                class="w-full bg-[#050d1a] border border-[#1e3a5f] rounded-lg px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                @input="slot.showDropdown = true"
                @focus="slot.showDropdown = true"
              />

              <div
                v-if="slot.selected"
                class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
              >
                <span
                  class="text-xs px-1.5 py-0.5 rounded font-semibold"
                  :style="{ color: slot.selected.color }"
                >{{ slot.selected.ticker }}</span>
                <button class="text-slate-500 hover:text-red-400 transition-colors" @click="clearSlot(idx)">
                  <X :size="12" />
                </button>
              </div>

              <div
                v-if="slot.showDropdown && getSuggestions(slot.search, idx).length > 0"
                class="absolute top-full left-0 right-0 mt-1 bg-[#112342] border border-[#1e3a5f] rounded-lg overflow-hidden shadow-xl z-20 max-h-48 overflow-y-auto"
              >
                <button
                  v-for="asset in getSuggestions(slot.search, idx)"
                  :key="asset.id"
                  class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-left transition-colors"
                  @click="selectAsset(idx, asset)"
                >
                  <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white">{{ asset.ticker }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ asset.name }}</p>
                  </div>
                  <span class="text-xs px-1.5 py-0.5 rounded shrink-0" :class="getCategoryBadgeClass(asset.category)">
                    {{ asset.category }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Period selector -->
        <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <span class="text-xs font-medium text-slate-500">Período de comparação:</span>
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="p in periods"
              :key="p"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                selectedPeriod === p
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'text-slate-500 border-[#1e3a5f] hover:text-slate-300 hover:border-slate-500',
              ]"
              @click="changePeriod(p)"
            >
              {{ p }}
            </button>
          </div>

          <button
            v-if="hasSelectedAssets"
            class="sm:ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 border border-[#1e3a5f] rounded-lg hover:text-white hover:border-slate-500 transition-colors"
            @click="clearAll"
          >
            <X :size="12" />
            Limpar seleção
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!hasSelectedAssets" class="card">
        <EmptyState
          :icon="GitCompare"
          title="Nenhum ativo selecionado"
          message="Selecione ao menos dois ativos acima para iniciar a comparação de desempenho, indicadores e histórico de preços."
        />
      </div>

      <template v-else>
        <!-- Comparison chart -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-semibold text-white">Comparação de Desempenho</h2>
              <p class="text-xs text-slate-500">Evolução percentual normalizada — dados demonstrativos</p>
            </div>
          </div>
          <PriceChart
            :labels="comparisonLabels"
            :datasets="comparisonDatasets"
            :height="300"
            :loading="chartLoading"
            :show-legend="true"
            :area="false"
            :format-tooltip="formatComparisonTooltip"
          />
        </div>

        <!-- Performance summary cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(slot, idx) in selectedSlots"
            :key="idx"
            class="card p-5 relative overflow-hidden"
          >
            <!-- Best/worst badge -->
            <div v-if="selectedSlots.length >= 2" class="absolute top-3 right-3">
              <span
                v-if="isBest(idx)"
                class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-medium"
              >Melhor</span>
              <span
                v-else-if="isWorst(idx)"
                class="text-xs px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/20 text-red-400 font-medium"
              >Pior</span>
            </div>

            <div class="flex items-center gap-3 mb-4">
              <AssetLogo :ticker="slot.selected.ticker" :logo="slot.selected.logo" :name="slot.selected.name" size="md" />
              <div>
                <p class="text-sm font-semibold text-white">{{ slot.selected.ticker }}</p>
                <span class="text-xs px-1.5 py-0.5 rounded" :class="getCategoryBadgeClass(slot.selected.category)">{{ slot.selected.category }}</span>
              </div>
            </div>

            <div class="space-y-2.5">
              <div class="flex justify-between">
                <span class="text-xs text-slate-500">Preço atual</span>
                <span class="text-xs font-semibold text-white">{{ formatCurrency(slot.selected.price) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-500">Variação no período</span>
                <span :class="['text-xs font-semibold', getPeriodChange(idx) >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ formatPercent(getPeriodChange(idx)) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-500">Variação hoje</span>
                <span :class="['text-xs font-semibold', slot.selected.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ formatPercent(slot.selected.changePercent) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-500">Vol. (ref.)</span>
                <span class="text-xs font-medium text-white">{{ slot.selected.volume }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicators comparison table -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-[#1e3a5f]">
            <h2 class="text-sm font-semibold text-white">Comparativo de Indicadores</h2>
            <p class="text-xs text-slate-500 mt-0.5">Valores demonstrativos. Indicadores disponíveis variam por tipo de ativo.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#1e3a5f]">
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Indicador</th>
                  <th
                    v-for="(slot, idx) in selectedSlots"
                    :key="idx"
                    class="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    :style="{ color: slot.selected.color }"
                  >
                    {{ slot.selected.ticker }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="indicator in indicators"
                  :key="indicator.key"
                  class="border-b border-[#1e3a5f]/40 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td class="px-5 py-3">
                    <p class="text-sm text-slate-300">{{ indicator.label }}</p>
                    <p class="text-xs text-slate-600">{{ indicator.description }}</p>
                  </td>
                  <td
                    v-for="(slot, idx) in selectedSlots"
                    :key="idx"
                    class="px-4 py-3 text-center"
                  >
                    <span
                      v-if="getIndicatorValue(slot.selected, indicator.key) !== '—'"
                      :class="['text-sm font-medium', indicator.colorize ? getColorClass(slot.selected, indicator.key) : 'text-white']"
                    >
                      {{ getIndicatorValue(slot.selected, indicator.key) }}
                    </span>
                    <span v-else class="text-xs text-slate-600" title="Indicador não aplicável a este tipo de ativo">N/D</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { X, GitCompare } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PriceChart from '@/components/PriceChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets } from '@/data/mockAssets'
import { getAssetHistory } from '@/data/mockMarketHistory'
import { formatCurrency, formatPercent, getCategoryBadgeClass } from '@/utils/formatters'

const route = useRoute()
const periods = ['1W', '1M', '6M', '1Y']
const selectedPeriod = ref('1M')
const chartLoading = ref(false)

// Three asset slots
const assetSlots = ref([
  { search: '', selected: null, showDropdown: false },
  { search: '', selected: null, showDropdown: false },
  { search: '', selected: null, showDropdown: false },
])

const selectedSlots = computed(() => assetSlots.value.filter(s => s.selected !== null))
const hasSelectedAssets = computed(() => selectedSlots.value.length >= 1)

// Load from route query
onMounted(() => {
  if (route.query.a) {
    const asset = mockAssets.find(a => a.ticker === route.query.a)
    if (asset) selectAsset(0, asset)
  }
  if (route.query.b) {
    const asset = mockAssets.find(a => a.ticker === route.query.b)
    if (asset) selectAsset(1, asset)
  }
})

function getSuggestions(search, slotIdx) {
  const selectedIds = assetSlots.value
    .filter((_, i) => i !== slotIdx)
    .map(s => s.selected?.id)
    .filter(Boolean)

  const available = mockAssets.filter(a => !selectedIds.includes(a.id))

  if (!search) return available.slice(0, 6)
  const q = search.toLowerCase()
  return available.filter(a =>
    a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
  ).slice(0, 6)
}

function selectAsset(idx, asset) {
  assetSlots.value[idx].selected = asset
  assetSlots.value[idx].search = `${asset.ticker} — ${asset.name}`
  assetSlots.value[idx].showDropdown = false
  loadComparisonData()
}

function clearSlot(idx) {
  assetSlots.value[idx].selected = null
  assetSlots.value[idx].search = ''
  loadComparisonData()
}

function clearAll() {
  assetSlots.value.forEach(s => { s.selected = null; s.search = '' })
}

// Chart data
const historyMap = ref({})

async function loadComparisonData() {
  if (selectedSlots.value.length === 0) return
  chartLoading.value = true
  await new Promise(r => setTimeout(r, 300))
  
  for (const slot of selectedSlots.value) {
    const key = `${slot.selected.ticker}_${selectedPeriod.value}`
    if (!historyMap.value[key]) {
      historyMap.value[key] = getAssetHistory(slot.selected.ticker, selectedPeriod.value)
    }
  }
  chartLoading.value = false
}

async function changePeriod(period) {
  selectedPeriod.value = period
  await loadComparisonData()
}

// Normalize data to percentage change for comparison
const comparisonLabels = computed(() => {
  if (selectedSlots.value.length === 0) return []
  const first = selectedSlots.value[0]
  const key = `${first.selected.ticker}_${selectedPeriod.value}`
  return (historyMap.value[key] || []).map(d => d.date)
})

const chartColors = ['#22d3ee', '#34d399', '#f59e0b']

const comparisonDatasets = computed(() =>
  selectedSlots.value.map((slot, idx) => {
    const key = `${slot.selected.ticker}_${selectedPeriod.value}`
    const history = historyMap.value[key] || []
    const basePrice = history[0]?.price || slot.selected.price
    const normalizedData = history.map(d => parseFloat(((d.price - basePrice) / basePrice * 100).toFixed(2)))
    return {
      label: slot.selected.ticker,
      data: normalizedData,
      color: chartColors[idx] || slot.selected.color,
    }
  })
)

function formatComparisonTooltip(context) {
  const val = context.parsed.y
  return ` ${context.dataset.label}: ${val >= 0 ? '+' : ''}${val.toFixed(2).replace('.', ',')}%`
}

// Period performance
function getPeriodChange(slotIdx) {
  const slot = selectedSlots.value[slotIdx]
  if (!slot) return 0
  const key = `${slot.selected.ticker}_${selectedPeriod.value}`
  const history = historyMap.value[key] || []
  if (history.length < 2) return 0
  const first = history[0].price
  const last = history[history.length - 1].price
  return ((last - first) / first) * 100
}

function isBest(idx) {
  if (selectedSlots.value.length < 2) return false
  const changes = selectedSlots.value.map((_, i) => getPeriodChange(i))
  return getPeriodChange(idx) === Math.max(...changes)
}

function isWorst(idx) {
  if (selectedSlots.value.length < 2) return false
  const changes = selectedSlots.value.map((_, i) => getPeriodChange(i))
  return getPeriodChange(idx) === Math.min(...changes)
}

// Indicators
const indicators = [
  { key: 'price', label: 'Preço Atual', description: 'Cotação demonstrativa', colorize: false },
  { key: 'changePercent', label: 'Variação Hoje', description: 'Variação percentual no dia', colorize: true },
  { key: 'high52w', label: 'Máx. 52 Semanas', description: 'Maior preço no período', colorize: false },
  { key: 'low52w', label: 'Mín. 52 Semanas', description: 'Menor preço no período', colorize: false },
  { key: 'pe', label: 'P/L', description: 'Preço / Lucro (só ações)', colorize: false },
  { key: 'dy', label: 'Dividend Yield', description: 'Rendimento (ações e FIIs)', colorize: true },
  { key: 'pvp', label: 'P/VP', description: 'Preço sobre valor patrimonial', colorize: false },
  { key: 'er', label: 'Taxa de Adm.', description: 'Custo anual (ETFs)', colorize: false },
]

function getIndicatorValue(asset, key) {
  const val = asset[key]
  if (val === undefined || val === null) return '—'
  if (key === 'price' || key === 'high52w' || key === 'low52w') return formatCurrency(val)
  if (key === 'changePercent' || key === 'dy' || key === 'er') return `${val >= 0 ? '+' : ''}${val.toFixed(2).replace('.', ',')}%`
  return val
}

function getColorClass(asset, key) {
  const val = asset[key]
  if (val === undefined) return 'text-slate-600'
  if (key === 'changePercent') return val >= 0 ? 'text-emerald-400' : 'text-red-400'
  if (key === 'dy') return 'text-emerald-400'
  return 'text-white'
}

watch(selectedSlots, () => {
  if (selectedSlots.value.length > 0) loadComparisonData()
}, { deep: true })
</script>
