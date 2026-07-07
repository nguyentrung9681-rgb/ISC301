import React, { useState, useEffect } from 'react';

export default function CheckoutPage({
  cart,
  cartTotalPrice,
  shipFee,
  appliedVoucher,
  voucherDiscount,
  cartFinalPrice,
  onPlaceOrder,
  currentUser
}) {
  // --- CHECKOUT FORM STATE ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Transfer

  // Auto-fill checkout fields if customer is logged in
  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '0988776655');
      setAddress(currentUser.address || '12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội');
    } else {
      setName('');
      setPhone('');
      setAddress('');
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onPlaceOrder({ name, phone, address, note, paymentMethod });
  };

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '24px' }}>Thông Tin Thanh Toán</h2>

      <div className="checkout-layout animate-fade">
        {/* Form Input Billing Info */}
        <div className="checkout-form-card">
          <h3 className="form-title">
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '14px' }}>1</span>
            <span>Thông tin nhận hàng</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="admin-form-group">
                <label className="input-label">Họ và tên người nhận *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  className="checkout-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="input-label">Số điện thoại liên lạc *</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0987654321..."
                  className="checkout-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label className="input-label">Địa chỉ nhận hàng chi tiết *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM..."
                  className="checkout-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label className="input-label">Ghi chú giao hàng (Nếu có)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giao hàng giờ hành chính / gọi trước khi giao..."
                  className="checkout-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
                  src={`https://img.vietqr.io/image/MB-09876543210-compact.jpg?amount=${cartFinalPrice}&addInfo=JUSSTPAY&accountName=CONG%20TY%20THOI%20TRANG%20JUSSTLIFE`}
                  alt="QR Code"
                  className="qr-code-img"
                  style={{ width: '150px', height: '150px', objectFit: 'contain' }}
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
          {appliedVoucher && (
            <div className="summary-row" style={{ color: '#2e7d32' }}>
              <span>Giảm giá ({appliedVoucher.discountPercent}%)</span>
              <span>-{voucherDiscount.toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>Tổng tiền</span>
            <span className="total-price-text">{cartFinalPrice.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}
