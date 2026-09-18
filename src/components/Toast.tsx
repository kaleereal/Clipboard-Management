import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

export interface ToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
  message?: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss, message, onClose }) => {
  if (message) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        <div className="pointer-events-auto bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="truncate">{message}</span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="truncate">{toast.text}</span>
          <div className="flex items-center gap-2 shrink-0">
            {toast.actionText && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss?.(toast.id);
                }}
                className="text-purple-300 hover:text-purple-200 font-semibold text-xs uppercase px-2 py-1 rounded hover:bg-stone-800 transition"
              >
                {toast.actionText}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-stone-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
