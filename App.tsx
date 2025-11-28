
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
    isImmediateFeesFree: true, // Padrão: Isenção ativa
  });
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInput(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : (parseFloat(value) || 0) 
    }));
  };

  const handleCalculate = () => {
    const calculatedResults = calculateFinancing(input);
    setResults(calculatedResults);
    
    // Scroll suave para resultados em mobile (Ajustado para barra fixa)
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const element = document.getElementById('results-section');
        if (element) {
          const offset = 100; // Espaço para o header e barra fixa
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('simulation-report');
    
    if (element) {
      // Adiciona classe temporária para ajustes de CSS
      document.body.classList.add('printing-pdf');
      
      const opt = {
        margin: [3, 3, 3, 3] as [number, number, number, number], // Margens mínimas
        filename: `simulacao-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            scrollY: 0,
            windowWidth: 1450, // Escala ajustada para melhor distribuição A4 Paisagem
            ignoreElements: (element: Element) => {
                return element.hasAttribute('data-html2canvas-ignore');
            }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: [],
            after: [],
            avoid: ['.pdf-break-inside-avoid']
        }
      };

      // Delay para renderização e aplicação de estilos
      setTimeout(() => {
          html2pdf().set(opt).from(element).save().then(() => {
            setIsExporting(false);
            document.body.classList.remove('printing-pdf');
          });
      }, 800);

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
    <div id="simulation-report" className={`bg-slate-50 min-h-screen font-sans text-slate-800 selection:bg-brand-primary selection:text-white ${isExporting ? '' : 'pb-24 lg:pb-0'}`}>
      
      {/* Estilos injetados apenas durante a exportação para limpar e compactar o PDF */}
      {isExporting && (
        <style>{`
          /* Reset básico para PDF */
          .printing-pdf .shadow-xl, .printing-pdf .shadow-lg, .printing-pdf .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .printing-pdf .backdrop-blur-md { backdrop-filter: none !important; background: white !important; }
          .printing-pdf .sticky { position: static !important; }
          .printing-pdf .bg-slate-50 { background-color: #fff !important; }
          
          /* Evita quebras de página dentro de elementos chave */
          .pdf-break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
          
          /* LAYOUT DUAS COLUNAS FORÇADO */
          .printing-pdf .grid { display: flex !important; flex-wrap: nowrap !important; gap: 16px !important; }
          
          /* Coluna de Inputs (Esquerda) - Fixa em 30% */
          .printing-pdf .lg\\:col-span-4 { 
            width: 32% !important; 
            flex: 0 0 32% !important;
            max-width: 32% !important;
          }
          
          /* Coluna de Resultados (Direita) - Fixa em 70% */
          .printing-pdf .lg\\:col-span-8 { 
            width: 68% !important; 
            flex: 0 0 68% !important;
            max-width: 68% !important;
          }
          
          /* Container Principal */
          .printing-pdf .container { 
            max-width: 1450px !important; 
            width: 1450px !important; 
            padding-left: 16px !important; 
            padding-right: 16px !important; 
            margin: 0 auto !important;
          }
          
          /* Otimização de Espaçamento Vertical */
          .printing-pdf .py-6, .printing-pdf .py-8 { padding-top: 10px !important; padding-bottom: 10px !important; }
          .printing-pdf .space-y-6 { margin-top: 12px !important; margin-bottom: 12px !important; }
          .printing-pdf .space-y-8 { margin-top: 16px !important; margin-bottom: 16px !important; }
          .printing-pdf .mb-8 { margin-bottom: 16px !important; }
          
          /* Compactação Interna dos Cards */
          .printing-pdf .p-5, .printing-pdf .p-6, .printing-pdf .p-8 { padding: 12px 16px !important; }
          
          /* Ajustes de Fonte para Caber Tudo */
          .printing-pdf h1 { font-size: 22px !important; }
          .printing-pdf h2 { font-size: 16px !important; }
          .printing-pdf h3 { font-size: 14px !important; }
          .printing-pdf .text-3xl { font-size: 20px !important; }
          
          /* Ocultar elementos decorativos pesados */
          .printing-pdf .blur-3xl, .printing-pdf .blur-2xl, .printing-pdf .blur-xl { display: none !important; }
          
          /* Ajustes de Input para Impressão */
          .printing-pdf input { font-size: 14px !important; padding: 0 !important; height: auto !important; }
          .printing-pdf label { margin-bottom: 2px !important; font-size: 10px !important; }
        `}</style>
      )}

      {/* Cabeçalho exclusivo para PDF */}
      {isExporting && (
        <div className="bg-white border-b-2 border-brand-primary p-3 mb-2">
           <div className="flex justify-between items-center">
              <div>
                 <h1 className="text-xl font-bold text-brand-primary">Relatório de Simulação Imobiliária</h1>
                 <p className="text-slate-600 text-xs">Comparativo: Financiamento Imediato vs Nas Chaves</p>
              </div>
              <div className="text-right">
                 <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Emitido em</p>
                    <p className="font-mono text-slate-800 text-xs">{new Date().toLocaleString('pt-BR')}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header da Aplicação (Oculto no PDF) */}
      {!isExporting && (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all" data-html2canvas-ignore>
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
                    className="flex items-center gap-2 text-xs font-medium text-brand-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                    <FileDown size={16} />
                    <span className="hidden sm:inline">{isExporting ? 'Gerando PDF...' : 'Baixar PDF'}</span>
                    <span className="sm:hidden">PDF</span>
                    </button>
                )}
                <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistema online
                </div>
            </div>
            </div>
        </header>
      )}
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Coluna de Inputs (Esquerda) */}
          <div className={`lg:col-span-4 xl:col-span-4 space-y-6 pdf-break-inside-avoid ${isExporting ? '' : 'lg:sticky lg:top-24'}`}>
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
              <div className="p-5 lg:p-6 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calculator className="text-brand-primary" size={20} />
                  Parâmetros do Imóvel
                </h2>
                {!isExporting && <p className="text-xs sm:text-sm text-slate-500 mt-1">Ajuste os valores para comparar cenários.</p>}
              </div>
              
              <div className="p-5 lg:p-6 space-y-6 lg:space-y-8">
                {/* Seção 1: Condições Comerciais */}
                <div className="space-y-4 pdf-break-inside-avoid">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-brand-dark/80">
                         <Tag size={16} />
                         <h3 className="text-xs font-bold uppercase tracking-wider">Negociação</h3>
                      </div>
                   </div>
                   
                   <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-4">
                      <InputField
                        label="Valor de Tabela"
                        name="salePrice"
                        value={input.salePrice}
                        onChange={handleInputChange}
                        icon={<span className="text-sm font-bold">R$</span>}
                        inputClassName="text-base sm:text-lg font-bold text-slate-800"
                        type="number"
                        step="1000"
                      />
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <InputField
                              label="Bônus"
                              name="bonus"
                              value={input.bonus}
                              onChange={handleInputChange}
                              icon={<span className="text-xs font-bold">R$</span>}
                              type="number"
                              step="500"
                              inputClassName="font-semibold text-emerald-600 text-sm sm:text-base"
                            />
                            <div className="mt-1.5 ml-1 flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">Líquido:</span>
                                <span className="text-[10px] font-bold text-slate-600">{formattedValorComBonus}</span>
                            </div>
                        </div>
                        <InputField
                          label="% Financ."
                          name="financingPercentage"
                          value={input.financingPercentage}
                          onChange={handleInputChange}
                          suffix="%"
                          icon={<Percent size={14} />}
                          type="number"
                          min="10"
                          max="90"
                          inputClassName="text-sm sm:text-base"
                        />
                      </div>
                      
                      {/* Toggle de Isenção */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                        <label className="text-xs font-semibold text-slate-600 cursor-pointer select-none" htmlFor="isImmediateFeesFree">
                           Isenção ITBI/Registro (Imediato)
                        </label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input 
                                type="checkbox" 
                                name="isImmediateFeesFree" 
                                id="isImmediateFeesFree" 
                                checked={input.isImmediateFeesFree}
                                onChange={handleInputChange}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out checked:right-0 right-5 border-slate-300 checked:border-brand-accent checked:bg-brand-accent shadow-sm"
                            />
                            <label htmlFor="isImmediateFeesFree" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${input.isImmediateFeesFree ? 'bg-brand-light' : 'bg-slate-200'}`}></label>
                        </div>
                      </div>

                   </div>
                </div>

                {/* Display da Entrada */}
                <div className="pdf-break-inside-avoid relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark p-4 sm:p-5 text-white shadow-lg shadow-blue-900/20">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mt-4 -mr-4"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 opacity-90 mb-1">
                      <Info size={14} />
                      <span className="text-xs font-medium uppercase tracking-wide">Recurso Próprio (Entrada)</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight">{formattedEntrada}</span>
                    </div>
                    <p className="text-[10px] text-blue-100 mt-2 opacity-80 border-t border-white/20 pt-2">
                      Valor restante após bônus e financiamento
                    </p>
                  </div>
                </div>

                {/* Seção 2: Correção e Obras */}
                <div className="space-y-4 pdf-break-inside-avoid">
                   <div className="flex items-center gap-2 text-brand-dark/80 mb-2">
                      <KeyRound size={16} />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Custos e Prazos</h3>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
                       <InputField
                        label="Prazo Obras"
                        name="constructionMonths"
                        value={input.constructionMonths}
                        onChange={handleInputChange}
                        suffix="meses"
                        icon={<Building className="text-slate-400" size={14} />}
                        type="number"
                        inputClassName="text-sm sm:text-base"
                      />
                      <InputField
                        label="Taxa de Juros"
                        name="interestRate"
                        value={input.interestRate}
                        onChange={handleInputChange}
                        suffix="% aa"
                        icon={<Percent className="text-slate-400" size={14} />}
                        type="number"
                        step="0.1"
                        inputClassName="text-sm sm:text-base"
                      />
                      <InputField
                        label="INCC Mensal"
                        name="inccRate"
                        value={input.inccRate}
                        onChange={handleInputChange}
                        suffix="% am"
                        icon={<TrendingDown className="text-slate-400" size={14} />}
                        type="number"
                        step="0.01"
                        inputClassName="text-sm sm:text-base"
                      />
                   </div>
                </div>
              </div>
              
              {/* Botão Desktop */}
              {!isExporting && (
                <div className="hidden lg:block p-4 bg-slate-50 border-t border-slate-100" data-html2canvas-ignore>
                    <button
                        onClick={handleCalculate}
                        className="group w-full bg-brand-secondary hover:bg-brand-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <span className="text-lg">Calcular e Comparar</span>
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna de Resultados (Direita) */}
          <div id="results-section" className="lg:col-span-8 xl:col-span-8 pdf-break-inside-avoid">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="h-full min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center bg-white p-6 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="relative mb-6 md:mb-8">
                  {!isExporting && <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>}
                  <div className="relative bg-white p-4 md:p-6 rounded-full shadow-sm border border-slate-100">
                     <BarChart2 size={48} className="md:w-16 md:h-16 text-brand-secondary opacity-90" />
                  </div>
                </div>
                
                <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-3 md:mb-4 tracking-tight">
                  Descubra a melhor opção
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-lg leading-relaxed mb-6 md:mb-8">
                  Preencha os dados do imóvel para comparar financiamento imediato e nas chaves.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full text-left">
                  {[
                    { icon: DollarSign, text: "Compare custo total" },
                    { icon: TrendingDown, text: "Juros Obra vs INCC" },
                    { icon: BarChart2, text: "Gráficos detalhados" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-xs md:text-sm font-medium">
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

      {/* Sticky Action Bar Mobile (Oculto no PDF) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 lg:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]" data-html2canvas-ignore>
          <button
            onClick={handleCalculate}
            className="w-full bg-brand-secondary hover:bg-brand-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="text-lg">Calcular e Comparar</span>
            <ArrowRight size={20} />
          </button>
      </div>

    </div>
  );
};

export default App;
