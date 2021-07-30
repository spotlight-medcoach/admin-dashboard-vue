export const state = () => ({
    token: process.server ? '' : !!localStorage.getItem('user_token'),
    user: process.server ? {} : !!localStorage.getItem('user'),
    universities: process.server ? [] : !!localStorage.getItem('universities'),
    topics: process.server ? [] : !!localStorage.getItem('topics'),
    types: process.server ? [] : !!localStorage.getItem('types'),
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
    setTypes (state, payload) {
        state.types = payload;
    },
    setRememberMe (state, payload) {
        state.rememberMe = payload
    }
}

export const actions = {
    killSession ({ commit }) {
        if (localStorage.getItem('remember_me')) {
            console.log('yes')
            localStorage.removeItem('user_token')
            localStorage.removeItem('universities')
            localStorage.removeItem('topics')
            localStorage.removeItem('types')
            commit('setToken', null)
            commit('setUniversities', null)
            commit('setTopics', null)
            commit('setTypes', null)
        } else {
            console.log('no')
            localStorage.removeItem('user_token')
            localStorage.removeItem('user')
            localStorage.removeItem('universities')
            localStorage.removeItem('topics')
            localStorage.removeItem('types');
            commit('setToken', null)
            commit('setUserInfo', null)
            commit('setUniversities', null)
            commit('setTopics', null)
            commit('setTypes', null)
        }
    }
}