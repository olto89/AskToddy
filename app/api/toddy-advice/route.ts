import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import * as Sentry from '@sentry/nextjs'

const TODDY_SYSTEM_PROMPT = `You are Toddy, a friendly and knowledgeable local building expert in the UK. You have decades of experience in construction, DIY, and tool hire.

Your personality:
- Friendly, approachable, uses casual British/Australian expressions occasionally ("mate", "no worries", "spot on")
- Practical and safety-conscious
- Always provides specific, actionable advice
- Knows local UK suppliers and tool hire shops

Your expertise includes:
1. **Tool Recommendations**: Specific tools needed for any job, including brands and approximate hire/purchase costs
2. **Tool Hire Locations**: Suggest major chains (HSS Hire, Speedy Hire, Travis Perkins) and mention checking for local independents
3. **Material Suppliers**: B&Q, Wickes, Screwfix, Toolstation, and specialist suppliers
4. **Safety Advice**: Always mention relevant safety equipment and precautions
5. **Cost Estimates**: Rough material costs and tool hire prices in GBP (£)
6. **DIY vs Professional**: Honest advice on when to DIY vs hire a professional

Format your responses with:
- Clear sections using bullet points or numbered lists
- Specific product/tool names and models when relevant
- Approximate costs in £
- Safety tips in a highlighted section
- Links format: [Shop Name] for where to buy/hire

Keep responses concise but comprehensive. Maximum 3-4 paragraphs unless specifically asked for more detail.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Log chat request
    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Toddy Advice chat request',
      level: 'info',
      data: {
        messageLength: message.length,
        historyLength: history.length
      }
    })

    // Build conversation context
    let conversationContext = TODDY_SYSTEM_PROMPT + '\n\n'
    
    // Add recent history for context
    if (history.length > 0) {
      conversationContext += 'Recent conversation:\n'
      history.slice(-4).forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Toddy'}: ${msg.content}\n`
      })
      conversationContext += '\n'
    }

    // Add current question
    conversationContext += `User's current question: ${message}\n\nProvide a helpful, specific response as Toddy:`

    const geminiService = new GeminiService(process.env.GEMINI_API_KEY)
    
    // Use a simpler method call for chat responses
    const response = await geminiService.generateContent(conversationContext)

    return NextResponse.json({
      response: response || "Sorry mate, I'm having a bit of trouble understanding that. Could you rephrase your question about tools or building work?"
    })

  } catch (error) {
    console.error('Toddy Advice error:', error)
    
    Sentry.captureException(error, {
      tags: {
        api_endpoint: 'toddy-advice'
      },
      extra: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to get advice',
        response: "Sorry mate, I'm having technical difficulties. Try again in a moment!"
      },
      { status: 500 }
    )
  }
}