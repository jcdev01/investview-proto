/**
 * Serviço de mercado — InvestView
 *
 * Esta camada centraliza o acesso aos dados de mercado.
 * Atualmente utiliza dados demonstrativos locais.
 *
 * INTEGRAÇÃO FUTURA:
 * - Ações/FIIs/ETFs: brapi.dev (https://brapi.dev/docs)
 * - Criptomoedas: CoinGecko API (https://www.coingecko.com/pt-br/api)
 *
 * Para ativar dados reais:
 * 1. Obtenha um token em brapi.dev
 * 2. Substitua as funções abaixo por chamadas HTTP reais
 * 3. Implemente cache e tratamento de erros
 */

import { mockAssets, topGainers, topLosers } from '@/data/mockAssets'
import { getAssetHistory, getPortfolioEvolution, recentActivity } from '@/data/mockMarketHistory'

const DEMO_MODE = true // Altere para false quando integrar a API real

/**
 * Retorna todos os ativos do mercado
 */
export async function fetchMarketAssets() {
  if (DEMO_MODE) {
    await simulateDelay(400)
    return { data: mockAssets, source: 'demo' }
  }
  // TODO: const res = await fetch(`https://brapi.dev/api/quote/list?token=SEU_TOKEN`)
  // return res.json()
}

/**
 * Retorna os dados de um ativo específico
 */
export async function fetchAssetDetails(ticker) {
  if (DEMO_MODE) {
    await simulateDelay(300)
    const asset = mockAssets.find(a => a.ticker === ticker)
    return { data: asset || null, source: 'demo' }
  }
  // TODO: const res = await fetch(`https://brapi.dev/api/quote/${ticker}?token=SEU_TOKEN`)
  // return res.json()
}

/**
 * Retorna o histórico de preços de um ativo
 */
export async function fetchAssetHistory(ticker, period = '1M') {
  if (DEMO_MODE) {
    await simulateDelay(350)
    const history = getAssetHistory(ticker, period)
    return { data: history, source: 'demo' }
  }
  // TODO: Integração com brapi.dev ou CoinGecko para histórico
}

/**
 * Retorna a evolução do patrimônio
 */
export async function fetchPortfolioEvolution(period = '1M') {
  const dayMap = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
  if (DEMO_MODE) {
    await simulateDelay(300)
    return { data: getPortfolioEvolution(dayMap[period] || 30), source: 'demo' }
  }
}

/**
 * Retorna maiores altas e baixas
 */
export async function fetchTopMovers() {
  if (DEMO_MODE) {
    await simulateDelay(200)
    return { gainers: topGainers, losers: topLosers, source: 'demo' }
  }
}

/**
 * Retorna atividade recente
 */
export async function fetchRecentActivity() {
  if (DEMO_MODE) {
    await simulateDelay(200)
    return { data: recentActivity, source: 'demo' }
  }
}

// Utilitário interno — simula latência de API
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
