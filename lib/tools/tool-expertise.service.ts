export interface ToolExpertise {
  name: string
  category: string
  aliases: string[]
  description: string
  whenToUse: string[]
  whenNotToUse: string[]
  specifications: {
    power?: string
    weight?: string
    dimensions?: string
    capacity?: string
    features: string[]
  }
  usageInstructions: string[]
  safetyRequirements: string[]
  commonMistakes: string[]
  proTips: string[]
  alternatives: ToolAlternative[]
  buyVsRent: {
    buyThreshold: number // Number of days usage where buying becomes cheaper
    rentalCostPerDay: number
    purchaseCost: number
    recommendation: 'rent' | 'buy' | 'depends'
  }
  jobSuitability: JobSuitability[]
}

export interface ToolAlternative {
  tool: string
  reason: string
  costDifference: string
}

export interface JobSuitability {
  jobType: string
  suitabilityScore: number // 1-10
  whyBest: string
  limitations?: string
}

export class ToolExpertiseService {
  private static instance: ToolExpertiseService
  private expertiseDatabase: Map<string, ToolExpertise>

  constructor() {
    this.expertiseDatabase = new Map()
    this.initializeToolDatabase()
  }

  static getInstance(): ToolExpertiseService {
    if (!ToolExpertiseService.instance) {
      ToolExpertiseService.instance = new ToolExpertiseService()
    }
    return ToolExpertiseService.instance
  }

  private initializeToolDatabase() {
    // Mini Excavator Expertise
    this.expertiseDatabase.set('mini-excavator', {
      name: 'Mini Excavator (1.5-2.5T)',
      category: 'Excavation',
      aliases: ['micro digger', 'small excavator', 'compact excavator', 'mini digger'],
      description: 'Compact tracked excavator ideal for residential and small commercial projects',
      whenToUse: [
        'Digging foundations under 1.5m deep',
        'Trenching for utilities (drainage, cables)',
        'Landscaping - ponds, patios, driveways',
        'Tight access sites (through 2m+ gates)',
        'Precise excavation around existing structures'
      ],
      whenNotToUse: [
        'Deep foundations over 2m',
        'Rocky ground without hydraulic breaker',
        'Areas with overhead restrictions under 3m',
        'Soft ground without tracks mats'
      ],
      specifications: {
        weight: '1.5-2.5 tonnes',
        dimensions: '990mm-1200mm width (fits standard gates)',
        capacity: '0.1-0.15m³ bucket',
        features: [
          'Zero tail swing option available',
          'Hydraulic quick-hitch for attachments',
          'Cab or canopy models',
          'Rubber tracks (concrete safe)'
        ]
      },
      usageInstructions: [
        'Walk around site first - check for services (use CAT scanner)',
        'Set up exclusion zone - 5m radius minimum',
        'Check ground conditions and use track mats on soft surfaces',
        'Start shallow, work systematically in 500mm lifts',
        'Keep bucket teeth sharp for efficient digging',
        'Never exceed safe slope angles (1:1.5 for typical soil)',
        'Use thumb attachment for precise material handling'
      ],
      safetyRequirements: [
        'CPCS/NPORS ticket required for commercial sites',
        'Hi-vis, hard hat, steel toe boots mandatory',
        'Underground service detection essential',
        'Exclusion zone barriers required',
        'Ground conditions assessment',
        'Daily machine inspection checklist'
      ],
      commonMistakes: [
        'Digging without service detection (£5000+ for severed cable)',
        'Working too close to buildings without checking foundations',
        'Ignoring ground conditions - getting stuck costs £200+ recovery',
        'Not using track mats on lawns/block paving',
        'Exceeding safe working slopes'
      ],
      proTips: [
        'Book Friday pickup for weekend rate (often 30% saving)',
        'Hire rubber pads separately for £15/day to protect surfaces',
        'Get hydraulic breaker attachment for hard ground (+£80/day)',
        'Use tilt bucket attachment for precise grading (+£50/day)',
        'Hire CAT scanner separately - essential for utilities (£40/day)'
      ],
      alternatives: [
        { tool: 'Hand digging', reason: 'Very small jobs under 2m³', costDifference: 'Free but 10x slower' },
        { tool: '3T+ Excavator', reason: 'Large/deep excavations', costDifference: '+£60-100/day' },
        { tool: 'Trenching shovel', reason: 'Narrow utility trenches', costDifference: '£40/day vs £100/day' }
      ],
      buyVsRent: {
        buyThreshold: 80, // 80 days usage
        rentalCostPerDay: 120,
        purchaseCost: 12000,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Garden pond excavation', suitabilityScore: 10, whyBest: 'Perfect size for residential access, precise control' },
        { jobType: 'Utility trench digging', suitabilityScore: 9, whyBest: 'Narrow bucket ideal for trenches, good reach' },
        { jobType: 'Small foundation', suitabilityScore: 8, whyBest: 'Good for depths up to 1.5m, precise corners' },
        { jobType: 'Tree stump removal', suitabilityScore: 6, whyBest: 'Can excavate around stumps', limitations: 'May need stump grinder for large stumps' },
        { jobType: 'Large basement excavation', suitabilityScore: 3, whyBest: 'Too small for major excavations', limitations: 'Need 5T+ excavator' }
      ]
    })

    // Concrete Mixer Expertise  
    this.expertiseDatabase.set('concrete-mixer', {
      name: 'Concrete Mixer (110L-150L)',
      category: 'Concrete',
      aliases: ['cement mixer', 'belle mixer', 'concrete drum'],
      description: 'Portable concrete mixer for small to medium concrete pours',
      whenToUse: [
        'Concrete pours up to 2m³ per day',
        'Footings, small pads, fence posts',
        'Repair work and patching',
        'Areas without concrete lorry access',
        'Multiple small pours over time'
      ],
      whenNotToUse: [
        'Large pours over 5m³ (order ready-mix)',
        'Time-critical structural concrete',
        'Sites with good lorry access for large pours',
        'High-specification concrete (use batching plant)'
      ],
      specifications: {
        capacity: '110L (yields ~80L mixed concrete)',
        power: 'Electric (240v) or Petrol',
        weight: '65-85kg',
        features: [
          'Tip-up design for easy cleaning',
          'Pneumatic wheels for site mobility',
          'Honda/Briggs engines on petrol models',
          'Emergency stop switches'
        ]
      },
      usageInstructions: [
        'Set up on level ground away from power lines',
        'Add aggregate first, then sand, then cement',
        'Add water gradually while mixing (start with 80% of estimated)',
        'Mix for 2-3 minutes after last water addition',
        'Pour immediately - concrete starts setting in 20 minutes',
        'Clean thoroughly immediately after use',
        'Never leave concrete in drum overnight'
      ],
      safetyRequirements: [
        'Keep hands clear of rotating drum',
        'Ensure stable setup before starting',
        'Wear gloves - concrete is alkaline and burns skin',
        'Eye protection when adding dry materials',
        'Ensure electrical safety with 110v transformer if possible'
      ],
      commonMistakes: [
        'Adding too much water (weakens concrete significantly)',
        'Not cleaning mixer properly (concrete sets like rock)',
        'Poor material ratios (use 1:2:3 mix as baseline)',
        'Trying to mix too much at once (reduces quality)',
        'Not having enough helping hands for continuous pour'
      ],
      proTips: [
        'Hire the 150L for £5/day more - worth it for larger batches',
        'Add washing up liquid (1 cap) for easier cleaning',
        'Pre-wet the drum to prevent sticking',
        'Bag your aggregate in advance for consistent mixes',
        'Hire a wheelbarrow too (£10/day) for transport to pour site',
        'Book electric model if power available - quieter and more reliable'
      ],
      alternatives: [
        { tool: 'Ready-mix concrete', reason: 'Pours over 2m³', costDifference: '£120/m³ delivered vs £100/m³ mixed' },
        { tool: 'Hand mixing', reason: 'Very small repairs', costDifference: 'Free but exhausting over 0.5m³' },
        { tool: 'Larger mixer (200L+)', reason: 'Commercial work', costDifference: '+£20-40/day' }
      ],
      buyVsRent: {
        buyThreshold: 25,
        rentalCostPerDay: 25,
        purchaseCost: 650,
        recommendation: 'depends'
      },
      jobSuitability: [
        { jobType: 'Garden path concrete', suitabilityScore: 10, whyBest: 'Perfect size for residential pours' },
        { jobType: 'Fence post setting', suitabilityScore: 9, whyBest: 'Ideal for multiple small pours' },
        { jobType: 'Small foundation pad', suitabilityScore: 8, whyBest: 'Good for footings under 1m³' },
        { jobType: 'Large driveway', suitabilityScore: 4, whyBest: 'Too slow for large areas', limitations: 'Consider ready-mix over 5m³' }
      ]
    })

    // Scaffold Tower Expertise
    this.expertiseDatabase.set('scaffold-tower', {
      name: 'Mobile Scaffold Tower',
      category: 'Access',
      aliases: ['mobile tower', 'scaffold', 'tower scaffold', 'mobile scaffold'],
      description: 'Portable tower scaffold for safe working at height',
      whenToUse: [
        'External painting/guttering work',
        'Roof repairs and maintenance',
        'Window installation above ground floor',
        'External wall repairs/repointing',
        'Installing security cameras/lights'
      ],
      whenNotToUse: [
        'Work requiring horizontal movement (use fixed scaffold)',
        'Very windy conditions (over 17mph)',
        'Uneven or soft ground',
        'Work requiring heavy materials lifted up'
      ],
      specifications: {
        dimensions: '1.45m x 0.85m platform (single width)',
        weight: '45-65kg total',
        features: [
          'Adjustable stabilizers',
          'Integrated ladder access',
          'Guardrails on all sides',
          'Lockable castors'
        ]
      },
      usageInstructions: [
        'Check ground is level and firm before setup',
        'Build from bottom up, checking square at each level',
        'Always maintain 3:1 height to base ratio for stability',
        'Lock all castors before climbing',
        'Never exceed safe working load (150kg typically)',
        'Move tower only from base level - never when occupied',
        'Tie to building every 4m height if possible'
      ],
      safetyRequirements: [
        'Working at Height Regulations 2005 compliance',
        'Maximum 2 people on platform simultaneously',
        'No work in winds over 17mph',
        'Hard hat, safety harness above 2m',
        'Daily inspection checklist',
        'Competent person to erect/inspect'
      ],
      commonMistakes: [
        'Not checking ground conditions (tower tips over)',
        'Moving tower with person on it (major injury risk)',
        'Exceeding weight limits with materials',
        'Working in unsuitable weather',
        'Poor base setup causing instability'
      ],
      proTips: [
        'Hire the Euro Tower - one person can build it (saves labor)',
        'Book tower boards separately for material storage (£3/day)',
        'Get 6.2m height for two-story houses (worth the extra £30/day)',
        'Check local planning - no permit needed for residential under 8 weeks',
        'Hire stabilizer outriggers for soft ground (+£10/day)'
      ],
      alternatives: [
        { tool: 'Extension ladder', reason: 'Quick access jobs', costDifference: '£15/day vs £70/day' },
        { tool: 'Fixed scaffold', reason: 'Large areas/long projects', costDifference: '£8-12/m² erected' },
        { tool: 'Cherry picker', reason: 'High/complex access', costDifference: '£160/day vs £70/day' }
      ],
      buyVsRent: {
        buyThreshold: 45,
        rentalCostPerDay: 70,
        purchaseCost: 2800,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'House painting exterior', suitabilityScore: 10, whyBest: 'Perfect height for most houses, mobile for all sides' },
        { jobType: 'Gutter cleaning/repair', suitabilityScore: 9, whyBest: 'Safe platform at right height' },
        { jobType: 'Window installation', suitabilityScore: 8, whyBest: 'Stable platform for precise work' },
        { jobType: 'Roof repair', suitabilityScore: 7, whyBest: 'Good for edge work', limitations: 'May need roof ladders for center' },
        { jobType: 'Chimney work', suitabilityScore: 4, whyBest: 'May reach lower chimneys', limitations: 'Often need cherry picker for height' }
      ]
    })

