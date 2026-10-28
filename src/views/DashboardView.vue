<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Top KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Favoritos Monitorados"
          :value="favoriteAssets.length + ' ativos'"
          :change="favoriteAssets.length > 0 ? averageFavoriteChange : '—'"
          change-suffix="variação média"
          :icon="Star"
          icon-bg="bg-amber-500/10"
          icon-color="text-amber-400"
          accent
          accent-color="#f59e0b"
        />
        <StatCard
          label="Ativos Acompanhados"
          value="12"
          change="Total disponível"
          change-suffix="no catálogo"
          :icon="BarChart2"
          icon-bg="bg-blue-500/10"
          icon-color="text-blue-400"
        />
        <StatCard
          label="Ibovespa no Mês"
          value="+4,82%"
          change="+5.890 pts"
          change-suffix="acumulado no mês"
          :icon="TrendingUp"
          icon-bg="bg-emerald-500/10"
          icon-color="text-emerald-400"
        />
        <StatCard
          label="Ibovespa Hoje"
          value="128.342 pts"
          change="+0,81%"
          change-suffix="hoje"
          :icon="Activity"
          icon-bg="bg-purple-500/10"
          icon-color="text-purple-400"
        />
      </div>

      <!-- Main content grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Ibovespa evolution chart -->
        <div class="xl:col-span-2 card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-semibold text-white">Evolução do Mercado — Índice Ibovespa</h2>
                <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">B3 (IBOV)</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Histórico de pontuação do principal indicador financeiro do Brasil</p>
            </div>
            <div class="flex gap-1">
              <button
                v-for="p in evolutionPeriods"
                :key="p"
                :class="[
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer',
                  evolutionPeriod === p
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5',
                ]"
                @click="setEvolutionPeriod(p)"
              >
                {{ p }}
              </button>
            </div>
          </div>
          <PriceChart
            :labels="evolutionLabels"
            :datasets="evolutionDatasets"
            :height="240"
            :loading="chartLoading"
            :format-tooltip="formatIbovespaTooltip"
          />
        </div>

        <!-- Top movers panel -->
        <div class="card p-5">
          <h2 class="text-sm font-semibold text-white mb-4">Destaques do Dia</h2>

          <!-- Gainers -->
          <div class="mb-4">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Maiores Altas</p>
            <div class="space-y-2">
              <router-link
                v-for="asset in topGainers"
                :key="asset.id"
                :to="`/mercado/${asset.ticker}`"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ asset.ticker }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ asset.name }}</p>
                </div>
                <span class="text-xs font-semibold text-emerald-400 shrink-0">
                  {{ formatPercent(asset.changePercent) }}
                </span>
              </router-link>
            </div>
          </div>

          <!-- Losers -->
          <div>
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Maiores Baixas</p>
            <div class="space-y-2">
              <router-link
                v-for="asset in topLosers"
                :key="asset.id"
                :to="`/mercado/${asset.ticker}`"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ asset.ticker }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ asset.name }}</p>
                </div>
                <span class="text-xs font-semibold text-red-400 shrink-0">
                  {{ formatPercent(asset.changePercent) }}
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom section -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Featured assets table -->
        <div class="xl:col-span-2 card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-[#1e3a5f]">
            <h2 class="text-sm font-semibold text-white">Ativos em Destaque</h2>
            <router-link to="/mercado" class="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight :size="12" />
            </router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#1e3a5f]">
                  <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ativo</th>
                  <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                  <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Preço</th>
                  <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Variação</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="asset in featuredAssets"
                  :key="asset.id"
                  class="border-b border-[#1e3a5f]/50 last:border-0 hover:bg-white/3 transition-colors cursor-pointer"
                  @click="$router.push(`/mercado/${asset.ticker}`)"
                >
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" />
                      <div>
                        <p class="text-sm font-semibold text-white">{{ asset.ticker }}</p>
                        <p class="text-xs text-slate-500">{{ asset.name }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right hidden sm:table-cell">
                    <span class="text-xs px-2 py-0.5 rounded-md" :class="getCategoryBadgeClass(asset.category)">
                      {{ asset.category }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <span class="text-sm font-medium text-white">{{ formatCurrency(asset.price) }}</span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <TrendingUp v-if="asset.changePercent > 0" :size="12" class="text-emerald-400" />
                      <TrendingDown v-else :size="12" class="text-red-400" />
                      <span :class="['text-sm font-semibold', asset.changePercent > 0 ? 'text-emerald-400' : 'text-red-400']">
                        {{ formatPercent(asset.changePercent) }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Meus Favoritos Card -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Star :size="16" class="text-amber-400 fill-amber-400" />
              <h2 class="text-sm font-semibold text-white">Meus Favoritos</h2>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              {{ favoriteAssets.length }} salvos
            </span>
          </div>

          <div v-if="favoriteAssets.length > 0" class="space-y-2.5">
            <router-link
              v-for="asset in favoriteAssets.slice(0, 5)"
              :key="asset.id"
              :to="`/mercado/${asset.ticker}`"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                  {{ asset.ticker }}
                </p>
                <p class="text-xs text-slate-500 truncate">{{ asset.name }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-semibold text-white">{{ formatCurrency(asset.price) }}</p>
                <span :class="['text-[11px] font-semibold', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ formatPercent(asset.changePercent) }}
                </span>
              </div>
            </router-link>
          </div>

          <div v-else class="text-center py-6 text-slate-500 text-xs">
            Nenhum ativo favoritado ainda.
          </div>

          <router-link
            to="/favoritos"
            class="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-xs text-cyan-400 hover:text-cyan-300 border border-[#1e3a5f] hover:border-cyan-500/30 rounded-lg transition-colors font-medium"
          >
            Ver todos os favoritos <ArrowRight :size="12" />
          </router-link>
        </div>
      </div>

      <!-- Market overview: ações + cripto -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Ações brasileiras -->
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
              <Building2 :size="14" class="text-cyan-400" />
            </div>
            <h2 class="text-sm font-semibold text-white">Ações Brasileiras</h2>
          </div>
          <div class="space-y-2.5">
            <router-link
              v-for="asset in stockAssets"
              :key="asset.id"
              :to="`/mercado/${asset.ticker}`"
              class="flex items-center gap-3 py-1.5 hover:bg-white/3 rounded-lg px-1 -mx-1 transition-colors"
            >
              <div class="flex items-center gap-2 w-20 shrink-0">
                <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="xs" rounded="md" />
                <span class="text-sm font-semibold text-slate-300">{{ asset.ticker }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="h-1 rounded-full bg-[#1e3a5f] overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="asset.changePercent >= 0 ? 'bg-emerald-400' : 'bg-red-400'"
                    :style="{ width: Math.min(Math.abs(asset.changePercent) * 15, 100) + '%' }"
                  ></div>
                </div>
              </div>
              <span class="text-sm font-medium text-white shrink-0 w-20 text-right">{{ formatCurrency(asset.price) }}</span>
              <span :class="['text-xs font-semibold w-14 text-right shrink-0', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                {{ formatPercent(asset.changePercent) }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Criptomoedas -->
        <div class="card p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Bitcoin :size="14" class="text-amber-400" />
            </div>
            <h2 class="text-sm font-semibold text-white">Criptomoedas</h2>
          </div>
          <div class="space-y-2.5">
            <router-link
              v-for="asset in cryptoAssets"
              :key="asset.id"
              :to="`/mercado/${asset.ticker}`"
              class="flex items-center gap-3 py-1.5 hover:bg-white/3 rounded-lg px-1 -mx-1 transition-colors"
            >
              <div class="flex items-center gap-2 w-20 shrink-0">
                <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="xs" rounded="md" />
                <span class="text-sm font-semibold text-amber-400">{{ asset.ticker }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="h-1 rounded-full bg-[#1e3a5f] overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :class="asset.changePercent >= 0 ? 'bg-amber-400' : 'bg-red-400'"
                    :style="{ width: Math.min(Math.abs(asset.changePercent) * 15, 100) + '%' }"
                  ></div>
                </div>
              </div>
              <span class="text-sm font-medium text-white shrink-0 w-28 text-right">{{ formatCurrency(asset.price) }}</span>
              <span :class="['text-xs font-semibold w-14 text-right shrink-0', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                {{ formatPercent(asset.changePercent) }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Wallet, BarChart2, TrendingUp, TrendingDown, Activity,
  ArrowRight, ArrowUpRight, ArrowDownRight, Building2, Bitcoin, Star,
} from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import PriceChart from '@/components/PriceChart.vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets, topGainers, topLosers } from '@/data/mockAssets'
import { getIbovespaHistory } from '@/data/mockMarketHistory'
import { formatCurrency, formatPercent, getCategoryBadgeClass } from '@/utils/formatters'
import { useFavorites } from '@/composables/useFavorites'

const { favoriteAssets } = useFavorites()

const averageFavoriteChange = computed(() => {
  if (favoriteAssets.value.length === 0) return '0,00%'
  const sum = favoriteAssets.value.reduce((acc, a) => acc + (a.changePercent || 0), 0)
  const avg = sum / favoriteAssets.value.length
  return formatPercent(avg)
})

// Ibovespa Chart
const chartLoading = ref(false)
const evolutionPeriod = ref('1M')
const evolutionPeriods = ['1M', '3M', '6M', '1Y']
const evolutionData = ref([])

// Assets splits
const featuredAssets = computed(() => mockAssets.slice(0, 6))
const stockAssets = computed(() => mockAssets.filter(a => a.category === 'Ação'))
const cryptoAssets = computed(() => mockAssets.filter(a => a.category === 'Cripto'))

// Evolution chart
const evolutionLabels = computed(() => evolutionData.value.map(d => d.date))
const evolutionDatasets = computed(() => [{
  label: 'Ibovespa (IBOV)',
  data: evolutionData.value.map(d => d.value),
  color: '#22d3ee',
  fill: true,
}])

function formatIbovespaTooltip(context) {
  const val = context.parsed.y
  return ` Ibovespa: ${Math.round(val).toLocaleString('pt-BR')} pts`
}

async function setEvolutionPeriod(period) {
  evolutionPeriod.value = period
  chartLoading.value = true
  await new Promise(r => setTimeout(r, 300))
  const dayMap = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
  evolutionData.value = getIbovespaHistory(dayMap[period])
  chartLoading.value = false
}

onMounted(async () => {
  await setEvolutionPeriod('1M')
})
</script>
