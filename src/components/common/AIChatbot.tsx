import React, { useState, useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { ChatbotService, ChatMessage } from '../../services/chatbotService';
import toast from './Toast';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm your friendly Surprise Supermarket assistant. I'm here to help you find the freshest groceries, answer questions about our services, and make your shopping experience amazing! What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check if user is providing email
      if (awaitingEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(inputMessage.trim())) {
          // Send question to admin
          const sent = await ChatbotService.sendQuestionToAdmin(
            lastQuestion,
            inputMessage.trim()
          );

          if (sent) {
            const botMessage: ChatMessage = {
              role: 'assistant',
              content: `Thank you! We've sent your question to our team. They'll respond to ${inputMessage.trim()} within 24 hours. Is there anything else I can help you with?`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setAwaitingEmail(false);
            setLastQuestion('');
          } else {
            throw new Error('Failed to send question');
          }
        } else {
          const botMessage: ChatMessage = {
            role: 'assistant',
            content: "That doesn't look like a valid email address. Please provide a valid email so we can get back to you.",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        // Get answer from chatbot service
        const { answer, needsEmail, isGeneralQuestion } = await ChatbotService.answerQuestion(
          inputMessage.trim(),
          messages
        );

        const botMessage: ChatMessage = {
          role: 'assistant',
          content: answer,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);

        // If needs email, set state
        if (needsEmail) {
          setAwaitingEmail(true);
          setLastQuestion(inputMessage.trim());
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm having trouble right now. Please try again or contact our support team at support@surprisesupermarket.com",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <ChatButton
        onClick={() => setIsOpen(true)}
        $isOpen={isOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiMessageCircle />
        <Pulse />
      </ChatButton>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <ChatHeader>
              <HeaderContent>
                <BotAvatar>🛒</BotAvatar>
                <HeaderInfo>
                  <BotName>Surprise Assistant</BotName>
                  <BotStatus>
                    <StatusDot />
                    Online & Ready to Help!
                  </BotStatus>
                </HeaderInfo>
              </HeaderContent>
              <CloseButton onClick={() => setIsOpen(false)}>
                <FiX />
              </CloseButton>
            </ChatHeader>

            {/* Messages */}
            <MessagesContainer>
              {messages.map((message, index) => (
                <MessageWrapper key={index} $isUser={message.role === 'user'}>
                  {message.role === 'assistant' && <BotAvatarSmall>🤖</BotAvatarSmall>}
                  <MessageBubble $isUser={message.role === 'user'}>
                    <MessageText>{message.content}</MessageText>
                    <MessageTime>{formatTime(message.timestamp)}</MessageTime>
                  </MessageBubble>
                </MessageWrapper>
              ))}
              {isLoading && (
                <MessageWrapper $isUser={false}>
                  <BotAvatarSmall>🤖</BotAvatarSmall>
                  <TypingIndicator>
                    <TypingDot $delay={0} />
                    <TypingDot $delay={0.2} />
                    <TypingDot $delay={0.4} />
                  </TypingIndicator>
                </MessageWrapper>
              )}
              <div ref={messagesEndRef} />
            </MessagesContainer>

            {/* Input */}
            <ChatInput>
              <InputField
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  awaitingEmail 
                    ? "Enter your email address..." 
                    : "Ask me anything..."
                }
                disabled={isLoading}
              />
              <SendButton
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                $active={!!inputMessage.trim()}
              >
                {isLoading ? <FiLoader /> : <FiSend />}
              </SendButton>
            </ChatInput>

            {/* Footer */}
            <ChatFooter>
              Powered by AI • Surprise Supermarket
            </ChatFooter>
          </ChatWindow>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;

// Animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
`;

const typing = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

// Styled Components
const ChatButton = styled(motion.button)<{ $isOpen: boolean }>`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  border: none;
  color: white;
  font-size: 1.75rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(108, 154, 127, 0.4);
  z-index: 999;
  display: ${({ $isOpen }) => ($isOpen ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 28px rgba(108, 154, 127, 0.5);
  }

  @media (max-width: 768px) {
    right: 1rem;
    bottom: 1rem;
    width: 56px;
    height: 56px;
  }
`;

const Pulse = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #6C9A7F;
  animation: ${css`${pulse} 2s infinite`};
  z-index: -1;
`;

const ChatWindow = styled(motion.div)`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;

  @media (max-width: 768px) {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  color: white;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BotAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BotName = styled.div`
  font-weight: 600;
  font-size: 1.0625rem;
`;

const BotStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  opacity: 0.9;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4CAF50;
  animation: ${css`${pulse} 2s infinite`};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #F8F9FA;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #DFE6E9;
    border-radius: 3px;
  }
`;

const MessageWrapper = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
`;

const BotAvatarSmall = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  flex-shrink: 0;
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: ${({ $isUser }) =>
    $isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${({ $isUser }) =>
    $isUser
      ? 'linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%)'
      : 'white'};
  color: ${({ $isUser }) => ($isUser ? 'white' : '#2D3436')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const MessageText = styled.div`
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.6875rem;
  opacity: 0.7;
  margin-top: 0.25rem;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const TypingDot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6C9A7F;
  animation: ${css`${typing} 1.4s infinite`};
  animation-delay: ${({ $delay }) => $delay}s;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-top: 1px solid #F8F9FA;
`;

const InputField = styled.input`
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #DFE6E9;
  border-radius: 25px;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #6C9A7F;
  }

  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button<{ $active: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%)'
      : '#DFE6E9'};
  color: white;
  font-size: 1.125rem;
  cursor: ${({ $active }) => ($active ? 'pointer' : 'not-allowed')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  svg {
    animation: ${({ disabled }) => (disabled ? 'none' : 'none')};
  }
`;

const ChatFooter = styled.div`
  padding: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #636E72;
  background: #F8F9FA;
  border-top: 1px solid #DFE6E9;
`;