    // Angle Grinder Expertise
    this.expertiseDatabase.set('angle-grinder', {
      name: 'Angle Grinder (115mm/125mm)',
      category: 'Cutting',
      aliases: ['grinder', 'disc grinder', '4.5 inch grinder'],
      description: 'Versatile handheld tool for cutting, grinding, and polishing',
      whenToUse: [
        'Cutting metal bars, pipes, brackets',
        'Removing rust and paint from metal',
        'Cutting roof tiles, paving slabs',
        'Grinding welds smooth',
        'Cutting through bolts and fixings'
      ],
      whenNotToUse: [
        'Precision cuts requiring straight lines',
        'Working on live electrical circuits',
        'Cutting pressure-treated timber (use saw)',
        'Indoor work without dust extraction'
      ],
      specifications: {
        power: '750W-2000W',
        weight: '1.8-2.5kg',
        dimensions: '115mm or 125mm disc diameter',
        features: [
          'Variable speed control',
          'Quick-change disc system',
          'Side handle for two-handed control',
          'Spindle lock for easy disc changes'
        ]
      },
      usageInstructions: [
        'Always let disc reach full speed before contact',
        'Use gentle pressure - let the disc do the work',
        'Move grinder away from body when cutting',
        'Never remove guard or use damaged discs',
        'Allow disc to stop completely before setting down',
        'Replace worn discs immediately'
      ],
      safetyRequirements: [
        'Safety glasses/face shield essential',
        'Hearing protection (over 85dB noise)',
        'Dust mask for masonry cutting',
        'Leather gloves for grip (not fabric)',
        'Secure workpiece before cutting',
        'Check disc rating exceeds grinder RPM'
      ],
      commonMistakes: [
        'Using wrong disc type (cutting disc for grinding)',
        'Applying too much pressure (causes disc breakage)',
        'Not securing work properly',
        'Working without proper PPE',
        'Using damaged or worn discs'
      ],
      proTips: [
        'Buy discs in bulk - £1.50 each vs £3 individually',
        'Metal cutting discs are thin, grinding discs are thick',
        'Use diamond discs for masonry (last 10x longer)',
        'Keep spare disc on site - they break when you need them',
        'Corded models more reliable than cordless for heavy work'
      ],
      alternatives: [
        { tool: 'Reciprocating saw', reason: 'Thicker metal cutting', costDifference: '£40/day vs £35/day' },
        { tool: 'Circular saw', reason: 'Straight cuts in wood/metal', costDifference: '£30/day vs £35/day' },
        { tool: 'Hacksaw', reason: 'Precision small cuts', costDifference: '£5 to buy vs £35/day hire' }
      ],
      buyVsRent: {
        buyThreshold: 8,
        rentalCostPerDay: 35,
        purchaseCost: 120,
        recommendation: 'buy'
      },
      jobSuitability: [
        { jobType: 'Metal fabrication', suitabilityScore: 10, whyBest: 'Essential for all metal cutting and prep work' },
        { jobType: 'Paving stone cutting', suitabilityScore: 9, whyBest: 'Diamond disc cuts stone cleanly' },
        { jobType: 'Bolt removal', suitabilityScore: 9, whyBest: 'Fastest way to cut through seized bolts' },
        { jobType: 'Paint removal', suitabilityScore: 7, whyBest: 'Wire brush attachment removes paint', limitations: 'Very messy, consider chemical stripping' }
      ]
    })

