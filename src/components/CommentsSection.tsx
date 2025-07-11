'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { IdeaComment } from '@/types'
import toast from 'react-hot-toast'

interface CommentsSectionProps {
  ideaId: number
  commentsCount: number
  onCommentsUpdate: (newCount: number) => void
}

export default function CommentsSection({ ideaId, commentsCount, onCommentsUpdate }: CommentsSectionProps) {
  const { token, user } = useAuth()
  const [comments, setComments] = useState<IdeaComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments()
    }
  }, [showComments])

  useEffect(() => {
    const words = newComment.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [newComment])

  const fetchComments = async () => {
    if (!token) return

    try {
      const response = await fetch(`/api/ideas/${ideaId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await response.json()
      setComments(data.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Please log in to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (wordCount > 100) {
      toast.error('Comment must be 100 words or less')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const data = await response.json()
      setComments([data.data, ...comments])
      setNewComment('')
      onCommentsUpdate(commentsCount + 1)
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-full">
      {/* Comments Toggle Button */}
      <motion.button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
        <span className="text-sm">
          {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
        </span>
      </motion.button>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 border-t pt-4"
        >
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment (max 100 words)..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className={`text-sm ${wordCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                  {wordCount}/100 words
                </span>
                <motion.button
                  type="submit"
                  disabled={isLoading || !newComment.trim() || wordCount > 100}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {isLoading ? 'Adding...' : 'Comment'}
                </motion.button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {comment.user?.email === user?.email ? 'You' : comment.user?.email}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comment.comment}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
} 