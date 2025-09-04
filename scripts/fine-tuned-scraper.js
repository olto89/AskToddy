/**
 * Fine-Tuned Tool Hire Price Scraper
 * Optimized for specific UK supplier HTML structures
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const cheerio = require('cheerio')

class FineTunedScraper {
  constructor() {
    this.suppliers = []
    this.results = []
    
    // Supplier-specific selectors based on analysis
    this.supplierConfigs = {
      'hirebase': {
        productSelector: '.product-item, .hire-item, .category-product',
        nameSelector: '.product-name, h3, .title',
        priceSelector: '.price, .hire-price, .rate',
        categoryLinks: 'a[href*="tool-hire"], a[href*="plant-hire"]'
      },
      'brandonhirestation': {
        productSelector: '.product, .tool-item',
        nameSelector: '.product-title, h2, h3',
        priceSelector: '.price-box, .product-price',
        categoryLinks: 'a[href*="/hire/"]'
      },
      'shc': {
        productSelector: '.product, article.product-item',
        nameSelector: '.woocommerce-loop-product__title, .product-title',
        priceSelector: '.price, .amount',
        categoryLinks: 'a[href*="product-category"]'
      },
      'wtaphire': {
        productSelector: '.product, .type-product',
        nameSelector: '.woocommerce-loop-product__title, h2',
        priceSelector: '.price, .woocommerce-Price-amount',
        categoryLinks: 'a[href*="product-category"]'
      },
      'gaplant': {
        productSelector: '.product, .type-product',
        nameSelector: '.woocommerce-loop-product__title',
        priceSelector: '.price, .amount',
        categoryLinks: 'a[href*="hire-tools-machinery"]'
      },
      'midlandstoolandplanthire': {
        productSelector: '.product, .product-item',
        nameSelector: '.product-title, h3',
        priceSelector: '.price, .product-price',
        categoryLinks: 'a[href*="product"]'
      },
      'londonplanthire': {
        productSelector: '.hire-item, .product-box',
        nameSelector: 'h3, .item-title',
        priceSelector: '.price, .rate',
        categoryLinks: 'a[href*="hire"]'
      },
      'andaratools': {
        productSelector: '.product-item, .hire-product',
        nameSelector: '.product-name, h3',
        priceSelector: '.daily-rate, .weekly-rate, .price',
        categoryLinks: 'a[href*="categories"]'
      }
    }
    
    // Common price patterns
    this.pricePatterns = {
      daily: [
        /£(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*day/i,
        /day[:\s]*£(\d+(?:\.\d{2})?)/i,
        /daily[:\s]*£(\d+(?:\.\d{2})?)/i,
        /£(\d+(?:\.\d{2})?)\s*p\.?d\b/i
      ],
      weekly: [
        /£(\d+(?:\.\d{2})?)\s*(?:per|\/)\s*week/i,
        /week[:\s]*£(\d+(?:\.\d{2})?)/i,
        /weekly[:\s]*£(\d+(?:\.\d{2})?)/i,
        /£(\d+(?:\.\d{2})?)\s*p\.?w\b/i
      ],
      weekend: [
        /weekend[:\s]*£(\d+(?:\.\d{2})?)/i,
        /£(\d+(?:\.\d{2})?)\s*weekend/i
      ]
    }
  }

  async init() {
    console.log('🚀 Initializing Fine-Tuned Scraper...')
    await this.loadSuppliers()
    console.log(`📊 Loaded ${this.suppliers.length} suppliers with pricing structures`)
  }

  async loadSuppliers() {
    const csvContent = fs.readFileSync(
      path.join(__dirname, '../data/analyzed-suppliers.csv'), 
      'utf-8'
    )
    
    const normalizedContent = csvContent.replace(/\\n/g, '\n')
    const lines = normalizedContent.split('\n').slice(1)
    
    this.suppliers = lines
      .filter(line => line.trim() && line.includes(','))
      .map(line => {
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
      .filter(supplier => supplier && supplier.name)
      .sort((a, b) => a.priority - b.priority)
  }

  getSupplierConfig(supplierName) {
    const key = supplierName.toLowerCase().replace(/\s+/g, '')
    return this.supplierConfigs[key] || {
      productSelector: '.product, .item, article, .card',
      nameSelector: 'h2, h3, h4, .title, .name',
      priceSelector: '.price, .cost, .rate',
      categoryLinks: 'a[href*="hire"], a[href*="category"]'
    }
  }

  async fetchPage(url, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this._fetchPageAttempt(url)
      } catch (error) {
        if (attempt === retries) throw error
        console.log(`   Retry ${attempt}/${retries} for ${url}`)
        await this.delay(2000)
      }
    }
  }

  async _fetchPageAttempt(url) {
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(url)
        
        const options = {
          hostname: urlObj.hostname,
          port: 443,
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-GB,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        }

        const req = https.request(options, (res) => {
          let data = ''
          
          // Handle compressed responses
          if (res.headers['content-encoding'] === 'gzip') {
            const zlib = require('zlib')
            const gunzip = zlib.createGunzip()
            res.pipe(gunzip)
            gunzip.on('data', chunk => data += chunk)
            gunzip.on('end', () => resolve(data))
          } else {
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(data)
              } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redirectUrl = new URL(res.headers.location, url).href
                this._fetchPageAttempt(redirectUrl).then(resolve).catch(reject)
              } else {
                reject(new Error(`HTTP ${res.statusCode}`))
              }
            })
          }
        })

        req.on('error', reject)
        req.setTimeout(15000, () => {
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
    console.log(`   Structure: ${supplier.pricingStructure}`)
    
    const config = this.getSupplierConfig(supplier.name)
    const tools = []
    
    try {
      // Special handling for different pricing structures
      if (supplier.pricingStructure === 'contact_for_price') {
        console.log(`   ⚠️  Supplier requires quotes - skipping`)
        return { 
          supplier: supplier.name, 
          region: supplier.region,
          toolsFound: 0,
          tools: [],
          note: 'Contact for pricing only'
        }
      }
      
      // Try categories page first
      let targetUrl = supplier.categoriesUrl || supplier.url
      
      // Special handling for specific suppliers
      if (supplier.name.toLowerCase().includes('brandon')) {
        targetUrl = 'https://brandonhirestation.com/product-category/tool-hire/'
      } else if (supplier.name.toLowerCase().includes('hirebase')) {
        targetUrl = 'https://www.hirebase.uk/tool-hire-43-0000'
      } else if (supplier.name.toLowerCase().includes('shc')) {
        targetUrl = 'https://www.shc.co.uk/product-category/contractors-plant-hire/'
      }
      
      console.log(`   URL: ${targetUrl}`)
      
      const html = await this.fetchPage(targetUrl)
      const $ = cheerio.load(html)
      
      // Find products on this page
      const products = $(config.productSelector).slice(0, 10) // Sample 10 items
      
      if (products.length > 0) {
        products.each((i, elem) => {
          const tool = this.extractToolInfo($, elem, config, supplier)
          if (tool && tool.name && !tool.name.includes('Cookie') && !tool.name.includes('Menu')) {
            tools.push(tool)
            const price = tool.dailyRate ? `£${tool.dailyRate}/day` : 
                         tool.weeklyRate ? `£${tool.weeklyRate}/week` : 'Price TBC'
            console.log(`   ✓ Found: ${tool.name} - ${price}`)
          }
        })
      }
      
      // If no products, try finding category links
      if (tools.length === 0) {
        const categoryLinks = this.findCategoryLinks($, supplier, config)
        
        if (categoryLinks.length > 0) {
          console.log(`   📂 Found ${categoryLinks.length} categories, checking first...`)
          
          const categoryHtml = await this.fetchPage(categoryLinks[0])
          const $cat = cheerio.load(categoryHtml)
          
          const catProducts = $cat(config.productSelector).slice(0, 5)
          catProducts.each((i, elem) => {
            const tool = this.extractToolInfo($cat, elem, config, supplier)
            if (tool && tool.name) {
              tools.push(tool)
              const price = tool.dailyRate ? `£${tool.dailyRate}/day` : 
                           tool.weeklyRate ? `£${tool.weeklyRate}/week` : 'Price TBC'
              console.log(`   ✓ Found: ${tool.name} - ${price}`)
            }
          })
        }
      }
      
      if (tools.length === 0) {
        console.log(`   ℹ️  No tools found - may need manual configuration`)
      }
      
      return {
        supplier: supplier.name,
        region: supplier.region,
        url: supplier.url,
        pricingStructure: supplier.pricingStructure,
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

  extractToolInfo($, element, config, supplier) {
    const $elem = $(element)
    
    // Extract name
    let name = $elem.find(config.nameSelector).first().text().trim()
    if (!name) {
      name = $elem.find('a').first().text().trim()
    }
    
    // Skip navigation items
    if (!name || name.length < 3 || name.length > 100 ||
        name.includes('Category') || name.includes('Home') || 
        name.includes('Account') || name.includes('Cart')) {
      return null
    }
    
    // Extract description
    const description = $elem.find('.description, .excerpt, p').first().text().trim()
    
    // Extract all text for price searching
    const allText = $elem.text()
    
    // Extract prices with multiple strategies
    const prices = this.extractPrices(allText)
    
    // Also check specific price elements
    $elem.find(config.priceSelector).each((i, priceElem) => {
      const priceText = $(priceElem).text()
      const extracted = this.extractPrices(priceText)
      Object.assign(prices, extracted)
    })
    
    // Get link to product page
    const link = $elem.find('a').first().attr('href')
    const productUrl = link ? new URL(link, supplier.url).href : supplier.url
    
    return {
      name: name,
      description: description.substring(0, 200),
      category: this.categorizeToolByName(name),
      ...prices,
      supplier: supplier.name,
      region: supplier.region,
      sourceUrl: productUrl
    }
  }

  extractPrices(text) {
    const prices = {}
    
    // Try each pattern type
    for (const [type, patterns] of Object.entries(this.pricePatterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          const price = parseFloat(match[1])
          if (price > 0 && price < 10000) { // Sanity check
            if (type === 'daily') prices.dailyRate = price
            else if (type === 'weekly') prices.weeklyRate = price
            else if (type === 'weekend') prices.weekendRate = price
            break
          }
        }
      }
    }
    
    // If no specific rates, look for any price
    if (Object.keys(prices).length === 0) {
      const genericMatch = text.match(/£(\d+(?:\.\d{2})?)/i)
      if (genericMatch) {
        const price = parseFloat(genericMatch[1])
        if (price > 5 && price < 5000) { // Likely a tool hire price
          prices.indicativePrice = price
        }
      }
    }
    
    return prices
  }

  categorizeToolByName(name) {
    const nameLower = name.toLowerCase()
    
    const categories = {
      'excavator': ['excavator', 'digger', 'jcb', 'mini digger', 'micro digger'],
      'mixer': ['mixer', 'concrete', 'cement', 'belle'],
      'generator': ['generator', 'genset', 'power', 'inverter'],
      'compressor': ['compressor', 'air'],
      'drill': ['drill', 'hammer', 'breaker', 'kango', 'hilti', 'sds'],
      'saw': ['saw', 'cutter', 'stihl', 'chainsaw', 'chop', 'mitre'],
      'scaffold': ['scaffold', 'tower', 'platform', 'ladder', 'access'],
      'pump': ['pump', 'submersible', 'dirty water', 'clean water'],
      'compactor': ['compactor', 'wacker', 'plate', 'roller', 'rammer'],
      'grinder': ['grinder', 'angle', 'floor', 'concrete grinder'],
      'welder': ['welder', 'welding', 'mig', 'arc'],
      'heater': ['heater', 'heating', 'dryer', 'dehumidifier'],
      'dumper': ['dumper', 'barrow', 'muck truck'],
      'telehandler': ['telehandler', 'manitou', 'forklift']
    }
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => nameLower.includes(keyword))) {
        return category
      }
    }
    
    return 'general'
  }

  findCategoryLinks($, supplier, config) {
    const links = []
    const baseUrl = supplier.url
    
    $(config.categoryLinks).each((i, elem) => {
      const href = $(elem).attr('href')
      const text = $(elem).text().toLowerCase()
      
      // Filter for actual tool/equipment categories
      if (href && (
        text.includes('tool') || text.includes('hire') ||
        text.includes('plant') || text.includes('equipment') ||
        text.includes('excavator') || text.includes('generator') ||
        text.includes('mixer') || text.includes('drill')
      )) {
        const fullUrl = new URL(href, baseUrl).href
        if (!links.includes(fullUrl) && fullUrl !== baseUrl) {
          links.push(fullUrl)
        }
      }
    })
    
    return links.slice(0, 3) // Return top 3 category links
  }

  async scrapeAll(limit = 10) {
    console.log(`\n🎯 Starting fine-tuned scraping for top ${limit} suppliers...`)
    
    const results = []
    
    // Focus on suppliers with known pricing structures
    const targetSuppliers = this.suppliers
      .filter(s => 
        s.pricingStructure === 'per_product_page' || 
        s.pricingStructure === 'daily_weekly_rates'
      )
      .slice(0, limit)
    
    for (const supplier of targetSuppliers) {
      const result = await this.scrapeSupplier(supplier)
      results.push(result)
      
      // Save after each supplier
      await this.saveResults(results)
      
      // Respectful delay
      await this.delay(3000)
    }
    
    this.generateSummary(results)
    
    return results
  }

  async saveResults(results) {
    const timestamp = new Date().toISOString().split('T')[0]
    
    // Save JSON
    const jsonPath = path.join(__dirname, `../data/fine-tuned-prices-${timestamp}.json`)
    await fs.promises.writeFile(jsonPath, JSON.stringify(results, null, 2))
    
    // Save CSV
    const csvPath = path.join(__dirname, `../data/fine-tuned-prices-${timestamp}.csv`)
    const csvContent = this.generateCSV(results)
    await fs.promises.writeFile(csvPath, csvContent)
    
    console.log(`\n💾 Results saved to:`)
    console.log(`   ${jsonPath}`)
    console.log(`   ${csvPath}`)
  }

  generateCSV(results) {
    const headers = [
      'supplier', 'region', 'tool_name', 'category',
      'daily_rate', 'weekly_rate', 'indicative_price',
      'description', 'source_url'
    ]
    
    let csv = headers.join(',') + '\n'
    
    results.forEach(result => {
      if (result.tools && result.tools.length > 0) {
        result.tools.forEach(tool => {
          const row = [
            `"${tool.supplier}"`,
            `"${tool.region}"`,
            `"${tool.name.replace(/"/g, '""')}"`,
            tool.category,
            tool.dailyRate || '',
            tool.weeklyRate || '',
            tool.indicativePrice || '',
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
    console.log('\n' + '='.repeat(50))
    console.log('📊 FINE-TUNED SCRAPING SUMMARY')
    console.log('='.repeat(50))
    
    let totalTools = 0
    let suppliersWithData = 0
    let suppliersWithPrices = 0
    const pricesByCategory = {}
    
    results.forEach(result => {
      if (result.toolsFound > 0) {
        suppliersWithData++
        totalTools += result.toolsFound
        
        let hasPrice = false
        result.tools.forEach(tool => {
          if (tool.dailyRate || tool.weeklyRate) {
            hasPrice = true
            
            if (!pricesByCategory[tool.category]) {
              pricesByCategory[tool.category] = []
            }
            
            if (tool.dailyRate) {
              pricesByCategory[tool.category].push({
                type: 'daily',
                price: tool.dailyRate,
                supplier: tool.supplier
              })
            }
          }
        })
        
        if (hasPrice) suppliersWithPrices++
      }
    })
    
    console.log(`\n✅ Suppliers analyzed: ${results.length}`)
    console.log(`📦 Suppliers with tools: ${suppliersWithData}`)
    console.log(`💰 Suppliers with prices: ${suppliersWithPrices}`)
    console.log(`🛠️  Total tools found: ${totalTools}`)
    
    if (Object.keys(pricesByCategory).length > 0) {
      console.log('\n💷 PRICES BY CATEGORY:')
      Object.entries(pricesByCategory).forEach(([category, prices]) => {
        const dailyPrices = prices.filter(p => p.type === 'daily').map(p => p.price)
        if (dailyPrices.length > 0) {
          const min = Math.min(...dailyPrices)
          const max = Math.max(...dailyPrices)
          const avg = (dailyPrices.reduce((a, b) => a + b, 0) / dailyPrices.length).toFixed(2)
          console.log(`\n${category.toUpperCase()}:`)
          console.log(`  Daily rates: £${min} - £${max} (avg: £${avg})`)
          console.log(`  Suppliers: ${[...new Set(prices.map(p => p.supplier))].join(', ')}`)
        }
      })
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI
async function main() {
  const scraper = new FineTunedScraper()
  await scraper.init()
  
  const args = process.argv.slice(2)
  
  if (args[0] === 'scrape') {
    const limit = parseInt(args[1]) || 10
    await scraper.scrapeAll(limit)
  } else if (args[0] === 'test' && args[1]) {
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
    console.log('Fine-Tuned Tool Hire Scraper')
    console.log('============================')
    console.log('\nUsage:')
    console.log('  node fine-tuned-scraper.js scrape [limit]  # Scrape top N suppliers')
    console.log('  node fine-tuned-scraper.js test <name>     # Test specific supplier')
    console.log('\nExamples:')
    console.log('  node fine-tuned-scraper.js scrape 5        # Scrape top 5 suppliers')
    console.log('  node fine-tuned-scraper.js test brandon    # Test Brandon Hire Station')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = FineTunedScraper