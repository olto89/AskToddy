import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check which environment variables are available
  const envStatus = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    CONTENTFUL_SPACE_ID: !!process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: !!process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  }

  // Test if Gemini can be initialized
  let geminiStatus = 'Not tested'
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (apiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      geminiStatus = 'Initialized successfully'
    } catch (error) {
      geminiStatus = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  } else {
    geminiStatus = 'No API key found'
  }

  return NextResponse.json({
    envStatus,
    geminiStatus,
    timestamp: new Date().toISOString()
  })
}