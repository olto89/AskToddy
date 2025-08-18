'use client'

import { useState, useRef, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ToddyAdviceChatProps {
  className?: string
}

export default function ToddyAdviceChat({ className = '' }: ToddyAdviceChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Alright! I'm Toddy, your local building expert with access to REAL UK market pricing data! I can help you with:\n\n🔨 Tool recommendations with CURRENT hire prices\n🏪 Where to hire tools with proper daily rates\n📦 Material costs from recent industry research\n💷 Project estimates based on Which? & Construction News data\n👷 Finding trusted builders & suppliers\n💡 DIY advice with realistic budgets\n\n✨ Unlike generic AI tools, my pricing comes from proper UK sources like Which?, Construction News, and trade publications - giving you accurate, researched costs!\n\nWhat are you looking to get sorted then?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Log chat interaction
      Sentry.addBreadcrumb({
        category: 'chat',
        message: 'User sent message to Toddy Advice',
        level: 'info',
        data: {
          messageLength: input.length
        }
      })

      const response = await fetch('/api/toddy-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-6) // Send last 6 messages for context
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
      Sentry.captureException(error, {
        tags: {
          component: 'ToddyAdviceChat'
        }
      })
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry mate, I'm having a bit of trouble connecting right now. Give it another go in a moment!",
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
    "What's the current hire price for a concrete mixer?",
    "How much does composite decking cost per sqm?",
    "Tool hire costs for building a deck?",
    "Current timber prices in the UK?"
  ]

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className={`flex flex-col h-[600px] ${className}`}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-primary-50/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'bg-white border border-grey-200 text-navy-900 shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    T
                  </div>
                  <span className="font-semibold text-primary-600">Toddy</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-grey-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <span className="font-semibold text-primary-600">Toddy is thinking...</span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-grey-200 bg-grey-50">
          <p className="text-xs text-grey-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(question)}
                className="text-xs px-3 py-1.5 bg-white border border-primary-200 text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-grey-200 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Toddy about tools, materials, or building advice..."
            className="flex-1 px-4 py-2 border border-grey-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              !input.trim() || isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105 shadow-md'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}