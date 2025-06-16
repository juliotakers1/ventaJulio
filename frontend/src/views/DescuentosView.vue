<template>
  <div class="descuentos-view card-base">
    <div class="view-header">
      <h2>Gestión de Descuentos</h2>
      <button @click="showAddDiscountForm" class="action-button success-button">
        <i class="icon-add"></i> Crear Nuevo Descuento
      </button>
    </div>

    <!-- Add/Edit Discount Modal -->
    <div v-if="showDiscountFormModal" class="modal-overlay-global">
      <div class="modal-content-global" style="max-width: 650px;">
        <div class="modal-header-global">
          <h3>{{ isEditingDiscount ? 'Editar Descuento' : 'Crear Nuevo Descuento' }}</h3>
          <button @click="closeDiscountFormModal" class="modal-close-button">&times;</button>
        </div>
        <form @submit.prevent="triggerSaveDiscount">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nombre del Descuento:</label>
              <input type="text" id="name" v-model="discountForm.name" required>
            </div>

            <div class="form-group">
              <label for="type">Tipo de Descuento:</label>
              <select id="type" v-model="discountForm.type" required>
                <option value="" disabled>Seleccione un tipo</option>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="value">Valor del Descuento:</label>
              <input type="number" id="value" v-model.number="discountForm.value" min="0" step="0.01" required>
              <small v-if="discountForm.type === 'percentage'">Ej: 10 para 10%</small>
              <small v-if="discountForm.type === 'fixed'">Ej: 5 para $5.00</small>
            </div>

            <div class="form-group">
              <label for="startDate">Fecha de Inicio:</label>
              <input type="date" id="startDate" v-model="discountForm.startDate" required>
            </div>

            <div class="form-group">
              <label for="endDate">Fecha de Fin:</label>
              <input type="date" id="endDate" v-model="discountForm.endDate" :min="discountForm.startDate" required>
            </div>

            <div class="form-group full-width">
              <label for="applicabilityNotes">Aplicabilidad (Notas):</label>
              <textarea id="applicabilityNotes" v-model="discountForm.applicabilityNotes" rows="2" placeholder="Ej: Todos los productos, Marca Nike, Estilo Correr"></textarea>
            </div>

            <div class="form-group">
              <label for="code">Código de Descuento (Opcional):</label>
              <input type="text" id="code" v-model="discountForm.code" placeholder="Ej: VERANO2024">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeDiscountFormModal" class="action-button secondary-button">Cancelar</button>
            <button type="submit" class="action-button primary-button">{{ isEditingDiscount ? 'Actualizar Descuento' : 'Guardar Descuento' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Discounts Table -->
    <div class="table-container">
       <div class="table-header-controls">
        <input type="text" v-model="searchTerm" placeholder="Buscar descuento..." class="search-input">
      </div>
      <table class="app-table discounts-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Aplicabilidad</th>
            <th>Código</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedDiscounts.length === 0">
             <td colspan="9" class="no-results-message">{{ filteredDiscountsList.length === 0 && searchTerm ? 'No hay descuentos que coincidan.' : 'No hay descuentos registrados.' }}</td>
          </tr>
          <tr v-for="discount in paginatedDiscounts" :key="discount.id" :class="{ 'row-inactive': !isDiscountActive(discount) && getDiscountStatusText(discount) === 'Expirado', 'row-upcoming': getDiscountStatusText(discount) === 'Próximo' }">
            <td data-label="Nombre">{{ discount.name }}</td>
            <td data-label="Tipo">{{ discount.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo' }}</td>
            <td data-label="Valor">{{ discount.type === 'percentage' ? `${discount.value}%` : `$${typeof discount.value === 'number' ? discount.value.toFixed(2) : '0.00'}` }}</td>
            <td data-label="Inicio">{{ formatDate(discount.startDate) }}</td>
            <td data-label="Fin">{{ formatDate(discount.endDate) }}</td>
            <td data-label="Aplicabilidad" class="notes-cell" :title="discount.applicabilityNotes">{{ truncateText(discount.applicabilityNotes, 40) }}</td>
            <td data-label="Código">{{ discount.code || '-' }}</td>
            <td data-label="Estado">
              <span class="status-badge" :class="getDiscountStatusClass(discount)">
                {{ getDiscountStatusText(discount) }}
              </span>
            </td>
            <td data-label="Acciones" class="actions-cell">
              <button @click="showEditDiscountForm(discount)" class="action-button warning-button btn-sm">
                <i class="icon-edit"></i> Editar
              </button>
              <button @click="triggerDeleteDiscount(discount.id)" class="action-button danger-button btn-sm">
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
// Script remains largely the same
import { ref, reactive, computed } from 'vue';
import { useDiscountStore } from '@/stores/discountStore.js';

const discountStore = useDiscountStore();
const showDiscountFormModal = ref(false);
const isEditingDiscount = ref(false);
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const initialDiscountFormState = { /* ... as before ... */
  id: null, name: '', type: '', value: 0, startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10),
  applicabilityNotes: '', code: '',
};
const discountForm = reactive({ ...initialDiscountFormState });

const discountsList = computed(() => discountStore.discountsList);
const filteredDiscountsList = computed(() => {
    if (!searchTerm.value) return discountsList.value;
    const lowerSearch = searchTerm.value.toLowerCase();
    return discountsList.value.filter(d =>
        d.name.toLowerCase().includes(lowerSearch) ||
        (d.code && d.code.toLowerCase().includes(lowerSearch)) ||
        (d.applicabilityNotes && d.applicabilityNotes.toLowerCase().includes(lowerSearch))
    );
});

const totalPages = computed(() => Math.ceil(filteredDiscountsList.value.length / itemsPerPage.value));
const paginatedDiscounts = computed(() => {
    if (totalPages.value > 0 && currentPage.value > totalPages.value) currentPage.value = totalPages.value;
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredDiscountsList.value.slice().sort((a,b) => new Date(b.startDate) - new Date(a.startDate)).slice(start, end);
});
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };


const formatDate = (dateString) => { /* ... as before ... */
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);
  const day = `0${localDate.getDate()}`.slice(-2);
  const month = `0${localDate.getMonth() + 1}`.slice(-2);
  const year = localDate.getFullYear();
  return `${day}/${month}/${year}`;
};
const isDiscountActive = (discount) => { /* ... as before ... */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = new Date(discount.startDate); startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  const endDate = new Date(discount.endDate); endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
  endDate.setHours(23, 59, 59, 999);
  return startDate <= today && today <= endDate;
};
const getDiscountStatusText = (discount) => { /* ... as before ... */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = new Date(discount.startDate); startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  if (startDate > today) return 'Próximo';
  if (isDiscountActive(discount)) return 'Activo';
  return 'Expirado';
};
const getDiscountStatusClass = (discount) => { /* ... as before ... */
    const status = getDiscountStatusText(discount);
    if (status === 'Activo') return 'status-active';
    if (status === 'Próximo') return 'status-upcoming';
    return 'status-expired';
};

const resetDiscountForm = () => { /* ... as before ... */
  Object.assign(discountForm, initialDiscountFormState);
  discountForm.startDate = new Date().toISOString().slice(0, 10);
  discountForm.endDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10);
  isEditingDiscount.value = false;
};
const showAddDiscountForm = () => { resetDiscountForm(); showDiscountFormModal.value = true; };
const closeDiscountFormModal = () => { showDiscountFormModal.value = false; resetDiscountForm(); };

