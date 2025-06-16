<template>
  <div class="report-container">
    <h2>Reporte Mensual de Ventas por Vendedor</h2>

    <div class="report-filters">
      <label for="vendor-select">Filtrar por Vendedor:</label>
      <select id="vendor-select" v-model="selectedVendorId">
        <option value="">Todos los Vendedores</option>
        <option v-for="vendor in uniqueVendors" :key="vendor.id" :value="vendor.id">
          {{ vendor.name }}
        </option>
      </select>
    </div>

    <table class="report-table" v-if="processedSales.length > 0">
      <caption>Ventas Mensuales Agrupadas por Vendedor y Mes</caption>
      <thead>
        <tr>
          <th>Vendedor</th>
          <th>Mes</th>
          <th>Año</th>
          <th>Total de Ventas</th>
          <th>Número de Ventas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(sale, index) in processedSales" :key="index">
          <td>{{ sale.vendorName }}</td>
          <td>{{ getMonthName(sale.month) }}</td>
          <td>{{ sale.year }}</td>
          <td>${{ sale.totalSales.toFixed(2) }}</td>
          <td>{{ sale.numberOfSales }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay datos de ventas para mostrar según los filtros seleccionados.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockSales } from '../../data/mockSalesData.js';

const salesData = ref(mockSales);
const selectedVendorId = ref(''); // For filtering

const uniqueVendors = computed(() => {
  const vendors = salesData.value.map(sale => ({ id: sale.vendorId, name: sale.vendorName }));
  return [...new Map(vendors.map(vendor => [vendor.id, vendor])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
});

const processedSales = computed(() => {
  const filtered = selectedVendorId.value
    ? salesData.value.filter(sale => sale.vendorId === selectedVendorId.value)
    : salesData.value;

  if (!filtered.length) return [];

  const groupedByVendorMonth = filtered.reduce((acc, sale) => {
    const saleDate = new Date(sale.saleDate);
    // Adjust for timezone issues if saleDate is just YYYY-MM-DD
    saleDate.setMinutes(saleDate.getMinutes() + saleDate.getTimezoneOffset());

    const month = saleDate.getMonth() + 1; // JavaScript months are 0-indexed
    const year = saleDate.getFullYear();
    const vendorName = sale.vendorName;
    const vendorId = sale.vendorId;

    const key = `${vendorId}-${year}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        vendorId: vendorId,
        vendorName: vendorName,
        year: year,
        month: month,
        totalSales: 0,
        numberOfSales: 0,
      };
    }
    acc[key].totalSales += sale.totalAmount;
    acc[key].numberOfSales += 1;
    return acc;
  }, {});

  return Object.values(groupedByVendorMonth).sort((a, b) => {
    if (a.vendorName.localeCompare(b.vendorName) !== 0) {
      return a.vendorName.localeCompare(b.vendorName);
    }
    if (a.year !== b.year) {
      return b.year - a.year; // Sort by year descending
    }
    return b.month - a.month; // Sort by month descending
  });
});

const getMonthName = (monthNumber) => {
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return monthNames[monthNumber - 1];
};

onMounted(() => {
  // Data is already loaded, could fetch here in a real app
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
  color: #333;
}
/* Report table and filter styles are inherited via :deep from ReportesView.vue */
</style>
