# Social Confidence Training App - Phase 2 & 3 Implementation

This React Native Expo app helps users build social confidence through AI-powered conversation practice with real-time emotion detection and feedback.

## 🚀 Features Implemented

### Phase 2: AI Conversation + Emotion Detection
- **Real-time Voice Chat**: Speech-to-text using Whisper API
- **AI Conversation**: GPT-4 powered responses with context awareness
- **Text-to-Speech**: ElevenLabs integration for natural avatar voices
- **Emotion Analysis**: Hume AI streaming API for facial and voice emotion detection
- **Interactive UI**: Chat interface with emotion visualization
- **Scenario-based Dialogue**: Branching conversation flows

### Phase 3: Scoring Logic, Avatar Animation, Deployment
- **Firebase Backend**: User profiles, session data, and analytics
- **Scoring System**: Real-time performance evaluation
- **Session Reports**: Detailed feedback and improvement suggestions
- **Medal System**: Progress tracking across different social skills
- **Analytics Dashboard**: Emotion trends and performance metrics

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required API keys:
- **OpenAI API Key**: For Whisper (speech-to-text) and GPT-4 (conversation)
- **ElevenLabs API Key**: For text-to-speech avatar voices
- **Hume AI API Key**: For real-time emotion detection
- **Firebase Config**: For backend data storage and analytics

### 3. Firebase Setup
1. Create a new Firebase project
2. Enable Firestore Database
3. Set up authentication (optional)
4. Add your Firebase config to `.env`

### 4. Run the App
```bash
npm run dev
```

## 📱 Usage

### Starting a Practice Session
1. Choose between "Social Confidence" or "Romantic Engagement" modes
2. Select a scenario (Coffee Shop, House Party, Bar Flirtation, etc.)
3. The AI avatar will initiate conversation
4. Use the microphone button to respond with voice
5. View real-time emotion analysis and chat history
6. Complete the session to receive detailed feedback

### Features During Session
- **Voice Recording**: Tap and hold microphone to record responses
- **Emotion Tracking**: Real-time facial and voice emotion analysis
- **Chat Interface**: View conversation history with emotion indicators
- **Live Scoring**: Performance tracking based on emotional appropriateness
- **Avatar Responses**: AI-generated responses with text-to-speech

### Post-Session Analysis
- Overall performance score and grade
- Emotional journey visualization
- Achievement unlocks and medal progress
- Personalized improvement suggestions
- Session replay and analytics

## 🏗 Architecture

### Services Layer
- `WhisperService`: Speech-to-text transcription
- `GPTService`: AI conversation generation and feedback
- `ElevenLabsService`: Text-to-speech with emotion-aware voices
- `HumeService`: Real-time emotion detection via streaming API
- `FirebaseService`: Backend data persistence and analytics

### State Management
- `conversationStore`: Zustand store for session state
- Real-time emotion updates
- Message history and scoring
- Session lifecycle management

### Components
- `ChatInterface`: Conversation UI with message history
- `EmotionAnalyzer`: Real-time emotion visualization
- `SessionReport`: Post-session analytics and feedback
- Enhanced `practice.tsx`: Main interaction interface

### Data Models
- `ConversationMessage`: Chat messages with emotion data
- `EmotionData`: Emotion detection results
- `SessionData`: Complete session information
- `ScenarioScript`: Dialogue flow definitions

## 🔧 Configuration

### Emotion Detection
The app uses Hume AI's streaming API for real-time emotion detection from:
- **Facial expressions**: Via camera feed analysis
- **Voice prosody**: Via microphone audio analysis
- **Combined analysis**: Weighted emotion scoring

### Conversation AI
GPT-4 generates contextually appropriate responses based on:
- Conversation history
- Current user emotion state
- Scenario-specific guidelines
- Performance optimization

### Scoring Algorithm
Performance scores are calculated using:
- Emotion appropriateness (40%)
- Conversation engagement (30%)
- Response timing and flow (20%)
- Scenario-specific objectives (10%)

## 🚀 Deployment

### Environment Variables
Ensure all API keys are properly configured in your deployment environment.

### EAS Build Configuration
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for production
eas build --platform all
```

### Firebase Security Rules
Update Firestore security rules for production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Testing
- Test API service integrations
- Verify emotion detection accuracy
- Validate conversation flow logic
- Check Firebase data persistence

### Performance Testing
- Monitor API response times
- Test real-time emotion processing
- Validate memory usage during sessions
- Check audio processing performance

## 📊 Analytics & Monitoring

### Built-in Analytics
- Session completion rates
- Average performance scores
- Emotion pattern analysis
- User engagement metrics

### Error Monitoring
- Sentry integration for crash reporting
- API error tracking and alerting
- Performance monitoring
- User feedback collection

## 🔒 Security & Privacy

### Data Protection
- All API keys stored securely in environment variables
- User data encrypted in Firebase
- Audio recordings processed locally when possible
- Emotion data anonymized for analytics

### Privacy Compliance
- Clear data usage policies
- User consent for emotion analysis
- Data retention policies
- Right to data deletion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Check the troubleshooting guide
- Review API documentation
- Submit issues on GitHub
- Contact the development team

---

**Note**: This implementation provides a production-ready foundation for social confidence training with AI-powered conversation practice and real-time emotion analysis. The modular architecture allows for easy extension and customization based on specific requirements.