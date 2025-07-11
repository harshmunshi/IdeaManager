'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Idea } from '@/types'
import IdeaCard from './IdeaCard'
import IdeaTable from './IdeaTable'
import CreateIdeaModal from './CreateIdeaModal'
import IdeaGenerationModal from './IdeaGenerationModal'
import MarketResearchModal from './MarketResearchModal'
import AdminDashboard from './AdminDashboard'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'table'

export default function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [selectedRootIdea, setSelectedRootIdea] = useState<Idea | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showMarketResearch, setShowMarketResearch] = useState(false)
  const [selectedIdeaForResearch, setSelectedIdeaForResearch] = useState<Idea | null>(null)
  const { user, token, logout } = useAuth()

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setIdeas(data.ideas)
      } else {
        toast.error('Failed to fetch ideas')
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
      toast.error('Something went wrong while fetching ideas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleIdeaCreated = (newIdea: Idea) => {
    setIdeas(prev => [newIdea, ...prev])
  }

  const handleIdeasGenerated = (newIdeas: Idea[]) => {
    setIdeas(prev => [...newIdeas, ...prev])
  }

  const handleGenerateIdeas = (ideaId: number) => {
    const rootIdea = ideas.find(idea => idea.id === ideaId)
    if (rootIdea) {
      setSelectedRootIdea(rootIdea)
      setShowGenerationModal(true)
    }
  }

  const handleIdeaDeleted = (ideaId: number) => {
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
  }

  const handleViewResearch = (idea: Idea) => {
    setSelectedIdeaForResearch(idea)
    setShowMarketResearch(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 spinner mx-auto mb-6"></div>
          <p className="text-body">Loading your ideas...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-gray-200/50">
        <div className="container-main">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-soft">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="heading-4">Idea Manager</h1>
            </motion.div>
            
            {/* User Menu */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  {user?.is_admin && (
                    <div className="flex items-center gap-1">
                      <div className="status-online"></div>
                      <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                  )}
                </div>
                {user?.is_admin && (
                  <span className="badge-primary">Admin</span>
                )}
              </div>
              <button
                onClick={logout}
                className="btn-ghost p-2"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-main py-8">
        <div className="space-y-8">
          {/* Admin Dashboard */}
          {user?.is_admin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AdminDashboard />
            </motion.div>
          )}

          {/* Ideas Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: user?.is_admin ? 0.2 : 0.1 }}
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="heading-2 mb-2">Collaborative Ideas</h2>
                <p className="text-body">
                  {ideas.length === 0 
                    ? "Start the innovation journey by creating the first idea in this collaborative space" 
                    : `${ideas.length} idea${ideas.length > 1 ? 's' : ''} from the community • View, research, and build upon any idea`
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                {ideas.length > 0 && (
                  <div className="flex items-center bg-white rounded-xl p-1 shadow-soft">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-primary-100 text-primary-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'table' 
                          ? 'bg-primary-100 text-primary-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Table
                    </button>
                  </div>
                )}
                
                {/* New Idea Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary shrink-0"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Idea
                </motion.button>
              </div>
            </div>

            {/* Ideas Display */}
            {ideas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-large text-center py-16"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-3">Start the Collaborative Innovation</h3>
                <p className="text-body mb-8 max-w-md mx-auto">
                  Create the first idea in this collaborative space. Everyone can view, research, and build upon each other's ideas with AI-powered insights.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Idea
                </motion.button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {ideas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <IdeaCard 
                      idea={idea} 
                      onGenerateIdeas={handleGenerateIdeas}
                      onIdeaDeleted={handleIdeaDeleted}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <IdeaTable
                ideas={ideas}
                onGenerateIdeas={handleGenerateIdeas}
                onIdeaDeleted={handleIdeaDeleted}
                onViewResearch={handleViewResearch}
              />
            )}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <CreateIdeaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onIdeaCreated={handleIdeaCreated}
      />

      <IdeaGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        rootIdea={selectedRootIdea}
        onIdeasGenerated={handleIdeasGenerated}
      />

      {selectedIdeaForResearch && (
        <MarketResearchModal
          idea={selectedIdeaForResearch}
          isOpen={showMarketResearch}
          onClose={() => {
            setShowMarketResearch(false)
            setSelectedIdeaForResearch(null)
          }}
        />
      )}
    </div>
  )
} 