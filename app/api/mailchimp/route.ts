import { NextRequest, NextResponse } from 'next/server'

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX // e.g., us21

interface MailchimpSubscribeData {
  email: string
  rating: number
  feedback?: string
  gdprConsent: boolean
  marketingConsent: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: MailchimpSubscribeData = await request.json()
    
    // Validate required fields
    if (!body.email || !body.gdprConsent) {
      return NextResponse.json(
        { error: 'Email and GDPR consent are required' },
        { status: 400 }
      )
    }

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
      console.error('Mailchimp configuration missing')
      // Still return success to not block user experience
      return NextResponse.json({ 
        success: true,
        message: 'Configuration pending'
      })
    }

    // Mailchimp API endpoint
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`

    // Prepare member data
    const memberData = {
      email_address: body.email,
      status: body.marketingConsent ? 'subscribed' : 'unsubscribed',
      merge_fields: {
        RATING: body.rating,
        SOURCE: 'AskToddy Feedback'
      },
      tags: ['asktoddy-user', `rating-${body.rating}`],
      // Store GDPR consent
      marketing_permissions: [{
        marketing_permission_id: 'email',
        enabled: body.marketingConsent
      }],
      // Store feedback in notes (or custom field if you set one up)
      ...(body.feedback && {
        notes: [{
          note: `Feedback: ${body.feedback}`
        }]
      })
    }

    // Make request to Mailchimp
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    })

    const data = await response.json()

    if (!response.ok) {
      // Check if user already exists
      if (data.title === 'Member Exists') {
        // Update existing member
        const updateUrl = `${url}/${Buffer.from(body.email.toLowerCase()).toString('base64')}`
        
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            merge_fields: {
              RATING: body.rating
            },
            tags: [`rating-${body.rating}`]
          })
        })

        if (updateResponse.ok) {
          return NextResponse.json({ 
            success: true,
            message: 'Feedback updated successfully'
          })
        }
      }

      console.error('Mailchimp API error:', data)
      // Still return success to not block user experience
      return NextResponse.json({ 
        success: true,
        message: 'Feedback received'
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed to Mailchimp'
    })

  } catch (error) {
    console.error('Mailchimp submission error:', error)
    
    // Don't fail the user experience due to API issues
    return NextResponse.json({ 
      success: true,
      message: 'Feedback received'
    })
  }
}