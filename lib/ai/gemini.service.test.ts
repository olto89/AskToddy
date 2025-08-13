import { GeminiService, ProjectAnalysis } from './gemini.service'

describe('GeminiService', () => {
  describe('without API key', () => {
    let service: GeminiService

    beforeEach(() => {
      service = new GeminiService()
    })

    it('should return mock analysis when no API key is provided', async () => {
      const result = await service.analyzeProject(
        'Install new kitchen cabinets',
        'renovation',
        []
      )

      expect(result).toBeDefined()
      expect(result.projectType).toBe('renovation')
      expect(result.difficultyLevel).toBe('Moderate')
      expect(result.estimatedCost).toBeDefined()
      expect(result.estimatedCost.total.min).toBeGreaterThan(0)
      expect(result.toolsNeeded).toBeInstanceOf(Array)
      expect(result.materials).toBeInstanceOf(Array)
      expect(result.steps).toBeInstanceOf(Array)
      expect(result.safetyConsiderations).toBeInstanceOf(Array)
    })

    it('should handle different project types', async () => {
      const projectTypes = ['renovation', 'repair', 'installation', 'landscaping']
      
      for (const type of projectTypes) {
        const result = await service.analyzeProject(
          'Test project',
          type,
          []
        )
        expect(result.projectType).toBe(type)
      }
    })
  })

  describe('with mock API key', () => {
    let service: GeminiService

    beforeEach(() => {
      service = new GeminiService('mock-api-key')
    })

    it('should validate cost structure', async () => {
      const result = await service.analyzeProject(
        'Build a deck',
        'construction',
        []
      )

      expect(result.estimatedCost).toHaveProperty('materials')
      expect(result.estimatedCost).toHaveProperty('labor')
      expect(result.estimatedCost).toHaveProperty('total')
      
      expect(result.estimatedCost.materials).toHaveProperty('min')
      expect(result.estimatedCost.materials).toHaveProperty('max')
      expect(result.estimatedCost.materials.min).toBeLessThanOrEqual(
        result.estimatedCost.materials.max
      )
    })

    it('should validate tools structure', async () => {
      const result = await service.analyzeProject(
        'Paint a room',
        'painting',
        []
      )

      expect(result.toolsNeeded).toBeInstanceOf(Array)
      if (result.toolsNeeded.length > 0) {
        const tool = result.toolsNeeded[0]
        expect(tool).toHaveProperty('name')
        expect(tool).toHaveProperty('estimatedCost')
        expect(tool).toHaveProperty('required')
        expect(typeof tool.name).toBe('string')
        expect(typeof tool.estimatedCost).toBe('number')
        expect(typeof tool.required).toBe('boolean')
      }
    })

    it('should validate materials structure', async () => {
      const result = await service.analyzeProject(
        'Install flooring',
        'installation',
        []
      )

      expect(result.materials).toBeInstanceOf(Array)
      if (result.materials.length > 0) {
        const material = result.materials[0]
        expect(material).toHaveProperty('name')
        expect(material).toHaveProperty('quantity')
        expect(material).toHaveProperty('estimatedCost')
        expect(typeof material.name).toBe('string')
        expect(typeof material.quantity).toBe('string')
        expect(typeof material.estimatedCost).toBe('number')
      }
    })

    it('should validate difficulty levels', async () => {
      const validDifficulties = ['Easy', 'Moderate', 'Difficult', 'Professional Required']
      const result = await service.analyzeProject(
        'Complex electrical work',
        'electrical',
        []
      )

      expect(validDifficulties).toContain(result.difficultyLevel)
    })

    it('should include safety considerations', async () => {
      const result = await service.analyzeProject(
        'Roof repair',
        'repair',
        []
      )

      expect(result.safetyConsiderations).toBeDefined()
      expect(result.safetyConsiderations).toBeInstanceOf(Array)
      expect(result.safetyConsiderations.length).toBeGreaterThan(0)
    })

    it('should handle professional requirements', async () => {
      const result = await service.analyzeProject(
        'Electrical panel upgrade',
        'electrical',
        []
      )

      expect(typeof result.requiresProfessional).toBe('boolean')
      if (result.requiresProfessional && result.professionalReasons) {
        expect(result.professionalReasons).toBeInstanceOf(Array)
        expect(result.professionalReasons.length).toBeGreaterThan(0)
      }
    })
  })

  describe('error handling', () => {
    it('should handle empty description gracefully', async () => {
      const service = new GeminiService()
      const result = await service.analyzeProject('', 'repair', [])
      
      expect(result).toBeDefined()
      expect(result.projectType).toBe('repair')
    })

    it('should handle invalid project type', async () => {
      const service = new GeminiService()
      const result = await service.analyzeProject(
        'Test project',
        'invalid-type',
        []
      )
      
      expect(result).toBeDefined()
      expect(result.projectType).toBe('invalid-type')
    })

    it('should handle large number of images', async () => {
      const service = new GeminiService()
      const manyImages = Array(100).fill('image-url')
      const result = await service.analyzeProject(
        'Large project',
        'renovation',
        manyImages
      )
      
      expect(result).toBeDefined()
    })
  })
})