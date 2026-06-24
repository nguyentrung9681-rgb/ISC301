import React, { useState, useEffect } from 'react';
import { initialProducts } from './data/initialProducts';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import AdminPortal from './components/AdminPortal';
import Toast from './components/Toast';
import LoginModal from './components/LoginModal';
import AlertModal from './components/AlertModal';
import WishlistModal from './components/WishlistModal';
import ProfilePage from './components/ProfilePage';
import { api } from "./api/login.js";

// Icon imports from lucide-react
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Lock,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Filter,
  RefreshCw,
  X,
  AlertCircle,
  XCircle,
  Check
} from 'lucide-react';

const parseImages = (imgUrl) => {
  if (!imgUrl) return ['https://via.placeholder.com/400x500'];
  try {
    const parsed = JSON.parse(imgUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) { }
  return [imgUrl];
};

export default function App() {
  // --- CORE SYSTEM STATES (Synced with LocalStorage) ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);


  // --- AUTHENTICATION MOCK ACCOUNTS ---
  const DEMO_USERS = [
    { email: 'manager@jusstlife.com', password: 'manager123', role: 'manager', name: 'Nguyễn Quản Lý', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { email: 'customer@jusstlife.com', password: 'customer123', role: 'customer', name: 'Lê Khách Hàng', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }
  ];

  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('jusst_user');
    return local ? JSON.parse(local) : null;
  });

  // Keep token if we eventually add one, currently just mock or store the user obj


  const [showLoginModal, setShowLoginModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');

  // --- NAVIGATION & PORTAL STATES ---
  const [currentPage, setCurrentPage] = useState('home'); // home, shop, about, cart, checkout, admin
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentRole, setCurrentRole] = useState('manager'); // manager
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- SHOP FILTERS STATES ---
  const [filterCategory, setFilterCategory] = useState(''); // '', ao, quan, vay, phukien
  const [filterSize, setFilterSize] = useState(''); // '', S, M, L, XL, etc.
  const [filterColor, setFilterColor] = useState(''); // '', name of color
  const [filterPriceRange, setFilterPriceRange] = useState(''); // '', '0-200', '200-400', '400+'

  // --- CHECKOUT FORM STATE ---
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutNote, setCheckoutNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Transfer
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  // --- TOAST NOTIFICATION STATE ---
  const [toasts, setToasts] = useState([]);

  // --- ALERT & CONFIRM MODAL STATE ---
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    text: '',
    type: 'info',
    onConfirm: null,
    onCancel: null
  });

  // --- WISHLIST / FAVORITES STATES ---
  const [wishlist, setWishlist] = useState([]);

  const [showWishlistModal, setShowWishlistModal] = useState(false);


  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, cartRes, wishlistRes, ordersRes] = await Promise.all([
          api.getProducts().catch(() => []),
          // Assuming user needs to be logged in to fetch these, or API ignores without auth
          currentUser ? api.getCart().catch(() => ({ data: [] })) : { data: [] },
          currentUser ? api.getWishlist().catch(() => ({ data: [] })) : { data: [] },
          currentUser?.role === 'manager' ? api.getAdminOrders().catch(() => []) : (currentUser ? api.getOrderHistory().catch(() => ({ data: [] })) : { data: [] })
        ]);

        // Map products
        const mappedProducts = (Array.isArray(productsRes) ? productsRes : []).map(p => ({
          id: p.id,
          name: p.productName || p.name,
          description: p.description || '',
          price: p.price || 0,
          category: p.category || 'ao',
          categoryLabel: p.category === 'ao' ? 'Áo' : p.category === 'quan' ? 'Quần' : p.category === 'vay' ? 'Váy' : 'Phụ kiện',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [{ name: 'Mặc định', hex: '#000' }],
          inventory: p.stockQuantity || 100,
          soldCount: 0,
          status: 'approved',
          isNew: true,
          isBestSeller: p.ratingAverage >= 4.5,
          images: parseImages(p.imageUrl)
        }));
        setProducts(mappedProducts);

        // Map cart
        const mapCart = (backendCart) => (Array.isArray(backendCart) ? backendCart : []).map(c => ({
          ...c,
          cartItemId: c.id,
          id: c.product?.id || c.id,
          name: c.product?.productName || c.product?.name || c.name || 'Sản phẩm',
          price: c.product?.price || c.price || 0,
          inventory: c.product?.stockQuantity || c.inventory || 100,
          quantity: c.quantity || 1,
          images: c.product?.imageUrl ? parseImages(c.product.imageUrl) : (c.images || ['https://via.placeholder.com/400x500']),
          selectedSize: c.selectedSize || 'M',
          selectedColor: c.selectedColor || { name: 'Mặc định', hex: '#000' }
        }));

        setCart(mapCart(cartRes.data || cartRes || []));

        setWishlist(wishlistRes.data || wishlistRes || []);
        setOrders(ordersRes.data || ordersRes || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchData();
  }, [currentUser]); // Refetch when user changes

  // Remove persistence to localStorage since we use API now


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('jusst_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('jusst_user');
    }
  }, [currentUser]);

  // Auto-fill checkout info when logged in as customer
  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      setCheckoutName(currentUser.name);
      setCheckoutPhone(currentUser.phone || "0988776655");
      setCheckoutAddress(currentUser.address || "12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội");
    } else {
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
    }
  }, [currentUser]);

  // LOGIN, REGISTER & LOGOUT HANDLERS

  const handleLogin = async (email, password) => {
    try {
      const res = await api.login({
        email,
        password,
      });

      const user = {
        ...res,
        name: res.fullName || res.name || "User",
        role: res.role
          ? res.role.toLowerCase()
          : "customer",
      };

      setCurrentUser(user);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      setShowLoginModal(false);

      addToast("Đăng nhập thành công!", "success");

    } catch (err) {
      addToast(
        err.message || "Đăng nhập thất bại",
        "error"
      );
    }
  };

  const handleRegister = async (userData) => {
    try {

      await api.register({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
      });

      addToast(
        "Đăng ký thành công!",
        "success"
      );

      await handleLogin(
        userData.email,
        userData.password
      );

    } catch (err) {
      addToast(
        err.message || "Đăng ký thất bại",
        "error"
      );
    }
  };

  const handleLogout = async () => {
    try {

      await api.logout();

      setCurrentUser(null);

      localStorage.removeItem(
        "currentUser"
      );

      addToast(
        "Đăng xuất thành công",
        "success"
      );

    } catch (err) {
      addToast(
        err.message,
        "error"
      );
    }
  };


  // --- UNIFIED MODAL POPUP HELPERS ---
  const showAlert = (title, text, type = 'info') => {
    setAlertConfig({
      isOpen: true,
      title: title.toUpperCase(),
      text,
      type,
      onConfirm: null,
      onCancel: null
    });
  };

  const showConfirm = (title, text, type = 'confirm', onConfirm = null, onCancel = null) => {
    setAlertConfig({
      isOpen: true,
      title: title.toUpperCase(),
      text,
      type,
      onConfirm,
      onCancel
    });
  };

  // --- TOAST HELPER FUNCTIONS (ROUTED TO MODAL POPUPS) ---
  const addToast = (text, type = 'info') => {
    const titleMap = {
      success: 'THÀNH CÔNG',
      error: 'LỖI HỆ THỐNG',
      warning: 'CẢNH BÁO',
      info: 'THÔNG BÁO'
    };
    showAlert(titleMap[type] || 'THÔNG BÁO', text, type);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  // --- WISHLIST / FAVORITES HANDLERS ---
  const handleToggleWishlist = (product) => {
    const isExist = wishlist.some(p => p.id === product.id);
    if (isExist) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
      addToast(`Đã xóa "${product.name}" khỏi danh sách yêu thích.`, 'info');
    } else {
      setWishlist([...wishlist, product]);
      showAlert('DANH SÁCH YÊU THÍCH', `Đã thêm sản phẩm "${product.name}" vào danh sách yêu thích thành công!`, 'success');
    }
  };

  // --- PROFILE UPDATE HANDLER ---
  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Auto-fill checkout fields if customer updates their profile
    if (updatedUser.role === 'customer') {
      setCheckoutName(updatedUser.name);
      if (updatedUser.phone) setCheckoutPhone(updatedUser.phone);
      if (updatedUser.address) setCheckoutAddress(updatedUser.address);
    }
    showAlert('THÀNH CÔNG', 'Đã cập nhật thông tin Profile của bạn thành công!', 'success');
  };


  // --- CUSTOMER CART ACTIONS ---
  const fetchAndSetCart = async () => {
    try {
      const cartRes = await api.getCart();
      const rawCart = cartRes.data || cartRes || [];
      const mapCart = (backendCart) => (Array.isArray(backendCart) ? backendCart : []).map(c => ({
        ...c,
        cartItemId: c.id,
        id: c.product?.id || c.id,
        name: c.product?.productName || c.product?.name || c.name || 'Sản phẩm',
        price: c.product?.price || c.price || 0,
        inventory: c.product?.stockQuantity || c.inventory || 100,
        quantity: c.quantity || 1,
        images: c.product?.imageUrl ? parseImages(c.product.imageUrl) : (c.images || ['https://via.placeholder.com/400x500']),
        selectedSize: c.selectedSize || 'M',
        selectedColor: c.selectedColor || { name: 'Mặc định', hex: '#000' }
      }));
      setCart(mapCart(rawCart));
    } catch (err) {
      console.error('Error refreshing cart:', err);
    }
  };

  const handleAddToCart = async (cartItem) => {
    if (!cartItem) return;
    try {
      await api.addToCart(cartItem.id, cartItem.quantity);
      await fetchAndSetCart();
      addToast(`Đã thêm ${cartItem.quantity} sản phẩm "${cartItem.name}" vào giỏ hàng!`, 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi khi thêm vào giỏ hàng', 'error');
    }
  };

  const handleBuyNow = (cartItem) => {
    // If it's a dummy trigger from Related Products modal selection
    if (cartItem.type === "SELECT_RELATED") {
      setSelectedProduct(cartItem.product);
      return;
    }

    // Normal Buy Now flow: Add to cart and immediately checkout
    handleAddToCart(cartItem).then(() => {
      setSelectedProduct(null);
      setCurrentPage('checkout');
    });
  };

  const handleUpdateCartQty = async (idx, amount) => {
    const item = cart[idx];
    const newQty = item.quantity + amount;

    if (newQty < 1) {
      handleRemoveCartItem(idx);
      return;
    }

    if (newQty > item.inventory) {
      addToast(`Kho chỉ còn ${item.inventory} cái!`, 'error');
      return;
    }

    try {
      await api.updateCartQty(item.cartItemId || item.id, newQty);
      await fetchAndSetCart();
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật số lượng', 'error');
    }
  };

  const handleRemoveCartItem = (idx) => {
    const item = cart[idx];
    showConfirm(
      'XÓA KHỎI GIỎ HÀNG',
      `Bạn có chắc chắn muốn xóa sản phẩm "${item.name}" khỏi giỏ hàng?`,
      'delete',
      async () => {
        try {
          await api.removeFromCart(item.cartItemId || item.id);
          await fetchAndSetCart();
          addToast(`Đã xóa sản phẩm khỏi giỏ hàng`, 'info');
        } catch (err) {
          addToast(err.message || 'Lỗi xóa sản phẩm', 'error');
        }
      }
    );
  };


  // --- PLACE ORDER FLOW ---
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showAlert('GIỎ HÀNG TRỐNG', 'Giỏ hàng đang trống! Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.', 'warning');
      return;
    }
    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutAddress.trim()) {
      showAlert('THIẾU THÔNG TIN', 'Vui lòng nhập đầy đủ thông tin giao nhận hàng!', 'warning');
      return;
    }

    try {
      await api.checkout(checkoutAddress.trim(), checkoutPhone.trim(), paymentMethod === 'COD' ? "COD" : "Chuyển khoản");

      setCart([]);

      const orderId = "JUSST" + Math.floor(100000 + Math.random() * 900000);
      setLastOrderId(orderId);
      setShowSuccessPopup(true);

      // Refresh orders
      if (currentUser) {
        const ordersRes = currentUser.role === 'manager' ? await api.getAdminOrders().catch(() => []) : await api.getOrderHistory().catch(() => ({ data: [] }));
        setOrders(ordersRes.data || ordersRes || []);
      }

      // Refresh products (inventory updated)
      const productsRes = await api.getProducts().catch(() => []);
      const mappedProducts = (Array.isArray(productsRes) ? productsRes : []).map(p => ({
        id: p.id,
        name: p.productName || p.name,
        description: p.description || '',
        price: p.price || 0,
        category: p.category || 'ao',
        categoryLabel: p.category === 'ao' ? 'Áo' : p.category === 'quan' ? 'Quần' : p.category === 'vay' ? 'Váy' : 'Phụ kiện',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Mặc định', hex: '#000' }],
        inventory: p.stockQuantity || 100,
        soldCount: 0,
        status: p.productStatus === 'ACTIVE' ? 'approved' : 'pending',
        isNew: true,
        isBestSeller: p.ratingAverage >= 4.5,
        images: parseImages(p.imageUrl)
      }));
      setProducts(mappedProducts);

      // Clear form
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutNote('');
    } catch (err) {
      addToast(err.message || 'Lỗi khi đặt hàng', 'error');
    }
  };


  // --- ADMIN PORTAL ACTIONS ---
  const fetchProducts = async () => {
    try {
      const productsRes = await api.getProducts().catch(() => []);
      const mappedProducts = (Array.isArray(productsRes) ? productsRes : []).map(p => ({
        id: p.id,
        name: p.productName || p.name,
        description: p.description || '',
        price: p.price || 0,
        category: p.category || 'ao',
        categoryLabel: p.category === 'ao' ? 'Áo' : p.category === 'quan' ? 'Quần' : p.category === 'vay' ? 'Váy' : 'Phụ kiện',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Mặc định', hex: '#000' }],
        inventory: p.stockQuantity || 100,
        soldCount: 0,
        status: p.productStatus === 'ACTIVE' ? 'approved' : 'pending',
        isNew: true,
        isBestSeller: p.ratingAverage >= 4.5,
        images: parseImages(p.imageUrl)
      }));
      setProducts(mappedProducts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (newProduct) => {
    try {
      const payload = {
        productName: newProduct.name,
        description: newProduct.description || '',
        price: Number(newProduct.price || 0),
        stockQuantity: Number(newProduct.inventory || 100),
        imageUrl: newProduct.imageUrl || '',
        category: newProduct.category || 'ao'
      };

      await api.addProduct(payload);
      await fetchProducts();

      addToast(`Sản phẩm "${newProduct.name}" đã được thêm thành công!`, 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi thêm sản phẩm', 'error');
    }
  };

  const handleEditProduct = async (id, newProduct) => {
    try {
      const payload = {
        productName: newProduct.name,
        description: newProduct.description || '',
        price: Number(newProduct.price || 0),
        stockQuantity: Number(newProduct.inventory || 100),
        imageUrl: newProduct.imageUrl || '',
        category: newProduct.category || 'ao'
      };

      await api.updateProduct(id, payload);
      await fetchProducts();

      addToast(`Sản phẩm "${newProduct.name}" đã được cập nhật thành công!`, 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật sản phẩm', 'error');
    }
  };

  const handleUpdateProductStatus = (id, newStatus, reason = '') => {
    // The backend swagger doesn't clearly support updating status directly, so we just mock it on frontend
    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: newStatus,
          rejectReason: reason
        };
      }
      return p;
    });
    setProducts(updated);

    const prod = products.find(p => p.id === id);
    if (newStatus === 'approved') {
      addToast(`Đã PHÊ DUYỆT sản phẩm "${prod?.name || ''}" đăng bán!`, 'success');
    } else if (newStatus === 'rejected') {
      addToast(`Đã TỪ CHỐI sản phẩm "${prod?.name || ''}".`, 'info');
    }
  };

  const handleDeleteProduct = (id) => {
    const prod = products.find(p => p.id === id);
    showConfirm(
      'XÓA SẢN PHẨM',
      `Bạn có chắc chắn muốn xóa sản phẩm "${prod?.name || ''}" khỏi hệ thống?`,
      'delete',
      async () => {
        try {
          await api.deleteProduct(id);
          await fetchProducts();
          addToast(`Đã xóa sản phẩm khỏi hệ thống`, 'info');
        } catch (err) {
          addToast(err.message || 'Lỗi xóa sản phẩm', 'error');
        }
      }
    );
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'Hủy đơn') {
        await api.adminCancelOrder(id);
      } else {
        await api.updateOrderStatus(id, newStatus);
      }

      const ordersRes = await api.getAdminOrders().catch(() => []);
      setOrders(ordersRes.data || ordersRes || []);

      addToast(`Đã chuyển đơn #${id} sang trạng thái "${newStatus}"!`, 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    }
  };


  // --- FILTER SHOP SEARCH FLOW ---
  const activeApprovedProducts = products;

  // Lọc sản phẩm ở trang Shop dựa trên các bộ lọc
  const filteredProducts = activeApprovedProducts.filter((prod) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchCat = prod.categoryLabel.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // 2. Category
    if (filterCategory && prod.category !== filterCategory) return false;

    // 3. Size
    if (filterSize && !prod.sizes.includes(filterSize)) return false;

    // 4. Color
    if (filterColor && !prod.colors.some(c => c.name === filterColor)) return false;

    // 5. Price range
    if (filterPriceRange) {
      if (filterPriceRange === '0-200') {
        if (prod.price > 200000) return false;
      } else if (filterPriceRange === '200-400') {
        if (prod.price < 200000 || prod.price > 400000) return false;
      } else if (filterPriceRange === '400+') {
        if (prod.price < 400000) return false;
      }
    }

    return true;
  });

  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShip = cartTotalPrice >= 500000;
  const shipFee = cartTotalPrice > 0 ? (isFreeShip ? 0 : 30000) : 0;
  const cartFinalPrice = cartTotalPrice + shipFee;

  const handleClearAllFilters = () => {
    setFilterCategory('');
    setFilterSize('');
    setFilterColor('');
    setFilterPriceRange('');
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* 1. NAVBAR */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartItemsCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        currentUser={currentUser}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setShowWishlistModal(true)}
      />

      {/* TOAST SYSTEM CONTAINER */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Main Content Render */}
      <main style={{ flexGrow: 1, padding: isAdminMode ? '40px 0' : '0' }}>

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - TRANG CHỦ
           ========================================================================= */}
        {!isAdminMode && currentPage === 'home' && (
          <div>
            <Hero setCurrentPage={setCurrentPage} />

            {/* HIGHLIGHT CATEGORIES */}
            <section className="container" style={{ marginBottom: '60px' }}>
              <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <span className="section-subtitle">Bộ sưu tập thời trang</span>
                <h2 className="section-title">Danh Mục Nổi Bật</h2>
                <div style={{ width: '50px', height: '3px', background: 'var(--primary)', marginTop: '8px' }}></div>
              </div>

              <div className="categories-grid" style={{ marginTop: '20px' }}>
                {[
                  { name: "ÁO THỜI TRANG", type: "ao", desc: "T-Shirt, Hoodie, Polo", icon: "👕", count: products.filter(p => p.category === 'ao' && p.status === 'approved').length },
                  { name: "QUẦN STYLISH", type: "quan", desc: "Baggy Jean, Jogger, Short", icon: "👖", count: products.filter(p => p.category === 'quan' && p.status === 'approved').length },
                  { name: "VÁY XINH", type: "vay", desc: "Floral Dress, Tennis Skirt", icon: "👗", count: products.filter(p => p.category === 'vay' && p.status === 'approved').length },
                  { name: "PHỤ KIỆN ĐỘC ĐÁO", type: "phukien", desc: "Cap, Tote Bag, Retro Socks", icon: "🧢", count: products.filter(p => p.category === 'phukien' && p.status === 'approved').length },
                ].map((cat, idx) => (
                  <div
                    key={idx}
                    className="category-card"
                    onClick={() => {
                      setFilterCategory(cat.type);
                      setCurrentPage('shop');
                    }}
                  >
                    <div className="category-image-wrapper" style={{ fontSize: '32px' }}>
                      {cat.icon}
                    </div>
                    <h3>{cat.name}</h3>
                    <span>{cat.count} sản phẩm đang bán</span>
                  </div>
                ))}
              </div>
            </section>

            {/* BEST SELLERS SECTION */}
            <section className="container" style={{ marginBottom: '60px' }}>
              <div className="section-header">
                <div>
                  <span className="section-subtitle">Chất lượng hàng đầu</span>
                  <h2 className="section-title">Sản Phẩm Bán Chạy</h2>
                </div>
                <a
                  href="#shop"
                  className="section-link"
                  onClick={(e) => { e.preventDefault(); setFilterCategory(''); setCurrentPage('shop'); }}
                >
                  <span>Xem tất cả</span>
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="products-grid">
                {activeApprovedProducts
                  .filter(p => p.isBestSeller)
                  .slice(0, 4)
                  .map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelectProduct={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                      showAlert={showAlert}
                      isWishlisted={wishlist.some(p => p.id === prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
              </div>
            </section>

            {/* NEW COLLECTION BANNER */}
            <section className="container" style={{ marginBottom: '60px' }}>
              <div
                style={{
                  background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '80px 40px',
                  borderRadius: 'var(--radius-lg)',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <span style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '2px', fontSize: '13px', textTransform: 'uppercase' }}>
                  NEW STYLE BEYOND EXPECTATION
                </span>
                <h2 style={{ fontSize: '38px', fontWeight: 800, margin: '12px 0 20px' }}>
                  Jusstlife New Lookbook 2026
                </h2>
                <p style={{ maxWidth: '600px', margin: '0 auto 30px', color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
                  Tôn vinh vẻ đẹp tự do của tuổi trẻ thông qua các đường cắt cúp tối giản, tone màu trung tính mộc mạc và chất liệu thoáng mát cho mùa hè sôi động.
                </p>
                <button
                  className="hero-btn"
                  onClick={() => { handleClearAllFilters(); setCurrentPage('shop'); }}
                >
                  Khám Phá Ngay
                </button>
              </div>
            </section>

            {/* NEW COLLECTION GRID SECTION */}
            <section className="container" style={{ marginBottom: '60px' }}>
              <div className="section-header">
                <div>
                  <span className="section-subtitle font-outfit">Sản phẩm mới</span>
                  <h2 className="section-title">New Collection</h2>
                </div>
                <a
                  href="#shop"
                  className="section-link"
                  onClick={(e) => { e.preventDefault(); handleClearAllFilters(); setCurrentPage('shop'); }}
                >
                  <span>Xem sản phẩm mới</span>
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="products-grid">
                {activeApprovedProducts
                  .filter(p => p.isNew)
                  .slice(0, 4)
                  .map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelectProduct={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                      showAlert={showAlert}
                      isWishlisted={wishlist.some(p => p.id === prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
              </div>
            </section>

            {/* CUSTOMER REVIEWS */}
            <section className="container testimonials-section">
              <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <span className="section-subtitle">Khách hàng tin chọn</span>
                <h2 className="section-title">Khách Hàng Nói Gì Về Jusstlife?</h2>
                <div style={{ width: '50px', height: '3px', background: 'var(--primary)', marginTop: '8px', marginBottom: '30px' }}></div>
              </div>

              <div className="container testimonials-grid">
                {[
                  { name: "Minh Anh", avatar: "MA", stars: 5, text: "Áo thun mặc mát lắm nha mọi người, thun co giãn tốt giặt máy không bị giãn bo cổ. Phom suông rộng mặc streetwear cá tính, sẽ ủng hộ Jusstlife tiếp!" },
                  { name: "Thanh Hằng", avatar: "TH", stars: 5, text: "Váy hoa nhí đầm tay cực, lớp chiffon bay bổng cổ vuông khoe xương đòn sexy lắm luôn ấy. Giao hàng hỏa tốc siêu nhanh luôn mới 1 tiếng đã nhận được rồi!" },
                  { name: "Hoàng Nam", avatar: "HN", stars: 4, text: "Quần jean baggy wash màu vintage bụi bặm nhìn xịn xò lắm. Khóa kéo đồng chắc chắn, phom che khuyết điểm chân to siêu tốt, giá này rẻ so với chất lượng." },
                ].map((rev, idx) => (
                  <div key={idx} className="review-card">
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.stars ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="review-text">"{rev.text}"</p>
                    <div className="review-author">
                      <div className="author-avatar">{rev.avatar}</div>
                      <div>
                        <div className="author-name">{rev.name}</div>
                        <div className="author-role">Đã mua tại Jusstlife</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - DANH SÁCH SẢN PHẨM (SHOP)
           ========================================================================= */}
        {!isAdminMode && currentPage === 'shop' && (
          <div className="container" style={{ marginTop: '40px' }}>

            <div className="shop-layout">
              {/* Sidebar Filters */}
              <aside className="shop-sidebar animate-fade">
                <div className="sidebar-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} />
                    <span>Bộ Lọc Sản Phẩm</span>
                  </div>
                </div>

                {/* Filter Category */}
                <div className="filter-group">
                  <h4>Danh Mục</h4>
                  <div className="filter-options">
                    {[
                      { name: "Tất cả đồ", val: "" },
                      { name: "Áo thời trang", val: "ao" },
                      { name: "Quần thời trang", val: "quan" },
                      { name: "Váy xinh xắn", val: "vay" },
                      { name: "Phụ kiện độc đáo", val: "phukien" }
                    ].map((c) => (
                      <label key={c.name} className="filter-checkbox-label">
                        <input
                          type="radio"
                          name="category"
                          checked={filterCategory === c.val}
                          onChange={() => setFilterCategory(c.val)}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filter Size */}
                <div className="filter-group">
                  <h4>Kích Thước (Size)</h4>
                  <div className="size-filter-grid">
                    {["S", "M", "L", "XL"].map((sz) => (
                      <button
                        key={sz}
                        className={`size-box-btn ${filterSize === sz ? 'active' : ''}`}
                        onClick={() => setFilterSize(filterSize === sz ? '' : sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Color */}
                <div className="filter-group">
                  <h4>Bảng Màu Sắc</h4>
                  <div className="color-filter-flex">
                    {[
                      { name: 'Đen', hex: '#1A1A1A' },
                      { name: 'Trắng', hex: '#FFFFFF' },
                      { name: 'Xám', hex: '#8E8E93' },
                      { name: 'Xanh Navy', hex: '#1D2D44' },
                      { name: 'Hoa Vàng', hex: '#FFD166' },
                      { name: 'Be Mộc', hex: '#EBE3D5' }
                    ].map((col) => (
                      <button
                        key={col.name}
                        className={`color-dot-btn ${filterColor === col.name ? 'active' : ''}`}
                        style={{ backgroundColor: col.hex }}
                        onClick={() => setFilterColor(filterColor === col.name ? '' : col.name)}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Filter Price */}
                <div className="filter-group">
                  <h4>Lọc Theo Giá</h4>
                  <div className="filter-options">
                    {[
                      { name: "Tất cả các giá", val: "" },
                      { name: "Dưới 200.000 ₫", val: "0-200" },
                      { name: "Từ 200k - 400k", val: "200-400" },
                      { name: "Trên 400.000 ₫", val: "400+" }
                    ].map((pr) => (
                      <label key={pr.name} className="filter-checkbox-label">
                        <input
                          type="radio"
                          name="price-range"
                          checked={filterPriceRange === pr.val}
                          onChange={() => setFilterPriceRange(pr.val)}
                        />
                        <span>{pr.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear filters button */}
                <button
                  className="btn-secondary-outline"
                  onClick={handleClearAllFilters}
                  style={{ width: '100%', fontSize: '13px', padding: '10px 0', border: '1px solid #ddd', color: 'var(--secondary)' }}
                >
                  <RefreshCw size={14} />
                  <span>Xóa Tất Cả Bộ Lọc</span>
                </button>
              </aside>

              {/* Shop Grid Area */}
              <div className="shop-content-panel">

                {/* Search query tag */}
                {(filterCategory || filterSize || filterColor || filterPriceRange || searchQuery) && (
                  <div className="shop-active-filters animate-fade">
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--secondary-muted)', display: 'flex', alignItems: 'center' }}>Bộ lọc đang bật:</span>
                    {filterCategory && (
                      <span className="active-filter-badge">
                        Danh mục: {filterCategory === 'ao' ? 'Áo' : filterCategory === 'quan' ? 'Quần' : filterCategory === 'vay' ? 'Váy' : 'Phụ kiện'}
                        <button onClick={() => setFilterCategory('')}><X size={12} /></button>
                      </span>
                    )}
                    {filterSize && (
                      <span className="active-filter-badge">
                        Size: {filterSize}
                        <button onClick={() => setFilterSize('')}><X size={12} /></button>
                      </span>
                    )}
                    {filterColor && (
                      <span className="active-filter-badge">
                        Màu: {filterColor}
                        <button onClick={() => setFilterColor('')}><X size={12} /></button>
                      </span>
                    )}
                    {filterPriceRange && (
                      <span className="active-filter-badge">
                        Giá: {filterPriceRange === '0-200' ? 'Dưới 200k' : filterPriceRange === '200-400' ? '200k-400k' : 'Trên 400k'}
                        <button onClick={() => setFilterPriceRange('')}><X size={12} /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="active-filter-badge">
                        Từ khóa: "{searchQuery}"
                        <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                      </span>
                    )}
                  </div>
                )}

                {/* Lưới sản phẩm */}
                {filteredProducts.length === 0 ? (
                  <div className="no-products-found animate-fade">
                    <h3>Không tìm thấy sản phẩm nào!</h3>
                    <p style={{ color: 'var(--secondary-muted)', marginBottom: '20px' }}>Bạn hãy thử đổi bộ lọc hoặc nhập từ khóa tìm kiếm khác nhé.</p>
                    <button className="btn-go-shop" onClick={handleClearAllFilters}>
                      Xem Tất Cả Sản Phẩm
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--secondary-muted)', fontWeight: 500 }}>
                      Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm thiết kế Jusstlife
                    </div>
                    <div className="products-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onSelectProduct={setSelectedProduct}
                          onAddToCart={handleAddToCart}
                          showAlert={showAlert}
                          isWishlisted={wishlist.some(p => p.id === prod.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - GIỚI THIỆU THƯƠNG HIỆU (ABOUT US)
           ========================================================================= */}
        {!isAdminMode && currentPage === 'about' && (
          <div className="container" style={{ marginTop: '40px' }}>

            {/* About Hero */}
            <div
              className="about-hero animate-fade"
              style={{ backgroundImage: `url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600")` }}
            >
              <div className="about-hero-overlay"></div>
              <div className="about-hero-content">
                <span style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '3px' }}>JUSSTLIFE DESIGN STORY</span>
                <h1 style={{ fontSize: '42px', fontWeight: 800, marginTop: '10px' }}>Thời Trang Tối Giản, Đầy Sức Sống</h1>
              </div>
            </div>

            {/* Brand Story */}
            <div className="about-story-layout">
              <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"
                alt="Lookbook"
                className="about-story-img"
              />
              <div className="about-story-text">
                <h3>Câu Chuyện Thương Hiệu Jusstlife</h3>
                <p>
                  Thương hiệu <strong>Jusstlife</strong> được thành lập từ khát khao tạo dựng dòng trang phục đơn giản, tiện dụng nhưng không kém phần phong cách, thể hiện đúng phong thái tự tin và năng lượng tràn đầy của giới trẻ hiện đại.
                </p>
                <p>
                  Cái tên **Jusstlife** (Just Life, Just Style) mang thông điệp cốt lõi: <em>Thời trang cốt ở sự đơn giản, giúp bạn tận hưởng cuộc sống một cách trọn vẹn nhất.</em> Không cầu kỳ trong họa tiết, chúng tôi tập trung phát triển những đường may đứng phom dáng cùng quy trình xử lý chất liệu đặc quyền.
                </p>
                <p>
                  Sản phẩm của Jusstlife luôn tuân thủ nguyên tắc chọn lọc sợi tự nhiên (Cotton organic, Linen đũi tơ) mang lại cảm giác nhẹ tênh, bảo vệ làn da nhạy cảm và góp phần lan tỏa xu hướng sống xanh bền vững.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <h3 className="lookbook-title">Giá Trị và Phong Cách</h3>
            <div className="about-values">
              <div className="value-card">
                <div className="value-icon"><Sparkles size={32} /></div>
                <h4>Tối Giản Tinh Tế</h4>
                <p>Màu sắc trung tính nhã nhặn, thiết kế không bao giờ lỗi mốt giúp bạn dễ dàng phối đồ mọi lúc mọi nơi.</p>
              </div>

              <div className="value-card">
                <div className="value-icon"><CheckCircle size={32} /></div>
                <h4>Chất Lượng Vượt Trội</h4>
                <p>100% sợi dệt tự nhiên được xử lý chống co rút, đanh mịn và đứng phom tuyệt đối sau hàng trăm lần giặt máy.</p>
              </div>

              <div className="value-card">
                <div className="value-icon"><Clock size={32} /></div>
                <h4>Tận Tâm Phục Vụ</h4>
                <p>Quy trình kiểm hàng nghiêm ngặt, hỗ trợ đổi size/màu trong vòng 7 ngày miễn phí không cần lý do.</p>
              </div>
            </div>

            {/* Lookbook section */}
            <h3 className="lookbook-title">Lookbook Jusstlife 2026</h3>
            <div className="lookbook-grid">
              <div className="lookbook-item wide">
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" alt="" className="lookbook-img" />
              </div>
              <div className="lookbook-item tall">
                <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600" alt="" className="lookbook-img" />
              </div>
              <div className="lookbook-item">
                <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600" alt="" className="lookbook-img" />
              </div>
              <div className="lookbook-item">
                <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600" alt="" className="lookbook-img" />
              </div>
              <div className="lookbook-item wide">
                <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600" alt="" className="lookbook-img" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - GIỎ HÀNG (CART)
           ========================================================================= */}
        {!isAdminMode && currentPage === 'cart' && (
          <div className="container" style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={24} />
              <span>Giỏ Hàng Của Bạn</span>
            </h2>

            <div className="cart-layout animate-fade">
              {/* Cart Table List */}
              <div className="cart-table-card">
                {cart.length === 0 ? (
                  <div className="cart-empty-state">
                    <ShoppingBag size={64} className="cart-empty-icon" />
                    <h3>Giỏ hàng đang trống!</h3>
                    <p style={{ color: 'var(--secondary-muted)', marginBottom: '24px' }}>Hãy ghé xem hàng ngàn sản phẩm thiết kế Jusstlife cực chất nhé.</p>
                    <button className="btn-go-shop" onClick={() => setCurrentPage('shop')}>
                      Mua Sắm Ngay
                    </button>
                  </div>
                ) : (
                  <div className="cart-items-list">
                    {cart.map((item, idx) => (
                      <div key={idx} className="cart-item">
                        <img src={item.images[0]} alt={item.name} className="cart-item-img" />

                        <div className="cart-item-info">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <div className="cart-item-meta">
                            <span>Size: <strong>{item.selectedSize}</strong></span>
                            <span className="meta-color-pill">
                              <span>Màu: </span>
                              <span className="meta-color-dot" style={{ backgroundColor: item.selectedColor.hex }}></span>
                              <strong>{item.selectedColor.name}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="cart-item-price-unit">
                          {item.price.toLocaleString('vi-VN')} ₫
                        </div>

                        {/* Qty changer */}
                        <div className="qty-selector">
                          <button className="qty-btn" onClick={() => handleUpdateCartQty(idx, -1)}>-</button>
                          <div className="qty-value">{item.quantity}</div>
                          <button className="qty-btn" onClick={() => handleUpdateCartQty(idx, 1)}>+</button>
                        </div>

                        <div className="cart-item-total">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </div>

                        <button className="cart-item-remove" onClick={() => handleRemoveCartItem(idx)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Summary Panel */}
              {cart.length > 0 && (
                <div className="cart-summary-card">
                  <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

                  <div className="summary-row">
                    <span>Tạm tính</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{cartTotalPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>

                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                      {shipFee === 0 ? "Miễn phí" : "30.000 ₫"}
                    </span>
                  </div>

                  {isFreeShip ? (
                    <div style={{ fontSize: '11px', color: '#2e7d32', background: '#e8f5e9', padding: '6px 10px', borderRadius: '4px', marginBottom: '16px', fontWeight: 600 }}>
                      🎉 Đơn hàng đã đủ điều kiện freeship (từ 500k)!
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#ff8f00', background: '#fff8e1', padding: '6px 10px', borderRadius: '4px', marginBottom: '16px', fontWeight: 500 }}>
                      💡 Mua thêm <strong>{(500000 - cartTotalPrice).toLocaleString('vi-VN')} ₫</strong> để được miễn phí vận chuyển!
                    </div>
                  )}

                  <div className="voucher-box">
                    <input type="text" placeholder="Nhập mã voucher giảm giá..." className="voucher-input" />
                    <button className="voucher-btn">Áp Dụng</button>
                  </div>

                  <div className="summary-row total-row">
                    <span>Tổng cộng</span>
                    <span className="total-price-text">{cartFinalPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>

                  <button className="checkout-action-btn" onClick={() => setCurrentPage('checkout')}>
                    <span>Tiến Hành Thanh Toán</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - THANH TOÁN (CHECKOUT)
           ========================================================================= */}
        {!isAdminMode && currentPage === 'checkout' && (
          <div className="container" style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Thông Tin Thanh Toán</h2>

            <div className="checkout-layout animate-fade">
              {/* Form Input Billing Info */}
              <div className="checkout-form-card">
                <h3 className="form-title">
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '14px' }}>1</span>
                  <span>Thông tin nhận hàng</span>
                </h3>

                <form onSubmit={handlePlaceOrderSubmit}>
                  <div className="form-grid">
                    <div className="admin-form-group">
                      <label className="input-label">Họ và tên người nhận *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn A..."
                        className="checkout-input"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="input-label">Số điện thoại liên lạc *</label>
                      <input
                        type="tel"
                        placeholder="Ví dụ: 0987654321..."
                        className="checkout-input"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group full-width">
                      <label className="input-label">Địa chỉ nhận hàng chi tiết *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM..."
                        className="checkout-input"
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="admin-form-group full-width">
                      <label className="input-label">Ghi chú giao hàng (Nếu có)</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Giao hàng giờ hành chính / gọi trước khi giao..."
                        className="checkout-input"
                        value={checkoutNote}
                        onChange={(e) => setCheckoutNote(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <h3 className="form-title" style={{ marginTop: '30px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '14px' }}>2</span>
                    <span>Phương thức thanh toán</span>
                  </h3>

                  <div className="payment-options-group">
                    <div
                      className={`payment-option-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="payment-radio"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                      />
                      <div className="payment-info">
                        <span className="payment-name">COD - Thanh toán khi nhận hàng</span>
                        <span className="payment-desc">Bạn sẽ thanh toán bằng tiền mặt cho shipper khi nhận gói hàng thành công.</span>
                      </div>
                    </div>

                    <div
                      className={`payment-option-card ${paymentMethod === 'Transfer' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('Transfer')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="payment-radio"
                        checked={paymentMethod === 'Transfer'}
                        onChange={() => setPaymentMethod('Transfer')}
                      />
                      <div className="payment-info">
                        <span className="payment-name">Chuyển khoản Ngân hàng (Hỗ trợ quét QR nhanh)</span>
                        <span className="payment-desc">Quét mã QR chuyển khoản giả lập để hoàn tất thanh toán tức thì.</span>
                      </div>
                    </div>
                  </div>

                  {/* BANK TRANSFER DETAILS BOX */}
                  {paymentMethod === 'Transfer' && (
                    <div className="bank-transfer-details">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=JUSSTLIFE_PAYMENT"
                        alt="QR Code"
                        className="qr-code-img"
                      />
                      <div className="bank-info-lines">
                        <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>THÔNG TIN CHUYỂN KHOẢN :</div>
                        <div>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></div>
                        <div>Số tài khoản: <strong>09876543210</strong></div>
                        <div>Chủ tài khoản: <strong>CONG TY THOI TRANG JUSSTLIFE</strong></div>
                        <div>Số tiền: <strong>{cartFinalPrice.toLocaleString('vi-VN')} ₫</strong></div>
                        <div style={{ fontSize: '11px', color: '#c62828', marginTop: '4px' }}>Nội dung CK: <strong>JUSSTPAY</strong></div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="checkout-action-btn"
                    style={{ marginTop: '30px', padding: '16px' }}
                  >
                    Xác Nhận Đặt Hàng ({cartFinalPrice.toLocaleString('vi-VN')} ₫)
                  </button>
                </form>
              </div>

              {/* Order checkout bill list preview */}
              <div className="cart-summary-card">
                <h3 className="summary-title">Đơn hàng của bạn</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '6px' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <img src={item.images[0]} alt="" style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--secondary-muted)', marginTop: '2px' }}>
                          Size: {item.selectedSize} / {item.selectedColor.name}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-muted)', marginTop: '2px' }}>
                          {item.quantity} x {item.price.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{cartTotalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="summary-row">
                  <span>Phí ship</span>
                  <span>{shipFee === 0 ? "Miễn phí" : "30.000 ₫"}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng tiền</span>
                  <span className="total-price-text">{cartFinalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - CHÍNH SÁCH ĐỔI TRẢ 7 NGÀY
           ========================================================================= */}
        {!isAdminMode && currentPage === 'policy-return' && (
          <div className="container animate-fade" style={{ marginTop: '40px', marginBottom: '80px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', color: 'var(--primary)' }}>Chính Sách Đổi Trả Dễ Dàng 7 Ngày</h2>
              <div style={{ width: '60px', height: '4px', background: 'var(--primary)', marginBottom: '30px' }}></div>

              <p style={{ fontSize: '15px', color: 'var(--secondary-muted)', marginBottom: '20px', lineHeight: '1.8' }}>
                Tại <strong>Jusstlife</strong>, chúng tôi luôn trân trọng sự tin dùng của khách hàng đối với các sản phẩm thời trang tối giản của chúng tôi. Để mang lại sự an tâm tuyệt đối khi mua sắm, chúng tôi cung cấp chính sách đổi trả hàng hóa linh hoạt và tận tâm như sau:
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>1. Thời Gian Hỗ Trợ Đổi Trả</h3>
              <p style={{ fontSize: '14px', color: 'var(--secondary-muted)', lineHeight: '1.6' }}>
                Hỗ trợ đổi trả hàng hóa trong vòng <strong>7 ngày</strong> kể từ khi khách hàng nhận được kiện hàng thành công từ shipper.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>2. Điều Kiện Đổi Trả Sản Phẩm</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6' }}>
                <li>Sản phẩm còn nguyên tem mác, nhãn mác treo ban đầu của Jusstlife.</li>
                <li>Sản phẩm chưa qua giặt ủi, không có mùi lạ (nước hoa, bột giặt), chưa được sử dụng ngoài thực tế.</li>
                <li>Sản phẩm không bị bẩn, trầy xước, sờn chỉ hay hỏng hóc do lỗi bảo quản từ phía khách hàng.</li>
              </ul>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>3. Chi Phí Vận Chuyển Đổi Trả</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6' }}>
                <li><strong>Lỗi từ Jusstlife (giao sai size, sai màu, lỗi đường may):</strong> Jusstlife miễn phí 100% mọi chi phí vận chuyển đổi hàng tận nhà cho quý khách.</li>
                <li><strong>Đổi theo nhu cầu (khách muốn đổi size do mặc rộng/chật, đổi sang màu khác):</strong> Khách hàng vui lòng thanh toán phí chuyển phát phát sinh (hoặc liên hệ hotline để được hỗ trợ đồng phí ưu đãi).</li>
              </ul>

              <button className="btn-go-shop" onClick={() => setCurrentPage('shop')} style={{ marginTop: '30px' }}>
                Quay Lại Mua Sắm
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - CHÍNH SÁCH VẬN CHUYỂN
           ========================================================================= */}
        {!isAdminMode && currentPage === 'policy-shipping' && (
          <div className="container animate-fade" style={{ marginTop: '40px', marginBottom: '80px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', color: 'var(--primary)' }}>Chính Sách Vận Chuyển & Giao Nhận</h2>
              <div style={{ width: '60px', height: '4px', background: 'var(--primary)', marginBottom: '30px' }}></div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '20px 0 12px' }}>1. Phí Giao Hàng Toàn Quốc</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6' }}>
                <li>Miễn phí vận chuyển 100% cho mọi đơn đặt hàng có tổng giá trị thanh toán từ <strong>500.000 ₫</strong> trở lên.</li>
                <li>Đồng phí vận chuyển siêu rẻ chỉ <strong>30.000 ₫</strong> cho các đơn hàng dưới 500k toàn quốc.</li>
              </ul>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>2. Thời Gian Giao Hàng Ước Tính</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6' }}>
                <li><strong>Khu vực TP.HCM & Hà Nội:</strong> Nhận hàng thần tốc từ 1 - 2 ngày (hoặc chọn giao nhanh hỏa tốc 2h).</li>
                <li><strong>Khu vực Trung tâm tỉnh thành khác:</strong> Nhận hàng từ 2 - 3 ngày làm việc.</li>
                <li><strong>Khu vực Huyện, Xã ngoại thành:</strong> Nhận hàng từ 3 - 5 ngày tùy thuộc khoảng cách địa lý.</li>
              </ul>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>3. Đồng Kiểm Khi Nhận Hàng</h3>
              <p style={{ fontSize: '14px', color: 'var(--secondary-muted)', lineHeight: '1.6' }}>
                Quý khách hàng được quyền mở gói hàng kiểm tra đúng số lượng, mẫu mã sản phẩm của Jusstlife trước khi thanh toán tiền mặt cho shipper (áp dụng cho đơn COD).
              </p>

              <button className="btn-go-shop" onClick={() => setCurrentPage('shop')} style={{ marginTop: '30px' }}>
                Quay Lại Mua Sắm
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - CHÍNH SÁCH BẢO MẬT
           ========================================================================= */}
        {!isAdminMode && currentPage === 'policy-privacy' && (
          <div className="container animate-fade" style={{ marginTop: '40px', marginBottom: '80px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', color: 'var(--primary)' }}>Chính Sách Bảo Mật Thông Tin</h2>
              <div style={{ width: '60px', height: '4px', background: 'var(--primary)', marginBottom: '30px' }}></div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '20px 0 12px' }}>1. Mục Đích Thu Thập Dữ Liệu</h3>
              <p style={{ fontSize: '14px', color: 'var(--secondary-muted)', lineHeight: '1.6' }}>
                Jusstlife cam kết bảo mật 100% thông tin cá nhân của khách hàng. Chúng tôi chỉ thu thập Tên, SĐT, Địa chỉ giao hàng để thực hiện quy trình đóng gói và vận chuyển kiện hàng đến tay bạn nhanh nhất có thể.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>2. Cam Kết Không Chia Sẻ</h3>
              <p style={{ fontSize: '14px', color: 'var(--secondary-muted)', lineHeight: '1.6' }}>
                Chúng tôi tuyệt đối không mua bán, trao đổi hay tiết lộ dữ liệu cá nhân của quý khách cho bên thứ ba vì bất kỳ lý do thương mại hay spam nào.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>3. Bảo Mật Cổng Thanh Toán</h3>
              <p style={{ fontSize: '14px', color: 'var(--secondary-muted)', lineHeight: '1.6' }}>
                Mọi thông tin giao dịch trực tuyến qua tài khoản ngân hàng MB Bank hoặc thẻ đều được mã hóa bằng chuẩn bảo mật cao SSL quốc tế, đảm bảo an toàn tuyệt đối trước mọi rủi ro xâm nhập.
              </p>

              <button className="btn-go-shop" onClick={() => setCurrentPage('shop')} style={{ marginTop: '30px' }}>
                Quay Lại Mua Sắm
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: KHÁCH HÀNG - THEO DÕI HÀNH TRÌNH ĐƠN HÀNG
           ========================================================================= */}
        {!isAdminMode && currentPage === 'order-tracking' && (
          <div className="container animate-fade" style={{ marginTop: '40px', marginBottom: '80px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={28} />
                <span>Theo Dõi Hành Trình Đơn Hàng</span>
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--secondary-muted)', marginBottom: '30px' }}>
                Nhập Mã Đơn Hàng Jusstlife để tra cứu trực tiếp hành trình xử lý, đóng gói và vận chuyển kiện hàng của bạn.
              </p>

              {/* SEARCH INPUT BAR */}
              <div style={{ display: 'flex', gap: '12px', maxWidth: '560px', marginBottom: '30px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã đơn hàng của bạn (Ví dụ: JUSST123456)..."
                  className="checkout-input"
                  value={trackingOrderId}
                  onChange={(e) => setTrackingOrderId(e.target.value.toUpperCase().trim())}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              {/* RECENT ORDERS LIST (QUICK CLICK TEST) */}
              {orders.length > 0 && (
                <div style={{ marginBottom: '40px', background: 'var(--bg-main)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>
                    💡 Đơn hàng gần đây của bạn (Click nhanh để xem hành trình):
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {orders.slice(-4).map((ord) => (
                      <button
                        key={ord.id}
                        onClick={() => setTrackingOrderId(ord.id)}
                        className="service-card"
                        style={{
                          padding: '10px 16px',
                          background: '#fff',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Đơn #{ord.id} ({ord.customerName} - {ord.totalPrice.toLocaleString('vi-VN')} ₫)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SEARCH RESULTS / JOURNEY DETAILS */}
              {(() => {
                if (!trackingOrderId) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                      <p>Vui lòng nhập mã đơn hoặc chọn đơn hàng gần đây ở trên để xem hành trình chi tiết.</p>
                    </div>
                  );
                }

                const cleanId = trackingOrderId.replace('#', '').trim();
                const matchedOrder = orders.find(o => o.id === cleanId);

                if (!matchedOrder) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffebee', color: '#c62828', padding: '20px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600 }}>
                      <AlertCircle size={20} />
                      <span>Không tìm thấy đơn hàng với mã "{trackingOrderId}". Quý khách vui lòng kiểm tra lại mã chính xác!</span>
                    </div>
                  );
                }

                const s = matchedOrder.status; // Chờ xử lý, Đang giao, Đã giao, Hủy đơn

                // Trạng thái Stepper Journey
                const isStep2Done = s === 'Đang giao' || s === 'Đã giao';
                const isStep3Done = s === 'Đang giao' || s === 'Đã giao';
                const isStep4Done = s === 'Đã giao';

                const isStep2Active = s === 'Chờ xử lý';
                const isStep3Active = s === 'Đang giao';

                return (
                  <div className="animate-fade" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '30px', background: '#fdfdfd' }}>

                    {/* Header đơn */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '30px', gap: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>CHI TIẾT ĐƠN HÀNG #{matchedOrder.id}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-muted)' }}>
                          Ngày đặt: {new Date(matchedOrder.createdAt).toLocaleDateString('vi-VN')} {new Date(matchedOrder.createdAt).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--secondary-muted)' }}>Tổng thanh toán:</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                          {matchedOrder.totalPrice.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>

                    {/* VISUAL JOURNEY TIMELINE STEPPER */}
                    {s === 'Hủy đơn' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#ffebee', color: '#c62828', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '40px' }}>
                        <XCircle size={32} />
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 700 }}>ĐƠN HÀNG ĐÃ BỊ HỦY BỎ</h4>
                          <p style={{ fontSize: '13px', color: 'rgba(198, 40, 40, 0.8)', marginTop: '2px' }}>
                            Rất tiếc, đơn hàng của bạn đã bị hủy bỏ trên hệ thống bởi quản lý. Vui lòng liên hệ hotline 1900 8888 để biết thêm chi tiết.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '40px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '24px', color: 'var(--secondary)' }}>Hành Trình Vận Chuyển:</h4>

                        {/* Stepper Grid Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', overflowX: 'auto', paddingBottom: '10px' }}>

                          {/* Line Background */}
                          <div style={{ position: 'absolute', top: '16px', left: '12.5%', width: '75%', height: '3px', background: '#e0e0e0', zIndex: 1 }}>
                            {/* Fill Line */}
                            <div style={{
                              height: '100%',
                              background: 'var(--primary-gradient)',
                              width: s === 'Đã giao' ? '100%' : s === 'Đang giao' ? '66.6%' : '33.3%',
                              transition: 'all 0.5s ease'
                            }}></div>
                          </div>

                          {/* Step 1: Nhận đơn */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#4caf50',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 10px rgba(76,175,80,0.3)',
                              marginBottom: '10px'
                            }}>
                              <Check size={16} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Nhận Đơn</span>
                            <span style={{ fontSize: '10px', color: 'var(--secondary-muted)', marginTop: '4px', maxWidth: '120px' }}>
                              Jusstlife đã ghi nhận đơn thành công
                            </span>
                          </div>

                          {/* Step 2: Đóng gói */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isStep2Done ? '#4caf50' : (isStep2Active ? '#ff9800' : '#e0e0e0'),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isStep2Active ? '0 4px 10px rgba(255,152,0,0.3)' : '',
                              marginBottom: '10px'
                            }}>
                              {isStep2Done ? <Check size={16} /> : <span>2</span>}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: isStep2Active || isStep2Done ? 700 : 500 }}>Đóng Gói</span>
                            <span style={{ fontSize: '10px', color: 'var(--secondary-muted)', marginTop: '4px', maxWidth: '120px' }}>
                              {isStep2Done ? 'Đã đóng gói xong' : (isStep2Active ? 'Đang chuẩn bị gói hàng...' : 'Chờ chuẩn bị hàng')}
                            </span>
                          </div>

                          {/* Step 3: Đang giao */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isStep3Done ? '#4caf50' : (isStep3Active ? '#ff9800' : '#e0e0e0'),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isStep3Active ? '0 4px 10px rgba(255,152,0,0.3)' : '',
                              marginBottom: '10px'
                            }}>
                              {isStep3Done ? <Check size={16} /> : <span>3</span>}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: isStep3Active || isStep3Done ? 700 : 500 }}>Đang Giao</span>
                            <span style={{ fontSize: '10px', color: 'var(--secondary-muted)', marginTop: '4px', maxWidth: '120px' }}>
                              {isStep3Done ? 'Đã giao cho shipper' : (isStep3Active ? 'Shipper đang di chuyển...' : 'Chờ lấy hàng')}
                            </span>
                          </div>

                          {/* Step 4: Đã giao */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', textAlign: 'center' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isStep4Done ? '#4caf50' : '#e0e0e0',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isStep4Done ? '0 4px 10px rgba(76,175,80,0.3)' : '',
                              marginBottom: '10px'
                            }}>
                              {isStep4Done ? <Check size={16} /> : <span>4</span>}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: isStep4Done ? 700 : 500 }}>Thành Công</span>
                            <span style={{ fontSize: '10px', color: 'var(--secondary-muted)', marginTop: '4px', maxWidth: '120px' }}>
                              {isStep4Done ? 'Giao hàng thành công' : 'Chờ hoàn tất'}
                            </span>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Thông tin giao nhận và Danh sách hàng mua */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                      {/* Cột Trái: Địa chỉ giao hàng */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>Thông Tin Nhận Hàng:</h4>
                        <div style={{ fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--secondary-muted)' }}>
                          <div>Người nhận: <strong>{matchedOrder.customerName}</strong></div>
                          <div>Số điện thoại: <strong>{matchedOrder.phone}</strong></div>
                          <div>Địa chỉ giao: <strong>{matchedOrder.address}</strong></div>
                          {matchedOrder.note && <div>Ghi chú: <em>"{matchedOrder.note}"</em></div>}
                          <div>Hình thức thanh toán: <strong>{matchedOrder.paymentMethod}</strong></div>
                        </div>
                      </div>

                      {/* Cột Phải: Danh sách sản phẩm mua */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>Sản Phẩm Đã Mua:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {matchedOrder.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                              <img src={item.images[0]} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                              <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--secondary-muted)' }}>Size: {item.selectedSize} / {item.selectedColor.name}</div>
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary-muted)' }}>
                                {item.quantity} x {item.price.toLocaleString('vi-VN')} ₫
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>
          </div>
        )}

        {/* =========================================================================
           PORTAL: PROFILE EDITING PAGE
           ========================================================================= */}
        {!isAdminMode && currentPage === 'profile' && currentUser && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onGoBack={() => {
              if (currentUser && (currentUser.role === 'manager')) {
                setIsAdminMode(true);
                setCurrentPage('admin');
              } else {
                setIsAdminMode(false);
                setCurrentPage('home');
              }
            }}
            orders={orders}
            products={products}
          />
        )}

        {/* =========================================================================
           PORTAL: QUẢN TRỊ VIÊN (ADMIN DASHBOARD)
           ========================================================================= */}
        {isAdminMode && (
          currentUser && (currentUser.role === 'manager') ? (
            <AdminPortal
              products={products}
              orders={orders}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onUpdateProductStatus={handleUpdateProductStatus}
              onDeleteProduct={handleDeleteProduct}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              showAlert={showAlert}
            />
          ) : (
            <div className="container animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '20px' }}>
                <Lock size={32} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>YÊU CẦU ĐẦY ĐỦ QUYỀN TRUY CẬP</h2>
              <p style={{ color: 'var(--secondary-muted)', maxWidth: '460px', margin: '0 auto 24px', fontSize: '14px', lineHeight: '1.6' }}>
                Trang này chỉ dành cho <strong>Quản Lý</strong> cửa hàng Jusstlife. Vui lòng đăng nhập đúng tài khoản được phân quyền để quản trị hệ thống.
              </p>
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  className="btn-primary-filled"
                  onClick={() => setShowLoginModal(true)}
                  style={{ padding: '10px 24px' }}
                >
                  Đăng Nhập Ngay
                </button>
                <button
                  className="btn-admin-cancel"
                  onClick={() => { setIsAdminMode(false); setCurrentPage('home'); }}
                  style={{ padding: '10px 24px' }}
                >
                  Về Trang Chủ Mua Sắm
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* 4. FOOTER */}
      {!isAdminMode && (
        <footer className="app-footer">
          <div className="container footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                JUSST<span>LIFE</span>
              </div>
              <p className="footer-desc">
                Thương hiệu thời trang tối giản, dẫn đầu xu hướng sống năng động phóng khoáng cho giới trẻ Việt Nam. Tự hào thiết kế và sản xuất 100% tại Việt Nam.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" className="social-btn" title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://instagram.com" className="social-btn" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="https://tiktok.com" className="social-btn" title="TikTok"><Sparkles size={18} /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Mua Sắm & Hỗ Trợ</h4>
              <div className="footer-links">
                <a href="#shop" onClick={(e) => { e.preventDefault(); handleClearAllFilters(); setCurrentPage('shop'); }}>Tất cả quần áo</a>
                <a href="#shop" onClick={(e) => { e.preventDefault(); setFilterCategory('ao'); setCurrentPage('shop'); }}>Áo thiết kế</a>
                <a href="#shop" onClick={(e) => { e.preventDefault(); setFilterCategory('quan'); setCurrentPage('shop'); }}>Quần thời trang</a>
                <a href="#shop" onClick={(e) => { e.preventDefault(); setFilterCategory('vay'); setCurrentPage('shop'); }}>Đầm váy xinh</a>
                <a href="#shop" onClick={(e) => { e.preventDefault(); setFilterCategory('phukien'); setCurrentPage('shop'); }}>Phụ kiện độc đáo</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Chính Sách Cửa Hàng</h4>
              <div className="footer-links">
                <a href="#about" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}>Câu chuyện thương hiệu</a>
                <a href="#return" onClick={(e) => { e.preventDefault(); setCurrentPage('policy-return'); }}>Đổi trả dễ dàng 7 ngày</a>
                <a href="#shipping" onClick={(e) => { e.preventDefault(); setCurrentPage('policy-shipping'); }}>Vận chuyển miễn phí đơn &gt; 500k</a>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); setCurrentPage('policy-privacy'); }}>Chính sách bảo mật</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Liên Hệ Jusstlife</h4>
              <div className="contact-item">
                <MapPin size={18} />
                <span>Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>Hotline: 1900 8888 (08:00 - 22:00)</span>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <span>Email: support@jusstlife.vn</span>
              </div>
            </div>
          </div>

          <div className="container footer-bottom">
            <div>© 2026 Jusstlife Fashion Brand. Bảo lưu mọi quyền.</div>
            <div className="payment-methods-icons" style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#666', fontWeight: 600 }}>
              <span>Thanh toán: COD | MB BANK | QRPAY</span>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================================
         POPUP MODALS & DIALOGS
         ========================================================================= */}

      {/* A. PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(cartItem) => {
            if (cartItem) handleAddToCart(cartItem);
            setSelectedProduct(null);
          }}
          onBuyNow={handleBuyNow}
          allProducts={products}
          showAlert={showAlert}
        />
      )}

      {/* B. ORDER PLACEMENT SUCCESS MODAL POPUP */}
      {showSuccessPopup && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-circle-icon">
              <CheckCircle size={40} fill="none" stroke="currentColor" strokeWidth="2" />
            </div>
            <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p style={{ margin: '10px 0 20px', lineHeight: '1.6' }}>
              Cảm ơn bạn đã lựa chọn mua sắm tại <strong>Jusstlife</strong>! Mã đơn đặt hàng của bạn là <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>#{lastOrderId}</strong>.
              <br />
              Đơn hàng đã được chuyển đến Cổng Quản Trị để chuẩn bị và giao hàng cho bạn trong thời gian sớm nhất.
            </p>
            <button className="btn-success-back" onClick={() => { setShowSuccessPopup(false); setCurrentPage('home'); }}>
              Về Trang Chủ Mua Sắm
            </button>
          </div>
        </div>
      )}

      {/* C. LOGIN MODAL POPUP */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}


      {/* E. SLIDE-OVER WISHLIST DRAWER POPUP */}
      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setShowWishlistModal(false);
        }}
      />

      {/* D. UNIFIED ALERT & CONFIRM MODAL POPUP */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        text={alertConfig.text}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
