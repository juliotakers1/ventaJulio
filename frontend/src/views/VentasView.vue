<template>
  <div class="ventas-view">
    <aside class="sidebar-filters">
      <!-- E-Codigo Search -->
      <div class="filter-group">
        <label for="search-ecode">Buscar por E-codigo:</label>
        <input type="text" id="search-ecode" v-model="searchEcodeQuery" @input="searchByEcode" placeholder="Ejem: E001">
      </div>

      <!-- Brand A-Z Filter (Conceptual) -->
      <div class="filter-group">
        <label>Filtrar Marca por Letra:</label>
        <div class="az-filter">
          <span v-for="letter in alphabet" :key="letter" @click="filterBrandByLetter(letter)" class="az-letter">
            {{ letter }}
          </span>
        </div>
      </div>

      <!-- Cascading Filters -->
      <div class="filter-group">
        <label for="brands">Marca:</label>
        <select id="brands" v-model="selectedBrand" @change="onBrandChange">
          <option value="">Todas las Marcas</option>
          <option v-for="brand in brandsList" :key="brand" :value="brand">{{ brand }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="styles">Estilo:</label>
        <select id="styles" v-model="selectedStyle" @change="onStyleChange" :disabled="!selectedBrand">
          <option value="">Todos los Estilos</option>
          <option v-for="style in stylesList" :key="style" :value="style">{{ style }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="colors">Color:</label>
        <select id="colors" v-model="selectedColor" @change="onColorChange" :disabled="!selectedStyle">
          <option value="">Todos los Colores</option>
          <option v-for="color in colorsList" :key="color" :value="color">{{ color }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="sizes">Talla:</label>
        <select id="sizes" v-model="selectedSize" @change="onSizeChange" :disabled="!selectedColor">
          <option value="">Todas las Tallas</option>
          <option v-for="size in sizesList" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
        <button @click="resetFilters" class="reset-button">Limpiar Filtros</button>
    </aside>

    <main class="content-area">
      <div class="product-results-area">
        <h3>Resultados de Productos</h3>
        <div v-if="isLoading" class="loading">Cargando...</div>
        <div v-if="!isLoading && filteredProducts.length === 0 && !searchEcodeQuery" class="no-results">
          Seleccione filtros para ver productos.
        </div>
        <div v-if="!isLoading && filteredProducts.length === 0 && searchEcodeQuery" class="no-results">
          No hay productos con el E-Codigo: {{ searchEcodeQuery }}
        </div>
        <ul v-if="!isLoading && filteredProducts.length > 0" class="product-list">
          <li v-for="product in filteredProducts" :key="product.id" @click="selectProduct(product)"
              :class="{ selected: selectedProduct && selectedProduct.id === product.id }">
            {{ product.brand }} - {{ product.style }} - {{ product.color }} - Talla: {{ product.size }} (E-code: {{ product.ecode }})
          </li>
        </ul>
      </div>

      <div class="product-details-area" v-if="selectedProduct">
        <h3>Detalles del Producto Seleccionado</h3>
        <p><strong>E-Codigo:</strong> {{ selectedProduct.ecode }}</p>
        <p><strong>Marca:</strong> {{ selectedProduct.brand }}</p>
        <p><strong>Estilo:</strong> {{ selectedProduct.style }}</p>
        <p><strong>Color:</strong> {{ selectedProduct.color }}</p>
        <p><strong>Talla:</strong> {{ selectedProduct.size }}</p>
        <p><strong>Stock:</strong> {{ selectedProduct.stock }}</p>

        <h4>Precios:</h4>
        <div class="price-item">
          <p><strong>{{ selectedProduct.price1_description }}:</strong> ${{ selectedProduct.price1 }}</p>
        </div>
        <div class="price-item">
          <p><strong>{{ selectedProduct.price2_description }}:</strong> ${{ selectedProduct.price2 }}</p>
        </div>
        <div class="price-item">
          <p><strong>{{ selectedProduct.lastAuthPrice_description }}:</strong> ${{ selectedProduct.lastAuthPrice }}</p>
        </div>
        <button @click="printTicket" class="print-button">Imprimir Ticket</button>
      </div>
       <div class="product-details-area" v-else>
        <h3>Detalles del Producto Seleccionado</h3>
        <p>Seleccione un producto de la lista para ver sus detalles y precios.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockProducts, getUniqueValues, getStylesForBrand, getColorsForBrandStyle, getSizesForBrandStyleColor } from '../data/mockProducts.js';

// Search
const searchEcodeQuery = ref('');
const eCodeResults = ref([]); // Not directly used for display yet, combined into filteredProducts

// A-Z conceptual filter
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const selectedLetter = ref('');

// Filter selections
const selectedBrand = ref('');
const selectedStyle = ref('');
const selectedColor = ref('');
const selectedSize = ref('');

// Filter option lists
const brandsList = ref([]);
const stylesList = ref([]);
const colorsList = ref([]);
const sizesList = ref([]);

// Product display
const selectedProduct = ref(null);
const isLoading = ref(false); // For simulated async operations

// Populate initial brand list
onMounted(() => {
  brandsList.value = getUniqueValues(mockProducts, 'brand');
});

const filterProducts = () => {
  isLoading.value = true;
  // Simulate async delay
  setTimeout(() => {
    let products = mockProducts;

    if (searchEcodeQuery.value) {
      products = products.filter(p => p.ecode.toLowerCase().includes(searchEcodeQuery.value.toLowerCase()));
    } else { // Only apply cascade filters if not searching by ecode (or combine logic as needed)
      if (selectedLetter.value) {
        products = products.filter(p => p.brand.toUpperCase().startsWith(selectedLetter.value));
      }
      if (selectedBrand.value) {
        products = products.filter(p => p.brand === selectedBrand.value);
      }
      if (selectedStyle.value) {
        products = products.filter(p => p.style === selectedStyle.value);
      }
      if (selectedColor.value) {
        products = products.filter(p => p.color === selectedColor.value);
      }
      if (selectedSize.value) {
        products = products.filter(p => p.size === selectedSize.value);
      }
    }
    eCodeResults.value = products; // Keep this for potential direct ecode search display
    selectedProduct.value = null; // Clear selected product when filters change
    isLoading.value = false;
  }, 300);
};

const filteredProducts = computed(() => {
  // This computed property will react to changes in any of the dependent refs
  // For now, it directly reflects eCodeResults which is updated by filterProducts
  // This could be more complex if eCode search and filter selections need to be combined differently
  return eCodeResults.value;
});


const searchByEcode = () => {
  // Reset other filters when searching by e-code for simplicity
  selectedBrand.value = '';
  selectedStyle.value = '';
  selectedColor.value = '';
  selectedSize.value = '';
  selectedLetter.value = '';
  filterProducts();
};

const filterBrandByLetter = (letter) => {
  selectedLetter.value = letter;
  // Reset e-code search and subsequent filters
  searchEcodeQuery.value = '';
  selectedBrand.value = ''; // Potentially auto-select first brand starting with letter or just filter
  selectedStyle.value = '';
  selectedColor.value = '';
  selectedSize.value = '';
  filterProducts();
};

const onBrandChange = () => {
  selectedStyle.value = '';
  selectedColor.value = '';
  selectedSize.value = '';
  stylesList.value = selectedBrand.value ? getStylesForBrand(mockProducts, selectedBrand.value) : [];
  colorsList.value = [];
  sizesList.value = [];
  searchEcodeQuery.value = ''; // Clear ecode search
  selectedLetter.value = ''; // Clear letter filter
  filterProducts();
};

const onStyleChange = () => {
  selectedColor.value = '';
  selectedSize.value = '';
  colorsList.value = selectedStyle.value ? getColorsForBrandStyle(mockProducts, selectedBrand.value, selectedStyle.value) : [];
  sizesList.value = [];
  filterProducts();
};

const onColorChange = () => {
  selectedSize.value = '';
  sizesList.value = selectedColor.value ? getSizesForBrandStyleColor(mockProducts, selectedBrand.value, selectedStyle.value, selectedColor.value) : [];
  filterProducts();
};

const onSizeChange = () => {
  filterProducts();
};

const selectProduct = (product) => {
  selectedProduct.value = product;
};

const printTicket = () => {
  if (selectedProduct.value) {
    console.log("Ticket printed:", {
      product: selectedProduct.value,
      // quantity: 1, // Example: Add quantity if applicable
      totalPrice: selectedProduct.value.price1 // Example: Use a specific price
    });
    alert(`Ticket impreso para: ${selectedProduct.value.ecode}`);
  } else {
    alert("Por favor, seleccione un producto primero.");
  }
};

const resetFilters = () => {
  searchEcodeQuery.value = '';
  selectedBrand.value = '';
  selectedStyle.value = '';
  selectedColor.value = '';
  selectedSize.value = '';
  selectedLetter.value = '';
  stylesList.value = [];
  colorsList.value = [];
  sizesList.value = [];
  eCodeResults.value = []; // Clear results
  selectedProduct.value = null;
  // brandsList.value = getUniqueValues(mockProducts, 'brand'); // Already populated onMounted
};

// Initial call to populate products (e.g., show all or based on default filters)
onMounted(() => {
  brandsList.value = getUniqueValues(mockProducts, 'brand');
  // filterProducts(); // Optionally load all products initially, or wait for user interaction
});

</script>

<style scoped>
.ventas-view {
  display: flex;
  height: calc(100vh - 100px); /* Adjust based on layout header/footer */
}

.sidebar-filters {
  width: 250px;
  padding: 15px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
}

.filter-group input[type="text"],
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

.az-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.az-letter {
  padding: 5px 8px;
  border: 1px solid #007bff;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s, color 0.2s;
}

.az-letter:hover,
.az-letter.active { /* Add 'active' class logic if needed */
  background-color: #007bff;
  color: white;
}

.reset-button {
  width: 100%;
  padding: 10px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
.reset-button:hover {
  background-color: #5a6268;
}

.content-area {
  flex-grow: 1;
  display: flex;
  padding: 15px;
  overflow-y: auto; /* Added for scrolling if content overflows */
}

.product-results-area {
  flex: 2; /* Takes 2/3 of the space */
  padding-right: 15px;
  border-right: 1px solid #eee; /* Optional: visual separation */
  overflow-y: auto;
  max-height: calc(100vh - 130px); /* Adjust based on other elements */
}

.product-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 200px); /* Example height, adjust as needed */
}

.product-list li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 0.9em;
}

.product-list li:hover {
  background-color: #f0f0f0;
}

.product-list li.selected {
  background-color: #007bff;
  color: white;
}

.loading, .no-results {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.product-details-area {
  flex: 1; /* Takes 1/3 of the space */
  padding-left: 15px;
    overflow-y: auto;
  max-height: calc(100vh - 130px); /* Adjust based on other elements */
}

.product-details-area h3, .product-results-area h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.product-details-area p {
  margin-bottom: 8px;
  font-size: 0.95em;
}
.price-item {
  margin-bottom: 10px;
  padding: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
}
.price-item p {
  margin: 0;
}

.print-button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.print-button:hover {
  background-color: #218838;
}
</style>
