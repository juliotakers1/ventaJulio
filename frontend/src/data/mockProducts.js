export const mockProducts = [
  {
    id: 1,
    ecode: 'E001',
    brand: 'Nike',
    style: 'Running',
    color: 'Black',
    size: '42',
    stock: 10,
    price1: 120,
    price1_description: 'Precio de lista',
    price2: 100,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 90,
    lastAuthPrice_description: 'Precio mayoreo',
  },
  {
    id: 2,
    ecode: 'E002',
    brand: 'Adidas',
    style: 'Casual',
    color: 'White',
    size: '40',
    stock: 5,
    price1: 110,
    price1_description: 'Precio de lista',
    price2: 95,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 85,
    lastAuthPrice_description: 'Precio mayoreo',
  },
  {
    id: 3,
    ecode: 'E003',
    brand: 'Nike',
    style: 'Basketball',
    color: 'Red',
    size: '44',
    stock: 8,
    price1: 150,
    price1_description: 'Precio de lista',
    price2: 130,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 120,
    lastAuthPrice_description: 'Precio mayoreo',
  },
  {
    id: 4,
    ecode: 'E004',
    brand: 'Puma',
    style: 'Training',
    color: 'Blue',
    size: '41',
    stock: 12,
    price1: 90,
    price1_description: 'Precio de lista',
    price2: 75,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 65,
    lastAuthPrice_description: 'Precio mayoreo',
  },
  {
    id: 5,
    ecode: 'E005',
    brand: 'Adidas',
    style: 'Running',
    color: 'Grey',
    size: '43',
    stock: 3,
    price1: 130,
    price1_description: 'Precio de lista',
    price2: 110,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 100,
    lastAuthPrice_description: 'Precio mayoreo',
  },
  {
    id: 6,
    ecode: 'N006', // Nike Ecode
    brand: 'Nike',
    style: 'Casual',
    color: 'White',
    size: '39',
    stock: 15,
    price1: 95,
    price1_description: 'Precio de lista',
    price2: 80,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 70,
    lastAuthPrice_description: 'Precio mayoreo',
  },
  {
    id: 7,
    ecode: 'A007', // Adidas Ecode
    brand: 'Adidas',
    style: 'Basketball',
    color: 'Black',
    size: '45',
    stock: 6,
    price1: 160,
    price1_description: 'Precio de lista',
    price2: 140,
    price2_description: 'Precio de oferta',
    lastAuthPrice: 130,
    lastAuthPrice_description: 'Precio mayoreo',
  }
];

// Helper to get unique values for filters
export const getUniqueValues = (products, key) => {
  const values = products.map(product => product[key]);
  return [...new Set(values)].sort();
};

// Helper to get styles for a brand
export const getStylesForBrand = (products, brand) => {
  const styles = products
    .filter(product => product.brand === brand)
    .map(product => product.style);
  return [...new Set(styles)].sort();
};

// Helper to get colors for brand and style
export const getColorsForBrandStyle = (products, brand, style) => {
  const colors = products
    .filter(product => product.brand === brand && product.style === style)
    .map(product => product.color);
  return [...new Set(colors)].sort();
};

// Helper to get sizes for brand, style, and color
export const getSizesForBrandStyleColor = (products, brand, style, color) => {
  const sizes = products
    .filter(product => product.brand === brand && product.style === style && product.color === color)
    .map(product => product.size);
  return [...new Set(sizes)].sort();
};
