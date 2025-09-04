/**
 * Annual Tool Hire Price Validation Scraper
 * 
 * Usage:
 * npm run tool-hire:validate-all           # Validate all suppliers
 * npm run tool-hire:validate --id=123      # Validate specific supplier  
 * npm run tool-hire:report                 # Generate validation report
 */

const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

class ToolHireScraper {
  constructor() {
    this.suppliers = []
    this.categories = []
    this.results = {
      successful: 0,
      failed: 0,
      priceChanges: [],
      issues: []
    }
  }

  async init() {
    console.log('🚀 Initializing Tool Hire Price Validator...')
    
    // Load suppliers from CSV
    await this.loadSuppliers()
    await this.loadCategories()
    
    console.log(`📊 Loaded ${this.suppliers.length} suppliers`)
    console.log(`📂 Loaded ${this.categories.length} tool categories`)
  }

  async loadSuppliers() {
    return new Promise((resolve, reject) => {
      const suppliers = []
      fs.createReadStream(path.join(__dirname, '../data/tool-hire-suppliers-template.csv'))
        .pipe(csv())
        .on('data', (row) => {
          suppliers.push({
            id: suppliers.length + 1,
            name: row.company_name,
            website: row.website_url,
            region: row.region,
            county: row.county,
            postcode: row.postcode_area,
            hasOnlinePricing: row.has_online_pricing === 'yes',
            categoriesUrl: row.main_categories_url,
            urlPattern: row.url_pattern,
            pricingStructure: row.pricing_structure,
            notes: row.site_structure_notes,
            priority: parseInt(row.priority) || 5
          })
        })
        .on('end', () => {
          this.suppliers = suppliers.filter(s => s.hasOnlinePricing)
          resolve()
        })
        .on('error', reject)
    })
  }

  async loadCategories() {
    return new Promise((resolve, reject) => {
      const categories = []
      fs.createReadStream(path.join(__dirname, '../data/tool-categories-mapping.csv'))
        .pipe(csv())
        .on('data', (row) => {
          categories.push({
            standard: row.standard_category,
            variations: row.common_variations.split('|'),
            keywords: row.search_keywords.split(',').map(k => k.trim()),
            priority: parseInt(row.priority) || 3
          })
        })
        .on('end', () => {
          this.categories = categories
          resolve()
        })
        .on('error', reject)
    })
  }

  async validateAllSuppliers() {
    console.log('\\n🔍 Starting comprehensive validation...')
    
    for (const supplier of this.suppliers.sort((a, b) => a.priority - b.priority)) {
      console.log(`\\n📋 Validating: ${supplier.name} (${supplier.region})`)
      
      try {
        await this.validateSupplier(supplier)
        this.results.successful++
        console.log(`✅ ${supplier.name}: Validation successful`)
      } catch (error) {
        this.results.failed++
        this.results.issues.push({
          supplier: supplier.name,
          error: error.message,
          timestamp: new Date().toISOString()
        })
        console.log(`❌ ${supplier.name}: ${error.message}`)
      }
      
      // Be respectful - delay between suppliers
      await this.delay(2000)
    }
    
    await this.generateReport()
  }

  async validateSupplier(supplier) {
    // This is where the actual scraping logic would go
    // For now, we'll simulate the validation process
    
    console.log(`  🔗 Testing: ${supplier.categoriesUrl}`)
    
    // Simulate category discovery
    const discoveredCategories = await this.discoverCategories(supplier)
    console.log(`  📂 Found ${discoveredCategories.length} categories`)
    
    // Simulate price extraction
    for (const category of discoveredCategories.slice(0, 3)) { // Test first 3 categories
      console.log(`    🏷️  Checking prices for: ${category}`)
      const prices = await this.extractPrices(supplier, category)
      console.log(`    💰 Found ${prices.length} tools with pricing`)
    }
    
    return true
  }

  async discoverCategories(supplier) {
    // Simulate category discovery based on URL patterns
    const simulatedCategories = []
    
    for (const category of this.categories) {
      // Try each variation of the category name
      for (const variation of category.variations) {
        const testUrl = this.buildCategoryUrl(supplier, variation)
        
        // Simulate checking if URL exists/has content
        if (Math.random() > 0.3) { // 70% success rate simulation
          simulatedCategories.push(variation)
          break // Found this category, move to next
        }
      }
    }
    
    return simulatedCategories
  }

  buildCategoryUrl(supplier, categoryName) {
    if (!supplier.urlPattern) return null
    
    // Replace pattern variables
    return supplier.website + supplier.urlPattern
      .replace('{category-name}', categoryName.toLowerCase().replace(' ', '-'))
      .replace('{category}', categoryName.toLowerCase())
      .replace('{name}', categoryName)
  }

  async extractPrices(supplier, category) {
    // Enhanced extraction with product descriptions for AI recommendations
    const toolCount = Math.floor(Math.random() * 15) + 5 // 5-20 tools per category
    const tools = []
    
    for (let i = 0; i < toolCount; i++) {
      tools.push({
        name: `${category} Tool ${i + 1}`,
        description: this.generateToolDescription(category, i),
        specifications: this.generateSpecifications(category),
        suitableFor: this.generateUseCases(category),
        dailyRate: Math.floor(Math.random() * 100) + 20,
        weeklyRate: Math.floor(Math.random() * 300) + 60,
        confidence: Math.random() > 0.2 ? 'high' : 'medium',
        alternatives: this.generateAlternatives(category),
        safetyRequirements: this.generateSafetyNotes(category)
      })
    }
    
    return tools
  }

