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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
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
} from 'lucide-react-native';

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
  const [isRecording, setIsRecording] = useState(false);
  const [emotionLevel, setEmotionLevel] = useState(0.6);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [conversationMoves, setConversationMoves] = useState(0);
  const [achievedObjectives, setAchievedObjectives] = useState<string[]>([]);

  const pulseAnimation = useSharedValue(0);
  const avatarScale = useSharedValue(0);
  const emotionAnimation = useSharedValue(0);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
    emotionAnimation.value = withTiming(emotionLevel, { duration: 500 });
  }, [emotionLevel]);

  useEffect(() => {
    if (showAvatar) {
      avatarScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      avatarScale.value = withSpring(0);
    }
  }, [showAvatar]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: avatarScale.value,
  }));

  const emotionStyle = useAnimatedStyle(() => ({
    width: `${interpolate(emotionAnimation.value, [0, 1], [10, 100])}%`,
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

  const startScenario = (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setShowAvatar(true);
    setSessionProgress(0);
    setConversationMoves(0);
    setAchievedObjectives([]);
    // Simulate emotion level changes
    setTimeout(() => setEmotionLevel(0.8), 1000);
    setTimeout(() => setEmotionLevel(0.4), 3000);
    setTimeout(() => setEmotionLevel(0.9), 5000);
  };

  const makeConversationMove = () => {
    if (conversationMoves < 5) {
      setConversationMoves(conversationMoves + 1);
      setSessionProgress((conversationMoves + 1) / 5);
      
      // Simulate objective completion
      if (conversationMoves === 2 && Math.random() > 0.5) {
        setAchievedObjectives([...achievedObjectives, 'primary']);
      }
      if (conversationMoves === 3 && Math.random() > 0.6) {
        setAchievedObjectives([...achievedObjectives, 'bonus1']);
      }
    }
  };

  const endSession = () => {
    setShowAvatar(false);
    setCurrentScenario(null);
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
          
          {/* Scenario Info */}
          {currentScenario && (
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioInfoTitle}>{currentScenario.title}</Text>
              <Text style={styles.scenarioInfoDescription}>{currentScenario.description}</Text>
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

            {/* Session Progress */}
            <View style={styles.sessionProgress}>
              <Text style={styles.progressLabel}>Session Progress</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${sessionProgress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{conversationMoves}/5 moves</Text>
              </View>
            </View>

            {/* Objectives Tracker */}
            {currentScenario && (
              <View style={styles.objectivesTracker}>
                <Text style={styles.objectivesTitle}>Objectives</Text>
                <View style={styles.objectiveItem}>
                  <View style={[
                    styles.objectiveIndicator,
                    achievedObjectives.includes('primary') && styles.objectiveCompleted
                  ]} />
                  <Text style={styles.objectiveText}>{currentScenario.objectives.primary}</Text>
                </View>
                {currentScenario.objectives.bonus.map((bonus: string, index: number) => (
                  <View key={index} style={styles.objectiveItem}>
                    <View style={[
                      styles.objectiveIndicator,
                      achievedObjectives.includes(`bonus${index + 1}`) && styles.objectiveCompleted
                    ]} />
                    <Text style={styles.objectiveText}>Bonus: {bonus}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Emotion Meter */}
            <View style={styles.emotionMeter}>
              <Text style={styles.emotionLabel}>Emotion Level</Text>
              <View style={styles.emotionBar}>
                <Animated.View style={[styles.emotionFill, emotionStyle]} />
              </View>
              <Text style={styles.emotionValue}>
                {Math.round(emotionLevel * 100)}%
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.conversationButton}
                onPress={makeConversationMove}
                disabled={conversationMoves >= 5}>
                <Text style={styles.conversationButtonText}>
                  {conversationMoves >= 5 ? 'Complete' : 'Make Move'}
                </Text>
              </TouchableOpacity>

              <Animated.View style={recordingStyle}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    isRecording && styles.controlButtonActive,
                  ]}
                  onPress={() => setIsRecording(!isRecording)}>
                  {isRecording ? (
                    <MicOff size={24} color="#FFF" />
                  ) : (
                    <Mic size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity style={styles.controlButton}>
                <Camera size={60} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitButton}
                onPress={endSession}>
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
  sessionProgress: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  objectivesTracker: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  objectivesTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  objectiveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
  },
  objectiveCompleted: {
    backgroundColor: '#10B981',
  },
  objectiveText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  emotionMeter: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 30,
  },
  emotionLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  emotionBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  emotionFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  emotionValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  conversationButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  conversationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  exitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  exitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});