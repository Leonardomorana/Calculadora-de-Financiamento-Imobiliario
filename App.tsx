import React, { useState, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { calculateFinancing, formatCurrency } from './services/calculationService';
import type { CalculationInput, CalculationResult } from './types';
import InputField from './components/InputField';
import ResultsDisplay from './components/ResultsDisplay';
import { DollarSign, Percent, Banknote, Building, KeyRound, Info, BarChart2, Calculator, ArrowRight, TrendingDown, Tag, FileDown } from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState<CalculationInput>({
    salePrice: 588200,
    bonus: 30000,
    financingPercentage: 80,
    constructionMonths: 30,
    inccRate: 0.5,
    interestRate: 9.5, // Default interest rate
  });
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCalculate = () => {
    const calculatedResults = calculateFinancing(input);
    setResults(calculatedResults);
    
    // Scroll suave para resultados em mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('simulation-report');
    
    if (element) {
      const opt = {
        margin: 5,
        filename: 'simulacao-imobiliaria.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
      });
    } else {
        setIsExporting(false);
    }
  };

  const formattedEntrada = useMemo(() => {
    const valorLiquido = input.salePrice - input.bonus;
    const valorFinanciado = valorLiquido * (input.financingPercentage / 100);
    const entrada = valorLiquido - valorFinanciado;
    return formatCurrency(entrada);
  }, [input.salePrice, input.bonus, input.financingPercentage]);
  
  const formattedValorComBonus = useMemo(() => {
    return formatCurrency(input.salePrice - input.bonus);
  }, [input.salePrice, input.bonus]);

  return (
    <div id="simulation-report" className="bg-slate-50 min-h-screen font-sans text-slate-800 selection:bg-brand-primary selection:text-white">
      {/* Header Moderno com Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30" data-html2canvas-ignore>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary text-white p-2 rounded-lg shadow-sm">
              <Banknote size={24} />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              Simulador Imobiliário
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {results && (
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="hidden md:flex items-center gap-2 text-xs font-medium text-brand-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                   <FileDown size={16} />
                   {isExporting ? 'Gerando PDF...' : 'Baixar PDF'}
                </button>
            )}
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Sistema online
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna de Inputs (Esquerda) */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
              <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calculator className="text-brand-primary" size={20} />
                  Parâmetros do Imóvel
                </h2>
                <p className="text-sm text-slate-500 mt-1">Ajuste os valores para comparar cenários.</p>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Seção 1: Condições Comerciais (Visual Melhorado) */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-brand-dark/80 mb-2">
                      <Tag size={16} />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Negociação</h3>
                   </div>
                   
                   <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-4">
                      <InputField
                        label="Valor de Tabela"
                        name="salePrice"
                        value={input.salePrice}
                        onChange={handleInputChange}
                        icon={<span className="text-sm font-bold">R$</span>}
                        inputClassName="text-lg font-bold text-slate-800"
                        type="number"
                        step="1000"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputField
                              label="Bônus"
                              name="bonus"
                              value={input.bonus}
                              onChange={handleInputChange}
                              icon={<span className="text-xs font-bold">R$</span>}
                              type="number"
                              step="500"
                              inputClassName="font-semibold text-emerald-600"
                            />
                            <div className="mt-1.5 ml-1 flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">Valor c/ desc:</span>
                                <span className="text-[10px] font-bold text-slate-600">{formattedValorComBonus}</span>
                            </div>
                        </div>
                        <InputField
                          label="% Financiado"
                          name="financingPercentage"
                          value={input.financingPercentage}
                          onChange={handleInputChange}
                          suffix="%"
                          icon={<Percent size={16} />}
                          type="number"
                          min="10"
                          max="90"
                        />
                      </div>
                   </div>
                </div>

                {/* Display da Entrada (Separador Visual) */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark p-5 text-white shadow-lg shadow-blue-900/20">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 opacity-90 mb-1">
                      <Info size={14} />
                      <span className="text-xs font-medium uppercase tracking-wide">Recurso Próprio Total</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">{formattedEntrada}</span>
                    </div>
                    <p className="text-[10px] text-blue-100 mt-2 opacity-80 border-t border-white/20 pt-2">
                      Valor restante após bônus e financiamento
                    </p>
                  </div>
                </div>

                {/* Seção 2: Correção e Obras */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-brand-dark/80 mb-2">
                      <KeyRound size={16} />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Custos e Prazos</h3>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <InputField
                        label="Prazo Obras"
                        name="constructionMonths"
                        value={input.constructionMonths}
                        onChange={handleInputChange}
                        suffix="meses"
                        icon={<Building className="text-slate-400" size={16} />}
                        type="number"
                      />
                      <InputField
                        label="Taxa Juros Obra"
                        name="interestRate"
                        value={input.interestRate}
                        onChange={handleInputChange}
                        suffix="% aa"
                        icon={<Percent className="text-slate-400" size={16} />}
                        type="number"
                        step="0.1"
                      />
                      <InputField
                        label="INCC Mensal"
                        name="inccRate"
                        value={input.inccRate}
                        onChange={handleInputChange}
                        suffix="% am"
                        icon={<TrendingDown className="text-slate-400" size={16} />}
                        type="number"
                        step="0.01"
                      />
                   </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100" data-html2canvas-ignore>
                <button
                    onClick={handleCalculate}
                    className="group w-full bg-brand-secondary hover:bg-brand-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span className="text-lg">Calcular e Comparar</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
              </div>
            </div>
          </div>

          {/* Coluna de Resultados (Direita) */}
          <div id="results-section" className="lg:col-span-8 xl:col-span-8">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-100">
                     <BarChart2 size={64} className="text-brand-secondary opacity-90" />
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                  Descubra a melhor opção
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed mb-8">
                  Preencha os dados do imóvel ao lado para visualizar um comparativo detalhado entre financiamento imediato e na entrega das chaves.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full text-left">
                  {[
                    { icon: DollarSign, text: "Compare custo total" },
                    { icon: TrendingDown, text: "Juros Obra vs INCC" },
                    { icon: BarChart2, text: "Gráficos detalhados" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-sm font-medium">
                      <item.icon size={18} className="text-brand-accent" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;