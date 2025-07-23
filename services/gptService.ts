import { ConversationMessage, DialogueNode, ScenarioScript } from '../types/conversation';

export class GPTService {
  private static instance: GPTService;
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  private constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables');
    }
  }

  static getInstance(): GPTService {
    if (!GPTService.instance) {
      GPTService.instance = new GPTService();
    }
    return GPTService.instance;
  }

  async generateResponse(
    messages: ConversationMessage[],
    scenario: ScenarioScript,
    currentEmotion?: string,
    emotionIntensity?: number
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = this.buildSystemPrompt(scenario, currentEmotion, emotionIntensity);
      const conversationHistory = this.formatConversationHistory(messages);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
          ],
          max_tokens: 150,
          temperature: 0.8,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GPT API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I\'m not sure how to respond to that.';
    } catch (error) {
      console.error('GPT response generation error:', error);
      throw error;
    }
  }

  private buildSystemPrompt(
    scenario: ScenarioScript,
    currentEmotion?: string,
    emotionIntensity?: number
  ): string {
    const emotionContext = currentEmotion && emotionIntensity
      ? `The user is currently showing ${currentEmotion} with intensity ${emotionIntensity.toFixed(2)}.`
      : '';

    return `You are roleplaying in a social confidence training scenario: "${scenario.title}".

Scenario Description: ${scenario.description}

Your role:
- Act as a realistic conversation partner in this scenario
- Respond naturally and authentically to the user's messages
- Adapt your responses based on the user's emotional state
- Keep responses conversational and under 30 words
- Help create a realistic practice environment

${emotionContext}

Guidelines:
- If the user seems nervous or anxious, be encouraging and patient
- If the user is confident, engage more dynamically
- If the user seems confused, provide gentle guidance
- Stay in character for the scenario context
- Don't break the fourth wall or mention this is training

Remember: This is practice for real social situations. Be helpful but realistic.`;
  }

  private formatConversationHistory(messages: ConversationMessage[]): Array<{role: string, content: string}> {
    return messages.slice(-10).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  async generateScenarioFeedback(
    messages: ConversationMessage[],
    emotions: any[],
    score: number
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = `You are a social confidence coach providing feedback on a practice conversation.

Analyze the conversation and emotional data to provide constructive feedback.

Focus on:
- Communication strengths
- Areas for improvement
- Emotional awareness
- Specific actionable advice

Keep feedback encouraging but honest. Limit to 100 words.`;

      const conversationSummary = messages.map(m => `${m.type}: ${m.content}`).join('\n');
      const emotionSummary = emotions.length > 0 
        ? `Emotions detected: ${emotions.map(e => `${e.emotion} (${e.intensity.toFixed(2)})`).join(', ')}`
        : 'No emotion data available';

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Conversation:\n${conversationSummary}\n\n${emotionSummary}\n\nScore: ${score}/100`
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Great job practicing! Keep working on your conversation skills.';
    } catch (error) {
      console.error('Feedback generation error:', error);
      return 'Great job practicing! Keep working on your conversation skills.';
    }
  }
}