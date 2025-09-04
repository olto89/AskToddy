import { NextRequest, NextResponse } from 'next/server'
import toolKnowledge from '@/data/tool-knowledge-base.json'

export async function POST(request: NextRequest) {
  try {
    const { query, projectDetails } = await request.json()
    
    // Analyze the user's needs
    const analysis = analyzeProject(query, projectDetails)
    
    // Get tool recommendations
    const recommendations = getToolRecommendations(analysis)
    
    // Add indicative pricing (HSS baseline + regional variance)
    const pricedRecommendations = addIndicativePricing(recommendations)
    
    // Generate buy vs rent advice
    const purchaseAdvice = generatePurchaseAdvice(analysis, recommendations)
    
    return NextResponse.json({
      project_analysis: analysis,
      recommended_tools: pricedRecommendations,
      purchase_advice: purchaseAdvice,
      safety_notes: generateSafetyNotes(recommendations),
      pro_tips: generateProTips(analysis, recommendations),
      alternatives: generateAlternatives(recommendations),
      suppliers: getSupplierRecommendations(analysis.location)
    })
    
  } catch (error) {
    console.error('Tool advisor error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

function analyzeProject(query: string, details: any) {
  const queryLower = query.toLowerCase()
  
  // Determine project type
  let projectType = 'general'
  let scale = 'small'
  let duration = 'short'
  
  // Excavation projects
  if (queryLower.includes('dig') || queryLower.includes('excavat') || queryLower.includes('trench')) {
    projectType = 'excavation'
    
    if (queryLower.includes('garden') || queryLower.includes('fence')) {
      scale = 'small'
    } else if (queryLower.includes('foundation') || queryLower.includes('pool')) {
      scale = 'medium'
    } else if (queryLower.includes('basement') || queryLower.includes('large')) {
      scale = 'large'
    }
  }
  
  // Concrete projects
  if (queryLower.includes('concrete') || queryLower.includes('cement') || queryLower.includes('path')) {
    projectType = 'concreting'
    
    if (queryLower.includes('repair') || queryLower.includes('small')) {
      scale = 'small'
    } else if (queryLower.includes('driveway') || queryLower.includes('patio')) {
      scale = 'medium'
    }
  }
  
  // Breaking/demolition
  if (queryLower.includes('break') || queryLower.includes('demolish') || queryLower.includes('remove')) {
    projectType = 'demolition'
  }
  
  return {
    query,
    projectType,
    scale,
    duration,
    location: details?.location || 'UK',
    budget: details?.budget || 'standard',
    experience: details?.experience || 'diy'
  }
}

function getToolRecommendations(analysis: any) {
  const recommendations = []
  
  if (analysis.projectType === 'excavation') {
    if (analysis.scale === 'small') {
      recommendations.push({
        tool: 'mini_excavator_1_5t',
        priority: 'primary',
        reason: 'Perfect size for garden projects with good reach and power',
        ...toolKnowledge.tools.mini_excavator_1_5t
      })
      
      recommendations.push({
        tool: 'dumper_1t',
        priority: 'supporting',
        reason: 'Essential for moving excavated material',
        name: '1 Tonne Dumper',
        category: 'Material Handling'
      })
    } else if (analysis.scale === 'medium') {
      recommendations.push({
        tool: 'excavator_3t',
        priority: 'primary',
        reason: 'More power and reach for deeper excavations',
        name: '3 Tonne Excavator',
        category: 'Excavators & Diggers'
      })
    }
  }
  
  if (analysis.projectType === 'concreting') {
    if (analysis.scale === 'small') {
      recommendations.push({
        tool: 'concrete_mixer_110l',
        priority: 'primary',
        reason: 'Ideal capacity for small to medium concrete jobs',
        ...toolKnowledge.tools.concrete_mixer_110l
      })
    } else {
      recommendations.push({
        tool: 'ready_mix',
        priority: 'primary',
        reason: 'More economical for volumes over 1m³',
        name: 'Ready Mix Concrete Delivery',
        category: 'Concrete Supply'
      })
    }
    
    recommendations.push({
      tool: 'vibrating_poker',
      priority: 'supporting',
      reason: 'Removes air bubbles for stronger concrete',
      name: 'Concrete Vibrating Poker',
      category: 'Concrete Tools'
    })
  }
  
  if (analysis.projectType === 'demolition') {
    recommendations.push({
      tool: 'breaker_medium',
      priority: 'primary',
      reason: 'Powerful enough for most concrete breaking',
      name: 'Medium Electric Breaker',
      category: 'Breaking & Drilling'
    })
    
    if (analysis.scale !== 'small') {
      recommendations.push({
        tool: 'generator_3kva',
        priority: 'supporting',
        reason: 'Power for electric tools if no mains available',
        ...toolKnowledge.tools.generator_3kva
      })
    }
  }
  
  return recommendations
}

function addIndicativePricing(recommendations: any[]) {
  // Use HSS/Speedy baseline with regional adjustments
  const pricingData: any = {
    'mini_excavator_1_5t': { daily: 95, weekly: 285 },
    'excavator_3t': { daily: 140, weekly: 420 },
    'concrete_mixer_110l': { daily: 32, weekly: 96 },
    'dumper_1t': { daily: 75, weekly: 225 },
    'breaker_medium': { daily: 45, weekly: 135 },
    'generator_3kva': { daily: 40, weekly: 120 },
    'vibrating_poker': { daily: 25, weekly: 75 }
  }
  
  return recommendations.map(rec => ({
    ...rec,
    indicative_pricing: pricingData[rec.tool] || { daily: 50, weekly: 150 },
    price_note: 'Prices are indicative. Local suppliers may offer better rates.'
  }))
}

function generatePurchaseAdvice(analysis: any, recommendations: any[]) {
  const advice = []
  
  recommendations.forEach(rec => {
    if (rec.buy_vs_rent) {
      const shouldRent = analysis.duration === 'short' || analysis.scale === 'small'
      
      advice.push({
        tool: rec.name,
        recommendation: shouldRent ? 'rent' : 'consider_buying',
        reasoning: shouldRent 
          ? `One-off project - rental more economical (£${rec.indicative_pricing?.daily}/day)`
          : `If you have multiple projects planned, buying might save money long-term`,
        break_even: `${Math.round((rec.used_price_range?.split('-')[0].replace(/[£,]/g, '') || 5000) / rec.indicative_pricing?.daily)} days of rental equals purchase price`
      })
    }
  })
  
  return advice
}

function generateSafetyNotes(recommendations: any[]) {
  const safetyNotes = new Set<string>()
  
  recommendations.forEach(rec => {
    if (rec.safety_requirements) {
      rec.safety_requirements.forEach((req: string) => safetyNotes.add(req))
    }
  })
  
  // Always include these
  safetyNotes.add('Always read equipment manual before use')
  safetyNotes.add('Wear appropriate PPE')
  safetyNotes.add('Check for underground services before digging')
  
  return Array.from(safetyNotes)
}

function generateProTips(analysis: any, recommendations: any[]) {
  const tips = []
  
  // General tips based on project type
  if (analysis.projectType === 'excavation') {
    tips.push('Mark out dig area with spray paint before starting')
    tips.push('Call 811 (or use CAT scanner) to check for utilities')
    tips.push('Have skip or grab lorry arranged for spoil removal')
  }
  
  if (analysis.projectType === 'concreting') {
    tips.push('Order 10% extra material to avoid running short')
    tips.push('Check weather forecast - avoid rain for 24 hours after pour')
    tips.push('Have plastic sheeting ready to cover if rain threatens')
  }
  
  // Tool-specific tips
  recommendations.forEach(rec => {
    if (rec.pro_tips) {
      tips.push(...rec.pro_tips.slice(0, 2))
    }
  })
  
  return tips
}

function generateAlternatives(recommendations: any[]) {
  const alternatives = []
  
  recommendations.forEach(rec => {
    if (rec.alternatives) {
      if (rec.alternatives.manual) {
        alternatives.push({
          original: rec.name,
          alternative: rec.alternatives.manual.tool,
          when_to_use: rec.alternatives.manual.when,
          cost_saving: 'Significant - no hire cost'
        })
      }
    }
  })
  
  return alternatives
}

function getSupplierRecommendations(location?: string) {
  // Start with just HSS and 2 others for MVP
  const suppliers = [
    {
      name: 'HSS Hire',
      type: 'National Chain',
      pros: ['Wide availability', 'Consistent pricing', 'Good equipment condition'],
      cons: ['Often more expensive', 'Less flexible on rates'],
      website: 'hss.com',
      indicative_pricing: 'Standard rates shown above'
    },
    {
      name: 'Speedy Hire',
      type: 'National Chain',
      pros: ['Large fleet', 'Multiple locations', 'Online booking'],
      cons: ['Premium pricing', 'Busy periods may have limited availability'],
      website: 'speedyservices.com',
      indicative_pricing: 'Similar to HSS'
    },
    {
      name: 'Local Independent Hire Shop',
      type: 'Local Supplier',
      pros: ['Often 20-30% cheaper', 'More flexible', 'Local knowledge'],
      cons: ['Variable equipment condition', 'Limited fleet size'],
      tip: 'Search Google for "tool hire near me" for local options',
      indicative_pricing: 'Typically 20-30% below national chains'
    }
  ]
  
  // Add regional recommendation if available
  if (location && location.includes('East')) {
    suppliers.unshift({
      name: 'Toddy Tool Hire',
      type: 'Regional Specialist',
      pros: ['Competitive local pricing', 'Excellent service', 'Expert advice'],
      cons: ['East England only'],
      website: 'toddytoolhire.co.uk',
      indicative_pricing: 'Best value in East England'
    })
  }
  
  return suppliers
}

// GET endpoint for tool information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tool = searchParams.get('tool')
  
  if (tool && toolKnowledge.tools[tool as keyof typeof toolKnowledge.tools]) {
    return NextResponse.json({
      tool: toolKnowledge.tools[tool as keyof typeof toolKnowledge.tools]
    })
  }
  
  // Return categories if no specific tool requested
  const categories = Object.values(toolKnowledge.tools).reduce((acc: any, tool: any) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push({
      id: tool.name.toLowerCase().replace(/ /g, '_'),
      name: tool.name,
      description: tool.description
    })
    return acc
  }, {})
  
  return NextResponse.json({ categories })
}