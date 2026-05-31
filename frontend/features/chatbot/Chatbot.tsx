// frontend/features/chatbot/Chatbot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage, getRecommendations } from '@/lib/api';
import type { ChatResponse, RecommendationsResponse } from '@/lib/api/chatbot/types';
import {
  AiIcon,
  CloseIcon,
  MicIcon,
  SendIcon,
  MessageIcon,
  XMarkIcon,
  SearchIcon,
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  XCircleIcon,
  CompassIcon
} from '@/components/ui/Icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  isTyping?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Bonjour ! Je suis l\'assistant Reservia.\n\nJe peux vous aider à :\n• Rechercher des services\n• Faire des réservations\n• Annuler des réservations\n• Trouver des services près de chez vous\n• Trouver les meilleurs services\n• Recommandations personnalisées\n\nComment puis-je vous aider ?', 
      timestamp: new Date(),
      intent: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse>([]);
   const [sessionId, setSessionId] = useState<string>(() => {
    // Générer un sessionId unique au chargement du composant
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Récupérer la géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Géolocalisation non autorisée')
      );
    }
  }, []);

  // Charger les recommandations si utilisateur connecté
  useEffect(() => {
    if (userId && isOpen && messages.length < 3) {
      loadRecommendations();
    }
  }, [userId, isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadRecommendations = async () => {
    if (!userId) return;
    
    try {
      const recs = await getRecommendations(userId, 5);
      if (recs && recs.length > 0) {
        setRecommendations(recs);
        
        const recMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Recommandations pour vous :\n\n${recs.map((r, i) => 
            `${i+1}. ${r.name} - GRATUIT\n   ⭐ ${r.avgRating || 'Nouveau'}/5\n   📍 ${r.location?.address || 'Service disponible'}`
          ).join('\n\n')}\n\nSouhaitez-vous réserver l'un de ces services ?`,
          timestamp: new Date(),
          intent: 'recommendation'
        };
        
        setMessages(prev => [...prev, recMessage]);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setInput('Écoute en cours...');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setInput(finalTranscript);
      } else if (interimTranscript) {
        setInput(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
      setInput('');
      
      if (event.error === 'not-allowed') {
        alert('Veuillez autoriser l\'accès au microphone pour utiliser la reconnaissance vocale.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      if (finalTranscript && finalTranscript !== 'Écoute en cours...') {
        setTimeout(() => {
          handleSend(finalTranscript);
          finalTranscript = '';
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    
    return () => {
      recognition.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\n/g, '. ');
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    
    if (!messageToSend.trim() || loading) return;

    if (messageToSend === 'Écoute en cours...') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const typingIndicator: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingIndicator]);

    try {
      const response = await sendMessage({
        query: messageToSend,
        userId,
        sessionId,
        location: location || undefined,
        language: 'fr'
      });
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages(prev => prev.filter(m => !m.isTyping));

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        intent: response.intent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speakText(response.reply);

      if (response.intent === 'search' && userId) {
        setTimeout(() => loadRecommendations(), 2000);
      }

    } catch (error: any) {
      setMessages(prev => prev.filter(m => !m.isTyping));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: error.message?.includes('429') 
          ? 'Trop de requêtes. Veuillez patienter quelques secondes.'
          : 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
        intent: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Rechercher', action: 'Je cherche un restaurant', icon: SearchIcon },
    { label: 'Près de moi', action: 'Donne moi un restaurant près de moi', icon: MapPinIcon },
    { label: 'Meilleurs', action: 'Donne moi un hôtel 5 étoiles à Sousse', icon: StarIcon },
    { label: 'Réserver', action: 'Je veux réserver', icon: CalendarIcon },
    { label: 'Annuler', action: 'Annuler ma réservation', icon: XCircleIcon },
    { label: 'Recommandations', action: 'Recommande moi des services', icon: CompassIcon }
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isListening && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-toggle-btn"
        aria-label="Ouvrir l'assistant"
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <MessageIcon className="w-6 h-6" />}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* En-tête */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <AiIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="chatbot-title">Assistant IA Reservia</h3>
                <p className="chatbot-subtitle">
                  {location ? '📍 Services à proximité' : '✨ Services gratuits'}
                </p>
              </div>
              {recommendations.length > 0 && (
                <div className="chatbot-badge">
                  {recommendations.length}
                </div>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-close-btn"
                aria-label="Fermer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'}`}
              >
                <div className="chatbot-bubble">
                  {msg.isTyping ? (
                    <div className="chatbot-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <div className="chatbot-message-text">{msg.content}</div>
                      <div className="chatbot-message-time">
                        {formatTime(msg.timestamp)}
                        {msg.intent && msg.role === 'assistant' && msg.intent !== 'welcome' && (
                          <span className="chatbot-message-intent"> [{msg.intent}]</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Actions rapides */}
          {messages.length < 3 && (
            <div className="chatbot-quick-actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action.action)}
                  disabled={loading}
                  className="chatbot-quick-action-btn"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Indicateur d'écoute */}
          {isListening && (
            <div className="chatbot-listening">
              <span className="chatbot-listening-dot"></span>
              Écoute en cours... Parlez maintenant
              <span className="chatbot-listening-close" onClick={toggleListening}>
                <XMarkIcon className="w-3 h-3" />
              </span>
            </div>
          )}

          {/* Zone de saisie */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-group">
              <button
                onClick={toggleListening}
                disabled={loading}
                className={`chatbot-mic-btn ${isListening ? 'chatbot-mic-btn-active' : ''}`}
                title={isListening ? "Arrêter l'écoute" : "Reconnaissance vocale"}
              >
                <MicIcon className="w-4 h-4" />
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isListening}
                placeholder={isListening ? 'Écoute en cours...' : 'Tapez votre message...'}
                className="chatbot-input"
              />
              
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim() || isListening || input === 'Écoute en cours...'}
                className="chatbot-send-btn"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
            
            <p className="chatbot-note">
              Exemples: "restaurant près de moi", "hôtel 5 étoiles à Sousse", "réserver spa"
            </p>
          </div>
        </div>
      )}
    </>
  );
}