import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ReviewAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallRating: number;
  confidenceScore: number;
}

export async function analyzeManuscript(text: string): Promise<ReviewAnalysis> {
  const prompt = `Please analyze this manuscript and provide detailed feedback. Return the analysis in JSON format with the following structure:
  {
    "summary": "Brief overview of the manuscript",
    "strengths": ["Array of key strengths"],
    "weaknesses": ["Array of areas that need improvement"],
    "suggestions": ["Array of specific suggestions for improvement"],
    "overallRating": "Rating from 1-5",
    "confidenceScore": "Confidence in analysis from 0-1"
  }

  Here is the manuscript:
  ${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert literary critic and editor providing detailed manuscript analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const analysis = JSON.parse(content) as ReviewAnalysis;

    return {
      ...analysis,
      overallRating: Math.max(1, Math.min(5, Math.round(analysis.overallRating))),
      confidenceScore: Math.max(0, Math.min(1, analysis.confidenceScore)),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error("Failed to analyze manuscript: " + errorMessage);
  }
}