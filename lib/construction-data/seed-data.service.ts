import { supabase } from '@/lib/supabase'

export class DataSeedingService {
  
  async seedInitialData() {
    try {
      console.log('Starting data seeding...')
      
      // Seed tool hire data with realistic UK prices (2024)
      await this.seedToolHireData()
      
      // Seed labor costs based on Checkatrade and industry standards
      await this.seedLaborCosts()
      
      // Seed material costs from major UK suppliers
      await this.seedMaterialCosts()
      
      // Seed building regulations data
      await this.seedBuildingRegulations()
      
      // Seed regional multipliers
      await this.seedRegionalMultipliers()
      
      console.log('Data seeding completed successfully!')
      
    } catch (error) {
      console.error('Error during data seeding:', error)
      throw error
    }
  }

  private async seedToolHireData() {
    // Get category IDs first
    const { data: categories } = await supabase
      .from('tool_categories')
      .select('id, name')

    const categoryMap = categories?.reduce((acc, cat) => {
      acc[cat.name] = cat.id
      return acc
    }, {} as Record<string, string>) || {}

    const toolHireData = [
      // Power Tools
      {
        category_id: categoryMap['Power Tools'],
        name: 'Cordless Drill 18V',
        description: 'Professional cordless drill with batteries and charger',
        daily_rate: 12.50,
        weekly_rate: 45.00,
        weekend_rate: 18.00,
        deposit: 50.00,
        supplier: 'HSS Hire'
      },
      {
        category_id: categoryMap['Power Tools'],
        name: 'Circular Saw 185mm',
        description: 'Professional circular saw for cutting timber and boards',
        daily_rate: 15.00,
        weekly_rate: 55.00,
        weekend_rate: 22.00,
        deposit: 60.00,
        supplier: 'HSS Hire'
      },
      {
        category_id: categoryMap['Power Tools'],
        name: 'Angle Grinder 115mm',
        description: 'Compact angle grinder for cutting and grinding',
        daily_rate: 8.50,
        weekly_rate: 28.00,
        weekend_rate: 12.00,
        deposit: 40.00,
        supplier: 'Speedy Hire'
      },
      {
        category_id: categoryMap['Power Tools'],
        name: 'Reciprocating Saw',
        description: 'Heavy-duty reciprocating saw for demolition work',
        daily_rate: 18.00,
        weekly_rate: 65.00,
        weekend_rate: 25.00,
        deposit: 70.00,
        supplier: 'Travis Perkins'
      },
      {
        category_id: categoryMap['Power Tools'],
        name: 'Tile Cutter Electric',
        description: 'Electric tile cutter with water cooling system',
        daily_rate: 22.00,
        weekly_rate: 80.00,
        weekend_rate: 35.00,
        deposit: 100.00,
        supplier: 'HSS Hire'
      },

      // Access Equipment
      {
        category_id: categoryMap['Access Equipment'],
        name: 'Step Ladder 8ft',
        description: 'Aluminium step ladder, 8 foot height',
        daily_rate: 8.00,
        weekly_rate: 25.00,
        weekend_rate: 12.00,
        deposit: 35.00,
        supplier: 'Brandon Hire'
      },
      {
        category_id: categoryMap['Access Equipment'],
        name: 'Extension Ladder 3-Section',
        description: '3-section extending ladder up to 7.5m',
        daily_rate: 12.00,
        weekly_rate: 40.00,
        weekend_rate: 18.00,
        deposit: 50.00,
        supplier: 'National Tool Hire'
      },
      {
        category_id: categoryMap['Access Equipment'],
        name: 'Mobile Tower Scaffold',
        description: 'Aluminium mobile tower scaffold, 5m working height',
        daily_rate: 45.00,
        weekly_rate: 160.00,
        weekend_rate: 70.00,
        deposit: 200.00,
        delivery_cost: 25.00,
        supplier: 'HSS Hire'
      },

      // Landscaping
      {
        category_id: categoryMap['Landscaping'],
        name: 'Mini Digger 1.5 Tonne',
        description: 'Compact excavator for garden and landscaping work',
        daily_rate: 160.00,
        weekly_rate: 600.00,
        weekend_rate: 240.00,
        deposit: 500.00,
        delivery_cost: 60.00,
        supplier: 'Speedy Hire'
      },
      {
        category_id: categoryMap['Landscaping'],
        name: 'Rotovator Petrol',
        description: 'Petrol rotovator for soil cultivation',
        daily_rate: 35.00,
        weekly_rate: 120.00,
        weekend_rate: 55.00,
        deposit: 100.00,
        supplier: 'Travis Perkins'
      },
      {
        category_id: categoryMap['Landscaping'],
        name: 'Turf Cutter',
        description: 'Self-propelled turf cutter for removing grass',
        daily_rate: 42.00,
        weekly_rate: 150.00,
        weekend_rate: 65.00,
        deposit: 120.00,
        supplier: 'HSS Hire'
      },

      // Cleaning
      {
        category_id: categoryMap['Cleaning'],
        name: 'Pressure Washer 3000PSI',
        description: 'High-pressure washer for cleaning drives and patios',
        daily_rate: 25.00,
        weekly_rate: 85.00,
        weekend_rate: 40.00,
        deposit: 80.00,
        supplier: 'Brandon Hire'
      },
      {
        category_id: categoryMap['Cleaning'],
        name: 'Industrial Vacuum Wet/Dry',
        description: 'Heavy-duty wet and dry vacuum cleaner',
        daily_rate: 18.00,
        weekly_rate: 60.00,
        weekend_rate: 28.00,
        deposit: 60.00,
        supplier: 'National Tool Hire'
      }
    ]

    for (const tool of toolHireData) {
      await supabase
        .from('tool_hire')
        .insert(tool)
    }

    console.log('Tool hire data seeded successfully')
  }

