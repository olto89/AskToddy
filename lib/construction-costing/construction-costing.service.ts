/**
 * Construction Costing Service
 * Provides comprehensive cost breakdowns for construction projects
 * Including materials, labour, tool hire, and project timelines
 */

export interface ProjectCostBreakdown {
  project: string
  totalCost: {
    low: number
    high: number
    average: number
  }
  materials: MaterialItem[]
  labour: LabourItem[]
  toolHire: ToolHireItem[]
  timeline: TimelinePhase[]
  contingency: number
  vat: number
  notes: string[]
}

export interface MaterialItem {
  item: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier?: string
}

export interface LabourItem {
  trade: string
  days: number
  workers: number
  dayRate: number
  totalCost: number
}

export interface ToolHireItem {
  tool: string
  duration: number
  unit: string // 'day' | 'week' | 'month'
  rate: number
  totalCost: number
}

export interface TimelinePhase {
  phase: string
  duration: string
  dependencies?: string[]
  tasks: string[]
}

export class ConstructionCostingService {
  // UK average labour rates (2024)
  private readonly LABOUR_RATES = {
    // Skilled trades (day rates)
    'electrician': { min: 200, max: 350, avg: 275 },
    'plumber': { min: 200, max: 350, avg: 275 },
    'carpenter': { min: 180, max: 280, avg: 230 },
    'plasterer': { min: 150, max: 250, avg: 200 },
    'tiler': { min: 170, max: 270, avg: 220 },
    'decorator': { min: 140, max: 220, avg: 180 },
    'bricklayer': { min: 200, max: 300, avg: 250 },
    'roofer': { min: 180, max: 280, avg: 230 },
    'groundworker': { min: 160, max: 240, avg: 200 },
    'general_builder': { min: 150, max: 250, avg: 200 },
    'labourer': { min: 100, max: 150, avg: 125 }
  }

  // Common material costs (2024 prices)
  private readonly MATERIAL_COSTS = {
    // Timber
    'timber_2x4': { unit: 'm', cost: 6.50, supplier: 'Wickes/B&Q' },
    'timber_4x4': { unit: 'm', cost: 14.00, supplier: 'Wickes/B&Q' },
    'plywood_18mm': { unit: 'sheet', cost: 45.00, supplier: 'Wickes/B&Q' },
    'osb_18mm': { unit: 'sheet', cost: 28.00, supplier: 'Wickes/B&Q' },
    
    // Concrete & Aggregates
    'concrete_ready_mix': { unit: 'm³', cost: 100.00, supplier: 'Local supplier' },
    'sand': { unit: 'tonne', cost: 45.00, supplier: 'Travis Perkins' },
    'gravel': { unit: 'tonne', cost: 40.00, supplier: 'Travis Perkins' },
    'mot_type1': { unit: 'tonne', cost: 35.00, supplier: 'Travis Perkins' },
    
    // Bricks & Blocks
    'facing_bricks': { unit: '1000', cost: 450.00, supplier: 'Jewson' },
    'concrete_blocks': { unit: 'm²', cost: 18.00, supplier: 'Jewson' },
    'breeze_blocks': { unit: 'each', cost: 2.20, supplier: 'Wickes' },
    
    // Insulation
    'loft_insulation_270mm': { unit: 'roll', cost: 22.00, supplier: 'Wickes' },
    'cavity_wall_insulation': { unit: 'm²', cost: 8.50, supplier: 'Wickes' },
    'kingspan_100mm': { unit: 'sheet', cost: 65.00, supplier: 'Insulation Superstore' },
    
    // Roofing
    'roof_tiles_concrete': { unit: 'm²', cost: 25.00, supplier: 'Roofing Superstore' },
    'roof_tiles_clay': { unit: 'm²', cost: 45.00, supplier: 'Roofing Superstore' },
    'roof_felt': { unit: 'roll', cost: 28.00, supplier: 'Wickes' },
    'roof_battens': { unit: 'm', cost: 2.50, supplier: 'Jewson' },
    
    // Plasterboard & Plastering
    'plasterboard_12.5mm': { unit: 'sheet', cost: 8.50, supplier: 'Wickes' },
    'multi_finish_plaster': { unit: 'bag', cost: 9.50, supplier: 'Wickes' },
    'bonding_plaster': { unit: 'bag', cost: 8.50, supplier: 'Wickes' },
    'plaster_beads': { unit: '3m', cost: 3.50, supplier: 'Wickes' },
    
    // Flooring
    'engineered_wood': { unit: 'm²', cost: 45.00, supplier: 'Flooring Superstore' },
    'laminate': { unit: 'm²', cost: 20.00, supplier: 'B&Q' },
    'carpet_medium': { unit: 'm²', cost: 25.00, supplier: 'Carpetright' },
    'underlay': { unit: 'm²', cost: 5.00, supplier: 'Carpetright' },
    'tiles_ceramic': { unit: 'm²', cost: 25.00, supplier: 'Topps Tiles' },
    'tiles_porcelain': { unit: 'm²', cost: 40.00, supplier: 'Topps Tiles' },
    
    // Electrical
    'cable_2.5mm': { unit: '100m', cost: 85.00, supplier: 'CEF' },
    'socket_outlet': { unit: 'each', cost: 8.50, supplier: 'Screwfix' },
    'light_switch': { unit: 'each', cost: 6.50, supplier: 'Screwfix' },
    'consumer_unit_10way': { unit: 'each', cost: 120.00, supplier: 'CEF' },
    
    // Plumbing
    'copper_pipe_15mm': { unit: '3m', cost: 15.00, supplier: 'Plumb Center' },
    'plastic_pipe_15mm': { unit: '3m', cost: 6.00, supplier: 'Screwfix' },
    'radiator_double': { unit: 'each', cost: 120.00, supplier: 'Plumb Center' },
    'boiler_combi': { unit: 'each', cost: 1500.00, supplier: 'Plumb Center' }
  }

