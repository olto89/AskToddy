/**
 * Automated Tool Hire Site Analyzer
 * 
 * Takes a list of website URLs and automatically analyzes:
 * - Site structure and category organization
 * - URL patterns for tools/categories  
 * - Pricing structure and display methods
 * - Tool categories available
 * 
 * Usage:
 * node scripts/site-analyzer.js analyze --urls="site1.com,site2.com"
 * node scripts/site-analyzer.js analyze-file --file="urls.txt"
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const cheerio = require('cheerio')

class ToolHireSiteAnalyzer {
  constructor() {
    this.results = []
    this.categories = ['hire', 'tool', 'plant', 'equipment', 'rental', 'categories', 'products']
    this.toolKeywords = [
      'excavator', 'digger', 'mixer', 'compressor', 'generator', 
      'drill', 'saw', 'grinder', 'scaffold', 'ladder', 'pump'
    ]
  }

  async analyzeWebsite(url) {
    console.log(`🔍 Analyzing: ${url}`)
    
    try {
      // Fetch the website's HTML
      const html = await this.fetchWebsite(url)
      const $ = cheerio.load(html)
      
      const analysis = {
        company_name: this.extractCompanyName(url),
        website_url: url,
        main_categories_url: await this.findCategoriesPage(url, $),
        url_pattern: await this.detectUrlPattern(url, $),
        pricing_structure: await this.analyzePricingStructure(url, $),
        site_structure_notes: await this.generateStructureNotes(url, $),
        has_online_pricing: 'unknown', // Will be determined by pricing analysis
        status: 'analyzed'
      }
      
      console.log(`✅ ${analysis.company_name}: Analysis complete`)
      return analysis
      
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`)
      return {
        company_name: this.extractCompanyName(url),
        website_url: url,
        status: 'failed',
        error: error.message
      }
    }
  }

  async fetchWebsite(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AskToddy Tool Analyzer/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.5',
          'Connection': 'close'
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            // Handle redirects
            this.fetchWebsite(res.headers.location).then(resolve).catch(reject)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`))
      })

      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      req.end()
    })
  }

  extractCompanyName(url) {
    // Extract company name from domain
    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    const name = domain.split('.')[0]
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  async findCategoriesPage(url, $) {
    // Look for navigation links that suggest categories/hire pages
    const categoryKeywords = ['hire', 'tool', 'plant', 'equipment', 'rental', 'categories', 'products']
    const potentialPages = []
    
    // Check main navigation
    $('nav a, .nav a, .navigation a, .menu a, header a').each((i, link) => {
      const href = $(link).attr('href')
      const text = $(link).text().toLowerCase()
      
      if (href && categoryKeywords.some(keyword => 
        text.includes(keyword) || href.toLowerCase().includes(keyword)
      )) {
        const fullUrl = this.resolveUrl(url, href)
        potentialPages.push({ url: fullUrl, text, confidence: this.calculateLinkConfidence(text, href) })
      }
    })
    
    // Sort by confidence and return the most likely
    potentialPages.sort((a, b) => b.confidence - a.confidence)
    return potentialPages[0]?.url || `${url}/hire`
  }

  async detectUrlPattern(url, $) {
    // Analyze actual links to detect URL patterns
    const categoryLinks = []
    
    $('a').each((i, link) => {
      const href = $(link).attr('href')
      const text = $(link).text().toLowerCase()
      
      if (href && this.toolKeywords.some(keyword => text.includes(keyword))) {
        categoryLinks.push(this.resolveUrl(url, href))
      }
    })
    
    // Analyze common patterns in the found links
    const patterns = this.analyzeUrlPatterns(categoryLinks, url)
    return patterns[0] || '/hire/{category}'
  }

  async analyzePricingStructure(url, $) {
    // Look for price indicators on the page
    const priceIndicators = []
    const text = $('body').text().toLowerCase()
    
    // Check for common price patterns
    if (text.match(/£\d+.*day|day.*£\d+/)) priceIndicators.push('daily_rates')
    if (text.match(/£\d+.*week|week.*£\d+/)) priceIndicators.push('weekly_rates')
    if (text.match(/contact.*price|price.*contact|poa|quote/)) priceIndicators.push('quote_only')
    if (text.match(/from.*£|starting.*£/)) priceIndicators.push('starting_prices')
    
    // Look for price elements in HTML
    const priceElements = $('.price, .cost, .rate, [class*="price"], [class*="cost"]').length
    if (priceElements > 0) priceIndicators.push('structured_pricing')
    
    // Determine primary structure
    if (priceIndicators.includes('daily_rates') && priceIndicators.includes('weekly_rates')) {
      return 'daily_weekly_rates'
    } else if (priceIndicators.includes('quote_only')) {
      return 'contact_for_price'
    } else if (priceIndicators.length > 0) {
      return 'per_product_page'
    } else {
      return 'unknown'
    }
  }

  async generateStructureNotes(url, $) {
    const notes = []
    
    // Analyze navigation complexity
    const navLinks = $('nav a, .navigation a, .menu a').length
    if (navLinks > 20) {
      notes.push('Complex navigation - many categories')
    } else if (navLinks < 5) {
      notes.push('Simple navigation structure')
    }
    
    // Check for search functionality
    if ($('input[type="search"], .search, [placeholder*="search"]').length > 0) {
      notes.push('Has search functionality')
    }
    
    // Check for filters
    if ($('.filter, [class*="filter"], select[name*="category"]').length > 0) {
      notes.push('Has filtering capabilities')
    }
    
    // Mobile responsiveness indicators
    if ($('meta[name="viewport"]').length > 0) {
      notes.push('Mobile responsive design')
    }
    
    // E-commerce indicators
    if ($('.cart, .basket, [class*="cart"], [class*="basket"]').length > 0) {
      notes.push('E-commerce functionality present')
    }
    
    return notes.length > 0 ? notes.join(', ') : 'Standard tool hire website layout'
  }

  async analyzeMultipleSites(urls) {
    console.log(`🚀 Starting analysis of ${urls.length} websites...\\n`)
    
    const results = []
    
    for (const url of urls) {
      const analysis = await this.analyzeWebsite(url)
      results.push(analysis)
      
      // Be respectful - delay between requests
      await this.delay(2000)
    }
    
    await this.generateCSV(results)
    return results
  }

  async generateCSV(results) {
    console.log('\\n📊 Generating CSV file...')
    
    const csvHeaders = [
      'company_name',
      'website_url', 
      'region',
      'county',
      'postcode_area',
      'phone',
      'has_online_pricing',
      'main_categories_url',
      'url_pattern',
      'pricing_structure',
      'site_structure_notes',
      'priority'
    ]
    
    let csvContent = csvHeaders.join(',') + '\\n'
    
    results.forEach((result, index) => {
      const row = [
        result.company_name,
        result.website_url,
        'Unknown', // You'll need to fill these manually
        'Unknown',
        'Unknown', 
        '',
        result.pricing_structure !== 'quote_only' ? 'yes' : 'partial',
        result.main_categories_url || '',
        result.url_pattern || '',
        result.pricing_structure || '',
        result.site_structure_notes || '',
        index + 1 // Priority based on order
      ].map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
      
      csvContent += row + '\\n'
    })
    
    const outputPath = path.join(__dirname, '../data/analyzed-suppliers.csv')
    await fs.promises.writeFile(outputPath, csvContent)
    
    console.log(`✅ CSV generated: ${outputPath}`)
    console.log(`📋 Analyzed ${results.length} websites`)
    console.log('\\n📝 Next steps:')
    console.log('1. Review and edit the generated CSV')
    console.log('2. Add region/county/postcode data')
    console.log('3. Verify URL patterns are correct') 
    console.log('4. Test with sample scraper run')
  }

  resolveUrl(baseUrl, href) {
    try {
      return new URL(href, baseUrl).href
    } catch (error) {
      return href.startsWith('/') ? baseUrl + href : href
    }
  }

  calculateLinkConfidence(text, href) {
    let score = 0
    
    // High confidence keywords
    if (text.includes('hire') || href.includes('hire')) score += 3
    if (text.includes('tool') || href.includes('tool')) score += 2
    if (text.includes('plant') || href.includes('plant')) score += 2
    if (text.includes('equipment') || href.includes('equipment')) score += 2
    if (text.includes('rental') || href.includes('rental')) score += 2
    
    // Exact matches get bonus
    if (text === 'hire' || text === 'tool hire') score += 2
    
    return score
  }

  analyzeUrlPatterns(links, baseUrl) {
    if (links.length === 0) return ['/hire/{category}']
    
    const patterns = []
    const baseHost = new URL(baseUrl).pathname
    
    // Extract common patterns from actual links
    links.forEach(link => {
      try {
        const urlPath = new URL(link).pathname
        const pathParts = urlPath.split('/').filter(part => part)
        
        if (pathParts.length >= 2) {
          // Replace specific categories with placeholder
          const pattern = '/' + pathParts.map((part, index) => {
            if (index === pathParts.length - 1 && this.toolKeywords.some(keyword => part.includes(keyword))) {
              return '{category}'
            }
            return part
          }).join('/')
          
          if (!patterns.includes(pattern)) {
            patterns.push(pattern)
          }
        }
      } catch (error) {
        // Skip invalid URLs
      }
    })
    
    return patterns.length > 0 ? patterns : ['/hire/{category}']
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI Interface
async function main() {
  const analyzer = new ToolHireSiteAnalyzer()
  const args = process.argv.slice(2)
  
  if (args[0] === 'analyze' && args[1]?.startsWith('--urls=')) {
    const urls = args[1].split('=')[1].split(',').map(url => {
      return url.startsWith('http') ? url : `https://${url}`
    })
    
    await analyzer.analyzeMultipleSites(urls)
    
  } else if (args[0] === 'analyze-file' && args[1]?.startsWith('--file=')) {
    const filePath = args[1].split('=')[1]
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    let urls = []
    
    if (filePath.endsWith('.csv')) {
      // Parse CSV file
      const lines = fileContent.split('\n')
      const headerLine = lines[0]
      const urlColumnIndex = headerLine.toLowerCase().includes('website_url') ? 
        headerLine.split(',').findIndex(col => col.toLowerCase().includes('website_url')) : 0
      
      urls = lines
        .slice(1) // Skip header
        .map(line => {
          if (line.trim() && !line.startsWith('#') && !line.includes('# ') && line.includes(',')) {
            const columns = line.split(',')
            const url = columns[urlColumnIndex]?.trim()
            if (url && url !== '' && !url.includes('#')) {
              return url.startsWith('http') ? url : `https://${url}`
            }
          }
          return null
        })
        .filter(url => url !== null)
    } else {
      // Parse simple text file
      urls = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(url => url && !url.startsWith('#'))
        .map(url => url.startsWith('http') ? url : `https://${url}`)
    }
    
    console.log(`📋 Found ${urls.length} URLs to analyze:`)
    urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`))
    
    await analyzer.analyzeMultipleSites(urls)
    
  } else {
    console.log('🔧 Tool Hire Site Analyzer')
    console.log('Usage:')
    console.log('  node scripts/site-analyzer.js analyze --urls="site1.com,site2.com,site3.com"')
    console.log('  node scripts/site-analyzer.js analyze-file --file="urls.txt"')
    console.log('\\nExample:')
    console.log('  node scripts/site-analyzer.js analyze --urls="toddytoolhire.co.uk,hsshire.co.uk,speedyhire.co.uk"')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = ToolHireSiteAnalyzer