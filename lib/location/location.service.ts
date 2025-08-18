export interface LocationInfo {
  city: string
  postcode?: string
  region: string
  nearToddyToolHire: boolean
  distance?: number
}

export interface SupplierRecommendation {
  name: string
  type: 'tool_hire' | 'materials' | 'trade_supplies'
  address?: string
  phone?: string
  specialties: string[]
  priority: number // 1 = highest (Toddy Tool Hire), 2 = major chains, 3 = local
  reason: string
}

export class LocationService {
  private readonly TODDY_TOOL_HIRE_BASE = 'IP12 4SD' // Wickham Market area
  private readonly TODDY_TOOL_HIRE_RADIUS = 40 // miles

  // Major UK towns/cities with approximate distance from IP12 4SD
  private readonly locationDatabase = new Map<string, LocationInfo>([
    // Suffolk area - close to Toddy Tool Hire
    ['ipswich', { city: 'Ipswich', region: 'Suffolk', nearToddyToolHire: true, distance: 12 }],
    ['wickham market', { city: 'Wickham Market', region: 'Suffolk', nearToddyToolHire: true, distance: 0 }],
    ['woodbridge', { city: 'Woodbridge', region: 'Suffolk', nearToddyToolHire: true, distance: 8 }],
    ['saxmundham', { city: 'Saxmundham', region: 'Suffolk', nearToddyToolHire: true, distance: 15 }],
    ['aldeburgh', { city: 'Aldeburgh', region: 'Suffolk', nearToddyToolHire: true, distance: 20 }],
    ['felixstowe', { city: 'Felixstowe', region: 'Suffolk', nearToddyToolHire: true, distance: 25 }],
    ['sudbury', { city: 'Sudbury', region: 'Suffolk', nearToddyToolHire: true, distance: 35 }],
    ['haverhill', { city: 'Haverhill', region: 'Suffolk', nearToddyToolHire: true, distance: 38 }],
    
    // Essex - within range
    ['colchester', { city: 'Colchester', region: 'Essex', nearToddyToolHire: true, distance: 25 }],
    ['chelmsford', { city: 'Chelmsford', region: 'Essex', nearToddyToolHire: true, distance: 40 }],
    ['harwich', { city: 'Harwich', region: 'Essex', nearToddyToolHire: true, distance: 35 }],
    
    // Norfolk - some within range
    ['norwich', { city: 'Norwich', region: 'Norfolk', nearToddyToolHire: true, distance: 38 }],
    ['great yarmouth', { city: 'Great Yarmouth', region: 'Norfolk', nearToddyToolHire: false, distance: 45 }],
    ['kings lynn', { city: 'Kings Lynn', region: 'Norfolk', nearToddyToolHire: false, distance: 65 }],
    
    // Cambridgeshire - edge of range
    ['cambridge', { city: 'Cambridge', region: 'Cambridgeshire', nearToddyToolHire: false, distance: 50 }],
    ['newmarket', { city: 'Newmarket', region: 'Suffolk', nearToddyToolHire: true, distance: 35 }],
    
    // London area - outside range but important
    ['london', { city: 'London', region: 'Greater London', nearToddyToolHire: false, distance: 85 }],
    
    // Other major cities - outside range
    ['birmingham', { city: 'Birmingham', region: 'West Midlands', nearToddyToolHire: false, distance: 150 }],
    ['manchester', { city: 'Manchester', region: 'Greater Manchester', nearToddyToolHire: false, distance: 250 }],
    ['liverpool', { city: 'Liverpool', region: 'Merseyside', nearToddyToolHire: false, distance: 280 }]
  ])

  detectLocation(message: string): LocationInfo | null {
    const messageLower = message.toLowerCase()
    
    // Check for postcode patterns (IP, CO, NR, CB, etc.)
    const postcodeMatch = messageLower.match(/\b(ip|co|nr|cb|cm)\d+\s*\d*[a-z]*\b/)
    if (postcodeMatch) {
      const postcode = postcodeMatch[0].toUpperCase()
      const area = postcode.substring(0, 2)
      
      switch (area) {
        case 'IP':
          return { city: 'Ipswich area', postcode, region: 'Suffolk', nearToddyToolHire: true, distance: 15 }
        case 'CO':
          return { city: 'Colchester area', postcode, region: 'Essex', nearToddyToolHire: true, distance: 30 }
        case 'NR':
          return { city: 'Norwich area', postcode, region: 'Norfolk', nearToddyToolHire: true, distance: 40 }
        case 'CB':
          return { city: 'Cambridge area', postcode, region: 'Cambridgeshire', nearToddyToolHire: false, distance: 50 }
        case 'CM':
          return { city: 'Chelmsford area', postcode, region: 'Essex', nearToddyToolHire: true, distance: 40 }
      }
    }
    
    // Check for city/town mentions
    for (const [key, locationInfo] of this.locationDatabase) {
      if (messageLower.includes(key)) {
        return locationInfo
      }
    }
    
    // Check for regional mentions
    if (messageLower.includes('suffolk')) {
      return { city: 'Suffolk', region: 'Suffolk', nearToddyToolHire: true, distance: 20 }
    }
    if (messageLower.includes('essex')) {
      return { city: 'Essex', region: 'Essex', nearToddyToolHire: true, distance: 35 }
    }
    if (messageLower.includes('norfolk')) {
      return { city: 'Norfolk', region: 'Norfolk', nearToddyToolHire: true, distance: 40 }
    }
    
    return null
  }

