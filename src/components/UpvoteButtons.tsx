'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { ArrowUpIcon as ArrowUpIconSolid, ArrowDownIcon as ArrowDownIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface UpvoteButtonsProps {
  ideaId: number
  voteCounts: {
    upvote_count: number
    downvote_count: number
    net_votes: number
    user_upvote_status: 1 | -1 | null
  }
  onVoteUpdate: (newCounts: {
    upvote_count: number
    downvote_count: number
    net_votes: number
    user_upvote_status: 1 | -1 | null
  }) => void
}

export default function UpvoteButtons({ ideaId, voteCounts, onVoteUpdate }: UpvoteButtonsProps) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (voteValue: 1 | -1) => {
    if (!token) {
      toast.error('Please log in to vote')
      return
    }

    setIsLoading(true)
    try {
      // If user clicks the same vote, remove it; otherwise, set new vote
      const newVoteValue = voteCounts.user_upvote_status === voteValue ? null : voteValue

      const response = await fetch(`/api/ideas/${ideaId}/upvotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ vote_value: newVoteValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update vote')
      }

      // Calculate new counts
      const newCounts = { ...voteCounts }
      const oldVote = voteCounts.user_upvote_status
      
      // Remove old vote from counts
      if (oldVote === 1) {
        newCounts.upvote_count -= 1
      } else if (oldVote === -1) {
        newCounts.downvote_count -= 1
      }

      // Add new vote to counts
      if (newVoteValue === 1) {
        newCounts.upvote_count += 1
      } else if (newVoteValue === -1) {
        newCounts.downvote_count += 1
      }

      // Update net votes
      newCounts.net_votes = newCounts.upvote_count - newCounts.downvote_count
      newCounts.user_upvote_status = newVoteValue

      onVoteUpdate(newCounts)
      toast.success('Vote updated successfully')
    } catch (error) {
      console.error('Error updating vote:', error)
      toast.error('Failed to update vote')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 flex-shrink-0 max-w-full overflow-hidden">
      {/* Upvote Button */}
      <motion.button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl transition-all border-2 ${
          voteCounts.user_upvote_status === 1
            ? 'bg-green-100 text-green-600 border-green-200'
            : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
        }`}
        style={{ 
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent'
        } as React.CSSProperties}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {voteCounts.user_upvote_status === 1 ? (
          <ArrowUpIconSolid className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        ) : (
          <ArrowUpIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        )}
      </motion.button>

      {/* Net Votes Display */}
      <div className="flex flex-col items-center min-w-[28px] xs:min-w-[32px] sm:min-w-[36px] lg:min-w-[40px] max-w-[60px] px-0.5 xs:px-1">
        <span className={`text-xs xs:text-sm lg:text-base font-semibold leading-tight ${
          voteCounts.net_votes > 0 ? 'text-green-600' : 
          voteCounts.net_votes < 0 ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {voteCounts.net_votes > 0 ? '+' : ''}{voteCounts.net_votes}
        </span>
        <span className="text-xs text-gray-400 leading-tight hidden xs:block text-center">
          {voteCounts.upvote_count + voteCounts.downvote_count} votes
        </span>
      </div>

      {/* Downvote Button */}
      <motion.button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl transition-all border-2 ${
          voteCounts.user_upvote_status === -1
            ? 'bg-red-100 text-red-600 border-red-200'
            : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
        }`}
        style={{ 
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent'
        } as React.CSSProperties}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {voteCounts.user_upvote_status === -1 ? (
          <ArrowDownIconSolid className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        ) : (
          <ArrowDownIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        )}
      </motion.button>
    </div>
  )
} 