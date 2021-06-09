<template>
    <div>
        <Navigation />
        <div class="admin-container">
            <div class="head-container">
                <p class="title">Administradores</p>
                <nuxt-link 
                    v-if="!loading"
                    to="/administrators/addAdministrator"
                    class="add-button" >
                    <i class="fas fa-user-plus"></i>
                        Agregar administrador
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="search-active-container">
                <input type="searchText" placeholder="Buscar">
                
                <select v-model="selected" class="options" @change="selectedChange">
                    <option value="true" selected>Activos</option>
                    <option value="false">Inactivos</option>
                </select>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Nombre completo</th>
                            <th scope="col">Correo electronico</th>
                            <th scope="col" class="actions">Acciones</th>

                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(admin, index) in administrators" :key="admin._id">
                            <td>{{ admin.name }} {{ admin.last_name }}</td>
                            <td>{{ admin.email }}</td>
                            <td>
                                <div class="dropleft">
                                    <button class="btn fas fa-ellipsis-v" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <div class="configuration">
                                            <button v-if="selected == 'true'" type="button" class="btn" @click="confirmModalInactive(administrators[index])">
                                                <i class="fas fa-trash"></i>
                                                Eliminar usuario
                                            </button>
                                            <button v-else-if="selected == 'false'" type="button" class="btn" @click="confirmModalActive(administrators[index])">
                                                <i class="fas fa-check-circle"></i>
                                                Habilitar usuario
                                            </button>
                                        </div>
                                        <div v-if="selected == 'true'" class="notifications">
                                            <button type="button" class="btn" @click="update(administrators[index])">
                                                <i class="fas fa-pencil-alt"></i>
                                                Editar usuario
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- <div v-if="!loading" class="pagination-container">
                <div class="select-container">
                    <span>Rows per page: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                        <option value=20>20</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>1 - {{pageResults}} of {{totalAdmins}} Administradores</span>
                    <button class="btn fas fa-chevron-left" @click="before"></button>
                    <button class="btn fas fa-chevron-right" @click="after"></button>
                </div>
            </div> -->

            <div v-if="!loading" class="pagination-container">
                <div class="select-container">
                    <span>Rows per page: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                        <option value=20>20</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>{{ (page - 1) * pageResults + 1 }} - {{ pageResults > totalAdmins ? totalAdmins : (page * pageResults) > totalAdmins ? totalAdmins : page * pageResults }} of {{totalAdmins}} administradores</span>
                    <button class="btn fas fa-chevron-left" @click="before" :disabled="disbaledBefore == 1"></button>
                    <button class="btn fas fa-chevron-right" @click="after" :disabled="disabledAfter == 1"></button>
                </div>
            </div>
            
            <DeleteUserModal 
                v-if="isShowModalInactive"
                @close="closeModalInactive"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="inactivateUser"
                :isBusy="busy" />
            
            <ActiveUserModal 
                v-if="isShowModalActive"
                @close="closeModalActive"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="activateUser"
                :isBusy="busy" />

        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import SuccessButton from '../../components/buttons/SuccessButton';
