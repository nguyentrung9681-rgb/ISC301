import React, { useEffect, useMemo, useState } from 'react';
import {
  PlusCircle,
  ListFilter,
  BarChart3,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Edit,
  X,
  Tag,
  RefreshCw,
  User,
  Check,
  Eye,
  CreditCard,
  CheckCircle,
  ShoppingCart
} from 'lucide-react';
import { api } from '../api';
import Pagination from './Pagination';
import { normalizeUser } from '../utils/normalizers';

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'Free Size'];
const PRESET_COLORS = [
  { name: 'Đen', hex: '#1A1A1A' },
  { name: 'Trắng', hex: '#FFFFFF' },
  { name: 'Xám', hex: '#8E8E93' },
  { name: 'Xanh Navy', hex: '#1D2D44' },
  { name: 'Hồng Nhạt', hex: '#FFC0CB' },
  { name: 'Màu Be', hex: '#EBE3D5' }
];

const DEFAULT_CATEGORIES = [
  { id: 1, code: 'ao', name: 'Áo' },
  { id: 2, code: 'quan', name: 'Quần' },
  { id: 3, code: 'vay', name: 'Váy' },
  { id: 4, code: 'phukien', name: 'Phụ kiện' }
];

const normalizeColor = (color) => {
  if (!color) return null;
  if (typeof color === 'string') {
    return { name: color.trim(), hex: '#CCCCCC' };
  }
  return {
    name: String(color.name || '').trim(),
    hex: color.hex || '#CCCCCC'
  };
};

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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
  showAlert,
  onCategoriesChange
}) {
  const [activeMenu, setActiveMenu] = useState('products-list');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodInventory, setProdInventory] = useState('50');
  const [prodCategory, setProdCategory] = useState('ao');
  const [prodGender, setProdGender] = useState('Unisex');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImagePreview, setProdImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L']);
  const [selectedColors, setSelectedColors] = useState([PRESET_COLORS[0], PRESET_COLORS[1]]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#CFCFCF');

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [staffRole, setStaffRole] = useState('STAFF');

  // Analytics States
  const [revenueStats, setRevenueStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [vipCustomers, setVipCustomers] = useState([]);
  const [lowStockWarning, setLowStockWarning] = useState([]);
  const [funnelStats, setFunnelStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState('overview');

  // Voucher States
  const [vouchers, setVouchers] = useState([]);
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);
  const [vCode, setVCode] = useState('');
  const [vDiscount, setVDiscount] = useState('');
  const [vMaxUses, setVMaxUses] = useState('100');
  const [vExpiryDate, setVExpiryDate] = useState('');

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const year = new Date().getFullYear();
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const stats = await api.getRevenueStats(startDate, endDate).catch(() => null);
      const monthlyData = await api.getMonthlyRevenue(year).catch(() => []);
      const topP = await api.getTopSellingProducts(10).catch(() => []);
      const vipC = await api.getTopCustomers(10).catch(() => []);
      const lowS = await api.getLowStockProducts(10).catch(() => []);
      const funnel = await api.getFunnelStats().catch(() => null);

      if (stats) setRevenueStats(stats);
      setMonthlyRevenue(Array.isArray(monthlyData) ? monthlyData : []);
      setTopProducts(Array.isArray(topP) ? topP : []);
      setVipCustomers(Array.isArray(vipC) ? vipC : []);
      setLowStockWarning(Array.isArray(lowS) ? lowS : []);
      if (funnel) setFunnelStats(funnel);
    } catch (error) {
      console.error("Lỗi tải báo cáo thống kê:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await api.getVouchers();
      setVouchers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher:", error);
    }
  };

  const handleVoucherSubmit = async (event) => {
    event.preventDefault();
    if (!vCode.trim() || !vDiscount || !vMaxUses) {
      showAlert?.('THIẾU THÔNG TIN', 'Vui lòng nhập đầy đủ thông tin voucher!', 'warning');
      return;
    }
    const discount = Number(vDiscount);
    if (discount <= 0 || discount > 100) {
      showAlert?.('SAI THÔNG TIN', 'Phần trăm giảm giá phải từ 1 đến 100!', 'warning');
      return;
    }

    setIsSavingVoucher(true);
    try {
      const payload = {
        code: vCode.trim().toUpperCase(),
        discountPercent: discount,
        maxUses: Number(vMaxUses),
        expiryDate: vExpiryDate ? new Date(vExpiryDate).toISOString() : null,
        active: true
      };
      await api.createVoucher(payload);
      showAlert?.('THÀNH CÔNG', 'Đã tạo mã giảm giá mới!', 'success');
      setVCode('');
      setVDiscount('');
      setVMaxUses('100');
      setVExpiryDate('');
      fetchVouchers();
    } catch (error) {
      showAlert?.('LỖI VOUCHER', error.message || 'Không thể tạo mã giảm giá.', 'error');
    } finally {
      setIsSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id) => {
    try {
      await api.deleteVoucher(id);
      showAlert?.('THÀNH CÔNG', 'Đã xóa mã giảm giá!', 'success');
      fetchVouchers();
    } catch (error) {
      showAlert?.('KHÔNG THỂ XÓA', error.message || 'Lỗi khi xóa mã giảm giá.', 'error');
    }
  };

  // User & Staff States
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);

  // Pagination States
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);

  useEffect(() => {
    setProductsPage(1);
  }, [products.length]);

  useEffect(() => {
    setOrdersPage(1);
  }, [orders.length]);

  useEffect(() => {
    setUsersPage(1);
  }, [users.length]);

  useEffect(() => {
    setProductsPage(1);
    setOrdersPage(1);
    setUsersPage(1);
  }, [activeMenu]);

  // Create Staff Form Inputs
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffAddress, setStaffAddress] = useState('');
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await api.getUsers();
      setUsers((Array.isArray(res) ? res : []).map(normalizeUser));
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    setIsUsersLoading(true);
    try {
      const keyword = userSearch.trim();
      const res = keyword ? await api.searchUsers(keyword) : await api.getUsers();
      setUsers((Array.isArray(res) ? res : []).map(normalizeUser));
    } catch (error) {
      console.error("Lỗi tìm kiếm người dùng:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const targetStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.updateUserStatus(userId, targetStatus);
      showAlert?.('THÀNH CÔNG', `Đã cập nhật trạng thái người dùng thành ${targetStatus === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}`, 'success');
      fetchUsers();
    } catch (error) {
      showAlert?.('CẬP NHẬT THẤT BẠI', error.message || 'Không thể thay đổi trạng thái người dùng.', 'error');
    }
  };

  const handleUpdateUserRole = async (userId, targetRole) => {
    // Maps lowercase client role back to uppercase server enum role
    const serverRole = targetRole === 'manager' ? 'MANAGER' : targetRole === 'staff' ? 'STAFF' : 'BUYER';
    try {
      await api.updateUserRole(userId, serverRole);
      showAlert?.('THÀNH CÔNG', `Đã cập nhật vai trò tài khoản thành công!`, 'success');
      fetchUsers();
    } catch (error) {
      showAlert?.('CẬP NHẬT THẤT BẠI', error.message || 'Không thể thay đổi vai trò tài khoản.', 'error');
    }
  };

  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffPassword || !staffFullName.trim()) {
      showAlert?.('THIẾU THÔNG TIN', 'Vui lòng điền đầy đủ Email, Mật khẩu và Họ tên!', 'warning');
      return;
    }

    setIsSavingStaff(true);
    try {
      const payload = {
        email: staffEmail.trim(),
        password: staffPassword,
        fullName: staffFullName.trim(),
        phone: staffPhone.trim(),
        address: staffAddress.trim()
      };

      if (staffRole === 'MANAGER') {
        await api.createManager(payload);
        showAlert?.('THÀNH CÔNG', 'Đã tạo tài khoản quản lý mới thành công!', 'success');
      } else if (staffRole === 'BUYER') {
        await api.register(payload);
        showAlert?.('THÀNH CÔNG', 'Đã tạo tài khoản khách hàng mới thành công!', 'success');
      } else {
        await api.createStaff(payload);
        showAlert?.('THÀNH CÔNG', 'Đã tạo tài khoản nhân viên mới thành công!', 'success');
      }

      setShowCreateStaffModal(false);
      // Clear form inputs
      setStaffEmail('');
      setStaffPassword('');
      setStaffFullName('');
      setStaffPhone('');
      setStaffAddress('');
      setStaffRole('STAFF');
      fetchUsers();
    } catch (error) {
      showAlert?.('LỖI TẠO TÀI KHOẢN', error.message || 'Không thể tạo tài khoản.', 'error');
    } finally {
      setIsSavingStaff(false);
    }
  };

  useEffect(() => {
    const managerMenus = ['analytics', 'categories', 'vouchers', 'users-management'];
    if (currentRole === 'staff' && managerMenus.includes(activeMenu)) {
      setActiveMenu('products-list');
      return;
    }

    if (activeMenu === 'analytics' && currentRole === 'manager') {
      loadStats();
    } else if (activeMenu === 'vouchers' && currentRole === 'manager') {
      fetchVouchers();
    } else if (activeMenu === 'users-management' && currentRole === 'manager') {
      fetchUsers();
    }
  }, [activeMenu, currentRole]);

  const customSelectedSizes = useMemo(
    () => selectedSizes.filter((size) => !PRESET_SIZES.some((preset) => preset.toLowerCase() === size.toLowerCase())),
    [selectedSizes]
  );

  const customSelectedColors = useMemo(
    () =>
      selectedColors.filter(
        (color) => !PRESET_COLORS.some((preset) => preset.name.toLowerCase() === color.name.toLowerCase())
      ),
    [selectedColors]
  );

  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const productsPageSize = 10;
  const totalProductsPages = Math.ceil(products.length / productsPageSize);
  const paginatedProducts = useMemo(() => {
    return products.slice((productsPage - 1) * productsPageSize, productsPage * productsPageSize);
  }, [products, productsPage]);

  const ordersPageSize = 10;
  const reversedOrders = useMemo(() => [...orders].reverse(), [orders]);
  const totalOrdersPages = Math.ceil(reversedOrders.length / ordersPageSize);
  const paginatedOrders = useMemo(() => {
    return reversedOrders.slice((ordersPage - 1) * ordersPageSize, ordersPage * ordersPageSize);
  }, [reversedOrders, ordersPage]);

  const usersPageSize = 10;
  const totalUsersPages = Math.ceil(users.length / usersPageSize);
  const paginatedUsers = useMemo(() => {
    return users.slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize);
  }, [users, usersPage]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCategories.length === 0) return;
    if (!activeCategories.some((category) => category.code === prodCategory)) {
      setProdCategory(activeCategories[0].code);
    }
  }, [activeCategories, prodCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      const normalized = (Array.isArray(response) ? response : [])
        .filter((item) => item?.code && item?.name)
        .map((item, index) => ({
          id: item.id ?? index + 1,
          code: item.code,
          name: item.name
        }));

      if (normalized.length > 0) {
        setCategories(normalized);
        if (onCategoriesChange) onCategoriesChange(normalized);
        return normalized;
      }
    } catch (error) {
      setCategories(DEFAULT_CATEGORIES);
      if (onCategoriesChange) onCategoriesChange(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }

    setCategories(DEFAULT_CATEGORIES);
    if (onCategoriesChange) onCategoriesChange(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  };

  const openEditForm = (prod) => {
    const imageUrl = (prod.images && prod.images.length > 0 ? prod.images[0] : prod.imageUrl) || '';
    setEditProductId(prod.id);
    setProdName(prod.name || '');
    setProdPrice(prod.price || '');
    setProdOriginalPrice(prod.originalPrice || prod.price || '');
    setProdCategory(prod.category || activeCategories[0]?.code || 'ao');
    setProdGender(prod.gender || 'Unisex');
    setProdInventory(prod.inventory || '50');
    setProdDesc(prod.description || '');
    setProdImageUrl(imageUrl);
    setProdImagePreview(imageUrl);
    setSelectedSizes(Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ['M']);
    setSelectedColors(
      Array.isArray(prod.colors) && prod.colors.length > 0
        ? prod.colors.map(normalizeColor).filter(Boolean)
        : [PRESET_COLORS[0]]
    );
    setCustomSizeInput('');
    setCustomColorName('');
    setCustomColorHex('#CFCFCF');
    setActiveMenu('add-product');
  };

  const openEditCategoryForm = (category) => {
    setEditCategoryId(category.id);
    setCategoryName(category.name || '');
    setCategoryCode(category.code || '');
  };

  const handleClearForm = () => {
    setEditProductId(null);
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdInventory('50');
    setProdDesc('');
    setProdImageUrl('');
    setProdImagePreview('');
    setProdCategory(activeCategories[0]?.code || 'ao');
    setProdGender('Unisex');
    setSelectedSizes(['M', 'L']);
    setSelectedColors([PRESET_COLORS[0], PRESET_COLORS[1]]);
    setCustomSizeInput('');
    setCustomColorName('');
    setCustomColorHex('#CFCFCF');
    setIsUploadingImage(false);
  };

  const clearCategoryForm = () => {
    setEditCategoryId(null);
    setCategoryName('');
    setCategoryCode('');
    setIsSavingCategory(false);
  };

  const handleToggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
      return;
    }
    setSelectedSizes([...selectedSizes, size]);
  };

  const handleToggleColor = (color) => {
    const normalized = normalizeColor(color);
    if (!normalized?.name) return;

    if (selectedColors.some((c) => c.name.toLowerCase() === normalized.name.toLowerCase())) {
      setSelectedColors(selectedColors.filter((c) => c.name.toLowerCase() !== normalized.name.toLowerCase()));
      return;
    }
    setSelectedColors([...selectedColors, normalized]);
  };

  const handleAddCustomSize = () => {
    const newSize = customSizeInput.trim();
    if (!newSize) return;
    if (selectedSizes.some((size) => size.toLowerCase() === newSize.toLowerCase())) {
      setCustomSizeInput('');
      return;
    }
    setSelectedSizes([...selectedSizes, newSize]);
    setCustomSizeInput('');
  };

  const handleAddCustomColor = () => {
    const name = customColorName.trim();
    if (!name) return;
    if (selectedColors.some((color) => color.name.toLowerCase() === name.toLowerCase())) {
      setCustomColorName('');
      return;
    }
    setSelectedColors([...selectedColors, { name, hex: customColorHex || '#CFCFCF' }]);
    setCustomColorName('');
    setCustomColorHex('#CFCFCF');
  };

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProdImagePreview(URL.createObjectURL(file));
    setIsUploadingImage(true);

    try {
      const result = await api.uploadProductImage(file);
      const uploadedUrl = result?.imageUrl || '';
      setProdImageUrl(uploadedUrl);
      setProdImagePreview(uploadedUrl || prodImagePreview);
    } catch (error) {
      setProdImageUrl('');
      if (showAlert) {
        showAlert('LỖI TẢI ẢNH', error.message || 'Không thể tải ảnh lên máy chủ.', 'error');
      }
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    const trimmedName = categoryName.trim();
    const resolvedCode = slugify(categoryCode.trim() || trimmedName);

    if (!trimmedName) {
      showAlert?.('THIẾU THÔNG TIN', 'Vui lòng nhập tên danh mục.', 'warning');
      return;
    }

    if (!resolvedCode) {
      showAlert?.('THÔNG TIN SAI', 'Mã danh mục không hợp lệ.', 'warning');
      return;
    }

    setIsSavingCategory(true);

    try {
      const payload = { name: trimmedName, code: resolvedCode };
      if (editCategoryId) {
        await api.updateCategory(editCategoryId, payload);
        showAlert?.('THÀNH CÔNG', `Đã cập nhật danh mục "${trimmedName}".`, 'success');
      } else {
        await api.createCategory(payload);
        showAlert?.('THÀNH CÔNG', `Đã thêm danh mục "${trimmedName}".`, 'success');
      }

      await fetchCategories();
      clearCategoryForm();
    } catch (error) {
      showAlert?.('LỖI DANH MỤC', error.message || 'Không thể lưu danh mục.', 'error');
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!category?.id) {
      showAlert?.('LỖI DANH MỤC', 'Không tìm thấy danh mục để xóa.', 'error');
      return;
    }

    const isCurrentCategorySelected = prodCategory === category.code;

    try {
      await api.deleteCategory(category.id);
      const refreshedCategories = await fetchCategories();

      if (isCurrentCategorySelected) {
        setProdCategory(refreshedCategories?.[0]?.code || DEFAULT_CATEGORIES[0]?.code || 'ao');
      }
      if (editCategoryId === category.id) {
        clearCategoryForm();
      }

      showAlert?.('THÀNH CÔNG', `Đã xóa danh mục "${category.name}".`, 'success');
    } catch (error) {
      showAlert?.('KHÔNG THỂ XÓA', error.message || 'Danh mục đang được sử dụng hoặc không thể xóa.', 'error');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!prodName.trim()) {
      showAlert?.('THIẾU THÔNG TIN', 'Vui lòng nhập tên sản phẩm.', 'warning');
      return;
    }
    if (!prodPrice || isNaN(prodPrice) || Number(prodPrice) <= 0) {
      showAlert?.('THÔNG TIN SAI', 'Vui lòng nhập giá bán hợp lệ.', 'warning');
      return;
    }
    if (!prodInventory || isNaN(prodInventory) || Number(prodInventory) < 0) {
      showAlert?.('THÔNG TIN SAI', 'Vui lòng nhập số lượng tồn kho hợp lệ.', 'warning');
      return;
    }
    if (!prodImageUrl.trim()) {
      showAlert?.('THIẾU ẢNH', 'Vui lòng chọn ảnh sản phẩm từ máy.', 'warning');
      return;
    }

    const selectedCategory = activeCategories.find((category) => category.code === prodCategory);
    const uniqueColors = selectedColors
      .map(normalizeColor)
      .filter((color) => color?.name)
      .filter((color, index, arr) => arr.findIndex((item) => item.name.toLowerCase() === color.name.toLowerCase()) === index);

    const newProduct = {
      name: prodName.trim(),
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : Number(prodPrice),
      category: prodCategory,
      categoryLabel: selectedCategory?.name || prodCategory,
      gender: prodGender,
      sizes: selectedSizes.length > 0 ? selectedSizes : ['One Size'],
      colors: uniqueColors.length > 0 ? uniqueColors : [{ name: 'Mặc định', hex: '#CCCCCC' }],
      imageUrl: prodImageUrl.trim(),
      images: [prodImageUrl.trim()],
      description: prodDesc.trim() || 'Sản phẩm thời trang chất lượng cao.',
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
    setActiveMenu('products-list');
  };


  const totalRevenue = orders
    .filter((o) => o.status === 'Đã giao')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const activeProductsCount = products.length;
  const outOfStockCount = products.filter((p) => p.inventory < 5 && p.status === 'approved').length;

  return (
    <div className="container admin-layout">
      <div className="admin-sidebar animate-fade">
        <div className="role-badge-box">
          <span className="role-badge-title">Phân Quyền Hệ Thống</span>
          <span className="role-badge-name" style={{
            background: currentRole === 'manager' ? '#e8f5e9' : '#fff3e0',
            color: currentRole === 'manager' ? '#2e7d32' : '#f57c00'
          }}>
            <ShieldCheck size={20} />
            <span>{currentRole === 'manager' ? 'Quản Lý' : 'Nhân Viên'}</span>
          </span>
        </div>

        <div className="admin-menu">
          {currentRole === 'manager' && (
            <button className={`admin-menu-item ${activeMenu === 'analytics' ? 'active' : ''}`} onClick={() => setActiveMenu('analytics')}>
              <BarChart3 size={16} />
              <span>Thống Kê Doanh Thu</span>
            </button>
          )}

          <button className={`admin-menu-item ${activeMenu === 'products-list' ? 'active' : ''}`} onClick={() => setActiveMenu('products-list')}>
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

          {currentRole === 'manager' && (
            <button
              className={`admin-menu-item ${activeMenu === 'categories' ? 'active' : ''}`}
              onClick={() => {
                clearCategoryForm();
                setActiveMenu('categories');
              }}
            >
              <Tag size={16} />
              <span>Thêm / Sửa Danh Mục</span>
            </button>
          )}

          <button className={`admin-menu-item ${activeMenu === 'orders-list' ? 'active' : ''}`} onClick={() => setActiveMenu('orders-list')}>
            <ShoppingBag size={16} />
            <span>Quản Lý Đơn Hàng ({orders.length})</span>
          </button>

          {currentRole === 'manager' && (
            <button className={`admin-menu-item ${activeMenu === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveMenu('vouchers')}>
              <Tag size={16} />
              <span>Quản Lý Voucher</span>
            </button>
          )}

          {currentRole === 'manager' && (
            <button className={`admin-menu-item ${activeMenu === 'users-management' ? 'active' : ''}`} onClick={() => setActiveMenu('users-management')}>
              <User size={16} />
              <span>Quản Lý Người Dùng</span>
            </button>
          )}
        </div>
      </div>

      <div className="admin-content-card animate-fade">
        {/* =========================================================================
           TAB: ANALYTICS (MANAGER ONLY)
           ========================================================================= */}
        {activeMenu === 'analytics' && currentRole === 'manager' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Báo Cáo Doanh Thu & Hệ Thống</h2>

            {/* SUB-TABS FOR ANALYTICS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <button 
                type="button"
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontWeight: 600, 
                  fontSize: '13px',
                  background: analyticsTab === 'overview' ? 'var(--primary)' : 'transparent',
                  color: analyticsTab === 'overview' ? '#fff' : 'var(--secondary-muted)',
                  border: '1px solid ' + (analyticsTab === 'overview' ? 'var(--primary)' : 'var(--border-light)'),
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setAnalyticsTab('overview')}
              >
                Tổng Quan Doanh Thu
              </button>
              <button 
                type="button"
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontWeight: 600, 
                  fontSize: '13px',
                  background: analyticsTab === 'funnel' ? 'var(--primary)' : 'transparent',
                  color: analyticsTab === 'funnel' ? '#fff' : 'var(--secondary-muted)',
                  border: '1px solid ' + (analyticsTab === 'funnel' ? 'var(--primary)' : 'var(--border-light)'),
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setAnalyticsTab('funnel')}
              >
                Phễu Chuyển Đổi (Funnel)
              </button>
              <button 
                type="button"
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontWeight: 600, 
                  fontSize: '13px',
                  background: analyticsTab === 'products-customers' ? 'var(--primary)' : 'transparent',
                  color: analyticsTab === 'products-customers' ? '#fff' : 'var(--secondary-muted)',
                  border: '1px solid ' + (analyticsTab === 'products-customers' ? 'var(--primary)' : 'var(--border-light)'),
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setAnalyticsTab('products-customers')}
              >
                Sản Phẩm & Khách Hàng
              </button>
              <button 
                type="button"
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontWeight: 600, 
                  fontSize: '13px',
                  background: analyticsTab === 'inventory' ? 'var(--primary)' : 'transparent',
                  color: analyticsTab === 'inventory' ? '#fff' : 'var(--secondary-muted)',
                  border: '1px solid ' + (analyticsTab === 'inventory' ? 'var(--primary)' : 'var(--border-light)'),
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setAnalyticsTab('inventory')}
              >
                Cảnh Báo Tồn Kho
              </button>
            </div>

            {isLoadingStats ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--secondary-muted)' }}>
                <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 10px' }} />
                <p>Đang tải dữ liệu thống kê từ hệ thống...</p>
              </div>
            ) : (
              <>
                {/* 1. TỔNG QUAN DOANH THU */}
                {analyticsTab === 'overview' && (
                  <div className="animate-fade">
                    <div className="admin-stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon-wrapper revenue">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <div className="stat-value" style={{ whiteSpace: 'nowrap' }}>{(revenueStats?.totalRevenue ?? totalRevenue).toLocaleString('vi-VN') + '\u00a0₫'}</div>
                          <div className="stat-label">Doanh thu thực tế</div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon-wrapper orders">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <div className="stat-value">{revenueStats?.totalOrders ?? orders.length} Đơn</div>
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

                    <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} />
                        <span>{monthlyRevenue.length > 0 ? 'Doanh Thu Thực Tế Theo Tháng (VND)' : 'Doanh Thu Ước Tính Theo Tuần (VND)'}</span>
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '12px', padding: '0 20px', marginTop: '10px', overflowX: 'auto' }}>
                        {(monthlyRevenue.length > 0 
                          ? monthlyRevenue.map(item => ({ name: item.period, val: item.revenue }))
                          : [
                              { name: 'Tuần 1', val: totalRevenue * 0.25 || 2500000 },
                              { name: 'Tuần 2', val: totalRevenue * 0.35 || 4200000 },
                              { name: 'Tuần 3', val: totalRevenue * 0.2 || 3100000 },
                              { name: 'Tuần 4 (Hiện tại)', val: totalRevenue || 7500000 }
                            ]
                        ).map((item, idx, arr) => {
                          const maxVal = Math.max(...arr.map(a => a.val)) || 10000000;
                          const percent = Math.min((item.val / maxVal) * 80, 80);

                          return (
                            <div key={idx} style={{ flex: 1, minWidth: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{item.val.toLocaleString('vi-VN') + '\u00a0₫'}</span>
                              <div
                                style={{
                                  width: '100%',
                                  maxWidth: '36px',
                                  height: `${percent + 20}px`,
                                  background: idx === arr.length - 1 ? 'var(--primary-gradient)' : '#bbb',
                                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                  boxShadow: idx === arr.length - 1 ? '0 4px 15px rgba(255,87,34,0.3)' : '',
                                  transition: 'height 0.5s ease-out'
                                }}
                              />
                              <span style={{ fontSize: '11px', color: 'var(--secondary-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PHỄU CHUYỂN ĐỔI */}
                {analyticsTab === 'funnel' && funnelStats && (
                  <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '30px' }} className="animate-fade">
                    <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={18} />
                      <span>📊 PHỄU CHUYỂN ĐỔI DOANH SỐ (HÀNH TRÌNH KHÁCH HÀNG)</span>
                    </h3>

                    <div className="funnel-chart-wrapper">
                      {/* Bước 1: VIEW_PRODUCT */}
                      <div className="funnel-row">
                        <div className="funnel-label-col">
                          <div className="funnel-icon-circle bg-view">
                            <Eye size={16} />
                          </div>
                          <div className="funnel-step-name">
                            <span className="step-title">1. Xem Sản Phẩm</span>
                            <span className="step-subtitle">Khách vãng lai xem chi tiết</span>
                          </div>
                        </div>
                        <div className="funnel-bar-col">
                          <div className="funnel-bar bar-view" style={{ width: '100%' }}>
                            <span className="funnel-bar-value">{funnelStats.viewsCount} phiên (sessions)</span>
                          </div>
                        </div>
                        <div className="funnel-rate-col">
                          <span className="funnel-rate-main">100%</span>
                          <span className="funnel-rate-sub">Mốc bắt đầu</span>
                        </div>
                      </div>

                      {/* Bước 2: ADD_TO_CART */}
                      <div className="funnel-row">
                        <div className="funnel-label-col">
                          <div className="funnel-icon-circle bg-cart">
                            <ShoppingCart size={16} />
                          </div>
                          <div className="funnel-step-name">
                            <span className="step-title">2. Thêm Vào Giỏ Hàng</span>
                            <span className="step-subtitle">Click Thêm Giỏ / Mua Ngay</span>
                          </div>
                        </div>
                        <div className="funnel-bar-col">
                          <div className="funnel-bar bar-cart" style={{ width: `${Math.max(12, funnelStats.viewToCartRate)}%` }}>
                            <span className="funnel-bar-value">{funnelStats.cartCount} phiên ({funnelStats.viewToCartRate}%)</span>
                          </div>
                        </div>
                        <div className="funnel-rate-col">
                          <span className="funnel-rate-main">{funnelStats.viewToCartRate}%</span>
                          <span className="funnel-rate-sub">từ Lượt xem</span>
                        </div>
                      </div>

                      {/* Bước 3: INITIATE_CHECKOUT */}
                      <div className="funnel-row">
                        <div className="funnel-label-col">
                          <div className="funnel-icon-circle bg-checkout">
                            <CreditCard size={16} />
                          </div>
                          <div className="funnel-step-name">
                            <span className="step-title">3. Đi Đến Thanh Toán</span>
                            <span className="step-subtitle">Vào trang thanh toán (Checkout)</span>
                          </div>
                        </div>
                        <div className="funnel-bar-col">
                          <div className="funnel-bar bar-checkout" style={{ width: `${Math.max(12, (funnelStats.viewsCount > 0 ? (funnelStats.checkoutCount * 100.0 / funnelStats.viewsCount) : 0))}%` }}>
                            <span className="funnel-bar-value">{funnelStats.checkoutCount} phiên ({Math.round(funnelStats.checkoutCount * 100.0 / (funnelStats.viewsCount || 1)) * 10 / 10}%)</span>
                          </div>
                        </div>
                        <div className="funnel-rate-col">
                          <span className="funnel-rate-main">{funnelStats.cartToCheckoutRate}%</span>
                          <span className="funnel-rate-sub">từ Giỏ hàng</span>
                        </div>
                      </div>

                      {/* Bước 4: PURCHASE */}
                      <div className="funnel-row">
                        <div className="funnel-label-col">
                          <div className="funnel-icon-circle bg-purchase">
                            <CheckCircle size={16} />
                          </div>
                          <div className="funnel-step-name">
                            <span className="step-title">4. Mua Hàng Thành Công</span>
                            <span className="step-subtitle">Xác nhận đặt hàng thành công</span>
                          </div>
                        </div>
                        <div className="funnel-bar-col">
                          <div className="funnel-bar bar-purchase" style={{ width: `${Math.max(12, funnelStats.overallConversionRate)}%` }}>
                            <span className="funnel-bar-value">{funnelStats.purchaseCount} phiên ({funnelStats.overallConversionRate}%)</span>
                          </div>
                        </div>
                        <div className="funnel-rate-col">
                          <span className="funnel-rate-main" style={{ color: 'var(--primary)', fontWeight: 800 }}>{funnelStats.overallConversionRate}%</span>
                          <span className="funnel-rate-sub">Tỉ lệ chuyển đổi cuối</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SẢN PHẨM & KHÁCH HÀNG */}
                {analyticsTab === 'products-customers' && (
                  <div className="admin-form-grid animate-fade" style={{ alignItems: 'start', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Top Selling Products */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)' }}>🏆 TOP SẢN PHẨM BÁN CHẠY</h3>
                      <table className="admin-table" style={{ fontSize: '12.5px' }}>
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th style={{ textAlign: 'center' }}>Đã bán</th>
                            <th style={{ textAlign: 'right' }}>Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.length === 0 ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--secondary-muted)' }}>Chưa có dữ liệu</td></tr>
                          ) : (
                            topProducts.map((p) => (
                              <tr key={p.productId}>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <img src={p.imageUrl} alt="" style={{ width: '30px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                                    <div style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={p.productName}>{p.productName}</div>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 700 }}>{p.totalQuantitySold}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{p.totalRevenue.toLocaleString('vi-VN') + '\u00a0₫'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* VIP Customers */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)' }}>💎 KHÁCH HÀNG VIP (CHI TIÊU NHIỀU)</h3>
                      <table className="admin-table" style={{ fontSize: '12.5px' }}>
                        <thead>
                          <tr>
                            <th>Khách hàng</th>
                            <th style={{ textAlign: 'center' }}>Số đơn</th>
                            <th style={{ textAlign: 'right' }}>Chi tiêu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vipCustomers.length === 0 ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--secondary-muted)' }}>Chưa có dữ liệu</td></tr>
                          ) : (
                            vipCustomers.map((c) => (
                              <tr key={c.userId}>
                                <td>
                                  <div>
                                    <div style={{ fontWeight: 600 }}>{c.fullName}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>{c.email}</div>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.totalOrders} đơn</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{c.totalSpent.toLocaleString('vi-VN') + '\u00a0₫'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. CẢNH BÁO TỒN KHO & MẸO QUẢN LÝ */}
                {analyticsTab === 'inventory' && (
                  <div className="animate-fade">
                    <div style={{ background: 'white', padding: '25px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={18} />
                        <span>⚠️ CẢNH BÁO TỒN KHO THẤP (CẦN NHẬP THÊM HÀNG)</span>
                      </h3>
                      <table className="admin-table" style={{ fontSize: '12.5px' }}>
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Số lượng tồn</th>
                            <th>Ngưỡng cảnh báo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockWarning.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--secondary-muted)' }}>Tất cả sản phẩm đều đủ lượng tồn kho!</td></tr>
                          ) : (
                            lowStockWarning.map((p) => (
                              <tr key={p.productId}>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <img src={p.imageUrl} alt="" style={{ width: '30px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                                    <div style={{ fontWeight: 600 }}>{p.productName}</div>
                                  </div>
                                </td>
                                <td>{p.category}</td>
                                <td style={{ fontWeight: 700, color: '#c62828' }}>{p.stockQuantity} cái</td>
                                <td style={{ color: 'var(--secondary-muted)' }}>{p.threshold} cái</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', padding: '20px', background: '#e3f2fd', borderRadius: 'var(--radius-md)', color: '#0d47a1', fontSize: '14px', alignItems: 'center', marginTop: '30px' }}>
                      <InfoIcon />
                      <span><strong>Mẹo Quản Lý:</strong> Dữ liệu trên được thống kê thời gian thực từ hoạt động mua sắm của khách hàng. Hãy theo dõi cảnh báo tồn kho để bổ sung hàng hóa kịp thời.</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* =========================================================================
           TAB: PRODUCT LIST (MANAGER)
           ========================================================================= */}
        {activeMenu === 'products-list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Quản Lý Toàn Bộ Sản Phẩm</h2>
              <button className="btn-admin-submit" onClick={() => setActiveMenu('add-product')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
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
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                      Không có sản phẩm nào trong hệ thống!
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((prod) => (
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
                      <td style={{ fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{prod.price.toLocaleString('vi-VN') + '\u00a0₫'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: prod.inventory < 5 ? '#c62828' : 'inherit' }}>{prod.inventory} cái</span>
                        {prod.inventory < 5 && <span style={{ color: '#c62828', fontSize: '10px', marginLeft: '6px', fontWeight: 700 }}>(Sắp hết!)</span>}
                      </td>
                      <td>{prod.categoryLabel || prod.category}</td>
                      <td>
                        <span className={`admin-status-pill ${prod.status}`} style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          textAlign: 'center',
                          background: prod.status === 'approved' ? '#e8f5e9' : 
                                      prod.status === 'pending' ? '#fff3e0' : 
                                      prod.status === 'rejected' ? '#ffebee' : '#eceff1',
                          color: prod.status === 'approved' ? '#2e7d32' : 
                                 prod.status === 'pending' ? '#f57c00' : 
                                 prod.status === 'rejected' ? '#c62828' : '#455a64'
                        }}>
                          {prod.status === 'approved' ? 'Đang bán' : 
                           prod.status === 'pending' ? 'Chờ duyệt' : 
                           prod.status === 'rejected' ? 'Bị từ chối' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {currentRole === 'manager' && prod.status === 'pending' && (
                            <>
                              <button onClick={() => onUpdateProductStatus(prod.id, 'approved')} style={{ color: '#2e7d32', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }} title="Phê Duyệt">
                                <Check size={16} />
                              </button>
                              <button onClick={() => onUpdateProductStatus(prod.id, 'rejected')} style={{ color: '#c62828', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }} title="Từ Chối">
                                <X size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => openEditForm(prod)} style={{ color: 'var(--primary)', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }} title="Sửa Sản Phẩm">
                            <Edit size={16} />
                          </button>
                          {currentRole === 'manager' && (
                            <button onClick={() => onDeleteProduct(prod.id)} style={{ color: '#c62828', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }} title="Xóa Sản Phẩm">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination currentPage={productsPage} totalPages={totalProductsPages} onPageChange={setProductsPage} />
          </div>
        )}

        {activeMenu === 'categories' && currentRole === 'manager' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Quản Lý Danh Mục</h2>
                <p style={{ fontSize: '13px', color: 'var(--secondary-muted)' }}>
                  Admin có thể thêm mới hoặc sửa mã/tên danh mục. Khi đổi mã, sản phẩm cũ sẽ được cập nhật theo.
                </p>
              </div>
            </div>

            <div className="admin-form-grid" style={{ alignItems: 'start' }}>
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên danh mục</th>
                      <th>Mã</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCategories.map((category) => (
                      <tr key={category.id ?? category.code}>
                        <td style={{ fontWeight: 600 }}>{category.name}</td>
                        <td><code>{category.code}</code></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => openEditCategoryForm(category)} style={{ color: 'var(--primary)', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }} title="Sua Danh Muc">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteCategory(category)} style={{ color: '#c62828', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }} title="Xoa Danh Muc">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
                  {editCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                </h3>

                <form onSubmit={handleCategorySubmit}>
                  <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label">Tên danh mục *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Ví dụ: Áo sơ mi"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                    <label className="input-label">Mã danh mục *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Vi du: ao-so-mi"
                      value={categoryCode}
                      onChange={(e) => setCategoryCode(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--secondary-muted)', marginBottom: '20px' }}>
                    Mã sẽ được chuẩn hóa tự động thành dạng không dấu và có dấu gạch nối.
                  </div>

                  <div className="admin-form-actions">
                    <button type="button" className="btn-admin-cancel" onClick={clearCategoryForm}>
                      Hủy
                    </button>
                    <button type="submit" className="btn-admin-submit" disabled={isSavingCategory}>
                      {editCategoryId ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
              Quản lý có thể chọn size/màu mặc định hoặc tự nhập thêm theo sản phẩm thực tế.
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-section-title">1. Thông tin chung sản phẩm</div>

              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label className="input-label">Tên sản phẩm *</label>
                  <input type="text" placeholder="Ví dụ: Áo Khoác Bomber Jusstlife Premium..." className="admin-input" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Giá Bán Đề Xuất * (VND)</label>
                  <input type="number" placeholder="Ví dụ: 299000" className="admin-input" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Giá Gốc Gạch Ngang (Nếu có)</label>
                  <input type="number" placeholder="Ví dụ: 450000" className="admin-input" value={prodOriginalPrice} onChange={(e) => setProdOriginalPrice(e.target.value)} />
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Phân Loại Danh Mục *</label>
                  <select className="admin-input" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                    {activeCategories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Phân Phối Giới Tính *</label>
                  <select className="admin-input" value={prodGender} onChange={(e) => setProdGender(e.target.value)}>
                    <option value="Unisex">Unisex (Cả nam và nữ)</option>
                    <option value="Men">Nam (Men)</option>
                    <option value="Women">Nữ (Women)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Số Lượng Nhập Kho Tồn *</label>
                  <input type="number" className="admin-input" value={prodInventory} onChange={(e) => setProdInventory(e.target.value)} required />
                </div>
              </div>

              <div className="admin-form-section-title">2. Kích thước & Bảng màu</div>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="input-label">Kích thước hỗ trợ (Chọn nhiều)</label>
                  <div className="size-select-row">
                    {PRESET_SIZES.map((size) => {
                      const isActive = selectedSizes.includes(size);
                      return (
                        <div key={size} className={`size-checkbox-btn ${isActive ? 'active' : ''}`} onClick={() => handleToggleSize(size)}>
                          {size}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Thêm size khác, ví dụ: XXL, 38, 39"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                    />
                    <button type="button" className="btn-admin-submit" style={{ whiteSpace: 'nowrap' }} onClick={handleAddCustomSize}>
                      Thêm size
                    </button>
                  </div>
                  {customSelectedSizes.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {customSelectedSizes.map((size) => (
                        <span key={size} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '999px', background: '#f5f5f5', fontSize: '13px' }}>
                          {size}
                          <button type="button" onClick={() => handleToggleSize(size)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="input-label">Màu sắc (Chọn nhiều)</label>
                  <div className="color-select-row">
                    {PRESET_COLORS.map((col) => {
                      const isActive = selectedColors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 110px auto', gap: '10px', marginTop: '12px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Thêm màu khác, ví dụ: Xanh rêu"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomColor();
                        }
                      }}
                    />
                    <input type="color" className="admin-input" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)} style={{ padding: '6px' }} />
                    <button type="button" className="btn-admin-submit" style={{ whiteSpace: 'nowrap' }} onClick={handleAddCustomColor}>
                      Thêm màu
                    </button>
                  </div>
                  {customSelectedColors.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {customSelectedColors.map((color) => (
                        <span key={color.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', background: '#f5f5f5', fontSize: '13px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.hex, border: '1px solid #ddd' }} />
                          {color.name}
                          <button type="button" onClick={() => handleToggleColor(color)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-section-title">3. Hình ảnh & Mô tả chi tiết</div>
              <div className="admin-form-grid" style={{ marginBottom: '20px' }}>
                <div className="admin-form-group full-width">
                  <label className="input-label">Ảnh sản phẩm từ máy</label>
                  <input type="file" accept="image/*" className="admin-input" onChange={handleImageFileChange} />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--secondary-muted)' }}>
                    {isUploadingImage ? 'Đang tải ảnh lên...' : prodImageUrl ? 'Ảnh đã sẵn sàng để lưu sản phẩm.' : 'Chọn ảnh trực tiếp từ máy tính.'}
                  </div>
                </div>

                <div className="admin-form-group full-width">
                  <label className="input-label">Hoặc nhập URL ảnh trực tuyến (Khuyên dùng để lưu trữ lâu dài)</label>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ" 
                    className="admin-input" 
                    value={prodImageUrl} 
                    onChange={(e) => {
                      setProdImageUrl(e.target.value);
                      setProdImagePreview(e.target.value);
                    }} 
                  />
                  {prodImagePreview && (
                    <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'inline-block' }}>
                      <img src={prodImagePreview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-group full-width">
                  <label className="input-label">Mô tả đặc điểm nổi bật</label>
                  <textarea placeholder="Chất liệu cotton 100%, dày dặn, phom suông rộng trẻ trung, co giãn tốt..." className="admin-textarea" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} />
                </div>
              </div>

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
                <button type="submit" className="btn-admin-submit" disabled={isUploadingImage}>
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
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Quản Lý Đơn Đặt Hàng Của Khách</h2>

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
                  paginatedOrders.map((order) => {
                    let statusColor = '#f57f17';
                    if (order.status === 'Đang giao') statusColor = '#1565c0';
                    if (order.status === 'Đã giao') statusColor = '#2e7d32';
                    if (order.status === 'Hủy đơn') statusColor = '#c62828';

                    return (
                      <tr key={order.id}>
                        <td><span style={{ fontWeight: 700, fontSize: '13px' }}>#{order.id}</span></td>
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
                        <td style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{order.totalPrice.toLocaleString('vi-VN') + '\u00a0₫'}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                            <strong>{order.paymentMethod}</strong>
                            <span style={{ 
                              color: order.paymentStatus === 'PAID' ? '#2e7d32' : 
                                     order.paymentStatus === 'REFUNDED' ? '#c62828' : 'var(--secondary-muted)',
                              fontWeight: order.paymentStatus === 'PAID' ? 700 : 'normal'
                            }}>
                              {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 
                               order.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: statusColor, background: `${statusColor}1A`, padding: '4px 8px', borderRadius: '4px' }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {order.status === 'Chờ xử lý' && (
                              <button className="btn-approve" onClick={() => onUpdateOrderStatus(order.id, 'Đang giao')} style={{ padding: '4px 8px' }}>
                                Giao hàng
                              </button>
                            )}

                            {order.status === 'Đang giao' && (
                              <button className="btn-approve" onClick={() => onUpdateOrderStatus(order.id, 'Đã giao')} style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px' }}>
                                Đã giao
                              </button>
                            )}

                            {(order.status === 'Chờ xử lý' || order.status === 'Đang giao') && currentRole === 'manager' && (
                              <button className="btn-reject" onClick={() => onUpdateOrderStatus(order.id, 'Hủy đơn')} style={{ padding: '4px 8px' }}>
                                Hủy đơn
                              </button>
                            )}

                            {order.status === 'Đã giao' && <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>Hoàn tất</span>}
                            {order.status === 'Hủy đơn' && <span style={{ fontSize: '11px', color: '#c62828', fontWeight: 600 }}>Đã hủy</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <Pagination currentPage={ordersPage} totalPages={totalOrdersPages} onPageChange={setOrdersPage} />
          </div>
        )}

        {activeMenu === 'vouchers' && currentRole === 'manager' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Quản Lý Mã Giảm Giá (Vouchers)</h2>
            <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', marginBottom: '24px' }}>
              Quản trị viên có thể xem các voucher hiện có, xóa voucher hết hạn hoặc tạo mới voucher cho các chương trình tiếp thị.
            </p>

            <div className="admin-form-grid" style={{ alignItems: 'start' }}>
              {/* Voucher list */}
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Code</th>
                      <th>Giảm Giá</th>
                      <th style={{ textAlign: 'center' }}>Đã dùng / Tối đa</th>
                      <th>Hạn sử dụng</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                          Chưa có mã giảm giá nào được phát hành!
                        </td>
                      </tr>
                    ) : (
                      vouchers.map((v) => {
                        const isExpired = v.expiryDate && new Date(v.expiryDate) < new Date();
                        const isMaxedOut = v.usedCount >= v.maxUses;

                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 700 }}>
                              <span style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', border: '1px dashed #ccc' }}>
                                {v.code}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.discountPercent}%</td>
                            <td style={{ textAlign: 'center' }}>{v.usedCount} / {v.maxUses}</td>
                            <td style={{ color: isExpired || isMaxedOut ? '#c62828' : 'inherit' }}>
                              {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                              {isExpired && <span style={{ fontSize: '10px', marginLeft: '6px', fontWeight: 700 }}>(Hết hạn)</span>}
                              {isMaxedOut && <span style={{ fontSize: '10px', marginLeft: '6px', fontWeight: 700 }}>(Hết lượt)</span>}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteVoucher(v.id)}
                                style={{ color: '#c62828', cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px' }}
                                title="Xóa Voucher"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Voucher Form */}
              <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Thêm Voucher Mới</h3>
                <form onSubmit={handleVoucherSubmit}>
                  <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label">Mã Giảm Giá *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Ví dụ: WINTER20"
                      value={vCode}
                      onChange={(e) => setVCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label">Phần Trăm Giảm Giá * (1-100)</label>
                    <input
                      type="number"
                      className="admin-input"
                      placeholder="Ví dụ: 20"
                      min="1"
                      max="100"
                      value={vDiscount}
                      onChange={(e) => setVDiscount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label">Số Lượt Sử Dụng Tối Đa *</label>
                    <input
                      type="number"
                      className="admin-input"
                      placeholder="Ví dụ: 100"
                      min="1"
                      value={vMaxUses}
                      onChange={(e) => setVMaxUses(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '24px' }}>
                    <label className="input-label">Hạn Sử Dụng (Để trống nếu vô hạn)</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={vExpiryDate}
                      onChange={(e) => setVExpiryDate(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="button"
                      className="btn-admin-cancel"
                      onClick={() => {
                        setVCode('');
                        setVDiscount('');
                        setVMaxUses('100');
                        setVExpiryDate('');
                      }}
                    >
                      Nhập lại
                    </button>
                    <button type="submit" className="btn-admin-submit" disabled={isSavingVoucher}>
                      {isSavingVoucher ? 'Đang lưu...' : 'Tạo Voucher'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'users-management' && currentRole === 'manager' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Quản Lý Người Dùng & Nhân Viên</h2>
                <p style={{ fontSize: '13px', color: 'var(--secondary-muted)' }}>
                  Quản lý danh sách khách hàng (Buyer), thay đổi trạng thái hoạt động (Khóa/Mở khóa), hoặc tạo tài khoản Nhân viên (Staff) mới.
                </p>
              </div>
              <button className="btn-admin-submit" onClick={() => setShowCreateStaffModal(true)}>
                + Tạo Tài Khoản Nhân Viên
              </button>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '500px' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="Tìm kiếm người dùng theo Email, Tên hoặc SĐT..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <button type="submit" className="btn-admin-submit" style={{ whiteSpace: 'nowrap' }}>
                Tìm kiếm
              </button>
            </form>

            {/* Users Table */}
            {isUsersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px' }} />
                <p>Đang tải danh sách người dùng...</p>
              </div>
            ) : (
              <>
                <table className="admin-table">
                <thead>
                  <tr>
                    <th>Khách hàng / Nhân viên</th>
                    <th>Thông tin liên hệ</th>
                    <th>Địa chỉ</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--secondary-muted)' }}>
                        Không tìm thấy người dùng nào!
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span style={{ fontWeight: 600 }}>{u.fullName}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              <div>{u.email}</div>
                              <div style={{ color: 'var(--secondary-muted)' }}>{u.phone || 'Chưa cung cấp SĐT'}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.address}>
                            {u.address || 'Chưa cung cấp'}
                          </td>
                          <td>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: u.role === 'manager' ? '#e8f5e9' : u.role === 'staff' ? '#fff3e0' : '#eceff1',
                              color: u.role === 'manager' ? '#2e7d32' : u.role === 'staff' ? '#f57c00' : '#455a64'
                            }}>
                              {u.role === 'manager' ? 'Quản lý' : u.role === 'staff' ? 'Nhân viên' : 'Buyer'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: u.accountStatus === 'ACTIVE' ? '#2e7d32' : '#c62828'
                            }}>
                              {u.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {/* Role selection dropdown (Manager only, cannot edit other managers) */}
                              {currentRole === 'manager' && u.role !== 'manager' && (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-light)',
                                    background: '#fff',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="customer">Buyer</option>
                                  <option value="staff">Nhân viên</option>
                                  <option value="manager">Quản lý</option>
                                </select>
                              )}

                              {u.role === 'customer' || u.role === 'buyer' || u.role === 'staff' ? (
                                <button
                                  className={u.accountStatus === 'ACTIVE' ? "btn-reject" : "btn-approve"}
                                  onClick={() => handleToggleUserStatus(u.id, u.accountStatus)}
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                >
                                  {u.accountStatus === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                                </button>
                              ) : (
                                u.role === 'manager' && <span style={{ fontSize: '11px', color: 'var(--secondary-muted)', fontStyle: 'italic' }}>Không thể tác vụ</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <Pagination currentPage={usersPage} totalPages={totalUsersPages} onPageChange={setUsersPage} />
            </>
          )}

            {/* Create Staff Modal */}
            {showCreateStaffModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  width: '100%',
                  maxWidth: '500px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-lg)'
                }} className="animate-fade">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Tạo Tài Khoản Mới</h3>
                    <button onClick={() => setShowCreateStaffModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateStaffSubmit}>
                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Vai trò tài khoản *</label>
                      <select
                        className="admin-input"
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        style={{ background: '#fff', cursor: 'pointer' }}
                      >
                        <option value="STAFF">Nhân viên (Staff)</option>
                        <option value="MANAGER">Quản lý (Manager)</option>
                        <option value="BUYER">Khách hàng (Buyer)</option>
                      </select>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Email đăng nhập *</label>
                      <input
                        type="email"
                        className="admin-input"
                        placeholder="email@jusstlife.com"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Mật khẩu *</label>
                      <input
                        type="password"
                        className="admin-input"
                        placeholder="Nhập mật khẩu cho nhân viên"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Họ và tên nhân viên *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={staffFullName}
                        onChange={(e) => setStaffFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Số điện thoại</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ví dụ: 0987654321"
                        value={staffPhone}
                        onChange={(e) => setStaffPhone(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                      <label className="input-label">Địa chỉ</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ví dụ: Văn phòng Jusstlife"
                        value={staffAddress}
                        onChange={(e) => setStaffAddress(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-actions">
                      <button type="button" className="btn-admin-cancel" onClick={() => setShowCreateStaffModal(false)}>
                        Hủy bỏ
                      </button>
                      <button type="submit" className="btn-admin-submit" disabled={isSavingStaff}>
                        {isSavingStaff ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}
