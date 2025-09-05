import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface FeedbackData {
  email: string
  rating: number
  feedback: string
  messageCount: number
  timestamp: string
  ip?: string
  userAgent?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json()
    
    // Validate required fields
    if (!body.email || !body.rating) {
      return NextResponse.json(
        { error: 'Email and rating are required' },
        { status: 400 }
      )
    }

    // Add request metadata
    const feedbackEntry: FeedbackData = {
      ...body,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: body.timestamp || new Date().toISOString()
    }

    // Store feedback in a JSON file (in production, use a proper database)
    const feedbackDir = path.join(process.cwd(), 'data')
    const feedbackFile = path.join(feedbackDir, 'feedback.json')
    
    // Ensure directory exists
    try {
      await fs.mkdir(feedbackDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Read existing feedback
    let feedbackData: FeedbackData[] = []
    try {
      const fileContent = await fs.readFile(feedbackFile, 'utf-8')
      feedbackData = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist yet, start with empty array
      feedbackData = []
    }

    // Add new feedback
    feedbackData.push(feedbackEntry)

    // Write updated feedback
    await fs.writeFile(feedbackFile, JSON.stringify(feedbackData, null, 2))

    // Also log to console for monitoring (in production, use proper logging)
    console.log('New feedback received:', {
      email: feedbackEntry.email,
      rating: feedbackEntry.rating,
      messageCount: feedbackEntry.messageCount
    })

    // In production, you might also want to:
    // - Send to a database (Supabase, MongoDB, etc.)
    // - Add to email marketing list (Mailchimp, SendGrid, etc.)
    // - Send notification to admin
    // - Track analytics event

    return NextResponse.json({ 
      success: true,
      message: 'Feedback received successfully'
    })

  } catch (error) {
    console.error('Feedback submission error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit feedback',
        message: 'Sorry, something went wrong. Please try again.'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve feedback (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    // Add basic auth check here in production
    const authHeader = request.headers.get('authorization')
    
    // Simple auth for now - in production use proper authentication
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY || 'toddy-admin-2024'}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const feedbackFile = path.join(process.cwd(), 'data', 'feedback.json')
    
    try {
      const fileContent = await fs.readFile(feedbackFile, 'utf-8')
      const feedbackData = JSON.parse(fileContent)
      
      // Return summary statistics along with data
      const stats = {
        totalFeedback: feedbackData.length,
        averageRating: feedbackData.reduce((acc: number, f: FeedbackData) => acc + f.rating, 0) / feedbackData.length,
        emailsCollected: new Set(feedbackData.map((f: FeedbackData) => f.email)).size
      }
      
      return NextResponse.json({ 
        stats,
        feedback: feedbackData 
      })
    } catch (error) {
      // No feedback yet
      return NextResponse.json({ 
        stats: {
          totalFeedback: 0,
          averageRating: 0,
          emailsCollected: 0
        },
        feedback: [] 
      })
    }
    
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}