    // Circular Saw Expertise
    this.expertiseDatabase.set('circular-saw', {
      name: 'Circular Saw (190mm)',
      category: 'Cutting',
      aliases: ['skill saw', 'buzzer', 'disc saw'],
      description: 'Portable power saw for straight cuts in timber and sheet materials',
      whenToUse: [
        'Cutting timber to length (2x4, 2x8, etc.)',
        'Breaking down sheet materials (plywood, OSB)',
        'Creating straight cuts in decking boards',
        'Cutting roof rafters and floor joists',
        'Trim work and finish carpentry'
      ],
      whenNotToUse: [
        'Curved cuts (use jigsaw)',
        'Very thick timbers over 65mm',
        'Precision furniture work',
        'Cutting near your body or unsecured material'
      ],
      specifications: {
        power: '1200W-1800W',
        capacity: '65mm cutting depth at 90°',
        weight: '3.5-5kg',
        features: [
          'Adjustable cutting depth',
          'Bevel adjustment 0-45°',
          'Rip fence for parallel cuts',
          'Laser guide on premium models'
        ]
      },
      usageInstructions: [
        'Mark cut line clearly with pencil and square',
        'Set cutting depth 3-5mm below material thickness',
        'Support both sides of cut to prevent binding',
        'Start cut with shoe flat on material',
        'Push forward steadily - don\'t force',
        'Let blade stop completely before lifting'
      ],
      safetyRequirements: [
        'Safety glasses mandatory',
        'Dust mask for cutting treated lumber',
        'Clamp or secure workpiece',
        'Check for nails/screws before cutting',
        'Never remove blade guard',
        'Unplug when changing blades'
      ],
      commonMistakes: [
        'Cutting without proper support (binding/kickback)',
        'Using dull blade (burns material, unsafe)',
        'Removing blade guard for "better visibility"',
        'Cutting above shoulder height',
        'Not checking for hidden fixings'
      ],
      proTips: [
        'Sharp blade = clean cut and safer operation',
        'Wax the shoe for smoother cuts',
        'Cut from waste side of line for accuracy',
        'Use guide rail for long straight cuts (hire £25/day)',
        'Buy quality carbide blade - lasts 10x longer'
      ],
      alternatives: [
        { tool: 'Hand saw', reason: 'Very small jobs', costDifference: '£15 to buy vs £30/day' },
        { tool: 'Mitre saw', reason: 'Precision crosscuts', costDifference: '£45/day vs £30/day' },
        { tool: 'Track saw', reason: 'Sheet goods', costDifference: '£65/day vs £30/day' }
      ],
      buyVsRent: {
        buyThreshold: 5,
        rentalCostPerDay: 30,
        purchaseCost: 180,
        recommendation: 'buy'
      },
      jobSuitability: [
        { jobType: 'Decking construction', suitabilityScore: 10, whyBest: 'Perfect for cutting deck boards to length' },
        { jobType: 'Framing work', suitabilityScore: 10, whyBest: 'Standard tool for cutting dimensional lumber' },
        { jobType: 'Sheet material breakdown', suitabilityScore: 8, whyBest: 'Good for initial sizing', limitations: 'Track saw better for precision' },
        { jobType: 'Furniture making', suitabilityScore: 4, whyBest: 'Too rough for fine work', limitations: 'Use mitre saw or hand tools' }
      ]
    })

    // Pressure Washer Expertise
    this.expertiseDatabase.set('pressure-washer', {
      name: 'Pressure Washer (140-200 bar)',
      category: 'Cleaning',
      aliases: ['power washer', 'jet wash', 'high pressure cleaner'],
      description: 'High-pressure water cleaning for external surfaces',
      whenToUse: [
        'Cleaning driveways, patios, paths',
        'Removing moss and algae from decking',
        'Preparing surfaces for painting/sealing',
        'Cleaning vehicles, machinery, equipment',
        'Removing graffiti and stubborn stains'
      ],
      whenNotToUse: [
        'Delicate surfaces (renders, old pointing)',
        'Windows (use lower pressure setting)',
        'Painted surfaces you want to keep',
        'Near electrical equipment'
      ],
      specifications: {
        power: '1400W-2200W electric / Petrol engine',
        capacity: '140-200 bar pressure, 400-500 L/hour',
        features: [
          'Variable pressure control',
          'Detergent tank/injection',
          'Multiple nozzle attachments',
          'Auto-stop trigger gun'
        ]
      },
      usageInstructions: [
        'Start with lowest pressure and increase gradually',
        'Hold nozzle 30cm from surface initially',
        'Work in overlapping strokes',
        'Test pressure on hidden area first',
        'Use detergent for stubborn stains',
        'Rinse thoroughly after detergent use'
      ],
      safetyRequirements: [
        'Never point at people, animals, or plants',
        'Wear safety glasses and closed shoes',
        'Use ground fault protection (RCD)',
        'Keep electric connections dry',
        'Be aware of spray direction and wind'
      ],
      commonMistakes: [
        'Using too high pressure initially (surface damage)',
        'Not testing on hidden area first',
        'Forgetting to disconnect power when changing nozzles',
        'Spraying electrical fixtures',
        'Not using detergent for oily stains'
      ],
      proTips: [
        'Hire petrol model for areas without power (£20/day extra)',
        'Hot water models work 60% faster (£80/day)',
        'Use rotating nozzle for stubborn moss (£5/day extra)',
        'Pre-treat oil stains with degreaser',
        'Work on overcast days - hot sun dries detergent too fast'
      ],
      alternatives: [
        { tool: 'Garden hose and brush', reason: 'Light cleaning', costDifference: 'Free vs £50/day' },
        { tool: 'Steam cleaner', reason: 'Indoor surfaces', costDifference: '£40/day vs £50/day' },
        { tool: 'Chemical cleaning', reason: 'Delicate surfaces', costDifference: '£20-50 materials' }
      ],
      buyVsRent: {
        buyThreshold: 15,
        rentalCostPerDay: 50,
        purchaseCost: 450,
        recommendation: 'depends'
      },
      jobSuitability: [
        { jobType: 'Driveway cleaning', suitabilityScore: 10, whyBest: 'Perfect pressure for concrete cleaning' },
        { jobType: 'Deck preparation', suitabilityScore: 9, whyBest: 'Removes algae and prepares for staining' },
        { jobType: 'Vehicle washing', suitabilityScore: 8, whyBest: 'Efficient cleaning', limitations: 'Use car wash setting' },
        { jobType: 'Window cleaning', suitabilityScore: 3, whyBest: 'Too powerful', limitations: 'Use squeegee and ladder' }
      ]
    })

    // Compaction Plate Expertise
    this.expertiseDatabase.set('compaction-plate', {
      name: 'Compaction Plate (90-150kg)',
      category: 'Ground Preparation',
      aliases: ['wacker plate', 'vibrating plate', 'plate compactor'],
      description: 'Vibrating plate for soil and aggregate compaction',
      whenToUse: [
        'Compacting sub-base for driveways',
        'Preparing ground for patio laying',
        'Backfilling trenches properly',
        'Compacting hardcore before concrete',
        'Pathway and driveway foundation prep'
      ],
      whenNotToUse: [
        'Cohesive clay soils (use roller instead)',
        'Areas with services 300mm below surface',
        'Confined spaces under 1.5m width',
        'Wet or waterlogged ground'
      ],
      specifications: {
        weight: '90-150kg operating weight',
        power: 'Honda/Robin petrol engine',
        capacity: 'Compacts to 300-450mm depth',
        features: [
          'Water tank for asphalt work',
          'Centrifugal clutch',
          'Fold-down transport wheels',
          'Anti-vibration handle'
        ]
      },
      usageInstructions: [
        'Compact in thin layers (150-200mm max)',
        'Overlap passes by 100mm',
        'Work systematically across entire area',
        'Make 2-3 passes for proper compaction',
        'Add water for dusty conditions',
        'Check oil level before each use'
      ],
      safetyRequirements: [
        'Hearing protection essential (100dB+ noise)',
        'Steel toe boots required',
        'Keep feet clear of plate edges',
        'Never operate on slopes over 20°',
        'Check for underground services first'
      ],
      commonMistakes: [
        'Trying to compact too thick layers',
        'Working on wet material (poor compaction)',
        'Not making enough passes',
        'Operating too close to foundations',
        'Forgetting fuel/oil checks'
      ],
      proTips: [
        'Hire the 150kg model - only £5/day more, much better compaction',
        'Use on slightly damp material for best results',
        'Mark utility lines before compacting',
        'Hire with water tank if doing asphalt work',
        'Book early for summer paving season'
      ],
      alternatives: [
        { tool: 'Hand tamper', reason: 'Very small areas', costDifference: '£15/day vs £40/day' },
        { tool: 'Roller compactor', reason: 'Large areas/clay soil', costDifference: '£80/day vs £40/day' },
        { tool: 'Jumping jack compactor', reason: 'Trench compaction', costDifference: '£55/day vs £40/day' }
      ],
      buyVsRent: {
        buyThreshold: 35,
        rentalCostPerDay: 40,
        purchaseCost: 1800,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Driveway base preparation', suitabilityScore: 10, whyBest: 'Essential for proper MOT Type 1 compaction' },
        { jobType: 'Patio foundation', suitabilityScore: 9, whyBest: 'Perfect for sand and hardcore compaction' },
        { jobType: 'Trench backfill', suitabilityScore: 8, whyBest: 'Good compaction in layers' },
        { jobType: 'Lawn leveling', suitabilityScore: 3, whyBest: 'Too aggressive for topsoil', limitations: 'Use garden roller instead' }
      ]
    })

