import React from 'react';
import { ShoppingBag, Search, ShieldCheck, LogOut, User, Sparkles, Heart } from 'lucide-react';

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  searchQuery, 
  setSearchQuery, 
  cartItemsCount, 
  isAdminMode, 
  setIsAdminMode,
  currentUser,
  onOpenLoginModal,
  onLogout,
  wishlistCount,
  onOpenWishlist
}) {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Nếu đang không ở trang shop, tự động chuyển sang trang shop để lọc kết quả
    if (currentPage !== 'shop' && currentPage !== 'admin') {
      setCurrentPage('shop');
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsAdminMode(false);
    setCurrentPage('home');
  };

  const isManager = currentUser && (currentUser.role === 'manager');

  return (
    <header className="app-header">
      <div className="container navbar-container">
        {/* LOGO */}
        <a href="#home" className="logo-link" onClick={handleLogoClick}>
          <Sparkles size={24} className="logo-accent" />
          <span>JUSST<span style={{ color: 'var(--primary)' }}>LIFE</span></span>
          <span className="logo-dot"></span>
        </a>

        {/* MENU LINKS */}
        <nav className="nav-links">
          <a 
            href="#home" 
            className={`nav-item ${currentPage === 'home' && !isAdminMode ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('home'); }}
          >
            Trang Chủ
          </a>
          <a 
            href="#shop" 
            className={`nav-item ${currentPage === 'shop' && !isAdminMode ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('shop'); }}
          >
            Sản Phẩm
          </a>
          <a 
            href="#about" 
            className={`nav-item ${currentPage === 'about' && !isAdminMode ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('about'); }}
          >
            Giới Thiệu
          </a>
          <a 
            href="#tracking" 
            className={`nav-item ${currentPage === 'order-tracking' && !isAdminMode ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('order-tracking'); }}
          >
            Theo Dõi Đơn
          </a>
        </nav>

        {/* SEARCH BAR (hidden in admin mode) */}
        {!isAdminMode ? (
          <div className="nav-search-bar">
            <Search size={16} className="nav-search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm quần áo Jusstlife..." 
              className="nav-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        ) : (
          <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--secondary-muted)', fontWeight: 500 }}>
            Hệ thống quản trị sản phẩm Jusstlife
          </div>
        )}

        {/* ACTIONS */}
        <div className="nav-actions">
          {/* Heart/Wishlist Icon (Only in Customer Mode / Non-admin mode) */}
          {!isAdminMode && (
            <button 
              className="cart-icon-btn" 
              onClick={onOpenWishlist}
              title="Xem Danh Sách Yêu Thích"
              style={{ marginRight: '8px' }}
            >
              <Heart size={20} style={{ 
                color: wishlistCount > 0 ? '#e63946' : 'inherit', 
                fill: wishlistCount > 0 ? '#e63946' : 'none' 
              }} />
              {wishlistCount > 0 && (
                <span className="cart-badge animate-pop" style={{ background: '#e63946' }}>{wishlistCount}</span>
              )}
            </button>
          )}

          {/* Cart Icon (Only in Customer Mode) */}
          {!isAdminMode && (
            <button 
              className="cart-icon-btn" 
              onClick={() => setCurrentPage('cart')}
              title="Xem Giỏ Hàng"
            >
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="cart-badge animate-pop">{cartItemsCount}</span>
              )}
            </button>
          )}

          {/* GREETING & ROLE INFO / LOGIN BUTTON */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              
              {/* User Avatar Circle */}
              <div 
                onClick={() => {
                  setIsAdminMode(false);
                  setCurrentPage('profile');
                }}
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-main)', 
                  border: '2px solid var(--primary)', 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Quản Lý Profile Cá Nhân"
              >
                <img 
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
                  alt="User Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
                  }}
                />
              </div>

              {/* Lời chào */}
              <div 
                onClick={() => {
                  setIsAdminMode(false);
                  setCurrentPage('profile');
                }}
                style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', cursor: 'pointer' }}
                title="Quản Lý Profile Cá Nhân"
              >
                <span style={{ fontSize: '13px', fontWeight: 700 }} className="nav-profile-name">Hi, {currentUser.name}!</span>
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: 700, 
                  color: currentUser.role === 'manager' ? '#2e7d32' : 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {currentUser.role === 'manager' ? 'Quản Lý' : 'Khách Hàng'}
                </span>
              </div>

              {/* Cổng Admin button (Chỉ hiển thị cho Manager) */}
              {isManager && (
                <button 
                  className={`portal-switch-btn ${isAdminMode ? 'admin-mode' : ''}`} 
                  onClick={() => {
                    const nextMode = !isAdminMode;
                    setIsAdminMode(nextMode);
                    setCurrentPage(nextMode ? 'admin' : 'home');
                  }}
                  title={isAdminMode ? "Về giao diện mua sắm" : "Vào quản lý bán hàng"}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <ShieldCheck size={15} />
                  <span>{isAdminMode ? "Mua Sắm" : "Cổng Admin"}</span>
                </button>
              )}

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                style={{ color: 'var(--secondary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'var(--transition)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#c62828'; e.currentTarget.style.background = '#ffebee'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--secondary-muted)'; e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                title="Đăng Xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="portal-switch-btn" 
              onClick={onOpenLoginModal}
              style={{ background: 'var(--primary-gradient)', padding: '10px 20px', fontSize: '13px' }}
            >
              <User size={15} />
              <span>Đăng Nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
