import { NextResponse } from 'next/server'
import { getHomepageContent, isContentfulConfigured } from '@/lib/contentful'

export async function GET() {
  const isConfigured = isContentfulConfigured()
  const content = await getHomepageContent()
  
  return NextResponse.json({
    configured: isConfigured,
    hasSpaceId: !!process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    hasToken: !!process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    spaceIdLength: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID?.length || 0,
    tokenLength: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN?.length || 0,
    environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'not set',
    heroTitle: content.heroTitle,
    contentSource: content.heroTitle.includes('hello test') ? 'CMS' : 'Fallback'
  })
}