<template>
  <div class="dashboard-layout">
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <h3 v-if="!isSidebarCollapsed">{{ appName }}</h3>
        <button @click="toggleSidebar" class="sidebar-toggle-icon">
          <span v-html="isSidebarCollapsed ? '&#9776;' : '&times;'"></span> <!-- Hamburger/Close -->
        </button>
      </div>
      <div v-if="!isSidebarCollapsed && authStore.user" class="user-info">
        <p>Bienvenido,</p>
        <p class="username">{{ authStore.user.name || authStore.user.username }}</p>
      </div>
      <nav>
        <ul>
          <li><router-link to="/dashboard/ventas"><i class="icon Ventas"></i><span v-if="!isSidebarCollapsed">Ventas</span></router-link></li>
          <li><router-link to="/dashboard/productos"><i class="icon Productos"></i><span v-if="!isSidebarCollapsed">Productos</span></router-link></li>
          <li><router-link to="/dashboard/egresos"><i class="icon Egresos"></i><span v-if="!isSidebarCollapsed">Egresos</span></router-link></li>
          <li><router-link to="/dashboard/descuentos"><i class="icon Descuentos"></i><span v-if="!isSidebarCollapsed">Descuentos</span></router-link></li>
          <li><router-link to="/dashboard/reportes"><i class="icon Reportes"></i><span v-if="!isSidebarCollapsed">Reportes</span></router-link></li>
          <li><router-link to="/dashboard/traslados"><i class="icon Traslados"></i><span v-if="!isSidebarCollapsed">Traslados</span></router-link></li>
          <li><router-link to="/dashboard/proveedores"><i class="icon Proveedores"></i><span v-if="!isSidebarCollapsed">Proveedores</span></router-link></li>
        </ul>
      </nav>
      <div class="logout-section">
        <button @click="handleLogout" class="logout-button">
          <i class="icon Logout"></i><span v-if="!isSidebarCollapsed">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
    <main class="main-content" :class="{ 'content-expanded': isSidebarCollapsed }">
      <div class="top-header-bar"> <!-- Optional: if you want a header bar above content -->
         <!-- Breadcrumbs or other header content can go here -->
         <span>{{ currentRouteName }}</span>
      </div>
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore.js';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();
const appName = ref("Sistema POS");
const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleLogout = () => {
  authStore.logout();
};

const currentRouteName = computed(() => {
    return route.name || 'Dashboard';
});

// Placeholder for icons - in a real app, use SVG icons or a library
const icons = { Ventas: '💰', Productos: '📦', Egresos: '💸', Descuentos: '🏷️', Reportes: '📊', Traslados: '🚚', Proveedores: '👥', Logout: '🚪' };
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-main);
}

.sidebar {
  width: 240px; /* Standard width */
  background-color: var(--bg-dark);
  color: var(--text-light);
  padding: 15px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow-x: hidden; /* Hide content when collapsing */
}
.sidebar-collapsed {
  width: 70px; /* Collapsed width */
}
.sidebar-collapsed .user-info,
.sidebar-collapsed .sidebar-header h3 {
  display: none;
}
.sidebar-collapsed .sidebar-toggle-icon {
    justify-content: center;
}
.sidebar-collapsed nav ul li a span,
.sidebar-collapsed .logout-button span {
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity 0.1s ease, width 0.1s ease;
}
.sidebar-collapsed nav ul li a i {
  margin-right: 0; /* Remove margin when text is hidden */
}
.sidebar-collapsed .logout-button i {
    margin-right: 0;
}


.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Pushes h3 and button apart */
  padding-bottom: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #495057;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 1.5em;
  color: #fff;
  white-space: nowrap;
}

.sidebar-toggle-icon {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 1.5em; /* Make icon larger */
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
}
.sidebar-toggle-icon:hover {
  color: var(--primary-color);
}


