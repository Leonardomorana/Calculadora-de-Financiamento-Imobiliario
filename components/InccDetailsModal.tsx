import React from 'react';
import { X, Calendar, Info } from 'lucide-react';
import type { InccData } from '../services/inccService';

interface InccDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inccData: InccData | null;
}

export const InccDetailsModal: React.FC<InccDetailsModalProps> = ({ isOpen, onClose, inccData }) => {
  if (!isOpen || !inccData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-brand-primary">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                INCC-M dos Últimos 12 Meses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fonte: Banco Central do Brasil / FGV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumo */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Acumulado 12 Meses
              </span>
              <span className="text-2xl font-bold text-brand-primary">
                {inccData.accumulated12m.toFixed(2).replace('.', ',')}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">ao ano ({inccData.periodDescription})</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Equivalente Mensal
              </span>
              <span className="text-2xl font-bold text-emerald-700">
                {inccData.monthlyEquivalent.toFixed(2).replace('.', ',')}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">ao mês (juros compostos)</span>
            </div>
          </div>

          {/* Tabela dos 12 meses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Evolução Mês a Mês
              </span>
              <span className="text-[11px] text-slate-400">
                {inccData.isLive ? 'Dados atualizados via API BACEN' : 'Série de referência'}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {inccData.monthlyRates.map((item, idx) => {
                const parts = item.data.split('/');
                const monthYear = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.data;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-semibold text-slate-500">{monthYear}</span>
                    <span className="text-sm font-bold text-slate-800 mt-1">
                      {item.valor.toFixed(2).replace('.', ',')}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
            <Info size={16} className="text-brand-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              A correção das parcelas durante a fase de obra utiliza a taxa mensal equivalente acumulada nos últimos 12 meses para projetar o impacto do INCC no saldo devedor e na entrada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
