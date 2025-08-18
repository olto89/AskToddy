'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AnalysisResults from '@/components/AnalysisResults'
import { ProjectAnalysis } from '@/lib/ai/gemini.service'
import { HomepageContent, UploadFormContent } from '@/lib/contentful'

// Import components with SSR disabled
const ProjectUpload = dynamic(() => import('@/components/ProjectUploadWithCMS'), {
  ssr: false,
  loading: () => <div className="max-w-4xl mx-auto p-8 text-center">Loading upload form...</div>
})

const ToddyAdviceChat = dynamic(() => import('@/components/ToddyAdviceChat'), {
  ssr: false,
  loading: () => <div className="max-w-4xl mx-auto p-8 text-center">Loading chat...</div>
})

interface HomepageClientProps {
  homepageContent: HomepageContent
  uploadFormContent: UploadFormContent | null
}

export default function HomepageClient({ homepageContent, uploadFormContent }: HomepageClientProps) {
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(true)
  const [activeTab, setActiveTab] = useState<'advice' | 'checker'>('advice')

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
      <header className="py-6" style={{backgroundColor: '#FF6B35'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                <img src="/toddy-character.svg" alt="Toddy" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-heading">AskToddy</h1>
                <p className="text-sm text-white/90 font-medium">Professional Construction Analysis</p>
              </div>
            </div>
            {!showUploadForm && (
              <button
                onClick={handleNewProject}
                className="px-6 py-2.5 bg-white text-primary-600 rounded-lg hover:bg-white/90 transition-colors duration-200 font-medium shadow-lg"
              >
                New Project
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {showUploadForm && (
            <>
              {/* Hero Section with CMS Content */}
              <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 p-8 mb-8 hover:shadow-3xl transition-shadow duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-4xl font-bold text-navy-900 mb-4 leading-tight font-heading">
                        {homepageContent.heroTitle}
                      </h2>
                      {/* Debug: Show if content is from CMS */}
                      {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-grey-500 mb-2">
                          [Debug: {homepageContent.heroTitle.includes('hello test') ? 'FROM CMS' : 'FROM FALLBACK'}]
                        </p>
                      )}
                      {homepageContent.heroSubtitle && (
                        <p className="text-xl text-grey-600 mb-4 font-medium">
                          {homepageContent.heroSubtitle}
                        </p>
                      )}
                      <p className="text-lg text-grey-600 mb-6 leading-relaxed">
                        {homepageContent.heroDescription}
                      </p>
                    </div>
                    {homepageContent.features && homepageContent.features.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {homepageContent.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                            <span className="text-navy-700 font-medium text-sm">{feature.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    <div className="w-full max-w-md bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-navy-900 mb-2 font-heading">Professional Analysis</h3>
                        <p className="text-sm text-grey-600">AI-powered construction estimates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabbed Interface */}
              <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                {/* Tab Headers */}
                <div className="flex border-b border-primary-200">
                  <button
                    onClick={() => setActiveTab('advice')}
                    className={`flex-1 py-4 px-6 font-medium transition-colors duration-200 ${
                      activeTab === 'advice'
                        ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                        : 'text-grey-600 hover:text-navy-900 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Toddy Advice</span>
                      <span className="ml-2 px-2 py-1 bg-success text-white text-xs rounded-full font-medium">NEW</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('checker')}
                    className={`flex-1 py-4 px-6 font-medium transition-colors duration-200 ${
                      activeTab === 'checker'
                        ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                        : 'text-grey-600 hover:text-navy-900 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Project Checker</span>
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-primary-50">
                  {activeTab === 'advice' ? (
                    <div className="p-6">
                      <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-navy-900 mb-2 font-heading">Expert Construction Advice</h3>
                        <p className="text-grey-600">Get professional guidance on tools, materials, and building projects</p>
                      </div>
                      <ToddyAdviceChat />
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-navy-900 mb-2 font-heading">Project Analysis</h3>
                        <p className="text-grey-600">Upload photos for instant AI-powered cost estimates and recommendations</p>
                      </div>
                      <ProjectUpload 
                        onAnalysisComplete={handleAnalysisComplete}
                        onAnalysisStart={handleAnalysisStart}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Boxes */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Instant Quotes */}
                <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 p-6 hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2 font-heading">Instant Quotes</h3>
                  <p className="text-grey-600 text-sm">Get immediate cost estimates for your construction projects</p>
                </div>

                {/* AI Powered Analysis */}
                <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 p-6 hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2 font-heading">AI Powered Analysis</h3>
                  <p className="text-grey-600 text-sm">Smart analysis of your project photos and requirements</p>
                </div>

                {/* Detailed Breakdowns */}
                <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 p-6 hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2 font-heading">Detailed Breakdowns</h3>
                  <p className="text-grey-600 text-sm">Comprehensive cost and material breakdowns for planning</p>
                </div>

                {/* Professional Advice */}
                <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 p-6 hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2 font-heading">Professional Advice</h3>
                  <p className="text-grey-600 text-sm">Expert guidance from experienced construction professionals</p>
                </div>
              </div>

              {/* Features Section from CMS */}
              {homepageContent.features && homepageContent.features.length > 0 && (
                <div className="mt-12">
                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-white mb-4 font-heading">
                      {homepageContent.featuresTitle || 'Why Choose AskToddy'}
                    </h3>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                      Professional construction analysis powered by AI and real market data
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {homepageContent.features.map((feature, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-2xl border-2 border-primary-300 p-6 hover:shadow-3xl hover:scale-105 transition-all duration-300">
                        {feature.icon && (
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">{feature.icon}</span>
                          </div>
                        )}
                        <h4 className="text-xl font-semibold mb-3 text-navy-900 font-heading">
                          {feature.title}
                        </h4>
                        <p className="text-grey-600 leading-relaxed">
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