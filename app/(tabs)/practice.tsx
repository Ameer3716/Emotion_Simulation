import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Users,
  Heart,
  Mic,
  MicOff,
  Camera,
  Star,
  Play,
  Coffee,
  Music,
  MessageCircle,
  Brain,
  X,
  Send,
} from 'lucide-react-native';
import { useConversationStore } from '../../store/conversationStore';
import { WhisperService } from '../../services/whisperService';
import { GPTService } from '../../services/gptService';
import { ElevenLabsService } from '../../services/elevenLabsService';
import { HumeService } from '../../services/humeService';
import { FirebaseService } from '../../services/firebaseService';
import ChatInterface from '../../components/ChatInterface';
import EmotionAnalyzer from '../../components/EmotionAnalyzer';
import { scenarios } from '../../data/scenarios';
import { ConversationMessage, EmotionData } from '../../types/conversation';

// --- FIX: Corrected import paths to navigate from 'app/(tabs)' to the root 'assets/images' folder ---
import alex from '../../assets/images/alex.jpg';
import sara from '../../assets/images/sara.jpg';
import amy from '../../assets/images/amy.jpg';

const { width } = Dimensions.get('window');

// --- TYPE DEFINITION ADDED FOR BETTER TYPE SAFETY ---
type ScenarioType = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  mode: 'social' | 'romantic';
  background: 'cafe' | 'party' | 'date';
  icon: React.ElementType;
  gradient: string[];
  avatarUrl: ImageSourcePropType;
  objectives: {
    primary: string;
    bonus: string[];
  };
  successBehaviors: string[];
  failureBehaviors: string[];
};

// --- SCENARIOS UPDATED WITH CORRECT avatarUrl FORMAT ---
const scenarios: ScenarioType[] = [
  {
    id: 1,
    title: 'Coffee Shop Approach',
    description: 'Approach someone reading and start a natural conversation',
    difficulty: 'Beginner',
    mode: 'social',
    background: 'cafe',
    icon: Coffee,
    gradient: ['#8B5CF6', '#3B82F6'],
    avatarUrl: alex, // This is correct once the import is fixed
    objectives: {
      primary: 'Start a conversation and exchange 3 messages',
      bonus: [
        'Make an observational comment about their book/drink',
        'Get them to smile or laugh',
        'Find one thing in common'
      ]
    },
    successBehaviors: ['Eye contact', 'Genuine smile', 'Natural conversation flow'],
    failureBehaviors: ['One-word answers', 'Closed body language', 'Awkward silence'],
  },
  {
    id: 2,
    title: 'House Party Group Join',
    description: 'Join a group conversation without being awkward',
    difficulty: 'Intermediate',
    mode: 'social',
    background: 'party',
    icon: Music,
    gradient: ['#F59E0B', '#EF4444'],
    avatarUrl: sara, // This is correct once the import is fixed
    objectives: {
      primary: 'Successfully join and contribute to group conversation',
      bonus: [
        'Make the group laugh',
        'Include a quieter member in conversation',
        'Get invited to continue hanging out'
      ]
    },
    successBehaviors: ['Listen first', 'Contribute meaningfully', 'Include others'],
    failureBehaviors: ['Interrupt others', 'Talk too much', 'Off-topic remarks'],
  },
  {
    id: 3,
    title: 'Bar Flirtation',
    description: 'Seated next to someone intriguing - start and maintain engaging conversation',
    difficulty: 'Advanced',
    mode: 'romantic',
    background: 'date',
    icon: Heart,
    gradient: ['#EC4899', '#8B5CF6'],
    avatarUrl: amy, // This is correct once the import is fixed
    objectives: {
      primary: 'Break the ice and have engaging 5-minute conversation',
      bonus: [
        'Use playful teasing appropriately',
        'Maintain eye contact 60% of the time',
        'Get agreement to meet again'
      ]
    },
    successBehaviors: ['Confident teasing', 'Active listening', 'Smooth responses'],
    failureBehaviors: ['Being overbearing', 'Missing social cues', 'Unconfident tone'],
  },
];

