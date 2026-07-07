const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem("jusst_user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const getHeaders = (customHeaders = {}, isFormData = false) => {
  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };

  const user = readStoredUser();
  const token = user?.token || user?.accessToken || user?.jwt;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

const readResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const unwrapResponse = (payload) => {
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "success") &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    if (payload.success === false) {
      throw new Error(payload.message || "Yeu cau that bai");
    }
    return payload.data;
  }

  return payload;
};

const apiFetch = async (endpoint, options = {}) => {
  const { headers: customHeaders = {}, ...restOptions } = options;
  const isFormData = typeof FormData !== "undefined" && restOptions.body instanceof FormData;
  const response = await fetch(buildUrl(endpoint), {
    ...restOptions,
    headers: getHeaders(customHeaders, isFormData),
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && !endpoint.startsWith("/api/auth/")) {
      localStorage.removeItem("jusst_user");
      window.location.reload();
      return;
    }
    const message =
      (payload && typeof payload === "object" && (payload.message || payload.error)) ||
      (typeof payload === "string" ? payload : `Error ${response.status}`);
    throw new Error(message);
  }

  return unwrapResponse(payload);
};

const currentUserIsManagerOrStaff = () => {
  const user = readStoredUser();
  return user?.role === "manager" || user?.role === "staff";
};

const toBackendOrderStatus = (status) => {
  const statusMap = {
    "Chờ xử lý": "PENDING",
    "Đang giao": "SHIPPING",
    "Đã giao": "DELIVERED",
    "Hủy đơn": "CANCELLED",
    PENDING: "PENDING",
    SHIPPING: "SHIPPING",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  };

  return statusMap[status] || status;
};

export const getSessionId = () => {
  let sessionId = sessionStorage.getItem("jusst_session_id");
  if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    sessionStorage.setItem("jusst_session_id", sessionId);
  }
  return sessionId;
};

