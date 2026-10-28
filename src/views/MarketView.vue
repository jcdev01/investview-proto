<template>
  <DashboardLayout>
    <div class="space-y-5">
      <!-- Header + filters bar -->
      <div class="card p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Search -->
          <div class="relative flex-1">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nome ou ticker..."
              class="w-full bg-[#050d1a] border border-[#1e3a5f] rounded-lg pl-8 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
            <button
              v-if="searchQuery"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              @click="searchQuery = ''"
            >
              <X :size="14" />
            </button>
          </div>

          <!-- Category filters -->
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="cat in categories"
              :key="cat.value"
              :class="[
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                selectedCategory === cat.value
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'text-slate-400 border-[#1e3a5f] hover:text-white hover:border-slate-500',
              ]"
              @click="setCategory(cat.value)"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Sort -->
          <select
            v-model="sortBy"
            class="bg-[#050d1a] border border-[#1e3a5f] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="default">Ordenar por</option>
            <option value="price_asc">Preço ↑</option>
            <option value="price_desc">Preço ↓</option>
            <option value="change_asc">Variação ↑</option>
            <option value="change_desc">Variação ↓</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>

        <!-- Active filters summary -->
        <div v-if="searchQuery || selectedCategory !== 'all'" class="flex items-center gap-2 mt-3 flex-wrap">
          <span class="text-xs text-slate-500">Filtros ativos:</span>
          <span
            v-if="searchQuery"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400"
          >
            "{{ searchQuery }}" <button @click="searchQuery = ''" class="hover:text-white"><X :size="10" /></button>
          </span>
          <span
            v-if="selectedCategory !== 'all'"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400"
          >
            {{ selectedCategory }} <button @click="selectedCategory = 'all'" class="hover:text-white"><X :size="10" /></button>
          </span>
          <span class="text-xs text-slate-600">{{ filteredAssets.length }} resultado(s)</span>
        </div>
      </div>

      <!-- Assets table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full" v-if="filteredAssets.length > 0">
            <thead>
              <tr class="border-b border-[#1e3a5f]">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ativo</th>
                <th class="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                <th class="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors" @click="toggleSort('price')">
                  <span class="flex items-center justify-end gap-1">Preço <ArrowUpDown :size="12" /></span>
                </th>
                <th class="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors hidden md:table-cell" @click="toggleSort('change')">
                  <span class="flex items-center justify-end gap-1">Variação <ArrowUpDown :size="12" /></span>
                </th>
                <th class="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Volume</th>
                <th class="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="asset in filteredAssets"
                :key="asset.id"
                class="border-b border-[#1e3a5f]/40 last:border-0 hover:bg-white/3 transition-colors"
              >
                <!-- Ativo -->
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
                      <p class="text-xs text-slate-500 truncate max-w-[140px]">{{ asset.name }}</p>
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
                <td class="px-4 py-4 text-right hidden md:table-cell">
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
                <td class="px-4 py-4 text-right text-sm text-slate-500 hidden lg:table-cell">
                  {{ asset.volume }}
                </td>

                <!-- Ações -->
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <router-link
                      :to="`/mercado/${asset.ticker}`"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#112342] border border-[#1e3a5f] text-slate-300 hover:text-white hover:border-cyan-500/30 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye :size="12" />
                      <span class="hidden sm:inline">Detalhes</span>
                    </router-link>
                    <button
                      :class="[
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer',
                        isFavorite(asset.ticker)
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                          : 'bg-[#112342] border-[#1e3a5f] text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                      ]"
                      :title="isFavorite(asset.ticker) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                      @click="handleFavoriteToggle(asset)"
                    >
                      <Star :size="12" :class="isFavorite(asset.ticker) ? 'fill-amber-400' : ''" />
                      <span class="hidden sm:inline">{{ isFavorite(asset.ticker) ? 'Favorito' : 'Favoritar' }}</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <EmptyState
            v-else
            title="Nenhum ativo encontrado"
            message="Não encontramos ativos com os filtros aplicados. Tente buscar por outro nome ou ticker."
            action-label="Limpar filtros"
            @action="clearFilters"
          />
        </div>
      </div>
    </div>

    <!-- Favorite / Info modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
        <div class="bg-[#0d1f38] border border-[#1e3a5f] rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-white">Gerenciar Favorito</h2>
            <button @click="showModal = false" class="text-slate-500 hover:text-white transition-colors cursor-pointer">
              <X :size="18" />
            </button>
          </div>

          <div class="flex items-center gap-3 p-3 bg-[#050d1a] rounded-xl border border-[#1e3a5f] mb-5">
            <AssetLogo :ticker="selectedAsset?.ticker" :logo="selectedAsset?.logo" :name="selectedAsset?.name" size="lg" />
            <div>
              <p class="text-sm font-semibold text-white">{{ selectedAsset?.ticker }}</p>
              <p class="text-xs text-slate-500">{{ selectedAsset?.name }}</p>
            </div>
            <div class="ml-auto text-right">
              <p class="text-sm font-semibold text-white">{{ formatCurrency(selectedAsset?.price) }}</p>
              <span class="text-xs font-medium" :class="selectedAsset?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'">
                {{ formatPercent(selectedAsset?.changePercent) }}
              </span>
            </div>
          </div>

          <div class="p-4 bg-[#050d1a] rounded-xl border border-[#1e3a5f] space-y-2 text-xs text-slate-300">
            <div class="flex justify-between">
              <span class="text-slate-500">Categoria:</span>
              <span class="font-medium text-white">{{ selectedAsset?.category }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Volume:</span>
              <span class="font-medium text-white">R$ {{ selectedAsset?.volume }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Faixa 52 semanas:</span>
              <span class="font-medium text-white">{{ formatCurrency(selectedAsset?.low52w) }} - {{ formatCurrency(selectedAsset?.high52w) }}</span>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button class="flex-1 py-2.5 text-sm font-medium text-slate-400 border border-[#1e3a5f] rounded-xl hover:text-white hover:border-slate-500 transition-colors cursor-pointer" @click="showModal = false">
              Fechar
            </button>
            <button
              :class="[
                'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer',
                isFavorite(selectedAsset?.ticker)
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold'
              ]"
              @click="toggleFavoriteFromModal"
            >
              <Star :size="16" :class="isFavorite(selectedAsset?.ticker) ? 'fill-red-400' : 'fill-slate-950'" />
              <span>{{ isFavorite(selectedAsset?.ticker) ? 'Remover Favorito' : 'Favoritar Ativo' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast notification -->
    <Teleport to="body">
      <Transition enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div
          v-if="toastMessage"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#0d1f38] border border-cyan-500/40 rounded-xl shadow-2xl transition-all duration-300"
        >
          <div class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <p class="text-sm text-white">{{ toastMessage }}</p>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, X, ArrowUpDown, Eye, Star } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets } from '@/data/mockAssets'
import { formatCurrency, formatPercent, getCategoryBadgeClass } from '@/utils/formatters'
import { useFavorites } from '@/composables/useFavorites'

const { isFavorite, toggleFavorite } = useFavorites()

// Filters
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('default')

const categories = [
  { label: 'Todos', value: 'all' },
  { label: 'Ações', value: 'Ação' },
  { label: 'FIIs', value: 'FII' },
  { label: 'ETFs', value: 'ETF' },
  { label: 'Cripto', value: 'Cripto' },
]

const filteredAssets = computed(() => {
  let result = [...mockAssets]

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.ticker.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.fullName && a.fullName.toLowerCase().includes(q))
    )
  }

  // Category filter
  if (selectedCategory.value !== 'all') {
    result = result.filter(a => a.category === selectedCategory.value)
  }

  // Sort
  switch (sortBy.value) {
    case 'price_asc': result.sort((a, b) => a.price - b.price); break
    case 'price_desc': result.sort((a, b) => b.price - a.price); break
    case 'change_asc': result.sort((a, b) => a.changePercent - b.changePercent); break
    case 'change_desc': result.sort((a, b) => b.changePercent - a.changePercent); break
    case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break
  }

  return result
})

function setCategory(cat) {
  selectedCategory.value = cat
}

function toggleSort(field) {
  if (field === 'price') {
    sortBy.value = sortBy.value === 'price_desc' ? 'price_asc' : 'price_desc'
  } else {
    sortBy.value = sortBy.value === 'change_desc' ? 'change_asc' : 'change_desc'
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'default'
}

// Modal & Favorite management
const showModal = ref(false)
const selectedAsset = ref(null)
const toastMessage = ref('')

function handleFavoriteToggle(asset) {
  const added = toggleFavorite(asset.ticker)
  if (added) {
    showToast(`${asset.ticker} adicionado aos favoritos!`)
  } else {
    showToast(`${asset.ticker} removido dos favoritos.`)
  }
}

function toggleFavoriteFromModal() {
  if (!selectedAsset.value) return
  handleFavoriteToggle(selectedAsset.value)
  showModal.value = false
}

let toastTimer = null
function showToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2600)
}
</script>
