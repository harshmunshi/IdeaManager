'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Idea } from '@/types'

interface IdeaGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  rootIdea: Idea | null
  onIdeasGenerated: (ideas: Idea[]) => void
}

export default function IdeaGenerationModal({ 
  isOpen, 
  onClose, 
  rootIdea, 
  onIdeasGenerated 
}: IdeaGenerationModalProps) {
  const [context, setContext] = useState('')
  const [maxIdeas, setMaxIdeas] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rootIdea || !context.trim()) {
      toast.error('Please provide context for idea generation')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rootIdeaId: rootIdea.id,
          context: context.trim(),
          maxIdeas,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Generated ${data.ideas.length} new ideas!`)
        onIdeasGenerated(data.ideas)
        onClose()
        setContext('')
        setMaxIdeas(3)
      } else {
        toast.error(data.message || 'Failed to generate ideas')
      }
    } catch (error) {
      console.error('Error generating ideas:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    onClose()
    setContext('')
    setMaxIdeas(3)
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
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content relative z-10 max-w-3xl w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="heading-3 text-gray-900">Generate Ideas</h3>
                    <p className="text-caption mt-1">AI-powered idea generation from: {rootIdea?.title}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="btn-ghost p-2 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Root Idea Preview */}
              {rootIdea && (
                <div className="p-8 border-b border-gray-100 bg-gray-50">
                  <h4 className="heading-4 mb-3">Root Idea</h4>
                  <div className="card bg-white p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">{rootIdea.title}</h5>
                    <p className="text-body text-sm leading-relaxed">{rootIdea.description}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="context" className="block text-sm font-semibold text-gray-800 mb-3">
                      Generation Context
                    </label>
                    <textarea
                      id="context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Provide specific context to guide AI generation. For example: 'Focus on mobile apps for teenagers', 'B2B solutions for small businesses', 'Sustainable and eco-friendly approaches', or 'Cost-effective alternatives'..."
                      required
                    />
                    <p className="mt-2 text-caption">
                      Be specific about the direction, target audience, industry, or constraints you want the AI to consider.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="maxIdeas" className="block text-sm font-semibold text-gray-800 mb-3">
                      Number of Ideas to Generate
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxIdeas(num)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            maxIdeas === num
                              ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {[6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxIdeas(num)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            maxIdeas === num
                              ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-caption">
                      More ideas = broader exploration, fewer ideas = more focused results
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 spinner"></div>
                        <span>Generating Ideas...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate {maxIdeas} Idea{maxIdeas > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 