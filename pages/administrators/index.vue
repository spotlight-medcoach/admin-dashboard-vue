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
                <!-- <div class="input-icon"> -->
                <input type="text" placeholder="Buscar">
                    <!-- <i class="fas fa-search"></i> -->
                    <!-- <span class="fa fa-info-circle"></span> -->
                <!-- </div> -->
                    <!-- <select class="" name="" id="">
                        <option value="1" selected>Activos</option>
                        <option value="2">Inactivos</option>
                    </select> -->
                
                <select class="options">
                    <option value="1">Activos</option>
                    <option value="2">Inactivos</option>
                </select>
            </div>


            <div class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Nombre completo</th>
                            <th scope="col">Correo electrónico</th>
                            <th scope="col" class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="admin in administrators" :key="admin._id">
                            <td>{{ admin.name }} {{ admin.last_name }}</td>
                            <td>{{ admin.email }}</td>
                            <td>
                                <button class="fas fa-ellipsis-v btn"></button>
                                <!-- <button class="fas fa-edit" @click="updateAdministrator(admin)"></button>
                                <button class="fas fa-trash" @click="setInactive(admin._id)"></button> -->
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
                            <!-- <span class="align-middle">middle</span> -->
                        </div>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Previous">
                                <!-- <span aria-hidden="true">&laquo;</span> -->
                                <span class="fas fa-chevron-left"></span>
                            </a>
                        </li>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Next">
                                <!-- <span aria-hidden="true">&raquo;</span> -->
                                <span class="fas fa-chevron-right"></span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import SuccessButton from '../../components/buttons/SuccessButton';

export default {
    components: {
        Navigation,
        SuccessButton
    },
    data() {
        return {
            text: '',
            administrators: []
        }
    },
    created() {
        this.getAdministrators()
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
    },
    methods: {
        getAdministrators() {
            if (process.browser) {
                this.$axios
                .get('/getAllAdminnistrator?status=true', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('user_token')}`
                    }
                })
                .then(admins => {
                    this.administrators = admins.data.administrators;
                })
                .catch(err => {
                    console.log(err);
                })
            }
        },
        addAdministrator() {
            alert('Logica para agregar administrador')
        },
        setInactive(admin_id) {
            if (process.browser) {
                // alert(admin_id)
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
        }, //, query: { id: admin_data._id}
        updateAdministrator(admin_data) {
            this.$router.push({ path: `/administrators/${admin_data._id}` });

        }
    }
}
</script>

<style scoped>
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