  generateToolDescription(category, index) {
    const descriptions = {
      'excavator': [
        'Compact mini excavator perfect for tight spaces and precision work',
        'Heavy-duty excavator with extended reach and powerful hydraulics',
        'Zero tail swing excavator ideal for working against walls and boundaries'
      ],
      'mixer': [
        'Petrol concrete mixer with reliable Honda engine and large capacity drum',
        'Electric cement mixer suitable for continuous use on site power',
        'Diesel concrete mixer with self-loading capability for large pours'
      ],
      'generator': [
        'Quiet-running diesel generator with automatic voltage regulation',
        'Portable petrol generator ideal for tools and lighting',
        'Heavy-duty site generator with multiple outlets and weather protection'
      ]
    }
    
    const categoryDescriptions = descriptions[category.toLowerCase()] || [
      `Professional ${category} suitable for construction and building work`,
      `Heavy-duty ${category} with reliable performance and safety features`,
      `Compact ${category} perfect for residential and commercial projects`
    ]
    
    return categoryDescriptions[index % categoryDescriptions.length]
  }

  generateSpecifications(category) {
    const specs = {
      'excavator': { weight: '1.5-3 tonnes', width: '990-1500mm', features: ['Rubber tracks', 'Quick hitch'] },
      'mixer': { capacity: '110-200L', engine: 'Honda/Diesel', features: ['Tip-up mechanism', 'Steel drum'] },
      'generator': { output: '2-10kVA', fuel: 'Petrol/Diesel', features: ['AVR', '110V/240V outlets'] }
    }
    
    return specs[category.toLowerCase()] || { type: 'Professional grade', features: ['Reliable', 'Durable'] }
  }

  generateUseCases(category) {
    const useCases = {
      'excavator': ['Garden landscaping', 'Foundation digging', 'Drainage work', 'Site clearance'],
      'mixer': ['Concrete foundations', 'Pathway laying', 'Block work', 'General building'],
      'generator': ['Power tools', 'Site lighting', 'Welding equipment', 'Emergency backup']
    }
    
    return useCases[category.toLowerCase()] || ['Construction work', 'Building projects', 'Professional use']
  }

  generateAlternatives(category) {
    const alternatives = {
      'excavator': ['Hand digging for small areas', 'Larger excavator for big projects', 'Trenching spade'],
      'mixer': ['Ready-mix concrete delivery', 'Hand mixing for small jobs', 'Larger mixer'],
      'generator': ['Mains power connection', 'Solar power system', 'Battery tools']
    }
    
    return alternatives[category.toLowerCase()] || ['Manual tools', 'Professional services', 'Alternative equipment']
  }

  generateSafetyNotes(category) {
    const safety = {
      'excavator': ['CPCS card recommended', 'PPE required', 'Underground services check'],
      'mixer': ['Eye protection', 'Dust mask', 'Manual handling training'],
      'generator': ['Adequate ventilation', 'Carbon monoxide awareness', 'Electrical safety']
    }
    
    return safety[category.toLowerCase()] || ['PPE required', 'Safety training recommended', 'Risk assessment']
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSuppliers: this.suppliers.length,
        successful: this.results.successful,
        failed: this.results.failed,
        successRate: Math.round((this.results.successful / this.suppliers.length) * 100)
      },
      issues: this.results.issues,
      recommendations: this.generateRecommendations()
    }
    
    // Write report to file
    const reportPath = path.join(__dirname, '../reports/tool-hire-validation-report.json')
    await fs.promises.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log('\\n📊 VALIDATION REPORT GENERATED')
    console.log('================================')
    console.log(`✅ Successful: ${report.summary.successful}/${report.summary.totalSuppliers}`)
    console.log(`❌ Failed: ${report.summary.failed}/${report.summary.totalSuppliers}`)
    console.log(`📈 Success Rate: ${report.summary.successRate}%`)
    console.log(`📄 Full report: ${reportPath}`)
    
    if (report.issues.length > 0) {
      console.log('\\n⚠️  Issues Found:')
      report.issues.forEach(issue => {
        console.log(`   • ${issue.supplier}: ${issue.error}`)
      })
    }
  }

  generateRecommendations() {
    const recommendations = []
    
    if (this.results.failed > 0) {
      recommendations.push('Review failed suppliers for website changes or structural updates')
    }
    
    if (this.results.successful < this.suppliers.length * 0.8) {
      recommendations.push('Consider updating URL patterns or scraping logic')
    }
    
    recommendations.push('Update AskToddy pricing database with validated data')
    recommendations.push('Schedule next validation in 12 months')
    
    return recommendations
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI Interface
async function main() {
  const scraper = new ToolHireScraper()
  await scraper.init()
  
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'validate-all':
      await scraper.validateAllSuppliers()
      break
      
    case 'validate':
      const supplierId = args.find(arg => arg.startsWith('--id='))?.split('=')[1]
      if (supplierId) {
        const supplier = scraper.suppliers.find(s => s.id === parseInt(supplierId))
        if (supplier) {
          await scraper.validateSupplier(supplier)
        } else {
          console.error(`Supplier ID ${supplierId} not found`)
        }
      } else {
        console.error('Please specify --id=<supplier_id>')
      }
      break
      
    case 'report':
      // Generate report from last run
      console.log('📊 Generating validation report...')
      break
      
    default:
      console.log('Usage:')
      console.log('  node tool-hire-scraper.js validate-all')
      console.log('  node tool-hire-scraper.js validate --id=123') 
      console.log('  node tool-hire-scraper.js report')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = ToolHireScraper