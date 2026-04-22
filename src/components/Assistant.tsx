import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Mic, Volume2, VolumeX, Bot, User, Loader2 } from 'lucide-react';
import { askJanVote } from '../lib/gemini';
import { UserProfile, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";

interface Props {
  userProfile: UserProfile;
}

// Simple browser STT wrapper
const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = (lang: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return { isListening, transcript, startListening };
};

export default function Assistant({ userProfile }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      content: `Hello! I am your JanVote AI assistant. As a **${userProfile.userType.replace('_', ' ')}**, how can I help you understand the election process today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatLanguage, setChatLanguage] = useState<'en' | 'hi'>(userProfile.language);
  const { isListening, transcript, startListening } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      handleSend(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    // Preload voices to avoid the first-click robotic voice bug
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleSend = async (text: string) => {
    const content = text || input;
    if (!content.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const response = await askJanVote(content, userProfile.userType, chatLanguage, history);
      setMessages(prev => [...prev, { role: 'model', content: response || 'Sorry, I encounted an error.' }]);
      
      // Auto-TTS if low literacy
      if (userProfile.userType === 'low_literacy' && response) {
        speakResponse(response);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Could not reach the AI. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakResponse = async (text: string) => {
     window.speechSynthesis.cancel();
     const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ''));
     utterance.lang = chatLanguage === 'hi' ? 'hi-IN' : 'en-US';
     
     const voices = window.speechSynthesis.getVoices();
     const preferredVoices = voices.filter(v => v.lang.includes(chatLanguage === 'hi' ? 'hi' : 'en'));
     const googleVoice = preferredVoices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
     if (googleVoice) {
        utterance.voice = googleVoice;
     } else if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
     }
     
     utterance.onstart = () => setIsSpeaking(true);
     utterance.onend = () => setIsSpeaking(false);
     utterance.onerror = () => setIsSpeaking(false);
     
     window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex h-full flex-col rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
               <Bot size={16} />
            </div>
            <div>
               <h3 className="font-bold text-slate-800 leading-tight">AI Assistant</h3>
               <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Always Secure</p>
            </div>
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`chat-bubble-${m.role === 'user' ? 'user' : 'ai'} px-5 py-3 text-sm max-w-[85%] shadow-sm`}>
                <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-inherit prose-strong:underline prose-strong:underline-offset-2">
                  <Markdown>{m.content}</Markdown>
                </div>
                {m.role === 'model' && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => speakResponse(m.content)}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-tighter"
                      title="Listen"
                    >
                      <Volume2 size={14} /> Listen
                    </button>
                    {isSpeaking && (
                      <button 
                        onClick={stopSpeaking}
                        className="mt-3 text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-tighter"
                        title="Stop"
                      >
                        <VolumeX size={14} /> Stop
                      </button>
                    )}
                  </div>
                )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start items-center gap-3">
            <div className="flex gap-1">
               <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => startListening(chatLanguage)}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-200' : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'}`}
            title="Voice input"
          >
            <Mic size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend('')}
              placeholder="Type your question..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <button 
            disabled={!input.trim() || loading}
            onClick={() => handleSend('')}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4 px-2">
            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
               <span 
                 onClick={() => setChatLanguage('en')}
                 className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${chatLanguage === 'en' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
               >English</span>
               <span 
                 onClick={() => setChatLanguage('hi')}
                 className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${chatLanguage === 'hi' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
               >Hindi</span>
            </div>
        </div>
      </div>
    </div>
  );
}
