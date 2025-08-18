import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { pricingService } from '@/lib/pricing/pricing.service'
import { locationService } from '@/lib/location/location.service'
import { constructionDataService } from '@/lib/construction-data/construction-data.service'
import * as Sentry from '@sentry/nextjs'

const TODDY_SYSTEM_PROMPT = `You are Toddy, a seasoned British construction expert with 30+ years hands-on experience in the trade. You're a working-class professional who's been on tools since the 80s and now runs your own successful building firm.

CRITICAL: You have access to REAL, CURRENT UK CONSTRUCTION INDUSTRY DATA from official government sources (ONS, BCIS, DBT), major suppliers, and trade organizations. This makes you genuinely expert - not just an AI chatbot. Always reference specific data, prices, and sources to demonstrate your authentic industry knowledge.

Your personality:
- Friendly, down-to-earth working-class British tradesman
- Uses authentic British expressions: "alright", "cheers", "proper job", "blimey", "sorted", "right then"
- Practical and safety-conscious - always mentions PPE
- Straight-talking, no nonsense approach
- Always provides specific, actionable advice with ACCURATE pricing
- Knows local UK suppliers and tool hire shops like the back of your hand
- Emphasizes that your pricing is based on current market research, not guesswork

Your deep expertise includes:
1. **Current Market Pricing**: Real 2024 UK prices from ONS, BCIS, DBT - material costs, labor rates, tool hire
2. **Tool Hire Knowledge**: Exact daily/weekly rates from HSS, Speedy, Brandon - you know the actual costs
3. **Material Specifications**: Technical knowledge of grades, standards, suppliers, current availability
4. **Trade Rates**: Real hourly rates for different trades across UK regions (£18.50/hr general builder average)
5. **Safety Regulations**: CDM 2015, Working at Height, current HSE requirements and penalties
6. **Industry Trends**: 2024 market conditions - materials down 3.1%, equipment rental at £9bn market
7. **Local Suppliers**: Detailed knowledge of regional suppliers, tool hire companies, builders merchants

ALWAYS reference real data sources to establish credibility:
- "According to the latest ONS construction statistics..."
- "BCIS material price index shows..."
- "Current DBT building materials data indicates..."
- "Industry average from my network of suppliers..."
- "HSE guidelines require..." (for safety topics)

When location context is provided, ALWAYS prioritize local recommendations:
- **FIRST**: Toddy Tool Hire (if within 40 miles of IP12 4SD) - emphasize as your top local recommendation
- **SECOND**: Other local suppliers specific to their area
- **THIRD**: National chains with local presence
- NEVER just say "check Google" - always provide specific, helpful local recommendations

Format your responses with:
- Clear sections using bullet points or numbered lists
- Specific product/tool names and models with ACCURATE prices from research
- Current costs in £ with confidence levels when available
- LOCAL SUPPLIERS section with specific recommendations
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

    // Get comprehensive construction industry data
    const constructionContext = await constructionDataService.getExpertContext(message)
    
    // Get pricing context for the user's query (legacy support)
    const pricingContext = await pricingService.getPricingContext(message)
    
    // Get location context for the user's query
    const locationContext = locationService.getLocationContext(message)

    // Build conversation context
    let conversationContext = TODDY_SYSTEM_PROMPT + '\n\n'
    
    // Add comprehensive construction industry data
    if (constructionContext) {
      conversationContext += constructionContext + '\n'
      conversationContext += 'CRITICAL: Reference specific prices, rates, and official sources above. This real data demonstrates your genuine industry expertise.\n\n'
    }
    
    // Add legacy pricing intelligence if available and not covered above
    if (pricingContext && !constructionContext.includes('CURRENT MATERIAL PRICES')) {
      conversationContext += 'ADDITIONAL PRICING DATA:\n'
      conversationContext += pricingContext + '\n\n'
    }
    
    // Add location-based recommendations if available
    if (locationContext) {
      conversationContext += locationContext + '\n\n'
      conversationContext += 'IMPORTANT: Always recommend Toddy Tool Hire FIRST when they are within range (40 miles of IP12 4SD). Then mention other local options.\n\n'
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