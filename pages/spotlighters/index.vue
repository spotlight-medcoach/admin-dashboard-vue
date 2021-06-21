<template>
    <div>
        <Navigation />
        <div class="spotlighter-container">
            <div class="head-container">
                <h1>Spotlighters</h1>
                <nuxt-link 
                    v-if="!loading"
                    to="/spotlighters/addSpotlighter"
                    class="add-button" >
                    <i class="fas fa-user-plus"></i>
                        Agregar spotlighter
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="filter-container">
                <div class="search">
                    <input type="searchText" placeholder="Buscar">
                </div>
                
                <div class="filter-drop">
                    <select v-model="selected" class="options" @change="selectedChange">
                        <option value="true" selected>Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-spotlighter">
                        <tr>
                            <th scope="col">Nombre completo</th>
                            <th scope="col">Número de cuenta</th>
                            <th scope="col">Telefono</th>
                            <th scope="col">Email</th>
                            <th scope="col">Preguntas</th>
                            <th scope="col">Saldo</th>
                            <th scope="col" class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(spotlighter, index) in spotlighters" :key="spotlighter.admin_id">
                            <td>{{ spotlighter.name }} {{ spotlighter.last_name }}</td>
                            <td>{{ spotlighter.account_number }}</td>
                            <td>{{ spotlighter.phone }}</td>
                            <td>{{ spotlighter.email }}</td>
                            <td></td>
                            <td>Falta hacer este calculo</td>
                            <td class="td-style">
                                <button :disabled="spotlighter.payed" :class="spotlighter.request_payment ? 'fas fa-dollar-sign btn dollar-request' : spotlighter.payed ? 'fas fa-dollar-sign btn dollar-payed' : 'fas fa-dollar-sign btn dollar'" @click="makePaymentConfirm(spotlighter)"></button>
                                <div class="dropleft">
                                    <button class="btn fas fa-ellipsis-v" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <div class="configuration">
                                            <button v-if="selected == 'true'" type="button" class="btn" @click="confirmModalInactive(spotlighters[index])">
                                                <i class="fas fa-trash"></i>
                                                Eliminar usuario
                                            </button>
                                            <button v-else-if="selected == 'false'" type="button" class="btn" @click="confirmModalActive(spotlighters[index])">
                                                <i class="fas fa-check-circle"></i>
                                                Habilitar usuario
                                            </button>
                                        </div>
                                        <div v-if="selected == 'true'" class="notifications">
                                            <button type="button" class="btn" @click="update(spotlighters[index])">
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
                    <span>1 - {{pageResults}} of {{totalSpotlighters}} Spotlighters</span>
                    <button class="btn fas fa-chevron-left" @click="before"></button>
                    <button class="btn fas fa-chevron-right" @click="after"></button>
                </div>
            </div>

            <!-- Pagar a spotlighter -->
            <MakePayment 
                v-if="isShowPaymentModal"
                @close="closePaymentModal"
                @pay="makePayment"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :money="total"
                :textButton="button"
                :isBusy="busyPayment" />

            <!-- Eliminar spotlighter -->
            <DeleteUserModal 
                v-if="isShowModalInactive"
                @close="closeModalInactive"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="inactivateUser"
                :isBusy="busy" />

            <!-- Activar spotlighter -->
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
import Loading from '../../components/modals/Loading';
import ActionsModal from '../../components/modals/ActionsModal';
import MakePayment from '../../components/modals/administrators/MakePayment';
import DeleteUserModal from '../../components/modals/DeleteUserModal';
import ActiveUserModal from '../../components/modals/ActiveUserModal';

