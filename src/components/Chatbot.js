import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, ShoppingBag } from 'lucide-react';
import { api } from '../api';
import { normalizeProduct } from '../utils/normalizers';

export default function Chatbot({ isAdminMode, onAddToCart, setSelectedProduct }) {
  // --- CHATBOT STATES ---
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAiMode, setIsAiMode] = useState(true); // Default to AI Gemini Stylist mode
  const [isTyping, setIsTyping] = useState(false);
  const [chatbotInput, setChatbotInput] = useState('');
  
  const [chatbotMessages, setChatbotMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Mình là Trợ lý Thời trang AI (AI Fashion Stylist) hoạt động dưới sự hỗ trợ của Gemini 1.5. Hãy chọn chủ đề dưới đây hoặc nhập câu hỏi phối đồ để mình tư vấn nhé! ✨',
      products: []
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages or typing indicator appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatbotMessages, isTyping, isChatbotOpen]);

  // If AdminMode, do not render chatbot widget
  if (isAdminMode) return null;

  // --- HANDLERS ---
  const handleChatOptionClick = async (questionText, answerText) => {
    // Add user's question
    setChatbotMessages(prev => [
      ...prev,
      { sender: 'user', text: questionText, products: [] }
    ]);

    if (!isAiMode) {
      // Local offline mode: immediate reply
      setTimeout(() => {
        setChatbotMessages(prev => [
          ...prev,
          { sender: 'bot', text: answerText, products: [] }
        ]);
      }, 400);
    } else {
      // AI Gemini mode: send question to Gemini backend to get dynamic answer
      await askGemini(questionText);
    }
  };

  const askGemini = async (messageText) => {
    setIsTyping(true);
    try {
      // Get conversation history format matching Gemini API needs (user & model)
      const chatHistory = chatbotMessages
        .filter(m => m.sender === 'user' || m.sender === 'bot')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      // Call Backend endpoint
      const aiResponse = await api.askAi(messageText, chatHistory);

      let normalizedProds = [];
      if (aiResponse.recommendedProducts && aiResponse.recommendedProducts.length > 0) {
        normalizedProds = aiResponse.recommendedProducts.map(normalizeProduct);
      }

      setChatbotMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: aiResponse.text || "Xin lỗi bạn, mình chưa xử lý được câu trả lời này.",
          products: normalizedProds
        }
      ]);
    } catch (error) {
      console.error("Lỗi khi kết nối với AI Gemini:", error);
      // Fallback: nếu lỗi, trả về tin nhắn tự động offline
      setChatbotMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "Hệ thống AI Gemini đang bận phản hồi hoặc chưa cấu hình API Key. Mình xin phép tư vấn tự động: Jusstlife hỗ trợ đổi trả 7 ngày, miễn ship từ 500k và giao hàng toàn quốc từ 2-4 ngày nhé ạ!",
          products: []
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatbotInput.trim()) return;

    const userText = chatbotInput.trim();
    setChatbotMessages(prev => [
      ...prev,
      { sender: 'user', text: userText, products: [] }
    ]);
    setChatbotInput('');

    if (!isAiMode) {
      // Offline local mode (simple keyword matches)
      setIsTyping(true);
      setTimeout(() => {
        let botResponse = "Cảm ơn bạn đã nhắn tin. Yêu cầu của bạn đã được chuyển cho tư vấn viên trực tuyến, chúng tôi sẽ phản hồi trong giây lát!";
        const lowerText = userText.toLowerCase();
        
        if (lowerText.includes('đổi trả') || lowerText.includes('hoàn tiền') || lowerText.includes('trả hàng')) {
          botResponse = "Jusstlife hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng thành công. Sản phẩm đổi trả phải còn nguyên mác tag, chưa qua sử dụng hay giặt là và không có mùi lạ. Quý khách được đổi sang size khác hoặc sản phẩm có giá trị tương đương miễn phí phí dịch vụ.";
        } else if (lowerText.includes('giao hàng') || lowerText.includes('ship') || lowerText.includes('vận chuyển') || lowerText.includes('mất bao lâu')) {
          botResponse = "Thời gian giao hàng tiêu chuẩn là 2 - 4 ngày toàn quốc. Phí ship đồng giá 30k. Miễn phí vận chuyển cho các đơn hàng từ 500k trở lên!";
        } else if (lowerText.includes('size') || lowerText.includes('kích thước') || lowerText.includes('chọn size') || lowerText.includes('cân nặng')) {
          botResponse = "Bạn có thể tham khảo bảng chọn size chi tiết theo chiều cao & cân nặng trong trang chi tiết của mỗi sản phẩm. Nếu cần hỗ trợ thêm hãy cho mình biết số đo cụ thể nhé!";
        } else if (lowerText.includes('hotline') || lowerText.includes('liên hệ') || lowerText.includes('sđt') || lowerText.includes('điện thoại')) {
          botResponse = "Số hotline chính thức chăm sóc khách hàng của Jusstlife là 1900-6789 (Hỗ trợ từ 8:00 đến 22:00 hàng ngày).";
        }
        
        setChatbotMessages(prev => [
          ...prev,
          { sender: 'bot', text: botResponse, products: [] }
        ]);
        setIsTyping(false);
      }, 600);
    } else {
      // AI Stylist mode
      await askGemini(userText);
    }
  };

  const handleAddProductToCart = (e, product) => {
    e.stopPropagation();
    if (!onAddToCart) return;
    
    // Quick add using first size and first color of normalized product
    const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One Size";
    const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : { name: "Mặc định", hex: "#ccc" };

    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity: 1
    });
  };

  const handleViewProductDetail = (e, product) => {
    e.stopPropagation();
    if (setSelectedProduct) {
      setSelectedProduct(product);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'inherit' }}>
      {/* Chat float button */}
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isAiMode ? 'linear-gradient(135deg, #7c4dff, #ff4081)' : 'var(--primary-gradient)',
          color: 'white',
          border: 'none',
          boxShadow: isAiMode ? '0 4px 20px rgba(124,77,255,0.4)' : '0 4px 20px rgba(255,87,34,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        {isChatbotOpen ? <X size={24} /> : (
          isAiMode ? <Sparkles size={24} className="animate-pulse" /> : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )
        )}
      </button>

      {/* Chat Window Box */}
      {isChatbotOpen && (
        <div
          className="animate-fade"
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            width: '380px',
            height: '520px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ 
            background: isAiMode 
              ? 'linear-gradient(135deg, #6200ea, #e040fb)' 
              : 'var(--primary-gradient)', 
            color: 'white', 
            padding: '16px 20px', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isAiMode ? <Sparkles size={18} style={{ color: '#ffd54f' }} /> : <Bot size={18} />}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                    {isAiMode ? 'Jusstlife AI Stylist' : 'Jusstlife Assistant'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></div>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>AI đang hoạt động 24/7</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsChatbotOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', opacity: 0.8, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Toggle */}
            <div style={{ 
              display: 'flex', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '8px', 
              padding: '2px', 
              fontSize: '11px', 
              fontWeight: 600,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <button 
                onClick={() => setIsAiMode(true)}
                style={{ 
                  flex: 1, 
                  background: isAiMode ? 'white' : 'transparent', 
                  color: isAiMode ? '#6200ea' : 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  padding: '6px 0', 
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} /> AI Gemini Stylist
              </button>
              <button 
                onClick={() => setIsAiMode(false)}
                style={{ 
                  flex: 1, 
                  background: !isAiMode ? 'white' : 'transparent', 
                  color: !isAiMode ? 'var(--primary)' : 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  padding: '6px 0', 
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Bot size={12} /> Hỏi đáp nhanh (Offline)
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fcfcfc' }}>
            {chatbotMessages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div
                    style={{
                      background: isBot ? 'white' : (isAiMode ? 'linear-gradient(135deg, #7c4dff, #6200ea)' : 'var(--primary)'),
                      color: isBot ? 'var(--secondary)' : 'white',
                      padding: '10px 14px',
                      borderRadius: isBot ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      boxShadow: isBot ? '0 2px 6px rgba(0,0,0,0.04)' : '0 2px 6px rgba(98,0,234,0.15)',
                      border: isBot ? '1px solid #edeef0' : 'none',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}

                    {/* Display Recommended Products inside Chat bubble if available */}
                    {isBot && msg.products && msg.products.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px', marginBottom: '2px' }}>
                          <Sparkles size={11} style={{ color: '#7c4dff' }} />
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#7c4dff' }}>Sản phẩm gợi ý cho bạn:</span>
                        </div>
                        {msg.products.map((prod) => (
                          <div 
                            key={prod.id} 
                            className="chatbot-product-card" 
                            onClick={(e) => handleViewProductDetail(e, prod)}
                            style={{ 
                              display: 'flex', 
                              gap: '10px', 
                              background: '#fafafa', 
                              border: '1px solid #eef0f2', 
                              borderRadius: '8px', 
                              padding: '8px', 
                              cursor: 'pointer'
                            }}
                          >
                            <img 
                              src={prod.imageUrl ? (prod.imageUrl.startsWith('http') ? prod.imageUrl : `http://localhost:8080${prod.imageUrl}`) : 'https://via.placeholder.com/60'} 
                              style={{ width: '54px', height: '54px', borderRadius: '6px', objectFit: 'cover' }} 
                              alt={prod.name} 
                            />
                            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <h5 style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, color: 'var(--secondary)', lineHeight: 1.3 }}>
                                  {prod.name}
                                </h5>
                                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                                  {Number(prod.price).toLocaleString()} VND
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                                <button 
                                  onClick={(e) => handleViewProductDetail(e, prod)} 
                                  style={{ 
                                    flexGrow: 1, 
                                    fontSize: '9.5px', 
                                    background: '#e0e0e0', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    padding: '3px 0', 
                                    cursor: 'pointer', 
                                    fontWeight: 700,
                                    color: 'var(--secondary)'
                                  }}
                                >
                                  Xem
                                </button>
                                <button 
                                  onClick={(e) => handleAddProductToCart(e, prod)} 
                                  style={{ 
                                    fontSize: '9.5px', 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    padding: '3px 8px', 
                                    cursor: 'pointer', 
                                    fontWeight: 700, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '2px' 
                                  }}
                                >
                                  <ShoppingBag size={10} /> +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing indicator bubble */}
            {isTyping && (
              <div 
                style={{ 
                  alignSelf: 'flex-start', 
                  background: 'white', 
                  border: '1px solid #edeef0', 
                  borderRadius: '12px 12px 12px 2px', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  gap: '4px', 
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <span className="ai-typing-dot"></span>
                <span className="ai-typing-dot"></span>
                <span className="ai-typing-dot"></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ chips */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 15px', background: '#fff', borderTop: '1px solid #f5f5f5', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              {
                label: "🔄 Đổi trả hàng",
                q: "Chính sách đổi trả sản phẩm thế nào?",
                a: "Jusstlife hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng thành công. Sản phẩm đổi trả phải còn nguyên mác tag, chưa qua sử dụng hay giặt là và không có mùi lạ."
              },
              {
                label: "🚚 Giao hàng & Ship",
                q: "Thời gian giao hàng bao lâu? Phí ship thế nào?",
                a: "Giao hàng tiêu chuẩn mất từ 2-4 ngày. Đồng giá ship 30k toàn quốc và Freeship cho đơn hàng từ 500k trở lên."
              },
              {
                label: "📐 Bảng chọn size",
                q: "Làm sao chọn được size phù hợp?",
                a: "Xem bảng quy chuẩn size theo chiều cao & cân nặng trong mô tả sản phẩm. Hoặc liên hệ tư vấn viên để chọn được size chính xác nhất."
              },
              {
                label: "📞 Hotline hỗ trợ",
                q: "Số hotline hỗ trợ là gì?",
                a: "Hotline chăm sóc khách hàng khẩn cấp 1900-6789 (Hỗ trợ từ 8:00 - 22:00 hàng ngày)."
              }
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChatOptionClick(item.q, item.a)}
                style={{
                  fontSize: '10.5px',
                  background: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '999px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  color: 'var(--secondary)',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e0e0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChatMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-light)', padding: '10px 15px', background: 'white', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={isAiMode ? "Hãy hỏi AI Stylist về cách phối đồ..." : "Nhập câu hỏi của bạn..."}
              value={chatbotInput}
              onChange={(e) => setChatbotInput(e.target.value)}
              disabled={isTyping}
              style={{
                flexGrow: 1,
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                padding: '8px 5px',
                background: 'transparent'
              }}
            />
            <button
              type="submit"
              disabled={isTyping || !chatbotInput.trim()}
              style={{
                background: 'transparent',
                border: 'none',
                color: isAiMode ? '#6200ea' : 'var(--primary)',
                cursor: 'pointer',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (!chatbotInput.trim() || isTyping) ? 0.4 : 1
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
