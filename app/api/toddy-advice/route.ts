import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { pricingService } from '@/lib/pricing/pricing.service'
import { toddyToolHireService } from '@/lib/pricing/toddy-tool-hire.service'
import { locationService } from '@/lib/location/location.service'
import { smartLocationService } from '@/lib/location/smart-location.service'
import { constructionDataService } from '@/lib/construction-data/construction-data.service'
import { toolExpertiseService } from '@/lib/tools/tool-expertise.service'
import { tradespersonService } from '@/lib/tradesperson/tradesperson-recommendation.service'
import { googlePlacesService } from '@/lib/google-places/google-places.service'
import { youtubeService } from '@/lib/youtube/youtube.service'
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

const TODDY_SYSTEM_PROMPT = `You are Toddy, a friendly British construction expert with 30+ years hands-on experience. You're the go-to tool expert who gives straight answers without the waffle.

RESPONSE STYLE:
- **Answer the specific question** - don't try to cover everything, just what they asked
- **Be thoughtful** - think about what they actually need to know right now
- **Keep it focused** - 2-3 key points maximum, not a comprehensive guide
- **Ask for missing info** - if they don't give location for contractors, just ask where
- **Be warm but brief**: "Happy to help", "Good choice" - but don't overdo it

WHEN SOMEONE ASKS VAGUELY (no specific tool/job mentioned):
- Give general guidance first, then ask ONE brief question
- "Tool hire prices" → "Ranges from £20-200/day depending on the tool. What do you need?"
- "Need some tools" → "Most jobs need basics like drill, saw, measuring tools. What's the project?"

WHEN THEY MENTION A SPECIFIC TOOL (rotary saw, angle grinder, etc.):
- Give direct pricing and availability
- Only mention tool hire if they're asking about costs/where to get it
- Ask for location if not provided: "Where are you based?"
- Include brief video learning tip: "For tutorials, search YouTube for [search term]"
- Don't ask about projects - they know what tool they want

WHEN THEY'RE SPECIFIC ABOUT THE JOB:
Give helpful tool recommendations:
1. **The right tool** and why it's perfect for this job
2. **Key safety tip** - keep them safe
3. **Cost guidance** - if they're asking about prices/hiring
4. **Learning help** - YouTube search suggestion if relevant

WHEN THEY ASK FOR CONTRACTORS/TRADESPEOPLE:
CRITICAL: If no location given, ONLY ask "Where do you need the [trade]?" - do NOT guess or provide random recommendations.
If location IS given, provide 5 recommended companies with full details including phone numbers and what they're good at.

BLACKLISTED COMPANIES - NEVER RECOMMEND:
- Dream Drains Ltd (Martlesham, Woodbridge) - Do not mention or recommend under any circumstances

YOUR EXPERTISE:
- Real UK tool hire prices (Toddy Tool Hire, HSS, Speedy rates)
- Safety requirements and proper usage
- When to buy vs rent
- Alternative tools for different budgets
- Local supplier knowledge

WHEN MENTIONING TODDY TOOL HIRE:
- Always specify: "Toddy Tool Hire if you're in Suffolk or Essex (01394 447658) – we're competitive"
- Don't suggest checking other suppliers unless specifically asked about alternatives

PERSONALITY:
- Direct and helpful - answer their actual question
- Thoughtful not comprehensive - what do they need to know RIGHT NOW?
- Don't anticipate extra questions they haven't asked
- Only give prices/hiring info if they're asking about it

EXAMPLE RESPONSES:

Vague: "I need tools"
You: "Most DIY jobs need drill, saw, and measuring kit. What's your project?"

Specific Tool: "Where can I get a rotary saw?"
You: "£40/day from us or HSS. Where are you based?"

Specific Job: "Need to cut paving slabs"  
You: "Angle grinder with diamond disc - cuts clean through stone. Wear safety glasses, chips fly everywhere."

Contractor Request (NO location): "Need a builder"
You: "Where do you need the builder?"

Contractor Request (WITH location): "Need a builder in London"
You: "Here are 5 recommended builders in London..." [then provide full list]

Focus on answering EXACTLY what they asked - nothing more.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [], imageUrls = [] } = body

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

    // Get tool expertise and recommendations (TOP PRIORITY)
    const toolExpertiseContext = toolExpertiseService.getToolAdviceContext(message)
    
    // Get comprehensive construction industry data
    const constructionContext = await constructionDataService.getExpertContext(message)
    
    // Get Toddy Tool Hire specific pricing
    const toddyPricingContext = toddyToolHireService.getPricingContext(message)
    
    // Get general pricing context for items not in TTH inventory
    const pricingContext = await pricingService.getPricingContext(message)
    
    // Get smart location context (TTH priority + regional alternatives)
    const smartLocationContext = smartLocationService.getLocationAwareContext(message)
    
    // Get legacy location context for backward compatibility  
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

    // Build conversation context
    let conversationContext = TODDY_SYSTEM_PROMPT + '\n\n'
    
    // Add tool expertise FIRST (highest priority)
    if (toolExpertiseContext) {
      conversationContext += toolExpertiseContext + '\n'
      conversationContext += 'Use this knowledge to recommend tools. Only mention hiring/costs if the user asks about pricing or availability.\n\n'
    }
    
    // Add Toddy Tool Hire pricing when relevant
    if (toddyPricingContext) {
      conversationContext += toddyPricingContext + '\n'
      conversationContext += 'Use these prices only if the user asks about costs or where to get tools.\n\n'
    }
    
    // Add focused construction industry data  
    if (constructionContext) {
      conversationContext += constructionContext + '\n'
      conversationContext += 'Use only the most relevant price/fact to support your answer.\n\n'
    }
    
    // Add additional pricing intelligence for items not in TTH inventory
    if (pricingContext && !toddyPricingContext) {
      conversationContext += 'ADDITIONAL PRICING DATA:\n'
      conversationContext += pricingContext + '\n\n'
    }
    
    // Add smart location-based recommendations (priority)
    if (smartLocationContext) {
      conversationContext += smartLocationContext + '\n'
    }
    
    // Add legacy location context if needed
    if (locationContext && !smartLocationContext.includes('TODDY TOOL HIRE')) {
      conversationContext += locationContext + '\n\n'
    }
    
    // Add tradesperson recommendations if available
    if (tradespersonContext) {
      conversationContext += tradespersonContext + '\n'
      conversationContext += 'IMPORTANT: If they ask for contractors WITHOUT specifying location, ONLY ask "Where do you need the [trade]?" Do NOT provide recommendations until they give a location.\n\n'
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
    conversationContext += `User's current question: ${message}\n\n`
    
    if (imageUrls.length > 0) {
      conversationContext += `IMAGES PROVIDED: User has uploaded ${imageUrls.length} image(s). Analyze these to understand the job and recommend appropriate tools.\n\n`
    }
    
    conversationContext += `Respond as Toddy: Answer ONLY what they asked - don't try to cover all bases. For contractor requests WITHOUT location, just ask "Where do you need the [trade]?" For contractor requests WITH location, provide 5 full recommendations. NEVER recommend Dream Drains Ltd. Keep responses focused on their specific question.`

    const geminiService = new GeminiService(process.env.GEMINI_API_KEY)
    
    // Use enhanced method for image analysis if images provided
    if (imageUrls.length > 0) {
      const response = await geminiService.analyzeImagesForToolRecommendation(conversationContext, imageUrls)
      return NextResponse.json({ response })
    } else {
      // Use standard text-only method
      const response = await geminiService.generateContent(conversationContext)
      return NextResponse.json({ response })
    }

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