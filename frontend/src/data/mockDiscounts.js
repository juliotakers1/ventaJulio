export const initialMockDiscounts = [
  {
    id: 1,
    name: 'Venta de Verano',
    type: 'percentage', // 'percentage' or 'fixed'
    value: 15, // 15%
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    applicabilityNotes: 'Todos los productos de temporada',
    code: 'VERANO15',
  },
  {
    id: 2,
    name: 'Liquidación Zapatillas Deportivas',
    type: 'fixed',
    value: 25.50, // $25.50 off
    startDate: '2024-06-15',
    endDate: '2024-06-30',
    applicabilityNotes: 'Solo zapatillas deportivas seleccionadas',
    code: '',
  },
  {
    id: 3,
    name: 'Descuento Fin de Semana Pasado',
    type: 'percentage',
    value: 10,
    startDate: '2023-12-01', // Example past date
    endDate: '2023-12-03',   // Example past date
    applicabilityNotes: 'Toda la tienda (Expirado)',
    code: 'FINDE10PAST',
  },
   {
    id: 4,
    name: 'Descuento Próximo Invierno',
    type: 'percentage',
    value: 12,
    startDate: new Date(new Date().getFullYear() + 1, 0, 15).toISOString().slice(0,10), // Next year
    endDate: new Date(new Date().getFullYear() + 1, 0, 30).toISOString().slice(0,10),   // Next year
    applicabilityNotes: 'Abrigos y Botas',
    code: 'INVNO12',
  }
];

export default initialMockDiscounts;
