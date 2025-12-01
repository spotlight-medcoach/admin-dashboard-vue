export const state = () => ({
  title: '',
  buttonConfig: null, // { text, icon, action, type: 'button' | 'link', to }
});

export const getters = {
  title: (state) => state.title,
  buttonConfig: (state) => state.buttonConfig,
  hasHeader: (state) => !!state.title,
};

export const mutations = {
  setTitle(state, title) {
    state.title = title;
  },
  setButtonConfig(state, config) {
    state.buttonConfig = config;
  },
  clearHeader(state) {
    state.title = '';
    state.buttonConfig = null;
  },
};

export const actions = {
  setHeader({ commit }, { title, buttonConfig = null }) {
    commit('setTitle', title);
    if (buttonConfig) {
      commit('setButtonConfig', buttonConfig);
    } else {
      commit('setButtonConfig', null);
    }
  },
  clearHeader({ commit }) {
    commit('clearHeader');
  },
};
