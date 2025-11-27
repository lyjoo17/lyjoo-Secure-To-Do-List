import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import useUIStore from '../../store/uiStore';

const Toast = () => {
  const { toast, showToast } = useUIStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        showToast(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, showToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success:
      'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 border-green-200 dark:border-green-700',
    error:
      'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-200 dark:border-red-700',
    warning:
      'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700',
    info: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-700',
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border ${colors[toast.type]} min-w-[300px] max-w-md`}
      >
        {icons[toast.type]}
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => showToast(null)}
          className="p-1 rounded hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
