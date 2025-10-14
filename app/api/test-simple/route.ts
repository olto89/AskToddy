import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test which services are causing issues
    let results = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasPublicGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      imports: {
        geminiService: false,
        pricingService: false,
        constructionDataService: false
      }
    }

    // Try importing GeminiService
    try {
      const GeminiService = (await import('@/lib/ai/gemini.service')).default
      results.imports.geminiService = true
      
      // Try creating instance
      const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (apiKey) {
        const service = new GeminiService(apiKey)
        results.imports.geminiService = 'initialized'
      }
    } catch (e) {
      results.imports.geminiService = `failed: ${e instanceof Error ? e.message : 'unknown'}`
    }

    // Try importing pricing service
    try {
      const { pricingService } = await import('@/lib/pricing/pricing.service')
      results.imports.pricingService = true
    } catch (e) {
      results.imports.pricingService = `failed: ${e instanceof Error ? e.message : 'unknown'}`
    }

    // Try importing construction data service
    try {
      const { constructionDataService } = await import('@/lib/construction-data/construction-data.service')
      results.imports.constructionDataService = true
    } catch (e) {
      results.imports.constructionDataService = `failed: ${e instanceof Error ? e.message : 'unknown'}`
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}