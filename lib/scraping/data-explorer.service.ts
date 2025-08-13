import * as cheerio from 'cheerio'

export interface ScrapedToolData {
  name: string
  category?: string
  daily_rate?: string
  weekly_rate?: string
  deposit?: string
  supplier: string
  url: string
  description?: string
  availability?: string
  additional_info?: string[]
}

export interface ScrapedCostGuideData {
  project_type: string
  cost_range?: string
  rate_per_unit?: string
  unit_type?: string
  factors?: string[]
  source: string
  url: string
  last_updated?: string
  additional_details?: Record<string, any>
}

export class DataExplorerService {
  
  /**
   * Explore HSS Hire data structure
   */
  async exploreHSSHireData(): Promise<ScrapedToolData[]> {
    try {
      console.log('🔍 Exploring HSS Hire data structure...')
      
      // Let's start with a simple category page to understand structure
      const response = await fetch('https://www.hss.com/hire/power-tools', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      const tools: ScrapedToolData[] = []
      
      // Look for common product listing patterns
      const selectors = [
        '.product-item',
        '.product-card', 
        '.tool-listing',
        '.hire-item',
        '[data-product]',
        '.product',
        '.item'
      ]
      
      for (const selector of selectors) {
        if ($(selector).length > 0) {
          console.log(`Found ${$(selector).length} items with selector: ${selector}`)
          
          $(selector).each((i, element) => {
            if (i >= 10) return false // Limit to first 10 for exploration
            
            const $el = $(element)
            const tool: ScrapedToolData = {
              name: '',
              supplier: 'HSS Hire',
              url: 'https://www.hss.com/hire/power-tools'
            }
            
            // Try to extract name from various possible selectors
            const nameSelectors = ['h3', 'h4', '.product-name', '.title', '[data-name]', 'a']
            for (const nameSelector of nameSelectors) {
              const nameText = $el.find(nameSelector).first().text().trim()
              if (nameText && nameText.length > 3 && nameText.length < 100) {
                tool.name = nameText
                break
              }
            }
            
            // Try to extract pricing info
            const priceSelectors = ['.price', '.rate', '.daily', '.cost', '[data-price]']
            priceSelectors.forEach(priceSelector => {
              const priceText = $el.find(priceSelector).text().trim()
              if (priceText.includes('£') || priceText.includes('day') || priceText.includes('week')) {
                if (!tool.daily_rate && (priceText.includes('day') || priceText.includes('/d'))) {
                  tool.daily_rate = priceText
                } else if (!tool.weekly_rate && (priceText.includes('week') || priceText.includes('/w'))) {
                  tool.weekly_rate = priceText
                }
              }
            })
            
            // Extract description
            const descSelectors = ['.description', '.details', 'p']
            for (const descSelector of descSelectors) {
              const descText = $el.find(descSelector).first().text().trim()
              if (descText && descText.length > 10 && descText.length < 200) {
                tool.description = descText
                break
              }
            }
            
            if (tool.name) {
              tools.push(tool)
            }
          })
          
          if (tools.length > 0) break // Stop at first successful selector
        }
      }
      
      console.log(`📊 Found ${tools.length} tools from HSS exploration`)
      return tools.slice(0, 5) // Return sample for analysis
      
    } catch (error) {
      console.error('Error exploring HSS data:', error)
      return []
    }
  }
  
  /**
   * Explore Checkatrade cost guide structure
   */
  async exploreCheckatradeData(): Promise<ScrapedCostGuideData[]> {
    try {
      console.log('🔍 Exploring Checkatrade cost guide structure...')
      
      const response = await fetch('https://www.checkatrade.com/blog/cost-guides/building-cost-per-sq-m/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      const costGuides: ScrapedCostGuideData[] = []
      
      // Look for cost information patterns
      const possibleContainers = [
        '.cost-guide',
        '.price-table', 
        '.cost-breakdown',
        'table',
        '.content',
        'article'
      ]
      
      // Extract text and look for cost patterns
      const fullText = $.text()
      const costPatterns = [
        /£[\d,]+\s*-\s*£[\d,]+\s*per\s+(\w+)/gi,
        /£[\d,]+\s*per\s+(\w+)/gi,
        /(\w+(?:\s+\w+)*)\s*:?\s*£[\d,]+\s*-\s*£[\d,]+/gi,
        /(\w+(?:\s+\w+)*)\s*costs?\s*£[\d,]+/gi
      ]
      
      costPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(fullText)) !== null) {
          const costGuide: ScrapedCostGuideData = {
            project_type: match[1] || 'Unknown',
            cost_range: match[0],
            source: 'Checkatrade',
            url: 'https://www.checkatrade.com/blog/cost-guides/building-cost-per-sq-m/'
          }
          costGuides.push(costGuide)
          
          if (costGuides.length >= 10) break // Limit exploration results
        }
      })
      
