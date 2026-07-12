import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';
import { 
  User, Mail, Phone, MapPin, Lock, Save, ArrowLeft,
  Calendar, Truck, ShoppingBag, 
  ChevronDown, ChevronUp, CheckCircle, Clock, XCircle, 
  ExternalLink, Check
} from 'lucide-react';
import { api } from '../api';

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
  orders = [], 
  products = [],
  onCancelOrder,
  onGeneratePayOSLink
}) {
  const [name, setName] = useState(currentUser.name || '');
  const email = currentUser.email || '';
  const [password, setPassword] = useState(currentUser.password || '');
  const [phone, setPhone] = useState(currentUser.phone || '0988776655');
  const [address, setAddress] = useState(currentUser.address || '12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // States for Purchase History tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'history'
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});

  useEffect(() => {
    setHistoryPage(1);
  }, [statusFilter]);
  const [loadingPayment, setLoadingPayment] = useState({});

  // Fetch payment detail when expanding order row
  const handleToggleOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      if (!paymentDetails[orderId] && !loadingPayment[orderId]) {
        setLoadingPayment(prev => ({ ...prev, [orderId]: true }));
        try {
          const paymentData = await api.getPaymentInfo(orderId);
          setPaymentDetails(prev => ({ ...prev, [orderId]: paymentData }));
        } catch (err) {
          console.error(`Error loading payment for order #${orderId}:`, err);
        } finally {
          setLoadingPayment(prev => ({ ...prev, [orderId]: false }));
        }
      }
    }
  };

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
          
          {/* Tabs Control */}
          {currentUser.role !== 'manager' && (
            <div style={{ 
              display: 'flex', 
              borderBottom: '2px solid var(--bg-main)', 
              marginBottom: '35px',
              gap: '24px'
            }}>
              <button 
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  paddingBottom: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'profile' ? 'var(--primary)' : 'var(--secondary-muted)',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                Thông Tin Cá Nhân
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('history')}
                style={{
                  paddingBottom: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'history' ? 'var(--primary)' : 'var(--secondary-muted)',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                Lịch Sử Mua Hàng ({orders.length})
              </button>
            </div>
          )}

          {activeTab === 'profile' ? (
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
          ) : (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>
                  LỊCH SỬ ĐƠN HÀNG
                </h3>
                
                {/* Filter status pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Tất cả', 'Chờ xử lý', 'Đang giao', 'Đã giao', 'Hủy đơn'].map((status) => {
                    const isActive = statusFilter === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                          background: isActive ? 'var(--primary-gradient)' : '#fff',
                          color: isActive ? '#fff' : 'var(--secondary-muted)',
                          boxShadow: isActive ? '0 4px 10px rgba(224, 86, 36, 0.2)' : 'none',
                          transition: 'var(--transition)'
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orders List */}
              {(() => {
                const filteredOrders = orders.filter((o) => {
                  if (statusFilter === 'Tất cả') return true;
                  return o.status === statusFilter;
                });

                const historyPageSize = 5;
                const totalPages = Math.ceil(filteredOrders.length / historyPageSize);
                const paginatedOrders = filteredOrders.slice(
                  (historyPage - 1) * historyPageSize,
                  historyPage * historyPageSize
                );

                if (filteredOrders.length === 0) {
                  return (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px', 
                      background: 'var(--bg-main)', 
                      borderRadius: 'var(--radius-lg)',
                      border: '1px dashed var(--border-light)'
                    }}>
                      <ShoppingBag size={48} style={{ color: 'var(--secondary-muted)', marginBottom: '16px', opacity: 0.5 }} />
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '8px' }}>
                        Không tìm thấy đơn hàng nào
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                        {statusFilter === 'Tất cả' 
                          ? 'Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào tại Jusstlife.' 
                          : `Bạn không có đơn hàng nào ở trạng thái "${statusFilter}".`}
                      </p>
                      <button
                        type="button"
                        onClick={onGoBack}
                        className="checkout-action-btn"
                        style={{ padding: '10px 20px', fontSize: '13px', width: 'auto', display: 'inline-flex' }}
                      >
                        Mua Sắm Ngay
                      </button>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {paginatedOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const payment = paymentDetails[order.id];
                      const isLoadingPayment = loadingPayment[order.id];
                      
                      // Determine status badge colors
                      let statusBg = '#fff';
                      let statusColor = '#000';
                      let StatusIcon = Clock;
                      
                      if (order.status === 'Chờ xử lý') {
                        statusBg = '#fffbeb';
                        statusColor = '#d97706';
                        StatusIcon = Clock;
                      } else if (order.status === 'Đang giao') {
                        statusBg = '#eff6ff';
                        statusColor = '#2563eb';
                        StatusIcon = Truck;
                      } else if (order.status === 'Đã giao') {
                        statusBg = '#f0fdf4';
                        statusColor = '#16a34a';
                        StatusIcon = CheckCircle;
                      } else if (order.status === 'Hủy đơn') {
                        statusBg = '#fef2f2';
                        statusColor = '#dc2626';
                        StatusIcon = XCircle;
                      }

                      return (
                        <div 
                          key={order.id}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'var(--transition)'
                          }}
                        >
                          {/* Order Header Summary Row */}
                          <div 
                            onClick={() => handleToggleOrder(order.id)}
                            style={{
                              padding: '20px 24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              background: isExpanded ? 'var(--bg-main)' : '#fff',
                              transition: 'var(--transition)',
                              flexWrap: 'wrap',
                              gap: '16px'
                            }}
                          >
                            {/* Left Column: ID, Date, Item Brief */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <div style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '8px', 
                                background: 'rgba(224, 86, 36, 0.08)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justify: 'center',
                                color: 'var(--primary)'
                              }}>
                                <ShoppingBag size={20} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--secondary)' }}>
                                    Đơn hàng #{order.id}
                                  </span>
                                  <span style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    fontSize: '11px', 
                                    fontWeight: 700, 
                                    padding: '3px 8px', 
                                    borderRadius: '12px',
                                    background: statusBg,
                                    color: statusColor
                                  }}>
                                    <StatusIcon size={12} />
                                    {order.status}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--secondary-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={12} />
                                  <span>
                                    Ngày đặt: {(() => {
                                      const d = new Date(order.createdAt || order.orderDate);
                                      return isNaN(d.getTime()) ? 'Không rõ' : `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Price and Accordion Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>Tổng thanh toán</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                                  {order.totalPrice.toLocaleString('vi-VN')} ₫
                                </div>
                              </div>
                              
                              {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--secondary-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--secondary-muted)' }} />}
                            </div>
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div style={{ 
                              padding: '24px', 
                              borderTop: '1px solid var(--border-light)',
                              background: '#fcfcfc'
                            }}>
                              {/* Visual Journey Timeline Stepper */}
                              {order.status === 'Hủy đơn' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#ffebee', color: '#c62828', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid #ffcdd2' }}>
                                  <XCircle size={28} />
                                  <div>
                                    <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>ĐƠN HÀNG ĐÃ BỊ HỦY BỎ</h5>
                                    <p style={{ fontSize: '12px', color: 'rgba(198, 40, 40, 0.8)', margin: '2px 0 0 0' }}>
                                      Đơn hàng này đã được hủy bỏ. Quý khách vui lòng liên hệ CSKH 1900-6789 nếu có bất kỳ thắc mắc nào.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ marginBottom: '24px', padding: '16px 20px', background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', paddingBottom: '5px' }}>
                                    {/* Line Background */}
                                    <div style={{ position: 'absolute', top: '14px', left: '10%', width: '80%', height: '3px', background: '#e0e0e0', zIndex: 1 }}>
                                      {/* Fill Line */}
                                      <div style={{
                                        height: '100%',
                                        background: 'var(--primary-gradient)',
                                        width: order.status === 'Đã giao' ? '100%' : order.status === 'Đang giao' ? '66.6%' : '33.3%',
                                        transition: 'all 0.5s ease'
                                      }}></div>
                                    </div>

                                    {/* Step 1: Nhận đơn */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                                      <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: '#4caf50',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 5px rgba(76,175,80,0.2)',
                                        marginBottom: '6px'
                                      }}>
                                        <Check size={14} />
                                      </div>
                                      <span style={{ fontSize: '11px', fontWeight: 700 }}>Nhận Đơn</span>
                                      <span style={{ fontSize: '9px', color: 'var(--secondary-muted)', marginTop: '2px', display: 'block', maxWidth: '90px', margin: '2px auto 0 auto' }}>Đã xác nhận đơn</span>
                                    </div>

                                    {/* Step 2: Đóng gói */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                                      <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: (order.status === 'Đang giao' || order.status === 'Đã giao') ? '#4caf50' : (order.status === 'Chờ xử lý' ? '#ff9800' : '#e0e0e0'),
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: order.status === 'Chờ xử lý' ? '0 2px 5px rgba(255,152,0,0.2)' : '',
                                        marginBottom: '6px'
                                      }}>
                                        {(order.status === 'Đang giao' || order.status === 'Đã giao') ? <Check size={14} /> : <span style={{ fontSize: '12px', fontWeight: 'bold' }}>2</span>}
                                      </div>
                                      <span style={{ fontSize: '11px', fontWeight: (order.status === 'Chờ xử lý' || order.status === 'Đang giao' || order.status === 'Đã giao') ? 700 : 500 }}>Đóng Gói</span>
                                      <span style={{ fontSize: '9px', color: 'var(--secondary-muted)', marginTop: '2px', display: 'block', maxWidth: '90px', margin: '2px auto 0 auto' }}>
                                        {(order.status === 'Đang giao' || order.status === 'Đã giao') ? 'Đã chuẩn bị xong' : 'Đang chuẩn bị hàng...'}
                                      </span>
                                    </div>

                                    {/* Step 3: Đang giao */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                                      <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: order.status === 'Đã giao' ? '#4caf50' : (order.status === 'Đang giao' ? '#ff9800' : '#e0e0e0'),
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: order.status === 'Đang giao' ? '0 2px 5px rgba(255,152,0,0.2)' : '',
                                        marginBottom: '6px'
                                      }}>
                                        {order.status === 'Đã giao' ? <Check size={14} /> : <span style={{ fontSize: '12px', fontWeight: 'bold' }}>3</span>}
                                      </div>
                                      <span style={{ fontSize: '11px', fontWeight: (order.status === 'Đang giao' || order.status === 'Đã giao') ? 700 : 500 }}>Đang Giao</span>
                                      <span style={{ fontSize: '9px', color: 'var(--secondary-muted)', marginTop: '2px', display: 'block', maxWidth: '90px', margin: '2px auto 0 auto' }}>
                                        {order.status === 'Đã giao' ? 'Đã bàn giao shipper' : (order.status === 'Đang giao' ? 'Đang vận chuyển...' : 'Chờ lấy hàng')}
                                      </span>
                                    </div>

                                    {/* Step 4: Thành công */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                                      <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: order.status === 'Đã giao' ? '#4caf50' : '#e0e0e0',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: order.status === 'Đã giao' ? '0 2px 5px rgba(76,175,80,0.2)' : '',
                                        marginBottom: '6px'
                                      }}>
                                        {order.status === 'Đã giao' ? <Check size={14} /> : <span style={{ fontSize: '12px', fontWeight: 'bold' }}>4</span>}
                                      </div>
                                      <span style={{ fontSize: '11px', fontWeight: order.status === 'Đã giao' ? 700 : 500 }}>Thành Công</span>
                                      <span style={{ fontSize: '9px', color: 'var(--secondary-muted)', marginTop: '2px', display: 'block', maxWidth: '90px', margin: '2px auto 0 auto' }}>
                                        {order.status === 'Đã giao' ? 'Đã nhận hàng' : 'Chờ hoàn tất'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
                                
                                {/* Left Column: Products List */}
                                <div>
                                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Sản phẩm đã mua ({order.items.length})
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {order.items.map((item, idx) => (
                                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                                        <img 
                                          src={item.images[0]} 
                                          alt="" 
                                          style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/400x500";
                                          }}
                                        />
                                        <div style={{ flexGrow: 1 }}>
                                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>{item.name}</div>
                                          <div style={{ fontSize: '11px', color: 'var(--secondary-muted)', marginTop: '2px' }}>
                                            Size: <strong>{item.selectedSize}</strong> / Màu: <strong>{item.selectedColor.name}</strong>
                                          </div>
                                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-muted)', marginTop: '4px' }}>
                                            {item.quantity} x {item.price.toLocaleString('vi-VN')} ₫
                                          </div>
                                        </div>
                                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--secondary)' }}>
                                          {(item.quantity * item.price).toLocaleString('vi-VN')} ₫
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Column: Delivery Address & Payment details */}
                                <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: '30px' }}>
                                  
                                  {/* Delivery Address */}
                                  <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Thông tin giao hàng
                                    </h4>
                                    <div style={{ fontSize: '12.5px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <div>Người nhận: <strong style={{ color: 'var(--secondary)' }}>{order.customerName}</strong></div>
                                      <div>Số điện thoại: <strong style={{ color: 'var(--secondary)' }}>{order.phone}</strong></div>
                                      <div>Địa chỉ giao: <strong style={{ color: 'var(--secondary)' }}>{order.address}</strong></div>
                                      {order.note && <div>Ghi chú: <em style={{ color: 'var(--secondary)' }}>"{order.note}"</em></div>}
                                    </div>
                                  </div>

                                  {/* Payment Status & Payment Method */}
                                  <div style={{ 
                                    background: 'var(--bg-main)', 
                                    padding: '16px', 
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-light)'
                                  }}>
                                    <h5 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--secondary)', margin: '0 0 10px 0' }}>
                                      Thanh toán & Giao dịch
                                    </h5>
                                    <div style={{ fontSize: '12px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <div>Phương thức: <strong>{order.paymentMethod}</strong></div>
                                      
                                      {isLoadingPayment ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                                          <span>Đang kiểm tra giao dịch...</span>
                                        </div>
                                      ) : payment ? (
                                        <>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>Trạng thái giao dịch:</span>
                                            <strong style={{ 
                                              color: payment.status === 'PAID' ? '#16a34a' : (payment.status === 'REFUNDED' ? '#dc2626' : '#d97706'),
                                              fontWeight: 700
                                            }}>
                                              {payment.status === 'PAID' ? 'Đã thanh toán' : (payment.status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa thanh toán')}
                                            </strong>
                                          </div>

                                          {/* Pay now button for unpaid bank transfer orders */}
                                          {order.status === 'Chờ xử lý' && order.paymentMethod === 'Chuyển khoản' && payment.status === 'PENDING' && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (payment.checkoutUrl) {
                                                  window.location.href = payment.checkoutUrl;
                                                } else {
                                                  onGeneratePayOSLink(order.id);
                                                }
                                              }}
                                              className="checkout-action-btn animate-pulse"
                                              style={{ 
                                                padding: '8px 14px', 
                                                fontSize: '11px', 
                                                marginTop: '12px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '6px',
                                                width: 'auto'
                                              }}
                                            >
                                              <ExternalLink size={12} />
                                              <span>Thanh Toán Ngay qua PayOS</span>
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        <div>Trạng thái giao dịch: <strong>Chưa rõ</strong></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Order Action: Cancel Order */}
                                  {order.status === 'Chờ xử lý' && (!payment || payment.status !== 'PAID') && (
                                    <div style={{ marginTop: '16px' }}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onCancelOrder(order.id);
                                        }}
                                        style={{
                                          width: '100%',
                                          padding: '10px 16px',
                                          background: '#fee2e2',
                                          color: '#dc2626',
                                          border: '1px solid #fca5a5',
                                          borderRadius: 'var(--radius-sm)',
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          transition: 'var(--transition)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#dc2626';
                                          e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#fee2e2';
                                          e.currentTarget.style.color = '#dc2626';
                                        }}
                                      >
                                        Hủy Đơn Hàng Này
                                      </button>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <Pagination
                      currentPage={historyPage}
                      totalPages={totalPages}
                      onPageChange={setHistoryPage}
                    />
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
