<template>
  <div class="productos-view">
    <div class="actions-container">
      <button @click="showAddProductForm" class="action-button add-button">Agregar Nuevo Producto</button>
      <div class="barcode-reader-placeholder">
        <input type="text" v-model="barcodeScanInput" placeholder="Escanear o ingresar código...">
        <button @click="scanBarcode" class="action-button scan-button">Lector SI</button>
      </div>
    </div>

    <!-- Add/Edit Product Form Modal -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</h2>
        <form @submit.prevent="isEditing ? updateProduct() : addProduct()">
          <div class="form-grid">
            <div class="form-group">
              <label for="brand">Marca:</label>
              <input type="text" id="brand" v-model="productForm.brand" required>
            </div>
            <div class="form-group">
              <label for="style">Estilo:</label>
              <input type="text" id="style" v-model="productForm.style" required>
            </div>
            <div class="form-group">
              <label for="color">Color:</label>
              <input type="text" id="color" v-model="productForm.color" required>
            </div>
            <div class="form-group">
              <label for="size">Talla:</label>
              <input type="text" id="size" v-model="productForm.size" required>
            </div>
            <div class="form-group">
              <label for="ecode">E-code/Código:</label>
              <input type="text" id="ecode" v-model="productForm.ecode" required>
            </div>
             <div class="form-group">
              <label for="stock">Stock:</label>
              <input type="number" id="stock" v-model.number="productForm.stock" min="0" required>
            </div>
            <div class="form-group">
              <label for="price1">Precio 1:</label>
              <input type="number" id="price1" v-model.number="productForm.price1" min="0" step="0.01" required>
            </div>
             <div class="form-group">
              <label for="price1_description">Descripción Precio 1:</label>
              <input type="text" id="price1_description" v-model="productForm.price1_description">
            </div>
            <div class="form-group">
              <label for="price2">Precio 2:</label>
              <input type="number" id="price2" v-model.number="productForm.price2" min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="price2_description">Descripción Precio 2:</label>
              <input type="text" id="price2_description" v-model="productForm.price2_description">
            </div>
            <div class="form-group">
              <label for="lastAuthPrice">Precio Última Autorización:</label>
              <input type="number" id="lastAuthPrice" v-model.number="productForm.lastAuthPrice" min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="lastAuthPrice_description">Descripción Autorización:</label>
              <input type="text" id="lastAuthPrice_description" v-model="productForm.lastAuthPrice_description">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="action-button primary">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
            <button type="button" @click="closeForm" class="action-button secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Products Table -->
    <div class="products-table-container">
      <h3>Listado de Productos</h3>
      <table class="products-table">
        <thead>
          <tr>
            <th>E-code</th>
            <th>Marca</th>
            <th>Estilo</th>
            <th>Color</th>
            <th>Talla</th>
            <th>Stock</th>
            <th>Precio 1</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="productsList.length === 0">
            <td colspan="8" class="no-products">No hay productos para mostrar.</td>
          </tr>
          <tr v-for="product in productsList" :key="product.id">
            <td>{{ product.ecode }}</td>
            <td>{{ product.brand }}</td>
            <td>{{ product.style }}</td>
            <td>{{ product.color }}</td>
            <td>{{ product.size }}</td>
            <td>{{ product.stock }}</td>
            <td>${{ product.price1 }}</td>
            <td>
              <button @click="showEditProductForm(product)" class="action-button edit-button">Editar</button>
              <button @click="deleteProduct(product.id)" class="action-button delete-button">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { mockProducts as initialMockProducts } from '../data/mockProducts.js'; // Import mock data

const productsList = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editingProductId = ref(null);
const barcodeScanInput = ref('');

const initialFormState = {
  id: null,
  brand: '',
  style: '',
  color: '',
  size: '',
  ecode: '',
  stock: 0,
  price1: 0,
  price1_description: 'Precio de lista',
  price2: 0,
  price2_description: 'Precio de oferta',
  lastAuthPrice: 0,
  lastAuthPrice_description: 'Precio mayoreo',
};

