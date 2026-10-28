<template>
  <header class="h-16 px-4 lg:px-6 flex items-center gap-4 border-b border-[#1e3a5f] bg-[#0a1628] shrink-0 sticky top-0 z-10">
    <!-- Page title -->
    <div class="flex-1 min-w-0">
      <h1 class="text-base font-semibold text-white truncate">{{ pageTitle }}</h1>
      <p class="text-xs text-slate-500 hidden sm:block">{{ currentDate }}</p>
    </div>

    <!-- Search -->
    <div class="relative hidden md:block">
      <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar ativo..."
        class="w-52 bg-[#0d1f38] border border-[#1e3a5f] rounded-lg pl-8 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
        @keydown.enter="handleSearch"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
      />
      <!-- Search suggestions -->
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="absolute top-full left-0 right-0 mt-1 bg-[#0d1f38] border border-[#1e3a5f] rounded-lg overflow-hidden shadow-xl z-50"
      >
        <router-link
          v-for="asset in filteredSuggestions"
          :key="asset.id"
          :to="`/mercado/${asset.ticker}`"
          class="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
          @click="searchQuery = ''"
        >
          <AssetLogo :ticker="asset.ticker" :logo="asset.logo" :name="asset.name" size="sm" rounded="md" />
          <div>
            <p class="text-sm font-medium text-white">{{ asset.ticker }}</p>
            <p class="text-xs text-slate-500">{{ asset.name }}</p>
          </div>
          <span class="ml-auto text-xs px-1.5 py-0.5 rounded" :class="getCategoryBadgeClass(asset.category)">
            {{ asset.category }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Market status -->
    <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs font-medium text-emerald-400">Mercado Aberto</span>
    </div>

    <!-- Notifications -->
    <div class="relative">
      <button
        class="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        @click="toggleNotifications"
      >
        <Bell :size="18" />
        <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 border border-[#0a1628]"></span>
      </button>

      <!-- Notifications panel -->
      <div
        v-if="showNotifications"
        class="absolute top-full right-0 mt-2 w-80 bg-[#0d1f38] border border-[#1e3a5f] rounded-xl shadow-2xl z-50 overflow-hidden"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-[#1e3a5f]">
          <h3 class="text-sm font-semibold text-white">Notificações</h3>
          <button class="text-xs text-cyan-400 hover:text-cyan-300" @click="markAllRead">Marcar todas como lidas</button>
        </div>
        <div class="max-h-72 overflow-y-auto">
          <div
            v-for="(notif, idx) in notifications"
            :key="idx"
            class="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-[#1e3a5f]/50 last:border-0"
          >
            <div :class="['w-2 h-2 rounded-full mt-1.5 shrink-0', notif.read ? 'bg-slate-600' : 'bg-cyan-400']"></div>
            <div>
              <p class="text-sm text-white">{{ notif.title }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ notif.body }}</p>
              <p class="text-xs text-slate-600 mt-1">{{ notif.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User avatar -->
    <div class="relative">
      <button
        class="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
        @click="toggleUserMenu"
      >
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
          JM
        </div>
        <ChevronDown :size="14" class="text-slate-400 hidden sm:block" />
      </button>

      <!-- User dropdown -->
      <div
        v-if="showUserMenu"
        class="absolute top-full right-0 mt-2 w-48 bg-[#0d1f38] border border-[#1e3a5f] rounded-xl shadow-2xl z-50 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-[#1e3a5f]">
          <p class="text-sm font-medium text-white">João Melo</p>
          <p class="text-xs text-slate-500">Demo · Conta fictícia</p>
        </div>
        <div class="py-1">
          <router-link to="/configuracoes" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" @click="showUserMenu = false">
            <Settings :size="14" />
            Configurações
          </router-link>
          <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut :size="14" />
            Sair (demo)
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Bell, ChevronDown, Settings, LogOut } from '@lucide/vue'
import AssetLogo from '@/components/AssetLogo.vue'
import { mockAssets } from '@/data/mockAssets'
import { getCategoryBadgeClass } from '@/utils/formatters'

defineProps({
  pageTitle: String,
})

const router = useRouter()
const searchQuery = ref('')
const showSuggestions = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
})

const filteredSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) return []
  const q = searchQuery.value.toLowerCase()
  return mockAssets.filter(a =>
    a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
  ).slice(0, 6)
})

const notifications = ref([
  { title: 'PETR4 em alta', body: 'Petrobras subiu 3,89% hoje.', time: 'Há 15 min', read: false },
  { title: 'Alerta de preço', body: 'VALE3 atingiu seu suporte em R$ 62,00.', time: 'Há 1h', read: false },
  { title: 'Dividendos MXRF11', body: 'Rendimento de R$ 0,12 por cota anunciado.', time: 'Hoje, 09:00', read: true },
  { title: 'Atualização de cotações', body: 'Mercado aberto. Dados atualizados.', time: 'Hoje, 09:00', read: true },
])

function handleSearch() {
  if (filteredSuggestions.value.length > 0) {
    router.push(`/mercado/${filteredSuggestions.value[0].ticker}`)
    searchQuery.value = ''
  } else if (searchQuery.value) {
    router.push('/mercado')
  }
}

function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}

function handleOutsideClick(e) {
  if (!e.target.closest('[data-dropdown]')) {
    showNotifications.value = false
    showUserMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>