    // Generator Expertise
    this.expertiseDatabase.set('generator', {
      name: 'Portable Generator (2-5kVA)',
      category: 'Power',
      aliases: ['genny', 'portable power', 'backup generator'],
      description: 'Portable petrol generator for temporary power supply',
      whenToUse: [
        'Sites without mains electricity',
        'Power outages during critical work',
        'Running 110v tools safely',
        'Outdoor events and temporary lighting',
        'Emergency backup power'
      ],
      whenNotToUse: [
        'Indoors or enclosed spaces (carbon monoxide)',
        'Wet conditions without weatherproof housing',
        'Powering sensitive electronics without inverter',
        'When mains power is readily available'
      ],
      specifications: {
        power: '2-5kVA output',
        capacity: '4-20 hour runtime (depends on load)',
        features: [
          'Multiple 240v outlets',
          '110v outlets for tools',
          'USB charging ports',
          'Fuel gauge and hour meter'
        ]
      },
      usageInstructions: [
        'Set up on firm, level ground outdoors',
        'Check oil level before starting',
        'Start unloaded, then connect equipment',
        'Don\'t exceed rated capacity (check watts)',
        'Shut down before refueling',
        'Ground properly if required'
      ],
      safetyRequirements: [
        'NEVER use indoors or in enclosed spaces',
        'Position 6m+ from buildings (carbon monoxide)',
        'Use in well-ventilated area only',
        'Ground fault protection for all outlets',
        'Keep dry - use weatherproof cover if needed'
      ],
      commonMistakes: [
        'Running indoors (deadly carbon monoxide)',
        'Overloading capacity (damages generator)',
        'Not checking oil (engine seizure)',
        'Refueling while running (fire risk)',
        'Using extension cords too long/thin'
      ],
      proTips: [
        'Calculate total watts needed before hiring',
        '110v tools are safer on site - hire 110v version',
        'Petrol stores 6 months with stabilizer',
        'Hire wheeled version for site mobility',
        'Book quiet model for residential areas (+£20/day)'
      ],
      alternatives: [
        { tool: '110v transformer', reason: 'If mains power available', costDifference: '£10/day vs £50/day' },
        { tool: 'Battery power pack', reason: 'Light tools only', costDifference: '£30/day vs £50/day' },
        { tool: 'Mains extension', reason: 'If power source within 100m', costDifference: '£15/day vs £50/day' }
      ],
      buyVsRent: {
        buyThreshold: 25,
        rentalCostPerDay: 50,
        purchaseCost: 1200,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Remote site work', suitabilityScore: 10, whyBest: 'Essential for sites without power' },
        { jobType: 'Emergency power backup', suitabilityScore: 9, whyBest: 'Reliable temporary power source' },
        { jobType: 'Outdoor events', suitabilityScore: 8, whyBest: 'Powers lighting and equipment' },
        { jobType: 'Indoor renovation', suitabilityScore: 2, whyBest: 'Cannot be used indoors', limitations: 'Use 110v transformer from mains' }
      ]
    })

    // PLANT MACHINERY - Telehandler
    this.expertiseDatabase.set('telehandler', {
      name: 'Telehandler (6-9m reach)',
      category: 'Plant Machinery',
      aliases: ['teleporter', 'loadall', 'telescopic handler', 'manitou'],
      description: 'Versatile lifting machine with telescopic boom for material handling',
      whenToUse: [
        'Lifting materials to height (roof trusses, blocks)',
        'Loading/unloading delivery vehicles',
        'Placing heavy items precisely',
        'Reaching over obstacles',
        'Site material movement and stacking'
      ],
      whenNotToUse: [
        'Personnel lifting without proper basket',
        'Exceeding load charts',
        'Soft/uneven ground without stabilizers',
        'Indoor work in confined spaces'
      ],
      specifications: {
        capacity: '2.5-4 tonnes lift capacity',
        dimensions: '6-9m reach height, 3-4m forward reach',
        features: [
          'All-terrain tires',
          'Stabilizers for extra reach',
          'Quick-attach forks/buckets',
          'Load moment indicator'
        ]
      },
      usageInstructions: [
        'Check load chart for weight at reach distance',
        'Deploy stabilizers when required',
        'Use tag lines for load control',
        'Never travel with raised load',
        'Check overhead clearances',
        'Use banksman for blind spots'
      ],
      safetyRequirements: [
        'CPCS/NPORS telehandler ticket required',
        'Daily inspection checklist',
        'Load chart must be visible',
        'Never exceed rated capacity',
        'Seatbelt must be worn',
        'Exclusion zone around operation'
      ],
      commonMistakes: [
        'Ignoring load charts (causes tipping)',
        'Traveling with boom extended',
        'Not using stabilizers when needed',
        'Poor load security',
        'Operating on slopes beyond capability'
      ],
      proTips: [
        'Hire rotating telehandler for versatility (+£40/day)',
        'Book with pallet forks AND bucket',
        'Get familiarization even with ticket',
        'Compact models available for tight sites',
        'Consider rough terrain forklift for flat sites (cheaper)'
      ],
      alternatives: [
        { tool: 'Crane lorry', reason: 'One-off lifts', costDifference: '£400/day vs £180/day' },
        { tool: 'Forklift', reason: 'Flat surfaces only', costDifference: '£80/day vs £180/day' },
        { tool: 'Manual handling', reason: 'Light materials', costDifference: 'Free but slow' }
      ],
      buyVsRent: {
        buyThreshold: 200,
        rentalCostPerDay: 180,
        purchaseCost: 45000,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Steel frame erection', suitabilityScore: 10, whyBest: 'Perfect for positioning steel beams' },
        { jobType: 'Roofing materials', suitabilityScore: 9, whyBest: 'Lifts pallets of tiles to roof level' },
        { jobType: 'Block/brick delivery', suitabilityScore: 9, whyBest: 'Moves pallets around site efficiently' },
        { jobType: 'Tree surgery', suitabilityScore: 3, whyBest: 'Wrong tool', limitations: 'Use cherry picker for access' }
      ]
    })

    // SMALL TOOLS - SDS Drill
    this.expertiseDatabase.set('sds-drill', {
      name: 'SDS Plus Drill',
      category: 'Small Tools',
      aliases: ['hammer drill', 'rotary hammer', 'sds', 'hilti drill'],
      description: 'Powerful drill for masonry with hammer action',
      whenToUse: [
        'Drilling concrete, brick, stone',
        'Installing rawl bolts and anchors',
        'Chasing walls for cables',
        'Light breaking/chiseling',
        'Core drilling with adapters'
      ],
      whenNotToUse: [
        'Precision woodwork (use standard drill)',
        'Very large holes over 30mm',
        'Heavy demolition (use breaker)',
        'Drilling metal (hammer action damages)'
      ],
      specifications: {
        power: '650W-1000W',
        capacity: '4-26mm in concrete',
        weight: '2.5-3.5kg',
        features: [
          'Rotation stop for chiseling',
          'Variable speed control',
          'Depth stop rod',
          'Anti-vibration technology'
        ]
      },
      usageInstructions: [
        'Mark hole position with center punch',
        'Start slowly to establish hole',
        'Use steady pressure, don\'t force',
        'Clear dust regularly (withdraw bit)',
        'Use correct bit type for material',
        'Cool bit in water for continuous drilling'
      ],
      safetyRequirements: [
        'Safety glasses essential',
        'Dust mask for masonry work',
        'Check for cables/pipes before drilling',
        'Secure loose clothing',
        'Use auxiliary handle for control'
      ],
      commonMistakes: [
        'Using blunt bits (overheats drill)',
        'Wrong bit for material',
        'Not checking for services',
        'Forcing when hitting rebar',
        'No dust extraction indoors'
      ],
      proTips: [
        'Buy quality bits - cheap ones wear fast',
        'Use pilot hole for large diameters',
        'Vacuum attachment worth the £15/day',
        'Cordless models great for height work',
        'Keep spare bits - they break on rebar'
      ],
      alternatives: [
        { tool: 'Standard drill', reason: 'Wood and light masonry', costDifference: '£20/day vs £35/day' },
        { tool: 'Diamond core drill', reason: 'Large precise holes', costDifference: '£80/day vs £35/day' },
        { tool: 'Star drill and hammer', reason: 'One or two holes', costDifference: '£5 to buy vs £35/day' }
      ],
      buyVsRent: {
        buyThreshold: 7,
        rentalCostPerDay: 35,
        purchaseCost: 250,
        recommendation: 'buy'
      },
      jobSuitability: [
        { jobType: 'Fixing to masonry', suitabilityScore: 10, whyBest: 'Designed specifically for masonry drilling' },
        { jobType: 'Cable/pipe installation', suitabilityScore: 9, whyBest: 'Chisel function for channeling' },
        { jobType: 'Anchor bolt installation', suitabilityScore: 10, whyBest: 'Precise holes for expanding anchors' },
        { jobType: 'Woodworking', suitabilityScore: 2, whyBest: 'Too aggressive', limitations: 'Use standard drill' }
      ]
    })

