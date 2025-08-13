import { NextRequest, NextResponse } from 'next/server'
import { improvedConstructionDataService } from '@/lib/construction-data/improved-construction-api.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') // 'tools', 'labor', 'materials', 'estimate', 'ai-data'
    const projectType = searchParams.get('projectType') || ''
    const location = searchParams.get('location') // 'London', 'Manchester', 'M1'
    const category = searchParams.get('category')
    const searchTerm = searchParams.get('search')
    const qualityTier = searchParams.get('quality') as 'budget' | 'mid_range' | 'premium' || 'mid_range'
    
    // Timing for performance monitoring
    const startTime = Date.now()

    switch (endpoint) {
      case 'tools': {
        const maxDailyRate = searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : undefined
        const requiresLicense = searchParams.get('license') ? searchParams.get('license') === 'true' : undefined
        const season = searchParams.get('season') as 'spring' | 'summer' | 'autumn' | 'winter' | undefined

        const tools = await improvedConstructionDataService.getToolHireCosts({
          category: category || undefined,
          searchTerm: searchTerm || projectType,
          location: location || undefined,
          season,
          maxDailyRate,
          requiresLicense
        })

        return NextResponse.json({
          success: true,
          data: tools,
          metadata: {
            count: tools.length,
            location_adjusted: !!location,
            season_adjusted: !!season,
            query_time_ms: Date.now() - startTime
          }
        })
      }

      case 'labor': {
        const trade = searchParams.get('trade')
        const rateStructure = searchParams.get('rateStructure')

        const labor = await improvedConstructionDataService.getLaborCosts({
          trade,
          jobType: searchTerm || projectType,
          location,
          rateStructure
        })

        return NextResponse.json({
          success: true,
          data: labor,
          metadata: {
            count: labor.length,
            location_adjusted: labor.some(l => l.adjusted_rate !== undefined),
            query_time_ms: Date.now() - startTime
          }
        })
      }

      case 'materials': {
        const supplier = searchParams.get('supplier')

        const materials = await improvedConstructionDataService.getMaterialCosts({
          category,
          searchTerm: searchTerm || projectType,
          qualityTier,
          supplier
        })

        return NextResponse.json({
          success: true,
          data: materials,
          metadata: {
            count: materials.length,
            quality_tier: qualityTier,
            query_time_ms: Date.now() - startTime
          }
        })
      }

      case 'template': {
        const template = await improvedConstructionDataService.getProjectTemplate(projectType)
        
        if (!template) {
          return NextResponse.json({
            success: false,
            error: 'Project template not found',
            project_type: projectType
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: template,
          metadata: {
            query_time_ms: Date.now() - startTime
          }
        })
      }

      case 'estimate': {
        const area = searchParams.get('area') ? parseFloat(searchParams.get('area')!) : 10
        const complexity = searchParams.get('complexity') as 'basic' | 'standard' | 'complex' || 'standard'
        const includeTools = searchParams.get('tools') !== 'false'
        const season = searchParams.get('season') as 'spring' | 'summer' | 'autumn' | 'winter' | undefined

        const estimate = await improvedConstructionDataService.generateProjectEstimate({
          project_type: projectType,
          area,
          location,
          complexity,
          quality_tier: qualityTier,
          include_tools: includeTools,
          season
        })

        return NextResponse.json({
          success: true,
          data: estimate,
          metadata: {
            parameters: {
              project_type: projectType,
              area,
              location,
              complexity,
              quality_tier: qualityTier,
              include_tools: includeTools,
              season
            },
            query_time_ms: Date.now() - startTime
          }
        })
      }

      case 'ai-data':
      default: {
        // Comprehensive data for AI analysis
        const aiData = await improvedConstructionDataService.getCostDataForAI(
          projectType,
          location
        )

        return NextResponse.json({
          success: true,
          data: aiData,
          metadata: {
            project_type: projectType,
            location: location || 'UK national average',
            data_sources: ['Real-time database', 'UK trade quotes', 'Supplier APIs'],
            query_time_ms: Date.now() - startTime,
            cache_ttl_minutes: 60 // Suggest caching for 1 hour
          }
        })
      }
    }

  } catch (error) {
    console.error('Construction data API v2 error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch construction data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'bulk-estimate': {
        // Handle multiple project estimates in one request
        const { projects } = data
        
        if (!Array.isArray(projects)) {
          return NextResponse.json({
            success: false,
            error: 'Projects must be an array'
          }, { status: 400 })
        }

        const estimates = await Promise.all(
          projects.slice(0, 5).map(async (project: any) => { // Limit to 5 projects
            try {
              return await improvedConstructionDataService.generateProjectEstimate(project)
            } catch (error) {
              return {
                error: error instanceof Error ? error.message : 'Estimate failed',
                project: project
              }
            }
          })
        )

        return NextResponse.json({
          success: true,
          data: estimates,
          metadata: {
            project_count: projects.length,
            successful_estimates: estimates.filter(e => !e.error).length
          }
        })
      }

      case 'cost-comparison': {
        // Compare costs across different quality tiers or locations
        const { project_type, area, locations, quality_tiers } = data
        
        const comparisons = []
        
        if (locations && Array.isArray(locations)) {
          for (const location of locations.slice(0, 3)) {
            try {
              const estimate = await improvedConstructionDataService.generateProjectEstimate({
                project_type,
                area: area || 10,
                location,
                complexity: 'standard',
                quality_tier: 'mid_range'
              })
              comparisons.push({ location, estimate })
            } catch (error) {
              comparisons.push({ 
                location, 
                error: error instanceof Error ? error.message : 'Failed' 
              })
            }
          }
        }

        if (quality_tiers && Array.isArray(quality_tiers)) {
          for (const tier of quality_tiers) {
            try {
              const estimate = await improvedConstructionDataService.generateProjectEstimate({
                project_type,
                area: area || 10,
                complexity: 'standard',
                quality_tier: tier
              })
              comparisons.push({ quality_tier: tier, estimate })
            } catch (error) {
              comparisons.push({ 
                quality_tier: tier, 
                error: error instanceof Error ? error.message : 'Failed' 
              })
            }
          }
        }

        return NextResponse.json({
          success: true,
          data: comparisons
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Construction data POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}