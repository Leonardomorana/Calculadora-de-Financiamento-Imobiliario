import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CalculationResult, ScenarioResult } from '../types';
import { formatCurrency, formatCurrencyShort } from '../services/calculationService';
import { Award, Clock, KeyRound, CheckCircle2, TrendingDown, TrendingUp, Coins, AlertCircle, FileText, Sparkles, Ban } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioResult;
  icon: React.ReactNode;
  isWinner: boolean;
  difference: number;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, icon, isWinner, difference }) => {
  const isImmediate = scenario.scenarioName.includes('Imediato');

  return (
    <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 h-full flex flex-col ${
      isWinner 
        ? 'bg-gradient-to-br from-white to-emerald-50/50 border-2 border-emerald-500 shadow-xl shadow-emerald-100/50 ring-1 ring-emerald-200' 
        : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
    }`}>
      
      {isWinner && (
         <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500"></div>
      )}

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shadow-sm transition-colors ${
              isWinner ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
                {icon}
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isWinner ? 'text-emerald-600' : 'text-slate-400'}`}>Cenário</p>
              <h3 className={`text-lg font-bold leading-tight ${isWinner ? 'text-emerald-900' : 'text-slate-700'}`}>
                {scenario.scenarioName}
              </h3>
              {/* Badges de Bônus */}
              {isImmediate ? (
                 <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                    <Sparkles size={10} /> Bônus Aplicado
                 </span>
              ) : (
                 <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                    <Ban size={10} /> Sem Bônus
                 </span>
              )}
            </div>
          </div>
          {isWinner && (
            <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-sm animate-pulse">
              <Award size={18} />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
           {/* Informações de Estrutura (Financiamento/Entrada) */}
           <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500">Financiamento ({scenario.financingPercentage}%)</span>
                 <span className="font-medium text-slate-700">{formatCurrency(scenario.financedAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-1">
                    <span className="text-slate-500">Recurso Próprio</span>
                    {!isImmediate && scenario.financingPercentage < 80 && (
                        <div className="group/tooltip relative">
                             <AlertCircle size={12} className="text-amber-500 cursor-help" />
                             <span className="invisible group-hover/tooltip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap z-10">
                                Limitado a 70% neste cenário
                             </span>
                        </div>
                    )}
                 </div>
                 <span className="font-medium text-brand-primary">{formatCurrency(scenario.downPayment)}</span>
              </div>
           </div>

           <div className="w-full h-px bg-slate-100"></div>

           {/* Detalhes Específicos por Cenário */}
           {isImmediate ? (
             // CENÁRIO IMEDIATO: Mostra Juros de Obra + Correção RP
             <>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500">Total Juros Obra</span>
                      </div>
                      <span className="font-semibold text-amber-600">
                        + {formatCurrency(scenario.constructionInterest || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Correção s/ Rec. Próprio</span>
                      <span className="font-semibold text-rose-600">
                        + {formatCurrency(scenario.correctionOwnResource || 0)}
                      </span>
                    </div>
                </div>
             </>
           ) : (
             // CENÁRIO CHAVES: Mostra Correções INCC + TAXAS POA
             <>
               <div className="space-y-2">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Correção s/ Financiamento</span>
                    <span className="font-semibold text-rose-600">
                      + {formatCurrency(scenario.correctionFinancing || 0)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Correção s/ Rec. Próprio</span>
                    <span className="font-semibold text-rose-600">
                      + {formatCurrency(scenario.correctionOwnResource || 0)}
                    </span>
                 </div>
                 
                 {/* Seção de Taxas POA */}
                 <div className="pt-2 mt-2 border-t border-slate-100">
                   <div className="flex items-center gap-1 text-slate-400 mb-1">
                     <FileText size={12} />
                     <span className="text-[10px] font-bold uppercase">Custos Cartoriais (POA/RS)</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">ITBI</span>
                      <span className="font-semibold text-slate-700">
                        + {formatCurrency(scenario.itbiAmount || 0)}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Registro de Imóveis</span>
                      <span className="font-semibold text-slate-700">
                        + {formatCurrency(scenario.registryFee || 0)}
                      </span>
                   </div>
                 </div>
               </div>
             </>
           )}
        </div>
      </div>

      <div className={`p-5 border-t ${isWinner ? 'bg-emerald-100/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
         <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Custo Total (Imóvel + Extras)
          </span>
          <div className="flex flex-col gap-2">
            <span className={`text-3xl font-bold tracking-tight ${isWinner ? 'text-emerald-700' : 'text-slate-800'}`}>
              {formatCurrency(scenario.totalPaid)}
            </span>
            
            {difference > 0 && (
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-fit ${
                isWinner 
                  ? 'bg-emerald-200/50 text-emerald-800' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {isWinner ? (
                  <>
                    <TrendingDown size={14} />
                    Economia de {formatCurrencyShort(difference)}
                  </>
                ) : (
                  <>
                    <TrendingUp size={14} />
                    + {formatCurrencyShort(difference)} mais caro
                  </>
                )}
              </div>
            )}
          </div>
         </div>
      </div>
    </div>
  );
};

const ComparisonSummary: React.FC<{ results: CalculationResult }> = ({ results }) => {
  const { immediateFinancing, keyDeliveryFinancing } = results;
  // Diferença real entre o que saiu do bolso do cliente (Total Pago)
  const costDifference = Math.abs(keyDeliveryFinancing.totalPaid - immediateFinancing.totalPaid);
  const isImmediateWinner = immediateFinancing.totalPaid < keyDeliveryFinancing.totalPaid;
  const winnerName = isImmediateWinner ? 'Imediato' : 'Nas Chaves';
  
  if (costDifference === 0) {
     return (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center mb-8 flex flex-col items-center gap-2">
            <div className="bg-slate-200 p-3 rounded-full text-slate-500">
              <Coins size={24} />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">Custos Equivalentes</h3>
            <p className="text-slate-500 text-sm">Não há diferença financeira entre os dois cenários neste caso.</p>
        </div>
     )
  }

  return (
    <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/20 mb-8">
      {/* Abstract Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
      
      <div className="relative z-10 p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg shadow-green-900/50">
              <CheckCircle2 size={28} className="drop-shadow-md"/>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 size={16} />
                </span>
                <p className="text-emerald-300 font-bold text-sm uppercase tracking-wider">Melhor Escolha</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Financiamento {winnerName}
              </h3>
              <p className="text-slate-300 text-sm md:text-base max-w-md leading-relaxed">
                {isImmediateWinner 
                  ? "O cenário imediato aproveita o bônus de desconto, evita taxas cartoriais elevadas e congela o saldo devedor, superando os custos de juros de obra."
                  : "Neste caso, os custos do financiamento imediato superam as correções e taxas do financiamento na entrega."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end bg-white/5 rounded-xl p-4 md:px-6 md:py-3 backdrop-blur-sm border border-white/10">
            <p className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-1">Economia Projetada</p>
            <div className="flex items-center gap-3">
              <TrendingDown size={24} className="text-emerald-400" />
              <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {formatCurrencyShort(costDifference)}
              </span>
            </div>
             <p className="text-[10px] text-slate-400 mt-1">Diferença total de custos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ResultsDisplay: React.FC<{ results: CalculationResult }> = ({ results }) => {
  const { immediateFinancing, keyDeliveryFinancing } = results;
  const difference = Math.abs(immediateFinancing.totalPaid - keyDeliveryFinancing.totalPaid);
  const isImmediateWinner = immediateFinancing.totalPaid <= keyDeliveryFinancing.totalPaid;

  // Estrutura de dados para o gráfico
  const chartData = [
    {
      name: 'Imediato',
      Principal: immediateFinancing.financedAmount,
      "Entrada": immediateFinancing.downPayment,
      "Juros Obra": immediateFinancing.constructionInterest || 0,
      "INCC (Entrada)": immediateFinancing.correctionOwnResource || 0,
      total: immediateFinancing.totalPaid,
      isWinner: isImmediateWinner
    },
    {
      name: 'Nas Chaves',
      Principal: keyDeliveryFinancing.financedAmount,
      "Entrada": keyDeliveryFinancing.downPayment,
      "INCC (Dívida)": keyDeliveryFinancing.correctionFinancing || 0,
      "INCC (Entrada)": keyDeliveryFinancing.correctionOwnResource || 0,
      "Taxas (ITBI/RI)": (keyDeliveryFinancing.itbiAmount || 0) + (keyDeliveryFinancing.registryFee || 0),
      total: keyDeliveryFinancing.totalPaid,
      isWinner: !isImmediateWinner
    },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
       <ComparisonSummary results={results} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <ScenarioCard 
          scenario={immediateFinancing} 
          icon={<Clock size={24}/>} 
          isWinner={isImmediateWinner} 
          difference={difference}
        />
        <ScenarioCard 
          scenario={keyDeliveryFinancing} 
          icon={<KeyRound size={24}/>} 
          isWinner={!isImmediateWinner} 
          difference={difference}
        />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-brand-secondary rounded-full"></div>
            Composição de Custos Totais
          </h3>
          <p className="text-xs text-slate-400 hidden sm:block">
             Inclui Principal + Entrada + Custos Extras
          </p>
        </div>
        
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#475569', fontSize: 14, fontWeight: 600}} 
                dy={15}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrencyShort(Number(value))} 
                axisLine={false} 
                tickLine={false}
                tick={{fill: '#94a3b8', fontSize: 12}}
                width={50}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
              
              {/* Base Comum */}
              <Bar dataKey="Principal" stackId="a" fill="#94a3b8" name="Valor Financiado" />
              <Bar dataKey="Entrada" stackId="a" fill="#64748b" name="Recurso Próprio" />
              
              {/* Custos Imediato */}
              <Bar dataKey="Juros Obra" stackId="a" fill="#d97706" name="Juros de Obra" />
              
              {/* Custos Nas Chaves e Imediato (INCC Entrada) */}
              <Bar dataKey="INCC (Dívida)" stackId="a" fill="#e11d48" name="INCC s/ Financiamento" />
              <Bar dataKey="INCC (Entrada)" stackId="a" fill="#f43f5e" name="INCC s/ Entrada" />
              <Bar dataKey="Taxas (ITBI/RI)" stackId="a" fill="#9f1239" name="Taxas (ITBI/RI)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          Nota: Taxas de ITBI e Registro (POA/RS) incluídas no cenário "Nas Chaves". Bônus aplicado apenas no "Imediato".
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;