      // Look for tables with structured cost data
      $('table').each((i, table) => {
        const $table = $(table)
        const rows = $table.find('tr')
        
        if (rows.length > 1) {
          console.log(`Found table with ${rows.length} rows`)
          
          rows.each((rowIndex, row) => {
            if (rowIndex === 0) return // Skip header
            if (rowIndex > 5) return false // Limit exploration
            
            const $row = $(row)
            const cells = $row.find('td')
            
            if (cells.length >= 2) {
              const projectType = $(cells[0]).text().trim()
              const costInfo = $(cells[1]).text().trim()
              
              if (projectType && costInfo && costInfo.includes('£')) {
                costGuides.push({
                  project_type: projectType,
                  cost_range: costInfo,
                  source: 'Checkatrade Table',
                  url: 'https://www.checkatrade.com/blog/cost-guides/building-cost-per-sq-m/'
                })
              }
            }
          })
        }
      })
      
      console.log(`📊 Found ${costGuides.length} cost guides from Checkatrade exploration`)
      return costGuides.slice(0, 10) // Return sample for analysis
      
    } catch (error) {
      console.error('Error exploring Checkatrade data:', error)
      return []
    }
  }
  
  /**
   * Explore multiple data sources and analyze patterns
   */
  async exploreAllDataSources() {
    console.log('🚀 Starting comprehensive data exploration...')
    
    const results = {
      hss_tools: [] as ScrapedToolData[],
      checkatrade_costs: [] as ScrapedCostGuideData[],
      data_patterns: {
        tool_hire: {
          common_fields: [] as string[],
          pricing_formats: [] as string[],
          categories: [] as string[]
        },
        labor_costs: {
          rate_types: [] as string[],
          cost_formats: [] as string[],
          project_types: [] as string[]
        }
      }
    }
    
    try {
      // Explore HSS Hire
      results.hss_tools = await this.exploreHSSHireData()
      
      // Explore Checkatrade
      results.checkatrade_costs = await this.exploreCheckatradeData()
      
      // Analyze patterns
      this.analyzeDataPatterns(results)
      
      return results
      
    } catch (error) {
      console.error('Error in comprehensive data exploration:', error)
      return results
    }
  }
  
  private analyzeDataPatterns(results: any) {
    console.log('🔬 Analyzing data patterns...')
    
    // Analyze tool hire patterns
    results.hss_tools.forEach((tool: ScrapedToolData) => {
      if (tool.daily_rate) {
        results.data_patterns.tool_hire.pricing_formats.push(tool.daily_rate)
      }
      if (tool.weekly_rate) {
        results.data_patterns.tool_hire.pricing_formats.push(tool.weekly_rate)
      }
    })
    
    // Analyze cost guide patterns  
    results.checkatrade_costs.forEach((guide: ScrapedCostGuideData) => {
      if (guide.cost_range) {
        results.data_patterns.labor_costs.cost_formats.push(guide.cost_range)
      }
      if (guide.project_type) {
        results.data_patterns.labor_costs.project_types.push(guide.project_type)
      }
    })
    
    // Remove duplicates
    results.data_patterns.tool_hire.pricing_formats = [...new Set(results.data_patterns.tool_hire.pricing_formats)]
    results.data_patterns.labor_costs.cost_formats = [...new Set(results.data_patterns.labor_costs.cost_formats)]
    results.data_patterns.labor_costs.project_types = [...new Set(results.data_patterns.labor_costs.project_types)]
    
    console.log('📈 Pattern analysis complete')
  }
}

export const dataExplorerService = new DataExplorerService()