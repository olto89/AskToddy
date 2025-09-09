/**
 * Tradesperson Recommendation Service
 * Integrates with Google Places API and local partner network to recommend verified tradespeople
 */

import { googlePlacesService } from '../google-places/google-places.service'

export interface Tradesperson {
  id: string
  name: string
  trades: string[]
  rating: number
  reviewCount: number
  location: {
    town: string
    postcode: string
    distance?: number
  }
  contact: {
    phone?: string
    website?: string
    email?: string
  }
  verified: boolean
  accreditations?: string[]
  yearEstablished?: number
  description?: string
  priceIndicator?: 'budget' | 'standard' | 'premium'
  availability?: 'immediate' | 'within_week' | 'within_month' | 'busy'
  source: 'google' | 'local' | 'curated'
}

export interface TradeRecommendationRequest {
  trade: string
  location: string
  postcode?: string
  radius?: number // miles
  minRating?: number
  verified?: boolean
  priceRange?: 'budget' | 'standard' | 'premium' | 'any'
  urgency?: 'immediate' | 'planned' | 'quote_only'
}

export class TradespersonRecommendationService {
  /**
   * Get tradesperson recommendations from multiple sources
   */
  async getRecommendations(request: TradeRecommendationRequest): Promise<Tradesperson[]> {
    try {
      const recommendations: Tradesperson[] = []
      
      // 1. Check local/preferred partners first (Toddy Tool Hire network)
      const localPartners = await this.getLocalPartners(request)
      recommendations.push(...localPartners)
      
      // 2. Try Google Places API (most reliable and cost-effective)
      const googleResults = await this.fetchFromGooglePlaces(request)
      recommendations.push(...googleResults)
      
      // 3. Add static curated recommendations if needed
      if (recommendations.length < 3) {
        const curatedResults = await this.getCuratedRecommendations(request)
        recommendations.push(...curatedResults)
      }
      
      // Sort by rating and distance
      return this.rankRecommendations(recommendations, request)
    } catch (error) {
      console.error('Error fetching tradesperson recommendations:', error)
      return this.getFallbackRecommendations(request)
    }
  }
  
  /**
   * Fetch tradespeople from Google Places API
   */
  private async fetchFromGooglePlaces(request: TradeRecommendationRequest): Promise<Tradesperson[]> {
    try {
      const googleResults = await googlePlacesService.searchBusinesses({
        query: request.trade,
        location: request.location,
        minRating: request.minRating || 4.0,
        openNow: request.urgency === 'immediate'
      })
      
      const tradespeople = await googlePlacesService.convertToTradespeople(googleResults)
      
      return tradespeople.map(business => ({
        id: business.id,
        name: business.name,
        trades: business.trades,
        rating: business.rating,
        reviewCount: business.reviewCount,
        location: {
          town: business.location.address.split(',')[0],
          postcode: '',
          distance: 0
        },
        contact: {
          phone: business.contact.phone,
          website: business.contact.website
        },
        verified: business.verified,
        accreditations: [],
        description: business.reviews?.[0]?.text,
        availability: business.openNow ? 'immediate' : 'within_week',
        source: 'google' as const
      }))
    } catch (error) {
      console.error('Google Places fetch error:', error)
      return []
    }
  }
  
  /**
   * Get local partner tradespeople (Toddy Tool Hire network)
   */
  private async getLocalPartners(request: TradeRecommendationRequest): Promise<Tradesperson[]> {
    // This would connect to your own database of partner tradespeople
    const partners: Tradesperson[] = [
      {
        id: 'toddy_partner_1',
        name: 'Toddy Approved Builders Ltd',
        trades: ['General Building', 'Extensions', 'Renovations'],
        rating: 4.9,
        reviewCount: 127,
        location: {
          town: 'Woodbridge',
          postcode: 'IP12',
          distance: 0
        },
        contact: {
          phone: '01394 123456',
          website: 'https://toddybuilders.co.uk'
        },
        verified: true,
        accreditations: ['FMB', 'TrustMark', 'Toddy Approved'],
        yearEstablished: 2010,
        description: 'Trusted local builders in the Toddy Tool Hire network',
        priceIndicator: 'standard',
        availability: 'within_week',
        source: 'local'
      }
    ]
    
    // Filter by trade and location
    return partners.filter(p => 
      p.trades.some(t => t.toLowerCase().includes(request.trade.toLowerCase()))
    )
  }
  
