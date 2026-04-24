'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api/client';
import { SpeechRecognition } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers les nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialiser la reconnaissance vocale (Speech-to-Text)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setInput(result);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleSend(new Event('submit') as any);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Démarrer/arrêter la reconnaissance vocale
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Synthèse vocale (Text-to-Speech)
  const speak = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Arrêter la synthèse vocale
  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.chatbot(input);
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.data.response,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Synthèse vocale de la réponse
      if (speechEnabled) {
        speak(response.data.response);
      }
    } catch (error) {
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col border border-gray-300 z-40">
          {/* En-tête */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">Assistant Vocal IA</h3>
              <p className="text-xs text-blue-100">Parlez ou tapez votre message</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-2 rounded-full ${speechEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}
                title={speechEnabled ? 'Désactiver la synthèse vocale' : 'Activer la synthèse vocale'}
              >
                {speechEnabled ? '🔊' : '🔇'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-4xl mb-4">🎤</p>
                <p className="font-medium">Assistant Vocal IA</p>
                <p className="text-sm mt-2">Cliquez sur le micro et parlez !</p>
                <div className="mt-4 flex justify-center gap-2 flex-wrap">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Exemple:</span>
                  <span className="text-xs text-gray-600">"Trouve un restaurant italien près de moi"</span>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.role === 'assistant' && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => speak(msg.content)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        title="Écouter"
                      >
                        🔊
                      </button>
                      <button
                        onClick={() => {
                          window.speechSynthesis?.cancel();
                          setIsSpeaking(false);
                        }}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        title="Arrêter"
                      >
                        ⏹
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="text-xs">•</span>
                    <span className="text-xs">•</span>
                    <span className="text-xs">•</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Indicateur de reconnaissance vocale */}
          {isListening && (
            <div className="bg-red-500 text-white px-4 py-2 flex items-center gap-2 animate-pulse">
              <span className="w-3 h-3 bg-white rounded-full"></span>
              <span className="text-sm">Écoute en cours...</span>
              <span className="text-xs ml-auto">"{transcript}"</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSend} className="border-t p-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={isListening ? 'Arrêter l\'écoute' : 'Commencer l\'écoute vocale'}
              >
                🎤
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || isListening}
                placeholder={isListening ? 'Écoute en cours...' : 'Tapez votre message...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl z-40 transition-all ${
          isSpeaking 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        title={isSpeaking ? 'En train de parler...' : 'Ouvrir l\'assistant IA'}
      >
        {isSpeaking ? '🔊' : '💬'}
      </button>
    </>
  );
}
