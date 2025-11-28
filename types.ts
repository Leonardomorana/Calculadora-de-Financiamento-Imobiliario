
export interface CalculationInput {
  salePrice: number;
  bonus: number;
  financingPercentage: number;
  constructionMonths: number;
  inccRate: number;
  interestRate: number; // Taxa de juros anual para cálculo do Juros de Obra
  isImmediateFeesFree: boolean; // Controle de gratuidade documental no cenário Imediato
}

export interface ScenarioResult {
  scenarioName: string;
  financedAmount: number;
  totalPaid: number;
  totalInterest: number; // Usado para Correção INCC (Chaves) ou Juros Obra (Imediato)
  correctionFinancing?: number; // INCC sobre o saldo devedor
  correctionOwnResource?: number; // INCC sobre parcelas de entrada
  constructionInterest?: number; // Valor específico dos Juros de Obra pagas
  
  // Taxas extras (Porto Alegre/RS)
  itbiAmount?: number;
  registryFee?: number;
  
  // Campos para exibição demonstrativa quando há isenção
  potentialItbiAmount?: number;
  potentialRegistryFee?: number;
  feesWaived?: boolean;
  
  // Novos campos para suportar entradas diferentes
  downPayment: number;
  financingPercentage: number;
}

export interface CalculationResult {
  immediateFinancing: ScenarioResult;
  keyDeliveryFinancing: ScenarioResult;
  downPayment: number; // Mantido para compatibilidade com o banner principal (reflete o input)
}
