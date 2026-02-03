import React from 'react';
import { ICONS } from '../constants';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-stagger">
      <div className="glass-panel rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-white/10 relative flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ICONS.Alert size={32} weight="fill" />
          </div>
          
          <h3 className="text-xl font-medium text-white mb-2">Confirmação</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              {message}
          </p>
          
          <div className="flex gap-3 w-full">
              <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium tracking-wider uppercase transition-colors"
              >
                  Cancelar
              </button>
              <button 
                  onClick={() => { onConfirm(); onClose(); }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium tracking-wider uppercase shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02]"
              >
                  Excluir
              </button>
          </div>
      </div>
    </div>
  );
};

export default ConfirmModal;