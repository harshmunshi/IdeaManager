'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HandRaisedIcon, UserIcon } from '@heroicons/react/24/outline'
import { HandRaisedIcon as HandRaisedIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface VotingButtonsProps {
  ideaId: number
  voteCounts: {
    help_build_count: number
    use_service_count: number
    user_help_build_vote: boolean
    user_use_service_vote: boolean
  }
  onVoteUpdate: (newCounts: {
    help_build_count: number
    use_service_count: number
    user_help_build_vote: boolean
    user_use_service_vote: boolean
  }) => void
}

export default function VotingButtons({ ideaId, voteCounts, onVoteUpdate }: VotingButtonsProps) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (voteType: 'help_build' | 'use_service') => {
    if (!token) {
      toast.error('Please log in to vote')
      return
    }

    setIsLoading(true)
    try {
      const currentVote = voteType === 'help_build' ? voteCounts.user_help_build_vote : voteCounts.user_use_service_vote
      const action = currentVote ? 'remove' : 'add'

      const response = await fetch(`/api/ideas/${ideaId}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType, action })
      })

      if (!response.ok) {
        throw new Error('Failed to update vote')
      }

      // Update local state
      const newCounts = { ...voteCounts }
      if (voteType === 'help_build') {
        newCounts.user_help_build_vote = !currentVote
        newCounts.help_build_count += currentVote ? -1 : 1
      } else {
        newCounts.user_use_service_vote = !currentVote
        newCounts.use_service_count += currentVote ? -1 : 1
      }

      onVoteUpdate(newCounts)
      toast.success(`Vote ${action}ed successfully`)
    } catch (error) {
      console.error('Error updating vote:', error)
      toast.error('Failed to update vote')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Help Build Vote */}
      <motion.button
        onClick={() => handleVote('help_build')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          voteCounts.user_help_build_vote
            ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-blue-50 hover:text-blue-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {voteCounts.user_help_build_vote ? (
          <HandRaisedIconSolid className="h-4 w-4" />
        ) : (
          <HandRaisedIcon className="h-4 w-4" />
        )}
        <span>Help Build</span>
        <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs">
          {voteCounts.help_build_count}
        </span>
      </motion.button>

      {/* Use Service Vote */}
      <motion.button
        onClick={() => handleVote('use_service')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          voteCounts.user_use_service_vote
            ? 'bg-green-100 text-green-800 border-2 border-green-200'
            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-green-50 hover:text-green-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {voteCounts.user_use_service_vote ? (
          <UserIconSolid className="h-4 w-4" />
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
        <span>Would Use</span>
        <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs">
          {voteCounts.use_service_count}
        </span>
      </motion.button>
    </div>
  )
} 