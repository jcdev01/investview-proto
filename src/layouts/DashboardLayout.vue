<template>
  <div class="flex h-screen bg-[#050d1a] overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Main content -->
    <div
      class="flex flex-col flex-1 min-w-0 transition-all duration-300"
    >
      <!-- Header -->
      <AppHeader :pageTitle="pageTitle" />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <slot />
      </main>

      <!-- Demo mode footer -->
      <footer class="px-6 py-2 border-t border-[#1e3a5f] flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Modo demonstração — dados simulados. Não representam cotações reais.
        </span>
      </footer>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 bg-black/60 z-20 lg:hidden"
      @click="mobileMenuOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'InvestView')

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>
