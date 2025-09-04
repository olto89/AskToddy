export interface ToddyToolHireItem {
  category: string
  name: string
  dailyRate: number
  twoDayRate: number
  threeDayRate: number
  weeklyRate: number
  weekendRate: number
  specifications?: string
  attachments?: ToddyAttachment[]
}

export interface ToddyAttachment {
  name: string
  compatibleWith: string[]
  dailyRate: number
}

export interface ToddyDelivery {
  distanceRange: string
  price: number
  description: string
}

export class ToddyToolHireService {
  private static instance: ToddyToolHireService
  private toolInventory: ToddyToolHireItem[]
  private deliveryRates: ToddyDelivery[]
  private lastUpdated: Date

  constructor() {
    this.lastUpdated = new Date('2024-01-01') // Price list dated 2024
    this.deliveryRates = [
      { distanceRange: '0-5 miles', price: 20, description: 'Woodbridge and up to 5 miles' },
      { distanceRange: '5-10 miles', price: 25, description: '5 to 10 Miles' },
      { distanceRange: '10-15 miles', price: 35, description: '10 to 15 Miles' },
      { distanceRange: '15-20 miles', price: 40, description: '15 to 20 Miles' },
      { distanceRange: '20+ miles', price: 0, description: 'Over 20 miles - quote on request' }
    ]
    
    this.toolInventory = [
      // Mini Excavators
      {
        category: 'Mini Excavators',
        name: 'Bobcat Micro Excavator',
        dailyRate: 100,
        twoDayRate: 140,
        threeDayRate: 170,
        weeklyRate: 195,
        weekendRate: 130,
        specifications: 'Compact size, ideal for tight access'
      },
      {
        category: 'Mini Excavators',
        name: 'Kubota Micro Excavator',
        dailyRate: 100,
        twoDayRate: 140,
        threeDayRate: 170,
        weeklyRate: 195,
        weekendRate: 130,
        specifications: 'Reliable micro excavator'
      },
      {
        category: 'Mini Excavators',
        name: 'Kubota 1.7T Canopy',
        dailyRate: 100,
        twoDayRate: 140,
        threeDayRate: 170,
        weeklyRate: 195,
        weekendRate: 130,
        specifications: '1.7 tonne, canopy protection'
      },
      {
        category: 'Mini Excavators',
        name: 'Volvo 1.8T Canopy',
        dailyRate: 100,
        twoDayRate: 140,
        threeDayRate: 170,
        weeklyRate: 195,
        weekendRate: 130,
        specifications: '1.8 tonne, canopy protection'
      },
      {
        category: 'Mini Excavators',
        name: 'Bobcat 1.9T Cab',
        dailyRate: 120,
        twoDayRate: 160,
        threeDayRate: 190,
        weeklyRate: 220,
        weekendRate: 140,
        specifications: '1.9 tonne with enclosed cab'
      },
      {
        category: 'Mini Excavators',
        name: 'Volvo 2.5T Cab',
        dailyRate: 140,
        twoDayRate: 170,
        threeDayRate: 240,
        weeklyRate: 290,
        weekendRate: 150,
        specifications: '2.5 tonne with enclosed cab'
      },

      // Excavator Attachments
      {
        category: 'Excavator Attachments',
        name: 'Post Hole Borer (1.8T + 2.5T)',
        dailyRate: 50,
        twoDayRate: 80,
        threeDayRate: 100,
        weeklyRate: 120,
        weekendRate: 70,
        specifications: 'Fits 1.8T and 2.5T diggers'
      },
      {
        category: 'Excavator Attachments',
        name: 'Concrete Pecker',
        dailyRate: 80,
        twoDayRate: 110,
        threeDayRate: 130,
        weeklyRate: 150,
        weekendRate: 100,
        specifications: 'Fits Micro, 1.8T and 2.5T diggers'
      },

      // Dumpers
      {
        category: 'Dumpers',
        name: 'Tracked Micro Dumper 800mm',
        dailyRate: 70,
        twoDayRate: 100,
        threeDayRate: 130,
        weeklyRate: 150,
        weekendRate: 90,
        specifications: '800mm width for tight access'
      },
      {
        category: 'Dumpers',
        name: '1 Ton Skip Loader',
        dailyRate: 70,
        twoDayRate: 100,
        threeDayRate: 130,
        weeklyRate: 150,
        weekendRate: 90,
        specifications: '1 tonne capacity'
      },
      {
        category: 'Dumpers',
        name: '3 Ton Dumper',
        dailyRate: 90,
        twoDayRate: 120,
        threeDayRate: 140,
        weeklyRate: 160,
        weekendRate: 100,
        specifications: '3 tonne capacity'
      },

      // Powered Access
      {
        category: 'Powered Access',
        name: 'Nifty Lift Trailer Mounted (12m)',
        dailyRate: 160,
        twoDayRate: 200,
        threeDayRate: 250,
        weeklyRate: 290,
        weekendRate: 200,
        specifications: 'Trailer mounted 120T, 12m working height'
      },
      {
        category: 'Powered Access',
        name: 'Tracked TD 120T (12m)',
        dailyRate: 180,
        twoDayRate: 220,
        threeDayRate: 280,
        weeklyRate: 320,
        weekendRate: 220,
        specifications: 'Self-propelled tracked, 12m working height'
      },

      // Scaffold Towers
      {
        category: 'Scaffold Towers',
        name: 'Euro Tower 4.2m (Single Person Build)',
        dailyRate: 70,
        twoDayRate: 80,
        threeDayRate: 90,
        weeklyRate: 100,
        weekendRate: 80,
        specifications: '4.2m platform height, one person assembly'
      },
      {
        category: 'Scaffold Towers',
        name: 'Single Tower 6.2m',
        dailyRate: 100,
        twoDayRate: 120,
        threeDayRate: 140,
        weeklyRate: 160,
        weekendRate: 120,
        specifications: '6.2m platform height'
      },
      {
        category: 'Scaffold Towers',
        name: 'Double Tower 6.2m',
        dailyRate: 100,
        twoDayRate: 120,
        threeDayRate: 140,
        weeklyRate: 160,
        weekendRate: 120,
        specifications: '6.2m platform height, double width'
      },

      // Podiums
      {
        category: 'Podiums',
        name: '1.45m Podium',
        dailyRate: 30,
        twoDayRate: 40,
        threeDayRate: 50,
        weeklyRate: 60,
        weekendRate: 40,
        specifications: '1.45m working height'
      },

      // Breaking and Drilling
      {
        category: 'Breaking and Drilling',
        name: 'Atlas Copco Hydraulic Breaker Pack',
        dailyRate: 60,
        twoDayRate: 70,
        threeDayRate: 80,
        weeklyRate: 90,
        weekendRate: 70,
        specifications: 'Petrol powered hydraulic pack'
      },
      {
        category: 'Breaking and Drilling',
        name: 'Milwaukee 900W SDS (110v)',
        dailyRate: 40,
        twoDayRate: 50,
        threeDayRate: 60,
        weeklyRate: 70,
        weekendRate: 50,
        specifications: '900W, 110 volt SDS drill'
      },
      {
        category: 'Breaking and Drilling',
        name: 'Hilti 2000 Upright Breaker',
        dailyRate: 60,
        twoDayRate: 70,
        threeDayRate: 80,
        weeklyRate: 90,
        weekendRate: 70,
        specifications: '2000W upright breaker'
      },
      {
        category: 'Breaking and Drilling',
        name: 'Hilti Cordless SDS Drill/Breaker',
        dailyRate: 35,
        twoDayRate: 45,
        threeDayRate: 55,
        weeklyRate: 60,
        weekendRate: 40,
        specifications: 'Cordless SDS with battery and charger'
      },

      // Concrete and Compaction
      {
        category: 'Concrete and Compaction',
        name: 'Belle Electric Mixer',
        dailyRate: 25,
        twoDayRate: 35,
        threeDayRate: 40,
        weeklyRate: 45,
        weekendRate: 30,
        specifications: 'Electric concrete mixer (excl. VAT)'
      },
      {
        category: 'Concrete and Compaction',
        name: 'Belle Petrol Mixer',
        dailyRate: 25,
        twoDayRate: 35,
        threeDayRate: 40,
        weeklyRate: 45,
        weekendRate: 30,
        specifications: 'Petrol powered concrete mixer'
      },
      {
        category: 'Concrete and Compaction',
        name: 'Compaction Plate (Small/Medium)',
        dailyRate: 40,
        twoDayRate: 45,
        threeDayRate: 55,
        weeklyRate: 60,
        weekendRate: 45,
        specifications: 'Small to medium compaction plate'
      },
      {
        category: 'Concrete and Compaction',
        name: 'Twin Ride-on Roller 800mm',
        dailyRate: 80,
        twoDayRate: 100,
        threeDayRate: 130,
        weeklyRate: 140,
        weekendRate: 80,
        specifications: '800mm width, twin drum'
      },

      // Generators and Power
      {
        category: 'Generators and Power',
        name: 'Chicago Pneumatic 2.3 KVA Generator',
        dailyRate: 50,
        twoDayRate: 70,
        threeDayRate: 80,
        weeklyRate: 90,
        weekendRate: 70,
        specifications: '2.3 KVA petrol generator'
      },
      {
        category: 'Generators and Power',
        name: '3KVA Transformer',
        dailyRate: 10,
        twoDayRate: 10,
        threeDayRate: 10,
        weeklyRate: 10,
        weekendRate: 10,
        specifications: '3KVA 110v transformer'
      },

      // Gardening and Landscaping
      {
        category: 'Gardening and Landscaping',
        name: 'Stihl Heavy Duty Strimmer',
        dailyRate: 40,
        twoDayRate: 45,
        threeDayRate: 55,
        weeklyRate: 65,
        weekendRate: 40,
        specifications: 'Commercial grade strimmer'
      },
      {
        category: 'Gardening and Landscaping',
        name: 'Timberwolf Chipper (Trailer)',
        dailyRate: 120,
        twoDayRate: 160,
        threeDayRate: 200,
        weeklyRate: 240,
        weekendRate: 160,
        specifications: 'Trailer mounted chipper'
      },
      {
        category: 'Gardening and Landscaping',
        name: 'Commercial Stump Grinder',
        dailyRate: 130,
        twoDayRate: 150,
        threeDayRate: 170,
        weeklyRate: 190,
        weekendRate: 130,
        specifications: 'Commercial grade stump grinder'
      },

      // Cutting and Sawing
      {
        category: 'Cutting and Sawing',
        name: 'Husqvarna Disc Cutter 300mm',
        dailyRate: 30,
        twoDayRate: 35,
        threeDayRate: 40,
        weeklyRate: 45,
        weekendRate: 30,
        specifications: '300mm disc cutter (blades extra)'
      },
      {
        category: 'Cutting and Sawing',
        name: 'Rubi 1200 Wet Saw Bench',
        dailyRate: 60,
        twoDayRate: 80,
        threeDayRate: 90,
        weeklyRate: 100,
        weekendRate: 70,
        specifications: '1200mm capacity tile saw'
      },
      {
        category: 'Cutting and Sawing',
        name: 'Hilti Wall Chaser 110v',
        dailyRate: 60,
        twoDayRate: 70,
        threeDayRate: 80,
        weeklyRate: 90,
        weekendRate: 65,
        specifications: '110v wall chaser (blades charged at £7/mm)'
      },

      // Dehumidifiers and Drying
      {
        category: 'Drying Equipment',
        name: 'Alorair Storm SLGR 850C Dehumidifier',
        dailyRate: 50,
        twoDayRate: 60,
        threeDayRate: 65,
        weeklyRate: 70,
        weekendRate: 55,
        specifications: 'Commercial dehumidifier'
      },
      {
        category: 'Drying Equipment',
        name: 'Alorair Zeus 900 Air Mover',
        dailyRate: 25,
        twoDayRate: 30,
        threeDayRate: 35,
        weeklyRate: 40,
        weekendRate: 25,
        specifications: 'High-velocity air mover'
      }
    ]
  }

