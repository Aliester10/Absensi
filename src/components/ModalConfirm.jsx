import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export default function ModalConfirm({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Ya, Lanjutkan', 
  confirmTheme = 'danger' 
}) {
  if (!isOpen) return null;

  const Icon = confirmTheme === 'danger' ? AlertTriangle : Info;
  const iconBg = confirmTheme === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';
  const btnClass = confirmTheme === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 flex flex-col items-center text-center pt-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-8">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="btn-secondary flex-1 py-2.5">
              Batal
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className={`${btnClass} flex-1 py-2.5`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
