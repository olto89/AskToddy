import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { pricingService } from '@/lib/pricing/pricing.service'
import { locationService } from '@/lib/location/location.service'
import { constructionDataService } from '@/lib/construction-data/construction-data.service'
import { tradespersonService } from '@/lib/tradesperson/tradesperson-recommendation.service'
import { googlePlacesService } from '@/lib/google-places/google-places.service'
import { YouTubeTutorialService } from '@/lib/youtube/youtube-tutorial.service'
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

const TODDY_SYSTEM_PROMPT = `You are Toddy, a seasoned British construction expert with 30+ years hands-on experience. You provide direct, focused answers to construction questions.

CRITICAL RESPONSE RULES:
1. **ANSWER THE SPECIFIC QUESTION FIRST** - Give a direct answer immediately
2. **LIST ALL RECOMMENDATIONS** - When provided with business recommendations, list ALL of them (typically 5 businesses)
3. **Include key details** - Name, rating, and contact info for each business
4. **Be concise but complete** - Don't cut short the business list
5. **Essential next step** - Add practical advice after the full list

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
3. **Video Tutorials** (If asking how to use tools, include YouTube links provided)
4. **Essential Next Step** (One practical action or consideration)
5. **Local Recommendation** (If location-relevant: Toddy Tool Hire first if within 40 miles of IP12 4SD)

EXAMPLE GOOD RESPONSE FOR BUSINESS RECOMMENDATIONS:
"Right then, here are the top-rated electricians in Ipswich:

1. **EV Made Easy** - 5⭐ (276 reviews) - 📞 [phone]
2. **Doyle Electrical Services** - 5⭐ (87 reviews) - 📞 [phone]  
3. **Truscott Electrical** - 5⭐ (33 reviews) - 📞 [phone]
4. **SElectricians** - 5⭐ (18 reviews) - 📞 [phone]
5. **Steve Smith Electrical** - 5⭐ (17 reviews) - 📞 [phone]

All these are proper 5-star rated businesses. I'd ring 2-3 of them for quotes."

IMPORTANT: When business recommendations are provided, ALWAYS list ALL of them - don't pick just one!

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

    // Log chat request - temporarily disabled
    // Sentry.addBreadcrumb({
    //   category: 'api',
    //   message: 'Toddy Advice chat request',
    //   level: 'info',
    //   data: {
    //     messageLength: message.length,
    //     historyLength: history.length
    //   }
    // })

    // Get comprehensive construction industry data
    const constructionContext = await constructionDataService.getExpertContext(message)
    
    // Get pricing context for the user's query (legacy support)
    const pricingContext = await pricingService.getPricingContext(message)
    
    // Get location context for the user's query
    const locationContext = locationService.getLocationContext(message)
    
    // Get tradesperson recommendations if relevant
    let tradespersonContext = ''
    const tradeKeywords = ['builder', 'electrician', 'plumber', 'carpenter', 'decorator', 'roofer', 'plasterer', 'tiler', 'tradesman', 'contractor', 'find someone', 'hire someone', 'recommend']
    
    if (tradeKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      // Extract location from message or use default
      const locationMatch = message.match(/in\s+([A-Za-z\s]+)|near\s+([A-Za-z\s]+)|around\s+([A-Za-z\s]+)/i)
      const location = locationMatch ? (locationMatch[1] || locationMatch[2] || locationMatch[3]).trim() : 'UK'
      
      // Find which trade they're asking about
      const tradeTypes = ['builder', 'electrician', 'plumber', 'carpenter', 'decorator', 'roofer', 'plasterer', 'tiler']
      const requestedTrade = tradeTypes.find(trade => message.toLowerCase().includes(trade)) || 'general builder'
      
      // Try Google Places first (if configured)
      const googleContext = await googlePlacesService.getGooglePlacesContext(requestedTrade, location)
      
      if (googleContext) {
        tradespersonContext = googleContext
      } else {
        // Fall back to curated recommendations
        tradespersonContext = await tradespersonService.getRecommendationContext(requestedTrade, location)
      }
    }
    
    // Get YouTube tutorial recommendations if relevant
    const tutorialContext = YouTubeTutorialService.generateTutorialRecommendations(message)

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
    
    // Add tradesperson recommendations if available
    if (tradespersonContext) {
      conversationContext += tradespersonContext + '\n'
      conversationContext += 'When recommending tradespeople, mention the Toddy Approved Partners first if available.\n\n'
    }
    
    // Add YouTube tutorial recommendations if available
    if (tutorialContext) {
      conversationContext += tutorialContext + '\n'
      conversationContext += 'IMPORTANT: When tool tutorials are provided, include them in your response to help users learn proper usage.\n\n'
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
    
    // Sentry.captureException(error, {
    //   tags: {
    //     api_endpoint: 'toddy-advice'
    //   },
    //   extra: {
    //     errorMessage: error instanceof Error ? error.message : 'Unknown error'
    //   }
    // })

    return NextResponse.json(
      { 
        error: 'Failed to get advice',
        response: "Sorry mate, I'm having technical difficulties. Try again in a moment!"
      },
      { status: 500 }
    )
  }
}