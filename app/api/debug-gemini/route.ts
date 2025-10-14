import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    const debugInfo = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasPublicGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStartsWith: apiKey?.substring(0, 10) || 'none'
    }

    // Test creating GeminiService
    const geminiService = new GeminiService(apiKey)
    
    // Test simple generation
    const testPrompt = 'You are Toddy. Someone says "extension building costs". Give a conversational response.'
    const response = await geminiService.generateContent(testPrompt)
    
    return NextResponse.json({
      debugInfo,
      testResponse: response,
      isUsingFallback: response.includes('For an accurate extension quote, I need'),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}