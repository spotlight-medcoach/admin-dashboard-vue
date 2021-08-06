// state
export const state = () => ({
    administrators: [],
    totalAdministrators: 0
});

// actions
export const actions = {
    async getAdministrators({ commit }, selected, page, pageResults, search) {
        let administrators = await this.$axios.get('/getAllAdminnistrator', {
            params: {
                status: selected,
                page: page,
                pageResults: pageResults,
                name: search
            }
        });
        
        commit('setAdministrators', administrators.data.payload.admins);
        commit('setTotalAdministrators', administrators.data.payload.length);
    }
}
// getters
export const getters = {
    getAdministrators(state) {
        return state.administrators;
    },
    getTotalAdministrators(state) {
        return state.totalAdministrators;
    }
}

// mutations
export const mutations = {
    setAdministrators(state, administrators) {
        state.administrators = administrators;
    },
    setTotalAdministrators(state, totalAdmins) {
        state.totalAdministrators = totalAdmins;
    }
}