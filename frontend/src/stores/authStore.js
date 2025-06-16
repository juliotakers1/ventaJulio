import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@/router'; // Import router for navigation

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
  const user = ref(JSON.parse(localStorage.getItem('user'))); // Store user info if needed

  function login(username, password) {
    // Mock login logic
    // In a real app, this would involve an API call
    if (username && password) { // Basic check, e.g., admin/password
      isAuthenticated.value = true;
      user.value = { username: username, name: 'Admin User' }; // Store username & name
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user.value));
      router.push('/dashboard');
    } else {
      // Consider providing more specific error messages or handling
      alert('Credenciales inválidas. Por favor, intente de nuevo.');
    }
  }

  function logout() {
    isAuthenticated.value = false;
    user.value = null;
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.push('/login');
  }

  // Check authentication status on store initialization (e.g., page refresh)
  // This is already handled by initializing refs from localStorage.

  return { isAuthenticated, user, login, logout };
});
