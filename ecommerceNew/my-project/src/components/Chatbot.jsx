import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  ShoppingBag, 
  ArrowRight, 
  Percent, 
  Truck, 
  Search, 
  HelpCircle,
  Eye
} from 'lucide-react';

const Chatbot = () => {
  const { 
    addToCart, 
    openQuickView, 
    applyCoupon, 
    setCartOpen, 
    showNotification 
  } = useContext(ShopContext);

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('vibecart_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'welcome',
        role: 'bot',
        content: "Hello! I'm **VibeBot**, your virtual assistant. 🌟 Ask me about our products, track an order (e.g. *VIBE-87421*), get coupon codes, or ask general questions. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Persist chat history in session storage
  useEffect(() => {
    sessionStorage.setItem('vibecart_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Dismiss greeting tooltip after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputValue('');
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('API server down');
      }

      const data = await response.json();
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: data.text,
        products: data.products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);

      // Execute actions triggered by the chatbot API
      if (data.action) {
        setTimeout(() => {
          executeChatbotAction(data.action, data.actionData);
        }, 1000);
      }

    } catch (error) {
      console.error('Chatbot API error:', error);
      // Fallback answers in case backend API is not running
      handleFallbackResponse(text);
    } finally {
      setIsTyping(false);
    }
  };

  // Process triggers such as open_cart, apply_coupon etc.
  const executeChatbotAction = (action, actionData) => {
    switch(action) {
      case 'open_cart':
        setCartOpen(true);
        showNotification("Opened your cart drawer!", "info");
        break;
      case 'apply_coupon':
        if (actionData && actionData.code) {
          applyCoupon(actionData.code);
        }
        break;
      case 'redirect_checkout':
        navigate('/checkout');
        showNotification("Navigated to checkout.", "info");
        break;
      case 'redirect_help':
        navigate('/help-center');
        showNotification("Navigated to Help Center.", "info");
        break;
      default:
        break;
    }
  };

  // Client-side fallback response handler for offline reliability
  const handleFallbackResponse = (queryText) => {
    const query = queryText.toLowerCase().trim();
    let reply = "";
    let action = null;
    let actionData = null;

    if (query.match(/\b(hi|hello|hey|hola|greetings)\b/i)) {
      reply = "Hi! (Offline Mode) I can still help you. You can ask about our shipping policy, return window, or check active coupons (e.g. SAVE20).";
    } else if (query.includes("coupon") || query.includes("discount") || query.includes("offer")) {
      reply = "Active offline codes: **SAVE20** (20% off) or **FREESHIP** (free shipping on orders over $150). Try typing *\"Apply SAVE20\"*!";
    } else if (query.includes("apply save20")) {
      reply = "Applied coupon code **SAVE20**! (Offline fallback)";
      action = "apply_coupon";
      actionData = { code: "SAVE20" };
    } else if (query.includes("shipping")) {
      reply = "Standard shipping takes 3-5 business days. Express shipping is 1-2 business days. Shipping is free for orders above $150.";
    } else if (query.includes("return") || query.includes("refund")) {
      reply = "Our policy allows 30 days for returns in original packaging. Contact support at support@vibecart.com for details.";
    } else if (query.includes("track") || query.includes("order")) {
      reply = "Order tracking is currently offline. Please start the backend API server to look up actual database order records.";
    } else {
      reply = "My AI backend server is currently offline, so I am running in basic offline fallback mode. Try asking about *\"shipping\"*, *\"returns\"*, or *\"coupons\"*!";
    }

    setTimeout(() => {
      const botMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'bot',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
      if (action) {
        executeChatbotAction(action, actionData);
      }
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Parsing markdown-like bold tags **text** into JSX
  const renderMessageContent = (content) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      // Line break support
      if (part.includes('\n')) {
        return part.split('\n').map((line, lineIdx) => (
          <React.Fragment key={`${idx}-${lineIdx}`}>
            {line}
            {lineIdx < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      
      {/* 1. GREETING TOOLTIP */}
      {showTooltip && !isOpen && (
        <div className="bg-white text-slate-800 text-3xs font-medium border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-lg mr-3 mb-3 animate-fade-in relative max-w-[200px]">
          <div className="flex gap-2 items-center">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Hi! Need help finding products? Chat with me!</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="absolute -top-1.5 -right-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full p-0.5"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-slate-200/80 rotate-45"></div>
        </div>
      )}

      {/* 2. CHAT DRAWER PANEL */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] sm:h-[550px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden mb-4 animate-slide-up glass-card">
          
          {/* Glass header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-2xl flex items-center justify-center relative">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-xs">VibeBot AI</h3>
                <p className="text-[10px] text-indigo-200/90 font-semibold flex items-center gap-1">
                  <span>Shopping Assistant</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-indigo-300"></span>
                  <span>Online</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat message logs */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-2.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Bot Profile Pic */}
                {m.role === 'bot' && (
                  <div className="w-7.5 h-7.5 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1.5">
                  {/* Bubble content */}
                  <div 
                    className={`px-4 py-3 rounded-2xl text-[11px] leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-none shadow-3xs'
                    }`}
                  >
                    <div>{renderMessageContent(m.content)}</div>

                    {/* Rich Product Cards inside chat */}
                    {m.role === 'bot' && m.products && m.products.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matching Products:</p>
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin max-w-full">
                          {m.products.map((p) => {
                            const discountedPrice = p.price * (1 - (p.discount || 0) / 100);
                            return (
                              <div 
                                key={p.id} 
                                className="w-[150px] flex-shrink-0 bg-slate-50 rounded-xl border border-slate-200/40 p-2 space-y-1.5 flex flex-col justify-between"
                              >
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                                <div>
                                  <h4 className="text-[10px] font-bold text-slate-850 line-clamp-1">{p.name}</h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-black text-slate-900">${discountedPrice.toFixed(2)}</span>
                                    {p.discount > 0 && (
                                      <span className="text-[8px] text-slate-400 line-through">${p.price.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-1 pt-1">
                                  <button
                                    onClick={() => openQuickView(p)}
                                    title="Quick View"
                                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg p-1.5 flex items-center justify-center transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => addToCart(p.id, 1)}
                                    title="Add to Cart"
                                    className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg p-1.5 flex items-center justify-center transition-colors"
                                  >
                                    <ShoppingBag className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <p className={`text-[8px] text-slate-400 ${m.role === 'user' ? 'text-right' : ''}`}>
                    {m.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-7.5 h-7.5 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200/60 rounded-2xl rounded-tl-none shadow-3xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply action chips */}
          <div className="px-3.5 py-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
            <button 
              onClick={() => handleSendMessage("Show me electronic gadgets")}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-full px-2.5 py-1 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <Search className="w-2.5 h-2.5 text-indigo-500" />
              <span>Browse Electronics</span>
            </button>
            <button 
              onClick={() => handleSendMessage("Where is my order?")}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-full px-2.5 py-1 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <Truck className="w-2.5 h-2.5 text-indigo-500" />
              <span>Track Order</span>
            </button>
            <button 
              onClick={() => handleSendMessage("What coupons do you have?")}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-full px-2.5 py-1 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <Percent className="w-2.5 h-2.5 text-indigo-500" />
              <span>Get Coupons</span>
            </button>
            <button 
              onClick={() => handleSendMessage("Shipping policy")}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-full px-2.5 py-1 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-2.5 h-2.5 text-indigo-500" />
              <span>Shipping Policy</span>
            </button>
          </div>

          {/* Form message input */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask VibeBot something..."
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className={`p-2 rounded-xl transition-colors ${
                inputValue.trim() 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 3. FLOATING ACTION BUTTON */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`w-14 h-14 bg-slate-900 hover:bg-indigo-650 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-250 cursor-pointer ${
          isOpen ? 'rotate-90 hover:bg-rose-600 bg-rose-600' : 'hover:scale-105 animate-float'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>

    </div>
  );
};

export default Chatbot;
