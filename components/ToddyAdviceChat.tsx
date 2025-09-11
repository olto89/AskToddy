'use client'

import { useState, useRef, useEffect } from 'react'
import FeedbackModal from './FeedbackModal'
import { trackEvents } from '@/lib/analytics/analytics.service'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  images?: string[]
}

interface ToddyAdviceChatProps {
  className?: string
}

export default function ToddyAdviceChat({ className = '' }: ToddyAdviceChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Toddy 👋\n\nI can help you with:\n• Tool hire prices & recommendations\n• Material costs & suppliers\n• DIY project guidance\n• Professional building advice\n\nWhat would you like to know? You can also upload photos or videos of your job!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [sessionFeedbackGiven, setSessionFeedbackGiven] = useState(false) // Fallback for Safari private mode
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    
    // Check if we should show feedback modal
    const userMessageCount = messages.filter(m => m.role === 'user').length
    
    // Skip if already shown this session
    if (sessionFeedbackGiven || showFeedback) return
    
    // Simple check for localStorage availability
    let feedbackGiven = false
    try {
      feedbackGiven = localStorage.getItem('feedbackGiven') === 'true'
    } catch (error) {
      // localStorage blocked - continue anyway
    }
    
    // Show modal after 5 messages if not given feedback
    if (!feedbackGiven && userMessageCount >= 5) {
      console.log('Showing feedback modal after', userMessageCount, 'messages')
      setShowFeedback(true)
      trackEvents.feedbackModalShown()
    }
  }, [messages, showFeedback, sessionFeedbackGiven])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleImageUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidImage = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidImage && isValidSize
    })

    if (validFiles.length === 0) {
      alert('Please upload valid image or video files under 10MB')
      return
    }

    // Track image upload
    trackEvents.imageUploaded(validFiles.length)

    const newImageUrls: string[] = []
    for (const file of validFiles.slice(0, 4)) { // Limit to 4 files
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newImageUrls.push(e.target.result as string)
          if (newImageUrls.length === validFiles.length) {
            setUploadedImages(prev => [...prev, ...newImageUrls])
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isLoading) return

    // Track message sent
    trackEvents.messageSent({
      hasText: !!input.trim(),
      hasImages: uploadedImages.length > 0,
      messageCount: messages.filter(m => m.role === 'user').length + 1
    })

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || (uploadedImages.length > 0 ? `Uploaded ${uploadedImages.length} image(s)` : ''),
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    const currentImages = [...uploadedImages]
    setInput('')
    setUploadedImages([])
    setIsLoading(true)

    try {
      const response = await fetch('/api/toddy-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-6),
          imageUrls: currentImages
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having connection issues. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const exampleQuestions = [
    "Tool hire prices",
    "Decking costs",
    "Bathroom renovation",
    "Best concrete mixer"
  ]

  const handleExampleClick = (question: string) => {
    trackEvents.exampleQuestionClicked(question)
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className={`h-full flex flex-col ${className}`} style={{
      touchAction: 'manipulation',
      overscrollBehavior: 'none'
    }}>
      {/* Messages Area - Fixed mobile scrolling */}
      <div 
        className="flex-1 overflow-y-auto pb-2" 
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          position: 'relative'
        }}
      >
        <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.role === 'assistant' ? (
                    <div style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} className="w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                  ) : (
                    <div style={{background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)'}} className="w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Message bubble */}
                <div 
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.role === 'user' 
                      ? '' 
                      : 'bg-white'
                  }`}
                  style={message.role === 'user' ? {
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                    color: 'white'
                  } : {
                    border: '1px solid #e2e6ea'
                  }}
                >
                  {/* Images if present */}
                  {message.images && message.images.length > 0 && (
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {message.images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Uploaded image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words select-text ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} className="w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div className="px-4 py-3 bg-white rounded-2xl shadow-sm" style={{border: '1px solid #e2e6ea'}}>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: '#FF6B35', animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: '#FF6B35', animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: '#FF6B35', animationDelay: '300ms'}}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions - Only show at start */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-3" style={{background: 'linear-gradient(to top, #ffffff 0%, #f9fafb 100%)'}}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-gray-600 mb-2 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className="px-3 py-2 bg-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
                  style={{
                    border: '1px solid #ffbfa8',
                    color: '#FF6B35'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff7f3'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom, mobile-optimized */}
      <div className="bg-white px-4 py-3 shadow-lg" style={{borderTop: '1px solid #e2e6ea'}}>
        <div className="max-w-3xl mx-auto">
          {/* Image previews */}
          {uploadedImages.length > 0 && (
            <div className="mb-3 flex gap-2 flex-wrap">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... or upload photos/videos of your job!"
                className="w-full px-4 py-4 pr-20 rounded-2xl resize-none focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-500 leading-relaxed"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e2e6ea',
                  focusBorderColor: '#FF6B35',
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FF6B35'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e6ea'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                rows={1}
                disabled={isLoading}
              />
              
              {/* Image upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Upload image or video"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Character count for long messages */}
              {input.length > 200 && (
                <span className="absolute bottom-2 right-20 text-xs text-gray-400">
                  {input.length}/1000
                </span>
              )}
            </div>
            
            <button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedImages.length === 0) || isLoading}
              className="p-3 rounded-full transition-all transform active:scale-95 shadow-md hover:shadow-lg"
              style={{
                background: (!input.trim() && uploadedImages.length === 0) || isLoading 
                  ? '#e2e6ea' 
                  : 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                color: (!input.trim() && uploadedImages.length === 0) || isLoading ? '#9ca4af' : 'white'
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => {
          console.log('Feedback modal closed')
          setShowFeedback(false)
          setSessionFeedbackGiven(true) // Mark as given for this session
        }}
        messageCount={messages.filter(m => m.role === 'user').length}
      />
      
      {/* Manual feedback button as fallback */}
      {!showFeedback && !sessionFeedbackGiven && messages.filter(m => m.role === 'user').length >= 7 && (
        <button
          onClick={() => {
            console.log('Manual feedback trigger')
            setShowFeedback(true)
            trackEvents.feedbackModalShown()
          }}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm shadow-lg z-40 hover:shadow-xl transition-shadow"
        >
          💬 Give Feedback
        </button>
      )}
    </div>
  )
}