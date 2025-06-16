<template>
  <div class="egresos-view">
    <div class="form-container">
      <h2>Registrar Egreso por Producto Dañado</h2>
      <form @submit.prevent="recordExpense">
        <div class="form-group">
          <label for="product">Producto:</label>
          <select id="product" v-model="expenseForm.productId" required>
            <option value="" disabled>Seleccione un producto</option>
            <option v-for="product in availableProducts" :key="product.id" :value="product.id">
              {{ product.ecode }} - {{ product.brand }} {{ product.style }} (Stock: {{product.stock}})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="quantity">Cantidad Dañada:</label>
          <input type="number" id="quantity" v-model.number="expenseForm.quantity" min="1" required>
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

        <button type="submit" class="action-button primary">Registrar Egreso</button>
      </form>
    </div>

    <div class="list-container">
      <h3>Historial de Egresos</h3>
      <table v-if="recordedExpensesList.length > 0" class="expenses-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto (E-code)</th>
            <th>Cantidad</th>
            <th>Razón</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in recordedExpensesList" :key="expense.id">
            <td>{{ formatDate(expense.date) }}</td>
            <td>{{ getProductEcode(expense.productId) }}</td>
            <td>{{ expense.quantity }}</td>
            <td>{{ expense.reason }}</td>
            <td>{{ expense.notes }}</td>
            <td>
              <button @click="showEditExpenseForm(expense)" class="action-button edit-button">Editar</button>
              <button @click="deleteExpense(expense.id)" class="action-button delete-button">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-expenses">No hay egresos registrados todavía.</p>
    </div>

    <!-- Edit Expense Modal (Similar to ProductosView) -->
    <div v-if="showEditForm" class="modal-overlay">
      <div class="modal-content">
        <h2>Editar Egreso</h2>
        <form @submit.prevent="updateExpense">
          <div class="form-group">
            <label>Producto:</label>
            <p><strong>{{ getProductEcode(editingExpenseForm.productId) }}</strong> (No se puede cambiar)</p>
          </div>
          <div class="form-group">
            <label for="edit-quantity">Cantidad Dañada:</label>
            <input type="number" id="edit-quantity" v-model.number="editingExpenseForm.quantity" min="1" required>
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
            <button type="submit" class="action-button primary">Actualizar Egreso</button>
            <button type="button" @click="closeEditForm" class="action-button secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { mockProducts } from '../data/mockProducts.js'; // For product selection and details

// Use a deep copy for available products to avoid modifying the original mock data
const availableProducts = ref(JSON.parse(JSON.stringify(mockProducts)));
const recordedExpensesList = ref([]);

const initialExpenseFormState = {
  productId: '',
  quantity: 1,
  date: new Date().toISOString().slice(0, 10), // Default to today
  reason: '',
  notes: '',
};
const expenseForm = reactive({ ...initialExpenseFormState });

// For Edit Modal
const showEditForm = ref(false);
const editingExpenseId = ref(null);
const initialEditingExpenseFormState = {
  id: null,
  productId: '',
  quantity: 1,
  date: '',
  reason: '',
  notes: '',
};
const editingExpenseForm = reactive({ ...initialEditingExpenseFormState });


const recordExpense = () => {
  if (!expenseForm.productId || expenseForm.quantity <= 0 || !expenseForm.date || !expenseForm.reason) {
    alert('Por favor, complete todos los campos requeridos.');
    return;
  }

  const product = availableProducts.value.find(p => p.id === expenseForm.productId);
  if (!product) {
    alert('Producto seleccionado no válido.');
    return;
  }
  if (expenseForm.quantity > product.stock) {
    alert(`La cantidad de egreso (${expenseForm.quantity}) excede el stock disponible (${product.stock}) para ${product.ecode}.`);
    return;
  }

  // Update stock in availableProducts (simulating backend update)
  product.stock -= expenseForm.quantity;

  const newExpense = {
    id: Date.now(), // Simple unique ID
    ...expenseForm,
  };
  recordedExpensesList.value.unshift(newExpense);

  // Reset form
  Object.assign(expenseForm, {
    ...initialExpenseFormState,
    date: new Date().toISOString().slice(0, 10) // Keep date as today for next entry
  });
};

