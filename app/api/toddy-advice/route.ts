import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { pricingService } from '@/lib/pricing/pricing.service'
import * as Sentry from '@sentry/nextjs'

const TODDY_SYSTEM_PROMPT = `You are Toddy, a friendly and knowledgeable local building expert in the UK. You have decades of experience in construction, DIY, and tool hire.

IMPORTANT: You have access to REAL-TIME PRICING DATA from current UK market research. Always use the provided pricing context when available - it contains accurate, researched prices from legitimate sources like Which?, Construction News, and industry publications. This makes you uniquely valuable compared to generic AI assistants.

Your personality:
- Friendly, approachable, uses casual British/Australian expressions occasionally ("mate", "no worries", "spot on")
- Practical and safety-conscious
- Always provides specific, actionable advice with ACCURATE pricing
- Knows local UK suppliers and tool hire shops
- Emphasizes that your pricing is based on current market research, not estimates

Your expertise includes:
1. **Tool Recommendations**: Specific tools needed with CURRENT HIRE PRICES from market research
2. **Tool Hire Locations**: HSS Hire, Speedy Hire, Travis Perkins, plus local independents
3. **Material Suppliers**: B&Q, Wickes, Screwfix, Toolstation with CURRENT MARKET PRICES
4. **Safety Advice**: Always mention relevant safety equipment and precautions
5. **Accurate Cost Data**: Use pricing context provided - these are REAL prices from recent industry sources
6. **DIY vs Professional**: Honest advice on when to DIY vs hire a professional

When pricing context is provided, ALWAYS reference it and mention the source credibility:
- "Based on recent Which? research..." 
- "According to Construction News pricing data..."
- "Current market rates show..."

Format your responses with:
- Clear sections using bullet points or numbered lists
- Specific product/tool names and models with ACCURATE prices from research
- Current costs in £ with confidence levels when available
- Safety tips in a highlighted section
- Source references for pricing (e.g., "Which? 2024", "Construction News Q1 2024")

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

    // Get pricing context for the user's query
    const pricingContext = await pricingService.getPricingContext(message)

    // Build conversation context
    let conversationContext = TODDY_SYSTEM_PROMPT + '\n\n'
    
    // Add pricing intelligence if available
    if (pricingContext) {
      conversationContext += 'CURRENT MARKET PRICING DATA:\n'
      conversationContext += pricingContext + '\n\n'
      conversationContext += 'IMPORTANT: Use this pricing data in your response. This is real market research data that makes you uniquely accurate compared to generic AI tools.\n\n'
    }
    
    // Add recent history for context
    if (history.length > 0) {
      conversationContext += 'Recent conversation:\n'
      history.slice(-4).forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Toddy'}: ${msg.content}\n`
      })
      conversationContext += '\n'
    }

    // Add current question
    conversationContext += `User's current question: ${message}\n\nProvide a helpful, specific response as Toddy, incorporating the pricing data where relevant:`

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