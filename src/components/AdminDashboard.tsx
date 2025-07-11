'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

export default function AdminDashboard() {
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { token } = useAuth()

  const generateInviteCode = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/admin/generate-invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedCodes(prev => [data.inviteCode, ...prev])
        toast.success('Invite code generated successfully!')
      } else {
        toast.error(data.message || 'Failed to generate invite code')
      }
    } catch (error) {
      console.error('Error generating invite code:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Invite code copied to clipboard!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-large"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="heading-3 mb-2">Admin Dashboard</h2>
          <p className="text-body">
            Manage invite codes and system administration
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-full">
          <div className="status-online"></div>
          <span className="text-xs font-medium text-success-700">Administrator</span>
        </div>
      </div>

      {/* Generate Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="heading-4 mb-2">Invite Code Generation</h3>
            <p className="text-caption">
              Create secure invite codes to grant access to new users
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateInviteCode}
            disabled={isGenerating}
            className="btn-primary shrink-0"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 spinner"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Generate Code</span>
              </div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Generated Codes List */}
      {generatedCodes.length > 0 && (
        <div>
          <h3 className="heading-4 mb-4">Recent Invite Codes</h3>
          <div className="space-y-3">
            {generatedCodes.map((code, index) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="font-mono text-sm font-medium text-gray-900 tracking-wider">
                    {code}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(code)}
                  className="btn-ghost px-3 py-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
} 