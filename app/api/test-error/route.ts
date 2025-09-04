import { NextRequest, NextResponse } from 'next/server'
// import * as Sentry from '@sentry/nextjs' // Temporarily disabled

export async function GET(request: NextRequest) {
  // This endpoint intentionally throws an error for testing
  // Sentry.captureMessage('Test API endpoint accessed', 'info')
  
  const error = new Error('Test API error - This is intentional for Sentry testing')
  
  // Sentry.captureException(error, {
  //   tags: {
  //     endpoint: 'test-error',
  //     intentional: true
  //   }
  // })
  
  return NextResponse.json(
    { error: 'Test error triggered successfully' },
    { status: 500 }
  )
}