'use client'

import { useState } from 'react'
import { ProjectAnalysis } from '@/lib/ai/gemini.service'

interface AnalysisResultsProps {
  analysis: ProjectAnalysis | null
  isLoading: boolean
  onAskFollowUp: (question: string) => void
}

export default function AnalysisResults({ analysis, isLoading, onAskFollowUp }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'materials' | 'steps' | 'contractors'>('overview')
  const [followUpQuestion, setFollowUpQuestion] = useState('')

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-primary-50 border border-primary-200 rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-navy-800">Analyzing your project...</h3>
          <p className="text-grey-700 text-center max-w-md">
            Our AI is examining your images and description to provide detailed estimates and recommendations
          </p>
          <div className="flex space-x-2 mt-4">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Difficult': return 'bg-orange-100 text-orange-800'
      case 'Professional Required': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const suggestedQuestions = [
    "What permits might I need?",
    "Can you break down the steps in more detail?",
    "What's the best time of year for this project?",
    "How can I save money on materials?",
    "What are common mistakes to avoid?"
  ]

  const tradeRecommendations = [
    { trade: 'General Contractor', when: 'Complex renovations', icon: '🏗️' },
    { trade: 'Electrician', when: 'Electrical work', icon: '⚡' },
    { trade: 'Plumber', when: 'Water/gas lines', icon: '🔧' },
    { trade: 'Carpenter', when: 'Structural wood work', icon: '🪵' },
    { trade: 'Painter', when: 'Professional finish', icon: '🎨' }
  ]

  const toolStores = [
    { name: 'B&Q', type: 'DIY Superstore', priceLevel: '$$' },
    { name: 'Wickes', type: 'Trade & DIY', priceLevel: '$$' },
    { name: 'Screwfix', type: 'Trade Tools', priceLevel: '$' },
    { name: 'Local Ironmongers', type: 'Specialist', priceLevel: '$$$' }
  ]

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <div className="bg-gradient-to-br from-white to-primary-50 border border-primary-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header with Key Metrics */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-4">Your Project Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-primary-100 text-sm">Estimated Cost</p>
              <p className="text-2xl font-bold">
                £{analysis.estimatedCost.total.min} - £{analysis.estimatedCost.total.max}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">DIY Time</p>
              <p className="text-2xl font-bold">{analysis.timeEstimate.diy}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Difficulty</p>
              <p className="text-2xl font-bold">{analysis.difficultyLevel}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Project Type</p>
              <p className="text-2xl font-bold capitalize">{analysis.projectType}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {(['overview', 'tools', 'materials', 'steps', 'contractors'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-grey-500 hover:text-grey-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Difficulty Badge */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Difficulty Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(analysis.difficultyLevel)}`}>
                  {analysis.difficultyLevel}
                </span>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Cost Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Materials:</span>
                    <span className="font-medium">
                      £{analysis.estimatedCost.materials.min} - £{analysis.estimatedCost.materials.max}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labour (if hired):</span>
                    <span className="font-medium">
                      £{analysis.estimatedCost.labor.min} - £{analysis.estimatedCost.labor.max}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-primary-600">
                      £{analysis.estimatedCost.total.min} - £{analysis.estimatedCost.total.max}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Comparison */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Time Investment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-grey-600 mb-1">DIY Approach</p>
                    <p className="text-xl font-semibold text-primary-600">{analysis.timeEstimate.diy}</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4">
                    <p className="text-sm text-grey-600 mb-1">Professional</p>
                    <p className="text-xl font-semibold text-success">{analysis.timeEstimate.professional}</p>
                  </div>
                </div>
              </div>

              {/* Safety Warnings */}
              {analysis.safetyConsiderations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 text-yellow-800">⚠️ Safety First</h3>
                  <ul className="space-y-1">
                    {analysis.safetyConsiderations.map((safety, index) => (
                      <li key={index} className="text-yellow-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{safety}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Professional Warning */}
              {analysis.requiresProfessional && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 text-red-800">🚨 Professional Recommended</h3>
                  <ul className="space-y-1">
                    {analysis.professionalReasons?.map((reason, index) => (
                      <li key={index} className="text-red-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Tools You'll Need</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.toolsNeeded.map((tool, index) => (
                  <div key={index} className="border border-primary-200 bg-gradient-to-r from-white to-primary-50 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-all duration-200">
                    <div>
                      <p className="font-medium text-navy-800">{tool.name}</p>
                      <p className="text-sm text-grey-600">
                        {tool.required ? (
                          <span className="text-primary-600 font-medium">Required</span>
                        ) : (
                          <span className="text-secondary-600">Optional</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">£{tool.estimatedCost}</p>
                      <p className="text-xs text-grey-500">estimated</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Where to Get Tools</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {toolStores.map((store, index) => (
                    <div key={index} className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                      <p className="font-medium text-sm text-navy-800">{store.name}</p>
                      <p className="text-xs text-grey-600">{store.type}</p>
                      <p className="text-xs font-semibold mt-1 text-primary-600">{store.priceLevel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Materials List</h3>
              <div className="space-y-3">
                {analysis.materials.map((material, index) => (
                  <div key={index} className="border border-secondary-200 bg-gradient-to-r from-white to-secondary-50 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-all duration-200">
                    <div>
                      <p className="font-medium text-navy-800">{material.name}</p>
                      <p className="text-sm text-grey-600">Quantity: {material.quantity}</p>
                    </div>
                    <p className="font-semibold text-secondary-600">£{material.estimatedCost}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-navy-800">
                  💡 Tip: Buy 10% extra materials to account for mistakes and waste
                </p>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Step-by-Step Guide</h3>
              <div className="space-y-3">
                {analysis.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contractors' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">
                {(analysis as any)?.recommendedContractors ? 'Recommended Local Contractors' : 'Professional Help'}
              </h3>
              
              {/* Show actual contractor recommendations if available */}
              {(analysis as any)?.recommendedContractors && (analysis as any).recommendedContractors.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✅ Found {(analysis as any).recommendedContractors.length} highly-rated contractors near {(analysis as any).contractorSearchLocation}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {(analysis as any).recommendedContractors.map((contractor: any, index: number) => (
                      <div key={index} className="border border-primary-200 bg-gradient-to-br from-white to-primary-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-navy-800 text-lg">{contractor.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                <span className="text-yellow-400 text-sm">★</span>
                                <span className="font-medium text-sm ml-1">{contractor.rating}/5</span>
                              </div>
                              <span className="text-grey-500 text-sm">({contractor.reviewCount} reviews)</span>
                              {contractor.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                              )}
                            </div>
                            <p className="text-sm text-grey-600 mt-1">{contractor.location.address}</p>
                          </div>
                          {contractor.openNow !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              contractor.openNow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {contractor.openNow ? 'Open Now' : 'Closed'}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {contractor.trades.map((trade: string, tradeIndex: number) => (
                            <span key={tradeIndex} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                              {trade}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                            {contractor.contact.phone && (
                              <a 
                                href={`tel:${contractor.contact.phone}`}
                                className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors flex items-center"
                              >
                                📞 Call
                              </a>
                            )}
                            {contractor.contact.website && (
                              <a 
                                href={contractor.contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors flex items-center"
                              >
                                🌐 Website
                              </a>
                            )}
                          </div>
                          <span className="text-xs text-grey-500">{contractor.source}</span>
                        </div>
                        
                        {/* Show recent reviews if available */}
                        {contractor.reviews && contractor.reviews.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-grey-200">
                            <p className="text-xs text-grey-600 mb-2">Recent review:</p>
                            <p className="text-sm text-grey-700 italic">"{contractor.reviews[0].text.slice(0, 100)}..."</p>
                            <p className="text-xs text-grey-500 mt-1">- {contractor.reviews[0].author}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback to generic recommendations */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tradeRecommendations.map((trade, index) => (
                    <div key={index} className="border border-primary-200 bg-gradient-to-br from-white to-primary-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{trade.icon}</span>
                        <div>
                          <p className="font-medium text-navy-800">{trade.trade}</p>
                          <p className="text-sm text-grey-600">Best for: {trade.when}</p>
                        </div>
                      </div>
                      <button className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors group-hover:translate-x-1 duration-200">
                        Find local {trade.trade.toLowerCase()}s →
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-navy-800">
                  💼 Always get 3+ quotes and check references before hiring
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Questions Section */}
      <div className="bg-gradient-to-br from-white to-secondary-50 border border-secondary-200 rounded-2xl shadow-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Need More Information?</h3>
        
        {/* Quick Question Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onAskFollowUp(question)}
              className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 hover:from-primary-200 hover:to-secondary-200 border border-primary-200 rounded-full text-sm text-navy-700 transition-all duration-200 hover:shadow-sm"
            >
              {question}
            </button>
          ))}
        </div>

        {/* Custom Question Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && followUpQuestion) {
                onAskFollowUp(followUpQuestion)
                setFollowUpQuestion('')
              }
            }}
            placeholder="Ask a specific question about your project..."
            className="flex-1 px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <button
            onClick={() => {
              if (followUpQuestion) {
                onAskFollowUp(followUpQuestion)
                setFollowUpQuestion('')
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}