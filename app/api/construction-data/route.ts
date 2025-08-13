import { NextRequest, NextResponse } from 'next/server'
import { constructionDataService } from '@/lib/construction-data/construction-api.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') // 'tools', 'labor', 'materials', 'all'
    const projectType = searchParams.get('projectType') || ''
    const category = searchParams.get('category')
    const searchTerm = searchParams.get('search')
    const region = searchParams.get('region')
    const quality = searchParams.get('quality') as 'budget' | 'mid_range' | 'premium' || 'mid_range'
    const maxDailyRate = searchParams.get('maxDailyRate') 
      ? parseFloat(searchParams.get('maxDailyRate')!)
      : undefined

    switch (dataType) {
      case 'tools':
        const tools = await constructionDataService.getToolHireCosts({
          category,
          searchTerm: searchTerm || projectType,
          maxDailyRate
        })
        return NextResponse.json({ 
          success: true, 
          data: tools,
          count: tools.length 
        })

      case 'labor':
        const labor = await constructionDataService.getLaborCosts({
          jobType: searchTerm || projectType,
          region: region || undefined
        })
        return NextResponse.json({ 
          success: true, 
          data: labor,
          count: labor.length 
        })

      case 'materials':
        const materials = await constructionDataService.getMaterialCosts({
          category,
          searchTerm: searchTerm || projectType,
          quality
        })
        return NextResponse.json({ 
          success: true, 
          data: materials,
          count: materials.length 
        })

      case 'regulations':
        const regulations = await constructionDataService.getBuildingRegulations(projectType)
        return NextResponse.json({ 
          success: true, 
          data: regulations 
        })

      case 'estimate':
        const area = searchParams.get('area') ? parseFloat(searchParams.get('area')!) : 10
        const complexity = searchParams.get('complexity') as 'basic' | 'moderate' | 'complex' || 'moderate'
        
        const estimate = await constructionDataService.calculateProjectCosts({
          projectType,
          area,
          complexity,
          region: region || undefined,
          quality
        })
        return NextResponse.json({ 
          success: true, 
          data: estimate 
        })

      case 'ai-data':
      case 'all':
      default:
        // Get comprehensive data for AI analysis
        const aiData = await constructionDataService.getCostDataForAI(
          projectType,
          region || undefined
        )
        return NextResponse.json({ 
          success: true, 
          data: aiData 
        })
    }

  } catch (error) {
    console.error('Construction data API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch construction data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'bulk-insert') {
      // This could be used by scraping services to bulk insert data
      // For now, return not implemented
      return NextResponse.json({
        success: false,
        error: 'Bulk insert not implemented yet'
      }, { status: 501 })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Construction data POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request' 
      },
      { status: 500 }
    )
  }
}