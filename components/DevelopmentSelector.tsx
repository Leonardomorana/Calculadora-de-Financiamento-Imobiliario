import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { DEVELOPMENTS, calculateMonthsUntilDelivery, type Development } from '../services/developmentService';

interface DevelopmentSelectorProps {
  selectedId: string;
  onSelectDevelopment: (dev: Development | null, calculatedMonths?: number) => void;
  currentMonths?: number;
}

export const DevelopmentSelector: React.FC<DevelopmentSelectorProps> = ({
  selectedId,
  onSelectDevelopment,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      onSelectDevelopment(null);
    } else {
      const dev = DEVELOPMENTS.find((d) => d.id === val);
      if (dev) {
        const months = calculateMonthsUntilDelivery(dev.deliveryDate);
        onSelectDevelopment(dev, months);
      }
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-brand-dark/80">
        <Building2 size={16} className="text-brand-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider">Empreendimento</h3>
      </div>

      {/* Select principal */}
      <div className="relative">
        <select
          value={selectedId || 'custom'}
          onChange={handleChange}
          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer pr-10"
        >
          {DEVELOPMENTS.map((dev) => (
            <option key={dev.id} value={dev.id}>
              {dev.name}
            </option>
          ))}
          <option value="custom">Personalizado</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};


