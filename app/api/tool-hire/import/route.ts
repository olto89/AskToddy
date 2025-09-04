import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate the data
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of tool prices.' },
        { status: 400 }
      )
    }

    // Save to JSON file (in production, this would go to database)
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `tool-hire-import-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'data', 'imports', filename)
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true })
    
    // Save the data
    await fs.writeFile(filepath, JSON.stringify(data, null, 2))
    
    // Process and structure the data
    const summary = processImportData(data)
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${data.length} price entries`,
      filename,
      summary
    })
    
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  }
}

function processImportData(data: any[]) {
  const suppliers = new Set(data.map(d => d.supplier))
  const categories = new Set(data.map(d => d.category))
  
  const priceRanges: any = {}
  
  data.forEach(entry => {
    const key = entry.category
    if (!priceRanges[key]) {
      priceRanges[key] = {
        dailyMin: Infinity,
        dailyMax: 0,
        weeklyMin: Infinity,
        weeklyMax: 0,
        count: 0
      }
    }
    
    const range = priceRanges[key]
    range.count++
    
    if (entry.dailyRate) {
      range.dailyMin = Math.min(range.dailyMin, parseFloat(entry.dailyRate))
      range.dailyMax = Math.max(range.dailyMax, parseFloat(entry.dailyRate))
    }
    
    if (entry.weeklyRate) {
      range.weeklyMin = Math.min(range.weeklyMin, parseFloat(entry.weeklyRate))
      range.weeklyMax = Math.max(range.weeklyMax, parseFloat(entry.weeklyRate))
    }
  })
  
  return {
    totalEntries: data.length,
    suppliers: Array.from(suppliers),
    categories: Array.from(categories),
    priceRanges
  }
}

// GET endpoint to check import status
export async function GET() {
  try {
    const importsDir = path.join(process.cwd(), 'data', 'imports')
    
    try {
      const files = await fs.readdir(importsDir)
      const jsonFiles = files.filter(f => f.endsWith('.json'))
      
      const imports = await Promise.all(
        jsonFiles.map(async (file) => {
          const filepath = path.join(importsDir, file)
          const stats = await fs.stat(filepath)
          const content = await fs.readFile(filepath, 'utf-8')
          const data = JSON.parse(content)
          
          return {
            filename: file,
            date: stats.mtime,
            entries: data.length,
            suppliers: [...new Set(data.map((d: any) => d.supplier))].length
          }
        })
      )
      
      return NextResponse.json({
        imports: imports.sort((a, b) => b.date.getTime() - a.date.getTime()),
        total: imports.reduce((sum, i) => sum + i.entries, 0)
      })
      
    } catch (error) {
      // Directory doesn't exist yet
      return NextResponse.json({ imports: [], total: 0 })
    }
    
  } catch (error) {
    console.error('Failed to get imports:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve imports' },
      { status: 500 }
    )
  }
}