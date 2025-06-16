<template>
  <div class="ventas-view"> <!-- No card-base here, full height view -->
    <aside class="sidebar-filters card-base"> <!-- Filters section as a card -->
      <h4><i class="icon-filter"></i> Filtros de Búsqueda</h4>
      <div class="filter-group">
        <label for="search-ecode">Buscar por E-codigo:</label>
        <input type="text" id="search-ecode" v-model="searchEcodeQuery" @input="searchByEcode" placeholder="Ejem: E001">
      </div>

      <div class="filter-group">
        <label>Marca por Letra:</label>
        <div class="az-filter">
          <span v-for="letter in alphabet" :key="letter" @click="filterBrandByLetter(letter)"
                class="az-letter" :class="{'active': selectedLetter === letter}">
            {{ letter }}
          </span>
        </div>
      </div>

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
      <button @click="resetFilters" class="action-button secondary-button full-width-button">
        <i class="icon-clear"></i> Limpiar Filtros
      </button>
    </aside>

    <main class="content-area">
      <div class="product-results-area card-base"> <!-- Results as a card -->
        <div class="results-header">
            <h3><i class="icon-list"></i> Resultados de Productos ({{ filteredProducts.length }})</h3>
            <div class="view-mode-toggle" v-if="filteredProducts.length > 0">
                <button @click="viewMode = 'list'" :class="{'active': viewMode === 'list'}" class="action-button btn-sm secondary-button"><i class="icon-list-view"></i> Lista</button>
                <button @click="viewMode = 'grid'" :class="{'active': viewMode === 'grid'}" class="action-button btn-sm secondary-button"><i class="icon-grid-view"></i> Cuadrícula</button>
            </div>
        </div>
        <div v-if="isLoading" class="loading-message"><p>Cargando productos...</p></div>
        <div v-else-if="filteredProducts.length === 0" class="no-results-message">
          <p v-if="searchEcodeQuery">No hay productos con el E-Codigo: "{{ searchEcodeQuery }}"</p>
          <p v-else>No se encontraron productos con los filtros seleccionados. Intente ampliar su búsqueda.</p>
        </div>
        <div v-else :class="viewMode === 'grid' ? 'product-grid' : 'product-list'">
          <div v-for="product in paginatedViewProducts" :key="product.id"
               @click="selectProduct(product)"
               :class="['product-item', {'selected': selectedProduct && selectedProduct.id === product.id}, viewMode === 'grid' ? 'product-grid-item' : 'product-list-item']">
            <div class="product-item-image-placeholder" v-if="viewMode === 'grid'">
                <i class="icon-placeholder-img"></i> <!-- Placeholder for image -->
            </div>
            <div class="product-item-info">
                <p class="product-name"><strong>{{ product.brand }}</strong> - {{ product.style }}</p>
                <p class="product-details">{{ product.color }} / Talla: {{ product.size }}</p>
                <p class="product-ecode">E-code: {{ product.ecode }} / Stock: {{product.stock}}</p>
                 <p class="product-price-main" v-if="viewMode === 'grid'">${{ product.price1.toFixed(2) }}</p>
            </div>
          </div>
        </div>
         <div class="pagination-controls mt-3" v-if="totalProductPages > 1 && filteredProducts.length > 0">
            <button @click="prevProductPage" :disabled="currentProductPage === 1" class="action-button secondary-button btn-sm">Anterior</button>
            <span>Página {{ currentProductPage }} de {{ totalProductPages }}</span>
            <button @click="nextProductPage" :disabled="currentProductPage === totalProductPages" class="action-button secondary-button btn-sm">Siguiente</button>
        </div>
      </div>

      <div class="selected-product-details-area card-base"> <!-- Selected product details as a card -->
        <h3><i class="icon-details"></i> Detalles del Producto</h3>
        <div v-if="selectedProduct" class="product-details-content">
          <p><strong>E-Codigo:</strong> {{ selectedProduct.ecode }}</p>
          <p><strong>Marca:</strong> {{ selectedProduct.brand }}</p>
          <p><strong>Estilo:</strong> {{ selectedProduct.style }}</p>
          <p><strong>Color:</strong> {{ selectedProduct.color }}</p>
          <p><strong>Talla:</strong> {{ selectedProduct.size }}</p>
          <p><strong>Stock Disponible:</strong> {{ selectedProduct.stock }}</p>

          <div class="price-section">
            <h4>Precios:</h4>
            <div class="price-item">
              <p><strong>{{ selectedProduct.price1_description }}:</strong> ${{ selectedProduct.price1.toFixed(2) }}</p>
            </div>
            <div class="price-item">
              <p><strong>{{ selectedProduct.price2_description }}:</strong> ${{ selectedProduct.price2.toFixed(2) }}</p>
            </div>
            <div class="price-item">
              <p><strong>{{ selectedProduct.lastAuthPrice_description }}:</strong> ${{ selectedProduct.lastAuthPrice.toFixed(2) }}</p>
            </div>
          </div>
          <button @click="printTicket" class="action-button success-button full-width-button mt-3">
            <i class="icon-print"></i> Imprimir Ticket
          </button>
        </div>
        <div v-else class="no-product-selected">
          <p>Seleccione un producto de la lista para ver sus detalles y precios.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Script largely unchanged, but added pagination for product results
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/productStore.js'; // Using product store

