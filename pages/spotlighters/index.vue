<template>
    <div>
        <Navigation />
        <div class="admin-container">
            <div class="head-container">
                <h1>Spotlighters</h1>
                <nuxt-link 
                    to="/spotlighters/addSpotlighter"
                    class="add-button" >
                    <i class="fas fa-user-plus"></i>
                        Agregar spotlighter
                </nuxt-link>
            </div>

            <div class="search-active-container">
                <input type="searchText" placeholder="Buscar!!!">
                
                <select class="options">
                    <option value="1">Solicitud de pago!!</option>
                    <option value="2">Activos</option>
                    <option value="3">Inactivos</option>
                </select>

                <div class="pay-button">
                    <button type="button" class="btn"><i class="fas fa-dollar-sign"></i> Pagar a varios!!!</button>
                </div>
            </div>


            <div class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-admin">
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
                        <tr v-for="spotlighter in spotlighters" :key="spotlighter.admin_id">
                            <td><input type="checkbox" name="" id=""></td>
                            <td>{{ spotlighter.name }} {{ spotlighter.last_name }}</td>
                            <td>{{ spotlighter.account_number }}</td>
                            <td>{{ spotlighter.phone }}</td>
                            <td>{{ spotlighter.email }}</td>
                            <td>Falta obtener esta parte</td>
                            <td>Falta hacer este calculo</td>
                            <td class="td-style">
                                <button class="fas fa-dollar-sign btn dollar"></button>
                                <button class="fas fa-ellipsis-v btn"></button>
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
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';

export default {
    components: {
        Navigation
    },
    data() {
        return {
            searchText: '',
            spotlighters: []
        }
    },
    created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        this.getSpotlighters()
    },
    methods: {
        getSpotlighters() {
            if (process.browser) {
                this.$axios
                .get('/getAllSpotlighters?status=true'/* , {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('user_token')}`
                    }
                } */)
                .then(spotlighters => {
                    // console.log(spotlighters)
                    this.spotlighters = spotlighters.data.payload;
                    console.log(this.spotlighters)
                })
                .catch(err => {
                    console.log(err);
                })
            }
        }
    }
}
</script>

<style scoped>
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
        padding: 12px 20px;

        position: static;
        width: 100%;
        height: 48px;
        color: #FE9400;
        border: 1px solid #FE9400;
        box-sizing: border-box;
        border-radius: 10px;
        margin: 0px 24px;
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
</style>