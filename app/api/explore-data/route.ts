import { NextRequest, NextResponse } from 'next/server'
import { dataExplorerService } from '@/lib/scraping/data-explorer.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') // 'hss', 'checkatrade', 'all'
    
    console.log(`🔍 Exploring data from: ${source || 'all sources'}`)
    
    let results
    
    switch (source) {
      case 'hss':
        results = {
          hss_tools: await dataExplorerService.exploreHSSHireData(),
          source: 'HSS Hire only'
        }
        break
        
      case 'checkatrade':
        results = {
          checkatrade_costs: await dataExplorerService.exploreCheckatradeData(),
          source: 'Checkatrade only'
        }
        break
        
      default:
        results = await dataExplorerService.exploreAllDataSources()
        results.source = 'All sources'
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results
    })
    
  } catch (error) {
    console.error('Data exploration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to explore data sources',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}