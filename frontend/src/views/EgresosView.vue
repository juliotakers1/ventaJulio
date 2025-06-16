<template>
  <div class="egresos-view card-base">
    <div class="view-header">
      <h2>Gestión de Egresos por Producto Dañado</h2>
      <!-- No "Add" button here, form is always visible or could be in a collapsible section -->
    </div>

    <div class="content-layout">
      <div class="form-column">
        <h3>Registrar Nuevo Egreso</h3>
        <form @submit.prevent="triggerRecordExpense" class="expense-form">
          <div class="form-group">
            <label for="product">Producto:</label>
            <select id="product" v-model="expenseForm.productId" required @change="updateSelectedProductStock">
              <option value="" disabled>Seleccione un producto</option>
              <option v-for="product in availableProductsForDropdown" :key="product.id" :value="product.id">
                {{ product.ecode }} - {{ product.brand }} {{ product.style }} (Stock: {{product.stock}})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantity">Cantidad Dañada:</label>
            <input type="number" id="quantity" v-model.number="expenseForm.quantity" min="1" :max="selectedProductMaxStock" required>
            <small v-if="expenseForm.productId && selectedProductMaxStock !== Infinity">Stock disponible para egreso: {{ selectedProductMaxStock }}</small>
          </div>

          <div class="form-group">
            <label for="date">Fecha del Egreso:</label>
            <input type="date" id="date" v-model="expenseForm.date" required>
          </div>

          <div class="form-group">
            <label for="reason">Razón del Daño/Egreso:</label>
            <textarea id="reason" v-model="expenseForm.reason" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Notas Adicionales (Opcional):</label>
            <textarea id="notes" v-model="expenseForm.notes" rows="2"></textarea>
          </div>

          <button type="submit" class="action-button primary-button full-width-button">
            <i class="icon-save"></i> Registrar Egreso
          </button>
        </form>
      </div>

      <div class="list-column">
        <h3>Historial de Egresos</h3>
        <div class="table-container">
          <table class="app-table expenses-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Razón</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="expensesListDisplay.length === 0">
                <td colspan="5" class="no-results-message">No hay egresos registrados todavía.</td>
              </tr>
              <tr v-for="expense in expensesListDisplay" :key="expense.id">
                <td data-label="Fecha">{{ formatDate(expense.date) }}</td>
                <td data-label="Producto">{{ getProductDetails(expense.productId)?.ecode || 'N/A' }}</td>
                <td data-label="Cantidad">{{ expense.quantity }}</td>
                <td data-label="Razón" class="reason-cell" :title="expense.reason">{{ truncateText(expense.reason, 40) }}</td>
                <td data-label="Acciones" class="actions-cell">
                  <button @click="showEditExpenseForm(expense)" class="action-button warning-button btn-sm">
                    <i class="icon-edit"></i> Editar
                  </button>
                  <button @click="triggerDeleteExpense(expense.id)" class="action-button danger-button btn-sm">
                    <i class="icon-delete"></i> Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <!-- Edit Expense Modal -->
    <div v-if="showEditForm" class="modal-overlay-global">
      <div class="modal-content-global" style="max-width: 550px;">
         <div class="modal-header-global">
            <h3>Editar Egreso</h3>
            <button @click="closeEditForm" class="modal-close-button">&times;</button>
         </div>
        <form @submit.prevent="triggerUpdateExpense">
          <div class="form-group">
            <label>Producto:</label>
            <p><strong>{{ getProductDetails(editingExpenseForm.productId)?.ecode }} - {{ getProductDetails(editingExpenseForm.productId)?.brand }}</strong> <br><small>(No se puede cambiar el producto al editar)</small></p>
          </div>
          <div class="form-group">
            <label for="edit-quantity">Cantidad Dañada:</label>
            <input type="number" id="edit-quantity" v-model.number="editingExpenseForm.quantity" min="1" :max="editingProductMaxStock" required>
            <small v-if="editingExpenseForm.productId && editingProductMaxStock !== Infinity">Máx. cantidad (actual + stock): {{ editingProductMaxStock }}</small>
          </div>
          <div class="form-group">
            <label for="edit-date">Fecha del Egreso:</label>
            <input type="date" id="edit-date" v-model="editingExpenseForm.date" required>
          </div>
          <div class="form-group">
            <label for="edit-reason">Razón del Daño/Egreso:</label>
            <textarea id="edit-reason" v-model="editingExpenseForm.reason" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="edit-notes">Notas Adicionales (Opcional):</label>
            <textarea id="edit-notes" v-model="editingExpenseForm.notes" rows="2"></textarea>
          </div>
          <div class="form-actions">
             <button type="button" @click="closeEditForm" class="action-button secondary-button">Cancelar</button>
            <button type="submit" class="action-button primary-button">Actualizar Egreso</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Script remains largely the same
