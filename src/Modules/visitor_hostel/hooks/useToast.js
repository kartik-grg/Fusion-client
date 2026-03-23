import { useApp } from '../context/AppContext';

export const useToast = () => {
  const { toast } = useApp();
  return {
    success: (msg) => toast(msg, 'success'),
    warn:    (msg) => toast(msg, 'warn'),
    danger:  (msg) => toast(msg, 'danger'),
    info:    (msg) => toast(msg, 'info'),
  };
};
