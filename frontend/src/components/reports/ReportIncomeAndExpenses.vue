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
          <span>${{ totalExpensesFromStore.toFixed(2) }}</span>
        </div>
        <div :class="['summary-item', netProfit >= 0 ? 'profit' : 'loss']">
          <p>Resultado Neto (Ingresos - Egresos):</p>
          <span>${{ netProfit.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="details-section">
      <div class="income-details">
        <h4>Detalle de Ingresos (Primeras {{ displayedItemsLimit }} ventas de mockSalesData)</h4>
        <table class="report-table" v-if="filteredMockSales.length > 0">
          <thead><tr><th>Fecha</th><th>Descripción</th><th>Monto ($)</th></tr></thead>
          <tbody>
            <tr v-for="sale in filteredMockSales.slice(0, displayedItemsLimit)" :key="'sale-' + sale.saleId">
              <td>{{ formatDate(sale.saleDate) }}</td>
              <td>Venta: {{ sale.productName }} ({{sale.saleId}})</td>
              <td>{{ sale.totalAmount.toFixed(2) }}</td>
            </tr>
             <tr v-if="filteredMockSales.length > displayedItemsLimit">
              <td colspan="3"><i>... y {{ filteredMockSales.length - displayedItemsLimit }} más registros de ingresos (de mockSalesData).</i></td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay ingresos (de mockSalesData) registrados para este período.</p>
      </div>

      <div class="expenses-details">
        <h4>Detalle de Egresos (Primeros {{ displayedItemsLimit }} egresos del Store)</h4>
        <table class="report-table" v-if="filteredStoreExpenses.length > 0">
          <thead><tr><th>Fecha</th><th>Descripción</th><th>Producto ID</th><th>Monto ($)</th></tr></thead>
          <tbody>
            <tr v-for="expense in filteredStoreExpenses.slice(0, displayedItemsLimit)" :key="'exp-' + expense.id">
              <td>{{ formatDate(expense.date) }}</td>
              <td>{{ expense.reason }}</td>
              <td>{{ expense.productId }}</td>
              <td>{{ expense.quantity ? (getProductPrice(expense.productId) * expense.quantity).toFixed(2) : 'N/A' }}</td>
              <!-- Assuming expense amount is derived from product price * quantity -->
              <!-- If expense has its own 'amount' field, use that: expense.amount.toFixed(2) -->
            </tr>
            <tr v-if="filteredStoreExpenses.length > displayedItemsLimit">
              <td colspan="4"><i>... y {{ filteredStoreExpenses.length - displayedItemsLimit }} más registros de egresos.</i></td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay egresos registrados en el store para este período.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockSales } from '../../data/mockSalesData.js'; // Still using this for income
import { useEgresosStore } from '@/stores/egresosStore.js';
import { useProductStore } from '@/stores/productStore.js'; // To get product details if needed for expense amount

const egresosStore = useEgresosStore();
const productStore = useProductStore();

const allMockSalesData = ref(mockSales); // For income
// Expenses will come from egresosStore.expensesList

const filteredMockSales = ref([]); // For income display
const filteredStoreExpenses = ref([]); // For expenses display from store
const displayedItemsLimit = ref(10);

const today = new Date().toISOString().slice(0, 10);
const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
const startDate = ref(firstDayOfYear);
const endDate = ref(today);

const getProductPrice = (productId) => {
    const product = productStore.getProductById(productId);
    // Assuming price1 is the relevant price. Adjust if another price field is more appropriate.
    return product ? product.price1 : 0;
};


const applyDateFilter = () => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
  end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
  end.setHours(23,59,59,999);

  if (startDate.value && endDate.value) {
    // Filter mock sales for income
    filteredMockSales.value = allMockSalesData.value
      .filter(sale => {
        const saleDate = new Date(sale.saleDate);
        saleDate.setMinutes(saleDate.getMinutes() - saleDate.getTimezoneOffset());
        return saleDate >= start && saleDate <= end;
      })
      .sort((a,b) => new Date(b.saleDate) - new Date(a.saleDate));

    // Filter expenses from egresosStore
    filteredStoreExpenses.value = egresosStore.expensesList
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        // Assuming expense.date is also YYYY-MM-DD
        expenseDate.setMinutes(expenseDate.getMinutes() - expenseDate.getTimezoneOffset());
        return expenseDate >= start && expenseDate <= end;
      })
      .sort((a,b) => new Date(b.date) - new Date(a.date));
  } else {
    filteredMockSales.value = [...allMockSalesData.value].sort((a,b) => new Date(b.saleDate) - new Date(a.date));
    filteredStoreExpenses.value = [...egresosStore.expensesList].sort((a,b) => new Date(b.date) - new Date(a.date));
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

const totalIncome = computed(() => { // From mockSales
  return filteredMockSales.value.reduce((sum, sale) => sum + sale.totalAmount, 0);
});

const totalExpensesFromStore = computed(() => {
  return filteredStoreExpenses.value.reduce((sum, expense) => {
    // Assuming expense amount is product price * quantity.
    // If expense object has its own 'amount' field, use that instead.
    const product = productStore.getProductById(expense.productId);
    const price = product ? product.price1 : 0; // Fallback to 0 if product not found
    const amount = (price * expense.quantity) || 0; // Use existing expense.amount if that's the model
    return sum + amount;
  }, 0);
});

const netProfit = computed(() => {
  return totalIncome.value - totalExpensesFromStore.value;
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

onMounted(() => {
  applyDateFilter();
});

</script>

<style scoped>
.report-container { padding: 15px; background-color: #fff; border: 1px solid #e0e0e0; border-radius: 5px; }
h2 { margin-top: 0; margin-bottom: 20px; text-align: center; }
.filter-button {
    padding: 6px 12px; border: 1px solid #007bff; background-color: #007bff;
    color: white; border-radius: 4px; cursor: pointer; font-size: 0.9em;
}
.filter-button:hover { background-color: #0056b3; }
.filter-button.secondary { background-color: #6c757d; border-color: #6c757d; }
.filter-button.secondary:hover { background-color: #5a6268; }

.report-summary { margin-top: 20px; margin-bottom: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
.report-summary h3 { margin-top: 0; margin-bottom: 15px; text-align: center; color: #333; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.summary-item { padding: 15px; border-radius: 4px; color: white; text-align: center; }
.summary-item p { margin: 0 0 5px 0; font-size: 0.95em; }
.summary-item span { font-size: 1.4em; font-weight: bold; }
.income { background-color: #28a745; }
.expenses { background-color: #dc3545; }
.profit { background-color: #17a2b8; }
.loss { background-color: #ffc107; color: #333;}

.details-section { margin-top: 20px; display: grid; grid-template-columns: 1fr; gap: 30px; } /* Changed to 1fr for stacking */
@media (min-width: 992px) { /* Two columns on larger screens */
  .details-section { grid-template-columns: 1fr 1fr; gap: 20px; }
}

.income-details, .expenses-details { padding: 15px; border: 1px solid #eee; border-radius: 5px; }
.income-details h4, .expenses-details h4 { margin-top: 0; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
/* Table styles inherited via :deep from ReportesView.vue */
</style>
