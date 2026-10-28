<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-white">Lista de Favoritos</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              RF04
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe seus investimentos, criptos e fundos preferidos com cotações e variações em tempo real.
          </p>
        </div>

        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/10 transition-all shrink-0 cursor-pointer"
          @click="openAddModal = true"
        >
          <Plus :size="16" />
          <span>Adicionar Favorito</span>
        </button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Favoritos -->
        <StatCard
          label="Total de Favoritos"
          :value="favoriteAssets.length.toString()"
          change="Ativos salvos"
          change-suffix="na lista"
          :icon="Star"
          icon-bg="bg-amber-500/10"
          icon-color="text-amber-400"
          accent
          accent-color="#f59e0b"
        />

        <!-- Maior Alta -->
        <StatCard
          label="Maior Alta (24h)"
          :value="topFavoriteGainer ? topFavoriteGainer.ticker : '—'"
          :change="topFavoriteGainer ? formatPercent(topFavoriteGainer.changePercent) : '—'"
          :change-suffix="topFavoriteGainer ? topFavoriteGainer.name : ''"
          :icon="TrendingUp"
          icon-bg="bg-emerald-500/10"
          icon-color="text-emerald-400"
        />

        <!-- Maior Baixa -->
        <StatCard
          label="Maior Baixa (24h)"
          :value="topFavoriteLoser ? topFavoriteLoser.ticker : '—'"
          :change="topFavoriteLoser ? formatPercent(topFavoriteLoser.changePercent) : '—'"
          :change-suffix="topFavoriteLoser ? topFavoriteLoser.name : ''"
          :icon="TrendingDown"
          icon-bg="bg-red-500/10"
          icon-color="text-red-400"
        />

        <!-- Variação Média -->
        <StatCard
          label="Variação Média"
          :value="averageChangePercent"
          change="Média ponderada"
          change-suffix="hoje"
          :icon="Activity"
          icon-bg="bg-cyan-500/10"
          icon-color="text-cyan-400"
        />
      </div>

      <!-- Filters & View Options -->
      <div class="card p-4 space-y-3">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar favorito por ticker ou nome..."
              class="w-full pl-9 pr-8 py-2 bg-[#050d1a] border border-[#1e3a5f] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              v-if="searchQuery"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              @click="searchQuery = ''"
            >
              <X :size="14" />
            </button>
          </div>

          <div class="flex items-center gap-2">
            <!-- View Mode Switch -->
            <div class="flex items-center p-1 bg-[#050d1a] border border-[#1e3a5f] rounded-lg">
              <button
                :class="[
                  'p-1.5 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
                ]"
                title="Visualização em Tabela"
                @click="viewMode = 'table'"
              >
                <LayoutList :size="16" />
              </button>
              <button
                :class="[
                  'p-1.5 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
                ]"
                title="Visualização em Grade"
                @click="viewMode = 'grid'"
              >
                <LayoutGrid :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedCategory === cat
                ? 'bg-cyan-500 text-white font-semibold'
                : 'bg-[#050d1a] text-slate-400 border border-[#1e3a5f] hover:text-white hover:border-slate-500'
            ]"
            @click="selectedCategory = cat"
          >
            {{ cat }}
            <span class="ml-1 opacity-70 text-[10px]">
              ({{ getCategoryCount(cat) }})
            </span>
          </button>
        </div>
      </div>

      <!-- Favorites List (Table View) -->
      <div v-if="viewMode === 'table'" class="card overflow-hidden">
        <div v-if="filteredFavorites.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-[#1e3a5f]">
                <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ativo</th>
                <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Preço Atual</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Variação (24h)</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Volume</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden xl:table-cell">52 Semanas</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="asset in filteredFavorites"
                :key="asset.id"
                class="border-b border-[#1e3a5f]/40 last:border-0 hover:bg-white/3 transition-colors"
              >
                <!-- Logo + Info -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="md" />
                    <div>
                      <router-link
                        :to="`/mercado/${asset.ticker}`"
                        class="text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
                      >
                        {{ asset.ticker }}
                      </router-link>
                      <p class="text-xs text-slate-400 truncate max-w-[160px] sm:max-w-xs">{{ asset.name }}</p>
                    </div>
                  </div>
                </td>

                <!-- Categoria -->
                <td class="px-4 py-4 text-center hidden sm:table-cell">
                  <span class="text-xs px-2 py-0.5 rounded-md" :class="getCategoryBadgeClass(asset.category)">
                    {{ asset.category }}
                  </span>
                </td>

                <!-- Preço -->
                <td class="px-4 py-4 text-right">
                  <p class="text-sm font-semibold text-white">{{ formatCurrency(asset.price) }}</p>
                </td>

                <!-- Variação -->
                <td class="px-4 py-4 text-right">
                  <div class="flex flex-col items-end gap-0.5">
                    <span :class="['text-sm font-semibold', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                      {{ formatPercent(asset.changePercent) }}
                    </span>
                    <span :class="['text-xs', asset.changePercent >= 0 ? 'text-emerald-400/60' : 'text-red-400/60']">
                      {{ asset.changePercent >= 0 ? '+' : '' }}{{ formatCurrency(asset.change) }}
                    </span>
                  </div>
                </td>

                <!-- Volume -->
                <td class="px-4 py-4 text-right text-sm text-slate-400 hidden lg:table-cell">
                  R$ {{ asset.volume }}
                </td>

                <!-- 52w Range -->
                <td class="px-4 py-4 text-right hidden xl:table-cell">
                  <div class="text-xs text-slate-400">
                    <span>{{ formatCurrency(asset.low52w) }}</span>
                    <span class="text-slate-600 mx-1">—</span>
                    <span>{{ formatCurrency(asset.high52w) }}</span>
                  </div>
                </td>

                <!-- Ações -->
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <router-link
                      :to="`/mercado/${asset.ticker}`"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Ver detalhes do ativo"
                    >
                      <Eye :size="16" />
                    </router-link>

                    <router-link
                      :to="`/comparador?a=${asset.ticker}`"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors hidden sm:inline-flex"
                      title="Comparar com outros ativos"
                    >
                      <GitCompare :size="16" />
                    </router-link>

                    <button
                      class="p-1.5 rounded-lg text-amber-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remover dos favoritos"
                      @click="handleRemoveFavorite(asset)"
                    >
                      <Star :size="16" class="fill-amber-400 hover:fill-transparent" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state inside table -->
        <div v-else class="py-12">
          <EmptyState
            :icon="Star"
            :title="favoriteAssets.length === 0 ? 'Nenhum ativo favorito ainda' : 'Nenhum ativo encontrado'"
            :message="
              favoriteAssets.length === 0
                ? 'Adicione seus investimentos favoritos (ações, criptos, fundos imobiliários e ETFs) para monitorar cotações e variações em tempo real.'
                : 'Nenhum favorito corresponde à busca ou categoria selecionada.'
            "
          >
            <div class="flex items-center gap-3 mt-2">
              <button
                v-if="favoriteAssets.length === 0"
                class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                @click="openAddModal = true"
              >
                Adicionar Primeiro Favorito
              </button>
              <button
                v-else
                class="px-4 py-2 bg-[#1e3a5f] hover:bg-[#284f80] text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                @click="clearFilters"
              >
                Limpar Filtros
              </button>
              <router-link
                to="/mercado"
                class="px-4 py-2 border border-[#1e3a5f] hover:border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Explorar Mercado
              </router-link>
            </div>
          </EmptyState>
        </div>
      </div>

      <!-- Favorites List (Grid View) -->
      <div v-else>
        <div v-if="filteredFavorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="asset in filteredFavorites"
            :key="asset.id"
            class="card p-4 hover:border-cyan-500/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-3">
                  <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="lg" />
                  <div>
                    <router-link
                      :to="`/mercado/${asset.ticker}`"
                      class="text-base font-bold text-white group-hover:text-cyan-400 transition-colors"
                    >
                      {{ asset.ticker }}
                    </router-link>
                    <p class="text-xs text-slate-400 truncate max-w-[150px]">{{ asset.name }}</p>
                  </div>
                </div>

                <button
                  class="p-1.5 rounded-lg text-amber-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remover dos favoritos"
                  @click="handleRemoveFavorite(asset)"
                >
                  <Star :size="18" class="fill-amber-400" />
                </button>
              </div>

              <div class="flex items-center justify-between py-2 border-y border-[#1e3a5f]/50 my-3">
                <div>
                  <span class="text-[11px] text-slate-500">Cotação Atual</span>
                  <p class="text-lg font-bold text-white">{{ formatCurrency(asset.price) }}</p>
                </div>
                <div class="text-right">
                  <span class="text-[11px] text-slate-500">Variação 24h</span>
                  <div class="flex items-center gap-1 justify-end">
                    <span :class="['text-sm font-semibold', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                      {{ formatPercent(asset.changePercent) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
                <div class="bg-[#050d1a] p-2 rounded-lg border border-[#1e3a5f]/40">
                  <span class="text-[10px] text-slate-500 block">Categoria</span>
                  <span class="font-medium text-slate-200">{{ asset.category }}</span>
                </div>
                <div class="bg-[#050d1a] p-2 rounded-lg border border-[#1e3a5f]/40">
                  <span class="text-[10px] text-slate-500 block">Volume</span>
                  <span class="font-medium text-slate-200">R$ {{ asset.volume }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-[#1e3a5f]/40">
              <router-link
                :to="`/mercado/${asset.ticker}`"
                class="flex-1 py-1.5 text-center text-xs font-semibold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors"
              >
                Ver Detalhes
              </router-link>
              <router-link
                :to="`/comparador?a=${asset.ticker}`"
                class="p-1.5 text-slate-400 hover:text-white border border-[#1e3a5f] hover:border-slate-500 rounded-lg transition-colors"
                title="Comparar"
              >
                <GitCompare :size="16" />
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="card p-12">
          <EmptyState
            :icon="Star"
            title="Nenhum favorito encontrado"
            message="Nenhum ativo corresponde à busca ou categoria selecionada."
          >
            <button
              class="mt-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#284f80] text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              @click="clearFilters"
            >
              Limpar Filtros
            </button>
          </EmptyState>
        </div>
      </div>

      <!-- Add Favorite Modal -->
      <div
        v-if="openAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="openAddModal = false"
      >
        <div class="card w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Star :size="16" class="fill-amber-400" />
              </div>
              <h2 class="text-base font-bold text-white">Adicionar aos Favoritos</h2>
            </div>
            <button
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              @click="openAddModal = false"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Modal search -->
          <div class="relative">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              v-model="modalSearch"
              type="text"
              placeholder="Pesquisar por ticker ou nome da empresa..."
              class="w-full pl-9 pr-4 py-2.5 bg-[#050d1a] border border-[#1e3a5f] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <!-- All Available Assets List -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
            <div
              v-for="asset in availableAssetsToAdd"
              :key="asset.id"
              class="flex items-center justify-between p-3 rounded-xl bg-[#050d1a] border border-[#1e3a5f]/60 hover:border-cyan-500/30 transition-all"
            >
              <div class="flex items-center gap-3 min-w-0">
                <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" />
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-white">{{ asset.ticker }}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded" :class="getCategoryBadgeClass(asset.category)">
                      {{ asset.category }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 truncate">{{ asset.name }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right">
                  <p class="text-xs font-semibold text-white">{{ formatCurrency(asset.price) }}</p>
                  <span :class="['text-[11px] font-medium', asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400']">
                    {{ formatPercent(asset.changePercent) }}
                  </span>
                </div>

                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                    isFavorite(asset.ticker)
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  ]"
                  @click="handleToggleInModal(asset)"
                >
                  <Star :size="12" :class="isFavorite(asset.ticker) ? 'fill-amber-400' : ''" />
                  <span>{{ isFavorite(asset.ticker) ? 'Favorito' : 'Adicionar' }}</span>
                </button>
              </div>
            </div>

            <div v-if="availableAssetsToAdd.length === 0" class="py-8 text-center text-sm text-slate-500">
              Nenhum ativo encontrado para "{{ modalSearch }}"
            </div>
          </div>

          <div class="pt-3 border-t border-[#1e3a5f] flex justify-end">
            <button
              class="px-4 py-2 bg-[#1e3a5f] hover:bg-[#284f80] text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              @click="openAddModal = false"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
      >
        <div
          v-if="toastMessage"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0d1f38] border border-cyan-500/40 text-white text-sm rounded-xl shadow-2xl shadow-cyan-900/40"
        >
          <div class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span>{{ toastMessage }}</span>
        </div>
      </transition>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets } from '@/data/mockAssets'
