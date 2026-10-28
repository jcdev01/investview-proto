// Dados históricos demonstrativos para gráficos
// IMPORTANTE: Todos os valores são fictícios e apenas para fins demonstrativos.
// Fonte futura: brapi.dev e CoinGecko

/**
 * Gera uma série temporal fictícia de preços
 * @param {number} basePrice - Preço base
 * @param {number} days - Número de dias
 * @param {number} volatility - Volatilidade (0 a 1)
 * @param {number} trend - Tendência (-1 a 1)
 */
export function generatePriceSeries(basePrice, days, volatility = 0.02, trend = 0.001) {
  const series = []
  let price = basePrice * (1 - (days * trend * 0.5))
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.48) * volatility * price + trend * price
    price = Math.max(price + change, basePrice * 0.4)
    series.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    })
  }
  return series
}

/**
 * Retorna dados históricos para um ativo no período especificado
 * @param {string} assetId - ID do ativo
 * @param {string} period - Período: '1D', '1W', '1M', '6M', '1Y'
 */
export function getAssetHistory(assetId, period = '1M') {
  const periodMap = {
    '1D': { days: 1, points: 24, volatility: 0.005, trend: 0.0005 },
    '1W': { days: 7, points: 7, volatility: 0.015, trend: 0.001 },
    '1M': { days: 30, points: 30, volatility: 0.02, trend: 0.002 },
    '6M': { days: 180, points: 180, volatility: 0.025, trend: 0.003 },
    '1Y': { days: 365, points: 365, volatility: 0.03, trend: 0.005 },
  }

  const assetBasePrice = {
    PETR4: 38.72,
    VALE3: 62.15,
    ITUB4: 35.40,
    BBDC4: 14.82,
    WEGE3: 52.90,
    MXRF11: 10.15,
    HGLG11: 165.40,
    BOVA11: 118.50,
    IVVB11: 386.20,
    BTC: 312450.00,
    ETH: 15840.00,
    BBAS3: 25.60,
  }

  const assetTrend = {
    PETR4: 0.003,
    VALE3: -0.002,
    ITUB4: 0.002,
    BBDC4: -0.001,
    WEGE3: 0.004,
    MXRF11: 0.001,
    HGLG11: -0.001,
    BOVA11: 0.002,
    IVVB11: 0.003,
    BTC: 0.005,
    ETH: -0.002,
    BBAS3: 0.002,
  }

  const config = periodMap[period] || periodMap['1M']
  const basePrice = assetBasePrice[assetId] || 100
  const trend = assetTrend[assetId] || 0

  // Semente determinística baseada no assetId para resultados consistentes
  let seed = assetId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  
  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }

  const series = []
  let price = basePrice * (1 - (config.days * Math.abs(trend) * 0.3))
  
  for (let i = config.points; i >= 0; i--) {
    const date = new Date()
    if (period === '1D') {
      date.setHours(date.getHours() - i)
    } else {
      date.setDate(date.getDate() - i)
    }
    
    const change = (pseudoRandom() - 0.47) * config.volatility * price + trend * price
    price = Math.max(price + change, basePrice * 0.3)
    
    series.push({
      date: period === '1D' 
        ? `${date.getHours().toString().padStart(2,'0')}:00`
        : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      price: parseFloat(price.toFixed(assetId === 'BTC' || assetId === 'ETH' ? 2 : 2)),
      volume: Math.floor(pseudoRandom() * 1000000 + 500000),
    })
  }
  
  return series
}

/**
 * Retorna dados históricos para o índice Ibovespa
 */
export function getIbovespaHistory(days = 30) {
  const series = []
  let points = 124800
  
  let seed = 77
  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const change = (pseudoRandom() - 0.47) * 0.011 * points + 0.0009 * points
    points = Math.round(points + change)
    
    series.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: points,
    })
  }

  if (series.length > 0) {
    series[series.length - 1].value = 128342
  }
  return series
}

/**
 * Retorna dados históricos para a evolução do patrimônio
 */
export function getPortfolioEvolution(days = 30) {
  const series = []
  let value = 78500
  
  let seed = 42
  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const change = (pseudoRandom() - 0.45) * 0.018 * value + 0.003 * value
    value = Math.max(value + change, 65000)
    
    series.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: parseFloat(value.toFixed(2)),
    })
  }
  return series
}

export const recentActivity = [
  { type: 'buy', ticker: 'PETR4', quantity: 50, price: 37.20, date: 'Hoje, 14:32', total: 1860.00 },
  { type: 'sell', ticker: 'VALE3', quantity: 20, price: 63.50, date: 'Ontem, 10:15', total: 1270.00 },
  { type: 'buy', ticker: 'MXRF11', quantity: 100, price: 10.08, date: '24/10/2026', total: 1008.00 },
  { type: 'buy', ticker: 'BTC', quantity: 0.01, price: 308200, date: '22/10/2026', total: 3082.00 },
  { type: 'sell', ticker: 'BBDC4', quantity: 150, price: 15.10, date: '20/10/2026', total: 2265.00 },
]
