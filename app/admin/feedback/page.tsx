'use client'

import { useState, useEffect } from 'react'

interface FeedbackItem {
  email: string
  rating: number
  feedback: string
  messageCount: number
  timestamp: string
  ip?: string
  userAgent?: string
}

interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  emailsCollected: number
}

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const fetchFeedback = async (key: string) => {
    try {
      const response = await fetch('/api/feedback', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback)
        setStats(data.stats)
        setIsAuthenticated(true)
        // Store key in session storage
        sessionStorage.setItem('adminKey', key)
      } else if (response.status === 401) {
        alert('Invalid API key')
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check for stored key
    const storedKey = sessionStorage.getItem('adminKey')
    if (storedKey) {
      fetchFeedback(storedKey)
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFeedback(apiKey)
  }

  const exportEmails = () => {
    const emails = [...new Set(feedback.map(f => f.email))].join('\n')
    const blob = new Blob([emails], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asktoddy-emails-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  const exportFeedback = () => {
    const csv = [
      ['Email', 'Rating', 'Feedback', 'Message Count', 'Timestamp'].join(','),
      ...feedback.map(f => [
        f.email,
        f.rating,
        `"${f.feedback.replace(/"/g, '""')}"`,
        f.messageCount,
        f.timestamp
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asktoddy-feedback-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Access</h1>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full py-2 text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)' }}
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Dashboard</h1>
          <p className="text-gray-600">AskToddy user feedback and email collection</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Total Feedback</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalFeedback}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Average Rating</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)} / 5.0
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Emails Collected</div>
              <div className="text-3xl font-bold text-gray-900">{stats.emailsCollected}</div>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={exportEmails}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Emails
          </button>
          <button
            onClick={exportFeedback}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export All Data (CSV)
          </button>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Feedback</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {feedback.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No feedback received yet
              </div>
            ) : (
              feedback.slice().reverse().map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{item.email}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleString()} • {item.messageCount} messages
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {item.feedback && (
                    <div className="text-gray-700 bg-gray-50 rounded p-3 mt-2">
                      {item.feedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}