import { ref, reactive, onMounted, computed } from 'vue';
import { useEgresosStore } from '@/stores/egresosStore.js';
import { useProductStore } from '@/stores/productStore.js';

const egresosStore = useEgresosStore();
const productStore = useProductStore();

const availableProductsForDropdown = computed(() => productStore.products.filter(p => p.stock > 0)); // Only show products with stock
const expensesListDisplay = computed(() => [...egresosStore.expensesList].sort((a,b) => new Date(b.date) - new Date(a.date)));

const initialExpenseFormState = { /* ... */
    productId: '', quantity: 1, date: new Date().toISOString().slice(0, 10), reason: '', notes: '',
};
const expenseForm = reactive({ ...initialExpenseFormState });
let originalQuantityForEdit = 0;

const showEditForm = ref(false);
const editingExpenseForm = reactive({ ...initialExpenseFormState, id: null });
const selectedProductMaxStock = ref(Infinity);

function updateSelectedProductStock() {
    if (expenseForm.productId) {
        const product = productStore.getProductById(expenseForm.productId);
        selectedProductMaxStock.value = product ? product.stock : 0;
    } else {
        selectedProductMaxStock.value = Infinity;
    }
     if(expenseForm.quantity > selectedProductMaxStock.value) expenseForm.quantity = selectedProductMaxStock.value; // Adjust if current qty exceeds new max
}
const editingProductMaxStock = computed(() => {
    if (editingExpenseForm.productId) {
        const product = productStore.getProductById(editingExpenseForm.productId);
        return product ? product.stock + originalQuantityForEdit : 0;
    }
    return Infinity;
});

const triggerRecordExpense = () => {
  if (!expenseForm.productId || expenseForm.quantity <= 0 || !expenseForm.date || !expenseForm.reason) {
    alert('Complete los campos requeridos.'); return;
  }
  const product = productStore.getProductById(expenseForm.productId);
  if (!product || product.stock < expenseForm.quantity) {
    alert(`Stock insuficiente. Disponible: ${product?.stock || 0}.`); return;
  }
  egresosStore.addExpense({ ...expenseForm });
  Object.assign(expenseForm, { ...initialExpenseFormState, date: new Date().toISOString().slice(0, 10) });
  selectedProductMaxStock.value = Infinity;
  updateSelectedProductStock(); // Update stock for next selection
};
const showEditExpenseForm = (expense) => {
  Object.assign(editingExpenseForm, JSON.parse(JSON.stringify(expense)));
  originalQuantityForEdit = expense.quantity;
  showEditForm.value = true;
};
const closeEditForm = () => {
  showEditForm.value = false;
  Object.assign(editingExpenseForm, { ...initialExpenseFormState, id: null });
  originalQuantityForEdit = 0;
};
const triggerUpdateExpense = () => {
  if (editingExpenseForm.quantity <= 0 || !editingExpenseForm.date || !editingExpenseForm.reason) {
    alert('Complete los campos requeridos.'); return;
  }
  const product = productStore.getProductById(editingExpenseForm.productId);
  if (!product) { alert('Producto no encontrado.'); return; }
  const maxAllowed = product.stock + originalQuantityForEdit;
  if (editingExpenseForm.quantity > maxAllowed) {
    alert(`Cantidad excede stock disponible + original. Máximo: ${maxAllowed}`); return;
  }
  egresosStore.updateExpense({ ...editingExpenseForm }, originalQuantityForEdit);
  closeEditForm();
};
const triggerDeleteExpense = (expenseId) => {
  if (window.confirm('¿Seguro que desea eliminar? El stock será ajustado.')) {
    egresosStore.deleteExpense(expenseId);
  }
};
const getProductDetails = (productId) => productStore.getProductById(productId);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
const truncateText = (text, length) => {
  if (text && text.length > length) return text.substring(0, length) + '...';
  return text || 'N/A';
};
onMounted(() => {
  expenseForm.date = new Date().toISOString().slice(0, 10);
  updateSelectedProductStock(); // Initial call in case a product is pre-selected or form is pre-filled
});
</script>

