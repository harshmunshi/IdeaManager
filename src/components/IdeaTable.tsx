'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Idea } from '@/types'
import VotingButtons from './VotingButtons'
import UpvoteButtons from './UpvoteButtons'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface IdeaTableProps {
  ideas: (Idea & {
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
  })[]
  onGenerateIdeas?: (ideaId: number) => void
  onIdeaDeleted?: (ideaId: number) => void
  onViewResearch?: (idea: Idea) => void
}

export default function IdeaTable({ ideas, onGenerateIdeas, onIdeaDeleted, onViewResearch }: IdeaTableProps) {
  const [sortBy, setSortBy] = useState<'title' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { token, user } = useAuth()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    const aValue = sortBy === 'title' ? a.title.toLowerCase() : new Date(a.created_at).getTime()
    const bValue = sortBy === 'title' ? b.title.toLowerCase() : new Date(b.created_at).getTime()
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: 'title' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleDelete = async (ideaId: number) => {
    if (!token) {
      toast.error('Authentication required')
      return
    }

    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return
    }

    setDeletingId(ideaId)
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Idea deleted successfully')
        onIdeaDeleted?.(ideaId)
      } else {
        toast.error(data.message || 'Failed to delete idea')
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getSortIcon = (column: 'title' | 'created_at') => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-body mb-2">No ideas yet</p>
        <p className="text-caption">Create your first idea to get started with your innovation journey</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-large overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span>Title</span>
                  {getSortIcon('title')}
                </button>
              </th>
              <th className="text-left py-4 px-6">
                <span className="text-sm font-semibold text-gray-700">Description</span>
              </th>
              <th className="text-left py-4 px-6">
                <span className="text-sm font-semibold text-gray-700">Creator</span>
              </th>
              <th className="text-left py-4 px-6">
                <span className="text-sm font-semibold text-gray-700">Status</span>
              </th>
              <th className="text-left py-4 px-6">
                <span className="text-sm font-semibold text-gray-700">Votes</span>
              </th>
              <th className="text-left py-4 px-6">
                <span className="text-sm font-semibold text-gray-700">Comments</span>
              </th>
              <th className="text-left py-4 px-6">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span>Created</span>
                  {getSortIcon('created_at')}
                </button>
              </th>
              <th className="text-right py-4 px-6">
                <span className="text-sm font-semibold text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedIdeas.map((idea, index) => (
              <motion.tr
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{idea.title}</p>
                      {idea.parent_idea_id && (
                        <span className="inline-block mt-1 badge-gray text-xs">Generated</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600 line-clamp-2 max-w-sm">{idea.description}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">
                        {((idea as any).user_email || 'Unknown').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(idea as any).user_email === user?.email ? 'You' : (idea as any).user_email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {idea.market_research ? (
                      <div className="flex items-center gap-1 text-success-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium">Research Done</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <VotingButtons
                      ideaId={idea.id}
                      voteCounts={{
                        help_build_count: idea.vote_counts?.help_build_count || 0,
                        use_service_count: idea.vote_counts?.use_service_count || 0,
                        user_help_build_vote: idea.vote_counts?.user_help_build_vote || false,
                        user_use_service_vote: idea.vote_counts?.user_use_service_vote || false
                      }}
                      onVoteUpdate={() => {
                        // In table view, we'll just refresh the page or handle it differently
                        window.location.reload()
                      }}
                    />
                    <UpvoteButtons
                      ideaId={idea.id}
                      voteCounts={{
                        upvote_count: idea.vote_counts?.upvote_count || 0,
                        downvote_count: idea.vote_counts?.downvote_count || 0,
                        net_votes: idea.vote_counts?.net_votes || 0,
                        user_upvote_status: idea.vote_counts?.user_upvote_status || null
                      }}
                      onVoteUpdate={() => {
                        // In table view, we'll just refresh the page or handle it differently
                        window.location.reload()
                      }}
                    />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {idea.comments_count || 0}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">{formatDate(idea.created_at)}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewResearch?.(idea)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="View market research"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    
                    {onGenerateIdeas && (
                      <button
                        onClick={() => onGenerateIdeas(idea.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Generate ideas"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Only show delete button for user's own ideas */}
                    {user && idea.created_by === user.id && (
                      <button
                        onClick={() => handleDelete(idea.id)}
                        disabled={deletingId === idea.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete idea"
                      >
                        {deletingId === idea.id ? (
                          <div className="w-4 h-4 spinner"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
} 