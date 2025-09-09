export interface DIYStep {
  step: number
  action: string
  tip?: string
  warning?: string
}

export interface DIYGuide {
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeEstimate: string
  toolsNeeded: string[]
  materialsNeeded: string[]
  steps: DIYStep[]
  proTips: string[]
  commonMistakes: string[]
  safetyNotes: string[]
}

export class DIYGuidesService {
  private static instance: DIYGuidesService
  private guides: Map<string, DIYGuide>

  constructor() {
    this.guides = new Map()
    this.initializeGuides()
  }

  static getInstance(): DIYGuidesService {
    if (!DIYGuidesService.instance) {
      DIYGuidesService.instance = new DIYGuidesService()
    }
    return DIYGuidesService.instance
  }

  private initializeGuides() {
    // Shed Base
    this.guides.set('shed base', {
      title: 'How to Build a Shed Base',
      category: 'Foundations',
      difficulty: 'beginner',
      timeEstimate: '1-2 days',
      toolsNeeded: ['Spade', 'Spirit level', 'Tape measure', 'Wheelbarrow', 'Tamper/Wacker plate'],
      materialsNeeded: ['MOT Type 1 hardcore', 'Sharp sand', 'Paving slabs or concrete'],
      steps: [
        { 
          step: 1, 
          action: 'Mark out area 30cm larger than shed on all sides',
          tip: 'Use string lines and pegs for accuracy'
        },
        { 
          step: 2, 
          action: 'Excavate to 15-20cm depth',
          warning: 'Check for underground services first'
        },
        { 
          step: 3, 
          action: 'Lay and compact 10-15cm of MOT Type 1',
          tip: 'Hire a wacker plate for best results'
        },
        { 
          step: 4, 
          action: 'Add 5cm layer of sharp sand, level with spirit level'
        },
        { 
          step: 5, 
          action: 'Lay slabs or pour concrete, ensuring perfectly level',
          tip: 'Use a 2:1 fall away from shed for drainage'
        }
      ],
      proTips: [
        'Add a DPM (damp proof membrane) between hardcore and sand',
        'Consider eco-grid for a permeable, eco-friendly base',
        'Leave 24-48 hours before placing shed'
      ],
      commonMistakes: [
        'Not making base bigger than shed - causes rot',
        'Poor levelling - doors won\'t work properly',
        'No drainage consideration - water pooling'
      ],
      safetyNotes: [
        'Wear steel toe boots when handling slabs',
        'Use proper lifting technique - bend knees, not back'
      ]
    })

    // Patio Laying
    this.guides.set('lay patio', {
      title: 'How to Lay a Patio',
      category: 'Landscaping',
      difficulty: 'intermediate',
      timeEstimate: '2-3 days',
      toolsNeeded: ['Spirit level', 'Rubber mallet', 'Angle grinder', 'String line', 'Trowel', 'Pointing tool'],
      materialsNeeded: ['Paving slabs', 'MOT Type 1', 'Sharp sand', 'Cement', 'Pointing compound'],
      steps: [
        { 
          step: 1, 
          action: 'Excavate area to 15-20cm below finished level',
          tip: 'Create 1:80 fall away from house for drainage'
        },
        { 
          step: 2, 
          action: 'Install edge restraints if needed'
        },
        { 
          step: 3, 
          action: 'Lay and compact 10cm MOT Type 1 sub-base',
          warning: 'Must be well compacted or slabs will sink'
        },
        { 
          step: 4, 
          action: 'Mix mortar bed (6:1 sand:cement) or use sharp sand',
          tip: 'Full mortar bed for heavy use, spot bedding for light use'
        },
        { 
          step: 5, 
          action: 'Lay slabs starting from corner, tap down with mallet',
          tip: 'Use 10-15mm spacers for consistent gaps'
        },
        { 
          step: 6, 
          action: 'Cut edge slabs with angle grinder as needed',
          warning: 'Always wear safety glasses when cutting'
        },
        { 
          step: 7, 
          action: 'Point joints with mortar or brush in kiln-dried sand'
        }
      ],
      proTips: [
        'Hire a slab lifter for large format slabs',
        'Prime slabs if using mortar to prevent staining',
        'Consider permeable pointing for better drainage'
      ],
      commonMistakes: [
        'Inadequate fall - water pooling issues',
        'Rushing the base preparation - causes settlement',
        'Inconsistent joint widths - looks unprofessional'
      ],
      safetyNotes: [
        'Never work alone with heavy slabs',
        'Wear cut-resistant gloves when handling slabs',
        'Use dust mask when cutting or mixing cement'
      ]
    })

    // Fence Panel Installation
    this.guides.set('install fence', {
      title: 'How to Install Fence Panels',
      category: 'Boundaries',
      difficulty: 'beginner',
      timeEstimate: '1 day per 3-4 panels',
      toolsNeeded: ['Post hole digger/Spade', 'Spirit level', 'String line', 'Drill', 'Saw'],
      materialsNeeded: ['Fence posts', 'Fence panels', 'Postcrete', 'Gravel boards', 'Brackets/clips'],
      steps: [
        { 
          step: 1, 
          action: 'Mark post positions - panel width plus 5mm gap',
          tip: 'Use a string line for straight alignment'
        },
        { 
          step: 2, 
          action: 'Dig post holes 60cm deep, 30cm wide',
          tip: 'Hire a post hole auger for easier digging'
        },
        { 
          step: 3, 
          action: 'Add 10cm gravel for drainage'
        },
        { 
          step: 4, 
          action: 'Position first post, check plumb with spirit level'
        },
        { 
          step: 5, 
          action: 'Add postcrete, following packet instructions',
          warning: 'Work fast - postcrete sets in 5-10 minutes'
        },
        { 
          step: 6, 
          action: 'Attach panel to first post once set'
        },
        { 
          step: 7, 
          action: 'Position second post against panel, repeat process'
        }
      ],
      proTips: [
        'Step panels down slopes rather than angling',
        'Use concrete gravel boards to prevent rot',
        'Leave 50mm gap at bottom for maintenance'
      ],
      commonMistakes: [
        'Posts not deep enough - fence blows over',
        'Not checking levels - wonky fence line',
        'Panels touching ground - premature rotting'
      ],
      safetyNotes: [
        'Call 811 before digging to check for utilities',
        'Support panels while fixing to prevent falling'
      ]
    })

    // Decking Installation
    this.guides.set('build decking', {
      title: 'How to Build Decking',
      category: 'Garden Structures',
      difficulty: 'intermediate',
      timeEstimate: '2-3 days',
      toolsNeeded: ['Circular saw', 'Drill', 'Spirit level', 'Joist hangers', 'String line'],
      materialsNeeded: ['Decking boards', 'Joists', 'Posts', 'Concrete', 'Joist hangers', 'Decking screws'],
      steps: [
        { 
          step: 1, 
          action: 'Clear and level the area',
          tip: 'Use weed membrane to prevent growth'
        },
        { 
          step: 2, 
          action: 'Mark out post positions - max 1.8m apart'
        },
        { 
          step: 3, 
          action: 'Install posts in concrete, check level'
        },
        { 
          step: 4, 
          action: 'Attach ledger board to house if applicable',
          warning: 'Must be fixed to masonry, not render'
        },
        { 
          step: 5, 
          action: 'Install outer frame joists'
        },
        { 
          step: 6, 
          action: 'Add intermediate joists at 400mm centres',
          tip: 'Use joist hangers for stronger connections'
        },
        { 
          step: 7, 
          action: 'Fix decking boards with 5mm gaps',
          tip: 'Pre-drill to prevent splitting'
        }
      ],
      proTips: [
        'Slight slope (1:100) for drainage',
        'Use stainless steel fixings to prevent rust stains',
        'Consider composite decking for less maintenance'
      ],
      commonMistakes: [
        'Joists too far apart - bouncy deck',
        'No gaps between boards - water trapping',
        'Wrong fixings - rust and failure'
      ],
      safetyNotes: [
        'Add handrails if deck is over 60cm high',
        'Ensure proper ventilation underneath',
        'Regular maintenance prevents slips'
      ]
    })

    // Plastering a Wall
    this.guides.set('plaster wall', {
      title: 'How to Plaster a Wall',
      category: 'Interior Work',
      difficulty: 'advanced',
      timeEstimate: '1 day per room',
      toolsNeeded: ['Hawk', 'Trowel', 'Float', 'Bucket trowel', 'Mixing paddle'],
      materialsNeeded: ['Plaster', 'PVA', 'Scrim tape', 'Water'],
      steps: [
        { 
          step: 1, 
          action: 'Prepare walls - fill holes, remove loose material',
          tip: 'Apply PVA solution (1:4) to high suction backgrounds'
        },
        { 
          step: 2, 
          action: 'Apply scrim tape to joints and cracks'
        },
        { 
          step: 3, 
          action: 'Mix plaster to smooth, creamy consistency',
          warning: 'Only mix what you can use in 30 minutes'
        },
        { 
          step: 4, 
          action: 'Apply first coat bottom-up with upward strokes',
          tip: 'Aim for 2-3mm thickness'
        },
        { 
          step: 5, 
          action: 'Flatten with clean trowel once tacky'
        },
        { 
          step: 6, 
          action: 'Apply second thin coat to fill imperfections'
        },
        { 
          step: 7, 
          action: 'Polish with clean trowel and water mist when setting',
          tip: 'Timing is crucial - too early smears, too late won\'t polish'
        }
      ],
      proTips: [
        'Keep tools scrupulously clean',
        'Work in good light to spot imperfections',
        'Practice on small area or plasterboard first'
      ],
      commonMistakes: [
        'Mixing too much - waste and rushed work',
        'Overworking - causes ripples and marks',
        'Wrong consistency - too wet sags, too dry won\'t spread'
      ],
      safetyNotes: [
        'Wear eye protection when mixing',
        'Plaster is alkaline - can irritate skin',
        'Good ventilation needed while drying'
      ]
    })

    // Using Power Tools
    this.guides.set('use angle grinder', {
      title: 'How to Use an Angle Grinder Safely',
      category: 'Tool Usage',
      difficulty: 'intermediate',
      timeEstimate: 'Varies',
      toolsNeeded: ['Angle grinder', 'Appropriate disc', 'Clamps/vice'],
      materialsNeeded: ['Safety equipment'],
      steps: [
        { 
          step: 1, 
          action: 'Inspect tool and disc for damage',
          warning: 'Never use cracked or damaged discs'
        },
        { 
          step: 2, 
          action: 'Ensure disc is rated for tool\'s RPM'
        },
        { 
          step: 3, 
          action: 'Put on PPE: glasses, gloves, ear defenders',
          warning: 'Never operate without safety glasses'
        },
        { 
          step: 4, 
          action: 'Secure workpiece - never handheld',
          tip: 'Use clamps or vice for stability'
        },
        { 
          step: 5, 
          action: 'Position guard towards you'
        },
        { 
          step: 6, 
          action: 'Start tool away from work, let reach full speed'
        },
        { 
          step: 7, 
          action: 'Apply gentle pressure, let tool do the work',
          warning: 'Forcing causes kickback'
        }
      ],
      proTips: [
        'Keep both hands on tool at all times',
        'Stand to side, not behind disc',
        'Take breaks - tool and disc get very hot'
      ],
      commonMistakes: [
        'Removing guard - extremely dangerous',
        'Wrong disc for material - ineffective and dangerous',
        'Excessive pressure - causes binding and kickback'
      ],
      safetyNotes: [
        'Sparks can travel 10m - clear flammables',
        'Never put down until disc stops completely',
        'Unplug when changing discs'
      ]
    })
  }

