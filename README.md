# Idea Manager

A beautiful, AI-powered idea management platform with invite-only access, built with Next.js, TypeScript, and OpenAI integration.

## Features

- **Invite-Only Access**: Secure registration system with admin-generated invite codes
- **AI-Powered Idea Generation**: Generate new ideas based on existing concepts using OpenAI
- **Market Research**: On-demand AI-generated market research for any idea
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Admin Dashboard**: Administrative interface for managing invite codes
- **Database Integration**: Persistent storage with Neon PostgreSQL

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, PostgreSQL (Neon)
- **AI**: OpenAI GPT-4 for idea generation and market research
- **Deployment**: Vercel
- **Authentication**: JWT-based with invite code validation

## Getting Started

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database
- OpenAI API key
- Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# JWT Secret
JWT_SECRET="your-jwt-secret-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idea-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in `.env.local`

4. Initialize the database:
```bash
# Run the development server first
npm run dev

# Then make a POST request to initialize the database
curl -X POST http://localhost:3000/api/init-db \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses four main tables:

- **users**: User accounts with admin privileges
- **invite_codes**: Generated invite codes for user registration
- **ideas**: User-created and AI-generated ideas
- **market_research**: AI-generated market research for ideas

## API Routes

### Authentication
- `POST /api/auth/validate-invite` - Validate invite code and create/login user

### Admin
- `POST /api/admin/generate-invite` - Generate new invite code (admin only)

### Ideas
- `GET /api/ideas` - Fetch user's ideas
- `POST /api/ideas` - Create new idea
- `POST /api/ideas/generate` - Generate ideas using AI

### Market Research
- `GET /api/ideas/[id]/market-research` - Fetch market research
- `POST /api/ideas/[id]/market-research` - Generate market research

## Deployment on Vercel

1. Fork this repository
2. Connect your GitHub repository to Vercel
3. Set up environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `OPENAI_API_KEY` 
   - `JWT_SECRET`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. Deploy the application
5. Initialize the database by calling `/api/init-db` endpoint

## Usage

### For Admins

1. Log in with your admin account
2. Generate invite codes in the admin dashboard
3. Share invite codes with users you want to grant access

### For Users

1. Enter your email and invite code on the login page
2. Create your first idea manually
3. Generate additional ideas using AI by:
   - Clicking "Generate Ideas" on any existing idea
   - Providing context for the AI
   - Selecting how many ideas to generate
4. View market research by clicking "Market Research" on any idea

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React components with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes handling authentication, data management, and AI integration
- **Database**: PostgreSQL with manual query building
- **AI Integration**: OpenAI GPT-4 for content generation
- **Authentication**: JWT tokens with invite code validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 