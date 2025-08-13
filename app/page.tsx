'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AnalysisResults from '@/components/AnalysisResults'
import { ProjectAnalysis } from '@/lib/ai/gemini.service'

// Import ProjectUpload with SSR disabled
const ProjectUpload = dynamic(() => import('@/components/ProjectUploadClient'), {
  ssr: false,
  loading: () => <div className="max-w-4xl mx-auto p-8 text-center">Loading upload form...</div>
})

export default function Home() {
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
      // Make follow-up API call with the question
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
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-white via-primary-50 to-secondary-50 border-2 border-primary-300 rounded-2xl shadow-2xl p-8 mb-8 overflow-hidden relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-300/20 to-primary-300/20 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900 mb-4">
                        Get an Instant Quote for Your Project
                      </h2>
                      <p className="text-lg text-grey-700 mb-6">
                        Upload photos and describe your project. Our AI will analyze and provide detailed cost estimates, 
                        difficulty levels, tools needed, and contractor recommendations.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 group">
                        <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-grey-700 font-medium">Instant AI Analysis</span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-grey-700 font-medium">UK Market Prices</span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="w-2 h-2 bg-primary-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="text-grey-700 font-medium">Professional Advice</span>
                      </div>
                    </div>
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
