import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Trophy,
  TrendingUp,
  Heart,
  Brain,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { SessionData, EmotionData } from '../types/conversation';

const { width } = Dimensions.get('window');

interface SessionReportProps {
  sessionData: SessionData;
  isVisible: boolean;
  onClose: () => void;
  onContinue: () => void;
}

interface EmotionSummary {
  emotion: string;
  averageIntensity: number;
  count: number;
  color: string;
}

export default function SessionReport({
  sessionData,
  isVisible,
  onClose,
  onContinue,
}: SessionReportProps) {
  const slideAnimation = useSharedValue(isVisible ? 0 : width);
  const fadeAnimation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      slideAnimation.value = withSpring(0, { damping: 20, stiffness: 90 });
      fadeAnimation.value = withDelay(300, withTiming(1, { duration: 500 }));
    } else {
      slideAnimation.value = withTiming(width, { duration: 300 });
      fadeAnimation.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnimation.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#6B7280';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const analyzeEmotions = (): EmotionSummary[] => {
    const emotionMap: { [key: string]: { total: number; count: number } } = {};
    
    sessionData.emotions.forEach((emotion: EmotionData) => {
      if (!emotionMap[emotion.emotion]) {
        emotionMap[emotion.emotion] = { total: 0, count: 0 };
      }
      emotionMap[emotion.emotion].total += emotion.intensity;
      emotionMap[emotion.emotion].count += 1;
    });

    const emotionColors: { [key: string]: string } = {
      joy: '#10B981',
      happiness: '#F59E0B',
      confidence: '#8B5CF6',
      calm: '#3B82F6',
      anxiety: '#EF4444',
      nervousness: '#F97316',
      neutral: '#6B7280',
    };

    return Object.entries(emotionMap)
      .map(([emotion, data]) => ({
        emotion,
        averageIntensity: data.total / data.count,
        count: data.count,
        color: emotionColors[emotion] || '#6B7280',
      }))
      .sort((a, b) => b.averageIntensity - a.averageIntensity)
      .slice(0, 5);
  };

  const getImprovementSuggestions = () => {
    const suggestions = [];
    const emotions = analyzeEmotions();
    
    if (sessionData.score < 60) {
      suggestions.push({
        icon: TrendingUp,
        title: 'Practice More Scenarios',
        description: 'Try different conversation types to build confidence',
        color: '#8B5CF6',
      });
    }

    const anxietyEmotion = emotions.find(e => e.emotion === 'anxiety' || e.emotion === 'nervousness');
    if (anxietyEmotion && anxietyEmotion.averageIntensity > 0.6) {
      suggestions.push({
        icon: Heart,
        title: 'Relaxation Techniques',
        description: 'Practice breathing exercises before conversations',
        color: '#EC4899',
      });
    }

    if (sessionData.messages.filter(m => m.type === 'user').length < 3) {
      suggestions.push({
        icon: Brain,
        title: 'Engage More',
        description: 'Try to contribute more to the conversation',
        color: '#10B981',
      });
    }

    return suggestions;
  };

  const emotionSummary = analyzeEmotions();
  const improvements = getImprovementSuggestions();
  const duration = sessionData.endTime ? 
    Math.round((sessionData.endTime - sessionData.startTime) / 1000 / 60) : 0;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={40} style={styles.reportBlur}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(15, 15, 25, 0.9)']}
          style={styles.reportGradient}>
          
          <Animated.View style={[styles.content, contentStyle]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Trophy size={32} color="#F59E0B" />
                <Text style={styles.headerTitle}>Session Complete!</Text>
                <Text style={styles.headerSubtitle}>
                  Here's how you performed
                </Text>
              </View>

              {/* Score Card */}
              <View style={styles.scoreCard}>
                <LinearGradient
                  colors={[getScoreColor(sessionData.score), `${getScoreColor(sessionData.score)}80`]}
                  style={styles.scoreGradient}>
                  <View style={styles.scoreContent}>
                    <Text style={styles.scoreValue}>{sessionData.score}</Text>
                    <Text style={styles.scoreGrade}>{getScoreGrade(sessionData.score)}</Text>
                    <Text style={styles.scoreLabel}>Overall Score</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Session Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{duration}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {sessionData.messages.filter(m => m.type === 'user').length}
                  </Text>
                  <Text style={styles.statLabel}>Messages</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{sessionData.emotions.length}</Text>
                  <Text style={styles.statLabel}>Emotions</Text>
                </View>
              </View>

              {/* Emotion Analysis */}
              <View style={styles.emotionSection}>
                <Text style={styles.sectionTitle}>Emotional Journey</Text>
                {emotionSummary.map((emotion, index) => (
                  <View key={emotion.emotion} style={styles.emotionItem}>
                    <View style={styles.emotionInfo}>
                      <View style={[
                        styles.emotionDot,
                        { backgroundColor: emotion.color }
                      ]} />
                      <Text style={styles.emotionName}>
                        {emotion.emotion.charAt(0).toUpperCase() + emotion.emotion.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.emotionStats}>
                      <Text style={styles.emotionIntensity}>
                        {Math.round(emotion.averageIntensity * 100)}%
                      </Text>
                      <Text style={styles.emotionCount}>
                        {emotion.count}x
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Achievements */}
              {sessionData.achievements.length > 0 && (
                <View style={styles.achievementsSection}>
                  <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
                  {sessionData.achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <CheckCircle size={20} color="#10B981" />
                      <Text style={styles.achievementText}>{achievement}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Improvement Suggestions */}
              {improvements.length > 0 && (
                <View style={styles.improvementSection}>
                  <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
                  {improvements.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionItem}>
                      <View style={[
                        styles.suggestionIcon,
                        { backgroundColor: suggestion.color }
                      ]}>
                        <suggestion.icon size={20} color="#FFF" />
                      </View>
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionTitle}>
                          {suggestion.title}
                        </Text>
                        <Text style={styles.suggestionDescription}>
                          {suggestion.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Key Moments */}
              <View style={styles.momentsSection}>
                <Text style={styles.sectionTitle}>Key Moments</Text>
                <View style={styles.momentItem}>
                  <AlertCircle size={16} color="#F59E0B" />
                  <Text style={styles.momentText}>
                    Peak confidence at {Math.round(duration * 0.6)} minutes
                  </Text>
                </View>
                <View style={styles.momentItem}>
                  <Star size={16} color="#10B981" />
                  <Text style={styles.momentText}>
                    Best emotional response during greeting
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Review Later</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onContinue}>
                <LinearGradient
                  colors={['#8B5CF6', '#3B82F6']}
                  style={styles.primaryGradient}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <ArrowRight size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2000,
  },
  reportBlur: {
    flex: 1,
  },
  reportGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scoreCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreGradient: {
    padding: 32,
    alignItems: 'center',
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 64,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreGrade: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  emotionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  emotionName: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  emotionStats: {
    alignItems: 'flex-end',
  },
  emotionIntensity: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },
  emotionCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 8,
  },
  improvementSection: {
    marginBottom: 24,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  momentsSection: {
    marginBottom: 32,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  momentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },
});