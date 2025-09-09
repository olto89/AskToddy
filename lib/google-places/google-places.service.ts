/**
 * Google Places API Service
 * Uses Google Maps Platform to find and recommend local businesses/tradespeople
 * 
 * Pricing (2024):
 * - Basic: $32 per 1000 requests
 * - Free tier: Up to 10,000 requests/month for Essentials
 * 
 * API Documentation: https://developers.google.com/maps/documentation/places/web-service
 */

export interface GooglePlace {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  formatted_address?: string
  formatted_phone_number?: string
  website?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  types?: string[]
  price_level?: number // 0-4 (Free to Very Expensive)
  reviews?: Array<{
    rating: number
    text: string
    time: number
    author_name: string
  }>
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
  vicinity?: string
  business_status?: string
}

export interface PlaceSearchRequest {
  query: string // e.g., "electrician", "plumber", "builder"
  location?: string // e.g., "London, UK" or coordinates
  radius?: number // meters (max 50000)
  minRating?: number
  openNow?: boolean
}

export class GooglePlacesService {
  private readonly API_KEY = process.env.GOOGLE_PLACES_API_KEY
  private readonly BASE_URL = 'https://maps.googleapis.com/maps/api/place'
  
  // Blacklisted businesses that should never be recommended
  private readonly BLACKLISTED_COMPANIES = [
    'Dream Drains Ltd',
    'dream drains ltd',
    'Dream Drains Limited'
  ]
  
  constructor() {
    if (!this.API_KEY) {
      console.warn('Google Places API key not configured. Add GOOGLE_PLACES_API_KEY to .env.local')
    }
  }
  
  private isBlacklisted(businessName: string): boolean {
    const nameLower = businessName.toLowerCase()
    return this.BLACKLISTED_COMPANIES.some(blacklisted => 
      nameLower.includes(blacklisted.toLowerCase())
    )
  }
  
  /**
   * Search for businesses/tradespeople using Google Places
   */
  async searchBusinesses(request: PlaceSearchRequest): Promise<GooglePlace[]> {
    if (!this.API_KEY) {
      console.log('Google Places API not configured, using fallback data')
      return []
    }
    
    try {
      // First, do a text search to find relevant businesses
      const searchResults = await this.textSearch(request)
      
      // Filter by minimum rating and blacklist
      const filteredResults = searchResults.filter(place => {
        // Check if business is blacklisted
        if (this.isBlacklisted(place.name)) {
          console.log(`Filtered out blacklisted business: ${place.name}`)
          return false
        }
        
        // Check minimum rating if specified
        return !request.minRating || (place.rating && place.rating >= request.minRating)
      })
      
      // Sort by rating and review count before getting details
      const sortedResults = filteredResults
        .filter(place => place.rating && place.user_ratings_total) // Only places with ratings
        .sort((a, b) => {
          // Sort by rating first, then by review count
          if (b.rating !== a.rating) {
            return (b.rating || 0) - (a.rating || 0)
          }
          return (b.user_ratings_total || 0) - (a.user_ratings_total || 0)
        })
        .slice(0, 5) // Take top 5
      
      // Get detailed information for top results
      const detailedResults = await Promise.all(
        sortedResults.map(place => 
          this.getPlaceDetails(place.place_id)
        )
      )
      
      return detailedResults.filter(place => place !== null) as GooglePlace[]
    } catch (error) {
      console.error('Google Places search error:', error)
      return []
    }
  }
  
