export interface InccMonthItem {
  data: string;
  valor: number;
}

export interface InccData {
  monthlyRates: InccMonthItem[];
  accumulated12m: number; // e.g. 7.29%
  monthlyEquivalent: number; // e.g. 0.59%
  lastMonth: string; // e.g. "07/2025"
  periodDescription: string;
  isLive: boolean;
}

// Dados de fallback caso a API do BACEN esteja offline ou com instabilidade (Set/2025 a Ago/2026)
const FALLBACK_12M_RATES: InccMonthItem[] = [
  { data: '01/09/2025', valor: 0.17 },
  { data: '01/10/2025', valor: 0.30 },
  { data: '01/11/2025', valor: 0.27 },
  { data: '01/12/2025', valor: 0.21 },
  { data: '01/01/2026', valor: 0.72 },
  { data: '01/02/2026', valor: 0.28 },
  { data: '01/03/2026', valor: 0.54 },
  { data: '01/04/2026', valor: 1.00 },
  { data: '01/05/2026', valor: 0.88 },
  { data: '01/06/2026', valor: 0.78 },
  { data: '01/07/2026', valor: 0.61 },
  { data: '01/08/2026', valor: 0.66 }
];

export function calculateInccMetrics(rates: InccMonthItem[], isLive: boolean = false): InccData {
  const compoundFactor = rates.reduce((acc, item) => acc * (1 + item.valor / 100), 1);
  const accumulated12m = Number(((compoundFactor - 1) * 100).toFixed(2));
  
  // Taxa mensal equivalente: (1 + i_12m)^(1/12) - 1
  const monthlyEquivalent = Number(((Math.pow(compoundFactor, 1 / 12) - 1) * 100).toFixed(2));

  const firstMonth = rates[0]?.data ? formatMonthYear(rates[0].data) : '';
  const lastMonth = rates[rates.length - 1]?.data ? formatMonthYear(rates[rates.length - 1].data) : '';
  const periodDescription = `${firstMonth} a ${lastMonth}`;

  return {
    monthlyRates: rates,
    accumulated12m,
    monthlyEquivalent,
    lastMonth,
    periodDescription,
    isLive
  };
}

function formatMonthYear(dateStr: string): string {
  // dateStr format: "DD/MM/YYYY"
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parts[1];
    const year = parts[2];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIdx = parseInt(month, 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${monthNames[monthIdx]}/${year}`;
    }
    return `${month}/${year}`;
  }
  return dateStr;
}

export async function fetchLatest12MonthsINCC(): Promise<InccData> {
  const seriesToTry = [192, 7458];

  for (const seriesCode of seriesToTry) {
    try {
      const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados/ultimos/12?formato=json`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const rawData = await response.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          const parsedRates: InccMonthItem[] = rawData.map((item: { data: string; valor: string | number }) => ({
            data: item.data,
            valor: typeof item.valor === 'number' ? item.valor : parseFloat(item.valor) || 0
          }));

          return calculateInccMetrics(parsedRates, true);
        }
      }
    } catch (error) {
      console.warn(`Tentativa de carregar série ${seriesCode} falhou:`, error);
    }
  }

  return calculateInccMetrics(FALLBACK_12M_RATES, false);
}
