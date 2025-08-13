import { supabase } from '@/lib/supabase'

// Updated interfaces based on improved schema
export interface ToolHireItem {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  product_code?: string
  
  // Pricing structure
  daily_rate: number
  weekly_rate?: number
  weekend_rate?: number
  monthly_rate?: number
  deposit?: number
  delivery_cost_base?: number
  
  // Business rules
  min_hire_period_hours: number
  requires_license: boolean
  requires_training: boolean
  
  // Technical specs
  specifications?: Record<string, any>
  
  // Supplier info
  supplier: string
  availability_status: string
  
  // Location-adjusted pricing (if location provided)
  adjusted_daily_rate?: number
  adjusted_delivery_cost?: number
}

export interface LaborCostItem {
  id: string
  job_type: string
  job_description?: string
  trade_category: string
  
  // Rate structure
  rate_structure: 'per_sqm' | 'per_item' | 'per_day' | 'fixed_price'
  base_rate: number
  unit?: string
  min_charge?: number
  typical_time_hours?: number
  materials_included: boolean
  
  // Complexity and adjustments
  complexity_factors: Record<string, number>
  
  // Market data quality
  data_source: string
  confidence_level: string
  sample_size?: number
  
  // Region-adjusted pricing (if location provided)
  adjusted_rate?: number
  regional_multiplier?: number
}

export interface MaterialCostItem {
  id: string
  name: string
  description: string
  category: string
  brand?: string
  model_code?: string
  
  // Pricing by quality tier
  budget_price?: number
  mid_range_price?: number
  premium_price?: number
  trade_price?: number
  
  // Unit and packaging
  unit: string
  pack_size?: string
  coverage_per_unit?: number
  waste_factor: number
  
  // Supplier info
  supplier: string
  supplier_sku?: string
  
  // Bulk pricing
  bulk_breaks?: Array<{quantity: number, discount: number}>
}

export interface ProjectTemplate {
  id: string
  project_type: string
  description: string
  
  // Size and scope
  typical_area_min: number
  typical_area_max: number
  
  // Time estimates
  diy_time_hours: number
  professional_time_hours: number
  
  // Complexity and regulations
  common_complexity_factors: string[]
  requires_building_control: boolean
  requires_planning: boolean
  typical_permit_cost_min?: number
  typical_permit_cost_max?: number
  
  // Associated materials and labor
  required_materials?: MaterialCostItem[]
  required_labor?: LaborCostItem[]
}

export interface ProjectEstimateParams {
  project_type: string
  area?: number
  location?: string // 'London', 'Manchester', 'M1' postcode prefix
  complexity: 'basic' | 'standard' | 'complex'
  quality_tier: 'budget' | 'mid_range' | 'premium'
  include_tools?: boolean
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
}

export interface ProjectCostEstimate {
  project_overview: {
    type: string
    area: number
    location?: string
    complexity: string
    quality_tier: string
  }
  
  cost_breakdown: {
    materials: {
      min: number
      max: number
      items: MaterialCostItem[]
    }
    labor: {
      min: number
      max: number
      items: LaborCostItem[]
    }
    tools: {
      min: number
      max: number
      items: ToolHireItem[]
    }
    permits: {
      min: number
      max: number
      description: string
    }
    total: {
      min: number
      max: number
    }
  }
  
  time_estimates: {
    diy_hours: number
    professional_hours: number
    diy_display: string
    professional_display: string
  }
  
  complexity_factors_applied: string[]
  location_adjustments?: {
    labor_multiplier: number
    tool_multiplier: number
    description: string
  }
  
  data_quality: {
    confidence: 'high' | 'medium' | 'low'
    data_sources: string[]
    last_updated: string
  }
}

export class ImprovedConstructionDataService {
  
