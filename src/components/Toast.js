import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let className = "toast-message";

        if (toast.type === 'success') {
          Icon = CheckCircle;
          className += " success";
        } else if (toast.type === 'error') {
          Icon = XCircle;
          className += " error";
        }

        return (
          <div key={toast.id} className={className}>
            <Icon size={18} />
            <span>{toast.text}</span>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={{ color: 'inherit', marginLeft: '8px', opacity: 0.7, cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
