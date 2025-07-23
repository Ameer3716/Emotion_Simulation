import { Audio } from 'expo-av';

export class ElevenLabsService {
  private static instance: ElevenLabsService;
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default voice ID

  private constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found in environment variables');
    }
  }

  static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  async textToSpeech(text: string, emotion?: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      // Adjust voice settings based on emotion
      const voiceSettings = this.getVoiceSettingsForEmotion(emotion);

      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`ElevenLabs API error: ${errorData}`);
      }

      // Convert response to base64 for React Native
      const audioBlob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }

  async playAudio(audioData: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioData },
        { shouldPlay: true }
      );
      
      await sound.playAsync();
      
      // Clean up after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  private getVoiceSettingsForEmotion(emotion?: string) {
    const baseSettings = {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true,
    };

    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'joy':
        return { ...baseSettings, stability: 0.3, style: 0.2 };
      case 'sad':
      case 'melancholy':
        return { ...baseSettings, stability: 0.7, style: -0.2 };
      case 'angry':
      case 'frustration':
        return { ...baseSettings, stability: 0.4, style: 0.3 };
      case 'calm':
      case 'neutral':
        return { ...baseSettings, stability: 0.6, style: 0.0 };
      case 'excited':
      case 'enthusiasm':
        return { ...baseSettings, stability: 0.2, style: 0.4 };
      default:
        return baseSettings;
    }
  }

  setVoiceId(voiceId: string) {
    this.voiceId = voiceId;
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Get voices error:', error);
      return [];
    }
  }
}