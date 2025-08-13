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
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor(apiKey?: string) {
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    }
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
}

export default GeminiService