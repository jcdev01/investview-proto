<template>
  <div
    :class="[
      'card p-5 relative overflow-hidden',
      clickable ? 'card-hover cursor-pointer' : '',
    ]"
    @click="clickable ? $emit('click') : null"
  >
    <!-- Background accent -->
    <div
      v-if="accent"
      class="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-5 -translate-y-4 translate-x-4"
      :style="{ background: accentColor }"
    ></div>

    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{{ label }}</p>
        <p class="text-2xl font-bold text-white leading-tight truncate">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1.5 mt-1.5">
          <TrendingUp v-if="changeValue > 0" :size="12" class="text-emerald-400 shrink-0" />
          <TrendingDown v-else-if="changeValue < 0" :size="12" class="text-red-400 shrink-0" />
          <span
            :class="[
              'text-xs font-medium',
              changeValue > 0 ? 'text-emerald-400' : changeValue < 0 ? 'text-red-400' : 'text-slate-400'
            ]"
          >
            {{ change }}
          </span>
          <span v-if="changeSuffix" class="text-xs text-slate-600">{{ changeSuffix }}</span>
        </div>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-1">{{ subtitle }}</p>
      </div>

      <div
        v-if="icon"
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          iconBg,
        ]"
      >
        <component :is="icon" :size="20" :class="iconColor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from '@lucide/vue'

const props = defineProps({
  label: String,
  value: String,
  change: String,
  changeSuffix: String,
  subtitle: String,
  icon: Object,
  iconBg: { type: String, default: 'bg-cyan-500/10' },
  iconColor: { type: String, default: 'text-cyan-400' },
  accent: { type: Boolean, default: false },
  accentColor: { type: String, default: '#22d3ee' },
  clickable: { type: Boolean, default: false },
})

defineEmits(['click'])

const changeValue = computed(() => {
  if (!props.change) return 0
  const num = parseFloat(props.change.replace(',', '.').replace('%', '').replace('+', ''))
  return isNaN(num) ? 0 : num
})
</script>
