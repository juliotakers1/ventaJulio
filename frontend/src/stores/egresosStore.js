import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useProductStore } from './productStore'; // Assuming productStore.js is in the same directory

export const useEgresosStore = defineStore('egresos', () => {
  const productStore = useProductStore();
  const expensesList = ref([]); // Initialize with an empty array

  function addExpense(expense) {
    const newExpense = { ...expense, id: Date.now() };
    expensesList.value.unshift(newExpense); // Add to top for visibility
    // Adjust stock: quantity is negative because it's an expense
    if (newExpense.productId && newExpense.quantity != null) { // check for null or undefined quantity
      productStore.adjustStock(newExpense.productId, -Math.abs(newExpense.quantity));
    }
  }

  // originalQuantity is the quantity *before* the current edit.
  function updateExpense(updatedExpense, originalQuantity) {
    const index = expensesList.value.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      const oldExpense = { ...expensesList.value[index] }; // Keep a copy of the old expense state

      // Update the expense in the list
      expensesList.value[index] = { ...updatedExpense };

      // Adjust stock based on the difference
      if (updatedExpense.productId && updatedExpense.quantity != null) {
        if (oldExpense.productId === updatedExpense.productId) {
          // Product is the same, just quantity might have changed
          const quantityDifference = updatedExpense.quantity - originalQuantity;
          productStore.adjustStock(updatedExpense.productId, -quantityDifference); // - because it's an expense
        } else {
          // Product ID changed
          // 1. Add back stock for the old product and its original quantity
          if (oldExpense.productId && oldExpense.quantity != null) {
            productStore.adjustStock(oldExpense.productId, Math.abs(originalQuantity));
          }
          // 2. Reduce stock for the new product and its new quantity
          productStore.adjustStock(updatedExpense.productId, -Math.abs(updatedExpense.quantity));
        }
      } else if (oldExpense.productId && oldExpense.quantity != null) {
        // Expense was updated to no longer have a product or quantity, revert old stock
         productStore.adjustStock(oldExpense.productId, Math.abs(originalQuantity));
      }
    }
  }

  function deleteExpense(expenseId) {
    const expenseIndex = expensesList.value.findIndex(e => e.id === expenseId);
    if (expenseIndex !== -1) {
      const expenseToDelete = expensesList.value[expenseIndex];
      expensesList.value.splice(expenseIndex, 1); // Remove from list

      // Adjust stock: add back the quantity
      if (expenseToDelete.productId && expenseToDelete.quantity != null) {
        productStore.adjustStock(expenseToDelete.productId, Math.abs(expenseToDelete.quantity));
      }
    }
  }

  return { expensesList, addExpense, updateExpense, deleteExpense };
});
