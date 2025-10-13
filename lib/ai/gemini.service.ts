import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ProjectAnalysis {
  projectType: string
  difficultyLevel: 'Easy' | 'Moderate' | 'Difficult' | 'Professional Required'
  estimatedCost: {
    materials: { min: number; max: number }
    labor: { min: number; max: number }
    total: { min: number; max: number }
  }
  timeEstimate: {
    diy: string
    professional: string
  }
  toolsNeeded: Array<{
    name: string
    estimatedCost: number
    required: boolean
  }>
  materials: Array<{
    name: string
    quantity: string
    estimatedCost: number
  }>
  steps: string[]
  safetyConsiderations: string[]
  requiresProfessional: boolean
  professionalReasons?: string[]
  recommendedContractors?: any[]
  contractorSearchLocation?: string
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null
  private fallbackModels = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-pro'
  ]

  constructor(apiKey?: string) {
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey)
      
      // Use environment variable for primary model if available
      const primaryModel = process.env.GEMINI_PRIMARY_MODEL
      if (primaryModel && !this.fallbackModels.includes(primaryModel)) {
        this.fallbackModels.unshift(primaryModel)
      }
      
      this.initializeModel()
    }
  }

  private async initializeModel() {
    if (!this.genAI) return

    // Check if fallback is disabled via environment variable
    const enableFallback = process.env.GEMINI_ENABLE_FALLBACK !== 'false'
    
    if (!enableFallback) {
      // Use only the primary model if fallback is disabled
      const primaryModel = this.fallbackModels[0]
      try {
        console.log(`Using primary model only: ${primaryModel}`)
        this.model = this.genAI.getGenerativeModel({ model: primaryModel })
        await this.model.generateContent('Test')
        console.log(`✅ Successfully initialized ${primaryModel}`)
        return
      } catch (error) {
        console.error(`❌ Primary model ${primaryModel} failed:`, (error as Error).message)
        this.model = null
        return
      }
    }

    // Try each model in the fallback chain
    for (const modelName of this.fallbackModels) {
      try {
        console.log(`Trying Gemini model: ${modelName}`)
        this.model = this.genAI.getGenerativeModel({ model: modelName })
        
        // Test the model with a simple request
        await this.model.generateContent('Test')
        console.log(`✅ Successfully initialized ${modelName}`)
        return
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, (error as Error).message)
        continue
      }
    }
    
    console.error('❌ ALL GEMINI MODELS FAILED - Using fallback responses')
    this.model = null
  }

  async generateContent(prompt: string): Promise<string> {
    // If no model is initialized, return intelligent fallback
    if (!this.model) {
      console.log('🔄 No model available, using intelligent fallback for:', prompt.substring(0, 100) + '...')
      return this.getIntelligentFallback(prompt)
    }

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      
      // Try to reinitialize with a different model
      console.log('🔄 Attempting model fallback...')
      await this.initializeModel()
      
      if (this.model) {
        try {
          console.log('✅ Retry successful with fallback model')
          const result = await this.model.generateContent(prompt)
          const response = await result.response
          return response.text()
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError)
        }
      }
      
      // Final fallback - intelligent response based on prompt
      console.log('🔄 All models failed, using intelligent fallback responses')
      return this.getIntelligentFallback(prompt)
    }
  }

  private getIntelligentFallback(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()
    
    // Detect project types and give appropriate responses
    if (lowerPrompt.includes('extension') || lowerPrompt.includes('extend')) {
      return "For an accurate extension quote, I need:\n• Size (e.g. 4m x 6m)?\n• Single or double storey?\n• Purpose (kitchen/living/bedroom)?\n• Your location?\n\n💡 Typical cost: £15,000-30,000"
    }
    
    if (lowerPrompt.includes('loft') || lowerPrompt.includes('attic')) {
      return "For an accurate loft quote, I need:\n• Loft size (e.g. 4m x 8m)?\n• Type (bedroom/office/bathroom)?\n• Dormer windows needed?\n• Your location?\n\n💡 Typical cost: £12,000-25,000"
    }
    
    if (lowerPrompt.includes('kitchen')) {
      return "For an accurate kitchen quote, I need:\n• Kitchen size (e.g. galley/L-shape/island)?\n• Quality level (budget/mid/high)?\n• New layout or keeping same?\n• Your location?\n\n💡 Typical cost: £8,000-15,000"
    }
    
    if (lowerPrompt.includes('bathroom') || lowerPrompt.includes('bath')) {
      return "For an accurate bathroom quote, I need:\n• Room size (e.g. 2m x 3m)?\n• Quality level (budget/mid/high)?\n• New layout or keeping same?\n• Your location?\n\n💡 Typical cost: £4,500-7,500"
    }
    
    // Tool hire queries
    if (lowerPrompt.includes('tool') || lowerPrompt.includes('hire')) {
      return "Tool hire prices: £20-200/day depending on equipment. Toddy Tool Hire (Suffolk/Essex): 01394 447658. HSS/Speedy available nationwide. Which tool do you need?"
    }
    
    // General fallback
    return "I'm having connection issues but happy to help! For construction quotes, please share: project type, size, quality level, and location. Tool hire: Toddy Tool Hire 01394 447658."
  }

  async analyzeProject(
    description: string,
    projectType: string,
    imageUrls: string[]
  ): Promise<ProjectAnalysis> {
    if (!this.model) {
      return this.getMockAnalysis(description, projectType)
    }

    try {
      // Convert image URLs to base64 if we have them
      const imageParts = []
      for (const url of imageUrls.slice(0, 4)) { // Limit to 4 images
        try {
          if (url.startsWith('data:')) {
            // Handle data URLs (from converted PDFs)
            const [mimeType, base64Data] = url.split(',')
            const mimeTypeMatch = mimeType.match(/data:([^;]+)/)
            if (mimeTypeMatch && base64Data) {
              imageParts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mimeTypeMatch[1]
                }
              })
            }
          } else {
            // Handle regular URLs
            const response = await fetch(url)
            if (response.ok) {
              const blob = await response.blob()
              const arrayBuffer = await blob.arrayBuffer()
              const base64 = Buffer.from(arrayBuffer).toString('base64')
              imageParts.push({
                inlineData: {
                  data: base64,
                  mimeType: blob.type
                }
              })
            }
          }
        } catch (error) {
          console.warn('Failed to load image:', url, error)
        }
      }

      const prompt = `
        You are a highly experienced contractor with 20+ years in construction, renovation, and DIY projects. Analyze this project with extreme accuracy based on current 2024 market prices and realistic timelines.

        CRITICAL: Base your analysis on ACTUAL VISUAL INSPECTION of the provided images. Look for:
        - Room size and dimensions (estimate square footage)
        - Existing materials and their condition
        - Complexity factors (electrical outlets, plumbing, structural elements)
        - Quality of existing work
        - Accessibility challenges
        - Code compliance issues

        Project Type: ${projectType}
        Description: ${description}
        Images provided: ${imageUrls.length} photos

        PRICING ACCURACY REQUIREMENTS:
        - Use 2024 UK market rates (VAT-inclusive where applicable)
        - Include 15-20% waste factor for materials
        - Account for building control fees where applicable
        - Consider seasonal price variations
        - Include delivery/skip hire fees
        - Factor in UK trade rates (£200-400/day skilled trades)

        CRITICAL ACCURACY REQUIREMENTS:

        1. ACTUAL MEASUREMENTS from images:
           - Estimate room dimensions by comparing to standard items (doors=80", outlets=4.5" wide)
           - Count linear feet, square footage, cubic yards as needed
           - Identify existing conditions that affect scope

        2. REALISTIC MATERIAL QUANTITIES:
           - Calculate exact amounts needed based on visible area
           - Add appropriate waste factors (10% tile, 15% paint, 20% lumber)
           - Include underlayment, fasteners, adhesives, sealers

        3. CURRENT UK MARKET PRICING (2024):
           - Flooring: £25-100/sq m materials, £40-120/sq m installed
           - Paint: £25-50/litre premium, £18-35 mid-grade
           - Tile: £15-180/sq m materials, £60-200/sq m installed
           - Electrical: £120-250/outlet, £150-500/fixture
           - Plumbing: £150-650/fixture, £12-20/linear metre pipe

        4. REALISTIC TIME ESTIMATES:
           - Account for prep work (often 30-40% of total time)
           - Include drying/curing times
           - Factor in skill level differences (DIY takes 2-4x longer)
           - Add buffer for complications (always occur)

        5. HIDDEN COSTS to include:
           - Building control fees: £150-600 depending on scope
           - Skip hire: £200-500 for renovation debris
           - Tool rental: £25-120/day for specialty tools
           - Delivery fees: £40-150
           - Emergency repairs when opening walls

        6. RED FLAGS for professional requirement:
           - Any structural modifications
           - Electrical panel work
           - Gas line work  
           - Load-bearing wall changes
           - Major plumbing relocations
        
        Return ONLY a valid JSON object matching this exact structure:
        {
          "difficultyLevel": "Easy|Moderate|Difficult|Professional Required",
          "estimatedCost": {
            "materials": { "min": 0, "max": 0 },
            "labor": { "min": 0, "max": 0 },
            "total": { "min": 0, "max": 0 }
          },
          "timeEstimate": {
            "diy": "X days/weeks",
            "professional": "X days"
          },
          "toolsNeeded": [
            { "name": "Tool Name", "estimatedCost": 0, "required": true/false }
          ],
          "materials": [
            { "name": "Material Name", "quantity": "Amount", "estimatedCost": 0 }
          ],
          "steps": [
            "Step 1: Detailed instruction",
            "Step 2: Next action"
          ],
          "safetyConsiderations": [
            "Safety point 1",
            "Safety point 2"
          ],
          "requiresProfessional": true/false,
          "professionalReasons": [
            "Reason 1 if professional required"
          ]
        }
      `

      // Create content array with text and images
      const contentParts = [{ text: prompt }]
      if (imageParts.length > 0) {
        contentParts.push(...imageParts)
      }

      const result = await this.model.generateContent(contentParts)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return {
          projectType,
          ...analysis
        }
      }
      
      throw new Error('Could not parse AI response')
    } catch (error) {
      console.error('Gemini API error:', error)
      return this.getMockAnalysis(description, projectType)
    }
  }

  private getMockAnalysis(description: string, projectType: string): ProjectAnalysis {
    // Create more realistic mock data based on project type
    const mockData = this.getRealisticMockData(projectType, description)
    
    return {
      projectType,
      ...mockData
    }
  }

  private getRealisticMockData(projectType: string, description: string) {
    const desc = description.toLowerCase()
    
    // Bathroom renovation
    if (projectType === 'renovation' && (desc.includes('bathroom') || desc.includes('bath'))) {
      return {
        difficultyLevel: 'Professional Required' as const,
        estimatedCost: {
          materials: { min: 2800, max: 6500 },
          labor: { min: 6500, max: 12000 },
          total: { min: 9300, max: 18500 }
        },
        timeEstimate: {
          diy: '3-6 weeks',
          professional: '1-2 weeks'
        },
        toolsNeeded: [
          { name: 'Tile saw', estimatedCost: 160, required: true },
          { name: 'Reciprocating saw', estimatedCost: 80, required: true },
          { name: 'Plumbing tools', estimatedCost: 120, required: true },
          { name: 'Tile spacers & trowels', estimatedCost: 40, required: true }
        ],
        materials: [
          { name: 'Tiles (5 sq m)', quantity: '5.5 sq m', estimatedCost: 350 },
          { name: 'Vanity unit', quantity: '1 unit', estimatedCost: 650 },
          { name: 'Toilet suite', quantity: '1 unit', estimatedCost: 250 },
          { name: 'Taps and fittings', quantity: 'Various', estimatedCost: 480 },
          { name: 'Waterproofing kit', quantity: '1 room', estimatedCost: 160 }
        ],
        steps: [
          'Check if building control approval needed',
          'Remove existing fixtures and flooring',
          'Update plumbing first fix',
          'Install waterproof tanking system',
          'Tile walls and floor',
          'Install vanity unit and toilet',
          'Connect plumbing and test system',
          'Building control inspection if required'
        ],
        safetyConsiderations: [
          'Turn off water at stopcock before starting',
          'Wear FFP3 mask when removing old materials',
          'Check for asbestos in pre-1980s properties',
          'Ensure proper ventilation for adhesives and sealants'
        ],
        requiresProfessional: true,
        professionalReasons: [
          'Plumbing modifications require building control approval',
          'Waterproofing critical to prevent structural damage',
          'Electrical work must comply with Part P regulations'
        ]
      }
    }
    
    // Kitchen renovation
    if (projectType === 'renovation' && desc.includes('kitchen')) {
      return {
        difficultyLevel: 'Professional Required' as const,
        estimatedCost: {
          materials: { min: 6500, max: 20000 },
          labor: { min: 9500, max: 24000 },
          total: { min: 16000, max: 44000 }
        },
        timeEstimate: {
          diy: '2-4 months',
          professional: '3-6 weeks'
        },
        toolsNeeded: [
          { name: 'Kitchen fitting kit', estimatedCost: 160, required: true },
          { name: 'Tile cutter', estimatedCost: 160, required: false },
          { name: 'Reciprocating saw', estimatedCost: 80, required: true },
          { name: 'Router for worktops', estimatedCost: 120, required: false }
        ],
        materials: [
          { name: 'Kitchen units', quantity: '3.6 linear metres', estimatedCost: 4800 },
          { name: 'Worktops', quantity: '2.3 sq m', estimatedCost: 2000 },
          { name: 'Appliances', quantity: '4 major', estimatedCost: 3200 },
          { name: 'Splashback tiles', quantity: '2.8 sq m', estimatedCost: 280 }
        ],
        steps: [
          'Plan layout and obtain permits',
          'Demo existing cabinets and counters',
          'Update electrical and plumbing rough-in',
          'Install cabinets',
          'Template and install countertops',
          'Install appliances',
          'Complete backsplash',
          'Final connections and inspection'
        ],
        safetyConsiderations: [
          'Heavy lifting required for countertops',
          'Electrical work must meet code',
          'Proper disposal of old appliances'
        ],
        requiresProfessional: true,
        professionalReasons: [
          'Electrical updates likely needed',
          'Plumbing modifications for new layout',
          'Countertop templating and installation'
        ]
      }
    }
    
    // Painting project
    if (projectType === 'painting' || desc.includes('paint')) {
      const roomSize = desc.includes('room') ? 'medium room' : 'small area'
      
      return {
        difficultyLevel: 'Easy' as const,
        estimatedCost: {
          materials: { min: 65, max: 160 },
          labor: { min: 240, max: 640 },
          total: { min: 305, max: 800 }
        },
        timeEstimate: {
          diy: '2-3 days',
          professional: '1 day'
        },
        toolsNeeded: [
          { name: 'Paint brushes and rollers', estimatedCost: 25, required: true },
          { name: 'Paint trays and liners', estimatedCost: 12, required: true },
          { name: 'Dust sheets', estimatedCost: 16, required: true },
          { name: 'Step ladder', estimatedCost: 80, required: false }
        ],
        materials: [
          { name: 'Primer', quantity: '2.5 litres', estimatedCost: 28 },
          { name: 'Emulsion paint', quantity: '5 litres', estimatedCost: 72 },
          { name: 'Masking tape', quantity: '3 rolls', estimatedCost: 20 },
          { name: 'Sandpaper assorted', quantity: '1 pack', estimatedCost: 12 }
        ],
        steps: [
          'Remove furniture and cover remaining items',
          'Clean and prep walls (fill holes, sand)',
          'Apply primer to new or dark surfaces',
          'Cut in edges with brush',
          'Roll main wall areas',
          'Apply second coat if needed',
          'Remove tape while paint is tacky',
          'Clean up and replace furniture'
        ],
        safetyConsiderations: [
          'Ensure proper ventilation',
          'Use ladder safety practices',
          'Wear old clothes or coveralls'
        ],
        requiresProfessional: false
      }
    }
    
    // Default fallback
    return {
      difficultyLevel: 'Moderate' as const,
      estimatedCost: {
        materials: { min: 400, max: 1200 },
        labor: { min: 640, max: 1600 },
        total: { min: 1040, max: 2800 }
      },
      timeEstimate: {
        diy: '1-2 weeks',
        professional: '3-5 days'
      },
      toolsNeeded: [
        { name: 'Basic hand tools', estimatedCost: 80, required: true },
        { name: 'Cordless drill', estimatedCost: 65, required: true },
        { name: 'Spirit level', estimatedCost: 20, required: true }
      ],
      materials: [
        { name: 'Primary materials', quantity: 'As needed', estimatedCost: 640 },
        { name: 'Fixings and ironmongery', quantity: 'Various', estimatedCost: 80 },
        { name: 'Finishing materials', quantity: 'As needed', estimatedCost: 160 }
      ],
      steps: [
        'Plan and measure the project area',
        'Gather all tools and materials',
        'Prepare the work area',
        'Complete main installation/work',
        'Apply finishing touches',
        'Clean up and final inspection'
      ],
      safetyConsiderations: [
        'Wear appropriate safety equipment',
        'Follow manufacturer instructions',
        'Take breaks to avoid fatigue'
      ],
      requiresProfessional: false
    }
  }

  async analyzeImagesForToolRecommendation(systemPrompt: string, imageUrls: string[]): Promise<string> {
    if (!this.model) {
      return "I'd love to analyze your images for tool recommendations, but I'm currently offline. Based on typical DIY projects, consider hiring from your local tool shop or HSS Hire for professional equipment."
    }

    try {
      const imageParts = []
      for (const url of imageUrls.slice(0, 4)) {
        try {
          if (url.startsWith('data:')) {
            // Handle data URLs (from converted PDFs)
            const [mimeType, base64Data] = url.split(',')
            const mimeTypeMatch = mimeType.match(/data:([^;]+)/)
            if (mimeTypeMatch && base64Data) {
              imageParts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mimeTypeMatch[1]
                }
              })
            }
          } else {
            // Handle regular URLs
            const response = await fetch(url)
            if (response.ok) {
              const blob = await response.blob()
              const arrayBuffer = await blob.arrayBuffer()
              const base64 = Buffer.from(arrayBuffer).toString('base64')
              imageParts.push({
                inlineData: {
                  data: base64,
                  mimeType: blob.type
                }
              })
            }
          }
        } catch (error) {
          console.warn('Failed to load image:', url, error)
        }
      }

      const analysisPrompt = `${systemPrompt}

VISUAL ANALYSIS INSTRUCTIONS:

IMPORTANT: Check if this is a floor plan, architectural drawing, or technical diagram:
- If it's a FLOOR PLAN or ARCHITECTURAL DRAWING: Extract room dimensions, layout, and measurements to provide accurate quotes
- If it's a PHOTO: Analyze the actual condition and work needed

For FLOOR PLANS/ARCHITECTURAL DRAWINGS:
1. **Read all dimensions and measurements** - Use labeled measurements for accurate area calculations
2. **Identify room types and layouts** - Bathrooms, kitchens, bedrooms, etc.
3. **Count fixtures and features** - Doors, windows, built-ins, plumbing locations
4. **Calculate total area** - Use the dimensions provided on the plan
5. **Note structural elements** - Load-bearing walls, beams, columns
6. **Identify the scope** - Is this new construction, renovation, or extension?

For PHOTOS of existing spaces:
1. **What job needs doing** - What do you see that needs work?
2. **Scale and scope** - Estimate size based on visible references
3. **Access requirements** - Can large tools get there? Gates, doorways, etc.
4. **Ground conditions** - For excavation: soft/hard ground, existing structures
5. **Material types** - Concrete, brick, wood, etc. affects tool choice
6. **Safety hazards** - Overhead lines, confined spaces, structural concerns

QUOTING PRIORITY:
1. If you can read dimensions from a floor plan, use them for precise quotes
2. Break down costs by room or area as shown on the plan
3. For renovations shown in plans, quote based on the full scope visible
4. Be specific about what you can see and measure
5. If measurements are unclear, provide ranges based on typical UK room sizes

Respond as Toddy - provide detailed, accurate quotes based on what you can actually see and measure in the image.`

      const contentParts = [{ text: analysisPrompt }]
      if (imageParts.length > 0) {
        contentParts.push(...imageParts)
      }

      const result = await this.model.generateContent(contentParts)
      const response = await result.response
      return response.text()

    } catch (error) {
      console.error('Image analysis error:', error)
      return "Right then, I'm having trouble analyzing your images at the moment. Drop me the details of what you're looking to do and I'll sort you out with the proper tools for the job!"
    }
  }
}

export default GeminiService