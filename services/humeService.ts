import { EmotionData } from '../types/conversation';

export class HumeService {
  private static instance: HumeService;
  private apiKey: string;
  private baseUrl = 'https://api.hume.ai/v0';
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private emotionCallback: ((emotions: EmotionData[]) => void) | null = null;

  private constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_HUME_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Hume AI API key not found in environment variables');
    }
  }

  static getInstance(): HumeService {
    if (!HumeService.instance) {
      HumeService.instance = new HumeService();
    }
    return HumeService.instance;
  }

  async startEmotionDetection(callback: (emotions: EmotionData[]) => void): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error('Hume AI API key not configured');
      }

      this.emotionCallback = callback;
      
      // Connect to Hume AI streaming API
      const wsUrl = `wss://api.hume.ai/v0/stream/models?apikey=${this.apiKey}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('Hume AI WebSocket connected');
        this.isConnected = true;
        
        // Configure the stream for face and prosody analysis
        this.websocket?.send(JSON.stringify({
          models: {
            face: {},
            prosody: {}
          }
        }));
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.processEmotionData(data);
        } catch (error) {
          console.error('Error processing emotion data:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('Hume AI WebSocket error:', error);
        this.isConnected = false;
      };

      this.websocket.onclose = () => {
        console.log('Hume AI WebSocket disconnected');
        this.isConnected = false;
      };
    } catch (error) {
      console.error('Emotion detection start error:', error);
      throw error;
    }
  }

  stopEmotionDetection(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.emotionCallback = null;
  }

  async analyzeImage(imageBase64: string): Promise<EmotionData[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Hume AI API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/batch/jobs`, {
        method: 'POST',
        headers: {
          'X-Hume-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          models: {
            face: {}
          },
          transcription: {
            language: 'en'
          },
          urls: [`data:image/jpeg;base64,${imageBase64}`]
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Hume AI API error: ${errorData}`);
      }

      const jobData = await response.json();
      
      // Poll for results (simplified - in production, use webhooks)
      const results = await this.pollForResults(jobData.job_id);
      return this.parseEmotionResults(results);
    } catch (error) {
      console.error('Image emotion analysis error:', error);
      throw error;
    }
  }

  async analyzeAudio(audioBase64: string): Promise<EmotionData[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Hume AI API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/batch/jobs`, {
        method: 'POST',
        headers: {
          'X-Hume-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          models: {
            prosody: {}
          },
          urls: [`data:audio/wav;base64,${audioBase64}`]
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Hume AI API error: ${errorData}`);
      }

      const jobData = await response.json();
      const results = await this.pollForResults(jobData.job_id);
      return this.parseEmotionResults(results);
    } catch (error) {
      console.error('Audio emotion analysis error:', error);
      throw error;
    }
  }

  sendImageFrame(imageBase64: string): void {
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify({
        data: imageBase64,
        models: {
          face: {}
        }
      }));
    }
  }

  sendAudioFrame(audioBase64: string): void {
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify({
        data: audioBase64,
        models: {
          prosody: {}
        }
      }));
    }
  }

  private processEmotionData(data: any): void {
    try {
      const emotions: EmotionData[] = [];
      const timestamp = Date.now();

      // Process face emotions
      if (data.face?.predictions) {
        for (const prediction of data.face.predictions) {
          if (prediction.emotions) {
            const topEmotion = this.getTopEmotion(prediction.emotions);
            if (topEmotion) {
              emotions.push({
                emotion: topEmotion.name,
                intensity: topEmotion.score,
                confidence: prediction.prob || 1.0,
                timestamp,
              });
            }
          }
        }
      }

      // Process prosody emotions
      if (data.prosody?.predictions) {
        for (const prediction of data.prosody.predictions) {
          if (prediction.emotions) {
            const topEmotion = this.getTopEmotion(prediction.emotions);
            if (topEmotion) {
              emotions.push({
                emotion: topEmotion.name,
                intensity: topEmotion.score,
                confidence: prediction.prob || 1.0,
                timestamp,
              });
            }
          }
        }
      }

      if (emotions.length > 0 && this.emotionCallback) {
        this.emotionCallback(emotions);
      }
    } catch (error) {
      console.error('Error processing emotion data:', error);
    }
  }

  private getTopEmotion(emotions: any[]): { name: string; score: number } | null {
    if (!emotions || emotions.length === 0) return null;
    
    const sorted = emotions.sort((a, b) => b.score - a.score);
    return {
      name: sorted[0].name,
      score: sorted[0].score,
    };
  }

  private async pollForResults(jobId: string, maxAttempts = 10): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/batch/jobs/${jobId}`, {
          headers: {
            'X-Hume-Api-Key': this.apiKey,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job results');
        }

        const data = await response.json();
        
        if (data.state === 'COMPLETED') {
          return data;
        } else if (data.state === 'FAILED') {
          throw new Error('Job failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Polling error:', error);
        if (i === maxAttempts - 1) throw error;
      }
    }
    
    throw new Error('Job polling timeout');
  }

  private parseEmotionResults(results: any): EmotionData[] {
    const emotions: EmotionData[] = [];
    const timestamp = Date.now();

    try {
      if (results.results) {
        for (const result of results.results) {
          if (result.predictions) {
            for (const prediction of result.predictions) {
              if (prediction.emotions) {
                const topEmotion = this.getTopEmotion(prediction.emotions);
                if (topEmotion) {
                  emotions.push({
                    emotion: topEmotion.name,
                    intensity: topEmotion.score,
                    confidence: 1.0,
                    timestamp,
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing emotion results:', error);
    }

    return emotions;
  }
}