  // Tool hire rates (per day)
  private readonly TOOL_HIRE_RATES = {
    'mini_digger': { day: 150, week: 600, supplier: 'HSS/Speedy' },
    'concrete_mixer': { day: 40, week: 120, supplier: 'HSS/Speedy' },
    'scaffold_tower': { day: 45, week: 150, supplier: 'HSS/Speedy' },
    'skip_6yard': { day: 180, week: 180, supplier: 'Local skip hire' },
    'skip_8yard': { day: 220, week: 220, supplier: 'Local skip hire' },
    'generator': { day: 50, week: 175, supplier: 'HSS/Speedy' },
    'breaker': { day: 65, week: 220, supplier: 'HSS/Speedy' },
    'disc_cutter': { day: 45, week: 135, supplier: 'HSS/Speedy' },
    'plate_compactor': { day: 45, week: 135, supplier: 'HSS/Speedy' }
  }

  /**
   * Get comprehensive project templates with full breakdowns
   */
  getProjectTemplates() {
    return {
      'bathroom_renovation': {
        description: 'Complete bathroom renovation (3m x 2.5m)',
        materials: [
          { item: 'Bath', quantity: 1, unit: 'each', cost: 350 },
          { item: 'Toilet & cistern', quantity: 1, unit: 'each', cost: 250 },
          { item: 'Basin & pedestal', quantity: 1, unit: 'each', cost: 180 },
          { item: 'Shower enclosure', quantity: 1, unit: 'each', cost: 450 },
          { item: 'Tiles (walls)', quantity: 30, unit: 'm²', cost: 35 },
          { item: 'Tiles (floor)', quantity: 7.5, unit: 'm²', cost: 40 },
          { item: 'Tile adhesive', quantity: 10, unit: 'bags', cost: 15 },
          { item: 'Grout', quantity: 5, unit: 'bags', cost: 8 },
          { item: 'Plasterboard', quantity: 6, unit: 'sheets', cost: 8.50 },
          { item: 'Plumbing fittings', quantity: 1, unit: 'set', cost: 200 }
        ],
        labour: [
          { trade: 'Plumber', days: 3, dayRate: 275 },
          { trade: 'Tiler', days: 4, dayRate: 220 },
          { trade: 'Electrician', days: 1, dayRate: 275 },
          { trade: 'Plasterer', days: 1, dayRate: 200 }
        ],
        timeline: [
          { phase: 'Strip out', duration: '1 day' },
          { phase: 'First fix plumbing/electric', duration: '2 days' },
          { phase: 'Plastering', duration: '1 day + drying' },
          { phase: 'Tiling', duration: '3-4 days' },
          { phase: 'Second fix & completion', duration: '2 days' }
        ],
        totalDuration: '2-3 weeks',
        estimatedCost: { low: 4500, high: 7500, average: 6000 }
      },
      
      'kitchen_extension': {
        description: 'Single storey rear kitchen extension (4m x 3m)',
        materials: [
          { item: 'Concrete foundations', quantity: 10, unit: 'm³', cost: 100 },
          { item: 'Blocks', quantity: 180, unit: 'm²', cost: 18 },
          { item: 'Bricks', quantity: 3000, unit: 'bricks', cost: 0.45 },
          { item: 'Roof joists', quantity: 15, unit: 'each', cost: 35 },
          { item: 'Roof tiles', quantity: 30, unit: 'm²', cost: 35 },
          { item: 'Insulation', quantity: 60, unit: 'm²', cost: 12 },
          { item: 'Plasterboard', quantity: 25, unit: 'sheets', cost: 8.50 },
          { item: 'Bi-fold doors', quantity: 1, unit: 'set', cost: 2500 },
          { item: 'Kitchen units', quantity: 1, unit: 'set', cost: 5000 },
          { item: 'Flooring', quantity: 12, unit: 'm²', cost: 45 }
        ],
        labour: [
          { trade: 'Groundworker', days: 5, dayRate: 200 },
          { trade: 'Bricklayer', days: 10, dayRate: 250 },
          { trade: 'Carpenter', days: 5, dayRate: 230 },
          { trade: 'Roofer', days: 3, dayRate: 230 },
          { trade: 'Electrician', days: 3, dayRate: 275 },
          { trade: 'Plumber', days: 3, dayRate: 275 },
          { trade: 'Plasterer', days: 4, dayRate: 200 },
          { trade: 'Kitchen fitter', days: 5, dayRate: 200 }
        ],
        toolHire: [
          { tool: 'Mini digger', days: 3, rate: 150 },
          { tool: 'Skip (8 yard)', quantity: 2, rate: 220 }
        ],
        timeline: [
          { phase: 'Planning & Building Control', duration: '8-12 weeks' },
          { phase: 'Groundworks & foundations', duration: '1-2 weeks' },
          { phase: 'Brickwork to roof level', duration: '2-3 weeks' },
          { phase: 'Roof construction', duration: '1 week' },
          { phase: 'First fix services', duration: '1 week' },
          { phase: 'Plastering & second fix', duration: '2 weeks' },
          { phase: 'Kitchen installation', duration: '1 week' },
          { phase: 'Finishing & decoration', duration: '1 week' }
        ],
        totalDuration: '4-5 months (including planning)',
        estimatedCost: { low: 20000, high: 35000, average: 27500 }
      },
      
      'loft_conversion': {
        description: 'Dormer loft conversion with ensuite',
        materials: [
          { item: 'Steel beams', quantity: 4, unit: 'each', cost: 450 },
          { item: 'Timber joists', quantity: 30, unit: 'each', cost: 25 },
          { item: 'Plywood flooring', quantity: 15, unit: 'sheets', cost: 45 },
          { item: 'Dormer materials', quantity: 1, unit: 'set', cost: 2500 },
          { item: 'Velux windows', quantity: 2, unit: 'each', cost: 650 },
          { item: 'Insulation', quantity: 80, unit: 'm²', cost: 12 },
          { item: 'Plasterboard', quantity: 40, unit: 'sheets', cost: 8.50 },
          { item: 'Staircase', quantity: 1, unit: 'each', cost: 1500 },
          { item: 'Ensuite bathroom', quantity: 1, unit: 'set', cost: 2500 }
        ],
        labour: [
          { trade: 'Structural engineer', days: 2, dayRate: 400 },
          { trade: 'Carpenter', days: 15, dayRate: 230 },
          { trade: 'Roofer', days: 5, dayRate: 230 },
          { trade: 'Electrician', days: 4, dayRate: 275 },
          { trade: 'Plumber', days: 4, dayRate: 275 },
          { trade: 'Plasterer', days: 5, dayRate: 200 },
          { trade: 'Decorator', days: 3, dayRate: 180 }
        ],
        timeline: [
          { phase: 'Planning & Building Control', duration: '8-10 weeks' },
          { phase: 'Structural work & floor', duration: '2 weeks' },
          { phase: 'Dormer construction', duration: '2 weeks' },
          { phase: 'First fix services', duration: '1 week' },
          { phase: 'Insulation & boarding', duration: '1 week' },
          { phase: 'Plastering', duration: '1 week' },
          { phase: 'Second fix & bathroom', duration: '2 weeks' },
          { phase: 'Decoration & finishing', duration: '1 week' }
        ],
        totalDuration: '3-4 months (including planning)',
        estimatedCost: { low: 25000, high: 45000, average: 35000 }
      }
    }
  }

