import React, { useState, useEffect } from 'react';
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
import Chatbot from './components/Chatbot';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import FlashSale from './components/FlashSale';
import { api, getSessionId } from "./api";
import {
  parseImages,
  normalizeUser,
  normalizeProduct,
  normalizeCartItem,
  normalizeOrder
} from './utils/normalizers';

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
  RefreshCw,
  AlertCircle,
  XCircle,
  Check
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 1, code: 'ao', name: 'Áo' },
  { id: 2, code: 'quan', name: 'Quần' },
  { id: 3, code: 'vay', name: 'Váy' },
  { id: 4, code: 'phukien', name: 'Phụ kiện' }
];

export default function App() {
  // --- CORE SYSTEM STATES (Synced with LocalStorage) ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [cart, setCart] = useState([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);
  const [orders, setOrdersState] = useState([]);
  const setOrders = (ordersList) => {
    setOrdersState(prevOrders => {
      const resolvedList = typeof ordersList === 'function' ? ordersList(prevOrders) : ordersList;
      const list = Array.isArray(resolvedList) ? resolvedList : [];
      return [...list].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    });
  };


  // --- AUTHENTICATION MOCK ACCOUNTS ---

  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('jusst_user');
    return local ? normalizeUser(JSON.parse(local)) : null;
  });

  // Keep token if we eventually add one, currently just mock or store the user obj


  const [showLoginModal, setShowLoginModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingTab, setTrackingTab] = useState('search');
  const [publicTrackedOrder, setPublicTrackedOrder] = useState(null);
  const [isSearchingPublicOrder, setIsSearchingPublicOrder] = useState(false);


  // --- NAVIGATION & PORTAL STATES ---
  const [currentPage, setCurrentPage] = useState('home'); // home, shop, about, cart, checkout, admin
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentRole, setCurrentRole] = useState(() => currentUser?.role || 'manager');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);


  // --- SHOP FILTERS STATES ---
  const [filterCategory, setFilterCategory] = useState(''); // '', ao, quan, vay, phukien
  const [filterSize, setFilterSize] = useState(''); // '', S, M, L, XL, etc.
  const [filterColor, setFilterColor] = useState(''); // '', name of color
  const [filterPriceRange, setFilterPriceRange] = useState(''); // '', '0-200', '200-400', '400+'

  // --- CHECKOUT FORM STATE ---
  const [lastOrderPaymentMethod, setLastOrderPaymentMethod] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [payosCheckoutUrl, setPayosCheckoutUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING or PAID

  // Voucher states
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');


  // FAQ state
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

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
        const [productsRes, categoriesRes, cartRes, wishlistRes, ordersRes] = await Promise.all([
          api.getProducts().catch(() => []),
          api.getCategories().catch(() => []),
          currentUser ? api.getCart().catch(() => []) : [],
          currentUser ? api.getWishlist().catch(() => []) : [],
          (currentUser?.role === 'manager' || currentUser?.role === 'staff') ? api.getAdminOrders().catch(() => []) : (currentUser ? api.getOrderHistory().catch(() => []) : [])
        ]);

        const catMap = {};
        const normalizedCategories = (Array.isArray(categoriesRes) ? categoriesRes : [])
          .filter((item) => item?.code && item?.name)
          .map((item, index) => {
            catMap[item.code] = item.name;
            return {
              id: item.id ?? index + 1,
              code: item.code,
              name: item.name
            };
          });
        if (normalizedCategories.length > 0) {
          setCategories(normalizedCategories);
        }

        setProducts((Array.isArray(productsRes) ? productsRes : []).map(normalizeProduct));
        
        const search = window.location.search;
        const path = window.location.pathname;
        const isReturningFromPayOS = path.includes('/payment') || search.includes('status=') || search.includes('orderCode=');

        if (!isReturningFromPayOS) {
          localStorage.removeItem('jusst_pending_cart');
          localStorage.removeItem('jusst_pending_order_id');
        }

        const hasPendingCart = localStorage.getItem('jusst_pending_cart');
        if (!hasPendingCart) {
          const rawCart = Array.isArray(cartRes) ? cartRes : [];
          const normalized = rawCart.map(normalizeCartItem);
          setCart(normalized);
          setSelectedCartItemIds(normalized.map(item => item.cartItemId));
        }
        setWishlist((Array.isArray(wishlistRes) ? wishlistRes : []).map(normalizeCartItem));
        setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchData();
  }, [currentUser]);

  // Khởi tạo session ID khi ứng dụng load
  useEffect(() => {
    getSessionId();
  }, []);

  // Theo dõi sự kiện bắt đầu thanh toán khi chuyển đổi trang (Kiểm tra chọn ít nhất 1 sp)
  useEffect(() => {
    if (currentPage === 'checkout') {
      if (!selectedCartItemIds || selectedCartItemIds.length === 0) {
        addToast("Bắt buộc phải chọn ít nhất 1 sản phẩm trong giỏ hàng mới chuyển sang trang thanh toán!", "warning");
        setCurrentPage('cart');
        return;
      }
      api.trackFunnel('INITIATE_CHECKOUT');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCartItemIds]);



  useEffect(() => {
    if (currentUser && (currentPage === 'profile' || currentPage === 'order-tracking')) {
      const fetchOrders = async () => {
        try {
          const ordersRes = (currentUser.role === 'manager' || currentUser.role === 'staff')
            ? await api.getAdminOrders().catch(() => [])
            : await api.getOrderHistory().catch(() => []);
          setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
        } catch (err) {
          console.error('Lỗi khi tải lịch sử đơn hàng:', err);
        }
      };
      fetchOrders();
    }
  }, [currentPage, currentUser]);

  // Lắng nghe URL parameter khi khách quét mã QR từ email (e.g. ?trackOrder=33 hoặc ?orderId=33)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get('trackOrder') || params.get('orderId');
    if (trackId) {
      setCurrentPage('order-tracking');
      setTrackingOrderId(String(trackId).trim());
      setTrackingTab('search');
    }
  }, []);

  // Tự động tra cứu qua API công khai nếu không có trong đơn hàng local
  useEffect(() => {
    if (!trackingOrderId) {
      setPublicTrackedOrder(null);
      return;
    }
    const cleanId = String(trackingOrderId || '').replace('#', '').trim();
    const foundInLocal = orders.find(o => String(o.id) === cleanId);
    if (!foundInLocal && cleanId) {
      setIsSearchingPublicOrder(true);
      api.getPublicOrderTracking(cleanId)
        .then(res => {
          const raw = res.data || res;
          if (raw && raw.id) {
            setPublicTrackedOrder(normalizeOrder(raw));
          } else {
            setPublicTrackedOrder(null);
          }
        })
        .catch(() => setPublicTrackedOrder(null))
        .finally(() => setIsSearchingPublicOrder(false));
    } else {
      setPublicTrackedOrder(null);
    }
  }, [trackingOrderId, orders]);


  const fetchActiveVouchers = async () => {
    try {
      const response = await api.getActiveVouchers();
      setActiveVouchers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách active vouchers:", error);
    }
  };

  useEffect(() => {
    fetchActiveVouchers();
  }, []);

  // Auto-apply saved voucher from localStorage
  useEffect(() => {
    const savedVoucherCode = localStorage.getItem('jusst_applied_voucher_code');
    if (savedVoucherCode && !appliedVoucher) {
      const reapplyVoucher = async () => {
        try {
          const response = await api.checkVoucher(savedVoucherCode.trim().toUpperCase());
          const v = response.data || response;
          setAppliedVoucher(v);
        } catch (error) {
          localStorage.removeItem('jusst_applied_voucher_code');
          setAppliedVoucher(null);
        }
      };
      reapplyVoucher();
    }
  }, [appliedVoucher]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('jusst_user', JSON.stringify(currentUser));
      setCurrentRole(currentUser.role);
    } else {
      localStorage.removeItem('jusst_user');
    }
  }, [currentUser]);


  // Polling payment status for PayOS
  useEffect(() => {
    let intervalId;
    if (showSuccessPopup && lastOrderId && lastOrderPaymentMethod === 'Transfer' && paymentStatus === 'PENDING') {
      intervalId = setInterval(async () => {
        try {
          const paymentInfo = await api.getPaymentInfo(lastOrderId);
          const p = paymentInfo.data || paymentInfo;
          if (p && p.status === 'PAID') {
            setPaymentStatus('PAID');
            addToast('Thanh toán đơn hàng thành công qua cổng PayOS!', 'success');
            clearInterval(intervalId);
            // Refresh orders
            const ordersRes = (currentUser?.role === 'manager' || currentUser?.role === 'staff') ? await api.getAdminOrders().catch(() => []) : await api.getOrderHistory().catch(() => []);
            setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
          }
        } catch (error) {
          console.error("Lỗi polling trạng thái thanh toán:", error);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuccessPopup, lastOrderId, lastOrderPaymentMethod, paymentStatus, currentUser]);

  // Clean up PayOS redirect URL parameters (code, id, cancel, status, orderCode)
  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/payment/success') || path.includes('/payment/cancel') || search.includes('orderCode=')) {
      const params = new URLSearchParams(search);
      const isSuccess = path.includes('/payment/success') || params.get('status') === 'PAID' || params.get('cancel') === 'false';
      const isCancel = path.includes('/payment/cancel') || params.get('status') === 'CANCELLED' || params.get('cancel') === 'true';

      if (isSuccess) {
        addToast('Thanh toán đơn hàng thành công qua cổng PayOS!', 'success');
        localStorage.removeItem('jusst_pending_cart');
        localStorage.removeItem('jusst_pending_order_id');
        setCurrentPage('profile'); // Chuyển đến trang cá nhân để xem lịch sử mua hàng
      } else if (isCancel) {
        addToast('Giao dịch thanh toán đã bị hủy hoặc không thành công. Giỏ hàng đã được khôi phục.', 'warning');
        // Restore cart from localStorage if exists
        const pendingCartStr = localStorage.getItem('jusst_pending_cart');
        const pendingOrderId = localStorage.getItem('jusst_pending_order_id');

        const restoreCart = async () => {
          try {
            // 1. Cancel the order in backend
            if (pendingOrderId) {
              try {
                await api.cancelOrder(pendingOrderId);
              } catch (cancelErr) {
                console.error("Lỗi tự động hủy đơn hàng:", cancelErr);
              }
              localStorage.removeItem('jusst_pending_order_id');
            }

            // 2. Restore cart items
            if (pendingCartStr) {
              const pendingCart = JSON.parse(pendingCartStr);
              if (Array.isArray(pendingCart) && pendingCart.length > 0) {
                for (const item of pendingCart) {
                  const productId = item.productId || item.id;
                  const size = item.selectedSize || 'M';
                  const color = item.selectedColor?.name || 'Mặc định';
                  await api.addToCart(productId, item.quantity, size, color);
                }
                const freshCart = await api.getCart();
                setCart((Array.isArray(freshCart) ? freshCart : []).map(normalizeCartItem));
                localStorage.removeItem('jusst_pending_cart');
              }
            }
          } catch (err) {
            console.error("Lỗi khôi phục giỏ hàng:", err);
          }
        };

        restoreCart();
        setCurrentPage('cart');
      }

      // Ngay lập tức xóa các tham số URL và đưa đường dẫn về trang chủ '/' để ẩn toàn bộ thông tin nhạy cảm
      window.history.replaceState(null, '', '/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN, REGISTER & LOGOUT HANDLERS

  const handleLogin = async (email, password) => {
    try {
      const res = await api.login({
        email,
        password,
      });

      const user = normalizeUser(res);
      localStorage.setItem('jusst_user', JSON.stringify(user));
      setCurrentUser(user);
      setShowLoginModal(false);

      addToast("Đăng nhập thành công!", "success");

    } catch (err) {
      addToast(
        err.message || "Đăng nhập thất bại",
        "error"
      );
    }
  };

  const handleGoogleLogin = async (googleData) => {
    try {
      const res = await api.loginGoogle(googleData);
      const user = normalizeUser(res);
      localStorage.setItem('jusst_user', JSON.stringify(user));
      setCurrentUser(user);
      setShowLoginModal(false);
      addToast("Đăng nhập bằng Google thành công!", "success");
    } catch (err) {
      addToast(
        err.message || "Đăng nhập bằng Google thất bại",
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
    // Optimistically log out immediately
    localStorage.removeItem('jusst_user');
    setCurrentUser(null);
    setTrackingOrderId('');
    setTrackingTab('search');
    addToast("Đăng xuất thành công", "success");

    // Call server logout in the background
    try {
      await api.logout();
    } catch (err) {
      console.error("Lỗi đăng xuất phía server:", err);
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
  const handleToggleWishlist = async (product) => {
    if (!currentUser) {
      setShowLoginModal(true);
      addToast("Vui lòng đăng nhập để thực hiện chức năng này!", "warning");
      return;
    }
    try {
      const matchedItem = wishlist.find((item) => item.id === product.id);
      if (matchedItem?.cartItemId) {
        await api.removeFromWishlist(matchedItem.cartItemId);
      } else if (!matchedItem) {
        await api.addToWishlist(product.id);
      }
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật danh sách yêu thích', 'error');
      return;
    }

    const isExist = wishlist.some(p => p.id === product.id);
    if (isExist) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
      addToast(`Đã xóa "${product.name}" khỏi danh sách yêu thích.`, 'info');
    } else {
      setWishlist([...wishlist, product]);
      showAlert('DANH SÁCH YÊU THÍCH', `Đã thêm sản phẩm "${product.name}" vào danh sách yêu thích thành công!`, 'success');
    }
  };

  const handleTrackingInputChange = (val) => {
    if (!currentUser) {
      setShowLoginModal(true);
      addToast("Vui lòng đăng nhập để tra cứu hành trình đơn hàng!", "warning");
      return;
    }
    setTrackingOrderId(String(val || '').toUpperCase().trim());
  };

  // --- PROFILE UPDATE HANDLER ---
  const handleUpdateProfile = async (updatedUser) => {
    try {
      const savedUser = await api.updateProfile({
        fullName: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address
      });
      updatedUser = normalizeUser({
        ...currentUser,
        ...savedUser,
        avatar: updatedUser.avatar || currentUser?.avatar
      });
    } catch (err) {
      addToast(err.message || 'Lá»—i cáº­p nháº­t thĂ´ng tin cĂ¡ nhĂ¢n', 'error');
      return;
    }

    localStorage.setItem('jusst_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    showAlert('THÀNH CÔNG', 'Đã cập nhật thông tin Profile của bạn thành công!', 'success');
  };


  // --- CUSTOMER CART ACTIONS ---
  const fetchAndSetCart = async () => {
    try {
      const cartRes = await api.getCart();
      const rawCart = Array.isArray(cartRes) ? cartRes : [];
      const normalized = rawCart.map(normalizeCartItem);
      setCart(normalized);
      setSelectedCartItemIds(prev => {
        const existingIds = normalized.map(item => item.cartItemId);
        if (prev.length === 0) {
          return existingIds;
        } else {
          // Keep existing selections, auto-select newly added items, filter out deleted items
          const prevCartIds = cart.map(item => item.cartItemId);
          const newIds = existingIds.filter(id => !prevCartIds.includes(id));
          const filteredPrev = prev.filter(id => existingIds.includes(id));
          return [...filteredPrev, ...newIds];
        }
      });
    } catch (err) {
      console.error('Error refreshing cart:', err);
    }
  };

  const handleAddToCart = async (cartItem) => {
    if (!cartItem) return;
    if (!currentUser) {
      setShowLoginModal(true);
      addToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "warning");
      return;
    }
    try {
      const size = cartItem.selectedSize || 'M';
      const colorName = cartItem.selectedColor?.name || cartItem.selectedColor || 'Mặc định';
      await api.addToCart(cartItem.id, cartItem.quantity, size, colorName);
      fetchAndSetCart(); // sync in background
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

    // Optimistically update quantity locally
    const previousCart = cart;
    setCart(cart.map((c, i) => i === idx ? { ...c, quantity: newQty } : c));

    try {
      await api.updateCartQty(item.cartItemId || item.id, newQty);
      fetchAndSetCart(); // run in background
    } catch (err) {
      setCart(previousCart);
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
        const previousCart = cart;
        // Optimistically remove item from cart state
        setCart(cart.filter((c, i) => i !== idx));
        addToast(`Đã xóa sản phẩm khỏi giỏ hàng`, 'info');

        try {
          await api.removeFromCart(item.cartItemId || item.id);
          fetchAndSetCart(); // sync in background
        } catch (err) {
          setCart(previousCart);
          addToast(err.message || 'Lỗi xóa sản phẩm', 'error');
        }
      }
    );
  };


  const handleApplyVoucher = async (code) => {
    if (!code || !code.trim()) {
      showAlert('THIẾU THÔNG TIN', 'Vui lòng nhập mã giảm giá!', 'warning');
      return;
    }
    try {
      const response = await api.checkVoucher(code.trim().toUpperCase());
      const v = response.data || response;
      setAppliedVoucher(v);
      localStorage.setItem('jusst_applied_voucher_code', v.code);
      showAlert('THÀNH CÔNG', `Đã áp dụng mã giảm giá ${v.code} (giảm ${v.discountPercent}%) thành công!`, 'success');
    } catch (error) {
      setAppliedVoucher(null);
      localStorage.removeItem('jusst_applied_voucher_code');
      showAlert('LỖI ÁP DỤNG', error.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng.', 'error');
    }
  };

  // --- PLACE ORDER FLOW ---
  const handlePlaceOrder = async ({ name, phone, address, note, paymentMethod }) => {
    if (selectedCartItems.length === 0) {
      showAlert('CHƯA CHỌN SẢN PHẨM', 'Vui lòng chọn ít nhất một sản phẩm trong giỏ hàng để thanh toán.', 'warning');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showAlert('THIẾU THÔNG TIN', 'Vui lòng nhập đầy đủ thông tin giao nhận hàng!', 'warning');
      return;
    }

    try {
      const isCod = paymentMethod === 'COD';
      const pm = isCod ? "COD" : "Chuyển khoản";
      setLastOrderPaymentMethod(paymentMethod);

      let order;
      const selectedIds = selectedCartItems.map(item => item.cartItemId);
      if (appliedVoucher) {
        order = await api.checkoutWithVoucher(name.trim(), address.trim(), phone.trim(), pm, appliedVoucher.code, selectedIds);
      } else {
        order = await api.checkout(name.trim(), address.trim(), phone.trim(), pm, selectedIds);
      }

      setLastOrderId(order.id);
      setOrders(prev => [normalizeOrder(order), ...prev]);
      setPaymentStatus('PENDING');

      if (!isCod) {
        try {
          const paymentData = await api.generatePayOSLink(order.id);
          const checkoutUrl = paymentData?.checkoutUrl || paymentData || '';
          setPayosCheckoutUrl(checkoutUrl);
          if (checkoutUrl) {
            localStorage.setItem('jusst_pending_cart', JSON.stringify(cart));
            localStorage.setItem('jusst_pending_order_id', order.id);
            window.location.href = checkoutUrl;
            return;
          }
        } catch (payosError) {
          console.error("Lỗi tạo link PayOS:", payosError);
          setPayosCheckoutUrl('');
        }
      } else {
        setPayosCheckoutUrl('');
      }

      localStorage.removeItem('jusst_pending_cart');
      localStorage.removeItem('jusst_pending_order_id');
      await fetchAndSetCart();
      api.trackFunnel('PURCHASE');

      setAppliedVoucher(null);
      localStorage.removeItem('jusst_applied_voucher_code');
      setVoucherCodeInput('');
      setShowSuccessPopup(true);

      // Refresh orders in background
      if (currentUser) {
        const fetchOrders = (currentUser.role === 'manager' || currentUser.role === 'staff')
          ? api.getAdminOrders()
          : api.getOrderHistory();
        fetchOrders
          .then((ordersRes) => {
            setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
          })
          .catch((e) => console.error("Error refreshing orders in background:", e));
      }

      // Refresh products (inventory updated) in background
      api.getProducts()
        .then((productsRes) => {
          setProducts((Array.isArray(productsRes) ? productsRes : []).map(normalizeProduct));
        })
        .catch((e) => console.error("Error refreshing products in background:", e));
    } catch (err) {
      showAlert('LỖI ĐẶT HÀNG', err.message || 'Lỗi đặt hàng', 'error');
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
      setProducts((Array.isArray(productsRes) ? productsRes : []).map(normalizeProduct));
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
        category: newProduct.category || 'ao',
        sizes: Array.isArray(newProduct.sizes) ? newProduct.sizes : [],
        colors: Array.isArray(newProduct.colors) ? newProduct.colors.map((color) => color?.name || '').filter(Boolean) : []
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
        category: newProduct.category || 'ao',
        sizes: Array.isArray(newProduct.sizes) ? newProduct.sizes : [],
        colors: Array.isArray(newProduct.colors) ? newProduct.colors.map((color) => color?.name || '').filter(Boolean) : []
      };

      await api.updateProduct(id, payload);
      await fetchProducts();

      addToast(`Sản phẩm "${newProduct.name}" đã được cập nhật thành công!`, 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật sản phẩm', 'error');
    }
  };

  const handleUpdateProductStatus = async (id, newStatus) => {
    try {
      const prod = products.find(p => p.id === id);
      if (newStatus === 'approved') {
        await api.approveProduct(id);
        addToast(`Đã PHÊ DUYỆT sản phẩm "${prod?.name || ''}" đăng bán!`, 'success');
      } else if (newStatus === 'rejected') {
        await api.rejectProduct(id);
        addToast(`Đã TỪ CHỐI sản phẩm "${prod?.name || ''}".`, 'info');
      }
      await fetchProducts();
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật trạng thái sản phẩm', 'error');
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
    if (newStatus === 'Hủy đơn') {
      const order = orders.find(o => o.id === id);
      const isPaid = order && order.paymentStatus === 'PAID';

      showConfirm(
        'XÁC NHẬN HỦY ĐƠN HÀNG',
        isPaid 
          ? `CẢNH BÁO: Đơn hàng #${id} đã được thanh toán thành công. Việc hủy đơn này sẽ yêu cầu bạn phải hoàn lại tiền thủ công cho khách hàng. Bạn có chắc chắn muốn hủy đơn hàng?`
          : `Bạn có chắc chắn muốn hủy đơn hàng #${id}?`,
        'delete',
        async () => {
          // Optimistically update status locally
          setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status: 'Hủy đơn' } : o));
          try {
            await api.adminCancelOrder(id);
            addToast(`Đã hủy đơn hàng #${id} thành công!`, 'info');
            // Fetch in background to sync
            api.getAdminOrders()
              .then(ordersRes => setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder)))
              .catch(console.error);
          } catch (err) {
            addToast(err.message || 'Lỗi hủy đơn hàng', 'error');
            // Rollback on error
            const ordersRes = await api.getAdminOrders().catch(() => []);
            setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
          }
        }
      );
      return;
    }

    // Optimistically update status locally
    setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    try {
      await api.updateOrderStatus(id, newStatus);
      addToast(`Đã chuyển đơn #${id} sang trạng thái "${newStatus}"!`, 'success');
      // Fetch in background to sync
      api.getAdminOrders()
        .then(ordersRes => setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder)))
        .catch(console.error);
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
      // Rollback on error
      const ordersRes = await api.getAdminOrders().catch(() => []);
      setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
    }
  };

  const handleClientCancelOrder = async (id) => {
    showConfirm(
      'HỦY ĐƠN HÀNG CỦA BẠN',
      `Bạn có chắc chắn muốn hủy đơn hàng #${id} không? Hành động này sẽ hoàn trả số lượng sản phẩm lại kho.`,
      'delete',
      async () => {
        try {
          await api.cancelOrder(id);
          const ordersRes = (currentUser?.role === 'manager' || currentUser?.role === 'staff')
            ? await api.getAdminOrders().catch(() => [])
            : await api.getOrderHistory().catch(() => []);
          setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
          addToast(`Đã hủy đơn hàng #${id} thành công!`, 'info');
        } catch (err) {
          addToast(err.message || 'Lỗi hủy đơn hàng', 'error');
        }
      }
    );
  };

  const handleClientRequestReturn = async (id, reason) => {
    try {
      await api.requestReturnOrder(id, reason);
      const ordersRes = (currentUser?.role === 'manager' || currentUser?.role === 'staff')
        ? await api.getAdminOrders().catch(() => [])
        : await api.getOrderHistory().catch(() => []);
      setOrders((Array.isArray(ordersRes) ? ordersRes : []).map(normalizeOrder));
      addToast(`Đã gửi yêu cầu đổi size cho đơn hàng #${id}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi gửi yêu cầu đổi size', 'error');
    }
  };

  const handleGeneratePayOSLink = async (orderId) => {
    try {
      addToast('Đang tạo liên kết thanh toán PayOS...', 'info');
      const paymentData = await api.generatePayOSLink(orderId);
      const url = paymentData?.checkoutUrl || paymentData;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        addToast('Đã mở liên kết thanh toán PayOS ở tab mới!', 'success');
      } else {
        addToast('Không thể lấy liên kết thanh toán PayOS.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Lỗi khi tạo liên kết thanh toán PayOS', 'error');
    }
  };




  const toggleSelectCartItem = (cartItemId) => {
    setSelectedCartItemIds(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAllCartItems = () => {
    if (selectedCartItemIds.length === cart.length) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(cart.map(item => item.cartItemId));
    }
  };

  const selectedCartItems = cart.filter(item => selectedCartItemIds.includes(item.cartItemId));
  const cartTotalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShip = cartTotalPrice >= 500000;
  const shipFee = cartTotalPrice > 0 ? (isFreeShip ? 0 : 30000) : 0;
  const voucherDiscount = appliedVoucher ? (cartTotalPrice * appliedVoucher.discountPercent / 100) : 0;
  const cartFinalPrice = Math.max(0, cartTotalPrice - voucherDiscount + shipFee);

  const handleProceedToCheckout = () => {
    if (!selectedCartItems || selectedCartItems.length === 0) {
      addToast("Bắt buộc phải chọn ít nhất 1 sản phẩm trong giỏ hàng mới chuyển sang trang thanh toán!", "warning");
      return;
    }
    setCurrentPage('checkout');
  };

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

            <FlashSale 
              products={products} 
              onSelectProduct={setSelectedProduct} 
              onAddToCart={handleAddToCart} 
            />

            {/* VOUCHERS CAROUSEL / GRID SECTION */}
            {activeVouchers.length > 0 && (
              <section className="container" style={{ margin: '40px auto 40px auto' }}>
                <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="section-subtitle">Ưu đãi độc quyền</span>
                  <h2 className="section-title">Mã Giảm Giá Dành Cho Bạn</h2>
                  <div style={{ width: '50px', height: '3px', background: 'var(--primary)', marginTop: '8px' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
                  {activeVouchers.map((voucher) => (
                    <div 
                      key={voucher.id} 
                      style={{ 
                        background: 'white', 
                        border: '1px dashed var(--primary)', 
                        borderRadius: '12px', 
                        padding: '16px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        minWidth: '260px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Left dotted decoration */}
                      <div style={{ position: 'absolute', left: '-8px', top: 'calc(50% - 8px)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', borderRight: '1px dashed var(--primary)' }}></div>
                      {/* Right dotted decoration */}
                      <div style={{ position: 'absolute', right: '-8px', top: 'calc(50% - 8px)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', borderLeft: '1px dashed var(--primary)' }}></div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-muted)', fontWeight: 600 }}>GIẢM NGAY</span>
                        <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>{voucher.discountPercent}%</span>
                      </div>
                      
                      <div style={{ height: '40px', width: '1px', background: '#eee' }}></div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.5px' }}>{voucher.code}</span>
                        <span style={{ fontSize: '11px', color: 'var(--secondary-muted)', marginTop: '2px' }}>
                          Lượt dùng còn lại: {voucher.maxUses - voucher.usedCount}
                        </span>
                        {voucher.expiryDate && (
                          <span style={{ fontSize: '10px', color: '#c62828', marginTop: '2px', fontWeight: 500 }}>
                            HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(voucher.code);
                          addToast(`Đã sao chép mã ${voucher.code}!`, 'success');
                        }}
                        style={{
                          background: 'var(--primary-gradient)',
                          border: 'none',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Sao chép
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* HIGHLIGHT CATEGORIES */}
            <section className="container" style={{ marginBottom: '60px' }}>
              <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <span className="section-subtitle">Bộ sưu tập thời trang</span>
                <h2 className="section-title">Danh Mục Nổi Bật</h2>
                <div style={{ width: '50px', height: '3px', background: 'var(--primary)', marginTop: '8px' }}></div>
              </div>

              <div className="categories-grid" style={{ marginTop: '20px' }}>
                {categories.map((cat, idx) => {
                  const preset = {
                    ao: { icon: "👕", desc: "T-Shirt, Hoodie, Polo" },
                    quan: { icon: "👖", desc: "Baggy Jean, Jogger, Short" },
                    vay: { icon: "👗", desc: "Floral Dress, Tennis Skirt" },
                    phukien: { icon: "🧢", desc: "Cap, Tote Bag, Retro Socks" }
                  }[cat.code] || { icon: "🛍️", desc: "Sản phẩm thời trang cao cấp" };

                  return (
                    <div
                      key={cat.code || idx}
                      className="category-card"
                      onClick={() => {
                        setFilterCategory(cat.code);
                        setCurrentPage('shop');
                      }}
                    >
                      <div className="category-image-wrapper" style={{ fontSize: '32px' }}>
                        {preset.icon}
                      </div>
                      <h3>{cat.name.toUpperCase()}</h3>
                      <span>{products.filter(p => p.category === cat.code && p.status === 'approved').length} sản phẩm đang bán</span>
                    </div>
                  );
                })}
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
                {products
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
                {products
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
          <ShopPage
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterSize={filterSize}
            setFilterSize={setFilterSize}
            filterColor={filterColor}
            setFilterColor={setFilterColor}
            filterPriceRange={filterPriceRange}
            setFilterPriceRange={setFilterPriceRange}
            handleClearAllFilters={handleClearAllFilters}
            setSelectedProduct={setSelectedProduct}
            handleAddToCart={handleAddToCart}
            showAlert={showAlert}
            wishlist={wishlist}
            handleToggleWishlist={handleToggleWishlist}
          />
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

            {/* FAQ Accordion Section */}
            <h3 className="lookbook-title">Câu Hỏi Thường Gặp (FAQs)</h3>
            <div style={{ maxWidth: '800px', margin: '0 auto 40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {[
                {
                  q: "Chính sách đổi trả sản phẩm thế nào?",
                  a: "Jusstlife hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng thành công. Sản phẩm đổi trả phải còn nguyên mác tag, chưa qua sử dụng hay giặt là và không có mùi lạ. Quý khách được đổi sang size khác hoặc sản phẩm có giá trị tương đương miễn phí phí dịch vụ."
                },
                {
                  q: "Giao hàng mất bao lâu và phí ship bao nhiêu?",
                  a: "Thời gian giao hàng tiêu chuẩn là 2 - 4 ngày tùy khu vực. Phí vận chuyển đồng giá là 30.000đ toàn quốc. Đặc biệt, Jusstlife miễn phí vận chuyển (Freeship) cho mọi đơn hàng từ 500.000đ trở lên."
                },
                {
                  q: "Làm thế nào để chọn được size áo quần vừa vặn nhất?",
                  a: "Trong trang chi tiết của mỗi sản phẩm đều có bảng chọn size theo chiều cao & cân nặng cụ thể. Bạn cũng có thể mở widget Chatbot ở góc phải hoặc liên hệ trực tiếp hotline để được tư vấn size chính xác nhất."
                },
                {
                  q: "Hotline hỗ trợ khẩn cấp của cửa hàng là số nào?",
                  a: "Số hotline chính thức chăm sóc khách hàng của Jusstlife là 1900-6789 (Hỗ trợ từ 8:00 đến 22:00 hàng ngày, bao gồm cả các ngày cuối tuần và lễ Tết)."
                }
              ].map((item, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <div key={index} style={{ borderBottom: index < 3 ? '1px solid var(--border-light)' : 'none' }}>
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px 24px',
                        background: isOpen ? '#fcfcfc' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: 700, color: isOpen ? 'var(--primary)' : 'var(--secondary)' }}>
                        {item.q}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--secondary-muted)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="animate-fade" style={{ padding: '0 24px 20px', fontSize: '14px', color: 'var(--secondary-muted)', lineHeight: '1.6', background: '#fcfcfc' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <>
                    <div className="cart-select-all-bar" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '16px',
                      marginBottom: '20px',
                      borderBottom: '1px solid var(--border-light)',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--secondary)'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          className="cart-item-checkbox" 
                          checked={cart.length > 0 && selectedCartItemIds.length === cart.length} 
                          onChange={toggleSelectAllCartItems}
                        />
                        <span>Chọn tất cả ({cart.length} sản phẩm)</span>
                      </label>
                      {selectedCartItemIds.length > 0 && (
                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                          Đã chọn {selectedCartItemIds.length} sản phẩm
                        </span>
                      )}
                    </div>
                    <div className="cart-items-list">
                      {cart.map((item, idx) => (
                        <div key={idx} className="cart-item">
                          <input 
                            type="checkbox" 
                            className="cart-item-checkbox" 
                            checked={selectedCartItemIds.includes(item.cartItemId)}
                            onChange={() => toggleSelectCartItem(item.cartItemId)}
                          />
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

                        <div className="cart-item-price-unit" style={{ whiteSpace: 'nowrap' }}>
                          {item.price.toLocaleString('vi-VN') + '\u00a0₫'}
                        </div>

                        {/* Qty changer */}
                        <div className="qty-selector">
                          <button className="qty-btn" onClick={() => handleUpdateCartQty(idx, -1)}>-</button>
                          <div className="qty-value">{item.quantity}</div>
                          <button className="qty-btn" onClick={() => handleUpdateCartQty(idx, 1)}>+</button>
                        </div>

                        <div className="cart-item-total" style={{ whiteSpace: 'nowrap' }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN') + '\u00a0₫'}
                        </div>

                        <button className="cart-item-remove" onClick={() => handleRemoveCartItem(idx)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </div>

              {/* Cart Summary Panel */}
              {cart.length > 0 && (
                <div className="cart-summary-card">
                  <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

                  <div className="summary-row">
                    <span>Tạm tính</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{cartTotalPrice.toLocaleString('vi-VN') + '\u00a0₫'}</span>
                  </div>

                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                      {shipFee === 0 ? "Miễn phí" : "30.000 ₫"}
                    </span>
                  </div>

                  {appliedVoucher && (
                    <div className="summary-row" style={{ color: '#2e7d32' }}>
                      <span>Giảm giá ({appliedVoucher.discountPercent}%)</span>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>-{voucherDiscount.toLocaleString('vi-VN') + '\u00a0₫'}</span>
                    </div>
                  )}

                  {isFreeShip ? (
                    <div style={{ fontSize: '11px', color: '#2e7d32', background: '#e8f5e9', padding: '6px 10px', borderRadius: '4px', marginBottom: '16px', fontWeight: 600 }}>
                      🎉 Đơn hàng đã đủ điều kiện freeship (từ 500k)!
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#ff8f00', background: '#fff8e1', padding: '6px 10px', borderRadius: '4px', marginBottom: '16px', fontWeight: 500 }}>
                       💡 Mua thêm <strong style={{ whiteSpace: 'nowrap' }}>{(500000 - cartTotalPrice).toLocaleString('vi-VN') + '\u00a0₫'}</strong> để được miễn phí vận chuyển!
                    </div>
                  )}

                  <div className="voucher-box">
                    <input 
                      type="text" 
                      placeholder="Nhập mã voucher..." 
                      className="voucher-input" 
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    />
                    <button 
                      type="button" 
                      className="voucher-btn"
                      onClick={() => handleApplyVoucher(voucherCodeInput)}
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {appliedVoucher && (
                    <div style={{ fontSize: '11px', color: '#2e7d32', display: 'flex', justifyContent: 'space-between', marginBottom: '15px', marginTop: '-10px', padding: '0 4px' }}>
                      <span>Đã áp dụng: <strong>{appliedVoucher.code}</strong></span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setAppliedVoucher(null);
                          localStorage.removeItem('jusst_applied_voucher_code');
                        }} 
                        style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}

                  <div className="summary-row total-row">
                    <span>Tổng cộng</span>
                    <span className="total-price-text" style={{ whiteSpace: 'nowrap' }}>{cartFinalPrice.toLocaleString('vi-VN') + '\u00a0₫'}</span>
                  </div>

                  <button className="checkout-action-btn" onClick={handleProceedToCheckout}>
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
          <CheckoutPage
            cart={selectedCartItems}
            cartTotalPrice={cartTotalPrice}
            shipFee={shipFee}
            appliedVoucher={appliedVoucher}
            voucherDiscount={voucherDiscount}
            cartFinalPrice={cartFinalPrice}
            onPlaceOrder={handlePlaceOrder}
            currentUser={currentUser}
            showAlert={showAlert}
          />
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
                Tra cứu trực tiếp hành trình xử lý, đóng gói và vận chuyển kiện hàng của bạn hoặc xem lại danh sách đơn hàng đã mua.
              </p>

              {/* Sub-tabs for Tracking Page */}
              <div style={{ display: 'flex', gap: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => setTrackingTab('search')}
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: trackingTab === 'search' ? 'var(--primary-light)' : 'transparent',
                    color: trackingTab === 'search' ? 'var(--primary)' : 'var(--secondary-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  🔍 Tra cứu mã đơn hàng
                </button>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setShowLoginModal(true);
                      addToast("Vui lòng đăng nhập để xem danh sách đơn hàng!", "warning");
                      return;
                    }
                    setTrackingTab('history');
                  }}
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: trackingTab === 'history' ? 'var(--primary-light)' : 'transparent',
                    color: trackingTab === 'history' ? 'var(--primary)' : 'var(--secondary-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  📦 Đơn hàng của tôi ({currentUser ? orders.length : 0})
                </button>
              </div>

              {trackingTab === 'search' && (
                <div className="animate-fade">
                  {/* SEARCH INPUT BAR */}
              <div style={{ display: 'flex', gap: '12px', maxWidth: '560px', marginBottom: '30px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã đơn hàng của bạn (Ví dụ: JUSST123456)..."
                  className="checkout-input"
                  value={String(trackingOrderId || '')}
                  onChange={(e) => handleTrackingInputChange(e.target.value)}
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
                    {orders.slice(0, 4).map((ord) => (
                      <button
                        key={ord.id}
                        onClick={() => setTrackingOrderId(String(ord.id ?? ''))}
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

                const cleanId = String(trackingOrderId || '').replace('#', '').trim();
                const matchedOrder = orders.find(o => String(o.id) === cleanId) || publicTrackedOrder;

                if (isSearchingPublicOrder) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--primary)' }}>
                      <RefreshCw size={24} className="spin" style={{ marginBottom: '10px' }} />
                      <p style={{ fontWeight: 600 }}>Đang tra cứu dữ liệu hành trình đơn hàng #{cleanId}...</p>
                    </div>
                  );
                }

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
                const isStep3Done = s === 'Đã giao';
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
                          Ngày đặt: {(() => {
                            const d = new Date(matchedOrder.createdAt || matchedOrder.orderDate);
                            if (isNaN(d.getTime())) return 'Không rõ';
                            return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN')}`;
                          })()}
                        </span>
                        {matchedOrder.status === 'Chờ xử lý' && matchedOrder.paymentStatus !== 'PAID' && (
                          <div style={{ marginTop: '12px' }}>
                            <button
                              onClick={() => handleClientCancelOrder(matchedOrder.id)}
                              style={{
                                padding: '8px 16px',
                                fontSize: '12.5px',
                                background: '#ffebee',
                                color: '#c62828',
                                border: '1px solid #ffcdd2',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ef5350';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffebee';
                                e.currentTarget.style.color = '#c62828';
                              }}
                            >
                              Hủy Đơn Hàng Này
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--secondary-muted)' }}>Tổng thanh toán:</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          {matchedOrder.totalPrice.toLocaleString('vi-VN') + '\u00a0₫'}
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
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary-muted)', whiteSpace: 'nowrap' }}>
                                {item.quantity} x {item.price.toLocaleString('vi-VN') + '\u00a0₫'}
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
              )}

              {/* LỊCH SỬ ĐƠN HÀNG TAB */}
              {trackingTab === 'history' && (
                <div className="animate-fade">
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-muted)' }}>
                      <p>Bạn chưa có đơn hàng nào tại Jusstlife.</p>
                      <button className="btn-primary-filled" onClick={() => setCurrentPage('shop')} style={{ marginTop: '16px', padding: '8px 20px' }}>
                        Mua sắm ngay
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {orders.map((ord) => {
                        const date = new Date(ord.createdAt || ord.orderDate);
                        const formattedDate = isNaN(date.getTime()) ? 'Không rõ' : `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
                        const s = ord.status;
                        const statusColor = s === 'Đã giao' ? '#2e7d32' : s === 'Đang giao' ? '#ff9800' : s === 'Hủy đơn' ? '#c62828' : '#7c3aed';
                        const statusBg = s === 'Đã giao' ? '#e8f5e9' : s === 'Đang giao' ? '#fff3e0' : s === 'Hủy đơn' ? '#ffebee' : '#f3e5f5';

                        return (
                          <div key={ord.id} style={{ background: '#fdfdfd', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }} className="service-card">
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--secondary)' }}>Mã đơn: #{ord.id}</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  background: statusBg,
                                  color: statusColor,
                                  textTransform: 'uppercase',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {s}
                                </span>
                              </div>
                              <div style={{ fontSize: '12.5px', color: 'var(--secondary-muted)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                <div>📅 Ngày đặt: <strong>{formattedDate}</strong></div>
                                <div>👤 Người nhận: <strong>{ord.customerName}</strong></div>
                                <div>📞 Số điện thoại: <strong>{ord.phone || 'Chưa cung cấp'}</strong></div>
                                <div>💰 Tổng tiền: <strong style={{ color: 'var(--primary)' }}>{ord.totalPrice.toLocaleString('vi-VN') + '\u00a0₫'}</strong></div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setTrackingOrderId(String(ord.id));
                                setTrackingTab('search');
                              }}
                              className="btn-primary-filled"
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--primary-gradient)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>Theo Dõi Hành Trình</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
              if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'staff')) {
                setIsAdminMode(true);
                setCurrentPage('admin');
              } else {
                setIsAdminMode(false);
                setCurrentPage('home');
              }
            }}
            orders={orders}
            products={products}
            onCancelOrder={handleClientCancelOrder}
            onRequestReturnOrder={handleClientRequestReturn}
            onGeneratePayOSLink={handleGeneratePayOSLink}
          />
        )}

        {/* =========================================================================
           PORTAL: QUẢN TRỊ VIÊN (ADMIN DASHBOARD)
           ========================================================================= */}
        {isAdminMode && (
          currentUser && (currentUser.role === 'manager' || currentUser.role === 'staff') ? (
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
              onCategoriesChange={(cats) => setCategories(cats)}
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
          <div className="success-modal" style={{ maxWidth: '480px', padding: '30px' }}>
            {lastOrderPaymentMethod === 'Transfer' && paymentStatus === 'PAID' ? (
              <>
                <div className="success-circle-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                  <CheckCircle size={40} fill="none" stroke="currentColor" strokeWidth="2" />
                </div>
                <h2>THANH TOÁN THÀNH CÔNG!</h2>
                <p style={{ margin: '10px 0 20px', lineHeight: '1.6' }}>
                  Cảm ơn bạn! Hệ thống đã nhận được thanh toán chuyển khoản cho đơn hàng <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>#{lastOrderId}</strong> qua cổng PayOS.
                  <br />
                  Đơn hàng của bạn đang được chuẩn bị để bàn giao cho đối tác vận chuyển.
                </p>
              </>
            ) : lastOrderPaymentMethod === 'Transfer' && payosCheckoutUrl ? (
              <>
                <div className="success-circle-icon" style={{ background: '#fff8e1', color: '#ff8f00' }}>
                  <RefreshCw className="animate-spin" size={40} />
                </div>
                <h2>ĐANG CHỜ THANH TOÁN</h2>
                <p style={{ margin: '10px 0 15px', lineHeight: '1.6', fontSize: '14px' }}>
                  Đơn hàng <strong style={{ color: 'var(--primary)' }}>#{lastOrderId}</strong> đã được khởi tạo. Vui lòng nhấn vào nút bên dưới để thanh toán qua cổng bảo mật PayOS:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee', width: '100%' }}>
                  <a 
                    href={payosCheckoutUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      padding: '12px 24px', 
                      borderRadius: '8px', 
                      background: 'var(--primary-gradient)', 
                      color: 'white', 
                      display: 'inline-block',
                      width: '100%',
                      textAlign: 'center',
                      boxShadow: '0 4px 10px rgba(255,87,34,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Thanh Toán Ngay qua PayOS
                  </a>
                  <span style={{ fontSize: '12px', color: 'var(--secondary-muted)' }}>
                    (Hỗ trợ quét mã VietQR, thẻ ATM nội địa, Visa/Mastercard)
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--secondary-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <RefreshCw className="animate-spin" size={12} />
                  <span>Đang tự động kiểm tra trạng thái thanh toán...</span>
                </p>
              </>
            ) : (
              <>
                <div className="success-circle-icon">
                  <CheckCircle size={40} fill="none" stroke="currentColor" strokeWidth="2" />
                </div>
                <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
                <p style={{ margin: '10px 0 20px', lineHeight: '1.6' }}>
                  Cảm ơn bạn đã lựa chọn mua sắm tại <strong>Jusstlife</strong>! Mã đơn đặt hàng của bạn là <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>#{lastOrderId}</strong>.
                  <br />
                  Đơn hàng đã được chuyển đến Cổng Quản Trị để chuẩn bị và giao hàng cho bạn trong thời gian sớm nhất.
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '20px', justifyContent: 'center' }}>
              <button 
                className="btn-success-back" 
                style={{ flex: 1, marginTop: 0, padding: '12px 20px', fontSize: '13px' }} 
                onClick={() => { 
                  setShowSuccessPopup(false); 
                  setCurrentPage('home'); 
                }}
              >
                Về Trang Chủ Mua Sắm
              </button>
              <button 
                className="btn-success-back" 
                style={{ 
                  flex: 1, 
                  marginTop: 0, 
                  padding: '12px 20px', 
                  fontSize: '13px',
                  background: 'var(--primary-gradient)', 
                  color: 'white', 
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(255,87,34,0.2)'
                }} 
                onClick={() => { 
                  setShowSuccessPopup(false); 
                  setTrackingOrderId(String(lastOrderId));
                  setTrackingTab('search');
                  setCurrentPage('order-tracking'); 
                }}
              >
                Theo Dõi Đơn Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. LOGIN MODAL POPUP */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />


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
      {/* F. FAQ CHATBOT WIDGET */}
      <Chatbot 
        isAdminMode={isAdminMode} 
        onAddToCart={handleAddToCart}
        setSelectedProduct={setSelectedProduct}
      />
    </div>
  );
}
