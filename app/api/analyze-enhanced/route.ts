import { NextRequest, NextResponse } from 'next/server'
import { enhancedGeminiService } from '@/lib/ai/enhanced-gemini.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      description, 
      projectType, 
      imageUrls = [],
      location,
      area,
      complexity,
      quality_tier,
      season,
      isFollowUp = false,
      previousAnalysis 
    } = body

    // Validate required fields
    if (!description && !isFollowUp) {
      return NextResponse.json({
        success: false,
        error: 'Description is required'
      }, { status: 400 })
    }

    if (!projectType) {
      return NextResponse.json({
        success: false,
        error: 'Project type is required'
      }, { status: 400 })
    }

    console.log(`🔍 Enhanced analysis request:`, {
      projectType,
      location,
      area,
      complexity,
      quality_tier,
      season,
      imageCount: imageUrls.length,
      isFollowUp
    })

    const startTime = Date.now()

    let analysis
    
    if (isFollowUp && previousAnalysis) {
      // Handle follow-up questions with context
      analysis = await enhancedGeminiService.analyzeProjectWithRealData(
        `Follow-up question: ${description}\n\nPrevious analysis context: ${JSON.stringify(previousAnalysis)}`,
        projectType,
        [], // No new images for follow-up
        {
          location,
          area,
          complexity: complexity || 'standard',
          quality_tier: quality_tier || 'mid_range',
          season
        }
      )
    } else {
      // Full project analysis
      analysis = await enhancedGeminiService.analyzeProjectWithRealData(
        description,
        projectType,
        imageUrls,
        {
          location,
          area,
          complexity: complexity || 'standard',
          quality_tier: quality_tier || 'mid_range',
          season
        }
      )
    }

    const processingTime = Date.now() - startTime

    console.log(`✅ Enhanced analysis completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        processing_time_ms: processingTime,
        location: location || 'UK average',
        quality_tier: quality_tier || 'mid_range',
        complexity: complexity || 'standard',
        data_sources: analysis.dataQuality.sources,
        confidence: analysis.dataQuality.confidence,
        location_specific: analysis.dataQuality.location_specific,
        api_version: '2.0',
        enhanced_features: [
          'Real-time UK pricing data',
          'Location-specific adjustments',
          'Seasonal factors',
          'Quality tier options',
          'Enhanced cost breakdown',
          'Alternative recommendations'
        ]
      }
    })

  } catch (error) {
    console.error('Enhanced analysis error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      help: 'Please check your request parameters and try again'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Health check and capability information
  const { searchParams } = new URL(request.url)
  const info = searchParams.get('info')

  if (info === 'capabilities') {
    return NextResponse.json({
      api_version: '2.0',
      name: 'Enhanced Construction Project Analysis API',
      capabilities: {
        real_time_pricing: true,
        location_adjustments: true,
        seasonal_factors: true,
        quality_tiers: ['budget', 'mid_range', 'premium'],
        complexity_levels: ['basic', 'standard', 'complex'],
        supported_locations: [
          'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
          'Bristol', 'Sheffield', 'Newcastle', 'Nottingham', 'Cardiff',
          'Edinburgh', 'Glasgow', 'Belfast'
        ],
        data_sources: [
          'Real-time UK construction database',
          'Major tool hire companies (HSS, Speedy, etc.)',
          'Trade cost guides (Checkatrade, MyBuilder)',
          'UK supplier pricing (B&Q, Wickes, Screwfix)',
          'Building regulation databases'
        ],
        analysis_features: [
          'Image analysis for area estimation',
          'Complexity factor assessment',
          'Professional requirement detection',
          'Tool hire cost calculation',
          'Material waste factor inclusion',
          'Labor rate location adjustment',
          'Building control requirement detection',
          'Alternative cost options',
          'Time estimate accuracy'
        ]
      },
      usage: {
        endpoint: '/api/analyze-enhanced',
        method: 'POST',
        required_fields: ['description', 'projectType'],
        optional_fields: {
          location: 'UK city or postcode prefix (e.g., "London", "M1")',
          area: 'Project area in square metres',
          complexity: 'basic | standard | complex',
          quality_tier: 'budget | mid_range | premium',
          season: 'spring | summer | autumn | winter',
          imageUrls: 'Array of image URLs for visual analysis'
        }
      }
    })
  }

  return NextResponse.json({
    service: 'Enhanced Construction Analysis API',
    status: 'operational',
    version: '2.0',
    uptime: process.uptime(),
    get_capabilities: '/api/analyze-enhanced?info=capabilities'
  })
}