const productStore = useProductStore();

const searchEcodeQuery = ref('');
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const selectedLetter = ref('');
const selectedBrand = ref('');
const selectedStyle = ref('');
const selectedColor = ref('');
const selectedSize = ref('');

const brandsList = ref([]);
const stylesList = ref([]);
const colorsList = ref([]);
const sizesList = ref([]);

const selectedProduct = ref(null);
const isLoading = ref(false);
const viewMode = ref('list'); // 'list' or 'grid'

// Pagination for product results
const currentProductPage = ref(1);
const productsPerPage = ref(10); // For list view; grid might show more effectively with different numbers

const allMockProducts = computed(() => productStore.products); // Get products from store

const filteredProducts = computed(() => {
  isLoading.value = true; // Ideally false after timeout, but for sync, this is tricky
  let products = allMockProducts.value;

  if (searchEcodeQuery.value) {
    products = products.filter(p => p.ecode.toLowerCase().includes(searchEcodeQuery.value.toLowerCase()));
  } else {
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
  isLoading.value = false;
  return products;
});

watch(filteredProducts, () => {
    currentProductPage.value = 1; // Reset page on filter change
});


const totalProductPages = computed(() => {
    const items = viewMode.value === 'grid' ? 12 : 10; // Example: 12 for grid, 10 for list
    return Math.ceil(filteredProducts.value.length / items);
});

const paginatedViewProducts = computed(() => {
    if (currentProductPage.value > totalProductPages.value && totalProductPages.value > 0) {
        currentProductPage.value = totalProductPages.value;
    }
    const items = viewMode.value === 'grid' ? 12 : 10;
    const start = (currentProductPage.value - 1) * items;
    const end = start + items;
    return filteredProducts.value.slice(start, end);
});

const nextProductPage = () => { if (currentProductPage.value < totalProductPages.value) currentProductPage.value++; };
const prevProductPage = () => { if (currentProductPage.value > 1) currentProductPage.value--; };


const populateFilterLists = () => {
  brandsList.value = [...new Set(allMockProducts.value.map(p => p.brand))].sort();
  // Other lists (styles, colors, sizes) will populate based on selections
};

onMounted(() => {
  populateFilterLists();
  // No initial filterProducts call needed as computed properties handle it.
});

const searchByEcode = () => { /* reset other filters */ resetFilters(false); selectedProduct.value = null; };
const filterBrandByLetter = (letter) => { selectedLetter.value = (selectedLetter.value === letter ? '' : letter); searchEcodeQuery.value = ''; selectedBrand.value = ''; onBrandChange(); };

const onBrandChange = () => {
  selectedStyle.value = ''; selectedColor.value = ''; selectedSize.value = '';
  if (selectedBrand.value) {
    stylesList.value = [...new Set(allMockProducts.value.filter(p => p.brand === selectedBrand.value).map(p => p.style))].sort();
  } else {
    stylesList.value = []; // Or all styles if brand is cleared
  }
  colorsList.value = []; sizesList.value = []; selectedProduct.value = null;
  if (!selectedBrand.value) selectedLetter.value = ''; // Clear letter if brand is cleared
};
const onStyleChange = () => {
  selectedColor.value = ''; selectedSize.value = '';
  if (selectedStyle.value) {
    colorsList.value = [...new Set(allMockProducts.value.filter(p => p.brand === selectedBrand.value && p.style === selectedStyle.value).map(p => p.color))].sort();
  } else {
    colorsList.value = [];
  }
  sizesList.value = []; selectedProduct.value = null;
};
const onColorChange = () => {
  selectedSize.value = '';
  if (selectedColor.value) {
    sizesList.value = [...new Set(allMockProducts.value.filter(p => p.brand === selectedBrand.value && p.style === selectedStyle.value && p.color === selectedColor.value).map(p => p.size))].sort();
  } else {
    sizesList.value = [];
  }
  selectedProduct.value = null;
};
const onSizeChange = () => { selectedProduct.value = null; }; // Just trigger re-filter

const selectProduct = (product) => { selectedProduct.value = product; };
const printTicket = () => {
  if (selectedProduct.value) {
    console.log("Ticket impreso:", { product: selectedProduct.value, price: selectedProduct.value.price1 });
    alert(`Ticket impreso para: ${selectedProduct.value.ecode}`);
  } else {
    alert("Seleccione un producto.");
  }
};
const resetFilters = (fullReset = true) => {
  if(fullReset) searchEcodeQuery.value = '';
  selectedBrand.value = ''; selectedStyle.value = ''; selectedColor.value = ''; selectedSize.value = ''; selectedLetter.value = '';
  stylesList.value = []; colorsList.value = []; sizesList.value = [];
  selectedProduct.value = null;
  currentProductPage.value = 1; // Reset pagination
};

</script>

<style scoped>
.ventas-view {
  display: flex;
  height: calc(100vh - 60px); /* Adjust based on actual header height from DashboardLayout */
  gap: 1.5rem; /* Gap between sidebar and main content */
  padding: 1.5rem; /* Padding for the whole view */
  background-color: var(--bg-main); /* Consistent background */
}

.sidebar-filters {
  width: 280px; /* Fixed width for filter sidebar */
  flex-shrink: 0; /* Prevent shrinking */
  /* padding: 1.5rem; */ /* From .card-base */
  overflow-y: auto; /* Scroll if filters overflow */
  height: 100%; /* Fill height */
}
.sidebar-filters h4 {
    font-size: 1.2em;
    margin-bottom: 1rem;
    color: var(--text-dark);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}
@media (prefers-color-scheme: dark) {
  .sidebar-filters h4 { color: var(--dm-text-dark); border-bottom-color: var(--dm-border-color); }
}


.filter-group { margin-bottom: 1.25rem; }
.filter-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9em; }
.az-filter { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.az-letter {
  padding: 0.3rem 0.5rem; border: 1px solid var(--primary-color); color: var(--primary-color);
  border-radius: var(--border-radius-base); cursor: pointer; font-size: 0.85em;
  transition: background-color 0.2s, color 0.2s;
}
.az-letter:hover, .az-letter.active { background-color: var(--primary-color); color: var(--text-light); }
.full-width-button { width: 100%; margin-top: 1rem;}

.content-area {
  flex-grow: 1;
  display: flex;
  gap: 1.5rem; /* Gap between results and details */
  overflow: hidden; /* Prevent content area from causing page scrollbars */
  height: 100%;
}

.product-results-area {
  flex: 3; /* Takes more space */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Scroll results independently */
  height: 100%;
}
.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}
.results-header h3 { margin: 0; font-size: 1.2em; }
@media (prefers-color-scheme: dark) {
  .results-header { border-bottom-color: var(--dm-border-color); }
}
.view-mode-toggle button { margin-left: 0.5rem; }


