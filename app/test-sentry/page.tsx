'use client'

import * as Sentry from "@sentry/nextjs"
import { useState } from "react"

export default function TestSentry() {
  const [testType, setTestType] = useState('')

  const testClientError = () => {
    setTestType('client')
    throw new Error("Test client-side error for Sentry")
  }

  const testCapturedError = () => {
    setTestType('captured')
    try {
      // Simulate an error
      const obj: any = null
      obj.nonExistentMethod()
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: true,
          errorType: 'captured'
        },
        extra: {
          testMessage: 'This is a test error captured with Sentry.captureException'
        }
      })
      alert('Error captured and sent to Sentry!')
    }
  }

  const testBreadcrumbs = () => {
    setTestType('breadcrumbs')
    
    // Add some breadcrumbs
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User clicked test button',
      level: 'info'
    })
    
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Processing test action',
      level: 'debug'
    })
    
    // Then trigger an error
    Sentry.captureMessage('Test message with breadcrumbs', 'warning')
    alert('Message with breadcrumbs sent to Sentry!')
  }

  const testApiError = async () => {
    setTestType('api')
    try {
      const response = await fetch('/api/test-error')
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: true,
          errorType: 'api'
        }
      })
      alert('API error captured and sent to Sentry!')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sentry Error Tracking Test</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            ⚠️ This page is for testing Sentry error tracking. 
            Click the buttons below to generate test errors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testClientError}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Throw Client Error
            <p className="text-sm mt-2 opacity-90">
              Throws an unhandled error
            </p>
          </button>

          <button
            onClick={testCapturedError}
            className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Capture Handled Error
            <p className="text-sm mt-2 opacity-90">
              Catches and reports an error
            </p>
          </button>

          <button
            onClick={testBreadcrumbs}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Test Breadcrumbs
            <p className="text-sm mt-2 opacity-90">
              Sends a message with context
            </p>
          </button>

          <button
            onClick={testApiError}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Test API Error
            <p className="text-sm mt-2 opacity-90">
              Calls non-existent API endpoint
            </p>
          </button>
        </div>

        {testType && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-700">
              Last test type: <span className="font-bold">{testType}</span>
            </p>
          </div>
        )}

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Setup Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Go to <a href="https://sentry.io" className="text-blue-600 underline" target="_blank">sentry.io</a> and create a free account</li>
            <li>Create a new project (select Next.js)</li>
            <li>Copy your DSN from the project settings</li>
            <li>Add to your .env.local file: <code className="bg-gray-200 px-2 py-1 rounded">NEXT_PUBLIC_SENTRY_DSN=your-dsn-here</code></li>
            <li>Add the same to Vercel environment variables</li>
            <li>Restart your dev server and test the buttons above</li>
          </ol>
        </div>
      </div>
    </div>
  )
}