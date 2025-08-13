import { supabase } from '@/lib/supabase'

export interface ToolHireItem {
  id: string
  name: string
  description: string
  daily_rate: number
  weekly_rate?: number
  weekend_rate?: number
  deposit?: number
  delivery_cost?: number
  supplier: string
  category: string
}

export interface LaborCost {
  id: string
  job_type: string
  trade_category: string
  rate_type: 'per_sqm' | 'per_day' | 'per_hour' | 'fixed'
  base_rate: number
  complexity_basic: number
  complexity_moderate: number
  complexity_complex: number
  unit?: string
  min_charge?: number
  source: string
}

export interface MaterialCost {
  id: string
  name: string
  description: string
  unit: string
  budget_price?: number
  mid_range_price?: number
  premium_price?: number
  supplier: string
  category: string
  waste_factor: number
}

export interface RegionalMultiplier {
  region: string
  multiplier: number
}

export interface BuildingRegulation {
  project_type: string
  requires_building_control: boolean
  requires_planning: boolean
  typical_cost_min?: number
  typical_cost_max?: number
  processing_time_weeks?: number
  description?: string
}

export class ConstructionDataService {
  
  /**
   * Get tool hire costs by category or search term
   */
  async getToolHireCosts(options: {
    category?: string
    searchTerm?: string
    maxDailyRate?: number
  } = {}): Promise<ToolHireItem[]> {
    let query = supabase
      .from('tool_hire')
      .select(`
        *,
        tool_categories!inner(name)
      `)

    if (options.category) {
      query = query.eq('tool_categories.name', options.category)
    }

    if (options.searchTerm) {
      query = query.or(`name.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`)
    }

    if (options.maxDailyRate) {
      query = query.lte('daily_rate', options.maxDailyRate)
    }

    const { data, error } = await query.order('daily_rate')

    if (error) {
      console.error('Error fetching tool hire data:', error)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      daily_rate: item.daily_rate,
      weekly_rate: item.weekly_rate,
      weekend_rate: item.weekend_rate,
      deposit: item.deposit,
      delivery_cost: item.delivery_cost,
      supplier: item.supplier,
      category: item.tool_categories.name
    }))
  }

  /**
   * Get labor costs for specific trades and job types
   */
  async getLaborCosts(options: {
    trade?: string
    jobType?: string
    region?: string
  } = {}): Promise<LaborCost[]> {
    let query = supabase
      .from('labor_costs')
      .select(`
        *,
        trade_categories!inner(name),
        regional_multipliers(region, multiplier)
      `)

    if (options.trade) {
      query = query.eq('trade_categories.name', options.trade)
    }

    if (options.jobType) {
      query = query.ilike('job_type', `%${options.jobType}%`)
    }

    const { data, error } = await query.order('base_rate')

    if (error) {
      console.error('Error fetching labor cost data:', error)
      return []
    }

    return (data || []).map(item => {
      let adjustedRate = item.base_rate
      
      // Apply regional multiplier if specified
      if (options.region && item.regional_multipliers) {
        const regionData = item.regional_multipliers.find((r: any) => 
          r.region.toLowerCase() === options.region?.toLowerCase()
        )
        if (regionData) {
          adjustedRate *= regionData.multiplier
        }
      }

      return {
        id: item.id,
        job_type: item.job_type,
        trade_category: item.trade_categories.name,
        rate_type: item.rate_type,
        base_rate: adjustedRate,
        complexity_basic: item.complexity_basic,
        complexity_moderate: item.complexity_moderate,
        complexity_complex: item.complexity_complex,
        unit: item.unit,
        min_charge: item.min_charge,
        source: item.source
      }
    })
  }

  /**
   * Get material costs by category
   */
  async getMaterialCosts(options: {
    category?: string
    searchTerm?: string
    quality?: 'budget' | 'mid_range' | 'premium'
  } = {}): Promise<MaterialCost[]> {
    let query = supabase
      .from('material_costs')
      .select(`
        *,
        material_categories!inner(name)
      `)

    if (options.category) {
      query = query.eq('material_categories.name', options.category)
    }

    if (options.searchTerm) {
      query = query.or(`name.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`)
    }

    const { data, error } = await query.order('name')

    if (error) {
      console.error('Error fetching material cost data:', error)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      unit: item.unit,
      budget_price: item.budget_price,
      mid_range_price: item.mid_range_price,
      premium_price: item.premium_price,
      supplier: item.supplier,
      category: item.material_categories.name,
      waste_factor: item.waste_factor
    }))
  }

  /**
   * Get building regulation requirements
   */
  async getBuildingRegulations(projectType: string): Promise<BuildingRegulation | null> {
    const { data, error } = await supabase
      .from('building_regulations')
      .select('*')
      .ilike('project_type', `%${projectType}%`)
      .single()

    if (error || !data) {
      return null
    }

    return {
      project_type: data.project_type,
      requires_building_control: data.requires_building_control,
      requires_planning: data.requires_planning,
      typical_cost_min: data.typical_cost_min,
      typical_cost_max: data.typical_cost_max,
      processing_time_weeks: data.processing_time_weeks,
      description: data.description
    }
  }

  /**
   * Calculate estimated project costs based on parameters
   */
  async calculateProjectCosts(params: {
    projectType: string
    area?: number // square metres
    complexity: 'basic' | 'moderate' | 'complex'
    region?: string
    quality: 'budget' | 'mid_range' | 'premium'
  }) {
    const { projectType, area = 10, complexity, region, quality } = params

    // Get relevant labor costs
    const laborCosts = await this.getLaborCosts({ 
      jobType: projectType, 
      region 
    })

    // Get relevant material costs  
    const materials = await this.getMaterialCosts({ 
      searchTerm: projectType,
      quality 
    })

    // Get building regulations
    const regulations = await this.getBuildingRegulations(projectType)

    // Calculate estimates
    let totalLaborCost = 0
    let totalMaterialCost = 0
    let additionalCosts = 0

    // Calculate labor costs
    laborCosts.forEach(labor => {
      let rate = labor.base_rate
      
      // Apply complexity multiplier
      if (complexity === 'moderate') rate *= labor.complexity_moderate
      if (complexity === 'complex') rate *= labor.complexity_complex
      
      // Apply area if rate is per square metre
      if (labor.rate_type === 'per_sqm' && area) {
        totalLaborCost += rate * area
      } else {
        totalLaborCost += rate
      }
    })

    // Calculate material costs
    materials.forEach(material => {
      let price = 0
      if (quality === 'budget') price = material.budget_price || 0
      if (quality === 'mid_range') price = material.mid_range_price || 0  
      if (quality === 'premium') price = material.premium_price || 0

      // Apply waste factor
      price *= (1 + material.waste_factor)
      
      // Estimate quantity based on area (simplified)
      if (material.unit.includes('sqm') && area) {
        totalMaterialCost += price * area
      } else {
        totalMaterialCost += price
      }
    })

    // Add building regulation costs
    if (regulations?.requires_building_control) {
      additionalCosts += regulations.typical_cost_min || 200
    }

    return {
      labor: {
        min: Math.round(totalLaborCost * 0.8),
        max: Math.round(totalLaborCost * 1.2)
      },
      materials: {
        min: Math.round(totalMaterialCost * 0.9),
        max: Math.round(totalMaterialCost * 1.1)
      },
      additional: additionalCosts,
      total: {
        min: Math.round((totalLaborCost * 0.8) + (totalMaterialCost * 0.9) + additionalCosts),
        max: Math.round((totalLaborCost * 1.2) + (totalMaterialCost * 1.1) + additionalCosts)
      },
      regulations: regulations || undefined
    }
  }

  /**
   * Get comprehensive cost data for AI prompts
   */
  async getCostDataForAI(projectType: string, region?: string) {
    const [toolHire, laborCosts, materials, regulations] = await Promise.all([
      this.getToolHireCosts({ searchTerm: projectType }),
      this.getLaborCosts({ jobType: projectType, region }),
      this.getMaterialCosts({ searchTerm: projectType }),
      this.getBuildingRegulations(projectType)
    ])

    return {
      toolHire: toolHire.slice(0, 10), // Limit to top 10 relevant tools
      laborCosts: laborCosts.slice(0, 5), // Top 5 labor cost references
      materials: materials.slice(0, 15), // Top 15 relevant materials
      regulations,
      lastUpdated: new Date().toISOString(),
      dataSource: 'AskToddy Construction Database'
    }
  }
}

export const constructionDataService = new ConstructionDataService()