import { NextRequest, NextResponse } from 'next/server'
import { constructionCostingService } from '@/lib/construction-costing/construction-costing.service'
import { documentGeneratorService } from '@/lib/documents/document-generator.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectType, specifications, documentType = 'quote' } = body

    if (!projectType) {
      return NextResponse.json(
        { error: 'Project type is required' },
        { status: 400 }
      )
    }

    // Get the cost breakdown
    const breakdown = constructionCostingService.calculateProjectCost(projectType, specifications)
    
    let document = ''
    let filename = ''
    
    if (documentType === 'quote') {
      document = documentGeneratorService.generateQuoteDocument(projectType, specifications || {}, breakdown)
      filename = `${projectType.replace(/\s+/g, '-')}-quote-${Date.now()}.txt`
    } else if (documentType === 'timeline') {
      document = documentGeneratorService.generateProjectPlan(projectType, breakdown.timeline, '4-6 weeks')
      filename = `${projectType.replace(/\s+/g, '-')}-timeline-${Date.now()}.txt`
    }

    // Return the document content for download
    return new NextResponse(document, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}