import React from 'react';

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function ActionButton({ icon, label, onClick, disabled = false }: ActionButtonProps) {
  return (
    <button
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-black/10 active:bg-black/20'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