  /**
   * Calculate detailed cost breakdown for a project
   */
  calculateProjectCost(projectType: string, specifications?: any): ProjectCostBreakdown {
    const templates = this.getProjectTemplates()
    const template = templates[projectType as keyof typeof templates]
    
    if (!template) {
      return this.createCustomEstimate(projectType, specifications)
    }

    // Calculate totals
    const materialsCost = template.materials.reduce((sum, item) => 
      sum + (item.quantity * item.cost), 0)
    
    const labourCost = template.labour.reduce((sum, item) => 
      sum + (item.days * item.dayRate), 0)
    
    const toolHireCost = template.toolHire?.reduce((sum, item) => 
      sum + (item.days || item.quantity || 1) * item.rate, 0) || 0

    const subtotal = materialsCost + labourCost + toolHireCost
    const contingency = subtotal * 0.15 // 15% contingency
    const vatAmount = (subtotal + contingency) * 0.20 // 20% VAT

    return {
      project: template.description,
      totalCost: {
        low: template.estimatedCost.low,
        high: template.estimatedCost.high,
        average: Math.round(subtotal + contingency + vatAmount)
      },
      materials: template.materials.map(m => ({
        item: m.item,
        quantity: m.quantity,
        unit: m.unit,
        unitCost: m.cost,
        totalCost: m.quantity * m.cost
      })),
      labour: template.labour.map(l => ({
        trade: l.trade,
        days: l.days,
        workers: 1,
        dayRate: l.dayRate,
        totalCost: l.days * l.dayRate
      })),
      toolHire: template.toolHire?.map(t => ({
        tool: t.tool,
        duration: t.days || t.quantity || 1,
        unit: 'day',
        rate: t.rate,
        totalCost: (t.days || t.quantity || 1) * t.rate
      })) || [],
      timeline: template.timeline.map(t => ({
        phase: t.phase,
        duration: t.duration,
        tasks: []
      })),
      contingency: Math.round(contingency),
      vat: Math.round(vatAmount),
      notes: [
        'Prices are estimates based on 2024 UK averages',
        'Actual costs may vary based on location and specification',
        'Includes 15% contingency and 20% VAT',
        `Total project duration: ${template.totalDuration}`
      ]
    }
  }

