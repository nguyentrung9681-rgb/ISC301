import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onAddToCart, showAlert, isWishlisted, onToggleWishlist }) {
  const { 
    name, 
    price, 
    originalPrice, 
    images, 
    categoryLabel, 
    rating, 
    soldCount, 
    sizes, 
    colors, 
    isNew 
  } = product;

  // Tính phần trăm giảm giá
  const discountPercent = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const formatPrice = (val) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    // Mặc định chọn size đầu tiên và màu đầu tiên khi add nhanh vào giỏ
    const selectedSize = sizes && sizes.length > 0 ? sizes[0] : "One Size";
    const selectedColor = colors && colors.length > 0 ? colors[0] : { name: "Mặc định", hex: "#ccc" };
    
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity: 1
    });
  };

  return (
    <div 
      className="product-card animate-fade"
      onClick={() => onSelectProduct(product)}
      style={{ cursor: 'pointer' }}
    >
      {/* BADGES */}
      {discountPercent > 0 && (
        <span className="product-badge-sale">-{discountPercent}%</span>
      )}
      {isNew && discountPercent === 0 && (
        <span className="product-badge-new">NEW</span>
      )}

      {/* LIKE ACTION */}
      <button 
        className="product-fav-btn" 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (onToggleWishlist) {
            onToggleWishlist(product);
          }
        }}
        style={{ color: isWishlisted ? '#e63946' : 'var(--secondary)' }}
      >
        <Heart size={16} fill={isWishlisted ? '#e63946' : 'none'} stroke={isWishlisted ? '#e63946' : 'currentColor'} />
      </button>

      {/* PRODUCT IMAGE */}
      <div className="product-image-container">
        <img 
          src={images && images[0] ? images[0] : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"} 
          alt={name} 
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600";
          }}
        />
      </div>

      {/* PRODUCT INFO */}
      <div className="product-info-box">
        <span className="product-cat">{categoryLabel || "Thời trang"}</span>
        <h3 className="product-name">{name}</h3>

        {/* Rating and Sold */}
        <div className="product-rating">
          <Star size={12} fill="currentColor" />
          <span>{rating ? rating.toFixed(1) : "5.0"}</span>
          <span className="product-rating-count">({product.reviewsCount || 0})</span>
          <span style={{ color: '#ccc', margin: '0 6px' }}>|</span>
          <span style={{ color: 'var(--secondary-muted)' }}>Đã bán {soldCount || 0}</span>
        </div>

        {/* Display Sizes and Colors Options (Micro info) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          {/* Sizes */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {sizes && sizes.slice(0, 3).map((s, idx) => (
              <span 
                key={idx} 
                style={{ 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  background: '#f1f0ee', 
                  padding: '2px 6px', 
                  borderRadius: '3px',
                  color: 'var(--secondary-muted)'
                }}
              >
                {s}
              </span>
            ))}
            {sizes && sizes.length > 3 && <span style={{ fontSize: '10px', color: '#999' }}>+</span>}
          </div>

          {/* Colors */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {colors && colors.slice(0, 4).map((c, idx) => (
              <span 
                key={idx}
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: c.hex,
                  border: '1px solid rgba(0,0,0,0.15)'
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* PRICE ROW */}
        <div className="product-price-row">
          <div className="prices-box">
            {discountPercent > 0 && (
              <span className="price-old">{formatPrice(originalPrice)}</span>
            )}
            <span className="price-current">{formatPrice(price)}</span>
          </div>
          <button 
            className="product-add-cart-btn"
            onClick={handleCartClick}
            title="Thêm nhanh vào giỏ hàng"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
