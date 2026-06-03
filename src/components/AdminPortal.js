import React, { useState } from 'react';
import { 
  PlusCircle, 
  ListFilter, 
  BarChart3, 
  CheckSquare, 
  ShoppingBag, 
  Trash2, 
  TrendingUp, 
  Check, 
  X, 
  Calendar,
  DollarSign,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function AdminPortal({ 
  products, 
  orders, 
  onAddProduct, 
  onUpdateProductStatus, 
  onDeleteProduct, 
  onUpdateOrderStatus,
  currentRole,
  setCurrentRole,
  showAlert
}) {
  const [activeMenu, setActiveMenu] = useState('products-list'); // default tab
  const [rejectProduct, setRejectProduct] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // FORM STATES
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodInventory, setProdInventory] = useState('50');
  const [prodCategory, setProdCategory] = useState('ao');
  const [prodGender, setProdGender] = useState('Unisex');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImgUrl1, setProdImgUrl1] = useState('');
  const [prodImgUrl2, setProdImgUrl2] = useState('');
  
  // Sizes Selection
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L']);
  // Colors Selection (preset simple options)
  const PRESET_COLORS = [
    { name: 'Đen', hex: '#1A1A1A' },
    { name: 'Trắng', hex: '#FFFFFF' },
    { name: 'Xám', hex: '#8E8E93' },
    { name: 'Xanh Navy', hex: '#1D2D44' },
    { name: 'Hồng Nhạt', hex: '#FFC0CB' },
    { name: 'Màu Be', hex: '#EBE3D5' }
  ];
  const [selectedColors, setSelectedColors] = useState([PRESET_COLORS[0], PRESET_COLORS[1]]);

  // Toggle sizes
  const handleToggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Toggle colors
  const handleToggleColor = (color) => {
    if (selectedColors.some(c => c.name === color.name)) {
      setSelectedColors(selectedColors.filter(c => c.name !== color.name));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Form submission handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!prodName.trim()) {
      if (showAlert) showAlert('THIẾU THÔNG TIN', 'Vui lòng nhập tên thiết kế sản phẩm Jusstlife!', 'warning');
      else alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!prodPrice || isNaN(prodPrice) || Number(prodPrice) <= 0) {
      if (showAlert) showAlert('THÔNG TIN SAI', 'Vui lòng nhập giá bán hợp lệ cho thiết kế!', 'warning');
      else alert('Vui lòng nhập giá bán hợp lệ!');
      return;
    }
    if (!prodInventory || isNaN(prodInventory) || Number(prodInventory) < 0) {
      if (showAlert) showAlert('THÔNG TIN SAI', 'Vui lòng nhập số lượng tồn kho hợp lệ cho thiết kế!', 'warning');
      else alert('Vui lòng nhập số lượng tồn kho!');
      return;
    }

    const imagesArray = [];
    if (prodImgUrl1.trim()) imagesArray.push(prodImgUrl1.trim());
    if (prodImgUrl2.trim()) imagesArray.push(prodImgUrl2.trim());

    // Nếu không nhập ảnh, tự lấy ảnh Unsplash mặc định cho đẹp
    if (imagesArray.length === 0) {
      imagesArray.push("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600");
    }

    const categoriesLabels = {
      ao: "Áo",
      quan: "Quần",
      vay: "Váy",
      phukien: "Phụ kiện"
    };

    const newProduct = {
      name: prodName,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : Number(prodPrice),
      category: prodCategory,
      categoryLabel: categoriesLabels[prodCategory],
      gender: prodGender,
      sizes: selectedSizes.length > 0 ? selectedSizes : ["One Size"],
      colors: selectedColors.length > 0 ? selectedColors : [{ name: "Mặc định", hex: "#ccc" }],
      images: imagesArray,
      description: prodDesc.trim() || "Sản phẩm thời trang Jusstlife chất lượng cao phong cách hiện đại tối giản.",
      inventory: Number(prodInventory),
      rating: 5.0,
      reviewsCount: 0,
      soldCount: 0,
      isNew: true,
      createdBy: currentRole
    };

    onAddProduct(newProduct);
    
    // Clear form
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdInventory('50');
    setProdDesc('');
    setProdImgUrl1('');
    setProdImgUrl2('');
    setSelectedSizes(['M', 'L']);
    setSelectedColors([PRESET_COLORS[0], PRESET_COLORS[1]]);

    // Switch tab back to products-list
    setActiveMenu('products-list');
  };

  // Reject Submit
  const handleRejectSubmit = () => {
    if (!rejectReasonInput.trim()) {
      if (showAlert) {
        showAlert('THIẾU THÔNG TIN', 'Vui lòng nhập lý do từ chối thiết kế sản phẩm này!', 'warning');
      } else {
        alert("Vui lòng nhập lý do từ chối!");
      }
      return;
    }
    onUpdateProductStatus(rejectProduct.id, 'rejected', rejectReasonInput.trim());
    setRejectProduct(null);
    setRejectReasonInput('');
  };

  // Switch role reset
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    // Adjust menus based on role
    if (role === 'staff' && (activeMenu === 'analytics' || activeMenu === 'approve-list')) {
      setActiveMenu('products-list');
    }
  };

  // CALCULATE ANALYTICS (REAL STATISTICS!)
  const totalRevenue = orders
    .filter(o => o.status === 'Đã giao')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingApprovalCount = products.filter(p => p.status === 'pending').length;
  const activeProductsCount = products.filter(p => p.status === 'approved').length;
  const outOfStockCount = products.filter(p => p.inventory < 5 && p.status === 'approved').length;

  return (
    <div className="container admin-layout">
      {/* SIDEBAR */}
      <div className="admin-sidebar animate-fade">
        <div className="role-badge-box">
          <span className="role-badge-title">Phân Quyền Hệ Thống</span>
          <span className="role-badge-name">
            <ShieldCheck size={20} />
            <span>{currentRole === 'manager' ? "Quản Lý" : "Nhân Viên"}</span>
          </span>
        </div>

        {/* ROLE SWITCHER TABS */}
        <div className="role-switcher-tabs">
          <button 
            className={`role-tab-btn ${currentRole === 'staff' ? 'active' : ''}`}
            onClick={() => handleRoleChange('staff')}
          >
            Nhân Viên
          </button>
          <button 
            className={`role-tab-btn ${currentRole === 'manager' ? 'active' : ''}`}
            onClick={() => handleRoleChange('manager')}
          >
            Quản Lý
          </button>
        </div>

        {/* MENUS */}
        <div className="admin-menu">
          {currentRole === 'manager' && (
            <button 
              className={`admin-menu-item ${activeMenu === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveMenu('analytics')}
            >
              <BarChart3 size={16} />
              <span>Thống Kê Doanh Thu</span>
            </button>
          )}

          {currentRole === 'manager' && (
            <button 
              className={`admin-menu-item ${activeMenu === 'approve-list' ? 'active' : ''}`}
              onClick={() => setActiveMenu('approve-list')}
            >
              <CheckSquare size={16} style={{ color: pendingApprovalCount > 0 ? 'var(--primary)' : 'inherit' }} />
              <span>Duyệt Sản Phẩm ({pendingApprovalCount})</span>
            </button>
          )}

          <button 
            className={`admin-menu-item ${activeMenu === 'products-list' ? 'active' : ''}`}
            onClick={() => setActiveMenu('products-list')}
          >
            <ListFilter size={16} />
            <span>Danh Sách Sản Phẩm</span>
          </button>

          <button 
            className={`admin-menu-item ${activeMenu === 'add-product' ? 'active' : ''}`}
            onClick={() => setActiveMenu('add-product')}
          >
            <PlusCircle size={16} />
            <span>Thêm Sản Phẩm Mới</span>
          </button>

          <button 
            className={`admin-menu-item ${activeMenu === 'orders-list' ? 'active' : ''}`}
            onClick={() => setActiveMenu('orders-list')}
          >
            <ShoppingBag size={16} />
            <span>Quản Lý Đơn Hàng ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* MAIN ADMIN CONTENT CARD */}
      <div className="admin-content-card animate-fade">
        
        {/* =========================================================================
           TAB: ANALYTICS (MANAGER ONLY)
           ========================================================================= */}
        {activeMenu === 'analytics' && currentRole === 'manager' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Báo Cáo Doanh Thu & Hệ Thống</h2>
            
            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper revenue">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="stat-value">{totalRevenue.toLocaleString('vi-VN')} ₫</div>
                  <div className="stat-label">Doanh thu thực tế</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orders">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div className="stat-value">{orders.length} Đơn</div>
                  <div className="stat-label">Tổng số đơn đặt hàng</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper products">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="stat-value">{activeProductsCount} SP</div>
                  <div className="stat-label">Sản phẩm đang bán</div>
                </div>
              </div>

              <div className="stat-card" style={{ border: outOfStockCount > 0 ? '1px solid #c62828' : '' }}>
                <div className="stat-icon-wrapper pending" style={{ background: outOfStockCount > 0 ? '#ffebee' : '' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="stat-value">{outOfStockCount} SP</div>
                  <div className="stat-label">Sắp hết hàng (&lt;5 cái)</div>
                </div>
              </div>
            </div>

            {/* Custom Chart Divs */}
            <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} />
                <span>Doanh Thu Ước Tính Theo Tuần (VND)</span>
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', padding: '0 20px', marginTop: '10px' }}>
                {[
                  { name: 'Tuần 1', val: totalRevenue * 0.25 || 2500000 },
                  { name: 'Tuần 2', val: totalRevenue * 0.35 || 4200000 },
                  { name: 'Tuần 3', val: totalRevenue * 0.20 || 3100000 },
                  { name: 'Tuần 4 (Hiện tại)', val: totalRevenue || 7500000 }
                ].map((item, idx) => {
                  const maxVal = 10000000;
                  const percent = Math.min((item.val / maxVal) * 100, 100);

                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>{item.val.toLocaleString('vi-VN')} ₫</span>
                      <div style={{ 
                        width: '100%', 
                        maxWidth: '48px', 
                        height: `${percent + 20}px`, 
                        background: idx === 3 ? 'var(--primary-gradient)' : '#bbb',
                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                        boxShadow: idx === 3 ? '0 4px 15px rgba(255,87,34,0.3)' : ''
                      }}></div>
                      <span style={{ fontSize: '12px', color: 'var(--secondary-muted)', fontWeight: 500 }}>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips */}
            <div style={{ display: 'flex', gap: '16px', padding: '20px', background: '#e3f2fd', borderRadius: 'var(--radius-md)', color: '#0d47a1', fontSize: '14px', alignItems: 'center' }}>
              <InfoIcon />
              <span><strong>Mẹo Quản Lý:</strong> Kiểm tra phần "Duyệt sản phẩm" thường xuyên để xét duyệt kịp thời các mẫu thiết kế mới của nhân viên gửi lên. Cửa hàng sẽ tự động cập nhật sản phẩm ngay sau khi bạn click Phê duyệt.</span>
            </div>
          </div>
        )}

        {/* =========================================================================
           TAB: PRODUCT LIST (STAFF & MANAGER)
           ========================================================================= */}
        {activeMenu === 'products-list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                {currentRole === 'manager' ? "Quản Lý Toàn Bộ Sản Phẩm" : "Danh Sách Sản Phẩm Của Tôi"}
              </h2>
              <button 
                className="btn-admin-submit" 
                onClick={() => setActiveMenu('add-product')}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
              >
                + Thêm Sản Phẩm
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá Bán</th>
                  <th>Kho hàng</th>
                  <th>Danh mục</th>
                  <th>Người tạo</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                      Không có sản phẩm nào trong hệ thống!
                    </td>
                  </tr>
                ) : (
                  products
                    // Nhân viên chỉ được xem hàng do mình tạo HOẶC xem tất cả nhưng chỉ quản lý hàng của mình. Để UX tốt, hiển thị hết sản phẩm nhưng chặn hành động xóa nếu không thuộc quyền
                    .map((prod) => {
                      const isOwnerOrManager = currentRole === 'manager' || prod.createdBy === 'staff';

                      return (
                        <tr key={prod.id}>
                          <td>
                            <div className="admin-table-product-cell">
                              <img src={prod.images[0]} alt="" className="admin-table-product-img" />
                              <div>
                                <div style={{ fontWeight: 600 }}>{prod.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>Mã: {prod.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            {prod.price.toLocaleString('vi-VN')} ₫
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: prod.inventory < 5 ? '#c62828' : 'inherit' }}>
                              {prod.inventory} cái
                            </span>
                            {prod.inventory < 5 && <span style={{ color: '#c62828', fontSize: '10px', marginLeft: '6px', fontWeight: 700 }}>(Sắp hết!)</span>}
                          </td>
                          <td>{prod.categoryLabel}</td>
                          <td>{prod.createdBy === 'manager' ? 'Quản lý' : 'Nhân viên'}</td>
                          <td>
                            <div className="prices-box">
                              <span className={`admin-status-pill ${prod.status}`}>
                                {prod.status === 'approved' ? 'Đang Bán' : prod.status === 'pending' ? 'Chờ Duyệt' : 'Bị Từ Chối'}
                              </span>
                              {prod.status === 'rejected' && prod.rejectReason && (
                                <span style={{ fontSize: '10px', color: '#c62828', marginTop: '4px', maxWidth: '140px', wordBreak: 'break-word' }}>
                                  Lý do: "{prod.rejectReason}"
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isOwnerOrManager ? (
                              <button 
                                onClick={() => onDeleteProduct(prod.id)} 
                                style={{ color: '#c62828', cursor: 'pointer' }}
                                title="Xóa Sản Phẩm"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#ccc' }}>Không có quyền</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
           TAB: PENDING APPROVAL LIST (MANAGER ONLY)
           ========================================================================= */}
        {activeMenu === 'approve-list' && currentRole === 'manager' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
              Xét Duyệt Thiết Kế Mới ({pendingApprovalCount})
            </h2>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Chi tiết màu / size</th>
                  <th>Giá Đề Xuất</th>
                  <th>Kho mẫu</th>
                  <th>Hành động Duyệt</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => p.status === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: '#2e7d32', fontWeight: 600 }}>
                      🎉 Tuyệt vời! Không có sản phẩm nào đang chờ phê duyệt.
                    </td>
                  </tr>
                ) : (
                  products
                    .filter(p => p.status === 'pending')
                    .map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div className="admin-table-product-cell">
                            <img src={prod.images[0]} alt="" className="admin-table-product-img" />
                            <div>
                              <div style={{ fontWeight: 600 }}>{prod.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--secondary-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '200px' }}>
                                Mô tả: {prod.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{prod.categoryLabel} ({prod.gender})</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                            <div>Size: {prod.sizes.join(', ')}</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              Màu: {prod.colors.map(c => c.name).join(', ')}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {prod.price.toLocaleString('vi-VN')} ₫
                        </td>
                        <td style={{ fontWeight: 600 }}>{prod.inventory} cái</td>
                        <td>
                          <div className="approval-action-cell">
                            <button 
                              className="btn-approve"
                              onClick={() => onUpdateProductStatus(prod.id, 'approved', '')}
                            >
                              <Check size={14} style={{ marginRight: '2px' }} />
                              Duyệt Bán
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => setRejectProduct(prod)}
                            >
                              <X size={14} style={{ marginRight: '2px' }} />
                              Từ Chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
           TAB: ADD NEW PRODUCT FORM (STAFF & MANAGER)
           ========================================================================= */}
        {activeMenu === 'add-product' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Thêm Thiết Kế Mới Vào Hệ Thống</h2>
            <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', marginBottom: '24px' }}>
              {currentRole === 'manager' 
                ? "💡 Phân quyền Quản Lý: Sản phẩm thêm mới sẽ tự động được PHÊ DUYỆT và đăng bán trực tiếp." 
                : "💡 Phân quyền Nhân Viên: Sản phẩm thêm mới sẽ gửi đến hàng chờ của QUẢN LÝ để xét duyệt trước khi bán."}
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-section-title">1. Thông tin chung sản phẩm</div>
              
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label className="input-label">Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Áo Khoác Bomber Jusstlife Premium..." 
                    className="admin-input"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Giá Bán Đề Xuất * (VND)</label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 299000" 
                    className="admin-input"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Giá Gốc Gạch Ngang (Nếu có)</label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 450000" 
                    className="admin-input"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Phân Loại Danh Mục *</label>
                  <select 
                    className="admin-input" 
                    value={prodCategory} 
                    onChange={(e) => setProdCategory(e.target.value)}
                  >
                    <option value="ao">Áo (Tops)</option>
                    <option value="quan">Quần (Bottoms)</option>
                    <option value="vay">Váy (Dresses)</option>
                    <option value="phukien">Phụ Kiện (Accessories)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Phân Phối Giới Tính *</label>
                  <select 
                    className="admin-input" 
                    value={prodGender} 
                    onChange={(e) => setProdGender(e.target.value)}
                  >
                    <option value="Unisex">Unisex (Cả nam và nữ)</option>
                    <option value="Men">Nam (Men)</option>
                    <option value="Women">Nữ (Women)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Số Lượng Nhập Kho Tồn *</label>
                  <input 
                    type="number" 
                    className="admin-input"
                    value={prodInventory}
                    onChange={(e) => setProdInventory(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="admin-form-section-title">2. Kích thước & Bảng màu</div>
              <div className="admin-form-grid">
                
                {/* Sizes selection */}
                <div className="admin-form-group">
                  <label className="input-label">Kích thước hỗ trợ (Chọn nhiều)</label>
                  <div className="size-select-row">
                    {["S", "M", "L", "XL", "Free Size"].map((size) => {
                      const isActive = selectedSizes.includes(size);
                      return (
                        <div 
                          key={size}
                          className={`size-checkbox-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handleToggleSize(size)}
                        >
                          {size}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Colors selection */}
                <div className="admin-form-group">
                  <label className="input-label">Màu sắc (Chọn nhiều)</label>
                  <div className="color-select-row">
                    {PRESET_COLORS.map((col) => {
                      const isActive = selectedColors.some(c => c.name === col.name);
                      return (
                        <div 
                          key={col.name}
                          className={`color-checkbox-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handleToggleColor(col)}
                          style={{ borderLeft: `4px solid ${col.hex}` }}
                        >
                          {col.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="admin-form-section-title">3. Hình ảnh & Mô tả chi tiết</div>
              
              <div className="admin-form-grid" style={{ marginBottom: '20px' }}>
                <div className="admin-form-group">
                  <label className="input-label">Link ảnh chính sản phẩm (URL)</label>
                  <input 
                    type="text" 
                    placeholder="Dán link ảnh online (Unsplash/Imgur)..." 
                    className="admin-input"
                    value={prodImgUrl1}
                    onChange={(e) => setProdImgUrl1(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Link ảnh phụ 2 (URL)</label>
                  <input 
                    type="text" 
                    placeholder="Dán link ảnh phụ thứ hai..." 
                    className="admin-input"
                    value={prodImgUrl2}
                    onChange={(e) => setProdImgUrl2(e.target.value)}
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label className="input-label">Mô tả đặc điểm nổi bật</label>
                  <textarea 
                    placeholder="Chất liệu cotton 100%, dày dặn, phom suông rộng trẻ trung, co giãn tốt..." 
                    className="admin-textarea"
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Form buttons */}
              <div className="admin-form-actions">
                <button 
                  type="button" 
                  className="btn-admin-cancel"
                  onClick={() => setActiveMenu('products-list')}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-admin-submit">
                  {currentRole === 'manager' ? "Đăng Bán Ngay" : "Gửi Phê Duyệt"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
           TAB: ORDERS LIST (STAFF & MANAGER)
           ========================================================================= */}
        {activeMenu === 'orders-list' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
              Quản Lý Đơn Đặt Hàng Của Khách
            </h2>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Sản phẩm đặt mua</th>
                  <th>Tổng giá trị</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác đơn</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                      Chưa có khách hàng nào đặt đơn!
                    </td>
                  </tr>
                ) : (
                  [...orders].reverse().map((order) => {
                    let statusColor = "#f57f17"; // Chờ xử lý
                    if (order.status === 'Đang giao') statusColor = "#1565c0";
                    if (order.status === 'Đã giao') statusColor = "#2e7d32";
                    if (order.status === 'Hủy đơn') statusColor = "#c62828";

                    return (
                      <tr key={order.id}>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>#{order.id}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{order.customerName}</span>
                            <span style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>SĐT: {order.phone}</span>
                            <span style={{ fontSize: '11px', color: 'var(--secondary-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.address}>
                              ĐC: {order.address}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                            {order.items.map((item, index) => (
                              <div key={index} style={{ color: 'var(--secondary-muted)' }}>
                                • {item.name} <strong>x{item.quantity}</strong> ({item.selectedColor.name} / {item.selectedSize})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {order.totalPrice.toLocaleString('vi-VN')} ₫
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                            <strong>{order.paymentMethod}</strong>
                            <span style={{ color: order.status === 'Đã giao' ? '#2e7d32' : 'var(--secondary-muted)' }}>
                              {order.status === 'Đã giao' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: statusColor, 
                            background: `${statusColor}1A`, 
                            padding: '4px 8px', 
                            borderRadius: '4px' 
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {order.status === 'Chờ xử lý' && (
                              <button 
                                className="btn-approve" 
                                onClick={() => onUpdateOrderStatus(order.id, 'Đang giao')}
                                style={{ padding: '4px 8px' }}
                              >
                                Giao hàng
                              </button>
                            )}

                            {order.status === 'Đang giao' && (
                              <button 
                                className="btn-approve" 
                                onClick={() => onUpdateOrderStatus(order.id, 'Đã giao')}
                                style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px' }}
                              >
                                Đã giao
                              </button>
                            )}

                            {(order.status === 'Chờ xử lý' || order.status === 'Đang giao') && (
                              <button 
                                className="btn-reject" 
                                onClick={() => onUpdateOrderStatus(order.id, 'Hủy đơn')}
                                style={{ padding: '4px 8px' }}
                              >
                                Hủy đơn
                              </button>
                            )}

                            {order.status === 'Đã giao' && (
                              <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>✓ Hoàn tất</span>
                            )}
                            {order.status === 'Hủy đơn' && (
                              <span style={{ fontSize: '11px', color: '#c62828', fontWeight: 600 }}>✘ Đã hủy</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECT DIALOG POPUP MODAL */}
      {rejectProduct && (
        <div className="reject-dialog-overlay">
          <div className="reject-dialog">
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Từ Chối Duyệt Sản Phẩm</h3>
            <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', margin: '8px 0 16px' }}>
              Nhập lý do cụ thể gửi cho nhân viên để chỉnh sửa mẫu <strong>"{rejectProduct.name}"</strong>:
            </p>

            <textarea 
              className="admin-textarea"
              placeholder="Ví dụ: Hình ảnh quá mờ / Giá bán chưa chính xác theo catalog..."
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              required
            ></textarea>

            <div className="reject-dialog-actions">
              <button 
                className="btn-admin-cancel"
                onClick={() => { setRejectProduct(null); setRejectReasonInput(''); }}
                style={{ padding: '8px 16px' }}
              >
                Hủy
              </button>
              <button 
                className="btn-admin-submit"
                onClick={handleRejectSubmit}
                style={{ padding: '8px 20px', background: 'var(--primary)' }}
              >
                Gửi từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Helper Info icon
function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}
