<template>
  <div
    :class="[
      'inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-all',
      sizeClass,
      roundedClass,
      'border border-[#1e3a5f]/60 bg-[#0d1f38]/80 shadow-sm'
    ]"
    :style="containerStyle"
    :title="altText"
  >
    <img
      v-if="!hasError && resolvedLogo"
      :src="resolvedLogo"
      :alt="altText"
      class="w-full h-full object-contain p-1"
      loading="lazy"
      @error="handleError"
    />
    <span
      v-else
      class="font-bold tracking-tight"
      :class="textSizeClass"
      :style="{ color: color || '#22d3ee' }"
    >
      {{ (ticker || '??').slice(0, 2) }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  ticker: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  },
  color: {
    type: String,
    default: '',
  },
  rounded: {
    type: String,
    default: 'xl', // 'sm', 'md', 'lg', 'xl', '2xl', 'full'
  },
})

const hasError = ref(false)

function handleError() {
  hasError.value = true
}

const resolvedLogo = computed(() => {
  if (props.logo && !props.logo.startsWith('⚡') && !props.logo.startsWith('⛏') && !props.logo.startsWith('🏢') && !props.logo.startsWith('🏦') && !props.logo.startsWith('⚙') && !props.logo.startsWith('🏭') && !props.logo.startsWith('📈') && !props.logo.startsWith('🌎') && !props.logo.startsWith('₿') && !props.logo.startsWith('Ξ') && !props.logo.startsWith('🏛')) {
    return props.logo
  }
  if (props.ticker) {
    return `/logos/${props.ticker}.svg`
  }
  return ''
})

const altText = computed(() => props.name || props.ticker || 'Ativo')

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-6 h-6'
    case 'sm':
      return 'w-8 h-8'
    case 'md':
      return 'w-10 h-10'
    case 'lg':
      return 'w-12 h-12'
    case 'xl':
      return 'w-14 h-14'
    default:
      return 'w-10 h-10'
  }
})

const textSizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-[9px]'
    case 'sm':
      return 'text-xs'
    case 'md':
      return 'text-sm'
    case 'lg':
      return 'text-base'
    case 'xl':
      return 'text-lg'
    default:
      return 'text-xs'
  }
})

const roundedClass = computed(() => {
  switch (props.rounded) {
    case 'sm':
      return 'rounded-md'
    case 'md':
      return 'rounded-lg'
    case 'lg':
      return 'rounded-xl'
    case 'xl':
      return 'rounded-2xl'
    case 'full':
      return 'rounded-full'
    default:
      return 'rounded-xl'
  }
})

const containerStyle = computed(() => {
  if (props.color && hasError.value) {
    return {
      backgroundColor: props.color + '15',
      borderColor: props.color + '30',
    }
  }
  return {}
})
</script>