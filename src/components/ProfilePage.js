import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ArrowLeft } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 1, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", label: "Tinh Tế" },
  { id: 2, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", label: "Năng Động" },
  { id: 3, url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", label: "Tối Giản" },
  { id: 4, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", label: "Lịch Lãm" },
  { id: 5, url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", label: "Phá Cách" },
  { id: 6, url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", label: "Cổ Điển" }
];

export default function ProfilePage({ 
  currentUser, 
  onUpdateProfile, 
  onGoBack, 
  orders, 
  products 
}) {
  const [name, setName] = useState(currentUser.name || '');
  const email = currentUser.email || '';
  const [password, setPassword] = useState(currentUser.password || '');
  const [phone, setPhone] = useState(currentUser.phone || '0988776655');
  const [address, setAddress] = useState(currentUser.address || '12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Handle Preset Avatar Selection
  const handleSelectPreset = (url) => {
    setAvatar(url);
    setCustomAvatarUrl('');
  };

  // Handle Custom Avatar Input
  const handleCustomAvatarChange = (e) => {
    const val = e.target.value;
    setCustomAvatarUrl(val);
    if (val.trim()) {
      setAvatar(val.trim());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProfile({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      address: address.trim(),
      avatar: avatar
    });
  };

  // Role details calculations
  let roleTitle = "Khách Hàng";
  let roleColor = "var(--primary)";
  let roleBg = "rgba(224, 86, 36, 0.08)";
  let statLabel = "";
  let statValue = 0;

  if (currentUser.role === 'manager') {
    roleTitle = "Quản Lý Hệ Thống";
    roleColor = "#2e7d32";
    roleBg = "#e8f5e9";
    statLabel = "Tổng số đơn hàng chờ duyệt:";
    statValue = orders.filter(o => o.status === 'Chờ xử lý').length;
  } else if (currentUser.role === 'staff') {
    roleTitle = "Nhân Viên Cửa Hàng";
    roleColor = "#ef6c00";
    roleBg = "#fff3e0";
    statLabel = "Tổng số sản phẩm bạn đã đăng:";
    statValue = products.filter(p => p.createdBy === 'staff').length;
  } else {
    roleTitle = "Khách Hàng Thân Thiết";
    roleColor = "var(--primary)";
    roleBg = "rgba(224, 86, 36, 0.08)";
    statLabel = "Tổng số đơn đặt hàng của bạn:";
    statValue = orders.filter(o => o.customerName === currentUser.name).length;
  }

  return (
    <div className="container animate-fade" style={{ marginTop: '40px', marginBottom: '80px' }}>
      
      {/* Header Back Link */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={onGoBack}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--secondary-muted)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontWeight: 600,
            fontSize: '14px',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--secondary-muted)'}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Cổng mua sắm</span>
        </button>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {/* Profile Decorative Banner */}
        <div style={{ 
          height: '140px', 
          background: 'var(--primary-gradient)',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute', 
            bottom: '-50px', 
            left: '40px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '20px'
          }}>
            {/* Avatar circle */}
            <div style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%', 
              border: '4px solid white', 
              background: '#f5f5f5', 
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)'
            }}>
              <img 
                src={avatar} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                }}
              />
            </div>
            {/* Quick Greeting */}
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
                {name || 'Họ và tên'}
              </h2>
              <span style={{ 
                display: 'inline-block',
                fontSize: '11px', 
                fontWeight: 700, 
                color: roleColor,
                background: roleBg,
                padding: '4px 10px',
                borderRadius: '4px',
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {roleTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Form area padding */}
        <div style={{ padding: '80px 40px 40px 40px' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '50px' }}>
            
            {/* Column LEFT: Avatar selector and Stats */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)', borderBottom: '2px solid var(--bg-main)', paddingBottom: '10px' }}>
                ẢNH ĐẠI DIỆN (AVATAR)
              </h3>
              
              {/* Presets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {PRESET_AVATARS.map((p) => {
                  const isSelected = avatar === p.url;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectPreset(p.url)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        overflow: 'hidden',
                        border: isSelected ? '3px solid var(--primary)' : '2px solid var(--border-light)',
                        boxShadow: isSelected ? '0 0 10px rgba(224,86,36,0.3)' : 'none',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                      }}>
                        <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '10px', marginTop: '6px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--primary)' : 'var(--secondary-muted)' }}>
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Custom avatar input */}
              <div className="admin-form-group" style={{ marginBottom: '30px' }}>
                <label className="input-label" style={{ fontSize: '12px' }}>Nhập URL ảnh tự chọn:</label>
                <input 
                  type="text" 
                  placeholder="Dán link ảnh từ Unsplash/Facebook..." 
                  className="checkout-input"
                  style={{ fontSize: '12.5px' }}
                  value={customAvatarUrl}
                  onChange={handleCustomAvatarChange}
                />
              </div>

              {/* Role statistics */}
              <div style={{ 
                background: 'var(--bg-main)', 
                padding: '20px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-light)' 
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 BÁO CÁO THÀNH TÍCH VAI TRÒ:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--secondary-muted)' }}>{statLabel}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: roleColor }}>{statValue}</div>
                  <div style={{ fontSize: '11px', color: 'var(--secondary-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                    Cảm ơn sự đóng góp của bạn vào hành trình thương hiệu Jusstlife!
                  </div>
                </div>
              </div>
            </div>

            {/* Column RIGHT: Personal info form fields */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)', borderBottom: '2px solid var(--bg-main)', paddingBottom: '10px' }}>
                THÔNG TIN TÀI KHOẢN
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Full name */}
                <div className="admin-form-group">
                  <label className="input-label">Họ và tên hiển thị *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Nhập họ và tên đầy đủ..." 
                      className="checkout-input"
                      style={{ paddingLeft: '40px' }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                {/* Email address (readonly) */}
                <div className="admin-form-group">
                  <label className="input-label">Địa chỉ Email đăng nhập (Cố định)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                    <input 
                      type="email" 
                      className="checkout-input"
                      style={{ paddingLeft: '40px', background: 'var(--bg-main)', cursor: 'not-allowed' }}
                      value={email}
                      readOnly
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="admin-form-group">
                  <label className="input-label">Mật khẩu bảo mật tài khoản *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                    <input 
                      type="password" 
                      placeholder="Mật khẩu tài khoản..." 
                      className="checkout-input"
                      style={{ paddingLeft: '40px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone number */}
                <div className="admin-form-group">
                  <label className="input-label">Số điện thoại liên hệ</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                    <input 
                      type="tel" 
                      placeholder="Ví dụ: 0987654321..." 
                      className="checkout-input"
                      style={{ paddingLeft: '40px' }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Shipping address */}
                <div className="admin-form-group">
                  <label className="input-label">Địa chỉ giao nhận hàng mặc định</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Số 12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội..." 
                      className="checkout-input"
                      style={{ paddingLeft: '40px' }}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    className="checkout-action-btn"
                    style={{ padding: '12px 24px', flex: 1, display: 'flex', alignItems: 'center', justify: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>Lưu Thay Đổi Profile</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-admin-cancel"
                    onClick={onGoBack}
                    style={{ padding: '12px 24px', flex: 0.5 }}
                  >
                    Hủy Bỏ
                  </button>
                </div>

              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