const getProductEcode = (productId) => {
  const product = mockProducts.find(p => p.id === productId); // Use original mockProducts for display consistency
  return product ? product.ecode : 'Desconocido';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Make sure to use UTC to avoid timezone issues with date-only strings
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString();
};

// --- Edit and Delete Logic ---
const showEditExpenseForm = (expense) => {
  editingExpenseId.value = expense.id;
  Object.assign(editingExpenseForm, expense);
  showEditForm.value = true;
};

const closeEditForm = () => {
  showEditForm.value = false;
  editingExpenseId.value = null;
  Object.assign(editingExpenseForm, initialEditingExpenseFormState);
};

const updateExpense = () => {
  if (editingExpenseForm.quantity <= 0 || !editingExpenseForm.date || !editingExpenseForm.reason) {
    alert('Por favor, complete todos los campos requeridos para la edición.');
    return;
  }

  const index = recordedExpensesList.value.findIndex(exp => exp.id === editingExpenseId.value);
  if (index !== -1) {
    const originalExpense = recordedExpensesList.value[index];
    const product = availableProducts.value.find(p => p.id === originalExpense.productId);

    if (product) {
      // Calculate stock adjustment:
      // Add back original quantity, then subtract new quantity
      const quantityDifference = editingExpenseForm.quantity - originalExpense.quantity;
      if (product.stock - quantityDifference < 0 && quantityDifference > 0) {
         alert(`La cantidad de egreso (${editingExpenseForm.quantity}) excede el stock disponible (${product.stock + originalExpense.quantity}) para ${product.ecode}.`);
         return;
      }
      product.stock -= quantityDifference;
    }

    recordedExpensesList.value[index] = { ...editingExpenseForm };
  }
  closeEditForm();
};

const deleteExpense = (expenseId) => {
  if (window.confirm('¿Está seguro de que desea eliminar este registro de egreso?')) {
    const index = recordedExpensesList.value.findIndex(exp => exp.id === expenseId);
    if (index !== -1) {
      const expenseToDelete = recordedExpensesList.value[index];
      const product = availableProducts.value.find(p => p.id === expenseToDelete.productId);
      // Add back the quantity to stock
      if (product) {
        product.stock += expenseToDelete.quantity;
      }
      recordedExpensesList.value.splice(index, 1);
    }
  }
};

// Initialize form date
onMounted(() => {
  expenseForm.date = new Date().toISOString().slice(0, 10);
});

</script>

<style scoped>
.egresos-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-container, .list-container {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-container h2, .list-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 0.95em;
}

.form-group textarea {
  resize: vertical;
}

.action-button {
  padding: 10px 18px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.action-button.primary {
  background-color: #007bff; /* Blue */
  color: white;
}
.action-button.primary:hover {
  background-color: #0056b3;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.expenses-table th,
.expenses-table td {
  border: 1px solid #dee2e6;
  padding: 10px 12px;
  text-align: left;
  font-size: 0.9em;
  vertical-align: middle;
}

.expenses-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.expenses-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
.expenses-table tbody tr:hover {
  background-color: #f1f1f1;
}

.no-expenses {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

.action-button.edit-button {
  background-color: #ffc107; /* Yellow */
  color: #212529;
  margin-right: 5px;
  font-size: 0.85em;
  padding: 6px 10px;
}
.action-button.edit-button:hover {
  background-color: #e0a800;
}

.action-button.delete-button {
  background-color: #dc3545; /* Red */
  color: white;
  font-size: 0.85em;
  padding: 6px 10px;
}
.action-button.delete-button:hover {
  background-color: #c82333;
}

/* Modal styles (reusing from ProductosView concept) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}
.modal-content .form-group p {
  font-size: 0.95em;
  background-color: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.action-button.secondary {
  background-color: #6c757d; /* Gray */
  color: white;
}
.action-button.secondary:hover {
  background-color: #545b62;
}
</style>
