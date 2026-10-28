<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div class="w-16 h-16 rounded-2xl bg-[#0d1f38] border border-[#1e3a5f] flex items-center justify-center mb-4">
      <component :is="icon || SearchX" :size="28" class="text-slate-600" />
    </div>
    <h3 class="text-base font-semibold text-slate-300 mb-1">{{ title }}</h3>
    <p class="text-sm text-slate-500 max-w-sm">{{ message }}</p>
    <button
      v-if="actionLabel"
      class="mt-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium rounded-lg hover:bg-cyan-500/20 transition-colors"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
import { SearchX } from '@lucide/vue'

defineProps({
  icon: Object,
  title: { type: String, default: 'Nenhum resultado encontrado' },
  message: { type: String, default: 'Tente ajustar os filtros ou buscar por outro ativo.' },
  actionLabel: String,
})

defineEmits(['action'])
</script>
