/**
 * Tool Hire Price Scraper
 * Fetches actual pricing data from analyzed suppliers
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const cheerio = require('cheerio')

class PriceScraper {
  constructor() {
    this.suppliers = []
    this.scrapedData = []
    this.pricePatterns = [
      /£(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*day/i,
      /day[:\s]*£(\d+(?:\.\d{2})?)/i,
      /£(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*week/i,
      /week[:\s]*£(\d+(?:\.\d{2})?)/i,
      /from\s*£(\d+(?:\.\d{2})?)/i,
      /£(\d+(?:\.\d{2})?)/
    ]
  }

  async init() {
    console.log('🚀 Initializing Price Scraper...')
    await this.loadSuppliers()
    console.log(`📊 Loaded ${this.suppliers.length} suppliers`)
  }

  async loadSuppliers() {
    const csvContent = fs.readFileSync(
      path.join(__dirname, '../data/analyzed-suppliers.csv'), 
      'utf-8'
    )
    
    // Handle escaped newlines in CSV
    const normalizedContent = csvContent.replace(/\\n/g, '\n')
    const lines = normalizedContent.split('\n').slice(1) // Skip header
    
    this.suppliers = lines
      .filter(line => line.trim() && line.includes(','))
      .map(line => {
        // Parse CSV line (handling quoted values)
        const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
        if (!matches || matches.length < 10) return null
        
        const values = matches.map(val => val.replace(/^"|"$/g, '').trim())
        
        return {
          name: values[0],
          url: values[1],
          region: values[2] || 'Unknown',
          categoriesUrl: values[7],
          urlPattern: values[8],
          pricingStructure: values[9],
          priority: parseInt(values[11]) || 99
        }
      })
      .filter(supplier => 
        supplier && 
        supplier.pricingStructure && 
        supplier.pricingStructure !== 'contact_for_price' &&
        supplier.pricingStructure !== 'unknown'
      )
      .sort((a, b) => a.priority - b.priority)
  }

  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(url)
        
        const options = {
          hostname: urlObj.hostname,
          port: 443,
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-GB,en;q=0.9',
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
              // Handle redirect
              const redirectUrl = new URL(res.headers.location, url).href
              this.fetchPage(redirectUrl).then(resolve).catch(reject)
            } else {
              reject(new Error(`HTTP ${res.statusCode}`))
            }
          })
        })

        req.on('error', reject)
        req.setTimeout(10000, () => {
          req.destroy()
          reject(new Error('Timeout'))
        })

        req.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  async scrapeSupplier(supplier) {
    console.log(`\n🔍 Scraping: ${supplier.name} (${supplier.region})`)
    console.log(`   URL: ${supplier.categoriesUrl || supplier.url}`)
    
    try {
      // Fetch the categories page
      const html = await this.fetchPage(supplier.categoriesUrl || supplier.url)
      const $ = cheerio.load(html)
      
      // Find tool categories and sample products
      const tools = []
      
      // Look for product listings
      const productSelectors = [
        '.product', '.item', '.tool-item', '.hire-item',
        '[class*="product"]', '[class*="tool"]', '[class*="hire"]',
        'article', '.card', '.listing'
      ]
      
      let productsFound = false
      
      for (const selector of productSelectors) {
        const elements = $(selector).slice(0, 5) // Sample first 5 items
        
        if (elements.length > 0) {
          productsFound = true
          
          elements.each((i, elem) => {
            const tool = this.extractToolInfo($, elem, supplier)
            if (tool && tool.name) {
              tools.push(tool)
              console.log(`   ✓ Found: ${tool.name} - £${tool.dailyRate || '?'}/day`)
            }
          })
          
          if (tools.length > 0) break
        }
      }
      
      // If no products found on main page, try to find category links
      if (!productsFound) {
        const categoryLinks = this.findCategoryLinks($, supplier)
        
        if (categoryLinks.length > 0) {
          console.log(`   📂 Found ${categoryLinks.length} categories, sampling first one...`)
          
          // Sample first category
          const categoryUrl = categoryLinks[0]
          const categoryHtml = await this.fetchPage(categoryUrl)
          const $category = cheerio.load(categoryHtml)
          
          // Try to extract products from category page
          for (const selector of productSelectors) {
            const elements = $category(selector).slice(0, 3)
            
            elements.each((i, elem) => {
              const tool = this.extractToolInfo($category, elem, supplier)
              if (tool && tool.name) {
                tools.push(tool)
                console.log(`   ✓ Found: ${tool.name} - £${tool.dailyRate || '?'}/day`)
              }
            })
            
            if (tools.length > 0) break
          }
        }
      }
      
      if (tools.length === 0) {
        console.log(`   ⚠️  No pricing data found - may need manual review`)
      }
      
      return {
        supplier: supplier.name,
        region: supplier.region,
        url: supplier.url,
        toolsFound: tools.length,
        tools: tools,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      return {
        supplier: supplier.name,
        region: supplier.region,
        url: supplier.url,
        error: error.message,
        toolsFound: 0,
        tools: []
      }
    }
  }

  extractToolInfo($, element, supplier) {
    const $elem = $(element)
    
    // Extract tool name
    const nameSelectors = [
      'h2', 'h3', 'h4', '.title', '.name', '.product-name',
      '[class*="title"]', '[class*="name"]', 'a'
    ]
    
    let name = ''
    for (const selector of nameSelectors) {
      const text = $elem.find(selector).first().text().trim()
      if (text && text.length > 3 && text.length < 100) {
        name = text
        break
      }
    }
    
    // Extract description
    const description = $elem.find('.description, .desc, p').first().text().trim() || ''
    
    // Extract all text for price searching
    const allText = $elem.text()
    
    // Extract prices
    const prices = this.extractPrices(allText)
    
    // Look for specific price elements
    const priceElements = $elem.find('.price, .cost, [class*="price"], [class*="rate"]')
    priceElements.each((i, priceElem) => {
      const priceText = $(priceElem).text()
      const extracted = this.extractPrices(priceText)
      Object.assign(prices, extracted)
    })
    
    // Build tool object
    return {
      name: name,
      description: description.substring(0, 200),
      category: this.categorizeToolByName(name),
      ...prices,
      supplier: supplier.name,
      region: supplier.region,
      sourceUrl: supplier.url
    }
  }

  extractPrices(text) {
    const prices = {}
    
    // Daily rate
    const dayMatch = text.match(/£(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*day|day[:\s]*£(\d+(?:\.\d{2})?)/i)
    if (dayMatch) {
      prices.dailyRate = parseFloat(dayMatch[1] || dayMatch[2])
    }
    
    // Weekly rate
    const weekMatch = text.match(/£(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*week|week[:\s]*£(\d+(?:\.\d{2})?)/i)
    if (weekMatch) {
      prices.weeklyRate = parseFloat(weekMatch[1] || weekMatch[2])
    }
    
    // Weekend rate
    const weekendMatch = text.match(/weekend[:\s]*£(\d+(?:\.\d{2})?)|£(\d+(?:\.\d{2})?)\s*weekend/i)
    if (weekendMatch) {
      prices.weekendRate = parseFloat(weekendMatch[1] || weekendMatch[2])
    }
    
    // From price (if no specific rates found)
    if (!prices.dailyRate && !prices.weeklyRate) {
      const fromMatch = text.match(/from\s*£(\d+(?:\.\d{2})?)|£(\d+(?:\.\d{2})?)/i)
      if (fromMatch) {
        prices.indicativePrice = parseFloat(fromMatch[1] || fromMatch[2])
      }
    }
    
    return prices
  }

  categorizeToolByName(name) {
    const nameLower = name.toLowerCase()
    
    const categories = {
      'excavator': ['excavator', 'digger', 'jcb', 'mini digger'],
      'mixer': ['mixer', 'concrete', 'cement'],
      'generator': ['generator', 'genset', 'power'],
      'compressor': ['compressor', 'air'],
      'drill': ['drill', 'hammer', 'breaker', 'kango'],
      'saw': ['saw', 'cutter', 'stihl'],
      'scaffold': ['scaffold', 'tower', 'platform'],
      'pump': ['pump', 'submersible'],
      'compactor': ['compactor', 'wacker', 'plate', 'roller'],
      'grinder': ['grinder', 'angle'],
      'welder': ['welder', 'welding'],
      'heater': ['heater', 'heating']
    }
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => nameLower.includes(keyword))) {
        return category
      }
    }
    
    return 'general'
  }

  findCategoryLinks($, supplier) {
    const links = []
    const baseUrl = supplier.url
    
    // Look for category links
    $('a').each((i, elem) => {
      const href = $(elem).attr('href')
      const text = $(elem).text().toLowerCase()
      
      if (href && (
        text.includes('excavator') || text.includes('mixer') ||
        text.includes('generator') || text.includes('drill') ||
        text.includes('saw') || text.includes('tool') ||
        href.includes('category') || href.includes('hire')
      )) {
        const fullUrl = new URL(href, baseUrl).href
        if (!links.includes(fullUrl) && fullUrl !== baseUrl) {
          links.push(fullUrl)
        }
      }
    })
    
    return links.slice(0, 3) // Return max 3 category links
  }

  async scrapeAll() {
    console.log(`\n🎯 Starting price scraping for ${this.suppliers.length} suppliers...`)
    
    const results = []
    
    // Scrape suppliers in batches to be respectful
    for (const supplier of this.suppliers.slice(0, 10)) { // Start with first 10
      const result = await this.scrapeSupplier(supplier)
      results.push(result)
      
      // Delay between requests
      await this.delay(3000)
    }
    
    // Save results
    await this.saveResults(results)
    
    // Generate summary
    this.generateSummary(results)
    
    return results
  }

  async saveResults(results) {
    // Save raw scraped data
    const dataPath = path.join(__dirname, '../data/scraped-prices.json')
    await fs.promises.writeFile(
      dataPath,
      JSON.stringify(results, null, 2)
    )
    
    // Generate CSV for easy viewing
    const csvPath = path.join(__dirname, '../data/scraped-prices.csv')
    const csvContent = this.generateCSV(results)
    await fs.promises.writeFile(csvPath, csvContent)
    
    console.log(`\n💾 Data saved to:`)
    console.log(`   JSON: ${dataPath}`)
    console.log(`   CSV: ${csvPath}`)
  }

  generateCSV(results) {
    const headers = [
      'supplier', 'region', 'tool_name', 'category', 
      'daily_rate', 'weekly_rate', 'weekend_rate', 
      'description', 'source_url'
    ]
    
    let csv = headers.join(',') + '\n'
    
    results.forEach(result => {
      if (result.tools && result.tools.length > 0) {
        result.tools.forEach(tool => {
          const row = [
            tool.supplier,
            tool.region,
            `"${tool.name.replace(/"/g, '""')}"`,
            tool.category,
            tool.dailyRate || '',
            tool.weeklyRate || '',
            tool.weekendRate || '',
            `"${(tool.description || '').replace(/"/g, '""')}"`,
            tool.sourceUrl
          ]
          csv += row.join(',') + '\n'
        })
      }
    })
    
    return csv
  }

  generateSummary(results) {
    console.log('\n📊 SCRAPING SUMMARY')
    console.log('===================')
    
    let totalTools = 0
    let suppliersWithData = 0
    const priceRanges = {}
    
    results.forEach(result => {
      if (result.toolsFound > 0) {
        suppliersWithData++
        totalTools += result.toolsFound
        
        result.tools.forEach(tool => {
          if (!priceRanges[tool.category]) {
            priceRanges[tool.category] = {
              dailyMin: Infinity,
              dailyMax: 0,
              weeklyMin: Infinity,
              weeklyMax: 0,
              count: 0
            }
          }
          
          const range = priceRanges[tool.category]
          range.count++
          
          if (tool.dailyRate) {
            range.dailyMin = Math.min(range.dailyMin, tool.dailyRate)
            range.dailyMax = Math.max(range.dailyMax, tool.dailyRate)
          }
          
          if (tool.weeklyRate) {
            range.weeklyMin = Math.min(range.weeklyMin, tool.weeklyRate)
            range.weeklyMax = Math.max(range.weeklyMax, tool.weeklyRate)
          }
        })
      }
    })
    
    console.log(`✅ Suppliers with data: ${suppliersWithData}/${results.length}`)
    console.log(`📦 Total tools found: ${totalTools}`)
    
    console.log('\n💰 PRICE RANGES BY CATEGORY:')
    Object.entries(priceRanges).forEach(([category, range]) => {
      console.log(`\n${category.toUpperCase()} (${range.count} items):`)
      if (range.dailyMin !== Infinity) {
        console.log(`  Daily: £${range.dailyMin} - £${range.dailyMax}`)
      }
      if (range.weeklyMin !== Infinity) {
        console.log(`  Weekly: £${range.weeklyMin} - £${range.weeklyMax}`)
      }
    })
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI
async function main() {
  const scraper = new PriceScraper()
  await scraper.init()
  
  const args = process.argv.slice(2)
  
  if (args[0] === 'scrape') {
    await scraper.scrapeAll()
  } else if (args[0] === 'test' && args[1]) {
    // Test single supplier
    const supplier = scraper.suppliers.find(s => 
      s.name.toLowerCase().includes(args[1].toLowerCase())
    )
    
    if (supplier) {
      const result = await scraper.scrapeSupplier(supplier)
      console.log('\nResult:', JSON.stringify(result, null, 2))
    } else {
      console.log(`Supplier "${args[1]}" not found`)
    }
  } else {
    console.log('Usage:')
    console.log('  node price-scraper.js scrape           # Scrape all suppliers')
    console.log('  node price-scraper.js test <supplier>  # Test single supplier')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = PriceScraper