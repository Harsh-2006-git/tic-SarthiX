'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Volume2, Mic, MicOff, Bot, User, Sparkles } from 'lucide-react';
import { getChatResponse, getTextToSpeech } from '@/app/actions';
import type { ChatInput } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import type { TravelItineraryInput } from '@/lib/types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  role: 'user' | 'model';
  content: string;
  audioUrl?: string;
};

interface ChatAgentProps {
  onItineraryReady: (data: TravelItineraryInput) => void;
}

export default function ChatAgent({ onItineraryReady }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [isListening, setIsListening] = useState(false);

  const speechRecognition = useRef<any>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent | null, textOverride: string | null = null) => {
    if (e) e.preventDefault();
    const userInput = textOverride ?? input;
    if (!userInput.trim()) return;

    const userMessage: Message = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsResponding(true);

    const historyForAI = newMessages.map(({ role, content }) => ({ role, content }));
    const chatInput: ChatInput = { history: historyForAI, language };

    const result = await getChatResponse(chatInput);

    if (result.error) {
      toast({ variant: "destructive", title: "Chat Error", description: result.error });
      setIsResponding(false);
    } else if (result.data) {
      const aiText = result.data.response;
      const itineraryInput = result.data.itineraryInput;

      // Get Text to Speech automatically
      try {
        const audioResult = await getTextToSpeech({ text: aiText, language });
        const aiMessage: Message = {
          role: 'model',
          content: aiText,
          audioUrl: audioResult.data?.media
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Autoplay logic
        if (audioResult.data?.media) {
          const audio = new Audio(audioResult.data.media);
          audioRef.current = audio;
          audio.play().catch(err => console.log("Autoplay blocked or failed:", err));
        }
      } catch (err) {
        console.error("TTS Error:", err);
        const aiMessage: Message = { role: 'model', content: aiText };
        setMessages((prev) => [...prev, aiMessage]);
      }

      if (itineraryInput && itineraryInput.departureDate && itineraryInput.arrivalDate) {
        const { departureDate, arrivalDate, numberOfPeople, ...rest } = itineraryInput;
        const departure = new Date(departureDate.replace(/-/g, '/'));
        const arrival = new Date(arrivalDate.replace(/-/g, '/'));
        onItineraryReady({
          ...rest,
          departureDate: departure,
          arrivalDate: arrival,
          numberOfPeople: Number(numberOfPeople) || 1,
        } as TravelItineraryInput);
      }
    }
    setIsResponding(false);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(null, transcript);
      };

      speechRecognition.current.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          toast({ variant: "destructive", title: "Voice Error", description: event.error });
        }
        setIsListening(false);
      };

      speechRecognition.current.onend = () => { setIsListening(false); };
    }
  }, [language]);

  const toggleListening = () => {
    if (!speechRecognition.current) {
      toast({ title: "Unsupported", description: "Your browser doesn't support voice recognition." });
      return;
    }
    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      speechRecognition.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const startChat = async () => {
      setIsLoading(true);
      const initialText = language === 'Hindi'
        ? 'नमस्ते! मैं RoamAI हूँ। आपकी दिव्य यात्रा की योजना बनाने में मैं आपकी मदद कर सकता हूँ। आप कहां जाना चाहते हैं?'
        : 'Hello! I am RoamAI. I can help you plan your sacred journey. Where would you like to travel?';

      try {
        const audioResult = await getTextToSpeech({ text: initialText, language });
        const initialMessage: Message = {
          role: 'model',
          content: initialText,
          audioUrl: audioResult.data?.media
        };
        setMessages([initialMessage]);

        // Autoplay initial greeting if audio is ready
        if (audioResult.data?.media) {
          const audio = new Audio(audioResult.data.media);
          audio.play().catch(err => console.log("Initial greeting autoplay blocked:", err));
        }
      } catch (err) {
        setMessages([{ role: 'model', content: initialText }]);
      }
      setIsLoading(false);
    };
    startChat();
  }, [language]);

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-orange-100 bg-white/50 backdrop-blur-sm relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">RoamAI Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Divine Wisdom Active</span>
            </div>
          </div>
        </div>

        <RadioGroup
          value={language}
          onValueChange={(v: any) => setLanguage(v)}
          className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg has-[:checked]:bg-white has-[:checked]:shadow-sm transition-all selection:bg-transparent">
            <RadioGroupItem value="Hindi" id="hindi" className="sr-only" />
            <Label htmlFor="hindi" className="text-xs font-bold cursor-pointer transition-colors">Hindi</Label>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg has-[:checked]:bg-white has-[:checked]:shadow-sm transition-all selection:bg-transparent">
            <RadioGroupItem value="English" id="english" className="sr-only" />
            <Label htmlFor="english" className="text-xs font-bold cursor-pointer transition-colors">English</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6 relative z-10">
        <div className="space-y-6 max-w-2xl mx-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-orange-600 text-white'
                  }`}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed font-medium ${m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-orange-100 text-slate-700 rounded-tl-none'
                    }`}>
                    {m.content}
                  </div>
                  {m.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => new Audio(m.audioUrl).play()}
                      className="h-8 pr-3 pl-2 gap-2 rounded-full border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest active:scale-95"
                    >
                      <Volume2 size={14} className="text-orange-600" /> Listen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isResponding && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex gap-3 items-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-600/50">
                <Loader2 size={12} className="animate-spin" /> Consulting the stars...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-orange-100 relative z-10">
        <form
          onSubmit={handleSendMessage}
          className="max-w-2xl mx-auto flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-200 focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            className={`h-12 w-12 rounded-full transition-all ${isListening ? 'bg-orange-600 text-white animate-pulse' : 'hover:bg-orange-100 text-slate-400'
              }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Plan your divine journey..."
            className="flex-1 border-none bg-transparent focus-visible:ring-0 font-medium placeholder:text-slate-400 h-12"
          />
          <Button
            disabled={!input.trim() || isResponding}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg active:scale-95 disabled:grayscale transition-all p-0 flex items-center justify-center"
          >
            {isResponding ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </form>
      </div>
    </div>
  );
}
