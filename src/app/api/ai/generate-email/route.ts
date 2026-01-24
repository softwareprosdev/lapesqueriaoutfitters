import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, type } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
      return NextResponse.json(
        { error: 'AI is not configured (Missing API Key)' },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert email marketing copywriter for La Pesqueria Outfitters, a fishing gear and apparel brand based in McAllen, TX.
      
      Create an email campaign for the following purpose:
      Topic/Goal: "${topic}"
      Campaign Type: "${type}"

      Return the result as a strictly valid JSON object with the following structure:
      {
        "subject": "Catchy Email Subject Line (include an emoji if appropriate)",
        "preheader": "Engaging preview text (max 100 chars)",
        "content": "HTML formatted body content. Use inline styles for basic formatting. Include a greeting, main message, and a call to action. Use <h2> for headings and <p> for paragraphs. Keep it visually appealing but compatible with email clients."
      }

      Do not include markdown formatting (like json code blocks) around the response. Just the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up potential markdown
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const json = JSON.parse(cleaned);
      return NextResponse.json(json);
    } catch {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'Failed to generate valid email content' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during AI generation' },
      { status: 500 }
    );
  }
}
