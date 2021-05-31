export const state = () => ({
    token: process.server ? '' : !!localStorage.getItem('user_token'),
    user: process.server ? {} : !!localStorage.getItem('user'),
    universities: process.server ? [] : !!localStorage.getItem('universities'),
    topics: process.server ? [] : !!localStorage.getItem('topics'),
    rememberMe: process.server ? false : !!localStorage.getItem('remember_me')
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
    },
    setRememberMe (state, payload) {
        state.rememberMe = payload
    }
}

export const actions = {
    killSession ({ commit }) {
        if (localStorage.getItem('remember_me')) {
            console.log('yes')
            localStorage.removeItem('universities')
            localStorage.removeItem('topics')
            commit('setUniversities', null)
            commit('setTopics', null)
        } else {
            console.log('no')
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
}