<template>
  <div class="productos-view card-base"> <!-- Apply card-base for consistent view background/padding -->
    <div class="view-header">
      <h2>Gestión de Productos</h2>
      <div class="actions-container">
        <button @click="showAddProductForm" class="action-button success-button">
          <i class="icon-add"></i> Agregar Producto
        </button>
         <div class="barcode-reader-placeholder">
          <input type="text" v-model="barcodeScanInput" @keyup.enter="scanBarcode" placeholder="Escanear o ingresar código...">
          <button @click="scanBarcode" class="action-button info-button">
            <i class="icon-barcode"></i> Lector SI
          </button>
        </div>
      </div>
    </div>


    <!-- Add/Edit Product Form Modal -->
    <div v-if="showForm" class="modal-overlay-global"> <!-- Use global modal style -->
      <div class="modal-content-global" style="max-width: 750px;"> <!-- Global modal style, specific max-width -->
        <div class="modal-header-global">
          <h3>{{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</h3>
          <button @click="closeForm" class="modal-close-button">&times;</button>
        </div>
        <form @submit.prevent="isEditing ? triggerUpdateProduct() : triggerAddProduct()">
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
            <button type="button" @click="closeForm" class="action-button secondary-button">Cancelar</button>
            <button type="submit" class="action-button primary-button">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Products Table -->
    <div class="table-container"> <!-- Renamed for clarity -->
      <div class="table-header-controls">
        <input type="text" v-model="searchTerm" placeholder="Buscar producto (E-code, Marca, Estilo...)" class="search-input">
        <!-- Add other controls like filters if needed -->
      </div>
      <table class="app-table"> <!-- Use global app-table style -->
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
          <tr v-if="paginatedProducts.length === 0">
            <td colspan="8" class="no-results-message">{{ filteredProductsList.length === 0 && searchTerm ? 'No hay productos que coincidan con la búsqueda.' : 'No hay productos para mostrar. Agregue uno para comenzar.' }}</td>
          </tr>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td data-label="E-code">{{ product.ecode }}</td>
            <td data-label="Marca">{{ product.brand }}</td>
            <td data-label="Estilo">{{ product.style }}</td>
            <td data-label="Color">{{ product.color }}</td>
            <td data-label="Talla">{{ product.size }}</td>
            <td data-label="Stock">{{ product.stock }}</td>
            <td data-label="Precio 1">${{ product.price1 ? product.price1.toFixed(2) : '0.00' }}</td>
            <td data-label="Acciones" class="actions-cell">
              <button @click="showEditProductForm(product)" class="action-button warning-button btn-sm">
                <i class="icon-edit"></i> Editar
              </button>
              <button @click="triggerDeleteProduct(product.id)" class="action-button danger-button btn-sm">
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
// Script remains largely the same, ensure Pinia store usage is correct
import { ref, reactive, computed } from 'vue';
import { useProductStore } from '@/stores/productStore.js';

const productStore = useProductStore();
const showForm = ref(false);
const isEditing = ref(false);
const barcodeScanInput = ref('');
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const initialFormState = { /* ... as before ... */
  id: null, brand: '', style: '', color: '', size: '', ecode: '', stock: 0,
  price1: 0, price1_description: 'Precio de lista', price2: 0, price2_description: 'Precio de oferta',
  lastAuthPrice: 0, lastAuthPrice_description: 'Precio mayoreo',
};
const productForm = reactive({ ...initialFormState });

const productsList = computed(() => productStore.products);
const filteredProductsList = computed(() => {
  if (!searchTerm.value) return productsList.value;
  const lowerSearchTerm = searchTerm.value.toLowerCase();
  return productsList.value.filter(product =>
    Object.values(product).some(val =>
      String(val).toLowerCase().includes(lowerSearchTerm)
    )
  );
});

const totalPages = computed(() => Math.ceil(filteredProductsList.value.length / itemsPerPage.value));
const paginatedProducts = computed(() => {
  if (totalPages.value > 0 && currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  // Sort by ecode by default or make it configurable
  return filteredProductsList.value.slice().sort((a,b) => a.ecode.localeCompare(b.ecode)).slice(start, end);
});

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

const resetForm = () => { Object.assign(productForm, initialFormState); isEditing.value = false; };
const closeForm = () => { showForm.value = false; resetForm(); };
const showAddProductForm = () => { resetForm(); showForm.value = true; };

const triggerAddProduct = () => {
  if (!productForm.brand || !productForm.style || !productForm.ecode) {
    alert('Marca, Estilo, y E-code son campos requeridos.'); return;
  }
  productStore.addProduct({ ...productForm }); closeForm();
};
const showEditProductForm = (product) => {
  Object.assign(productForm, JSON.parse(JSON.stringify(product)));
  isEditing.value = true; showForm.value = true;
};
const triggerUpdateProduct = () => {
  if (!productForm.brand || !productForm.style || !productForm.ecode) {
    alert('Marca, Estilo, y E-code son campos requeridos.'); return;
  }
  productStore.updateProduct({ ...productForm }); closeForm();
};
const triggerDeleteProduct = (productId) => {
  if (window.confirm('¿Está seguro?')) {
    productStore.deleteProduct(productId);
    if (currentPage.value > totalPages.value && totalPages.value > 0) currentPage.value = totalPages.value;
  }
};
const scanBarcode = () => {
  if (!barcodeScanInput.value) { alert("Ingrese un código."); return; }
  const found = productStore.products.find(p => p.ecode === barcodeScanInput.value);
  if (found) showEditProductForm(found);
  else {
    alert(`Producto con E-code "${barcodeScanInput.value}" no encontrado.`);
    resetForm(); productForm.ecode = barcodeScanInput.value; showForm.value = true;
  }
  barcodeScanInput.value = '';
};
</script>

<style scoped>
/* Using card-base from global styles for the main view container */
/* .productos-view { padding: 20px; } already in .card-base */

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem; /* More space */
  flex-wrap: wrap; /* Wrap for smaller screens */
  gap: 1rem;
}
.view-header h2 {
  margin: 0; /* Remove default margin */
  color: var(--text-dark);
}
@media (prefers-color-scheme: dark) {
  .view-header h2 { color: var(--dm-text-dark); }
}


.actions-container {
  display: flex;
  align-items: center;
  gap: 1rem; /* Space between buttons/inputs in this container */
  flex-wrap: wrap;
}

.barcode-reader-placeholder { display: flex; align-items: center; gap: 0.5rem; }
.barcode-reader-placeholder input[type="text"] {
  /* padding: 0.5rem 0.75rem; */ /* Global style */
  min-width: 180px;
}

/* Modal Close Button (Example, if not globally defined) */
.modal-close-button {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  position: absolute;
  top: 10px;
  right: 15px;
}
.modal-close-button:hover { color: var(--text-dark); }
@media (prefers-color-scheme: dark) {
  .modal-close-button { color: var(--dm-text-dark); opacity: 0.7; }
  .modal-close-button:hover { opacity: 1; }
}


.form-grid { /* Using global styles for form elements */ }
.form-group { /* Using global styles */ }
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem; /* Space between form action buttons */
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}
@media (prefers-color-scheme: dark) {
  .form-actions { border-top-color: var(--dm-border-color); }
}


/* Table styling */
.table-container { margin-top: 1rem; }
.table-header-controls {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between; /* Or flex-start if only search is present */
  align-items: center;
}
.search-input {
  /* padding: 0.5rem 0.75rem; */ /* Global style */
  min-width: 280px; /* Wider search input */
  max-width: 400px;
}

/* .app-table is defined globally */
.actions-cell { text-align: right; white-space: nowrap;}
.actions-cell .action-button { margin-left: 0.5rem; } /* Space between edit/delete */
.no-results-message { text-align: center; padding: 1.5rem; color: var(--text-muted); font-style: italic; }

/* Pagination styling */
.pagination-controls {
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
.pagination-controls span { font-size: 0.9em; color: var(--text-muted); }
@media (prefers-color-scheme: dark) {
  .pagination-controls span { color: var(--dm-text-dark); opacity: 0.8;}
}


/* Specific button styles using CSS variables */
.primary-button { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--text-light); }
.primary-button:hover { background-color: #0056b3; border-color: #0052a9; }
.secondary-button { background-color: var(--secondary-color); border-color: var(--secondary-color); color: var(--text-light); }
.secondary-button:hover { background-color: #545b62; border-color: #4e555b; }
.success-button { background-color: var(--success-color); border-color: var(--success-color); color: var(--text-light); }
.success-button:hover { background-color: #1e7e34; border-color: #1c7430;}
.danger-button { background-color: var(--danger-color); border-color: var(--danger-color); color: var(--text-light); }
.danger-button:hover { background-color: #b02a37; border-color: #a52834;}
.warning-button { background-color: var(--warning-color); border-color: var(--warning-color); color: var(--text-dark); } /* Text dark for yellow bg */
.warning-button:hover { background-color: #d39e00; border-color: #c69500;}
.info-button { background-color: var(--accent-color); border-color: var(--accent-color); color: var(--text-light); }
.info-button:hover { background-color: #0f788a; border-color: #0e6e7e;}

/* Small buttons for table actions */
.btn-sm {
  padding: 0.35rem 0.6rem; /* Smaller padding */
  font-size: 0.8em; /* Smaller font */
}

/* Icons (placeholders - use SVG or an icon font in a real app) */
[class^="icon-"]::before {
  display: inline-block;
  margin-right: 0.4em;
  /* font-family: "YourIconFont"; */ /* Replace with your icon font if you use one */
}
.icon-add::before { content: '+'; font-weight: bold; } /* Simple text icon */
.icon-barcode::before { content: '▋▋▋'; letter-spacing: -2px;} /* Simple text icon */
.icon-edit::before { content: '✎'; }
.icon-delete::before { content: '🗑️'; }

</style>
