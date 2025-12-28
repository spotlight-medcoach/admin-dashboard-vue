export const state = () => ({
  cases: undefined,
  loadingState: true,
  savingState: false,
  currentCase: undefined,
  totalCases: 0,
});

export const getters = {
  allQuestions: (state) => state.cases, // Mantener nombre para compatibilidad
  allCases: (state) => state.cases,
  loadingState: (state) => state.loadingState,
  savingState: (state) => state.savingState,
  currentQuestion: (state) => state.currentCase, // Mantener nombre para compatibilidad
  currentCase: (state) => state.currentCase,
  totalQuestions: (state) => state.totalCases, // Mantener nombre para compatibilidad
  totalCases: (state) => state.totalCases,
};

export const mutations = {
  setLoadingState(state, loadingState) {
    state.loadingState = loadingState;
  },
  setSavingState(state, savingState) {
    state.savingState = savingState;
  },
  setQuestions(state, cases) {
    state.cases = cases;
  },
  setTotalQuestions(state, total) {
    state.totalCases = total;
  },
  addQuestion(state, newCase) {
    if (!state.cases) {
      state.cases = [];
    }
    state.cases.unshift(newCase);
  },
  updateQuestionInList(state, updatedCase) {
    if (!state.cases) return;
    const idx = state.cases.findIndex((c) => c._id === updatedCase._id);
    if (idx !== -1) {
      state.cases.splice(idx, 1, updatedCase);
    }
  },
  removeQuestion(state, caseId) {
    if (!state.cases) return;
    const idx = state.cases.findIndex((c) => c._id === caseId);
    if (idx !== -1) {
      state.cases.splice(idx, 1);
    }
  },
  removeMultipleQuestions(state, caseIds) {
    if (!state.cases) return;
    state.cases = state.cases.filter((c) => !caseIds.includes(c._id));
  },
  setCurrentQuestion(state, caseDoc) {
    state.currentCase = caseDoc;
  },
};

export const actions = {
  fetchQuestions({ commit }, params = {}) {
    commit('setLoadingState', true);
    return this.$axios
      .get('/custom-questions', { params })
      .then((response) => {
        const data = response.data;
        // El backend devuelve: { success: true, data: [...], pagination: { total } }
        const cases = data.data || [];
        const total = data.pagination?.total || 0;
        commit('setQuestions', cases);
        commit('setTotalQuestions', total);
        return { questions: cases, total };
      })
      .catch((error) => {
        console.error('Error fetching custom cases:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  fetchQuestionById({ commit }, caseId) {
    commit('setLoadingState', true);
    return this.$axios
      .get(`/custom-questions/${caseId}`)
      .then((response) => {
        const data = response.data;
        const caseDoc = data.payload || data.data;
        commit('setCurrentQuestion', caseDoc);
        return caseDoc;
      })
      .catch((error) => {
        console.error('Error fetching custom case:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  async createQuestion({ commit }, caseData) {
    commit('setSavingState', true);
    try {
      const response = await this.$axios.post('/custom-questions', caseData);
      const data = response.data;
      const newCase = data.payload || data.data || data;
      commit('addQuestion', newCase);
      return newCase;
    } catch (error) {
      console.error('Error creating custom case:', error);
      throw error;
    } finally {
      commit('setSavingState', false);
    }
  },
  updateQuestion({ commit }, { questionId, questionData }) {
    commit('setSavingState', true);
    return this.$axios
      .put(`/custom-questions/${questionId}`, questionData)
      .then((response) => {
        const data = response.data;
        const updatedCase = data.payload || data.data;
        commit('updateQuestionInList', updatedCase);
        commit('setCurrentQuestion', updatedCase);
        return updatedCase;
      })
      .catch((error) => {
        console.error('Error updating custom case:', error);
        return error;
      })
      .finally(() => {
        commit('setSavingState', false);
      });
  },
  deleteQuestion({ commit }, caseId) {
    commit('setLoadingState', true);
    return this.$axios
      .delete(`/custom-questions/${caseId}`)
      .then((response) => {
        commit('removeQuestion', caseId);
        return response;
      })
      .catch((error) => {
        console.error('Error deleting custom case:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  async deleteMultipleCases({ commit }, caseIds) {
    commit('setLoadingState', true);
    try {
      const response = await this.$axios.delete('/custom-questions/bulk', {
        data: { ids: caseIds },
      });
      commit('removeMultipleQuestions', caseIds);
      return response;
    } catch (error) {
      console.error('Error deleting multiple custom cases:', error);
      throw error;
    } finally {
      commit('setLoadingState', false);
    }
  },
};
