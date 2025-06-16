// Mock Sales Data
// Simulating sales records that would be generated from VentasView or similar.

// Let's assume some vendors
const vendors = [
  { id: 'vendor1', name: 'Ana Pérez' },
  { id: 'vendor2', name: 'Carlos López' },
  { id: 'vendor3', name: 'Sofía Gómez' },
];

// Helper to generate a random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Get product details from mockProducts for realism (if needed, but for now let's keep it simple)
// For now, we'll just use product IDs and names directly in sales for simplicity in reports.

export const mockSales = [];
const numSales = 150; // Generate 150 sales records

const productExamples = [
  { productId: 1, productName: 'Nike Running Black', unitPrice: 120 },
  { productId: 2, productName: 'Adidas Casual White', unitPrice: 110 },
  { productId: 3, productName: 'Nike Basketball Red', unitPrice: 150 },
  { productId: 4, productName: 'Puma Training Blue', unitPrice: 90 },
  { productId: 5, productName: 'Adidas Running Grey', unitPrice: 130 },
  { productId: 6, productName: 'Nike Casual White', unitPrice: 95 },
  { productId: 7, productName: 'Adidas Basketball Black', unitPrice: 160 },
];

const startDate = new Date(2023, 0, 1); // Start of last year
const endDate = new Date(); // Up to today

for (let i = 0; i < numSales; i++) {
  const product = productExamples[Math.floor(Math.random() * productExamples.length)];
  const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
  const saleDate = randomDate(startDate, endDate);
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];

  mockSales.push({
    saleId: `S${String(i + 1).padStart(4, '0')}`,
    productId: product.productId,
    productName: product.productName, // Keeping it simple
    quantity: quantity,
    unitPrice: product.unitPrice,
    totalAmount: quantity * product.unitPrice,
    saleDate: saleDate.toISOString().slice(0, 10), // YYYY-MM-DD format
    vendorId: vendor.id,
    vendorName: vendor.name, // For easier grouping in reports
  });
}

// console.log(mockSales.slice(0,5)); // For quick check if needed
