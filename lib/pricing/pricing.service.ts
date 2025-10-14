import { createClient } from 'contentful'

export interface ResearchDataPoint {
  source: string
  publicationDate: string
  reliability: number
  priceType: 'tool_hire' | 'material_cost' | 'labor_rate' | 'per_sqm_cost' | 'project_total'
  item: string
  price: number
  priceUnit: 'per_day' | 'per_week' | 'per_sqm' | 'per_hour' | 'per_unit' | 'total_project'
  location?: string
  specification?: 'budget' | 'standard' | 'premium'
  notes?: string
  sourceUrl?: string
}

export interface BaseRate {
  item: string
  category: string
  averagePrice: number
  priceRangeMin: number
  priceRangeMax: number
  priceUnit: string
  confidence: number
  dataPointCount: number
  lastCalculated: string
  seasonalAdjustment?: number
  regionalVariation?: any
}

export interface ProjectTemplate {
  name: string
  category: string
  description?: string
  baseTimePerSqm: number
  requiredTools: any[]
  materialCostPerSqm: {
    budget: number
    standard: number
    premium: number
  }
  laborCostPerSqm: {
    budget: number
    standard: number
    premium: number
  }
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional_only'
  complexityFactors?: any
  seasonality?: any
}

export class PricingService {
  private client: any
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_TTL = 15 * 60 * 1000 // 15 minutes

