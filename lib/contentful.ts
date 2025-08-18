import { createClient } from 'contentful'

// Content type IDs - these will match what you create in Contentful
export const CONTENT_TYPES = {
  HOMEPAGE: 'homepage',
  UPLOAD_FORM: 'uploadForm',
  PRICING_TIER: 'pricingTier',
  PROJECT_TYPE: 'projectType',
  UI_TEXT: 'uiText',
  AI_PROMPT: 'aiPrompt'
} as const

// Initialize Contentful client
const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master',
  // Add cache control
  host: 'cdn.contentful.com'
})

// Type definitions for your content
export interface HomepageContent {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  ctaButtonText: string
  uploadSectionTitle: string
  uploadSectionDescription: string
  featuresTitle: string
  features: Array<{
    title: string
    description: string
    icon?: string
  }>
}

export interface UploadFormContent {
  title: string
  projectTypeLabel: string
  projectTypes: Array<{
    value: string
    label: string
    description?: string
  }>
  descriptionLabel: string
  descriptionPlaceholder: string
  uploadLabel: string
  uploadHelperText: string
  submitButtonText: string
  submitButtonTextLoading: string
  validationMessages: {
    requiredDescription: string
    noImages: string
    fileTooLarge: string
    invalidFileType: string
  }
}

export interface PricingTier {
  name: string
  description: string
  priceMultiplier: number
  features: string[]
  order: number
}

export interface UIText {
  key: string
  value: string
  description?: string
}

// Default fallback content
export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroTitle: 'Get Instant AI-Powered Construction Quotes',
  heroSubtitle: 'Professional estimates in seconds',
  heroDescription: 'Upload photos of your DIY project and receive detailed cost breakdowns, material lists, and timelines powered by AI',
  ctaButtonText: 'Get Your Free Quote',
  uploadSectionTitle: 'Upload Your Project',
  uploadSectionDescription: 'Take photos or videos of your project area and describe what you need done',
  featuresTitle: 'Why Choose AskToddy',
  features: [
    {
      title: 'Instant Quotes',
      description: 'Get detailed estimates in seconds, not days',
      icon: '⚡'
    },
    {
      title: 'AI-Powered Analysis',
      description: 'Advanced AI analyzes your photos for accurate estimates',
      icon: '🤖'
    },
    {
      title: 'Detailed Breakdowns',
      description: 'See materials, labor, and timeline clearly outlined',
      icon: '📊'
    }
  ]
}

// Fetch homepage content with automatic fallback
export async function getHomepageContent(): Promise<HomepageContent> {
  // If Contentful is not configured, return defaults immediately
  if (!isContentfulConfigured()) {
    console.log('Contentful not configured, using default content')
    return DEFAULT_HOMEPAGE_CONTENT
  }

  try {
    const entries = await client.getEntries({
      content_type: CONTENT_TYPES.HOMEPAGE,
      limit: 1
    })
    
    if (entries.items.length > 0) {
      const fields = entries.items[0].fields as any
      // Merge CMS content with defaults (CMS content takes priority)
      return {
        heroTitle: fields.heroTitle || DEFAULT_HOMEPAGE_CONTENT.heroTitle,
        heroSubtitle: fields.heroSubtitle || DEFAULT_HOMEPAGE_CONTENT.heroSubtitle,
        heroDescription: fields.heroDescription || DEFAULT_HOMEPAGE_CONTENT.heroDescription,
        ctaButtonText: fields.ctaButtonText || DEFAULT_HOMEPAGE_CONTENT.ctaButtonText,
        uploadSectionTitle: fields.uploadSectionTitle || DEFAULT_HOMEPAGE_CONTENT.uploadSectionTitle,
        uploadSectionDescription: fields.uploadSectionDescription || DEFAULT_HOMEPAGE_CONTENT.uploadSectionDescription,
        featuresTitle: fields.featuresTitle || DEFAULT_HOMEPAGE_CONTENT.featuresTitle,
        features: fields.features || DEFAULT_HOMEPAGE_CONTENT.features
      }
    }
    
    // No content in CMS yet, use defaults
    console.log('No homepage content in CMS, using defaults')
    return DEFAULT_HOMEPAGE_CONTENT
  } catch (error) {
    console.error('Error fetching homepage content, falling back to defaults:', error)
    return DEFAULT_HOMEPAGE_CONTENT
  }
}

// Fetch upload form content
export async function getUploadFormContent(): Promise<UploadFormContent | null> {
  try {
    const entries = await client.getEntries({
      content_type: CONTENT_TYPES.UPLOAD_FORM,
      limit: 1
    })
    
    if (entries.items.length > 0) {
      const fields = entries.items[0].fields as any
      return {
        title: fields.title || 'Upload Your Project',
        projectTypeLabel: fields.projectTypeLabel || 'Project Type',
        projectTypes: fields.projectTypes || [],
        descriptionLabel: fields.descriptionLabel || 'Project Description',
        descriptionPlaceholder: fields.descriptionPlaceholder || 'Describe your project...',
        uploadLabel: fields.uploadLabel || 'Upload Images or Videos',
        uploadHelperText: fields.uploadHelperText || 'Upload photos or videos of your project',
        submitButtonText: fields.submitButtonText || 'Submit Project for Quote',
        submitButtonTextLoading: fields.submitButtonTextLoading || 'Uploading...',
        validationMessages: fields.validationMessages || {}
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching upload form content:', error)
    return null
  }
}

// Fetch pricing tiers
export async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    const entries = await client.getEntries({
      content_type: CONTENT_TYPES.PRICING_TIER,
      order: 'fields.order'
    })
    
    return entries.items.map(item => {
      const fields = item.fields as any
      return {
        name: fields.name,
        description: fields.description,
        priceMultiplier: fields.priceMultiplier,
        features: fields.features || [],
        order: fields.order || 0
      }
    })
  } catch (error) {
    console.error('Error fetching pricing tiers:', error)
    return []
  }
}

// Fetch UI text by key
export async function getUIText(key: string): Promise<string | null> {
  try {
    const entries = await client.getEntries({
      content_type: CONTENT_TYPES.UI_TEXT,
      'fields.key': key,
      limit: 1
    })
    
    if (entries.items.length > 0) {
      const fields = entries.items[0].fields as any
      return fields.value || null
    }
    return null
  } catch (error) {
    console.error(`Error fetching UI text for key ${key}:`, error)
    return null
  }
}

// Fetch all UI texts
export async function getAllUITexts(): Promise<Record<string, string>> {
  try {
    const entries = await client.getEntries({
      content_type: CONTENT_TYPES.UI_TEXT
    })
    
    const texts: Record<string, string> = {}
    entries.items.forEach(item => {
      const fields = item.fields as any
      if (fields.key && fields.value) {
        texts[fields.key] = fields.value
      }
    })
    
    return texts
  } catch (error) {
    console.error('Error fetching all UI texts:', error)
    return {}
  }
}

// Fetch AI prompts
export async function getAIPrompt(promptType: string): Promise<string | null> {
  try {
    const entries = await client.getEntries({
      content_type: CONTENT_TYPES.AI_PROMPT,
      'fields.type': promptType,
      limit: 1
    })
    
    if (entries.items.length > 0) {
      const fields = entries.items[0].fields as any
      return fields.prompt || null
    }
    return null
  } catch (error) {
    console.error(`Error fetching AI prompt for type ${promptType}:`, error)
    return null
  }
}

// Helper function to check if Contentful is configured
export function isContentfulConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID && 
    process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
  )
}