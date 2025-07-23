import React, { useRef, useEffect } from 'react';
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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Bot, Volume2 } from 'lucide-react-native';
import { ConversationMessage } from '../types/conversation';

const { width } = Dimensions.get('window');

interface ChatInterfaceProps {
  messages: ConversationMessage[];
  isVisible: boolean;
  onPlayAudio?: (audioUrl: string) => void;
}

export default function ChatInterface({ 
  messages, 
  isVisible, 
  onPlayAudio 
}: ChatInterfaceProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnimation = useSharedValue(isVisible ? 0 : width);

  useEffect(() => {
    slideAnimation.value = withSpring(isVisible ? 0 : width, {
      damping: 20,
      stiffness: 90,
    });
  }, [isVisible]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnimation.value }],
  }));

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: ConversationMessage, index: number) => {
    const isUser = message.type === 'user';
    const messageAnimation = useSharedValue(0);

    useEffect(() => {
      messageAnimation.value = withTiming(1, { duration: 300 });
    }, []);

    const messageStyle = useAnimatedStyle(() => ({
      opacity: messageAnimation.value,
      transform: [
        { 
          translateY: withTiming(0, { duration: 300 }) 
        },
      ],
    }));

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
          messageStyle,
        ]}>
        <View style={styles.messageWrapper}>
          {/* Avatar */}
          <View style={[
            styles.messageAvatar,
            isUser ? styles.userAvatar : styles.aiAvatar,
          ]}>
            {isUser ? (
              <User size={16} color="#FFF" />
            ) : (
              <Bot size={16} color="#FFF" />
            )}
          </View>

          {/* Message Bubble */}
          <View style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}>
            <BlurView intensity={20} style={styles.messageBlur}>
              <LinearGradient
                colors={
                  isUser 
                    ? ['rgba(139, 92, 246, 0.8)', 'rgba(99, 102, 241, 0.8)']
                    : ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.8)']
                }
                style={styles.messageGradient}>
                <Text style={[
                  styles.messageText,
                  isUser ? styles.userMessageText : styles.aiMessageText,
                ]}>
                  {message.content}
                </Text>

                {/* Audio playback button for AI messages */}
                {!isUser && message.audioUrl && onPlayAudio && (
                  <TouchableOpacity
                    style={styles.audioButton}
                    onPress={() => onPlayAudio(message.audioUrl!)}>
                    <Volume2 size={14} color="rgba(255, 255, 255, 0.8)" />
                  </TouchableOpacity>
                )}

                {/* Timestamp */}
                <Text style={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </Text>

                {/* Emotion indicators for user messages */}
                {isUser && message.emotions && message.emotions.length > 0 && (
                  <View style={styles.emotionIndicators}>
                    {message.emotions.slice(0, 2).map((emotion, idx) => (
                      <View key={idx} style={styles.emotionTag}>
                        <Text style={styles.emotionText}>
                          {emotion.emotion} {Math.round(emotion.intensity * 100)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </BlurView>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={30} style={styles.chatBlur}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)']}
          style={styles.chatGradient}>
          
          {/* Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Conversation</Text>
            <Text style={styles.chatSubtitle}>
              {messages.length} messages
            </Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}>
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Bot size={48} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyText}>
                  Start the conversation!
                </Text>
                <Text style={styles.emptySubtext}>
                  Your messages will appear here
                </Text>
              </View>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
          </ScrollView>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.85,
    height: '100%',
    zIndex: 1000,
  },
  chatBlur: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  chatGradient: {
    flex: 1,
    padding: 16,
  },
  chatHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userAvatar: {
    backgroundColor: '#8B5CF6',
    order: 2,
  },
  aiAvatar: {
    backgroundColor: '#6B7280',
    order: 1,
  },
  messageBubble: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
  },
  userBubble: {
    order: 1,
    marginRight: 8,
  },
  aiBubble: {
    order: 2,
    marginLeft: 8,
  },
  messageBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageGradient: {
    padding: 12,
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  userMessageText: {
    color: '#FFF',
    fontWeight: '500',
  },
  aiMessageText: {
    color: '#FFF',
    fontWeight: '400',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  audioButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionIndicators: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  emotionTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emotionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});