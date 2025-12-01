export const state = () => ({
  topics: [],
  loadingState: false,
  lastFetch: null,
});

export const getters = {
  allTopics: (state) => state.topics,
  loadingState: (state) => state.loadingState,
  getTopicByBubbleId: (state) => (bubbleId) => {
    return state.topics.find((topic) => topic.bubble_id === bubbleId);
  },
  getSubtopicByBubbleIds: (state) => (topicBubbleId, subtopicBubbleId) => {
    const topic = state.topics.find(
      (topic) => topic.bubble_id === topicBubbleId
    );
    if (!topic || !topic.subtopics) return null;
    return topic.subtopics.find(
      (subtopic) => subtopic.subtopic === subtopicBubbleId
    );
  },
};

export const mutations = {
  setLoadingState(state, loadingState) {
    state.loadingState = loadingState;
  },
  setTopics(state, topics) {
    state.topics = topics;
    state.lastFetch = Date.now();

    // Persistir en localStorage
    if (process.browser) {
      try {
        localStorage.setItem('topics', JSON.stringify(topics));
        localStorage.setItem('topics_last_fetch', state.lastFetch.toString());
      } catch (err) {
        console.error('Error saving topics to localStorage:', err);
      }
    }
  },
  loadTopicsFromStorage(state) {
    if (process.browser) {
      try {
        const storedTopics = localStorage.getItem('topics');
        const lastFetch = localStorage.getItem('topics_last_fetch');

        if (storedTopics) {
          state.topics = JSON.parse(storedTopics);
          state.lastFetch = lastFetch ? parseInt(lastFetch) : null;
        }
      } catch (err) {
        console.error('Error loading topics from localStorage:', err);
      }
    }
  },
};

export const actions = {
  async fetchTopics({ commit, state }) {
    // Verificar si hay datos en localStorage y si son recientes (menos de 1 hora)
    if (process.browser) {
      // Leer directamente de localStorage para evitar problemas con el state
      const storedLastFetch = localStorage.getItem('topics_last_fetch');
      const storedTopics = localStorage.getItem('topics');

      if (storedLastFetch && storedTopics) {
        const lastFetch = parseInt(storedLastFetch);
        const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos

        try {
          const topicsArray = JSON.parse(storedTopics);

          if (
            lastFetch &&
            Date.now() - lastFetch < oneHour &&
            Array.isArray(topicsArray) &&
            topicsArray.length > 0
          ) {
            // Usar datos del localStorage si son recientes
            commit('loadTopicsFromStorage');
            // Retornar los topics parseados directamente
            return topicsArray;
          }
        } catch (err) {
          console.error('Error parsing stored topics:', err);
        }
      }

      // Verificar que el token exista antes de hacer la petición
      const token = localStorage.getItem('user_token');
      if (!token) {
        console.warn('No token found, using cached topics from localStorage');
        commit('loadTopicsFromStorage');
        // Intentar leer de localStorage después del commit
        try {
          const topicsAfterCommit = localStorage.getItem('topics');
          if (topicsAfterCommit) {
            return JSON.parse(topicsAfterCommit);
          }
        } catch (err) {
          console.error('Error reading topics after commit:', err);
        }
        return [];
      }
    }

    commit('setLoadingState', true);

    try {
      const response = await this.$axios.get('/topics');
      const data = response.data;
      const topics = data.payload || data.data || [];

      commit('setTopics', topics);
      return topics;
    } catch (error) {
      console.error('Error fetching topics:', error);

      // Si el error es de autenticación (402, 403), no usar cache
      const status = error.response?.status;
      if (status === 402 || status === 403) {
        // Token inválido o expirado - el interceptor de axios manejará el redirect
        throw error;
      }

      // Para otros errores, intentar cargar desde localStorage
      if (process.browser) {
        commit('loadTopicsFromStorage');
        // Leer directamente de localStorage después del commit
        try {
          const storedTopics = localStorage.getItem('topics');
          if (storedTopics) {
            const topicsArray = JSON.parse(storedTopics);
            return Array.isArray(topicsArray) && topicsArray.length > 0
              ? topicsArray
              : [];
          }
        } catch (err) {
          console.error(
            'Error reading topics from localStorage after error:',
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
