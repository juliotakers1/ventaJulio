# Testing Strategy for Vue.js POS Application

This document outlines the proposed testing strategy for the Vue.js Point of Sale (POS) application. It covers unit testing for Pinia stores and unit/component testing for Vue components, aiming for a balance between coverage and effort.

## 1. Testing Setup & Tools

To implement testing, the following setup and libraries would be required:

*   **Test Runner & Framework:** [Vitest](https://vitest.dev/) is a modern test runner built on Vite, offering a fast and integrated experience. Jest is another popular alternative.
*   **Vue Test Utils:** [`@vue/test-utils`](https://test-utils.vuejs.org/) is the official library for testing Vue components. It provides utilities for mounting components, interacting with them, and making assertions.
*   **Pinia Testing Utilities:** For testing Pinia stores, utilities like [`@pinia/testing`](https://pinia.vuejs.org/cookbook/testing.html) can simplify mocking and store instantiation in tests.
*   **Assertion Library:** Vitest and Jest come with built-in assertion libraries (e.g., `expect`).
*   **Mocking/Spying:** Vitest (via `vi`) or Jest (`jest.fn()`, `jest.spyOn()`) provide robust mocking and spying capabilities.

**Configuration:**
*   Vite configuration (`vite.config.js` or `vitest.config.js`) would need to be updated to include the testing environment setup, such as configuring Vitest globals and test file patterns.
*   A test script would be added to `package.json` (e.g., `"test:unit": "vitest"`).

## 2. Unit Testing Pinia Stores

Pinia stores contain the core business logic and state management of the application. Testing them thoroughly is crucial.

**General Approach for Store Testing:**
*   **Isolate the Store:** Test each store module in isolation.
*   **`setActivePinia(createPinia())`:** Use this before each test to ensure a clean Pinia instance.
*   **Test Initial State:** Verify that the store initializes with the correct default state (e.g., product list loaded from mocks, authentication status).
*   **Test Actions:**
    *   Call actions with various inputs.
    *   Assert that the state is updated correctly after an action is dispatched.
    *   If an action calls other actions (even in other stores), spy on those to ensure they are called with the correct parameters.
*   **Test Getters (Computed Properties):** If stores have getters, test them to ensure they compute derived state correctly based on the current state.

---

### Example: `productStore.js`

*   **Initial State:**
    *   Verify `products` ref is initialized as a deep copy of `initialMockProducts`.
*   **`addProduct(product)`:**
    *   Assert that `products.value` length increases by one.
    *   Assert that the new product (with an ID) is present in `products.value`.
*   **`updateProduct(updatedProduct)`:**
    *   Get a product, call `updateProduct` with new data and its ID.
    *   Assert that the product in `products.value` reflects the updated data.
    *   Test updating a non-existent product (should not error, or handle as defined).
*   **`deleteProduct(productId)`:**
    *   Add a product, then delete it by its ID.
    *   Assert that `products.value` length decreases and the product is no longer present.
*   **`getProductById(productId)`:**
    *   Assert it returns the correct product object when a valid ID is given.
    *   Assert it returns `undefined` for a non-existent ID.
*   **`adjustStock(productId, quantityChange)`:**
    *   Get a product, note its initial stock.
    *   Call `adjustStock` with a positive `quantityChange` (e.g., adding stock back). Assert new stock is `initialStock + quantityChange`.
    *   Call `adjustStock` with a negative `quantityChange` (e.g., deducting stock). Assert new stock is `updatedStock - quantityChange`.
    *   Test with non-existent `productId` (should not error, console warning is fine).
    *   Test cases where `product.stock` might be initially undefined or not a number.

---

### Example: `authStore.js`

*   **`login(username, password)`:**
    *   Call with valid mock credentials. Assert `isAuthenticated.value` is true, `user.value` contains user info, and `localStorage` items are set. Assert navigation to `/dashboard` is attempted (mock `router.push`).
    *   Call with invalid/empty credentials. Assert `isAuthenticated.value` remains false, `user.value` is null, and `localStorage` is not set (or an error/alert occurs as per implementation).
*   **`logout()`:**
    *   First, simulate a login state.
    *   Call `logout()`. Assert `isAuthenticated.value` is false, `user.value` is null, and `localStorage` items are cleared. Assert navigation to `/login` is attempted.

---

### Example: `egresosStore.js` (and other stores interacting with `productStore`)

*   **`addExpense(expense)`:**
    *   Mock `productStore.adjustStock`.
    *   Call `egresosStore.addExpense` with a sample expense.
    *   Assert the expense is added to `expensesList.value`.
    *   Assert `productStore.adjustStock` was called with the correct `productId` and negative `quantity`.
*   **`updateExpense(updatedExpense, originalQuantity)`:**
    *   Mock `productStore.adjustStock`.
    *   Add an initial expense.
    *   Call `updateExpense` with changes.
    *   Assert the expense is updated in `expensesList.value`.
    *   Assert `productStore.adjustStock` is called correctly to reflect the stock difference (reverting original, applying new, or adjusting difference). Test with product ID change and without.
*   **`deleteExpense(expenseId)`:**
    *   Mock `productStore.adjustStock`.
    *   Add an expense, then delete it.
    *   Assert the expense is removed from `expensesList.value`.
    *   Assert `productStore.adjustStock` was called to add back the quantity.

## 3. Unit/Component Testing Vue Components

Component tests focus on rendering, user interactions, and interactions with stores or other services.

**General Approach for Component Testing:**
*   **Mount the Component:** Use `mount` or `shallowMount` from `@vue/test-utils`. `shallowMount` is good for unit testing a component in isolation by stubbing child components.
*   **Mock Pinia Stores:** Use `@pinia/testing` or manual mocks to provide controlled store state and spy on actions.
*   **Stub Router:** Stub `router-link` and `router-view` and mock `useRoute` and `useRouter` if the component uses them directly for non-navigation tasks. For navigation triggered by actions, test that the action (which then calls `router.push`) is invoked.
*   **Find Elements:** Use `wrapper.find()` or `wrapper.findAll()` to get DOM elements.
*   **Simulate User Interactions:** Use `wrapper.trigger('click')`, `wrapper.setValue()`, etc.
*   **Make Assertions:** Check rendered output, component state, or whether store actions were called.

---

### Example: `LoginView.vue`

*   **Rendering:** Assert that input fields for username and password, and a submit button, are rendered.
*   **Form Submission:**
    *   Mount with a testing Pinia instance and get the `authStore`.
    *   Spy on `authStore.login`.
    *   Set values for username and password inputs.
    *   Trigger form submission or button click.
    *   Assert `authStore.login` was called with the correct username and password.
    *   Test empty input submission and assert error message display.

---

### Example: `DashboardLayout.vue`

*   **Rendering:** Assert sidebar and main content area (`<router-view>`) are present.
*   **Navigation Links:** Assert that `router-link` components for different sections (Ventas, Productos, etc.) are rendered with correct `to` props.
*   **Logout:**
    *   Mount with a testing Pinia instance. Spy on `authStore.logout`.
    *   Find the logout button and trigger a click.
    *   Assert `authStore.logout` was called.
*   **User Info Display:**
    *   Provide a mock `authStore` state with a logged-in user.
    *   Assert that user information (e.g., username) is displayed.

---

### Example: `ProductosView.vue` (as a representative CRUD view)

*   **Display Products:**
    *   Mount with a mock `productStore` that has a predefined list of products.
    *   Assert that the table renders the correct number of rows and displays product data.
*   **Open Add Modal:**
    *   Find and click the "Agregar Producto" button.
    *   Assert that the form/modal becomes visible (e.g., by checking `showForm.value` or a specific DOM element).
*   **Add Product (Form Submission):**
    *   Spy on `productStore.addProduct`.
    *   Set values in the product form.
    *   Trigger form submission.
    *   Assert `productStore.addProduct` was called with the correct product data.
*   **Edit Product:**
    *   Provide a product in the mock store.
    *   Click the "Edit" button for that product.
    *   Assert the form is populated with the product's data.
    *   Change a value, submit the form, and assert `productStore.updateProduct` is called.
*   **Delete Product:**
    *   Provide a product. Spy on `productStore.deleteProduct` and `window.confirm` (mocking it to return true).
    *   Click the "Delete" button.
    *   Assert `productStore.deleteProduct` was called with the correct product ID.

---

### Example: `VentasView.vue`

*   **Filter Logic (Unit test the script part if complex, or component test):**
    *   Provide a set of products to the component (e.g., via `productStore` or local mock if still used there).
    *   Simulate changes to filter refs (`selectedBrand`, `selectedStyle`, etc.).
    *   Assert that the `filteredProducts` computed property updates as expected.
*   **E-code Search:**
    *   Set a value for `searchEcodeQuery`.
    *   Assert `filteredProducts` updates to show only matching products.
*   **Product Selection:**
    *   Trigger a click on a product in the results list.
    *   Assert that `selectedProduct.value` is updated with the correct product data.

## 4. Navigation Guards

*   In `router/index.js` tests (if testing the router setup itself, which is less common than testing store/component effects on routing):
    *   Mock `useAuthStore`.
    *   Test `beforeEach` guard:
        *   If `to.meta.requiresAuth` is true and `authStore.isAuthenticated` is false, assert `next('/login')` is called.
        *   If `to.meta.requiresAuth` is true and `authStore.isAuthenticated` is true, assert `next()` is called.
        *   If `to.path` is `/login` and `authStore.isAuthenticated` is true, assert `next('/dashboard')` is called.

## 5. General Principles for Tests

*   **Readability:** Write clear and descriptive test names (`it('should do X when Y happens')`).
*   **Arrange, Act, Assert:** Structure tests logically.
*   **Independence:** Tests should be independent and not rely on the state of previous tests. Use `beforeEach` and `afterEach` hooks for setup/teardown.
*   **Focus:** Each test should ideally verify one specific piece of functionality.
*   **Mocking:** Effectively mock external dependencies, child components (for unit tests), and browser APIs (like `localStorage` if not using Pinia's built-in serialization or if testing that part specifically).

This strategy provides a foundation for ensuring the application's reliability and maintainability. Start with critical paths (authentication, core CRUD operations) and expand coverage over time.
```
