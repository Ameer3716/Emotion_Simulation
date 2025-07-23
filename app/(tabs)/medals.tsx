import React, { useEffect, useState } from 'react';
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
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Heart,
  Users,
  Brain,
  Zap,
  Shield,
  Eye,
  MessageCircle,
  Award,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const medals = [
  {
    id: 1,
    name: 'Friendliness',
    level: 4,
    progress: 0.85,
    icon: Heart,
    color: '#EC4899',
    description: 'Smiling, approachable body language, initiating contact',
    earnedFor: 'Maintaining warm expressions and open posture during interactions',
    unlocked: true,
    lastEarned: 'Coffee Shop Scenario - 3 stars',
  },
  {
    id: 2,
    name: 'Composure',
    level: 3,
    progress: 0.72,
    icon: Shield,
    color: '#3B82F6',
    description: 'Responding calmly to awkward pauses or rejections',
    earnedFor: 'Staying calm when conversation hit an awkward silence',
    unlocked: true,
    lastEarned: 'House Party Scenario - 2 stars',
  },
  {
    id: 3,
    name: 'Charisma',
    level: 5,
    progress: 0.94,
    icon: Zap,
    color: '#F59E0B',
    description: 'Storytelling, using humor effectively, getting others to laugh',
    earnedFor: 'Made the group laugh with a perfectly timed joke',
    unlocked: true,
    lastEarned: 'Bar Scenario - 3 stars',
  },
  {
    id: 4,
    name: 'Awareness',
    level: 3,
    progress: 0.58,
    icon: Eye,
    color: '#10B981',
    description: 'Reading body language, pausing appropriately, sensing discomfort',
    earnedFor: 'Noticed when someone felt left out and included them',
    unlocked: true,
    lastEarned: 'Group Conversation - 2 stars',
  },
  {
    id: 5,
    name: 'Persuasion',
    level: 2,
    progress: 0.35,
    icon: MessageCircle,
    color: '#8B5CF6',
    description: 'Suggesting actions (e.g., "Want to grab a drink?") without pressure',
    earnedFor: 'Successfully suggested moving to a quieter area',
    unlocked: true,
    lastEarned: 'Date Night Scenario - 1 star',
  },
  {
    id: 6,
    name: 'Empathy',
    level: 1,
    progress: 0.28,
    icon: Users,
    color: '#06B6D4',
    description: 'Comforting a nervous character or pausing when they show discomfort',
    earnedFor: 'Showed genuine concern when someone seemed uncomfortable',
    unlocked: true,
    lastEarned: 'Coffee Shop Scenario - 1 star',
  },
  {
    id: 7,
    name: 'Clarity',
    level: 2,
    progress: 0.45,
    icon: MessageCircle,
    color: '#8B5CF6',
    description: 'Speaking clearly, avoiding filler, confidently expressing intent',
    earnedFor: 'Communicated thoughts without hesitation or filler words',
    unlocked: false,
    lastEarned: null,
  },
  {
    id: 8,
    name: 'Adaptability',
    level: 1,
    progress: 0.15,
    icon: Brain,
    color: '#7C3AED',
    description: 'Navigating sudden topic changes without losing rapport',
    earnedFor: 'Smoothly handled when conversation shifted unexpectedly',
    unlocked: false,
    lastEarned: null,
  },
];

