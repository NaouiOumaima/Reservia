'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// ── Language detection (client-side, lightweight) ──────────────────────────

function detectLanguage(text: string): 'ar' | 'fr' | 'en' {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars  = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;

  if (arabicChars > 0 && arabicChars >= latinChars) return 'ar';

  // Darija latin markers (common words)
  const darijaMarkers = /\b(ahla|salam|kifech|kifash|nheb|nhejez|fama|fayn|mzyan|marhba|beslema|yalla|bch|nchof|3andi|wesh|chno|chnowa|waqt|baraka|ahsan|hechi|mazel|rabi|3aslema)\b/i;
  if (darijaMarkers.test(text)) return 'ar';

  // French markers
  const frenchMarkers = /\b(je|tu|il|elle|nous|vous|ils|est|sont|avoir|être|avec|pour|dans|sur|une|les|des|bonjour|merci|oui|non|veux|cherche|trouver|réserver)\b/i;
  const englishMarkers = /\b(i|you|he|she|we|they|is|are|have|has|with|for|in|on|a|the|hello|thanks|yes|no|want|find|book|search|near|please|help)\b/i;

  const frScore = (text.match(frenchMarkers) || []).length;
  const enScore = (text.match(englishMarkers) || []).length;

  return frScore >= enScore ? 'fr' : 'en';
}

// ── API call ───────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function sendChatMessage(
  query: string,
  sessionId: string,
  userId?: string,
  location?: { lat: number; lng: number }
): Promise<{ response: string; sessionId: string }> {
  const detectedLang = detectLanguage(query);

  const res = await fetch(`${API_BASE_URL}/ai/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, sessionId, userId, location, language: detectedLang }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    response: data.reply || data.response || 'Pas de réponse.',
    sessionId: data.sessionId || sessionId,
  };
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Chatbot() {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [transcript, setTranscript]   = useState('');
  const [sessionId]                   = useState(generateSessionId);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech recognition init
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = 'fr-FR';

    rec.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setInput(result);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => {
      rec.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

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

  const speak = (text: string, lang?: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Auto-detect lang for TTS
    const detectedLang = lang || detectLanguage(text);
    const langMap: Record<string, string> = { ar: 'ar-SA', fr: 'fr-FR', en: 'en-US' };

    const utterance       = new SpeechSynthesisUtterance(text);
    utterance.lang        = langMap[detectedLang] || 'fr-FR';
    utterance.rate        = 1;
    utterance.pitch       = 1;
    utterance.onstart     = () => setIsSpeaking(true);
    utterance.onend       = () => setIsSpeaking(false);
    utterance.onerror     = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const sentInput = input;
    setInput('');
    setLoading(true);

    try {
      const { response } = await sendChatMessage(sentInput, sessionId);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      if (speechEnabled) speak(response);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Erreur de connexion au serveur.\n\nVérifiez que le backend tourne sur ${API_BASE_URL}.\n\nDétails: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send when voice recognition ends and we have a transcript
  useEffect(() => {
    if (!isListening && transcript && input) {
      handleSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col border border-gray-300 z-40">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">Assistant Vocal IA</h3>
              <p className="text-xs text-blue-100">Parlez ou tapez · FR / EN / عربي</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-2 rounded-full ${speechEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}
                title={speechEnabled ? 'Désactiver la synthèse vocale' : 'Activer la synthèse vocale'}
              >
                {speechEnabled ? '🔊' : '🔇'}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-4xl mb-4">🎤</p>
                <p className="font-medium">Assistant Vocal IA</p>
                <p className="text-sm mt-2">Cliquez sur le micro et parlez !</p>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                  <p>🇫🇷 "Trouve un restaurant à Sfax"</p>
                  <p>🇬🇧 "Find a spa near me"</p>
                  <p>🇹🇳 "نشوف restaurant قريب"</p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                  dir={msg.role === 'assistant' && detectLanguage(msg.content) === 'ar' ? 'rtl' : 'ltr'}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
                        onClick={stopSpeaking}
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
                <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                  <div className="flex gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening indicator */}
          {isListening && (
            <div className="bg-red-500 text-white px-4 py-2 flex items-center gap-2 animate-pulse">
              <span className="w-3 h-3 bg-white rounded-full inline-block"></span>
              <span className="text-sm">Écoute en cours...</span>
              {transcript && <span className="text-xs ml-auto opacity-80">"{transcript}"</span>}
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSend} className="border-t p-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={isListening ? "Arrêter l'écoute" : 'Commencer la reconnaissance vocale'}
              >
                🎤
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading || isListening}
                placeholder={isListening ? 'Écoute en cours...' : 'FR / EN / عربي تونسي...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                dir="auto"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm flex-shrink-0"
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl z-40 transition-all ${
          isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        title={isSpeaking ? 'En train de parler...' : "Ouvrir l'assistant IA"}
      >
        {isSpeaking ? '🔊' : '💬'}
      </button>
    </>
  );
}