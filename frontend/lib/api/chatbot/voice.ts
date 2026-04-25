// frontend/lib/api/chatbot/voice.ts

import { apiClient } from '../config';
import { 
  SpeechToTextResponse, 
  TextToSpeechRequest, 
  TextToSpeechResponse,
  SpeechToTextRequest 
} from './types';

/**
 * Convertit la parole en texte
 * @param audioFile - Fichier audio (Blob ou File)
 * @param language - Langue de l'audio
 * @returns Texte transcrit
 */
export async function speechToText(
  audioFile: File | Blob,
  language: 'fr-FR' | 'en-US' | 'ar-SA' = 'fr-FR'
): Promise<SpeechToTextResponse> {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    const response = await apiClient.post<SpeechToTextResponse>(
      '/ai/speech-to-text',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Speech to text error:', error);
    throw new Error(error.response?.data?.message || 'Erreur de reconnaissance vocale');
  }
}

/**
 * Convertit le texte en parole (audio)
 * @param request - Requête contenant le texte et les options
 * @returns URL du fichier audio
 */
export async function textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
  try {
    const response = await apiClient.post<TextToSpeechResponse>(
      '/ai/text-to-speech',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Text to speech error:', error);
    throw new Error(error.response?.data?.message || 'Erreur de synthèse vocale');
  }
}

/**
 * Joue un audio à partir d'une URL
 * @param audioUrl - URL du fichier audio
 */
export function playAudio(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
}

/**
 * Enregistre l'audio depuis le microphone
 * @returns Promise avec le Blob audio
 */
export async function recordAudio(): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
        
        // Arrêter toutes les pistes du stream
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorder.start();
      
      // Arrêter automatiquement après 10 secondes
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Alternative utilisant l'API Web Speech (si disponible)
 * @returns Promise avec le texte reconnu
 */
export async function webSpeechRecognition(language: string = 'fr-FR'): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      resolve(text);
    };
    
    recognition.onerror = (event: any) => {
      reject(new Error(`Recognition error: ${event.error}`));
    };
    
    recognition.start();
  });
}