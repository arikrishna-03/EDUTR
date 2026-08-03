import React from 'react';
import { LogOut } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-[#1a1c23] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <LogOut size={22} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Are you sure you want to log out of your EduTrack account?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-sm transition-colors border border-white/10 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
          >
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
