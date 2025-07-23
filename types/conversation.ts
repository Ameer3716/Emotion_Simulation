export interface EmotionData {
  emotion: string;
  intensity: number; // 0-1
  confidence: number; // 0-1
  timestamp: number;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  audioUrl?: string;
  emotions?: EmotionData[];
}

export interface DialogueNode {
  id: string;
  content: string;
  conditions?: {
    emotion?: string;
    minIntensity?: number;
    context?: string[];
  };
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  id: string;
  content: string;
  nextNodeId?: string;
  emotionTrigger?: string;
  scoreModifier?: number;
}

export interface ScenarioScript {
  id: string;
  title: string;
  description: string;
  openingNode: string;
  nodes: Record<string, DialogueNode>;
  successConditions: {
    minScore: number;
    requiredEmotions: string[];
    maxDuration?: number;
  };
}

export interface SessionData {
  id: string;
  userId: string;
  scenarioId: string;
  startTime: number;
  endTime?: number;
  messages: ConversationMessage[];
  emotions: EmotionData[];
  score: number;
  achievements: string[];
  transcript: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: number;
  totalSessions: number;
  averageScore: number;
  medals: Record<string, number>;
  preferences: {
    voiceEnabled: boolean;
    emotionAnalysis: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}