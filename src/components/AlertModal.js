import React from 'react';
import { CheckCircle, AlertTriangle, Info, Trash2, HelpCircle } from 'lucide-react';

export default function AlertModal({ isOpen, title, text, type, onConfirm, onCancel, onClose }) {
  if (!isOpen) return null;

  let Icon = Info;
  let iconBg = '#e3f2fd';
  let iconColor = '#1565c0';
  let btnColor = 'var(--secondary)';

  if (type === 'success') {
    Icon = CheckCircle;
    iconBg = '#e8f5e9';
    iconColor = '#2e7d32';
    btnColor = '#2e7d32';
  } else if (type === 'error' || type === 'warning') {
    Icon = AlertTriangle;
    iconBg = '#ffebee';
    iconColor = '#c62828';
    btnColor = '#c62828';
  } else if (type === 'confirm' || type === 'delete') {
    Icon = type === 'delete' ? Trash2 : HelpCircle;
    iconBg = type === 'delete' ? '#ffebee' : '#fff3e0';
    iconColor = type === 'delete' ? '#c62828' : '#ef6c00';
    btnColor = type === 'delete' ? '#c62828' : 'var(--primary)';
  }

  const handleConfirmClick = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="product-detail-modal animate-pop" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '400px', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-lg)' 
        }}
      >
        <div style={{ padding: '30px', textAlign: 'center' }}>
          {/* Header Icon */}
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: iconBg, 
            color: iconColor, 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Icon size={30} />
          </div>

          {/* Text Title */}
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>{title}</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--secondary-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            {text}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {(type === 'confirm' || type === 'delete') ? (
              <>
                <button 
                  className="btn-admin-cancel" 
                  onClick={handleCancelClick}
                  style={{ padding: '10px 24px', flex: 1, fontWeight: 600, fontSize: '14px', borderRadius: 'var(--radius-full)' }}
                >
                  Hủy Bỏ
                </button>
                <button 
                  className="btn-primary-filled" 
                  onClick={handleConfirmClick}
                  style={{ 
                    padding: '10px 24px', 
                    flex: 1, 
                    fontWeight: 600, 
                    fontSize: '14px', 
                    background: btnColor,
                    boxShadow: 'none',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Xác Nhận
                </button>
              </>
            ) : (
              <button 
                className="btn-primary-filled" 
                onClick={handleConfirmClick}
                style={{ 
                  padding: '10px 30px', 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  background: btnColor,
                  boxShadow: 'none',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                Xác Nhận
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