  private async seedLaborCosts() {
    // Get trade category IDs
    const { data: trades } = await supabase
      .from('trade_categories')
      .select('id, name')

    const tradeMap = trades?.reduce((acc, trade) => {
      acc[trade.name] = trade.id
      return acc
    }, {} as Record<string, string>) || {}

    const laborCostData = [
      // Electrician
      {
        trade_category_id: tradeMap['Electrician'],
        job_type: 'Install new socket outlet',
        rate_type: 'per_item',
        base_rate: 180.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.3,
        complexity_complex: 1.8,
        unit: 'per socket',
        min_charge: 120.00,
        source: 'Checkatrade 2024'
      },
      {
        trade_category_id: tradeMap['Electrician'],
        job_type: 'Consumer unit replacement',
        rate_type: 'fixed',
        base_rate: 650.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.4,
        complexity_complex: 2.0,
        min_charge: 650.00,
        source: 'Checkatrade 2024'
      },
      {
        trade_category_id: tradeMap['Electrician'],
        job_type: 'Rewire room',
        rate_type: 'per_sqm',
        base_rate: 85.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.5,
        complexity_complex: 2.2,
        unit: 'sqm',
        min_charge: 800.00,
        source: 'MyBuilder 2024'
      },

      // Plumber  
      {
        trade_category_id: tradeMap['Plumber'],
        job_type: 'Install toilet',
        rate_type: 'per_item',
        base_rate: 220.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.2,
        complexity_complex: 1.6,
        unit: 'per toilet',
        min_charge: 180.00,
        source: 'Checkatrade 2024'
      },
      {
        trade_category_id: tradeMap['Plumber'],
        job_type: 'Bathroom renovation',
        rate_type: 'per_sqm',
        base_rate: 380.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.4,
        complexity_complex: 1.9,
        unit: 'sqm',
        min_charge: 2200.00,
        source: 'Checkatrade 2024'
      },

      // Tiler
      {
        trade_category_id: tradeMap['Tiler'],
        job_type: 'Tile wall',
        rate_type: 'per_sqm',
        base_rate: 65.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.3,
        complexity_complex: 1.7,
        unit: 'sqm',
        min_charge: 300.00,
        source: 'Checkatrade 2024'
      },
      {
        trade_category_id: tradeMap['Tiler'],
        job_type: 'Tile floor',
        rate_type: 'per_sqm',
        base_rate: 45.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.2,
        complexity_complex: 1.6,
        unit: 'sqm',
        min_charge: 280.00,
        source: 'Checkatrade 2024'
      },

      // Painter
      {
        trade_category_id: tradeMap['Painter'],
        job_type: 'Paint room interior',
        rate_type: 'per_sqm',
        base_rate: 18.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.2,
        complexity_complex: 1.5,
        unit: 'sqm floor area',
        min_charge: 220.00,
        source: 'Checkatrade 2024'
      },
      {
        trade_category_id: tradeMap['Painter'],
        job_type: 'Paint exterior house',
        rate_type: 'per_sqm',
        base_rate: 25.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.3,
        complexity_complex: 1.8,
        unit: 'sqm wall area',
        min_charge: 800.00,
        source: 'MyBuilder 2024'
      },

      // General Builder
      {
        trade_category_id: tradeMap['General Builder'],
        job_type: 'Build single storey extension',
        rate_type: 'per_sqm',
        base_rate: 1800.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.2,
        complexity_complex: 1.5,
        unit: 'sqm floor area',
        min_charge: 15000.00,
        source: 'Checkatrade 2024'
      },
      {
        trade_category_id: tradeMap['General Builder'],
        job_type: 'Kitchen renovation',
        rate_type: 'per_sqm',
        base_rate: 1200.00,
        complexity_basic: 1.0,
        complexity_moderate: 1.3,
        complexity_complex: 1.7,
        unit: 'sqm floor area',
        min_charge: 8000.00,
        source: 'Checkatrade 2024'
      }
    ]

    for (const labor of laborCostData) {
      await supabase
        .from('labor_costs')
        .insert(labor)
    }

    console.log('Labor cost data seeded successfully')
  }

