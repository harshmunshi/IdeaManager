'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Idea } from '@/types'
import MarketResearchModal from './MarketResearchModal'
import VotingButtons from './VotingButtons'
import UpvoteButtons from './UpvoteButtons'
import CommentsSection from './CommentsSection'
import IdeaDetailModal from './IdeaDetailModal'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface IdeaCardProps {
  idea: Idea & {
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
  }
  onGenerateIdeas?: (ideaId: number) => void
  onIdeaDeleted?: (ideaId: number) => void
}

export default function IdeaCard({ idea, onGenerateIdeas, onIdeaDeleted }: IdeaCardProps) {
  const [showMarketResearch, setShowMarketResearch] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { token, user } = useAuth()

  // State for voting and comments
  const [voteCounts, setVoteCounts] = useState({
    help_build_count: idea.vote_counts?.help_build_count || 0,
    use_service_count: idea.vote_counts?.use_service_count || 0,
    upvote_count: idea.vote_counts?.upvote_count || 0,
    downvote_count: idea.vote_counts?.downvote_count || 0,
    net_votes: idea.vote_counts?.net_votes || 0,
    user_help_build_vote: idea.vote_counts?.user_help_build_vote || false,
    user_use_service_vote: idea.vote_counts?.user_use_service_vote || false,
    user_upvote_status: idea.vote_counts?.user_upvote_status || null
  })
  const [commentsCount, setCommentsCount] = useState(idea.comments_count || 0)

  // Check if current user can delete this idea
  const canDelete = user && idea.created_by === user.id

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = async () => {
    if (!token) {
      toast.error('Authentication required')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Idea deleted successfully')
        onIdeaDeleted?.(idea.id)
        setShowDeleteConfirm(false)
      } else {
        toast.error(data.message || 'Failed to delete idea')
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group card-hover cursor-pointer bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 relative overflow-hidden h-full min-h-[480px] flex flex-col"
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4 lg:mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-2 lg:mb-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex-shrink-0"></div>
              {idea.parent_idea_id && (
                <span className="badge-gray text-xs">Generated</span>
              )}
              <span className="badge-primary text-xs truncate">
                {(idea as any).user_email === user?.email ? 'You' : (idea as any).user_email}
              </span>
            </div>
            <h3 
              onClick={() => setShowDetailModal(true)}
              className="text-base sm:text-lg lg:text-xl font-semibold mb-2 lg:mb-3 group-hover:text-primary-700 transition-colors cursor-pointer hover:underline line-clamp-2"
            >
              {idea.title}
            </h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed line-clamp-2 lg:line-clamp-3">
              {idea.description}
            </p>
          </div>
          
          {/* Delete Button - Only show for user's own ideas */}
          {canDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-2 sm:ml-4 p-1 sm:p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Delete idea"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Card Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">Created {formatDate(idea.created_at)}</span>
          </div>
          {idea.market_research && (
            <div className="flex items-center gap-1 text-success-600 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium hidden sm:inline">Research Done</span>
              <span className="font-medium sm:hidden">✓</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mb-3 lg:mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMarketResearch(true)}
            className="flex-1 btn-secondary text-xs sm:text-sm py-2 sm:py-3 min-w-0"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Research</span>
          </motion.button>

          {onGenerateIdeas && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onGenerateIdeas(idea.id)}
              className="flex-1 btn-primary text-xs sm:text-sm py-2 sm:py-3 min-w-0"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate</span>
            </motion.button>
          )}
        </div>

        {/* Voting and Interaction Section - Push to bottom */}
        <div className="border-t pt-2 sm:pt-3 lg:pt-4 space-y-2 sm:space-y-3 lg:space-y-4 overflow-hidden mt-auto">
          {/* Voting Buttons - Vertical Layout */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full min-w-0">
            {/* Up/Down vote buttons - Top, centered */}
            <div className="flex justify-center min-w-0 overflow-hidden">
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
            
            {/* Help Build and Would Use buttons - Bottom, centered */}
            <div className="flex justify-center w-full min-w-0 overflow-hidden">
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
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection
            ideaId={idea.id}
            commentsCount={commentsCount}
            onCommentsUpdate={setCommentsCount}
          />
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-backdrop"
                onClick={() => setShowDeleteConfirm(false)}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md mx-auto"
              >
                <div className="card-large text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <h3 className="heading-3 mb-3">Delete Idea</h3>
                  <p className="text-body mb-2">Are you sure you want to delete this idea?</p>
                  <p className="text-sm text-gray-600 mb-8">
                    "<strong>{idea.title}</strong>" will be permanently deleted. This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-secondary"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 btn-danger"
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 spinner"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <MarketResearchModal
        idea={idea}
        isOpen={showMarketResearch}
        onClose={() => setShowMarketResearch(false)}
      />

      <IdeaDetailModal
        idea={idea}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  )
} 