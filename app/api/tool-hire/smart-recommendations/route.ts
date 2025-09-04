import { NextRequest, NextResponse } from 'next/server'

// Enhanced tool hire API with AI-powered recommendations using product descriptions
export async function POST(request: NextRequest) {
  try {
    const { userQuery, location, projectType } = await request.json()

    // This would connect to your tool hire database with descriptions
    const recommendations = await getIntelligentToolRecommendations(
      userQuery, 
      location, 
      projectType
    )

    return NextResponse.json({
      query: userQuery,
      location,
      recommendations: recommendations.map(rec => ({
        tool_name: rec.name,
        description: rec.description,
        why_recommended: rec.reasoning,
        supplier: rec.supplier,
        pricing: rec.pricing,
        specifications: rec.specifications,
        suitable_for: rec.suitableFor,
        safety_requirements: rec.safetyRequirements,
        alternatives: rec.alternatives,
        tutorial_link: `https://youtube.com/results?search_query=${encodeURIComponent(`how to use ${rec.name} safely UK tutorial`)}`,
        confidence_score: rec.confidence
      }))
    })

  } catch (error) {
    console.error('Smart recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' }, 
      { status: 500 }
    )
  }
}

async function getIntelligentToolRecommendations(
  userQuery: string, 
  location: string, 
  projectType?: string
) {
  // This is where the magic happens - using rich product data for AI recommendations
  
  const mockRecommendations = [
    {
      name: "1.5 Tonne Mini Excavator",
      description: "Compact mini excavator perfect for tight spaces and precision work. Features rubber tracks, zero tail swing, and quick hitch system.",
      reasoning: "Perfect size for residential garden work. Zero tail swing allows working close to boundaries and structures. Rubber tracks protect paved surfaces.",
      supplier: "Toddy Tool Hire",
      pricing: {
        daily: 85,
        weekly: 255,
        weekend: 170
      },
      specifications: {
        weight: "1500kg",
        width: "990mm",
        dig_depth: "2.5m",
        features: ["Zero tail swing", "Rubber tracks", "Quick hitch", "Dozer blade"]
      },
      suitableFor: [
        "Garden landscaping",
        "Drainage installation", 
        "Foundation digging under 2.5m",
        "Pool excavation",
        "Driveway preparation"
      ],
      safetyRequirements: [
        "CPCS/NPORS card recommended for commercial use",
        "PPE required (hard hat, hi-vis, safety boots)",
        "Underground services check essential",
        "Site risk assessment needed"
      ],
      alternatives: [
        "0.8 Tonne Micro Excavator for very tight access",
        "3 Tonne Excavator for larger projects", 
        "Hand tools for very small jobs under 1m³"
      ],
      confidence: 0.95
    },
    {
      name: "110L Petrol Concrete Mixer",
      description: "Reliable petrol concrete mixer with Honda engine, perfect for continuous mixing on sites without power.",
      reasoning: "No mains power needed for garden projects. Honda engine provides reliable performance. 110L capacity suits most residential concrete work.",
      supplier: "Local Hire Partner",
      pricing: {
        daily: 32,
        weekly: 96,
        weekend: 60
      },
      specifications: {
        capacity: "110 litres",
        engine: "Honda GX120",
        features: ["Tip-up mechanism", "Steel drum", "Pneumatic tyres"]
      },
      suitableFor: [
        "Concrete foundations",
        "Garden path laying",
        "Fence post setting",
        "Small driveways"
      ],
      safetyRequirements: [
        "Eye protection essential",
        "Dust mask for cement work",
        "Manual handling training",
        "Non-slip footwear"
      ],
      alternatives: [
        "Ready-mix concrete delivery for large pours",
        "Hand mixing for small jobs under 0.25m³",
        "200L mixer for bigger projects"
      ],
      confidence: 0.88
    }
  ]

  return mockRecommendations
}

// GET endpoint for simple tool searches
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tool = searchParams.get('tool')
  const region = searchParams.get('region')

  // Simple search without AI reasoning
  return NextResponse.json({
    message: `Searching for ${tool} in ${region}`,
    results: "Basic tool list would be here"
  })
}