'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'

interface SeasonalData {
  high: { price: number; occupancy: number; revenue: number; months: string[] }
  mid: { price: number; occupancy: number; revenue: number; months: string[] }
  low: { price: number; occupancy: number; revenue: number; months: string[] }
}

interface Neighborhood {
  name: string
  premium: number
}

// Chart 1: Revenue Comparison
export function RevenueComparisonChart({ current, market, potential }: { current: number; market: number; potential: number }) {
  const data = [
    {
      name: 'Ingresos',
      Actual: current,
      Potencial: market
    }
  ]

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => `€${value.toLocaleString()}`}
          />
          <Bar dataKey="Actual" fill="#94a3b8" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Potencial" fill="#7c3aed" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 2: Seasonal Area Chart
export function SeasonalAreaChart({ seasonal, basePrice }: { seasonal?: SeasonalData; basePrice: number }) {
  // Generate data for all 12 months
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const data = months.map((month, index) => {
    let price = basePrice
    let occupancy = 65
    let season = 'mid'

    if (seasonal) {
      if (seasonal.high.months.includes(month)) {
        price = seasonal.high.price
        occupancy = seasonal.high.occupancy
        season = 'high'
      } else if (seasonal.low.months.includes(month)) {
        price = seasonal.low.price
        occupancy = seasonal.low.occupancy
        season = 'low'
      } else {
        price = seasonal.mid.price
        occupancy = seasonal.mid.occupancy
        season = 'mid'
      }
    }

    const revenue = Math.round((price * occupancy * 30) / 100)

    return {
      month,
      price,
      occupancy,
      revenue,
      season
    }
  })

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'revenue') return [`€${value.toLocaleString()}`, 'Ingresos']
              if (name === 'price') return [`€${value}`, 'Precio']
              if (name === 'occupancy') return [`${value}%`, 'Ocupación']
              return value
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 3: Neighborhood Pricing Bar Chart
export function NeighborhoodBarChart({ neighborhoods, basePrice }: { neighborhoods: Neighborhood[]; basePrice: number }) {
  const data = neighborhoods.map(n => ({
    name: n.name.length > 12 ? n.name.substring(0, 12) + '...' : n.name,
    fullName: n.name,
    price: Math.round(basePrice * n.premium),
    premium: n.premium
  })).sort((a, b) => b.price - a.price)

  const COLORS = data.map(d =>
    d.premium > 1.1 ? '#7c3aed' :
    d.premium < 0.95 ? '#94a3b8' :
    '#6366f1'
  )

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: 12
            }}
            formatter={(value: any) => `€${value}`}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName
              }
              return label
            }}
          />
          <Bar dataKey="price" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 4: Price vs Occupancy Scatter
export function SeasonalBarsChart({ seasonal }: { seasonal?: SeasonalData }) {
  if (!seasonal) return null

  const data = [
    {
      temporada: 'Alta',
      precio: seasonal.high.price,
      ocupacion: seasonal.high.occupancy,
      ingresos: seasonal.high.revenue
    },
    {
      temporada: 'Media',
      precio: seasonal.mid.price,
      ocupacion: seasonal.mid.occupancy,
      ingresos: seasonal.mid.revenue
    },
    {
      temporada: 'Baja',
      precio: seasonal.low.price,
      ocupacion: seasonal.low.occupancy,
      ingresos: seasonal.low.revenue
    }
  ]

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6']

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="temporada" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'precio') return [`€${value}`, 'Precio/noche']
              if (name === 'ocupacion') return [`${value}%`, 'Ocupación']
              if (name === 'ingresos') return [`€${value}`, 'Ingresos/mes']
              return value
            }}
          />
          <Bar dataKey="ingresos" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