export default { // Instituto de Ciencias y Estudios Superiores de Tamaulipas Matamoros Escuela de Medicina
    components: {
        Navigation,
        Loading,
        ActionsModal,
        MakePayment,
        DeleteUserModal,
        ActiveUserModal
    },
    data() {
        return {
            busy: false,
            loading: false,
            isShowModalInactive: false,
            isShowModalActive: false,
            isShowPaymentModal: false,
            busyPayment: false,

            selected: 'true',
            searchText: '',
            titleModal: '',
            bodyModal: '',
            nameUser: '',
            total: '',
            button: '',

            spotlighters: [],
            spotlighterIdToPay: '',
            totalSpotlighters: 0,
            userIdToDelete: '',
            userIdToActive: '',
            pageResults: 5,
            page: 1
        }
    }, // Instituto de Estudios Superiores de Tamaulipas (IEST Anáhuac) Escuela de Medicina
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        }
        await this.getSpotlighters()
        console.log(this.spotlighters)
    },
    methods: {
        async getSpotlighters() {
            try {
                this.loading = !this.loading;

                let spotlighter_response = await this.$axios
                .get('/getAllSpotlighters', {
                    params: {
                        status: this.selected,
                        page: this.page,
                        pageResults: this.pageResults
                    }
                });

                this.spotlighters = spotlighter_response.data.payload.spotlighters;
                this.totalSpotlighters = spotlighter_response.data.payload.length;
                
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
        confirmModalActive(admin_data) {
            this.titleModal = 'Habilitar usuario';
            this.bodyModal = '¿Deseas habilitar el siguiente usuario?'
            this.nameUser = admin_data.name + " " + admin_data.last_name;
            this.userIdToActive = admin_data.admin_id;

            this.isShowModalActive = !this.isShowModalActive;
        },
        async activateUser() {
            try {
                this.busy = !this.busy;

                let activeResponse = await this.$axios.put('/setActiveUser', { user_id: this.userIdToActive })
                alert(activeResponse.data.message)
                
                this.busy = !this.busy;
                this.isShowModalActive = !this.isShowModalActive;
                
                this.getSpotlighters()
            } catch (err) {
                console.log(err);
                alert(JSON.stringify(err));
            }
        },
        confirmModalInactive(admin_data) {
            console.log(admin_data)
            this.titleModal = 'Eliminar usuario'
            this.bodyModal = "¿Deseas eliminar el siguiente usuario?" 
            this.nameUser = "" + admin_data.name + " " + admin_data.last_name
            this.userIdToDelete = admin_data.admin_id
            
            this.isShowModalInactive = !this.isShowModalInactive;
        },
        async inactivateUser() {
            this.busy = !this.busy;

            let inactive_response = await this.$axios.put('/setInactiveUser', { user_id: this.userIdToDelete });
            console.log(inactive_response);
            alert(inactive_response.data.message);
            this.bodyModal = inactive_response.data.message;
            
            this.busy = !this.busy;
            this.isShowModalInactive = !this.isShowModalInactive;
            
            this.getSpotlighters()
        },
        makePaymentConfirm(user) {
            this.spotlighterIdToPay = user.spotlighter_id;
            this.titleModal = 'Pagar y saldar cuenta'
            this.bodyModal = 'Al indicar que se realizó este pago a este usuario, su saldo quedará en ceros y se reiniciará el conteo de preguntas.'
            this.nameUser = user.name + " " + user.last_name;
            this.total = "$1234.00"
            this.button = 'Pago realizado'

            this.isShowPaymentModal = !this.isShowPaymentModal;
        },
        async makePayment() {
            try {
                this.busyPayment = !this.busyPayment;

                let paymentResponse = await this.$axios.put('/cleanQuestions', { spotlighter_id: this.spotlighterIdToPay })
                console.log('pay', paymentResponse.data.payload)
                
                let updated = this.spotlighters.filter(spot => spot.spotlighter_id == paymentResponse.data.payload)
                let newInfoSpotlighter = updated[0]
                newInfoSpotlighter.request_payment = false;
                newInfoSpotlighter.payed = true;

                // console.log('upd', newInfoSpotlighter)

                this.busyPayment = !this.busyPayment;
                alert(paymentResponse.data.message)
                this.isShowPaymentModal = !this.isShowPaymentModal;
            } catch (err) {
                console.log(err);
            }
        },
        selectedChange() {
            this.getSpotlighters()
        },
        rowsChange() {
            this.getSpotlighters()
        },
        before() {
            alert('Logica para esta asunto')
        },
        after() {
            alert('Logica para esta asunto')
        },
        closeModalInactive() {
            this.isShowModalInactive = !this.isShowModalInactive;
            this.userIdToDelete = ''
        },
        closeModalActive() {
            this.isShowModalActive = !this.isShowModalActive;
            this.userIdToActive = ''
        },
        closePaymentModal() {
            this.isShowPaymentModal = false;
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
        padding: 0px 15px;
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
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 15px;
        letter-spacing: 1px;
        text-transform: uppercase;
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

    .check-style {
        border: 1px solid #FE9400;
        box-sizing: border-box;
    }

    .td-style {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .dollar {
        color: #FFF;
        background: #FE9400;
        border-radius: 50%;
        margin: 0 .5rem;
    }

    .dollar:hover {
        color: #FFF;
        background: #000;
        border-radius: 50%;
        margin: 0 .5rem;
    }

    .dollar-request {
        color: #FFF;
        background: #DB1212;
        border-radius: 50%;
        margin: 0 .5rem;
    }

    .dollar-request:hover {
        color: #FFF;
        background: #000;
        border-radius: 50%;
        margin: 0 .5rem;
    }

    .dollar-payed {
        color: #FFF;
        background: #8f8f8f;
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
</style>