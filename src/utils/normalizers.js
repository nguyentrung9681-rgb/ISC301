export const parseImages = (imgUrl) => {
  if (!imgUrl) return ['https://via.placeholder.com/400x500'];
  try {
    const parsed = JSON.parse(imgUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) { }
  return [imgUrl];
};

export const categoryLabelMap = {
  ao: 'Áo',
  quan: 'Quần',
  vay: 'Váy',
  phukien: 'Phụ kiện'
};

export const normalizeRole = (role) => {
  if (!role) return 'customer';
  const roleUpper = String(role).toUpperCase();
  if (roleUpper === 'MANAGER') return 'manager';
  if (roleUpper === 'STAFF') return 'staff';
  return 'customer';
};

export const COLOR_HEX_MAP = {
  'den': '#1A1A1A',
  'tr?ng': '#FFFFFF',
  'trang': '#FFFFFF',
  'xam': '#8E8E93',
  'do': '#DC2626',
  'h?ng nh?t': '#FFC0CB',
  'hong nhat': '#FFC0CB',
  'tim': '#7C3AED',
  'm?u be': '#EBE3D5',
  'mau be': '#EBE3D5',
  'nau': '#8B5E3C',
  'bac': '#C0C0C0',
  'đen': '#1A1A1A',
  'trắng': '#FFFFFF',
  'xám': '#8E8E93',
  'xanh': '#2563EB',
  'xanh navy': '#1D2D44',
  'xanh dương': '#2563EB',
  'xanh đậm': '#1D4ED8',
  'đỏ': '#DC2626',
  'hồng': '#EC4899',
  'hồng nhạt': '#FFC0CB',
  'vàng': '#FACC15',
  'hoa vàng': '#FFD166',
  'cam': '#F97316',
  'tím': '#7C3AED',
  'kem': '#F5F1E8',
  'be': '#EBE3D5',
  'màu be': '#EBE3D5',
  'be mộc': '#EBE3D5',
  'nâu': '#8B5E3C',
  'bạc': '#C0C0C0',
  'mặc định': '#000000',
  'mac dinh': '#000000'
};

export const resolveColorHex = (colorName, fallbackHex = '#000') => {
  const normalizedName = String(colorName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (COLOR_HEX_MAP[normalizedName]) {
    return COLOR_HEX_MAP[normalizedName];
  }
  if (normalizedName.includes('navy')) return '#1D2D44';
  if (normalizedName.includes('tr') && normalizedName.includes('?')) return '#FFFFFF';
  if (normalizedName.includes('h') && normalizedName.includes('nh?t')) return '#FFC0CB';
  if (normalizedName.includes('be')) return '#EBE3D5';
  return fallbackHex;
};

export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    name: user.fullName || user.name || 'User',
    fullName: user.fullName || user.name || 'User',
    role: normalizeRole(user.role)
  };
};

export const normalizeProduct = (product) => {
  const category = product?.category || 'ao';
  const numericPrice = Number(product?.price || 0);
  const numericRating = Number(product?.ratingAverage || 0);
  const normalizedSizes =
    Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : product?.size
        ? [product.size]
        : ['S', 'M', 'L', 'XL'];
  const normalizedColors =
    Array.isArray(product?.colors) && product.colors.length > 0
      ? product.colors.map((color) =>
          typeof color === 'string'
            ? { name: color, hex: resolveColorHex(color) }
            : { ...color, hex: resolveColorHex(color?.name, color?.hex || '#000') }
        )
      : product?.color
        ? [{ name: product.color, hex: resolveColorHex(product.color) }]
        : [{ name: 'Mặc định', hex: '#000' }];

  return {
    ...product,
    id: product?.id,
    name: product?.productName || product?.name || 'Sản phẩm',
    description: product?.description || '',
    price: numericPrice,
    category,
    categoryLabel: product?.categoryLabel || categoryLabelMap[category] || product?.categoryName || category || 'San pham',
    sizes: normalizedSizes,
    colors: normalizedColors,
    inventory: Number(product?.stockQuantity ?? product?.inventory ?? 0),
    soldCount: Number(product?.soldCount || 0),
    status: product?.productStatus === 'HIDDEN' ? 'hidden' : 
            product?.productStatus === 'PENDING' ? 'pending' : 
            product?.productStatus === 'REJECTED' ? 'rejected' : 'approved',
    isNew: product?.isNew ?? true,
    isBestSeller: numericRating >= 4.5,
    ratingAverage: numericRating,
    images: parseImages(product?.imageUrl || product?.images?.[0])
  };
};

export const normalizeCartItem = (item) => {
  const product = item?.product ? normalizeProduct(item.product) : normalizeProduct(item);
  return {
    ...item,
    ...product,
    cartItemId: item?.id || item?.cartItemId,
    quantity: Number(item?.quantity || 1),
    selectedSize: item?.selectedSize || 'M',
    selectedColor: typeof item?.selectedColor === 'string'
      ? { name: item.selectedColor, hex: resolveColorHex(item.selectedColor) }
      : (item?.selectedColor || { name: 'Mặc định', hex: '#000' })
  };
};

export const parseSafeDate = (dateVal) => {
  if (!dateVal) return '';
  if (Array.isArray(dateVal)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
    const d = new Date(year, month - 1, day, hour, minute, second);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
  if (typeof dateVal === 'string') {
    return dateVal;
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? '' : d.toISOString();
};

export const normalizeOrder = (order) => {
  const items = Array.isArray(order?.orderItems)
    ? order.orderItems.map((item) => {
        const hasProductEntity = !!item?.product;
        const product = hasProductEntity ? normalizeProduct(item.product) : null;
        return {
          id: item?.id,
          productId: item?.productId ?? item?.product?.id,
          name: item?.productName || product?.name || item?.name || 'Sản phẩm',
          quantity: Number(item?.quantity || 1),
          price: Number(item?.price || 0),
          images: product?.images || ['https://via.placeholder.com/400x500'],
          selectedSize: item?.selectedSize || 'M',
          selectedColor: item?.selectedColor || { name: 'Mặc định', hex: '#000' }
        };
      })
    : Array.isArray(order?.items)
      ? order.items
      : [];

  const rawStatus = String(order?.status || '').toUpperCase();
  const statusMap = {
    PENDING: 'Chờ xử lý',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Hủy đơn',
    'ĐANG GIAO': 'Đang giao',
    'DANG GIAO': 'Đang giao',
    'ĐÃ GIAO': 'Đã giao',
    'DA GIAO': 'Đã giao'
  };

  const safeDate = parseSafeDate(order?.orderDate || order?.createdAt);

  return {
    ...order,
    id: order?.id,
    customerName: order?.customerName || order?.user?.fullName || 'Khách hàng',
    phone: order?.phone || order?.phoneNumber || '',
    address: order?.address || order?.shippingAddress || '',
    totalPrice: Number(order?.totalPrice ?? order?.totalAmount ?? 0),
    paymentMethod: order?.paymentMethod || 'COD',
    status: statusMap[rawStatus] || order?.status || 'Chờ xử lý',
    orderDate: safeDate,
    createdAt: safeDate,
    items
  };
};
