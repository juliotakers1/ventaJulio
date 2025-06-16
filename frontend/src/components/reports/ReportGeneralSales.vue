<template>
  <div class="report-container">
    <h2>Reporte General de Ventas</h2>

    <div class="report-filters">
      <label for="start-date">Fecha de Inicio:</label>
      <input type="date" id="start-date" v-model="startDate">
      <label for="end-date">Fecha de Fin:</label>
      <input type="date" id="end-date" v-model="endDate" :min="startDate">
      <button @click="applyDateFilter" class="filter-button">Aplicar Filtro</button>
      <button @click="clearDateFilter" class="filter-button secondary">Limpiar Filtro</button>
    </div>

    <div v-if="filteredSales.length > 0">
      <div class="report-totals">
        <p>Total de Ingresos por Ventas: <strong>${{ totalRevenue.toFixed(2) }}</strong></p>
        <p>Número Total de Ventas: <strong>{{ totalSalesCount }}</strong></p>
        <p>Ticket Promedio: <strong>${{ averageTicketPrice.toFixed(2) }}</strong></p>
      </div>

      <table class="report-table">
        <caption>Detalle de Ventas {{ dateRangeText }}</caption>
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Monto Total</th>
            <th>Vendedor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in displayedSales" :key="sale.saleId">
            <td>{{ sale.saleId }}</td>
            <td>{{ formatDate(sale.saleDate) }}</td>
            <td>{{ sale.productName }}</td>
            <td>{{ sale.quantity }}</td>
            <td>${{ sale.unitPrice.toFixed(2) }}</td>
            <td>${{ sale.totalAmount.toFixed(2) }}</td>
            <td>{{ sale.vendorName }}</td>
          </tr>
        </tbody>
      </table>
       <div class="pagination-controls" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
      </div>
    </div>
    <p v-else>No hay datos de ventas para mostrar según el rango de fechas seleccionado.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockSales } from '../../data/mockSalesData.js';

const allSalesData = ref(mockSales);
const filteredSales = ref([...mockSales]); // Initially, all sales

// Date filters
const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const startDate = ref(firstDayOfMonth);
const endDate = ref(today);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(15); // Show 15 sales per page

const applyDateFilter = () => {
  currentPage.value = 1; // Reset to first page on new filter
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    // Adjust dates to ensure correct comparison with YYYY-MM-DD strings
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
    end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
    end.setHours(23,59,59,999); // Ensure end date includes the whole day

    filteredSales.value = allSalesData.value.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      saleDate.setMinutes(saleDate.getMinutes() - saleDate.getTimezoneOffset());
      return saleDate >= start && saleDate <= end;
    });
  } else {
    filteredSales.value = [...allSalesData.value]; // No dates, show all
  }
};

const clearDateFilter = () => {
  currentPage.value = 1;
  startDate.value = firstDayOfMonth; // Reset to default range or make them empty
  endDate.value = today;
  filteredSales.value = [...allSalesData.value];
};

const dateRangeText = computed(() => {
  if (startDate.value && endDate.value) {
    // Check if it's the initial full range to avoid unnecessary text
    const isDefaultRange = startDate.value === firstDayOfMonth && endDate.value === today && filteredSales.value.length === allSalesData.value.length;
    if (isDefaultRange && allSalesData.value.length > 0 && filteredSales.value.length === allSalesData.value.length) {
         // A bit complex to determine if it's truly "all time" vs "default range but all data fits"
        // For simplicity, if filter is applied and matches default, show range.
    }
    return `(desde ${formatDate(startDate.value)} hasta ${formatDate(endDate.value)})`;
  }
  return '(Todas las Fechas)';
});


const totalRevenue = computed(() => {
  return filteredSales.value.reduce((sum, sale) => sum + sale.totalAmount, 0);
});

const totalSalesCount = computed(() => {
  return filteredSales.value.length;
});

const averageTicketPrice = computed(() => {
  return totalSalesCount.value > 0 ? totalRevenue.value / totalSalesCount.value : 0;
});

const totalPages = computed(() => {
  return Math.ceil(filteredSales.value.length / itemsPerPage.value);
});

const displayedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  // Sort by date descending before slicing for pagination
  return filteredSales.value
    .slice() // Create a copy before sorting to not mutate filteredSales
    .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
    .slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Adjust for timezone when creating the date object from YYYY-MM-DD string
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

onMounted(() => {
  applyDateFilter(); // Apply initial date filter (e.g., this month)
});
</script>

<style scoped>
.report-container {
  padding: 15px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
}
h2 {
  margin-top: 0;
  margin-bottom: 15px;
}
.filter-button {
    padding: 6px 12px;
    border: 1px solid #007bff;
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
}
.filter-button:hover {
    background-color: #0056b3;
}
.filter-button.secondary {
    background-color: #6c757d;
    border-color: #6c757d;
}
.filter-button.secondary:hover {
    background-color: #5a6268;
}
.pagination-controls {
  margin-top: 15px;
  text-align: center;
}
.pagination-controls button {
  margin: 0 5px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}
.pagination-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.pagination-controls span {
  margin: 0 10px;
  font-size: 0.9em;
}
/* Other styles inherited via :deep from ReportesView.vue */
</style>
