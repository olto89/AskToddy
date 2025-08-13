/**
 * Manual Data Structure Analysis
 * Based on manual research of UK construction cost websites
 * This will inform our database schema design
 */

export interface RealWorldDataStructure {
  source: string
  data_format: any
  sample_data: any[]
  notes: string[]
}

/**
 * Analysis of HSS Hire website structure (manual research)
 */
export const HSS_HIRE_ANALYSIS: RealWorldDataStructure = {
  source: 'HSS Hire',
  data_format: {
    tool_listing: {
      name: 'string',
      category: 'string', // Power Tools, Access, Cleaning, etc.
      daily_rate: 'number', // £12.50
      weekly_rate: 'number', // £45.00 
      weekend_rate: 'number', // £18.00
      deposit: 'number', // £50.00
      delivery_available: 'boolean',
      delivery_cost: 'number', // varies by location
      product_code: 'string', // HSS internal code
      description: 'string',
      specifications: {
        power: 'string', // '18V', '240V'
        weight: 'string', // '2.5kg'
        dimensions: 'string'
      }
    }
  },
  sample_data: [
    {
      name: 'Cordless Drill 18V',
      category: 'Power Tools',
      daily_rate: 12.50,
      weekly_rate: 45.00,
      weekend_rate: 18.00,
      deposit: 50.00,
      product_code: 'HSS123',
      description: 'Professional cordless drill with batteries'
    },
    {
      name: 'Mini Digger 1.5T',
      category: 'Plant & Machinery',
      daily_rate: 160.00,
      weekly_rate: 600.00,
      deposit: 500.00,
      delivery_cost: 60.00,
      requires_license: true
    }
  ],
  notes: [
    'Pricing varies by location (London premium)',
    'Weekend rates typically 1.4x daily rate',
    'Delivery costs vary £25-£100 depending on item size',
    'Deposit required for most items',
    'Categories: Power Tools, Access, Cleaning, Plant, Landscaping, Lifting'
  ]
}

/**
 * Analysis of Checkatrade cost guide structure
 */
export const CHECKATRADE_ANALYSIS: RealWorldDataStructure = {
  source: 'Checkatrade',
  data_format: {
    cost_guide: {
      project_type: 'string', // 'Bathroom renovation'
      cost_per_sqm: {
        min: 'number',
        max: 'number',
        average: 'number'
      },
      factors_affecting_cost: 'string[]',
      typical_timeframe: 'string',
      complexity_levels: {
        basic: 'number', // multiplier
        standard: 'number',
        premium: 'number'
      },
      regional_variations: {
        london: 'number', // +40%
        south_east: 'number', // +20%
        north: 'number' // -15%
      },
      breakdown: {
        materials: 'percentage',
        labor: 'percentage',
        other: 'percentage'
      }
    }
  },
  sample_data: [
    {
      project_type: 'Bathroom renovation',
      cost_per_sqm: { min: 800, max: 2000, average: 1200 },
      factors_affecting_cost: [
        'Quality of fixtures',
        'Plumbing complexity',
        'Tiling requirements',
        'Electrical work needed'
      ],
      typical_timeframe: '1-2 weeks',
      complexity_levels: {
        basic: 1.0,
        standard: 1.3,
        premium: 1.8
      }
    },
    {
      project_type: 'Kitchen renovation',
      cost_per_sqm: { min: 1200, max: 3000, average: 1800 },
      factors_affecting_cost: [
        'Cabinet quality',
        'Appliance specifications',
        'Worktop material',
        'Electrical requirements'
      ]
    }
  ],
  notes: [
    'Costs always given as ranges, not fixed prices',
    'Regional variations clearly documented',
    'Complexity factors well-defined',
    'Time estimates included',
    'Material vs labor breakdown provided'
  ]
}

/**
 * Analysis of MyBuilder quote patterns
 */
export const MYBUILDER_ANALYSIS: RealWorldDataStructure = {
  source: 'MyBuilder',
  data_format: {
    quote_data: {
      trade_type: 'string',
      job_description: 'string',
      quoted_price: {
        materials: 'number',
        labor: 'number',
        total: 'number'
      },
      time_estimate: 'string',
      location: 'string',
      tradesperson_rating: 'number',
      quote_date: 'string'
    }
  },
  sample_data: [
    {
      trade_type: 'Electrician',
      job_description: 'Install 3 double sockets in living room',
      quoted_price: {
        materials: 45,
        labor: 180,
        total: 225
      },
      time_estimate: '4 hours',
      location: 'Manchester'
    }
  ],
  notes: [
    'Real quotes from actual tradespeople',
    'Location-specific pricing',
    'Materials and labor separated',
    'Time estimates realistic',
    'Quality ratings available'
  ]
}

