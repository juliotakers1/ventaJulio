import { defineStore } from 'pinia';
import { mockProducts as initialMockProducts } from '../data/mockProducts.js'; // Adjusted path
import { ref, computed } from 'vue'; // Added computed for potential use

export const useProductStore = defineStore('products', () => {
  // Ensure deep copy for initial state to prevent direct mutation of mock data
  const products = ref(JSON.parse(JSON.stringify(initialMockProducts)));

  // Actions
  function addProduct(product) {
    // Ensure the product object being pushed is also a deep copy if it's complex
    // and might be mutated elsewhere before being added, though less likely here.
    products.value.unshift({ ...product, id: Date.now() }); // Add to top for visibility
  }

  function updateProduct(updatedProduct) {
    const index = products.value.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products.value[index] = { ...updatedProduct };
    }
  }

  function deleteProduct(productId) {
    products.value = products.value.filter(p => p.id !== productId);
  }

  function getProductById(productId) {
    // Ensure a reactive plain object is returned, not a direct ref to an item in the array
    // which could lead to unintended direct mutations from components.
    // However, find itself returns a plain object if found, or undefined.
    return products.value.find(p => p.id === productId);
  }

  // Action to adjust stock
  function adjustStock(productId, quantityChange) {
    const product = getProductById(productId); // Uses the getter above
    if (product) {
      if (typeof product.stock !== 'number' || isNaN(product.stock)) {
        console.warn(`Product ${productId} stock is not a number or NaN. Initializing to 0 before adjustment.`);
        product.stock = 0; // Initialize stock if not present or NaN
      }
      product.stock += quantityChange;
      // Ensure the change is reflected in the main reactive array
      // This should be automatic if getProductById returns a reference to the object in the array.
      // If getProductById returned a copy, we'd need to update products.value here.
      // Let's ensure products.value[index] is updated to be safe and trigger reactivity if needed.
      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1) {
        products.value[index] = { ...product }; // Force reactivity by creating a new object
      }

    } else {
        console.warn(`Product with ID ${productId} not found for stock adjustment.`);
    }
  }

  // Getter for all products (optional, as store.products can be accessed directly)
  const allProducts = computed(() => products.value);

  return { products, addProduct, updateProduct, deleteProduct, getProductById, adjustStock, allProducts };
});
