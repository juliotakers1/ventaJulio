// Mock Expenses Data
// This can be similar to what EgresosView might generate, or more general business expenses.

// Helper to generate a random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const expenseCategories = [
  'Daño de Mercancía',
  'Alquiler de Local',
  'Servicios Públicos (Luz, Agua)',
  'Material de Oficina',
  'Publicidad y Marketing',
  'Salarios',
  'Transporte y Logística',
];

export const mockExpenses = [];
const numExpenses = 50; // Generate 50 expense records

const startDate = new Date(2023, 0, 1); // Start of last year
const endDate = new Date(); // Up to today

for (let i = 0; i < numExpenses; i++) {
  const expenseDate = randomDate(startDate, endDate);
  const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
  let amount;

  if (category === 'Salarios') {
    amount = Math.floor(Math.random() * 1500) + 500; // $500 - $2000
  } else if (category === 'Alquiler de Local') {
    amount = Math.floor(Math.random() * 800) + 400; // $400 - $1200
  } else if (category === 'Daño de Mercancía') {
    amount = Math.floor(Math.random() * 200) + 20; // $20 - $220
  } else {
    amount = Math.floor(Math.random() * 300) + 50; // $50 - $350 for other categories
  }

  mockExpenses.push({
    expenseId: `E${String(i + 1).padStart(4, '0')}`,
    description: category, // Using category as description for simplicity
    amount: amount,
    expenseDate: expenseDate.toISOString().slice(0, 10), // YYYY-MM-DD format
    notes: `Registro automático de ${category.toLowerCase()}`,
  });
}

// console.log(mockExpenses.slice(0,5)); // For quick check if needed
