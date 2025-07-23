import React, { useState, useEffect } from 'react';
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
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mic, MicOff, Camera, CameraOff, Play, Pause, RotateCcw, CircleCheck as CheckCircle, ArrowRight, Eye, Smile, Volume2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const calibrationSteps = [
  {
    id: 1,
    title: 'Neutral Tone',
    instruction: 'Read this line in a calm, neutral voice',
    line: "Hello, it's nice to meet you. How are you doing today?",
    tone: 'neutral',
    color: '#6B7280',
  },
  {
    id: 2,
    title: 'Friendly Tone',
    instruction: 'Read with warmth and enthusiasm',
    line: "Hey there! I saw you across the room and figured I'd come say hi.",
    tone: 'friendly',
    color: '#10B981',
  },
  {
    id: 3,
    title: 'Flirtatious Tone',
    instruction: 'Add playful charm and confidence',
    line: "I have to say, you have excellent taste in music. Mind if I join you?",
    tone: 'flirtatious',
    color: '#EC4899',
  },
  {
    id: 4,
    title: 'Assertive Tone',
    instruction: 'Speak with confidence and authority',
    line: "I think we should definitely grab coffee sometime. What do you say?",
    tone: 'assertive',
    color: '#F59E0B',
  },
];

const expressionTests = [
  {
    id: 1,
    name: 'Genuine Smile',
    instruction: 'Show a warm, authentic smile',
    icon: Smile,
    color: '#10B981',
  },
  {
    id: 2,
    name: 'Curious Expression',
    instruction: 'Show interest and curiosity',
    icon: Eye,
    color: '#3B82F6',
  },
  {
    id: 3,
    name: 'Playful Look',
    instruction: 'Express playfulness and charm',
    icon: Smile,
    color: '#EC4899',
  },
];

