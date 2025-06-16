<template>
  <div class="descuentos-view">
    <div class="actions-container">
      <button @click="showAddDiscountForm" class="action-button add-button">Crear Nuevo Descuento</button>
    </div>

    <!-- Add/Edit Discount Modal -->
    <div v-if="showDiscountForm" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditingDiscount ? 'Editar Descuento' : 'Crear Nuevo Descuento' }}</h2>
        <form @submit.prevent="saveDiscount">
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
            <button type="submit" class="action-button primary">{{ isEditingDiscount ? 'Actualizar Descuento' : 'Guardar Descuento' }}</button>
            <button type="button" @click="closeDiscountForm" class="action-button secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Discounts Table -->
    <div class="discounts-table-container">
      <h3>Listado de Descuentos Activos y Pasados</h3>
      <table class="discounts-table">
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
          <tr v-if="discountsList.length === 0">
            <td colspan="9" class="no-discounts">No hay descuentos registrados.</td>
          </tr>
          <tr v-for="discount in sortedDiscountsList" :key="discount.id" :class="{ 'inactive-discount': !isDiscountActive(discount) }">
            <td>{{ discount.name }}</td>
            <td>{{ discount.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo' }}</td>
            <td>{{ discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}` }}</td>
            <td>{{ formatDate(discount.startDate) }}</td>
            <td>{{ formatDate(discount.endDate) }}</td>
            <td>{{ discount.applicabilityNotes }}</td>
            <td>{{ discount.code || 'N/A' }}</td>
            <td>
              <span :class="isDiscountActive(discount) ? 'status-active' : 'status-inactive'">
                {{ getDiscountStatus(discount) }}
              </span>
            </td>
            <td>
              <button @click="showEditDiscountForm(discount)" class="action-button edit-button">Editar</button>
              <button @click="deleteDiscount(discount.id)" class="action-button delete-button">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const initialDiscounts = [
  {
    id: 1,
    name: 'Venta de Verano',
    type: 'percentage', // 'percentage' or 'fixed'
    value: 15, // 15%
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    applicabilityNotes: 'Todos los productos de temporada',
    code: 'VERANO15',
  },
  {
    id: 2,
    name: 'Liquidación Zapatillas Deportivas',
    type: 'fixed',
    value: 25.50, // $25.50 off
    startDate: '2024-06-15',
    endDate: '2024-06-30',
    applicabilityNotes: 'Solo zapatillas deportivas seleccionadas',
    code: '',
  },
  {
    id: 3,
    name: 'Descuento Fin de Semana',
    type: 'percentage',
    value: 10,
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().slice(0,10), // Past
    endDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().slice(0,10),   // Past
    applicabilityNotes: 'Toda la tienda',
    code: 'FINDE10',
  }
];

const discountsList = ref(JSON.parse(JSON.stringify(initialDiscounts))); // Deep copy
const showDiscountForm = ref(false);
const isEditingDiscount = ref(false);
const editingDiscountId = ref(null);

const initialDiscountFormState = {
  id: null,
  name: '',
  type: '',
  value: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10), // Default to 1 week
  applicabilityNotes: '',
  code: '',
};
const discountForm = reactive({ ...initialDiscountFormState });

const sortedDiscountsList = computed(() => {
  return [...discountsList.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Ensure date is interpreted as local if no timezone specified, then output local string parts
  const day = `0${date.getDate() +1}`.slice(-2); // +1 because of UTC interpretation of YYYY-MM-DD
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const isDiscountActive = (discount) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);
  // Adjust start/end dates if they are simple YYYY-MM-DD strings to avoid timezone issues
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
  endDate.setHours(23, 59, 59, 999); // Ensure endDate covers the entire day

  return startDate <= today && today <= endDate;
};

const getDiscountStatus = (discount) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
  endDate.setHours(23, 59, 59, 999);


  if (startDate > today) return 'Próximo';
  if (isDiscountActive(discount)) return 'Activo';
  return 'Expirado';
};


const resetDiscountForm = () => {
  Object.assign(discountForm, initialDiscountFormState);
  discountForm.startDate = new Date().toISOString().slice(0, 10);
  discountForm.endDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10);
  isEditingDiscount.value = false;
  editingDiscountId.value = null;
};

const showAddDiscountForm = () => {
  resetDiscountForm();
  showDiscountForm.value = true;
};

const closeDiscountForm = () => {
  showDiscountForm.value = false;
  resetDiscountForm();
};

const saveDiscount = () => {
  if (!discountForm.name || !discountForm.type || discountForm.value <= 0 || !discountForm.startDate || !discountForm.endDate) {
    alert('Por favor, complete todos los campos obligatorios del descuento (Nombre, Tipo, Valor, Fechas).');
    return;
  }
  if (new Date(discountForm.endDate) < new Date(discountForm.startDate)) {
    alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
    return;
  }

  if (isEditingDiscount.value) {
    // Update logic
    const index = discountsList.value.findIndex(d => d.id === editingDiscountId.value);
    if (index !== -1) {
      discountsList.value[index] = { ...discountForm, id: editingDiscountId.value };
    }
  } else {
    // Add new logic
    const newDiscount = {
      ...discountForm,
      id: Date.now(), // Simple unique ID
    };
    discountsList.value.unshift(newDiscount);
  }
  closeDiscountForm();
};

const showEditDiscountForm = (discount) => {
  Object.assign(discountForm, discount);
  isEditingDiscount.value = true;
  editingDiscountId.value = discount.id;
  showDiscountForm.value = true;
};

const deleteDiscount = (discountId) => {
  if (window.confirm('¿Está seguro de que desea eliminar este descuento?')) {
    discountsList.value = discountsList.value.filter(d => d.id !== discountId);
  }
};

</script>

<style scoped>
.descuentos-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actions-container {
  display: flex;
  justify-content: flex-start; /* Align button to the left */
  margin-bottom: 10px; /* Add some space below the button */
}

.action-button {
  padding: 10px 18px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.add-button {
  background-color: #007bff; /* Blue */
  color: white;
}
.add-button:hover {
  background-color: #0056b3;
}

/* Modal styles (similar to previous views) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 650px; /* Adjusted for discount form */
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px 20px; /* Row and column gap */
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1; /* Make textarea span full width */
}

.form-group label {
  margin-bottom: 5px;
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
.form-group small {
  font-size: 0.8em;
  color: #666;
  margin-top: 3px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.action-button.primary {
  background-color: #28a745; /* Green */
  color: white;
}
.action-button.primary:hover {
  background-color: #1e7e34;
}

.action-button.secondary {
  background-color: #6c757d; /* Gray */
  color: white;
}
.action-button.secondary:hover {
  background-color: #545b62;
}

/* Table styles */
.discounts-table-container {
  margin-top: 10px; /* Reduced margin as actions-container has margin-bottom */
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow-x: auto;
}
.discounts-table-container h3 {
    margin-top: 0;
    margin-bottom: 15px;
}

.discounts-table {
  width: 100%;
  border-collapse: collapse;
}

.discounts-table th,
.discounts-table td {
  border: 1px solid #dee2e6;
  padding: 10px 12px;
  text-align: left;
  font-size: 0.9em;
  vertical-align: middle;
}

.discounts-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.discounts-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
.discounts-table tbody tr:hover {
  background-color: #f1f1f1;
}
.discounts-table tr.inactive-discount {
  background-color: #f8f9fa; /* Light grey for inactive */
  color: #6c757d; /* Muted text color */
}
.discounts-table tr.inactive-discount .status-inactive {
  color: #dc3545; /* Red for expired/upcoming */
}


.no-discounts td {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

.status-active {
  color: #28a745; /* Green */
  font-weight: bold;
}
.status-inactive {
  color: #ffc107; /* Orange for upcoming */
  font-weight: bold;
}
.discounts-table tr.inactive-discount .status-inactive {
  color: #dc3545; /* Red for expired */
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
</style>