<style scoped>
/* .egresos-view { padding: 20px; } */ /* Applied by .card-base */

.view-header { margin-bottom: 1.5rem; }
.view-header h2 { color: var(--text-dark); }
@media (prefers-color-scheme: dark) {
  .view-header h2 { color: var(--dm-text-dark); }
}


.content-layout {
  display: flex;
  gap: 2rem; /* Space between form and list */
  flex-wrap: wrap; /* Wrap for smaller screens */
}
.form-column {
  flex: 1;
  min-width: 300px; /* Minimum width for the form column */
  /* background-color: var(--bg-card); */ /* Card bg for form section - removed, view has card-base */
  /* padding: 1.5rem; */
  /* border-radius: var(--border-radius-base); */
  /* box-shadow: var(--box-shadow-sm); */
}
.list-column {
  flex: 2;
  min-width: 400px; /* Minimum width for the list column */
}
.form-column h3, .list-column h3 {
    margin-bottom: 1rem;
    color: var(--text-dark);
    font-size: 1.25em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}
@media (prefers-color-scheme: dark) {
  .form-column h3, .list-column h3 { color: var(--dm-text-dark); border-bottom-color: var(--dm-border-color); }
}


.expense-form .form-group { margin-bottom: 1rem; } /* Slightly less margin */
.expense-form .action-button { margin-top: 0.5rem; }

.full-width-button { width: 100%; }

.table-container { margin-top: 0; } /* No extra top margin if h3 is present */
/* .app-table is global */
.expenses-table .actions-cell { text-align: right; white-space: nowrap; }
.expenses-table .actions-cell .action-button { margin-left: 0.3rem; }
.reason-cell {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-results-message { text-align: center; padding: 1.5rem; color: var(--text-muted); font-style: italic; }

/* Modal styles use global .modal-overlay-global and .modal-content-global */
.modal-close-button { /* Copied from ProductosView for consistency */
  background: none; border: none; font-size: 1.75rem; line-height: 1;
  color: var(--text-muted); cursor: pointer; padding: 0.5rem;
  position: absolute; top: 10px; right: 15px;
}
.modal-close-button:hover { color: var(--text-dark); }
@media (prefers-color-scheme: dark) {
  .modal-close-button { color: var(--dm-text-dark); opacity: 0.7; }
  .modal-close-button:hover { opacity: 1; }
}
.modal-content-global .form-group p { /* For non-editable product in edit modal */
  font-size: 0.95em; background-color: var(--bg-light);
  padding: 0.5rem 0.75rem; border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color); margin:0;
}
@media (prefers-color-scheme: dark) {
    .modal-content-global .form-group p { background-color: var(--dm-bg-main); border-color: var(--dm-border-color);}
}
.modal-content-global .form-actions {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);
}
@media (prefers-color-scheme: dark) {
  .modal-content-global .form-actions { border-top-color: var(--dm-border-color); }
}


/* Button styles from global, specific type (primary, danger, etc.) are applied in template */
.primary-button { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--text-light); }
.primary-button:hover { background-color: #0056b3; border-color: #0052a9; }
.secondary-button { background-color: var(--secondary-color); border-color: var(--secondary-color); color: var(--text-light); }
.secondary-button:hover { background-color: #545b62; border-color: #4e555b; }
.danger-button { background-color: var(--danger-color); border-color: var(--danger-color); color: var(--text-light); }
.danger-button:hover { background-color: #b02a37; border-color: #a52834;}
.warning-button { background-color: var(--warning-color); border-color: var(--warning-color); color: var(--text-dark); }
.warning-button:hover { background-color: #d39e00; border-color: #c69500;}

.btn-sm { padding: 0.35rem 0.6rem; font-size: 0.8em; }

/* Icons */
[class^="icon-"]::before { display: inline-block; margin-right: 0.4em; }
.icon-save::before { content: '💾'; } /* Placeholder */
.icon-edit::before { content: '✎'; }
.icon-delete::before { content: '🗑️'; }
</style>
