import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, CreditCard, X } from 'lucide-react';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  allProducts,
  showAlert
}) {
  const { 
    name, 
    price, 
    originalPrice, 
    images, 
    description, 
    rating, 
    reviewsCount, 
    soldCount, 
    sizes, 
    colors, 
    category,
    inventory 
  } = product;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Reset states when the selected product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    
    if (sizes && sizes.length > 0) {
      setSelectedSize(sizes[0]);
    } else {
      setSelectedSize("One Size");
    }
    
    if (colors && colors.length > 0) {
      setSelectedColor(colors[0]);
    } else {
      setSelectedColor({ name: "Mặc định", hex: "#ccc" });
    }

    // Lọc sản phẩm liên quan (cùng danh mục, không trùng sản phẩm hiện tại, lấy tối đa 4 sản phẩm)
    if (allProducts && category) {
      const filtered = allProducts
        .filter(p => p.category === category && p.id !== product.id && p.status === 'approved')
        .slice(0, 4);
      setRelatedProducts(filtered);
    }
  }, [product, allProducts, category, sizes, colors]);

  const formatPrice = (val) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    if (quantity < inventory) {
      setQuantity(quantity + 1);
    } else {
      if (showAlert) {
        showAlert('KHO HÀNG', `Chỉ còn ${inventory} sản phẩm Jusstlife này trong kho!`, 'warning');
      } else {
        alert(`Chỉ còn ${inventory} sản phẩm trong kho!`);
      }
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
  };

  const handleBuyNowClick = () => {
    onBuyNow({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
  };

  const discountPercent = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-detail-modal animate-pop" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="detail-modal-layout">
          {/* LEFT: GALLERY IMAGES */}
          <div className="detail-gallery">
            <img 
              src={images && images[activeImageIdx] ? images[activeImageIdx] : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"} 
              alt={name} 
              className="detail-main-img" 
            />
            
            {images && images.length > 1 && (
              <div className="detail-thumbnails">
                {images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`${name} thumbnail ${idx}`} 
                    className={`detail-thumb ${idx === activeImageIdx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO CONTENT */}
          <div className="detail-info">
            <h2 className="detail-title">{name}</h2>
            
            {/* Rating Meta */}
            <div className="detail-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 600 }}>
                <Star size={16} fill="currentColor" />
                <span>{rating ? rating.toFixed(1) : "5.0"}</span>
              </div>
              <span style={{ color: 'var(--secondary-muted)' }}>{reviewsCount || 0} Đánh giá</span>
              <span style={{ color: '#ddd' }}>|</span>
              <span className="detail-sold">Đã bán {soldCount || 0} sản phẩm</span>
            </div>

            {/* Price Box */}
            <div className="detail-price-box">
              {discountPercent > 0 && (
                <span className="detail-price-old">{formatPrice(originalPrice)}</span>
              )}
              <span className="detail-price-current">{formatPrice(price)}</span>
              {discountPercent > 0 && (
                <span style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '3px',
                  marginLeft: '8px'
                }}>
                  GIẢM {discountPercent}%
                </span>
              )}
            </div>

            {/* COLOR SELECTOR */}
            {colors && colors.length > 0 && (
              <div className="detail-option-group">
                <div className="detail-option-label">
                  <span>Màu sắc: <strong>{selectedColor ? selectedColor.name : ""}</strong></span>
                </div>
                <div className="detail-option-selection">
                  {colors.map((c, idx) => (
                    <button
                      key={idx}
                      className={`color-checkbox-btn ${selectedColor && selectedColor.name === c.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}
                      style={{ borderLeft: `5px solid ${c.hex}` }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {sizes && sizes.length > 0 && (
              <div className="detail-option-group">
                <div className="detail-option-label">
                  <span>Kích thước: <strong>{selectedSize}</strong></span>
                </div>
                <div className="detail-option-selection">
                  {sizes.map((s, idx) => (
                    <button
                      key={idx}
                      className={`size-box-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                      style={{ minWidth: '46px' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="detail-option-group">
              <div className="detail-option-label">
                <span>Số lượng: <span style={{ color: 'var(--secondary-muted)', fontWeight: 'normal' }}>(Còn {inventory} sản phẩm có sẵn)</span></span>
              </div>
              <div className="qty-selector">
                <button className="qty-btn" onClick={handleDecreaseQty}>-</button>
                <div className="qty-value">{quantity}</div>
                <button className="qty-btn" onClick={handleIncreaseQty}>+</button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="detail-actions">
              <button className="btn-secondary-outline" onClick={handleAddToCartClick}>
                <ShoppingCart size={18} />
                <span>Thêm Vào Giỏ</span>
              </button>
              <button className="btn-primary-filled" onClick={handleBuyNowClick}>
                <CreditCard size={18} />
                <span>Mua Ngay</span>
              </button>
            </div>

            {/* Description */}
            <div className="detail-desc">
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--secondary)' }}>MÔ TẢ SẢN PHẨM:</h4>
              <p style={{ lineHeight: '1.6', fontSize: '13.5px' }}>{description}</p>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="modal-related-section">
            <h3 className="modal-related-title">Sản Phẩm Liên Quan</h3>
            <div className="modal-related-grid">
              {relatedProducts.map((relProd) => {
                const relDiscount = relProd.originalPrice > relProd.price 
                  ? Math.round(((relProd.originalPrice - relProd.price) / relProd.originalPrice) * 100) 
                  : 0;

                return (
                  <div 
                    key={relProd.id} 
                    style={{ 
                      border: '1px solid var(--border-light)', 
                      borderRadius: 'var(--radius-md)', 
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#fff',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      // Switch to this product details in the modal
                      // Wait! It triggers state update in parent. Perfect!
                      onAddToCart(null); // trigger dummy to reset details
                      setTimeout(() => {
                        // Trick parent to load this product details!
                        // In App.js we will handle detail modal selection
                        // To achieve this cleanly, we can trigger select product
                        onBuyNow({ type: "SELECT_RELATED", product: relProd });
                      }, 50);
                    }}
                    className="service-card" // reuse card scale style
                  >
                    <img 
                      src={relProd.images[0]} 
                      alt={relProd.name} 
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '10px' }}>
                      <h4 style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        height: '34px', 
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        marginBottom: '6px'
                      }}>
                        {relProd.name}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>
                          {formatPrice(relProd.price)}
                        </span>
                        {relDiscount > 0 && (
                          <span style={{ fontSize: '9px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, padding: '1px 4px', borderRadius: '2px' }}>
                            -{relDiscount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
