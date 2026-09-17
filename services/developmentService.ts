export interface Development {
  id: string;
  name: string;
  deliveryDate: string; // Formato DD/MM/YYYY
  deliveryIsoDate: string;
  location?: string;
}

export const DEVELOPMENTS: Development[] = [
  {
    id: 'casa-tua-santos-ferreira',
    name: 'Casa Tua - Santos Ferreira',
    deliveryDate: '30/03/2028',
    deliveryIsoDate: '2028-03-30',
  },
  {
    id: 'casa-tua-alto-petropolis-1',
    name: 'Casa Tua - Alto Petropolis 1',
    deliveryDate: '30/11/2027',
    deliveryIsoDate: '2027-11-30',
  },
  {
    id: 'casa-tua-alto-petropolis-2',
    name: 'Casa Tua - Alto Petropolis 2',
    deliveryDate: '30/11/2027',
    deliveryIsoDate: '2027-11-30',
  },
  {
    id: 'orygem-1',
    name: 'Orygem 1',
    deliveryDate: '28/02/2027',
    deliveryIsoDate: '2027-02-28',
  },
  {
    id: 'orygem-2',
    name: 'Orygem 2',
    deliveryDate: '28/02/2027',
    deliveryIsoDate: '2027-02-28',
  },
];

/**
 * Calcula a quantidade de meses restantes até a data de entrega do empreendimento.
 */
export function calculateMonthsUntilDelivery(deliveryDateStr: string, fromDate: Date = new Date()): number {
  if (!deliveryDateStr) return 24;
  
  const [day, month, year] = deliveryDateStr.split('/').map(Number);
  const target = new Date(year, month - 1, day);
  const diffDays = Math.ceil((target.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Aproximação de 30.4375 dias por mês
  const months = Math.round(diffDays / 30.4375);
  return Math.max(1, months);
}