  private async seedMaterialCosts() {
    // Get material category IDs
    const { data: categories } = await supabase
      .from('material_categories')
      .select('id, name')

    const categoryMap = categories?.reduce((acc, cat) => {
      acc[cat.name] = cat.id
      return acc
    }, {} as Record<string, string>) || {}

    const materialData = [
      // Tiles
      {
        category_id: categoryMap['Tiles'],
        name: 'Ceramic wall tiles',
        description: 'Standard ceramic wall tiles, 200x250mm',
        unit: 'per_sqm',
        budget_price: 15.00,
        mid_range_price: 35.00,
        premium_price: 85.00,
        supplier: 'B&Q / Wickes',
        waste_factor: 0.1
      },
      {
        category_id: categoryMap['Tiles'],
        name: 'Porcelain floor tiles',
        description: 'Porcelain floor tiles, 600x600mm',
        unit: 'per_sqm',
        budget_price: 25.00,
        mid_range_price: 55.00,
        premium_price: 120.00,
        supplier: 'Wickes / Topps Tiles',
        waste_factor: 0.1
      },

      // Paint
      {
        category_id: categoryMap['Paint'],
        name: 'Emulsion paint',
        description: 'Matt emulsion paint, 5 litre',
        unit: 'per_litre',
        budget_price: 6.50,
        mid_range_price: 12.00,
        premium_price: 18.50,
        supplier: 'B&Q / Wickes',
        waste_factor: 0.05
      },
      {
        category_id: categoryMap['Paint'],
        name: 'Exterior masonry paint',
        description: 'Weather-resistant masonry paint, 5 litre',
        unit: 'per_litre',
        budget_price: 8.00,
        mid_range_price: 15.50,
        premium_price: 24.00,
        supplier: 'Wickes / Screwfix',
        waste_factor: 0.08
      },

      // Electrical
      {
        category_id: categoryMap['Electrical'],
        name: 'Twin & earth cable 2.5mm',
        description: '2.5mm twin and earth cable for ring circuits',
        unit: 'per_metre',
        budget_price: 1.20,
        mid_range_price: 1.60,
        premium_price: 2.20,
        supplier: 'Screwfix / CEF',
        waste_factor: 0.15
      },
      {
        category_id: categoryMap['Electrical'],
        name: 'Double socket outlet',
        description: 'Standard white double socket with back box',
        unit: 'per_item',
        budget_price: 8.50,
        mid_range_price: 15.00,
        premium_price: 28.00,
        supplier: 'Screwfix / Wickes',
        waste_factor: 0.02
      },

      // Plumbing
      {
        category_id: categoryMap['Plumbing'],
        name: 'Copper pipe 15mm',
        description: '15mm copper pipe for water supply',
        unit: 'per_metre',
        budget_price: 4.20,
        mid_range_price: 5.80,
        premium_price: 7.50,
        supplier: 'Screwfix / Plumbworld',
        waste_factor: 0.12
      },
      {
        category_id: categoryMap['Plumbing'],
        name: 'Basin mixer tap',
        description: 'Chrome basin mixer tap with popup waste',
        unit: 'per_item',
        budget_price: 45.00,
        mid_range_price: 120.00,
        premium_price: 280.00,
        supplier: 'Wickes / Plumbworld',
        waste_factor: 0.02
      },

      // Building Materials
      {
        category_id: categoryMap['Building Materials'],
        name: 'Cement 25kg bag',
        description: 'General purpose cement, 25kg bag',
        unit: 'per_bag',
        budget_price: 3.80,
        mid_range_price: 4.20,
        premium_price: 5.00,
        supplier: 'Wickes / Travis Perkins',
        waste_factor: 0.05
      },
      {
        category_id: categoryMap['Building Materials'],
        name: 'Building sand bulk bag',
        description: 'General purpose building sand, 850kg bulk bag',
        unit: 'per_bag',
        budget_price: 85.00,
        mid_range_price: 95.00,
        premium_price: 110.00,
        supplier: 'Travis Perkins / Wickes',
        waste_factor: 0.08
      }
    ]

    for (const material of materialData) {
      await supabase
        .from('material_costs')
        .insert(material)
    }

    console.log('Material cost data seeded successfully')
  }

