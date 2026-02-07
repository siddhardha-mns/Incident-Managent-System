import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Map, User, Loader2 } from 'lucide-react';
import { createChat, queryWithMaps } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isMapResult?: boolean;
  mapChunks?: any[];
}

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Sentinel Assistant online. I can help with protocols, resource allocation, and map data.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize standard chat
    chatRef.current = createChat("You are a helpful emergency response assistant. Be concise.");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (useMaps) {
        // Use Maps Grounding (Gemini 2.5 Flash)
        // Hardcoded location for demo: San Francisco
        const location = { lat: 37.7749, lng: -122.4194 };
        const result = await queryWithMaps(userMsg.text, location);
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: result.text || "I found some information:",
          isMapResult: true,
          mapChunks: result.chunks
        }]);

      } else {
        // Use Standard Chat (Gemini 3 Pro)
        const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMsg.text });
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.text || "I didn't get a response."
        }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error connecting to AI service." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-beige-light">
      {/* Header */}
      <div className="p-4 bg-white border-b border-beige-dark flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-emergency-darkRed" />
          <h2 className="font-bold text-gray-800">Command Assistant</h2>
        </div>
        
        {/* Maps Toggle */}
        <button 
          onClick={() => setUseMaps(!useMaps)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
            useMaps 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Maps Grounding {useMaps ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emergency-darkRed text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-beige-dark rounded-bl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-75">
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                <span className="text-xs uppercase font-bold">{msg.role === 'model' ? (msg.isMapResult ? 'Gemini 2.5 Flash' : 'Gemini 3 Pro') : 'You'}</span>
              </div>
              
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Render Map Links if available */}
              {msg.isMapResult && msg.mapChunks && (
                <div className="mt-3 space-y-2">
                  {msg.mapChunks.map((chunk, idx) => {
                    const webUri = chunk.web?.uri;
                    const webTitle = chunk.web?.title;
                    if (webUri) {
                        return (
                            <a key={idx} href={webUri} target="_blank" rel="noreferrer" className="block text-xs bg-blue-50 text-blue-700 p-2 rounded hover:underline truncate">
                                🔗 {webTitle || webUri}
                            </a>
                        );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-beige-dark">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={useMaps ? "Ask about locations (e.g., 'Hospitals nearby')..." : "Ask for protocols or assistance..."}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emergency-red"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emergency-red hover:bg-emergency-darkRed text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;