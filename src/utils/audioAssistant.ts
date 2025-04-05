
/**
 * A utility for text-to-speech functionality using Web Speech API
 */

// Store the speech synthesis instance
let speechSynthesis: SpeechSynthesis | null = null;
let speechUtterance: SpeechSynthesisUtterance | null = null;

// Initialize speech synthesis
const initSpeechSynthesis = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  return false;
};

/**
 * Speaks the provided text using the Web Speech API
 * @param text The text to be spoken
 * @param lang The language code (e.g., 'en-US' or 'hi-IN')
 * @param onEnd Optional callback for when speech ends
 */
export const speak = (text: string, lang: string = 'en-US', onEnd?: () => void): void => {
  // Cancel any ongoing speech
  stopSpeaking();
  
  if (!speechSynthesis) {
    const initialized = initSpeechSynthesis();
    if (!initialized) {
      console.error('Speech synthesis is not supported in this browser');
      return;
    }
  }

  // Create a new utterance
  speechUtterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  speechUtterance.lang = lang === 'hindi' ? 'hi-IN' : 'en-US';
  
  // Set other properties
  speechUtterance.volume = 1;
  speechUtterance.rate = 1;
  speechUtterance.pitch = 1;
  
  // Set the end callback if provided
  if (onEnd) {
    speechUtterance.onend = onEnd;
  }
  
  // Speak
  speechSynthesis!.speak(speechUtterance);
};

/**
 * Stops any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (speechSynthesis) {
    speechSynthesis.cancel();
    speechUtterance = null;
  }
};

/**
 * Checks if audio assistance is available in the browser
 */
export const isAudioAssistanceAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * Returns all available voices
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!speechSynthesis) {
    initSpeechSynthesis();
  }
  
  return speechSynthesis ? speechSynthesis.getVoices() : [];
};