    // ACCESS EQUIPMENT - Scissor Lift
    this.expertiseDatabase.set('scissor-lift', {
      name: 'Scissor Lift (20-26ft)',
      category: 'Access Equipment',
      aliases: ['scissor platform', 'vertical lift', 'cherry picker'],
      description: 'Self-propelled platform for working at height',
      whenToUse: [
        'Internal high-level work',
        'Ceiling installations',
        'Warehouse racking access',
        'Electrical/mechanical installations',
        'Painting and decorating at height'
      ],
      whenNotToUse: [
        'Uneven or sloping ground',
        'Reaching over obstacles',
        'Outdoor use in wind over 28mph',
        'Confined spaces with limited access'
      ],
      specifications: {
        capacity: '230-450kg platform load',
        dimensions: '20-26ft working height',
        features: [
          'Electric or diesel power',
          'Extendable platform',
          'Non-marking tires',
          'Pothole protection'
        ]
      },
      usageInstructions: [
        'Check ground capacity (2-3 tonnes weight)',
        'Deploy outriggers if fitted',
        'Check overhead hazards before raising',
        'Use harness and lanyard',
        'Lower for any movement',
        'Follow safe working load'
      ],
      safetyRequirements: [
        'IPAF license required for operation',
        'Harness mandatory',
        'Ground assessment essential',
        'Emergency lowering training',
        'Rescue plan in place',
        'No climbing on guardrails'
      ],
      commonMistakes: [
        'Moving while elevated',
        'Overloading platform',
        'Not checking ground conditions',
        'Ignoring overhead power lines',
        'Using as a crane'
      ],
      proTips: [
        'Electric models for indoor use (quieter)',
        'Narrow models available for aisles',
        'Book delivery/collection (£50 each way)',
        'Check door widths before ordering',
        'Rough terrain models for outdoor (+£40/day)'
      ],
      alternatives: [
        { tool: 'Scaffold tower', reason: 'Longer duration work', costDifference: '£70/day vs £120/day' },
        { tool: 'Boom lift', reason: 'Reaching over obstacles', costDifference: '£180/day vs £120/day' },
        { tool: 'Podium steps', reason: 'Lower heights', costDifference: '£30/day vs £120/day' }
      ],
      buyVsRent: {
        buyThreshold: 150,
        rentalCostPerDay: 120,
        purchaseCost: 18000,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Warehouse lighting', suitabilityScore: 10, whyBest: 'Large platform for materials and tools' },
        { jobType: 'Ceiling installation', suitabilityScore: 10, whyBest: 'Stable platform at height' },
        { jobType: 'External cladding', suitabilityScore: 6, whyBest: 'Works but boom lift better for reach' },
        { jobType: 'Tree work', suitabilityScore: 2, whyBest: 'Cannot reach over/around', limitations: 'Use boom lift' }
      ]
    })

    // SMALL TOOLS - Multi-Tool
    this.expertiseDatabase.set('multi-tool', {
      name: 'Oscillating Multi-Tool',
      category: 'Small Tools',
      aliases: ['multi-cutter', 'oscillating tool', 'fein tool'],
      description: 'Versatile tool for cutting, sanding, scraping in tight spaces',
      whenToUse: [
        'Flush cutting door frames',
        'Removing grout and adhesive',
        'Cutting pipes in walls',
        'Detail sanding corners',
        'Scraping paint/adhesive'
      ],
      whenNotToUse: [
        'Large cutting jobs (use appropriate saw)',
        'Heavy demolition work',
        'Precision straight cuts',
        'Large area sanding'
      ],
      specifications: {
        power: '250-350W',
        features: [
          'Variable speed control',
          'Quick blade change',
          'LED work light',
          'Dust extraction port'
        ]
      },
      usageInstructions: [
        'Let the tool do the work - don\'t force',
        'Start with lower speed setting',
        'Use correct blade for material',
        'Keep blades sharp for safety',
        'Support work piece properly',
        'Clear debris frequently'
      ],
      safetyRequirements: [
        'Eye protection required',
        'Dust mask for sanding',
        'Check for hidden pipes/cables',
        'Keep hands behind blade',
        'Secure work area'
      ],
      commonMistakes: [
        'Using wrong blade type',
        'Applying too much pressure',
        'Not supporting material',
        'Ignoring blade wear',
        'Working at wrong speed'
      ],
      proTips: [
        'Buy blade variety pack (£30) - cheaper than individual',
        'Carbide blades last 10x longer on hard materials',
        'Mark cut line with tape for visibility',
        'Use as grout removal tool (saves hours)',
        'Cordless models worth extra £10/day'
      ],
      alternatives: [
        { tool: 'Reciprocating saw', reason: 'Rougher cuts', costDifference: '£30/day vs £25/day' },
        { tool: 'Angle grinder', reason: 'Metal cutting', costDifference: '£35/day vs £25/day' },
        { tool: 'Hand tools', reason: 'Small jobs', costDifference: 'Manual labor vs £25/day' }
      ],
      buyVsRent: {
        buyThreshold: 6,
        rentalCostPerDay: 25,
        purchaseCost: 150,
        recommendation: 'buy'
      },
      jobSuitability: [
        { jobType: 'Door frame trimming', suitabilityScore: 10, whyBest: 'Flush cuts impossible with other tools' },
        { jobType: 'Grout removal', suitabilityScore: 10, whyBest: 'Precise control in tight spaces' },
        { jobType: 'Pipe cutting in walls', suitabilityScore: 9, whyBest: 'Cuts without damaging surroundings' },
        { jobType: 'Large demolition', suitabilityScore: 2, whyBest: 'Too small and slow', limitations: 'Use reciprocating saw' }
      ]
    })

