import { NextResponse } from 'next/server'

export async function GET() {
  // Check environment variables
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
  const token = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
  const environment = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT
  
  // Try to fetch directly from Contentful API
  let contentfulWorking = false
  let heroTitle = 'Not fetched'
  
  if (spaceId && token) {
    try {
      const response = await fetch(
        `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment || 'master'}/entries?access_token=${token}&content_type=homepage&limit=1`
      )
      if (response.ok) {
        const data = await response.json()
        contentfulWorking = true
        if (data.items && data.items.length > 0) {
          heroTitle = data.items[0].fields.heroTitle || 'No hero title'
        }
      }
    } catch (error) {
      // Ignore errors for debug
    }
  }
  
  return NextResponse.json({
    configured: !!(spaceId && token),
    hasSpaceId: !!spaceId,
    hasToken: !!token,
    spaceIdValue: spaceId ? 'Set' : 'Not set',
    tokenValue: token ? 'Set' : 'Not set',
    environment: environment || 'not set',
    contentfulAPIWorking: contentfulWorking,
    heroTitle: heroTitle,
    contentSource: heroTitle.includes('hello test') ? 'CMS with test' : 'CMS without test',
    instructions: [
      '1. Go to Contentful dashboard',
      '2. Click Content tab',
      '3. Click on Homepage entry',
      '4. Change Hero Title to include "hello test"',
      '5. Click Publish',
      '6. Wait 60 seconds or redeploy on Vercel',
      '7. Check this endpoint again to verify'
    ]
  })
}