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
    
    let documentBuffer: Buffer
    let filename = ''
    let contentType = ''
    
    if (documentType === 'quote') {
      documentBuffer = documentGeneratorService.generateQuotePDF(projectType, specifications || {}, breakdown)
      filename = `${projectType.replace(/\s+/g, '-')}-quote-${Date.now()}.pdf`
      contentType = 'application/pdf'
    } else if (documentType === 'timeline') {
      // Use PDF for timeline too
      const totalDuration = breakdown.timeline?.length > 0 ? `${breakdown.timeline.length * 2}-${breakdown.timeline.length * 3} weeks` : '4-6 weeks'
      documentBuffer = documentGeneratorService.generateTimelinePDF(projectType, breakdown.timeline, totalDuration)
      filename = `${projectType.replace(/\s+/g, '-')}-timeline-${Date.now()}.pdf`
      contentType = 'application/pdf'
    } else {
      throw new Error('Unknown document type')
    }

    // Return the document content for download
    return new NextResponse(documentBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
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