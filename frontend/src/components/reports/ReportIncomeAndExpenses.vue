<template>
  <div class="report-container">
    <h2>Reporte de Ingresos y Egresos</h2>

    <div class="report-filters">
      <label for="start-date-ie">Fecha de Inicio:</label>
      <input type="date" id="start-date-ie" v-model="startDate">
      <label for="end-date-ie">Fecha de Fin:</label>
      <input type="date" id="end-date-ie" v-model="endDate" :min="startDate">
      <button @click="applyDateFilter" class="filter-button">Aplicar Filtro</button>
      <button @click="clearDateFilter" class="filter-button secondary">Limpiar Filtro</button>
    </div>

    <div class="report-summary">
      <h3>Resumen para el Período: {{ dateRangeText }}</h3>
      <div class="summary-grid">
        <div class="summary-item income">
          <p>Total Ingresos (Ventas):</p>
          <span>${{ totalIncome.toFixed(2) }}</span>
        </div>
        <div class="summary-item expenses">
          <p>Total Egresos:</p>
          <span>${{ totalExpenses.toFixed(2) }}</span>
        </div>
        <div :class="['summary-item', netProfit >= 0 ? 'profit' : 'loss']">
          <p>Resultado Neto (Ingresos - Egresos):</p>
          <span>${{ netProfit.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="details-section">
      <div class="income-details">
        <h4>Detalle de Ingresos (Primeras {{ displayedItemsLimit }} ventas)</h4>
        <table class="report-table" v-if="filteredSales.length > 0">
          <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto ($)</th></tr></thead>
          <tbody>
            <tr v-for="sale in filteredSales.slice(0, displayedItemsLimit)" :key="'sale-' + sale.saleId">
              <td>{{ formatDate(sale.saleDate) }}</td>
              <td>Venta: {{ sale.productName }} ({{sale.saleId}})</td>
              <td>{{ sale.totalAmount.toFixed(2) }}</td>
            </tr>
             <tr v-if="filteredSales.length > displayedItemsLimit">
              <td colspan="3"><i>... y {{ filteredSales.length - displayedItemsLimit }} más registros de ingresos.</i></td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay ingresos registrados para este período.</p>
      </div>

      <div class="expenses-details">
        <h4>Detalle de Egresos (Primeros {{ displayedItemsLimit }} egresos)</h4>
        <table class="report-table" v-if="filteredExpenses.length > 0">
          <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto ($)</th></tr></thead>
          <tbody>
            <tr v-for="expense in filteredExpenses.slice(0, displayedItemsLimit)" :key="'exp-' + expense.expenseId">
              <td>{{ formatDate(expense.expenseDate) }}</td>
              <td>{{ expense.description }}</td>
              <td>{{ expense.amount.toFixed(2) }}</td>
            </tr>
            <tr v-if="filteredExpenses.length > displayedItemsLimit">
              <td colspan="3"><i>... y {{ filteredExpenses.length - displayedItemsLimit }} más registros de egresos.</i></td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay egresos registrados para este período.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockSales } from '../../data/mockSalesData.js';
import { mockExpenses } from '../../data/mockExpensesData.js'; // Assuming this path is correct

const allSalesData = ref(mockSales);
const allExpensesData = ref(mockExpenses);

const filteredSales = ref([]);
const filteredExpenses = ref([]);
const displayedItemsLimit = ref(10); // Limit displayed items in tables for brevity

// Date filters
const today = new Date().toISOString().slice(0, 10);
const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
const startDate = ref(firstDayOfYear);
const endDate = ref(today);


const applyDateFilter = () => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  // Adjust dates to ensure correct comparison with YYYY-MM-DD strings
  start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
  end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
  end.setHours(23,59,59,999); // Ensure end date includes the whole day

  if (startDate.value && endDate.value) {
    filteredSales.value = allSalesData.value
      .filter(sale => {
        const saleDate = new Date(sale.saleDate);
        saleDate.setMinutes(saleDate.getMinutes() - saleDate.getTimezoneOffset());
        return saleDate >= start && saleDate <= end;
      })
      .sort((a,b) => new Date(b.saleDate) - new Date(a.saleDate));

    filteredExpenses.value = allExpensesData.value
      .filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        expenseDate.setMinutes(expenseDate.getMinutes() - expenseDate.getTimezoneOffset());
        return expenseDate >= start && expenseDate <= end;
      })
      .sort((a,b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  } else {
    // If no dates, or invalid range, show all (or handle as error)
    filteredSales.value = [...allSalesData.value].sort((a,b) => new Date(b.saleDate) - new Date(a.saleDate));
    filteredExpenses.value = [...allExpensesData.value].sort((a,b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  }
};

const clearDateFilter = () => {
  startDate.value = firstDayOfYear;
  endDate.value = today;
  applyDateFilter();
};

const dateRangeText = computed(() => {
  if (startDate.value && endDate.value) {
    return `Desde ${formatDate(startDate.value)} hasta ${formatDate(endDate.value)}`;
  }
  return 'Todo el Período';
});

const totalIncome = computed(() => {
  return filteredSales.value.reduce((sum, sale) => sum + sale.totalAmount, 0);
});

const totalExpenses = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0);
});

const netProfit = computed(() => {
  return totalIncome.value - totalExpenses.value;
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Adjust for local display
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

onMounted(() => {
  applyDateFilter(); // Apply initial date filter
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
  margin-bottom: 20px;
  text-align: center;
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

.report-summary {
  margin-top: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}
.report-summary h3 {
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  color: #333;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}
.summary-item {
  padding: 15px;
  border-radius: 4px;
  color: white;
  text-align: center;
}
.summary-item p {
  margin: 0 0 5px 0;
  font-size: 0.95em;
}
.summary-item span {
  font-size: 1.4em;
  font-weight: bold;
}
.income { background-color: #28a745; } /* Green */
.expenses { background-color: #dc3545; } /* Red */
.profit { background-color: #17a2b8; } /* Teal for profit */
.loss { background-color: #ffc107; color: #333;} /* Yellow for loss */


.details-section {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns for income and expenses */
  gap: 20px;
}

.income-details, .expenses-details {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}
.income-details h4, .expenses-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}
/* Table styles inherited via :deep from ReportesView.vue */
</style>
