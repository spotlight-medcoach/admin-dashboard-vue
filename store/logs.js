export const state = () => ({
  logs: [],
  totalLogs: 0,
  currentPage: 1,
  pageResults: 20,
  loading: false,
});

export const actions = {
  async fetchLogs({ commit }, params = {}) {
    try {
      commit('setLoading', true);

      const requestParams = {
        page: params.page || 1,
        pageResults: params.pageResults || 20,
      };

      if (params.user_id) requestParams.user_id = params.user_id;
      if (params.user_type) requestParams.user_type = params.user_type;
      if (params.log_type) requestParams.log_type = params.log_type;
      if (params.from) requestParams.from = params.from;
      if (params.to) requestParams.to = params.to;
      if (params.sortBy) requestParams.sortBy = params.sortBy;
      if (params.sortOrder) requestParams.sortOrder = params.sortOrder;

      const response = await this.$axios.get('/logs', {
        params: requestParams,
      });

      const logs = response.data.data || response.data.payload || [];
      const pagination = response.data.pagination || {};

      commit('setLogs', logs);
      commit('setTotalLogs', pagination.total || 0);
      commit('setCurrentPage', pagination.page || requestParams.page);
      commit('setPageResults', pagination.limit || requestParams.pageResults);
    } catch (error) {
      console.error('Error fetching logs:', error);
      commit('setLogs', []);
      commit('setTotalLogs', 0);
    } finally {
      commit('setLoading', false);
    }
  },
};

export const getters = {
  getLogs(state) {
    return state.logs;
  },
  getTotalLogs(state) {
    return state.totalLogs;
  },
  getCurrentPage(state) {
    return state.currentPage;
  },
  getPageResults(state) {
    return state.pageResults;
  },
  isLoading(state) {
    return state.loading;
  },
};

export const mutations = {
  setLogs(state, logs) {
    state.logs = logs;
  },
  setTotalLogs(state, total) {
    state.totalLogs = total;
  },
  setCurrentPage(state, page) {
    state.currentPage = page;
  },
  setPageResults(state, pageResults) {
    state.pageResults = pageResults;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
};
