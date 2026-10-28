<template>
  <DashboardLayout>
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-500">Carregando dados demonstrativos...</p>
      </div>
    </div>

    <div v-else-if="!asset" class="flex items-center justify-center h-64">
      <div class="text-center">
        <p class="text-slate-400 mb-3">Ativo não encontrado: <span class="font-mono text-white">{{ $route.params.ticker }}</span></p>
        <router-link to="/mercado" class="text-cyan-400 hover:text-cyan-300 text-sm">← Voltar ao Mercado</router-link>
      </div>
    </div>

    <div v-else class="space-y-5">
      <!-- Back + asset header -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-4">
        <router-link to="/mercado" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors shrink-0">
          <ArrowLeft :size="16" />
          Mercado
        </router-link>

        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <!-- Asset identity -->
            <div class="flex items-center gap-4">
              <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="xl" />
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-white">{{ asset.ticker }}</h1>
                  <span class="text-xs px-2 py-0.5 rounded-md" :class="getCategoryBadgeClass(asset.category)">{{ asset.category }}</span>
                </div>
                <p class="text-sm text-slate-400">{{ asset.fullName }}</p>
              </div>
            </div>

            <!-- Price + change -->
            <div class="sm:ml-auto text-left sm:text-right">
              <p class="text-2xl font-bold text-white">{{ formatCurrency(asset.price) }}</p>
              <div class="flex items-center gap-2 sm:justify-end mt-1">
                <span :class="['text-sm font-semibold', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ asset.changePercent >= 0 ? '+' : '' }}{{ formatCurrency(asset.change) }}
                </span>
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold',
                    asset.changePercent >= 0 ? 'badge-positive' : 'badge-negative',
                  ]"
                >
                  <TrendingUp v-if="asset.changePercent >= 0" :size="10" />
                  <TrendingDown v-else :size="10" />
                  {{ formatPercent(asset.changePercent) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <router-link
            :to="`/comparador?a=${asset.ticker}`"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 border border-[#1e3a5f] rounded-lg hover:text-white hover:border-slate-500 transition-colors"
          >
            <GitCompare :size="14" />
            Comparar
          </router-link>
          <button
            :class="[
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-md',
              isFavorite(asset.ticker)
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500'
            ]"
            @click="handleFavoriteToggle"
          >
            <Star :size="15" :class="isFavorite(asset.ticker) ? 'fill-amber-400' : 'fill-slate-950'" />
            {{ isFavorite(asset.ticker) ? 'Favorito' : 'Favoritar' }}
          </button>
        </div>
      </div>

      <!-- Chart card -->
      <div class="card p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 class="text-sm font-semibold text-white">Histórico de Preços</h2>
            <p class="text-xs text-slate-500">Dados demonstrativos — valores fictícios</p>
          </div>
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="p in periods"
              :key="p"
              :class="[
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                selectedPeriod === p
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5',
              ]"
              @click="changePeriod(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <PriceChart
          :labels="chartLabels"
          :datasets="chartDatasets"
          :height="300"
          :loading="chartLoading"
          :format-tooltip="formatTooltip"
        />
      </div>

      <!-- Indicators + info grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Key indicators -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-white mb-4">Informações do Ativo</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
              <span class="text-xs text-slate-500">Setor / Segmento</span>
              <span class="text-xs font-medium text-white">{{ asset.sector }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
              <span class="text-xs text-slate-500">Máx. 52 semanas</span>
              <span class="text-xs font-medium text-emerald-400">{{ formatCurrency(asset.high52w) }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
              <span class="text-xs text-slate-500">Mín. 52 semanas</span>
              <span class="text-xs font-medium text-red-400">{{ formatCurrency(asset.low52w) }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
              <span class="text-xs text-slate-500">Volume (Aprox.)</span>
              <span class="text-xs font-medium text-white">{{ asset.volume }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
              <span class="text-xs text-slate-500">Cap. de Mercado</span>
              <span class="text-xs font-medium text-white">R$ {{ asset.marketCap }}</span>
            </div>

            <!-- Indicators specific to category -->
            <template v-if="asset.category === 'Ação'">
              <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
                <span class="text-xs text-slate-500">P/L (Preço/Lucro)</span>
                <span class="text-xs font-medium text-white">{{ asset.pe }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
                <span class="text-xs text-slate-500">Dividend Yield</span>
                <span class="text-xs font-medium text-emerald-400">{{ asset.dy }}%</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-xs text-slate-500">P/VP</span>
                <span class="text-xs font-medium text-white">{{ asset.pvp }}</span>
              </div>
            </template>

            <template v-else-if="asset.category === 'FII'">
              <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
                <span class="text-xs text-slate-500">Dividend Yield</span>
                <span class="text-xs font-medium text-emerald-400">{{ asset.dy }}%</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-[#1e3a5f]/50">
                <span class="text-xs text-slate-500">P/VP</span>
                <span class="text-xs font-medium text-white">{{ asset.pvp }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-xs text-slate-500">Qtde de Cotas</span>
                <span class="text-xs font-medium text-white">{{ new Intl.NumberFormat('pt-BR').format(asset.cotas) }}</span>
              </div>
            </template>

            <template v-else-if="asset.category === 'ETF'">
              <div class="flex items-center justify-between py-2">
                <span class="text-xs text-slate-500">Taxa de Adm. (a.a.)</span>
                <span class="text-xs font-medium text-white">{{ asset.er }}%</span>
              </div>
            </template>

            <template v-else-if="asset.category === 'Cripto'">
              <div class="flex items-center justify-between py-2">
                <span class="text-xs text-slate-500">Oferta em Circulação</span>
                <span class="text-xs font-medium text-white">{{ asset.supply }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Description -->
        <div class="lg:col-span-2 card p-5">
          <h2 class="text-sm font-semibold text-white mb-3">Sobre o Ativo</h2>
          <p class="text-sm text-slate-400 leading-relaxed">{{ asset.description }}</p>

          <div class="mt-5 pt-4 border-t border-[#1e3a5f]">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Posição relativa (52 semanas)</h3>
            <div class="space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-slate-500">Mínimo: {{ formatCurrency(asset.low52w) }}</span>
                  <span class="text-xs text-slate-500">Máximo: {{ formatCurrency(asset.high52w) }}</span>
                </div>
                <div class="h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full"
                    :style="{ width: '100%' }"
                  ></div>
                </div>
                <div class="relative mt-1">
                  <div
                    class="absolute -translate-x-1/2 -translate-y-1"
                    :style="{ left: positionInRange + '%' }"
                  >
                    <div class="w-3 h-3 bg-white rounded-full border-2 border-cyan-400 shadow"></div>
                    <p class="text-xs text-cyan-400 font-medium whitespace-nowrap mt-1">
                      {{ formatCurrency(asset.price) }}
                    </p>
                  </div>
                </div>
                <p class="text-xs text-slate-600 mt-5">
                  Posição atual: {{ positionInRange.toFixed(0) }}% da faixa de 52 semanas
                </p>
              </div>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="mt-5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <p class="text-xs text-amber-400/80">
              ⚠️ Todos os dados exibidos são fictícios e gerados para fins de demonstração acadêmica. Não representam cotações, indicadores ou informações reais de nenhum ativo financeiro.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <Transition enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="toastMessage" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#0d1f38] border border-cyan-500/40 rounded-xl shadow-2xl transition-all duration-300">
          <div class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <p class="text-sm text-white">{{ toastMessage }}</p>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, TrendingUp, TrendingDown, GitCompare, Star } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PriceChart from '@/components/PriceChart.vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets } from '@/data/mockAssets'
import { getAssetHistory } from '@/data/mockMarketHistory'
import { formatCurrency, formatPercent, getCategoryBadgeClass } from '@/utils/formatters'
import { useFavorites } from '@/composables/useFavorites'

const route = useRoute()
const { isFavorite, toggleFavorite } = useFavorites()
const loading = ref(true)
const chartLoading = ref(false)
const asset = ref(null)
const selectedPeriod = ref('1M')
const periods = ['1D', '1W', '1M', '6M', '1Y']
const historyData = ref([])
const toastMessage = ref('')

function handleFavoriteToggle() {
  if (!asset.value) return
  const added = toggleFavorite(asset.value.ticker)
  if (added) {
    showToast(`${asset.value.ticker} adicionado aos favoritos!`)
  } else {
    showToast(`${asset.value.ticker} removido dos favoritos.`)
  }
}

let toastTimer = null
function showToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2600)
}

const chartLabels = computed(() => historyData.value.map(d => d.date))
const chartDatasets = computed(() => [{
  label: asset.value?.ticker || '',
  data: historyData.value.map(d => d.price),
  color: asset.value?.color || '#22d3ee',
}])

const positionInRange = computed(() => {
  if (!asset.value) return 50
  const range = asset.value.high52w - asset.value.low52w
  if (range === 0) return 50
  return Math.min(100, Math.max(0, ((asset.value.price - asset.value.low52w) / range) * 100))
})

function formatTooltip(context) {
  const val = context.parsed.y
  if (!asset.value) return val
  return ` ${asset.value.ticker}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}`
}

async function loadAsset() {
  loading.value = true
  await new Promise(r => setTimeout(r, 300))
  asset.value = mockAssets.find(a => a.ticker === route.params.ticker) || null
  loading.value = false
  if (asset.value) {
    await loadHistory()
  }
}

async function loadHistory() {
  chartLoading.value = true
  await new Promise(r => setTimeout(r, 300))
  historyData.value = getAssetHistory(route.params.ticker, selectedPeriod.value)
  chartLoading.value = false
}

async function changePeriod(period) {
  selectedPeriod.value = period
  await loadHistory()
}

onMounted(loadAsset)
watch(() => route.params.ticker, loadAsset)
</script>