export const api = {
  login: (credentials) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  loginGoogle: (googleData) =>
    apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(googleData),
    }),

  register: (userData) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiFetch("/api/auth/logout", {
      method: "POST",
    }),

  forgotPassword: (payload) =>
    apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload) =>
    apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProfile: () => apiFetch("/api/profile/me"),

  updateProfile: (profileData) =>
    apiFetch("/api/profile/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  getProducts: async () => {
    if (currentUserIsManagerOrStaff()) {
      return apiFetch("/api/manager/products");
    }

    const pageData = await apiFetch("/api/products?page=0&size=100&sortBy=id&sortDir=asc");
    return pageData?.content || [];
  },

  getCategories: () => apiFetch("/api/categories"),

  createCategory: (category) =>
    apiFetch("/api/manager/categories", {
      method: "POST",
      body: JSON.stringify(category),
    }),

  updateCategory: (id, category) =>
    apiFetch(`/api/manager/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    }),

  deleteCategory: (id) =>
    apiFetch(`/api/manager/categories/${id}`, {
      method: "DELETE",
    }),

  addProduct: (product) =>
    apiFetch("/api/manager/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  uploadProductImage: (file) => {
    const body = new FormData();
    body.append("file", file);
    return apiFetch("/api/manager/products/upload-image", {
      method: "POST",
      body,
    });
  },

  updateProduct: (id, product) =>
    apiFetch(`/api/manager/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),

  deleteProduct: (id) =>
    apiFetch(`/api/manager/products/${id}`, {
      method: "DELETE",
    }),

  approveProduct: (id) =>
    apiFetch(`/api/manager/products/${id}/approve`, {
      method: "PUT",
    }),

  rejectProduct: (id) =>
    apiFetch(`/api/manager/products/${id}/reject`, {
      method: "PUT",
    }),

  getCart: () => apiFetch("/api/client/cart"),

  addToCart: (productId, quantity) =>
    apiFetch(`/api/client/cart/add?productId=${productId}&quantity=${quantity}`, {
      method: "POST",
    }),

  updateCartQty: (id, quantity) =>
    apiFetch(`/api/client/cart/update/${id}?quantity=${quantity}`, {
      method: "PUT",
    }),

  removeFromCart: (id) =>
    apiFetch(`/api/client/cart/delete/${id}`, {
      method: "DELETE",
    }),

  getWishlist: () => apiFetch("/api/client/wishlist"),

  addToWishlist: (productId) =>
    apiFetch(`/api/client/wishlist/add?productId=${productId}`, {
      method: "POST",
    }),

  removeFromWishlist: (wishlistItemId) =>
    apiFetch(`/api/client/cart/delete/${wishlistItemId}`, {
      method: "DELETE",
    }),

  checkout: (address, phone, paymentMethod) =>
    apiFetch(
      `/api/client/order/checkout?address=${encodeURIComponent(address)}&phone=${encodeURIComponent(
        phone
      )}&paymentMethod=${encodeURIComponent(paymentMethod)}`,
      { method: "POST" }
    ),

  checkoutWithVoucher: (address, phone, paymentMethod, voucherCode) =>
    apiFetch(
      `/api/client/order/checkout-with-voucher?address=${encodeURIComponent(
        address
      )}&phone=${encodeURIComponent(phone)}&paymentMethod=${encodeURIComponent(
        paymentMethod
      )}&voucherCode=${encodeURIComponent(voucherCode)}`,
      { method: "POST" }
    ),

  getOrderHistory: () => apiFetch("/api/client/order/history"),

  cancelOrder: (id) =>
    apiFetch(`/api/client/order/cancel/${id}`, {
      method: "POST",
    }),

  getPaymentHistory: () => apiFetch("/api/client/payment/history"),

  getPaymentInfo: (orderId) => apiFetch(`/api/client/payment/${orderId}`),

  getAdminOrders: () => apiFetch("/api/admin/orders"),

  updateOrderStatus: (id, status) =>
    apiFetch(`/api/admin/orders/${id}/status?status=${encodeURIComponent(toBackendOrderStatus(status))}`, {
      method: "PUT",
    }),

  adminCancelOrder: (id) =>
    apiFetch(`/api/admin/orders/${id}/cancel`, {
      method: "POST",
    }),

  getVouchers: () => apiFetch("/api/manager/voucher/list"),

  createVoucher: (voucher) =>
    apiFetch("/api/manager/voucher/create", {
      method: "POST",
      body: JSON.stringify(voucher),
    }),

  deleteVoucher: (id) =>
    apiFetch(`/api/manager/voucher/${id}`, {
      method: "DELETE",
    }),

  getReviewsByProduct: (productId) => apiFetch(`/api/client/review/product/${productId}`),

  addReview: (review) =>
    apiFetch("/api/client/review/add", {
      method: "POST",
      body: JSON.stringify(review),
    }),

  deleteReview: (id) =>
    apiFetch(`/api/manager/review/${id}`, {
      method: "DELETE",
    }),

  getRevenueStats: (startDate, endDate) =>
    apiFetch(`/api/admin/market-research/revenue?startDate=${startDate}&endDate=${endDate}`),

  getMonthlyRevenue: (year) =>
    apiFetch(`/api/admin/market-research/revenue/monthly?year=${year}`),

  getTopSellingProducts: () =>
    apiFetch("/api/admin/market-research/products/top-selling?limit=10"),

  getLowStockProducts: () =>
    apiFetch("/api/admin/market-research/products/low-stock?threshold=10"),

  getCategoryAnalysis: () =>
    apiFetch("/api/admin/market-research/categories"),

  getTopCustomers: () =>
    apiFetch("/api/admin/market-research/customers/top?limit=10"),

  getActiveVouchers: () =>
    apiFetch("/api/client/voucher/active"),

  checkVoucher: (code) =>
    apiFetch(`/api/client/voucher/validate?code=${encodeURIComponent(code)}`),

  generatePayOSLink: (orderId) =>
    apiFetch(`/api/client/payment/payos/${orderId}`, {
      method: "POST",
    }),

  getUsers: () => apiFetch("/api/manager/users"),

  searchUsers: (keyword) =>
    apiFetch(`/api/manager/users/search?keyword=${encodeURIComponent(keyword)}`),

  updateUserStatus: (id, status) =>
    apiFetch(`/api/manager/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  createStaff: (staffData) =>
    apiFetch("/api/manager/users/create-staff", {
      method: "POST",
      body: JSON.stringify(staffData),
    }),

  trackFunnel: (eventType, productId = null) => {
    const sessionId = getSessionId();
    const prodParam = productId ? `&productId=${productId}` : "";
    return apiFetch(`/api/funnel/track?eventType=${eventType}&sessionId=${sessionId}${prodParam}`, {
      method: "POST"
    }).catch(err => console.warn("Lỗi gửi tracking:", err));
  },

  getFunnelStats: () =>
    apiFetch("/api/admin/market-research/funnel"),

  askAi: (message, history = []) =>
    apiFetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};

