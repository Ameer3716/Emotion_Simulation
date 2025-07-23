import { create } from 'zustand';
import { ConversationMessage, EmotionData, SessionData, ScenarioScript } from '../types/conversation';

interface ConversationState {
  // Current session state
  isActive: boolean;
  currentScenario: ScenarioScript | null;
  messages: ConversationMessage[];
  emotions: EmotionData[];
  sessionStartTime: number | null;
  currentScore: number;
  
  // Recording state
  isRecording: boolean;
  isProcessing: boolean;
  
  // Emotion state
  currentEmotion: string | null;
  emotionIntensity: number;
  emotionHistory: EmotionData[];
  
  // Actions
  startSession: (scenario: ScenarioScript) => void;
  endSession: () => SessionData | null;
  addMessage: (message: ConversationMessage) => void;
  addEmotion: (emotion: EmotionData) => void;
  updateEmotionState: (emotion: string, intensity: number) => void;
  setRecording: (recording: boolean) => void;
  setProcessing: (processing: boolean) => void;
  updateScore: (score: number) => void;
  clearSession: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  // Initial state
  isActive: false,
  currentScenario: null,
  messages: [],
  emotions: [],
  sessionStartTime: null,
  currentScore: 0,
  isRecording: false,
  isProcessing: false,
  currentEmotion: null,
  emotionIntensity: 0,
  emotionHistory: [],

  // Actions
  startSession: (scenario: ScenarioScript) => {
    set({
      isActive: true,
      currentScenario: scenario,
      messages: [],
      emotions: [],
      emotionHistory: [],
      sessionStartTime: Date.now(),
      currentScore: 0,
      currentEmotion: null,
      emotionIntensity: 0,
    });
  },

  endSession: () => {
    const state = get();
    if (!state.isActive || !state.currentScenario || !state.sessionStartTime) {
      return null;
    }

    const sessionData: SessionData = {
      id: '', // Will be set by Firebase
      userId: 'current-user', // Should be replaced with actual user ID
      scenarioId: state.currentScenario.id,
      startTime: state.sessionStartTime,
      endTime: Date.now(),
      messages: state.messages,
      emotions: state.emotions,
      score: state.currentScore,
      achievements: [], // Calculate based on performance
      transcript: state.messages.map(m => `${m.type}: ${m.content}`).join('\n'),
    };

    set({
      isActive: false,
      currentScenario: null,
      messages: [],
      emotions: [],
      sessionStartTime: null,
      currentScore: 0,
    });

    return sessionData;
  },

  addMessage: (message: ConversationMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  addEmotion: (emotion: EmotionData) => {
    set((state) => ({
      emotions: [...state.emotions, emotion],
      emotionHistory: [...state.emotionHistory, emotion].slice(-50), // Keep last 50 emotions
    }));
  },

  updateEmotionState: (emotion: string, intensity: number) => {
    set({
      currentEmotion: emotion,
      emotionIntensity: intensity,
    });
  },

  setRecording: (recording: boolean) => {
    set({ isRecording: recording });
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },

  updateScore: (score: number) => {
    set({ currentScore: score });
  },

  clearSession: () => {
    set({
      isActive: false,
      currentScenario: null,
      messages: [],
      emotions: [],
      emotionHistory: [],
      sessionStartTime: null,
      currentScore: 0,
      currentEmotion: null,
      emotionIntensity: 0,
      isRecording: false,
      isProcessing: false,
    });
  },
}));