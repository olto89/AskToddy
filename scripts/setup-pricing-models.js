const contentfulManagement = require('contentful-management')

const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN || ''
const SPACE_ID = 'htwj3qfvjshy'
const ENVIRONMENT_ID = 'master'

if (!MANAGEMENT_TOKEN) {
  console.error('❌ Missing CONTENTFUL_MANAGEMENT_TOKEN')
  console.log('Run: CONTENTFUL_MANAGEMENT_TOKEN=your-token npm run setup-pricing')
  process.exit(1)
}

async function setupPricingModels() {
  try {
    console.log('🧠 Creating Pricing Intelligence Models...\n')
    
    const client = contentfulManagement.createClient({
      accessToken: MANAGEMENT_TOKEN
    })

    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // 1. Research Data Point Model
    console.log('📊 Creating Research Data Point model...')
    try {
      const researchDataPoint = await environment.createContentTypeWithId('researchDataPoint', {
        name: 'Research Data Point',
        displayField: 'source',
        fields: [
          {
            id: 'source',
            name: 'Data Source',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{size: {max: 200}}]
          },
          {
            id: 'publicationDate',
            name: 'Publication Date',
            type: 'Date',
            required: true,
            localized: false
          },
          {
            id: 'reliability',
            name: 'Reliability Score (1-10)',
            type: 'Integer',
            required: true,
            localized: false,
            validations: [{range: {min: 1, max: 10}}]
          },
          {
            id: 'priceType',
            name: 'Price Type',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['tool_hire', 'material_cost', 'labor_rate', 'per_sqm_cost', 'project_total']
            }]
          },
          {
            id: 'item',
            name: 'Item/Service Name',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'price',
            name: 'Price (£)',
            type: 'Number',
            required: true,
            localized: false,
            validations: [{range: {min: 0}}]
          },
          {
            id: 'priceUnit',
            name: 'Price Unit',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['per_day', 'per_week', 'per_sqm', 'per_hour', 'per_unit', 'total_project']
            }]
          },
          {
            id: 'location',
            name: 'Location/Region',
            type: 'Symbol',
            required: false,
            localized: false
          },
          {
            id: 'specification',
            name: 'Specification Level',
            type: 'Symbol',
            required: false,
            localized: false,
            validations: [{
              in: ['budget', 'standard', 'premium']
            }]
          },
          {
            id: 'notes',
            name: 'Additional Notes',
            type: 'Text',
            required: false,
            localized: false
          },
          {
            id: 'sourceUrl',
            name: 'Source URL',
            type: 'Symbol',
            required: false,
            localized: false
          }
        ]
      })
      await researchDataPoint.publish()
      console.log('✅ Research Data Point model created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Research Data Point model already exists')
      } else {
        throw error
      }
    }

    // 2. Base Rate Model (Calculated Averages)
    console.log('📈 Creating Base Rate model...')
    try {
      const baseRate = await environment.createContentTypeWithId('baseRate', {
        name: 'Base Rate',
        displayField: 'item',
        fields: [
          {
            id: 'item',
            name: 'Item/Service Name',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'category',
            name: 'Category',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['power_tools', 'hand_tools', 'heavy_machinery', 'scaffolding', 'materials_timber', 'materials_concrete', 'materials_electrical', 'labor_general', 'labor_specialist']
            }]
          },
          {
            id: 'averagePrice',
            name: 'Average Price (£)',
            type: 'Number',
            required: true,
            localized: false,
            validations: [{range: {min: 0}}]
          },
          {
            id: 'priceRangeMin',
            name: 'Price Range Min (£)',
            type: 'Number',
            required: true,
            localized: false,
            validations: [{range: {min: 0}}]
          },
          {
            id: 'priceRangeMax',
            name: 'Price Range Max (£)',
            type: 'Number',
            required: true,
            localized: false,
            validations: [{range: {min: 0}}]
          },
          {
            id: 'priceUnit',
            name: 'Price Unit',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['per_day', 'per_week', 'per_sqm', 'per_hour', 'per_unit']
            }]
          },
          {
            id: 'confidence',
            name: 'Confidence Score (1-10)',
            type: 'Integer',
            required: true,
            localized: false,
            validations: [{range: {min: 1, max: 10}}]
          },
          {
            id: 'dataPointCount',
            name: 'Number of Data Points',
            type: 'Integer',
            required: true,
            localized: false,
            validations: [{range: {min: 1}}]
          },
          {
            id: 'lastCalculated',
            name: 'Last Calculated',
            type: 'Date',
            required: true,
            localized: false
          },
          {
            id: 'seasonalAdjustment',
            name: 'Seasonal Price Adjustment',
            type: 'Number',
            required: false,
            localized: false,
            validations: [{range: {min: 0.5, max: 2.0}}]
          },
          {
            id: 'regionalVariation',
            name: 'Regional Price Variation',
            type: 'Object',
            required: false,
            localized: false
          }
        ]
      })
      await baseRate.publish()
      console.log('✅ Base Rate model created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Base Rate model already exists')
      } else {
        throw error
      }
    }

    // 3. Project Template Model
    console.log('🏗️ Creating Project Template model...')
    try {
      const projectTemplate = await environment.createContentTypeWithId('projectTemplate', {
        name: 'Project Template',
        displayField: 'name',
        fields: [
          {
            id: 'name',
            name: 'Project Name',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'category',
            name: 'Category',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['decking', 'tiling', 'painting', 'landscaping', 'plumbing', 'electrical', 'kitchen', 'bathroom', 'extension']
            }]
          },
          {
            id: 'description',
            name: 'Description',
            type: 'Text',
            required: false,
            localized: false
          },
          {
            id: 'baseTimePerSqm',
            name: 'Base Time Per Square Meter (days)',
            type: 'Number',
            required: true,
            localized: false,
            validations: [{range: {min: 0.01, max: 10}}]
          },
          {
            id: 'requiredTools',
            name: 'Required Tools',
            type: 'Object',
            required: true,
            localized: false
          },
          {
            id: 'materialCostPerSqm',
            name: 'Material Cost Per Sqm by Spec',
            type: 'Object',
            required: true,
            localized: false
          },
          {
            id: 'laborCostPerSqm',
            name: 'Labor Cost Per Sqm by Spec',
            type: 'Object',
            required: true,
            localized: false
          },
          {
            id: 'complexityFactors',
            name: 'Complexity Factors',
            type: 'Object',
            required: false,
            localized: false
          },
          {
            id: 'skillLevel',
            name: 'Required Skill Level',
            type: 'Symbol',
            required: true,
            localized: false,
            validations: [{
              in: ['beginner', 'intermediate', 'advanced', 'professional_only']
            }]
          },
          {
            id: 'seasonality',
            name: 'Seasonal Considerations',
            type: 'Object',
            required: false,
            localized: false
          }
        ]
      })
      await projectTemplate.publish()
      console.log('✅ Project Template model created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Project Template model already exists')
      } else {
        throw error
      }
    }

    // 4. Cost Calculation Model
    console.log('🧮 Creating Cost Calculation model...')
    try {
      const costCalculation = await environment.createContentTypeWithId('costCalculation', {
        name: 'Cost Calculation',
        displayField: 'calculationName',
        fields: [
          {
            id: 'calculationName',
            name: 'Calculation Name',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'projectType',
            name: 'Project Type',
            type: 'Symbol',
            required: true,
            localized: false
          },
          {
            id: 'specMultipliers',
            name: 'Specification Multipliers',
            type: 'Object',
            required: true,
            localized: false
          },
          {
            id: 'timeEstimates',
            name: 'Time Estimates by Spec',
            type: 'Object',
            required: true,
            localized: false
          },
          {
            id: 'priceFactors',
            name: 'Price Adjustment Factors',
            type: 'Object',
            required: true,
            localized: false
          },
          {
            id: 'active',
            name: 'Active Calculation',
            type: 'Boolean',
            required: true,
            localized: false
          }
        ]
      })
      await costCalculation.publish()
      console.log('✅ Cost Calculation model created')
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Cost Calculation model already exists')
      } else {
        throw error
      }
    }

    console.log('\n✨ Pricing Intelligence Models Created!')
    
    // Now create sample data
    console.log('\n📚 Creating sample pricing data...\n')

    // Sample Research Data Points
    const sampleResearchData = [
      {
        source: 'Which? Home Improvement Costs 2024',
        publicationDate: '2024-01-15',
        reliability: 9,
        priceType: 'tool_hire',
        item: 'Concrete Mixer',
        price: 30,
        priceUnit: 'per_day',
        location: 'UK National',
        specification: 'standard',
        notes: 'Average daily hire rate from major suppliers',
        sourceUrl: 'https://which.co.uk/reviews/home-improvements'
      },
      {
        source: 'Construction News Price Index Q1 2024',
        publicationDate: '2024-03-01',
        reliability: 8,
        priceType: 'per_sqm_cost',
        item: 'Composite Decking Installation',
        price: 85,
        priceUnit: 'per_sqm',
        location: 'UK National',
        specification: 'standard',
        notes: 'Including materials and labor'
      },
      {
        source: 'Homebuilding Magazine March 2024',
        publicationDate: '2024-03-15',
        reliability: 7,
        priceType: 'material_cost',
        item: 'Pressure Treated Decking Boards',
        price: 35,
        priceUnit: 'per_sqm',
        location: 'UK National',
        specification: 'standard',
        notes: '32mm thick boards from builders merchants'
      }
    ]

    for (const data of sampleResearchData) {
      try {
        const entry = await environment.createEntry('researchDataPoint', {
          fields: {
            source: {'en-US': data.source},
            publicationDate: {'en-US': data.publicationDate},
            reliability: {'en-US': data.reliability},
            priceType: {'en-US': data.priceType},
            item: {'en-US': data.item},
            price: {'en-US': data.price},
            priceUnit: {'en-US': data.priceUnit},
            location: {'en-US': data.location},
            specification: {'en-US': data.specification},
            notes: {'en-US': data.notes},
            sourceUrl: {'en-US': data.sourceUrl || ''}
          }
        })
        await entry.publish()
        console.log(`✅ Research data created: ${data.item}`)
      } catch (error) {
        console.log(`⚠️  Could not create research data: ${data.item}`)
      }
    }

    // Sample Base Rates
    const sampleBaseRates = [
      {
        item: 'Concrete Mixer (120L)',
        category: 'heavy_machinery',
        averagePrice: 28,
        priceRangeMin: 22,
        priceRangeMax: 35,
        priceUnit: 'per_day',
        confidence: 8,
        dataPointCount: 5,
        lastCalculated: new Date().toISOString().split('T')[0]
      },
      {
        item: 'Circular Saw',
        category: 'power_tools',
        averagePrice: 18,
        priceRangeMin: 12,
        priceRangeMax: 25,
        priceUnit: 'per_day',
        confidence: 9,
        dataPointCount: 8,
        lastCalculated: new Date().toISOString().split('T')[0]
      }
    ]

    for (const rate of sampleBaseRates) {
      try {
        const entry = await environment.createEntry('baseRate', {
          fields: {
            item: {'en-US': rate.item},
            category: {'en-US': rate.category},
            averagePrice: {'en-US': rate.averagePrice},
            priceRangeMin: {'en-US': rate.priceRangeMin},
            priceRangeMax: {'en-US': rate.priceRangeMax},
            priceUnit: {'en-US': rate.priceUnit},
            confidence: {'en-US': rate.confidence},
            dataPointCount: {'en-US': rate.dataPointCount},
            lastCalculated: {'en-US': rate.lastCalculated}
          }
        })
        await entry.publish()
        console.log(`✅ Base rate created: ${rate.item}`)
      } catch (error) {
        console.log(`⚠️  Could not create base rate: ${rate.item}`)
      }
    }

    // Sample Project Template
    try {
      const deckingTemplate = await environment.createEntry('projectTemplate', {
        fields: {
          name: {'en-US': 'Build Composite Decking'},
          category: {'en-US': 'decking'},
          description: {'en-US': 'Install composite decking with subframe and joists'},
          baseTimePerSqm: {'en-US': 0.4},
          requiredTools: {'en-US': [
            {tool: 'Circular Saw', daysNeeded: 2, essential: true},
            {tool: 'Drill/Driver', daysNeeded: 5, essential: true},
            {tool: 'Spirit Level', daysNeeded: 5, essential: true},
            {tool: 'Concrete Mixer', daysNeeded: 1, essential: false}
          ]},
          materialCostPerSqm: {'en-US': {
            budget: 35,
            standard: 55,
            premium: 85
          }},
          laborCostPerSqm: {'en-US': {
            budget: 25,
            standard: 40,
            premium: 65
          }},
          skillLevel: {'en-US': 'intermediate'},
          complexityFactors: {'en-US': {
            'ground_preparation': 1.3,
            'multiple_levels': 1.5,
            'curved_edges': 1.4,
            'existing_structure_removal': 1.2
          }}
        }
      })
      await deckingTemplate.publish()
      console.log('✅ Project template created: Build Composite Decking')
    } catch (error) {
      console.log('⚠️  Could not create project template')
    }

    console.log('\n🎉 Pricing Intelligence Setup Complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Visit Contentful to see your new pricing models')
    console.log('2. Add more research data points from legitimate sources')
    console.log('3. Build the cost calculation engine in your app')
    console.log('4. Integrate with Toddy AI for intelligent responses')
    
  } catch (error) {
    console.error('❌ Error setting up pricing models:', error)
    process.exit(1)
  }
}

setupPricingModels()