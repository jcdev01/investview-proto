import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import MarketView from '@/views/MarketView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import AssetDetailsView from '@/views/AssetDetailsView.vue'
import CompareView from '@/views/CompareView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Visão Geral' },
  },
  {
    path: '/mercado',
    name: 'market',
    component: MarketView,
    meta: { title: 'Mercado' },
  },
  {
    path: '/mercado/:ticker',
    name: 'asset-details',
    component: AssetDetailsView,
    meta: { title: 'Detalhes do Ativo' },
  },
  {
    path: '/favoritos',
    name: 'favorites',
    component: FavoritesView,
    meta: { title: 'Lista de Favoritos' },
  },
  {
    path: '/carteira',
    redirect: '/favoritos',
  },
  {
    path: '/comparador',
    name: 'compare',
    component: CompareView,
    meta: { title: 'Comparador' },
  },
  {
    path: '/configuracoes',
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Configurações' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — InvestView` : 'InvestView'
})

export default router