const triggerSaveDiscount = () => { /* ... as before ... */
  if (!discountForm.name || !discountForm.type || discountForm.value <= 0 || !discountForm.startDate || !discountForm.endDate) {
    alert('Complete los campos obligatorios.'); return;
  }
  if (new Date(discountForm.endDate) < new Date(discountForm.startDate)) {
    alert('Fecha de fin no puede ser anterior a inicio.'); return;
  }
  if (isEditingDiscount.value) discountStore.updateDiscount({ ...discountForm });
  else discountStore.addDiscount({ ...discountForm });
  closeDiscountFormModal();
};
const showEditDiscountForm = (discount) => { /* ... as before ... */
  Object.assign(discountForm, JSON.parse(JSON.stringify(discount)));
  isEditingDiscount.value = true; showDiscountFormModal.value = true;
};
const triggerDeleteDiscount = (discountId) => { /* ... as before ... */
  if (window.confirm('¿Seguro?')) {
    discountStore.deleteDiscount(discountId);
    if (currentPage.value > totalPages.value && totalPages.value > 0) currentPage.value = totalPages.value;
  }
};
const truncateText = (text, length) => {
  if (text && text.length > length) return text.substring(0, length) + '...';
  return text || '-';
};
</script>

<style scoped>
/* .descuentos-view { padding: 20px; } */ /* Applied by .card-base */

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

.discounts-table .actions-cell { text-align: right; white-space: nowrap; }
.discounts-table .actions-cell .action-button { margin-left: 0.5rem; }
.notes-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: help; }
.no-results-message { text-align: center; padding: 1.5rem; color: var(--text-muted); font-style: italic; }

.row-inactive { background-color: #fcfcfc; } /* Subtle for expired */
.row-inactive td { color: var(--text-muted); }
.row-upcoming { background-color: #fffaf0; } /* Light yellow for upcoming */
@media (prefers-color-scheme: dark) {
    .row-inactive { background-color: #2a2e32; }
    .row-inactive td { color: var(--dm-text-dark); opacity: 0.6; }
    .row-upcoming { background-color: #332e22; }
}


.status-badge {
  padding: 0.25em 0.6em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem; /* var(--border-radius-base) */
  color: var(--text-light);
}
.status-active { background-color: var(--success-color); }
.status-upcoming { background-color: var(--warning-color); color: var(--text-dark); } /* Text dark for yellow */
.status-expired { background-color: var(--secondary-color); }


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
