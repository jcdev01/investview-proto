<template>
  <aside
    :class="[
      'flex flex-col h-full bg-[#0a1628] border-r border-[#1e3a5f] transition-all duration-300 z-30',
      'fixed lg:relative',
      collapsed ? 'w-[68px]' : 'w-[240px]',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center h-16 px-4 border-b border-[#1e3a5f] shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <TrendingUp :size="18" class="text-cyan-400" />
        </div>
        <span
          v-if="!collapsed"
          class="font-bold text-white text-lg tracking-tight truncate"
        >
          Invest<span class="text-cyan-400">View</span>
        </span>
      </div>
      <button
        class="ml-auto p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 hidden lg:flex"
        @click="$emit('toggle')"
        :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
      >
        <PanelLeftClose v-if="!collapsed" :size="16" />
        <PanelLeftOpen v-else :size="16" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-3 px-2">
      <div v-if="!collapsed" class="px-2 mb-2">
        <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Menu</span>
      </div>

      <NavItem
        v-for="item in navItems"
        :key="item.name"
        :item="item"
        :collapsed="collapsed"
      />

      <div class="my-3 border-t border-[#1e3a5f] mx-2" />

      <NavItem :item="settingsItem" :collapsed="collapsed" />
    </nav>

    <!-- User section -->
    <div class="border-t border-[#1e3a5f] p-3 shrink-0">
      <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          JM
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-sm font-medium text-white truncate">João Melo</p>
          <p class="text-xs text-slate-500 truncate">Demo · Conta fictícia</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { TrendingUp, LayoutDashboard, BarChart2, Star, GitCompare, Settings, PanelLeftClose, PanelLeftOpen } from '@lucide/vue'
import NavItem from '@/components/NavItem.vue'

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle'])

const mobileOpen = ref(false)

const navItems = [
  { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Mercado', path: '/mercado', icon: BarChart2 },
  { name: 'Favoritos', path: '/favoritos', icon: Star },
  { name: 'Comparador', path: '/comparador', icon: GitCompare },
]

const settingsItem = { name: 'Configurações', path: '/configuracoes', icon: Settings }
</script>