    // ACCESS - Extension Ladder
    this.expertiseDatabase.set('extension-ladder', {
      name: 'Extension Ladder (Double/Triple)',
      category: 'Access Equipment',
      aliases: ['extending ladder', 'double ladder', 'triple ladder'],
      description: 'Traditional extending ladder for quick access to height',
      whenToUse: [
        'Quick access to gutters',
        'Reaching roof level',
        'Window cleaning/repairs',
        'Tree work access',
        'Emergency access'
      ],
      whenNotToUse: [
        'Working for extended periods',
        'Carrying heavy materials',
        'Windy conditions',
        'Working alone at height',
        'Electrical work near power lines'
      ],
      specifications: {
        capacity: '150kg max load',
        dimensions: 'Extends 4m-10m typically',
        features: [
          'Rubber feet/spikes',
          'D-shaped rungs',
          'Pulley system on larger models',
          'Stabilizer bars available'
        ]
      },
      usageInstructions: [
        'Check all locks before climbing',
        'Set at 75° angle (1:4 ratio)',
        'Extend 1m above step-off point',
        'Face ladder when climbing',
        'Three points of contact always',
        'Secure at top or have someone foot it'
      ],
      safetyRequirements: [
        'Inspect before each use',
        'Two-person operation recommended',
        'Don\'t overreach - move ladder',
        'Non-conductive for electrical work',
        'Maximum 30 minutes continuous use'
      ],
      commonMistakes: [
        'Wrong angle setup (too steep/shallow)',
        'Overreaching to sides',
        'Using damaged ladder',
        'Not securing at top',
        'Exceeding weight limit with materials'
      ],
      proTips: [
        'Hire ladder stabilizer for £5/day extra - much safer',
        'Fiberglass for electrical work (non-conductive)',
        'Ladder clamps for van transport £10/day',
        'Consider scaffold tower for all-day work',
        'Mark ladder angle on ground with tape'
      ],
      alternatives: [
        { tool: 'Scaffold tower', reason: 'Extended work periods', costDifference: '£70/day vs £15/day' },
        { tool: 'Cherry picker', reason: 'Better mobility at height', costDifference: '£160/day vs £15/day' },
        { tool: 'Roof ladder', reason: 'Working on roof surface', costDifference: '£20/day vs £15/day' }
      ],
      buyVsRent: {
        buyThreshold: 10,
        rentalCostPerDay: 15,
        purchaseCost: 250,
        recommendation: 'buy'
      },
      jobSuitability: [
        { jobType: 'Gutter cleaning', suitabilityScore: 9, whyBest: 'Quick setup for short tasks' },
        { jobType: 'Window repairs', suitabilityScore: 8, whyBest: 'Good for quick access' },
        { jobType: 'Painting house exterior', suitabilityScore: 4, whyBest: 'Too tiring for extended use', limitations: 'Use scaffold' },
        { jobType: 'Roof tiling', suitabilityScore: 3, whyBest: 'Only for access', limitations: 'Need roof ladder and scaffold' }
      ]
    })

    // PLANT - Dumper
    this.expertiseDatabase.set('dumper', {
      name: 'Site Dumper (1-3 tonne)',
      category: 'Plant Machinery',
      aliases: ['dump truck', 'site dumper', 'muck truck'],
      description: 'Compact dump truck for moving materials around site',
      whenToUse: [
        'Moving excavated soil',
        'Transporting aggregates',
        'Concrete pour distribution',
        'Site clearance',
        'Material delivery across rough terrain'
      ],
      whenNotToUse: [
        'Public road use (not road legal)',
        'Steep slopes over 30%',
        'Inside buildings',
        'Lifting operations'
      ],
      specifications: {
        capacity: '1-3 tonne payload',
        power: 'Diesel engine',
        features: [
          'Swivel skip (some models)',
          'Roll bar/ROPS',
          '4WD for rough terrain',
          'Hi-tip option available'
        ]
      },
      usageInstructions: [
        'Check ROPS is intact before use',
        'Never travel with raised skip',
        'Load evenly to prevent tipping',
        'Use lowest gear on slopes',
        'Check blind spots before reversing',
        'Clean skip after concrete use'
      ],
      safetyRequirements: [
        'CPCS/NPORS dumper ticket',
        'Seatbelt mandatory',
        'Hi-vis clothing required',
        'Site speed limits apply',
        'Daily inspection checklist',
        'Beacon required on some sites'
      ],
      commonMistakes: [
        'Overloading beyond capacity',
        'Traveling with raised skip',
        'Too fast on rough ground',
        'Not checking overhead cables',
        'Poor maintenance of skip pivot'
      ],
      proTips: [
        'Hi-tip model for loading into skips (+£10/day)',
        'Swivel skip saves reversing',
        'Track dumpers for soft ground (+£30/day)',
        'Check site diesel provision',
        'Book with beacon light for busy sites'
      ],
      alternatives: [
        { tool: 'Wheelbarrow', reason: 'Small volumes', costDifference: '£10/day vs £90/day' },
        { tool: 'Telehandler with bucket', reason: 'Lifting and moving', costDifference: '£180/day vs £90/day' },
        { tool: 'Track barrow', reason: 'Narrow access', costDifference: '£70/day vs £90/day' }
      ],
      buyVsRent: {
        buyThreshold: 100,
        rentalCostPerDay: 90,
        purchaseCost: 12000,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Foundation excavation', suitabilityScore: 10, whyBest: 'Efficient soil removal from site' },
        { jobType: 'Concrete pours', suitabilityScore: 9, whyBest: 'Distributes concrete around site' },
        { jobType: 'Landscaping', suitabilityScore: 9, whyBest: 'Moves bulk materials efficiently' },
        { jobType: 'Interior work', suitabilityScore: 1, whyBest: 'Too large for indoor use', limitations: 'Use wheelbarrow' }
      ]
    })

    // SPECIALIZED - Tile Cutter
    this.expertiseDatabase.set('tile-cutter', {
      name: 'Professional Tile Cutter',
      category: 'Specialized Tools',
      aliases: ['tile saw', 'wet saw', 'bridge saw'],
      description: 'Precision cutting tool for ceramic and porcelain tiles',
      whenToUse: [
        'Bathroom/kitchen tiling',
        'Large format tile cutting',
        'Diagonal and curved cuts',
        'Porcelain and natural stone',
        'Professional finish required'
      ],
      whenNotToUse: [
        'Small basic cuts (use manual cutter)',
        'Soft wall tiles (score and snap works)',
        'One-off cuts',
        'No water supply available'
      ],
      specifications: {
        capacity: 'Cuts up to 1200mm tiles',
        features: [
          'Water cooling system',
          'Laser guide',
          'Adjustable fence',
          'Plunge cut capability'
        ]
      },
      usageInstructions: [
        'Fill water tray before starting',
        'Mark cut line clearly',
        'Support large tiles properly',
        'Feed slowly for clean cuts',
        'Keep blade wet continuously',
        'Clean blade after use'
      ],
      safetyRequirements: [
        'Safety glasses essential',
        'Keep hands clear of blade',
        'Check electric safety with water',
        'Use RCD protection',
        'Ensure stable setup'
      ],
      commonMistakes: [
        'Rushing cuts (causes chipping)',
        'Blade running dry',
        'Not supporting tile properly',
        'Using worn blade',
        'Forcing thick materials'
      ],
      proTips: [
        'New blade for porcelain - worth £30',
        'Practice cuts on offcuts first',
        'Wet cutting reduces dust 90%',
        'Manual cutter fine for straight cuts',
        'Bridge saw for 20mm+ stone'
      ],
      alternatives: [
        { tool: 'Manual tile cutter', reason: 'Straight cuts only', costDifference: '£15/day vs £60/day' },
        { tool: 'Angle grinder', reason: 'Rough cuts', costDifference: '£35/day vs £60/day' },
        { tool: 'Tile nippers', reason: 'Small adjustments', costDifference: '£5 to buy vs £60/day' }
      ],
      buyVsRent: {
        buyThreshold: 7,
        rentalCostPerDay: 60,
        purchaseCost: 450,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Bathroom renovation', suitabilityScore: 10, whyBest: 'Essential for professional finish' },
        { jobType: 'Kitchen splashback', suitabilityScore: 9, whyBest: 'Clean cuts for visible edges' },
        { jobType: 'Floor tiling', suitabilityScore: 10, whyBest: 'Handles large format tiles' },
        { jobType: 'Small repairs', suitabilityScore: 3, whyBest: 'Overkill for minor work', limitations: 'Use manual cutter' }
      ]
    })

