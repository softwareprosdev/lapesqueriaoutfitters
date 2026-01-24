"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Simple fishing knowledge base
const fishingKnowledge = {
  greetings: [
    "Hey there, fellow angler! What can I help you with today?",
    "Welcome to the fishing chat! Ready to catch some knowledge?",
    "Hello! I'm your fishing buddy. What's on your mind?"
  ],
  goodbyes: [
    "Tight lines and good luck out there!",
    "Happy fishing! Stay safe on the water.",
    "See you on the water! Remember to practice catch and release."
  ],
  weather: [
    "Good weather for fishing usually means stable barometric pressure, light winds, and overcast skies.",
    "Look for weather fronts - fish often bite better before a storm.",
    "Wind speeds under 15 mph are ideal for most fishing conditions."
  ],
  tides: [
    "Fish are most active during tide changes - incoming and outgoing tides are prime time!",
    "High tide brings baitfish closer to shore, while low tide can concentrate fish in deeper channels.",
    "Check the tide charts - fishing 2 hours before high tide is often best."
  ],
  bait: [
    "Live bait like minnows, shrimp, and squid are always top choices.",
    "Artificial lures work great too - try topwater plugs at dawn/dusk.",
    "Match the hatch - use bait that resembles what's naturally in the area."
  ],
  techniques: [
    "Bottom fishing works well in deeper water - use a simple rig with weights.",
    "Casting from shore? Try surf fishing techniques with longer rods.",
    "Fly fishing requires practice but is incredibly rewarding once you get it."
  ],
  safety: [
    "Always wear a life jacket when boating, even if you're a strong swimmer.",
    "Check weather forecasts before heading out and let someone know your plans.",
    "Practice catch and release to preserve fish populations for future generations."
  ],
  locations: [
    "South Padre Island is famous for its fishing - try the jetties and piers!",
    "Port Mansfield has excellent fishing in the Gulf, especially for speckled trout.",
    "The Laguna Madre bay system offers protected fishing with great access."
  ],
  default: [
    "That's an interesting question! I'm still learning about fishing, but I'd recommend checking local fishing reports.",
    "Great question! Fishing is as much about patience as it is about technique.",
    "I'm here to help with fishing advice. What specific aspect are you curious about?"
  ]
};

function getFishingResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for keywords and return appropriate responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return fishingKnowledge.greetings[Math.floor(Math.random() * fishingKnowledge.greetings.length)];
  }

  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return fishingKnowledge.goodbyes[Math.floor(Math.random() * fishingKnowledge.goodbyes.length)];
  }

  if (lowerMessage.includes('weather') || lowerMessage.includes('storm') || lowerMessage.includes('wind')) {
    return fishingKnowledge.weather[Math.floor(Math.random() * fishingKnowledge.weather.length)];
  }

  if (lowerMessage.includes('tide') || lowerMessage.includes('high') || lowerMessage.includes('low')) {
    return fishingKnowledge.tides[Math.floor(Math.random() * fishingKnowledge.tides.length)];
  }

  if (lowerMessage.includes('bait') || lowerMessage.includes('lure') || lowerMessage.includes('minnow')) {
    return fishingKnowledge.bait[Math.floor(Math.random() * fishingKnowledge.bait.length)];
  }

  if (lowerMessage.includes('technique') || lowerMessage.includes('how to') || lowerMessage.includes('fishing method')) {
    return fishingKnowledge.techniques[Math.floor(Math.random() * fishingKnowledge.techniques.length)];
  }

  if (lowerMessage.includes('safe') || lowerMessage.includes('safety') || lowerMessage.includes('life jacket')) {
    return fishingKnowledge.safety[Math.floor(Math.random() * fishingKnowledge.safety.length)];
  }

  if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('south padre') || lowerMessage.includes('port mansfield')) {
    return fishingKnowledge.locations[Math.floor(Math.random() * fishingKnowledge.locations.length)];
  }

  // Default response
  return fishingKnowledge.default[Math.floor(Math.random() * fishingKnowledge.default.length)];
}

export function FishermanChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "🎣 Hey there, fellow angler! I'm your fishing buddy. Ask me anything about fishing, tides, weather, bait, or techniques!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getFishingResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Open fishing chatbot"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-4 z-50 w-80 h-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Fishing Buddy</h3>
                  <p className="text-slate-400 text-xs">Your fishing assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center hover:bg-slate-600/50 transition-colors"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user'
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className={`px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="px-3 py-2 rounded-2xl bg-slate-700/50 border border-slate-600/50">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-slate-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about fishing, tides, weather..."
                  className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}