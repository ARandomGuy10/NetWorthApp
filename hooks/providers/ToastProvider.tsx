
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../../components/ui/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  text?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    details?: string;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success', options?: ToastOptions) => {
    setToast({ visible: true, message, type, details: options?.text });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        details={toast.details}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};
