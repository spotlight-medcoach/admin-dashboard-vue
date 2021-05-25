export const state = () => ({
    token: process.server ? '' : !!localStorage.getItem('user_token'),
    user: process.server ? {} : !!localStorage.getItem('user'),
    universities: process.server ? [] : !!localStorage.getItem('universities'),
    topics: process.server ? [] : !!localStorage.getItem('topics') 
});

export const mutations = {
    setToken (state, payload) {
        state.token = payload
    },
    setUserInfo (state, payload) {
        state.user = payload
    },
    setUniversities (state, payload) {
        state.universities = payload
    },
    setTopics (state, payload) {
        state.topics = payload
    }
}

export const actions = {
    killSession ({ commit }) {
        localStorage.removeItem('user_token')
        localStorage.removeItem('user')
        localStorage.removeItem('universities')
        localStorage.removeItem('topics')
        commit('setToken', null)
        commit('setUserInfo', null)
        commit('setUniversities', null)
        commit('setTopics', null)
    }
}