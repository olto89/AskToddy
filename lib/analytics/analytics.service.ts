import { logEvent as firebaseLogEvent } from 'firebase/analytics'
import { analytics } from '@/lib/firebase/firebase.config'

export const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && analytics) {
    try {
      firebaseLogEvent(analytics, eventName, eventParams)
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }
}

// Predefined events for AskToddy
export const trackEvents = {
  messageSent: (params: { hasText: boolean; hasImages: boolean; messageCount: number }) => {
    logEvent('message_sent', params)
  },
  
  imageUploaded: (count: number) => {
    logEvent('image_uploaded', { count })
  },
  
  exampleQuestionClicked: (question: string) => {
    logEvent('example_question_clicked', { question })
  },
  
  feedbackModalShown: () => {
    logEvent('feedback_modal_shown')
  },
  
  feedbackSubmitted: (rating: number, hasComment: boolean) => {
    logEvent('feedback_submitted', { rating, hasComment })
  },
  
  feedbackSkipped: () => {
    logEvent('feedback_skipped')
  },
  
  toolRecommended: (toolName: string) => {
    logEvent('tool_recommended', { toolName })
  },
  
  pageView: (pageName: string) => {
    logEvent('page_view', { page_name: pageName })
  }
}