import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { SessionData, UserProfile, EmotionData } from '../types/conversation';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export class FirebaseService {
  private static instance: FirebaseService;
  private db: any;
  private app: any;

  private constructor() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async createUser(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const defaultProfile: UserProfile = {
        id: userId,
        email: userData.email || '',
        name: userData.name || '',
        level: 1,
        totalSessions: 0,
        averageScore: 0,
        medals: {
          friendliness: 0,
          composure: 0,
          charisma: 0,
          awareness: 0,
          persuasion: 0,
          empathy: 0,
          clarity: 0,
          adaptability: 0,
        },
        preferences: {
          voiceEnabled: true,
          emotionAnalysis: true,
          difficulty: 'beginner',
        },
        ...userData,
      };

      await setDoc(userRef, {
        ...defaultProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async saveSession(sessionData: SessionData): Promise<string> {
    try {
      const sessionsRef = collection(this.db, 'sessions');
      const docRef = await addDoc(sessionsRef, {
        ...sessionData,
        createdAt: Timestamp.now(),
      });

      // Update user stats
      await this.updateUserStats(sessionData.userId, sessionData);
      
      return docRef.id;
    } catch (error) {
      console.error('Save session error:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string, limitCount = 10): Promise<SessionData[]> {
    try {
      const sessionsRef = collection(this.db, 'sessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions: SessionData[] = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() } as SessionData);
      });

      return sessions;
    } catch (error) {
      console.error('Get user sessions error:', error);
      throw error;
    }
  }

  async getSessionById(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionRef = doc(this.db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        return { id: sessionSnap.id, ...sessionSnap.data() } as SessionData;
      }
      return null;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  async updateMedalProgress(userId: string, medalType: string, progress: number): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const user = await this.getUser(userId);
      
      if (user) {
        const currentLevel = user.medals[medalType] || 0;
        const newLevel = Math.floor(progress / 20); // Level up every 20 points
        
        if (newLevel > currentLevel) {
          await updateDoc(userRef, {
            [`medals.${medalType}`]: newLevel,
            updatedAt: Timestamp.now(),
          });

          // Log achievement
          await this.logAchievement(userId, medalType, newLevel);
        }
      }
    } catch (error) {
      console.error('Update medal progress error:', error);
      throw error;
    }
  }

  async logAchievement(userId: string, type: string, level: number): Promise<void> {
    try {
      const achievementsRef = collection(this.db, 'achievements');
      await addDoc(achievementsRef, {
        userId,
        type,
        level,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Log achievement error:', error);
      throw error;
    }
  }

  async getEmotionAnalytics(userId: string, days = 30): Promise<any> {
    try {
      const sessionsRef = collection(this.db, 'sessions');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const q = query(
        sessionsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const emotionData: { [key: string]: number[] } = {};
      const sessionScores: number[] = [];
      
      querySnapshot.forEach((doc) => {
        const session = doc.data() as SessionData;
        sessionScores.push(session.score);
        
        session.emotions.forEach((emotion: EmotionData) => {
          if (!emotionData[emotion.emotion]) {
            emotionData[emotion.emotion] = [];
          }
          emotionData[emotion.emotion].push(emotion.intensity);
        });
      });

      return {
        emotionTrends: emotionData,
        averageScore: sessionScores.length > 0 
          ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length 
          : 0,
        totalSessions: sessionScores.length,
        scoreHistory: sessionScores,
      };
    } catch (error) {
      console.error('Get emotion analytics error:', error);
      throw error;
    }
  }

  private async updateUserStats(userId: string, sessionData: SessionData): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) return;

      const newTotalSessions = user.totalSessions + 1;
      const newAverageScore = (
        (user.averageScore * user.totalSessions + sessionData.score) / 
        newTotalSessions
      );

      await this.updateUser(userId, {
        totalSessions: newTotalSessions,
        averageScore: Math.round(newAverageScore * 100) / 100,
      });

      // Update medal progress based on session performance
      await this.updateMedalProgressFromSession(userId, sessionData);
    } catch (error) {
      console.error('Update user stats error:', error);
    }
  }

  private async updateMedalProgressFromSession(userId: string, sessionData: SessionData): Promise<void> {
    try {
      // Calculate medal progress based on session data
      const medalUpdates: { [key: string]: number } = {};

      // Analyze emotions for different medal types
      const emotionCounts = sessionData.emotions.reduce((acc, emotion) => {
        acc[emotion.emotion] = (acc[emotion.emotion] || 0) + emotion.intensity;
        return acc;
      }, {} as { [key: string]: number });

      // Friendliness: positive emotions
      const friendlinessEmotions = ['joy', 'happiness', 'contentment'];
      const friendlinessScore = friendlinessEmotions.reduce((sum, emotion) => 
        sum + (emotionCounts[emotion] || 0), 0);
      if (friendlinessScore > 0) medalUpdates.friendliness = friendlinessScore * 10;

      // Composure: low anxiety/stress
      const stressEmotions = ['anxiety', 'stress', 'nervousness'];
      const composureScore = 10 - stressEmotions.reduce((sum, emotion) => 
        sum + (emotionCounts[emotion] || 0), 0);
      if (composureScore > 5) medalUpdates.composure = composureScore;

      // Charisma: engagement and confidence
      const charismaEmotions = ['confidence', 'enthusiasm', 'excitement'];
      const charismaScore = charismaEmotions.reduce((sum, emotion) => 
        sum + (emotionCounts[emotion] || 0), 0);
      if (charismaScore > 0) medalUpdates.charisma = charismaScore * 10;

      // Update medals
      for (const [medalType, progress] of Object.entries(medalUpdates)) {
        await this.updateMedalProgress(userId, medalType, progress);
      }
    } catch (error) {
      console.error('Update medal progress from session error:', error);
    }
  }
}