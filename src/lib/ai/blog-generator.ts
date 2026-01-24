import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { HfInference } from '@huggingface/inference';
import { z } from 'zod';

export type AIProvider = 'gemini' | 'claude' | 'huggingface';

export interface ModelConfig {
  name: string;
  displayName: string;
}

export const AI_MODELS: Record<AIProvider, ModelConfig[]> = {
  gemini: [
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
    // Add other Gemini models as needed
  ],
  claude: [
    { name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku' },
    { name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
    { name: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
    // Add other Claude models as needed
  ],
  huggingface: [
    { name: 'mistralai/Mixtral-8x7B-Instruct-v0.1', displayName: 'Mixtral 8x7B Instruct' },
    // Add other Hugging Face models as needed
  ],
};

export interface BlogGenerationParams {
  topic: string;
  keywords: string[];
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  provider: AIProvider;
  model: string; // Model name to use for the selected provider
}

/**
 * Zod schema for validated AI responses
 */
export const GeneratedBlogSchema = z.object({
  title: z.string().min(10).max(100),
  content: z.string().min(100), // HTML content
  excerpt: z.string().min(50).max(160),
  tags: z.array(z.string()).min(3).max(10),
  category: z.enum(['Conservation', 'Marine Life', 'Ecosystems', 'Community']),
});

export type GeneratedBlog = z.infer<typeof GeneratedBlogSchema>;

export class BlogGenerator {
  private gemini?: GoogleGenerativeAI;
  private claude?: Anthropic;
  private huggingface?: HfInference;

  constructor() {
    if (process.env.GOOGLE_GENERATIVE_AI_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    if (process.env.HUGGINGFACE_API_KEY) {
      this.huggingface = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }
  }

  async generate(params: BlogGenerationParams): Promise<GeneratedBlog> {
    const prompt = this.buildPrompt(params);

    switch (params.provider) {
      case 'gemini':
        return this.generateWithGemini(prompt, params.model);
      case 'claude':
        return this.generateWithClaude(prompt, params.model);
      case 'huggingface':
        return this.generateWithHuggingFace(prompt, params.model);
      default:
        throw new Error('Invalid AI provider selected');
    }
  }

  private buildPrompt(params: BlogGenerationParams): string {
    return `
      You are an expert marine conservation blogger for La Pesqueria Outfitters, a fishing apparel and outdoor gear brand based in McAllen, TX.
      Your writing style is professional, engaging, and emotionally resonant.

      TOPIC: "${params.topic}"
      KEYWORDS: ${params.keywords.join(', ')}
      TONE: ${params.tone || 'Educational and Inspiring'}
      LENGTH: ${params.length || 'medium'} (Short: ~500 words, Medium: ~1000 words, Long: ~1500 words)

      REQUIREMENTS:
      1. Use semantically correct HTML for the content (<h2>, <h3>, <p>, <ul>, <li>).
      2. No <h1> tags in the content (the title field will be used for <h1>).
      3. Content must be SEO-optimized and include the keywords naturally.
      4. Ensure the call-to-action is subtle but effective, linking the topic to ocean-inspired jewelry.

      RESPONSE FORMAT:
      You must return ONLY a strictly valid JSON object. No preamble, no markdown code blocks, no trailing text.
      JSON STRUCTURE:
      {
        "title": "Catchy SEO-optimized title",
        "content": "Full HTML content",
        "excerpt": "A compelling 150-160 character summary for meta descriptions",
        "tags": ["3-7 relevant tags"],
        "category": "One of: Conservation, Marine Life, Ecosystems, Community"
      }
    `;
  }

  private async generateWithGemini(prompt: string, modelName: string): Promise<GeneratedBlog> {
    if (!this.gemini) throw new Error('Gemini API key not configured');
    
    // Use the specified model name
    const model = this.gemini.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return this.parseResponse(text);
  }

  private async generateWithClaude(prompt: string, modelName: string): Promise<GeneratedBlog> {
    if (!this.claude) throw new Error('Claude API key not configured');

    const msg = await this.claude.messages.create({
      model: modelName, // Use the specified model name
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return this.parseResponse(text);
  }

  private async generateWithHuggingFace(prompt: string, modelName: string): Promise<GeneratedBlog> {
    if (!this.huggingface) throw new Error('Hugging Face API key not configured');

    const result = await this.huggingface.textGeneration({
      model: modelName, // Use the specified model name
      inputs: prompt,
      parameters: {
        max_new_tokens: 2000,
        return_full_text: false,
      }
    });

    return this.parseResponse(result.generated_text);
  }

  private parseResponse(text: string): GeneratedBlog {
    try {
      // Find JSON block if the model included extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      
      const rawJson = JSON.parse(jsonString);
      
      // Validate with Zod
      const validated = GeneratedBlogSchema.safeParse(rawJson);
      
      if (!validated.success) {
        console.error('AI response validation failed:', validated.error.format());
        throw new Error(`AI response failed validation: ${validated.error.issues[0].message}`);
      }
      
      return validated.data;
    } catch (error) {
      console.error('Failed to parse AI response:', text, error);
      throw new Error(`Failed to generate valid blog content: ${(error as Error).message}`);
    }
  }
}