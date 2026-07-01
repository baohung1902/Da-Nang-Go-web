// src/Chatbot.jsx
// A lightweight, production‑ready AI chatbot for Da Nang travel assistance.
// Uses the askGeminiAboutDaNang function defined in src/aiService.js.

import { useState } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';
import { askGeminiAboutDaNang } from './aiService';
import { useToast } from './App.jsx'; // Re‑use toast context for error notifications

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // {role: 'user'|'bot', text: string}
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await askGeminiAboutDaNang(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (e) {
      console.error(e);
      showToast('error', 'Không thể kết nối với Gemini. Vui lòng thử lại sau.', 4000);
    } finally {
      setLoading(false);
    }
  };

  const onKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 p-4 lg:left-auto lg:bottom-8 lg:right-8">
      <header className="flex items-center gap-2 mb-3">
        <Bot className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Da Nang AI Assistant</h2>
      </header>
      <div className="h-60 overflow-y-auto mb-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-xl ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 text-gray-900 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <textarea
          rows={1}
          className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Hỏi về địa điểm, ẩm thực, lịch trình..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </section>
  );
}
