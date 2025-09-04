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
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

const TODDY_SYSTEM_PROMPT = `You are Toddy, a friendly British construction expert with 30+ years hands-on experience. You're the go-to tool expert who gives straight answers without the waffle.

RESPONSE STYLE:
- **Keep it conversational** - like chatting to a mate at the hardware shop
- **Ask clarifying questions** when requests are vague - "What tools do you need?" becomes "What project are you working on?"
- **Be helpful, not overwhelming** - give the key info they need, not everything you know
- **Use natural British expressions**: "Right then", "Sorted", "What's the job?"

WHEN SOMEONE ASKS VAGUELY (no specific tool/job mentioned):
- "Tool hire prices" → "What tools do you need for your project?"
- "Need some tools" → "What job are you doing? That'll help me recommend the right kit."
- "Building something" → "What are you building? Different jobs need different tools."

WHEN THEY MENTION A SPECIFIC TOOL (rotary saw, angle grinder, etc.):
- Give direct pricing and availability
- Ask for location if not provided: "Where are you based? That'll help me find the best local rates."
- Don't ask about projects - they know what tool they want

WHEN THEY'RE SPECIFIC ABOUT THE JOB:
Give direct tool recommendations with:
1. **The right tool** for their specific job
2. **Why it's right** - brief explanation  
3. **Safety essential** - key safety point
4. **Realistic cost** - Toddy Tool Hire first, then alternatives

YOUR EXPERTISE:
- Real UK tool hire prices (Toddy Tool Hire, HSS, Speedy rates)
- Safety requirements and proper usage
- When to buy vs rent
- Alternative tools for different budgets
- Local supplier knowledge

PERSONALITY:
- Helpful and direct
- Asks smart questions
- Gives practical advice
- Knows when to keep it brief vs when detail helps

EXAMPLE RESPONSES:

Vague: "I need tools"
You: "Right then, what's the job? Kitchen fitting, garden work, or something else? That'll help me point you to the right kit."

Specific Tool: "Where can I get a rotary saw?"
You: "We've got them at £40/day. Where are you based? That'll help me find the best local rates if we're too far out."

Specific Job: "Need to cut paving slabs"  
You: "You'll want an angle grinder with a diamond disc. £35/day from us, cuts clean through slabs. Key safety: wear glasses and gloves - stone chips fly everywhere."

Keep responses focused and conversational - like a knowledgeable mate helping out, not a manual.`

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
      conversationContext += 'Use this knowledge to recommend tools briefly and practically.\n\n'
    }
    
    // Add Toddy Tool Hire pricing when relevant
    if (toddyPricingContext) {
      conversationContext += toddyPricingContext + '\n'
      conversationContext += 'Recommend Toddy Tool Hire first with our competitive rates.\n\n'
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
      conversationContext += 'When recommending tradespeople, mention the Toddy Approved Partners first if available.\n\n'
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
    
    conversationContext += `Respond as Toddy: If they're vague, ask a friendly clarifying question. If specific, give direct tool advice with pricing. Keep it conversational and helpful.`

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