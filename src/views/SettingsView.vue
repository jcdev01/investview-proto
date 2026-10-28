<template>
  <DashboardLayout>
    <div class="max-w-2xl space-y-6">
      <!-- Appearance -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Palette :size="16" class="text-cyan-400" />
          Aparência
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-300">Tema</p>
              <p class="text-xs text-slate-500">O InvestView utiliza tema escuro por padrão</p>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050d1a] border border-[#1e3a5f] text-xs text-slate-400">
              <Moon :size="12" class="text-cyan-400" />
              Escuro
            </div>
          </div>
        </div>
      </div>

      <!-- Demo data -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Database :size="16" class="text-cyan-400" />
          Dados da Demonstração
        </h2>
        <div class="space-y-4">
          <div class="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div class="flex items-start gap-3">
              <AlertTriangle :size="16" class="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-amber-400">Modo Demonstração Ativo</p>
                <p class="text-xs text-slate-500 mt-1">
                  Todos os dados exibidos são fictícios e gerados localmente para fins acadêmicos. 
                  Nenhuma requisição é feita a APIs externas. Os valores não representam cotações reais.
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between py-2">
            <div>
              <p class="text-sm text-slate-300">Fonte de dados prevista (ações/FIIs)</p>
              <p class="text-xs text-slate-500">brapi.dev — API brasileira de ativos</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">Inativo</span>
          </div>

          <div class="flex items-center justify-between py-2 border-t border-[#1e3a5f]">
            <div>
              <p class="text-sm text-slate-300">Fonte de dados prevista (criptomoedas)</p>
              <p class="text-xs text-slate-500">CoinGecko API</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">Inativo</span>
          </div>
        </div>
      </div>

      <!-- Portfolio data management -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase :size="16" class="text-cyan-400" />
          Carteira
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-300">Dados salvos localmente</p>
              <p class="text-xs text-slate-500">Armazenados no localStorage do navegador</p>
            </div>
            <span class="text-xs text-emerald-400">✓ Ativo</span>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              class="flex-1 py-2.5 text-sm font-medium text-slate-300 border border-[#1e3a5f] rounded-xl hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2"
              @click="resetPortfolio"
            >
              <RefreshCw :size="14" />
              Restaurar Carteira Demo
            </button>
            <button
              class="flex-1 py-2.5 text-sm font-medium text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              @click="clearPortfolio"
            >
              <Trash2 :size="14" />
              Limpar Carteira
            </button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Info :size="16" class="text-cyan-400" />
          Sobre o InvestView
        </h2>
        <div class="space-y-3 text-sm text-slate-400">
          <p>O <strong class="text-white">InvestView</strong> é um protótipo acadêmico de plataforma de análise do mercado financeiro brasileiro, desenvolvido como projeto de conclusão de disciplina em Ciência da Computação.</p>
          <p>Este protótipo demonstra cinco requisitos funcionais:</p>
          <ul class="space-y-1.5 list-none">
            <li class="flex items-start gap-2">
              <span class="text-cyan-400 mt-0.5 shrink-0">RF01</span>
              <span>Visualizar o mercado financeiro (Dashboard)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-cyan-400 mt-0.5 shrink-0">RF02</span>
              <span>Pesquisar e filtrar ativos (Mercado)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-cyan-400 mt-0.5 shrink-0">RF03</span>
              <span>Gerenciar carteira de investimentos (Minha Carteira)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-cyan-400 mt-0.5 shrink-0">RF04</span>
              <span>Consultar detalhes e histórico de um ativo (Detalhes)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-cyan-400 mt-0.5 shrink-0">RF05</span>
              <span>Comparar investimentos (Comparador)</span>
            </li>
          </ul>
          <div class="mt-4 p-3 bg-[#050d1a] rounded-xl border border-[#1e3a5f]">
            <p class="text-xs text-slate-500">Stack: Vue.js 3 · Vite · Tailwind CSS · Chart.js · Vue Router · Lucide Icons</p>
          </div>
        </div>
      </div>
    </div>

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
import { ref } from 'vue'
import { Palette, Moon, Database, AlertTriangle, Briefcase, RefreshCw, Trash2, Info, CheckCircle } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { defaultPortfolioAssets } from '@/data/mockPortfolio'

const toastMessage = ref('')

function resetPortfolio() {
  localStorage.setItem('investview_portfolio', JSON.stringify(defaultPortfolioAssets.map(a => ({ ...a }))))
  showToast('Carteira demonstrativa restaurada com sucesso!')
}

function clearPortfolio() {
  localStorage.setItem('investview_portfolio', JSON.stringify([]))
  showToast('Carteira limpa. Acesse "Minha Carteira" para adicionar ativos.')
}

function showToast(msg) {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3500)
}
</script>