export default function PracticeScreen() {
  const [selectedMode, setSelectedMode] = useState('social');
  const [showAvatar, setShowAvatar] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>(null);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showEmotionAnalyzer, setShowEmotionAnalyzer] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Audio.Recording | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Services
  const whisperService = WhisperService.getInstance();
  const gptService = GPTService.getInstance();
  const elevenLabsService = ElevenLabsService.getInstance();
  const humeService = HumeService.getInstance();
  const firebaseService = FirebaseService.getInstance();

  // Store
  const {
    isActive,
    messages,
    emotions,
    currentEmotion,
    emotionIntensity,
    isRecording,
    isProcessing,
    currentScore,
    startSession,
    endSession,
    addMessage,
    addEmotion,
    updateEmotionState,
    setRecording,
    setProcessing,
    updateScore,
  } = useConversationStore();

  const pulseAnimation = useSharedValue(0);
  const avatarScale = useSharedValue(0);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (showAvatar) {
      avatarScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      initializeServices();
    } else {
      avatarScale.value = withSpring(0);
      cleanupServices();
    }
  }, [showAvatar]);

  useEffect(() => {
    // Update emotion state when new emotions are detected
    if (emotions.length > 0) {
      const latestEmotion = emotions[emotions.length - 1];
      updateEmotionState(latestEmotion.emotion, latestEmotion.intensity);
    }
  }, [emotions]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: avatarScale.value,
  }));

  const recordingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          pulseAnimation.value,
          [0, 1],
          isRecording ? [1, 1.2] : [1, 1]
        ),
      },
    ],
  }));

  const initializeServices = async () => {
    try {
      // Initialize emotion detection
      await humeService.startEmotionDetection(handleEmotionDetection);
      setIsInitialized(true);
    } catch (error) {
      console.error('Service initialization error:', error);
      Alert.alert('Error', 'Failed to initialize AI services. Some features may not work properly.');
    }
  };

  const cleanupServices = () => {
    humeService.stopEmotionDetection();
    if (currentRecording) {
      currentRecording.stopAndUnloadAsync();
      setCurrentRecording(null);
    }
    setIsInitialized(false);
  };

  const handleEmotionDetection = (detectedEmotions: EmotionData[]) => {
    detectedEmotions.forEach(emotion => {
      addEmotion(emotion);
    });
  };

  const startScenario = async (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    
    // Find matching scenario script
    const scenarioScript = Object.values(scenarios).find(s => 
      s.title.toLowerCase().includes(scenario.title.toLowerCase().split(' ')[0])
    );
    
    if (scenarioScript) {
      startSession(scenarioScript);
    }
    
    setShowAvatar(true);
    setShowChatInterface(true);
    setShowEmotionAnalyzer(true);
    
    // Send initial AI message
    setTimeout(() => {
      sendInitialMessage(scenario);
    }, 1000);
  };

  const sendInitialMessage = async (scenario: ScenarioType) => {
    const initialMessages = {
      'Coffee Shop Approach': "Hi there! I couldn't help but notice you're reading. Mind if I ask what book that is?",
      'House Party Group Join': "Hey everyone! Mind if I join the conversation? I heard you talking about travel.",
      'Bar Flirtation': "Hi! I hope you don't mind me saying, but you have great taste in music. This song is one of my favorites.",
    };
    
    const content = initialMessages[scenario.title as keyof typeof initialMessages] || 
      "Hi there! How's your day going?";
    
    const aiMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: Date.now(),
    };
    
    addMessage(aiMessage);
    
    // Generate and play audio
    try {
      const audioData = await elevenLabsService.textToSpeech(content);
      aiMessage.audioUrl = audioData;
      await elevenLabsService.playAudio(audioData);
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (isRecording) {
        await stopRecording();
        return;
      }
      
      setRecording(true);
      const recording = await whisperService.startRecording();
      setCurrentRecording(recording);
    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!currentRecording) return;
      
      setRecording(false);
      setProcessing(true);
      
      const audioUri = await whisperService.stopRecording(currentRecording);
      setCurrentRecording(null);
      
      // Transcribe audio
      const transcription = await whisperService.transcribeAudio(audioUri);
      
      if (transcription.trim()) {
        // Add user message
        const userMessage: ConversationMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: transcription,
          timestamp: Date.now(),
          emotions: emotions.slice(-3), // Include recent emotions
        };
        
        addMessage(userMessage);
        
        // Generate AI response
        await generateAIResponse(transcription);
      }
      
      setProcessing(false);
    } catch (error) {
      console.error('Recording stop error:', error);
      Alert.alert('Error', 'Failed to process recording.');
      setProcessing(false);
    }
  };

  const generateAIResponse = async (userInput: string) => {
    try {
      const scenarioScript = Object.values(scenarios).find(s => 
        s.title.toLowerCase().includes(currentScenario?.title.toLowerCase().split(' ')[0] || '')
      );
      
      if (!scenarioScript) return;
      
      const response = await gptService.generateResponse(
        messages,
        scenarioScript,
        currentEmotion || undefined,
        emotionIntensity
      );
      
      const aiMessage: ConversationMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: response,
        timestamp: Date.now(),
      };
      
      addMessage(aiMessage);
      
      // Generate and play audio response
      try {
        const audioData = await elevenLabsService.textToSpeech(response, currentEmotion || undefined);
        aiMessage.audioUrl = audioData;
        await elevenLabsService.playAudio(audioData);
      } catch (error) {
        console.error('TTS error:', error);
      }
      
      // Update score based on conversation quality
      updateConversationScore();
    } catch (error) {
      console.error('AI response generation error:', error);
    }
  };

  const updateConversationScore = () => {
    let score = currentScore;
    
    // Score based on emotion appropriateness
    if (currentEmotion) {
      const positiveEmotions = ['joy', 'happiness', 'confidence', 'calm'];
      const negativeEmotions = ['anxiety', 'nervousness', 'anger', 'sadness'];
      
      if (positiveEmotions.includes(currentEmotion)) {
        score += Math.round(emotionIntensity * 10);
      } else if (negativeEmotions.includes(currentEmotion)) {
        score -= Math.round(emotionIntensity * 5);
      }
    }
    
    // Score based on conversation length and engagement
    const userMessages = messages.filter(m => m.type === 'user').length;
    score += userMessages * 5;
    
    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));
    updateScore(score);
  };

  const handleEndSession = async () => {
    try {
      const sessionData = endSession();
      if (sessionData) {
        // Save session to Firebase
        await firebaseService.saveSession(sessionData);
        
        // Generate feedback
        const feedback = await gptService.generateScenarioFeedback(
          messages,
          emotions,
          currentScore
        );
        
        Alert.alert(
          'Session Complete!',
          `Score: ${currentScore}/100\n\n${feedback}`,
          [{ text: 'OK', onPress: () => closeSession() }]
        );
      } else {
        closeSession();
      }
    } catch (error) {
      console.error('End session error:', error);
      closeSession();
    }
  };

  const closeSession = () => {
    setShowAvatar(false);
    setShowChatInterface(false);
    setShowEmotionAnalyzer(false);
    setCurrentScenario(null);
  };

  const playAudioMessage = async (audioUrl: string) => {
    try {
      await elevenLabsService.playAudio(audioUrl);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#0F0F19', '#1A1A2E', '#16213E']}
      style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Practice Arena</Text>
          <Text style={styles.subtitleText}>
            Choose your scenario and start building confidence
          </Text>
        </View>

        {/* Mode Selection */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'social' && styles.modeButtonActive,
            ]}
            onPress={() => setSelectedMode('social')}>
            <Users
              size={20}
              color={selectedMode === 'social' ? '#FFF' : '#8B5CF6'}
            />
            <Text
              style={[
                styles.modeText,
                selectedMode === 'social' && styles.modeTextActive,
              ]}>
              Social Confidence
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'romantic' && styles.modeButtonActive,
            ]}
            onPress={() => setSelectedMode('romantic')}>
            <Heart
              size={20}
              color={selectedMode === 'romantic' ? '#FFF' : '#EC4899'}
            />
            <Text
              style={[
                styles.modeText,
                selectedMode === 'romantic' && styles.modeTextActive,
              ]}>
              Romantic Engagement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scenarios */}
        <View style={styles.scenariosContainer}>
          {scenarios
            .filter((s) => s.mode === selectedMode)
            .map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.scenarioCard}
                onPress={() => startScenario(scenario)}>
                <LinearGradient
                  colors={[...scenario.gradient, 'rgba(0,0,0,0.3)']}
                  style={styles.scenarioGradient}>
                  <BlurView intensity={20} style={styles.scenarioBlur}>
                    <View style={styles.scenarioContent}>
                      <scenario.icon size={32} color="#FFF" />
                      <View style={styles.scenarioText}>
                        <Text style={styles.scenarioTitle}>
                          {scenario.title}
                        </Text>
                        <Text style={styles.scenarioDescription}>
                          {scenario.description}
                        </Text>
                        <Text style={styles.scenarioObjective}>
                          Goal: {scenario.objectives.primary}
                        </Text>
                        <View style={styles.scenarioMeta}>
                          <Text style={styles.scenarioDifficulty}>
                            {scenario.difficulty}
                          </Text>
                          <View style={styles.stars}>
                            {[1, 2, 3].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                color="#F59E0B"
                                fill="rgba(245, 158, 11, 0.3)"
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Play size={24} color="#FFF" />
                    </View>
                  </BlurView>
                </LinearGradient>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Avatar Interaction Modal */}
      <Modal visible={showAvatar} animationType="fade" transparent>
        <LinearGradient
          colors={
            currentScenario?.background === 'cafe' 
              ? ['rgba(101, 67, 33, 0.95)', 'rgba(120, 113, 108, 0.95)']
              : currentScenario?.background === 'party'
              ? ['rgba(88, 28, 135, 0.95)', 'rgba(147, 51, 234, 0.95)']
              : ['rgba(15, 15, 25, 0.95)', 'rgba(26, 26, 46, 0.95)']
          }
          style={styles.modalContainer}>
          
          {/* Chat Interface */}
          <ChatInterface
            messages={messages}
            isVisible={showChatInterface}
            onPlayAudio={playAudioMessage}
          />

          {/* Emotion Analyzer */}
          <EmotionAnalyzer
            emotions={emotions}
            currentEmotion={currentEmotion}
            emotionIntensity={emotionIntensity}
            isVisible={showEmotionAnalyzer}
          />

          {/* Toggle Buttons */}
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.toggleButton, showChatInterface && styles.toggleButtonActive]}
              onPress={() => setShowChatInterface(!showChatInterface)}>
              <MessageCircle size={20} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toggleButton, showEmotionAnalyzer && styles.toggleButtonActive]}
              onPress={() => setShowEmotionAnalyzer(!showEmotionAnalyzer)}>
              <Brain size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Scenario Info */}
          {currentScenario && (
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioInfoTitle}>{currentScenario.title}</Text>
              <Text style={styles.scenarioInfoDescription}>{currentScenario.description}</Text>
              <View style={styles.sessionStats}>
                <Text style={styles.sessionStat}>Score: {currentScore}/100</Text>
                <Text style={styles.sessionStat}>Messages: {messages.length}</Text>
                {currentEmotion && (
                  <Text style={styles.sessionStat}>
                    Emotion: {currentEmotion} ({Math.round(emotionIntensity * 100)}%)
                  </Text>
                )}
              </View>
            </View>
          )}

          <Animated.View style={[styles.avatarContainer, avatarStyle]}>
            {/* Avatar Canvas */}
            <View style={styles.avatarCanvas}>
              {/* This is the correct way to pass the imported image to the source prop */}
              <ImageBackground
                source={currentScenario?.avatarUrl}
                style={styles.avatarImageBackground}
                resizeMode="cover"
              >
                <View style={styles.imageOverlay}>
                  <Text style={styles.avatarText}>Sarah</Text>
                  <Text style={styles.avatarSubtext}>
                    {currentScenario?.background === 'cafe' && 'Reading a book, sipping coffee'}
                    {currentScenario?.background === 'party' && 'Chatting with friends'}
                    {currentScenario?.background === 'date' && 'Enjoying a drink at the bar'}
                  </Text>
                </View>
              </ImageBackground>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Animated.View style={recordingStyle}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    (isRecording || isProcessing) && styles.controlButtonActive,
                  ]}
                  onPress={startRecording}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <Text style={styles.processingText}>...</Text>
                  ) : isRecording ? (
                    <MicOff size={24} color="#FFF" />
                  ) : (
                    <Mic size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleEndSession}>
                <Text style={styles.endSessionText}>End</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitButton}
                onPress={closeSession}>
                <X size={20} color="#FFF" />
                <Text style={styles.exitText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  modeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  modeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFF',
  },
  scenariosContainer: {
    paddingHorizontal: 20,
  },
  scenarioCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scenarioGradient: {
    borderRadius: 20,
  },
  scenarioBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  scenarioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scenarioText: {
    flex: 1,
    marginLeft: 16,
  },
  scenarioTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  scenarioObjective: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  scenarioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenarioDifficulty: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  toggleButtons: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 1001,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  scenarioInfo: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scenarioInfoTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  scenarioInfoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionStat: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  avatarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  avatarCanvas: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#333',
  },
  avatarImageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  avatarText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  avatarSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
  },
  processingText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  endSessionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  exitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});