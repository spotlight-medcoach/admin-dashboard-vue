export const state = () => ({
  questions: undefined,
  loadingState: true,
  savingState: false,
  currentQuestion: undefined,
  totalQuestions: 0,
});

export const getters = {
  allQuestions: (state) => state.questions,
  loadingState: (state) => state.loadingState,
  savingState: (state) => state.savingState,
  currentQuestion: (state) => state.currentQuestion,
  totalQuestions: (state) => state.totalQuestions,
};

export const mutations = {
  setLoadingState(state, loadingState) {
    state.loadingState = loadingState;
  },
  setSavingState(state, savingState) {
    state.savingState = savingState;
  },
  setQuestions(state, questions) {
    state.questions = questions;
  },
  setTotalQuestions(state, total) {
    state.totalQuestions = total;
  },
  addQuestion(state, question) {
    if (!state.questions) {
      state.questions = [];
    }
    state.questions.unshift(question);
  },
  updateQuestionInList(state, updatedQuestion) {
    if (!state.questions) return;
    const idx = state.questions.findIndex(
      (question) => question._id === updatedQuestion._id
    );
    if (idx !== -1) {
      state.questions.splice(idx, 1, updatedQuestion);
    }
  },
  removeQuestion(state, questionId) {
    if (!state.questions) return;
    const idx = state.questions.findIndex(
      (question) => question._id === questionId
    );
    if (idx !== -1) {
      state.questions.splice(idx, 1);
    }
  },
  setCurrentQuestion(state, question) {
    state.currentQuestion = question;
  },
};

export const actions = {
  fetchQuestions({ commit }, params = {}) {
    commit('setLoadingState', true);
    return this.$axios
      .get('/diagnostic-questions', { params })
      .then((response) => {
        const data = response.data;
        // Handle paginated response: { success: true, data: [...], pagination: {...} }
        if (data.pagination && Array.isArray(data.data)) {
          commit('setQuestions', data.data);
          commit('setTotalQuestions', data.pagination.total);
          return { questions: data.data, total: data.pagination.total };
        }
        // Fallback to old format: { payload: { questions, total } } or { data: { questions, total } }
        const questionsInfo = data.payload ||
          data.data || {
            questions: [],
            total: 0,
          };
        const { questions, total } = questionsInfo;
        commit('setQuestions', questions);
        commit('setTotalQuestions', total);
        return questionsInfo;
      })
      .catch((error) => {
        console.error('Error fetching diagnostic questions:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  fetchQuestionById({ commit }, questionId) {
    commit('setLoadingState', true);
    return this.$axios
      .get(`/diagnostic-questions/${questionId}`)
      .then((response) => {
        const data = response.data;
        const question = data.payload || data.data;
        commit('setCurrentQuestion', question);
        return question;
      })
      .catch((error) => {
        console.error('Error fetching diagnostic question:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  async createQuestion({ commit }, questionData) {
    commit('setSavingState', true);
    try {
      const response = await this.$axios.post(
        '/diagnostic-questions',
        questionData
      );
      const data = response.data;
      const newQuestion = data.payload || data.data || data;
      commit('addQuestion', newQuestion);
      return newQuestion;
    } catch (error) {
      console.error('Error creating diagnostic question:', error);
      throw error;
    } finally {
      commit('setSavingState', false);
    }
  },
  updateQuestion({ commit }, { questionId, questionData }) {
    commit('setSavingState', true);
    return this.$axios
      .put(`/diagnostic-questions/${questionId}`, questionData)
      .then((response) => {
        const data = response.data;
        const updatedQuestion = data.payload || data.data;
        commit('updateQuestionInList', updatedQuestion);
        commit('setCurrentQuestion', updatedQuestion);
        return updatedQuestion;
      })
      .catch((error) => {
        console.error('Error updating diagnostic question:', error);
        return error;
      })
      .finally(() => {
        commit('setSavingState', false);
      });
  },
  deleteQuestion({ commit }, questionId) {
    commit('setLoadingState', true);
    return this.$axios
      .delete(`/diagnostic-questions/${questionId}`)
      .then((response) => {
        commit('removeQuestion', questionId);
        return response;
      })
      .catch((error) => {
        console.error('Error deleting diagnostic question:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
};
