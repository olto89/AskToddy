import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [], totalMessageCount } = body

    // Simple conversation logic test without Gemini
    const actualMessageCount = totalMessageCount || (history.filter((msg: any) => msg.role === 'user').length + 1)
    
    let response = ''
    
    if (actualMessageCount === 1) {
      // First message - ask questions
      response = `Right then! For an accurate quote, I need to know:
• What size extension (e.g. 4m x 6m)?
• Single or double storey?
• What's it for (kitchen/living/bedroom)?  
• Where are you located?

Just give me whatever details you have!`
    } else if (actualMessageCount === 2) {
      // Second message - acknowledge their response and provide quote
      response = `Perfect! Based on "${message}", here's your quote:

**Quote:** £18,000-28,000 (inc VAT)
**Breakdown:** Materials £8,000, Labour £12,000
**Timeline:** 4-6 weeks  
**Accuracy:** ±20% based on info provided

**Project Plan:**
Week 1-2: Planning & permits
Week 3-4: Foundation & structure  
Week 5-6: Roofing & finishing

Upload floor plans and photos for a more accurate quote!`
    } else {
      // Third+ message - always provide detailed response
      response = `Thanks for the additional info! Here's your updated quote:

**Quote:** £22,000-32,000 (inc VAT)
**Breakdown:** Materials £10,000, Labour £15,000
**Timeline:** 5-7 weeks

This accounts for the details you've provided. 

Upload floor plans and photos for a more accurate quote!`
    }

    return NextResponse.json({ response })

  } catch (error) {
    return NextResponse.json({
      error: 'Simple chat failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}