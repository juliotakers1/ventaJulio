<template>
  <div class="traslados-view card-base">
    <div class="view-header">
      <h2>Gestión de Traslados de Mercancía</h2>
      <button @click="showAddForm" class="action-button success-button">
        <i class="icon-add"></i> Registrar Nuevo Traslado
      </button>
    </div>

    <!-- Add/Edit Transfer Modal -->
    <div v-if="showFormModal" class="modal-overlay-global">
      <div class="modal-content-global" style="max-width: 750px;">
        <div class="modal-header-global">
          <h3>{{ isEditingTransfer ? 'Editar Traslado' : 'Registrar Nuevo Traslado' }}</h3>
          <button @click="closeFormModal" class="modal-close-button">&times;</button>
        </div>
        <form @submit.prevent="triggerSaveTransfer">
          <div class="form-grid">
            <div class="form-group">
              <label for="origin">Origen:</label>
              <select id="origin" v-model="transferForm.origin" required :disabled="isEditingTransfer">
                <option disabled value="">Seleccione origen</option>
                <option v-for="loc in locations" :key="'origin-' + loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="destination">Destino:</label>
              <select id="destination" v-model="transferForm.destination" required :disabled="isEditingTransfer">
                <option disabled value="">Seleccione destino</option>
                <option v-for="loc in locations.filter(l => l !== transferForm.origin)" :key="'dest-' + loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="product">Producto:</label>
              <select id="product" v-model="transferForm.productId" required @change="updateProductNameAndStock" :disabled="isEditingTransfer">
                <option disabled value="">Seleccione un producto</option>
                <option v-for="product in productStore.products" :key="product.id" :value="product.id">
                  {{ product.ecode }} - {{ product.brand }} {{ product.style }} (Stock General: {{ product.stock }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="quantity">Cantidad a Trasladar:</label>
              <input type="number" id="quantity" v-model.number="transferForm.quantity" min="1" :max="maxTransferableStock" required>
              <small v-if="transferForm.productId && maxTransferableStock !== Infinity">
                Stock disponible en origen para traslado: {{ maxTransferableStock }}
              </small>
            </div>
            <div class="form-group">
              <label for="date">Fecha de Traslado:</label>
              <input type="date" id="date" v-model="transferForm.date" required>
            </div>
            <div class="form-group">
              <label for="transporter">Persona que transporta:</label>
              <input type="text" id="transporter" v-model="transferForm.transporter" placeholder="Nombre del transportista">
            </div>
            <div class="form-group full-width">
              <label for="notes">Notas/Referencia de Ticket:</label>
              <textarea id="notes" v-model="transferForm.notes" rows="2" placeholder="Ej: #TICKET123, Cuidado Frágil"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeFormModal" class="action-button secondary-button">Cancelar</button>
            <button type="submit" class="action-button primary-button">{{ isEditingTransfer ? 'Actualizar Traslado' : 'Guardar Traslado' }}</button>
            <button type="button" @click="printTransferTicket(transferForm, true)" v-if="!isEditingTransfer && transferForm.productId" class="action-button info-button btn-sm">
                <i class="icon-print"></i> Imprimir Ticket
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Transfers Table -->
    <div class="table-container">
       <div class="table-header-controls">
        <input type="text" v-model="searchTerm" placeholder="Buscar por producto, origen, destino..." class="search-input">
      </div>
      <table class="app-table transfers-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Transportista</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedTransfers.length === 0">
            <td colspan="8" class="no-results-message">{{ filteredTransfersList.length === 0 && searchTerm ? 'No hay traslados que coincidan.' : 'No hay traslados registrados.'}}</td>
          </tr>
          <tr v-for="transfer in paginatedTransfers" :key="transfer.id">
            <td data-label="Fecha">{{ formatDate(transfer.date) }}</td>
            <td data-label="Origen">{{ transfer.origin }}</td>
            <td data-label="Destino">{{ transfer.destination }}</td>
            <td data-label="Producto">{{ transfer.productName }}</td>
            <td data-label="Cantidad">{{ transfer.quantity }}</td>
            <td data-label="Transportista">{{ transfer.transporter || '-' }}</td>
            <td data-label="Notas" class="notes-cell" :title="transfer.notes">{{ truncateText(transfer.notes, 30) }}</td>
            <td data-label="Acciones" class="actions-cell">
              <button @click="showEditForm(transfer)" class="action-button warning-button btn-sm">
                <i class="icon-edit"></i> Editar
              </button>
              <button @click="triggerDeleteTransfer(transfer.id)" class="action-button danger-button btn-sm">
                <i class="icon-delete"></i> Eliminar
              </button>
              <button @click="printTransferTicket(transfer, false)" class="action-button info-outline-button btn-sm">
                <i class="icon-print"></i> Ver Ticket
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-controls" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1" class="action-button secondary-button btn-sm">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="action-button secondary-button btn-sm">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Script mostly unchanged, ensure store usage is correct
import { ref, reactive, computed } from 'vue';
import { useTransferStore } from '@/stores/transferStore.js';
import { useProductStore } from '@/stores/productStore.js';

const transferStore = useTransferStore();
const productStore = useProductStore();

const locations = ref(['Bodega Central', 'Tienda Norte', 'Tienda Sur', 'Tienda Centro', 'Outlet Este']);
const showFormModal = ref(false);
const isEditingTransfer = ref(false);
let originalTransferDetailsForEdit = null;
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const initialFormState = { /* ... as before ... */
  id: null, origin: 'Bodega Central', destination: '', productId: '', productName: '',
  quantity: 1, date: new Date().toISOString().slice(0, 10), transporter: '', notes: '',
};
const transferForm = reactive({ ...initialFormState });

const transfersFullList = computed(() => transferStore.transfersList);
const filteredTransfersList = computed(() => {
    if(!searchTerm.value) return transfersFullList.value;
    const lowerSearch = searchTerm.value.toLowerCase();
    return transfersFullList.value.filter(t =>
        t.productName.toLowerCase().includes(lowerSearch) ||
        t.origin.toLowerCase().includes(lowerSearch) ||
        t.destination.toLowerCase().includes(lowerSearch) ||
        (t.transporter && t.transporter.toLowerCase().includes(lowerSearch)) ||
        (t.notes && t.notes.toLowerCase().includes(lowerSearch))
    );
});
const totalPages = computed(() => Math.ceil(filteredTransfersList.value.length / itemsPerPage.value));
const paginatedTransfers = computed(() => {
    if (totalPages.value > 0 && currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredTransfersList.value.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(start, end);
});
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };


const maxTransferableStock = ref(Infinity);
const updateProductNameAndStock = () => { /* ... as before ... */
  const product = productStore.getProductById(transferForm.productId);
  if (product) {
    transferForm.productName = `${product.ecode} - ${product.brand} ${product.style}`;
    maxTransferableStock.value = product.stock; // Stock from general product store
  } else {
    transferForm.productName = ''; maxTransferableStock.value = Infinity;
  }
   if(transferForm.quantity > maxTransferableStock.value) transferForm.quantity = maxTransferableStock.value;
};

const resetForm = () => { /* ... as before ... */
  Object.assign(transferForm, initialFormState);
  transferForm.date = new Date().toISOString().slice(0, 10);
  isEditingTransfer.value = false; originalTransferDetailsForEdit = null; maxTransferableStock.value = Infinity;
};
const closeFormModal = () => { showFormModal.value = false; resetForm(); };
const showAddForm = () => { resetForm(); showFormModal.value = true; };
const showEditForm = (transfer) => { /* ... as before, disable key fields in form for edit ... */
  Object.assign(transferForm, JSON.parse(JSON.stringify(transfer)));
  isEditingTransfer.value = true;
  originalTransferDetailsForEdit = { productId: transfer.productId, quantity: transfer.quantity };
  const product = productStore.getProductById(transfer.productId);
  maxTransferableStock.value = product ? product.stock + transfer.quantity : transfer.quantity;
  // Note: Disabling origin, destination, productId in template for edit mode
};
const triggerSaveTransfer = () => { /* ... as before ... */
  if (!transferForm.origin || !transferForm.destination || !transferForm.productId || transferForm.quantity <= 0) {
    alert('Origen, Destino, Producto y Cantidad son obligatorios.'); return;
  }
  if (transferForm.origin === transferForm.destination) {
    alert('Origen y Destino no pueden ser iguales.'); return;
  }
  const product = productStore.getProductById(transferForm.productId);
  if (!product) { alert('Producto no encontrado.'); return; }

  const currentProductStock = product.stock;
  if (isEditingTransfer.value) {
    const quantityChange = transferForm.quantity - originalTransferDetailsForEdit.quantity;
    if (quantityChange > currentProductStock) {
      alert(`Stock insuficiente. Stock actual: ${currentProductStock}, necesita ${quantityChange - currentProductStock} más.`); return;
    }
    transferStore.updateTransfer({ ...transferForm }, originalTransferDetailsForEdit);
  } else {
    if (currentProductStock < transferForm.quantity) {
      alert(`Stock insuficiente. Stock actual: ${currentProductStock}.`); return;
    }
    transferStore.addTransfer({ ...transferForm });
  }
  closeFormModal();
};
const triggerDeleteTransfer = (transferId) => { /* ... as before ... */
  if (window.confirm('¿Seguro? El stock será ajustado.')) {
    transferStore.deleteTransfer(transferId);
    if (currentPage.value > totalPages.value && totalPages.value > 0) currentPage.value = totalPages.value;
  }
};
const printTransferTicket = (transferData, isForm) => { /* ... as before ... */
  let ticketDetails = { ...transferData };
  if (isForm && !ticketDetails.productName && ticketDetails.productId) {
    const product = productStore.getProductById(ticketDetails.productId);
    ticketDetails.productName = product ? `${product.ecode} - ${product.brand} ${product.style}` : 'Desconocido';
  }
  if (isForm && !ticketDetails.id) ticketDetails.id = "PENDIENTE";
  let ticketContent = `--- TICKET DE TRASLADO ---\nID: ${ticketDetails.id}\nFecha: ${formatDate(ticketDetails.date)}\nOrigen: ${ticketDetails.origin}\nDestino: ${ticketDetails.destination}\nProducto: ${ticketDetails.productName} (ID: ${ticketDetails.productId})\nCantidad: ${ticketDetails.quantity}\nTransportista: ${ticketDetails.transporter||'-'}\nNotas: ${ticketDetails.notes||'-'}\n-------------------------`;
  console.log("Ticket:\n", ticketContent); alert("Ticket (ver consola):\nID: " + ticketDetails.id);
};
const formatDate = (dateString) => { /* ... as before ... */
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
const truncateText = (text, length) => { /* ... as before ... */
  if (text && text.length > length) return text.substring(0, length) + '...';
  return text || '-';
};
</script>

<style scoped>
/* .traslados-view { padding: 20px; } */ /* Applied by .card-base */

.view-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
}
.view-header h2 { margin: 0; color: var(--text-dark); }
@media (prefers-color-scheme: dark) {
  .view-header h2 { color: var(--dm-text-dark); }
}

.modal-close-button {
  background: none; border: none; font-size: 1.75rem; line-height: 1;
  color: var(--text-muted); cursor: pointer; padding: 0.5rem;
  position: absolute; top: 10px; right: 15px;
}
.modal-close-button:hover { color: var(--text-dark); }
@media (prefers-color-scheme: dark) {
  .modal-close-button { color: var(--dm-text-dark); opacity: 0.7; }
  .modal-close-button:hover { opacity: 1; }
}

.form-actions {
  display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap;
  margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);
}
@media (prefers-color-scheme: dark) {
  .form-actions { border-top-color: var(--dm-border-color); }
}

.table-container { margin-top: 1rem; }
.table-header-controls {
  margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;
}
.search-input { min-width: 280px; max-width: 400px; }

.transfers-table .actions-cell { text-align: right; white-space: nowrap; }
.transfers-table .actions-cell .action-button { margin-left: 0.3rem; margin-bottom: 0.3rem; }
.notes-cell { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: help; }
.no-results-message { text-align: center; padding: 1.5rem; color: var(--text-muted); font-style: italic; }

.pagination-controls {
  margin-top: 1.5rem; text-align: center; display: flex;
  justify-content: center; align-items: center; gap: 0.5rem;
}
.pagination-controls span { font-size: 0.9em; color: var(--text-muted); }
@media (prefers-color-scheme: dark) {
  .pagination-controls span { color: var(--dm-text-dark); opacity: 0.8;}
}


/* Button styles */
.primary-button { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--text-light); }
.primary-button:hover { background-color: #0056b3; border-color: #0052a9; }
.secondary-button { background-color: var(--secondary-color); border-color: var(--secondary-color); color: var(--text-light); }
.secondary-button:hover { background-color: #545b62; border-color: #4e555b; }
.success-button { background-color: var(--success-color); border-color: var(--success-color); color: var(--text-light); }
.success-button:hover { background-color: #1e7e34; border-color: #1c7430;}
.danger-button { background-color: var(--danger-color); border-color: var(--danger-color); color: var(--text-light); }
.danger-button:hover { background-color: #b02a37; border-color: #a52834;}
.warning-button { background-color: var(--warning-color); border-color: var(--warning-color); color: var(--text-dark); }
.warning-button:hover { background-color: #d39e00; border-color: #c69500;}
.info-button { background-color: var(--accent-color); border-color: var(--accent-color); color: var(--text-light); }
.info-button:hover { background-color: #0f788a; border-color: #0e6e7e;}
.info-outline-button { background-color: transparent; color: var(--accent-color); border: 1px solid var(--accent-color); }
.info-outline-button:hover { background-color: var(--accent-color); color: var(--text-light); }


.btn-sm { padding: 0.35rem 0.6rem; font-size: 0.8em; }

/* Icons */
[class^="icon-"]::before { display: inline-block; margin-right: 0.4em; }
.icon-add::before { content: '+'; font-weight: bold; }
.icon-edit::before { content: '✎'; }
.icon-delete::before { content: '🗑️'; }
.icon-print::before { content: '📄';} /* Simple print icon */
</style>