  private async seedBuildingRegulations() {
    const regulationsData = [
      {
        project_type: 'Bathroom renovation',
        requires_building_control: true,
        requires_planning: false,
        typical_cost_min: 300,
        typical_cost_max: 600,
        processing_time_weeks: 6,
        description: 'Building control required for new drainage, structural changes, or electrical work in wet areas'
      },
      {
        project_type: 'Kitchen renovation',
        requires_building_control: false,
        requires_planning: false,
        typical_cost_min: 0,
        typical_cost_max: 0,
        processing_time_weeks: 0,
        description: 'Generally no approvals required unless structural changes or new gas connections'
      },
      {
        project_type: 'Extension',
        requires_building_control: true,
        requires_planning: true,
        typical_cost_min: 600,
        typical_cost_max: 1500,
        processing_time_weeks: 12,
        description: 'Both planning permission and building regulations required for most extensions'
      },
      {
        project_type: 'Electrical rewire',
        requires_building_control: true,
        requires_planning: false,
        typical_cost_min: 200,
        typical_cost_max: 400,
        processing_time_weeks: 4,
        description: 'Part P building control notification required for electrical work'
      }
    ]

    for (const regulation of regulationsData) {
      await supabase
        .from('building_regulations')
        .insert(regulation)
    }

    console.log('Building regulations data seeded successfully')
  }

  private async seedRegionalMultipliers() {
    // Get some labor cost IDs to apply regional variations
    const { data: laborCosts } = await supabase
      .from('labor_costs')
      .select('id')
      .limit(5)

    if (!laborCosts?.length) return

    const regions = [
      { region: 'London', multiplier: 1.4 },
      { region: 'South East', multiplier: 1.2 },
      { region: 'South West', multiplier: 1.1 },
      { region: 'North West', multiplier: 0.95 },
      { region: 'North East', multiplier: 0.85 },
      { region: 'Yorkshire', multiplier: 0.9 },
      { region: 'West Midlands', multiplier: 0.95 },
      { region: 'East Midlands', multiplier: 0.9 },
      { region: 'Wales', multiplier: 0.88 },
      { region: 'Scotland', multiplier: 0.92 },
      { region: 'Northern Ireland', multiplier: 0.8 }
    ]

    // Apply regional multipliers to each labor cost
    for (const laborCost of laborCosts) {
      for (const region of regions) {
        await supabase
          .from('regional_multipliers')
          .insert({
            region: region.region,
            labor_cost_id: laborCost.id,
            multiplier: region.multiplier
          })
      }
    }

    console.log('Regional multipliers seeded successfully')
  }
}

export const dataSeedingService = new DataSeedingService()