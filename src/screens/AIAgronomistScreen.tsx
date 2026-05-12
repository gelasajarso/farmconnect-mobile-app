import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from '../components/LoadingIndicator';

// Types
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  streaming?: boolean;
}

interface AIInsight {
  id: string;
  type: 'yield' | 'weather' | 'soil' | 'market' | 'pest';
  severity: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  date: string;
}

// Mock data
const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'yield',
    severity: 'success',
    title: 'Optimal Harvest Time',
    description: 'Your wheat crop is ready for harvest. Current moisture levels are ideal.',
    date: '2024-01-15',
  },
  {
    id: '2',
    type: 'weather',
    severity: 'warning',
    title: 'Rain Expected',
    description: 'Heavy rainfall expected in 3 days. Consider harvesting sooner.',
    date: '2024-01-14',
  },
  {
    id: '3',
    type: 'soil',
    severity: 'info',
    title: 'Soil Analysis',
    description: 'Nitrogen levels are moderate. Consider adding compost for next season.',
    date: '2024-01-13',
  },
];

const suggestedQuestions = [
  { label: 'Yield', question: 'How can I improve my crop yield this season?' },
  { label: 'Soil', question: 'How do I improve soil nitrogen levels in my fields?' },
  { label: 'Harvest', question: 'When is the best time to harvest my wheat crop?' },
  { label: 'Pests', question: 'How can I prevent aphid outbreaks on my tomatoes?' },
  { label: 'Weather', question: 'What weather conditions should I prepare for this week?' },
  { label: 'Market', question: 'What are the current market prices for my crops?' },
];

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

export default function AIAgronomistScreen() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Farmer';
  
  const [tab, setTab] = useState<'chat' | 'insights'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      text: `Hello ${firstName}! I'm your AI Agronomist. I can help you with crop management, soil health, pest control, weather planning, and market insights.\n\nWhat would you like to know today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');
    setLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = `Based on current agricultural data and best practices, here's my advice for your question:\n\n${trimmed}\n\nThis is a simulated response. In production, this would connect to an actual AI service specialized in agronomy.`;
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: aiResponse,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        scrollToBottom();
      }, 1500);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Sorry, I couldn\'t process that right now. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  }, [loading, scrollToBottom]);

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'ai',
        text: `Chat cleared. What would you like to know, ${firstName}?`,
        timestamp: new Date(),
      },
    ]);
  };

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'success':
        return { bg: '#E8F5E8', border: '#4CAF50', text: '#2E7D32' };
      case 'warning':
        return { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' };
      case 'info':
        return { bg: '#E3F2FD', border: '#2196F3', text: '#1976D2' };
      default:
        return { bg: '#F5F5F5', border: '#9E9E9E', text: '#616161' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'yield':
        return 'trending-up';
      case 'weather':
        return 'rainy';
      case 'soil':
        return 'leaf';
      case 'market':
        return 'bar-chart';
      case 'pest':
        return 'bug';
      default:
        return 'information-circle';
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.role === 'user' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          message.role === 'user' ? styles.userText : styles.aiText,
        ]}>
          {message.text}
        </Text>
        {message.streaming && (
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { backgroundColor: G.sub }]} />
            <View style={[styles.typingDot, { backgroundColor: G.sub }]} />
            <View style={[styles.typingDot, { backgroundColor: G.sub }]} />
          </View>
        )}
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderInsight = (insight: AIInsight) => {
    const colors = getSeverityColors(insight.severity);
    return (
      <View key={insight.id} style={[styles.insightCard, { borderColor: colors.border, backgroundColor: colors.bg }]}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: colors.border }]}>
            <Ionicons name={getTypeIcon(insight.type) as any} size={16} color={G.white} />
          </View>
          <View style={styles.insightMeta}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
            <Text style={styles.insightDate}>{insight.date}</Text>
          </View>
        </View>
        <Text style={styles.insightDescription}>{insight.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Ionicons name="chatbox" size={24} color={G.white} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Agronomist</Text>
            <Text style={styles.subtitle}>Smart crop advice powered by AI</Text>
          </View>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color={G.white} />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['chat', 'insights'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === 'chat' ? 'chatbubble-ellipses' : 'sparkles'}
              size={16}
              color={tab === t ? G.white : G.sub}
            />
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'chat' ? 'Ask AI' : 'Farm Insights'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === 'chat' ? (
        <View style={styles.chatContainer}>
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map(renderMessage)}
            {loading && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggested Questions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContainer}
          >
            {suggestedQuestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.label}
                style={styles.suggestionChip}
                onPress={() => sendMessage(suggestion.question)}
                disabled={loading}
              >
                <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about crops, soil, weather, pests..."
              placeholderTextColor={G.sub}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={18} color={G.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.insightsContainer}>
          {/* Summary Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mockInsights.filter(i => i.severity === 'success').length}</Text>
              <Text style={styles.statLabel}>Positive Signals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mockInsights.filter(i => i.severity === 'warning').length}</Text>
              <Text style={styles.statLabel}>Action Required</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mockInsights.filter(i => i.severity === 'info').length}</Text>
              <Text style={styles.statLabel}>Info Updates</Text>
            </View>
          </View>

          {/* Insights List */}
          <ScrollView style={styles.insightsList}>
            {mockInsights.map(renderInsight)}
          </ScrollView>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setTab('chat')}
          >
            <Text style={styles.ctaText}>Have questions? Ask the AI Agronomist</Text>
            <Ionicons name="arrow-forward" size={16} color={G.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.surface,
  },
  header: {
    backgroundColor: G.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: G.white,
  },
  subtitle: {
    fontSize: 13,
    color: '#A8D5B5',
    marginTop: 2,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    color: G.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: G.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: G.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: G.sub,
  },
  activeTabText: {
    color: G.white,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 16,
  },
  messageContainer: {
    gap: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: G.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: G.white,
    borderWidth: 1,
    borderColor: G.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: G.white,
  },
  aiText: {
    color: G.text,
  },
  timestamp: {
    fontSize: 11,
    color: G.sub,
    marginTop: 4,
    marginHorizontal: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: G.sub,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: G.white,
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionLabel: {
    fontSize: 13,
    color: G.primary,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    gap: 12,
    backgroundColor: G.white,
    borderTopWidth: 1,
    borderTopColor: G.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: G.text,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: G.border,
  },
  insightsContainer: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: G.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  statLabel: {
    fontSize: 11,
    color: G.sub,
    marginTop: 4,
    textAlign: 'center',
  },
  insightsList: {
    flex: 1,
    gap: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightMeta: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  insightDate: {
    fontSize: 12,
    color: G.sub,
    marginTop: 2,
  },
  insightDescription: {
    fontSize: 14,
    color: G.text,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: G.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  ctaText: {
    color: G.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
