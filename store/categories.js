export const state = () => ({
  categories: [],
  loadingState: false,
  lastFetch: null,
});

export const getters = {
  allCategories: (state) => state.categories,
  loadingState: (state) => state.loadingState,
  getCategoryById: (state) => (id) => {
    return state.categories.find((category) => category._id === id);
  },
};

export const mutations = {
  setLoadingState(state, loadingState) {
    state.loadingState = loadingState;
  },
  setCategories(state, categories) {
    state.categories = categories;
    state.lastFetch = Date.now();

    // Persistir en localStorage
    if (process.browser) {
      try {
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem(
          'categories_last_fetch',
          state.lastFetch.toString()
        );
      } catch (err) {
        console.error('Error saving categories to localStorage:', err);
      }
    }
  },
  loadCategoriesFromStorage(state) {
    if (process.browser) {
      try {
        const storedCategories = localStorage.getItem('categories');
        const lastFetch = localStorage.getItem('categories_last_fetch');

        if (storedCategories) {
          state.categories = JSON.parse(storedCategories);
          state.lastFetch = lastFetch ? parseInt(lastFetch) : null;
        }
      } catch (err) {
        console.error('Error loading categories from localStorage:', err);
      }
    }
  },
};

export const actions = {
  async fetchCategories({ commit }) {
    // Verificar si hay datos en localStorage y si son recientes (menos de 1 hora)
    if (process.browser) {
      const storedLastFetch = localStorage.getItem('categories_last_fetch');
      const storedCategories = localStorage.getItem('categories');

      if (storedLastFetch && storedCategories) {
        const lastFetch = parseInt(storedLastFetch);
        const oneHour = 60 * 60 * 1000;

        try {
          const categoriesArray = JSON.parse(storedCategories);

          if (
            lastFetch &&
            Date.now() - lastFetch < oneHour &&
            Array.isArray(categoriesArray) &&
            categoriesArray.length > 0
          ) {
            commit('loadCategoriesFromStorage');
            return categoriesArray;
          }
        } catch (err) {
          console.error('Error parsing stored categories:', err);
        }
      }

      const token = localStorage.getItem('user_token');
      if (!token) {
        console.warn(
          'No token found, using cached categories from localStorage'
        );
        commit('loadCategoriesFromStorage');
        try {
          const categoriesAfterCommit = localStorage.getItem('categories');
          if (categoriesAfterCommit) {
            return JSON.parse(categoriesAfterCommit);
          }
        } catch (err) {
          console.error('Error reading categories after commit:', err);
        }
        return [];
      }
    }

    commit('setLoadingState', true);

    try {
      const response = await this.$axios.get('/categories');
      const data = response.data;
      const categories = data.payload || data.data || [];

      commit('setCategories', categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);

      const status = error.response?.status;
      if (status === 402 || status === 403) {
        throw error;
      }

      if (process.browser) {
        commit('loadCategoriesFromStorage');
        try {
          const storedCategories = localStorage.getItem('categories');
          if (storedCategories) {
            const categoriesArray = JSON.parse(storedCategories);
            return Array.isArray(categoriesArray) && categoriesArray.length > 0
              ? categoriesArray
              : [];
          }
        } catch (err) {
          console.error(
            'Error reading categories from localStorage after error:',
            err
          );
        }
        return [];
      }

      throw error;
    } finally {
      commit('setLoadingState', false);
    }
  },
};
