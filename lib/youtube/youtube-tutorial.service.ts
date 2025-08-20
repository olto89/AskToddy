/**
 * YouTube Tutorial Service
 * Generates YouTube search links for tool usage tutorials
 * Simple implementation without API - just creates search URLs
 */

export interface ToolTutorial {
  toolName: string
  searchUrl: string
  safetySearchUrl: string
  maintenanceSearchUrl: string
}

export class YouTubeTutorialService {
  
  /**
   * Generate YouTube search link for tool tutorials
   */
  static getToolTutorialLink(toolName: string): string {
    const query = `how to use ${toolName} safely UK tutorial`
    return `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
  }
  
  /**
   * Generate YouTube search link for tool safety
   */
  static getToolSafetyLink(toolName: string): string {
    const query = `${toolName} safety tips UK health safety executive`
    return `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
  }
  
  /**
   * Generate YouTube search link for tool maintenance
   */
  static getToolMaintenanceLink(toolName: string): string {
    const query = `${toolName} maintenance care cleaning storage`
    return `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
  }
  
  /**
   * Get comprehensive tutorial links for a tool
   */
  static getToolTutorials(toolName: string): ToolTutorial {
    return {
      toolName: toolName,
      searchUrl: this.getToolTutorialLink(toolName),
      safetySearchUrl: this.getToolSafetyLink(toolName),
      maintenanceSearchUrl: this.getToolMaintenanceLink(toolName)
    }
  }
  
  /**
   * Generate tutorial context for AI responses
   */
  static getTutorialContext(toolName: string): string {
    const tutorials = this.getToolTutorials(toolName)
    
    return `
📹 **Video Tutorials Available:**
• How to use ${toolName}: ${tutorials.searchUrl}
• Safety guidelines: ${tutorials.safetySearchUrl}  
• Maintenance tips: ${tutorials.maintenanceSearchUrl}

*Click links above to watch YouTube tutorials on proper ${toolName} usage*`
  }
  
  /**
   * Extract tool names from user messages
   */
  static extractToolFromMessage(message: string): string | null {
    const toolKeywords = [
      // Power tools
      'drill', 'angle grinder', 'circular saw', 'jigsaw', 'router', 'planer', 'sander',
      'impact driver', 'hammer drill', 'reciprocating saw', 'chainsaw', 'hedge trimmer',
      
      // Heavy equipment
      'excavator', 'mini digger', 'dumper', 'roller', 'compactor', 'telehandler',
      'concrete mixer', 'cement mixer', 'mortar mixer', 'wheelbarrow',
      
      // Access equipment
      'ladder', 'scaffold', 'cherry picker', 'scissor lift', 'tower scaffold',
      
      // Specialist tools
      'pressure washer', 'generator', 'compressor', 'nail gun', 'staple gun',
      'tile cutter', 'pipe cutter', 'conduit bender', 'spirit level',
      
      // Garden tools
      'strimmer', 'lawn mower', 'leaf blower', 'hedge cutter', 'pruning saw'
    ]
    
    const messageLower = message.toLowerCase()
    
    // Look for direct tool mentions
    for (const tool of toolKeywords) {
      if (messageLower.includes(tool)) {
        return tool
      }
    }
    
    // Look for "how to use" patterns
    const howToMatch = messageLower.match(/how to use (?:a |an |the )?([a-z\s]+?)(?:\s|$|\?|,|\.)/i)
    if (howToMatch) {
      const extractedTool = howToMatch[1].trim()
      if (toolKeywords.some(tool => extractedTool.includes(tool))) {
        return extractedTool
      }
    }
    
    return null
  }
  
  /**
   * Check if user is asking for tool instructions
   */
  static isAskingForInstructions(message: string): boolean {
    const instructionKeywords = [
      'how to use', 'how do i use', 'instructions', 'tutorial', 'guide',
      'how to operate', 'how to work', 'how to run', 'how to start',
      'show me how', 'teach me', 'explain how', 'video', 'demonstration'
    ]
    
    const messageLower = message.toLowerCase()
    return instructionKeywords.some(keyword => messageLower.includes(keyword))
  }
  
  /**
   * Generate tutorial recommendations for Toddy Advice
   */
  static generateTutorialRecommendations(message: string): string {
    if (!this.isAskingForInstructions(message)) {
      return ''
    }
    
    const toolName = this.extractToolFromMessage(message)
    if (!toolName) {
      return `
📹 **Need a tutorial?** 
Try searching YouTube for "[tool name] how to use safely UK" for step-by-step guides.`
    }
    
    return this.getTutorialContext(toolName)
  }
}

export const youtubeTutorialService = new YouTubeTutorialService()