.user-info {
  margin-bottom: 15px;
  text-align: center;
  padding: 10px 0;
  border-bottom: 1px solid #495057;
}
.user-info p { margin: 0; font-size: 0.9em; }
.user-info .username { font-weight: bold; color: #fff; margin-top: 4px;}


.sidebar nav {
  flex-grow: 1;
}
.sidebar nav ul { list-style-type: none; padding: 0; margin: 0; }
.sidebar nav ul li { margin-bottom: 5px; }
.sidebar nav ul li a {
  text-decoration: none;
  color: #adb5bd; /* Lighter for inactive */
  display: flex; /* For icon and text alignment */
  align-items: center;
  padding: 12px 15px;
  border-radius: var(--border-radius-base);
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap; /* Prevent text wrapping */
}
.sidebar nav ul li a i {
  margin-right: 10px; /* Space between icon and text */
  font-style: normal; /* If using text/emoji as icons */
  width: 20px; /* Fixed width for icon container */
  text-align: center;
  font-size: 1.1em;
}

.sidebar nav ul li a:hover {
  background-color: #495057;
  color: #fff;
}
.sidebar nav ul li a.router-link-exact-active {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}
.sidebar nav ul li a.router-link-exact-active i {
  color: white; /* Ensure icon color contrasts with active bg */
}

.logout-section { margin-top: auto; /* Pushes to the bottom */ padding-top: 15px; border-top: 1px solid #495057;}
.logout-button {
  display: flex; /* For icon and text */
  align-items: center;
  justify-content: flex-start; /* Align icon and text to start */
  width: 100%;
  padding: 12px 15px;
  background-color: transparent; /* Match sidebar */
  color: var(--danger-color); /* Danger color for text */
  border: 1px solid var(--danger-color);
  border-radius: var(--border-radius-base);
  text-align: left; /* Align text to left */
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}
.logout-button i {
  margin-right: 10px;
  font-style: normal;
  width: 20px;
  text-align: center;
  font-size: 1.1em;
}
.logout-button:hover {
  background-color: var(--danger-color);
  color: white;
}
.sidebar-collapsed .logout-button {
    justify-content: center; /* Center icon when collapsed */
}


.main-content {
  flex-grow: 1;
  /* padding: 25px; */ /* Padding will be on content-wrapper */
  background-color: var(--bg-main);
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  margin-left: 0; /* Default when sidebar is not fixed/absolute */
  display: flex;
  flex-direction: column;
}
.content-expanded {
  /* Adjust margin if sidebar was fixed and page content needs to shift */
  /* margin-left: 70px; */ /* Example if sidebar is fixed */
}

.top-header-bar {
    background-color: var(--bg-card);
    padding: 0.75rem 1.5rem;
    box-shadow: var(--box-shadow-sm);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-dark);
    font-size: 1.1em;
    font-weight: 600;
}
@media (prefers-color-scheme: dark) {
  .top-header-bar {
    background-color: var(--dm-bg-card);
    color: var(--dm-text-dark);
    border-bottom-color: var(--dm-border-color);
  }
}


.content-wrapper {
    padding: 25px;
    flex-grow: 1;
    overflow-y: auto; /* Scroll only content area if needed */
}

/* Basic responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    /* On smaller screens, you might want the sidebar to be collapsed by default or overlay */
    /* For simplicity, we'll just ensure it can be collapsed. */
    /* width: 70px; // Example: collapsed by default on mobile */
  }
  .sidebar-collapsed {
     /* width: 0; */ /* Or completely hide */
     /* padding: 0; */
  }
  /* More complex mobile menu would require JS to toggle a class on body/layout */
}

/* Icons - replace with actual SVGs or icon font */
.icon::before {
  display: inline-block;
  font-family: 'Segoe UI Symbol'; /* Example, use your icon font or SVG content */
}
.Ventas::before { content: '💰'; }
.Productos::before { content: '📦'; }
.Egresos::before { content: '💸'; }
.Descuentos::before { content: '🏷️'; }
.Reportes::before { content: '📊'; }
.Traslados::before { content: '🚚'; }
.Proveedores::before { content: '👥'; }
.Logout::before { content: '🚪'; }

</style>
