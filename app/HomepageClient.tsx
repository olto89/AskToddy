'use client'

import dynamic from 'next/dynamic'
import { HomepageContent, UploadFormContent } from '@/lib/contentful'

// Import chat component with SSR disabled
const ToddyAdviceChat = dynamic(() => import('@/components/ToddyAdviceChat'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}}>
      <div className="text-white text-lg font-semibold animate-pulse">Loading Toddy...</div>
    </div>
  )
})

interface HomepageClientProps {
  homepageContent: HomepageContent
  uploadFormContent: UploadFormContent | null
}

export default function HomepageClient({ homepageContent, uploadFormContent }: HomepageClientProps) {
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Mobile-optimized Header with AskToddy Brand */}
      <header style={{background: 'linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%)'}} className="shadow-lg">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                <img src="/toddy-character.png" alt="Toddy" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">AskToddy</h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium">Your Construction Expert</p>
              </div>
            </div>
            {/* Optional menu button for future features */}
            <button className="lg:hidden p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Chat Interface - Full height mobile optimized */}
      <main className="flex-1 overflow-hidden" style={{background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)'}}>
        <ToddyAdviceChat />
      </main>
    </div>
  )
}