export default function CalibrationScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('voice'); // voice, expression, gesture
  const [isRecording, setIsRecording] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [calibrationComplete, setCalibrationComplete] = useState(false);

  const progressAnimation = useSharedValue(0);
  const stepAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  useEffect(() => {
    const totalSteps = calibrationSteps.length + expressionTests.length + 1; // +1 for gesture
    progressAnimation.value = withTiming(
      (completedSteps.length / totalSteps) * 100,
      { duration: 500 }
    );
  }, [completedSteps]);

  useEffect(() => {
    stepAnimation.value = withSequence(
      withTiming(0.8, { duration: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  }, [currentStep, currentPhase]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value}%`,
  }));

  const stepStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stepAnimation.value }],
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

  const startRecording = () => {
    setIsRecording(true);
    pulseAnimation.value = withTiming(1, { duration: 1000 });
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      pulseAnimation.value = withTiming(0, { duration: 300 });
      completeCurrentStep();
    }, 3000);
  };

  const completeCurrentStep = () => {
    const stepId = currentPhase === 'voice' 
      ? calibrationSteps[currentStep]?.id 
      : currentPhase === 'expression' 
        ? expressionTests[currentStep]?.id + 100
        : 200; // gesture phase

    if (stepId && !completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }

    // Move to next step or phase
    if (currentPhase === 'voice' && currentStep < calibrationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentPhase === 'voice') {
      setCurrentPhase('expression');
      setCurrentStep(0);
    } else if (currentPhase === 'expression' && currentStep < expressionTests.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentPhase === 'expression') {
      setCurrentPhase('gesture');
      setCurrentStep(0);
    } else {
      setCalibrationComplete(true);
    }
  };

  const renderVoiceCalibration = () => {
    const step = calibrationSteps[currentStep];
    if (!step) return null;

    return (
      <Animated.View style={[styles.stepContainer, stepStyle]}>
        <LinearGradient
          colors={[`${step.color}20`, `${step.color}10`]}
          style={styles.stepGradient}>
          <BlurView intensity={20} style={styles.stepBlur}>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: step.color }]}>
                  <Volume2 size={24} color="#FFF" />
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>

              <Text style={styles.instruction}>{step.instruction}</Text>

              <View style={styles.lineContainer}>
                <Text style={styles.lineText}>"{step.line}"</Text>
              </View>

              <Animated.View style={recordingStyle}>
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonActive,
                    { backgroundColor: step.color },
                  ]}
                  onPress={startRecording}
                  disabled={isRecording}>
                  {isRecording ? (
                    <Pause size={32} color="#FFF" />
                  ) : (
                    // CHANGED: Replaced Mic with Camera icon
                    <Camera size={32} color="#FFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.recordingStatus}>
                {/* CHANGED: Replaced 'Tap to record' with 'Tap to snap' */}
                {isRecording ? 'Recording...' : 'Tap to snap'}
              </Text>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderExpressionCalibration = () => {
    const expression = expressionTests[currentStep];
    if (!expression) return null;

    return (
      <Animated.View style={[styles.stepContainer, stepStyle]}>
        <LinearGradient
          colors={[`${expression.color}20`, `${expression.color}10`]}
          style={styles.stepGradient}>
          <BlurView intensity={20} style={styles.stepBlur}>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: expression.color }]}>
                  <expression.icon size={24} color="#FFF" />
                </View>
                <Text style={styles.stepTitle}>{expression.name}</Text>
              </View>

              <Text style={styles.instruction}>{expression.instruction}</Text>

              <View style={styles.cameraPreview}>
                <LinearGradient
                  colors={['#1F2937', '#374151']}
                  style={styles.cameraPlaceholder}>
                  <Camera size={48} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.cameraText}>Camera Preview</Text>
                </LinearGradient>
              </View>

              <TouchableOpacity
                style={[styles.captureButton, { backgroundColor: expression.color }]}
                onPress={completeCurrentStep}>
                <Camera size={24} color="#FFF" />
                <Text style={styles.captureText}>Capture Expression</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderGestureCalibration = () => (
    <Animated.View style={[styles.stepContainer, stepStyle]}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.2)']}
        style={styles.stepGradient}>
        <BlurView intensity={20} style={styles.stepBlur}>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIcon, { backgroundColor: '#8B5CF6' }]}>
                <Eye size={24} color="#FFF" />
              </View>
              <Text style={styles.stepTitle}>Body Language</Text>
            </View>

            <Text style={styles.instruction}>
              Perform these gestures naturally while looking at the camera
            </Text>

            <View style={styles.gestureList}>
              {['Lean in slightly', 'Nod in agreement', 'Shrug casually', 'Open posture'].map((gesture, index) => (
                <View key={index} style={styles.gestureItem}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.gestureText}>{gesture}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: '#8B5CF6' }]}
              onPress={completeCurrentStep}>
              <Play size={24} color="#FFF" />
              <Text style={styles.captureText}>Complete Gestures</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  const renderCompletionScreen = () => (
    <View style={styles.completionContainer}>
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.3)', 'rgba(34, 197, 94, 0.3)']}
        style={styles.completionGradient}>
        <BlurView intensity={20} style={styles.completionBlur}>
          <View style={styles.completionContent}>
            <CheckCircle size={64} color="#10B981" />
            <Text style={styles.completionTitle}>Calibration Complete!</Text>
            <Text style={styles.completionText}>
              Your personal baseline has been established. The AI can now accurately assess your expressions, tone, and delivery style.
            </Text>

            <View style={styles.baselineStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>87%</Text>
                <Text style={styles.statLabel}>Voice Clarity</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>92%</Text>
                <Text style={styles.statLabel}>Expression Range</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Body Language</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/practice')}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.continueGradient}>
                <Text style={styles.continueText}>Start Practicing</Text>
                <ArrowRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );

  if (calibrationComplete) {
    return (
      <LinearGradient
        colors={['#0F0F19', '#1A1A2E', '#16213E']}
        style={styles.container}>
        {renderCompletionScreen()}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F0F19', '#1A1A2E', '#16213E']}
      style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Initial Calibration</Text>
          <Text style={styles.subtitleText}>
            Help us understand your natural communication style
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round((completedSteps.length / 8) * 100)}% Complete
          </Text>
        </View>

        {/* Phase Indicator */}
        <View style={styles.phaseContainer}>
          <Text style={styles.phaseTitle}>
            {currentPhase === 'voice' && 'Voice Calibration'}
            {currentPhase === 'expression' && 'Expression Calibration'}
            {currentPhase === 'gesture' && 'Gesture Calibration'}
          </Text>
          <Text style={styles.phaseSubtitle}>
            {currentPhase === 'voice' && 'Read lines in different tones'}
            {currentPhase === 'expression' && 'Show various facial expressions'}
            {currentPhase === 'gesture' && 'Demonstrate body language'}
          </Text>
        </View>

        {/* Current Step */}
        {currentPhase === 'voice' && renderVoiceCalibration()}
        {currentPhase === 'expression' && renderExpressionCalibration()}
        {currentPhase === 'gesture' && renderGestureCalibration()}
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },
  phaseContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  phaseSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  stepContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepGradient: {
    borderRadius: 20,
  },
  stepBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepContent: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
  },
  instruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  lineContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  lineText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordingStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  cameraPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
    fontWeight: '600',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  captureText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  gestureList: {
    width: '100%',
    marginBottom: 24,
  },
  gestureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  gestureText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completionGradient: {
    borderRadius: 20,
    width: '100%',
  },
  completionBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  completionContent: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  completionTitle: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
  },
  completionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  baselineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  continueText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
  },
});