export interface User {
  id: number
  email: string
  created_at: string
  is_admin: boolean
}

export interface InviteCode {
  id: number
  code: string
  created_by: number
  used_by?: number
  created_at: string
  used_at?: string
  is_active: boolean
}

export interface Idea {
  id: number
  title: string
  description: string
  created_by: number
  parent_idea_id?: number
  created_at: string
  updated_at: string
  user?: User
  market_research?: MarketResearch
}

export interface MarketResearch {
  id: number
  idea_id: number
  research_data: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

export interface IdeaGenerationRequest {
  rootIdeaId: number
  context: string
  maxIdeas: number
}

export interface GeneratedIdea {
  title: string
  description: string
}

export interface IdeaVote {
  id: number
  idea_id: number
  user_id: number
  vote_type: 'help_build' | 'use_service'
  created_at: string
}

export interface IdeaUpvote {
  id: number
  idea_id: number
  user_id: number
  vote_value: 1 | -1
  created_at: string
  updated_at: string
}

export interface IdeaComment {
  id: number
  idea_id: number
  user_id: number
  comment: string
  created_at: string
  updated_at: string
  user?: User
}

export interface IdeaVoteCounts {
  help_build_count: number
  use_service_count: number
  upvote_count: number
  downvote_count: number
  net_votes: number
  user_help_build_vote: boolean
  user_use_service_vote: boolean
  user_upvote_status: 1 | -1 | null
}

export interface IdeaWithExtendedData extends Idea {
  vote_counts?: IdeaVoteCounts
  comments?: IdeaComment[]
  comments_count?: number
} 