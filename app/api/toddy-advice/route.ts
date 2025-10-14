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
import { documentGeneratorService } from '@/lib/documents/document-generator.service'
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

const TODDY_SYSTEM_PROMPT = `You are Toddy, an experienced construction cost expert who provides accurate, helpful quotes for UK building projects.

CRITICAL - FLOOR PLAN ANALYSIS:
When users upload floor plans or architectural drawings (PDFs or images with measurements):
- READ the dimensions and room labels carefully
- CALCULATE areas using the measurements shown (length × width)
- IDENTIFY each room type (bedroom, bathroom, kitchen, etc.)
- COUNT fixtures, doors, windows from the plan
- PROVIDE room-by-room breakdown with specific costs
- USE the actual measurements, don't say you can't read them

Example: "I can see from your floor plan: 4.5m × 3.2m kitchen (14.4m²), 2.8m × 2.4m bathroom (6.7m²)..."

YOUR PERSONALITY:
- Direct and friendly, like a knowledgeable mate in the trade
- Concise but informative (2-4 sentences typically)
- Always helpful - if someone asks about a project, help them understand costs

CONVERSATION FLOW:
1. When someone mentions a project (bathroom, kitchen, extension, etc.), briefly ask for key details you need
2. Once they provide ANY information, give them a quote based on what you know
3. If they want more accuracy, suggest they can share photos or more details
4. Always end quotes by offering to create documents

PROVIDING QUOTES:
- Use the information given, make reasonable assumptions for the rest
- Show price ranges to account for unknowns
- Break down costs simply: materials, labour, timeline
- Mention accuracy level and how to improve it

EXAMPLE INTERACTIONS:

User: "I need a bathroom renovation quote"
You: "I'll help with that bathroom quote. What size is the room and are you keeping the same layout or changing it? Also, what's your quality level - budget, mid-range or high-end?"

User: "It's about 2x3m, keeping same layout, mid-range"
You: "**Quote:** £5,500-7,500 (inc VAT)
**Breakdown:** Materials £2,500-3,500, Labour £3,000-4,000
**Timeline:** 2-3 weeks
**Accuracy:** ±25% (share photos for ±15% accuracy)

What would you like me to create for you?
📄 Quote Document - Full PDF breakdown
📅 Project Plan - Week-by-week timeline
✅ Task List - DIY checklist with materials"

KEY PRINCIPLE: After someone answers your questions, ALWAYS provide a quote. Don't ask the same questions again. Use what they told you and estimate the rest.

Tool hire: Toddy Tool Hire (Suffolk/Essex) 01394 447658

GENERAL QUERIES:
Keep it ONE sentence + question:
"Tool hire?" → "£20-200/day. Which tool?"
"Need help" → "What's your project?"

SPECIFIC TOOL:
"Angle grinder: £45/day from Toddy Tool Hire (Suffolk/Essex) or HSS. Your location?"

SPECIFIC JOB:
One tool, one tip:
"Cut paving: Angle grinder + diamond disc. £45/day. Wear safety glasses."

HOW-TO QUESTIONS:
5 steps MAX:
1. Tools needed
2-4. Key steps
5. Main safety tip

WHEN USER REQUESTS DOCUMENTS:
"Create quote document" → Generate formal quote using the template
"Project timeline" → Generate week-by-week plan
Always offer: "Would you like a downloadable quote document?"

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

EXAMPLE RESPONSES (BE THIS CONCISE!):

"Bathroom renovation?"
→ "For an accurate quote, I need:
• Room size?
• Quality level?  
• New layout?
• Your location?"

"3x2.5m bathroom, standard, same layout, Essex"
→ "**Quote:** £5,500-7,000 (inc VAT)
**Breakdown:** Materials £2,800, Labour £2,000
**Timeline:** 2 weeks
Want full itemized list?

Tool hire: Toddy Tool Hire 01394 447658"

"Need a mini digger"
→ "£150/day or £600/week from Toddy Tool Hire (Suffolk/Essex). Your location?"

REMEMBER: SHORT AND DIRECT. NO EXPLANATIONS.`

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
    
    // Get document generation context if requested
    const documentContext = documentGeneratorService.getDocumentContext(message)
    
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
    
    // Get tradesperson recommendations ONLY if explicitly requested
    let tradespersonContext = ''
    const contractorKeywords = ['find contractor', 'recommend contractor', 'find builder', 'recommend builder', 'need contractor', 'contractor recommendation', 'find someone to do', 'who can do']
    
    // Only show contractors if they specifically ask for recommendations, not just project quotes
    if (contractorKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
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
    
    // Add document generation capability
    if (documentContext) {
      conversationContext += documentContext + '\n'
      conversationContext += 'Offer to create formal documents when appropriate.\n\n'
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
      conversationContext += 'CONTRACTOR CONTEXT: User has specifically asked for contractor recommendations. Provide the contractor list above.\n\n'
    }
    
    // Add recent history for context
    if (history.length > 0) {
      conversationContext += 'Recent conversation:\n'
      history.slice(-4).forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Toddy'}: ${msg.content}\n`
      })
      conversationContext += '\n'
    }

    if (imageUrls.length > 0) {
      conversationContext += `\nUser has uploaded ${imageUrls.length} image(s). IMPORTANT: Check if these are floor plans/architectural drawings (with measurements and room labels) or photos of existing spaces. For floor plans, extract dimensions and calculate areas for precise quotes. For photos, estimate based on visible conditions.\n`
    }
    
    // Simple conversation tracking
    const conversationLength = history.filter((msg: any) => msg.role === 'user').length
    
    // Add context about conversation stage
    if (conversationLength === 0) {
      conversationContext += `\nThis is the user's first message about this project.\n`
    } else if (conversationLength === 1) {
      conversationContext += `\nThe user has provided initial information. Now provide a quote based on what you know.\n`
    } else {
      conversationContext += `\nThis is an ongoing conversation. The user has already provided information - work with what you have.\n`
    }
    
    conversationContext += `\nCurrent message: "${message}"\n`

    // Log environment status for debugging
    console.log('API Route - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    console.log('API Route - NEXT_PUBLIC_GEMINI_API_KEY exists:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY)
    
    // Try both possible environment variables
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('No Gemini API key found in environment variables')
    }
    
    const geminiService = new GeminiService(apiKey)
    
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