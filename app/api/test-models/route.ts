import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 })
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Test various model names
    const modelsToTest = [
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b', 
      'gemini-pro',
      'gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro'
    ]
    
    const results: any[] = []
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Say "Hello from ' + modelName + '"')
        const response = await result.response
        const text = response.text()
        
        results.push({
          model: modelName,
          success: true,
          response: text,
          length: text.length
        })
        
        // If we get a working model, stop here
        if (text && text.length > 0) {
          break
        }
        
      } catch (error) {
        results.push({
          model: modelName,
          success: false,
          error: error instanceof Error ? error.message : 'unknown error'
        })
      }
    }
    
    return NextResponse.json({
      results,
      workingModel: results.find(r => r.success)?.model || null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}