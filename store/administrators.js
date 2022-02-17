// state
export const state = () => ({
    administrators: [],
    totalAdministrators: 0,
    administrator: {}
});

// actions
export const actions = {
    async getAdministrators({ commit }, params) {
        try {
            let administrators = await this.$axios.get('/getAllAdminnistrator', {
                params: {
                    status: params.selected,
                    page: params.page,
                    pageResults: params.pageResults,
                    name: params.search
                }
            });
            
            commit('setAdministrators', administrators.data.payload.admins);
            commit('setTotalAdministrators', administrators.data.payload.length);
        } catch (err) {
            console.log(err);
        }
    },
    async getAdministrator({ state, commit }, _id) {
        try {
            let administrator = state.administrators.find(admin => admin._id == _id);

            commit('setAdministrator', administrator);
        } catch (err) {
            console.log(err);
        }
    },
    async addAdministrator({ commit }, admin) {
        try {
            let administratorAdded = await this.$axios.post('/createUser', admin);

            commit('addAdministrator', administratorAdded.data.payload);
            return administratorAdded;
        } catch (err) {
            console.log(err);
            return err;
        }
    },
    async updateAdministrator({ commit }, adminData) {
        try {
            let administratorUpdated = await this.$axios.put('/updateUser', adminData);
            
            commit('updateAdministrator', administratorUpdated.data.payload);
            return administratorUpdated;
        } catch (err) {
            console.log(err);
            return err;
        }
    },
    async deleteAdministrator({ commit }, admin_id) {
        try {
            let userInactivated = await this.$axios.put('/setInactiveUser', { user_id: admin_id });

            return userInactivated;
        } catch (err) {
            console.log(err);
            return err;
        }
    },
    async activateUser({ commit }, admin_id) {
        try {
            let userActivated = await this.$axios.put('/setActiveUser', { user_id: admin_id });

            return userActivated;
        } catch (err) {
            console.log(err);
            return err;
        }
    },
    filterAdministratorsByStatus({ state }, status) {
        let newStatus = status === 'true';
        let adminsFiltered = state.administrators.filter(admin => admin.active == newStatus);
        console.log('admins', state.administrators)
        // console.log('type', typeof(Boolean(status)))

        return adminsFiltered;
    }
}
// getters
export const getters = {
    getAdministrators(state) {
        return state.administrators;
    },
    getTotalAdministrators(state) {
        return state.totalAdministrators;
    },
    getAdministrator(state) {
        return state.administrator;
    }
}

// mutations
export const mutations = {
    setAdministrators(state, administrators) {
        state.administrators = administrators;
    },
    setTotalAdministrators(state, totalAdmins) {
        state.totalAdministrators = totalAdmins;
    },
    setAdministrator(state, administrator) {
        state.administrator = administrator;
    },
    addAdministrator(state, administrator) {
        state.administrators.push(administrator);
    },
    updateAdministrator(state, administrator) {
        console.log('toUpdate', administrator);
        state.administrators.forEach((element, i) => {
            if (element._id == administrator._id)
                state.administrators[i] = administrator;
        });
        console.log('updated', state.administrators.filter(admin => admin._id == administrator._id));

    },
    deleteAdministrator(state, administrator) {
        state.administrators = state.administrators.filter(admin => admin._id != administrator._id);
    }
}