  constructor() {
    // Only create client if credentials exist
    try {
      if (process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID && process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN) {
        this.client = createClient({
          space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
          accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
          environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master',
        })
      } else {
        this.client = null
      }
    } catch (error) {
      console.error('Failed to initialize Contentful client in pricing service:', error)
      this.client = null
    }
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return expiry ? Date.now() < expiry : false
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL)
  }

  async getResearchDataPoints(filters?: {
    priceType?: string
    item?: string
    limit?: number
  }): Promise<ResearchDataPoint[]> {
    const cacheKey = `research_${JSON.stringify(filters)}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Return empty array if no client
    if (!this.client) {
      return []
    }

    try {
      const query: any = {
        content_type: 'researchDataPoint',
        limit: filters?.limit || 100,
        order: '-sys.createdAt'
      }

      if (filters?.priceType) {
        query['fields.priceType'] = filters.priceType
      }

      if (filters?.item) {
        query['fields.item[match]'] = filters.item
      }

      const entries = await this.client.getEntries(query)
      
      const dataPoints: ResearchDataPoint[] = entries.items.map((item: any) => ({
        source: item.fields.source,
        publicationDate: item.fields.publicationDate,
        reliability: item.fields.reliability,
        priceType: item.fields.priceType,
        item: item.fields.item,
        price: item.fields.price,
        priceUnit: item.fields.priceUnit,
        location: item.fields.location,
        specification: item.fields.specification,
        notes: item.fields.notes,
        sourceUrl: item.fields.sourceUrl
      }))

      this.setCache(cacheKey, dataPoints)
      return dataPoints
    } catch (error) {
      console.error('Error fetching research data points:', error)
      return []
    }
  }

  async getBaseRates(category?: string): Promise<BaseRate[]> {
    const cacheKey = `base_rates_${category || 'all'}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Return empty array if no client
    if (!this.client) {
      return []
    }

    try {
      const query: any = {
        content_type: 'baseRate',
        limit: 100,
        order: '-fields.confidence'
      }

      if (category) {
        query['fields.category'] = category
      }

      const entries = await this.client.getEntries(query)
      
      const baseRates: BaseRate[] = entries.items.map((item: any) => ({
        item: item.fields.item,
        category: item.fields.category,
        averagePrice: item.fields.averagePrice,
        priceRangeMin: item.fields.priceRangeMin,
        priceRangeMax: item.fields.priceRangeMax,
        priceUnit: item.fields.priceUnit,
        confidence: item.fields.confidence,
        dataPointCount: item.fields.dataPointCount,
        lastCalculated: item.fields.lastCalculated,
        seasonalAdjustment: item.fields.seasonalAdjustment,
        regionalVariation: item.fields.regionalVariation
      }))

      this.setCache(cacheKey, baseRates)
      return baseRates
    } catch (error) {
      console.error('Error fetching base rates:', error)
      return []
    }
  }

  async getProjectTemplate(category: string): Promise<ProjectTemplate | null> {
    const cacheKey = `project_template_${category}`
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Return null if no client
    if (!this.client) {
      return null
    }

    try {
      const entries = await this.client.getEntries({
        content_type: 'projectTemplate',
        'fields.category': category,
        limit: 1
      })

      if (entries.items.length === 0) {
        return null
      }

      const item = entries.items[0]
      const template: ProjectTemplate = {
        name: item.fields.name,
        category: item.fields.category,
        description: item.fields.description,
        baseTimePerSqm: item.fields.baseTimePerSqm,
        requiredTools: item.fields.requiredTools,
        materialCostPerSqm: item.fields.materialCostPerSqm,
        laborCostPerSqm: item.fields.laborCostPerSqm,
        skillLevel: item.fields.skillLevel,
        complexityFactors: item.fields.complexityFactors,
        seasonality: item.fields.seasonality
      }

      this.setCache(cacheKey, template)
      return template
    } catch (error) {
      console.error('Error fetching project template:', error)
      return null
    }
  }

  async getToolHirePrice(toolName: string): Promise<{
    averagePrice: number
    priceRange: { min: number; max: number }
    priceUnit: string
    confidence: number
  } | null> {
    try {
      // First check base rates
      const baseRates = await this.getBaseRates()
      const toolRate = baseRates.find(rate => 
        rate.item.toLowerCase().includes(toolName.toLowerCase())
      )

      if (toolRate) {
        return {
          averagePrice: toolRate.averagePrice,
          priceRange: {
            min: toolRate.priceRangeMin,
            max: toolRate.priceRangeMax
          },
          priceUnit: toolRate.priceUnit,
          confidence: toolRate.confidence
        }
      }

      // If not in base rates, check research data
      const researchData = await this.getResearchDataPoints({
        priceType: 'tool_hire',
        item: toolName
      })

      if (researchData.length > 0) {
        const prices = researchData.map(d => d.price)
        const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const confidence = Math.min(10, researchData.length * 2) // Simple confidence based on data points

        return {
          averagePrice,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          },
          priceUnit: researchData[0].priceUnit,
          confidence
        }
      }

      return null
    } catch (error) {
      console.error('Error getting tool hire price:', error)
      return null
    }
  }

  async getMaterialPrice(materialName: string, specification: 'budget' | 'standard' | 'premium' = 'standard'): Promise<{
    price: number
    priceUnit: string
    specification: string
    confidence: number
  } | null> {
    try {
      const researchData = await this.getResearchDataPoints({
        priceType: 'material_cost',
        item: materialName
      })

      const filteredData = researchData.filter(d => 
        !d.specification || d.specification === specification
      )

      if (filteredData.length > 0) {
        const prices = filteredData.map(d => d.price)
        const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const confidence = Math.min(10, filteredData.length * 2)

        return {
          price: averagePrice,
          priceUnit: filteredData[0].priceUnit,
          specification,
          confidence
        }
      }

      return null
    } catch (error) {
      console.error('Error getting material price:', error)
      return null
    }
  }

  async getProjectEstimate(projectType: string, area?: number, specification: 'budget' | 'standard' | 'premium' = 'standard'): Promise<{
    materialCost: number
    laborCost: number
    totalCost: number
    timeEstimate: number
    confidence: number
  } | null> {
    try {
      const template = await this.getProjectTemplate(projectType)
      
      if (!template || !area) {
        return null
      }

      const materialCostPerSqm = template.materialCostPerSqm[specification]
      const laborCostPerSqm = template.laborCostPerSqm[specification]
      const timePerSqm = template.baseTimePerSqm

      const materialCost = materialCostPerSqm * area
      const laborCost = laborCostPerSqm * area
      const totalCost = materialCost + laborCost
      const timeEstimate = timePerSqm * area

      return {
        materialCost,
        laborCost,
        totalCost,
        timeEstimate,
        confidence: 8 // Based on having template data
      }
    } catch (error) {
      console.error('Error getting project estimate:', error)
      return null
    }
  }

  // Method to get pricing context for AI responses
  async getPricingContext(query: string): Promise<string> {
    try {
      const queryLower = query.toLowerCase()
      let context = ''

      // Check for tool hire queries
      const toolKeywords = ['hire', 'rent', 'tool', 'mixer', 'saw', 'drill', 'ladder']
      if (toolKeywords.some(keyword => queryLower.includes(keyword))) {
        const baseRates = await this.getBaseRates('power_tools')
        const heavyMachinery = await this.getBaseRates('heavy_machinery')
        
        const allTools = [...baseRates, ...heavyMachinery].slice(0, 5)
        
        if (allTools.length > 0) {
          context += '\n\nCURRENT TOOL HIRE RATES (based on recent market research):\n'
          allTools.forEach(tool => {
            context += `• ${tool.item}: £${tool.averagePrice}/day (£${tool.priceRangeMin}-${tool.priceRangeMax}) - Confidence: ${tool.confidence}/10\n`
          })
        }
      }

      // Check for material queries
      const materialKeywords = ['material', 'timber', 'wood', 'concrete', 'brick', 'tile', 'paint']
      if (materialKeywords.some(keyword => queryLower.includes(keyword))) {
        const materialData = await this.getResearchDataPoints({
          priceType: 'material_cost',
          limit: 5
        })
        
        if (materialData.length > 0) {
          context += '\n\nCURRENT MATERIAL COSTS (from recent industry sources):\n'
          materialData.forEach(material => {
            context += `• ${material.item}: £${material.price}/${material.priceUnit} (${material.source}, ${material.publicationDate})\n`
          })
        }
      }

      // Check for project estimate queries
      const projectKeywords = ['cost', 'estimate', 'price', 'budget', 'deck', 'kitchen', 'bathroom']
      if (projectKeywords.some(keyword => queryLower.includes(keyword))) {
        context += '\n\nNOTE: All pricing is based on recent UK market research from reputable sources like Which?, Construction News, and industry publications. Prices include typical UK rates and may vary by region.'
      }

      return context
    } catch (error) {
      console.error('Error getting pricing context:', error)
      return ''
    }
  }
}

export const pricingService = new PricingService()