/**
 * Analysis of tool hire competitor data
 */
export const TOOL_HIRE_COMPETITORS_ANALYSIS = {
  speedy_hire: {
    pricing_structure: 'daily/weekly/monthly',
    delivery: 'free over £100',
    categories: ['Access', 'Power Tools', 'Plant', 'Safety', 'Survey'],
    special_features: ['Online booking', 'Account management', 'Bulk discounts']
  },
  brandon_hire: {
    pricing_structure: 'daily/weekly',
    focus: 'Local coverage',
    categories: ['Tools', 'Access', 'Plant', 'Events'],
    special_features: ['Price matching', 'Local delivery']
  },
  national_tool_hire: {
    pricing_structure: 'daily/weekly',
    guarantee: 'Price match promise',
    categories: ['Power Tools', 'Garden', 'Cleaning', 'Access'],
    special_features: ['Best price guarantee', 'Free delivery options']
  }
}

/**
 * Suggested optimal database schema based on real-world analysis
 */
export const OPTIMAL_SCHEMA_DESIGN = {
  tool_hire: {
    core_fields: [
      'name',
      'category',
      'subcategory', // More granular than just 'Power Tools'
      'daily_rate',
      'weekly_rate',
      'weekend_rate', // Important for DIY customers
      'monthly_rate', // Some items have this
      'deposit',
      'delivery_cost_base',
      'supplier',
      'product_code',
      'description'
    ],
    optional_fields: [
      'specifications', // JSON field for technical specs
      'requires_license',
      'min_hire_period',
      'availability_status',
      'location_restrictions'
    ],
    pricing_variations: [
      'location_premium', // London +20%, etc.
      'seasonal_adjustments',
      'bulk_discounts'
    ]
  },
  labor_costs: {
    core_fields: [
      'trade_category',
      'job_type_specific', // Very specific: "Install consumer unit"
      'rate_structure', // per_item, per_sqm, per_day, fixed_price
      'base_rate',
      'unit', // sqm, linear_m, per_item, etc.
      'min_charge',
      'typical_time',
      'complexity_multipliers' // JSON: {basic: 1.0, standard: 1.3, complex: 1.8}
    ],
    regional_pricing: [
      'region',
      'location_multiplier',
      'urban_rural_differential'
    ],
    market_factors: [
      'seasonal_variation', // Summer premium for outdoor work
      'demand_level', // High demand = higher rates
      'material_costs_included' // Boolean
    ]
  },
  material_costs: {
    core_structure: [
      'category',
      'subcategory',
      'specific_product',
      'brand_tier', // budget, mid, premium, trade
      'unit_of_measure',
      'base_price',
      'typical_waste_factor',
      'supplier',
      'bulk_break_quantities' // JSON: [{qty: 10, discount: 0.05}]
    ]
  }
}

export function analyzeDataStructures() {
  return {
    hss_hire: HSS_HIRE_ANALYSIS,
    checkatrade: CHECKATRADE_ANALYSIS,
    mybuilder: MYBUILDER_ANALYSIS,
    tool_hire_competitors: TOOL_HIRE_COMPETITORS_ANALYSIS,
    recommended_schema: OPTIMAL_SCHEMA_DESIGN,
    analysis_summary: {
      key_insights: [
        'Pricing always in ranges, not fixed values',
        'Regional variations are significant (15-40%)',
        'Weekend rates different from daily rates', 
        'Complexity multipliers are standard',
        'Delivery costs vary by item size/weight',
        'Deposit requirements common for valuable tools',
        'Seasonal and demand-based pricing exists'
      ],
      schema_recommendations: [
        'Use flexible JSON fields for specifications',
        'Separate tables for regional pricing multipliers',
        'Include time-based rate variations (weekend/seasonal)',
        'Track both material and labor cost components',
        'Support for bulk/volume discounting',
        'Include minimum charges and typical timeframes'
      ]
    }
  }
}