const productForm = reactive({ ...initialFormState });

onMounted(() => {
  // Deep copy mockProducts to avoid modifying the original array if it's used elsewhere
  productsList.value = JSON.parse(JSON.stringify(initialMockProducts));
});

const resetForm = () => {
  Object.assign(productForm, initialFormState);
  isEditing.value = false;
  editingProductId.value = null;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

const showAddProductForm = () => {
  resetForm();
  showForm.value = true;
};

const addProduct = () => {
  if (!productForm.brand || !productForm.style || !productForm.ecode) {
    alert('Marca, Estilo, y E-code son campos requeridos.');
    return;
  }
  const newProduct = {
    ...productForm,
    id: Date.now(), // Simple unique ID for mock
  };
  productsList.value.unshift(newProduct); // Add to the beginning of the list
  closeForm();
};

const showEditProductForm = (product) => {
  Object.assign(productForm, product); // Copy product data to form
  isEditing.value = true;
  editingProductId.value = product.id;
  showForm.value = true;
};

const updateProduct = () => {
  if (!productForm.brand || !productForm.style || !productForm.ecode) {
    alert('Marca, Estilo, y E-code son campos requeridos.');
    return;
  }
  const index = productsList.value.findIndex(p => p.id === editingProductId.value);
  if (index !== -1) {
    productsList.value[index] = { ...productForm }; // Update product
  }
  closeForm();
};

const deleteProduct = (productId) => {
  if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
    productsList.value = productsList.value.filter(p => p.id !== productId);
  }
};

const scanBarcode = () => {
  if (barcodeScanInput.value) {
    console.log("Barcode scanned/entered:", barcodeScanInput.value);
    // Potentially search for the product or populate a field
    const foundProduct = productsList.value.find(p => p.ecode === barcodeScanInput.value);
    if (foundProduct) {
      showEditProductForm(foundProduct); // Open edit form if product found by ecode
    } else {
      alert(`Producto con E-code "${barcodeScanInput.value}" no encontrado. Puede agregarlo.`);
      // Optionally pre-fill ecode in add new product form
      resetForm();
      productForm.ecode = barcodeScanInput.value;
      showForm.value = true;
    }
    barcodeScanInput.value = ''; // Clear input after scan
  } else {
    console.log("Barcode scanning initiated (Lector SI)... Awaiting input.");
    // In a real scenario, this might integrate with a hardware scanner API
    // or focus the input field.
    alert("Por favor, ingrese o escanee un código de barras en el campo de texto.");
  }
};

</script>

<style scoped>
.productos-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px; /* Gap between add button and barcode section */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.barcode-reader-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
}

.barcode-reader-placeholder input[type="text"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 200px; /* Ensure input is adequately sized */
}

.action-button {
  padding: 10px 15px;
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

.scan-button {
  background-color: #17a2b8; /* Teal */
  color: white;
}
.scan-button:hover {
  background-color: #117a8b;
}


/* Modal styles */
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
  z-index: 1000; /* Ensure modal is on top */
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 700px; /* Max width for the form */
  max-height: 90vh; /* Max height */
  overflow-y: auto; /* Allow scrolling within the modal */
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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
.products-table-container {
  margin-top: 20px;
  overflow-x: auto; /* Allow horizontal scrolling for table on small screens */
}
.products-table-container h3 {
    margin-bottom: 15px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.products-table th,
.products-table td {
  border: 1px solid #dee2e6;
  padding: 10px 12px; /* Increased padding */
  text-align: left;
  font-size: 0.95em;
}

.products-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.products-table tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

.products-table tbody tr:hover {
  background-color: #e9ecef;
}

.no-products td {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

.action-button.edit-button {
  background-color: #ffc107; /* Yellow */
  color: #212529;
  margin-right: 5px;
}
.action-button.edit-button:hover {
  background-color: #d39e00;
}

.action-button.delete-button {
  background-color: #dc3545; /* Red */
  color: white;
}
.action-button.delete-button:hover {
  background-color: #b02a37;
}
</style>
