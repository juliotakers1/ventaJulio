import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useProductStore } from './productStore';

export const useTransferStore = defineStore('transfers', () => {
  const productStore = useProductStore();
  const transfersList = ref([]); // Initialize with an empty array

  // Initial mock transfers (can be removed if data is purely dynamic)
  const initialMockTransfers = [
    {
      id: 1,
      origin: 'Bodega Central',
      destination: 'Tienda Norte',
      productId: 1, // Assuming product ID from mockProducts
      productName: 'Nike Running Black (E001)', // Example, will be dynamic in view
      quantity: 5,
      date: '2024-05-10',
      transporter: 'Carlos Villa',
      notes: 'Pedido #123 urgente',
    },
    {
      id: 2,
      origin: 'Bodega Central',
      destination: 'Tienda Sur',
      productId: 3,
      productName: 'Nike Basketball Red (E003)',
      quantity: 10,
      date: '2024-05-12',
      transporter: 'Luisa Paez',
      notes: 'Reposición semanal',
    },
  ];
  // transfersList.value = JSON.parse(JSON.stringify(initialMockTransfers)); // Uncomment to load initial data

  function addTransfer(transfer) {
    const newTransfer = { ...transfer, id: Date.now() };
    transfersList.value.unshift(newTransfer); // Add to top for visibility

    // Simplified stock adjustment: deducts from the product's main stock count.
    // Assumes productStore.adjustStock handles the main stock of the product.
    if (newTransfer.productId && newTransfer.quantity != null) {
      productStore.adjustStock(newTransfer.productId, -Math.abs(newTransfer.quantity));
      console.log(`TransferStore: Stock adjusted for product ${newTransfer.productId} by ${-Math.abs(newTransfer.quantity)} due to new transfer.`);
    }
  }

  // originalTransferDetails should contain { productId, quantity } of the transfer *before* edit.
  function updateTransfer(updatedTransfer, originalTransferDetails) {
    const index = transfersList.value.findIndex(t => t.id === updatedTransfer.id);
    if (index !== -1) {
      const oldTransferInList = { ...transfersList.value[index] }; // Copy before updating
      transfersList.value[index] = { ...updatedTransfer };

      // Determine how stock should be adjusted
      if (originalTransferDetails.productId === updatedTransfer.productId) {
        // Product is the same, only quantity might have changed
        const quantityDifference = updatedTransfer.quantity - originalTransferDetails.quantity;
        if (quantityDifference !== 0) {
          productStore.adjustStock(updatedTransfer.productId, -quantityDifference); // Negative for increase in transfer, positive for decrease
          console.log(`TransferStore: Stock adjusted for product ${updatedTransfer.productId} by ${-quantityDifference} due to transfer update (same product).`);
        }
      } else {
        // Product ID changed
        // 1. Add back stock for the original product and its original quantity
        if (originalTransferDetails.productId && originalTransferDetails.quantity != null) {
          productStore.adjustStock(originalTransferDetails.productId, Math.abs(originalTransferDetails.quantity));
          console.log(`TransferStore: Stock reverted for old product ${originalTransferDetails.productId} by ${Math.abs(originalTransferDetails.quantity)}.`);
        }
        // 2. Reduce stock for the new product and its new quantity
        if (updatedTransfer.productId && updatedTransfer.quantity != null) {
          productStore.adjustStock(updatedTransfer.productId, -Math.abs(updatedTransfer.quantity));
          console.log(`TransferStore: Stock adjusted for new product ${updatedTransfer.productId} by ${-Math.abs(updatedTransfer.quantity)}.`);
        }
      }
    }
  }

  function deleteTransfer(transferId) {
    const transferIndex = transfersList.value.findIndex(t => t.id === transferId);
    if (transferIndex !== -1) {
      const transferToDelete = transfersList.value[transferIndex];
      transfersList.value.splice(transferIndex, 1); // Remove from list

      // Adjust stock: add back the quantity to the product's main stock
      if (transferToDelete.productId && transferToDelete.quantity != null) {
        productStore.adjustStock(transferToDelete.productId, Math.abs(transferToDelete.quantity));
        console.log(`TransferStore: Stock reverted for product ${transferToDelete.productId} by ${Math.abs(transferToDelete.quantity)} due to transfer deletion.`);
      }
    }
  }

  return { transfersList, addTransfer, updateTransfer, deleteTransfer };
});
