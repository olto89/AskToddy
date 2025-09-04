export interface UserLocation {
  city: string
  region: string
  country: string
  postcode?: string
  distanceFromTTH?: number
  isInTTHCoverage: boolean
}

export interface ToolHireCompetitor {
  name: string
  phone: string
  website?: string
  coverage: string[]
  specialties: string[]
  priceComparison: 'similar' | 'higher' | 'lower' | 'unknown'
}

export class SmartLocationService {
  private static instance: SmartLocationService
  private readonly TTH_LOCATION = { lat: 52.0646, lng: 1.2742 } // Martlesham, IP12 4RF
  private readonly TTH_MAX_DELIVERY_MILES = 20

  // Major UK tool hire competitors by region
  private competitors: Record<string, ToolHireCompetitor[]> = {
    'East England': [
      {
        name: 'HSS Hire (Ipswich)',
        phone: '0345 600 1212',
        website: 'hsshire.co.uk',
        coverage: ['Suffolk', 'Norfolk', 'Essex', 'Cambridgeshire'],
        specialties: ['All tools', 'National chain'],
        priceComparison: 'higher'
      },
      {
        name: 'Speedy Hire (Ipswich)',
        phone: '01473 250 250',
        website: 'speedyhire.co.uk',
        coverage: ['Suffolk', 'Norfolk', 'Essex'],
        specialties: ['Construction tools', 'Powered access'],
        priceComparison: 'higher'
      },
      {
        name: 'Brandon Hire Station (Colchester)',
        phone: '01206 793 793',
        website: 'brandonhire.co.uk',
        coverage: ['Essex', 'Suffolk'],
        specialties: ['Plant hire', 'Access equipment'],
        priceComparison: 'similar'
      }
    ],
    'London': [
      {
        name: 'HSS Hire (Multiple locations)',
        phone: '0345 600 1212',
        website: 'hsshire.co.uk',
        coverage: ['Greater London'],
        specialties: ['All tools', 'Same day delivery'],
        priceComparison: 'higher'
      },
      {
        name: 'Speedy Hire (Multiple locations)',
        phone: '0345 609 8888',
        website: 'speedyhire.co.uk',
        coverage: ['Greater London'],
        specialties: ['Construction', 'Event hire'],
        priceComparison: 'higher'
      }
    ],
    'Midlands': [
      {
        name: 'HSS Hire (Birmingham)',
        phone: '0345 600 1212',
        website: 'hsshire.co.uk',
        coverage: ['West Midlands', 'East Midlands'],
        specialties: ['Construction tools', 'Industrial equipment'],
        priceComparison: 'higher'
      },
      {
        name: 'A-Plant (Birmingham)',
        phone: '0121 456 7890',
        website: 'aplant.com',
        coverage: ['Midlands'],
        specialties: ['Plant hire', 'Heavy machinery'],
        priceComparison: 'similar'
      }
    ],
    'North': [
      {
        name: 'HSS Hire (Manchester/Leeds)',
        phone: '0345 600 1212',
        website: 'hsshire.co.uk',
        coverage: ['Greater Manchester', 'West Yorkshire', 'Lancashire'],
        specialties: ['All tools', 'Nationwide coverage'],
        priceComparison: 'higher'
      },
      {
        name: 'GAP Hire Solutions',
        phone: '0800 279 4000',
        website: 'gapgroup.co.uk',
        coverage: ['North England', 'Scotland'],
        specialties: ['Powered access', 'Lifting equipment'],
        priceComparison: 'similar'
      }
    ]
  }

  static getInstance(): SmartLocationService {
    if (!SmartLocationService.instance) {
      SmartLocationService.instance = new SmartLocationService()
    }
    return SmartLocationService.instance
  }

  /**
   * Calculate distance from TTH location (rough estimate)
   */
  calculateDistanceFromTTH(userLocation: string): number {
    // Simple distance estimation based on known UK locations
    const location = userLocation.toLowerCase()
    
    // Close to TTH (0-10 miles)
    if (location.includes('ipswich') || location.includes('woodbridge') || 
        location.includes('felixstowe') || location.includes('martlesham')) {
      return 5
    }
    
    // Regional (10-25 miles)
    if (location.includes('colchester') || location.includes('sudbury') || 
        location.includes('stowmarket') || location.includes('framlingham')) {
      return 15
    }
    
    // Extended region (25-50 miles)
    if (location.includes('norwich') || location.includes('cambridge') || 
        location.includes('chelmsford') || location.includes('bury st edmunds')) {
      return 35
    }
    
    // Outside normal coverage
    return 100
  }

