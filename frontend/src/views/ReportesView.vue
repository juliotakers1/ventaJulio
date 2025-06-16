<template>
  <div class="reportes-view card-base"> <!-- Use card-base for overall padding and background -->
    <header class="view-header">
      <h2>Central de Reportes</h2>
      <p>Seleccione un reporte de la lista para visualizarlo.</p>
    </header>

    <nav class="report-selector">
      <ul>
        <li>
          <button @click="showReport('MonthlySalesByVendor', ReportMonthlySalesByVendor)"
                  :class="{ active: selectedReportName === 'MonthlySalesByVendor' }"
                  class="action-button secondary-button"> <!-- Themed button -->
            Ventas Mensuales por Vendedor
          </button>
        </li>
        <li>
          <button @click="showReport('GeneralSales', ReportGeneralSales)"
                  :class="{ active: selectedReportName === 'GeneralSales' }"
                  class="action-button secondary-button">
            Reporte General de Ventas
          </button>
        </li>
        <li>
          <button @click="showReport('DailySales', ReportDailySales)"
                  :class="{ active: selectedReportName === 'DailySales' }"
                  class="action-button secondary-button">
            Reporte Diario de Ventas
          </button>
        </li>
        <li>
          <button @click="showReport('IncomeAndExpenses', ReportIncomeAndExpenses)"
                  :class="{ active: selectedReportName === 'IncomeAndExpenses' }"
                  class="action-button secondary-button">
            Reporte de Ingresos y Egresos
          </button>
        </li>
      </ul>
      <button v-if="currentReportComponent" @click="clearReportView" class="action-button danger-button-outline mt-2">
        <i class="icon-clear"></i> Limpiar Vista de Reporte
      </button>
    </nav>

    <div class="report-content-area card-base mt-3"> <!-- Inner card for report content -->
      <div v-if="!currentReportComponent" class="no-report-selected">
        <i class="icon-reports-placeholder"></i>
        <p>Por favor, seleccione un reporte para comenzar.</p>
      </div>
      <!-- <keep-alive> --> <!-- Keep-alive can be problematic if reports need fresh state always -->
        <component :is="currentReportComponent" v-if="currentReportComponent"></component>
      <!-- </keep-alive> -->
    </div>
  </div>
</template>

<script setup>
// Script remains the same
import { ref, shallowRef } from 'vue';
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
/* .reportes-view { padding: 20px; } */ /* Applied by .card-base */

.view-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.view-header h2 { margin:0 0 0.5rem 0; color: var(--text-dark); font-size: 1.75em;}
.view-header p { margin: 0; color: var(--text-muted); font-size: 1em; }
@media (prefers-color-scheme: dark) {
  .view-header { border-bottom-color: var(--dm-border-color); }
  .view-header h2 { color: var(--dm-text-dark); }
  .view-header p { color: var(--dm-text-dark); opacity: 0.8; }
}


.report-selector {
  /* background-color: var(--bg-card); */ /* Removed, view has card-base */
  /* padding: 1.5rem; */
  /* border-radius: var(--border-radius-base); */
  /* box-shadow: var(--box-shadow-sm); */
  margin-bottom: 1rem; /* Space before content area */
}

.report-selector ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem; /* Space between buttons */
  justify-content: center; /* Center buttons */
}

.report-selector li button.action-button { /* Overriding some global .action-button for this context */
  width: 100%; /* Make buttons full width of their li container if flex basis allows */
  padding: 0.75rem 1rem; /* Slightly larger padding */
  font-size: 0.9em;
  font-weight: 500;
  background-color: var(--bg-light);
  border: 1px solid var(--border-color);
  color: var(--text-dark);
}
.report-selector li button.action-button:hover {
  background-color: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
}
.report-selector li button.action-button.active {
  background-color: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0,123,255,.35);
}
@media (prefers-color-scheme: dark) {
  .report-selector li button.action-button {
    background-color: var(--dm-bg-card);
    border-color: var(--dm-border-color);
    color: var(--dm-text-dark);
  }
   .report-selector li button.action-button:hover {
    background-color: var(--primary-color);
    color: var(--text-light);
    border-color: var(--primary-color);
  }
  .report-selector li button.action-button.active {
    background-color: var(--primary-color);
    color: var(--text-light);
    border-color: var(--primary-color);
  }
}


.report-selector .danger-button-outline { /* For "Limpiar Vista" */
  display: block; /* Center it */
  margin-left: auto;
  margin-right: auto;
  min-width: 200px;
  background-color: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}
.report-selector .danger-button-outline:hover {
  background-color: var(--danger-color);
  color: var(--text-light);
}


.report-content-area {
  /* background-color: var(--bg-card); */ /* Applied by .card-base */
  /* padding: 1.5rem; */ /* Applied by .card-base */
  /* border-radius: var(--border-radius-base); */ /* Applied by .card-base */
  /* box-shadow: var(--box-shadow); */ /* Applied by .card-base */
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align content to top */
}
/* .report-content-area > div for full width is in global styles */

.no-report-selected {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 3rem; /* More space from top */
}
.no-report-selected i {
    font-size: 3em;
    display: block;
    margin-bottom: 0.5rem;
    color: var(--secondary-color); /* Muted icon color */
}
@media (prefers-color-scheme: dark) {
  .no-report-selected { color: var(--dm-text-dark); opacity: 0.7; }
  .no-report-selected i { color: var(--secondary-color); opacity: 0.5; }
}


/* :deep styles for tables, filters, totals inside child report components are in global style.css */

/* Icons */
.icon-clear::before { content: '🧹'; margin-right: 0.5em;}
.icon-reports-placeholder::before { content: '📈';}
</style>
