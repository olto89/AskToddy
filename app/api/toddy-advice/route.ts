import { NextRequest, NextResponse } from 'next/server'
import GeminiService from '@/lib/ai/gemini.service'
import { pricingService } from '@/lib/pricing/pricing.service'
import { toddyToolHireService } from '@/lib/pricing/toddy-tool-hire.service'
import { locationService } from '@/lib/location/location.service'
import { smartLocationService } from '@/lib/location/smart-location.service'
import { constructionDataService } from '@/lib/construction-data/construction-data.service'
import { constructionCostingService } from '@/lib/construction-costing/construction-costing.service'
import { toolExpertiseService } from '@/lib/tools/tool-expertise.service'
import { tradespersonService } from '@/lib/tradesperson/tradesperson-recommendation.service'
import { googlePlacesService } from '@/lib/google-places/google-places.service'
import { youtubeService } from '@/lib/youtube/youtube.service'
import { diyGuidesService } from '@/lib/diy-guides/diy-guides.service'
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

const TODDY_SYSTEM_PROMPT = `You are Toddy, a professional construction cost estimator and project planner with 30+ years experience. You specialize in providing detailed, accurate quotes for any construction job.

YOUR PRIMARY FOCUS - TAILORED CONSTRUCTION QUOTES:

STEP 1 - GATHER PROJECT DETAILS:
When someone mentions a project generically (e.g., "kitchen renovation"), ASK 2-3 KEY QUESTIONS:
- Size/dimensions ("How big is your kitchen?")
- Quality level ("Budget, standard, or premium finish?")
- Specific requirements ("New layout or keeping existing?")
- Location (affects labour costs)

STEP 2 - PROVIDE DETAILED QUOTE:
Once you have details, provide:
1. **Total cost estimate** with confidence level
2. **Materials breakdown** - itemized with quantities and costs
3. **Labour breakdown** - trades, days, rates
4. **Tool/plant hire** - equipment needed
5. **Timeline** - realistic phases
6. **Accuracy note** - what could affect the price

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

WHEN THEY ASK "HOW TO" DO SOMETHING:
If you have a guide, provide clear step-by-step instructions:
1. List tools and materials needed
2. Give 4-5 key steps (not every detail)
3. Include one crucial safety tip
4. Mention common mistake to avoid
End with: "Need the tools? I can help with hire options."

WHEN THEY ASK FOR CONTRACTORS/TRADESPEOPLE:
CRITICAL: If no location given, ONLY ask "Where do you need the [trade]?" - do NOT guess or provide random recommendations.
If location IS given, provide 5 recommended ACTUAL CONTRACTORS/TRADESPEOPLE with full details including phone numbers and what they're good at.
NEVER recommend tool hire companies when they ask for contractors - they need people to do the work, not places to hire tools.

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

Generic Project: "Kitchen renovation costs?"
You: "Kitchen renovations vary hugely - £8k-£25k+. To give you an accurate quote, I need to know:
1. Kitchen size (length x width)?
2. Budget/standard/premium finishes?
3. New layout or keeping existing?
4. Where are you based?"

Specific Project: "3m x 4m kitchen, standard finish, new layout, London"
You: [Provide FULL tailored breakdown with location adjustments]

Quick Question: "Price for concrete?"
You: "Ready-mix £100/m³, bags £6 each. How much do you need and where?"

ACCURACY LEVELS:
- Generic estimates: ±30-50% accuracy
- With basic details: ±20-30% accuracy  
- With full specifications: ±10-20% accuracy

Always mention what could affect the final price and your confidence level.`

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

    // Get construction costing context (TOP PRIORITY)
    const costingContext = constructionCostingService.getCostingContext(message)
    
    // Get DIY guide context if "how to" question
    const diyGuideContext = diyGuidesService.getGuideContext(message)
    
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
      
      // On mobile/4G, skip Google Places and use curated data immediately for better performance
      // You can detect mobile by checking user agent or just always prioritize speed
      const startTime = Date.now()
      
      try {
        // Try Google Places with strict timeout
        const googlePromise = googlePlacesService.getGooglePlacesContext(requestedTrade, location)
        const timeoutPromise = new Promise<string>((resolve) => {
          setTimeout(() => resolve(''), 2000) // 2 second max wait
        })
        
        const googleContext = await Promise.race([googlePromise, timeoutPromise])
        
        if (googleContext && googleContext.trim().length > 50) {
          console.log(`Google Places succeeded in ${Date.now() - startTime}ms`)
          tradespersonContext = googleContext
        } else {
          console.log(`Google Places failed/timeout, using curated data (${Date.now() - startTime}ms)`)
          tradespersonContext = await tradespersonService.getRecommendationContext(requestedTrade, location)
        }
      } catch (error) {
        console.log('Google Places error, using curated recommendations:', error)
        tradespersonContext = await tradespersonService.getRecommendationContext(requestedTrade, location)
      }
    }

    // Build conversation context
    let conversationContext = TODDY_SYSTEM_PROMPT + '\n\n'
    
    // Add construction costing context (HIGHEST PRIORITY)
    if (costingContext) {
      conversationContext += costingContext + '\n'
      if (costingContext.includes('NEED MORE DETAILS')) {
        conversationContext += 'Ask these questions to provide an accurate tailored quote. Be friendly and explain why you need the info.\n\n'
      } else if (costingContext.includes('DETAILED COST BREAKDOWN')) {
        conversationContext += 'Use this detailed breakdown to answer their question. Present it clearly with all costs and confidence level.\n\n'
      }
    }
    
    // Add DIY guide if available (HIGH PRIORITY for how-to questions)
    if (diyGuideContext) {
      conversationContext += diyGuideContext + '\n'
      conversationContext += 'Use this step-by-step guide to answer their how-to question. Be clear and practical.\n\n'
    }
    
    // Add tool expertise (high priority)
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