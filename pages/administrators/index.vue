<template>
    <div>
        <Navigation />
        <div class="admin-container">
            <div class="head-container">
                <h1>Administradores</h1>
                <nuxt-link 
                    to="/administrators/addAdministrator"
                    class="add-button" >
                    <i class="fas fa-user-plus"></i>
                        Agregar administrador
                </nuxt-link>
            </div>

            <div class="search-active-container">
                <input type="searchText" placeholder="Buscar">
                
                <select class="options">
                    <option value="1">Activos</option>
                    <option value="2">Inactivos</option>
                </select>
            </div>

            <div class="table-container">
                <Loading v-if="loading" />

                <table v-else class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Nombre completo</th>
                            <th scope="col">Correo electrónico</th>
                            <th scope="col" class="actions">Acciones</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(admin, index) in administrators" :key="admin._id">
                            <td>{{ admin.name }} {{ admin.last_name }}</td>
                            <td>{{ admin.email }}</td>
                            <td>
                                <div class="dropleft">
                                    <button class="btn fas fa-ellipsis-v" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <div class="notifications">
                                            <button type="button" class="btn" @click="update(administrators[index])">
                                                <i class="fas fa-pencil-alt"></i>
                                                Editar usuario
                                            </button>
                                        </div>
                                        <div class="configuration">
                                            <button type="button" class="btn" @click="confirmModal(administrators[index])">
                                                <i class="fas fa-trash"></i>
                                                Eliminar usuario
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination-container">
                <div class="dropdown drop">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Rows per page:
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <button class="dropdown-item" type="button">10</button>
                        <button class="dropdown-item" type="button">15</button>
                        <button class="dropdown-item" type="button">20</button>
                    </div>
                </div>

                <nav class="arrows" aria-label="Page navigation example">
                    <ul class="pagination">
                        <div class="loco">
                            1 - 10 of n items
                        </div>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Previous">
                                <span class="fas fa-chevron-left"></span>
                            </a>
                        </li>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Next">
                                <span class="fas fa-chevron-right"></span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            <ModalConfirm 
                v-if="isShowModal"
                @close="closeModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :deleteUser="deleteUser" />

        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import SuccessButton from '../../components/buttons/SuccessButton';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation,
        SuccessButton,
        ModalConfirm,
        Loading
    },
    data() {
        return {
            loading: true,
            isShowModal: false,
            searchText: '',
            administrators: [],
            userIdToDelete: ''
        }
    },
    async created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        await this.getAdministrators()
        this.loading = !this.loading
    },
    methods: {
        async getAdministrators() {
            try {
                let administrators_response = await this.$axios.get('/getAllAdminnistrator?status=true')
                this.administrators = administrators_response.data.administrators
            } catch (err) {
                console.log(err);
            }
        },
        async setInactive(admin_id) {
            if (process.browser) {
                this.$axios
                .put('/setInactiveUser', {
                    user_id: admin_id
                })
                .then(res => {
                    console.log(res.data.message);
                    alert(res.data.message);
                })
                .catch(err => {
                    console.log('Error: ', JSON.stringify(err));
                    alert('Error: ', JSON.stringify(err));
                });
            }
        },
        update(admin_data) {
            // cambiar de vista para actualizar administrador
            this.$router.push({ path: `/administrators/${admin_data._id}` });
        },
        confirmModal(admin_data) {
            this.titleModal = 'Eliminar administrador'
            this.bodyModal = "¿Deseas eliminar el siguiente usuario?\n" + admin_data.name + " " + admin_data.last_name
            this.isShowModal = !this.isShowModal;
            this.userIdToDelete = admin_data._id
        },
        async deleteUser() {
            let inactive_response = await this.$axios.put('/setInactiveUser', { user_id: this.userIdToDelete });
            console.log(inactive_response);
            this.bodyModal = inactive_response.data.message;

            setTimeout(() => {
                this.isShowModal = !this.isShowModal;
            }, 1500);
            this.getAdministrators()
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
            this.userIdToDelete = ''
        }
    }
}
</script>

<style>
    .admin-container {
        display: flex;
        flex-direction: column;
        margin: 40px;
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

        font-family: Montserrat;
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
        width: 45%;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
        margin: 0px 40px;
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

    .actions {
        width: 5%;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
    }

    .loco {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .drop {
        margin-right: 5%;
    }

    .arrows {
        margin-left: 5%;
    }
    .arrow {
        border: none;
        color: #FE9400;
        /* outline: none; */
        /* background: red; */
    }
</style>