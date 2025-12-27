/**
 * Base de datos estática de mercado para Airbnb en España
 * Actualizado: Octubre 2025
 *
 * Fuentes: Análisis de listados públicos, InsideAirbnb, datos de mercado
 * Actualizar cada trimestre
 *
 * MEJORA V2: Incluye datos por temporada y barrios principales
 */

export interface SeasonalPricing {
  high: { price: number; occupancy: number }  // Temporada alta
  mid: { price: number; occupancy: number }   // Temporada media
  low: { price: number; occupancy: number }   // Temporada baja
}

export interface PropertyStats {
  seasonal: SeasonalPricing
  avgPrice: number        // Precio promedio anual (€)
  avgOccupancy: number    // Ocupación promedio anual (%)
  minPrice: number        // Precio mínimo recomendado
  maxPrice: number        // Precio máximo recomendado
}

export interface Neighborhood {
  name: string
  premium: number         // Factor multiplicador (1 = promedio, 1.2 = 20% más caro, 0.9 = 10% más barato)
}

export interface MarketData {
  city: string
  displayName: string
  country: string
  seasonality: {
    high: string[]        // Meses de temporada alta
    mid: string[]         // Meses de temporada media
    low: string[]         // Meses de temporada baja
  }
  neighborhoods?: Neighborhood[]  // Solo para ciudades principales
  propertyTypes: {
    studio: PropertyStats
    onebed: PropertyStats
    twobed: PropertyStats
    threebed: PropertyStats
  }
}