  /**
   * Get curated recommendations (static fallback data)
   */
  private async getCuratedRecommendations(request: TradeRecommendationRequest): Promise<Tradesperson[]> {
    const curated: Record<string, Tradesperson[]> = {
      'builder': [
        {
          id: 'suffolk_builder_1',
          name: 'Suffolk Building Contractors',
          trades: ['General Building', 'Extensions', 'Bathrooms'],
          rating: 4.8,
          reviewCount: 67,
          location: { town: 'Woodbridge', postcode: 'IP12' },
          contact: { phone: '01394 123 456' },
          verified: true,
          accreditations: ['FMB', 'TrustMark'],
          yearEstablished: 2010,
          source: 'curated'
        },
        {
          id: 'suffolk_builder_2', 
          name: 'East Coast Construction',
          trades: ['Building', 'Renovations', 'Kitchens'],
          rating: 4.6,
          reviewCount: 89,
          location: { town: 'Ipswich', postcode: 'IP1' },
          contact: { phone: '01473 234 567' },
          verified: true,
          accreditations: ['NHBC'],
          source: 'curated'
        },
        {
          id: 'curated_builder_1',
          name: 'Smith & Sons Construction',
          trades: ['General Building', 'Extensions', 'Renovations'],
          rating: 4.7,
          reviewCount: 89,
          location: { town: 'London', postcode: 'SW1' },
          contact: { phone: '020 7123 4567' },
          verified: true,
          accreditations: ['FMB', 'TrustMark'],
          yearEstablished: 2008,
          source: 'curated'
        },
        {
          id: 'curated_builder_2',
          name: 'Premier Building Contractors',
          trades: ['General Building', 'Loft Conversions'],
          rating: 4.9,
          reviewCount: 147,
          location: { town: 'Essex', postcode: 'CM1' },
          contact: { phone: '01245 678 901' },
          verified: true,
          accreditations: ['FMB', 'NHBC'],
          source: 'curated'
        }
      ],
      'electrician': [
        {
          id: 'curated_elec_1',
          name: 'Bright Spark Electrical',
          trades: ['Electrical', 'PAT Testing', 'EICR'],
          rating: 4.8,
          reviewCount: 156,
          location: { town: 'Manchester', postcode: 'M1' },
          contact: { phone: '0161 234 5678' },
          verified: true,
          accreditations: ['NICEIC', 'Part P', '18th Edition'],
          source: 'curated'
        },
        {
          id: 'curated_elec_2',
          name: 'PowerSafe Electricians',
          trades: ['Electrical', 'Emergency Call-outs'],
          rating: 4.7,
          reviewCount: 93,
          location: { town: 'London', postcode: 'E1' },
          contact: { phone: '020 8456 7890' },
          verified: true,
          accreditations: ['NICEIC', 'Trustmark'],
          availability: 'immediate',
          source: 'curated'
        }
      ],
      'plumber': [
        {
          id: 'suffolk_plumb_1',
          name: 'Deben Plumbing & Heating',
          trades: ['Plumbing', 'Heating', 'Bathroom Installation'],
          rating: 4.7,
          reviewCount: 94,
          location: { town: 'Woodbridge', postcode: 'IP12' },
          contact: { phone: '01394 445 678' },
          verified: true,
          accreditations: ['Gas Safe', 'CIPHE'],
          source: 'curated'
        },
        {
          id: 'suffolk_plumb_2',
          name: 'Suffolk Bathroom Solutions',
          trades: ['Bathrooms', 'Tiling', 'Plumbing'],
          rating: 4.9,
          reviewCount: 78,
          location: { town: 'Ipswich', postcode: 'IP4' },
          contact: { phone: '01473 567 890' },
          verified: true,
          accreditations: ['TrustMark', 'CIPHE'],
          source: 'curated'
        },
        {
          id: 'curated_plumb_1',
          name: 'FlowTech Plumbing Services',
          trades: ['Plumbing', 'Heating', 'Bathrooms'],
          rating: 4.6,
          reviewCount: 203,
          location: { town: 'Birmingham', postcode: 'B1' },
          contact: { phone: '0121 345 6789' },
          verified: true,
          accreditations: ['Gas Safe', 'CIPHE', 'WaterSafe'],
          source: 'curated'
        },
        {
          id: 'curated_plumb_2',
          name: 'AquaFlow Plumbing & Heating',
          trades: ['Plumbing', 'Boiler Installation', 'Underfloor Heating'],
          rating: 4.8,
          reviewCount: 178,
          location: { town: 'Bristol', postcode: 'BS1' },
          contact: { phone: '0117 234 5678' },
          verified: true,
          accreditations: ['Gas Safe', 'Worcester Accredited'],
          source: 'curated'
        }
      ],
      'carpenter': [
        {
          id: 'curated_carp_1',
          name: 'Master Carpentry Solutions',
          trades: ['Carpentry', 'Joinery', 'Kitchen Fitting'],
          rating: 4.9,
          reviewCount: 87,
          location: { town: 'London', postcode: 'N1' },
          contact: { phone: '020 7890 1234' },
          verified: true,
          accreditations: ['City & Guilds', 'TrustMark'],
          source: 'curated'
        }
      ],
      'decorator': [
        {
          id: 'curated_dec_1',
          name: 'Pro Finish Decorators',
          trades: ['Painting', 'Decorating', 'Wallpapering'],
          rating: 4.7,
          reviewCount: 124,
          location: { town: 'Leeds', postcode: 'LS1' },
          contact: { phone: '0113 456 7890' },
          verified: true,
          accreditations: ['CSCS', 'TrustMark'],
          source: 'curated'
        }
      ],
      'roofer': [
        {
          id: 'curated_roof_1',
          name: 'TopCover Roofing',
          trades: ['Roofing', 'Guttering', 'Fascias'],
          rating: 4.8,
          reviewCount: 98,
          location: { town: 'Sheffield', postcode: 'S1' },
          contact: { phone: '0114 234 5678' },
          verified: true,
          accreditations: ['NFRC', 'TrustMark', 'CompetentRoofer'],
          source: 'curated'
        }
      ],
      'bathroom': [
        {
          id: 'suffolk_bath_1',
          name: 'Suffolk Bathroom Solutions', 
          trades: ['Bathroom Design', 'Installation', 'Tiling'],
          rating: 4.9,
          reviewCount: 78,
          location: { town: 'Ipswich', postcode: 'IP4' },
          contact: { phone: '01473 567 890' },
          verified: true,
          accreditations: ['TrustMark'],
          source: 'curated'
        },
        {
          id: 'suffolk_bath_2',
          name: 'Deben Bathrooms & Kitchens',
          trades: ['Bathrooms', 'Tiling', 'Plumbing'],
          rating: 4.6,
          reviewCount: 112,
          location: { town: 'Woodbridge', postcode: 'IP12' },
          contact: { phone: '01394 382 445' },
          verified: true,
          source: 'curated'
        },
        {
          id: 'essex_bath_1',
          name: 'Premier Bathroom Installations',
          trades: ['Bathroom Installation', 'Wet Rooms', 'Disabled Access'],
          rating: 4.8,
          reviewCount: 156,
          location: { town: 'Colchester', postcode: 'CO1' },
          contact: { phone: '01206 789 123' },
          verified: true,
          accreditations: ['NKBA'],
          source: 'curated'
        },
        {
          id: 'suffolk_bath_3',
          name: 'East Anglian Bathroom Company',
          trades: ['Luxury Bathrooms', 'Design', 'Project Management'],
          rating: 4.7,
          reviewCount: 89,
          location: { town: 'Bury St Edmunds', postcode: 'IP33' },
          contact: { phone: '01284 456 789' },
          verified: true,
          source: 'curated'
        },
        {
          id: 'suffolk_bath_4',
          name: 'Coastal Bathroom Specialists',
          trades: ['Bathroom Renovation', 'Wet Rooms', 'Tiling'],
          rating: 4.5,
          reviewCount: 67,
          location: { town: 'Felixstowe', postcode: 'IP11' },
          contact: { phone: '01394 678 912' },
          verified: true,
          source: 'curated'
        }
      ]
    }
    
    const tradeKey = request.trade.toLowerCase()
    const locationLower = request.location.toLowerCase()
    
    // Find matching trade category
    let matchingTrade = ''
    for (const key in curated) {
      if (tradeKey.includes(key)) {
        matchingTrade = key
        break
      }
    }
    
    if (!matchingTrade) return []
    
    const allRecommendations = curated[matchingTrade]
    
    // Prioritize local Suffolk/Essex contractors for Woodbridge area
    if (locationLower.includes('woodbridge') || locationLower.includes('suffolk') || locationLower.includes('ipswich')) {
      return allRecommendations.filter(contractor => 
        contractor.location.town.toLowerCase().includes('woodbridge') ||
        contractor.location.town.toLowerCase().includes('ipswich') ||
        contractor.location.town.toLowerCase().includes('felixstowe') ||
        contractor.location.postcode.startsWith('IP')
      ).concat(
        allRecommendations.filter(contractor => 
          !(contractor.location.town.toLowerCase().includes('woodbridge') ||
            contractor.location.town.toLowerCase().includes('ipswich') ||
            contractor.location.town.toLowerCase().includes('felixstowe') ||
            contractor.location.postcode.startsWith('IP'))
        )
      ).slice(0, 5)
    }
    
    return allRecommendations.slice(0, 5)
  }
  
