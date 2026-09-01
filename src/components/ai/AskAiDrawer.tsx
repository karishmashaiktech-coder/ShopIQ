import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  RefreshCw, 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShoppingBag,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ChatMessage, ShopProfile, Product, Customer, Transaction, DashboardMetrics, BusinessInsight } from '../../types';

interface AskAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopProfile;
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  metrics: DashboardMetrics;
  insights: BusinessInsight[];
}

export const AskAiDrawer: React.FC<AskAiDrawerProps> = ({
  isOpen,
  onClose,
  shop,
  products,
  customers,
  transactions,
  metrics,
  insights,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${shop.owner_name.split(' ')[0]}! I'm **ShopIQ AI**, your store intelligence assistant. I'm connected directly to your shop inventory, daily sales, and credit ledger. How can I help you optimize your business today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { label: 'What should I restock?', icon: Package },
    { label: 'Who owes me money?', icon: Users },
    { label: 'How much profit did I make this week?', icon: DollarSign },
    { label: 'Which product sells the most?', icon: TrendingUp },
    { label: 'Which products are slow-moving?', icon: Clock },
    { label: 'What should I buy tomorrow?', icon: ShoppingBag },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          shopData: {
            shop,
            products,
            customers,
            transactions: transactions.slice(0, 20),
            metrics,
            insights,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Network error calling AI service');
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis completed for your shop data.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error in Ask AI:', error);
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Could not connect to AI backend.**\n\nBased on your local store metrics:\n• Today's Sales: **${shop.currency_symbol}${metrics.todaySales.toLocaleString()}**\n• Low Stock items: **${metrics.lowStockCount} items**\n• Pending Udhaar: **${shop.currency_symbol}${metrics.pendingCreditTotal.toLocaleString()}** across ${metrics.pendingCreditCount} customers.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Slide-out Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-lg h-full bg-[#0E101B] border-l border-purple-500/20 shadow-2xl flex flex-col z-10"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#121422]/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  Ask ShopIQ AI
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live Shop Context
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time decision support for {shop.shop_name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions Chips */}
          <div className="p-3 bg-purple-950/20 border-b border-purple-500/10">
            <span className="text-[11px] font-semibold text-purple-300 block mb-2 px-1">
              SUGGESTED SHOP QUESTIONS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => {
                const Icon = q.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(q.label)}
                    className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Icon className="w-3 h-3 text-purple-400" />
                    <span>{q.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? 'bg-[#151828] border border-white/10 text-slate-200 shadow-md'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                    }`}
                  >
                    {/* Render bold and bullet points nicely */}
                    <div>
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Render lines with bold markdown
                        return (
                          <div key={lIdx} className={line.startsWith('•') || line.startsWith('*') ? 'pl-2 py-0.5' : 'py-0.5'}>
                            {line}
                          </div>
                        );
                      })}
                    </div>
                    <span className={`text-[10px] block mt-2 text-right opacity-60`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-purple-400 bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl max-w-[75%] animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ShopIQ AI is analyzing your store numbers...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-white/10 bg-[#121422]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about restock, profits, debtors, top items..."
                className="flex-1 bg-[#090A0F] border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white shadow-lg shadow-purple-900/40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
