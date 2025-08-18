'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AnalysisResults from '@/components/AnalysisResults'
import { ProjectAnalysis } from '@/lib/ai/gemini.service'
import { HomepageContent, UploadFormContent } from '@/lib/contentful'

// Import ProjectUpload with SSR disabled
const ProjectUpload = dynamic(() => import('@/components/ProjectUploadWithCMS'), {
  ssr: false,
  loading: () => <div className="max-w-4xl mx-auto p-8 text-center">Loading upload form...</div>
})

interface HomepageClientProps {
  homepageContent: HomepageContent
  uploadFormContent: UploadFormContent | null
}

export default function HomepageClient({ homepageContent, uploadFormContent }: HomepageClientProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(true)

  const handleAnalysisComplete = (analysis: ProjectAnalysis) => {
    setCurrentAnalysis(analysis)
    setIsAnalyzing(false)
    setShowUploadForm(false)
  }

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setCurrentAnalysis(null)
  }

  const handleFollowUpQuestion = async (question: string) => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: question,
          projectType: currentAnalysis?.projectType || 'followup',
          imageUrls: [],
          isFollowUp: true,
          previousAnalysis: currentAnalysis
        })
      })

      if (response.ok) {
        const newAnalysis = await response.json()
        setCurrentAnalysis(newAnalysis)
      }
    } catch (error) {
      console.error('Follow-up question error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewProject = () => {
    setCurrentAnalysis(null)
    setIsAnalyzing(false)
    setShowUploadForm(true)
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FF6B35'}}>
      <header className="py-8 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black text-navy-900 tracking-tight">AskToddy</h1>
            <p className="text-xl text-grey-800 mt-3 font-medium">The Local Expert That Never Leaves Your Side</p>
          </div>
          {!showUploadForm && (
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              New Project
            </button>
          )}
        </div>
      </header>
      
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-8">
          {showUploadForm && (
            <>
              {/* Hero Section with CMS Content */}
              <div className="bg-gradient-to-r from-white via-primary-50 to-secondary-50 border-2 border-primary-300 rounded-2xl shadow-2xl p-8 mb-8 overflow-hidden relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-300/20 to-primary-300/20 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900 mb-4">
                        {homepageContent.heroTitle}
                      </h2>
                      {homepageContent.heroSubtitle && (
                        <p className="text-xl text-grey-800 mb-4 font-semibold">
                          {homepageContent.heroSubtitle}
                        </p>
                      )}
                      <p className="text-lg text-grey-700 mb-6">
                        {homepageContent.heroDescription}
                      </p>
                    </div>
                    {homepageContent.features && homepageContent.features.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {homepageContent.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 group">
                            <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"></div>
                            <span className="text-grey-700 font-medium">{feature.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    <img 
                      src="/hero-construction.png" 
                      alt="Construction and DIY illustration"
                      className="w-full max-w-md h-auto"
                      onError={(e) => {
                        // Hide image if not found
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-primary-50 border-2 border-primary-200 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Subtle background pattern - with pointer-events-none to allow clicks through */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-primary-500 rounded-full"></div>
                  <div className="absolute bottom-8 left-8 w-12 h-12 bg-secondary-500 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary-400 rounded-full"></div>
                </div>
                <ProjectUpload 
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisStart={handleAnalysisStart}
                />
              </div>

              {/* Features Section from CMS */}
              {homepageContent.features && homepageContent.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-center mb-8 text-white">
                    {homepageContent.featuresTitle || 'Why Choose AskToddy'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {homepageContent.features.map((feature, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        {feature.icon && (
                          <div className="text-4xl mb-4">{feature.icon}</div>
                        )}
                        <h4 className="text-xl font-semibold mb-2 text-navy-900">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {(isAnalyzing || currentAnalysis) && (
            <AnalysisResults
              analysis={currentAnalysis}
              isLoading={isAnalyzing}
              onAskFollowUp={handleFollowUpQuestion}
            />
          )}
        </div>
      </main>
    </div>
  );
}