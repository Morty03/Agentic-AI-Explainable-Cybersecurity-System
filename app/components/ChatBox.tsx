'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isMinimized?: boolean;
  onToggle?: () => void;
}

export default function ChatBox({ onSendMessage, messages, isMinimized = false, onToggle }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full p-4 shadow-lg transition-all z-50"
      >
        <Bot className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-cyan-500" />
          <span className="font-semibold text-white">AI Security Assistant</span>
          <span className="text-xs text-green-400 ml-2">● Ollama</span>
        </div>
        <button onClick={onToggle} className="p-1 hover:bg-gray-700 rounded transition-colors">
          <Minimize2 className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Ask me about cybersecurity threats,</p>
            <p>network anomalies, or attack patterns!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.isUser 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                : 'bg-gray-800 text-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the threats..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2 transition-all"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}