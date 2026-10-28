<template>
  <router-link
    :to="item.path"
    :title="collapsed ? item.name : ''"
    :class="[
      'flex items-center gap-3 px-2 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group',
      isActive
        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
        : 'text-slate-400 hover:text-white hover:bg-white/5',
      collapsed ? 'justify-center' : '',
    ]"
  >
    <component
      :is="item.icon"
      :size="18"
      :class="[
        'shrink-0 transition-colors',
        isActive ? 'text-cyan-400' : 'group-hover:text-white',
      ]"
    />
    <span v-if="!collapsed" class="text-sm font-medium truncate">
      {{ item.name }}
    </span>
    <span
      v-if="!collapsed && isActive"
      class="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"
    ></span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const isActive = computed(() => route.path === props.item.path || route.path.startsWith(props.item.path + '/'))
</script>
