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
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Upvote Button */}
      <motion.button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`flex items-center justify-center p-1.5 sm:p-2 rounded-full transition-all ${
          voteCounts.user_upvote_status === 1
            ? 'bg-green-100 text-green-600 border-2 border-green-200'
            : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-green-50 hover:text-green-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {voteCounts.user_upvote_status === 1 ? (
          <ArrowUpIconSolid className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </motion.button>

      {/* Net Votes Display */}
      <div className="flex flex-col items-center min-w-[32px] sm:min-w-[40px] max-w-[60px]">
        <span className={`text-xs sm:text-sm font-semibold leading-tight ${
          voteCounts.net_votes > 0 ? 'text-green-600' : 
          voteCounts.net_votes < 0 ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {voteCounts.net_votes > 0 ? '+' : ''}{voteCounts.net_votes}
        </span>
        <span className="text-xs text-gray-400 leading-tight hidden sm:block">
          {voteCounts.upvote_count + voteCounts.downvote_count} votes
        </span>
      </div>

      {/* Downvote Button */}
      <motion.button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`flex items-center justify-center p-1.5 sm:p-2 rounded-full transition-all ${
          voteCounts.user_upvote_status === -1
            ? 'bg-red-100 text-red-600 border-2 border-red-200'
            : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-red-50 hover:text-red-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {voteCounts.user_upvote_status === -1 ? (
          <ArrowDownIconSolid className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </motion.button>
    </div>
  )
} 