.product-list, .product-grid { overflow-y: auto; flex-grow: 1; } /* Ensure this part scrolls if needed */
.product-list-item {
  padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer;
  transition: background-color 0.15s ease;
}
.product-list-item:hover { background-color: #e9ecef; } /* Lighter hover */
.product-list-item.selected { background-color: var(--primary-color); color: var(--text-light); }
.product-list-item.selected .product-details, .product-list-item.selected .product-ecode, .product-list-item.selected .product-name { color: var(--text-light); }
@media (prefers-color-scheme: dark) {
  .product-list-item { border-bottom-color: var(--dm-border-color); }
  .product-list-item:hover { background-color: #3a3f44; }
  .product-list-item.selected { background-color: var(--primary-color); }
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Responsive grid */
    gap: 1rem;
    padding-top: 0.5rem; /* Space from header */
}
.product-grid-item {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-base);
    padding: 0.75rem;
    cursor: pointer;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    background-color: var(--bg-card); /* Ensure items have card background */
}
.product-grid-item:hover { box-shadow: var(--box-shadow); transform: translateY(-2px); }
.product-grid-item.selected {
    box-shadow: 0 0 0 2px var(--primary-color), var(--box-shadow);
    border-color: var(--primary-color);
}
.product-item-image-placeholder {
    height: 120px; background-color: #f0f0f0; display: flex;
    align-items: center; justify-content: center; border-radius: calc(var(--border-radius-base) - 1px); margin-bottom: 0.75rem;
}
.product-item-image-placeholder i { font-size: 2.5em; color: #ccc; }
@media (prefers-color-scheme: dark) {
    .product-grid-item { border-color: var(--dm-border-color); background-color: var(--dm-bg-card); }
    .product-item-image-placeholder { background-color: #3a3f44; }
    .product-item-image-placeholder i { color: #555; }
}


.product-item-info .product-name { font-size: 0.95em; margin-bottom: 0.25rem; }
.product-item-info .product-details { font-size: 0.8em; color: var(--text-muted); margin-bottom: 0.25rem; }
.product-item-info .product-ecode { font-size: 0.8em; color: #888; margin-bottom: 0; }
.product-item-info .product-price-main { font-size: 1.1em; font-weight: bold; color: var(--primary-color); margin-top: 0.5rem;}


.loading-message, .no-results-message, .no-product-selected { text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic; }
@media (prefers-color-scheme: dark) {
  .loading-message, .no-results-message, .no-product-selected { color: var(--dm-text-dark); opacity: 0.7; }
}


.selected-product-details-area {
  flex: 2; /* Smaller part */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Scroll details independently */
  height: 100%;
}
.selected-product-details-area h3 { font-size: 1.2em; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;}
@media (prefers-color-scheme: dark) {
  .selected-product-details-area h3 { border-bottom-color: var(--dm-border-color); }
}

.product-details-content p { margin-bottom: 0.6rem; font-size: 0.95em; }
.product-details-content strong { font-weight: 600; }
.price-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
.price-section h4 { font-size: 1.1em; margin-bottom: 0.75rem; }
.price-item { margin-bottom: 0.5rem; padding: 0.5rem; background-color: var(--bg-light); border-radius: var(--border-radius-base); }
.price-item p { margin: 0; font-size: 0.9em; }
@media (prefers-color-scheme: dark) {
  .price-section { border-top-color: var(--dm-border-color); }
  .price-item { background-color: var(--dm-bg-main); }
}


/* Button styles from global, specific type (primary, danger, etc.) are applied in template */
.primary-button { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--text-light); }
.secondary-button { background-color: var(--secondary-color); border-color: var(--secondary-color); color: var(--text-light); }
.success-button { background-color: var(--success-color); border-color: var(--success-color); color: var(--text-light); }
.btn-sm { padding: 0.35rem 0.6rem; font-size: 0.8em; }

/* Icons */
[class^="icon-"]::before { display: inline-block; margin-right: 0.5em; font-style: normal; }
.icon-filter::before { content: '🔍'; }
.icon-clear::before { content: '❌'; }
.icon-list::before { content: '📄'; }
.icon-details::before { content: 'ℹ️'; }
.icon-print::before { content: '🖨️'; }
.icon-list-view::before { content: '☰';}
.icon-grid-view::before { content: '㗊';} /* Character U+258B, might need better icon */
.icon-placeholder-img::before { content: '🖼️'; }

</style>
