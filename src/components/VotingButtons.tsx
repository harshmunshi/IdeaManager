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
    <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 max-w-full overflow-hidden">
      {/* Help Build Vote */}
      <motion.button
        onClick={() => handleVote('help_build')}
        disabled={isLoading}
        className={`flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl transition-all border-2 text-xs xs:text-sm font-medium min-w-0 ${
          voteCounts.user_help_build_vote
            ? 'bg-blue-100 text-blue-800 border-blue-200'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
        }`}
        style={{ 
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent'
        } as React.CSSProperties}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {voteCounts.user_help_build_vote ? (
          <HandRaisedIconSolid className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        ) : (
          <HandRaisedIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        )}
        <span className="hidden xs:inline lg:hidden xl:inline">Help Build</span>
        <span className="xs:hidden lg:inline xl:hidden">Help</span>
        <span className="bg-gray-100 px-1 xs:px-1.5 py-0.5 rounded-md text-xs font-medium min-w-[18px] xs:min-w-[20px] text-center">
          {voteCounts.help_build_count}
        </span>
      </motion.button>

      {/* Use Service Vote */}
      <motion.button
        onClick={() => handleVote('use_service')}
        disabled={isLoading}
        className={`flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl transition-all border-2 text-xs xs:text-sm font-medium min-w-0 ${
          voteCounts.user_use_service_vote
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
        }`}
        style={{ 
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent'
        } as React.CSSProperties}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {voteCounts.user_use_service_vote ? (
          <UserIconSolid className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        ) : (
          <UserIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        )}
        <span className="hidden xs:inline lg:hidden xl:inline">Would Use</span>
        <span className="xs:hidden lg:inline xl:hidden">Use</span>
        <span className="bg-gray-100 px-1 xs:px-1.5 py-0.5 rounded-md text-xs font-medium min-w-[18px] xs:min-w-[20px] text-center">
          {voteCounts.use_service_count}
        </span>
      </motion.button>
    </div>
  )
} 