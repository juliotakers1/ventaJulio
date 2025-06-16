<template>
  <div class="reportes-view">
    <header class="report-header">
      <h1>Central de Reportes</h1>
      <p>Seleccione un reporte de la lista para visualizarlo.</p>
    </header>

    <nav class="report-selector">
      <ul>
        <li>
          <button @click="showReport('MonthlySalesByVendor', ReportMonthlySalesByVendor)"
                  :class="{ active: selectedReportName === 'MonthlySalesByVendor' }">
            Ventas Mensuales por Vendedor
          </button>
        </li>
        <li>
          <button @click="showReport('GeneralSales', ReportGeneralSales)"
                  :class="{ active: selectedReportName === 'GeneralSales' }">
            Reporte General de Ventas
          </button>
        </li>
        <li>
          <button @click="showReport('DailySales', ReportDailySales)"
                  :class="{ active: selectedReportName === 'DailySales' }">
            Reporte Diario de Ventas
          </button>
        </li>
        <li>
          <button @click="showReport('IncomeAndExpenses', ReportIncomeAndExpenses)"
                  :class="{ active: selectedReportName === 'IncomeAndExpenses' }">
            Reporte de Ingresos y Egresos
          </button>
        </li>
      </ul>
        <button v-if="currentReportComponent" @click="clearReportView" class="clear-report-button">
            Limpiar Vista de Reporte
        </button>
    </nav>

    <div class="report-content-area">
      <div v-if="!currentReportComponent" class="no-report-selected">
        <p>Por favor, seleccione un reporte para comenzar.</p>
      </div>
      <keep-alive>
        <component :is="currentReportComponent" v-if="currentReportComponent"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue';

// Import report components
import ReportMonthlySalesByVendor from '../components/reports/ReportMonthlySalesByVendor.vue';
import ReportGeneralSales from '../components/reports/ReportGeneralSales.vue';
import ReportDailySales from '../components/reports/ReportDailySales.vue';
import ReportIncomeAndExpenses from '../components/reports/ReportIncomeAndExpenses.vue';

const selectedReportName = ref('');
const currentReportComponent = shallowRef(null);

const showReport = (reportName, reportComponent) => {
  selectedReportName.value = reportName;
  currentReportComponent.value = reportComponent;
};

const clearReportView = () => {
  selectedReportName.value = '';
  currentReportComponent.value = null;
};

</script>

<style scoped>
.reportes-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.report-header h1 {
  margin: 0 0 5px 0;
  color: #333;
}
.report-header p {
  margin: 0;
  color: #555;
  font-size: 0.95em;
}

.report-selector {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.report-selector ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
  gap: 10px; /* Spacing between buttons */
  justify-content: center;
}

.report-selector li button {
  padding: 10px 15px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-size: 0.9em;
  font-weight: 500;
}

.report-selector li button:hover {
  background-color: #007bff;
  color: white;
}

.report-selector li button.active {
  background-color: #0056b3; /* Darker blue for active */
  color: white;
  border-color: #0056b3;
}
.clear-report-button {
  margin-top: 15px;
  padding: 8px 15px;
  border: 1px solid #6c757d;
  background-color: #6c757d;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  display: block; /* Make it a block to center it if needed, or use flex on parent */
  margin-left: auto;
  margin-right: auto;
}
.clear-report-button:hover {
    background-color: #5a6268;
}


.report-content-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  min-height: 300px; /* Give some minimum height */
  display: flex; /* To center the no-report-selected message */
  justify-content: center;
  align-items: center;
}
.report-content-area > div { /* Ensure report component takes full width */
    width: 100%;
    align-self: flex-start; /* Align report to top */
}


.no-report-selected {
  text-align: center;
  color: #777;
  font-style: italic;
}

/* Styling for individual reports will be within their components,
   but some global report styles could go here if needed */
:deep(.report-table) { /* Using :deep to style tables within child components */
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 0.9em;
}
:deep(.report-table th), :deep(.report-table td) {
  border: 1px solid #ddd;
  padding: 8px 10px;
  text-align: left;
}
:deep(.report-table th) {
  background-color: #f2f2f2;
  font-weight: bold;
}
:deep(.report-table tr:nth-child(even)) {
  background-color: #f9f9f9;
}
:deep(.report-table caption) {
  caption-side: top;
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
  color: #333;
}
:deep(.report-filters) {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
    display: flex;
    gap: 15px;
    align-items: center;
}
:deep(.report-filters label) {
    font-weight: bold;
    margin-right: 5px;
}
:deep(.report-filters input[type="date"]), :deep(.report-filters select) {
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
:deep(.report-totals) {
    margin-top: 15px;
    padding: 10px;
    background-color: #e9ecef;
    border-radius: 4px;
}
:deep(.report-totals p) {
    margin: 5px 0;
    font-size: 1em;
    font-weight: bold;
}

</style>
