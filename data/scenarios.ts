import { ScenarioScript } from '../types/conversation';

export const scenarios: Record<string, ScenarioScript> = {
  'coffee-shop': {
    id: 'coffee-shop',
    title: 'Coffee Shop Approach',
    description: 'Approach someone reading and start a natural conversation',
    openingNode: 'initial',
    nodes: {
      initial: {
        id: 'initial',
        content: "Hi there! I couldn't help but notice you're reading. Mind if I ask what book that is?",
        responses: [
          {
            id: 'book-response',
            content: "Oh, it's 'The Midnight Library' by Matt Haig. Have you read it?",
            nextNodeId: 'book-discussion',
          },
          {
            id: 'private-response',
            content: "I'm actually trying to focus on reading right now.",
            nextNodeId: 'respectful-exit',
          },
        ],
      },
      'book-discussion': {
        id: 'book-discussion',
        content: "I've heard great things about it! What do you think so far?",
        conditions: {
          emotion: 'interest',
          minIntensity: 0.3,
        },
        responses: [
          {
            id: 'positive-book',
            content: "It's really thought-provoking! Makes you think about life choices.",
            nextNodeId: 'deeper-conversation',
            scoreModifier: 10,
          },
          {
            id: 'neutral-book',
            content: "It's okay, not really my usual genre.",
            nextNodeId: 'genre-discussion',
            scoreModifier: 5,
          },
        ],
      },
      'deeper-conversation': {
        id: 'deeper-conversation',
        content: "That sounds fascinating. I love books that make you reflect. Are you a regular here?",
        responses: [
          {
            id: 'regular-yes',
            content: "Yeah, I come here most mornings. The atmosphere is perfect for reading.",
            nextNodeId: 'connection-building',
            scoreModifier: 15,
          },
          {
            id: 'regular-no',
            content: "Not really, just discovered this place. It's nice though.",
            nextNodeId: 'place-discussion',
            scoreModifier: 10,
          },
        ],
      },
      'respectful-exit': {
        id: 'respectful-exit',
        content: "Of course, I totally understand. Enjoy your reading!",
        responses: [
          {
            id: 'polite-thanks',
            content: "Thanks for understanding. Have a great day!",
            scoreModifier: 5,
          },
        ],
      },
      'connection-building': {
        id: 'connection-building',
        content: "That's great! I'm always looking for good reading spots. Maybe I'll see you here again sometime.",
        responses: [
          {
            id: 'positive-connection',
            content: "That would be nice! I'm usually here around 9 AM on weekdays.",
            scoreModifier: 20,
          },
        ],
      },
    },
    successConditions: {
      minScore: 50,
      requiredEmotions: ['interest', 'friendliness'],
      maxDuration: 300000, // 5 minutes
    },
  },

  'job-interview': {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Navigate a challenging job interview with confidence',
    openingNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        content: "Good morning! Please, have a seat. Thank you for coming in today.",
        responses: [
          {
            id: 'confident-greeting',
            content: "Good morning! Thank you for having me. I'm excited to be here.",
            nextNodeId: 'opening-question',
            scoreModifier: 10,
          },
          {
            id: 'nervous-greeting',
            content: "Hi... thanks for, um, meeting with me.",
            nextNodeId: 'opening-question',
            scoreModifier: -5,
          },
        ],
      },
      'opening-question': {
        id: 'opening-question',
        content: "So, tell me about yourself and why you're interested in this position.",
        conditions: {
          emotion: 'confidence',
          minIntensity: 0.4,
        },
        responses: [
          {
            id: 'strong-answer',
            content: "I have 5 years of experience in this field and I'm passionate about the company's mission.",
            nextNodeId: 'follow-up',
            scoreModifier: 20,
          },
          {
            id: 'weak-answer',
            content: "Well, I need a job and this seemed like a good opportunity.",
            nextNodeId: 'clarification',
            scoreModifier: -10,
          },
        ],
      },
      'follow-up': {
        id: 'follow-up',
        content: "That's impressive. Can you give me a specific example of a challenge you overcame?",
        responses: [
          {
            id: 'detailed-example',
            content: "Certainly. Last year, I led a project that was behind schedule and managed to deliver it on time by reorganizing the team structure.",
            scoreModifier: 25,
          },
          {
            id: 'vague-example',
            content: "I've faced many challenges and always found ways to solve them.",
            nextNodeId: 'pressure-question',
            scoreModifier: 5,
          },
        ],
      },
    },
    successConditions: {
      minScore: 60,
      requiredEmotions: ['confidence', 'professionalism'],
      maxDuration: 600000, // 10 minutes
    },
  },

  'first-date': {
    id: 'first-date',
    title: 'First Date Conversation',
    description: 'Navigate the excitement and nerves of a first date',
    openingNode: 'arrival',
    nodes: {
      arrival: {
        id: 'arrival',
        content: "Hi! You look great. I'm so glad we could meet up tonight.",
        responses: [
          {
            id: 'confident-response',
            content: "Thank you! You look wonderful too. I've been looking forward to this all week.",
            nextNodeId: 'restaurant-choice',
            scoreModifier: 15,
          },
          {
            id: 'shy-response',
            content: "Thanks... you too. This place looks nice.",
            nextNodeId: 'restaurant-choice',
            scoreModifier: 5,
          },
        ],
      },
      'restaurant-choice': {
        id: 'restaurant-choice',
        content: "I hope this restaurant is okay. I read great reviews about their pasta.",
        conditions: {
          emotion: 'nervousness',
          minIntensity: 0.2,
        },
        responses: [
          {
            id: 'enthusiastic-food',
            content: "Perfect choice! I love Italian food. Have you been here before?",
            nextNodeId: 'personal-sharing',
            scoreModifier: 10,
          },
          {
            id: 'polite-food',
            content: "It looks lovely. I'm not too picky about food.",
            nextNodeId: 'conversation-starter',
            scoreModifier: 5,
          },
        ],
      },
      'personal-sharing': {
        id: 'personal-sharing',
        content: "Actually, this is my first time here too. I wanted to try somewhere new with you.",
        responses: [
          {
            id: 'sweet-response',
            content: "That's really sweet! I love that we're discovering it together.",
            nextNodeId: 'deeper-connection',
            scoreModifier: 20,
          },
          {
            id: 'casual-response',
            content: "Cool, well I'm sure it'll be good.",
            nextNodeId: 'menu-discussion',
            scoreModifier: 8,
          },
        ],
      },
    },
    successConditions: {
      minScore: 55,
      requiredEmotions: ['attraction', 'comfort', 'interest'],
      maxDuration: 900000, // 15 minutes
    },
  },

  'conflict-resolution': {
    id: 'conflict-resolution',
    title: 'Conflict Resolution',
    description: 'Handle a disagreement with a friend diplomatically',
    openingNode: 'confrontation',
    nodes: {
      confrontation: {
        id: 'confrontation',
        content: "I need to talk to you about what happened at the party last weekend. I felt really hurt by what you said.",
        responses: [
          {
            id: 'defensive-response',
            content: "I don't know what you're talking about. You're being too sensitive.",
            nextNodeId: 'escalation',
            scoreModifier: -15,
          },
          {
            id: 'empathetic-response',
            content: "I'm sorry you felt hurt. Can you help me understand what I said that upset you?",
            nextNodeId: 'explanation',
            scoreModifier: 15,
          },
        ],
      },
      explanation: {
        id: 'explanation',
        content: "When you made that joke about my career choice in front of everyone, it felt like you were dismissing something really important to me.",
        conditions: {
          emotion: 'empathy',
          minIntensity: 0.4,
        },
        responses: [
          {
            id: 'genuine-apology',
            content: "I'm really sorry. I didn't realize how that came across. Your career is important and I shouldn't have joked about it.",
            nextNodeId: 'resolution',
            scoreModifier: 25,
          },
          {
            id: 'partial-apology',
            content: "I'm sorry if it came across wrong. I was just trying to be funny.",
            nextNodeId: 'clarification-needed',
            scoreModifier: 10,
          },
        ],
      },
      resolution: {
        id: 'resolution',
        content: "Thank you for understanding. I really value our friendship and I'm glad we could talk about this.",
        responses: [
          {
            id: 'friendship-affirmation',
            content: "I value our friendship too. I'll be more mindful of my words in the future.",
            scoreModifier: 20,
          },
        ],
      },
    },
    successConditions: {
      minScore: 50,
      requiredEmotions: ['empathy', 'understanding', 'resolution'],
      maxDuration: 480000, // 8 minutes
    },
  },
};