  /**
   * Get tool hire costs with location and seasonal adjustments
   */
  async getToolHireCosts(options: {
    category?: string
    searchTerm?: string
    location?: string
    season?: string
    maxDailyRate?: number
    requiresLicense?: boolean
  } = {}): Promise<ToolHireItem[]> {
    let query = supabase
      .from('tool_hire')
      .select(`
        *,
        tool_categories!inner(name, parent_id),
        parent_category:tool_categories!tool_categories_parent_id_fkey(name),
        tool_location_pricing(location_type, rate_multiplier, delivery_cost_adjustment),
        tool_seasonal_pricing(season, rate_multiplier)
      `)

    if (options.category) {
      query = query.or(`tool_categories.name.ilike.%${options.category}%,parent_category.name.ilike.%${options.category}%`)
    }

    if (options.searchTerm) {
      query = query.textSearch('name_description_search', options.searchTerm, {
        type: 'websearch',
        config: 'english'
      })
    }

    if (options.maxDailyRate) {
      query = query.lte('daily_rate', options.maxDailyRate)
    }

    if (options.requiresLicense !== undefined) {
      query = query.eq('requires_license', options.requiresLicense)
    }

    const { data, error } = await query
      .eq('availability_status', 'available')
      .order('daily_rate')

    if (error) {
      console.error('Error fetching tool hire data:', error)
      return []
    }

    return (data || []).map(item => {
      const tool: ToolHireItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.tool_categories.name,
        subcategory: item.parent_category?.name,
        product_code: item.product_code,
        daily_rate: item.daily_rate,
        weekly_rate: item.weekly_rate,
        weekend_rate: item.weekend_rate,
        monthly_rate: item.monthly_rate,
        deposit: item.deposit,
        delivery_cost_base: item.delivery_cost_base,
        min_hire_period_hours: item.min_hire_period_hours,
        requires_license: item.requires_license,
        requires_training: item.requires_training,
        specifications: item.specifications,
        supplier: item.supplier,
        availability_status: item.availability_status
      }

      // Apply location-based pricing adjustments
      if (options.location && item.tool_location_pricing) {
        const locationPricing = item.tool_location_pricing.find((lp: any) => 
          lp.location_type.toLowerCase().includes(options.location!.toLowerCase())
        )
        if (locationPricing) {
          tool.adjusted_daily_rate = tool.daily_rate * locationPricing.rate_multiplier
          tool.adjusted_delivery_cost = (tool.delivery_cost_base || 0) + locationPricing.delivery_cost_adjustment
        }
      }

      // Apply seasonal adjustments
      if (options.season && item.tool_seasonal_pricing) {
        const seasonalPricing = item.tool_seasonal_pricing.find((sp: any) => 
          sp.season === options.season
        )
        if (seasonalPricing) {
          const currentRate = tool.adjusted_daily_rate || tool.daily_rate
          tool.adjusted_daily_rate = currentRate * seasonalPricing.rate_multiplier
        }
      }

      return tool
    })
  }

  /**
   * Get labor costs with regional and market adjustments
   */
  async getLaborCosts(options: {
    trade?: string
    jobType?: string
    location?: string
    rateStructure?: string
  } = {}): Promise<LaborCostItem[]> {
    let query = supabase
      .from('labor_costs')
      .select(`
        *,
        trade_categories!inner(name),
        labor_regional_pricing(region, postcode_prefix, rate_multiplier, urban_rural_type),
        labor_market_adjustments(demand_level, rate_multiplier, effective_from, effective_to)
      `)

    if (options.trade) {
      query = query.eq('trade_categories.name', options.trade)
    }

    if (options.jobType) {
      query = query.textSearch('job_type_search', options.jobType, {
        type: 'websearch',
        config: 'english'
      })
    }

    if (options.rateStructure) {
      query = query.eq('rate_structure', options.rateStructure)
    }

    const { data, error } = await query.order('base_rate')

    if (error) {
      console.error('Error fetching labor cost data:', error)
      return []
    }

    const currentDate = new Date()

    return (data || []).map(item => {
      const laborCost: LaborCostItem = {
        id: item.id,
        job_type: item.job_type,
        job_description: item.job_description,
        trade_category: item.trade_categories.name,
        rate_structure: item.rate_structure,
        base_rate: item.base_rate,
        unit: item.unit,
        min_charge: item.min_charge,
        typical_time_hours: item.typical_time_hours,
        materials_included: item.materials_included,
        complexity_factors: item.complexity_factors || { basic: 1.0, standard: 1.3, complex: 1.8 },
        data_source: item.data_source,
        confidence_level: item.confidence_level,
        sample_size: item.sample_size
      }

      // Apply regional pricing adjustments
      if (options.location && item.labor_regional_pricing) {
        const regionalPricing = item.labor_regional_pricing.find((rp: any) => 
          rp.region.toLowerCase().includes(options.location!.toLowerCase()) ||
          (rp.postcode_prefix && options.location!.startsWith(rp.postcode_prefix))
        )
        if (regionalPricing) {
          laborCost.adjusted_rate = laborCost.base_rate * regionalPricing.rate_multiplier
          laborCost.regional_multiplier = regionalPricing.rate_multiplier
        }
      }

      // Apply current market adjustments
      if (item.labor_market_adjustments) {
        const currentAdjustment = item.labor_market_adjustments.find((ma: any) => {
          const effectiveFrom = new Date(ma.effective_from)
          const effectiveTo = new Date(ma.effective_to)
          return currentDate >= effectiveFrom && currentDate <= effectiveTo
        })
        if (currentAdjustment) {
          const currentRate = laborCost.adjusted_rate || laborCost.base_rate
          laborCost.adjusted_rate = currentRate * currentAdjustment.rate_multiplier
        }
      }

      return laborCost
    })
  }

  /**
   * Get material costs with bulk pricing and quality tiers
   */
  async getMaterialCosts(options: {
    category?: string
    searchTerm?: string
    qualityTier?: 'budget' | 'mid_range' | 'premium' | 'trade'
    supplier?: string
  } = {}): Promise<MaterialCostItem[]> {
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
      query = query.textSearch('name_description_search', options.searchTerm, {
        type: 'websearch',
        config: 'english'
      })
    }

    if (options.supplier) {
      query = query.ilike('supplier', `%${options.supplier}%`)
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
      category: item.material_categories.name,
      brand: item.brand,
      model_code: item.model_code,
      budget_price: item.budget_price,
      mid_range_price: item.mid_range_price,
      premium_price: item.premium_price,
      trade_price: item.trade_price,
      unit: item.unit,
      pack_size: item.pack_size,
      coverage_per_unit: item.coverage_per_unit,
      waste_factor: item.waste_factor,
      supplier: item.supplier,
      supplier_sku: item.supplier_sku,
      bulk_breaks: item.bulk_breaks
    }))
  }

  /**
   * Get project template with associated materials and labor
   */
  async getProjectTemplate(projectType: string): Promise<ProjectTemplate | null> {
    const { data, error } = await supabase
      .from('project_templates')
      .select(`
        *,
        project_material_requirements(
          quantity_per_sqm,
          is_optional,
          quality_tier,
          material_costs(*)
        ),
        project_labor_requirements(
          is_essential,
          complexity_threshold,
          labor_costs(*)
        )
      `)
      .ilike('project_type', `%${projectType}%`)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      project_type: data.project_type,
      description: data.description,
      typical_area_min: data.typical_area_min,
      typical_area_max: data.typical_area_max,
      diy_time_hours: data.diy_time_hours,
      professional_time_hours: data.professional_time_hours,
      common_complexity_factors: data.common_complexity_factors,
      requires_building_control: data.requires_building_control,
      requires_planning: data.requires_planning,
      typical_permit_cost_min: data.typical_permit_cost_min,
      typical_permit_cost_max: data.typical_permit_cost_max,
      required_materials: data.project_material_requirements?.map((pmr: any) => ({
        ...pmr.material_costs,
        quantity_per_sqm: pmr.quantity_per_sqm,
        is_optional: pmr.is_optional,
        quality_tier: pmr.quality_tier
      })),
      required_labor: data.project_labor_requirements?.map((plr: any) => ({
        ...plr.labor_costs,
        is_essential: plr.is_essential,
        complexity_threshold: plr.complexity_threshold
      }))
    }
  }

  /**
   * Generate comprehensive project cost estimate
   */
  async generateProjectEstimate(params: ProjectEstimateParams): Promise<ProjectCostEstimate> {
    const {
      project_type,
      area = 10,
      location,
      complexity,
      quality_tier,
      include_tools = true,
      season
    } = params

    // Get project template
    const template = await this.getProjectTemplate(project_type)
    
    if (!template) {
      throw new Error(`No template found for project type: ${project_type}`)
    }

    // Get relevant labor costs
    const laborCosts = await this.getLaborCosts({
      jobType: project_type,
      location
    })

    // Get relevant materials
    const materials = await this.getMaterialCosts({
      searchTerm: project_type,
    })

    // Get tools if requested
    let tools: ToolHireItem[] = []
    if (include_tools) {
      tools = await this.getToolHireCosts({
        searchTerm: project_type,
        location,
        season
      })
    }

    // Calculate costs
    const complexityMultiplier = complexity === 'basic' ? 1.0 : 
                               complexity === 'standard' ? 1.3 : 1.8

    // Material costs calculation
    const materialCostItems = materials.slice(0, 10).map(material => {
      let price = 0
      switch (quality_tier) {
        case 'budget': price = material.budget_price || 0; break
        case 'mid_range': price = material.mid_range_price || 0; break
        case 'premium': price = material.premium_price || 0; break
      }
      
      // Apply waste factor and area
      const totalCost = price * area * (1 + material.waste_factor)
      
      return {
        ...material,
        calculated_cost: totalCost
      }
    })

    const materialTotal = materialCostItems.reduce((sum, item) => sum + item.calculated_cost, 0)

    // Labor costs calculation
    const laborCostItems = laborCosts.slice(0, 5).map(labor => {
      const baseRate = labor.adjusted_rate || labor.base_rate
      const complexityAdjustedRate = baseRate * (labor.complexity_factors[complexity] || complexityMultiplier)
      
      let totalCost = 0
      if (labor.rate_structure === 'per_sqm') {
        totalCost = complexityAdjustedRate * area
      } else if (labor.rate_structure === 'fixed_price') {
        totalCost = complexityAdjustedRate
      } else {
        totalCost = complexityAdjustedRate // Default to base rate
      }

      return {
        ...labor,
        calculated_cost: Math.max(totalCost, labor.min_charge || 0)
      }
    })

    const laborTotal = laborCostItems.reduce((sum, item) => sum + item.calculated_cost, 0)

    // Tool costs calculation (assume 1 week hire for estimation)
    const toolCostItems = tools.slice(0, 8).map(tool => {
      const dailyRate = tool.adjusted_daily_rate || tool.daily_rate
      const weeklyRate = tool.weekly_rate || (dailyRate * 5) // Assume 5-day week if no weekly rate
      
      return {
        ...tool,
        calculated_cost: weeklyRate
      }
    })

    const toolTotal = toolCostItems.reduce((sum, item) => sum + item.calculated_cost, 0)

    // Permit costs
    const permitMin = template.requires_building_control ? (template.typical_permit_cost_min || 200) : 0
    const permitMax = template.requires_building_control ? (template.typical_permit_cost_max || 600) : 0

    // Time estimates with complexity adjustment
    const diyHours = Math.round(template.diy_time_hours * complexityMultiplier)
    const professionalHours = Math.round(template.professional_time_hours * complexityMultiplier)

    const estimate: ProjectCostEstimate = {
      project_overview: {
        type: project_type,
        area,
        location,
        complexity,
        quality_tier
      },
      cost_breakdown: {
        materials: {
          min: Math.round(materialTotal * 0.9),
          max: Math.round(materialTotal * 1.1),
          items: materialCostItems as any[]
        },
        labor: {
          min: Math.round(laborTotal * 0.8),
          max: Math.round(laborTotal * 1.2),
          items: laborCostItems as any[]
        },
        tools: {
          min: Math.round(toolTotal * 0.9),
          max: Math.round(toolTotal * 1.1),
          items: toolCostItems
        },
        permits: {
          min: permitMin,
          max: permitMax,
          description: template.requires_building_control ? 'Building control approval required' : 'No permits required'
        },
        total: {
          min: Math.round((materialTotal * 0.9) + (laborTotal * 0.8) + (toolTotal * 0.9) + permitMin),
          max: Math.round((materialTotal * 1.1) + (laborTotal * 1.2) + (toolTotal * 1.1) + permitMax)
        }
      },
      time_estimates: {
        diy_hours: diyHours,
        professional_hours: professionalHours,
        diy_display: this.formatTimeEstimate(diyHours),
        professional_display: this.formatTimeEstimate(professionalHours)
      },
      complexity_factors_applied: template.common_complexity_factors,
      data_quality: {
        confidence: 'medium',
        data_sources: ['AskToddy Database', 'UK Trade Quotes'],
        last_updated: new Date().toISOString()
      }
    }

    // Add location adjustments info if applicable
    if (location) {
      estimate.location_adjustments = {
        labor_multiplier: laborCostItems[0]?.regional_multiplier || 1.0,
        tool_multiplier: 1.0, // Could be enhanced with actual tool location data
        description: `Pricing adjusted for ${location} market conditions`
      }
    }

    return estimate
  }

  /**
   * Get cost data optimized for AI prompts
   */
  async getCostDataForAI(projectType: string, location?: string): Promise<any> {
    const [tools, labor, materials, template] = await Promise.all([
      this.getToolHireCosts({ searchTerm: projectType, location }).then(t => t.slice(0, 8)),
      this.getLaborCosts({ jobType: projectType, location }).then(l => l.slice(0, 5)),
      this.getMaterialCosts({ searchTerm: projectType }).then(m => m.slice(0, 12)),
      this.getProjectTemplate(projectType)
    ])

    return {
      project_template: template,
      current_tool_hire_rates: tools.map(t => ({
        name: t.name,
        daily_rate: t.adjusted_daily_rate || t.daily_rate,
        weekly_rate: t.weekly_rate,
        deposit: t.deposit,
        supplier: t.supplier,
        requires_license: t.requires_license
      })),
      current_labor_rates: labor.map(l => ({
        job_type: l.job_type,
        rate: l.adjusted_rate || l.base_rate,
        rate_structure: l.rate_structure,
        unit: l.unit,
        min_charge: l.min_charge,
        complexity_factors: l.complexity_factors,
        materials_included: l.materials_included,
        confidence: l.confidence_level,
        source: l.data_source
      })),
      current_material_costs: materials.map(m => ({
        name: m.name,
        unit: m.unit,
        budget_price: m.budget_price,
        mid_range_price: m.mid_range_price,
        premium_price: m.premium_price,
        waste_factor: m.waste_factor,
        coverage: m.coverage_per_unit,
        supplier: m.supplier
      })),
      location_context: location ? `Pricing adjusted for ${location}` : 'UK national average',
      data_freshness: new Date().toISOString(),
      database_source: 'AskToddy Real-time Construction Database'
    }
  }

  private formatTimeEstimate(hours: number): string {
    if (hours < 24) {
      return `${hours} hours`
    } else if (hours < 168) { // Less than a week
      const days = Math.ceil(hours / 8)
      return `${days} days`
    } else {
      const weeks = Math.ceil(hours / 40)
      return `${weeks} weeks`
    }
  }
}

export const improvedConstructionDataService = new ImprovedConstructionDataService()