  /**
   * Determine if user is in TTH coverage area
   */
  isInTTHCoverage(userLocation: string): boolean {
    const distance = this.calculateDistanceFromTTH(userLocation)
    return distance <= this.TTH_MAX_DELIVERY_MILES
  }

  /**
   * Get region from user location
   */
  getUserRegion(userLocation: string): string {
    const location = userLocation.toLowerCase()
    
    if (location.includes('london') || location.includes('greater london')) {
      return 'London'
    }
    
    if (location.includes('birmingham') || location.includes('coventry') || 
        location.includes('leicester') || location.includes('nottingham')) {
      return 'Midlands'
    }
    
    if (location.includes('manchester') || location.includes('leeds') || 
        location.includes('liverpool') || location.includes('sheffield')) {
      return 'North'
    }
    
    // Default to East England for East Anglia and surrounding areas
    return 'East England'
  }

  /**
   * Get smart recommendations based on user location
   */
  getSmartRecommendations(userLocation: string, toolQuery: string): string {
    const inTTHCoverage = this.isInTTHCoverage(userLocation)
    const distance = this.calculateDistanceFromTTH(userLocation)
    const region = this.getUserRegion(userLocation)
    
    let recommendations = ''
    
    if (inTTHCoverage) {
      // User is in TTH coverage - lead with TTH
      const deliveryCost = this.getDeliveryCostForDistance(distance)
      recommendations += `## BEST LOCAL OPTION:\n`
      recommendations += `**Toddy Tool Hire** (${distance} miles from you)\n`
      recommendations += `📞 01394 447658 | oliver@toddytoolhire.co.uk\n`
      recommendations += `🚚 Delivery: £${deliveryCost} each way\n`
      recommendations += `💰 Typically 15-25% cheaper than national chains\n\n`
      
      // Also mention alternatives
      const regionCompetitors = this.competitors[region] || []
      if (regionCompetitors.length > 0) {
        recommendations += `## ALTERNATIVE OPTIONS:\n`
        regionCompetitors.slice(0, 2).forEach(competitor => {
          recommendations += `• **${competitor.name}** - ${competitor.phone}\n`
        })
      }
    } else {
      // User is outside TTH coverage - recommend regional suppliers
      recommendations += `## LOCAL TOOL HIRE OPTIONS:\n`
      const regionCompetitors = this.competitors[region] || this.competitors['East England']
      
      regionCompetitors.forEach(competitor => {
        recommendations += `• **${competitor.name}** - ${competitor.phone}\n`
        if (competitor.website) {
          recommendations += `  Website: ${competitor.website}\n`
        }
      })
      
      recommendations += `\n💡 For better rates, search "${toolQuery} hire near me" - local independents often 20-30% cheaper than chains.\n`
    }
    
    return recommendations
  }

  /**
   * Get delivery cost for specific distance
   */
  private getDeliveryCostForDistance(miles: number): number {
    if (miles <= 5) return 20
    if (miles <= 10) return 25
    if (miles <= 15) return 35
    if (miles <= 20) return 40
    return 0 // Quote required
  }

  /**
   * Extract location from user message
   */
  extractLocationFromMessage(message: string): string | null {
    const locationPatterns = [
      /(?:in|near|around)\s+([A-Za-z\s]+?)(?:\s|$|,|\?|!)/i,
      /(?:from|at)\s+([A-Z][A-Za-z\s]+?)(?:\s|$|,|\?|!)/i,
      /([A-Z][A-Za-z\s]*(?:shire|sex|folk|don|ham|wich|bridge|pool|chester|ford))/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  /**
   * Generate location-aware context for AI
   */
  getLocationAwareContext(message: string): string {
    const extractedLocation = this.extractLocationFromMessage(message)
    
    if (!extractedLocation) {
      // No location mentioned - assume they want general UK advice but lead with TTH
      return `## LOCATION NOTE:\nUser hasn't specified location. Lead with Toddy Tool Hire (Suffolk) but mention checking for local suppliers in their area for potential savings.\n\n`
    }
    
    return this.getSmartRecommendations(extractedLocation, message)
  }
}

export const smartLocationService = SmartLocationService.getInstance()