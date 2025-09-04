# Tool Hire Suppliers Data Collection Guide

## 📋 Template Usage

Use the `data/tool-hire-suppliers-template.csv` file to curate regional tool hire companies.

## 🏗️ Column Definitions

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| `company_name` | Business name | "Toddy Tool Hire" | ✅ |
| `website_url` | Main website URL | "https://toddytoolhire.co.uk" | ✅ |
| `region` | UK region | "East England", "London", "North West" | ✅ |
| `county` | County/area | "Suffolk", "Greater London" | ✅ |
| `postcode_area` | First part of postcode | "IP12", "SW1", "M1" | ✅ |
| `phone` | Contact number | "01394123456" | ❌ |
| `has_online_pricing` | Shows prices online | "yes", "no", "partial" | ✅ |
| `main_categories_url` | Main categories/products page | "https://site.com/categories" | ✅ |
| `url_pattern` | How category URLs are structured | "/categories/{category-name}" | ✅ |
| `pricing_structure` | How pricing is displayed | "per_product_page", "daily_weekly_rates", "quote_only" | ✅ |
| `site_structure_notes` | Additional structure info | "Nested categories", "Simple layout" | ✅ |
| `typical_tools` | Tool categories (pipe-separated) | "excavators\|mixers\|drills" | ✅ |
| `notes` | Additional info | "Easy to scrape", "Anti-bot protection" | ❌ |
| `priority` | Scraping priority (1-5) | 1=highest, 5=lowest | ✅ |

## 🎯 Target Criteria

### ✅ Good Candidates
- **Clear online pricing** - Shows daily/weekly rates
- **Simple websites** - No complex JavaScript pricing calculators
- **Regional coverage** - Covers different UK areas
- **Good tool range** - Variety of equipment types
- **No anti-bot protection** - No CloudFlare, Captcha, etc.

### ❌ Avoid
- **HSS Hire** - Known anti-bot protection
- **Speedy Hire** - Complex anti-scraping measures
- **Sites requiring login** - Can't access pricing without account
- **JavaScript-heavy pricing** - Dynamic pricing that's hard to scrape
- **Frequent layout changes** - Unstable scraping targets

## 🗺️ Regional Priority Areas

1. **East England** (Your home region)
   - Suffolk, Norfolk, Essex, Cambridgeshire
   - Priority: Highlight Toddy Tool Hire + competitors

2. **London & South East**
   - High value market
   - Many independent suppliers

3. **Major Cities**
   - Manchester, Birmingham, Leeds, Glasgow
   - Good tool hire markets

4. **Regional Coverage**
   - South West, North East, Wales, Scotland
   - Fill coverage gaps

## 🔍 Research Process

### 1. Google Search Terms
```
"tool hire [city/region]" 
"plant hire [area] prices"
"equipment rental [location] rates"
"[region] tool hire companies"
```

### 2. Check Website Features
- Does it show prices on individual product pages?
- Are prices clearly displayed in GBP (daily/weekly rates)?
- How is the site organized? (categories, product pages, etc.)
- Are product URLs predictable and scrapable?
- Do they show "POA" (Price on Application) or actual rates?

### 3. Test Scraping Feasibility
- View page source - is pricing in HTML?
- Check robots.txt - are pricing pages allowed?
- Test with curl/browser dev tools
- Look for anti-bot measures

## 📊 Expected Data Output

From each product page, we'll extract:
- **Tool name**: "1.5 Tonne Mini Excavator"
- **Pricing structure**: "£85/day, £255/week"
- **Specifications**: "1.5T operating weight, 2.3m dig depth"
- **Availability**: In stock, delivery options
- **Category**: Excavators, Mixers, etc.
- **Supplier contact**: For inquiries

## 🎯 Intelligent Scraping Strategy

### 📁 Two-File System:
1. **`tool-hire-suppliers-template.csv`** - Company info and URL patterns
2. **`tool-categories-mapping.csv`** - Standard categories and variations

### 🤖 Smart Category Discovery:
The scraper will:
1. **Start at main categories page** (from `main_categories_url`)
2. **Auto-discover categories** by looking for common tool keywords
3. **Build category URLs** using the `url_pattern` 
4. **Try multiple category name variations** (e.g., "excavators", "diggers", "mini-excavators")
5. **Extract product listings** from discovered categories
6. **Visit product pages** for pricing data
7. **Normalize categories** to standard names

### 🔍 Category Matching Logic:
```
Site shows: "Plant Hire" -> Maps to: excavators, mixers
Site shows: "Power Tools" -> Maps to: hand_tools  
Site shows: "Access Equipment" -> Maps to: access_equipment
```

### 📊 URL Pattern Examples:
- **Pattern**: `/categories/{category-name}`
  - **Tries**: `/categories/excavators`, `/categories/diggers`, `/categories/plant`
- **Pattern**: `/hire/{category}/{tool-name}`  
  - **Tries**: `/hire/plant/excavators`, `/hire/equipment/diggers`

## 🚀 Implementation Plan

1. **Populate CSV** with 20-30 target suppliers
2. **Build scraper** for top priority suppliers
3. **Test data quality** and scraping success rate
4. **Scale up** to cover more regions
5. **Automate updates** weekly/bi-weekly

## 💡 Pro Tips

- **Start small**: Focus on 5-10 suppliers initially
- **Test thoroughly**: Verify scraping works before scaling
- **Respect robots.txt**: Always check and comply
- **Add delays**: Don't hammer servers
- **Monitor changes**: Websites update layouts
- **Backup plans**: Have manual data entry for critical suppliers

---

**Goal**: Build the UK's most comprehensive tool hire pricing database for AskToddy users!