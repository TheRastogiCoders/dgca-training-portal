import { useState, useCallback } from 'react';

const useModernAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    autoClose: false,
    autoCloseDelay: 3000
  });

  const showAlert = useCallback((options) => {
    setAlertState({
      isOpen: true,
      title: options.title || 'Notification',
      message: options.message || '',
      type: options.type || 'info',
      autoClose: options.autoClose || false,
      autoCloseDelay: options.autoCloseDelay || 3000
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    showAlert({ title, message, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message, title = 'Error') => {
    showAlert({ title, message, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showAlert({ title, message, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message, title = 'Information') => {
    showAlert({ title, message, type: 'info' });
  }, [showAlert]);

  const showComingSoon = useCallback((feature = 'This feature') => {
    showAlert({ 
      title: 'Coming Soon! 🚀', 
      message: `${feature} will be available soon. Stay tuned for updates!`,
      type: 'info',
      autoClose: true,
      autoCloseDelay: 4000
    });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showComingSoon
  };
};

export default useModernAlert;
