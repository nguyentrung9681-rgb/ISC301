import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, CreditCard, X } from 'lucide-react';
import { api } from '../api';

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

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProductReviews = async () => {
    if (!product || !product.id) return;
    try {
      const res = await api.getReviewsByProduct(product.id);
      setReviews(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Lỗi lấy đánh giá sản phẩm:", err);
    }
  };

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

    loadProductReviews();
    if (product && product.id) {
      api.trackFunnel('VIEW_PRODUCT', product.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, allProducts, category, sizes, colors]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      if (showAlert) showAlert('ĐÁNH GIÁ', 'Vui lòng nhập nội dung đánh giá!', 'warning');
      else alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await api.addReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim()
      });
      if (showAlert) showAlert('THÀNH CÔNG', 'Gửi đánh giá sản phẩm thành công!', 'success');
      else alert('Gửi đánh giá sản phẩm thành công!');
      setNewComment("");
      loadProductReviews();
    } catch (err) {
      if (showAlert) showAlert('LỖI', err.message || 'Bạn cần đăng nhập để đánh giá sản phẩm này!', 'error');
      else alert(err.message || 'Bạn cần đăng nhập để đánh giá sản phẩm này!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayReviewsCount = reviews.length > 0 ? reviews.length : (reviewsCount || 0);
  const displayRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
    : (rating || 5.0);

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
    if (product && product.id) {
      api.trackFunnel('ADD_TO_CART', product.id);
    }
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
  };

  const handleBuyNowClick = () => {
    if (product && product.id) {
      api.trackFunnel('ADD_TO_CART', product.id);
    }
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
                <span>{displayRating ? displayRating.toFixed(1) : "5.0"}</span>
              </div>
              <span style={{ color: 'var(--secondary-muted)' }}>{displayReviewsCount} Đánh giá</span>
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

        {/* REVIEWS SECTION */}
        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-light)', paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)' }}>Ý Kiến Khách Hàng ({reviews.length})</h3>

          {/* Form để viết đánh giá mới */}
          <form onSubmit={handleSubmitReview} style={{ marginBottom: '24px', background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>Viết đánh giá của bạn:</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--secondary-muted)' }}>Đánh giá sản phẩm:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={20} 
                    onClick={() => setNewRating(star)} 
                    fill={star <= newRating ? "var(--accent)" : "none"} 
                    stroke="var(--accent)" 
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
            <textarea
              rows="3"
              placeholder="Chia sẻ nhận xét của bạn về sản phẩm này (chất liệu, kích thước, form dáng...)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: 'white' }}
              required
            />
            <button 
              type="submit" 
              disabled={isSubmittingReview}
              className="btn-primary-filled" 
              style={{ marginTop: '12px', padding: '8px 16px', fontSize: '13px', width: 'auto', borderRadius: 'var(--radius-sm)' }}
            >
              {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </form>

          {/* Danh sách các đánh giá đã có */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--secondary-muted)', fontSize: '13px', fontStyle: 'italic', margin: '10px 0' }}>Sản phẩm này chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13.5px', color: 'var(--secondary)' }}>{rev.userName || "Khách hàng"}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>{rev.reviewDate ? new Date(rev.reviewDate).toLocaleDateString('vi-VN') : ""}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--accent)', marginBottom: '8px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} stroke="currentColor" />
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--secondary)', margin: 0, lineHeight: '1.5' }}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
