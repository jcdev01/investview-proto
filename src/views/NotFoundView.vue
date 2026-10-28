<template>
  <DashboardLayout>
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="w-20 h-20 rounded-2xl bg-[#0d1f38] border border-[#1e3a5f] flex items-center justify-center mb-6">
        <MapPin :size="36" class="text-slate-600" />
      </div>
      <h1 class="text-3xl font-bold text-white mb-2">404</h1>
      <h2 class="text-lg font-semibold text-slate-300 mb-2">Página não encontrada</h2>
      <p class="text-sm text-slate-500 max-w-sm mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <router-link
        to="/dashboard"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Home :size="16" />
        Voltar ao início
      </router-link>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { MapPin, Home } from '@lucide/vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
</script>