export const MARKET_DATA: Record<string, MarketData> = {
  madrid: {
    city: 'madrid',
    displayName: 'Madrid',
    country: 'España',
    seasonality: {
      high: ['Abr', 'May', 'Sep', 'Oct', 'Dic'],  // Primavera, otoño, Navidad
      mid: ['Mar', 'Jun', 'Nov'],
      low: ['Ene', 'Feb', 'Jul', 'Ago']  // Verano caluroso, invierno frío
    },
    neighborhoods: [
      { name: 'Sol / Gran Vía', premium: 1.25 },
      { name: 'Salamanca', premium: 1.20 },
      { name: 'Malasaña / Chueca', premium: 1.15 },
      { name: 'La Latina / Lavapiés', premium: 1.05 },
      { name: 'Retiro', premium: 1.10 },
      { name: 'Chamberí', premium: 1.12 },
      { name: 'Arganzuela', premium: 0.95 },
      { name: 'Tetuán', premium: 0.90 }
    ],
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 75, occupancy: 78 },
          mid: { price: 65, occupancy: 70 },
          low: { price: 55, occupancy: 58 }
        },
        avgPrice: 65,
        avgOccupancy: 68,
        minPrice: 45,
        maxPrice: 95
      },
      onebed: {
        seasonal: {
          high: { price: 100, occupancy: 82 },
          mid: { price: 85, occupancy: 74 },
          low: { price: 70, occupancy: 62 }
        },
        avgPrice: 85,
        avgOccupancy: 72,
        minPrice: 60,
        maxPrice: 120
      },
      twobed: {
        seasonal: {
          high: { price: 140, occupancy: 80 },
          mid: { price: 120, occupancy: 72 },
          low: { price: 100, occupancy: 60 }
        },
        avgPrice: 120,
        avgOccupancy: 70,
        minPrice: 85,
        maxPrice: 170
      },
      threebed: {
        seasonal: {
          high: { price: 210, occupancy: 75 },
          mid: { price: 180, occupancy: 67 },
          low: { price: 150, occupancy: 55 }
        },
        avgPrice: 180,
        avgOccupancy: 65,
        minPrice: 130,
        maxPrice: 250
      }
    }
  },

  barcelona: {
    city: 'barcelona',
    displayName: 'Barcelona',
    country: 'España',
    seasonality: {
      high: ['Jun', 'Jul', 'Ago', 'Sep', 'Dic'],  // Verano + Navidad
      mid: ['Abr', 'May', 'Oct', 'Nov'],
      low: ['Ene', 'Feb', 'Mar']
    },
    neighborhoods: [
      { name: 'Gótico / Born', premium: 1.30 },
      { name: 'Eixample', premium: 1.20 },
      { name: 'Gràcia', premium: 1.15 },
      { name: 'Barceloneta', premium: 1.25 },
      { name: 'Raval', premium: 1.05 },
      { name: 'Poblenou', premium: 1.18 },
      { name: 'Sants', premium: 0.95 },
      { name: 'Horta', premium: 0.85 }
    ],
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 95, occupancy: 85 },
          mid: { price: 75, occupancy: 75 },
          low: { price: 60, occupancy: 65 }
        },
        avgPrice: 75,
        avgOccupancy: 75,
        minPrice: 55,
        maxPrice: 110
      },
      onebed: {
        seasonal: {
          high: { price: 125, occupancy: 88 },
          mid: { price: 95, occupancy: 78 },
          low: { price: 75, occupancy: 68 }
        },
        avgPrice: 95,
        avgOccupancy: 78,
        minPrice: 70,
        maxPrice: 140
      },
      twobed: {
        seasonal: {
          high: { price: 180, occupancy: 86 },
          mid: { price: 140, occupancy: 76 },
          low: { price: 110, occupancy: 66 }
        },
        avgPrice: 140,
        avgOccupancy: 76,
        minPrice: 100,
        maxPrice: 200
      },
      threebed: {
        seasonal: {
          high: { price: 270, occupancy: 82 },
          mid: { price: 210, occupancy: 72 },
          low: { price: 165, occupancy: 62 }
        },
        avgPrice: 210,
        avgOccupancy: 72,
        minPrice: 150,
        maxPrice: 300
      }
    }
  },

  valencia: {
    city: 'valencia',
    displayName: 'Valencia',
    country: 'España',
    seasonality: {
      high: ['Mar', 'Jun', 'Jul', 'Ago', 'Sep'],  // Fallas + verano
      mid: ['Abr', 'May', 'Oct'],
      low: ['Ene', 'Feb', 'Nov', 'Dic']
    },
    neighborhoods: [
      { name: 'Ciutat Vella', premium: 1.20 },
      { name: 'Russafa', premium: 1.15 },
      { name: 'Playa Malvarrosa', premium: 1.25 },
      { name: 'Eixample', premium: 1.10 },
      { name: 'Benimaclet', premium: 0.95 },
      { name: 'Campanar', premium: 0.90 }
    ],
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 68, occupancy: 80 },
          mid: { price: 55, occupancy: 70 },
          low: { price: 45, occupancy: 60 }
        },
        avgPrice: 55,
        avgOccupancy: 70,
        minPrice: 40,
        maxPrice: 80
      },
      onebed: {
        seasonal: {
          high: { price: 88, occupancy: 83 },
          mid: { price: 70, occupancy: 73 },
          low: { price: 58, occupancy: 63 }
        },
        avgPrice: 70,
        avgOccupancy: 73,
        minPrice: 50,
        maxPrice: 100
      },
      twobed: {
        seasonal: {
          high: { price: 125, occupancy: 81 },
          mid: { price: 100, occupancy: 71 },
          low: { price: 82, occupancy: 61 }
        },
        avgPrice: 100,
        avgOccupancy: 71,
        minPrice: 70,
        maxPrice: 145
      },
      threebed: {
        seasonal: {
          high: { price: 185, occupancy: 78 },
          mid: { price: 150, occupancy: 68 },
          low: { price: 125, occupancy: 58 }
        },
        avgPrice: 150,
        avgOccupancy: 68,
        minPrice: 110,
        maxPrice: 210
      }
    }
  },

  sevilla: {
    city: 'sevilla',
    displayName: 'Sevilla',
    country: 'España',
    seasonality: {
      high: ['Abr', 'May', 'Sep', 'Oct', 'Dic'],  // Feria, Semana Santa, otoño
      mid: ['Mar', 'Jun', 'Nov'],
      low: ['Ene', 'Feb', 'Jul', 'Ago']  // Calor extremo en verano
    },
    neighborhoods: [
      { name: 'Santa Cruz', premium: 1.30 },
      { name: 'Triana', premium: 1.20 },
      { name: 'Alameda', premium: 1.15 },
      { name: 'Centro', premium: 1.10 },
      { name: 'Nervión', premium: 0.95 },
      { name: 'Macarena', premium: 0.90 }
    ],
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 65, occupancy: 82 },
          mid: { price: 50, occupancy: 72 },
          low: { price: 38, occupancy: 62 }
        },
        avgPrice: 50,
        avgOccupancy: 72,
        minPrice: 35,
        maxPrice: 75
      },
      onebed: {
        seasonal: {
          high: { price: 85, occupancy: 84 },
          mid: { price: 65, occupancy: 74 },
          low: { price: 50, occupancy: 64 }
        },
        avgPrice: 65,
        avgOccupancy: 74,
        minPrice: 45,
        maxPrice: 95
      },
      twobed: {
        seasonal: {
          high: { price: 120, occupancy: 82 },
          mid: { price: 95, occupancy: 72 },
          low: { price: 75, occupancy: 62 }
        },
        avgPrice: 95,
        avgOccupancy: 72,
        minPrice: 65,
        maxPrice: 135
      },
      threebed: {
        seasonal: {
          high: { price: 175, occupancy: 79 },
          mid: { price: 140, occupancy: 69 },
          low: { price: 110, occupancy: 59 }
        },
        avgPrice: 140,
        avgOccupancy: 69,
        minPrice: 100,
        maxPrice: 195
      }
    }
  },

  malaga: {
    city: 'malaga',
    displayName: 'Málaga',
    country: 'España',
    seasonality: {
      high: ['Jun', 'Jul', 'Ago', 'Sep', 'Dic'],  // Verano + Navidad
      mid: ['Abr', 'May', 'Oct'],
      low: ['Ene', 'Feb', 'Mar', 'Nov']
    },
    neighborhoods: [
      { name: 'Centro Histórico', premium: 1.25 },
      { name: 'Malagueta', premium: 1.30 },
      { name: 'Soho', premium: 1.20 },
      { name: 'Pedregalejo', premium: 1.15 },
      { name: 'Teatinos', premium: 0.90 },
      { name: 'Carretera de Cádiz', premium: 0.95 }
    ],
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 82, occupancy: 84 },
          mid: { price: 60, occupancy: 74 },
          low: { price: 48, occupancy: 64 }
        },
        avgPrice: 60,
        avgOccupancy: 74,
        minPrice: 45,
        maxPrice: 90
      },
      onebed: {
        seasonal: {
          high: { price: 110, occupancy: 86 },
          mid: { price: 80, occupancy: 76 },
          low: { price: 62, occupancy: 66 }
        },
        avgPrice: 80,
        avgOccupancy: 76,
        minPrice: 55,
        maxPrice: 115
      },
      twobed: {
        seasonal: {
          high: { price: 160, occupancy: 84 },
          mid: { price: 115, occupancy: 74 },
          low: { price: 90, occupancy: 64 }
        },
        avgPrice: 115,
        avgOccupancy: 74,
        minPrice: 80,
        maxPrice: 165
      },
      threebed: {
        seasonal: {
          high: { price: 235, occupancy: 81 },
          mid: { price: 170, occupancy: 71 },
          low: { price: 135, occupancy: 61 }
        },
        avgPrice: 170,
        avgOccupancy: 71,
        minPrice: 120,
        maxPrice: 240
      }
    }
  },

  bilbao: {
    city: 'bilbao',
    displayName: 'Bilbao',
    country: 'España',
    seasonality: {
      high: ['Ago', 'Sep', 'Oct'],  // Verano + otoño
      mid: ['May', 'Jun', 'Jul', 'Nov'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 65, occupancy: 76 },
          mid: { price: 55, occupancy: 66 },
          low: { price: 48, occupancy: 56 }
        },
        avgPrice: 55,
        avgOccupancy: 66,
        minPrice: 40,
        maxPrice: 80
      },
      onebed: {
        seasonal: {
          high: { price: 88, occupancy: 79 },
          mid: { price: 75, occupancy: 69 },
          low: { price: 65, occupancy: 59 }
        },
        avgPrice: 75,
        avgOccupancy: 69,
        minPrice: 55,
        maxPrice: 105
      },
      twobed: {
        seasonal: {
          high: { price: 130, occupancy: 77 },
          mid: { price: 110, occupancy: 67 },
          low: { price: 95, occupancy: 57 }
        },
        avgPrice: 110,
        avgOccupancy: 67,
        minPrice: 75,
        maxPrice: 155
      },
      threebed: {
        seasonal: {
          high: { price: 190, occupancy: 74 },
          mid: { price: 160, occupancy: 64 },
          low: { price: 140, occupancy: 54 }
        },
        avgPrice: 160,
        avgOccupancy: 64,
        minPrice: 115,
        maxPrice: 225
      }
    }
  },

  alicante: {
    city: 'alicante',
    displayName: 'Alicante',
    country: 'España',
    seasonality: {
      high: ['Jun', 'Jul', 'Ago', 'Sep'],  // Verano
      mid: ['May', 'Oct', 'Dic'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Nov']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 68, occupancy: 81 },
          mid: { price: 52, occupancy: 71 },
          low: { price: 42, occupancy: 61 }
        },
        avgPrice: 52,
        avgOccupancy: 71,
        minPrice: 38,
        maxPrice: 75
      },
      onebed: {
        seasonal: {
          high: { price: 88, occupancy: 83 },
          mid: { price: 68, occupancy: 73 },
          low: { price: 55, occupancy: 63 }
        },
        avgPrice: 68,
        avgOccupancy: 73,
        minPrice: 48,
        maxPrice: 98
      },
      twobed: {
        seasonal: {
          high: { price: 128, occupancy: 81 },
          mid: { price: 98, occupancy: 71 },
          low: { price: 78, occupancy: 61 }
        },
        avgPrice: 98,
        avgOccupancy: 71,
        minPrice: 68,
        maxPrice: 140
      },
      threebed: {
        seasonal: {
          high: { price: 190, occupancy: 78 },
          mid: { price: 145, occupancy: 68 },
          low: { price: 115, occupancy: 58 }
        },
        avgPrice: 145,
        avgOccupancy: 68,
        minPrice: 105,
        maxPrice: 200
      }
    }
  },

  granada: {
    city: 'granada',
    displayName: 'Granada',
    country: 'España',
    seasonality: {
      high: ['Abr', 'May', 'Sep', 'Oct', 'Dic'],  // Primavera, otoño, Navidad
      mid: ['Mar', 'Jun', 'Nov'],
      low: ['Ene', 'Feb', 'Jul', 'Ago']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 55, occupancy: 79 },
          mid: { price: 45, occupancy: 69 },
          low: { price: 35, occupancy: 59 }
        },
        avgPrice: 45,
        avgOccupancy: 69,
        minPrice: 32,
        maxPrice: 65
      },
      onebed: {
        seasonal: {
          high: { price: 72, occupancy: 81 },
          mid: { price: 58, occupancy: 71 },
          low: { price: 46, occupancy: 61 }
        },
        avgPrice: 58,
        avgOccupancy: 71,
        minPrice: 40,
        maxPrice: 85
      },
      twobed: {
        seasonal: {
          high: { price: 105, occupancy: 79 },
          mid: { price: 85, occupancy: 69 },
          low: { price: 68, occupancy: 59 }
        },
        avgPrice: 85,
        avgOccupancy: 69,
        minPrice: 60,
        maxPrice: 120
      },
      threebed: {
        seasonal: {
          high: { price: 155, occupancy: 76 },
          mid: { price: 125, occupancy: 66 },
          low: { price: 100, occupancy: 56 }
        },
        avgPrice: 125,
        avgOccupancy: 66,
        minPrice: 90,
        maxPrice: 175
      }
    }
  },

  sanSebastian: {
    city: 'san-sebastian',
    displayName: 'San Sebastián',
    country: 'España',
    seasonality: {
      high: ['Jul', 'Ago', 'Sep'],  // Verano + festival de cine
      mid: ['Jun', 'Oct'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 98, occupancy: 83 },
          mid: { price: 70, occupancy: 73 },
          low: { price: 55, occupancy: 63 }
        },
        avgPrice: 70,
        avgOccupancy: 73,
        minPrice: 50,
        maxPrice: 100
      },
      onebed: {
        seasonal: {
          high: { price: 135, occupancy: 85 },
          mid: { price: 95, occupancy: 75 },
          low: { price: 75, occupancy: 65 }
        },
        avgPrice: 95,
        avgOccupancy: 75,
        minPrice: 70,
        maxPrice: 135
      },
      twobed: {
        seasonal: {
          high: { price: 195, occupancy: 83 },
          mid: { price: 140, occupancy: 73 },
          low: { price: 110, occupancy: 63 }
        },
        avgPrice: 140,
        avgOccupancy: 73,
        minPrice: 100,
        maxPrice: 195
      },
      threebed: {
        seasonal: {
          high: { price: 285, occupancy: 80 },
          mid: { price: 205, occupancy: 70 },
          low: { price: 165, occupancy: 60 }
        },
        avgPrice: 205,
        avgOccupancy: 70,
        minPrice: 150,
        maxPrice: 280
      }
    }
  },

  santander: {
    city: 'santander',
    displayName: 'Santander',
    country: 'España',
    seasonality: {
      high: ['Jul', 'Ago'],  // Verano
      mid: ['Jun', 'Sep'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Oct', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 62, occupancy: 77 },
          mid: { price: 48, occupancy: 67 },
          low: { price: 38, occupancy: 57 }
        },
        avgPrice: 48,
        avgOccupancy: 67,
        minPrice: 35,
        maxPrice: 70
      },
      onebed: {
        seasonal: {
          high: { price: 82, occupancy: 79 },
          mid: { price: 63, occupancy: 69 },
          low: { price: 50, occupancy: 59 }
        },
        avgPrice: 63,
        avgOccupancy: 69,
        minPrice: 45,
        maxPrice: 90
      },
      twobed: {
        seasonal: {
          high: { price: 120, occupancy: 77 },
          mid: { price: 92, occupancy: 67 },
          low: { price: 72, occupancy: 57 }
        },
        avgPrice: 92,
        avgOccupancy: 67,
        minPrice: 65,
        maxPrice: 130
      },
      threebed: {
        seasonal: {
          high: { price: 175, occupancy: 74 },
          mid: { price: 135, occupancy: 64 },
          low: { price: 108, occupancy: 54 }
        },
        avgPrice: 135,
        avgOccupancy: 64,
        minPrice: 95,
        maxPrice: 185
      }
    }
  },

  zaragoza: {
    city: 'zaragoza',
    displayName: 'Zaragoza',
    country: 'España',
    seasonality: {
      high: ['Oct'],  // Fiestas del Pilar
      mid: ['May', 'Sep', 'Nov'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Jun', 'Jul', 'Ago', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 52, occupancy: 75 },
          mid: { price: 42, occupancy: 65 },
          low: { price: 36, occupancy: 55 }
        },
        avgPrice: 42,
        avgOccupancy: 65,
        minPrice: 30,
        maxPrice: 60
      },
      onebed: {
        seasonal: {
          high: { price: 68, occupancy: 77 },
          mid: { price: 55, occupancy: 67 },
          low: { price: 47, occupancy: 57 }
        },
        avgPrice: 55,
        avgOccupancy: 67,
        minPrice: 40,
        maxPrice: 78
      },
      twobed: {
        seasonal: {
          high: { price: 98, occupancy: 75 },
          mid: { price: 80, occupancy: 65 },
          low: { price: 68, occupancy: 55 }
        },
        avgPrice: 80,
        avgOccupancy: 65,
        minPrice: 55,
        maxPrice: 115
      },
      threebed: {
        seasonal: {
          high: { price: 145, occupancy: 72 },
          mid: { price: 118, occupancy: 62 },
          low: { price: 100, occupancy: 52 }
        },
        avgPrice: 118,
        avgOccupancy: 62,
        minPrice: 85,
        maxPrice: 165
      }
    }
  },

  cordoba: {
    city: 'cordoba',
    displayName: 'Córdoba',
    country: 'España',
    seasonality: {
      high: ['May', 'Sep', 'Oct'],  // Patios + otoño
      mid: ['Abr', 'Nov'],
      low: ['Ene', 'Feb', 'Mar', 'Jun', 'Jul', 'Ago', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 52, occupancy: 78 },
          mid: { price: 43, occupancy: 68 },
          low: { price: 36, occupancy: 58 }
        },
        avgPrice: 43,
        avgOccupancy: 68,
        minPrice: 30,
        maxPrice: 62
      },
      onebed: {
        seasonal: {
          high: { price: 68, occupancy: 80 },
          mid: { price: 56, occupancy: 70 },
          low: { price: 47, occupancy: 60 }
        },
        avgPrice: 56,
        avgOccupancy: 70,
        minPrice: 40,
        maxPrice: 80
      },
      twobed: {
        seasonal: {
          high: { price: 100, occupancy: 78 },
          mid: { price: 82, occupancy: 68 },
          low: { price: 68, occupancy: 58 }
        },
        avgPrice: 82,
        avgOccupancy: 68,
        minPrice: 58,
        maxPrice: 115
      },
      threebed: {
        seasonal: {
          high: { price: 148, occupancy: 75 },
          mid: { price: 120, occupancy: 65 },
          low: { price: 100, occupancy: 55 }
        },
        avgPrice: 120,
        avgOccupancy: 65,
        minPrice: 85,
        maxPrice: 170
      }
    }
  },

  murcia: {
    city: 'murcia',
    displayName: 'Murcia',
    country: 'España',
    seasonality: {
      high: ['Abr', 'Sep'],  // Fiestas de Primavera + Feria
      mid: ['May', 'Oct'],
      low: ['Ene', 'Feb', 'Mar', 'Jun', 'Jul', 'Ago', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 48, occupancy: 74 },
          mid: { price: 40, occupancy: 64 },
          low: { price: 34, occupancy: 54 }
        },
        avgPrice: 40,
        avgOccupancy: 64,
        minPrice: 28,
        maxPrice: 58
      },
      onebed: {
        seasonal: {
          high: { price: 63, occupancy: 76 },
          mid: { price: 52, occupancy: 66 },
          low: { price: 44, occupancy: 56 }
        },
        avgPrice: 52,
        avgOccupancy: 66,
        minPrice: 38,
        maxPrice: 75
      },
      twobed: {
        seasonal: {
          high: { price: 92, occupancy: 74 },
          mid: { price: 76, occupancy: 64 },
          low: { price: 64, occupancy: 54 }
        },
        avgPrice: 76,
        avgOccupancy: 64,
        minPrice: 52,
        maxPrice: 108
      },
      threebed: {
        seasonal: {
          high: { price: 135, occupancy: 71 },
          mid: { price: 112, occupancy: 61 },
          low: { price: 95, occupancy: 51 }
        },
        avgPrice: 112,
        avgOccupancy: 61,
        minPrice: 80,
        maxPrice: 155
      }
    }
  },

  palma: {
    city: 'palma',
    displayName: 'Palma de Mallorca',
    country: 'España',
    seasonality: {
      high: ['Jun', 'Jul', 'Ago', 'Sep'],  // Verano
      mid: ['May', 'Oct'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 115, occupancy: 88 },
          mid: { price: 85, occupancy: 78 },
          low: { price: 65, occupancy: 68 }
        },
        avgPrice: 85,
        avgOccupancy: 78,
        minPrice: 60,
        maxPrice: 125
      },
      onebed: {
        seasonal: {
          high: { price: 155, occupancy: 90 },
          mid: { price: 115, occupancy: 80 },
          low: { price: 88, occupancy: 70 }
        },
        avgPrice: 115,
        avgOccupancy: 80,
        minPrice: 85,
        maxPrice: 165
      },
      twobed: {
        seasonal: {
          high: { price: 220, occupancy: 88 },
          mid: { price: 165, occupancy: 78 },
          low: { price: 128, occupancy: 68 }
        },
        avgPrice: 165,
        avgOccupancy: 78,
        minPrice: 120,
        maxPrice: 235
      },
      threebed: {
        seasonal: {
          high: { price: 325, occupancy: 85 },
          mid: { price: 245, occupancy: 75 },
          low: { price: 190, occupancy: 65 }
        },
        avgPrice: 245,
        avgOccupancy: 75,
        minPrice: 180,
        maxPrice: 340
      }
    }
  },

  ibiza: {
    city: 'ibiza',
    displayName: 'Ibiza',
    country: 'España',
    seasonality: {
      high: ['Jun', 'Jul', 'Ago', 'Sep'],  // Temporada de fiesta
      mid: ['May', 'Oct'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 175, occupancy: 90 },
          mid: { price: 120, occupancy: 80 },
          low: { price: 85, occupancy: 70 }
        },
        avgPrice: 120,
        avgOccupancy: 80,
        minPrice: 90,
        maxPrice: 180
      },
      onebed: {
        seasonal: {
          high: { price: 240, occupancy: 92 },
          mid: { price: 165, occupancy: 82 },
          low: { price: 118, occupancy: 72 }
        },
        avgPrice: 165,
        avgOccupancy: 82,
        minPrice: 125,
        maxPrice: 240
      },
      twobed: {
        seasonal: {
          high: { price: 350, occupancy: 90 },
          mid: { price: 240, occupancy: 80 },
          low: { price: 172, occupancy: 70 }
        },
        avgPrice: 240,
        avgOccupancy: 80,
        minPrice: 180,
        maxPrice: 340
      },
      threebed: {
        seasonal: {
          high: { price: 510, occupancy: 88 },
          mid: { price: 350, occupancy: 78 },
          low: { price: 252, occupancy: 68 }
        },
        avgPrice: 350,
        avgOccupancy: 78,
        minPrice: 260,
        maxPrice: 480
      }
    }
  },

  gijon: {
    city: 'gijon',
    displayName: 'Gijón',
    country: 'España',
    seasonality: {
      high: ['Jul', 'Ago'],  // Verano
      mid: ['Jun', 'Sep'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Oct', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 58, occupancy: 76 },
          mid: { price: 45, occupancy: 66 },
          low: { price: 37, occupancy: 56 }
        },
        avgPrice: 45,
        avgOccupancy: 66,
        minPrice: 32,
        maxPrice: 65
      },
      onebed: {
        seasonal: {
          high: { price: 75, occupancy: 78 },
          mid: { price: 58, occupancy: 68 },
          low: { price: 48, occupancy: 58 }
        },
        avgPrice: 58,
        avgOccupancy: 68,
        minPrice: 42,
        maxPrice: 85
      },
      twobed: {
        seasonal: {
          high: { price: 110, occupancy: 76 },
          mid: { price: 85, occupancy: 66 },
          low: { price: 70, occupancy: 56 }
        },
        avgPrice: 85,
        avgOccupancy: 66,
        minPrice: 60,
        maxPrice: 120
      },
      threebed: {
        seasonal: {
          high: { price: 162, occupancy: 73 },
          mid: { price: 125, occupancy: 63 },
          low: { price: 103, occupancy: 53 }
        },
        avgPrice: 125,
        avgOccupancy: 63,
        minPrice: 90,
        maxPrice: 175
      }
    }
  },

  salamanca: {
    city: 'salamanca',
    displayName: 'Salamanca',
    country: 'España',
    seasonality: {
      high: ['Sep', 'Oct', 'Dic'],  // Inicio curso + Navidad
      mid: ['May', 'Nov'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Jun', 'Jul', 'Ago']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 46, occupancy: 73 },
          mid: { price: 38, occupancy: 63 },
          low: { price: 32, occupancy: 53 }
        },
        avgPrice: 38,
        avgOccupancy: 63,
        minPrice: 27,
        maxPrice: 55
      },
      onebed: {
        seasonal: {
          high: { price: 60, occupancy: 75 },
          mid: { price: 50, occupancy: 65 },
          low: { price: 42, occupancy: 55 }
        },
        avgPrice: 50,
        avgOccupancy: 65,
        minPrice: 35,
        maxPrice: 72
      },
      twobed: {
        seasonal: {
          high: { price: 88, occupancy: 73 },
          mid: { price: 73, occupancy: 63 },
          low: { price: 61, occupancy: 53 }
        },
        avgPrice: 73,
        avgOccupancy: 63,
        minPrice: 50,
        maxPrice: 105
      },
      threebed: {
        seasonal: {
          high: { price: 130, occupancy: 70 },
          mid: { price: 108, occupancy: 60 },
          low: { price: 90, occupancy: 50 }
        },
        avgPrice: 108,
        avgOccupancy: 60,
        minPrice: 75,
        maxPrice: 150
      }
    }
  },

  santiago: {
    city: 'santiago',
    displayName: 'Santiago de Compostela',
    country: 'España',
    seasonality: {
      high: ['Jul', 'Ago', 'Sep'],  // Camino de Santiago
      mid: ['May', 'Jun', 'Oct'],
      low: ['Ene', 'Feb', 'Mar', 'Abr', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 52, occupancy: 77 },
          mid: { price: 42, occupancy: 67 },
          low: { price: 35, occupancy: 57 }
        },
        avgPrice: 42,
        avgOccupancy: 67,
        minPrice: 30,
        maxPrice: 60
      },
      onebed: {
        seasonal: {
          high: { price: 68, occupancy: 79 },
          mid: { price: 55, occupancy: 69 },
          low: { price: 46, occupancy: 59 }
        },
        avgPrice: 55,
        avgOccupancy: 69,
        minPrice: 40,
        maxPrice: 80
      },
      twobed: {
        seasonal: {
          high: { price: 98, occupancy: 77 },
          mid: { price: 80, occupancy: 67 },
          low: { price: 66, occupancy: 57 }
        },
        avgPrice: 80,
        avgOccupancy: 67,
        minPrice: 55,
        maxPrice: 115
      },
      threebed: {
        seasonal: {
          high: { price: 145, occupancy: 74 },
          mid: { price: 118, occupancy: 64 },
          low: { price: 98, occupancy: 54 }
        },
        avgPrice: 118,
        avgOccupancy: 64,
        minPrice: 85,
        maxPrice: 165
      }
    }
  },

  cadiz: {
    city: 'cadiz',
    displayName: 'Cádiz',
    country: 'España',
    seasonality: {
      high: ['Feb', 'Jul', 'Ago', 'Sep'],  // Carnaval + verano
      mid: ['Jun', 'Oct'],
      low: ['Ene', 'Mar', 'Abr', 'May', 'Nov', 'Dic']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 68, occupancy: 82 },
          mid: { price: 52, occupancy: 72 },
          low: { price: 42, occupancy: 62 }
        },
        avgPrice: 52,
        avgOccupancy: 72,
        minPrice: 38,
        maxPrice: 75
      },
      onebed: {
        seasonal: {
          high: { price: 88, occupancy: 84 },
          mid: { price: 68, occupancy: 74 },
          low: { price: 55, occupancy: 64 }
        },
        avgPrice: 68,
        avgOccupancy: 74,
        minPrice: 48,
        maxPrice: 98
      },
      twobed: {
        seasonal: {
          high: { price: 128, occupancy: 82 },
          mid: { price: 98, occupancy: 72 },
          low: { price: 79, occupancy: 62 }
        },
        avgPrice: 98,
        avgOccupancy: 72,
        minPrice: 68,
        maxPrice: 140
      },
      threebed: {
        seasonal: {
          high: { price: 190, occupancy: 79 },
          mid: { price: 145, occupancy: 69 },
          low: { price: 117, occupancy: 59 }
        },
        avgPrice: 145,
        avgOccupancy: 69,
        minPrice: 105,
        maxPrice: 200
      }
    }
  },

  toledo: {
    city: 'toledo',
    displayName: 'Toledo',
    country: 'España',
    seasonality: {
      high: ['May', 'Sep', 'Oct', 'Dic'],  // Primavera, otoño, Navidad
      mid: ['Abr', 'Nov'],
      low: ['Ene', 'Feb', 'Mar', 'Jun', 'Jul', 'Ago']
    },
    propertyTypes: {
      studio: {
        seasonal: {
          high: { price: 48, occupancy: 74 },
          mid: { price: 40, occupancy: 64 },
          low: { price: 34, occupancy: 54 }
        },
        avgPrice: 40,
        avgOccupancy: 64,
        minPrice: 28,
        maxPrice: 58
      },
      onebed: {
        seasonal: {
          high: { price: 63, occupancy: 76 },
          mid: { price: 52, occupancy: 66 },
          low: { price: 44, occupancy: 56 }
        },
        avgPrice: 52,
        avgOccupancy: 66,
        minPrice: 38,
        maxPrice: 75
      },
      twobed: {
        seasonal: {
          high: { price: 92, occupancy: 74 },
          mid: { price: 76, occupancy: 64 },
          low: { price: 64, occupancy: 54 }
        },
        avgPrice: 76,
        avgOccupancy: 64,
        minPrice: 52,
        maxPrice: 108
      },
      threebed: {
        seasonal: {
          high: { price: 135, occupancy: 71 },
          mid: { price: 112, occupancy: 61 },
          low: { price: 95, occupancy: 51 }
        },
        avgPrice: 112,
        avgOccupancy: 61,
        minPrice: 80,
        maxPrice: 155
      }
    }
  }
}

