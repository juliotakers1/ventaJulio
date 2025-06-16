import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
// Removed DashboardView import as it's not used as a standalone default for /dashboard anymore
import VentasView from '../views/VentasView.vue';
import ProductosView from '../views/ProductosView.vue';
import EgresosView from '../views/EgresosView.vue';
import DescuentosView from '../views/DescuentosView.vue';
import ReportesView from '../views/ReportesView.vue';
// import TrasladosView from '../views/TrasladosView.vue'; // Already created, ensure it's used or remove if duplicate
import ProveedoresView from '../views/ProveedoresView.vue';
import TrasladosView from '../views/TrasladosView.vue'; // Corrected placement
import { useAuthStore } from '@/stores/authStore.js'; // Import auth store

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
    meta: { requiresAuth: true }, // Secure the dashboard and its children
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
      {
        path: 'proveedores',
        name: 'Proveedores',
        component: ProveedoresView,
      },
      // Ensure Traslados route is correctly defined if it was missing or misplaced.
      // Based on previous steps, it might already be there. If so, this block might be redundant
      // or need adjustment. Assuming it needs to be ensured or corrected:
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

// Navigation Guard
router.beforeEach((to, from, next) => {
  // Ensure authStore is accessed correctly, typically by calling useAuthStore() inside the guard
  // This is important because Pinia might not be fully initialized if called at the top-level of this script
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login'); // Redirect to login if not authenticated
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard'); // If authenticated and trying to access login, redirect to dashboard
  }
  else {
    next(); // Otherwise, proceed as normal
  }
});

export default router;
