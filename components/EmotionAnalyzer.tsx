import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Brain, Heart, Zap, Eye } from 'lucide-react-native';
import { EmotionData } from '../types/conversation';

const { width } = Dimensions.get('window');

interface EmotionAnalyzerProps {
  emotions: EmotionData[];
  currentEmotion: string | null;
  emotionIntensity: number;
  isVisible: boolean;
}

const emotionColors: Record<string, string> = {
  joy: '#10B981',
  happiness: '#F59E0B',
  excitement: '#EF4444',
  confidence: '#8B5CF6',
  calm: '#3B82F6',
  anxiety: '#F97316',
  nervousness: '#EF4444',
  sadness: '#6B7280',
  anger: '#DC2626',
  surprise: '#06B6D4',
  fear: '#7C2D12',
  disgust: '#059669',
  neutral: '#9CA3AF',
};

const emotionIcons: Record<string, React.ElementType> = {
  joy: Heart,
  happiness: Heart,
  excitement: Zap,
  confidence: Brain,
  calm: Eye,
  anxiety: Brain,
  nervousness: Brain,
  default: Brain,
};

export default function EmotionAnalyzer({
  emotions,
  currentEmotion,
  emotionIntensity,
  isVisible,
}: EmotionAnalyzerProps) {
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const slideAnimation = useSharedValue(isVisible ? 0 : -width * 0.4);
  const pulseAnimation = useSharedValue(0);
  const intensityAnimation = useSharedValue(0);

  useEffect(() => {
    slideAnimation.value = withSpring(isVisible ? 0 : -width * 0.4, {
      damping: 20,
      stiffness: 90,
    });
  }, [isVisible]);

  useEffect(() => {
    if (emotions.length > 0) {
      setEmotionHistory(prev => [...prev, ...emotions].slice(-20)); // Keep last 20 emotions
    }
  }, [emotions]);

  useEffect(() => {
    intensityAnimation.value = withTiming(emotionIntensity, { duration: 500 });
    pulseAnimation.value = withTiming(emotionIntensity > 0.7 ? 1 : 0, { duration: 300 });
  }, [emotionIntensity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnimation.value }],
  }));

  const intensityStyle = useAnimatedStyle(() => {
    const color = currentEmotion ? emotionColors[currentEmotion] || '#9CA3AF' : '#9CA3AF';
    return {
      width: `${interpolate(intensityAnimation.value, [0, 1], [10, 100])}%`,
      backgroundColor: color,
    };
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pulseAnimation.value, [0, 1], [1, 1.1]),
      },
    ],
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.8, 1]),
  }));

  const getEmotionIcon = (emotion: string) => {
    return emotionIcons[emotion] || emotionIcons.default;
  };

  const getEmotionColor = (emotion: string) => {
    return emotionColors[emotion] || emotionColors.neutral;
  };

  const calculateAverageEmotion = () => {
    if (emotionHistory.length === 0) return null;
    
    const emotionCounts: Record<string, number> = {};
    emotionHistory.forEach(emotion => {
      emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + emotion.intensity;
    });

    const topEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    );

    return {
      emotion: topEmotion[0],
      averageIntensity: topEmotion[1] / emotionHistory.filter(e => e.emotion === topEmotion[0]).length,
    };
  };

  const averageEmotion = calculateAverageEmotion();

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={30} style={styles.emotionBlur}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)']}
          style={styles.emotionGradient}>
          
          {/* Header */}
          <View style={styles.emotionHeader}>
            <Brain size={20} color="#FFF" />
            <Text style={styles.emotionTitle}>Emotion Analysis</Text>
          </View>

          {/* Current Emotion */}
          <Animated.View style={[styles.currentEmotionContainer, pulseStyle]}>
            <View style={styles.currentEmotionContent}>
              {currentEmotion && (
                <>
                  <View style={[
                    styles.emotionIcon,
                    { backgroundColor: getEmotionColor(currentEmotion) }
                  ]}>
                    {React.createElement(getEmotionIcon(currentEmotion), {
                      size: 24,
                      color: '#FFF',
                    })}
                  </View>
                  <View style={styles.emotionInfo}>
                    <Text style={styles.currentEmotionText}>
                      {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                    </Text>
                    <Text style={styles.emotionIntensityText}>
                      {Math.round(emotionIntensity * 100)}% intensity
                    </Text>
                  </View>
                </>
              )}
              
              {!currentEmotion && (
                <View style={styles.noEmotionContainer}>
                  <Eye size={24} color="rgba(255, 255, 255, 0.5)" />
                  <Text style={styles.noEmotionText}>Analyzing...</Text>
                </View>
              )}
            </View>

            {/* Intensity Bar */}
            <View style={styles.intensityBarContainer}>
              <Text style={styles.intensityLabel}>Intensity</Text>
              <View style={styles.intensityBar}>
                <Animated.View style={[styles.intensityFill, intensityStyle]} />
              </View>
            </View>
          </Animated.View>

          {/* Emotion History Graph */}
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Emotional Journey</Text>
            <View style={styles.historyGraph}>
              {emotionHistory.slice(-10).map((emotion, index) => {
                const height = emotion.intensity * 60;
                const color = getEmotionColor(emotion.emotion);
                
                return (
                  <View key={index} style={styles.historyBar}>
                    <View
                      style={[
                        styles.historyBarFill,
                        {
                          height,
                          backgroundColor: color,
                        },
                      ]}
                    />
                    <Text style={styles.historyBarLabel}>
                      {emotion.emotion.slice(0, 3)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Average Emotion */}
          {averageEmotion && (
            <View style={styles.averageContainer}>
              <Text style={styles.averageTitle}>Session Average</Text>
              <View style={styles.averageContent}>
                <View style={[
                  styles.averageIcon,
                  { backgroundColor: getEmotionColor(averageEmotion.emotion) }
                ]}>
                  {React.createElement(getEmotionIcon(averageEmotion.emotion), {
                    size: 16,
                    color: '#FFF',
                  })}
                </View>
                <Text style={styles.averageText}>
                  {averageEmotion.emotion.charAt(0).toUpperCase() + averageEmotion.emotion.slice(1)}
                </Text>
                <Text style={styles.averageIntensity}>
                  {Math.round(averageEmotion.averageIntensity * 100)}%
                </Text>
              </View>
            </View>
          )}

          {/* Real-time Indicators */}
          <View style={styles.indicatorsContainer}>
            <View style={styles.indicator}>
              <View style={[
                styles.indicatorDot,
                { backgroundColor: emotions.length > 0 ? '#10B981' : '#6B7280' }
              ]} />
              <Text style={styles.indicatorText}>
                {emotions.length > 0 ? 'Active' : 'Inactive'}
              </Text>
            </View>
            
            <View style={styles.indicator}>
              <View style={[
                styles.indicatorDot,
                { backgroundColor: emotionIntensity > 0.5 ? '#F59E0B' : '#6B7280' }
              ]} />
              <Text style={styles.indicatorText}>
                {emotionIntensity > 0.5 ? 'High' : 'Low'} Intensity
              </Text>
            </View>
          </View>
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
    width: width * 0.4,
    height: '100%',
    zIndex: 1000,
  },
  emotionBlur: {
    flex: 1,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  emotionGradient: {
    flex: 1,
    padding: 16,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 8,
  },
  currentEmotionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  currentEmotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emotionInfo: {
    flex: 1,
  },
  currentEmotionText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 2,
  },
  emotionIntensityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  noEmotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noEmotionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
    fontWeight: '500',
  },
  intensityBarContainer: {
    marginTop: 8,
  },
  intensityLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    fontWeight: '600',
  },
  intensityBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  historyGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
  },
  historyBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 1,
  },
  historyBarFill: {
    width: '100%',
    borderRadius: 2,
    marginBottom: 4,
  },
  historyBarLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  averageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  averageTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginBottom: 8,
  },
  averageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  averageText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    flex: 1,
  },
  averageIntensity: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});