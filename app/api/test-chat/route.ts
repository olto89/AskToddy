import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message = 'Hello' } = body

    // Simple test without all the complex services
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'No API key',
        hasGemini: false,
        hasPublic: false
      }, { status: 500 })
    }

    const geminiService = new GeminiService(apiKey)
    
    const response = await geminiService.generateContent(
      `You are Toddy, a friendly construction expert. User says: ${message}. Give a brief, helpful response.`
    )
    
    return NextResponse.json({ 
      response,
      success: true 
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Test chat error:', errorMessage)
    
    return NextResponse.json({
      error: 'Chat failed',
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}