    // BREAKING - Demolition Hammer
    this.expertiseDatabase.set('demolition-hammer', {
      name: 'Electric Demolition Hammer',
      category: 'Breaking Tools',
      aliases: ['breaker', 'jack hammer', 'demo hammer', 'kango'],
      description: 'Heavy-duty tool for breaking concrete and masonry',
      whenToUse: [
        'Breaking concrete floors/paths',
        'Removing wall tiles',
        'Demolishing brick/block walls',
        'Breaking foundations',
        'Channel cutting for services'
      ],
      whenNotToUse: [
        'Precision work',
        'Near fragile structures',
        'Without proper PPE',
        'Asbestos-containing materials'
      ],
      specifications: {
        power: '1300-1750W',
        weight: '10-15kg',
        features: [
          'Anti-vibration system',
          'Soft start',
          'Service indicator',
          'SDS-Max fitting'
        ]
      },
      usageInstructions: [
        'Let weight of tool do the work',
        'Work in short bursts (vibration limits)',
        'Start at edges and corners',
        'Keep chisel sharp',
        'Work systematically in sections',
        'Take regular breaks (HSE guidance)'
      ],
      safetyRequirements: [
        'Full PPE required (helmet, goggles, ears)',
        'Steel toe boots essential',
        'Vibration exposure monitoring',
        'Dust suppression/extraction',
        'Check for services first'
      ],
      commonMistakes: [
        'Working too long (vibration injury)',
        'Forcing the tool',
        'Not checking for services',
        'Poor chisel angle',
        'No dust control'
      ],
      proTips: [
        'Hire with variety of chisels',
        'Water suppression for dust',
        'Start with smaller tool for precision',
        'Petrol version for no power access',
        '2-hour max daily exposure (HSE)'
      ],
      alternatives: [
        { tool: 'SDS drill', reason: 'Light breaking', costDifference: '£35/day vs £60/day' },
        { tool: 'Hydraulic breaker', reason: 'Heavy demolition', costDifference: '£150/day vs £60/day' },
        { tool: 'Diamond drilling', reason: 'Precise removal', costDifference: '£200/day vs £60/day' }
      ],
      buyVsRent: {
        buyThreshold: 12,
        rentalCostPerDay: 60,
        purchaseCost: 800,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Concrete path removal', suitabilityScore: 10, whyBest: 'Perfect power for the job' },
        { jobType: 'Wall tile removal', suitabilityScore: 9, whyBest: 'Fast removal with tile chisel' },
        { jobType: 'Foundation breaking', suitabilityScore: 9, whyBest: 'Powerful enough for reinforced concrete' },
        { jobType: 'Precision cutting', suitabilityScore: 2, whyBest: 'Too aggressive', limitations: 'Use disc cutter' }
      ]
    })

    // POWER TOOLS - Random Orbital Sander
    this.expertiseDatabase.set('orbital-sander', {
      name: 'Random Orbital Sander',
      category: 'Power Tools',
      aliases: ['ros sander', 'random sander', 'orbital', 'palm sander'],
      description: 'Versatile sanding tool for smooth finishes',
      whenToUse: [
        'Preparing surfaces for painting',
        'Removing old finishes',
        'Smoothing filler and plaster',
        'Furniture restoration',
        'Between-coat sanding'
      ],
      whenNotToUse: [
        'Paint stripping (use chemical/heat)',
        'Heavy material removal',
        'Metal grinding',
        'Curved/detailed surfaces'
      ],
      specifications: {
        power: '200-400W',
        features: [
          'Variable speed control',
          'Dust extraction port',
          '125-150mm pad size',
          'Hook and loop discs'
        ]
      },
      usageInstructions: [
        'Start with coarse grit, finish fine',
        'Keep sander moving constantly',
        'Don\'t apply pressure - let it work',
        'Overlap passes by 1/3',
        'Clean disc regularly',
        'Use dust extraction always'
      ],
      safetyRequirements: [
        'Dust mask essential',
        'Eye protection required',
        'Ensure dust extraction working',
        'Check for lead paint',
        'Secure work piece'
      ],
      commonMistakes: [
        'Staying in one spot (creates dips)',
        'Skipping grit grades',
        'Using worn discs',
        'Too much pressure',
        'No dust extraction'
      ],
      proTips: [
        'Buy discs in bulk - 70% cheaper',
        'Use interface pad for curves',
        'Mesh discs last longer',
        'Connect to vacuum for zero dust',
        'Mark surface with pencil to see progress'
      ],
      alternatives: [
        { tool: 'Belt sander', reason: 'Faster material removal', costDifference: '£35/day vs £25/day' },
        { tool: 'Detail sander', reason: 'Corners and edges', costDifference: '£20/day vs £25/day' },
        { tool: 'Hand sanding', reason: 'Small areas', costDifference: 'Manual vs £25/day' }
      ],
      buyVsRent: {
        buyThreshold: 5,
        rentalCostPerDay: 25,
        purchaseCost: 120,
        recommendation: 'buy'
      },
      jobSuitability: [
        { jobType: 'Door preparation', suitabilityScore: 10, whyBest: 'Perfect for flat surfaces' },
        { jobType: 'Furniture restoration', suitabilityScore: 9, whyBest: 'Gentle action preserves wood' },
        { jobType: 'Wall preparation', suitabilityScore: 8, whyBest: 'Good for smoothing filler' },
        { jobType: 'Paint stripping', suitabilityScore: 4, whyBest: 'Too slow', limitations: 'Use chemical stripper' }
      ]
    })

    // ACCESS - Podium Steps
    this.expertiseDatabase.set('podium-steps', {
      name: 'Podium Platform Steps',
      category: 'Access Equipment',
      aliases: ['podium', 'platform steps', 'work platform'],
      description: 'Stable platform for low-level access work',
      whenToUse: [
        'Electrical installations',
        'Ceiling work',
        'Painting and decorating',
        'Retail display work',
        'Short-duration tasks at height'
      ],
      whenNotToUse: [
        'Heights above 3m',
        'Heavy material handling',
        'Outdoor windy conditions',
        'Moving between multiple locations frequently'
      ],
      specifications: {
        capacity: '150kg load',
        dimensions: '0.6m-2.5m platform height',
        features: [
          'Large work platform',
          'Full guardrails',
          'Lockable wheels',
          'Tool tray'
        ]
      },
      usageInstructions: [
        'Check all wheels locked before use',
        'Face platform when climbing',
        'Don\'t exceed maximum load',
        'Keep both feet on platform',
        'Move only from ground level',
        'Check platform is level'
      ],
      safetyRequirements: [
        'Visual inspection before use',
        'Maximum one person',
        'Don\'t lean outside rails',
        'Lock wheels before climbing',
        'Check weight capacity'
      ],
      commonMistakes: [
        'Moving with person on platform',
        'Overreaching from platform',
        'Using on uneven ground',
        'Exceeding weight limit',
        'Using as storage shelf'
      ],
      proTips: [
        'Adjustable height models most versatile',
        'Fiberglass for electrical work',
        'Wider platform = safer working',
        'Some fold for transport',
        'Cheaper than scaffold for short jobs'
      ],
      alternatives: [
        { tool: 'Step ladder', reason: 'Quick access', costDifference: '£10/day vs £30/day' },
        { tool: 'Scaffold tower', reason: 'Higher access', costDifference: '£70/day vs £30/day' },
        { tool: 'Scissor lift', reason: 'Multiple heights', costDifference: '£120/day vs £30/day' }
      ],
      buyVsRent: {
        buyThreshold: 20,
        rentalCostPerDay: 30,
        purchaseCost: 650,
        recommendation: 'rent'
      },
      jobSuitability: [
        { jobType: 'Shop fitting', suitabilityScore: 10, whyBest: 'Safe, stable platform for precision work' },
        { jobType: 'Ceiling repairs', suitabilityScore: 9, whyBest: 'Large platform for tools' },
        { jobType: 'Painting walls', suitabilityScore: 7, whyBest: 'Good for cutting in high areas' },
        { jobType: 'Roof work', suitabilityScore: 1, whyBest: 'Insufficient height', limitations: 'Use scaffold or ladder' }
      ]
    })