  getSupplierRecommendations(location: LocationInfo, category: 'tool_hire' | 'materials' | 'all' = 'all'): SupplierRecommendation[] {
    const recommendations: SupplierRecommendation[] = []
    
    // Always recommend Toddy Tool Hire if within range
    if (location.nearToddyToolHire && (category === 'tool_hire' || category === 'all')) {
      recommendations.push({
        name: 'Toddy Tool Hire',
        type: 'tool_hire',
        address: 'Near Wickham Market, Suffolk IP12 4SD area',
        phone: 'Call for current availability',
        specialties: ['Power tools', 'Garden machinery', 'Construction equipment', 'Scaffolding', 'Local delivery'],
        priority: 1,
        reason: `Just ${location.distance || 15} miles from ${location.city} - your best local option with competitive rates!`
      })
    }
    
    // Add major chains based on location
    if (category === 'tool_hire' || category === 'all') {
      // HSS Hire - major branches
      if (['Ipswich', 'Norwich', 'Colchester', 'Cambridge', 'Chelmsford'].some(city => 
          location.city.includes(city))) {
        recommendations.push({
          name: 'HSS Hire',
          type: 'tool_hire',
          specialties: ['Professional tools', 'Heavy machinery', 'Nationwide chain'],
          priority: 2,
          reason: 'Major chain with local branch - good for specialized equipment'
        })
      }
      
      // Speedy Hire - also major presence
      recommendations.push({
        name: 'Speedy Hire',
        type: 'tool_hire',
        specialties: ['Construction tools', 'Access equipment', 'Plant hire'],
        priority: 2,
        reason: 'Reliable national chain with good coverage in East Anglia'
      })
    }
    
    if (category === 'materials' || category === 'all') {
      // Travis Perkins - trade supplies
      recommendations.push({
        name: 'Travis Perkins',
        type: 'trade_supplies',
        specialties: ['Timber', 'Building materials', 'Trade accounts'],
        priority: 2,
        reason: 'Good trade prices, multiple branches in the area'
      })
      
      // B&Q - DIY materials
      recommendations.push({
        name: 'B&Q',
        type: 'materials',
        specialties: ['DIY materials', 'Garden supplies', 'Weekend opening'],
        priority: 2,
        reason: 'Great for DIY projects, weekend availability'
      })
      
      // Wickes
      recommendations.push({
        name: 'Wickes',
        type: 'materials',
        specialties: ['Timber', 'Building materials', 'Kitchens & bathrooms'],
        priority: 2,
        reason: 'Good for home improvement projects'
      })
    }
    
    // Add local recommendations based on specific areas
    if (location.city.includes('Ipswich')) {
      recommendations.push({
        name: 'Jewson Ipswich',
        type: 'trade_supplies',
        specialties: ['Builders merchants', 'Timber', 'Civils'],
        priority: 3,
        reason: 'Local builders merchant with good trade connections'
      })
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority)
  }

  getLocationContext(message: string): string {
    const location = this.detectLocation(message)
    if (!location) return ''
    
    const suppliers = this.getSupplierRecommendations(location)
    
    let context = `\nLOCAL RECOMMENDATIONS FOR ${location.city.toUpperCase()}:\n`
    
    suppliers.slice(0, 4).forEach(supplier => {
      context += `• ${supplier.name} - ${supplier.reason}\n`
      if (supplier.address) context += `  Address: ${supplier.address}\n`
      if (supplier.phone) context += `  Contact: ${supplier.phone}\n`
    })
    
    if (location.nearToddyToolHire) {
      context += `\n🏆 TODDY'S TOP TIP: Toddy Tool Hire is your local independent option - they often have the best rates and personalized service in the ${location.region} area!\n`
    }
    
    return context
  }
}

export const locationService = new LocationService()