  /**
   * Get fallback recommendations when APIs fail
   */
  private getFallbackRecommendations(request: TradeRecommendationRequest): Tradesperson[] {
    return [
      {
        id: 'fallback_1',
        name: 'Local Tradesperson Network',
        trades: [request.trade],
        rating: 4.5,
        reviewCount: 0,
        location: {
          town: request.location,
          postcode: request.postcode || ''
        },
        contact: {
          phone: 'Contact Toddy Tool Hire for recommendations'
        },
        verified: false,
        description: 'We recommend contacting Toddy Tool Hire for verified local tradesperson recommendations',
        source: 'local'
      }
    ]
  }
  
  /**
   * Rank recommendations by rating, distance, and other factors
   */
  private rankRecommendations(
    recommendations: Tradesperson[], 
    request: TradeRecommendationRequest
  ): Tradesperson[] {
    return recommendations
      .filter(r => !request.minRating || r.rating >= request.minRating)
      .filter(r => !request.verified || r.verified)
      .sort((a, b) => {
        // Prioritize Toddy partners
        if (a.source === 'local' && b.source !== 'local') return -1
        if (b.source === 'local' && a.source !== 'local') return 1
        
        // Then by rating
        if (b.rating !== a.rating) return b.rating - a.rating
        
        // Then by review count
        return b.reviewCount - a.reviewCount
      })
      .slice(0, 5) // Return top 5
  }
  
