import React, { useState, useEffect } from 'react';
import { Flame, Clock, ShoppingCart } from 'lucide-react';

export default function FlashSale({ products, onSelectProduct, onAddToCart }) {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

  // 1. Countdown timer to end of day (23:59:59)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay.getTime() - now.getTime();

      if (difference <= 0) {
        return { hours: '00', minutes: '00', seconds: '00' };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      };
    };

    // Set initial
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Filter sale products. If none have discounts, generate some fake ones for demo
  const saleProducts = products
    .map(p => {
      const hasDiscount = p.originalPrice && p.originalPrice > p.price;
      // If it doesn't have a discount, let's pretend it's 30% off for the flash sale section
      if (!hasDiscount) {
        return {
          ...p,
          originalPrice: Math.round(p.price * 1.4 / 1000) * 1000, // 40% markup, rounded to 1k
          discountPercent: 30,
          soldProgress: Math.min(95, Math.max(10, (p.id * 17) % 90)) // deterministic mock sold percentage
        };
      }
      return {
        ...p,
        discountPercent: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100),
        soldProgress: Math.min(95, Math.max(10, (p.id * 23) % 90))
      };
    })
    .slice(0, 4);

  if (saleProducts.length === 0) return null;

  return (
    <section className="container" style={{ margin: '40px auto 60px auto' }}>
      <div 
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #1e1e1e 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 30px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(255, 87, 34, 0.2)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow decoration */}
        <div 
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 87, 34, 0.15) 0%, rgba(255, 87, 34, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Header containing Flash Sale title and Ticking clock */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '20px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                background: 'var(--primary-gradient)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
                animation: 'pulse 2s infinite'
              }}
            >
              <Flame size={20} fill="white" />
            </div>
            <div>
              <h2 
                style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: 800, 
                  letterSpacing: '1px', 
                  fontFamily: 'var(--font-title)',
                  color: 'white',
                  textShadow: '0 2px 10px rgba(255,87,34,0.3)'
                }}
              >
                FLASH SALE CHỚP NHOÁNG
              </h2>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                Deal hot mỗi ngày - Số lượng giới hạn
              </span>
            </div>
          </div>

          {/* Countdown timer blocks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} style={{ color: 'var(--primary)' }} />
              KẾT THÚC TRONG
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div 
                style={{
                  background: 'var(--primary-gradient)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '15px',
                  minWidth: '36px',
                  textAlign: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
              >
                {timeLeft.hours}
              </div>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>:</span>
              <div 
                style={{
                  background: 'var(--primary-gradient)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '15px',
                  minWidth: '36px',
                  textAlign: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
              >
                {timeLeft.minutes}
              </div>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>:</span>
              <div 
                style={{
                  background: 'var(--primary-gradient)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '15px',
                  minWidth: '36px',
                  textAlign: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
              >
                {timeLeft.seconds}
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Flash Sale products */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {saleProducts.map((prod) => {
            const displayOriginal = prod.originalPrice || Math.round(prod.price * 1.4);
            const percent = prod.discountPercent || 30;

            const handleAddToCartClick = (e) => {
              e.stopPropagation();
              const selectedSize = prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : "M";
              const selectedColor = prod.colors && prod.colors.length > 0 ? prod.colors[0] : { name: "Mặc định", hex: "#ccc" };
              onAddToCart({
                ...prod,
                selectedSize,
                selectedColor,
                quantity: 1
              });
            };

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                style={{
                  background: '#222222',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 87, 34, 0.4)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Sale tag badge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 800,
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  GIẢM {percent}%
                </div>

                {/* Product Image */}
                <div 
                  style={{
                    width: '100%',
                    height: '240px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}
                >
                  <img 
                    src={prod.images && prod.images[0] ? prod.images[0] : "https://via.placeholder.com/400x500"} 
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x500";
                    }}
                  />
                </div>

                {/* Info and Price */}
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {prod.categoryLabel || 'Thời trang'}
                  </span>
                  <h4 
                    style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {prod.name}
                  </h4>

                  {/* Prices */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                      {prod.price.toLocaleString('vi-VN')} ₫
                    </span>
                    <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>
                      {displayOriginal.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  {/* Fire Progress Bar */}
                  <div style={{ marginTop: '8px' }}>
                    <div 
                      style={{ 
                        height: '14px', 
                        width: '100%', 
                        background: '#333333', 
                        borderRadius: '10px', 
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div 
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${prod.soldProgress}%`,
                          background: 'linear-gradient(90deg, #ff9800 0%, #ff5722 100%)',
                          borderRadius: '10px',
                          transition: 'width 0.5s ease-in-out'
                        }}
                      />
                      <span 
                        style={{ 
                          position: 'relative', 
                          fontSize: '9px', 
                          color: '#ffffff', 
                          fontWeight: 700, 
                          zIndex: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        🔥 ĐÃ BÁN {prod.soldProgress}%
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={handleAddToCartClick}
                      style={{
                        flexGrow: 1,
                        background: 'transparent',
                        border: '1px solid rgba(255,87,34,0.4)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--primary-gradient)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255,87,34,0.4)';
                      }}
                    >
                      <ShoppingCart size={14} />
                      Thêm giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
