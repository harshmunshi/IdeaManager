'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Idea, IdeaComment } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import VotingButtons from './VotingButtons'
import UpvoteButtons from './UpvoteButtons'
import CommentsSection from './CommentsSection'

interface IdeaDetailModalProps {
  idea: (Idea & {
    vote_counts?: {
      help_build_count: number
      use_service_count: number
      upvote_count: number
      downvote_count: number
      net_votes: number
      user_help_build_vote: boolean
      user_use_service_vote: boolean
      user_upvote_status: 1 | -1 | null
    }
    comments_count?: number
  }) | null
  isOpen: boolean
  onClose: () => void
}

export default function IdeaDetailModal({ idea, isOpen, onClose }: IdeaDetailModalProps) {
  const { user } = useAuth()
  const [voteCounts, setVoteCounts] = useState({
    help_build_count: 0,
    use_service_count: 0,
    upvote_count: 0,
    downvote_count: 0,
    net_votes: 0,
    user_help_build_vote: false,
    user_use_service_vote: false,
    user_upvote_status: null as 1 | -1 | null
  })
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    if (idea && idea.vote_counts) {
      setVoteCounts({
        help_build_count: idea.vote_counts.help_build_count || 0,
        use_service_count: idea.vote_counts.use_service_count || 0,
        upvote_count: idea.vote_counts.upvote_count || 0,
        downvote_count: idea.vote_counts.downvote_count || 0,
        net_votes: idea.vote_counts.net_votes || 0,
        user_help_build_vote: idea.vote_counts.user_help_build_vote || false,
        user_use_service_vote: idea.vote_counts.user_use_service_vote || false,
        user_upvote_status: idea.vote_counts.user_upvote_status || null
      })
    }
    if (idea) {
      setCommentsCount(idea.comments_count || 0)
    }
  }, [idea])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!idea) return null

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
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Idea Details</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Idea Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    {idea.parent_idea_id && (
                      <span className="badge-gray text-sm">Generated</span>
                    )}
                    <span className="badge-primary text-sm">
                      {(idea as any).user_email === user?.email ? 'You' : (idea as any).user_email}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {idea.title}
                  </h1>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {idea.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Created {formatDate(idea.created_at)}</span>
                    </div>
                    {idea.market_research && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Market Research Available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voting Section */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Engagement</h3>
                  <div className="flex items-center justify-between">
                    <VotingButtons
                      ideaId={idea.id}
                      voteCounts={{
                        help_build_count: voteCounts.help_build_count,
                        use_service_count: voteCounts.use_service_count,
                        user_help_build_vote: voteCounts.user_help_build_vote,
                        user_use_service_vote: voteCounts.user_use_service_vote
                      }}
                      onVoteUpdate={(newCounts) => setVoteCounts(prev => ({ ...prev, ...newCounts }))}
                    />
                    
                    <UpvoteButtons
                      ideaId={idea.id}
                      voteCounts={{
                        upvote_count: voteCounts.upvote_count,
                        downvote_count: voteCounts.downvote_count,
                        net_votes: voteCounts.net_votes,
                        user_upvote_status: voteCounts.user_upvote_status
                      }}
                      onVoteUpdate={(newCounts) => setVoteCounts(prev => ({ ...prev, ...newCounts }))}
                    />
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
                  <CommentsSection
                    ideaId={idea.id}
                    commentsCount={commentsCount}
                    onCommentsUpdate={setCommentsCount}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 