import { useFavorites } from '@/composables/useFavorites'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import {
  Star,
  Plus,
  Search,
  X,
  Eye,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Activity,
  LayoutList,
  LayoutGrid,
} from '@lucide/vue'

const { favoriteAssets, isFavorite, toggleFavorite, removeFavorite } = useFavorites()

const viewMode = ref('table') // 'table' | 'grid'
const searchQuery = ref('')
const selectedCategory = ref('Todos')
const openAddModal = ref(false)
const modalSearch = ref('')
const toastMessage = ref('')

const categories = ['Todos', 'Ação', 'FII', 'ETF', 'Cripto']

function getCategoryCount(cat) {
  if (cat === 'Todos') return favoriteAssets.value.length
  return favoriteAssets.value.filter(a => a.category === cat).length
}

const filteredFavorites = computed(() => {
  return favoriteAssets.value.filter(asset => {
    const matchCategory = selectedCategory.value === 'Todos' || asset.category === selectedCategory.value
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch = !q || asset.ticker.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })
})

const availableAssetsToAdd = computed(() => {
  const q = modalSearch.value.toLowerCase().trim()
  if (!q) return mockAssets
  return mockAssets.filter(a => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
})

const topFavoriteGainer = computed(() => {
  if (favoriteAssets.value.length === 0) return null
  const sorted = [...favoriteAssets.value].sort((a, b) => b.changePercent - a.changePercent)
  return sorted[0].changePercent > 0 ? sorted[0] : null
})

const topFavoriteLoser = computed(() => {
  if (favoriteAssets.value.length === 0) return null
  const sorted = [...favoriteAssets.value].sort((a, b) => a.changePercent - b.changePercent)
  return sorted[0].changePercent < 0 ? sorted[0] : null
})

const averageChangePercent = computed(() => {
  if (favoriteAssets.value.length === 0) return '0,00%'
  const sum = favoriteAssets.value.reduce((acc, a) => acc + (a.changePercent || 0), 0)
  const avg = sum / favoriteAssets.value.length
  return formatPercent(avg)
})

function handleRemoveFavorite(asset) {
  removeFavorite(asset.ticker)
  showToast(`${asset.ticker} removido dos favoritos.`)
}

function handleToggleInModal(asset) {
  const isNowFav = toggleFavorite(asset.ticker)
  if (isNowFav) {
    showToast(`${asset.ticker} adicionado aos favoritos!`)
  } else {
    showToast(`${asset.ticker} removido dos favoritos.`)
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'Todos'
}

let toastTimer = null
function showToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2600)
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Ação':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
    case 'FII':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    case 'ETF':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'Cripto':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  }
}
</script>
