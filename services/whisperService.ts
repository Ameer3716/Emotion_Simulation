import { Audio } from 'expo-av';

export class WhisperService {
  private static instance: WhisperService;
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/audio/transcriptions';

  private constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables');
    }
  }

  static getInstance(): WhisperService {
    if (!WhisperService.instance) {
      WhisperService.instance = new WhisperService();
    }
    return WhisperService.instance;
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Whisper API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  async startRecording(): Promise<Audio.Recording> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      return recording;
    } catch (error) {
      console.error('Recording start error:', error);
      throw error;
    }
  }

  async stopRecording(recording: Audio.Recording): Promise<string> {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Recording URI not available');
      }
      return uri;
    } catch (error) {
      console.error('Recording stop error:', error);
      throw error;
    }
  }
}