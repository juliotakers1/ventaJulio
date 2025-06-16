<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <nav>
        <ul>
          <li><router-link to="/dashboard/ventas">Ventas</router-link></li>
          <li><router-link to="/dashboard/productos">Productos</router-link></li>
          <li><router-link to="/dashboard/egresos">Egresos</router-link></li>
          <li><router-link to="/dashboard/descuentos">Descuentos</router-link></li>
          <li><router-link to="/dashboard/reportes">Reportes</router-link></li>
          <li><router-link to="/dashboard/traslados">Traslados</router-link></li>
        </ul>
      </nav>
      <div class="logout-section">
        <router-link to="/login" class="logout-link">Logout</router-link>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// No specific script needed for layout in this basic setup
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #f0f0f0;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar nav ul li {
  margin-bottom: 10px;
}

.sidebar nav ul li a {
  text-decoration: none;
  color: #333;
  display: block;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
}

.sidebar nav ul li a:hover,
.sidebar nav ul li a.router-link-exact-active {
  background-color: #007bff;
  color: white;
}

.logout-section {
  margin-top: 20px; /* Add some space above the logout link */
}

.logout-link {
  display: block;
  padding: 10px 12px;
  background-color: #dc3545;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.logout-link:hover {
  background-color: #c82333;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  background-color: #fff;
}
</style>
