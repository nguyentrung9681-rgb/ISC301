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
  ShieldCheck,
  Edit
} from 'lucide-react';

export default function AdminPortal({ 
  products, 
  orders, 
  onAddProduct, 
  onEditProduct,
  onUpdateProductStatus, 
  onDeleteProduct, 
  onUpdateOrderStatus,
  currentRole,
  setCurrentRole,
  showAlert
}) {
  const [activeMenu, setActiveMenu] = useState('products-list'); // default tab
  // FORM STATES
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodInventory, setProdInventory] = useState('50');
  const [prodCategory, setProdCategory] = useState('ao');
  const [prodGender, setProdGender] = useState('Unisex');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [editProductId, setEditProductId] = useState(null);

  const openEditForm = (prod) => {
    setEditProductId(prod.id);
    setProdName(prod.name || '');
    setProdPrice(prod.price || '');
    setProdOriginalPrice(prod.originalPrice || prod.price || '');
    setProdCategory(prod.category || 'ao');
    setProdGender(prod.gender || 'Unisex');
    setProdInventory(prod.inventory || '50');
    setProdDesc(prod.description || '');
    
    // Xử lý lấy url ảnh
    let url = '';
    if (prod.images && prod.images.length > 0) {
      url = prod.images[0];
    } else if (prod.imageUrl) {
      url = prod.imageUrl;
    }
    setProdImageUrl(url);
    
    setActiveMenu('add-product');
  };

  const handleClearForm = () => {
    setEditProductId(null);
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdInventory('50');
    setProdDesc('');
    setProdImageUrl('');
    setProdCategory('ao');
    setSelectedSizes(['M', 'L']);
    setSelectedColors([PRESET_COLORS[0], PRESET_COLORS[1]]);
  };
  
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

    if (!prodImageUrl.trim()) {
      if (showAlert) showAlert('THIẾU ẢNH', 'Vui lòng nhập đường dẫn URL ảnh hợp lệ!', 'warning');
      else alert('Vui lòng nhập đường dẫn ảnh!');
      return;
    }

    const categoriesLabels = {
      ao: "Áo",
      quan: "Quần",
      vay: "Váy",
      phukien: "Phụ kiện"
    };

    const newProduct = {
      name: prodName.trim(),
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : Number(prodPrice),
      category: prodCategory,
      categoryLabel: categoriesLabels[prodCategory],
      gender: prodGender,
      sizes: selectedSizes.length > 0 ? selectedSizes : ["One Size"],
      colors: selectedColors.length > 0 ? selectedColors : [{ name: "Mặc định", hex: "#ccc" }],
      imageUrl: prodImageUrl.trim(),
      images: [prodImageUrl.trim()],
      description: prodDesc.trim() || "Sản phẩm thời trang chất lượng cao.",
      inventory: Number(prodInventory),
      rating: 5.0,
      reviewsCount: 0,
      soldCount: 0,
      isNew: true,
      createdBy: currentRole
    };

    if (editProductId) {
      onEditProduct(editProductId, newProduct);
    } else {
      onAddProduct(newProduct);
    }
    
    handleClearForm();

    // Switch tab back to products-list
    setActiveMenu('products-list');
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
  };

  // CALCULATE ANALYTICS (REAL STATISTICS!)
  const totalRevenue = orders
    .filter(o => o.status === 'Đã giao')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const activeProductsCount = products.length;
  const outOfStockCount = products.filter(p => p.inventory < 5 && p.status === 'approved').length;

  return (
    <div className="container admin-layout">
      {/* SIDEBAR */}
      <div className="admin-sidebar animate-fade">
        <div className="role-badge-box">
          <span className="role-badge-title">Phân Quyền Hệ Thống</span>
          <span className="role-badge-name">
            <ShieldCheck size={20} />
            <span>Quản Lý</span>
          </span>
        </div>



        {/* MENUS */}
        <div className="admin-menu">
          <button 
            className={`admin-menu-item ${activeMenu === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveMenu('analytics')}
          >
            <BarChart3 size={16} />
            <span>Thống Kê Doanh Thu</span>
          </button>

          <button 
            className={`admin-menu-item ${activeMenu === 'products-list' ? 'active' : ''}`}
            onClick={() => setActiveMenu('products-list')}
          >
            <ListFilter size={16} />
            <span>Danh Sách Sản Phẩm</span>
          </button>

          <button 
            className={`admin-menu-item ${activeMenu === 'add-product' ? 'active' : ''}`}
            onClick={() => {
              handleClearForm();
              setActiveMenu('add-product');
            }}
          >
            <PlusCircle size={16} />
            <span>Thêm / Sửa Sản Phẩm</span>
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
        {activeMenu === 'analytics' && (
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
              <span><strong>Mẹo Quản Lý:</strong> Theo dõi các thông số hệ thống để điều chỉnh chiến lược kinh doanh phù hợp.</span>
            </div>
          </div>
        )}

        {/* =========================================================================
           TAB: PRODUCT LIST (MANAGER)
           ========================================================================= */}
        {activeMenu === 'products-list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                Quản Lý Toàn Bộ Sản Phẩm
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
                    .map((prod) => {
                      const isOwnerOrManager = true;

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
                          <td>{prod.createdBy === 'manager' ? 'Quản lý' : 'Khác'}</td>
                          <td style={{ textAlign: 'right' }}>
                            {isOwnerOrManager ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => openEditForm(prod)} 
                                  style={{ color: 'var(--primary)', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }}
                                  title="Sửa Sản Phẩm"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => onDeleteProduct(prod.id)} 
                                  style={{ color: '#c62828', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }}
                                  title="Xóa Sản Phẩm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
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
           TAB: ADD/EDIT PRODUCT FORM (MANAGER)
           ========================================================================= */}
        {activeMenu === 'add-product' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
              {editProductId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới Vào Hệ Thống'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', marginBottom: '24px' }}>
              💡 Phân quyền Quản Lý: Đảm bảo dữ liệu theo chuẩn Backend.
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
                <div className="admin-form-group full-width">
                  <label className="input-label">Đường dẫn ảnh sản phẩm (URL) *</label>
                  <input 
                    type="url" 
                    placeholder="Ví dụ: https://example.com/image.jpg" 
                    className="admin-input"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    required
                  />
                  {prodImageUrl && (
                    <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'inline-block' }}>
                      <img src={prodImageUrl} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
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
                  onClick={() => {
                    handleClearForm();
                    setActiveMenu('products-list');
                  }}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-admin-submit">
                  {editProductId ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
           TAB: ORDERS LIST (MANAGER)
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
