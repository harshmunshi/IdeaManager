'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Idea, MarketResearch } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface MarketResearchModalProps {
  idea: Idea
  isOpen: boolean
  onClose: () => void
}

export default function MarketResearchModal({ idea, isOpen, onClose }: MarketResearchModalProps) {
  const [marketResearch, setMarketResearch] = useState<MarketResearch | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (isOpen && idea.id) {
      fetchMarketResearch()
    }
  }, [isOpen, idea.id])

  const fetchMarketResearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/ideas/${idea.id}/market-research`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setMarketResearch(data.marketResearch)
      }
    } catch (error) {
      console.error('Error fetching market research:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMarketResearch = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/ideas/${idea.id}/market-research`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success) {
        setMarketResearch(data.marketResearch)
        toast.success('Market research generated successfully!')
      } else {
        toast.error(data.message || 'Failed to generate market research')
      }
    } catch (error) {
      console.error('Error generating market research:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^## (.*$)/gim, '<h2 class="heading-3 text-gray-900 mt-8 mb-4 first:mt-0">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="heading-4 text-gray-800 mt-6 mb-3">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/\n/g, '<br class="mb-2">')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content relative z-10 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="heading-3 text-gray-900">Market Research</h3>
                    <p className="text-caption mt-1 max-w-md">{idea.title}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn-ghost p-2 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 spinner mx-auto mb-4"></div>
                      <p className="text-body">Loading market research...</p>
                    </div>
                  </div>
                ) : marketResearch ? (
                  <div>
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(marketResearch.research_data) }}
                    />
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                      <p className="text-caption">
                        Generated on {new Date(marketResearch.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="heading-3 mb-3">Generate Market Research</h4>
                    <p className="text-body mb-8 max-w-md mx-auto">
                      Get comprehensive AI-powered market analysis including competitive landscape, opportunities, and strategic insights for your idea.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateMarketResearch}
                      disabled={isGenerating}
                      className="btn-primary text-base"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 spinner"></div>
                          <span>Generating Research...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Generate Market Research</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 