export default function MedalsScreen() {
  const [selectedMedal, setSelectedMedal] = useState<any>(null);
  const animationValues = medals.map(() => useSharedValue(0));
  const scaleValues = medals.map(() => useSharedValue(1));

  useEffect(() => {
    // Staggered entrance animation
    animationValues.forEach((value, index) => {
      value.value = withDelay(index * 200, withSpring(1));
    });
  }, []);

  const selectMedal = (medal: any, index: number) => {
    setSelectedMedal(medal);
    scaleValues[index].value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
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
          <Text style={styles.titleText}>Medal Collection</Text>
          <Text style={styles.subtitleText}>
            Track your social and emotional growth
          </Text>
        </View>

        {/* Medal Grid */}
        <View style={styles.medalGrid}>
          {medals.map((medal, index) => {
            const animatedStyle = useAnimatedStyle(() => ({
              transform: [
                { translateY: interpolate(animationValues[index].value, [0, 1], [50, 0]) },
                { scale: scaleValues[index].value },
              ],
              opacity: animationValues[index].value,
            }));

            return (
              <Animated.View key={medal.id} style={[styles.medalCard, animatedStyle]}>
                <TouchableOpacity
                  onPress={() => selectMedal(medal, index)}
                  style={styles.medalTouchable}>
                  <LinearGradient
                    colors={
                      medal.unlocked
                        ? [medal.color, `${medal.color}80`]
                        : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.medalGradient}>
                    <BlurView intensity={medal.unlocked ? 20 : 10} style={styles.medalBlur}>
                      <>
                        <View style={styles.medalContent}>
                        {/* Medal Icon */}
                        <View style={[
                          styles.medalIcon,
                          { backgroundColor: medal.unlocked ? medal.color : 'rgba(255,255,255,0.1)' }
                        ]}>
                          <medal.icon 
                            size={32} 
                            color={medal.unlocked ? '#FFF' : 'rgba(255,255,255,0.3)'} 
                          />
                        </View>

                        {/* Medal Info */}
                        <Text style={[
                          styles.medalName,
                          { color: medal.unlocked ? '#FFF' : 'rgba(255,255,255,0.5)' }
                        ]}>
                          {medal.name}
                        </Text>

                        {/* Level */}
                        <View style={styles.levelContainer}>
                          <Text style={[
                            styles.levelText,
                            { color: medal.unlocked ? medal.color : 'rgba(255,255,255,0.3)' }
                          ]}>
                            Level {medal.level}
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <LinearGradient
                              colors={medal.unlocked ? [medal.color, `${medal.color}80`] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
                              style={[
                                styles.progressFill,
                                { width: `${medal.progress * 100}%` }
                              ]}
                            />
                          </View>
                          <Text style={[
                            styles.progressText,
                            { color: medal.unlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }
                          ]}>
                            {Math.round(medal.progress * 100)}%
                          </Text>
                        </View>

                        {/* Lock indicator for locked medals */}
                        {!medal.unlocked && (
                          <View style={styles.lockIndicator}>
                            <Award size={16} color="rgba(255,255,255,0.3)" />
                          </View>
                        )}
                      </View>

                      {/* Last Earned */}
                      {medal.lastEarned && (
                        <View style={styles.lastEarnedContainer}>
                          <Text style={[
                            styles.lastEarnedText,
                            { color: medal.unlocked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }
                          ]}>
                            {medal.lastEarned}
                          </Text>
                        </View>
                      )}
                      </>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Selected Medal Details */}
        {selectedMedal && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Medal Details</Text>
            <View style={styles.detailsCard}>
              <BlurView intensity={20} style={styles.detailsBlur}>
                <LinearGradient
                  colors={[
                    selectedMedal.unlocked ? selectedMedal.color : 'rgba(255,255,255,0.1)',
                    `${selectedMedal.unlocked ? selectedMedal.color : 'rgba(255,255,255,0.1)'}50`
                  ]}
                  style={styles.detailsGradient}>
                  <View style={styles.detailsContent}>
                    <selectedMedal.icon 
                      size={48} 
                      color={selectedMedal.unlocked ? '#FFF' : 'rgba(255,255,255,0.5)'} 
                    />
                    <View style={styles.detailsText}>
                      <Text style={[
                        styles.detailsName,
                        { color: selectedMedal.unlocked ? '#FFF' : 'rgba(255,255,255,0.7)' }
                      ]}>
                        {selectedMedal.name}
                      </Text>
                      <Text style={[
                        styles.detailsDescription,
                        { color: selectedMedal.unlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }
                      ]}>
                        {selectedMedal.description}
                      </Text>
                      <Text style={[
                        styles.detailsEarnedFor,
                        { color: selectedMedal.unlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }
                      ]}>
                        How to earn: {selectedMedal.earnedFor}
                      </Text>
                      {selectedMedal.lastEarned && (
                        <Text style={[
                          styles.detailsLastEarned,
                          { color: selectedMedal.unlocked ? selectedMedal.color : 'rgba(255,255,255,0.4)' }
                        ]}>
                          Last earned: {selectedMedal.lastEarned}
                        </Text>
                      )}
                      <Text style={[
                        styles.detailsLevel,
                        { color: selectedMedal.unlocked ? selectedMedal.color : 'rgba(255,255,255,0.4)' }
                      ]}>
                        Current Level: {selectedMedal.level}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>
          </View>
        )}

        {/* Overall Progress */}
        <View style={styles.overallSection}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Medals Unlocked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>73%</Text>
              <Text style={styles.statLabel}>Average Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>18</Text>
              <Text style={styles.statLabel}>Sessions Completed</Text>
            </View>
          </View>
          
          {/* Recent Achievements */}
          <View style={styles.recentAchievements}>
            <Text style={styles.achievementsTitle}>Recent Achievements</Text>
            <View style={styles.achievementItem}>
              <Zap size={16} color="#F59E0B" />
              <Text style={styles.achievementText}>Charisma Level 5 Unlocked!</Text>
            </View>
            <View style={styles.achievementItem}>
              <Heart size={16} color="#EC4899" />
              <Text style={styles.achievementText}>Friendliness Mastery Progress</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  medalGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  medalCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  medalTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  medalGradient: {
    borderRadius: 20,
  },
  medalBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  medalContent: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
  medalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  medalName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelContainer: {
    marginBottom: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastEarnedContainer: {
    marginTop: 8,
    width: '100%',
  },
  lastEarnedText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  lockIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  detailsTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  detailsCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailsBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailsGradient: {
    borderRadius: 20,
  },
  detailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  detailsText: {
    flex: 1,
    marginLeft: 16,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  detailsEarnedFor: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailsLastEarned: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  detailsLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  overallSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
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
    textAlign: 'center',
    fontWeight: '600',
  },
  recentAchievements: {
    marginTop: 24,
  },
  achievementsTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    fontWeight: '500',
  },
});