    // More tools will be added as needed...
  }

  /**
   * Find best tool(s) for a specific job description
   */
  findToolsForJob(jobDescription: string): ToolRecommendation[] {
    const jobLower = jobDescription.toLowerCase()
    const recommendations: ToolRecommendation[] = []

    for (const [key, expertise] of this.expertiseDatabase) {
      const suitability = expertise.jobSuitability.find(job => 
        jobLower.includes(job.jobType.toLowerCase()) ||
        job.jobType.toLowerCase().includes(jobLower)
      )

      if (suitability && suitability.suitabilityScore >= 7) {
        recommendations.push({
          tool: expertise,
          suitabilityScore: suitability.suitabilityScore,
          reason: suitability.whyBest,
          limitations: suitability.limitations
        })
      }
    }

    // Also check by keywords in whenToUse
    for (const [key, expertise] of this.expertiseDatabase) {
      const keywordMatch = expertise.whenToUse.some(use => 
        use.toLowerCase().includes(jobLower) ||
        jobLower.includes(use.toLowerCase())
      )

      if (keywordMatch && !recommendations.find(r => r.tool.name === expertise.name)) {
        recommendations.push({
          tool: expertise,
          suitabilityScore: 8,
          reason: 'Based on typical usage patterns',
          limitations: undefined
        })
      }
    }

    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore)
  }

  /**
   * Get tool expertise by name or alias
   */
  getToolExpertise(toolName: string): ToolExpertise | null {
    const searchTerm = toolName.toLowerCase()
    
    for (const [key, expertise] of this.expertiseDatabase) {
      if (expertise.name.toLowerCase().includes(searchTerm) ||
          expertise.aliases.some(alias => alias.toLowerCase().includes(searchTerm))) {
        return expertise
      }
    }
    
    return null
  }

  /**
   * Generate comprehensive tool advice context for AI
   */
  getToolAdviceContext(query: string): string {
    const toolRecommendations = this.findToolsForJob(query)
    
    if (toolRecommendations.length === 0) {
      return this.getGeneralToolAdvice(query)
    }

    let context = `## EXPERT TOOL RECOMMENDATIONS\n\n`
    
    toolRecommendations.slice(0, 3).forEach((rec, index) => {
      const tool = rec.tool
      context += `### ${index + 1}. ${tool.name} (${rec.suitabilityScore}/10 match)\n`
      context += `**Why this tool:** ${rec.reason}\n`
      if (rec.limitations) {
        context += `**Limitations:** ${rec.limitations}\n`
      }
      context += `**Typical cost:** £${tool.buyVsRent.rentalCostPerDay}/day\n`
      
      // Add key usage tips
      if (tool.proTips.length > 0) {
        context += `**Pro tip:** ${tool.proTips[0]}\n`
      }
      
      // Add safety highlight
      if (tool.safetyRequirements.length > 0) {
        context += `**Safety:** ${tool.safetyRequirements[0]}\n`
      }
      
      context += `\n`
    })

    // Add alternatives if main recommendation has limitations
    if (toolRecommendations[0]?.limitations) {
      context += `## ALTERNATIVES TO CONSIDER:\n`
      toolRecommendations[0].tool.alternatives.forEach(alt => {
        context += `• **${alt.tool}**: ${alt.reason} (${alt.costDifference})\n`
      })
    }

    return context
  }

  /**
   * Generate general advice when no specific tools match
   */
  private getGeneralToolAdvice(query: string): string {
    // Analyze query for project type
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('dig') || queryLower.includes('excavat') || queryLower.includes('trench')) {
      return `## DIGGING/EXCAVATION TOOLS:\n• **Mini excavator** for areas over 5m³\n• **Trenching spade** for narrow utility trenches\n• **Mattock/pickaxe** for hard ground breaking\n• **Post hole digger** for fence posts\n\nChoose based on volume and access constraints.`
    }
    
    if (queryLower.includes('concrete') || queryLower.includes('cement')) {
      return `## CONCRETE TOOLS:\n• **Concrete mixer** for pours under 2m³\n• **Poker vibrator** for proper consolidation\n• **Bull float** for surface finishing\n• **Ready-mix delivery** for pours over 5m³\n\nFactor in working time - concrete waits for no one!`
    }
    
    return `## TOOL SELECTION PRINCIPLES:\n• **Right size for job** - don't over/under-spec\n• **Access requirements** - measure gates/doorways first\n• **Duration vs cost** - weekly rates often better value\n• **Safety first** - factor in training and PPE costs\n• **Local vs national** - independent hire often 20-30% cheaper`
  }

  /**
   * Get buy vs rent recommendation for a tool
   */
  getBuyVsRentAdvice(toolName: string, expectedUsageDays: number): string {
    const expertise = this.getToolExpertise(toolName)
    if (!expertise) {
      return "Can't find specific buy/rent data for that tool. Generally, rent if using less than 30 days per year."
    }

    const { buyThreshold, rentalCostPerDay, purchaseCost, recommendation } = expertise.buyVsRent
    const totalRentalCost = expectedUsageDays * rentalCostPerDay

    if (expectedUsageDays < buyThreshold) {
      const savings = purchaseCost - totalRentalCost
      return `**RENT** - Save £${savings}. You'd need ${buyThreshold}+ days/year to justify buying (£${purchaseCost}).`
    } else {
      const savings = totalRentalCost - purchaseCost
      return `**BUY** - Save £${savings} over ${expectedUsageDays} days. Rental would cost £${totalRentalCost} vs £${purchaseCost} purchase.`
    }
  }

  /**
   * Get all available categories from expertise database
   */
  getExpertiseCategories(): string[] {
    const categories = new Set<string>()
    for (const [_, expertise] of this.expertiseDatabase) {
      categories.add(expertise.category)
    }
    return Array.from(categories).sort()
  }

  /**
   * Get tools by category from expertise database
   */
  getToolsByExpertiseCategory(category: string): ToolExpertise[] {
    const tools: ToolExpertise[] = []
    for (const [_, expertise] of this.expertiseDatabase) {
      if (expertise.category.toLowerCase() === category.toLowerCase()) {
        tools.push(expertise)
      }
    }
    return tools
  }

  /**
   * Search tools by keyword across all fields
   */
  searchTools(keyword: string): ToolExpertise[] {
    const searchTerm = keyword.toLowerCase()
    const results: ToolExpertise[] = []
    
    for (const [_, expertise] of this.expertiseDatabase) {
      const searchableText = [
        expertise.name,
        expertise.description,
        ...expertise.aliases,
        ...expertise.whenToUse,
        expertise.category
      ].join(' ').toLowerCase()
      
      if (searchableText.includes(searchTerm)) {
        results.push(expertise)
      }
    }
    
    return results
  }

  /**
   * Get comprehensive category overview for AI context
   */
  getCategoryOverview(): string {
    const categories = this.getExpertiseCategories()
    let overview = `## TOOL CATEGORIES AVAILABLE:\n\n`
    
    for (const category of categories) {
      const tools = this.getToolsByExpertiseCategory(category)
      overview += `### ${category} (${tools.length} tools)\n`
      overview += tools.map(t => `• ${t.name}: ${t.description}`).join('\n')
      overview += '\n\n'
    }
    
    return overview
  }

  /**
   * Get multi-tool recommendations for complex jobs
   */
  getMultiToolRecommendations(jobDescription: string): string {
    const recommendations = this.findToolsForJob(jobDescription)
    
    if (recommendations.length === 0) {
      // Try keyword search
      const keywords = jobDescription.toLowerCase().split(' ')
      const toolSet = new Set<ToolExpertise>()
      
      for (const keyword of keywords) {
        const results = this.searchTools(keyword)
        results.forEach(tool => toolSet.add(tool))
      }
      
      if (toolSet.size > 0) {
        return this.formatMultiToolAdvice(Array.from(toolSet))
      }
      
      return this.getCategoryOverview()
    }
    
    const topTools = recommendations.slice(0, 5).map(r => r.tool)
    return this.formatMultiToolAdvice(topTools)
  }

  /**
   * Format advice for multiple tools
   */
  private formatMultiToolAdvice(tools: ToolExpertise[]): string {
    let advice = `## RECOMMENDED TOOLS FOR THIS JOB:\n\n`
    
    tools.forEach((tool, index) => {
      advice += `### ${index + 1}. ${tool.name}\n`
      advice += `**Category:** ${tool.category}\n`
      advice += `**Why needed:** ${tool.description}\n`
      advice += `**Daily rate:** £${tool.buyVsRent.rentalCostPerDay}\n`
      
      // Add key safety point
      if (tool.safetyRequirements.length > 0) {
        advice += `**Key safety:** ${tool.safetyRequirements[0]}\n`
      }
      
      // Add main pro tip
      if (tool.proTips.length > 0) {
        advice += `**Pro tip:** ${tool.proTips[0]}\n`
      }
      
      advice += '\n'
    })
    
    // Calculate total daily cost
    const totalDailyCost = tools.reduce((sum, tool) => sum + tool.buyVsRent.rentalCostPerDay, 0)
    advice += `**TOTAL DAILY HIRE COST:** £${totalDailyCost} (all tools)\n`
    advice += `**WEEKLY PACKAGE:** Most hire shops offer 20-30% discount for weekly hire of multiple tools.\n`
    
    return advice
  }
}

export interface ToolRecommendation {
  tool: ToolExpertise
  suitabilityScore: number
  reason: string
  limitations?: string
}

export const toolExpertiseService = ToolExpertiseService.getInstance()