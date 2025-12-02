import createPersistedState from 'vuex-persistedstate';

export default ({ store }) => {
  createPersistedState({
    paths: ['manuals.convertingManuals'], // Solo persistir el estado de conversión
    storage: window.localStorage,
  })(store);
};

