/**
 * Market Data Collection Service
 * Collects real UK construction pricing data from various sources
 */

export interface DataCollectionTarget {
  source: string
  url: string
  method: 'manual' | 'api' | 'scrape'
  data_type: 'tools' | 'labor' | 'materials'
  update_frequency: string
  notes: string
}

export class MarketDataCollector {
  
  /**
   * High-priority data collection targets
   */
  static getDataCollectionPlan(): DataCollectionTarget[] {
    return [
      // Tool Hire Companies
      {
        source: 'HSS Hire',
        url: 'https://www.hss.com/hire',
        method: 'manual', // Start manual, then automate
        data_type: 'tools',
        update_frequency: 'weekly',
        notes: 'Most comprehensive UK tool hire. Check power tools, access equipment, plant machinery categories'
      },
      {
        source: 'Speedy Hire',
        url: 'https://www.speedyservices.com',
        method: 'manual',
        data_type: 'tools', 
        update_frequency: 'weekly',
        notes: 'Major competitor to HSS. Often has different pricing strategies'
      },
      {
        source: 'Brandon Hire',
        url: 'https://www.brandonhire.co.uk',
        method: 'manual',
        data_type: 'tools',
        update_frequency: 'bi-weekly',
        notes: 'Regional variations, price matching guarantees'
      },

      // Labor Cost Sources
      {
        source: 'Checkatrade Cost Guides',
        url: 'https://www.checkatrade.com/blog/cost-guides/',
        method: 'manual',
        data_type: 'labor',
        update_frequency: 'monthly',
        notes: 'Most reliable source for UK trade costs. Has regional data and complexity factors'
      },
      {
        source: 'MyBuilder Quotes',
        url: 'https://www.mybuilder.com',
        method: 'manual',
        data_type: 'labor',
        update_frequency: 'monthly', 
        notes: 'Real quotes from tradespeople. Good for current market rates'
      },
      {
        source: 'Which? Trusted Traders',
        url: 'https://www.which.co.uk/reviews/trusted-traders',
        method: 'manual',
        data_type: 'labor',
        update_frequency: 'quarterly',
        notes: 'Consumer-focused pricing guides'
      },

      // Material Suppliers
      {
        source: 'B&Q',
        url: 'https://www.diy.com',
        method: 'manual',
        data_type: 'materials',
        update_frequency: 'weekly',
        notes: 'DIY pricing, good for budget tier materials'
      },
      {
        source: 'Wickes', 
        url: 'https://www.wickes.co.uk',
        method: 'manual',
        data_type: 'materials',
        update_frequency: 'weekly',
        notes: 'Trade and DIY pricing, mid-range materials'
      },
      {
        source: 'Screwfix',
        url: 'https://www.screwfix.com',
        method: 'manual',
        data_type: 'materials',
        update_frequency: 'weekly',
        notes: 'Trade pricing, tools and fixing materials'
      },
      {
        source: 'Travis Perkins',
        url: 'https://www.travisperkins.co.uk',
        method: 'manual',
        data_type: 'materials',
        update_frequency: 'weekly',
        notes: 'Builder merchant pricing, bulk materials'
      }
    ]
  }

  /**
   * Data collection template for manual entry
   */
  static generateDataCollectionTemplate(source: string) {
    const templates = {
      'HSS Hire': {
        categories: ['Power Tools', 'Access Equipment', 'Plant Machinery', 'Cleaning', 'Landscaping'],
        sample_items: [
          { name: 'Cordless Drill 18V', daily_rate: 0, weekly_rate: 0, deposit: 0 },
          { name: 'Step Ladder 8ft', daily_rate: 0, weekly_rate: 0, deposit: 0 },
          { name: 'Mini Digger 1.5T', daily_rate: 0, weekly_rate: 0, deposit: 0, delivery_cost: 0 }
        ]
      },
      'Checkatrade': {
        categories: ['Bathroom Renovation', 'Kitchen Fitting', 'Electrical Work', 'Plumbing', 'Tiling'],
        sample_costs: [
          { job_type: 'Small bathroom renovation', cost_per_sqm_min: 0, cost_per_sqm_max: 0 },
          { job_type: 'Kitchen renovation', cost_per_sqm_min: 0, cost_per_sqm_max: 0 },
          { job_type: 'Rewire 3-bed house', fixed_cost_min: 0, fixed_cost_max: 0 }
        ]
      },
      'B&Q': {
        categories: ['Tiles', 'Paint', 'Electrical', 'Plumbing', 'Timber'],
        sample_materials: [
          { name: 'Ceramic wall tiles 200x250mm', price_per_sqm: 0, unit: 'per_sqm' },
          { name: 'Matt emulsion 5L', price: 0, unit: 'per_tin', coverage: '60 sqm' },
          { name: 'Twin & earth cable 2.5mm', price_per_metre: 0, unit: 'per_metre' }
        ]
      }
    }

    return templates[source as keyof typeof templates] || null
  }

  /**
   * Price validation rules to ensure data quality
   */
  static validatePricing(data: any): { valid: boolean, issues: string[] } {
    const issues: string[] = []
    
    // Tool hire validation
    if (data.daily_rate) {
      if (data.daily_rate < 5 || data.daily_rate > 500) {
        issues.push('Daily rate seems unrealistic (£5-£500 range expected)')
      }
      if (data.weekly_rate && data.weekly_rate < data.daily_rate * 3) {
        issues.push('Weekly rate should typically be 3-5x daily rate')
      }
    }
    
    // Labor cost validation
    if (data.cost_per_sqm) {
      if (data.cost_per_sqm < 10 || data.cost_per_sqm > 5000) {
        issues.push('Cost per sqm outside realistic range (£10-£5000)')
      }
    }
    
    // Material cost validation
    if (data.price_per_sqm) {
      if (data.price_per_sqm < 1 || data.price_per_sqm > 1000) {
        issues.push('Material price per sqm outside realistic range')
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  }
}

/**
 * Manual data collection workflows
 */
export const DataCollectionWorkflows = {
  
  /**
   * Week 1: Tool Hire Data Collection
   */
  week1_tools: {
    monday: 'HSS Hire - Power tools category (drills, saws, sanders)',
    tuesday: 'HSS Hire - Access equipment (ladders, scaffolding)',
    wednesday: 'Speedy Hire - Power tools comparison',
    thursday: 'Speedy Hire - Plant machinery',
    friday: 'Brandon Hire - Regional pricing check',
    focus: 'Get 20-30 most common tools with accurate daily/weekly rates'
  },

  /**
   * Week 2: Labor Cost Research  
   */
  week2_labor: {
    monday: 'Checkatrade - Bathroom renovation costs',
    tuesday: 'Checkatrade - Kitchen and electrical costs',
    wednesday: 'MyBuilder - Real quote examples collection',
    thursday: 'Which? - Consumer guide pricing',
    friday: 'Regional comparison (London vs Manchester vs Birmingham)',
    focus: 'Get 15-20 common job types with complexity factors'
  },

  /**
   * Week 3: Material Costs
   */
  week3_materials: {
    monday: 'B&Q - Tiles, paint, basic materials',
    tuesday: 'Wickes - Building materials, timber',
    wednesday: 'Screwfix - Electrical, plumbing supplies', 
    thursday: 'Travis Perkins - Bulk materials, trade prices',
    friday: 'Price comparison and quality tier classification',
    focus: 'Get 30-40 common materials across budget/mid/premium tiers'
  }
}

export default MarketDataCollector