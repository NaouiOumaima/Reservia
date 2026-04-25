'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  sendMessage, 
  getRecommendations,
  ChatResponse,
  RecommendationsResponse 
} from '@/lib/api';

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
      content: 'Bonjour ! Je suis l\'assistant vocal de Reservia. Comment puis-je vous aider aujourd\'hui ?\n\nJe peux vous aider à :\n- Rechercher des services\n- Faire des reservations\n- Annuler des reservations\n- Vous recommander des services', 
      timestamp: new Date(),
      intent: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [recommendations, setRecommendations] = useState<RecommendationsResponse>([]);
  
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

  // Charger les recommandations si utilisateur connecté
  useEffect(() => {
    if (userId && isOpen) {
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
      if (recs.length > 0) {
        setRecommendations(recs);
        
        const recMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Recommandations pour vous :\n\n${recs.map(r => 
            `- ${r.name} - ${r.basePrice} DT (${r.personalized.matchReason})`
          ).join('\n')}\n\nSouhaitez-vous plus d'informations sur l'un de ces services ?`,
          timestamp: new Date(),
          intent: 'recommendation'
        };
        
        setMessages(prev => [...prev, recMessage]);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome, Edge ou Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setInput('Ecoute en cours...');
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
        alert('Veuillez autoriser l\'acces au microphone pour utiliser la reconnaissance vocale.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      if (finalTranscript) {
        setTimeout(() => {
          handleSend(finalTranscript);
        }, 100);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    
    if (!messageToSend.trim() || loading) return;

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
      let response: ChatResponse;
      
      const result = await sendMessage({
        query: messageToSend,
        userId,
        sessionId,
        language: 'fr'
      });
      response = result;
      
      if (result.sessionId) {
        setSessionId(result.sessionId);
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

      if (response.intent === 'help' && response.suggestedActions) {
        const suggestionsMessage: Message = {
          id: (Date.now() + 3).toString(),
          role: 'assistant',
          content: `Actions suggerees :\n${response.suggestedActions.map(a => `- ${a}`).join('\n')}`,
          timestamp: new Date(),
          intent: 'suggestions'
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }

      if (response.intent === 'search' && userId) {
        setTimeout(() => loadRecommendations(), 2000);
      }

    } catch (error: any) {
      setMessages(prev => prev.filter(m => !m.isTyping));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: error.message === 'Trop de requetes. Veuillez patienter.' 
          ? 'Trop de requetes ! Veuillez patienter quelques secondes avant de continuer.'
          : 'Desole, une erreur est survenue. Veuillez reessayer.',
        timestamp: new Date(),
        intent: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
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
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const quickActions = [
    { label: 'Rechercher', action: 'Je cherche un restaurant' },
    { label: 'Reserver', action: 'Je veux reserver' },
    { label: 'Annuler', action: 'Annuler ma reservation' },
    { label: 'Aide', action: 'Aide' }
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isListening) {
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
        {isOpen ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* En-tête */}
<div className="chatbot-header">
  <div className="chatbot-header-content">
    <div className="chatbot-avatar">
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="chatbot-title">Assistant IA Reservia</h3>
      <p className="chatbot-subtitle">Toujours la pour vous aider</p>
    </div>
    {recommendations.length > 0 && (
      <div className="chatbot-badge">
        {recommendations.length} recommandations
      </div>
    )}
    {/* BOUTON DE FERMETURE - AJOUTER ICI */}
    <button
      onClick={() => setIsOpen(false)}
      className="chatbot-close-btn"
      aria-label="Fermer l'assistant"
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'}
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
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Indicateur d'écoute */}
          {isListening && (
            <div className="chatbot-listening">
              Ecoute en cours... Parlez maintenant
            </div>
          )}

          {/* Zone de saisie */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-group">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={`chatbot-mic-btn ${isListening ? 'chatbot-mic-btn-active' : ''}`}
                title={isListening ? "Arreter l'ecoute" : "Reconnaissance vocale"}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isListening}
                placeholder={isListening ? 'Ecoute en cours...' : 'Tapez votre message...'}
                className="chatbot-input"
              />
              
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim() || isListening}
                className="chatbot-send-btn"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <p className="chatbot-note">
              Essayez : "Je cherche un restaurant" ou utilisez le microphone
            </p>
          </div>
        </div>
      )}
    </>
  );
}