  /**
   * Generate recommendation text for AI responses
   */
  async getRecommendationContext(trade: string, location: string): Promise<string> {
    try {
      const recommendations = await this.getRecommendations({
        trade,
        location,
        radius: 20,
        minRating: 4.0
      })
      
      if (recommendations.length === 0) {
        return ''
      }
      
      let context = '\n\n### RECOMMENDED TRADESPEOPLE:\n'
      
      recommendations.forEach((tradesperson, index) => {
        context += `\n${index + 1}. **${tradesperson.name}**\n`
        context += `   - Rating: ${tradesperson.rating}/5 (${tradesperson.reviewCount} reviews)\n`
        context += `   - Location: ${tradesperson.location.town}\n`
        if (tradesperson.verified) {
          context += `   - ✓ Verified ${tradesperson.accreditations?.join(', ') || ''}\n`
        }
        if (tradesperson.contact.phone) {
          context += `   - Contact: ${tradesperson.contact.phone}\n`
        }
        if (tradesperson.source === 'local') {
          context += `   - 🌟 Toddy Approved Partner\n`
        }
      })
      
      context += '\n*Always get multiple quotes and check references before hiring.*\n'
      
      return context
    } catch (error) {
      console.error('Error generating recommendation context:', error)
      return ''
    }
  }
}

export const tradespersonService = new TradespersonRecommendationService()