import OpenAI from 'openai'
import { GeneratedIdea } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateIdeas = async (
  rootIdeaTitle: string,
  rootIdeaDescription: string,
  context: string,
  maxIdeas: number
): Promise<GeneratedIdea[]> => {
  try {
    const prompt = `
Based on the following root idea and additional context, generate ${maxIdeas} new, creative and innovative ideas that build upon or relate to the root idea.

Root Idea:
Title: ${rootIdeaTitle}
Description: ${rootIdeaDescription}

Additional Context: ${context}

Please generate ${maxIdeas} ideas in the following JSON format:
{
  "ideas": [
    {
      "title": "Idea Title",
      "description": "Detailed description of the idea"
    }
  ]
}

Make sure each idea is:
1. Unique and creative
2. Feasible and practical
3. Related to the root idea but offers a fresh perspective
4. Has potential market value
5. Is clearly described with specific details
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative business idea generator. Generate innovative, practical, and marketable business ideas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const parsedResponse = JSON.parse(response)
    return parsedResponse.ideas || []
  } catch (error) {
    console.error('Error generating ideas:', error)
    throw new Error('Failed to generate ideas')
  }
}

export const generateMarketResearch = async (
  ideaTitle: string,
  ideaDescription: string
): Promise<string> => {
  try {
    const prompt = `
Conduct a comprehensive market research analysis for the following business idea:

Title: ${ideaTitle}
Description: ${ideaDescription}

Please provide a detailed market research report that includes:

1. **Market Overview**
   - Market size and potential
   - Target audience analysis
   - Market trends and growth projections

2. **Competitive Analysis**
   - Direct and indirect competitors
   - Competitive advantages and disadvantages
   - Market positioning opportunities

3. **SWOT Analysis**
   - Strengths
   - Weaknesses
   - Opportunities
   - Threats

4. **Financial Projections**
   - Revenue potential
   - Cost considerations
   - Pricing strategy recommendations

5. **Implementation Strategy**
   - Go-to-market strategy
   - Key milestones
   - Risk mitigation

6. **Recommendations**
   - Actionable next steps
   - Success factors
   - Potential pivot points

Format the response in markdown for easy reading.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional market research analyst. Provide comprehensive, data-driven market analysis and business insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    return response
  } catch (error) {
    console.error('Error generating market research:', error)
    throw new Error('Failed to generate market research')
  }
} 