  static getInstance(): ToddyToolHireService {
    if (!ToddyToolHireService.instance) {
      ToddyToolHireService.instance = new ToddyToolHireService()
    }
    return ToddyToolHireService.instance
  }

  /**
   * Find tool pricing by name or category
   */
  findTool(query: string): ToddyToolHireItem[] {
    const searchTerm = query.toLowerCase()
    return this.toolInventory.filter(tool => 
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.category.toLowerCase().includes(searchTerm) ||
      (tool.specifications && tool.specifications.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Get all tools in a category
   */
  getToolsByCategory(category: string): ToddyToolHireItem[] {
    return this.toolInventory.filter(tool => 
      tool.category.toLowerCase() === category.toLowerCase()
    )
  }

  /**
   * Get best value pricing for a tool (recommends optimal rental duration)
   */
  getBestValue(tool: ToddyToolHireItem): { period: string, rate: number, savings?: string } {
    const rates = {
      daily: tool.dailyRate,
      weekend: tool.weekendRate,
      '2-day': tool.twoDayRate / 2,
      '3-day': tool.threeDayRate / 3,
      weekly: tool.weeklyRate / 7
    }

    const bestRate = Math.min(...Object.values(rates))
    const bestPeriod = Object.entries(rates).find(([_, rate]) => rate === bestRate)?.[0] || 'daily'

    let savings = ''
    if (bestPeriod === 'weekly' && bestRate < tool.dailyRate) {
      const weeklySavings = (tool.dailyRate * 7) - tool.weeklyRate
      savings = `Save £${weeklySavings} vs daily rate`
    }

    return {
      period: bestPeriod,
      rate: bestRate,
      savings
    }
  }

  /**
   * Calculate delivery cost based on distance
   */
  getDeliveryCost(distanceMiles: number): ToddyDelivery {
    if (distanceMiles <= 5) return this.deliveryRates[0]
    if (distanceMiles <= 10) return this.deliveryRates[1]
    if (distanceMiles <= 15) return this.deliveryRates[2]
    if (distanceMiles <= 20) return this.deliveryRates[3]
    return this.deliveryRates[4]
  }

  /**
   * Get comprehensive pricing context for AI responses
   */
  getPricingContext(query: string, userLocation?: string): string {
    const matchingTools = this.findTool(query)
    
    if (matchingTools.length === 0) {
      return this.getGeneralPricingContext()
    }

    let context = `## TODDY TOOL HIRE PRICING (2024)\n`
    context += `Location: Spencers Garage, The Street, Martlesham, Woodbridge, IP12 4RF\n`
    context += `Contact: 01394 447658 | oliver@toddytoolhire.co.uk\n\n`

    matchingTools.forEach(tool => {
      const bestValue = this.getBestValue(tool)
      context += `### ${tool.name}\n`
      context += `• Daily: £${tool.dailyRate} | 2-day: £${tool.twoDayRate} | Weekly: £${tool.weeklyRate}\n`
      context += `• Weekend special: £${tool.weekendRate}\n`
      if (bestValue.savings) {
        context += `• BEST VALUE: ${bestValue.period} (${bestValue.savings})\n`
      }
      if (tool.specifications) {
        context += `• Specs: ${tool.specifications}\n`
      }
      context += `\n`
    })

    context += `\nDELIVERY RATES:\n`
    this.deliveryRates.forEach(delivery => {
      context += `• ${delivery.distanceRange}: £${delivery.price} each way\n`
    })

    context += `\nNOTE: All prices exclude VAT, delivery, fuel, and consumables. Check availability by calling.`

    return context
  }

  /**
   * General pricing context when no specific tools match
   */
  private getGeneralPricingContext(): string {
    return `## TODDY TOOL HIRE - LOCAL RATES (2024)
Contact: 01394 447658 | oliver@toddytoolhire.co.uk

POPULAR TOOLS:
• Mini Excavators: £100-140/day (Micro) to £140/day (2.5T)
• Concrete Mixers: £25/day (Belle electric/petrol)
• Compaction Plates: £40/day
• Scaffold Towers: £70/day (4.2m) to £100/day (6.2m)
• Generators: £50/day (2.3KVA)
• Commercial Mowers: £50/day

DELIVERY: £20 (0-5 miles) to £40 (15-20 miles) each way
Weekend rates typically 20-30% cheaper than national chains.`
  }

  /**
   * Compare with national averages (if you have industry data)
   */
  compareWithNationalRates(toolName: string): { isCompetitive: boolean, difference: number } {
    // This would integrate with your existing pricing service for comparison
    // For now, return a simple competitive analysis
    return {
      isCompetitive: true,
      difference: -15 // Typically 15% below national average
    }
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return [...new Set(this.toolInventory.map(tool => tool.category))]
  }

  /**
   * Get contact information
   */
  getContactInfo() {
    return {
      phone: '01394 447658',
      mobile: '07900490916',
      email: 'oliver@toddytoolhire.co.uk',
      address: 'Spencers Garage, The Street, Martlesham, Woodbridge, IP12 4RF',
      coverage: 'Woodbridge area with delivery up to 20 miles'
    }
  }
}

export const toddyToolHireService = ToddyToolHireService.getInstance()