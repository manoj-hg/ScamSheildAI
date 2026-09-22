import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle, ShieldCheck } from 'lucide-react';
import { ChecklistItem } from '../types';

interface VerificationChecklistProps {
  initialItems: ChecklistItem[];
}

export const VerificationChecklist: React.FC<VerificationChecklistProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Interactive Verification Checklist
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {completedCount} / {items.length} Completed ({progressPercent}%)
          </span>
          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              item.completed
                ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
            }`}
          >
            <div className="shrink-0 mt-0.5 text-cyan-400">
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 hover:text-cyan-400" />
              )}
            </div>
            <div>
              <div className={`text-xs sm:text-sm font-semibold mb-0.5 ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                {item.label}
              </div>
              <div className="text-[11px] text-slate-400">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
