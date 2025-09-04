# Tool Hire Pricing API Service Architecture

## 🎯 Vision: UK's Most Comprehensive Tool Hire Pricing Database

### 📊 Service Overview
- **40+ Regional Suppliers** across all UK regions
- **Comprehensive Pricing Data** with annual validation
- **API Service** for real-time price queries
- **AskToddy Integration** for instant quotes
- **Annual Scraper** for price validation & updates

## 🏗️ System Architecture

### 1. **Data Collection Layer**
```
CSV Research → Initial Scrape → Database → API → AskToddy
     ↓              ↓            ↓        ↓         ↓
  40 Companies → Price Data → Structured → REST → User Query
```

### 2. **Database Schema**

```sql
-- Suppliers table
suppliers (
  id, company_name, website_url, region, county, 
  postcode_area, main_categories_url, url_pattern,
  pricing_structure, last_scraped, status
)

-- Tool categories (standardized)
tool_categories (
  id, category_name, description, priority
)

-- Tools and pricing
tool_pricing (
  id, supplier_id, category_id, tool_name, 
  daily_rate, weekly_rate, monthly_rate,
  specifications, availability, last_updated,
  source_url, confidence_score
)

-- Scraping validation log
scrape_validation (
  id, supplier_id, scrape_date, success_rate,
  price_changes, issues_found, status
)
```

### 3. **API Endpoints**

```typescript
// Public API Endpoints
GET  /api/tool-hire/search?tool={name}&region={area}
GET  /api/tool-hire/compare?tool={name}&suppliers={ids}
GET  /api/tool-hire/suppliers?region={area}
GET  /api/tool-hire/categories

// Admin/Internal Endpoints  
POST /api/tool-hire/admin/validate-prices
POST /api/tool-hire/admin/scrape-supplier/{id}
GET  /api/tool-hire/admin/scrape-status
POST /api/tool-hire/admin/bulk-update
```

## 🕷️ Annual Validation Strategy

### Manual Scrape Process (Once/Year):

```bash
# Run comprehensive validation
npm run tool-hire:validate-all

# Check specific suppliers
npm run tool-hire:validate --supplier="toddy-tool-hire"

# Generate validation report
npm run tool-hire:report
```

### Validation Features:
- **Price Drift Detection** - Flag significant changes
- **Availability Checking** - Verify tools still offered
- **URL Validation** - Check for broken links/site changes
- **Confidence Scoring** - Rate data reliability
- **Exception Reporting** - Highlight manual review needed

## 📈 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Database schema setup
- ✅ Basic API endpoints
- ✅ Supplier data import
- ✅ Simple price queries

### Phase 2: Scraping Engine (Week 3-4)
- 🔄 Intelligent category discovery
- 🔄 Robust price extraction
- 🔄 Error handling & logging
- 🔄 Initial data population

### Phase 3: API Refinement (Week 5)
- 🔄 Advanced filtering & search
- 🔄 Price comparison features
- 🔄 Regional optimization
- 🔄 Performance tuning

### Phase 4: Integration (Week 6)
- 🔄 AskToddy Advice integration
- 🔄 Toddy Tool Hire priority logic
- 🔄 User-facing features
- 🔄 Testing & deployment

## 🎯 API Response Examples

### Tool Search Response:
```json
{
  "tool": "concrete mixer",
  "region": "East England", 
  "results": [
    {
      "supplier": "Toddy Tool Hire",
      "location": "Suffolk IP12",
      "tools": [
        {
          "name": "110L Petrol Concrete Mixer",
          "daily_rate": 32.00,
          "weekly_rate": 96.00,
          "availability": "in_stock",
          "specifications": "110L capacity, Honda engine",
          "confidence": "high"
        }
      ]
    },
    {
      "supplier": "East Anglian Hire",
      "location": "Norfolk NR1", 
      "tools": [...]
    }
  ],
  "price_range": {
    "daily": { "min": 28, "max": 45, "avg": 35 },
    "weekly": { "min": 84, "max": 135, "avg": 105 }
  },
  "recommendations": {
    "best_value": "Toddy Tool Hire",
    "closest": "Regional Tools Ltd",
    "premium": "HSS Alternative"
  }
}
```

### Price Comparison Response:
```json
{
  "tool": "1.5 Tonne Mini Excavator",
  "comparison": [
    {
      "rank": 1,
      "supplier": "Toddy Tool Hire",
      "daily": 85, "weekly": 255,
      "distance_miles": 5,
      "rating": "preferred_partner"
    },
    {
      "rank": 2, 
      "supplier": "Suffolk Plant Hire",
      "daily": 92, "weekly": 275,
      "distance_miles": 12,
      "rating": "verified"
    }
  ],
  "savings_vs_competitor": "£7-20/day vs alternatives",
  "last_updated": "2024-08-15"
}
```

## 🔧 Maintenance Strategy

### Annual Validation Workflow:

1. **Pre-Scrape Check** (January)
   - Verify all 40 suppliers still active
   - Check for website structure changes
   - Update URL patterns if needed

2. **Bulk Validation Run** (February)
   - Scrape all suppliers systematically  
   - Generate comprehensive price update report
   - Flag major price movements for review

3. **Data Quality Review** (March)
   - Manual review of flagged changes
   - Update confidence scores
   - Remove discontinued tools/suppliers

4. **API Updates** (Ongoing)
   - Deploy price updates to production
   - Update AskToddy integration
   - Monitor API performance

## 🚀 Competitive Advantage

This creates **multiple moats**:

### 1. **Data Moat**
- Most comprehensive UK tool hire database
- Real regional pricing (not just London/HSS)
- Includes small independent suppliers

### 2. **Technology Moat**  
- Smart scraping that adapts to site changes
- Intelligent price validation & confidence scoring
- Regional optimization for local recommendations

### 3. **Business Moat**
- Toddy Tool Hire prioritization
- Actual competitive intelligence
- User trust through accurate, current pricing

## 💰 Monetization Potential

- **B2C**: Free for AskToddy users (drives tool hire leads)
- **B2B**: API access for other construction apps
- **Market Intelligence**: Competitor pricing reports
- **Lead Generation**: Connect customers to suppliers

---

**Result**: AskToddy becomes the **go-to source** for UK tool hire pricing, driving both digital authority and physical tool hire business for Toddy Tool Hire! 🎯