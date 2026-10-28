import { ref, computed } from 'vue'
import { mockAssets } from '@/data/mockAssets'

const STORAGE_KEY = 'investview_favorites'
const DEFAULT_FAVORITES = ['PETR4', 'VALE3', 'BTC', 'MXRF11', 'BOVA11']

// Singleton reactive state so all components sync instantly
const favoriteTickers = ref(loadFavorites())

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao ler favoritos do localStorage:', e)
  }
  return [...DEFAULT_FAVORITES]
}

function persistFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteTickers.value))
  } catch (e) {
    console.error('Erro ao salvar favoritos no localStorage:', e)
  }
}

export function useFavorites() {
  const favoriteAssets = computed(() => {
    return favoriteTickers.value
      .map(ticker => mockAssets.find(a => a.ticker === ticker))
      .filter(Boolean)
  })

  function isFavorite(ticker) {
    if (!ticker) return false
    return favoriteTickers.value.includes(ticker)
  }

  function toggleFavorite(ticker) {
    if (!ticker) return false
    const index = favoriteTickers.value.indexOf(ticker)
    let added = false
    if (index >= 0) {
      favoriteTickers.value.splice(index, 1)
      added = false
    } else {
      favoriteTickers.value.push(ticker)
      added = true
    }
    persistFavorites()
    return added
  }

  function addFavorite(ticker) {
    if (!ticker) return false
    if (!favoriteTickers.value.includes(ticker)) {
      favoriteTickers.value.push(ticker)
      persistFavorites()
      return true
    }
    return false
  }

  function removeFavorite(ticker) {
    if (!ticker) return false
    const index = favoriteTickers.value.indexOf(ticker)
    if (index >= 0) {
      favoriteTickers.value.splice(index, 1)
      persistFavorites()
      return true
    }
    return false
  }

  return {
    favoriteTickers,
    favoriteAssets,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  }
}
