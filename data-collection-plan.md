# AskToddy Real Market Data Collection Plan

## 🎯 **Immediate Action Plan (Next 7 Days)**

### **Day 1-2: HSS Hire Tool Data**
**Target**: 20 most common tools with accurate pricing

**Method**: 
1. Visit https://www.hss.com/hire
2. Navigate to each category:
   - Power Tools → Drills & Drivers
   - Power Tools → Saws & Cutting  
   - Access Equipment → Ladders
   - Plant & Machinery → Mini Excavators
3. Record for each tool:
   ```
   Name: "Cordless Drill 18V"
   Daily Rate: £12.50
   Weekly Rate: £45.00
   Deposit: £50.00
   Category: "Power Tools"
   Supplier: "HSS Hire"
   ```

**Tools to Prioritize**:
- Cordless drill
- Circular saw
- Angle grinder
- Step ladder 8ft
- Extension ladder
- Reciprocating saw
- Tile cutter
- Pressure washer
- Mini digger 1.5T
- Concrete mixer

### **Day 3-4: Checkatrade Labor Costs**
**Target**: 15 common job types with regional pricing

**Method**:
1. Visit https://www.checkatrade.com/blog/cost-guides/
2. Key articles:
   - Bathroom renovation costs
   - Kitchen renovation costs  
   - Electrical work prices
   - Plumbing costs
   - Tiling prices
3. Extract data like:
   ```
   Job Type: "Small bathroom renovation"
   Cost Range: £800-2000 per sqm
   Complexity Factors: ["access", "plumbing_complexity", "tile_quality"]
   Time Estimate: "1-2 weeks professional"
   Building Control Required: Yes
   ```

### **Day 5-7: Material Costs (B&Q/Wickes)**
**Target**: 25 common materials across quality tiers

**Focus Materials**:
- Ceramic wall tiles (200x250mm)
- Porcelain floor tiles (600x600mm)
- Matt emulsion paint 5L
- Exterior masonry paint
- Twin & earth cable 2.5mm
- Copper pipe 15mm
- Basin mixer taps
- Toilet suites
- Laminate flooring
- Building sand bulk bags

## 🛠 **Data Collection Templates**

### **Tool Hire Template**
```csv
name,category,daily_rate,weekly_rate,weekend_rate,deposit,delivery_cost,supplier,requires_license,specifications
Cordless Drill 18V,Power Tools,12.50,45.00,18.00,50.00,0,HSS Hire,false,"{""voltage"":""18V"",""battery"":""included""}"
```

### **Labor Cost Template**
```csv
trade,job_type,rate_structure,base_rate,unit,min_charge,complexity_basic,complexity_standard,complexity_complex,source,region
Tiler,Tile bathroom walls,per_sqm,65.00,sqm,300.00,1.0,1.3,1.7,Checkatrade,UK Average
```

### **Material Cost Template**
```csv
name,category,budget_price,mid_range_price,premium_price,unit,waste_factor,coverage_per_unit,supplier
Ceramic Wall Tiles,Tiles,15.00,35.00,85.00,per_sqm,0.10,1.0,Wickes
```

## 📊 **Data Quality Standards**

### **Validation Checklist**
- [ ] Tool daily rates between £5-£500
- [ ] Weekly rates 3-5x daily rates
- [ ] Labor costs realistic for UK market
- [ ] Material prices compared across 2+ suppliers
- [ ] Regional variations documented
- [ ] Seasonal factors noted
- [ ] Source URLs recorded
- [ ] Collection date recorded

### **Priority Scoring**
1. **Critical (Do First)**: Bathroom renovation, kitchen renovation, basic power tools
2. **Important (Do Second)**: Electrical work, plumbing, landscaping tools
3. **Nice to Have (Do Third)**: Specialized tools, premium materials

## 🚀 **Implementation Strategy**

### **Week 1: Foundation Data**
Focus on the 20 most commonly requested tools and 10 most common job types. This gives immediate accuracy improvements.

### **Week 2: Regional Expansion** 
Add London, Manchester, Birmingham pricing variations. This provides location-specific accuracy.

### **Week 3: Quality Tiers**
Add budget/premium material options. This provides choice and accurate pricing for different customer segments.

### **Ongoing: Monthly Updates**
Set up monthly data refresh cycle to keep pricing current.

## 📈 **Expected Impact**

**Current State**: Generic estimates, ±50% accuracy
**After Week 1**: Real UK pricing, ±25% accuracy  
**After Week 2**: Location-specific, ±15% accuracy
**After Week 3**: Full system, ±10% accuracy

## 🤖 **Automation Opportunities**

Once manual data collection proves the model works:
1. **API Integrations**: Some suppliers may have B2B APIs
2. **Web Scraping**: Automated collection from public websites
3. **Crowdsourcing**: User-submitted pricing updates
4. **Trade Partnerships**: Direct data feeds from suppliers

---

**Ready to start? Begin with HSS Hire tool pricing - it's the quickest way to see immediate improvements in accuracy!**