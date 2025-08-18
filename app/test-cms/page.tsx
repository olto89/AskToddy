'use client'

import { useState } from 'react'
import ProjectUploadWithCMS from '@/components/ProjectUploadWithCMS'
import { isContentfulConfigured } from '@/lib/contentful'

export default function TestCMS() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const configured = isContentfulConfigured()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Contentful CMS Test</h1>
          
          {!configured ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-yellow-900 mb-4">
                ⚠️ Contentful Not Configured
              </h2>
              <p className="text-yellow-800 mb-4">
                To enable CMS content, follow these steps:
              </p>
              <ol className="text-left text-yellow-800 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://app.contentful.com" className="text-blue-600 underline" target="_blank">app.contentful.com</a></li>
                <li>Create a space (or use existing)</li>
                <li>Go to Settings → API keys</li>
                <li>Create/copy your Content Delivery API key</li>
                <li>Add to .env.local:
                  <pre className="bg-gray-100 p-2 mt-2 rounded text-sm">
{`NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your-space-id
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your-token`}
                  </pre>
                </li>
                <li>Create content models as described in docs/CONTENTFUL_SETUP.md</li>
                <li>Restart dev server</li>
              </ol>
              <p className="text-yellow-700 mt-4 font-medium">
                Currently using hardcoded fallback content
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800">
                ✅ Contentful is configured and active
              </p>
              <p className="text-green-700 text-sm mt-2">
                Content is being fetched from your CMS
              </p>
            </div>
          )}
        </div>

        {/* CMS-enabled upload form */}
        <ProjectUploadWithCMS
          onAnalysisStart={() => setLoading(true)}
          onAnalysisComplete={(result) => {
            setAnalysis(result)
            setLoading(false)
          }}
        />

        {/* Show analysis results */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-gray-600">Analyzing your project...</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Analysis Complete!</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Benefits of CMS Integration:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Change form labels without deploying</li>
            <li>✅ Update project types dynamically</li>
            <li>✅ Customize validation messages</li>
            <li>✅ A/B test different button text</li>
            <li>✅ Add seasonal promotions to form</li>
            <li>✅ Marketing team can edit copy</li>
            <li>✅ Multi-language support ready</li>
          </ul>
        </div>
      </div>
    </div>
  )
}