  findGuide(query: string): DIYGuide | null {
    const queryLower = query.toLowerCase()
    
    // Direct match
    for (const [key, guide] of this.guides) {
      if (queryLower.includes(key)) {
        return guide
      }
    }

    // Check titles and categories
    for (const guide of this.guides.values()) {
      if (queryLower.includes(guide.title.toLowerCase()) ||
          queryLower.includes(guide.category.toLowerCase())) {
        return guide
      }
    }

    return null
  }

  getGuideContext(query: string): string {
    const guide = this.findGuide(query)
    
    if (!guide) {
      return ''
    }

    let context = `## HOW-TO GUIDE: ${guide.title}\n\n`
    context += `**Difficulty:** ${guide.difficulty} | **Time:** ${guide.timeEstimate}\n\n`
    
    context += `**Tools Needed:** ${guide.toolsNeeded.join(', ')}\n`
    context += `**Materials:** ${guide.materialsNeeded.join(', ')}\n\n`
    
    context += `**Steps:**\n`
    guide.steps.forEach(step => {
      context += `${step.step}. ${step.action}\n`
      if (step.tip) context += `   💡 Tip: ${step.tip}\n`
      if (step.warning) context += `   ⚠️ Warning: ${step.warning}\n`
    })
    
    context += `\n**Pro Tips:** ${guide.proTips[0]}\n`
    context += `**Common Mistake to Avoid:** ${guide.commonMistakes[0]}\n`
    context += `**Safety:** ${guide.safetyNotes[0]}\n`
    
    return context
  }

  getAllGuideTopics(): string[] {
    return Array.from(this.guides.keys())
  }
}

export const diyGuidesService = DIYGuidesService.getInstance()