  /**
   * Text search for businesses
   */
  private async textSearch(request: PlaceSearchRequest): Promise<GooglePlace[]> {
    try {
      // Build search query
      let searchQuery = request.query
      if (request.location) {
        searchQuery += ` in ${request.location}`
      }
      
      const params = new URLSearchParams({
        query: searchQuery,
        key: this.API_KEY!,
        language: 'en-GB',
        region: 'gb',
        type: this.mapTradeToGoogleType(request.query)
      })
      
      if (request.radius && request.location) {
        // If we have specific location coordinates, use them
        // For now, we'll use text-based location
        params.append('location', request.location)
        params.append('radius', request.radius.toString())
      }
      
      const response = await fetch(
        `${this.BASE_URL}/textsearch/json?${params.toString()}`
      )
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API status:', data.status, data.error_message)
        return []
      }
      
      return data.results || []
    } catch (error) {
      console.error('Text search error:', error)
      return []
    }
  }
  
  /**
   * Get detailed place information
   */
  private async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    try {
      const fields = [
        'place_id',
        'name',
        'rating',
        'user_ratings_total',
        'formatted_address',
        'formatted_phone_number',
        'website',
        'opening_hours',
        'types',
        'price_level',
        'reviews',
        'business_status'
      ].join(',')
      
      const params = new URLSearchParams({
        place_id: placeId,
        fields: fields,
        key: this.API_KEY!,
        language: 'en-GB'
      })
      
      const response = await fetch(
        `${this.BASE_URL}/details/json?${params.toString()}`
      )
      
      if (!response.ok) {
        throw new Error(`Place details API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status !== 'OK') {
        console.error('Place details status:', data.status)
        return null
      }
      
      return data.result
    } catch (error) {
      console.error('Place details error:', error)
      return null
    }
  }
  
  /**
   * Map trade names to Google Places types
   */
  private mapTradeToGoogleType(trade: string): string {
    const tradeMap: Record<string, string> = {
      'electrician': 'electrician',
      'plumber': 'plumber',
      'builder': 'general_contractor',
      'carpenter': 'carpenter',
      'decorator': 'painter',
      'roofer': 'roofing_contractor',
      'plasterer': 'general_contractor',
      'tiler': 'general_contractor',
      'landscaper': 'landscaping',
      'handyman': 'handyman',
      'locksmith': 'locksmith',
      'cleaner': 'cleaning_service'
    }
    
    const tradeLower = trade.toLowerCase()
    for (const [key, value] of Object.entries(tradeMap)) {
      if (tradeLower.includes(key)) {
        return value
      }
    }
    
    return 'general_contractor'
  }
  
  /**
   * Convert Google Places results to our Tradesperson format
   */
  async convertToTradespeople(places: GooglePlace[]): Promise<Array<{
    id: string
    name: string
    trades: string[]
    rating: number
    reviewCount: number
    location: {
      address: string
      lat?: number
      lng?: number
    }
    contact: {
      phone?: string
      website?: string
    }
    verified: boolean
    source: string
    reviews?: Array<{
      rating: number
      text: string
      author: string
    }>
    openNow?: boolean
  }>> {
    return places.map(place => ({
      id: `google_${place.place_id}`,
      name: place.name,
      trades: this.extractTradesFromTypes(place.types || []),
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      location: {
        address: place.formatted_address || place.vicinity || '',
        lat: place.geometry?.location.lat,
        lng: place.geometry?.location.lng
      },
      contact: {
        phone: place.formatted_phone_number,
        website: place.website
      },
      verified: place.business_status === 'OPERATIONAL',
      source: 'Google',
      reviews: place.reviews?.slice(0, 3).map(r => ({
        rating: r.rating,
        text: r.text,
        author: r.author_name
      })),
      openNow: place.opening_hours?.open_now
    }))
  }
  
  /**
   * Extract trade types from Google Places types
   */
  private extractTradesFromTypes(types: string[]): string[] {
    const tradeMapping: Record<string, string> = {
      'electrician': 'Electrician',
      'plumber': 'Plumber',
      'general_contractor': 'General Builder',
      'roofing_contractor': 'Roofer',
      'carpenter': 'Carpenter',
      'painter': 'Painter & Decorator',
      'landscaping': 'Landscaper',
      'handyman': 'Handyman',
      'locksmith': 'Locksmith',
      'cleaning_service': 'Cleaner'
    }
    
    const trades: string[] = []
    for (const type of types) {
      if (tradeMapping[type]) {
        trades.push(tradeMapping[type])
      }
    }
    
    return trades.length > 0 ? trades : ['General Contractor']
  }
  
  /**
   * Generate recommendation text for AI responses
   */
  async getGooglePlacesContext(trade: string, location: string): Promise<string> {
    try {
      console.log(`Google Places search: ${trade} in ${location}`)
      console.log(`API Key configured: ${!!this.API_KEY}`)
      
      const results = await this.searchBusinesses({
        query: trade,
        location: location,
        minRating: 4.0
      })
      
      console.log(`Google Places results: ${results.length} found`)
      
      if (results.length === 0) {
        console.log('No Google Places results, returning empty context')
        return ''
      }
      
      const tradespeople = await this.convertToTradespeople(results)
      
      let context = '\n\n### TOP 5 RECOMMENDED LOCAL BUSINESSES (from Google Maps):\n'
      
      tradespeople.forEach((business, index) => {
        context += `\n**${index + 1}. ${business.name}**\n`
        context += `   ⭐ ${business.rating}/5 (${business.reviewCount} reviews)\n`
        context += `   📍 ${business.location.address}\n`
        
        if (business.contact.phone) {
          context += `   📞 ${business.contact.phone}\n`
        }
        
        if (business.contact.website) {
          context += `   🌐 Website available\n`
        }
        
        if (business.openNow !== undefined) {
          context += `   ${business.openNow ? '🟢 Open now' : '🔴 Currently closed'}\n`
        }
        
        // Add a separator between businesses (except for the last one)
        if (index < tradespeople.length - 1) {
          context += `\n`
        }
      })
      
      context += '\n\n*All ratings from Google Maps. I recommend getting quotes from 2-3 of these top-rated businesses.*\n'
      
      return context
    } catch (error) {
      console.error('Error generating Google Places context:', error)
      return ''
    }
  }
}

export const googlePlacesService = new GooglePlacesService()