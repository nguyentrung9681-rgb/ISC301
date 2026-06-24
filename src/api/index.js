const BASE_URL = 'http://localhost:8080';

// Optional: you can add authorization headers if your backend uses tokens.
// For now, it just sets the content-type.
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  };
  try {
    const userStr = localStorage.getItem('jusst_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      } else if (user.accessToken) {
        headers['Authorization'] = `Bearer ${user.accessToken}`;
      } else if (user.jwt) {
        headers['Authorization'] = `Bearer ${user.jwt}`;
      }
    }
  } catch (e) {}
  return headers;
};

const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      credentials: 'omit', // We omit it to prevent CORS origin wildcard issues but wait I will just remove the credentials line to let fetch use default "same-origin"
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || (typeof data === 'string' ? data : `Error ${response.status}`));
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),

  // Profile
  getProfile: () => apiFetch('/api/profile/me'),
  updateProfile: (profileData) => apiFetch('/api/profile/me', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Products (Manager/Admin - using as general products list for now)
  getProducts: () => apiFetch('/api/manager/products'),
  addProduct: (product) => apiFetch('/api/manager/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => apiFetch(`/api/manager/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => apiFetch(`/api/manager/products/${id}`, { method: 'DELETE' }),

  // Cart (Client)
  getCart: () => apiFetch('/api/client/cart'),
  addToCart: (productId, quantity) => apiFetch(`/api/client/cart/add?productId=${productId}&quantity=${quantity}`, { method: 'POST' }),
  updateCartQty: (id, quantity) => apiFetch(`/api/client/cart/update/${id}?quantity=${quantity}`, { method: 'PUT' }),
  removeFromCart: (id) => apiFetch(`/api/client/cart/delete/${id}`, { method: 'DELETE' }),

  // Wishlist (Client)
  getWishlist: () => apiFetch('/api/client/wishlist'),
  addToWishlist: (productId) => apiFetch(`/api/client/wishlist/add?productId=${productId}`, { method: 'POST' }),

  // Orders & Payment (Client)
  checkout: (address, phone, paymentMethod) => apiFetch(`/api/client/order/checkout?address=${encodeURIComponent(address)}&phone=${encodeURIComponent(phone)}&paymentMethod=${encodeURIComponent(paymentMethod)}`, { method: 'POST' }),
  checkoutWithVoucher: (address, phone, paymentMethod, voucherCode) => apiFetch(`/api/client/order/checkout-with-voucher?address=${encodeURIComponent(address)}&phone=${encodeURIComponent(phone)}&paymentMethod=${encodeURIComponent(paymentMethod)}&voucherCode=${encodeURIComponent(voucherCode)}`, { method: 'POST' }),
  getOrderHistory: () => apiFetch('/api/client/order/history'),
  cancelOrder: (id) => apiFetch(`/api/client/order/cancel/${id}`, { method: 'POST' }),

  // Payment History
  getPaymentHistory: () => apiFetch('/api/client/payment/history'),
  getPaymentInfo: (orderId) => apiFetch(`/api/client/payment/${orderId}`),

  // Orders (Admin)
  getAdminOrders: () => apiFetch('/api/admin/orders'),
  updateOrderStatus: (id, status) => apiFetch(`/api/admin/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }),
  adminCancelOrder: (id) => apiFetch(`/api/admin/orders/${id}/cancel`, { method: 'POST' }),

  // Vouchers (Admin)
  getVouchers: () => apiFetch('/api/manager/voucher/list'),
  createVoucher: (voucher) => apiFetch('/api/manager/voucher/create', { method: 'POST', body: JSON.stringify(voucher) }),
  deleteVoucher: (id) => apiFetch(`/api/manager/voucher/${id}`, { method: 'DELETE' }),

  // Reviews
  getReviewsByProduct: (productId) => apiFetch(`/api/client/review/product/${productId}`),
  addReview: (review) => apiFetch('/api/client/review/add', { method: 'POST', body: JSON.stringify(review) }),
  deleteReview: (id) => apiFetch(`/api/manager/review/${id}`, { method: 'DELETE' }),

  // Users (Admin)
  getUsers: () => apiFetch('/api/manager/users'),
  searchUsers: (keyword) => apiFetch(`/api/manager/users/search?keyword=${encodeURIComponent(keyword)}`),
  updateUserStatus: (id, status) => apiFetch(`/api/manager/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
