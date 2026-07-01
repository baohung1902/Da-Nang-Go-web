// src/Chatbot.jsx
// A lightweight, production‑ready AI chatbot for Da Nang travel assistance.
// Uses the askGeminiAboutDaNang function defined in src/aiService.js.

import { useState } from 'react';
import { Send, Loader2, Bot, X } from 'lucide-react';
import { askGeminiAboutDaNang } from './aiService';
import { useToast, DragonBridgeIcon } from './App.jsx'; // Re‑use toast context and DragonBridgeIcon

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer group"
        aria-label="Toggle chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <DragonBridgeIcon className="w-7 h-7" />
            <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Hỏi AI Assistant
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <section className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col transition-all duration-300">
          <header className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <DragonBridgeIcon className="w-6 h-6" />
              <h2 className="text-md font-semibold text-gray-800">Da Nang AI Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="h-72 overflow-y-auto mb-3 space-y-2 pr-1">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-12 text-sm px-4">
                Xin chào! Tôi là trợ lý du lịch Đà Nẵng. Bạn cần tôi giúp gì hôm nay?
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-gray-100 text-gray-900 rounded-xl px-3 py-2 text-sm rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-gray-100 pt-3">
            <textarea
              rows={1}
              className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              placeholder="Hỏi về địa điểm, ẩm thực..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={onKeyPress}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center cursor-pointer transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
