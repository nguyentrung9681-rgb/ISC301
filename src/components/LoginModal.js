import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Phone, Sparkles, ArrowRight, Key } from "lucide-react";
import { api } from "../api";

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onGoogleLogin,
}) {
  const [viewMode, setViewMode] = useState('login'); // 'login', 'register', 'reset'

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [resetData, setResetData] = useState({
    token: "",
    newPassword: "",
  });

  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setScriptLoaded(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (scriptLoaded && isOpen && window.google) {
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "707328905391-762h5r5jcr3m35gq09o8cagom29bpgsq.apps.googleusercontent.com";
      
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (onGoogleLogin) {
            onGoogleLogin({ idToken: response.credential });
          }
        },
      });

      const btnContainer = document.getElementById("google-signin-btn");
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          width: 360,
          shape: "rectangular",
          text: "signin_with",
        });
      }
    }
  }, [scriptLoaded, isOpen, viewMode, onGoogleLogin]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await onLogin(loginData.email, loginData.password);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }
    const phoneClean = registerData.phone.trim();
    if (phoneClean.length !== 10) {
      alert("Số điện thoại phải có đúng 10 chữ số!");
      return;
    }
    if (!phoneClean.startsWith('0')) {
      alert("Số điện thoại phải bắt đầu bằng số 0!");
      return;
    }
    await onRegister(registerData);
  };
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.resetPassword(resetData);
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      setViewMode('login');
      setResetData({ token: "", newPassword: "" });
    } catch (err) {
      alert(err.message || "Đặt lại mật khẩu thất bại");
    }
  };

  const inputGroupStyle = {
    position: 'relative',
    marginBottom: '16px'
  };

  const iconStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--secondary-muted)',
    pointerEvents: 'none'
  };

  const renderBannerText = () => {
    if (viewMode === 'register') return "Đăng ký thành viên mới";
    if (viewMode === 'reset') return "Khôi phục tài khoản";
    return "Chào mừng trở lại! Đăng nhập để tiếp tục.";
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)', zIndex: 1000 }}>
      <style>{`
        .modal-input-premium {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid transparent;
          border-radius: 12px;
          font-size: 14px;
          color: var(--secondary);
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .modal-input-premium::placeholder {
          color: #a0aec0;
          opacity: 1;
        }
        .modal-input-premium:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-light);
          outline: none;
        }
        .btn-premium-login {
          width: 100%;
          padding: 14px;
          background: var(--secondary);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }
        .btn-premium-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.15);
          background: #000;
        }
        .btn-premium-register {
          width: 100%;
          padding: 14px;
          background: var(--primary-gradient);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: none;
          margin-top: 10px;
          transition: all 0.3s ease;
        }
        .btn-premium-register:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(255,87,34,0.3);
        }
      `}</style>
      
      <div className="login-modal animate-pop" style={{ padding: 0, width: '440px', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#ffffff' }}>
        
        {/* Banner */}
        <div style={{ background: 'var(--primary-gradient)', padding: '30px 40px', position: 'relative', color: 'white', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={18} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={24} />
            <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.5px', color: 'white', fontFamily: 'var(--font-title)' }}>JUSSTLIFE</h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            {renderBannerText()}
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '40px' }}>
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={inputGroupStyle}>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email"
                  placeholder="Địa chỉ Email"
                  className="modal-input-premium"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="modal-input-premium"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <span 
                  style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setViewMode('reset')}
                >
                  Quên mật khẩu?
                </span>
              </div>

              <button type="submit" className="btn-premium-login">
                Đăng nhập <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--secondary-muted)' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                <span style={{ padding: '0 10px', fontSize: '12px' }}>HOẶC</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
              </div>

              <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}></div>
              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--secondary-muted)' }}>
                Chưa có tài khoản?{" "}
                <span
                  style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setViewMode('register')}
                >
                  Đăng ký ngay
                </span>
              </div>
            </form>
          )}

          {viewMode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div style={inputGroupStyle}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="modal-input-premium"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email"
                  placeholder="Địa chỉ Email"
                  className="modal-input-premium"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <Phone size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="Số điện thoại (10 chữ số)"
                  className="modal-input-premium"
                  value={registerData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setRegisterData({ ...registerData, phone: val });
                    }
                  }}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="modal-input-premium"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="modal-input-premium"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-premium-register">
                Tạo tài khoản <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--secondary-muted)' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                <span style={{ padding: '0 10px', fontSize: '12px' }}>HOẶC</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
              </div>

              <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}></div>
              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--secondary-muted)' }}>
                Đã có tài khoản?{" "}
                <span
                  style={{ color: 'var(--secondary)', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setViewMode('login')}
                >
                  Đăng nhập
                </span>
              </div>
            </form>
          )}

          {viewMode === 'reset' && (
            <form onSubmit={handleResetSubmit}>
              <div style={inputGroupStyle}>
                <Key size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="Mã xác nhận (Token)"
                  className="modal-input-premium"
                  value={resetData.token}
                  onChange={(e) => setResetData({ ...resetData, token: e.target.value })}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  className="modal-input-premium"
                  value={resetData.newPassword}
                  onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-premium-login" style={{ marginTop: '24px' }}>
                Xác nhận đổi mật khẩu <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--secondary-muted)' }}>
                <span
                  style={{ color: 'var(--secondary)', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setViewMode('login')}
                >
                  Quay lại đăng nhập
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}