// Helper para obtener lista de ciudades
export const CITIES = Object.keys(MARKET_DATA).map(key => ({
  value: key,
  label: MARKET_DATA[key].displayName
}))

// Helper para calcular potencial de ingresos
export function calculatePotential(
  city: string,
  propertyType: 'studio' | 'onebed' | 'twobed' | 'threebed',
  currentPrice: number,
  currentOccupancy: number
) {
  const market = MARKET_DATA[city]

  if (!market) {
    return null
  }

  const stats = market.propertyTypes[propertyType]

  // Ingresos actuales mensuales
  const currentMonthlyRevenue = currentPrice * (currentOccupancy / 100) * 30

  // Ingresos potenciales del mercado (promedio anual)
  const marketMonthlyRevenue = stats.avgPrice * (stats.avgOccupancy / 100) * 30

  // Diferencia
  const potentialGain = marketMonthlyRevenue - currentMonthlyRevenue

  // Calcular ingresos por temporada
  const revenueBySeaason = {
    high: Math.round(stats.seasonal.high.price * (stats.seasonal.high.occupancy / 100) * 30),
    mid: Math.round(stats.seasonal.mid.price * (stats.seasonal.mid.occupancy / 100) * 30),
    low: Math.round(stats.seasonal.low.price * (stats.seasonal.low.occupancy / 100) * 30)
  }

  return {
    currentMonthlyRevenue: Math.round(currentMonthlyRevenue),
    marketMonthlyRevenue: Math.round(marketMonthlyRevenue),
    potentialGain: Math.round(potentialGain),
    suggestedPrice: stats.avgPrice,
    suggestedOccupancy: stats.avgOccupancy,
    priceRange: {
      min: stats.minPrice,
      max: stats.maxPrice
    },
    seasonal: {
      high: {
        price: stats.seasonal.high.price,
        occupancy: stats.seasonal.high.occupancy,
        revenue: revenueBySeaason.high,
        months: market.seasonality.high
      },
      mid: {
        price: stats.seasonal.mid.price,
        occupancy: stats.seasonal.mid.occupancy,
        revenue: revenueBySeaason.mid,
        months: market.seasonality.mid
      },
      low: {
        price: stats.seasonal.low.price,
        occupancy: stats.seasonal.low.occupancy,
        revenue: revenueBySeaason.low,
        months: market.seasonality.low
      }
    },
    neighborhoods: market.neighborhoods || null
  }
}