import DeleteUserModal from '../../components/modals/DeleteUserModal';
import ActiveUserModal from '../../components/modals/ActiveUserModal';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation,
        SuccessButton,
        DeleteUserModal,
        ActiveUserModal,
        Loading
    },
    data() {
        return {
            loading: false,
            busy: false,
            isShowModalInactive: false,
            isShowModalActive: false,
            selected: 'true',

            searchText: '',
            titleModal: '',
            bodyModal: '',
            nameUser: '',

            administrators: [],
            disbaledBefore: 0,
            disabledAfter: 0,
            totalAdmins: 0,
            userIdToDelete: '',
            userIdToActive: '',
            pageResults: 5,
            page: 1
        }
    },
    async created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        await this.getAdministrators()
    },
    methods: {
        async getAdministrators() {
            try {
                this.loading = !this.loading

                let administrators_response = await this.$axios
                .get('/getAllAdminnistrator', {
                    params: {
                        status: this.selected,
                        page: this.page,
                        pageResults: this.pageResults
                    }
                })
                this.administrators = administrators_response.data.payload.admins
                this.totalAdmins = administrators_response.data.payload.length
                
                this.loading = !this.loading
            } catch (err) {
                console.log(err);
            }
        },
        selectedChange() {
            this.getAdministrators()
        },
        // rowsChange() {
        //     this.getAdministrators()
        // },
        confirmModalActive(admin_data) {
            this.titleModal = 'Habilitar usuario';
            this.bodyModal = '¿Deseas habilitar el siguiente usuario?'
            this.nameUser = admin_data.name + " " + admin_data.last_name;
            this.userIdToActive = admin_data._id;

            this.isShowModalActive = !this.isShowModalActive;
        },
        async activateUser() {
            try {
                this.busy = !this.busy;

                let activeResponse = await this.$axios.put('/setActiveUser', { user_id: this.userIdToActive })
                alert(activeResponse.data.message)
                
                this.busy = !this.busy;
                this.isShowModalActive = !this.isShowModalActive;
                
                this.getAdministrators()
            } catch (err) {
                console.log(err);
                alert(JSON.stringify(err));
            }
        },
        update(admin_data) {
            this.$router.push({ path: `/administrators/${admin_data._id}` });
        },
        confirmModalInactive(admin_data) {
            this.titleModal = 'Eliminar usuario'
            this.bodyModal = "¿Deseas eliminar el siguiente usuario?" 
            this.nameUser = "" + admin_data.name + " " + admin_data.last_name
            this.userIdToDelete = admin_data._id
            
            this.isShowModalInactive = !this.isShowModalInactive;
        },
        async inactivateUser() {
            this.busy = !this.busy;
            
            let inactive_response = await this.$axios.put('/setInactiveUser', { user_id: this.userIdToDelete });
            alert(inactive_response.data.message);
            
            this.busy = !this.busy;
            this.isShowModalInactive = !this.isShowModalInactive;

            this.getAdministrators();
        },
        rowsChange() {
            this.page = 1;

            if (this.pageResults > this.totalCases || this.totalCases == 0) {
                this.disabledAfter = 1
                this.disbaledBefore = 1
            } else {
                this.disbaledBefore = 1
                this.disabledAfter = 0
            }

            this.getAdministrators()
        },
        before() {
            if (this.page == 1) {
                this.disbaledBefore = 1
                if (this.totalCases == 0)
                    this.disabledAfter = 1
            } else if (this.page > 1) {
                this.page -= 1;
                this.disabledAfter = 0

                if (this.page == 1)
                    this.disbaledBefore = 1
            }
            
            this.getAdministrators()
        },
        after() {
            this.page += 1;
            if (this.page * this.pageResults > this.totalCases) {
                this.disabledAfter = 1
                this.disbaledBefore = 0
            } else {
                if (this.page > 1)
                    this.disbaledBefore = 0
            }

            this.getAdministrators()
        },
        closeModalInactive() {
            this.isShowModalInactive = !this.isShowModalInactive;
            this.userIdToDelete = ''
        },
        closeModalActive() {
            this.isShowModalActive = !this.isShowModalActive;
            this.userIdToActive = ''
        }
    }
}
</script>

<style scoped>
    .admin-container {
        display: flex;
        flex-direction: column;
        margin: 20px 40px;
        font-family: Montserrat;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        margin-bottom: 0;
    }

    .head-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .head-container a:hover {
        color: #FFF;
    }

    .add-button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 12px 20px;

        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;

        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0.4px;
        color: #FFFFFF;
        text-decoration: none;
    }

    .add-button i {
        position: static;
        font-size: 24px;
        margin-right: 12px;
    }

    .search-active-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-family: Montserrat;
        width: 100%;
        height: 48px;
        margin: 40px 0px;
    }

    .search-active-container input {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        width: 55%;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
        outline: none;
    }

    .search-active-container input:focus {
        outline: none;
    }

    .options {
        font-family: Montserrat;
        width: 15%;
        height: 32px;
        margin: 0px 40px;
        border: none;
        border-bottom: 1px solid #000;
    }

    .thead-admin {
        background: #212529;
        color: #FFF;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 15px;
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    .thead-admin th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-admin th:first-child {
        border-radius: 15px 0px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 15px 0px 0px 0px;
        -webkit-border-radius: 15px 0px 0px 0px;
    }

    .tbody {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    td {
        vertical-align: middle;
    }

    .actions {
        width: 5%;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        height: 56px;
    }

    .select-container {
        display: flex;
        align-items: center;
        margin: 0px 40px;
    }

    .select-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        margin: 0px 10px;
        color: #212529;
    }

    .arrows-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0px 40px;
    }

    .arrows-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: #212529;
    }

    .arrows-container button {
        color: #FE9400;
    }

    /* .loco {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .drop {
        margin-right: 5%;
    }

    .arrows {
        display: flex;
        align-items: center;
        margin-left: 5%;
    }
    .arrow {
        border: none;
        color: #FE9400;
    } */
</style>