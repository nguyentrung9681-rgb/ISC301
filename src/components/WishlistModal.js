import React from 'react';
import { Heart, X, ShoppingCart, Trash2, Eye } from 'lucide-react';

export default function WishlistModal({ 
  isOpen, 
  onClose, 
  wishlist, 
  onRemoveFromWishlist, 
  onAddToCart, 
  onSelectProduct 
}) {
  if (!isOpen) return null;

  const formatPrice = (val) => {
    return val.toLocaleString('vi-VN') + '\u00a0₫';
  };

  const handleQuickAddToCart = (e, item) => {
    e.stopPropagation();
    // Default to first size and color
    const selectedSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : "One Size";
    const selectedColor = item.colors && item.colors.length > 0 ? item.colors[0] : { name: "Mặc định", hex: "#ccc" };
    
    onAddToCart({
      ...item,
      selectedSize,
      selectedColor,
      quantity: 1
    });
  };

  return (
    <div 
      className="modal-overlay animate-fade" 
      onClick={onClose} 
      style={{ zIndex: 9999, justifyContent: 'flex-end', padding: 0 }}
    >
      <div 
        className="wishlist-drawer animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%',
          maxWidth: '450px', 
          height: '100vh',
          background: 'white',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Drawer Header */}
        <div style={{ 
          padding: '24px 30px', 
          borderBottom: '1px solid var(--border-light)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={22} fill="var(--primary)" color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>
              DANH SÁCH YÊU THÍCH
            </h3>
            <span style={{ 
              fontSize: '11px', 
              background: 'var(--bg-main)', 
              color: 'var(--secondary)', 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}>
              {wishlist.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--secondary-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items Content */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '30px' }}>
          {wishlist.length === 0 ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--secondary-muted)'
            }}>
              <div className="heart-pulse-icon" style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%', 
                background: '#ffebee', 
                color: '#c62828', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Heart size={32} fill="#c62828" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '8px' }}>
                Danh sách yêu thích trống!
              </h4>
              <p style={{ fontSize: '13px', maxWidth: '280px', lineHeight: '1.6', margin: 0 }}>
                Nhấn vào nút hình trái tim ở các sản phẩm Jusstlife ngoài trang chủ để lưu lại các thiết kế bạn ưng ý nhé.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {wishlist.map((item) => (
                <div 
                  key={item.id} 
                  className="wishlist-item-card"
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'center', 
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  {/* Product Thumbnail Image */}
                  <img 
                    src={item.images[0]} 
                    alt={item.name} 
                    style={{ 
                      width: '64px', 
                      height: '80px', 
                      objectFit: 'cover', 
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-main)'
                    }} 
                  />

                  {/* Product Basic Info */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: 'var(--primary)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px' 
                    }}>
                      {item.categoryLabel}
                    </div>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      margin: '4px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      color: 'var(--secondary)'
                    }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--secondary)' }}>
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Quick view */}
                    <button 
                      onClick={() => onSelectProduct(item)}
                      title="Xem Chi Tiết"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'var(--bg-main)', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--secondary-muted)',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e0e0'; e.currentTarget.style.color = 'var(--secondary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--secondary-muted)'; }}
                    >
                      <Eye size={14} />
                    </button>

                    {/* Quick Add To Cart */}
                    <button 
                      onClick={(e) => handleQuickAddToCart(e, item)}
                      title="Thêm nhanh vào giỏ"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'var(--primary-gradient)', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        transition: 'var(--transition)',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <ShoppingCart size={13} />
                    </button>

                    {/* Remove */}
                    <button 
                      onClick={() => onRemoveFromWishlist(item)}
                      title="Xóa khỏi yêu thích"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: '#ffebee', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c62828',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#ffcdd2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffebee'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
