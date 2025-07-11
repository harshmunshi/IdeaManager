# Deployment Guide for Idea Manager

## Overview

This guide walks you through deploying the Idea Manager application to Vercel with a Neon PostgreSQL database.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Neon Database Account](https://neon.tech)
- [OpenAI API Key](https://platform.openai.com/api-keys)
- GitHub repository with this code

## Step 1: Set up Neon Database

1. Go to [Neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Note down your connection string (it looks like: `postgresql://username:password@host:port/database?sslmode=require`)

## Step 2: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Save it securely (you'll need it for environment variables)

## Step 3: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `JWT_SECRET`: A random string (e.g., `your-super-secret-jwt-key`)
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET`: Another random string
6. Click "Deploy"

## Step 4: Initialize Database

After deployment:

1. Open your Vercel app URL
2. Make a POST request to initialize the database:

```bash
curl -X POST https://your-app.vercel.app/api/init-db \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com"}'
```

Or use a tool like Postman/Insomnia to make the request.

## Step 5: Create First Admin User

The initialization request will create your first admin user. Use the email you provided in the previous step.

## Step 6: Generate Invite Codes

1. Visit your deployed app
2. Enter your admin email and any valid invite code (since you're admin, you can access directly)
3. Go to the admin dashboard
4. Generate invite codes for other users

## Development Setup

For local development:

1. Clone the repository
2. Run `npm install`
3. Run `npm run setup` to create `.env.local`
4. Update environment variables in `.env.local`
5. Run `npm run dev`
6. Initialize database: `curl -X POST http://localhost:3000/api/init-db -H "Content-Type: application/json" -d '{"email":"admin@example.com"}'`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `JWT_SECRET` | Secret for JWT token signing | Random string |
| `NEXTAUTH_URL` | Base URL of your application | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Random string |

## Troubleshooting

### Database Connection Issues
- Ensure your Neon database is active
- Check that the connection string is correct
- Verify SSL mode is set to `require`

### OpenAI API Issues
- Verify your API key is valid
- Check your OpenAI account has credits
- Ensure the API key has proper permissions

### Build Issues
- Check all environment variables are set in Vercel
- Verify there are no TypeScript errors
- Ensure all dependencies are properly installed

## Security Notes

- Keep your environment variables secure
- Regularly rotate your JWT secrets
- Monitor your OpenAI API usage
- Use strong, unique passwords for your database

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check database connectivity 