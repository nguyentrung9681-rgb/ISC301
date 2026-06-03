import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export default function LoginModal({ onClose, onLogin, demoUsers }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Email và Mật khẩu!');
      return;
    }

    // Xác thực thông tin đăng nhập
    const matchedUser = demoUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      setErrorMsg('Email hoặc Mật khẩu chưa chính xác!');
    }
  };

  // Đăng nhập nhanh 1-Click
  const handleQuickLogin = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setErrorMsg('');
    
    // Tự động đăng nhập luôn sau 200ms để tăng trải nghiệm mượt mà
    setTimeout(() => {
      onLogin(user);
    }, 200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="product-detail-modal animate-pop" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', borderRadius: 'var(--radius-lg)' }}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ padding: '36px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Sparkles size={26} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>ĐĂNG NHẬP JUSSTLIFE</h2>
            <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', marginTop: '4px' }}>
              Hãy gia nhập cùng cộng đồng thời trang Jusstlife
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '13px', 
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="input-label" style={{ fontSize: '13px' }}>Địa chỉ Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="checkout-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="input-label" style={{ fontSize: '13px' }}>Mật khẩu bảo mật *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-muted)' }} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="checkout-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="checkout-action-btn"
              style={{ padding: '12px', marginTop: '6px' }}
            >
              Đăng Nhập Hệ Thống
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trải nghiệm nhanh (Demo)
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>

          {/* Quick Demo Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {demoUsers.map((user) => {
              let roleBadgeColor = '#ef6c00'; // staff
              let roleBg = '#fff3e0';
              if (user.role === 'manager') {
                roleBadgeColor = '#2e7d32'; // manager
                roleBg = '#e8f5e9';
              } else if (user.role === 'customer') {
                roleBadgeColor = 'var(--primary)'; // customer
                roleBg = 'var(--primary-light)';
              }

              return (
                <button
                  key={user.role}
                  type="button"
                  className="service-card"
                  onClick={() => handleQuickLogin(user)}
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    border: '1px solid var(--border-light)',
                    background: '#fff',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: roleBg, 
                      color: roleBadgeColor, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>Mật khẩu: {user.password}</div>
                    </div>
                  </div>

                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    color: roleBadgeColor, 
                    background: roleBg, 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {user.role === 'manager' ? 'Quản lý' : user.role === 'staff' ? 'Nhân viên' : 'Khách'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
