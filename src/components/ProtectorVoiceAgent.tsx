import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Radio, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { ScanResult, VoiceAgentStatus, VoiceMessage } from '../types';
import { askVoiceAgent, VoiceChatResponse } from '../services/api';
import { playWakeChime, playListeningPing, playSleepChime, playAlertChime } from '../utils/audioEffects';

interface ProtectorVoiceAgentProps {
  activeScanResult: ScanResult | null;
  onOpenQuickDemo?: () => void;
  onNavigateTab?: (tab: 'scanner' | 'history' | 'community' | 'analytics') => void;
  isGloballyOpen?: boolean;
  onCloseGlobal?: () => void;
}

// Regex to catch wake words like "Protector", "Hey Protector", "Ok Protector", etc.
const WAKE_WORD_REGEX = /\b(protector|hey\s+protector|ok\s+protector|hello\s+protector|hi\s+protector|wake\s+up\s+protector|projector|protect\s+her|protect\s+us)\b/i;

export const ProtectorVoiceAgent: React.FC<ProtectorVoiceAgentProps> = ({
  activeScanResult,
  onOpenQuickDemo,
  onNavigateTab,
  isGloballyOpen = false,
  onCloseGlobal,
}) => {
  const [status, setStatus] = useState<VoiceAgentStatus>('listening-for-wake');
  const [isExpanded, setIsExpanded] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome-1',
      sender: 'protector',
      text: "Protector Voice Agent active. Say \"Protector\" out loud anytime to wake me up, or tap the microphone to ask about any scam or job offer.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      threatHighlight: 'Wake Word: "Protector"'
    }
  ]);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const shouldListenRef = useRef(true);
  const statusRef = useRef<VoiceAgentStatus>('listening-for-wake');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<any>(null);

  // Sync ref with state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (isGloballyOpen) {
      setIsExpanded(true);
    }
  }, [isGloballyOpen]);

  // Scroll messages to bottom on new message
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, liveTranscript]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicPermissionError('Speech recognition is not supported in this browser. You can type or use the demo buttons.');
      setStatus('idle');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setMicPermissionError(null);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionError('Microphone access blocked. Click the lock/camera icon in your address bar to allow microphone.');
          setStatus('idle');
          isListeningRef.current = false;
        } else if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        // Auto-restart if we should be listening and not speaking or processing
        if (shouldListenRef.current && statusRef.current !== 'speaking' && statusRef.current !== 'processing') {
          setTimeout(() => {
            if (shouldListenRef.current && !isListeningRef.current) {
              try {
                recognition.start();
              } catch {
                // Ignore start collision
              }
            }
          }, 300);
        }
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentSaid = (final || interim).trim();
        setLiveTranscript(currentSaid);

        // Check for Wake Word if in 'listening-for-wake' mode
        if (statusRef.current === 'listening-for-wake') {
          const match = currentSaid.match(WAKE_WORD_REGEX);
          if (match) {
            // WAKE WORD DETECTED!
            handleWakeWordTriggered(currentSaid, match[0]);
          }
        } else if (statusRef.current === 'woken-up') {
          // Already awake! User is speaking their query/question
          if (final.trim().length > 0) {
            clearTimeout(queryTimeoutRef.current);
            queryTimeoutRef.current = setTimeout(() => {
              handleUserSpokenCommand(final.trim());
            }, 800);
          }
        }
      };

      recognitionRef.current = recognition;

      if (wakeWordEnabled) {
        try {
          recognition.start();
          setStatus('listening-for-wake');
        } catch (e) {
          console.warn('Recognition start caught:', e);
        }
      }
    } catch (err: any) {
      console.error('Failed to init speech recognition:', err);
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [wakeWordEnabled]);

  // When user says "Protector" or wake word triggers
  const handleWakeWordTriggered = (fullSentence: string, matchedWord: string) => {
    playWakeChime();
    setIsExpanded(true);
    setStatus('woken-up');

    // Check if there is query content after the wake word in the same utterance
    // e.g. "Protector, is this job offer fake?"
    const afterWakeWord = fullSentence.slice(fullSentence.toLowerCase().indexOf(matchedWord.toLowerCase()) + matchedWord.length).replace(/^[,.\s]+/, '').trim();

    if (afterWakeWord.length > 3) {
      // Direct command attached to wake word
      handleUserSpokenCommand(afterWakeWord);
    } else {
      // Just woke up by calling "Protector"
      const wakeGreeting = activeScanResult
        ? `Protector online. I'm actively analyzing this ${activeScanResult.extracted_entities?.company_name || 'document'} scan with a ${activeScanResult.threat_score}% threat score. What would you like to inspect?`
        : "Protector activated. I'm listening. Ask me about any suspicious job offer, email, or payment demand.";

      speakText(wakeGreeting, 'Protector Online');

      // Keep waiting for user's question
      setLiveTranscript('Listening for your command or question...');
      clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = setTimeout(() => {
        if (statusRef.current === 'woken-up') {
          // After 8 seconds of silence, return to wake-word standby
          setStatus('listening-for-wake');
          setLiveTranscript('');
        }
      }, 10000);
    }
  };

  // Handle user's spoken command/question
  const handleUserSpokenCommand = async (commandText: string) => {
    if (!commandText || commandText.trim().length === 0) return;

    // Filter out standalone "protector" words
    const cleanCommand = commandText.replace(WAKE_WORD_REGEX, '').replace(/^[,.\s]+/, '').trim();
    const finalQuery = cleanCommand.length > 0 ? cleanCommand : commandText;

    // Add user message to transcript
    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: finalQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLiveTranscript('');
    setStatus('processing');

    // Pause recognition while thinking and speaking
    try {
      recognitionRef.current?.stop();
    } catch {}

    try {
      const response: VoiceChatResponse = await askVoiceAgent(
        finalQuery, 
        activeScanResult, 
        messages.slice(-4).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
      );

      if (response.alertLevel === 'DANGER') {
        playAlertChime();
      }

      const agentMsg: VoiceMessage = {
        id: `protector-${Date.now()}`,
        sender: 'protector',
        text: response.spokenText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        threatHighlight: response.keyTakeaway
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Execute action if requested
      if (response.action === 'LOAD_DEMO_SCAM' && onOpenQuickDemo) {
        onOpenQuickDemo();
      } else if (response.action === 'FOCUS_CHECKLIST' && onNavigateTab) {
        onNavigateTab('scanner');
      }

      // Speak response aloud
      speakText(response.spokenText, response.keyTakeaway, () => {
        // Return to standby listening for wake word
        setStatus('listening-for-wake');
        if (wakeWordEnabled) {
          try {
            recognitionRef.current?.start();
          } catch {}
        }
      });
    } catch (err: any) {
      console.error('Protector query error:', err);
      const errorMsg: VoiceMessage = {
        id: `err-${Date.now()}`,
        sender: 'protector',
        text: "I couldn't reach the threat intelligence network right now. Always remember: Never pay advance registration or laptop security fees for employment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        threatHighlight: 'Safety Warning'
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.text, 'Security Warning', () => {
        setStatus('listening-for-wake');
      });
    }
  };

  // Text to speech implementation
  const speakText = (text: string, title?: string, onComplete?: () => void) => {
    if (isVoiceMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onComplete) onComplete();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setStatus('speaking');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select high quality voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Google') && v.lang.startsWith('en')) ||
        (v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Natural'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (onComplete) {
          onComplete();
        } else {
          setStatus('listening-for-wake');
        }
      };

      utterance.onerror = () => {
        if (onComplete) onComplete();
        else setStatus('listening-for-wake');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (onComplete) onComplete();
    }
  };

  // Manual Push to talk trigger
  const handleManualMicClick = () => {
    if (status === 'speaking') {
      window.speechSynthesis?.cancel();
      setStatus('listening-for-wake');
      return;
    }

    if (status === 'listening-for-wake') {
      playListeningPing();
      setStatus('woken-up');
      setIsExpanded(true);
      setLiveTranscript('Listening... Speak your question now');
      clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = setTimeout(() => {
        if (statusRef.current === 'woken-up') {
          setStatus('listening-for-wake');
          setLiveTranscript('');
        }
      }, 8000);
    } else if (status === 'woken-up') {
      playSleepChime();
      setStatus('listening-for-wake');
      setLiveTranscript('');
    } else {
      setStatus('listening-for-wake');
    }
  };

  // Simulate speaking "Protector" for instant demo/testing
  const handleSimulateWakeWord = () => {
    handleWakeWordTriggered('Protector', 'Protector');
  };

  // Text input submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const query = textInput.trim();
    setTextInput('');
    handleUserSpokenCommand(query);
  };

  const toggleWakeWordListening = () => {
    if (wakeWordEnabled) {
      setWakeWordEnabled(false);
      shouldListenRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      setStatus('idle');
      playSleepChime();
    } else {
      setWakeWordEnabled(true);
      shouldListenRef.current = true;
      try {
        recognitionRef.current?.start();
      } catch {}
      setStatus('listening-for-wake');
      playListeningPing();
    }
  };

  return (
    <>
      {/* 1. DOCKED FLOATING VOICE STATUS BAR (When Minimized) */}
      {/* 1. MINIMIZED FLOATING DOCKED BAR (Desktop & Tablet) */}
      {!isExpanded && (
        <div 
          id="protector-docked-bar"
          className="hidden md:flex fixed bottom-6 left-6 z-40 items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all hover:scale-102 group cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          {/* Pulsing Shield Avatar */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            <Shield className="w-5 h-5 text-cyan-200" />
            {status === 'listening-for-wake' && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
            )}
            {status === 'woken-up' && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-bounce" />
            )}
          </div>

          {/* Status Text & Audio Waves */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white tracking-wide flex items-center gap-1.5">
                <span>Protector</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Voice Agent
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              {status === 'listening-for-wake' && (
                <>
                  {/* Animated audio wave bars */}
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                  </div>
                  <span>Call <strong className="text-cyan-300">"Protector"</strong> to wake up</span>
                </>
              )}
              {status === 'woken-up' && (
                <span className="text-amber-300 font-semibold animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Woken Up! Listening to you...
                </span>
              )}
              {status === 'processing' && (
                <span className="text-cyan-300 font-medium animate-pulse">
                  Analyzing security intel...
                </span>
              )}
              {status === 'speaking' && (
                <span className="text-blue-300 font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3 animate-bounce" /> Speaking response...
                </span>
              )}
              {status === 'idle' && (
                <span className="text-slate-400">Protector in Standby</span>
              )}
            </div>
          </div>

          {/* Instant Quick-Test "Say Protector" Button */}
          <button
            id="btn-quick-wake-test"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSimulateWakeWord();
            }}
            className="ml-2 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 transition-all flex items-center gap-1"
            title="Click to simulate saying 'Protector' out loud"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Say "Protector"</span>
          </button>

          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </div>
      )}

      {/* 2. EXPANDED PROTECTOR COMMAND CONSOLE (Interactive HUD) */}
      {isExpanded && (
        <div 
          id="protector-expanded-console"
          className="fixed inset-x-2.5 bottom-20 md:bottom-6 md:left-6 md:inset-x-auto z-50 w-auto md:w-[440px] max-h-[78vh] md:max-h-[85vh] flex flex-col rounded-2xl bg-[#090e1b]/98 border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.35)] backdrop-blur-xl overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <Shield className="w-4 h-4 text-white" />
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                  status === 'woken-up' ? 'bg-amber-400 animate-ping' :
                  status === 'speaking' ? 'bg-blue-400 animate-bounce' :
                  status === 'listening-for-wake' ? 'bg-emerald-400' : 'bg-slate-500'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-wide">
                    Protector Voice Agent
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                    WAKE-WORD ENGINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cybersecurity Voice Guardian
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mute Spoken Audio Toggle */}
              <button
                id="btn-voice-mute"
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isVoiceMuted 
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' 
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isVoiceMuted ? "Unmute Voice Output" : "Mute Voice Output"}
              >
                {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Minimize */}
              <button
                id="btn-minimize-protector"
                onClick={() => {
                  setIsExpanded(false);
                  if (onCloseGlobal) onCloseGlobal();
                }}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimize Protector"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Wake Word Status Banner */}
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${wakeWordEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-300">
                Wake Word: <strong className="text-cyan-300">"Protector"</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick test wake word button */}
              <button
                id="btn-test-say-protector"
                type="button"
                onClick={handleSimulateWakeWord}
                className="px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1"
                title="Simulate calling 'Protector' out loud"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Test "Protector"</span>
              </button>

              <button
                id="btn-toggle-wake-word"
                onClick={toggleWakeWordListening}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  wakeWordEnabled 
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {wakeWordEnabled ? 'ALWAYS ON' : 'STANDBY'}
              </button>
            </div>
          </div>

          {/* Permission warning banner if mic blocked */}
          {micPermissionError && (
            <div className="px-4 py-2 bg-amber-950/50 border-b border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{micPermissionError}</span>
            </div>
          )}

          {/* Central Holographic Visualizer Orb & State Indicator */}
          <div className="p-4 bg-[#060a14] border-b border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background glowing rings */}
            <div className="relative flex items-center justify-center my-2">
              {/* Expanding pulse waves */}
              {(status === 'woken-up' || status === 'speaking' || status === 'listening-for-wake') && (
                <div className={`absolute w-28 h-28 rounded-full border opacity-40 animate-ping ${
                  status === 'woken-up' ? 'border-amber-400' :
                  status === 'speaking' ? 'border-cyan-400' : 'border-emerald-500/30'
                }`} />
              )}
              
              {/* Outer decorative ring */}
              <div className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all ${
                status === 'woken-up' ? 'border-amber-400/80 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]' :
                status === 'speaking' ? 'border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]' :
                status === 'processing' ? 'border-blue-400/80 bg-blue-500/10 animate-spin' :
                'border-cyan-500/40 bg-slate-900/60'
              }`}>
                {/* Central Interactive Mic Button */}
                <button
                  id="btn-protector-orb-mic"
                  onClick={handleManualMicClick}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 ${
                    status === 'woken-up' ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]' :
                    status === 'speaking' ? 'bg-gradient-to-tr from-blue-500 to-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]' :
                    status === 'listening-for-wake' ? 'bg-gradient-to-tr from-slate-800 to-slate-700 hover:from-cyan-700 hover:to-blue-700' :
                    'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={status === 'woken-up' ? 'Listening to you now - Tap to cancel' : 'Tap to speak to Protector directly'}
                >
                  {status === 'speaking' ? (
                    <Volume2 className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Mic className={`w-6 h-6 ${status === 'woken-up' ? 'animate-bounce' : ''}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="text-center mt-1">
              <p className="text-xs font-semibold text-white tracking-wide">
                {status === 'listening-for-wake' && 'Listening for "Protector"...'}
                {status === 'woken-up' && 'Protector is listening... speak your question'}
                {status === 'processing' && 'Protector is analyzing threat intelligence...'}
                {status === 'speaking' && 'Protector is speaking...'}
                {status === 'idle' && 'Voice Agent in Standby'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {status === 'listening-for-wake' && 'Say "Protector" out loud anytime to wake up'}
                {status === 'woken-up' && 'Ask about job offers, payments, scams, or the current scan'}
                {status === 'speaking' && 'Tap the center button to pause speech'}
                {status === 'idle' && 'Click the microphone above to start'}
              </p>
            </div>

            {/* Live speech preview ticker */}
            {liveTranscript && (
              <div className="mt-2 w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-center animate-pulse">
                <span className="text-xs text-cyan-300 font-mono italic">
                  "{liveTranscript}"
                </span>
              </div>
            )}
          </div>

          {/* Active Scan Context Pill (if scan exists) */}
          {activeScanResult && (
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400">Monitoring Scan:</span>
                <span className="font-semibold text-slate-200 truncate">
                  {activeScanResult.extracted_entities?.company_name || activeScanResult.file_name || 'Active Document'}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                activeScanResult.threat_score >= 70 ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                activeScanResult.threat_score >= 40 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                THREAT: {activeScanResult.threat_score}%
              </span>
            </div>
          )}

          {/* Quick Voice Prompt Suggestions */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-slate-500 whitespace-nowrap">Try asking:</span>
            <button
              onClick={() => handleUserSpokenCommand("Is paying for a laptop normal for a job?")}
              className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors border border-slate-700"
            >
              "Is laptop fee normal?"
            </button>
            {activeScanResult && (
              <button
                onClick={() => handleUserSpokenCommand("Why is the threat score so high?")}
                className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors border border-slate-700"
              >
                "Why is this score high?"
              </button>
            )}
            <button
              onClick={() => handleUserSpokenCommand("How do I report a cybercrime scam?")}
              className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors border border-slate-700"
            >
              "How to report a scam?"
            </button>
          </div>

          {/* Conversation Transcript Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[160px] max-h-[260px] bg-[#070b14]/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="font-semibold text-[10px] text-slate-400">
                    {msg.sender === 'user' ? 'You' : 'Protector'}
                  </span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  {msg.threatHighlight && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                      {msg.threatHighlight}
                    </span>
                  )}
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-md'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Replay audio button for Protector messages */}
                  {msg.sender === 'protector' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Replay speech</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Controls / Text Fallback Input */}
          <form 
            onSubmit={handleTextSubmit}
            className="p-3 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a question for Protector..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              id="btn-send-protector-text"
              type="submit"
              disabled={!textInput.trim() || status === 'processing'}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 transition-colors"
              title="Send to Protector"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
