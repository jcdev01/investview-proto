<template>
  <DashboardLayout>
    <div class="space-y-5">
      <!-- Portfolio KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Valor Total Estimado"
          :value="formatCurrency(totalValue)"
          :change="formatPercent(totalResultPct)"
          change-suffix="resultado"
          :icon="Wallet"
          icon-bg="bg-cyan-500/10"
          icon-color="text-cyan-400"
          accent
          accent-color="#22d3ee"
        />
        <StatCard
          label="Total Investido"
          :value="formatCurrency(totalInvested)"
          :icon="DollarSign"
          icon-bg="bg-blue-500/10"
          icon-color="text-blue-400"
        />
        <StatCard
          label="Resultado Financeiro"
          :value="formatCurrency(totalResult)"
          :change="formatPercent(totalResultPct)"
          :icon="totalResult >= 0 ? TrendingUp : TrendingDown"
          :icon-bg="totalResult >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'"
          :icon-color="totalResult >= 0 ? 'text-emerald-400' : 'text-red-400'"
        />
        <StatCard
          label="Ativos na Carteira"
          :value="String(portfolio.length)"
          :icon="PieChart"
          icon-bg="bg-purple-500/10"
          icon-color="text-purple-400"
        />
      </div>

      <!-- Main grid: table + allocation chart -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <!-- Portfolio table -->
        <div class="xl:col-span-2 card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-[#1e3a5f]">
            <h2 class="text-sm font-semibold text-white">Meus Ativos</h2>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors"
              @click="openAddModal()"
            >
              <Plus :size="14" />
              Adicionar Ativo
            </button>
          </div>

          <div v-if="portfolio.length === 0">
            <EmptyState
              title="Carteira vazia"
              message="Adicione ativos à sua carteira para acompanhar seu patrimônio e resultados."
              action-label="Adicionar primeiro ativo"
              @action="openAddModal()"
            />
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#1e3a5f]">
                  <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ativo</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Qtde</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Preço Médio</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Atual</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result.</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in portfolioWithCalc"
                  :key="item.id"
                  class="border-b border-[#1e3a5f]/40 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <AssetLogo :ticker="item.ticker" size="sm" />
                      <div>
                        <p class="text-sm font-semibold text-white">{{ item.ticker }}</p>
                        <span class="text-xs px-1.5 py-0.5 rounded" :class="getCategoryBadgeClass(item.category)">{{ item.category }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-right text-sm text-slate-300 hidden sm:table-cell">
                    {{ formatNumber(item.quantity, item.category === 'Cripto' ? 4 : 0) }}
                  </td>
                  <td class="px-4 py-4 text-right text-sm text-slate-400 hidden md:table-cell">
                    {{ formatCurrency(item.avgPrice) }}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <p class="text-sm font-semibold text-white">{{ formatCurrency(item.currentValue) }}</p>
                    <p class="text-xs text-slate-500">{{ formatCurrency(item.currentPrice) }}/un.</p>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <p :class="['text-sm font-semibold', item.resultPct >= 0 ? 'text-emerald-400' : 'text-red-400']">
                      {{ formatPercent(item.resultPct) }}
                    </p>
                    <p :class="['text-xs', item.result >= 0 ? 'text-emerald-400/60' : 'text-red-400/60']">
                      {{ item.result >= 0 ? '+' : '' }}{{ formatCurrency(item.result) }}
                    </p>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <router-link
                        :to="`/mercado/${item.ticker}`"
                        class="p-1.5 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="Ver detalhes"
                      >
                        <ExternalLink :size="14" />
                      </router-link>
                      <button
                        class="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover da carteira"
                        @click="removeAsset(item.id)"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Allocation chart -->
        <div class="flex flex-col gap-4">
          <div class="card p-5">
            <h2 class="text-sm font-semibold text-white mb-4">Distribuição por Categoria</h2>
            <PortfolioAllocationChart :data="allocationChartData" :height="200" />

            <div class="mt-4 space-y-2">
              <div
                v-for="item in allocationByCategory"
                :key="item.category"
                class="flex items-center gap-2"
              >
                <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></div>
                <span class="text-xs text-slate-400 flex-1">{{ item.category }}</span>
                <span class="text-xs font-medium text-white">{{ item.pct.toFixed(1) }}%</span>
              </div>
            </div>

            <div v-if="portfolio.length === 0" class="text-center py-4">
              <p class="text-sm text-slate-600">Sem dados para exibir</p>
            </div>
          </div>

          <!-- Portfolio summary card -->
          <div class="card p-5">
            <h2 class="text-sm font-semibold text-white mb-3">Resumo</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-xs text-slate-500">Total investido</span>
                <span class="text-xs font-medium text-white">{{ formatCurrency(totalInvested) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-slate-500">Valor atual</span>
                <span class="text-xs font-medium text-white">{{ formatCurrency(totalValue) }}</span>
              </div>
              <div class="border-t border-[#1e3a5f] pt-3 flex justify-between">
                <span class="text-xs text-slate-500">Resultado</span>
                <span :class="['text-xs font-semibold', totalResult >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ totalResult >= 0 ? '+' : '' }}{{ formatCurrency(totalResult) }} ({{ formatPercent(totalResultPct) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add asset modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-[#0d1f38] border border-[#1e3a5f] rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-white">Adicionar Ativo à Carteira</h2>
            <button @click="closeModal" class="text-slate-500 hover:text-white transition-colors"><X :size="18" /></button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Ativo *</label>
              <div class="relative">
                <input
                  v-model="assetSearch"
                  type="text"
                  placeholder="Buscar ativo por ticker ou nome..."
                  class="w-full bg-[#050d1a] border border-[#1e3a5f] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                  @input="showAssetDropdown = true"
                />
                <div v-if="showAssetDropdown && assetSuggestions.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-[#112342] border border-[#1e3a5f] rounded-lg overflow-hidden z-10 shadow-xl max-h-48 overflow-y-auto">
                  <button
                    v-for="a in assetSuggestions"
                    :key="a.id"
                    class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-left transition-colors"
                    @click="selectAsset(a)"
                  >
                    <div class="text-xs font-bold text-cyan-400 w-14 shrink-0">{{ a.ticker }}</div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-white truncate">{{ a.name }}</p>
                    </div>
                    <span class="text-xs px-1.5 py-0.5 rounded shrink-0" :class="getCategoryBadgeClass(a.category)">{{ a.category }}</span>
                  </button>
                </div>
              </div>
              <p v-if="formErrors.asset" class="text-xs text-red-400 mt-1">{{ formErrors.asset }}</p>
            </div>

            <div v-if="addForm.selectedAsset" class="flex items-center gap-3 p-3 bg-[#050d1a] rounded-xl border border-[#1e3a5f]">
              <AssetLogo :ticker="addForm.selectedAsset.ticker" size="sm" />
              <div>
                <p class="text-sm font-semibold text-white">{{ addForm.selectedAsset.ticker }}</p>
                <p class="text-xs text-slate-500">Preço atual: {{ formatCurrency(addForm.selectedAsset.price) }}</p>
              </div>
              <button class="ml-auto text-slate-500 hover:text-red-400" @click="clearSelectedAsset"><X :size="14" /></button>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Quantidade *</label>
              <input
                v-model.number="addForm.quantity"
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder="Ex: 100"
                :class="['w-full bg-[#050d1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all', formErrors.quantity ? 'border-red-500/50' : 'border-[#1e3a5f] focus:border-cyan-500/50']"
              />
              <p v-if="formErrors.quantity" class="text-xs text-red-400 mt-1">{{ formErrors.quantity }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Preço de Aquisição (R$) *</label>
              <input
                v-model.number="addForm.avgPrice"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex: 37,50"
                :class="['w-full bg-[#050d1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all', formErrors.avgPrice ? 'border-red-500/50' : 'border-[#1e3a5f] focus:border-cyan-500/50']"
              />
              <p v-if="formErrors.avgPrice" class="text-xs text-red-400 mt-1">{{ formErrors.avgPrice }}</p>
            </div>

            <div v-if="addForm.quantity && addForm.avgPrice" class="flex items-center justify-between p-3 bg-[#050d1a] rounded-xl border border-[#1e3a5f]">
              <span class="text-xs text-slate-500">Total investido:</span>
              <span class="text-sm font-semibold text-white">{{ formatCurrency(addForm.quantity * addForm.avgPrice) }}</span>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button class="flex-1 py-2.5 text-sm font-medium text-slate-400 border border-[#1e3a5f] rounded-xl hover:text-white transition-colors" @click="closeModal">Cancelar</button>
            <button class="flex-1 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors" @click="confirmAdd">Adicionar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm remove modal -->
    <Teleport to="body">
      <div v-if="confirmRemoveId" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-[#0d1f38] border border-[#1e3a5f] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
          <div class="flex items-start gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 :size="18" class="text-red-400" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-white">Remover ativo</h2>
              <p class="text-sm text-slate-500 mt-1">Deseja remover este ativo da sua carteira? Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="flex-1 py-2.5 text-sm font-medium text-slate-400 border border-[#1e3a5f] rounded-xl hover:text-white transition-colors" @click="confirmRemoveId = null">Cancelar</button>
            <button class="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors" @click="confirmRemove">Remover</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="toastMessage" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#0d1f38] border border-emerald-500/30 rounded-xl shadow-2xl transition-all duration-300">
          <CheckCircle :size="16" class="text-emerald-400 shrink-0" />
          <p class="text-sm text-white">{{ toastMessage }}</p>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Wallet, DollarSign, TrendingUp, TrendingDown, PieChart,
  Plus, X, Trash2, ExternalLink, CheckCircle,
} from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import PortfolioAllocationChart from '@/components/PortfolioAllocationChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets } from '@/data/mockAssets'
import { defaultPortfolioAssets } from '@/data/mockPortfolio'
import { formatCurrency, formatPercent, formatNumber, getCategoryBadgeClass } from '@/utils/formatters'

const portfolio = ref([])
const toastMessage = ref('')
const confirmRemoveId = ref(null)

// Computed portfolio metrics
const portfolioWithCalc = computed(() =>
  portfolio.value.map(item => {
    const currentValue = item.quantity * item.currentPrice
    const invested = item.quantity * item.avgPrice
    const result = currentValue - invested
    const resultPct = invested > 0 ? (result / invested) * 100 : 0
    return { ...item, currentValue, invested, result, resultPct }
  })
)

const totalValue = computed(() => portfolioWithCalc.value.reduce((s, i) => s + i.currentValue, 0))
const totalInvested = computed(() => portfolioWithCalc.value.reduce((s, i) => s + i.invested, 0))
const totalResult = computed(() => totalValue.value - totalInvested.value)
const totalResultPct = computed(() => totalInvested.value > 0 ? (totalResult.value / totalInvested.value) * 100 : 0)

// Allocation chart
const categoryColors = { 'Ação': '#22d3ee', 'FII': '#8b5cf6', 'ETF': '#34d399', 'Cripto': '#f59e0b' }
const allocationByCategory = computed(() => {
  const map = {}
  portfolioWithCalc.value.forEach(item => {
    if (!map[item.category]) map[item.category] = 0
    map[item.category] += item.currentValue
  })
  const total = totalValue.value || 1
  return Object.entries(map).map(([category, value]) => ({
    category,
    value,
    pct: (value / total) * 100,
    color: categoryColors[category] || '#64748b',
  }))
})

const allocationChartData = computed(() =>
  allocationByCategory.value.map(a => ({ label: a.category, value: a.value, color: a.color }))
)

// Asset icon style
function getAssetStyle(ticker) {
  const asset = mockAssets.find(a => a.ticker === ticker)
  const color = asset?.color || '#64748b'
  return { backgroundColor: color + '15', borderColor: color + '30', color }
}

// Load/save portfolio
function loadPortfolio() {
  try {
    const saved = localStorage.getItem('investview_portfolio')
    if (saved) {
      portfolio.value = JSON.parse(saved)
    } else {
      portfolio.value = defaultPortfolioAssets.map(a => ({ ...a }))
      savePortfolio()
    }
  } catch {
    portfolio.value = defaultPortfolioAssets.map(a => ({ ...a }))
  }
}

function savePortfolio() {
  localStorage.setItem('investview_portfolio', JSON.stringify(portfolio.value))
}

// Remove
function removeAsset(id) {
  confirmRemoveId.value = id
}

function confirmRemove() {
  portfolio.value = portfolio.value.filter(a => a.id !== confirmRemoveId.value)
  savePortfolio()
  confirmRemoveId.value = null
  showToast('Ativo removido da carteira.')
}

// Add modal
const showModal = ref(false)
const assetSearch = ref('')
const showAssetDropdown = ref(false)
const addForm = ref({ selectedAsset: null, quantity: null, avgPrice: null })
const formErrors = ref({})

const assetSuggestions = computed(() => {
  if (!assetSearch.value) return mockAssets.slice(0, 8)
  const q = assetSearch.value.toLowerCase()
  return mockAssets.filter(a => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)).slice(0, 8)
})

function openAddModal() {
  assetSearch.value = ''
  addForm.value = { selectedAsset: null, quantity: null, avgPrice: null }
  formErrors.value = {}
  showModal.value = true
  setTimeout(() => { showAssetDropdown.value = true }, 100)
}

function closeModal() {
  showModal.value = false
  showAssetDropdown.value = false
}

function selectAsset(asset) {
  addForm.value.selectedAsset = asset
  addForm.value.avgPrice = asset.price
  assetSearch.value = `${asset.ticker} — ${asset.name}`
  showAssetDropdown.value = false
}

function clearSelectedAsset() {
  addForm.value.selectedAsset = null
  assetSearch.value = ''
}

function confirmAdd() {
  formErrors.value = {}
  if (!addForm.value.selectedAsset) formErrors.value.asset = 'Selecione um ativo.'
  if (!addForm.value.quantity || addForm.value.quantity <= 0) formErrors.value.quantity = 'Quantidade inválida.'
  if (!addForm.value.avgPrice || addForm.value.avgPrice <= 0) formErrors.value.avgPrice = 'Preço inválido.'
  if (Object.keys(formErrors.value).length > 0) return

  const asset = addForm.value.selectedAsset
  const existing = portfolio.value.find(a => a.id === asset.id)
  if (existing) {
    const totalQty = existing.quantity + addForm.value.quantity
    existing.avgPrice = (existing.quantity * existing.avgPrice + addForm.value.quantity * addForm.value.avgPrice) / totalQty
    existing.quantity = totalQty
  } else {
    portfolio.value.push({
      id: asset.id, ticker: asset.ticker, name: asset.name, category: asset.category,
      quantity: addForm.value.quantity, avgPrice: addForm.value.avgPrice, currentPrice: asset.price,
    })
  }
  savePortfolio()
  closeModal()
  showToast(`${asset.ticker} adicionado à carteira com sucesso!`)
}

function showToast(msg) {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3500)
}

onMounted(loadPortfolio)
</script>