  /**
   * Create custom estimate for non-template projects
   */
  private createCustomEstimate(projectType: string, specifications?: any): ProjectCostBreakdown {
    // This would use AI to generate custom estimates
    // For now, return a basic template
    return {
      project: projectType,
      totalCost: {
        low: 5000,
        high: 15000,
        average: 10000
      },
      materials: [],
      labour: [],
      toolHire: [],
      timeline: [],
      contingency: 1500,
      vat: 2000,
      notes: ['Custom estimate - speak to Toddy for detailed breakdown']
    }
  }

  /**
   * Generate cost context for AI responses
   */
  getCostingContext(query: string): string {
    // Check if query matches any templates
    const templates = this.getProjectTemplates()
    
    for (const [key, template] of Object.entries(templates)) {
      if (query.toLowerCase().includes(key.replace('_', ' '))) {
        const breakdown = this.calculateProjectCost(key)
        
        let context = `\n## DETAILED COST BREAKDOWN for ${template.description}:\n\n`
        context += `### TOTAL ESTIMATED COST: £${breakdown.totalCost.average.toLocaleString()} (inc. VAT)\n`
        context += `Price range: £${breakdown.totalCost.low.toLocaleString()} - £${breakdown.totalCost.high.toLocaleString()}\n\n`
        
        context += `### MATERIALS (£${breakdown.materials.reduce((s, m) => s + m.totalCost, 0).toLocaleString()}):\n`
        breakdown.materials.forEach(m => {
          context += `- ${m.item}: ${m.quantity} ${m.unit} @ £${m.unitCost}/each = £${m.totalCost}\n`
        })
        
        context += `\n### LABOUR (£${breakdown.labour.reduce((s, l) => s + l.totalCost, 0).toLocaleString()}):\n`
        breakdown.labour.forEach(l => {
          context += `- ${l.trade}: ${l.days} days @ £${l.dayRate}/day = £${l.totalCost}\n`
        })
        
        if (breakdown.toolHire.length > 0) {
          context += `\n### TOOL/PLANT HIRE (£${breakdown.toolHire.reduce((s, t) => s + t.totalCost, 0).toLocaleString()}):\n`
          breakdown.toolHire.forEach(t => {
            context += `- ${t.tool}: ${t.duration} ${t.unit}s @ £${t.rate}/${t.unit} = £${t.totalCost}\n`
          })
        }
        
        context += `\n### PROJECT TIMELINE:\n`
        breakdown.timeline.forEach((phase, index) => {
          context += `${index + 1}. ${phase.phase}: ${phase.duration}\n`
        })
        
        context += `\n### ADDITIONAL COSTS:\n`
        context += `- Contingency (15%): £${breakdown.contingency.toLocaleString()}\n`
        context += `- VAT (20%): £${breakdown.vat.toLocaleString()}\n`
        
        context += `\n*${breakdown.notes.join('\n*')}\n`
        
        return context
      }
    }

    // Return general costing info if no specific match
    return this.getGeneralCostingInfo()
  }

