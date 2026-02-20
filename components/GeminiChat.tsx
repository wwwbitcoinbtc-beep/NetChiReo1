import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { streamGeminiResponse } from '../services/gemini';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';

export const GeminiChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'سلام! 👋 من هوش مصنوعی نت‌چی هستم. چطور می‌تونم کمکت کنم؟ می‌تونی درباره نزدیک‌ترین کافی‌نت‌ها یا تنظیمات اینترنت ازم بپرسی.',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Start streaming
      const streamResult = await streamGeminiResponse(userMsg.text, history);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '', // Start empty
        timestamp: Date.now()
      }]);

      let fullText = '';
      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const newText = c.text || '';
        fullText += newText;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-white/20 backdrop-blur-sm rounded-t-[40px] shadow-inner">
      {/* Header */}
      <div className="p-6 bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">دستیار هوشمند نت‌چی</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            آنلاین
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-white'}`}>
                {msg.role === 'user' ? <UserIcon size={16} className="text-blue-500" /> : <Bot size={16} className="text-purple-500" />}
            </div>
            
            <div className={`
              max-w-[80%] p-4 rounded-2xl text-sm leading-6 shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-bl-none' 
                : 'bg-white/80 backdrop-blur-sm text-slate-700 rounded-br-none border border-white/50'
              }
            `}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-slate-400 text-xs px-12">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
            </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-24 left-4 right-4 z-20">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="bg-white/80 backdrop-blur-xl border border-white/60 p-2 rounded-3xl shadow-glass flex items-center gap-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="سوال خود را بپرسید..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-700 placeholder:text-slate-400"
          />
          <button 
            type="button" // Prevent submit if needed, or allow it
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            {isLoading && <div className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full animate-spin m-3" />}
          </button>
        </form>
      </div>
    </div>
  );
};