import { defineStore } from 'pinia';
import { ref } from 'vue';
// Assuming mockSuppliers.js exists or suppliers are initialized as empty array
import { initialMockSuppliers } from '../data/mockSuppliers.js'; // Corrected path for named import

export const useSupplierStore = defineStore('suppliers', () => {
  // Ensure deep copy for initial state
  const suppliersList = ref(JSON.parse(JSON.stringify(initialMockSuppliers))); // Or ref([]) if no mock file

  function addSupplier(supplier) {
    suppliersList.value.unshift({ ...supplier, id: Date.now() }); // Add to top
  }

  function updateSupplier(updatedSupplier) {
    const index = suppliersList.value.findIndex(s => s.id === updatedSupplier.id);
    if (index !== -1) {
      suppliersList.value[index] = { ...updatedSupplier };
    }
  }

  function deleteSupplier(supplierId) {
    suppliersList.value = suppliersList.value.filter(s => s.id !== supplierId);
  }

  return { suppliersList, addSupplier, updateSupplier, deleteSupplier };
});
