
import type { CalculationInput, CalculationResult, ScenarioResult } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatCurrencyShort = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}k`;
  }
  return formatCurrency(value);
};

// Cálculo ITBI Porto Alegre (3% padrão)
const calculateITBIPoa = (value: number): number => {
  return value * 0.03;
};

// Estimativa simplificada da Tabela de Emolumentos de Registro de Imóveis (RS) - Base 2024/2025
const calculateRegistryFeeRS = (value: number): number => {
  if (value <= 40000) return 300;
  if (value <= 80000) return 650;
  if (value <= 160000) return 1100;
  if (value <= 320000) return 1800;
  if (value <= 640000) return 3200;
  if (value <= 1200000) return 5500;
  if (value <= 2500000) return 7800;
  return 10000; // Teto estimado para valores muito altos
};

export const calculateFinancing = (input: CalculationInput): CalculationResult => {
  const {
    salePrice,
    bonus,
    financingPercentage,
    constructionMonths,
    inccRate,
    interestRate,
  } = input;

  const monthlyInccRate = inccRate / 100;

  // --- CÁLCULO CENÁRIO 1: FINANCIAMENTO IMEDIATO (COM BÔNUS) ---
  // Base de cálculo: Valor de Tabela - Bônus
  const immediateBasePrice = salePrice - bonus;
  
  const immediateFinancingPct = financingPercentage;
  const immediateFinancedAmount = immediateBasePrice * (immediateFinancingPct / 100);
  const immediateDownPayment = immediateBasePrice - immediateFinancedAmount;
  
  // 1. Juros de Obra (Sobre o repasse do banco)
  const monthlyInterestRate = (interestRate / 100) / 12;
  let totalConstructionInterest = 0;

  // Simulação de evolução de obra linear para Juros de Obra
  for (let month = 1; month <= constructionMonths; month++) {
    const evolutionPercentage = month / constructionMonths;
    const releasedBalance = immediateFinancedAmount * evolutionPercentage;
    const monthlyInterestPayment = releasedBalance * monthlyInterestRate;
    totalConstructionInterest += monthlyInterestPayment;
  }

  // 2. Correção INCC sobre o Recurso Próprio (Entrada Parcelada durante a obra)
  // Assume-se que a entrada também é diluída no fluxo de obra e sofre correção
  const monthlyImmediateDownPayment = immediateDownPayment / constructionMonths;
  let totalCorrectedImmediateDownPayment = 0;

  for (let i = 1; i <= constructionMonths; i++) {
    const correctedParcel = monthlyImmediateDownPayment * Math.pow(1 + monthlyInccRate, i);
    totalCorrectedImmediateDownPayment += correctedParcel;
  }
  const immediateCorrectionOnOwnResource = totalCorrectedImmediateDownPayment - immediateDownPayment;

  const immediateFinancing: ScenarioResult = {
    scenarioName: 'Financiamento Imediato',
    financedAmount: immediateFinancedAmount,
    // Total Pago = Principal (Financiado) + Entrada Corrigida + Juros Obra
    totalPaid: immediateFinancedAmount + totalCorrectedImmediateDownPayment + totalConstructionInterest, 
    totalInterest: totalConstructionInterest, // Mantém Juros de Obra como principal custo financeiro para display
    constructionInterest: totalConstructionInterest,
    correctionOwnResource: immediateCorrectionOnOwnResource, // Nova correção adicionada
    downPayment: immediateDownPayment,
    financingPercentage: immediateFinancingPct
  };

  // --- CÁLCULO CENÁRIO 2: FINANCIAMENTO NAS CHAVES (SEM BÔNUS + TETO 70%) ---
  // Base de cálculo: Valor de Tabela CHEIO (Perde o bônus)
  const keysBasePrice = salePrice; 

  // Regra: Nas chaves, o banco ou construtora limita a 70%.
  const keysFinancingPct = Math.min(financingPercentage, 70);
  const keysFinancedAmount = keysBasePrice * (keysFinancingPct / 100);
  const keysDownPayment = keysBasePrice - keysFinancedAmount; // Entrada consideravelmente maior (Sem bônus + Teto 70%)

  // 1. Correção sobre o Saldo Devedor (Financiamento)
  const finalFinancedAmountAfterIncc =
    keysFinancedAmount * Math.pow(1 + monthlyInccRate, constructionMonths);
  
  const correctionOnFinancing = finalFinancedAmountAfterIncc - keysFinancedAmount;

  // 2. Correção sobre o Recurso Próprio (Entrada Parcelada)
  const monthlyKeysDownPayment = keysDownPayment / constructionMonths;
  let totalCorrectedKeysDownPayment = 0;

  for (let i = 1; i <= constructionMonths; i++) {
    const correctedParcel = monthlyKeysDownPayment * Math.pow(1 + monthlyInccRate, i);
    totalCorrectedKeysDownPayment += correctedParcel;
  }

  const keysCorrectionOnOwnResource = totalCorrectedKeysDownPayment - keysDownPayment;
  const totalKeysCorrection = correctionOnFinancing + keysCorrectionOnOwnResource;

  // 3. Taxas de Escritura e Registro (Porto Alegre / RS)
  // Calculadas sobre o valor de venda CHEIO (sem desconto)
  const itbi = calculateITBIPoa(keysBasePrice);
  const registry = calculateRegistryFeeRS(keysBasePrice);
  const totalFees = itbi + registry;

  const keyDeliveryFinancing: ScenarioResult = {
    scenarioName: 'Financiamento nas Chaves',
    financedAmount: keysFinancedAmount,
    // Custo total = Valor Saldo Devedor Corrigido + Valor Entrada Corrigida + Taxas
    totalPaid: finalFinancedAmountAfterIncc + totalCorrectedKeysDownPayment + totalFees, 
    
    totalInterest: totalKeysCorrection,
    correctionFinancing: correctionOnFinancing,
    correctionOwnResource: keysCorrectionOnOwnResource,
    itbiAmount: itbi,
    registryFee: registry,
    downPayment: keysDownPayment,
    financingPercentage: keysFinancingPct
  };

  return {
    immediateFinancing,
    keyDeliveryFinancing,
    downPayment: immediateDownPayment, // Valor para o banner principal (reflete o input com desconto)
  };
};
