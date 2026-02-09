export const state = () => ({
  professors: [],
  totalProfessors: 0,
  currentPage: 1,
  limit: 20,
  loading: false,
  saving: false,
});

export const actions = {
  async fetchProfessors({ commit }, params = {}) {
    try {
      commit('setLoading', true);
      const requestParams = {
        page: params.page || 1,
        limit: params.limit || 20,
      };

      if (params.university_id) {
        requestParams.university_id = params.university_id;
      }
      if (params.search) {
        requestParams.search = params.search;
      }
      if (params.status !== undefined) {
        requestParams.status = params.status;
      }

      const response = await this.$axios.get('/users/supervisors', {
        params: requestParams,
      });

      const data = response.data.payload || response.data.data || {};
      commit('setProfessors', data.supervisors || []);
      commit('setTotalProfessors', data.total || 0);
      commit('setCurrentPage', params.page || 1);
    } catch (err) {
      console.error('Error fetching professors:', err);
    } finally {
      commit('setLoading', false);
    }
  },

  async createProfessor({ commit, dispatch }, professorData) {
    try {
      commit('setSaving', true);
      const payload = {
        name: professorData.name,
        last_name: professorData.last_name,
        email: professorData.email,
        password: professorData.password,
        role: 'Supervisor',
        university_id: professorData.university_id,
      };

      const response = await this.$axios.post('/users', payload);
      return response;
    } catch (err) {
      console.error('Error creating professor:', err);
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async updateProfessor({ commit }, { id, data }) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.put(`/users/${id}`, data);
      return response;
    } catch (err) {
      console.error('Error updating professor:', err);
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async deactivateProfessor({ commit }, id) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.put(`/users/${id}/deactivate`);
      return response;
    } catch (err) {
      console.error('Error deactivating professor:', err);
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async activateProfessor({ commit }, id) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.put(`/users/${id}/activate`);
      return response;
    } catch (err) {
      console.error('Error activating professor:', err);
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },
};

export const getters = {
  getProfessors(state) {
    return state.professors;
  },
  getTotalProfessors(state) {
    return state.totalProfessors;
  },
  getCurrentPage(state) {
    return state.currentPage;
  },
  isLoading(state) {
    return state.loading;
  },
  isSaving(state) {
    return state.saving;
  },
};

export const mutations = {
  setProfessors(state, professors) {
    state.professors = professors;
  },
  setTotalProfessors(state, total) {
    state.totalProfessors = total;
  },
  setCurrentPage(state, page) {
    state.currentPage = page;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setSaving(state, saving) {
    state.saving = saving;
  },
};
