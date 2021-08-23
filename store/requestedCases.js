export const state = () => ({
    cases: [],
    totalCases: 0,
    oneCase: {}
});

export const actions = {
    async getCases({ commit }, params) {
        let cases_response = await this.$axios.get('/getCasesRequested', {
            params: {
                status: params.selected,
                page: params.page,
                pageResults: params.pageResults,
                pending_case_id: params.search
            }
        });
    }
}

export const getters = {
    getCases(state) {
        return state.cases;
    },
    getTotalCases(state) {
        return state.totalCases;
    },
    getCase(state) {
        return state,oneCase;
    }
}

export const mutations = {
    setCases(state, cases) {
        state.cases = cases;
    },
    setTotalCases(state, total) {
        state.totalCases = total;
    },
    setCase(state, oneCase) {
        state.oneCase = oneCase;
    }
}