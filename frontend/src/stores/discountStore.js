import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initialMockDiscounts } from '../data/mockDiscounts.js'; // Corrected path for named import

export const useDiscountStore = defineStore('discounts', () => {
  // Ensure deep copy for initial state
  const discountsList = ref(JSON.parse(JSON.stringify(initialMockDiscounts))); // Or ref([])

  function addDiscount(discount) {
    discountsList.value.unshift({ ...discount, id: Date.now() }); // Add to top
  }

  function updateDiscount(updatedDiscount) {
    const index = discountsList.value.findIndex(d => d.id === updatedDiscount.id);
    if (index !== -1) {
      discountsList.value[index] = { ...updatedDiscount };
    }
  }

  function deleteDiscount(discountId) {
    discountsList.value = discountsList.value.filter(d => d.id !== discountId);
  }

  return { discountsList, addDiscount, updateDiscount, deleteDiscount };
});
