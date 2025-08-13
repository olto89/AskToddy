import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      description, 
      projectType, 
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
      const analysis = await geminiService.analyzeProject(
        description,
        projectType,
        imageUrls || []
      )
      
      return NextResponse.json(analysis)
    }
  } catch (error) {
    console.error('Enhanced analysis error:', error)
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