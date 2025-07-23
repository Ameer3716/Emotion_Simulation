import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Play, Star, TrendingUp, Users, Trophy, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [frsScore] = useState(8.2);
  const [recentActivity] = useState([
    {
      id: 1,
      title: 'Bar Scenario Complete',
      subtitle: '3 stars • Charisma +1 • FRS +0.3',
      icon: Star,
      color: '#F59E0B',
      type: 'success'
    },
    {
      id: 2,
      title: 'Persuasion Medal Unlocked',
      subtitle: 'Level 2 • Successfully suggested venue change',
      icon: Trophy,
      color: '#8B5CF6',
      type: 'medal'
    },
    {
      id: 3,
      title: 'Group Practice Session',
      subtitle: '2 stars • Awareness +1 • FRS +0.2',
      icon: Users,
      color: '#10B981',
      type: 'practice'
    }
  ]);
  const pulseAnimation = useSharedValue(0);
  const floatAnimation = useSharedValue(0);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pulseAnimation.value, [0, 1], [1, 1.05]),
      },
    ],
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.8, 1]),
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(floatAnimation.value, [0, 1], [-5, 5]),
      },
    ],
  }));

  return (
    <LinearGradient
      colors={['#0F0F19', '#1A1A2E', '#16213E']}
      style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.titleText}>Confidence Academy</Text>
          <Animated.View style={floatStyle}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.2)']}
              style={styles.particleEffect}
            />
          </Animated.View>
        </View>

        {/* FRS Score Card */}
        <Animated.View style={[styles.scoreCard, pulseStyle]}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <LinearGradient
              colors={[
                'rgba(139, 92, 246, 0.3)',
                'rgba(59, 130, 246, 0.3)',
                'rgba(16, 185, 129, 0.3)',
              ]}
              style={styles.scoreGradient}>
              <View style={styles.scoreContent}>
                <Text style={styles.scoreLabel}>Fluency & Readiness Score</Text>
                <Text style={styles.scoreValue}>{frsScore}</Text>
                <Text style={styles.scoreSubtext}>
                  {frsScore >= 8 ? 'Excellent Progress!' : 
                   frsScore >= 6 ? 'Good Progress!' : 
                   'Keep Practicing!'}
                </Text>
                
                {/* FRS Breakdown */}
                <View style={styles.frsBreakdown}>
                  <View style={styles.frsItem}>
                    <Text style={styles.frsLabel}>Charisma</Text>
                    <Text style={styles.frsValue}>9.1</Text>
                  </View>
                  <View style={styles.frsItem}>
                    <Text style={styles.frsLabel}>Empathy</Text>
                    <Text style={styles.frsValue}>7.8</Text>
                  </View>
                  <View style={styles.frsItem}>
                    <Text style={styles.frsLabel}>Confidence</Text>
                    <Text style={styles.frsValue}>8.5</Text>
                  </View>
                </View>
                
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#8B5CF6', '#3B82F6', '#10B981']}
                    style={[
                      styles.progressFill,
                      { width: `${(frsScore / 10) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statText}>Medals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statText}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>73%</Text>
            <Text style={styles.statText}>Avg Score</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/calibration')}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.8)', 'rgba(251, 191, 36, 0.8)']}
              style={styles.actionGradient}>
              <Zap size={24} color="#FFF" />
              <Text style={styles.actionText}>Calibrate</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/practice')}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.8)', 'rgba(59, 130, 246, 0.8)']}
              style={styles.actionGradient}>
              <Play size={24} color="#FFF" />
              <Text style={styles.actionText}>Practice</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <BlurView intensity={15} style={styles.activityBlur}>
                <View style={styles.activityContent}>
                  <activity.icon 
                    size={20} 
                    color={activity.color} 
                    fill={activity.type === 'success' ? activity.color : 'none'}
                  />
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <TrendingUp size={20} color="#10B981" />
                </View>
              </BlurView>
            </View>
          ))}
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
    position: 'relative',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '700',
    marginTop: 5,
    letterSpacing: -0.5,
  },
  particleEffect: {
    position: 'absolute',
    top: -10,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.6,
  },
  scoreCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 24,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 16,
  },
  frsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  frsItem: {
    alignItems: 'center',
  },
  frsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    fontWeight: '600',
  },
  frsValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  activityCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  activitySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});