export const state = () => ({
    token: process.server ? '' : !!localStorage.getItem('user_token'),
    user: process.server ? {} : !!localStorage.getItem('user')
});

export const mutations = {
    setToken (state, payload) {
        state.token = payload
    },
    setUserInfo (state, payload) {
        state.user = payload
    }
}

export const actions = {
    killSession ({ commit }) {
        localStorage.removeItem('user_token')
        commit('setToken', null)
        commit('setUserInfo', null)
        // commit('setBearer')
        const phase = {
          id: null,
          progress: null,
          total: null,
          init_date_phase_2: null
        }
        // commit('setPhase', phase)
    }
}