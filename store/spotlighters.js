export const state = () => ({
    spotlighters: [],
    totalSpotlighters: 0,
    spotlighter: {}
});

export const actions = {
    async getSpotlighters({ commit }, params) {
        try {
            let spotlighters = await this.$axios
                .get('/getAllSpotlighters', {
                    params: {
                        status: params.selected,
                        page: params.page,
                        pageResults: params.pageResults,
                        name: params.search
                    }
                });

            commit('setSpotlighters', spotlighters.data.payload.spotlighters);
            commit('setTotalSpotlighters', spotlighters.data.payload.length);
        } catch (err) {
            console.log(err);
        }
    },
    getSpotlighter({ state, commit }, _id) {
        let spotlighter = state.spotlighters.find(spot => spot.admin_id == _id);

        commit('setSpotlighter', spotlighter);
    }
}

export const getters = {
    getSpotlighters(state) {
        return state.spotlighters;
    },
    getTotalSpotlighters(state) {
        return state.totalSpotlighters
    },
    getSpotlighter(state) {
        return state.spotlighter
    }
}

export const mutations = {
    setSpotlighters(state, spotlighters) {
        state.spotlighters = spotlighters
    },
    setTotalSpotlighters(state, total) {
        state.totalSpotlighters = total;
    },
    setSpotlighter(state, spotlighter) {
        state.spotlighter = spotlighter;
    }
}