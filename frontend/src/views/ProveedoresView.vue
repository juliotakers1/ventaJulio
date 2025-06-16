<template>
  <div class="proveedores-view card-base">
    <div class="view-header">
      <h2>Gestión de Proveedores</h2>
      <button @click="showAddForm" class="action-button success-button">
        <i class="icon-add"></i> Agregar Proveedor
      </button>
    </div>

    <!-- Add/Edit Supplier Modal -->
    <div v-if="showFormModal" class="modal-overlay-global">
      <div class="modal-content-global" style="max-width: 700px;">
        <div class="modal-header-global">
          <h3>{{ isEditingSupplier ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor' }}</h3>
          <button @click="closeFormModal" class="modal-close-button">&times;</button>
        </div>
        <form @submit.prevent="triggerSaveSupplier">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nombre del Proveedor:</label>
              <input type="text" id="name" v-model="supplierForm.name" required>
            </div>
            <div class="form-group">
              <label for="contactPerson">Persona de Contacto:</label>
              <input type="text" id="contactPerson" v-model="supplierForm.contactPerson">
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="supplierForm.email">
            </div>
            <div class="form-group">
              <label for="phone">Teléfono:</label>
              <input type="tel" id="phone" v-model="supplierForm.phone">
            </div>
            <div class="form-group full-width">
              <label for="address">Dirección:</label>
              <textarea id="address" v-model="supplierForm.address" rows="2"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="suppliedItems">Productos/Servicios que suministra:</label>
              <textarea id="suppliedItems" v-model="supplierForm.suppliedItems" rows="3" placeholder="Ej: Calzado deportivo, Ropa de algodón, Accesorios varios..."></textarea>
            </div>
            <div class="form-group full-width">
              <label for="notes">Notas Adicionales:</label>
              <textarea id="notes" v-model="supplierForm.notes" rows="2" placeholder="Ej: Tiempos de entrega, Calidad esperada, Condiciones de pago..."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeFormModal" class="action-button secondary-button">Cancelar</button>
            <button type="submit" class="action-button primary-button">{{ isEditingSupplier ? 'Actualizar Proveedor' : 'Guardar Proveedor' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Suppliers Table -->
    <div class="table-container">
       <div class="table-header-controls">
        <input type="text" v-model="searchTerm" placeholder="Buscar proveedor..." class="search-input">
      </div>
      <table class="app-table suppliers-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Suministros</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedSuppliers.length === 0">
            <td colspan="6" class="no-results-message">{{ filteredSuppliersList.length === 0 && searchTerm ? 'No hay proveedores que coincidan.' : 'No hay proveedores registrados.' }}</td>
          </tr>
          <tr v-for="supplier in paginatedSuppliers" :key="supplier.id">
            <td data-label="Nombre">{{ supplier.name }}</td>
            <td data-label="Contacto">{{ supplier.contactPerson || '-' }}</td>
            <td data-label="Email">{{ supplier.email || '-' }}</td>
            <td data-label="Teléfono">{{ supplier.phone || '-' }}</td>
            <td data-label="Suministros" class="supplied-items-cell" :title="supplier.suppliedItems">{{ truncateText(supplier.suppliedItems, 50) }}</td>
            <td data-label="Acciones" class="actions-cell">
              <button @click="showEditForm(supplier)" class="action-button warning-button btn-sm">
                <i class="icon-edit"></i> Editar
              </button>
              <button @click="triggerDeleteSupplier(supplier.id)" class="action-button danger-button btn-sm">
                <i class="icon-delete"></i> Eliminar
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
import { ref, reactive, computed } from 'vue';
import { useSupplierStore } from '@/stores/supplierStore.js';

const supplierStore = useSupplierStore();
const showFormModal = ref(false);
const isEditingSupplier = ref(false);
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);


const initialFormState = { /* ... as before ... */
  id: null, name: '', contactPerson: '', email: '', phone: '', address: '', suppliedItems: '', notes: '',
};
const supplierForm = reactive({ ...initialFormState });

const suppliersList = computed(() => supplierStore.suppliersList);

const filteredSuppliersList = computed(() => {
  if (!searchTerm.value) return suppliersList.value;
  const lowerSearch = searchTerm.value.toLowerCase();
  return suppliersList.value.filter(s =>
    s.name.toLowerCase().includes(lowerSearch) ||
    (s.contactPerson && s.contactPerson.toLowerCase().includes(lowerSearch)) ||
    (s.email && s.email.toLowerCase().includes(lowerSearch)) ||
    (s.suppliedItems && s.suppliedItems.toLowerCase().includes(lowerSearch))
  );
});

const totalPages = computed(() => Math.ceil(filteredSuppliersList.value.length / itemsPerPage.value));
const paginatedSuppliers = computed(() => {
  if (totalPages.value > 0 && currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSuppliersList.value.slice().sort((a,b) => a.name.localeCompare(b.name)).slice(start, end);
});

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

const resetForm = () => { Object.assign(supplierForm, initialFormState); isEditingSupplier.value = false; };
const closeFormModal = () => { showFormModal.value = false; resetForm(); };
const showAddForm = () => { resetForm(); showFormModal.value = true; };
const showEditForm = (supplier) => {
  Object.assign(supplierForm, JSON.parse(JSON.stringify(supplier)));
  isEditingSupplier.value = true; showFormModal.value = true;
};
const triggerSaveSupplier = () => {
  if (!supplierForm.name) { alert('El nombre es obligatorio.'); return; }
  if (isEditingSupplier.value) supplierStore.updateSupplier({ ...supplierForm });
  else supplierStore.addSupplier({ ...supplierForm });
  closeFormModal();
};
const triggerDeleteSupplier = (supplierId) => {
  if (window.confirm('¿Seguro?')) {
    supplierStore.deleteSupplier(supplierId);
    if (currentPage.value > totalPages.value && totalPages.value > 0) currentPage.value = totalPages.value;
  }
};
const truncateText = (text, length) => {
  if (text && text.length > length) return text.substring(0, length) + '...';
  return text || '-';
};
</script>

<style scoped>
/* .proveedores-view { padding: 20px; } */ /* Applied by .card-base */

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.view-header h2 { margin: 0; color: var(--text-dark); }
@media (prefers-color-scheme: dark) {
  .view-header h2 { color: var(--dm-text-dark); }
}

/* Modal styles use global .modal-overlay-global etc. */
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

.form-grid { /* Using global styles */ }
.form-group { /* Using global styles */ }
.form-actions {
  display: flex; justify-content: flex-end; gap: 0.75rem;
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

/* .app-table is global */
.suppliers-table .actions-cell { text-align: right; white-space: nowrap; }
.suppliers-table .actions-cell .action-button { margin-left: 0.5rem; }
.supplied-items-cell {
    max-width: 250px; /* Adjust as needed */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: help; /* Indicate that full text is available on hover/title */
}
.no-results-message { text-align: center; padding: 1.5rem; color: var(--text-muted); font-style: italic; }

.pagination-controls {
  margin-top: 1.5rem; text-align: center; display: flex;
  justify-content: center; align-items: center; gap: 0.5rem;
}
.pagination-controls span { font-size: 0.9em; color: var(--text-muted); }
@media (prefers-color-scheme: dark) {
  .pagination-controls span { color: var(--dm-text-dark); opacity: 0.8;}
}

/* Specific button styles */
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

.btn-sm { padding: 0.35rem 0.6rem; font-size: 0.8em; }

/* Icons */
[class^="icon-"]::before { display: inline-block; margin-right: 0.4em; }
.icon-add::before { content: '+'; font-weight: bold; }
.icon-edit::before { content: '✎'; }
.icon-delete::before { content: '🗑️'; }
</style>
