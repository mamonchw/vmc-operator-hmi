import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItemProps {
  title: string;
  description: string;
  isConfirmed: boolean;
  onConfirm: () => void;
  disabled?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  title,
  description,
  isConfirmed,
  onConfirm,
  disabled = false
}) => {
  return (
    <div className={`card flex items-center justify-between mb-4 ${isConfirmed ? 'border-emerald-500/50 bg-neutral-900/80' : 'bg-neutral-950 border-neutral-800 border'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isConfirmed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
          {isConfirmed ? <CheckCircle2 size={32} /> : <Circle size={32} />}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-neutral-400 text-lg mt-1"><span className="text-neutral-500 font-semibold">Guidance: </span>{description}</p>
          <div className="mt-2 text-sm font-semibold">
            Status: <span className={isConfirmed ? "text-emerald-400" : "text-amber-400"}>{isConfirmed ? 'CONFIRMED' : 'PENDING'}</span>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={onConfirm}
          disabled={isConfirmed || disabled}
          className={`py-3 px-8 rounded-lg font-bold text-xl transition-all shadow-lg ${
            isConfirmed 
              ? 'bg-emerald-950 border border-emerald-900 text-emerald-600 cursor-not-allowed' 
              : 'bg-white hover:bg-neutral-200 text-black active:scale-95'
          } ${disabled && !isConfirmed ? 'opacity-50 cursor-not-allowed bg-neutral-800 text-neutral-500 border-neutral-700' : ''}`}
        >
          {isConfirmed ? 'CONFIRMED' : 'CONFIRM'}
        </button>
      </div>
    </div>
  );
};
