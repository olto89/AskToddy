import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'

export async function GET(request: NextRequest) {
  // Capture console logs
  const logs: string[] = []
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  
  console.log = (...args) => {
    logs.push('LOG: ' + args.join(' '))
    originalConsoleLog(...args)
  }
  console.error = (...args) => {
    logs.push('ERROR: ' + args.join(' '))
    originalConsoleError(...args)
  }
  
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    // Test direct Gemini import
    let directGeminiTest = 'not tested'
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      directGeminiTest = 'import successful'
      
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        directGeminiTest = 'model creation successful'
      }
    } catch (err) {
      directGeminiTest = `import failed: ${err instanceof Error ? err.message : 'unknown'}`
    }
    
    const debugInfo = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasPublicGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStartsWith: apiKey?.substring(0, 10) || 'none',
      directGeminiTest
    }

    // Test creating GeminiService
    logs.push('Creating GeminiService...')
    const geminiService = new GeminiService(apiKey)
    
    // Check internal state
    const hasGenAI = !!(geminiService as any).genAI
    const hasModel = !!(geminiService as any).model
    
    logs.push(`GeminiService state - genAI: ${hasGenAI}, model: ${hasModel}`)
    
    // Test simple generation
    logs.push('Testing generateContent...')
    const testPrompt = 'You are Toddy. Someone says "extension building costs". Give a conversational response.'
    const response = await geminiService.generateContent(testPrompt)
    
    logs.push(`Response received, length: ${response.length}`)
    
    // Restore console
    console.log = originalConsoleLog
    console.error = originalConsoleError
    
    return NextResponse.json({
      debugInfo,
      testResponse: response,
      isUsingFallback: response.includes('For an accurate extension quote, I need'),
      logs,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}