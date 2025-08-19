'use client'

// import * as Sentry from "@sentry/nextjs" // Temporarily disabled
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry - temporarily disabled
    // Sentry.captureException(error, {
    //   tags: {
    //     error_boundary: 'global',
    //     digest: error.digest
    //   }
    // })
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-600 mb-4">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={reset}
              className="w-full bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}