/**
 * Utilitários de formatação para o InvestView
 * Formata valores monetários, percentuais e datas no padrão brasileiro
 */

/**
 * Formata um valor em Reais (BRL)
 */
export function formatCurrency(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  
  if (compact && Math.abs(value) >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  }
  if (compact && Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2).replace('.', ',')}M`
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}K`
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata um percentual com sinal
 */
export function formatPercent(value, showSign = true) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2).replace('.', ',')}%`
}

/**
 * Formata uma data no padrão brasileiro
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata um número genérico
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Retorna a classe CSS para valor positivo ou negativo
 */
export function getChangeClass(value) {
  if (value > 0) return 'text-positive'
  if (value < 0) return 'text-negative'
  return 'text-slate-400'
}

/**
 * Retorna o nome amigável da categoria
 */
export function getCategoryBadgeClass(category) {
  const map = {
    'Ação': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    'FII': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'ETF': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'Cripto': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  }
  return map[category] || 'bg-slate-500/10 text-slate-400'
}
