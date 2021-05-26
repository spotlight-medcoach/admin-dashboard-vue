<template>
    <div>
        <Navigation />
        <div class="spotlighter-container">
            <div class="head-container">
                <h1>Spotlighters</h1>
                <nuxt-link 
                    to="/spotlighters/addSpotlighter"
                    class="add-button" >
                    <i class="fas fa-user-plus"></i>
                        Agregar spotlighter
                </nuxt-link>
            </div>

            <div class="filter-container">
                <div class="search">
                    <input type="searchText" placeholder="    Buscar">
                </div>
                
                <div class="filter-drop">
                    <select v-model="selected" class="options" @change="selectedChange">
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>

                <div class="pay-button">
                    <button type="button" class="btn"><i class="fas fa-dollar-sign"></i> Pagar a varios!!!</button>
                </div>
            </div>


            <div class="table-container">
                <Loading v-if="loading" />
                <table v-else class="table table-bordered">
                    <thead class="thead-spotlighter">
                        <tr>
                            <th scope="col"><input type="checkbox"></th>
                            <th scope="col">Nombre completo</th>
                            <th scope="col">Número de cuenta</th>
                            <th scope="col">Telefono</th>
                            <th scope="col">Email</th>
                            <th scope="col">Preguntas!!</th>
                            <th scope="col">Saldo!!!</th>
                            <th scope="col" class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(spotlighter, index) in spotlighters" :key="spotlighter.admin_id">
                            <td><input class="check-style" type="checkbox" name="" id=""></td>
                            <td>{{ spotlighter.name }} {{ spotlighter.last_name }}</td>
                            <td>{{ spotlighter.account_number }}</td>
                            <td>{{ spotlighter.phone }}</td>
                            <td>{{ spotlighter.email }}</td>
                            <td>!!</td>
                            <td>Falta hacer este calculo</td>
                            <td class="td-style">
                                <button class="fas fa-dollar-sign btn dollar"></button>
                                <div class="dropleft">
                                    <button class="btn fas fa-ellipsis-v" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <div class="notifications">
                                            <button type="button" class="btn" @click="update(spotlighters[index])">
                                                <i class="fas fa-pencil-alt"></i>
                                                Editar usuario
                                            </button>
                                        </div>
                                        <div class="configuration">
                                            <button type="button" class="btn" @click="confirmModal(spotlighters[index])">
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
                        Rows per page:!!!!
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
                            1 - 10 of n items!!!
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
import Loading from '../../components/modals/Loading';
import ActionsModal from '../../components/modals/ActionsModal';
import ModalConfirm from '../../components/modals/ModalConfirm';

export default {
    components: {
        Navigation,
        Loading,
        ActionsModal,
        ModalConfirm
    },
    data() {
        return {
            loading: false,
            isShowModal: false,
            selected: true,
            titleModal: '',
            bodyModal: '',
            searchText: '',
            spotlighters: [],
            userIdToDelete: ''
        }
    },
    async created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        await this.getSpotlighters()
        // this.loading = !this.loading;
    },
    methods: {
        async getSpotlighters() {
            try {
                this.loading = !this.loading;
                let spotlighter_response = await this.$axios.get(`/getAllSpotlighters?status=${JSON.parse(this.selected)}`);
                this.spotlighters = spotlighter_response.data.payload;
                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        selectedChange() {
            this.getSpotlighters()
        },
        async update(user) {
            // cambiar a vista para actualizar spotlighter
            this.$router.push({ path: `/spotlighters/${user.admin_id}` });
        },
        confirmModal(user) {
            // lógica para eliminar el spotlighter
            this.titleModal = 'Eliminar spotligther'
            this.bodyModal = "¿Deseas eliminar el siguiente usuario?\n" + user.name + " " + user.last_name
            this.isShowModal = !this.isShowModal;
            this.userIdToDelete = user.admin_id
        },
        async deleteUser() {
            let inactive_response = await this.$axios.put('/setInactiveUser', { user_id: this.userIdToDelete });
            console.log(inactive_response);
            this.bodyModal = inactive_response.data.message;

            setTimeout(() => {
                this.isShowModal = !this.isShowModal;
            }, 1500);
            this.getSpotlighters()
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
            this.userIdToDelete = ''
        }
    }
}
</script>

<style scoped>
    .spotlighter-container {
        display: flex;
        flex-direction: column;
        margin: 20px 40px;
        font-family: Montserrat;
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

        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0.4px;
        color: #FFFFFF;
        text-decoration: none;
    }

    .filter-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        height: 48px;
        margin: 20px 0px;
    }

    .search {
        display: flex;
        align-items: center;
        width: 50%;
        height: 100%;
    }

    .search input {
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .filter-drop {
        display: flex;
        align-items: center;
        width: 20%;
        margin: 0px 40px;
    }

    .filter-drop select {
        width: 100%;
        height: 32px;
        border: none;
        border-bottom: 1px solid #000;
    }

    .pay-button {
        width: 20%;
    }

    .thead-spotlighter {
        background: #212529;
        color: #FFF;
    }

    .thead-spotlighter th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-spotlighter th:first-child {
        border-radius: 15px 0px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 15px 0px 0px 0px;
        -webkit-border-radius: 15px 0px 0px 0px;
    }

    .check-style {
        border: 1px solid #FE9400;
        box-sizing: border-box;
    }

    .td-style {
        display: flex;
        flex-direction: row;
    }

    .dollar {
        color: #FFF;
        background: #FE9400;
        border-radius: 50%;
        margin: 0 .5rem;
    }

    .pay-button button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        /* padding: 12px 20px; */

        position: static;
        width: 100%;
        height: 48px;
        color: #FE9400;
        border: 1px solid #FE9400;
        box-sizing: border-box;
        border-radius: 10px;
        /* margin: 0px 24px; */
    }

    .pay-button i {
        color: #FFF;
        background: #FE9400;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        padding-top: 2%;
        margin-right: 5%;
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
    }
</style>