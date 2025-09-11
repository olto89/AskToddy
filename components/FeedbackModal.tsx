'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { trackEvents } from '@/lib/analytics/analytics.service'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  messageCount: number
}

export default function FeedbackModal({ isOpen, onClose, messageCount }: FeedbackModalProps) {
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Safari debug logging
  useEffect(() => {
    if (isOpen) {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      console.log('FeedbackModal opened:', { isOpen, isSafari, userAgent: navigator.userAgent })
      
      // Force Safari to repaint
      if (isSafari) {
        document.body.style.transform = 'translateZ(0)'
        setTimeout(() => {
          document.body.style.transform = ''
        }, 10)
      }
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || rating === 0 || !gdprConsent) return

    setIsSubmitting(true)

    try {
      // Track feedback submission
      trackEvents.feedbackSubmitted(rating, !!feedback)

      // Send to Mailchimp
      const response = await fetch('/api/mailchimp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          rating,
          feedback,
          gdprConsent,
          marketingConsent
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Store in localStorage that user has given feedback (Safari-safe)
        try {
          localStorage.setItem('feedbackGiven', 'true')
        } catch (error) {
          console.error('Cannot save to localStorage (Safari Private?):', error)
        }
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      // Still mark as submitted to not block user
      setIsSubmitted(true)
      try {
        localStorage.setItem('feedbackGiven', 'true')
      } catch (error) {
        console.error('Cannot save to localStorage (Safari Private?):', error)
      }
      setTimeout(() => {
        onClose()
      }, 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    // Track skip event
    trackEvents.feedbackSkipped()
    // Store that user skipped - ask again after more interactions (Safari-safe)
    try {
      localStorage.setItem('feedbackSkipped', String(messageCount))
    } catch (error) {
      console.error('Cannot save to localStorage (Safari Private?):', error)
    }
    onClose()
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      touchAction: 'none',
      // iOS Safari specific fixes - force hardware acceleration
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      // Force layer creation for iOS Safari
      willChange: 'transform',
      WebkitFontSmoothing: 'antialiased',
      // Ensure it's above iOS Safari's UI with viewport units
      minHeight: '100vh',
      minHeight: '100dvh', // Dynamic viewport height for mobile
      width: '100vw',
      // Disable elastic scrolling
      WebkitOverflowScrolling: 'auto',
      overscrollBehavior: 'none',
      // Force fixed positioning on mobile
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none'
    }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200" style={{
        maxHeight: '90vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        // Force hardware acceleration and prevent scrolling issues
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        // Ensure proper touch handling on iOS
        touchAction: 'pan-y',
        // Re-enable text selection for form fields
        WebkitUserSelect: 'auto',
        MozUserSelect: 'auto',
        msUserSelect: 'auto',
        userSelect: 'auto'
      }}>
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)' }}>
                <span className="text-white text-2xl font-bold">T</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How's your experience?</h2>
              <p className="text-gray-600">Help us improve AskToddy with your feedback</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate Toddy?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <svg 
                        className={`w-10 h-10 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Any suggestions? (optional)
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Tell us how we can improve..."
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              {/* GDPR Consent Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    required
                  />
                  <span className="text-xs text-gray-600">
                    I consent to Toddy Tool Hire storing my email and feedback to improve the service.
                    <a href="/privacy" className="text-orange-600 hover:underline ml-1" target="_blank">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-600">
                    Send me exclusive tool hire offers and AskToddy updates (optional)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={!email || rating === 0 || !gdprConsent || isSubmitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: (!email || rating === 0 || !gdprConsent || isSubmitting)
                      ? '#e2e6ea'
                      : 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thanks for your feedback!</h3>
            <p className="text-gray-600">We'll use it to make AskToddy even better</p>
          </div>
        )}
      </div>
    </div>
  )

  // Use portal for better Safari compatibility
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return modalContent
}