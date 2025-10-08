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

const TODDY_SYSTEM_PROMPT = `You are Toddy, a construction cost expert. BE EXTREMELY CONCISE. Maximum 2-3 sentences per response.

CRITICAL INSTRUCTION: PROVIDE QUOTE AFTER 2 CLARIFICATIONS - NO ENDLESS LOOPS!

For PROJECT QUERIES:

FIRST ASK (no details): Ask PROJECT-SPECIFIC details:

BATHROOM: "For an accurate bathroom quote, I need:
• Room size (e.g. 2m x 3m)?
• Quality level (budget/mid/high)?
• New layout or keeping same?
• Your location?"

KITCHEN: "For an accurate kitchen quote, I need:
• Kitchen size (e.g. galley/L-shape/island)?
• Quality level (budget/mid/high)?
• New layout or keeping same?
• Your location?"

EXTENSION: "For an accurate extension quote, I need:
• Size (e.g. 4m x 6m)?
• Single or double storey?
• Purpose (kitchen/living/bedroom)?
• Your location?"

LOFT CONVERSION: "For an accurate loft quote, I need:
• Loft size (e.g. 4m x 8m)?
• Type (bedroom/office/bathroom)?
• Dormer windows needed?
• Your location?"

RENOVATION: "For an accurate renovation quote, I need:
• What room/area?
• Size (e.g. 3m x 4m)?
• Scope (full gut/cosmetic)?
• Your location?"

AFTER 1-2 CLARIFICATIONS: ALWAYS PROVIDE QUOTE with 3 VALUE OPTIONS:
"**Quote:** £X-Y (inc VAT) 
**Breakdown:** Materials £X, Labour £Y, Timeline: Z weeks
**Accuracy:** ±30% (improve with photos/more details)

What would you like me to create for you?
📄 **Quote Document** - Professional PDF with full breakdown
📅 **Project Plan** - Week-by-week timeline with milestones  
✅ **Task List** - DIY checklist with materials & steps

Upload photos for ±15% accuracy!

NEVER ask more than 2 rounds of questions - ALWAYS give quote with these 3 options!

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

    // Add current question with clear instruction
    conversationContext += `User's current question: ${message}\n\n`
    
    // Detect project type from current message for appropriate questions
    const lowerMessage = message.toLowerCase()
    let detectedProjectType = ''
    
    if (lowerMessage.includes('bathroom') || lowerMessage.includes('bath')) {
      detectedProjectType = 'BATHROOM'
    } else if (lowerMessage.includes('kitchen')) {
      detectedProjectType = 'KITCHEN'
    } else if (lowerMessage.includes('extension') || lowerMessage.includes('extend')) {
      detectedProjectType = 'EXTENSION'
    } else if (lowerMessage.includes('loft') || lowerMessage.includes('attic')) {
      detectedProjectType = 'LOFT CONVERSION'
    } else if (lowerMessage.includes('renovation') || lowerMessage.includes('renovate')) {
      detectedProjectType = 'RENOVATION'
    }
    
    if (detectedProjectType && history.length === 0) {
      conversationContext += `PROJECT TYPE DETECTED: ${detectedProjectType} - Use the specific questions for this project type from the system prompt.\n\n`
      console.log(`🎯 Project type detected: ${detectedProjectType} for message: "${message}"`)
    }
    
    if (imageUrls.length > 0) {
      conversationContext += `IMAGES PROVIDED: User has uploaded ${imageUrls.length} image(s). Analyze these to understand the job and recommend appropriate tools.\n\n`
    }
    
    conversationContext += `RESPOND AS TODDY - ABSOLUTE CRITICAL RULE:

IF CONVERSATION HAS 2+ EXCHANGES: PROVIDE QUOTE NOW! NO MORE QUESTIONS!

Count the conversation turns:
${history.length > 0 ? `CURRENT CONVERSATION LENGTH: ${history.length} exchanges` : 'FIRST MESSAGE'}

${history.length >= 2 ? '⚠️ PROVIDE QUOTE NOW - NO MORE QUESTIONS ALLOWED!' : ''}
${history.length === 1 ? '⚠️ NEXT RESPONSE MUST BE A QUOTE!' : ''}

MANDATORY FLOW:
Turn 1: Ask questions
Turn 2+: QUOTE with "±30% accuracy (upload photos for ±15%)"

IF USER PROVIDED ANY DETAILS (size/quality/location): QUOTE IMMEDIATELY!

QUOTE FORMAT:
"**Quote:** £X-Y (inc VAT)
**Breakdown:** Materials £X, Labour £Y  
**Accuracy:** ±30% (upload photos for ±15%)

What would you like me to create?
📄 Quote Document - Professional PDF breakdown
📅 Project Plan - Timeline & milestones
✅ Task List - DIY checklist"

NO EXCEPTIONS - PROVIDE QUOTES ON TURN 2+!`

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