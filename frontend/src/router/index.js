import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
// Removed DashboardView import as it's not used as a standalone default for /dashboard anymore
import VentasView from '../views/VentasView.vue';
import ProductosView from '../views/ProductosView.vue';
import EgresosView from '../views/EgresosView.vue';
import DescuentosView from '../views/DescuentosView.vue';
import ReportesView from '../views/ReportesView.vue';
import TrasladosView from '../views/TrasladosView.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    redirect: '/dashboard/ventas', // Default to Ventas view
    children: [
      {
        path: 'ventas',
        name: 'Ventas',
        component: VentasView,
      },
      {
        path: 'productos',
        name: 'Productos',
        component: ProductosView,
      },
      {
        path: 'egresos',
        name: 'Egresos',
        component: EgresosView,
      },
      {
        path: 'descuentos',
        name: 'Descuentos',
        component: DescuentosView,
      },
      {
        path: 'reportes',
        name: 'Reportes',
        component: ReportesView,
      },
      {
        path: 'traslados',
        name: 'Traslados',
        component: TrasladosView,
      },
    ],
    // meta: { requiresAuth: true } // Add this if you implement auth checks
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
