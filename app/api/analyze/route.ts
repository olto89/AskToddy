import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { googlePlacesService } from '@/lib/google-places/google-places.service'
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

export async function POST(request: NextRequest) {
  try {
    // Log API request - temporarily disabled
    // Sentry.addBreadcrumb({
    //   category: 'api',
    //   message: 'Project analysis requested',
    //   level: 'info',
    //   data: {
    //     endpoint: '/api/analyze',
    //     method: 'POST'
    //   }
    // });
    const body = await request.json()
    const { 
      description, 
      projectType, 
      postcode,
      imageUrls, 
      isFollowUp, 
      previousAnalysis,
      // Enhanced parameters
      location,
      area,
      complexity,
      quality_tier,
      season
    } = body

    if (!description || !projectType) {
      // Sentry.captureMessage('Missing required fields in analyze API', 'warning', {
      //   extra: { hasDescription: !!description, hasProjectType: !!projectType }
      // });
      return NextResponse.json(
        { error: 'Description and project type are required' },
        { status: 400 }
      )
    }

    const geminiService = new GeminiService(process.env.GEMINI_API_KEY)
    
    if (isFollowUp && previousAnalysis) {
      // Handle follow-up questions
      const followUpPrompt = `
        Based on this previous project analysis: ${JSON.stringify(previousAnalysis)}
        
        The user has this follow-up question: "${description}"
        
        Please provide an updated analysis that addresses their question while maintaining all the previous information.
      `
      
      const updatedAnalysis = await geminiService.analyzeProject(
        followUpPrompt,
        projectType,
        imageUrls || []
      )
      
      return NextResponse.json(updatedAnalysis)
    } else {
      // Handle initial analysis
      let analysis = await geminiService.analyzeProject(
        description,
        projectType,
        imageUrls || []
      )
      
      // Add contractor recommendations if postcode is provided
      if (postcode && postcode.trim()) {
        try {
          // Map project type to trade type for contractor search
          const tradeTypeMap: Record<string, string> = {
            'renovation': 'general builder',
            'repair': 'handyman',
            'installation': 'general contractor',
            'landscaping': 'landscaper',
            'painting': 'painter',
            'plumbing': 'plumber',
            'electrical': 'electrician',
            'roofing': 'roofer',
            'flooring': 'carpenter',
            'kitchen': 'kitchen fitter',
            'bathroom': 'bathroom fitter',
            'other': 'general builder'
          }
          
          const tradeType = tradeTypeMap[projectType.toLowerCase()] || 'general builder'
          
          // Get contractor recommendations from Google Places
          const contractors = await googlePlacesService.searchBusinesses({
            query: tradeType,
            location: postcode,
            minRating: 4.0
          })
          
          if (contractors.length > 0) {
            const contractorData = await googlePlacesService.convertToTradespeople(contractors)
            
            // Add contractor recommendations to analysis
            analysis = {
              ...analysis,
              recommendedContractors: contractorData,
              contractorSearchLocation: postcode
            }
          }
        } catch (error) {
          console.error('Error fetching contractor recommendations:', error)
          // Don't fail the whole analysis if contractor search fails
        }
      }
      
      return NextResponse.json(analysis)
    }
  } catch (error) {
    console.error('Enhanced analysis error:', error)
    
    // Capture error in Sentry with context - temporarily disabled
    // Sentry.captureException(error, {
    //   tags: {
    //     api_endpoint: 'analyze',
    //     project_type: body?.projectType
    //   },
    //   extra: {
    //     hasImages: !!(body?.imageUrls?.length),
    //     isFollowUp: body?.isFollowUp,
    //     errorMessage: error instanceof Error ? error.message : 'Unknown error'
    //   }
    // });
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze project',
        details: error instanceof Error ? error.message : 'Unknown error',
        help: 'Try using the /api/analyze-enhanced endpoint for more detailed error information'
      },
      { status: 500 }
    )
  }
}