<template>
  <div class="report-container">
    <h2>Reporte Diario de Ventas</h2>

    <div class="report-filters">
      <label for="month-select">Mes:</label>
      <select id="month-select" v-model="selectedMonth">
        <option value="">Todos los Meses</option>
        <option v-for="(month, index) in monthOptions" :key="index" :value="index + 1">
          {{ month }}
        </option>
      </select>
      <label for="year-select">Año:</label>
      <select id="year-select" v-model="selectedYear">
        <option v-for="year in yearOptions" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
      <button @click="applyFilters" class="filter-button">Aplicar Filtro</button>
    </div>

    <table class="report-table" v-if="dailySales.length > 0">
      <caption>Ventas Diarias para {{ filterPeriodText }}</caption>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Total de Ventas ($)</th>
          <th>Número de Ventas</th>
          <th>Ticket Promedio ($)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(day, index) in displayedDailySales" :key="index">
          <td>{{ formatDate(day.date) }}</td>
          <td>{{ day.totalSales.toFixed(2) }}</td>
          <td>{{ day.numberOfSales }}</td>
          <td>{{ day.averageTicket.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
     <div class="pagination-controls" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
      </div>
    <p v-else>No hay datos de ventas para mostrar según el período seleccionado.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockSales } from '../../data/mockSalesData.js';

const allSalesData = ref(mockSales);
const dailySales = ref([]); // This will hold the processed daily summaries

const currentYear = new Date().getFullYear();
const selectedMonth = ref(new Date().getMonth() + 1); // Default to current month
const selectedYear = ref(currentYear);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(15); // Show 15 days per page


const monthOptions = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const yearOptions = computed(() => {
  const years = new Set(allSalesData.value.map(sale => new Date(sale.saleDate).getFullYear()));
  return Array.from(years).sort((a, b) => b - a); // Descending order
});

const processDailySales = () => {
  currentPage.value = 1; // Reset pagination
  let filteredByPeriod = allSalesData.value;

  if (selectedMonth.value && selectedYear.value) {
    filteredByPeriod = allSalesData.value.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      // Adjust for timezone issues with YYYY-MM-DD
      saleDate.setMinutes(saleDate.getMinutes() + saleDate.getTimezoneOffset());
      return saleDate.getMonth() + 1 === selectedMonth.value && saleDate.getFullYear() === selectedYear.value;
    });
  } else if (selectedYear.value) { // Only year is selected
     filteredByPeriod = allSalesData.value.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      saleDate.setMinutes(saleDate.getMinutes() + saleDate.getTimezoneOffset());
      return saleDate.getFullYear() === selectedYear.value;
    });
  }
  // If only month is selected, it might be too broad without a year, so we prefer year to be present.

  const groupedByDay = filteredByPeriod.reduce((acc, sale) => {
    const dateStr = sale.saleDate; // YYYY-MM-DD string
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        totalSales: 0,
        numberOfSales: 0,
      };
    }
    acc[dateStr].totalSales += sale.totalAmount;
    acc[dateStr].numberOfSales += 1;
    return acc;
  }, {});

  dailySales.value = Object.values(groupedByDay)
    .map(day => ({
      ...day,
      averageTicket: day.numberOfSales > 0 ? day.totalSales / day.numberOfSales : 0,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
};

const applyFilters = () => {
  processDailySales();
};

const filterPeriodText = computed(() => {
  if (selectedMonth.value && selectedYear.value) {
    return `${monthOptions[selectedMonth.value - 1]} de ${selectedYear.value}`;
  }
  if (selectedYear.value) {
    return `el año ${selectedYear.value}`;
  }
  return 'todo el período';
});

const totalPages = computed(() => {
  return Math.ceil(dailySales.value.length / itemsPerPage.value);
});

const displayedDailySales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return dailySales.value.slice(start, end);
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
    // Date string is already YYYY-MM-DD, we want to display it as DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

onMounted(() => {
  if (yearOptions.value.length > 0 && !yearOptions.value.includes(selectedYear.value)) {
    selectedYear.value = yearOptions.value[0]; // Default to the latest year if current year has no sales
  }
  processDailySales();
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
