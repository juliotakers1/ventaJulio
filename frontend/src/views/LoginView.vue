<template>
  <div class="login-page-wrapper">
    <div class="login-container card-base">
      <div class="login-header">
        <img src="/favicon.ico" alt="App Logo" class="app-logo"> <!-- Example logo -->
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido de nuevo. Por favor, ingrese sus credenciales.</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" v-model="username" placeholder="nombre.usuario" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" placeholder="••••••••" />
        </div>
        <button type="submit" class="login-button action-button primary">Ingresar</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <div class="login-footer">
        <a href="#">¿Olvidó su contraseña?</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const authStore = useAuthStore();

const handleLogin = () => {
  errorMessage.value = '';
  if (!username.value || !password.value) {
    errorMessage.value = 'Por favor, ingrese usuario y contraseña.';
    return;
  }
  authStore.login(username.value, password.value);
  // If authStore.login becomes async and returns a promise:
  // authStore.login(username.value, password.value).catch(error => {
  //   errorMessage.value = error.message || 'Error al iniciar sesión.';
  // });
  // For now, assuming authStore.login might internally set an error or alert for failed login
  if (!authStore.isAuthenticated && !errorMessage.value) { // Check if authStore itself didn't set an error
     // This part might not be hit if authStore.login alerts and doesn't throw an error.
     // If authStore.login is modified to throw an error or return a status, this can be more robust.
     // errorMessage.value = "Credenciales incorrectas. Intente de nuevo.";
  }
};
</script>

<style scoped>
.login-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-main);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px; /* Consistent max-width */
  /* padding: 30px; */ /* Using .card-base padding */
  /* border: 1px solid var(--border-color); */ /* Using .card-base border */
  /* border-radius: var(--border-radius-base); */ /* Using .card-base radius */
  /* box-shadow: var(--box-shadow); */ /* Using .card-base shadow */
  /* background-color: var(--bg-card); */ /* Using .card-base background */
}
@media (prefers-color-scheme: dark) {
  .login-container {
    /* background-color: var(--dm-bg-card); */ /* Handled by .card-base */
    /* border-color: var(--dm-border-color); */ /* Handled by .card-base */
  }
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}
.app-logo {
  width: 60px; /* Adjust as needed */
  height: auto;
  margin-bottom: 10px;
}
.login-header h2 {
  color: var(--text-dark);
  margin-bottom: 8px;
  font-size: 1.8em;
}
.login-header p {
  color: var(--text-muted);
  font-size: 0.95em;
  margin-bottom: 0;
}
@media (prefers-color-scheme: dark) {
 .login-header h2 { color: var(--dm-text-dark); }
 .login-header p { color: var(--dm-text-dark); opacity: 0.8; }
}


.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500; /* Slightly lighter than default h tags */
  color: var(--text-dark);
}
@media (prefers-color-scheme: dark) {
  .form-group label { color: var(--dm-text-dark); }
}


input[type="text"],
input[type="password"] {
  /* Global styles are applied, but we can override if needed */
  /* padding: 12px; */ /* From global */
  font-size: 1em; /* Ensure consistent font size */
}

.login-button {
  width: 100%;
  /* padding: 12px; */ /* From global .action-button */
  font-size: 1.1em;
  font-weight: bold;
  /* background-color: var(--primary-color); */ /* From global */
  /* color: var(--text-light); */ /* From global */
  /* border: none; */ /* From global */
  /* border-radius: var(--border-radius-base); */ /* From global */
  /* cursor: pointer; */ /* From global */
  /* transition: background-color 0.2s ease; */ /* From global */
}
/* .login-button:hover { background-color: #0056b3; } */ /* From global */


.error-message {
  color: var(--danger-color);
  text-align: center;
  margin-top: 15px;
  font-size: 0.9em;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.85em;
}
.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
}
.login-footer a:hover {
  text-decoration: underline;
}
</style>
