import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  Package,
  CreditCard,
  User,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { Product, Customer, Transaction, ShopProfile, DashboardMetrics } from '../../types';

interface AiAssistantViewProps {
  shop: ShopProfile;
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  metrics: DashboardMetrics;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  shop,
  products,
  customers,
  transactions,
  metrics,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${shop.owner_name}! 👋 I am your ShopIQ Helper.\n\nAsk me anything about your shop in simple everyday language. You can ask what to buy, who owes money, or how much you earned today!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested questions from prompt (Section 13)
  const suggestedQuestions = [
    { label: 'What should I order more of?', icon: Package },
    { label: 'How much did I sell today?', icon: TrendingUp },
    { label: 'Who owes me the most money?', icon: CreditCard },
    { label: 'Which product made me the most profit?', icon: Sparkles },
    { label: 'How is my shop doing this week?', icon: HelpCircle },
  ];

  // Speech-to-text recognition (browser native)
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Plain-Language Local Heuristic Fallback Engine
  const generateLocalAnswer = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Stock / Ordering
    if (q.includes('order') || q.includes('buy') || q.includes('low') || q.includes('stock')) {
      const lowProducts = products.filter(p => p.current_stock <= p.min_stock_threshold);
      if (lowProducts.length === 0) {
        return `Great news! None of your products are running low right now. All items are comfortably in stock.`;
      }
      const list = lowProducts.map(p => `• **${p.name}**: Only ${p.current_stock} left (suggest ordering at least ${p.min_stock_threshold * 3})`).join('\n');
      return `You should order more of these ${lowProducts.length} items soon:\n\n${list}\n\nRunning out of these could lead to missed sales!`;
    }

    // 2. Today's sales / earnings
    if (q.includes('today') || q.includes('sell today') || q.includes('earn today')) {
      return `Today you have made **${metrics.todayTransactionsCount} sales** totaling **${shop.currency_symbol}${metrics.todaySales.toLocaleString()}**.\n\nAfter product costs, your actual earnings today are **+${shop.currency_symbol}${metrics.todayProfit.toLocaleString()}**. That's about ${shop.currency_symbol}${metrics.todaySales > 0 ? Math.round((metrics.todayProfit / metrics.todaySales) * 100) : 25} earned for every ${shop.currency_symbol}100 sold!`;
    }

    // 3. Debts / Udhaar / Owed
    if (q.includes('owe') || q.includes('credit') || q.includes('udhaar') || q.includes('due') || q.includes('debt')) {
      const debtors = customers.filter(c => c.current_balance > 0).sort((a, b) => b.current_balance - a.current_balance);
      if (debtors.length === 0) {
        return `Nobody owes you any money right now! All customer accounts are completely clear.`;
      }
      const highest = debtors[0];
      const list = debtors.slice(0, 3).map(c => `• **${c.name}**: owes ${shop.currency_symbol}${c.current_balance.toLocaleString()} (Due: ${c.due_date || 'Soon'})`).join('\n');
      return `Currently, **${debtors.length} customers** owe you a total of **${shop.currency_symbol}${metrics.pendingCreditTotal.toLocaleString()}**.\n\n**${highest.name}** owes the most (${shop.currency_symbol}${highest.current_balance.toLocaleString()}).\n\nTop pending balances:\n${list}\n\nYou can send them a polite reminder on WhatsApp from the Credit / Udhaar page!`;
    }

    // 4. Profit / Best Product
    if (q.includes('profit') || q.includes('most profit') || q.includes('best')) {
      const highestMarginProduct = [...products].sort((a, b) => (b.selling_price - b.cost_price) - (a.selling_price - a.cost_price))[0];
      const mostSoldProduct = [...products].sort((a, b) => b.units_sold - a.units_sold)[0];

      let answer = '';
      if (highestMarginProduct) {
        answer += `• **${highestMarginProduct.name}** makes you the highest profit per item (+${shop.currency_symbol}${highestMarginProduct.selling_price - highestMarginProduct.cost_price} per unit).\n`;
      }
      if (mostSoldProduct) {
        answer += `• **${mostSoldProduct.name}** has the most sales overall (${mostSoldProduct.units_sold} units sold).`;
      }
      return `Here is what makes your shop the most money:\n\n${answer}\n\nTip: Keep these items front-and-center in your shop displays!`;
    }

    // 5. Week performance / Shop health
    if (q.includes('week') || q.includes('how is my shop') || q.includes('doing')) {
      return `Your shop **${shop.shop_name}** is doing well! 🌟\n\n• **Catalog**: ${products.length} products listed\n• **Total Sales Value**: ${shop.currency_symbol}${metrics.todaySales.toLocaleString()} today\n• **Pending Udhaar**: ${shop.currency_symbol}${metrics.pendingCreditTotal.toLocaleString()} across ${metrics.pendingCreditCount} customers\n\nKeep tracking sales after every customer visit to keep your numbers accurate!`;
    }

    // Default friendly answer
    return `Based on your shop data:\n\n• You have ${products.length} active products in your catalog.\n• Today's sales stand at ${shop.currency_symbol}${metrics.todaySales.toLocaleString()}.\n• ${metrics.lowStockCount > 0 ? `⚠️ ${metrics.lowStockCount} items need restocking.` : '✅ Stock levels look healthy.'}\n\nYou can ask me specific questions like "What should I buy?", "Who owes me money?", or "How much did I earn today?"!`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Try sending to the backend server with shop context
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          shop,
          products: products.map(p => ({
            name: p.name,
            category: p.category,
            cost: p.cost_price,
            price: p.selling_price,
            stock: p.current_stock,
            minStock: p.min_stock_threshold,
            unitsSold: p.units_sold
          })),
          customers: customers.map(c => ({
            name: c.name,
            phone: c.phone,
            balance: c.current_balance,
            status: c.status,
            dueDate: c.due_date
          })),
          metrics: {
            todaySales: metrics.todaySales,
            todayProfit: metrics.todayProfit,
            pendingCredit: metrics.pendingCreditTotal
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || generateLocalAnswer(query),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Fallback to local intelligence');
      }
    } catch (err) {
      // Local Heuristic Plain Language Fallback
      const fallbackText = generateLocalAnswer(query);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-purple-400" />
            <span>ShopIQ Helper</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Ask simple questions about your shop and get clear, friendly advice
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `reset-${Date.now()}`,
                sender: 'assistant',
                text: `Ready for your questions, ${shop.owner_name}! What would you like to check?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Questions Chips (Prompt Section 13) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Try asking one of these:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.label)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121422] hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 text-xs font-medium transition-all text-left shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#121422] border border-white/10 flex flex-col h-[520px] shadow-2xl">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-900/40">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-950/30 font-medium'
                      : 'bg-[#181A2D] text-slate-200 border border-white/10 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                  <span
                    className={`block text-[10px] mt-2 font-mono ${
                      isUser ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#181A2D] text-slate-400 border border-white/10 rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-300 ml-1">Checking your shop data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-white/10 mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
              }`}
              title={isListening ? 'Listening... Speak now' : 'Ask with Voice'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. What should I order more of?)..."
              className="flex-1 bg-[#090A0F] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`p-3 rounded-xl font-bold transition-all ${
                !inputQuery.trim() || isLoading
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 hover:scale-105'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
