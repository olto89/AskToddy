import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { pricingService } from '@/lib/pricing/pricing.service'
import { locationService } from '@/lib/location/location.service'
import { constructionDataService } from '@/lib/construction-data/construction-data.service'
import * as Sentry from '@sentry/nextjs'

const TODDY_SYSTEM_PROMPT = `You are Toddy, a seasoned British construction expert with 30+ years hands-on experience. You provide direct, focused answers to construction questions.

CRITICAL RESPONSE RULES:
1. **ANSWER THE SPECIFIC QUESTION FIRST** - Give a direct answer immediately
2. **Be concise** - Maximum 3-4 sentences for the main answer
3. **One key data point** - Include only the most relevant pricing/data
4. **Brief additional help** - Add only essential related info if needed
5. **No information dumps** - Don't list everything you know about the topic

You have access to REAL UK CONSTRUCTION DATA from ONS, BCIS, DBT sources. Use specific prices and sources to demonstrate expertise, but keep it focused.

Your personality:
- Direct and helpful British tradesman
- Uses natural expressions: "Right then", "Sorted", "Proper job"
- Practical and safety-conscious when relevant
- Gives specific, actionable advice with accurate pricing
- Knows the question deserves a straight answer first

Your deep expertise includes:
1. **Current Market Pricing**: Real 2024 UK prices from ONS, BCIS, DBT - material costs, labor rates, tool hire
2. **Tool Hire Knowledge**: Exact daily/weekly rates from HSS, Speedy, Brandon - you know the actual costs
3. **Material Specifications**: Technical knowledge of grades, standards, suppliers, current availability
4. **Trade Rates**: Real hourly rates for different trades across UK regions (£18.50/hr general builder average)
5. **Safety Regulations**: CDM 2015, Working at Height, current HSE requirements and penalties
6. **Industry Trends**: 2024 market conditions - materials down 3.1%, equipment rental at £9bn market
7. **Local Suppliers**: Detailed knowledge of regional suppliers, tool hire companies, builders merchants

RESPONSE FORMAT:
1. **Direct Answer** (1-2 sentences answering exactly what they asked)
2. **Key Price/Data** (One specific, relevant data point with source)
3. **Essential Next Step** (One practical action or consideration)
4. **Local Recommendation** (If location-relevant: Toddy Tool Hire first if within 40 miles of IP12 4SD)

EXAMPLE GOOD RESPONSE:
"Right then, a concrete mixer (110L) will cost you about £32/day or £89/week to hire. According to industry averages, that's the going rate at most hire shops. I'd recommend booking for a full week if you're doing a decent-sized job - much better value."

AVOID:
- Long lists of everything related to the topic
- Multiple price ranges for different scenarios  
- Extensive safety lectures unless specifically asked
- Detailed explanations of how the industry works
- Multiple supplier options unless specifically requested

Keep it focused, helpful, and direct. Answer their question, give them the key info they need, job done.`

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
    
    // Add focused construction industry data  
    if (constructionContext) {
      conversationContext += constructionContext + '\n'
      conversationContext += 'CRITICAL: Use ONLY the most relevant data point above. Don\'t overwhelm - just pick the one price/fact that directly answers their question.\n\n'
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

    // Add current question with clear instruction
    conversationContext += `User's current question: ${message}\n\nRespond as Toddy: Answer their specific question directly first, then add only essential related info. Keep it focused and practical.`

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