  /**
   * Get general construction costing information
   */
  private getGeneralCostingInfo(): string {
    return `
## CONSTRUCTION COSTING INFORMATION:

### TYPICAL PROJECT COSTS (2024):
- Bathroom renovation: £4,500 - £7,500
- Kitchen renovation: £8,000 - £15,000
- Single storey extension: £15,000 - £30,000 per room
- Loft conversion: £25,000 - £45,000
- Two storey extension: £30,000 - £60,000

### LABOUR DAY RATES:
- Skilled trades: £200 - £350/day
- General builder: £150 - £250/day
- Labourer: £100 - £150/day

### KEY COST FACTORS:
1. Materials (30-40% of total)
2. Labour (40-50% of total)
3. Tool/plant hire (5-10% of total)
4. Contingency (10-15% recommended)
5. VAT (20% on most work)

Ask about specific projects for detailed breakdowns including materials list, labour schedule, and timeline.
`
  }

  /**
   * Get material prices for specific items
   */
  getMaterialPrice(item: string): { item: string; price: number; unit: string; supplier: string } | null {
    const key = Object.keys(this.MATERIAL_COSTS).find(k => 
      item.toLowerCase().includes(k.replace('_', ' '))
    )
    
    if (key) {
      const material = this.MATERIAL_COSTS[key as keyof typeof this.MATERIAL_COSTS]
      return {
        item: key.replace(/_/g, ' '),
        price: material.cost,
        unit: material.unit,
        supplier: material.supplier
      }
    }
    
    return null
  }

  /**
   * Get labour rates for specific trades
   */
  getLabourRate(trade: string): { trade: string; min: number; max: number; avg: number } | null {
    const key = Object.keys(this.LABOUR_RATES).find(k => 
      trade.toLowerCase().includes(k.replace('_', ' '))
    )
    
    if (key) {
      const rate = this.LABOUR_RATES[key as keyof typeof this.LABOUR_RATES]
      return {
        trade: key.replace(/_/g, ' '),
        ...rate
      }
    }
    
    return null
  }
}

export const constructionCostingService = new ConstructionCostingService()